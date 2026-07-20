# 08 — Language, Stack, Repository Layout, Support Policy, and Build Sequence

## 1. Primary language

TypeScript owns domain types, state, experiments, adapters, Playwright, evidence, evaluation, accounting, config, server, and dashboard.

## 2. Native language

Rust owns session supervision, containment, process creation/I/O, termination, resource accounting, listener ownership, secure IPC, and terminal signals.

## 3. Why not all Rust

All-Rust adds friction around Playwright, agent CLIs, React, structured model output, and changing JSON protocols. Most workload is I/O orchestration.

## 4. Why not all TypeScript

Pure Node is weak for Windows Job Objects, descendant cleanup, secure native pipes, crash cleanup, and endpoint owner lookup.

## 5. Boundary

Rust does not contain promotion policy, visual rules, Git strategy, provider parsing, evidence interpretation, or dashboard behavior.

TypeScript does not emulate Job Objects, delegated cgroup kill, peer credentials, or native listener ownership.

## 6. Runtime policy

Scaffold pins exact active Node LTS release. Architecture specifies support line, not patch.

Initial support:

```text
tested: Node 24 LTS
newer Node lines: unsupported until matrix passes
```

## 7. Exact pins at scaffold

Pin:

- `.node-version`;
- package manager;
- lockfile;
- TypeScript;
- Playwright/browser;
- Rust toolchain;
- Cargo lockfile;
- CI image.

## 8. Node upgrades

New LTS support requires unit, capture, containment, adapter, dashboard, native package, and benchmark-fixture tests. Update `engines` deliberately.

## 9. TypeScript policy

Use latest stable compiler proven compatible with ESLint parser, build, tests, editor, declarations, and libraries. No calendar promise for future compiler API.

## 10. Module system

ESM only. No CommonJS dual publishing initially.

## 11. Package manager

pnpm workspaces for monorepo, shared content-addressed store, and worktree-local dependency links.

## 12. Repository layout

```text
visual-optimizer/
  apps/
    bootstrap/
    cli/
    dashboard/

  packages/
    core/
    config/
    store/
    accounting/
    supervisor-client/
    git/
    workspace/
    capture/
    gates/
    evaluate/
    agents/
    server/

  native/
    supervisor/
    doctor-fixtures/

  fixtures/
    repositories/
    agent-streams/
    evidence/

  research/
    analysis/

  docs/
    spec/
    adr/

  pnpm-workspace.yaml
  Cargo.toml
```

## 13. `apps/bootstrap`

Minimal npm bin. No product policy.

## 14. `apps/cli`

Commands:

- doctor;
- run;
- inspect;
- export;
- cleanup.

## 15. `apps/dashboard`

Local interface for progress, evidence, comparisons, ratings, cleanup, history.

## 16. `packages/core`

Pure domain:

- session/run states;
- champion/challenger;
- eligibility;
- promotion;
- retention;
- escalation;
- invariants.

No Playwright, Git, Fastify, Rust, or provider import.

## 17. `packages/config`

JSONC, Zod, defaults, diagnostics, migrations.

## 18. `packages/store`

Files, events, manifests, recovery, hashes, exports.

## 19. `packages/accounting`

Model usage, allocation, wall/human time, local resources, policy snapshots.

## 20. `packages/supervisor-client`

IPC client, framing, native interface, output reads, subscriptions.

## 21. `packages/git`

System Git invocation, worktrees, status, patch, cleanup. No JavaScript Git reimplementation initially.

## 22. `packages/workspace`

Materialization, dependencies, server profiles, ports, readiness.

## 23. `packages/capture`

Playwright, fixtures, Clock, states, screenshots, DOM, accessibility, traces, epochs.

## 24. `packages/gates`

Build, tests, accessibility, protected files, route, content, capture validity.

## 25. `packages/evaluate`

Packets, critics, reversal, selector, human aggregation, controls, metrics.

## 26. `packages/agents`

Common adapter, replay/mock, first real provider, raw events, usage parser.

## 27. `packages/server`

Fastify API, SSE, static dashboard, auth, evidence serving.

## 28. Browser stack

Official Playwright for Node. Initial browser: Playwright-managed Chromium only.

Use Playwright Test for harness integration, dashboard E2E, fixture repositories.

## 29. Accessibility

axe-core through Playwright. No complete WCAG claim.

## 30. Image processing

