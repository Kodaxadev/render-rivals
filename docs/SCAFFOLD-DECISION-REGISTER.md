# Render Rivals Scaffold Decision Register

**Status:** Active implementation input  
**Purpose:** Resolve or explicitly defer every `OPEN-*` item that otherwise blocks scaffolding.  
**Authority:** Accepted ADRs and canonical specifications override this register. Changes to a locked architectural decision require an ADR.

## 1. Decision classes

- **Resolved for MVP:** implementation may proceed using the stated decision.
- **Deferred outside MVP:** must not block the Windows reference vertical slice and must not appear enabled in the MVP UI.
- **Milestone decision:** intentionally selected when the named milestone begins because the answer depends on then-current package or platform versions.
- **User/product decision:** does not block core scaffolding but must be settled before the stated release boundary.

## 2. Product and experiment decisions

| Item | Status | Decision |
|---|---|---|
| `OPEN-001` first experiment route | Resolved for MVP | The packaged acceptance fixture uses `/dashboard` with populated, empty, and unavailable states. The first personal repository route is selected when that empirical run is created and is not a scaffold constant. |
| `OPEN-002` protected-file policy | Resolved for MVP | Protected by default: `.git/**`, `.render-rivals/**`, secret/environment files, CI/release credentials, deployment infrastructure, and files explicitly marked protected. Lockfiles and package manifests are disclosed and gated by dependency policy rather than always forbidden. |
| `OPEN-003` human comparison UI | Resolved for MVP | Side-by-side desktop/mobile/state comparison, synchronized interaction-step navigation, gate detail, cited factor evidence, limitations, and explicit typed decision. Overlay is optional and not release-blocking. |
| `OPEN-004` contender strategies | Resolved for MVP | One independently prepared contender from branch, commit, worktree, directory snapshot, patch, or valid previous candidate snapshot. In-run generation is deferred. |
| `OPEN-005` evaluator ensemble | Resolved for MVP | One configured pairwise evaluator plus mandatory order reversal. Human-only mode is permitted. Multi-model ensembles and learned preference models are deferred. |
| `OPEN-006` fixed fixture | Resolved for MVP | Vite TypeScript fixture, `/dashboard`, deterministic local seed data, fixed locale/time zone, populated/empty/unavailable states, and one primary filter-or-submit interaction. |

## 3. Containment decisions

| Item | Status | Decision |
|---|---|---|
| `OPEN-CONT-001` Windows API bindings | Milestone decision | Use the maintained Microsoft Rust Windows bindings selected at scaffold time. Wrap every native call behind Render Rivals-owned modules so the binding crate is replaceable. |
| `OPEN-CONT-002` Linux delegated scope acquisition | Deferred outside Windows MVP | Linux strong mode remains experimental. The first spike may use `systemd-run --user --scope` for verification; production strong mode requires tested user-manager integration and explicit delegation. |
| `OPEN-CONT-003` supported systemd versions | Deferred outside Windows MVP | Publish support only after CI/host probes establish a tested matrix. Presence of systemd alone never implies strong mode. |
| `OPEN-CONT-004` macOS observation | Deferred outside Windows MVP | Best-effort process groups, descendant observation, and listener checks only. No parity claim. |
| `OPEN-CONT-005` fatal/advisory resource limits | Resolved for MVP | Disk reserve, process-count ceiling, hard memory ceiling when kernel-backed, and output byte ceiling are blocking. CPU time and soft-memory pressure are advisory until a configured hard threshold is crossed. |

## 4. IPC and process decisions

| Item | Status | Decision |
|---|---|---|
| `OPEN-IPC-001` Rust IPC/security libraries | Milestone decision | Use maintained async runtime, serialization, byte-buffer, and platform binding crates selected and pinned at scaffold. Protocol behavior is owned by Render Rivals tests, not by a framework abstraction. |
| `OPEN-IPC-002` compatibility rules | Resolved for MVP | Protocol major must match exactly. Minor versions may negotiate additive capabilities. Unknown required methods or fields fail closed. No coordinator reconnect within one supervisor session in MVP. |
| `OPEN-IPC-003` listener inspection | Resolved for Windows MVP | Windows uses native owning-PID TCP tables plus Job membership. Linux and macOS report verified, inferred, or unavailable according to tested capability. |
| `OPEN-IPC-004` output limits | Resolved for MVP | Default maximum is 64 MiB per stdout stream and 64 MiB per stderr stream per process. Crossing the limit records truncation and terminates or switches to configured tail retention; bytes are never silently discarded. |
| `OPEN-IPC-005` ConPTY abstraction | Deferred outside MVP | MVP adapters must support pipe-driven noninteractive operation. Private ConPTY support is added only for a selected adapter that demonstrably requires terminal semantics. |

