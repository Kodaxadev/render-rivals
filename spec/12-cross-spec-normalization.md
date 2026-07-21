# 12 — Cross-Spec Normalization and Shared Contracts

**Status:** Canonical implementation contract  
**Purpose:** Remove duplicate authorities for vocabulary, shared types, stable errors, API commands/envelopes, canonical primitives, record invariants, storage paths, process launch, durable operations, Capture evidence, Artifact serving, retention, locks, Session/Run ownership, dashboard authentication, Promotion, Export Operation, and command semantics.

## 1. Authority

When older text conflicts:

1. accepted ADRs control architecture decisions, including ADR-0012’s `promoting` Run phase;
2. `schemas/primitives.ts` and `spec/18` control canonical JSON, hashes, timestamps, decimals, units, and measurement wire formats;
3. `schemas/domain-types.ts` controls shared persisted unions/interfaces;
4. `schemas/error-codes.ts` controls stable error identifiers;
5. `schemas/api-types.ts` controls shared local API command/envelope vocabulary;
6. `schemas/operation-types.ts` and `spec/19` control durable Operation records, states, storage, idempotency, and reconciliation;
7. `docs/RECORD-INVARIANT-MATRIX.md` controls cross-record cardinality/nullability where structure alone is insufficient;
8. `spec/11` controls canonical filesystem and commit protocols except explicit directory/schema amendments in later specs;
9. `spec/13` controls configuration, CLI, local API route inventory, safe mode, and general command semantics;
10. `spec/14` controls Git/source/workspace/branch behavior;
11. `spec/15` controls observability, diagnostics, telemetry, and crash reporting;
12. `spec/16` controls dashboard origin isolation, pairing, cookies, Host/Origin/CSRF, and browser-opening policy;
13. `spec/17` controls API envelopes, operation status projection, revision requirements, pagination, error detail, and Artifact content transport;
14. `spec/20` controls Capture Artifact classes/formats/completeness/evaluator roles;
15. `spec/21` controls Artifact download/preview/active-content security;
16. `spec/22` controls retention/trash/restore/purge/GC/storage admission and no-daemon scheduling;
17. `spec/23` controls OS lock handles, leases, lock order, multi-Session/Project execution ownership, and stale assessment;
18. this file controls equivalence mappings and relative-path interpretation;
19. older local examples are explanatory only and must not be implemented literally.

## 2. Vocabulary

Canonical persisted/API terms:

- current implementation;
- contender;
- candidate;
- Recommendation;
- User Decision;
- Promotion;
- Export Operation;
- `contender_recommended`;
- `current_retained`;
- `tie`;
- `human_review_required`;
- `invalid_run`;
- Run state `promoting` for the candidate-adoption phase.

Explanatory mappings:

| Older/prose term | Canonical meaning |
|---|---|
| champion | current implementation |
| challenger | contender |
| winner | recommended Candidate |
| promote | recommend or create Promotion, depending context |
| escalate | `human_review_required` |
| export evidence/report | Export Operation |
| Run state `exporting` | Run state `promoting` |

Aliases never appear as persisted enum values or stable API names. Promotion entity internal substate `exporting` remains valid because it is scoped to Promotion byte/ref creation.

## 3. Shared primitives, types, errors, API, operations, and invariants

`schemas/primitives.ts` and `spec/18` define:

- full lowercase `sha256:` digests;
- RFC 8785 canonical JSON hash bytes;
- millisecond UTC timestamps;
- canonical decimal strings and `MonetaryAmount`;
- safe integers, revisions, sequences, counts, durations, confidence, units, and canonical paths.

`schemas/domain-types.ts` is sole canonical definition for IDs/prefixes, domain enums/states/purposes, Inference usage, and Recommendation/Decision/Promotion/Export records.

`schemas/error-codes.ts` is sole stable error-code registry.

`schemas/api-types.ts` is sole shared registry for API command names, command/accepted/status/query/page/error envelopes, and API operation projection states.

