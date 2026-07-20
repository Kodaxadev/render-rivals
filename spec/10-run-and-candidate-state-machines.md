# 10 — Run and Candidate State Machines

**Status:** Canonical implementation contract  
**Scope:** Authoritative lifecycle states, transitions, ownership, checkpoints, retries, interruption, cancellation, and recovery  
**Shared types:** `schemas/domain-types.ts`  
**Session/run integration:** `spec/12-cross-spec-normalization.md`

## 1. Purpose

Render Rivals coordinates untrusted child processes, browser capture, durable files, evaluator work, and explicit user decisions. Every state transition is represented by a durable event and reflected in an atomic summary snapshot.

The UI requests commands and renders durable state. It never assigns domain state directly.

## 2. State authority

### Coordinator

The TypeScript coordinator owns domain transitions for:

- Run;
- Candidate and Candidate Attempt;
- Candidate Workspace;
- Capture Plan, Capture Epoch, and Capture;
- Gate Result;
- Evaluation;
- Recommendation creation;
- User Decision recording;
- Promotion.

### Supervisor

The Rust supervisor owns observed native facts:

- process launch accepted or rejected;
- containment assignment;
- process exit;
- process-tree cleanup;
- endpoint ownership;
- signal receipt;
- resource-limit breach;
- native IPC and session lifecycle.

The coordinator may not invent a native success it has not observed.

### UI

The UI may request start, cancel, retry, decide, or export commands. Command acknowledgment is not completion.

## 3. Session and Run separation

Session state and Run state are separate.

A supervisor Session may host multiple sequential Run operations. A durable Run may survive one Session and resume under another.

Session states such as `authenticating_coordinator` or `draining` do not belong to `RunState`. `recoverable` is not a Run state; recovery is represented by `RecoveryDisposition`.

## 4. Transition transaction

A side-effecting transition follows:

1. validate command, expected state, and revision;
2. allocate operation/event identity;
3. append durable intent when required;
4. atomically write the requested state/checkpoint;
5. perform the side effect;
6. record supervisor/browser/provider observation;
7. append completion or failure event;
8. atomically write resulting state and checkpoint.

Requested, started, observed, completed, and failed are distinct facts.

## 5. Idempotency

Every retryable command has an operation ID.

- Completed operation repeated with same ID returns recorded result.
- In-progress operation repeated with same ID attaches to the existing operation.
- Failed semantic retry creates a new attempt ID unless failure was transport-only.
- Export retries verify destination preconditions before writing.
- Process launch retries never rely on stored PID alone.

## 6. Run state machine

`RunState` is imported from `schemas/domain-types.ts`:

- `draft`;
- `validating`;
- `ready`;
- `preparing`;
- `capturing`;
- `gating`;
- `evaluating`;
- `awaiting_decision`;
- `exporting`;
- `completed`;
- `failed`;
- `cancelled`;
- `interrupted`.

Allowed transitions:

```text
draft -> validating
validating -> draft | ready | failed | cancelled | interrupted
ready -> preparing | cancelled | interrupted
preparing -> capturing | failed | cancelled | interrupted
capturing -> capturing | gating | failed | cancelled | interrupted
gating -> evaluating | awaiting_decision | failed | cancelled | interrupted
evaluating -> awaiting_decision | failed | cancelled | interrupted
awaiting_decision -> exporting | completed | cancelled | interrupted
exporting -> completed | awaiting_decision | failed | cancelled | interrupted
interrupted -> validating | preparing | capturing | gating | evaluating | awaiting_decision | failed | cancelled
```

Terminal states are `completed`, `failed`, and `cancelled`. Retrying terminal work creates a superseding Run.

## 7. Draft and validation

`draft` permits changes to source inputs, route, fixture, states, interactions, commands, gates, factors, evaluator, limits, and display metadata.

Transition to `validating` requires minimum complete inputs.

Validation checks:

- project trust and identity;
- source stability;
- configuration resolution;
- platform capability;
- supervisor session;
- storage admission;
- command and path safety;
- route/origin policy;
- evaluator availability or approved human-only mode;
- gate/factor semantics;
- runtime limits.

Successful validation seals immutable Run Configuration and Source Snapshots, then enters `ready`.

## 8. Ready and preparing

`ready` is a durable pause point with no candidate process required.

`preparing` covers:

- run directory allocation;
- candidate workspace materialization;
- workspace verification;
- dependency preparation;
- optional build/test preparation;
- browser runtime verification;
- Capture Plan creation;
- strict port allocation.

Exit requires verified ready workspaces, committed Capture Plan, and no unexpected preparation process.

## 9. Capturing

Rules:

- at most one Capture Epoch is active;
- candidate workloads are sequential in the MVP;
- current stability probe runs before selection captures;
- current and contender receive the complete required matrix;
- fresh browser contexts isolate candidates;
- browser crash/disconnect invalidates the complete epoch;
- invalid epoch artifacts remain diagnostic only;
- retry creates a new epoch and recaptures all required candidates.

