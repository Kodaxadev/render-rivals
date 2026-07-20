# 09 — Domain Model and Identifiers

**Status:** Canonical implementation contract  
**Scope:** Core entities, identifiers, ownership, relationships, mutability, and invariants

## 1. Purpose

Render Rivals must be reconstructable from files and append-only events. That requires one stable domain vocabulary shared by the coordinator, supervisor protocol, UI, evaluators, reports, and export tooling.

This specification defines that vocabulary. Storage schemas are defined in `spec/11-artifact-event-and-schema-contracts.md`; lifecycle transitions are defined in `spec/10-run-and-candidate-state-machines.md`.

## 2. Naming rules

Canonical product terms are:

- **current implementation:** the reference implementation being defended;
- **contender:** an alternate implementation being tested against the current implementation;
- **candidate:** either the current implementation or a contender when behavior applies equally to both;
- **run:** one configured evaluation attempt;
- **capture epoch:** the browser-lifecycle boundary within which comparable captures are produced;
- **gate:** a rule that determines eligibility;
- **evidence:** a cited observation derived from verified artifacts;
- **recommendation:** the system's advisory conclusion;
- **decision:** the user's explicit response to a recommendation;
- **promotion:** a non-destructive export action following an accepted decision.

Do not use `champion`, `challenger`, `winner`, or `battle` in persisted schemas.

## 3. Identifier format

### 3.1 General form

Entity IDs use a lowercase type prefix, underscore, and canonical 26-character ULID:

`<prefix>_<ulid>`

Example:

`run_01K0R7J6R8M3KQ6NPG2XYT4A9B`

Requirements:

- generated locally;
- immutable;
- lexicographically sortable by creation time;
- never reused;
- never derived from display names;
- compared case-sensitively;
- serialized exactly as created.

### 3.2 Prefix registry

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
| Promotion/export | `pro` |
| Artifact | `art` |
| Process record | `pcs` |
| Event | `evt` |
| Diagnostic bundle | `dgn` |

New prefixes require a specification update. Prefixes may not be repurposed.

### 3.3 Sequence identifiers

Append-only streams use an unsigned 64-bit `sequence` beginning at `1`. Sequence numbers are scoped to one stream and must be contiguous. They are not entity IDs.

### 3.4 Content identity

Files and source manifests also carry SHA-256 hashes. Hashes establish content identity; ULIDs establish entity identity. They are not interchangeable.

## 4. Common entity envelope

Every persisted entity has:

- `schema`: stable schema name;
- `schemaVersion`: semantic schema version;
- `id`: prefixed ULID;
- `createdAt`: RFC 3339 UTC timestamp;
- `updatedAt`: RFC 3339 UTC timestamp when mutable;
- `projectId`: owning project when applicable;
- `runId`: owning run when applicable;
- `status`: lifecycle state when applicable;
- `revision`: monotonically increasing integer for mutable snapshots;
- `extensions`: namespaced optional object for forward-compatible additions.

Unknown top-level fields are rejected in canonical writers. Readers may preserve unknown namespaced extension fields.

## 5. Aggregate boundaries

### 5.1 Project aggregate

The project aggregate contains:

- Project;
- project configuration references;
- source snapshots;
- run index references.

A project does not own source files. It stores identities and paths needed to recreate snapshots.

### 5.2 Run aggregate

A run is the primary transactional and recovery boundary. It owns:

- immutable run configuration;
- candidate records;
- workspaces;
- capture epochs and captures;
- gate results;
- evaluations and evidence;
- recommendation;
- user decisions;
- promotions;
- event stream;
- artifact manifest;
- logs.

A run never references mutable evidence from another run. Reused artifacts are copied or explicitly imported with provenance.

## 6. Project

A Project represents one registered local source repository or directory.

Required fields:

- `id`;
- `displayName`;
- `rootPath` in platform-native normalized absolute form;
- `rootPathFingerprint` using a normalized path hash;
- `sourceControl` metadata;
- `configurationPath` when present;
- `registeredAt`;
- `lastOpenedAt`;
- `capabilities` detected for the project.

Mutable fields:

- display name;
- last-opened time;
- detected commands and capabilities;
- user defaults.

