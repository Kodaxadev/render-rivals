# 10 — Run and Candidate State Machines

**Status:** Canonical implementation contract  
**Shared states and enums:** `schemas/domain-types.ts`  
**Session integration:** `spec/02-runtime-and-bootstrap.md` and `spec/12-cross-spec-normalization.md`  
**Failure behavior:** `docs/FAILURE-RECOVERY-MATRIX.md`

## 1. Purpose

Render Rivals coordinates untrusted child processes, browser capture, durable files, evaluator work, explicit decisions, and non-destructive exports. Every domain transition is represented by durable semantic events and reflected in an atomic summary snapshot.

The UI and CLI request commands. They never assign domain state directly.

## 2. State authority

### Coordinator

Owns domain transitions for:

- Run;
- Candidate and Candidate Attempt;
- Candidate Workspace;
- Capture Plan, Capture Epoch, and Capture;
- Gate Result;
- Evaluation and Evidence;
- Recommendation creation;
- User Decision recording;
- Promotion.

### Supervisor

Owns native observations:

- managed root-process launch/rejection;
- containment membership;
- process exit and cleanup;
- endpoint ownership;
- terminal/signal receipt;
- resource-limit breach;
- native IPC and Session lifecycle.

Coordinator cannot invent native success it has not observed.

## 3. Session and Run separation

Session state and Run state are separate.

A supervisor Session may host multiple sequential Run operations. A durable Run may survive one Session and resume under another. `recoverable` and safe mode are not Run states; recovery is represented by `RecoveryDisposition` and safe mode by Session capability.

## 4. Command transaction and idempotency

A side-effecting command:

1. validates authentication, command schema, expected revision, and current state;
2. allocates `operationId` and intent event;
3. durably appends intent where required;
4. performs the side effect through the owning subsystem;
5. records native/browser/provider observations;
6. appends a durable completion or failure event;
7. atomically writes the summary snapshot referencing the completion sequence;
8. returns the recorded result.

Rules:

- same operation ID plus same canonical payload returns the recorded result;
- same operation ID plus changed payload is rejected;
- a failed semantic retry creates a new attempt/operation ID;
- process identity is never inferred from PID alone;
- command acceptance is not completion.

## 5. Run state machine

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

Terminal states are `completed`, `failed`, and `cancelled`. Terminal work never reopens; changed or retried terminal work creates a superseding Run.

## 6. Draft and validation

`draft` permits edits to source inputs, route, fixture, states, interaction, commands, gates, factors, evaluator policy, limits, and display metadata.

Validation checks:

- project trust and identity;
- source stability;
- configuration precedence and schema;
- platform/runtime capability;
- authenticated supervisor Session;
- storage/resource admission;
- command/path safety;
- route/origin/fixture semantics;
- evaluator or approved human-only mode;
- gate dependencies and factor policy.

Success seals immutable Run Configuration and Source Snapshots, then enters `ready`.

After sealing, source/configuration change cannot transition back to `draft`. It requires a superseding Run.

## 7. Ready and preparing

`ready` is a durable pause point with no active candidate process.

`preparing` covers:

- Run directory allocation;
- workspace materialization and verification;
- dependency preparation;
- pre-capture build/test gates;
- browser runtime verification;
- Capture Plan creation;
- port planning.

Exit to `capturing` requires:

- qualified current workspace;
- every contender either prepared or terminally ineligible from pre-capture failure;
- committed Capture Plan;
- browser/runtime availability;
- no unknown active preparation process.

A pre-capture contender failure does not fail the Run when the current implementation remains qualified. It becomes a terminal Candidate Attempt and may lead to deterministic retention.

## 8. Capturing

Rules:

- at most one active Capture Epoch;
- one browser process per Epoch;
- candidate workloads sequential in MVP;
- current stability samples precede selectable capture;
- current and every capture-capable contender receive the frozen matrix;
- fresh contexts isolate samples/candidates;
- invalid Epoch artifacts remain diagnostic only;
- Epoch retry recaptures current plus every still-participating contender.

A candidate-local failure follows `spec/05`:

- preserve diagnostics;
- use bounded local retry;
- terminally fail/invalidate that Candidate Attempt after exhaustion;
- preserve valid evidence belonging to other candidates;
- do not invalidate the Epoch unless environment continuity or comparability was compromised.

