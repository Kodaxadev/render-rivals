# Render Rivals Test and Validation Strategy

**Status:** Implementation contract for scaffold and release acceptance  
**Purpose:** Convert architectural invariants into executable tests, fixtures, fault injection, and platform acceptance gates.

## 1. Principles

1. Test observable contracts, not implementation trivia.
2. Every failure/recovery claim has a deterministic fixture.
3. Canonical schema, event, hash, and state tests precede UI polish.
4. Windows strong-containment acceptance runs on a real Windows host, not only mocked APIs.
5. Platform limitations are test results, not comments.
6. Flaky capture tests are product failures until the uncontrolled source is identified.
7. Golden fixtures are versioned and reviewed like production code.
8. Tests never mutate the developer's real Project, Git configuration, credentials, or global package cache destructively.
9. Network use is disabled by default in tests unless the test explicitly owns a local server or recorded provider fixture.
10. No test passes by sleeping for an arbitrary duration when an observable condition exists.

## 2. Test layers

### Layer A — Pure domain

- ID and enum validators;
- state reducers and forbidden transitions;
- Recommendation policy;
- Gate dependency graph;
- configuration merge/provenance;
- retry/idempotency decisions;
- staleness and hash binding;
- Promotion versus Export Operation;
- path normalization pure logic.

Runs on every commit and platform.

### Layer B — Schema and serialization

- Zod and generated JSON Schema agreement;
- valid/invalid fixtures;
- canonical JSON bytes/hash;
- NDJSON complete/torn/corrupt lines;
- migration golden fixtures;
- unknown major read-only behavior;
- exact ID prefix/ULID validation;
- cross-language protocol fixtures.

### Layer C — Canonical store

- atomic Artifact/entity writes;
- event/snapshot ordering crash points;
- reconstruction without index;
- locks and stale ownership;
- orphan/quarantine;
- retention/deletion reachability;
- import/export checksums/redaction;
- Promotion and Export Operation persistence.

Uses isolated temporary filesystems and fault-injectable adapters.

### Layer D — Native supervisor

- bootstrap/exact Node;
- endpoint authentication/framing/idempotency;
- process launch/containment;
- binary output/backpressure/limits;
- resource accounting;
- terminal signals;
- listener ownership;
- graceful/forced cleanup;
- coordinator/bootstrap/supervisor loss.

### Layer E — Git/workspace

- source snapshots;
- dirty trees, patches, worktrees;
- LFS/submodules/symlinks/case/line endings/modes;
- branch Promotion;
- cleanup and active-worktree safety.

### Layer F — Browser/capture/gates

- fixture/state/interaction setup;
- contained Chromium descendants;
- stability samples;
- candidate-local versus Epoch-wide failure;
- capture matrix and Artifact commit;
- phased Gates;
- browser crash/disconnect;
- context leakage;
- deterministic clock/random/locale/fonts.

### Layer G — Evaluator

- command adapter request/result;
- malformed/partial/noisy output;
- citation validation;
- order reversal;
- timeout/cancel;
- usage accounting;
- human-only mode;
- deterministic Recommendation.

### Layer H — Local API/CLI/UI

- authentication/CSRF/Origin/CSP;
- command idempotency/revision conflict;
- SSE resume/gap/refetch;
- safe mode;
- CLI exit/JSON output;
- route guards;
- keyboard/accessibility;
- no illegal Pause/post-seal actions;
- Promotion/Export separation.

### Layer I — End-to-end acceptance

Clean installation through Project registration, Run, capture, Gate, evaluation, Decision, Promotion/Export, cleanup, restart, and reconstruction.

## 3. Fixture repository catalog

Each fixture is tiny, deterministic, and has a declared expected result.

### `fixture-valid-dashboard`

- Vite/TypeScript;
- `/dashboard`;
- populated, empty, unavailable states;
- desktop/mobile;
- one filter/submit interaction;
- deterministic local data/time/randomness;
- no external network.

### `fixture-contender-material-improvement`

Valid current and materially stronger Contender with no protected regression.

### `fixture-contender-no-improvement`

