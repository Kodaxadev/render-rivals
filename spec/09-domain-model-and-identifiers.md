# 09 — Domain Model and Identifiers

**Status:** Canonical implementation contract  
**Scope:** Entity meaning, identifiers, ownership, relationships, mutability, and invariants  
**Shared persisted types:** `schemas/domain-types.ts`  
**Storage:** `spec/11-artifact-event-and-schema-contracts.md`  
**Lifecycle:** `spec/10-run-and-candidate-state-machines.md`

## 1. Purpose

Render Rivals is reconstructable from canonical files and append-only events. Coordinator, supervisor protocol, CLI, UI, evaluators, reports, and export tooling therefore share one domain vocabulary.

This specification defines entity meaning and ownership. It does not redefine shared unions from `schemas/domain-types.ts`.

## 2. Canonical terms

- **current implementation:** qualified reference implementation;
- **contender:** alternate implementation under evaluation;
- **candidate:** current implementation or contender;
- **run:** one execution attempt of one sealed Run Configuration;
- **capture epoch:** browser/environment validity boundary;
- **gate:** eligibility rule;
- **evidence:** cited conclusion derived from verified Artifacts;
- **recommendation:** deterministic policy conclusion;
- **user decision:** explicit human response;
- **promotion:** adoption handoff for a selected contender;
- **export operation:** non-adoption output such as a report, diagnostics, or portable bundle.

Explanatory aliases are mapped by `spec/12`. `champion`, `challenger`, `winner`, `battle`, `promote`, and `escalate` are forbidden as persisted enum values or stable API names.

## 3. Identifier format

Entity IDs use:

```text
<prefix>_<26-character-lowercase-ulid>
```

IDs are opaque, locally generated, immutable, never reused, never derived from labels, and compared case-sensitively. Runtime validators enforce exact prefix and ULID length/character rules.

Content hashes identify bytes. Entity IDs identify domain records. They are not interchangeable.

## 4. Prefix registry

| Entity | Prefix |
|---|---|
| Project | `prj` |
| Source Snapshot | `src` |
| Run | `run` |
| Run Configuration | `rcf` |
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
| Process Record | `pcs` |
| Event | `evt` |
| Diagnostic Bundle | `dgn` |

New prefixes require a specification amendment.

## 5. Common envelope

Persisted entities include:

- schema and schema version;
- prefixed ID;
- creation time;
- update time when mutable;
- owning Project/Run when applicable;
- lifecycle state where applicable;
- monotonic revision for mutable summaries;
- namespaced extensions only where allowed.

Unknown top-level fields are rejected by writers. Supported namespaced extensions cannot alter core semantics.

## 6. Aggregate boundaries

### Project aggregate

Owns registration, trust/configuration references, Source Snapshots, templates, and Run index references. It never owns or deletes the source repository.

### Run aggregate

Owns sealed Run Configuration, Candidates/Attempts, Workspaces, Process Records, Capture Plan/Epochs/Captures, Gates, Comparisons, Evaluations, Evidence, Recommendations, User Decisions, Promotions, Export Operations, Artifacts, Events, Cleanup, Integrity, and Recovery records.

A Run does not consume mutable evidence from another Run. Reuse requires explicit import/provenance, and selectable capture evidence is always recaptured in the active Run.

## 7. Project and Source Snapshot

A Project represents one registered local repository or source root. It records identity/fingerprint, normalized root, source-control metadata, configuration path, trust, capabilities, and timestamps.

A Source Snapshot is immutable and records source kind, commit/branch provenance, dirty patch, file manifest, lockfile/configuration hashes, exclusions/symlink policy, and creation time.

Moving source requires explicit relinking. Changed bytes create a new Source Snapshot.

## 8. Run Configuration and Run

A Run Configuration is the fully resolved immutable contract for source inputs, route/origin, fixture/states/viewports/interaction, commands, readiness/settle, gates, protected dimensions, evaluation policy, limits, retry, storage, retention, security, and export policy.

The wizard edits a draft. Successful validation seals a new Run Configuration. Later changes create a superseding Run.

A Run references exactly one current Candidate and, in MVP, exactly one Contender. It records state, active Epoch, latest Recommendation/Decision, durable checkpoint, recovery disposition, and terminal/failure details.

A terminal Run never reopens.

## 9. Candidate, Attempt, Workspace, and Process

A Candidate has immutable role/ordinal and Source Snapshot, effective Attempt/Workspace, eligibility, Gate Results, Captures, source-difference summary, and failure details.

A Candidate Attempt records one materialization/execution/capture attempt. Retries never overwrite history.

A Candidate Workspace is an owned disposable materialization outside the active working tree. It records method, manifest, verification, and cleanup state.

A Process Record describes one supervisor-managed root process and records purpose, executable identity, redacted args/environment, working directory, native identity, PID as observation only, containment, lifecycle/exit, output/usage Artifacts, and endpoint observations.

Approved contained descendants are attributed through the owning process/group but do not each need an independent managed-root command record unless policy requires one.

## 10. Capture Plan, Epoch, and Capture

A Capture Plan freezes candidate order, route, states, viewports, interaction, fixture/environment, readiness/settle, browser requirement, artifact classes, and equivalence rules.

A Capture Epoch records Run/Plan, browser executable/version/process identity, Playwright version, environment/fixture hashes, ordered capture groups, state, reasons, and timestamps.

