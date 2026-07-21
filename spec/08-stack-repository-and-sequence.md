# 08 — Language, Stack, Repository Layout, Support Policy, and Build Sequence

**Status:** Canonical implementation contract  
**Ownership boundary:** `adr/ADR-0001-typescript-rust-boundary.md`, clarified by `spec/02`  
**CLI/API contract:** `spec/13-configuration-cli-and-local-api-contracts.md`  
**Scaffold decisions:** `docs/SCAFFOLD-DECISION-REGISTER.md`

## 1. Language boundary

TypeScript owns:

- domain policy and state reducers;
- Git/source/workspace strategy;
- Playwright and browser orchestration;
- fixtures, gates, evidence, evaluation, and accounting;
- configuration and adapters;
- local API/server, CLI semantics, and dashboard.

Rust owns:

- Session supervision;
- managed root-process launch authorization/creation;
- containment assignment and termination;
- native process I/O and resource enforcement;
- listener ownership inspection;
- secure native IPC;
- terminal signals and restoration.

Approved contained descendants may spawn only under `spec/02` and `spec/03` inheritance rules.

## 2. Runtime policy

Initial tested support:

```text
Node 24 LTS
ESM only
Playwright-managed Chromium
Windows x64 reference platform
```

Exact active versions are pinned in the first scaffold commit:

- `.node-version`;
- package manager and lockfile;
- TypeScript and lint/test toolchain;
- Playwright and browser revision;
- Rust toolchain and `Cargo.lock`;
- CI image.

New Node/browser/toolchain lines require the compatibility matrix and fixture suites to pass before support is claimed.

## 3. Package manager and module system

- pnpm workspaces for the implementation monorepo;
- ESM-only JavaScript packages initially;
- no CommonJS dual publishing;
- shared content-addressed package store, but worktree-local dependency links/tree;
- generated declarations for public internal package boundaries.

## 4. Repository layout

Target scaffold layout:

```text
render-rivals/
  apps/
    bootstrap/             # minimal npm bin
    cli/                   # CLI composition over domain services
    dashboard/             # React/Vite local UI
    coordinator/           # local server and orchestration entry

  packages/
    core/                  # pure domain reducers and invariants
    config/                # JSONC loading, precedence, schema-backed diagnostics
    store/                 # canonical files, events, recovery, exports
    accounting/            # inference/process/human usage records
    supervisor-client/     # typed IPC client and protocol fixtures
    git/                   # system Git invocation and source snapshots
    workspace/             # materialization, dependencies, ports/readiness
    capture/               # Playwright, fixture/state/interaction, epochs
    gates/                 # phased deterministic gates
    evaluate/              # packets, adapters, reversal, policy, controls
    adapters/              # generic command adapter and future providers
    server/                # Fastify REST/SSE/auth/artifact serving

  native/
    supervisor/
    doctor-fixtures/

  schemas/
    domain-types.ts
    zod/
    json-schema/
    fixtures/valid/
    fixtures/invalid/
    migrations/

  fixtures/
    repositories/
    evaluator-streams/
    evidence/
    failures/

  research/
    analysis/

  spec/
  adr/
  docs/
  sources/
  archive/
  brand/

  pnpm-workspace.yaml
  Cargo.toml
```

The current documentation repository may be scaffolded in place into this layout. Canonical architecture documents remain at root-level `spec/`, `adr/`, and `docs/`.

## 5. Application responsibilities

### `apps/bootstrap`

Minimal npm `bin`. Validates Node/native package, launches Rust, owns no product policy.

### `apps/coordinator`

JavaScript bundle launched by Rust using exact Node. Hosts domain services, local API, dashboard assets, Playwright orchestration, and recovery composition.

### `apps/cli`

Commands from `spec/13`:

- `init`;
- `doctor`;
- `run`;
- `inspect`;
- `resume`;
- `export`;
- `cleanup`.

CLI and dashboard call the same application/domain services.

### `apps/dashboard`