Exit to `gating` requires one sealed valid epoch with every required artifact verified.

## 10. Gating

Required and advisory gates are reduced from append-only Gate Result attempts.

Outcomes:

- current invalid → deterministic `invalid_run` Recommendation or terminal failure according to policy;
- contender ineligible with qualified current → deterministic `current_retained` Recommendation without aesthetic evaluator;
- both eligible with valid comparison → `evaluating`;
- integrity/security failure → failed or interrupted recovery path.

When a deterministic Recommendation is created during gating, the Run enters `awaiting_decision`.

## 11. Evaluating

The coordinator:

- builds immutable comparison packets;
- verifies allowed artifacts and hashes;
- invokes evaluator attempts;
- stores raw output;
- validates schema, provenance, citations, factor coverage, and confidence;
- performs order reversal where configured;
- creates immutable Evidence Records;
- applies deterministic recommendation policy.

Exit requires a valid Recommendation using one of the canonical five outcomes.

## 12. Awaiting decision

No candidate or browser process should remain unless explicitly retained in a separate supervised preview operation.

Allowed decision commands use `UserDecisionAction`:

- `accept_recommendation`;
- `retain_current`;
- `decline_recommendation`;
- `select_other_eligible_candidate`;
- `defer`;
- `invalidate_run`.

Behavior:

- `accept_recommendation` may authorize `exporting` when the Recommendation selects a contender;
- `retain_current` completes without contender export;
- `decline_recommendation` completes or returns to an allowed review flow without adopting the recommendation;
- `select_other_eligible_candidate` is rejected in the one-contender MVP unless a later mode supplies another eligible Candidate;
- `defer` records a Decision and remains `awaiting_decision`;
- `invalidate_run` records the Decision and completes with invalidated disposition.

`exported_without_acceptance` is not a valid action.

## 13. Exporting

Promotion types in the MVP:

- patch export;
- local branch creation;
- workspace preservation;
- report export.

Preconditions:

- nonstale authorizing User Decision;
- eligible selected Candidate where applicable;
- source/recommendation/evidence/policy hashes match;
- destination policy passes;
- active working tree will not be overwritten.

Success enters `completed`. Destination conflicts return to `awaiting_decision`. Integrity failures enter `failed`.

## 14. Terminal states

### Completed

A completed Run has:

- terminal event and summary;
- no active epoch;
- Recommendation or explicit terminal reason;
- User Decision where required;
- sealed artifact manifest;
- integrity report;
- cleanup result or explicit cleanup incident.

Completed does not imply contender recommendation or export.

### Failed

Used when the current attempt cannot safely continue or recover.

It records failure code, phase, technical artifact, retained evidence, recovery advice, and cleanup status.

### Cancelled

Cancellation completes only after intent, process cleanup attempt, epoch invalidation, partial-artifact quarantine, terminal event, and summary are durable.

Cleanup failure remains visible.

### Interrupted

Used when authority is lost before terminal transition, including coordinator/session crash, OS shutdown, power loss, or stale active snapshot.

Recovery derives disposition from verified events, artifacts, checkpoints, and native observations.

## 15. Candidate state machine

Candidate summary states:

- `registered`;
- `materializing`;
- `workspace_ready`;
- `installing`;
- `building`;
- `ready`;
- `starting`;
- `serving`;
- `capturing`;
- `captured`;
- `gating`;
- `eligible`;
- `ineligible`;
- `failed`;
- `cancelled`;
- `cleaned`.

Allowed flow:

```text
registered -> materializing
materializing -> workspace_ready | failed | cancelled
workspace_ready -> installing | building | ready | failed | cancelled
installing -> building | ready | failed | cancelled
building -> ready | failed | cancelled
ready -> starting | cancelled
starting -> serving | failed | cancelled
serving -> capturing | failed | cancelled
capturing -> captured | failed | cancelled
captured -> gating | failed
gating -> eligible | ineligible | failed
eligible | ineligible | failed | cancelled -> cleaned
```

A new epoch creates a new Candidate Attempt while preserving prior attempt history.

## 16. Workspace state machine

States:

- `allocated`;
- `materializing`;
- `verifying`;
- `ready`;
- `cleanup_requested`;
- `cleaning`;
- `cleaned`;
- `cleanup_failed`;
- `quarantined`.

Only verified ready workspaces execute commands. A workspace outside the owned root is rejected and not automatically deleted.

## 17. Process state machine

States:

- `launch_requested`;
- `starting`;
- `running`;
- `exit_observed`;
- `termination_requested`;
- `terminating`;
- `terminated`;
- `launch_failed`;
- `cleanup_failed`;
- `identity_lost`.

`running` requires supervisor observation and containment verification. On recovery, unverifiable identity becomes `identity_lost`.