Exit to `gating` requires:

- a sealed valid Epoch for the current implementation;
- every Candidate has either a complete verified capture set in that Epoch or a terminal local failure/pre-capture failure result;
- no active candidate/browser write operation;
- artifact/event integrity through the capture checkpoint.

The Run does not require a failed contender to have a complete capture matrix before gating.

## 9. Gating

Gate Results are append-only attempts grouped by phase:

- pre-capture;
- runtime/capture;
- post-capture evidence.

Effective outcomes:

- current invalid → `invalid_run` Recommendation when evidence supports an auditable invalid result, otherwise terminal failure;
- contender ineligible with qualified current → `current_retained` Recommendation without aesthetic evaluator;
- current and contender eligible with valid Comparison → `evaluating`;
- no eligible contender → deterministic `current_retained`;
- integrity/security ambiguity → failed/interrupted recovery path.

A deterministic Recommendation created during gating moves the Run to `awaiting_decision`.

## 10. Evaluating

Coordinator:

- builds immutable allowlisted comparison packets;
- verifies artifacts, hashes, eligibility, and validity;
- invokes evaluator attempts;
- stores raw output before normalization;
- validates schema, provenance, citations, factor coverage, and confidence;
- performs order reversal;
- creates immutable Evidence Records;
- applies deterministic Recommendation policy.

Exit requires a valid Recommendation using the canonical five outcomes.

## 11. Awaiting decision

No candidate/server/browser process remains unless an explicit read-only preview operation is separately supervised.

Allowed `UserDecisionAction` values:

- `accept_recommendation`;
- `retain_current`;
- `decline_recommendation`;
- `select_other_eligible_candidate`;
- `defer`;
- `invalidate_run`.

Behavior:

- accept may authorize `exporting` when a contender is selected;
- retain completes without contender export;
- decline completes without adoption unless policy keeps review open;
- select-other is invalid in one-contender MVP;
- defer records Decision and remains awaiting decision;
- invalidate records Decision and completes with invalidated reason.

Export is never represented as a User Decision action.

## 12. Exporting

Promotion kinds:

- patch export;
- local branch creation;
- workspace preservation;
- report export.

Preconditions:

- nonstale authorizing Decision;
- selected eligible Candidate where applicable;
- source/recommendation/evidence/policy hashes match;
- destination policy passes;
- active working tree is not overwritten;
- exact output can be verified idempotently.

Success enters `completed`. Destination conflicts return to `awaiting_decision`. Integrity failures enter `failed`.

## 13. Terminal states

### Completed

Has terminal event/summary, no active Epoch, Recommendation or explicit terminal reason, required Decision, sealed artifact manifest, integrity report, and cleanup result/incident.

Completed does not imply contender recommendation or export.

### Failed

Records stable failure code, phase, retained evidence, technical artifact, recovery advice, and cleanup status.

### Cancelled

Requires durable cancellation intent, cleanup attempt, active Epoch invalidation, partial-artifact quarantine, terminal event, and summary. Cleanup failure remains visible.

### Interrupted

Used when authority is lost before terminal transition. Recovery derives a disposition from verified events, artifacts, checkpoints, and native observations.

## 14. Candidate and Candidate Attempt states

Candidate summary exposes effective status. Every retry/materialization/capture cycle creates a Candidate Attempt so history is never overwritten.

Attempt states:

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

```text
registered -> materializing
materializing -> workspace_ready | failed | cancelled
workspace_ready -> installing | building | ready | failed | cancelled
installing -> building | ready | failed | cancelled
building -> ready | failed | cancelled
ready -> starting | ineligible | failed | cancelled
starting -> serving | failed | cancelled
serving -> capturing | failed | cancelled
capturing -> captured | ineligible | failed | cancelled
captured -> gating | failed
gating -> eligible | ineligible | failed
eligible | ineligible | failed | cancelled -> cleaned
```

A contender may become ineligible before capture from source/build/gate failure. A current attempt cannot be treated as retainable when its qualification fails.

## 15. Workspace states

- `allocated`;
- `materializing`;
- `verifying`;
- `ready`;
- `cleanup_requested`;
- `cleaning`;
- `cleaned`;
- `cleanup_failed`;
- `quarantined`.

Only verified `ready` workspaces execute commands. Unsafe-root workspaces are rejected and not automatically deleted.

