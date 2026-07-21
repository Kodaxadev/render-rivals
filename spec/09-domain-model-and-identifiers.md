# 09 — Domain Model and Identifiers

**Status:** Canonical implementation contract  
**Scope:** Entity meaning, identifiers, ownership, relationships, mutability, and invariants  
**Shared persisted types:** `schemas/domain-types.ts`  
**Storage:** `spec/11-artifact-event-and-schema-contracts.md`  
**Lifecycle:** `spec/10-run-and-candidate-state-machines.md`

## 1. Purpose

Render Rivals is reconstructable from canonical files and append-only Events. Coordinator, supervisor protocol, CLI, UI, evaluators, reports, and export tooling therefore share one domain vocabulary and identifier registry.

This specification defines entity meaning and ownership. It does not redefine shared unions from `schemas/domain-types.ts`.

## 2. Canonical terms

- **current implementation:** qualified reference implementation;
- **Contender:** alternate implementation under evaluation;
- **Candidate:** current implementation or Contender;
- **Run:** one execution attempt of one sealed Run Configuration;
- **Capture Epoch:** browser/environment validity boundary;
- **Gate:** eligibility rule;
- **Evidence:** cited conclusion derived from verified Artifacts;
- **Recommendation:** deterministic policy conclusion;
- **User Decision:** explicit human response;
- **Promotion:** adoption handoff for a selected Contender;
- **Export Operation:** non-adoption output such as report, diagnostics, or portable bundle.

Explanatory aliases are mapped by `spec/12`. `champion`, `challenger`, `winner`, `battle`, `promote`, and `escalate` are forbidden as persisted enum values or stable API names.

## 3. Identifier format

Entity and durable operation IDs use:

```text
<prefix>_<26-character-lowercase-ulid>
```

IDs are opaque, locally generated, immutable, never reused, never derived from labels, and compared case-sensitively. Runtime validators enforce exact prefix and ULID character/length rules.

Content hashes identify bytes. Entity IDs identify records. They are not interchangeable.

## 4. Prefix registry

| Entity or durable operation | Prefix |
|---|---|
| Project | `prj` |
| Project Trust Record | `trt` |
| Project Template | `tpl` |
| Source Snapshot | `src` |
| Supervisor Session | `ses` |
| Run | `run` |
| Run Configuration | `rcf` |
| Policy Snapshot | `pol` |
| Candidate | `can` |
| Candidate Workspace | `wsp` |
| Capture Epoch | `cep` |
| Capture Plan | `cpl` |
| Capture | `cap` |
| Gate Definition | `gat` |
| Gate Result | `grs` |
| Evaluation Factor | `fac` |
| Evaluation | `eva` |
| Evidence Record | `evd` |
| Comparison | `cmp` |
| Recommendation | `rec` |
| User Decision | `dec` |
| Promotion | `pro` |
| Export Operation | `exp` |
| Artifact | `art` |
| Process Group | `grp` |
| Process Record | `pcs` |
| Cleanup Operation | `cln` |
| Event | `evt` |
| Command/side-effect Operation | `op` |

Diagnostic bundles are output Artifacts owned by an Export Operation, not a second diagnostic entity type.

New prefixes require a specification and shared-type amendment.

## 5. Common envelope

Persisted entities include:

- schema and schema version;
- prefixed ID;
- creation time;
- update time when mutable;
- owning Project/Run/Session where applicable;
- lifecycle state where applicable;
- monotonic revision for mutable summaries;
- namespaced extensions only where allowed.

Unknown top-level fields are rejected by writers. Supported extensions cannot alter core semantics.

## 6. Aggregate boundaries

### Installation aggregate

Owns installation metadata, user configuration, active/known Sessions, and installation-scoped Export Operations.

### Project aggregate

Owns registration, Trust Records, Source Snapshots, Templates, Project-scoped Export Operations, and Run index references. It never owns or deletes the source repository.

### Session aggregate

Owns transient authenticated supervisor/coordinator lifetime, native capability report, managed Process Groups, and native observations. A Session may host sequential Run operations; a Run may survive a Session.

### Run aggregate

Owns sealed Run Configuration and Policy Snapshot, Candidates/Attempts, Workspaces, Process Groups/Records, Capture Plan/Epochs/Captures, Gates, Comparisons, Evaluations, Evidence, Recommendations, Decisions, Promotions, Run-scoped Export Operations, Artifacts, Events, Cleanup, Integrity, and Recovery records.

A Run does not consume mutable evidence from another Run. Selectable evidence is recaptured in the active Run.

