# 09 — Domain Model and Identifiers

**Status:** Canonical implementation contract  
**Scope:** Core entities, identifiers, ownership, relationships, mutability, and invariants  
**Shared persisted types:** `schemas/domain-types.ts`  
**Storage schemas:** `spec/11-artifact-event-and-schema-contracts.md`  
**Lifecycle:** `spec/10-run-and-candidate-state-machines.md`

## 1. Purpose

Render Rivals must be reconstructable from files and append-only events. The coordinator, supervisor protocol, UI, evaluators, reports, and export tooling therefore share one stable domain vocabulary.

This specification defines entity meaning and ownership. It does not redefine shared enum unions already defined in `schemas/domain-types.ts`.

## 2. Naming rules

Canonical product terms are:

- **current implementation:** the reference implementation being defended;
- **contender:** an alternate implementation being tested;
- **candidate:** either current or contender;
- **run:** one configured evaluation attempt;
- **capture epoch:** the browser-lifecycle boundary for comparable captures;
- **gate:** an eligibility rule;
- **evidence:** a cited observation derived from verified artifacts;
- **recommendation:** the deterministic policy conclusion;
- **user decision:** the user's explicit response;
- **promotion:** a non-destructive export operation.

`champion`, `challenger`, `winner`, and `battle` may appear only as explanatory prose aliases mapped by `spec/12`. They are forbidden in persisted schemas and stable APIs.

## 3. Identifier format

Entity IDs use a lowercase type prefix, underscore, and 26-character ULID:

```text
<prefix>_<ulid>
```

Identifiers are:

- locally generated;
- immutable;
- never reused;
- never derived from display names;
- compared case-sensitively;
- serialized exactly as created.

Content hashes establish byte/content identity. Entity IDs establish domain identity. They are not interchangeable.

## 4. Prefix registry

| Entity | Prefix |
|---|---|
| Project | `prj` |
| Source snapshot | `src` |
| Run | `run` |
| Run configuration | `rcf` |
| Candidate | `can` |
| Candidate workspace | `wsp` |
| Capture epoch | `cep` |
| Capture plan | `cpl` |
| Capture | `cap` |
| Gate definition | `gat` |
| Gate result | `grs` |
| Evaluation factor | `fac` |
| Evaluation | `eva` |
| Evidence record | `evd` |
| Comparison | `cmp` |
| Recommendation | `rec` |
| User decision | `dec` |
| Promotion | `pro` |
| Artifact | `art` |
| Process record | `pcs` |
| Event | `evt` |
| Diagnostic bundle | `dgn` |

New prefixes require a specification amendment.

## 5. Common entity envelope

Every persisted entity includes:

- `schema`;
- `schemaVersion`;
- prefixed `id`;
- `createdAt`;
- `updatedAt` when mutable;
- owning `projectId` and `runId` when applicable;
- lifecycle state when applicable;
- monotonically increasing `revision` for mutable summaries;
- namespaced `extensions` when allowed.

Unknown top-level fields are rejected by canonical writers. Readers may preserve supported namespaced extensions.

## 6. Aggregate boundaries

### Project aggregate

Owns:

- project registration;
- trust/configuration references;
- source snapshots;
- run index references.

It does not own or delete the source repository.

### Run aggregate

Owns:

- immutable resolved Run Configuration;
- candidates and attempts;
- workspaces and process records;
- capture plans, epochs, and captures;
- gates;
- comparisons and evaluations;
- evidence;
- recommendations;
- user decisions;
- promotions;
- artifacts;
- events;
- cleanup and integrity records.

A run does not consume mutable evidence from another run. Reuse requires explicit import/provenance.

## 7. Project

A Project represents one registered local repository or source directory.

Required facts:

- identity and display name;
- normalized root path and fingerprint;
- source-control metadata;
- configuration path;
- registration and last-opened timestamps;
- detected capabilities;
- trust status.

Moving a source directory requires explicit relinking and identity verification. Removing registration never deletes source.

## 8. Source Snapshot

A Source Snapshot is an immutable declaration of source content used by a Candidate.

It records:

- project identity;
- kind: Git commit, worktree, directory manifest, working-tree snapshot, patched workspace, or imported prior candidate;
- commit and branch provenance where available;
- dirty-state declaration;
- file-manifest hash;
- lockfile hash;
- configuration hash;
- symlink and exclusion policy;
- creation time.