Visually different but policy should retain current.

### `fixture-protected-regression`

Stronger visual treatment but broken keyboard/interaction/required state.

### `fixture-build-failure`

Contender build fails; current remains qualified; deterministic retention without full Epoch recapture.

### `fixture-current-invalid`

Current build/readiness/state fails; no retain-current outcome allowed.

### `fixture-page-crash`

First Contender page crashes, second context succeeds; then variant crashes repeatedly.

### `fixture-browser-disconnect`

Chromium disconnects during current and during Contender; full Epoch invalidation.

### `fixture-context-leak`

Candidate-local storage/service worker leak intentionally crosses context to prove detection.

### `fixture-nondeterministic`

Unseeded time/random/animation/server value to exercise stability failure and volatile exclusions.

### `fixture-storage-pressure`

Large output/Artifact with injected no-space and short-write behavior.

### `fixture-stubborn-process`

Detached child/listener, ignored graceful signal, PID reuse simulation.

### `fixture-git-edge-cases`

Subfixtures for dirty/binary/CRLF/mode/symlink/case/LFS/submodules/shallow/sparse.

### `fixture-evaluator-adapter`

Modes: valid, malformed JSON, wrong packet hash, invalid citation, missing Factor, nonfinite confidence, timeout, partial write, noisy stdout, conflicting order result.

### `fixture-security-paths`

Traversal, symlink/junction escape, archive bomb, malformed media, CSP injection, secret emission.

## 4. Fault injection points

The implementation exposes test-only injected failures behind nonproduction adapters:

- before/after intent append;
- before/after side effect;
- before/after completion event fsync;
- before/after summary temp write/replace;
- before/after Artifact rename/manifest append;
- stream short write/torn tail;
- disk reserve crossing;
- coordinator crash;
- supervisor connection loss;
- browser disconnect/page crash;
- process output backpressure;
- evaluator result partial write;
- export/branch side effect before record;
- cleanup failure.

Production binaries do not expose unauthenticated fault controls.

## 5. State-machine coverage

Generate tests from a declared transition table:

- every allowed Run/Candidate/Workspace/Process/Epoch/Capture/Gate/Evaluation/Promotion/Export transition;
- every forbidden pair;
- expected revision conflict;
- terminal no-reopen;
- interrupted recovery target;
- duplicate operation ID;
- changed replay rejection;
- stale Decision/Recommendation;
- candidate-local failure to gating;
- full Epoch invalidation.

The declared table and implementation reducer must not be maintained independently without a consistency test.

## 6. Schema compatibility

For every schema version:

- valid fixture accepted by TypeScript/Zod and generated JSON Schema validator;
- invalid fixture rejected with stable path/code;
- canonical round-trip preserves meaning;
- unknown extensions preserved only where allowed;
- previous supported minor read successfully;
- unknown major read-only;
- migration deterministic and idempotent on already-migrated input;
- migration failure leaves original bytes.

## 7. Protocol compatibility

Golden frames are consumed by Rust and TypeScript implementations.

Test:

- valid major/minor negotiation;
- incompatible major;
- missing required capability;
- malformed/oversize/duplicate/decreasing frames;
- operation replay;
- binary output offsets;
- unknown method/property;
- peer/session identity failures.

## 8. Capture determinism

Acceptance environment pins:

- Node/package manager;
- Playwright/Chromium;
- fixture dependencies;
- fonts;
- locale/time zone;
- viewport/device scale;
- theme/reduced motion;
- clock/random seed;
- animation/settle policy;
- OS image where benchmarked.

A golden screenshot is diagnostic, not the only assertion. Validate DOM, text, accessibility, geometry, styles, console, network, and metadata.

Expected visual changes require explicit fixture review and regenerated hashes with rationale.

## 9. Flake policy

- A test is flaky when identical immutable inputs produce inconsistent pass/fail without declared variance.
- Do not add blind retries to hide flakes.
- Quarantine only with owner, issue, reproduction, expiry, and nonrelease-blocking justification.
- Capture/recovery/containment flakes block reference release.
- Record seed, versions, host capability, event/log paths, and timing on every failure.

