# 02 — Runtime, Bootstrap, Session Lifecycle, and Terminal Policy

**Status:** Canonical implementation contract  
**Shared Session state:** `schemas/domain-types.ts`  
**Stable errors:** `schemas/error-codes.ts`  
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

Rust owns launch authorization, managed root-process creation, containment assignment, native observation, resource enforcement, group termination, endpoint ownership inspection, and terminal/Session lifecycle.

An approved contained process may create descendants only under the inheritance/doctor requirements in the Scaffold Decision Register.

Coordinator owns semantic orchestration but does not claim native success until supervisor reports it.

## 3. JavaScript bootstrap

The npm package exposes a minimal JavaScript `bin` entry.

Responsibilities:

1. verify supported Node major;
2. read exact `process.execPath` and version;
3. resolve coordinator bundle and platform native package;
4. verify native package metadata/checksum where distributed;
5. create bootstrap-liveness channel;
6. launch Rust with inherited terminal handles;
7. pass bootstrap metadata through environment/inherited handles;
8. install nonterminating interrupt handlers after Rust is ready;
9. wait for Rust;
10. return Rust exit code.

Bootstrap does not launch coordinator, Chromium, repository commands, Workspaces, evaluators, or dashboard directly.

## 4. Exact Node executable

Bootstrap supplies:

```text
RENDER_RIVALS_BOOTSTRAP_NODE_EXEC_PATH
RENDER_RIVALS_BOOTSTRAP_NODE_VERSION
```

Rust rejects missing/relative path, canonicalizes where supported, verifies executable, runs `--version`, compares bootstrap version, and launches coordinator using exactly that path. It never resolves coordinator Node from `PATH`.

```text
<exact-node-path> <coordinator-entry-file>
```

## 5. Session endpoint and nonce

Rust generates Session ID, native endpoint, one-time nonce, protocol version, transient Session root, and coordinator capabilities.

```text
RENDER_RIVALS_SESSION_ID
RENDER_RIVALS_SUPERVISOR_ENDPOINT
RENDER_RIVALS_SUPERVISOR_NONCE
RENDER_RIVALS_SUPERVISOR_PROTOCOL
RENDER_RIVALS_SESSION_ROOT
RENDER_RIVALS_DATA_ROOT
```

Endpoint/nonce never argv, URL, logs, or page source. Session root is transient; canonical Run history uses spec11 data root.

## 6. Terminal authority

Rust is sole terminal authority after startup: progress rendering, interrupt behavior, restoration, final summary, optional shutdown confirmation.

Coordinator sends semantic progress. Bootstrap prints only failures before Rust readiness.

## 7. Console and signal policy

### Windows

- bootstrap/Rust may share shell console;
- coordinator has no user interactive console;
- pipe-driven roots use captured stdio;
- future interactive adapters use private ConPTY;
- user `CTRL_C_EVENT` is not broadcast to workloads;
- graceful stop uses adapter protocol/stdin/private-group break/HTTP/process-specific method;
- forced stop terminates verified containment boundary.

### Unix

- Rust remains foreground terminal group;
- bootstrap absorbs interrupt after Rust starts;
- coordinator/workload roots use separate groups/sessions and pipe/private PTY;
- Rust remains logical signal authority.

## 8. Bootstrap liveness

Bootstrap creates one-way liveness channel: bootstrap writer, Rust reader. Unexpected EOF triggers emergency cleanup. PID is metadata only.

## 9. Session lifecycle

A Session starts when Rust creates native resources and authenticates coordinator. It may host sequential Run operations. A durable Run may survive one Session and resume under another.

`SessionState`:

- starting;
- authenticating_coordinator;
- ready;
- running;
- shutdown_requested;
- draining;
- forced_termination;
- completed;
- crashed.

Ready means no active Run workload. Running includes Run/recovery/cleanup operation. MVP permits one active Run workload.

## 10. Startup sequence