Changed content creates a new Source Snapshot. Branch names alone never establish immutable identity.

## 9. Run Configuration

A Run Configuration is the fully resolved immutable contract for one Run.

It includes:

- source inputs;
- target route and local-origin policy;
- fixture, states, viewports, and critical interaction;
- install/build/test/development commands;
- readiness and settle policy;
- gates and protected dimensions;
- factor definitions and evaluator policy;
- resource limits;
- storage, retention, security, and export policy;
- configuration provenance and canonical hash.

The wizard may edit a draft. Validation seals a new immutable Run Configuration.

## 10. Run

A Run represents one attempt to execute a Run Configuration.

Required fields include:

- Project and Run Configuration references;
- state from `RunState`;
- exactly one current Candidate;
- ordered Contender IDs;
- active epoch when capturing;
- latest Recommendation and User Decision references;
- durable checkpoint;
- recovery disposition;
- terminal/failure details.

MVP cardinality is one current Candidate and one Contender. Later modes may add contenders without changing entity semantics.

A terminal Run never reopens. Retrying terminal work creates a superseding Run.

## 11. Candidate

A Candidate represents either current or contender and uses `CandidateRole` from `schemas/domain-types.ts`.

It records:

- immutable role and ordinal;
- Source Snapshot;
- effective workspace/attempt;
- lifecycle state;
- eligibility;
- gate results;
- captures;
- source-difference summary;
- failure details.

Eligibility is derived from required gates. An ineligible or stale Contender cannot be recommended.

## 12. Candidate Workspace and Attempt

A Candidate Workspace is an owned execution copy of a Source Snapshot.

It:

- lives under an owned cache/workspace root;
- never aliases the active working tree;
- records materialization method and manifest hash;
- is verified before reuse;
- may be cleaned without deleting evidence.

A Candidate Attempt records one materialization/execution/capture attempt. Retries preserve prior attempts.

## 13. Process Record

A Process Record describes one supervisor-launched process.

It records:

- Candidate and purpose;
- executable identity;
- redacted argument/environment summaries;
- working directory;
- supervisor-native identity;
- PID as observation only;
- containment membership;
- lifecycle and exit facts;
- output and usage artifacts;
- endpoint-ownership observations.

PID alone never proves continuity.

## 14. Capture Plan

A Capture Plan is the immutable matrix for an epoch:

- candidate order;
- route;
- required application states;
- viewports;
- critical interaction steps;
- locale, time zone, theme, reduced motion, clock, and random policy;
- readiness/settle policy;
- browser requirement;
- required artifact classes;
- comparison-equivalence constraints.

## 15. Capture Epoch

A Capture Epoch is the validity boundary for comparable browser evidence.

It records:

- Run and Capture Plan;
- browser executable/version and process identity;
- Playwright version;
- environment fingerprint;
- ordered capture groups;
- state and invalidation reasons;
- open/seal/invalidation timestamps.

Current and Contender evidence used together must belong to the same valid epoch. Browser disconnect or crash invalidates the complete epoch permanently.

## 16. Capture

A Capture represents one Candidate, route, application state, viewport, and optional interaction step within one epoch.

A valid Capture requires all configured artifacts and matching source, fixture, browser, environment, and epoch identity.

Capture completion does not imply gate success. Invalid-epoch artifacts remain diagnostic only.

## 17. Gate Definition and Result

A Gate Definition is immutable policy within a started Run.

A Gate Result is one append-only attempt against a Candidate or Capture.

Required result facts:

- gate and subject IDs;
- attempt number;
- state: pending, running, passed, failed, error, or skipped;
- observations and cited artifacts;
- blocking effect;
- failure/error details;
- supersession link.

A required effective failure or error makes the Candidate ineligible.

## 18. Evaluation Factor

An Evaluation Factor defines one pairwise judgment dimension and records:

- stable key and definition;
- weight;
- required artifact classes;
- minimum confidence;
- blocking limitation rules;
- tie treatment;
- whether it is protected.

Weights for weighted factors sum to 1.0 within declared tolerance. Protected dimensions may veto independent of weight.