## 10. Security tests

- dashboard loopback only;
- cookie/Origin/CSRF/CSP;
- token absent URLs/logs/argv;
- named-pipe/socket permissions and peer identity;
- path traversal/symlink/junction/case collisions;
- Artifact MIME/download handling;
- malicious HTML/SVG in previews rendered safely;
- evaluator prompt-injection output rejected when schema/citations break;
- secrets absent structured logs/export/packet;
- local evaluator trust warning;
- archive import decompression/path limits;
- branch/export destination conflicts;
- unrelated PID/process never killed.

## 11. Accessibility tests

Automated:

- axe on dashboard routes and fixture Candidate pages;
- keyboard navigation and focus visibility;
- dialogs/traps/return focus;
- live-region throttling;
- no color-only status;
- reduced motion;
- compact-mode labels.

Manual acceptance:

- screen-reader route/heading/landmark flow;
- side-by-side Candidate identification;
- evidence citations and error recovery;
- long logs/tables/drawers.

Automated checks do not claim full WCAG conformance.

## 12. Performance and resource budgets

Initial budgets are measured during scaffold and then pinned:

- bootstrap-to-dashboard-ready;
- idle coordinator/dashboard memory;
- supervisor overhead;
- event append and snapshot replacement latency;
- Artifact hashing throughput;
- UI responsiveness with large event/log sets;
- cancellation/cleanup latency;
- disk use per reference Run;
- browser restart/Epoch recapture time.

A budget breach is reported with environment and trend. Quality correctness takes priority over premature micro-optimization, but unbounded memory/disk/output is a failure.

## 13. CI matrix

### Every change

- TypeScript typecheck/lint/unit;
- schema fixtures;
- pure store tests;
- Rust format/lint/unit;
- protocol goldens;
- docs link/inventory checks;
- no stale/deprecated token scan.

### Linux CI

- most application/store/Git/browser/evaluator tests;
- Linux managed/strong only when runner capability is explicitly proven;
- no claim based solely on CI host name.

### Windows required CI/host

- native package build;
- exact Node/bootstrap;
- Job Object/console/Ctrl+C;
- browser descendant containment;
- listener ownership;
- candidate-local cleanup;
- Git path/case/CRLF/worktree;
- full reference E2E.

### macOS experimental

- build/smoke/best-effort diagnostics;
- no strong parity gate.

## 14. Documentation conformance automation

Create a repository script that fails when:

- README/manifest references missing files;
- duplicate canonical type names are declared outside approved schema source;
- deprecated persisted terms appear in active specs/code;
- old `.visual-optimizer`, `VISOPT_`, or visual-optimizer package paths appear outside archive/tests documenting rejection;
- MVP UI documents expose `Pause`, generation, rounds, or illegal post-seal mutations as enabled;
- Promotion includes report/diagnostic kinds;
- an `OPEN-*` marker lacks a Decision Register entry;
- route inventory/wireframe differ;
- schema registry list differs from generated schemas.

Archive and historical ADR quotations are allowlisted explicitly.

## 15. Release gates

### Scaffold complete

- schemas/reducers/protocol/store foundational tests pass;
- native Windows spike proves ownership/cleanup;
- config/CLI/API shell works;
- no unresolved unclassified open decisions.

### MVP alpha

- full reference golden path;
- all P0 failure fixtures;
- no known integrity/security critical defects;
- no illegal UI commands;
- cleanup verified;
- install/package smoke test;
- license status represented honestly.

### OSS/public release

Additionally:

- real license selected;
- contribution/security policies;
- signed/checksummed packages as required;
- documented support matrix;
- reproducible release notes/SBOM/third-party notices;
- external-user fixture validation.

## 16. Test evidence

Every E2E run retains:

- component/tool versions;
- capability report;
- fixture/source hashes;
- test seed;
- events and relevant Artifacts;
- failure code/log ranges;
- cleanup result;
- environment identifier;
- CI/job link when available.

Test evidence follows retention/redaction policy and never includes real secrets.
