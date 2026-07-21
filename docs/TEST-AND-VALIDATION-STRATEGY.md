# Render Rivals Test and Validation Strategy

**Status:** Implementation contract for scaffold and release acceptance  
**Purpose:** Convert architecture, failure, security, record-invariant, Operation, Capture, retention, and lock contracts into executable tests, fixtures, fault injection, and platform gates.

## 1. Principles

1. Test observable contracts, not implementation trivia.
2. Every failure and recovery claim has a deterministic fixture.
3. Primitive, schema, Event, hash, state, Operation, and store tests precede UI polish.
4. Windows strong-containment and lock acceptance runs on a real Windows host, not only mocked APIs.
5. Platform limitations are measured test results, not comments.
6. Flaky Capture tests are product failures until the uncontrolled source is identified.
7. Golden fixtures are versioned and reviewed like production code.
8. Tests never mutate a developer's real Project, Git configuration, credentials, source tree, global package cache, or browser profile destructively.
9. Network is denied by default unless a test explicitly owns the local endpoint or recorded provider fixture.
10. No arbitrary sleep passes when an observable condition exists.
11. A document is not accepted as implemented until its required proof exists.
12. Negative tests are first-class: fail-closed behavior must be demonstrated, not inferred.
13. Test secrets use synthetic values and must remain absent from retained output.

## 2. Test layers

### Layer A — Primitive and pure domain

- ID/prefix/ULID validators;
- RFC 8785 canonical values;
- SHA, timestamps, decimals, units, safe integers and overflow;
- state reducers and forbidden transitions;
- Run `promoting` and no general-Export transition;
- Recommendation policy and reason codes;
- Gate dependency graph;
- configuration merge/provenance;
- retry/idempotency/supersession decisions;
- staleness and hash binding;
- Promotion versus Export;
- path normalization pure logic;
- every Record Invariant Matrix row.

Runs on every commit and supported development platform.

### Layer B — Schema and serialization

- Zod/generated JSON Schema agreement;
- valid/invalid primitive, entity, API, Operation, Capture, lock and trash fixtures;
- canonical bytes and cross-language digest;
- strict JSON duplicate-key/UTF-8/number rejection;
- NDJSON complete/torn/corrupt lines;
- migration goldens, including pre-scaffold Run `exporting` to `promoting`;
- unknown-major read-only behavior;
- generated command/Artifact/error registry agreement;
- cross-language protocol fixtures.

### Layer C — Canonical store and Operation ledger

- atomic Artifact/entity/Operation writes;
- Event/snapshot/Operation ordering at every crash point;
- durable acceptance before side effect;
- same-ID exact replay and changed replay rejection;
- interrupted/reconciling Operation recovery;
- proof-based branch/export/process/Artifact/cleanup adoption;
- reconstruction without index;
- orphan/quarantine;
- integrity/recovery reports;
- import/export checksums/redaction;
- Promotion/Export persistence and lineage.

Uses isolated temporary filesystems and fault-injectable adapters.

### Layer D — Lock, retention, and storage maintenance

- OS-held cross-process locks plus metadata;
- global lock order and deadlock stress;
- heartbeat, clock jump, suspend/resume, PID reuse and corrupt metadata;
- multiple Sessions and one active executing Run per Project;
- Project execution lease;
- reference graph and deletion eligibility;
- Run/Project trash, restore, purge and crash reconciliation;
- seven-day grace and nonretroactive policy;
- storage admission, low-disk reserve and no silent purge;
- cache/preserved Workspace ownership;
- no cleanup while app is closed.

### Layer E — Native supervisor

- bootstrap/exact Node;
- endpoint authentication/framing/idempotency;
- process launch/containment;
- browser descendant containment;
- binary output/backpressure/64 MiB limits;
- resource accounting;
- terminal signals;
- listener ownership;
- graceful/forced cleanup;
- coordinator/bootstrap/supervisor loss;
- native proof Artifacts for Operation reconciliation.

### Layer F — Git and Workspace

- source snapshots;
- dirty trees, patches and worktrees;
- LFS, submodules, symlinks, case, Unicode, line endings and modes;
- Workspace drift and protected paths;
- patch/branch Promotion;
- cleanup and active-working-tree safety.