## 18. Capture Epoch state machine

States:

- `planned`;
- `opening`;
- `active`;
- `sealing`;
- `valid`;
- `invalidating`;
- `invalid`;
- `failed`.

```text
planned -> opening
opening -> active | failed | invalidating
active -> sealing | invalidating | failed
sealing -> valid | invalidating | failed
invalidating -> invalid
```

Invalid triggers include browser crash/disconnect, context loss, environment mismatch, source mutation, artifact corruption, capture-plan mismatch, and origin/ownership violation.

Invalid never returns to valid.

## 19. Capture and Gate Result states

Capture states:

- `planned`, `navigating`, `settling`, `capturing`, `writing`, `verifying`, `valid`, `invalid`, `failed`.

A Capture becomes valid only after every required artifact is atomically committed and verified.

Gate Result states:

- `pending`, `running`, `passed`, `failed`, `error`, `skipped`.

Retries create new superseding attempts. `skipped` never satisfies a required gate.

## 20. Evaluation states

- `pending`;
- `input_preparing`;
- `ready`;
- `running`;
- `output_received`;
- `validating`;
- `completed`;
- `rejected`;
- `failed`;
- `cancelled`.

Rejected output remains stored but cannot create Evidence or Recommendation.

## 21. Recommendation

Recommendation is created atomically and does not transition internally.

Its exact outcomes are imported from `RecommendationOutcome`:

- `contender_recommended`;
- `current_retained`;
- `tie`;
- `human_review_required`;
- `invalid_run`.

A later valid evaluation creates a superseding Recommendation while retaining history.

## 22. User Decision

User Decisions are append-only facts using the canonical six actions.

A deferred decision may be followed by another decision. Reversing a final decision requires an explicit superseding Decision with reason and nonstale Recommendation context.

## 23. Promotion state machine

States:

- `requested`;
- `validating_preconditions`;
- `exporting`;
- `verifying`;
- `completed`;
- `failed`;
- `cancelled`;
- `stale`.

A failed Promotion may be retried with a new Promotion ID. Matching already-created output may satisfy an idempotent retry after verification.

## 24. Checkpoints

Canonical checkpoints:

- `validated`;
- `prepared`;
- `current_stability_checked`;
- `current_captured`;
- `contender_captured`;
- `valid_epoch_sealed`;
- `gates_resolved`;
- `evaluation_input_committed`;
- `evaluation_output_received`;
- `recommendation_created`;
- `decision_recorded`;
- `promotion_completed`;
- `run_completed`.

A checkpoint is valid only when referenced events and artifacts verify.

## 25. Recovery

On startup for each nonterminal Run:

1. acquire recovery lock;
2. verify event stream sequence/hash chain;
3. compare snapshot revision to replayed events;
4. inspect temporary/quarantined files;
5. obtain supervisor session/containment observations;
6. verify process identity, never PID alone;
7. verify last checkpoint and artifacts;
8. invalidate epochs whose browser continuity cannot be proven;
9. derive `RecoveryDisposition`;
10. append recovery assessment;
11. perform or present the permitted action.

Typical targets:

- before validation → draft/validating;
- after validation → preparing;
- partial epoch → new epoch;
- valid epoch → gating;
- resolved gates → evaluating or awaiting decision;
- valid Recommendation → awaiting decision;
- valid Decision → pending export or completion;
- terminal outcome with cleanup failure → cleanup only.

## 26. Retry policy

- source mutation: no automatic retry;
- install/build: none by default unless explicitly transient;
- readiness: repeated probes inside one attempt;
- browser launch: one bounded retry;
- epoch restart: bounded by frozen policy;
- artifact write: one retry only before canonical registration;
- evaluator transport: bounded retries with identical packet hash;
- invalid evaluator output: corrective retry only when adapter explicitly supports it;
- export destination conflict: no automatic overwrite.

Every retry preserves prior attempts.

## 27. Invariants

- terminal Run states never reopen;
- state revisions increase monotonically;
- durable events drive transitions;
- evaluator never runs on invalid comparison evidence;
- Recommendation uses only canonical outcomes;
- User Decision uses only canonical actions;
- export is never represented as a User Decision action;
- invalid epochs never become valid;
- mixed-epoch evidence cannot support selection;
- browser continuity is never inferred after restart;
- cleanup status remains visible;
- user-visible progress derives from durable state, not timers.

## 28. Required tests

- every allowed and forbidden Run transition;
- deterministic current-retained path for ineligible Contender;
- invalid baseline creates `invalid_run` or terminal failure per policy;
- all five Recommendation outcomes serialize;
- all six User Decision actions serialize;
- `exported_without_acceptance` is rejected;
- partial epoch recovers by complete recapture;
- valid sealed epoch resumes at gating;
- stale decision blocks Promotion;
- PID reuse produces `identity_lost`;
- terminal Run with cleanup incident remains terminal and visibly unhealthy.