Invariants:

- deleting a Project registration never deletes the source repository;
- project identity does not change when the branch changes;
- moving the source directory requires explicit relinking;
- two Projects may not point to the same normalized root unless the user confirms a duplicate registration.

## 7. Source Snapshot

A Source Snapshot is an immutable declaration of source content used by a candidate.

Required fields:

- `id`;
- `projectId`;
- `kind`: `git_commit`, `git_worktree`, `directory_manifest`, or `patched_workspace`;
- `repositoryRoot`;
- `commitSha` when available;
- `branchName` when available;
- `dirtyState`: `clean`, `included`, or `unknown`;
- `fileManifestHash`;
- `lockfileHash` when present;
- `configurationHash`;
- `capturedAt`;
- `provenance`.

Invariants:

- immutable after creation;
- source files used for execution must match the recorded manifest;
- a changed manifest creates a new Source Snapshot;
- symlinks are recorded and validated according to workspace policy;
- excluded files and normalization rules are part of the snapshot provenance.

## 8. Run Configuration

A Run Configuration is the immutable resolved configuration used for one run.

It contains fully resolved values after applying configuration precedence. It includes:

- target route and local-origin policy;
- install, build, and development commands;
- readiness policy;
- candidate sources;
- capture viewports and environment;
- gates;
- evaluation factors and weights;
- evaluator adapter and version;
- runtime limits;
- storage policy;
- export policy;
- configuration-source provenance.

The draft wizard may mutate a draft configuration. Starting validation seals a new immutable Run Configuration and assigns its ID.

## 9. Run

A Run represents one attempt to execute a Run Configuration.

Required fields:

- `id`;
- `projectId`;
- `runConfigurationId`;
- `displayName`;
- `state`;
- `currentCandidateId`;
- ordered `contenderIds`;
- `activeEpochId` when capturing;
- `recommendationId` when available;
- `latestDecisionId` when available;
- `startedAt` and terminal time when applicable;
- `lastDurableCheckpoint`;
- `recoveryDisposition`;
- `failure` when applicable.

Invariants:

- MVP run has exactly one current candidate and one contender;
- only one candidate executes at a time in the first scheduler;
- at most one capture epoch is active;
- a terminal run cannot return to an active state;
- retrying a terminal run creates a new Run linked through `supersedesRunId`;
- a recommendation is not a user decision;
- completed does not imply promoted.

## 10. Candidate

A Candidate represents the current implementation or one contender.

Required fields:

- `id`;
- `runId`;
- `role`: `current` or `contender`;
- `ordinal`: current is `0`; contenders begin at `1`;
- `displayName`;
- `sourceSnapshotId`;
- `workspaceId` when prepared;
- `state`;
- `eligibility`: `unknown`, `eligible`, or `ineligible`;
- `gateResultIds`;
- `captureIds`;
- source-difference summary;
- failure details when applicable.

Invariants:

- role is immutable;
- exactly one candidate has role `current`;
- eligibility is derived from required gate results;
- ineligible candidates may retain diagnostic artifacts but cannot receive a promotion recommendation;
- candidate labels and colors in the UI are presentation metadata, not identity.

## 11. Candidate Workspace

A Candidate Workspace is an owned execution copy of a Source Snapshot.

Required fields:

- `id`;
- `candidateId`;
- absolute `workspacePath` under an owned run root;
- `sourceSnapshotId`;
- `materializationMethod`;
- workspace-manifest hash;
- creation and cleanup timestamps;
- cleanup state.

Invariants:

- never aliases the user's active working tree;
- only the supervisor and coordinator may declare it ready;
- must be inside the configured owned workspace root;
- paths are canonicalized before use;
- cleanup failure is recorded and retried but does not erase run evidence.

## 12. Process Record

A Process Record describes a process launched through the supervisor.

Fields include:

- `id`;
- `candidateId`;
- `purpose`: install, build, serve, evaluator, export helper, or diagnostic;
- executable identity;
- argument hash and redacted display arguments;
- working directory;
- environment hash and redaction summary;
- supervisor-native process identity;
- PID as observation, not identity;
- containment membership;
- start and exit timestamps;
- exit status;
- log artifact IDs;
- endpoint ownership observations.