Local browser UI for projects, Runs, evidence, decisions, diagnostics, artifacts, and non-destructive exports. It never mutates canonical files directly.

## 6. Package responsibilities

### `packages/core`

Pure domain types, reducers, state transitions, commands, recommendation policy, and invariants. It imports shared schema types but no Playwright, Fastify, Git subprocess, Rust, provider SDK, or UI dependency.

Canonical terms are current implementation, contender, candidate, Recommendation, User Decision, and Promotion.

### `packages/config`

Loads the exact files and precedence from `spec/13`, validates through Zod, produces provenance diagnostics, and resolves immutable Run Configuration.

### `packages/store`

Implements `spec/11`: canonical entities, event and artifact streams, hashes, locking, recovery, integrity, retention, import, and export.

### `packages/accounting`

Stores `InferenceUsage`, process usage, wall time, local resources, policy snapshots, and human-time observations. Unknown values remain null.

### `packages/supervisor-client`

Framing, authentication, operation idempotency, process/output APIs, subscriptions, golden protocol fixtures, and compatibility negotiation.

### `packages/git`

System Git invocation through supervised process roots, source snapshots, worktrees, status, patches, branch export, and cleanup. No JavaScript Git reimplementation initially.

### `packages/workspace`

Materialization, dependency preparation, server profiles, port leases, readiness, workspace verification, and cleanup policy.

### `packages/capture`

Playwright, contained browser lifecycle, Capture Plans/Epochs, clock/random fixtures, states, viewports, interaction scripts, screenshots, DOM/accessibility/geometry/style evidence, and capture validation.

### `packages/gates`

Pre-capture, runtime/capture, and post-capture gates. A gate declares its required evidence phase so it cannot run before dependencies exist.

### `packages/evaluate`

Immutable packets, generic evaluator adapter, factor evidence, order reversal, human-only ratings, deterministic Recommendation policy, experimental controls, and metrics.

### `packages/adapters`

Replay/mock plus generic external-command JSON adapter. In-run generation/provider-specific adapters are post-MVP.

### `packages/server`

Fastify local API, SSE, session authentication, CSRF/origin protection, static dashboard, artifact serving, and safe-mode enforcement from `spec/13`.

## 7. Browser and frontend stack

- official Playwright for Node;
- Playwright-managed Chromium only for MVP;
- Playwright Test for harness integration and dashboard E2E;
- axe-core through Playwright, without complete WCAG claim;
- Sharp for thumbnails, crops, masks, overlays, and metadata normalization;
- pixel difference remains diagnostic, never the quality score;
- React, Vite, TypeScript, CSS Modules, and CSS variables;
- no Next.js, Electron, or Tauri initially.

## 8. Server and client state

- Fastify supported major pinned at scaffold;
- REST queries/commands and SSE from `spec/13`;
- no WebSocket initially;
- typed fetch client;
- URL state for shareable local navigation;
- local component state;
- add a query cache library only after measured need;
- SSE is notification, not source of truth.

## 9. Persistence

Files and append-only event/artifact streams are canonical. SQLite may later be a rebuildable index. No database appears in the critical path for reconstruction.

## 10. Testing and formatting

- TypeScript unit/integration: Vitest-compatible stable toolchain;
- browser/UI: Playwright Test;
- Rust: Cargo test;
- cross-language: golden protocol, schema, event, and adversarial fixtures;
- lint/format: ESLint/typescript-eslint, React hooks, Prettier, Rustfmt, Clippy.

No generic workflow engine such as Temporal, Inngest, BullMQ, Redis, LangChain, Mastra, or XState.

## 11. Distribution

Working conceptual packages:

```text
render-rivals
<selected-scope>/supervisor-win32-x64
<selected-scope>/supervisor-linux-x64
<selected-scope>/supervisor-darwin-arm64
```

The exact public npm scope/name is a product decision before publication. Internal code and metadata must use Render Rivals naming and must not retain `visual-optimizer`.

Bootstrap selects native package by platform, architecture, and libc where needed and verifies package metadata/checksum.