Browser crash/disconnect/identity loss or wider environment corruption invalidates the complete Epoch permanently. Candidate-local failure alone does not.

A Capture represents one Candidate, route, state, viewport, and optional interaction step. Validity requires all configured Artifacts and matching source/fixture/browser/environment/Epoch identity.

## 11. Gates

A Gate Definition is immutable within a sealed Run and declares phase, subject type, severity, evidence dependencies, retry policy, and blocking behavior.

A Gate Result is one append-only attempt with state, observations, citations, timestamps, effect, and supersession link.

Required effective failure/error makes a Contender ineligible. Current failure invalidates the baseline.

## 12. Evaluation model

An Evaluation Factor declares stable key, definition, weight, required evidence, confidence, limitations, tie policy, and protected status.

A Comparison binds exactly two Candidates and one valid evidence set, including Epoch, capture pairs, interactions, eligibility summary, environment fingerprint, validity, and Evaluation attempts.

An Evaluation records adapter/provider/model, immutable input manifest, raw and normalized output, validation, factor evidence, limitations, attempt history, and `InferenceUsage`.

An Evidence Record is immutable and includes Factor, `PairwiseVerdict`, confidence/null, rationale, artifact/region/interaction citations, limitations, and validator status.

Every citation belongs to the same Run, verifies its hash, and appears in the immutable input packet.

## 13. Recommendation

A Recommendation uses `RecommendationRecord` and one of exactly:

- `contender_recommended`;
- `current_retained`;
- `tie`;
- `human_review_required`;
- `invalid_run`.

Only deterministic policy creates it after gate, evidence, order, protected-regression, and staleness validation. It is immutable, advisory, and never changes source.

## 14. User Decision

A User Decision uses `UserDecisionRecord` and one of exactly:

- `accept_recommendation`;
- `retain_current`;
- `decline_recommendation`;
- `select_other_eligible_candidate`;
- `defer`;
- `invalidate_run`.

It binds to Recommendation, evidence, source, and policy hashes. Changed inputs make it stale. Export is not a Decision action.

## 15. Promotion

A Promotion uses `PromotionRecord` and represents an adoption handoff for a selected eligible Contender:

- patch export;
- local branch creation;
- workspace preservation.

It always references a Candidate and nonstale authorizing User Decision.

Promotion does not mean merge, push, checkout over the active tree, deployment, or ordinary report export.

## 16. Export Operation

An Export Operation uses `ExportOperationRecord` and creates non-adoption output:

- report;
- diagnostic bundle;
- portable Run bundle;
- evidence bundle;
- screenshots;
- configuration template;
- selected logs.

It may be Run-scoped or installation/project-scoped, need not identify a Candidate, and does not imply acceptance. It always records redaction, omissions, source entities, output Artifacts, and verification.

An export that contains a contender patch or creates an adoption branch is a Promotion, not a general Export Operation.

## 17. Artifact and Event

An Artifact is an immutable registered payload with owner, class, relative path, media type, byte length, SHA-256, validity, sensitivity, retention, operation, and provenance.

An Event is one immutable fact with contiguous sequence and hash-chain linkage. Requested action and observed outcome are separate Events.

## 18. Relationship summary

```text
Project
  ├─ SourceSnapshot*
  ├─ ExportOperation*
  └─ Run*
       ├─ RunConfiguration 1
       ├─ Candidate 2..n
       │    ├─ SourceSnapshot 1
       │    ├─ CandidateAttempt*
       │    ├─ CandidateWorkspace*
       │    ├─ ProcessRecord*
       │    ├─ Capture*
       │    └─ GateResult*
       ├─ CaptureEpoch*
       │    ├─ CapturePlan 1
       │    └─ Capture*
       ├─ Comparison*
       │    └─ Evaluation*
       │         └─ EvidenceRecord*
       ├─ Recommendation*
       ├─ UserDecision*
       ├─ Promotion*
       ├─ ExportOperation*
       ├─ Artifact*
       └─ Event*
```

## 19. Mutation and retention

- Immutable entities are superseded, never edited.
- Mutable summaries use revision checks and atomic replacement.
- Events preserve transitions and supersession.
- UI caches/indexes are rebuildable.
- Deleting registration never deletes source.
- Cited evidence cannot be removed independently.
- Display labels may change without changing identity.

## 20. Domain invariants

Nonconforming behavior includes:

- two current Candidates in one Run;
- mixed-Epoch selection evidence;
- recommending an ineligible Contender;
- noncanonical Recommendation/Decision enum values;
- export represented as Decision;
- report/diagnostic export represented as contender Promotion;
- Promotion without Candidate and authorizing Decision;
- Recommendation treated as merge/deployment;
- PID reuse treated as identity;
- cross-Run citation without provenance;
- mutation of Source Snapshot, Evidence, Recommendation, or Decision;
- database as sole source of a fact;
- persisted deprecated competitive aliases.

## 21. Required tests

- all ID prefixes and ULID validators agree;
- deprecated enum vocabulary rejected;
- all Recommendation and Decision values serialize;
- stale Decision blocks Promotion;
- general Export Operation requires no selected Candidate;
- Promotion always requires Candidate and Decision;
- report export cannot create adoption semantics;
- mixed-Epoch Comparison invalid;
- citations cannot cross Run without import provenance;
- Gate retries preserve history;
- Run reconstructs without index;
- PID reuse cannot attach unrelated process.