1. bootstrap validates Node/artifacts;
2. launches Rust with terminal/liveness;
3. Rust creates Session root, containment, endpoint, nonce, output roots;
4. Rust launches coordinator with exact Node/console policy;
5. coordinator authenticates nonce, Session, peer, protocol, Node, build;
6. Rust reports measured capabilities;
7. coordinator opens data root and loopback dashboard;
8. coordinator reports ready or read-only safe mode;
9. Rust prints URL/status.

## 11. Safe mode

Available only after supervisor/coordinator authenticate. Permits read-only inspection, integrity/recovery assessment, verified cleanup, and sanitized diagnostic Export Operation.

Prohibits Project commands, browser/evaluator calls, source/workspace mutation, new Run, and unsafe Promotion.

Native binary, endpoint, or coordinator-auth failure cannot fall back to safe mode.

## 12. First Ctrl+C

Rust records `session.shutdown_requested`.

Coordinator rejects new mutations, records cancellation intent, stops scheduling, requests graceful process/browser shutdown, flushes Events/Artifacts, writes Run interruption/cancellation where possible, releases leases, and sends shutdown-ready.

## 13. Grace and repeated interrupt

Rust waits bounded configurable grace. Second interrupt skips remaining grace and force-terminates verified Session containment.

## 14. Coordinator exit intent

```ts
interface CoordinatorExitIntent {
  kind: "user_shutdown" | "normal_completion" | "restart_requested";
  reason: string | null;
}
```

Rust binds intent to coordinator identity, sequence, timestamp, and expected exit class.

Classification: clean, crash, abnormal, or forced.

## 15. Coordinator interruption

Unexpected exit:

1. mark active Run interrupted where durable authority permits;
2. terminate verified Run groups/browser descendants;
3. preserve output/evidence;
4. write native observations;
5. print recovery path;
6. exit nonzero.

No automatic coordinator restart in MVP.

## 16. Supervisor/bootstrap interruption

- Windows kill-on-close Job behavior doctor-verified;
- Linux strong watchdog kills payload cgroup;
- managed/best-effort make no complete crash-cleanup guarantee;
- liveness EOF initiates emergency Session shutdown.

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

Progress is observational, not canonical state. Raw bytes never embedded.

## 18. Dashboard ownership

Dashboard runs in coordinator and binds loopback per spec13. Closing browser does not end Session. Dashboard ends with coordinator.

## 19. Containment lifetime

Root native containment is Session-scoped; Run/Candidate groups subordinate. Rust remains outside payload kill boundaries.

## 20. Environment policy

Rust supplies minimal coordinator environment: reserved Session variables, temp/data roots, locale unless overridden, sanitized Node loading, needed `PATH` only.

Scrub/evaluate `NODE_OPTIONS`, custom loaders, debugger flags, and similar injection according to frozen policy.

## 21. Windows breakaway

Session/Run Jobs deny normal and silent breakaway.

Repository tooling requiring Job breakaway is classified:

```text
PROCESS_BREAKAWAY_UNSUPPORTED
```

Report executable, Windows error, group, and reproduction. Do not mislabel generic build failure.

## 22. Startup failure classes

Use stable codes from `schemas/error-codes.ts`, including unsupported Node/platform, native missing/integrity, exact Node mismatch, endpoint/auth/protocol failure, containment probe, dashboard bind, data root, and component incompatibility.

## 23. Required tests

- exact bootstrap Node despite `PATH` change;
- endpoint/nonce absent argv/URLs/logs;
- first/second Ctrl+C behavior;
- dev server no direct user Ctrl+C;
- bootstrap/coordinator crash cleanup/classification;
- terminal restoration;
- browser descendants verified contained;
- escape downgrades/fails capability;
- safe mode cannot execute;
- Session/Run separation;
- old `VISOPT_*` variables rejected;
- breakaway uses canonical stable code.

## 24. Scaffold verification spike

Demonstrate on Windows:

- Rust alone reacts to user interrupt;
- coordinator waits for IPC shutdown;
- managed roots receive no direct user console event;
- forced containment kills descendants;
- Playwright Chromium inherits Session Job;
- exact Node survives version-manager `PATH` changes;
- safe mode is read-only/unavailable on native startup failure.