### Layer G — Browser, Capture, Artifact formats, and Gates

- deterministic fixture/state/interaction setup;
- current pinned Playwright Clock;
- current pinned `page.ariaSnapshot`/`locator.ariaSnapshot` raw YAML;
- canonical PNG screenshot options;
- DOM, axe, geometry, computed styles, console, network, interaction and metadata schemas;
- metadata-last Capture commit;
- volatile-region masks/exclusions;
- stability samples;
- Candidate-local versus Epoch-wide failure;
- phased Gates;
- browser crash/disconnect and context leakage;
- redaction, truncation and Artifact limits.

### Layer H — Evaluator and Decision

- command adapter request/result/raw bytes;
- malformed, partial and noisy output;
- citation validation and Artifact allowlist;
- order reversal;
- timeout and cancellation;
- exact token/decimal cost accounting;
- human-only mode;
- deterministic Recommendation;
- Recommendation/Decision supersession and stale authorization.

### Layer I — Local API, pairing, Artifact serving, CLI, and UI

- randomized-host pairing, cookie, Host, Origin, CSRF and CSP;
- only pairing route before authentication;
- closed command registry and command/route agreement;
- Operation status, revisions and replay;
- bounded pagination/filtering;
- SSE resume/gap/refetch;
- safe mode;
- CLI exit/JSON output;
- route guards and legal commands;
- passive image preview and escaped text/JSON/YAML;
- HTML/SVG/PDF/Markdown/trace/archive active-content blocking;
- MIME magic, ranges and filenames;
- keyboard and screen-reader behavior;
- no illegal Pause or post-seal action;
- Promotion/Export separation.

### Layer J — End-to-end acceptance

Clean installation through pairing, Project registration, Run, Capture, Gates, evaluation, Decision, Promotion and general Export, cleanup, restart, recovery, trash/restore and reconstruction.

## 3. Fixture catalog

Every fixture is tiny, deterministic, self-contained, and declares expected state, Events, Artifacts, errors, cleanup, and retention.

### Product fixtures

- `fixture-valid-dashboard`: Vite/TypeScript `/dashboard`, populated/empty/unavailable, desktop/mobile, one interaction, fixed local data/time/randomness, no external network.
- `fixture-contender-material-improvement`: valid material improvement with no protected regression.
- `fixture-contender-no-improvement`: visual change that retains current.
- `fixture-protected-regression`: appealing visual change with keyboard/interaction/accessibility veto.
- `fixture-current-invalid`: invalid current; no retain-current preference outcome.
- `fixture-build-failure`: Contender fails before Capture; current remains qualified.
- `fixture-page-crash`: one local retry succeeds and repeated failure becomes Candidate-local terminal.
- `fixture-browser-disconnect`: full Epoch invalidation.
- `fixture-context-leak`: service worker/storage leak between Candidates.
- `fixture-nondeterministic`: unseeded time/random/animation/server response.

### Store and Operation fixtures

- `fixture-operation-ledger`: accepted/running/reconciling/interrupted/terminal, exact replay and changed replay.
- `fixture-side-effect-reconciliation`: branch/file/process/Artifact/cleanup exact and ambiguous outcomes.
- `fixture-storage-pressure`: no-space, short write, reserve crossing and atomic duplicate-space requirements.
- `fixture-trash-restore-purge`: Run and Project deletion, grace, restore conflict and partial purge.
- `fixture-lock-contention`: two processes/Sessions, stale metadata, live OS lock, PID reuse, clock jump and order inversion.

### Runtime and Git fixtures

- `fixture-stubborn-process`: detached child/listener, ignored graceful signal and PID reuse.
- `fixture-output-flood`: stdout/stderr exact limit, tail opt-in and parser incompleteness.
- `fixture-git-edge-cases`: dirty/binary/CRLF/mode/symlink/case/Unicode/LFS/submodule/shallow/sparse.

### Capture and Artifact fixtures