`schemas/operation-types.ts` is sole shared registry for canonical Operation scope/state/record/result vocabulary.

`docs/RECORD-INVARIANT-MATRIX.md` defines outcome/status-dependent required, nullable, empty, supersession, retry, and terminal-field combinations.

Markdown examples reference rather than redefine these authorities.

## 4. Recommendation, Decision, Promotion, and Export

Recommendation outcomes:

- contender recommended;
- current retained;
- tie;
- human review required;
- invalid Run.

Decision actions:

- accept Recommendation;
- retain current;
- decline Recommendation;
- select another eligible Candidate;
- defer;
- invalidate Run.

Promotion is candidate adoption:

- patch;
- local branch;
- preserved Workspace.

It requires selected Candidate and nonstale authorizing Decision. Run enters `promoting` only for this path.

Export Operation is non-adoption output:

- report;
- diagnostics;
- Run/evidence bundle;
- screenshots;
- configuration template;
- selected logs.

It need not identify Candidate/Decision and does not alter/reopen Run state.

## 5. Inference accounting

Canonical `InferenceUsage` uses canonical timestamps, nonnegative safe-integer token categories or null, `MonetaryAmount | null` rather than floating dollars, and policy snapshot identity. Computed/estimated cost uses exact decimal arithmetic and pricing snapshot hash under `spec/18`.

## 6. Process launch authority

Rust owns authorization, managed root-process creation, containment, observation, resource enforcement, and termination.

Approved contained processes may create descendants only when inheritance is expected and doctor-verified. Playwright-launched Chromium follows this contained-descendant policy.

The MVP does not auto-spawn the user's ordinary dashboard browser. `spec/16` prints randomized dashboard origin and pairing code for manual opening.

## 7. Durable Operation authority

Every accepted side-effecting command has a canonical or Session-scoped Operation under `spec/19`.

- request/payload hashes bind command/target/revision/policy;
- same-ID exact transport replay is idempotent;
- semantic retry creates a new Operation and entity Attempt lineage;
- ambiguous crash state becomes `interrupted` then `reconciling` before proof-based terminalization;
- Operation never replaces Run Events, Decision, Promotion, Export, Process, Cleanup, or side-effect proof;
- spec19 amends spec11 with installation/Project/Run `operations/` directories and `render-rivals/operation` schema.

## 8. Storage, retention, and locks

`spec/11` owns canonical store/write/recovery ordering as amended by later specs. `spec/18` owns value encoding/hashing.

`spec/22` amends data root with trash/maintenance structures and requires:

- reference-aware deletion;
- two-phase Run/Project trash;
- seven-day default grace before purge;
- explicit restore/purge Operations;
- no hidden cleanup daemon or claim of cleanup while app is closed;
- storage admission including temporary/final/reserve/trash bytes;
- no source/external-output deletion or secure-wipe claim.

`spec/23` interprets `lock.json` as metadata, not sole ownership. Reference mutation uses tested OS-held lock/handle plus metadata/identity/revision, global lock order, stale assessment, and one active executing Run per Project across Sessions.

Old `.visual-optimizer`, cache-as-canonical layout, heartbeat-only/PID-only lock ownership, and immediate permanent deletion are superseded.

Any raw `...` digest in older prose is an abbreviated placeholder; executable values use full `sha256:<64 lowercase hex>`.

## 9. Run layout mappings

Canonical Run root:

```text
<data-root>/projects/<project-id>/runs/<run-id>/
```

Later amendments add Operation directories, trash, and maintenance structures.

| Older | Canonical |
|---|---|
| top-level `manifest.json` | `run.json`, `run-config.json`, Artifact manifest |
| top-level `decision.json` | `decisions/<id>.json` |
| `metrics.json` | typed Artifacts/derived projections |
| `accounting.json` | Evaluation/Process usage and derived reports |
| `cleanup.json` | cleanup operation records |
| `raw-output.json` | `raw-output.bin` plus `validation.json` |
| report under Promotion | Export Operation |
| in-memory API operation map | Operation ledger |
| `lock.json` timestamp/PID proves owner | OS lock handle + verified metadata/Session identity |

