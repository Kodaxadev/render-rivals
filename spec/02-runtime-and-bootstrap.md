# 02 — Runtime, Bootstrap, Session Lifecycle, and Terminal Policy

**Status:** Canonical implementation contract  
**Shared Session state:** `schemas/domain-types.ts`  
**Command/configuration contract:** `spec/13-configuration-cli-and-local-api-contracts.md`  
**Scaffold decisions:** `docs/SCAFFOLD-DECISION-REGISTER.md`

## 1. Purpose

This specification defines startup, terminal ownership, exact Node selection, managed process launch, Session lifetime, safe mode, and shutdown.

## 2. Process and authority model

```text
User shell
└── npm/npx JavaScript bootstrap
    └── Rust session supervisor
        ├── Node coordinator (managed root process)
        │   ├── local dashboard server
        │   └── Playwright driver
        │       └── Chromium descendants when inherited containment is verified
        └── managed workload roots requested by coordinator
            ├── dependency/build/test commands
            ├── application servers
            ├── fixtures
            ├── evaluators or optional agents
            ├── Git/export commands
            └── doctor utilities
```

Rust owns:

- launch authorization;
- managed root-process creation;
- containment assignment;
- native process observation;
- resource enforcement;
- process and group termination;
- endpoint ownership inspection;
- terminal and Session lifecycle.

An approved contained process may create descendants only under the inheritance and doctor requirements in `docs/SCAFFOLD-DECISION-REGISTER.md`.

The coordinator owns semantic orchestration but does not claim native success until the supervisor reports it.

## 3. JavaScript bootstrap

The npm package exposes a minimal JavaScript `bin` entry.

Responsibilities:

1. verify supported Node major;
2. read exact `process.execPath` and Node version;
3. resolve coordinator bundle and platform native package;
4. verify native package metadata/checksum where distributed;
5. create bootstrap-liveness channel;
6. launch Rust with inherited terminal handles;
7. pass bootstrap metadata through environment and inherited handles;
8. install nonterminating interrupt handlers after Rust is ready;
9. wait for Rust;
10. return Rust exit code.

The bootstrap does not launch coordinator, Chromium, repository commands, Git worktrees, evaluators, or dashboard directly.

## 4. Exact Node executable

Bootstrap supplies:

```text
RENDER_RIVALS_BOOTSTRAP_NODE_EXEC_PATH
RENDER_RIVALS_BOOTSTRAP_NODE_VERSION
```

Rust:

1. rejects missing or relative path;
2. canonicalizes where supported;
3. verifies the executable exists;
4. runs `<path> --version`;
5. compares with bootstrap version;
6. launches coordinator using exactly that path.

Rust never resolves coordinator `node` from `PATH`.

Coordinator command:

```text
<exact-node-path> <coordinator-entry-file>
```

## 5. Session endpoint and nonce

Rust generates:

- Session ID;
- native IPC endpoint;
- one-time coordinator nonce;
- protocol version;
- transient Session root;
- coordinator role/capabilities.

It supplies:

```text
RENDER_RIVALS_SESSION_ID
RENDER_RIVALS_SUPERVISOR_ENDPOINT
RENDER_RIVALS_SUPERVISOR_NONCE
RENDER_RIVALS_SUPERVISOR_PROTOCOL
RENDER_RIVALS_SESSION_ROOT
RENDER_RIVALS_DATA_ROOT
```

Endpoint and nonce never appear in argv, URL, logs, or page source.

The Session root is transient operational storage. Canonical Run history remains under the data root defined by `spec/11`.

## 6. Terminal authority

Rust is the only terminal authority after startup.

Rust owns:

- terminal progress;
- first and repeated interrupt behavior;
- terminal restoration;
- final exit summary;
- optional shutdown confirmation.

Coordinator sends semantic progress events. Rust chooses terminal formatting. Bootstrap prints only failures that occur before Rust is ready.

## 7. Console and signal policy

### Windows

- Bootstrap and Rust may share the user shell console.
- Coordinator launches without the user's interactive console.
- Pipe-driven managed roots use captured stdio and no inherited user console.
- Interactive adapters, when later supported, use private ConPTY not connected to user input.
- Rust does not broadcast user `CTRL_C_EVENT` to managed workloads.
- Graceful stop uses adapter protocol, stdin close, private-group `CTRL_BREAK_EVENT`, HTTP shutdown, or process-specific mechanism.
- Forced stop terminates the verified containment boundary.

### Unix

- Rust remains in the foreground terminal process group.
- Bootstrap absorbs interrupt after Rust starts.
- Coordinator and managed workload roots use separate process groups/sessions with pipe or private PTY stdio.
- Rust remains logical signal authority.

## 8. Bootstrap liveness

Bootstrap creates a dedicated one-way liveness channel. Bootstrap holds writer and Rust holds reader.

Unexpected EOF is owner loss. Rust begins emergency cleanup. Stored PID is metadata, not the primary liveness mechanism.

## 9. Session lifecycle

A Session starts when Rust creates native resources and authenticates coordinator. A Session may host zero or more sequential Run operations. A durable Run may survive one Session and resume under another.

`SessionState` is imported from `schemas/domain-types.ts`:

- `starting`;
- `authenticating_coordinator`;
- `ready`;
- `running`;
- `shutdown_requested`;
- `draining`;
- `forced_termination`;
- `completed`;
- `crashed`.