## 5. Stack and packaging decisions

| Item | Status | Decision |
|---|---|---|
| `OPEN-STACK-001` npm package name | User/product decision | Working package name is `render-rivals`. Availability, scope, and trademark checks occur before first public package publication. Internal package names must not retain `visual-optimizer`. |
| `OPEN-STACK-002` first real adapter | Resolved for MVP | Start with human-only evaluation and a generic external-command JSON adapter. Provider-specific generation adapters are deferred until selector proof. |
| `OPEN-STACK-003` Rust libraries | Milestone decision | Exact crates are pinned during the bootstrap/supervisor spike after minimal proofs for Job Objects, named pipes, process I/O, Ctrl+C handling, and TCP owner lookup. |
| `OPEN-STACK-004` exact versions | Milestone decision | `.node-version`, package manager, lockfiles, Playwright/Chromium, TypeScript, Rust toolchain, and CI image are pinned in the first scaffold commit and upgraded only through compatibility tests. |
| `OPEN-STACK-005` Windows native-package CI | Milestone decision | Required before npm alpha publication, not before local source scaffolding. It must build, test, checksum, and smoke-install the Windows x64 native package. |
| `OPEN-STACK-006` dashboard tokens | Resolved for MVP | Generate at least 256 bits of session entropy. Use an HttpOnly SameSite=Strict cookie for browser requests, require an origin check and CSRF-safe mutation header, never place the token in URLs, logs, or argv, and invalidate it with the supervisor session. |

## 6. Additional development decisions found during audit

### 6.1 Launch authority

Rust owns launch authorization, managed root-process creation, containment assignment, observation, resource enforcement, and termination.

An approved contained process may create descendants only when:

- the containment mechanism inherits membership;
- doctor verifies descendant membership for the relevant process class;
- the parent is declared capable of child creation;
- escaped or unverifiable descendants downgrade capability or fail the run.

This permits Playwright to launch Chromium as a contained coordinator descendant on the Windows reference path without pretending Node owns containment.

### 6.2 Candidate-local versus epoch-wide failures

Invalidate the entire Capture Epoch only when comparison environment continuity is compromised, including browser crash/disconnect, browser-process identity loss, fixture/environment drift, context isolation leak, source mutation, or required artifact corruption that cannot be scoped safely.

A candidate-local page crash, readiness failure, build failure, or missing state:

- invalidates that Candidate Attempt;
- receives its bounded local retry where allowed;
- does not invalidate valid current captures merely because the contender failed;
- permits deterministic `current_retained` when the current implementation remains qualified.

### 6.3 Pausing

Run pause/suspend is not implemented in the MVP. The UI may offer `Cancel` and phase-appropriate `Retry` only. Preview rendering may be hidden or frozen without pausing the run.

### 6.4 Safe mode

Safe mode is read-only recovery mode and is available only after the native supervisor and coordinator authenticate successfully.

Safe mode disables:

- project command execution;
- browser launch and capture;
- evaluator invocation;
- run mutation except integrity/recovery operations;
- promotion/export that depends on unverified state.

It permits diagnostics, canonical file inspection, sanitized diagnostic export, and verified cleanup. Native binary or IPC startup failure cannot fall back to safe mode.

### 6.5 License

The repository remains all-rights-reserved until a real license replaces `LICENSE-TBD.md`. License selection does not block local scaffolding but blocks external contribution and public OSS release claims.

## 7. Scaffold gate interpretation

All historical `OPEN-*` items are now either resolved, explicitly deferred, or assigned to a named milestone. They must not remain ambiguous implementation choices inside individual specs.

A milestone decision is completed by a commit that records:

- selected dependency/tool version;
- verification evidence;
- affected compatibility matrix;
- replacement or amendment of this register when the decision becomes durable architecture.
