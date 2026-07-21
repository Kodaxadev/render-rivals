# 12 — Cross-Spec Normalization and Shared Contracts

**Status:** Canonical implementation contract  
**Purpose:** Remove duplicate authorities for vocabulary, shared types, stable errors, API commands/envelopes, canonical primitives, record invariants, storage paths, process launch, durable operations, Capture evidence, Artifact serving, retention, locks, secrets/network, upgrades, Session/Run ownership, Promotion, Export Operation, and command semantics.

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
13. `spec/17` controls API envelopes, Operation status projection, revision requirements, pagination, error detail, and Artifact content transport;
14. `spec/20` controls Capture Artifact classes, formats, completeness and evaluator roles;
15. `spec/21` controls Artifact download, preview and active-content security;
16. `spec/22` controls retention, trash, restore, purge, GC, storage admission and no-daemon scheduling;
17. `spec/23` controls OS lock handles, leases, lock order, multi-Session and Project execution ownership;
18. `spec/24` controls secret references/bindings, browser authentication state, external transmission and truthful network-egress capability;
19. `spec/25` controls component compatibility, schema migration, backup, adoption, rollback and downgrade;
20. this file controls equivalence mappings and relative-path interpretation;
21. older local examples are explanatory only and must not be implemented literally.

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
- Run state `promoting` for candidate adoption.

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

## 3. Shared registries and invariants

- `schemas/primitives.ts`/spec18: digests, JCS canonical JSON, timestamps, decimals, money, safe counts, durations, confidence, units, paths.
- `schemas/domain-types.ts`: IDs, domain enums/states/purposes and Recommendation, Decision, Promotion, Export records.
- `schemas/error-codes.ts`: stable errors.
- `schemas/api-types.ts`: closed API commands and envelopes.
- `schemas/operation-types.ts`: durable Operation scope/state/record/result.
- Record Invariant Matrix: outcome/status-dependent required, nullable, empty, supersession, retry and terminal combinations.

Markdown examples reference rather than redefine these authorities.

## 4. Recommendation, Decision, Promotion, and Export

Recommendation outcomes are the canonical five. Decision actions are the canonical six. Export is not a Decision action.

Promotion is candidate adoption through patch, local branch, or preserved Workspace. It requires selected Candidate and nonstale authorizing Decision. Run enters `promoting` only for this path.

Export Operation produces report, diagnostics, bundles, screenshots, configuration or logs. It need not identify Candidate/Decision and does not alter or reopen Run state.

## 5. Inference accounting

Canonical `InferenceUsage` uses canonical timestamps, nonnegative safe-integer token categories or null, `MonetaryAmount | null` rather than floating dollars, and Policy Snapshot identity. Computed or estimated cost uses exact decimal arithmetic and pricing snapshot hash.

## 6. Process launch and browser ownership

Rust owns authorization, managed root-process creation, containment, observation, resource enforcement and termination. Approved contained processes may create descendants only when inheritance is expected and doctor-verified.

The ordinary dashboard browser is manually opened and not contained/terminated by Render Rivals in MVP. Spec16 prints the randomized Session origin and pairing code.

## 7. Durable Operation authority

Every accepted side-effecting command has a canonical or Session-scoped Operation under spec19.

- request/payload hashes bind command, target, revision and policy;
- exact transport replay is idempotent;
- semantic retry creates new Operation and entity Attempt lineage;
- ambiguous crash state becomes `interrupted` then `reconciling` before proof-based terminalization;
- Operation never replaces Events, Decision, Promotion, Export, Process, Cleanup or side-effect proof;
- installation, Project and Run `operations/` directories and `render-rivals/operation` schema amend spec11.

## 8. Storage, retention, and locks

Spec11 owns canonical store/write/recovery ordering as amended by later specs. Spec18 owns encoding and hashing.

Spec22 requires reference-aware two-phase trash, seven-day default grace, restore/purge Operations, no cleanup while the app is closed, storage admission including temporary/final/reserve/trash bytes, no source/external-output deletion, and no secure-wipe claim.

Spec23 interprets lock metadata as diagnostic/coordination data, not sole ownership. Reference mutation requires a tested OS-held lock/handle plus metadata, identity, revision, global lock order and stale assessment. MVP permits at most one active executing Run per Project across Sessions.

Old cache-as-canonical layouts, heartbeat/PID/file-existence-only lock ownership, and immediate permanent deletion are superseded.

## 9. Capture evidence and Artifact preview

Spec20 registers canonical PNG screenshot plus DOM, raw YAML ARIA snapshot, axe findings, geometry, selected styles, console, network, interaction, metadata, volatile-region and diagnostic classes. Screenshot alone is never complete; ARIA snapshot is not an accessibility audit; derived images never replace evidence.

Spec21 requires Artifact-ID-only access, attachment/no-sniff raw download, passive image allowlist, escaped text/JSON/YAML renderers, and blocks same-origin inline HTML, SVG, PDF, Markdown, trace and archives. Valid digest does not imply preview safety.

## 10. Secrets and network

Spec24 supersedes any implication that a secret reference contains a value or that browser routing makes Project processes network-isolated.