`ready` means no Run workload is currently active. `running` means at least one Run operation or recovery/cleanup operation is active. MVP scheduler permits one active Run workload at a time.

## 10. Startup sequence

1. Bootstrap validates Node and artifacts.
2. Bootstrap launches Rust with terminal and liveness channel.
3. Rust creates transient Session root, containment primitives, secure endpoint, nonce, and output roots.
4. Rust launches coordinator using exact Node and containment/console policy.
5. Coordinator authenticates nonce, Session ID, peer identity, protocol, Node path, and build.
6. Rust reports measured containment and process capabilities.
7. Coordinator opens canonical data root and starts loopback dashboard server.
8. Coordinator reports ready or read-only safe-mode capability.
9. Rust prints dashboard URL and status.

## 11. Safe mode

Safe mode follows `spec/13` and `docs/SCAFFOLD-DECISION-REGISTER.md`.

It is available only after supervisor and coordinator authenticate successfully. It permits read-only inspection, integrity scan, recovery assessment, verified cleanup, and sanitized diagnostics.

It prohibits project commands, browser launch, evaluator calls, source/workspace mutation, new Run start, and unsafe promotion.

Native binary, endpoint, or coordinator-authentication failure cannot fall back to safe mode.

## 12. First Ctrl+C

Rust records interrupt and emits `session.shutdown_requested`.

Coordinator:

1. rejects new mutations;
2. records cancellation intent for active operations;
3. stops scheduling;
4. requests graceful process and browser shutdown;
5. flushes semantic events and artifact registrations;
6. writes Run interruption/cancellation state where authority remains;
7. releases dashboard and run leases;
8. sends `coordinator.shutdown_ready`.

## 13. Grace and repeated interrupt

Rust waits a bounded configurable grace period. A second interrupt skips remaining grace and force-terminates verified Session containment.

## 14. Coordinator exit intent

```ts
interface CoordinatorExitIntent {
  kind: "user_shutdown" | "normal_completion" | "restart_requested";
  reason: string | null;
}
```

Rust associates intent with coordinator identity, sequence, timestamp, and expected exit-code class.

Classification:

- clean: valid intent plus expected exit;
- crash: no valid intent;
- abnormal: intent/exit/IPC/identity mismatch;
- forced: Rust terminated coordinator or Session containment.

## 15. Coordinator interruption

On unexpected coordinator exit:

1. mark active Run interrupted when durable authority permits;
2. terminate verified Run groups and browser descendants;
3. preserve process output and evidence;
4. write native Session/crash observations;
5. print recovery path;
6. exit nonzero.

No automatic coordinator restart in MVP.

## 16. Supervisor and bootstrap interruption

- Windows kill-on-close Job behavior must be doctor-verified.
- Linux strong watchdog kills payload cgroup when Rust disappears.
- Managed/best-effort platforms make no complete crash-cleanup guarantee.
- Bootstrap liveness EOF initiates emergency Session shutdown.

## 17. Progress events

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

Progress is observational UI data, not canonical state. Raw child bytes are never embedded in progress events.

## 18. Dashboard ownership

Dashboard server runs in coordinator and binds loopback according to `spec/13`. Closing the browser UI does not end Session. Dashboard ends with coordinator.

## 19. Containment lifetime

Root native containment lifetime is Session, not Run. Run and candidate groups are subordinate. Rust remains outside payload kill boundaries where required to enforce cleanup.

## 20. Environment policy

Rust supplies a minimal coordinator environment:

- reserved Session variables;
- safe temporary root;
- data root;
- locale unless overridden;
- sanitized Node-loading options;
- inherited `PATH` only where needed.

Evaluate and scrub dangerous loader/debug injection such as `NODE_OPTIONS`, custom loaders, and debugger flags according to frozen policy.

## 21. Windows breakaway

Session and Run jobs deny normal and silent breakaway.

Repository tooling requiring Job breakaway is classified:

```text
unsupported_repository_process_breakaway
```

Report executable, Windows error, group, and reproduction guidance. Do not mislabel it as a generic build failure.

## 22. Startup failure classes

- unsupported Node;
- native package missing or integrity failure;
- exact Node mismatch;
- endpoint creation failure;
- coordinator launch/authentication failure;
- containment probe failure;
- dashboard bind failure;
- Session/data-root failure;
- incompatible component protocol.

## 23. Required tests

- exact bootstrap Node is launched despite `PATH` change;
- reserved endpoint/nonce are absent from argv, URLs, and logs;
- first Ctrl+C requests graceful shutdown;
- second Ctrl+C forces verified containment;
- dev server does not receive user Ctrl+C directly;
- bootstrap crash triggers cleanup;
- coordinator crash differs from clean/abnormal/forced exit;
- terminal restores after forced stop;
- browser descendants inherit verified containment;
- disallowed descendant escape downgrades/fails capability;
- safe mode cannot execute project commands;
- Session may host sequential Runs while a Run can resume under another Session;
- old `VISOPT_*` variables are not recognized as canonical.

## 24. Scaffold verification spike

Demonstrate on Windows:

- Rust alone reacts to user interrupt;
- coordinator waits for IPC shutdown;
- managed roots receive no direct user console event;
- forced containment kills descendants;
- Playwright-launched Chromium inherits Session Job membership;
- exact Node survives version-manager `PATH` changes;
- safe mode is read-only and unavailable when native startup fails.