A stored PID alone never proves that a process is still the same process.

## 13. Capture Plan

A Capture Plan is the immutable matrix of capture work for an epoch.

It contains:

- candidate order;
- target route;
- viewports;
- color scheme;
- locale;
- time zone;
- readiness and settle policy;
- required selectors;
- browser version requirement;
- artifact types;
- comparison-equivalence constraints.

The MVP plan contains two candidates and two viewports.

## 14. Capture Epoch

A Capture Epoch is the validity boundary for comparable browser artifacts.

Required fields:

- `id`;
- `runId`;
- `capturePlanId`;
- `state`;
- browser executable and version;
- browser process record;
- context identity;
- environment fingerprint;
- ordered candidate capture groups;
- invalidation reason when applicable;
- opened, sealed, and invalidated timestamps.

Invariants:

- current and contender evidence used in one comparison must belong to the same valid epoch;
- a browser disconnect or crash invalidates the complete active epoch;
- an invalidated epoch cannot become valid again;
- retry creates a new epoch and recaptures current and contender;
- invalidated artifacts remain diagnostic only.

## 15. Capture

A Capture represents one candidate at one viewport and application state.

Required fields:

- `id`;
- `epochId`;
- `candidateId`;
- route;
- viewport;
- state key;
- status;
- navigation metadata;
- readiness observations;
- screenshot artifact ID;
- DOM-summary artifact ID;
- console-summary artifact ID;
- metadata artifact ID;
- artifact hashes;
- start and completion timestamps.

Invariants:

- valid only when all required artifacts verify;
- belongs to exactly one epoch and candidate;
- may not cite artifacts from another candidate;
- capture completion does not imply gate success;
- diagnostic captures from invalid epochs are marked unusable for evaluation.

## 16. Gate Definition

A Gate Definition declares an eligibility rule.

Required fields:

- `id`;
- stable `key` unique within the Run Configuration;
- name and description;
- severity: `required` or `advisory`;
- evaluator type;
- parameters;
- retry policy;
- failure message template;
- schema version.

Definitions are immutable within a started run.

## 17. Gate Result

A Gate Result is one execution of one Gate Definition against one candidate or capture.

Required fields:

- `id`;
- `gateId`;
- `candidateId`;
- optional `captureId`;
- status: pending, running, passed, failed, error, or skipped;
- observations;
- cited artifact IDs;
- attempt number;
- started and completed timestamps;
- blocking effect;
- failure or error details.

Invariants:

- a required failed or error result makes the candidate ineligible unless policy explicitly retries and later supersedes it;
- results are append-only attempts; they are not overwritten;
- the effective result is the latest completed attempt declared by a supersession link.

## 18. Evaluation Factor

An Evaluation Factor defines one dimension of pairwise judgment.

Fields:

- `id`;
- stable `key`;
- name and definition;
- weight;
- required artifact classes;
- minimum confidence;
- blocking limitation rules;
- tie treatment.

Factor weights for a resolved Run Configuration must sum to `1.0` within decimal tolerance.

## 19. Comparison

A Comparison binds exactly two candidates and the evidence set used to compare them.

Required fields:

- `id`;
- `runId`;
- current candidate ID;
- contender candidate ID;
- valid epoch ID;
- capture pairs;
- gate eligibility summary;
- evaluation ID;
- comparison validity state;
- environment fingerprint.

MVP has exactly one Comparison per completed evaluation attempt.

## 20. Evaluation

An Evaluation represents one evaluator attempt.

Fields:

- `id`;
- `comparisonId`;
- evaluator adapter identity and version;
- input-manifest artifact ID;
- output artifact ID;
- state;
- attempt number;
- factor evidence IDs;
- aggregate confidence;
- validation result;
- limitations;
- start and completion timestamps.

Invalid evaluator output remains stored with a rejected state and may not feed the decision engine.

## 21. Evidence Record

An Evidence Record is one factor-level conclusion.

Required fields:

- `id`;
- `evaluationId`;
- `factorId`;
- outcome: `current`, `contender`, or `tie`;
- confidence;
- rationale;
- artifact citations;
- optional capture-region references;
- limitations;
- validator status.