- `fixture-capture-registry`: all required Capture classes and metadata bindings.
- `fixture-aria-snapshot`: semantic tree, iframe/root/depth and redaction.
- `fixture-capture-truncation`: oversized DOM, ARIA, console, network, screenshot and trace.
- `fixture-artifact-active-content`: HTML, SVG, PDF, Markdown, JS, CSS, source map, archive and Playwright trace payloads attempting same-origin execution.
- `fixture-artifact-media-mismatch`: extension/type/magic/polyglot/decode bombs and dimensions.
- `fixture-artifact-text-safety`: HTML injection, ANSI, bidi controls, duplicate JSON keys, unsafe YAML tags/aliases.

### Evaluator and security fixtures

- `fixture-evaluator-adapter`: valid, malformed JSON, wrong packet hash, invalid citation, missing Factor, nonfinite confidence, timeout, partial write, noisy stdout and reversed conflict.
- `fixture-pairing-attacks`: alternate Host/port, DNS rebinding, CORS/form, expired/reused code, cookie sharing and stolen route IDs.
- `fixture-security-paths`: traversal, symlink/junction escape, archive bomb, malformed media, secret emission.

## 4. Fault injection points

Test-only adapters inject failure:

- before/after Operation acceptance write;
- before/after intent Event;
- before/after external/native side effect;
- before/after proof Artifact;
- before/after completion Event and snapshot;
- before/after Artifact rename and manifest append;
- before/after Capture metadata commit;
- stream short write and torn tail;
- disk reserve crossing/full volume;
- lock acquisition/heartbeat/metadata replacement;
- coordinator or supervisor loss;
- browser disconnect/page crash;
- output backpressure/limit;
- evaluator partial result;
- branch/export result before record;
- trash rename/index/manifest/purge step;
- cleanup failure.

Production binaries do not expose unauthenticated fault controls.

## 5. Primitive and cross-language goldens

Rust and TypeScript consume the same expected canonical bytes and results for:

- RFC 8785 ordering, escaping, numbers and Unicode;
- duplicate-key/invalid UTF-8 rejection;
- raw payload and canonical-value SHA;
- Event hash excluding NDJSON LF;
- full lowercase-prefixed digest validation;
- exact millisecond UTC timestamps;
- safe integer boundaries and overflow;
- revision and sequence starting/increment rules;
- confidence and null;
- canonical decimals and monetary sums;
- token null versus zero;
- byte/MiB conversions;
- canonical paths.

Any mismatch blocks scaffold acceptance.

## 6. State and invariant coverage

Generate tests from declared tables and matrix:

- every allowed and forbidden Run, Candidate, Workspace, Process, Epoch, Capture, Gate, Evaluation, Promotion, Export and Operation transition;
- `awaiting_decision -> promoting -> completed` and destination-conflict return;
- no general Export Run transition;
- terminal no-reopen;
- interrupted/reconciling recovery;
- expected revision conflict;
- duplicate/changing Operation replay;
- stale Recommendation/Decision;
- every Recommendation and Decision cardinality row;
- Promotion/Export terminal timestamp, failure and retry fields;
- Candidate-local failure to deterministic gating;
- full Epoch invalidation.

Transition/invariant source and implementation reducer must have a consistency test.

## 7. Store and recovery crash matrix

For each side-effecting protocol, terminate the process after every durable step and verify recovery:

- Event intent/snapshot/completion;
- Artifact temp, rename, manifest and owner snapshot;
- Operation acceptance, start, effect, proof and terminalization;
- branch creation and commit verification;
- Export destination creation and manifest;
- trash manifest, rename and Project index;
- purge item-by-item failure;
- lock metadata and owner death;
- migration/import adoption;
- cleanup process/listener observations.

Recovery never blindly repeats ambiguous effects and never reports success without exact proof.

## 8. Capture determinism and completeness

Acceptance pins Node, package manager, Playwright/Chromium, fixture dependencies, fonts, locale, time zone, viewport, scale, theme, motion, clock/random, animation/settle, and benchmark OS image.

Validate:

- canonical PNG, not derived WebP/JPEG;
- raw ARIA YAML and separate axe findings;
- DOM, geometry, styles, console, network and interaction;
- Capture metadata references every required committed Artifact;
- no placeholder/empty/truncated Artifact satisfies completeness;
- current and Contender exact option/policy parity;
- masks/exclusions are visible limitations;
- invalid Epoch makes owned evidence unusable without rewriting bytes.