## 16. Process states

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

`running` requires supervisor observation and containment verification. Recovery maps unverifiable identity to `identity_lost`.

## 17. Capture Epoch states

`CaptureEpochState` is imported from `schemas/domain-types.ts`:

```text
planned -> opening
opening -> active | failed | invalidating
active -> sealing | invalidating | failed
sealing -> valid | invalidating | failed
invalidating -> invalid
```

Invalidate on browser crash/disconnect/identity loss, context isolation leak, fixture/environment change, source mutation, Capture Plan mismatch, unsafe origin/ownership violation, or unscoped artifact corruption.

Candidate-local page/readiness/interaction failure does not alone invalidate the Epoch.

Invalid never returns to valid.

## 18. Capture and Gate Result states

Capture:

- `planned`, `navigating`, `settling`, `capturing`, `writing`, `verifying`, `valid`, `invalid`, `failed`.

Gate Result:

- `pending`, `running`, `passed`, `failed`, `error`, `skipped`.

A Capture becomes valid only after required artifacts commit and verify. Gate retries create superseding attempts. `skipped` never satisfies a required gate.

## 19. Evaluation, Recommendation, Decision, Promotion

Evaluation states:

- `pending`, `input_preparing`, `ready`, `running`, `output_received`, `validating`, `completed`, `rejected`, `failed`, `cancelled`.

Rejected output remains stored but creates no accepted Evidence or Recommendation.

Recommendation is immutable and uses:

- `contender_recommended`;
- `current_retained`;
- `tie`;
- `human_review_required`;
- `invalid_run`.

User Decisions are immutable append-only facts. A superseding Decision requires explicit reason and nonstale Recommendation context.

Promotion states:

- `requested`, `validating_preconditions`, `exporting`, `verifying`, `completed`, `failed`, `cancelled`, `stale`.

## 20. Checkpoints

- `validated`;
- `prepared`;
- `current_stability_checked`;
- `current_captured`;
- `candidate_capture_attempts_resolved`;
- `valid_epoch_sealed`;
- `gates_resolved`;
- `evaluation_input_committed`;
- `evaluation_output_received`;
- `recommendation_created`;
- `decision_recorded`;
- `promotion_completed`;
- `run_completed`.

A checkpoint is valid only when referenced events and artifacts verify.

## 21. Recovery targets

On startup:

1. acquire recovery lock;
2. verify event stream/hash chain and snapshot revision;
3. inspect temp/quarantine;
4. obtain native Session/process observations;
5. verify process identity and latest checkpoint artifacts;
6. invalidate Epochs whose browser continuity cannot be proven;
7. derive `RecoveryDisposition`;
8. append recovery assessment;
9. perform/present the permitted action.

Typical targets:

- before validation → draft/validating;
- sealed configuration with drift → superseding Run;
- partial preparation → preparing;
- partial Epoch → new Epoch;
- valid Epoch → gating;
- resolved gates → evaluating/awaiting decision;
- valid Recommendation → awaiting decision;
- valid Decision → export/completion;
- terminal result with cleanup failure → cleanup only.

## 22. Retry and cancellation

Retry policy follows frozen Run Configuration and failure matrix. Every retry preserves prior attempts.

Cancellation:

1. durable request;
2. stop scheduling;
3. graceful termination;
4. bounded wait;
5. containment termination;
6. ownership/endpoint verification;
7. active Epoch invalidation;
8. partial-artifact quarantine;
9. cleanup result;
10. terminal state.

There is no MVP pause/suspend transition.

## 23. Invariants and tests

Implementation enforces and tests:

- all allowed/forbidden Run transitions;
- terminal Runs never reopen;
- revisions increase monotonically;
- events drive transitions;
- contender pre-capture/local failure can lead to deterministic retention;
- current qualification failure cannot lead to retention;
- candidate-local page crash does not invalidate Epoch;
- browser disconnect invalidates full Epoch;
- no evaluator runs on invalid/ineligible evidence;
- all five Recommendation outcomes serialize;
- all six Decision actions serialize;
- export is not a Decision action;
- invalid Epoch never becomes valid;
- mixed-Epoch evidence cannot support selection;
- stale sealed inputs require superseding Run;
- cleanup status remains visible;
- user progress derives from durable state, not timers.