Invariants:

- every conclusion cites at least one artifact in the same run;
- every cited artifact hash must verify;
- confidence is finite and in `[0,1]`;
- rationale cannot introduce unrecorded external evidence;
- evidence is immutable after evaluator-output acceptance.

## 22. Recommendation

A Recommendation is the deterministic decision-policy result over valid gates and evidence.

Required fields:

- `id`;
- `runId`;
- `comparisonId`;
- `evaluationId`;
- outcome: `contender_recommended`, `current_retained`, or `human_review_required`;
- policy version;
- weighted support;
- aggregate confidence;
- reasons;
- blocking conditions;
- reproducibility hash;
- created timestamp.

Invariants:

- immutable;
- cannot exist before evidence validation;
- cannot recommend an ineligible contender;
- does not alter source code;
- superseding evaluation creates a new Recommendation.

## 23. User Decision

A User Decision records the human response.

Fields:

- `id`;
- `runId`;
- `recommendationId`;
- action: `accepted`, `declined`, `kept_current`, `deferred`, or `exported_without_acceptance` when policy permits;
- optional note;
- actor: local user identity or `local_user`;
- timestamp.

Decisions are append-only. The latest decision may supersede a prior deferred decision but never deletes it.

## 24. Promotion

A Promotion represents an explicit non-destructive export.

Fields:

- `id`;
- `runId`;
- `decisionId`;
- `candidateId`;
- type: `patch` or `branch` in the MVP;
- destination;
- exported artifact IDs;
- source precondition hash;
- result;
- verification summary;
- timestamp.

Promotion does not mean merge. A failed Promotion does not invalidate the Recommendation or User Decision.

## 25. Artifact

An Artifact is an immutable file produced or imported by a run.

Fields:

- `id`;
- `runId`;
- optional candidate, epoch, capture, evaluation, or promotion owner;
- class;
- relative path;
- media type;
- byte length;
- SHA-256;
- creation event ID;
- validity: valid, diagnostic, quarantined, missing, or corrupt;
- redaction metadata;
- retention policy.

An Artifact record may not point outside the run root.

## 26. Event

An Event is one immutable fact in the run stream.

Fields:

- `id`;
- run-scoped sequence;
- event type;
- timestamp;
- actor: bootstrap, supervisor, coordinator, browser, evaluator, exporter, or user;
- entity references;
- payload;
- previous-event hash;
- event hash.

Events are facts, not commands. Requested actions and observed outcomes are separate events.

## 27. Relationship summary

```text
Project
  ├─ SourceSnapshot*
  └─ Run*
       ├─ RunConfiguration 1
       ├─ Candidate 2..n
       │    ├─ SourceSnapshot 1
       │    ├─ CandidateWorkspace 0..1
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

## 28. Mutation and revision rules

- Immutable entities are never updated in place; a superseding entity is created.
- Mutable summary snapshots use `revision` and atomic replacement.
- Event streams retain every transition and supersession.
- UI caches and indexes are rebuildable and noncanonical.
- Display labels may change without changing entity identity.
- Moving an artifact is a new artifact-record revision only when the canonical relative path changes through a controlled migration.

## 29. Deletion and retention

- Source repositories are never deleted by project removal.
- Active-run entities cannot be selectively deleted.
- Cleanup operates at artifact or whole-run retention boundaries.
- A completed run may be deleted only after explicit confirmation and a durable deletion event in the project-level index.
- Exported bundles are outside Render Rivals retention control.
- Evidence cited by a retained recommendation cannot be cleaned independently.

## 30. Domain invariants checklist

An implementation is nonconforming if it permits any of the following:

- two current candidates in one run;
- evaluation using captures from different valid epochs;
- recommendation of an ineligible contender;
- accepted recommendation being treated as a merge;
- PID reuse being mistaken for process continuity;
- artifact citations crossing run boundaries without imported provenance;
- mutation of immutable source snapshots, evidence, or recommendations;
- state changes performed only in UI memory;
- deletion of historical gate attempts when retried;
- a database becoming the only source of a domain fact.