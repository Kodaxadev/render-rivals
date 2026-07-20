# 02 — Runtime, Bootstrap, Session Lifecycle, and Terminal Policy

## 1. Purpose

This file defines startup, terminal ownership, exact Node selection, signals, session lifetime, and shutdown.

## 2. Process hierarchy

```text
User shell
└── npm/npx JavaScript bootstrap
    └── Rust session supervisor
        └── Node coordinator
            ├── local dashboard server
            ├── Playwright driver
            │   └── Chromium tree
            └── supervised workloads
                ├── build/test commands
                ├── application server
                ├── coding agent
                └── model judge
```

The bootstrap and Rust supervisor are distinct intentionally.

## 3. JavaScript bootstrap

The npm package exposes a small JavaScript `bin` entry.

### Responsibilities

1. Verify the running Node major is supported.
2. Read `process.execPath`.
3. Resolve coordinator bundle path.
4. Locate platform Rust binary.
5. Verify native binary metadata where distributed.
6. Create bootstrap-liveness channel.
7. Launch Rust with inherited terminal handles.
8. Pass bootstrap metadata through environment and inherited handles.
9. Install nonterminating interrupt handlers after Rust starts.
10. Wait for Rust.
11. Return Rust exit code.

### Non-responsibilities

The bootstrap does not:

- launch coordinator directly;
- launch Playwright;
- run repository commands;
- parse agent events;
- create worktrees;
- bind dashboard;
- create supervisor IPC;
- decide graceful shutdown;
- clean candidate processes.

## 4. Exact Node executable

PATH lookup is unreliable with nvm, fnm, Volta, shims, and shell changes.

Bootstrap passes exact `process.execPath` through:

```text
VISOPT_BOOTSTRAP_NODE_EXEC_PATH
```

Rust:

1. reads it;
2. rejects relative or empty path;
3. canonicalizes when supported;
4. verifies executable exists;
5. runs `<path> --version`;
6. compares with bootstrap-reported version;
7. launches coordinator using exactly that executable.

Rust never resolves coordinator `node` from PATH.

## 5. Coordinator command

```text
<exact-node-path> <coordinator-entry-file>
```

The coordinator entry is an installed JavaScript bundle.

## 6. Endpoint and nonce delivery

Rust generates:

- session ID;
- IPC endpoint;
- one-time coordinator nonce;
- protocol version;
- session root;
- coordinator role.

Pass through environment:

```text
VISOPT_SESSION_ID
VISOPT_SUPERVISOR_ENDPOINT
VISOPT_SUPERVISOR_NONCE
VISOPT_SUPERVISOR_PROTOCOL
VISOPT_SESSION_ROOT
```

Never pass endpoint or nonce in argv.

Environment delivery does not protect against a fully compromised same-user process; it avoids free command-line leakage.

## 7. Terminal authority

Rust is terminal authority.

Rust owns:

- terminal progress;
- first and repeated interrupt behavior;
- terminal restoration;
- final exit summary;
- optional shutdown confirmation.

Coordinator sends semantic progress events. Rust renders them.

Bootstrap prints only failures before Rust is ready.

## 8. Why Node does not own terminal

On Windows, Ctrl+C reaches console-attached processes. If coordinator, servers, and agents share the console, third-party handlers race orderly shutdown.

Therefore:

- coordinator uses pipes and IPC;
- children use pipes or private PTY/ConPTY;
- no supervised process receives user Ctrl+C directly.

## 9. Windows console policy

### Bootstrap and Rust

Bootstrap and Rust may share shell console.

Bootstrap handlers prevent exit after Rust starts.

Rust installs authoritative console handler.

### Coordinator

Coordinator launches without user interactive console.

Candidate implementation:

- `CREATE_NO_WINDOW` for ordinary pipe-driven coordinator;
- new process group where required;
- private hidden console only when an API requires it.

### Noninteractive children

Builds, tests, servers, and headless agents use:

- no inherited user console;
- explicit stdin;
- captured stdout/stderr;
- containment group.

### Interactive children

Adapters requiring terminal semantics request private ConPTY.

Private terminal is not connected to user console input.

### Graceful interruption

Rust does not broadcast user `CTRL_C_EVENT`.

Graceful child stop can use:

- adapter stdin command;
- stdin close;
- targeted private-group `CTRL_BREAK_EVENT`;
- process protocol request;
- HTTP shutdown if configured.

Forced stop uses containment termination.

## 10. Unix terminal policy

Rust remains in foreground terminal process group.

Bootstrap ignores/absorbs interrupt after Rust starts.

Coordinator and supervised workloads use separate process groups or sessions with pipe/PTY stdio.

Rust remains logical signal authority.

## 11. Bootstrap liveness

Bootstrap creates dedicated one-way liveness pipe.

Bootstrap holds writer; Rust holds reader.

Unexpected bootstrap exit produces EOF.

Rust treats EOF as loss of owning invocation and begins emergency cleanup.

PID remains metadata, not primary liveness signal.

## 12. Session lifecycle

A session starts when Rust creates native resources and authenticates coordinator.

A session may contain multiple runs.

It ends on:

- user exit;
- coordinator restart request;
- coordinator crash;
- native failure;
- bootstrap loss;
- forced interrupt.