## 7. Project Trust, Template, and Source Snapshot

A Project Trust Record captures repository identity, command preview/policy identity, accepted actor/time, capability context, and revocation. Material command or repository-identity change may require renewal.

A Project Template is mutable planning data used to create a draft Run. It is not a sealed Run Configuration and cannot make historical evidence change meaning.

A Project records identity/fingerprint, normalized root, source-control metadata, configuration path, trust status, capabilities, and timestamps.

A Source Snapshot is immutable and records source kind, commit/branch provenance, dirty patch, file manifest, lockfile/configuration hashes, exclusions/symlink policy, and creation time. Moving source requires explicit relinking. Changed bytes create a new Snapshot.

## 8. Session, Policy Snapshot, and Operation

A Supervisor Session records component builds, exact Node identity, endpoint/protocol metadata without secret values, containment/capability report, start/end, and terminal classification.

A Policy Snapshot binds Gate, evaluation, security, redaction, retry, resource, and output policy used by a Run/Evaluation/Export. It is immutable and referenced by typed `PolicySnapshotId` fields.

An `OperationId` identifies one idempotent side-effect command across API, Event, native supervisor, recovery, Promotion, Export, or cleanup. It is not reused with a changed canonical payload.

## 9. Run Configuration and Run

A Run Configuration is the fully resolved immutable contract for source inputs, route/origin, fixture/states/viewports/interaction, commands, readiness/settle, Gates, protected dimensions, evaluation policy, limits, retry, storage, retention, security, and output policy.

The wizard edits a draft. Successful validation seals a new Run Configuration. Later changes create a superseding Run.

A Run references exactly one current Candidate and, in MVP, exactly one Contender. It records state, active Epoch, latest Recommendation/Decision, checkpoint, recovery disposition, and terminal/failure details. A terminal Run never reopens.

## 10. Candidate, Attempt, Workspace, Process Group, and Process

A Candidate has immutable role/ordinal and Source Snapshot, effective Attempt/Workspace, eligibility, Gate Results, Captures, source-difference summary, and failure details.

A Candidate Attempt records one materialization/execution/capture attempt. Retries never overwrite history.

A Candidate Workspace is an owned disposable materialization outside the active working tree. It records method, manifest, verification, and cleanup state.

A Process Group is a logical/native ownership and cleanup boundary tied to Session and optionally Run/Candidate. It records purpose, containment capability, active/termination state, and member Process Records.

A Process Record describes one supervisor-managed root process and records purpose, executable identity, redacted args/environment, working directory, native identity, PID as observation only, containment, lifecycle/exit, output/usage Artifacts, and endpoint observations.

Approved contained descendants are attributed through owning group/root process but need not each have a managed-root command record unless policy requires it.

## 11. Capture Plan, Epoch, and Capture

A Capture Plan freezes Candidate order, route, states, viewports, interaction, fixture/environment, readiness/settle, browser requirement, Artifact classes, and equivalence rules.

A Capture Epoch records Run/Plan, browser executable/version/process identity, Playwright version, environment/fixture hashes, ordered capture groups, state, reasons, and timestamps.

Browser crash/disconnect/identity loss or wider environment corruption invalidates the complete Epoch permanently. Candidate-local failure alone does not.

A Capture represents one Candidate, route, state, viewport, and optional interaction step. Validity requires all configured Artifacts and matching source/fixture/browser/environment/Epoch identity.

## 12. Gates

A Gate Definition is immutable within a sealed Run and declares phase, subject type, severity, evidence dependencies, retry policy, and blocking behavior.

A Gate Result is one append-only Attempt with state, observations, citations, timestamps, effect, and supersession link.

Required effective failure/error makes a Contender ineligible. Current failure invalidates baseline.

## 13. Evaluation model

An Evaluation Factor declares stable key, definition, weight, required evidence, confidence, limitations, tie policy, and protected status.

A Comparison binds exactly two Candidates and one valid evidence set, including Epoch, capture pairs, interactions, eligibility, environment fingerprint, validity, and Evaluation Attempts.

An Evaluation records adapter/provider/model, immutable input manifest, raw and normalized output, validation, Factor Evidence, limitations, Attempt history, and `InferenceUsage`.

An Evidence Record is immutable and includes Factor, `PairwiseVerdict`, confidence/null, rationale, Artifact/region/interaction citations, limitations, and validator status.

Every citation belongs to the same Run, verifies hash, and appears in immutable input packet.

## 14. Recommendation

A Recommendation uses `RecommendationRecord` and one of:

