# Render Rivals

> Build contenders. Keep the best.

Render Rivals is a local-first visual optimization harness for AI-assisted frontend work. It compares a current implementation with contenders under controlled conditions, blocks functional and protected regressions, preserves evidence, and recommends adoption only when a contender demonstrates a material improvement.

## Canonical architecture

**Status:** Architecture and MVP implementation contracts established  
**Working name:** Render Rivals  
**Canonical set:** This repository  
**Supersedes:** Earlier Design Warden and runtime drafts  
**Implementation status:** Scaffold only against the canonical specifications, accepted ADRs, and locked MVP contract

## Purpose

Render Rivals preserves a current implementation, accepts independently prepared contenders, builds and renders eligible candidates under comparable conditions, applies hard regression gates, evaluates candidates pairwise using cited evidence, and requires an explicit human decision before non-destructive export.

The first implementation is an experimental reference tool, not a universal autonomous design system.

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

Architecture decisions are under [`adr/`](adr/). Official-source verification notes are under [`sources/`](sources/). Earlier drafts are preserved under [`archive/`](archive/) for history only.

## Product and implementation planning

- [`docs/MVP-VERTICAL-SLICE.md`](docs/MVP-VERTICAL-SLICE.md) locks the first complete product path, required evidence coverage, gates, evaluation policy, exclusions, acceptance fixtures, and implementation sequence.
- [`docs/FAILURE-RECOVERY-MATRIX.md`](docs/FAILURE-RECOVERY-MATRIX.md) defines failure classification, evidence impact, retries, recovery targets, idempotency, cleanup, and user-facing behavior.
- [`docs/PRODUCT-UI-SCENE-PLAN.md`](docs/PRODUCT-UI-SCENE-PLAN.md) defines the complete desktop product surface and includes post-MVP concepts.
- [`docs/MARKETING-AND-DOCS-SITE-PLAN.md`](docs/MARKETING-AND-DOCS-SITE-PLAN.md) defines the marketing and documentation sites.
- [`docs/ROUTE-LEVEL-WIREFRAME-SPEC.md`](docs/ROUTE-LEVEL-WIREFRAME-SPEC.md) defines implementation route contracts, page geometry, route guards, state handling, and responsive behavior.
- [`docs/PLANNING-SCOPE-STATUS.md`](docs/PLANNING-SCOPE-STATUS.md) distinguishes enabled MVP routes and features from deferred complete-product planning.
- [`schemas/README.md`](schemas/README.md) records the schema-registry scaffold prerequisite and makes clear that executable schemas do not exist yet.

Brand exploration and visual-direction work are under [`brand/`](brand/).

## Canonicality rule

When statements conflict:

1. An accepted ADR overrides general specification text.
2. A later ADR overrides an earlier ADR only when it explicitly supersedes it.
3. Canonical specifications override planning documents and archived material.
4. MVP implementation contracts narrow the first release but do not override canonical runtime invariants.
5. Code does not silently override the specification. A deliberate deviation requires an ADR amendment or replacement.

Accepted [`ADR-0011`](adr/ADR-0011-selection-outcomes-and-user-decisions.md) expands the canonical recommendation and user-decision vocabulary. Until the related sections of specifications 09–11 are textually amended, ADR-0011 is authoritative.

## Locked ownership boundary

This summary intentionally mirrors [`ADR-0001`](adr/ADR-0001-typescript-rust-boundary.md).

- TypeScript owns policy, domain state, Git and workspaces, Playwright/browser orchestration, evidence, evaluation, accounting, experiments, configuration, adapters, the local server, and UI.
- Rust owns session supervision, process containment, process creation and I/O, process-tree termination, native resource accounting and enforcement, listener ownership, secure IPC, and terminal signals.
- Rust does not own promotion policy, visual judgment, Git strategy, provider parsing, evidence interpretation, or dashboard behavior.
- TypeScript does not emulate Job Objects, delegated cgroup termination, native peer credentials, or native listener ownership.
- The boundary is a sidecar protocol, not N-API.

## Other locked decisions

- The npm entry process is a minimal JavaScript bootstrap outside containment.
- Rust launches the coordinator using the bootstrap's exact `process.execPath`.
- Endpoint identifiers and session nonces are passed through environment, never argv.
- Rust is the terminal and Ctrl+C authority.
- Coordinator and supervised children do not inherit the user's interactive console.
- Windows is the first strong-containment reference platform.
- Linux strong mode requires an explicitly delegated systemd user scope, an owned subtree, and a usable `cgroup.kill`.
- macOS native containment is best effort and is never described as equivalent to Windows or Linux strong mode.
- The first scheduler is sequential.
- Every comparison recaptures the current implementation in the same capture epoch as the contender.
- A Chromium disconnect invalidates the complete capture epoch.
- Files and append-only event streams are canonical. A database may later be a rebuildable index.
- Token consumption is telemetry during the maximum-quality proof, not an early optimization target.
- Automatic merging is out of scope for exploratory phases.

## Scaffold gate

Scaffolding may begin only after:

- accepted ADR review;
- all scaffold-level `OPEN-*` items are resolved or explicitly deferred;
- Windows console-isolation spike is planned;
- Linux delegated-scope acquisition has a live verification task;
- Playwright Clock behavior is checked against the exact pinned release;
- the reference-platform support declaration is accepted;
- the MVP, state-machine, schema, and failure-recovery contracts are treated as implementation inputs;
- executable schema definitions, fixtures, and migration tests are created under the implementation schema package.

## Non-goals for the first scaffold

- hosted service;
- MCP as orchestration core;
- public interchange standard;
- plugin marketplace;
- preference-model training;
- parallel candidate execution;
- SQLite as source of truth;
- Tauri or Electron packaging;
- three production agent adapters;
- contender generation inside the MVP run;
- automatic promotion or merging;
- cross-platform containment parity claims.

## Maintenance

Canonical specification files should remain below about 600 lines where practical. Split them before review becomes difficult. ADRs may be shorter.

Architecture changes update:

1. the affected canonical specification;
2. a new or superseding ADR;
3. this locked-decision summary when relevant;
4. the affected implementation checklist;
5. repository manifests when the document inventory changes.

## Source freshness

Stable operating-system behavior is cited for traceability. Version-sensitive behavior is reverified when scaffolding and whenever dependencies are upgraded.

Highest-risk version-sensitive checks:

- Playwright Clock and browser lifecycle;
- systemd transient-scope and delegation signatures;
- Windows process creation and ConPTY behavior;
- agent CLI stream formats;
- vendor authentication and subscription terms;
- Node and TypeScript support ranges.