A golden screenshot is diagnostic, never the only assertion.

## 9. Artifact serving security

Tests prove:

- raw content is attachment, no-sniff and no-store;
- active/ambiguous content never runs under dashboard origin or cookie;
- HTML/SVG/PDF/Markdown/trace cannot read API, submit commands or access SSE;
- passive image magic, decoder, dimension, frame and decompression limits;
- escaped text blocks markup, ANSI and bidi abuse;
- strict JSON and safe YAML parsing with size/depth/alias limits;
- filename/header CRLF/path/device-name safety;
- valid and invalid single ranges, overflow and no multipart;
- quarantine/missing/corrupt/deleted not served valid;
- unsupported preview has no raw-navigation fallback;
- CSP is not weakened to support preview.

## 10. Pairing and API tests

- randomized `.localhost` cookie isolation from numeric/plain/other Session hosts;
- pairing code absent from URL, argv, environment, DOM after submit, history, logs and telemetry;
- expiry, single use, bounded failures, logout and Session invalidation;
- application/API/SSE/Artifact unavailable before pairing;
- exact Host, Origin, CSRF and no CORS;
- closed command registry and route mismatch rejection;
- expected-revision matrix;
- accepted status path resolves and contains no secret/full URL;
- Operation states and canonical record agree;
- pagination default/max, deterministic ordering, cursor binding and tamper/expiry;
- no unbounded list endpoint;
- error codes registered and details bounded/redacted;
- content negotiation and body-size limits;
- CLI/API command semantics agree.

## 11. Lock and multi-Session tests

- Windows and maintained Unix cross-process exclusion;
- lock file replacement does not lose ownership;
- exclusive-create-only fixture fails reference requirements;
- global order and same-level sorted multi-lock acquisition;
- heartbeat counter, wall-clock jump, suspend and write failure;
- live lock versus old metadata, owner death and PID reuse;
- corrupt metadata and unknown identity;
- two Sessions read distinct/same Runs;
- mutation rejection for nonowner;
- one active executing Run per Project across Sessions;
- coordinator crash and safe ownership transfer/recovery;
- unsupported network/cloud-sync filesystem blocked or read-only.

## 12. Retention and storage tests

- reference graph preserves every cited/protected/proof Artifact;
- unknown reference fails closed;
- dry-run categories and byte estimates;
- Run and Project atomic trash moves with crash at each step;
- seven-day grace, protection and nonretroactive policy;
- restore ID/path/schema/source/integrity cases;
- purge symlink/junction/open-handle/partial failure;
- no source/external Export deletion and no secure-wipe claim;
- selective Artifact amendment/delete recovery;
- preserved Workspace exclusion;
- storage admission includes temp, final, reserve, trash and uncertainty;
- disk full at every canonical commit point;
- app-closed cleanup does not occur or claim it did;
- startup bounded reconciliation and idle cleanup cancellation;
- logical versus allocated size reporting.

## 13. Security and privacy tests

- loopback and randomized Host only;
- named-pipe/socket permissions and peer identity;
- paths, symlinks, junctions, case and archive safety;
- secret values absent structured logs, Operation records, evaluator packets, exports and test evidence;
- screenshots/DOM/ARIA/network warn on potentially unrecognized sensitive content;
- local evaluator trust warning and no sandbox overclaim;
- unrelated PID/process never killed;
- telemetry/crash off means zero network over extended use;
- diagnostic Export requires review and preserves redaction/omission report.

## 14. Accessibility tests

Automated:

- axe on pairing and authenticated routes plus fixture Candidates;
- keyboard navigation and focus visibility;
- dialogs/traps/return focus;
- live-region throttling;
- no color-only status;
- reduced motion;
- compact-mode labels;
- pairing route at 320 CSS pixels.

Manual:

- screen-reader route, heading and landmark flow;
- current versus Contender identification;
- evidence citations and recovery;
- long logs, tables and drawers;
- active-content download warnings.

Automated checks do not claim complete WCAG conformance.

