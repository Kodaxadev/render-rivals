# Render Rivals

> Build contenders. Keep the best.

Render Rivals is a local-first visual optimization harness for AI-assisted frontend work. It compares a qualified current implementation with independently prepared Contenders under controlled conditions, blocks functional and protected regressions, preserves cited evidence, and requires an explicit human Decision before candidate adoption.

## Repository status

**Architecture:** Canonical MVP contracts established  
**Implementation:** Pre-scaffold; executable schemas/runtime/product code not yet present  
**Reference platform:** Windows 10/11 x64 strong-containment target  
**License:** Not yet licensed for general reuse or contribution; see [`LICENSE-TBD.md`](LICENSE-TBD.md)  
**Public packaging:** Not yet available

This repository is an architecture and product implementation baseline, not a shipped product or open-source release yet.

## Product boundary

MVP:

- one local Git Project;
- one current implementation and one existing Contender;
- populated, empty, and unavailable/error states;
- desktop/mobile and one critical interaction;
- sequential Workspaces/servers and one contained Chromium per Capture Epoch;
- phased deterministic Gates;
- pairwise evaluator with order reversal or human-only mode;
- deterministic Recommendation and explicit User Decision;
- Promotion as patch/local branch/preserved Workspace;
- ordinary Export Operation as report/diagnostics/bundles;
- files/events as canonical history;
- one manually opened, terminal-paired local dashboard browser Session;
- local observability with remote telemetry/crash upload disabled by default;
- no automatic merge, push, deployment, generation, Pause, cloud service, browser auto-launch, updater, or background daemon.

Project and local evaluator commands run with the user's operating-system authority. Process containment controls lifecycle/resources where measured; it is not a filesystem/network sandbox.

## Canonical reading order

1. [`spec/01-scope-and-invariants.md`](spec/01-scope-and-invariants.md)
2. [`spec/02-runtime-and-bootstrap.md`](spec/02-runtime-and-bootstrap.md)
3. [`spec/03-process-containment.md`](spec/03-process-containment.md)
4. [`spec/04-supervisor-ipc-and-process-io.md`](spec/04-supervisor-ipc-and-process-io.md)
5. [`spec/05-execution-and-capture.md`](spec/05-execution-and-capture.md)
6. [`spec/06-evaluation-and-experiments.md`](spec/06-evaluation-and-experiments.md)
7. [`spec/07-storage-security-and-configuration.md`](spec/07-storage-security-and-configuration.md)
8. [`spec/08-stack-repository-and-sequence.md`](spec/08-stack-repository-and-sequence.md)
9. [`spec/09-domain-model-and-identifiers.md`](spec/09-domain-model-and-identifiers.md)
10. [`spec/10-run-and-candidate-state-machines.md`](spec/10-run-and-candidate-state-machines.md)
11. [`spec/11-artifact-event-and-schema-contracts.md`](spec/11-artifact-event-and-schema-contracts.md)
12. [`spec/12-cross-spec-normalization.md`](spec/12-cross-spec-normalization.md)
13. [`spec/13-configuration-cli-and-local-api-contracts.md`](spec/13-configuration-cli-and-local-api-contracts.md)
14. [`spec/14-git-source-snapshot-and-workspace-contracts.md`](spec/14-git-source-snapshot-and-workspace-contracts.md)
15. [`spec/15-observability-diagnostics-and-telemetry-contracts.md`](spec/15-observability-diagnostics-and-telemetry-contracts.md)
16. [`spec/16-dashboard-session-authentication-and-pairing.md`](spec/16-dashboard-session-authentication-and-pairing.md)
17. [`spec/17-local-api-envelopes-operations-and-pagination.md`](spec/17-local-api-envelopes-operations-and-pagination.md)

Shared serialized vocabulary, stable errors, API envelopes, and cross-record validation:

- [`schemas/domain-types.ts`](schemas/domain-types.ts)
- [`schemas/error-codes.ts`](schemas/error-codes.ts)
- [`schemas/api-types.ts`](schemas/api-types.ts)
- [`schemas/README.md`](schemas/README.md)
- [`docs/RECORD-INVARIANT-MATRIX.md`](docs/RECORD-INVARIANT-MATRIX.md)