## 10. Capture evidence and preview

`spec/20` registers complete MVP Capture classes:

- canonical PNG screenshot;
- DOM summary;
- raw YAML ARIA snapshot;
- accessibility findings;
- geometry;
- selected styles;
- console/network summaries;
- interaction trace;
- metadata/volatile-region manifest;
- diagnostic failure screenshot/Playwright trace.

Screenshot alone is never complete. ARIA snapshot is not an accessibility audit. Derived WebP/thumbnails/diffs are rebuildable and cannot replace canonical PNG/evidence.

`spec/21` requires Artifact-ID-only download/preview, attachment/no-sniff for raw content, passive image allowlist, escaped text/structured renderers, and blocks same-origin inline HTML/SVG/PDF/Markdown/trace/archives. Valid bytes do not imply preview safety.

## 11. Gates and failure scope

Gate phases:

- pre-capture;
- runtime/capture;
- post-capture evidence.

Candidate-local failures do not invalidate full Epoch unless browser/environment comparability is compromised. Browser crash/disconnect/identity loss, isolation leak, fixture/environment drift, source mutation during capture, or unscoped required Artifact corruption invalidate full Epoch.

## 12. Session and Run

```text
Supervisor Session
  starting -> authenticating_coordinator -> ready/running -> draining -> completed/crashed
       └── hosts sequential Run operations
             draft -> validating -> ready -> preparing -> capturing
             -> gating -> evaluating -> awaiting_decision -> promoting/terminal
```

Session describes native availability. Run describes durable product work. Run may survive Session. Session end does not automatically make Run terminal.

Dashboard browser authentication is a Session capability and never a Run state.

## 13. Dashboard authentication

`spec/16` supersedes any implication that loopback bind alone authenticates a browser.

- randomized `.localhost` Session origin;
- pairing-only unauthenticated surface;
- one-time terminal code in JSON body, never URL/argv/log;
- host-only HttpOnly SameSite cookie;
- exact Host/Origin/CSRF;
- credential ends with Session;
- safe mode still pairs;
- default browser not auto-spawned.

## 14. CLI/API and re-evaluation

`spec/13` owns filenames, merge rules, CLI commands, route inventory, exit codes, SSE, safe mode, and service-level command semantics.

`spec/17` narrows HTTP shape: closed commands, Operation/revision, resolvable status, canonical/derived envelopes, bounded pagination, registered/redacted errors, and Artifact content transport. Spec19 backs Operation status durably; spec21 narrows safe Artifact rendering.

There is no MVP pause state. Re-evaluation and sealed source/fixture/gate/factor/policy change create superseding Run and new Epoch.

## 15. Database

No canonical database initially. SQLite may later be rebuildable. Deleting it leaves full reconstruction.

## 16. Conformance

Nonconforming behavior includes:

- duplicate shared primitive/type/error/command/Operation registries;
- raw/uppercase/base64 SHA, noncanonical timestamps, unsafe counts, floating persisted currency, cross-language hash drift;
- structurally valid records violating invariant matrix;
- persisted deprecated aliases or Run state `exporting` outside migration/history;
- report Export represented as Promotion or changing Run state;
- invalidating full Epoch for isolated contender failure;
- incomplete/unregistered Capture evidence or ARIA snapshot treated as accessibility audit;
- active Project Artifact rendered same-origin with dashboard privileges;
- in-memory-only durable idempotency or blind external side-effect retry;
- unbounded APIs or dead/secret-bearing operation paths;
- hidden cleanup daemon, silent purge, source deletion, secure-wipe claim;
- heartbeat/PID/file-existence-only lock ownership, out-of-order locks, two active executing Runs for one Project in MVP;
- mutation of sealed Run Configuration;
- Session state trusted as Run state;
- dashboard data before pairing/shared loopback bearer cookie;
- auto-spawn/contain ordinary browser without later decision;
- database required for recovery.