Build artifacts:

- minimal bootstrap JavaScript;
- coordinator JavaScript bundle;
- Rust platform binary;
- static dashboard assets;
- schema artifacts and protocol fixtures.

Users do not install Rust to consume a packaged release.

## 12. Support matrix

### MVP reference

- Windows 10/11 x64;
- Node 24 LTS;
- Chromium;
- pnpm and npm target repositories;
- one active current/contender workload;
- pipe-driven evaluators;
- local dashboard and CLI.

### Experimental

- Linux x64 strong/managed according to measured capability;
- macOS best effort;
- yarn and other package managers;
- external-server mode.

Benchmark mode uses a pinned controlled Linux environment, fonts, locale/time zone, fixtures, and dependency hashes. Native product mode remains valid for local comparison but does not claim cross-host pixel parity.

## 13. Scaffold sequence

### Stage 0 — Documentation and decision gate

- canonical specs/ADRs accepted;
- cross-spec normalization complete;
- scaffold decision register resolved/deferred;
- source verification recorded;
- license explicitly marked pending;
- exact config/CLI/API contracts accepted.

### Stage 1 — Schemas and domain primitives

- shared IDs/types;
- Zod and JSON Schema;
- valid/invalid fixtures;
- state reducers and transition tests;
- canonical JSON/hash utilities.

### Stage 2 — Bootstrap/supervisor spike

- minimal bootstrap;
- exact Node;
- Rust terminal and Session;
- secure IPC;
- Windows Job and console isolation;
- output capture;
- browser-descendant containment proof.

### Stage 3 — Doctor and local API shell

- containment/detachment/browser/endpoint fixtures;
- data root and configuration discovery;
- loopback auth, REST commands, SSE, safe mode;
- CLI `init`, `doctor`, and `inspect`.

### Stage 4 — Canonical store and recovery

- Run/entity files;
- event/artifact streams;
- atomic commit ordering;
- locks, integrity, reconstruction, cleanup;
- failure fixtures.

### Stage 5 — Repository qualification

- project trust;
- Git/source snapshots;
- workspaces/materialization;
- dependencies/build/test;
- ports/readiness.

### Stage 6 — Capture

- fixture/state/interaction contracts;
- current stability samples;
- one Epoch and complete matrix;
- candidate-local versus epoch-wide failure behavior;
- artifact validation.

### Stage 7 — Gates and human comparison

- phased gates;
- side-by-side comparison;
- evidence citations;
- typed human decision;
- deterministic retention for ineligible contender.

### Stage 8 — Model-backed pairwise evaluation

- generic command adapter;
- immutable packets;
- output/citation validation;
- order reversal;
- deterministic Recommendation;
- accounting.

### Stage 9 — Promotion/export and acceptance suite

- report and patch export;
- local branch creation;
- stale-decision checks;
- idempotent retry;
- full golden and failure fixtures.

### Stage 10 — Personal experiment and continuation decision

Run the first real project experiment, compare against controls, then stop, pivot, or proceed.

## 14. Deferrals

- in-run contender generation;
- preference learning;
- automatic merge;
- multi-user/team collaboration;
- hosted service/cloud synchronization;
- public protocol/plugin marketplace;
- MCP server;
- parallel search;
- multi-browser/device lab;
- Figma round trip;
- remote worker fleet;
- Run pause/suspend;
- ConPTY adapters unless justified.

## 15. Acceptance criteria

The stack is accepted when:

- runtime ownership and descendant policy are unambiguous;
- exact Node and terminal behavior are tested;
- IPC and local dashboard mutation surfaces are authenticated and idempotent;
- canonical schemas and storage reconstruct without a database;
- candidate-local failures and epoch invalidation are distinguished;
- all enabled UI commands have legal domain transitions;
- platform guarantees are explicit;
- the Windows reference vertical slice is solo-maintainable.

Historical `OPEN-STACK-*` items are resolved, deferred, or assigned to milestones in `docs/SCAFFOLD-DECISION-REGISTER.md`.