- `contender_recommended`;
- `current_retained`;
- `tie`;
- `human_review_required`;
- `invalid_run`.

Only deterministic policy creates it after Gate, Evidence, order, protected-regression, and staleness validation. It is immutable, advisory, and never changes source.

## 15. User Decision

A User Decision uses `UserDecisionRecord` and one of:

- `accept_recommendation`;
- `retain_current`;
- `decline_recommendation`;
- `select_other_eligible_candidate`;
- `defer`;
- `invalidate_run`.

It binds to Recommendation, Evidence, source, and Policy hashes. Changed inputs make it stale. Export is not a Decision action.

## 16. Promotion

A Promotion uses `PromotionRecord` and represents adoption handoff for a selected eligible Contender:

- patch export;
- local branch creation;
- Workspace preservation.

It always references Candidate and nonstale authorizing Decision. It does not mean merge, push, checkout over active tree, deployment, or report export.

## 17. Export Operation

An Export Operation uses `ExportOperationRecord` and creates non-adoption output:

- report;
- diagnostic bundle;
- portable Run bundle;
- Evidence bundle;
- screenshots;
- configuration template;
- selected logs.

It may be installation-, Project-, or Run-scoped, need not identify Candidate, and does not imply acceptance. It records redaction, omissions, source entities, output Artifacts, and verification.

A Contender patch/adoption branch is Promotion, not general Export Operation.

## 18. Cleanup Operation, Artifact, and Event

A Cleanup Operation records scope/targets, Attempt, graceful/forced phases, remaining processes/endpoints/Workspaces, verification, Artifacts, and completion/incomplete status. Cleanup history is append-only or superseding; it is not hidden by business completion.

An Artifact is an immutable registered payload with owner, class, path, media type, length, SHA-256, validity, sensitivity, retention, operation, and provenance.

An Event is one immutable fact with contiguous sequence/hash-chain linkage. Requested action and observed outcome are separate Events.

## 19. Relationship summary

```text
Installation
  ├─ Session*
  └─ ExportOperation*

Project
  ├─ TrustRecord*
  ├─ SourceSnapshot*
  ├─ Template*
  ├─ ExportOperation*
  └─ Run*
       ├─ RunConfiguration 1
       ├─ PolicySnapshot 1..n
       ├─ Candidate 2..n
       │    ├─ SourceSnapshot 1
       │    ├─ CandidateAttempt*
       │    ├─ CandidateWorkspace*
       │    ├─ ProcessGroup* -> ProcessRecord*
       │    ├─ Capture*
       │    └─ GateResult*
       ├─ CaptureEpoch* -> CapturePlan 1, Capture*
       ├─ Comparison* -> Evaluation* -> EvidenceRecord*
       ├─ Recommendation*
       ├─ UserDecision*
       ├─ Promotion*
       ├─ ExportOperation*
       ├─ CleanupOperation*
       ├─ Artifact*
       └─ Event*
```

## 20. Mutation and retention

- immutable entities are superseded, never edited;
- mutable summaries use revision checks and atomic replacement;
- Events preserve transitions/supersession;
- UI caches/indexes rebuild;
- deleting registration never deletes source;
- cited Evidence cannot be independently removed;
- display labels may change without identity change.

## 21. Domain invariants

Nonconforming behavior includes:

- ID/prefix disagreement with shared type registry;
- two current Candidates in one Run;
- mixed-Epoch selection Evidence;
- recommending ineligible Contender;
- noncanonical Recommendation/Decision values;
- Export represented as Decision;
- report/diagnostic represented as Promotion;
- Promotion without Candidate and Decision;
- Recommendation treated as merge/deployment;
- PID treated as identity;
- cross-Run citation without provenance;
- mutation of Snapshot/Evidence/Recommendation/Decision;
- generic string used where a registered durable ID is required;
- database as sole source of a fact;
- persisted deprecated aliases;
- diagnostic bundle modeled both as entity and Export output.

## 22. Required tests

- every registered ID prefix and ULID validator agrees across TypeScript/Zod/JSON Schema/Rust fixtures;
- unregistered prefix rejected;
- Policy/Session/Group/Cleanup/Operation IDs typed and validated;
- deprecated enums rejected;
- all Recommendation/Decision values serialize;
- stale Decision blocks Promotion;
- general Export needs no Candidate;
- Promotion requires Candidate/Decision;
- report cannot create adoption semantics;
- mixed-Epoch Comparison invalid;
- citations cannot cross Run without provenance;
- Gate retries preserve history;
- Run reconstructs without index;
- PID reuse cannot attach unrelated process.