Architecture decisions are under [`adr/`](adr/). Runtime-source verification is under [`sources/`](sources/). Historical drafts are under [`archive/`](archive/) and are not implementation inputs.

## Product, development, and release contracts

- [`docs/MVP-VERTICAL-SLICE.md`](docs/MVP-VERTICAL-SLICE.md) — locked first usable path.
- [`docs/FAILURE-RECOVERY-MATRIX.md`](docs/FAILURE-RECOVERY-MATRIX.md) — stable failures, retries, recovery, cleanup.
- [`docs/RECORD-INVARIANT-MATRIX.md`](docs/RECORD-INVARIANT-MATRIX.md) — record cardinality, nullability, supersession, retry, and cross-field validation.
- [`docs/TEST-AND-VALIDATION-STRATEGY.md`](docs/TEST-AND-VALIDATION-STRATEGY.md) — fixtures, fault injection, CI, release gates.
- [`security/THREAT-MODEL.md`](security/THREAT-MODEL.md) — trust boundaries, controls, residual risk.
- [`docs/SCAFFOLD-DECISION-REGISTER.md`](docs/SCAFFOLD-DECISION-REGISTER.md) — resolved, deferred, and milestone decisions.
- [`docs/DEVELOPMENT-GAP-REGISTER.md`](docs/DEVELOPMENT-GAP-REGISTER.md) — remaining proof, implementation, and release gaps with blocking effects.
- [`docs/PRODUCT-UI-SCENE-PLAN.md`](docs/PRODUCT-UI-SCENE-PLAN.md) — enabled authenticated UI scenes and MVP product inventory.
- [`docs/DASHBOARD-PAIRING-ROUTE.md`](docs/DASHBOARD-PAIRING-ROUTE.md) — the only pre-authentication browser route.
- [`docs/ROUTE-LEVEL-WIREFRAME-SPEC.md`](docs/ROUTE-LEVEL-WIREFRAME-SPEC.md) — authenticated route geometry, guards, and state behavior.
- [`docs/PLANNING-SCOPE-STATUS.md`](docs/PLANNING-SCOPE-STATUS.md) — MVP versus post-MVP authority.
- [`docs/MARKETING-AND-DOCS-SITE-PLAN.md`](docs/MARKETING-AND-DOCS-SITE-PLAN.md) — public claim gates.
- [`docs/PACKAGING-DISTRIBUTION-AND-UPDATES.md`](docs/PACKAGING-DISTRIBUTION-AND-UPDATES.md) — packages, native binaries, releases, updates, license blockers.

Brand exploration is under [`brand/`](brand/) and is not an architecture input.

## Canonicality rule

When statements conflict:

1. accepted ADRs control deliberate architecture decisions;
2. `schemas/domain-types.ts`, `schemas/error-codes.ts`, and `schemas/api-types.ts` control shared vocabulary they define;
3. canonical specs control implementation behavior;
4. `docs/RECORD-INVARIANT-MATRIX.md` controls cross-record cardinality/nullability where interfaces and prose are otherwise underspecified;
5. `spec/11` controls live filesystem/commit semantics;
6. `spec/13` controls configuration, CLI, general local API routes, safe mode, and commands;
7. `spec/14` controls Git/source/workspace/branch semantics;
8. `spec/15` controls logs, metrics, diagnostics, telemetry, and crash reporting;
9. `spec/16` controls dashboard origin isolation, pairing, browser credential, Host/Origin/CSRF, and browser-opening policy;
10. `spec/17` controls API envelopes, operation status, revision rules, pagination, and Artifact response behavior;
11. MVP contract narrows first release without weakening runtime invariants;
12. failure/security/test contracts control required negative behavior and proof;
13. UI/wireframe documents expose only legal enabled commands;
14. marketing/brand/archive never override implementation contracts;
15. code does not silently override architecture—deliberate deviation requires updated spec and ADR where architectural.

ADR-0011 is fully incorporated and now records rationale/history rather than acting as a temporary override.

## Locked ownership boundary

This mirrors [`ADR-0001`](adr/ADR-0001-typescript-rust-boundary.md) as clarified by specs 02–04.