## 15. Flake policy

- identical immutable inputs producing inconsistent outcome without declared variance is a product flake;
- no blind retry hides a flake;
- quarantine requires owner, issue, reproduction, expiry and nonrelease-blocking justification;
- Capture, recovery, containment, lock and deletion flakes block reference release;
- every failure records seed, versions, capability, Event/Artifact paths and timing.

## 16. Performance and resource budgets

Initial budgets are measured then pinned for:

- bootstrap and pairing readiness;
- idle supervisor/coordinator/dashboard memory;
- Event/Operation append and snapshot replacement;
- canonical JSON and Artifact hashing throughput;
- Capture Artifact volume and processing;
- UI large Event/log/Artifact virtualization;
- cancellation and cleanup;
- trash move, purge and restore;
- lock acquisition and contention;
- disk use per reference Run;
- browser restart and Epoch recapture.

Unbounded memory, disk, output, DOM, preview decode, pagination or cleanup work is a failure.

## 17. CI and host matrix

### Every change

- TypeScript typecheck, lint and pure tests;
- schema/invariant/primitive/API/Operation fixtures;
- canonical store tests;
- Rust format, lint and unit tests;
- protocol and canonical-byte goldens;
- docs link/inventory/registry/route checks;
- context-aware deprecated-token, raw-digest, floating-cost and illegal-control scan.

### Linux CI

- most domain/store/Git/browser/evaluator/API/security tests;
- managed/strong containment only when capability proven;
- no support claim from runner name alone.

### Windows required host

- native package build;
- exact Node/bootstrap;
- Job, console and Ctrl+C;
- browser descendant containment;
- listener ownership;
- named-pipe and file-lock behavior;
- randomized-host pairing in supported browser;
- Candidate cleanup;
- Git path/case/CRLF/worktree;
- full reference E2E.

### macOS experimental

- build, smoke and best-effort diagnostics;
- no strong parity gate.

## 18. Documentation conformance automation

Fail when:

- README or manifest references a missing file;
- canonical specs/shared registries/manifests disagree;
- duplicate primitive, type, ErrorCode, command, Operation state, Artifact class or reason registry appears;
- deprecated persisted terms or Run `exporting` appear outside migration/history allowlist;
- old storage/env/package names appear outside rejection tests/archive;
- raw digest literal is presented as canonical JSON;
- floating persisted cost or ambiguous units appear;
- MVP UI exposes Pause, generation, rounds or illegal post-seal actions;
- Promotion includes report/diagnostic or general Export changes Run state;
- an `OPEN-*` lacks Decision Register entry;
- pairing/route/API inventories differ;
- an API collection is documented unbounded;
- Capture required class is absent from schema/registry;
- active Artifact preview is permitted contrary to spec21;
- Operation status has no ledger state;
- trash/lock layout or rules drift;
- telemetry/public claims exceed implementation.

Archive, migration fixtures and historical ADR quotations use explicit allowlists.

## 19. Release gates

### Scaffold complete

- primitive/schema/reducer/API/Operation/store foundations pass;
- RFC 8785 cross-language goldens pass;
- native Windows spike proves ownership, lock and cleanup;
- pairing, CLI and API shell work;
- Capture Artifact registry and safe preview foundations work;
- no unresolved unclassified architecture decisions.

### MVP alpha

- full reference golden path;
- all P0 failure and security fixtures;
- no known integrity, security or active-content critical defect;
- no illegal UI command;
- Operation recovery, cleanup and retention verified;
- install/package smoke test;
- license status represented honestly.

### Public/OSS release

Additionally:

- real license;
- contribution and security policies;
- signed/checksummed packages as required;
- documented support matrix;
- reproducible release notes, SBOM and third-party notices;
- external-user install, security, recovery and deletion validation.

## 20. Test evidence

Every E2E retains:

- component/tool versions and capability report;
- fixture/source/config/policy hashes;
- test seed;
- Events, Operations and relevant Artifacts;
- failure code and bounded log ranges;
- cleanup, lock and storage result;
- environment identifier;
- CI/job link when available.

Test evidence follows retention/redaction policy and contains no real secrets.