- raw secret values are Session bindings only and never canonical, logged, hashed, exported, placed in URLs/argv or returned by API;
- per-process environment is explicit allowlist, not wholesale inheritance;
- browser cookies/storage/auth state are ephemeral Session material and not canonical Artifacts;
- Capture/evaluator transmission of potentially sensitive Artifacts requires declared policy and acknowledgement;
- strict browser HTTP enforcement blocks Service Workers by default and uses separate WebSocket capability;
- Project server/build/test/fixture/local-evaluator process egress is uncontrolled or observed-only in native MVP, never called sandboxed;
- external provider client can enforce its approved endpoint/TLS/redirect/body policy;
- authentication fixture failure is not Product error-state evidence.

## 11. Upgrades and migrations

Spec25 supersedes any assumption that package install or first launch may mutate canonical data automatically.

- component compatibility is verified before data mutation;
- unsupported/newer data opens read-only or refuses safely;
- migration uses durable Operation, locks, storage admission, source inventory, protected backup and separate staging;
- transformed aggregate reconstructs and verifies before atomic adoption;
- original remains rollback backup, default at least fourteen days for public alpha;
- rollback never silently discards post-migration data;
- downgrade does not rewrite unknown newer schemas;
- browser upgrade never rewrites historical Capture;
- no Project-supplied migration code or hidden network migration.

## 12. Run layout mappings

Canonical Run root:

```text
<data-root>/projects/<project-id>/runs/<run-id>/
```

Later specs add Operation, trash, maintenance and migration structures.

| Older | Canonical |
|---|---|
| top-level `manifest.json` | `run.json`, `run-config.json`, Artifact manifest |
| top-level `decision.json` | `decisions/<id>.json` |
| `metrics.json` | typed Artifacts or derived projections |
| `accounting.json` | Evaluation/Process usage and derived reports |
| `cleanup.json` | cleanup Operation/records |
| `raw-output.json` | `raw-output.bin` plus validation record |
| report under Promotion | Export Operation |
| in-memory API Operation map | durable Operation ledger |
| `lock.json` timestamp/PID proves owner | OS lock handle plus verified metadata/Session identity |
| persisted browser storage state | ephemeral Session authentication state |
| install-time/automatic migration | explicit staged migration Operation and backup |

Any raw `...` digest in older prose is an abbreviated placeholder; executable values use full `sha256:<64 lowercase hex>`.

## 13. Gates and failure scope

Gate phases are pre-capture, runtime/capture and post-capture evidence.

Candidate-local failure does not invalidate the full Epoch unless browser/environment comparability is compromised. Browser crash/disconnect/identity loss, isolation leak, fixture/environment drift, source mutation during Capture or unscoped required Artifact corruption invalidate full Epoch.

## 14. Session, Operation, and Run

```text
Supervisor Session
  starting -> authenticating_coordinator -> ready/running -> draining -> completed/crashed
       └── hosts sequential Operations and Run work
             draft -> validating -> ready -> preparing -> capturing
             -> gating -> evaluating -> awaiting_decision -> promoting/terminal
```

Session describes native availability, Operation describes one side effect, and Run describes durable analytical work. Browser authentication is a Session capability, never Run state.

## 15. Dashboard authentication and API

Spec16 requires randomized `.localhost` origin, pairing-only unauthenticated surface, one-time terminal code in request body, host-only HttpOnly SameSite cookie, exact Host/Origin/CSRF, Session-bounded credential, safe-mode pairing and no automatic browser spawn.

Spec17 requires closed commands, Operation/revision, resolvable status backed by spec19, canonical/derived envelopes, bounded opaque pagination, registered/redacted errors and safe Artifact transport narrowed by spec21.

No MVP Pause state exists. Re-evaluation or sealed source, fixture, Gate, factor or policy change creates superseding Run and new Epoch.

## 16. Database

No canonical database initially. SQLite may later be rebuildable. Deleting it leaves full reconstruction.

## 17. Conformance

Nonconforming behavior includes:

- duplicate shared primitive/type/error/command/Operation registries;
- raw/uppercase/base64 SHA, noncanonical timestamps, unsafe counts, floating persisted currency or cross-language hash drift;
- structurally valid records violating the invariant matrix;
- persisted deprecated aliases or Run state `exporting` outside migration/history;
- report Export represented as Promotion or changing Run state;
- incomplete/unregistered Capture evidence or ARIA snapshot treated as accessibility audit;
- active Project Artifact rendered same-origin with dashboard privileges;
- in-memory-only durable idempotency or blind external side-effect retry;
- unbounded APIs or dead/secret-bearing Operation paths;
- hidden cleanup daemon, silent purge, source deletion or secure-wipe claim;
- heartbeat/PID/file-existence-only lock ownership, out-of-order locks, or two active executing Runs for one Project in MVP;
- plaintext secret/auth state in canonical/log/export or wholesale environment inheritance;
- claiming browser routing controls server/process egress;
- Service Worker/WebSocket traffic silently outside strict policy;
- automatic/in-place/only-copy migration, downgrade rewrite or rollback that discards new data;
- mutation of sealed Run Configuration;
- Session state trusted as Run state;
- dashboard data before pairing or shared loopback bearer cookie;
- auto-spawn/contain ordinary browser without later decision;
- database required for recovery.