## 13. Session state

```ts
type SessionState =
  | "starting"
  | "authenticating_coordinator"
  | "ready"
  | "running"
  | "shutdown_requested"
  | "draining"
  | "forced_termination"
  | "completed"
  | "crashed";
```

## 14. Startup sequence

### Step 1 — Bootstrap validation

Validate Node and artifacts.

### Step 2 — Rust launch

Launch Rust with terminal and liveness pipe.

### Step 3 — Native session creation

Rust creates:

- session directory;
- containment primitives;
- secure IPC endpoint;
- nonce;
- process-output root.

### Step 4 — Coordinator launch

Launch exact Node executable using platform containment and console policy.

### Step 5 — Coordinator authentication

Coordinator proves:

- nonce;
- session ID;
- expected peer identity;
- protocol version.

### Step 6 — Capability probe

Rust reports containment and process capabilities.

### Step 7 — Coordinator readiness

Coordinator starts local server and reports dashboard URL.

### Step 8 — Terminal ready

Rust prints URL and status.

## 15. First Ctrl+C

Rust records interrupt and sends:

```text
session.shutdown_requested
```

Coordinator:

1. rejects new run mutations;
2. cancels agent/judge work;
3. stops active server;
4. closes Playwright contexts;
5. closes Chromium;
6. flushes event logs;
7. writes run status;
8. releases leases;
9. reports cleanup intent;
10. sends `coordinator.shutdown_ready`.

## 16. Grace period

Rust waits bounded duration.

Grace duration is configurable but not unbounded.

## 17. Second Ctrl+C

Second interrupt skips remaining grace and terminates session containment.

## 18. Coordinator exit intent

Before intentional exit:

```ts
type CoordinatorExitIntent =
  | { kind: "user_shutdown" }
  | { kind: "normal_completion" }
  | { kind: "restart_requested"; reason: string };
```

Rust associates intent with process identity, sequence, time, and expected code class.

## 19. Exit classification

### Clean

Valid intent plus expected exit code.

### Crash

No valid intent.

### Abnormal

Intent exists but code mismatches, IPC closes early, grace expires, or identity changes.

### Forced

Rust terminates process or containment boundary.

## 20. Coordinator crash

1. Mark active run interrupted.
2. Terminate run groups.
3. Terminate Chromium.
4. Preserve output and evidence.
5. Write crash manifest.
6. Print recovery path.
7. Exit nonzero.

No automatic coordinator restart in v0.

## 21. Rust crash

### Windows

Kill-on-close Job handles should terminate contained descendants; doctor verifies.

### Linux strong

Watchdog kills payload cgroup.

### Managed/best effort

No complete crash guarantee is claimed.

## 22. Bootstrap crash

Liveness EOF initiates emergency shutdown.

Shell termination, npm wrapper loss, and bootstrap crash are all owner-loss events.

## 23. Progress events

```ts
interface ProgressEvent {
  runId?: string;
  phase: string;
  status: "started" | "progress" | "completed" | "failed";
  message: string;
  current?: number;
  total?: number;
}
```

Rust decides formatting. Raw child logs appear only in verbose mode.

## 24. Dashboard ownership

Dashboard server runs in coordinator.

Closing browser UI does not end session.

Dashboard ends with coordinator.

## 25. Root lifetime

Root native containment lifetime is supervisor session, not run.

Run and candidate groups are subordinate.

## 26. Environment policy

Rust supplies minimal coordinator environment:

- inherited PATH where needed for repository commands;
- session variables;
- safe temp root;
- locale unless overridden;
- sanitized Node loading options.

Evaluate and possibly scrub:

- `NODE_OPTIONS`;
- loader injection;
- debugging flags.

## 27. Windows breakaway classification

Session job denies breakaway.

If repo tooling requires `CREATE_BREAKAWAY_FROM_JOB`, classify:

```text
unsupported_repository_process_breakaway
```

Report executable, Windows error, group, and manual reproduction hint.

Do not present as mystery build failure.

## 28. Startup failure classes

- unsupported Node;
- native binary missing;
- native integrity failure;
- exact Node mismatch;
- IPC creation failure;
- coordinator authentication failure;
- containment probe failure;
- dashboard bind failure;
- session directory failure.

## 29. Tests

- `BOOT-001`: exact bootstrap Node is launched.
- `BOOT-002`: PATH changes do not alter coordinator Node.
- `BOOT-003`: endpoint/nonce absent from argv.
- `BOOT-004`: first Ctrl+C requests graceful shutdown.
- `BOOT-005`: second Ctrl+C forces shutdown.
- `BOOT-006`: dev server does not receive user Ctrl+C.
- `BOOT-007`: bootstrap crash triggers cleanup.
- `BOOT-008`: coordinator crash differs from clean exit.
- `BOOT-009`: intent plus wrong code is abnormal.
- `BOOT-010`: terminal restores after forced stop.
- `BOOT-011`: private PTY child cancels without console fan-out.
- `BOOT-012`: breakaway failure is classified.

## 30. Scaffold verification spike

Demonstrate on Windows:

- Rust alone reacts to user interrupt;
- coordinator waits for IPC shutdown;
- dev server receives no direct console event;
- forced containment kills descendants;
- exact Node path survives a version-manager PATH change.