- TypeScript owns policy, domain state, Git/workspace strategy, Playwright orchestration, fixtures/Gates/Evidence/evaluation/accounting, configuration/adapters, local API/CLI semantics, observability policy, and UI.
- Rust owns Session supervision, launch authorization and managed root-process creation, containment, process I/O, resource enforcement, listener ownership, native IPC, terminal signals, and verified termination.
- Approved contained roots may spawn descendants only when containment inheritance is expected and doctor-verified; this is how Playwright-managed Chromium operates on the Windows reference path.
- The boundary is a sidecar protocol, not N-API.

## Other locked decisions

- Minimal JavaScript npm bootstrap remains outside containment.
- Rust launches coordinator with bootstrap's exact `process.execPath`.
- Session endpoint/nonce use environment, never argv/URL/logs.
- Rust owns user Ctrl+C and terminal restoration.
- Coordinator/Project/evaluator roots do not inherit the user's interactive console.
- The user's ordinary dashboard browser is manually opened and never pulled into Render Rivals containment in MVP.
- Dashboard access requires randomized-host one-time terminal pairing and a host-only HttpOnly Session cookie.
- Windows is first strong reference; Linux/macOS claims are capability-measured and explicit.
- MVP scheduler is sequential.
- Current implementation is recaptured in each selection Run.
- Browser continuity failures invalidate full Capture Epoch; Candidate-local failures do not unless comparability is compromised.
- Files and append-only streams are canonical; database may be rebuildable index only.
- Recommendation, User Decision, Promotion, and Export Operation are distinct.
- Remote telemetry, automatic crash upload, third-party dashboard analytics, and hidden background services are disabled/absent by default.
- No automatic merge/push/deployment or self-updater.

## Scaffold gate

Architecture/document decisions are sufficiently classified to begin scaffolding, but Stage 1 is not complete.

Before foundational scaffold acceptance:

- pin Node/pnpm/Playwright/Chromium/Rust/dependencies;
- implement Zod/JSON Schema, fixtures, migrations, compatibility tests, every Record Invariant Matrix row, and generated API command/envelope registry;
- generate Rust/TypeScript protocol goldens;
- implement canonical ID/error validators;
- implement and test randomized-host dashboard pairing, operation status, revision/idempotency, and bounded pagination;
- run Windows console/Job/browser-descendant spike;
- verify exact Playwright Clock behavior;
- implement documentation drift check;
- establish data-root filesystem tests;
- implement telemetry/crash “off means zero network” tests;
- keep license/public packaging claims blocked.

Milestone-dependent library/version decisions are listed in the Scaffold Decision Register and must be recorded when selected.

## First scaffold non-goals

- hosted service/cloud sync;
- MCP orchestration core;
- public interchange/plugin standard;
- preference training;
- parallel Candidates;
- SQLite source of truth;
- Electron/Tauri;
- in-Run Contender generation;
- multiple Contenders/rounds;
- Pause/suspend;
- automatic Promotion/merge;
- cross-platform parity;
- automatic dashboard browser opening or multi-client pairing;
- automatic updater/background service;
- default remote telemetry/crash upload.

## Maintenance

Architecture changes update:

1. affected canonical spec;
2. shared schemas/error/API registry and Record Invariant Matrix when vocabulary or cross-field meaning changes;
3. ADR for deliberate architecture decision;
4. failure/security/test/observability contracts;
5. UI/API contracts when commands/routes change;
6. package/public-claim contracts when release behavior changes;
7. [`MANIFEST.json`](MANIFEST.json) and [`DOCUMENT-MANIFEST.md`](DOCUMENT-MANIFEST.md).

Automated documentation conformance should fail on missing links, duplicate shared unions/commands, unregistered error codes, deprecated active names, old storage/env/package names, route drift, illegal MVP controls, schema/invariant/API registry mismatch, or unapproved telemetry/public claims.

## Source freshness

Version-sensitive claims are reverified at scaffold and dependency upgrades, especially:

- Playwright Clock/browser lifecycle;
- randomized `.localhost` browser resolution and cookie behavior;
- Windows Job/console/process/named-pipe/TCP owner APIs;
- systemd delegated scopes/cgroup kill;
- filesystem atomicity/durability;
- Git worktree/LFS/submodule behavior;
- evaluator command/provider formats;
- package/native signing/distribution;
- Node/TypeScript/Rust support ranges.