## 19. Comparison

A Comparison binds exactly two Candidates and the valid evidence set used to compare them.

It records:

- Run and Candidate IDs;
- valid epoch;
- capture pairs and interaction evidence;
- gate eligibility summary;
- environment fingerprint;
- evaluation attempts;
- comparison-validity state.

## 20. Evaluation and InferenceUsage

An Evaluation represents one evaluator attempt.

It records:

- adapter/provider/model provenance;
- immutable input manifest;
- raw and normalized output artifacts;
- validation result;
- factor evidence;
- limitations;
- attempt/supersession details;
- `InferenceUsage` imported from `schemas/domain-types.ts`.

There is no second local `InferenceUsage` definition.

## 21. Evidence Record

An Evidence Record is an immutable factor-level or protected-regression conclusion.

It records:

- Evaluation and Factor references;
- PairwiseVerdict;
- confidence or null;
- rationale;
- artifact/region/interaction citations;
- limitations;
- validator status.

Every cited artifact must belong to the same Run, verify its hash, and be allowed by the immutable evaluation packet.

## 22. Recommendation

A Recommendation uses `RecommendationRecord` and `RecommendationOutcome` from `schemas/domain-types.ts`.

Allowed outcomes are exactly:

- `contender_recommended`;
- `current_retained`;
- `tie`;
- `human_review_required`;
- `invalid_run`.

The policy engine creates the Recommendation only after validating gates, evidence, order reversal, protected regressions, and staleness.

A Recommendation is immutable, advisory, and never changes source.

## 23. User Decision

A User Decision uses `UserDecisionRecord` and `UserDecisionAction` from `schemas/domain-types.ts`.

Allowed actions are exactly:

- `accept_recommendation`;
- `retain_current`;
- `decline_recommendation`;
- `select_other_eligible_candidate`;
- `defer`;
- `invalidate_run`.

`exported_without_acceptance` is not a decision action.

Decisions are append-only and bind to recommendation, evidence, source, and policy hashes. Changed bound inputs make a decision stale.

## 24. Promotion

A Promotion uses `PromotionRecord` from `schemas/domain-types.ts`.

Promotion is a non-destructive export such as:

- patch export;
- local branch creation;
- workspace preservation;
- report export.

Promotion does not mean merge, push, checkout, or deployment. It requires a nonstale authorizing User Decision.

## 25. Artifact and Event

An Artifact is an immutable registered file with:

- owner;
- class/role;
- canonical relative path;
- media type and byte length;
- SHA-256;
- validity and sensitivity;
- retention and provenance.

An Event is one immutable run-scoped fact with contiguous sequence and hash-chain linkage.

Requested actions and observed outcomes are distinct events.

## 26. Relationship summary

```text
Project
  ├─ SourceSnapshot*
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
       ├─ Artifact*
       └─ Event*
```

## 27. Mutation and retention

- Immutable entities are superseded, never edited in place.
- Mutable summaries use revision checks and atomic replacement.
- Event streams preserve every transition.
- UI caches and databases are rebuildable.
- Deleting a Project registration never deletes source.
- Evidence cited by retained decisions or recommendations cannot be removed independently.
- Display labels may change without changing entity identity.

## 28. Domain invariants

An implementation is nonconforming if it permits:

- two current Candidates in one Run;
- mixed-epoch selection evidence;
- recommendation of an ineligible Contender;
- Recommendation enums outside the canonical five;
- User Decision actions outside the canonical six;
- export represented as a User Decision action;
- recommendation treated as merge or deployment;
- PID reuse treated as process continuity;
- cross-run artifact citation without import provenance;
- mutation of source snapshots, evidence, recommendations, or decisions;
- a database becoming the only source of a fact;
- persisted `champion`, `challenger`, `retain_champion`, `promote`, or `escalate` enum values.

## 29. Required tests

- shared types compile from `schemas/domain-types.ts`;
- deprecated persisted vocabulary is rejected;
- Recommendation validates all five outcomes;
- User Decision validates all six actions;
- stale decision blocks Promotion;
- mixed-epoch Comparison is invalid;
- artifact citations cannot cross Run boundaries;
- gate retries preserve attempt history;
- Run reconstructs without an index;
- PID reuse cannot attach an unrelated process.