Sharp for thumbnails, contact sheets, crops, masks, overlays, metadata normalization. Pixel diff is diagnostic, not quality score.

## 31. Server

Fastify current supported major at scaffold. REST for commands/queries; SSE for events. No WebSocket initially.

## 32. Dashboard

React current stable, Vite current stable, TypeScript, CSS Modules, CSS variables. No Next.js.

## 33. Client state

Typed fetch, SSE hook, URL state, local component state. Add query library only when needed.

## 34. Persistence

Files initially; SQLite later as rebuildable index.

## 35. Testing

- TypeScript: compatible stable Vitest.
- Browser: Playwright Test.
- Rust: Cargo test.
- Cross-language: golden protocol fixtures and adversarial tests.

## 36. Lint/format

ESLint, compatible typescript-eslint, React hooks, Prettier, Rustfmt, Clippy.

## 37. No generic workflow framework

Do not add Temporal, Inngest, BullMQ, Redis, LangChain, Mastra, or XState. Domain state machine remains explicit.

## 38. No desktop shell initially

Use `npx visual-optimizer`. Ordinary browser dashboard. Tauri may come later. Electron not planned.

## 39. Agent adapter order

1. replay/mock;
2. one real CLI;
3. second provider only after selector proof;
4. ACP later.

Do not scaffold three unstable providers first.

## 40. First adapter criteria

Choose by current workflow, reliable headless mode, structured events, evidence support, usage reporting, and Windows reliability.

## 41. Distribution

Main npm package plus platform-native packages, e.g.:

```text
@project/visual-optimizer
@project/supervisor-win32-x64
@project/supervisor-linux-x64
@project/supervisor-darwin-arm64
```

Users do not install Rust.

## 42. Native resolution

Bootstrap selects by platform, architecture, libc where needed, and package metadata. Verify integrity metadata.

## 43. Build artifacts

- coordinator JavaScript bundle;
- Rust platform binary;
- static dashboard assets.

## 44. Support matrix

### v0 reference

- Windows x64;
- Node 24 LTS;
- Chromium;
- pnpm/npm repositories;
- one active candidate.

### Experimental

- Linux x64 strong/managed;
- macOS best effort;
- other package managers.

## 45. Benchmark mode

Pinned Linux container, Playwright image, fonts, locale/timezone, fixtures, dependency hashes.

Native product mode remains valid for local A/B.

## 46. Scaffold sequence

### Stage 0 — Documentation gate

Canonical specs/ADRs accepted; old docs archived; source notes recorded.

### Stage 1 — Bootstrap/supervisor spike

JavaScript bootstrap, exact Node, Rust terminal, secure IPC, Windows Job, console isolation, output capture.

### Stage 2 — Doctor

Normal tree, detached child, browser containment, endpoint ownership, Ctrl+C, crash cleanup.

### Stage 3 — Files/state

Session/run manifests, event log, recovery, cleanup result.

### Stage 4 — Repository qualification

Git worktree, materialization, dependencies, build/test, readiness.

### Stage 5 — Capture

One epoch, champion recapture, clock fixture, states, evidence, crash invalidation.

### Stage 6 — Human comparison

Randomized A/B, dimensions, human decision, random/retain/oracle.

### Stage 7 — Model judge

Critics, reversal, selector recommendation, accounting.

### Stage 8 — Personal experiment

One project, multiple challengers, linear and selector conditions.

### Stage 9 — Continuation decision

Stop, pivot, or proceed.

## 47. Solo-maintenance constraint

Minimize provider adapters, platform breadth, concurrency, distributed services, premature standards, and packaging polish.

## 48. Deferrals

- preference learning;
- automatic merge;
- multi-user;
- hosted service;
- public protocol;
- MCP server;
- marketplace;
- parallel search;
- multi-browser judging;
- mobile device lab;
- Figma round trip;
- remote worker fleet.

## 49. Acceptance criteria

Stack is accepted when runtime ownership is unambiguous, exact Node launch specified, terminal policy specified, IPC secure, evidence invalidation specified, platform guarantees explicit, and initial scope solo-buildable.

## 50. Open items

- `OPEN-STACK-001`: package name.
- `OPEN-STACK-002`: first real adapter.
- `OPEN-STACK-003`: Rust libraries.
- `OPEN-STACK-004`: exact scaffold versions.
- `OPEN-STACK-005`: Windows native-package CI.
- `OPEN-STACK-006`: dashboard tokens.
