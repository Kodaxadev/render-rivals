# 10 — Run and Candidate State Machines

**Status:** Canonical implementation contract  
**Scope:** Authoritative lifecycle states, transitions, ownership, checkpoints, retries, interruption, cancellation, and recovery

## 1. Purpose

Render Rivals coordinates untrusted child processes, browser capture, persistent files, evaluator work, and explicit user decisions. Informal status flags would allow the UI, coordinator, and supervisor to disagree about what happened.

This specification defines the authoritative state machines. Every state change must be represented by a durable event and reflected in an atomic summary snapshot. The UI requests commands and renders state; it never assigns domain state directly.

## 2. State authority

### 2.1 Coordinator

The TypeScript coordinator owns domain transitions for:

- Run;
- Candidate;
- Candidate Workspace;
- Capture Plan;
- Capture Epoch;
- Capture;
- Gate Result;
- Evaluation;
- Recommendation;
- User Decision;
- Promotion.

### 2.2 Supervisor

The Rust supervisor owns observed process facts:

- process launch accepted or rejected;
- containment assignment;
- process exit;
- process-tree cleanup;
- endpoint ownership;
- signal receipt;
- resource-limit breach;
- native IPC loss.

The coordinator consumes supervisor observations and applies domain transitions. It may not invent a successful launch, exit, cleanup, or endpoint owner.

### 2.3 UI

The UI may issue commands such as start, cancel, retry, accept, decline, or export. A command acknowledgment is not a completed transition. The UI updates only after reading the durable resulting state.

## 3. Transition transaction

A conforming transition uses this order:

1. validate command against current state and expected revision;
2. allocate event ID and next sequence;
3. append an intent or requested event when the command triggers a side effect;
4. fsync the event stream according to persistence policy;
5. atomically write the new summary snapshot with incremented revision;
6. perform the side effect;
7. append observed success or failure event;
8. atomically write the resulting state and durable checkpoint.

The system must distinguish:

- requested;
- started or observed;
- completed;
- failed.

A process launch request is not equivalent to an observed running process.

## 4. Idempotency

Every command that may be retried carries an `operationId`. The coordinator records the operation ID and result.

Rules:

- repeating a completed operation returns the recorded result;
- repeating an in-progress operation attaches to the existing operation;
- repeating a failed operation requires a new attempt ID unless policy says the failure was transport-only;
- operation IDs are scoped to one Run;
- side effects such as branch creation use destination preconditions and must not duplicate output.

## 5. Run state machine

### 5.1 States

| State | Meaning |
|---|---|
| `draft` | User-editable run definition; no sealed configuration |
| `validating` | Configuration, sources, platform, and storage are being checked |
| `ready` | Immutable run configuration and source snapshots are valid |
| `preparing` | Candidate workspaces and runtime prerequisites are being prepared |
| `capturing` | One capture epoch is active or being created |
| `gating` | Required and advisory gates are being resolved |
| `evaluating` | Valid artifacts are being evaluated |
| `awaiting_decision` | Recommendation exists and awaits user action |
| `exporting` | A user-requested promotion/export is running |
| `completed` | Successful terminal outcome, with or without promotion |
| `failed` | Unrecoverable terminal failure for this Run |
| `cancelled` | User- or system-requested terminal cancellation completed |
| `interrupted` | Unexpected shutdown or lost control left the Run nonterminal |

`recoverable` is not a state. It is a `recoveryDisposition` attached to `interrupted` or a recoverable failure.

### 5.2 Allowed transitions

```text
draft -> validating
validating -> draft | ready | failed | cancelled | interrupted
ready -> preparing | cancelled | interrupted
preparing -> capturing | failed | cancelled | interrupted
capturing -> gating | failed | cancelled | interrupted
capturing -> capturing          # new epoch after invalidation

gating -> evaluating | failed | cancelled | interrupted

evaluating -> awaiting_decision | failed | cancelled | interrupted
awaiting_decision -> exporting | completed | cancelled | interrupted
exporting -> completed | awaiting_decision | failed | cancelled | interrupted
interrupted -> validating | preparing | capturing | gating | evaluating | awaiting_decision | failed | cancelled
```

Terminal states are `completed`, `failed`, and `cancelled`. No transition leaves a terminal state. A retry after a terminal state creates a new Run with `supersedesRunId`.

### 5.3 Draft

Entry:

- new run wizard opened;
- duplicated template loaded;
- validation returned user-correctable configuration errors.

Allowed mutations:

- target route;
- source inputs;
- commands;
- capture settings;
- gates;
- evaluator;
- limits;
- display name.

Exit guard to `validating`:

- current source selected;
- at least one contender selected;
- route, readiness URL, commands, and storage root present;
- no unresolved destructive confirmation.

### 5.4 Validating

The coordinator verifies:

- project and source paths;
- Git and source manifests;
- configuration resolution;
- identifier uniqueness;
- platform capabilities;
- supervisor session;
- storage writability and capacity;
- command syntax;
- route and origin policy;
- evaluator availability;
- factor-weight total;
- runtime limits.

Outcomes:

- `draft` for user-correctable configuration or source selection problems;
- `ready` after immutable configuration and snapshots are committed;
- `failed` for integrity, security, or unsupported-environment failures that cannot be corrected in the current Run;
- `cancelled` on explicit cancellation after cleanup;
- `interrupted` if the coordinator loses control unexpectedly.

Durable checkpoint: `validated`.

### 5.5 Ready

`ready` is a durable pause point. No candidate process exists.

Transition to `preparing` requires:

- current Run revision matches the command precondition;
- sealed Run Configuration hash verifies;
- source snapshots still match declared source identities or have already been copied into immutable owned input storage;
- no other Run owns the exclusive execution slot in the MVP scheduler.

### 5.6 Preparing

Work includes:

- allocate owned run directories;
- materialize workspaces;
- verify workspace manifests;
- resolve/install dependencies according to policy;
- establish browser runtime;
- produce Capture Plan;
- reserve allowed local ports.

The Run remains `preparing` while individual Candidates move through workspace and build states.

Exit to `capturing` requires:

- current and contender workspaces are ready;
- required build preparation succeeded;
- Capture Plan is committed;
- no process from preparation remains unexpectedly alive;
- browser runtime is available.

Durable checkpoint: `prepared`.

### 5.7 Capturing

The Run is `capturing` while an epoch is opening, active, sealing, or being invalidated.

Rules:

- at most one epoch active;
- candidates execute sequentially;
- current is captured before the contender in the MVP;
- browser disconnect invalidates the whole active epoch;
- a retry creates a new epoch and recaptures every candidate;
- failed candidate startup may end the epoch without declaring it valid;
- no artifact from an invalid epoch may feed evaluation.

Exit to `gating` requires a sealed valid epoch with complete required captures for current and contender.

Durable checkpoint: `valid_epoch_sealed`.

### 5.8 Gating

Required gates run from verified capture and process artifacts.

Outcomes:

- `evaluating` when current and contender are eligible;
- `awaiting_decision` may not be entered directly;
- `failed` if the current reference is invalid and policy cannot recover;
- `completed` is not used for an ineligible contender; instead the coordinator creates a deterministic current-retained recommendation through an evaluation-bypass record, or enters `evaluating` with an eligibility-only evaluator according to policy.

For the MVP, an ineligible contender produces a Recommendation of `current_retained` with reason `contender_ineligible`, without invoking the visual evaluator. The Run then enters `awaiting_decision`.

Durable checkpoint: `gates_resolved`.

### 5.9 Evaluating

The coordinator:

- builds an immutable evaluation input manifest;
- verifies every citation-eligible artifact;
- invokes the configured evaluator through the supervisor when external;
- stores raw output;
- validates schema, factor coverage, confidence, and citations;
- may retry according to policy;
- creates immutable Evidence Records;
- applies the deterministic recommendation policy.

Exit to `awaiting_decision` requires a valid Recommendation.

Durable checkpoint: `recommendation_created`.

### 5.10 Awaiting decision

No candidate process or browser process should remain alive unless explicitly retained for preview under a separate supervised preview session.

User commands:

- accept recommendation;
- keep current;
- decline;
- defer;
- request export when allowed;
- cancel the Run.

Outcomes:

- accepted contender recommendation plus export request -> `exporting`;
- accepted current-retained outcome -> `completed`;
- decline or keep current -> `completed`;
- defer -> remains `awaiting_decision` with an appended User Decision;
- close application unexpectedly -> `interrupted`, recoverable directly to `awaiting_decision`.

### 5.11 Exporting

Export types in the MVP are patch and local branch.

Exit:

- successful export -> `completed`;
- recoverable destination conflict or changed precondition -> `awaiting_decision` with failed Promotion record;
- unrecoverable integrity failure -> `failed`;
- cancellation -> `cancelled` after cleanup.

Durable checkpoint: each Promotion attempt is independently durable.

### 5.12 Completed

A completed Run has:

- terminal event;
- final Run summary;
- process cleanup verified;
- no active epoch;
- recommendation or explicit terminal reason;
- at least one User Decision unless completed by policy after an ineligible contender and configured auto-retain behavior;
- artifact manifest sealed;
- integrity summary.

Completed does not imply a contender was recommended or exported.

### 5.13 Failed

A Run enters `failed` only when the current attempt cannot safely continue or recover.

Required fields:

- failure code;
- phase;
- user-facing summary;
- technical details artifact;
- retained evidence declaration;
- recovery recommendation;
- cleanup result.

If the same logical work can be retried, a new Run is created from the last valid configuration and source snapshots.

### 5.14 Cancelled

Cancellation is complete only after:

- supervisor acknowledges cancellation intent;
- owned process tree is terminated or cleanup failure is recorded;
- active epoch is invalidated;
- open artifact writes are abandoned or quarantined;
- terminal cancellation event and state are durable.

The UI may show `cancelling` as a transient presentation substate, but `cancelling` is not a persisted Run state.

### 5.15 Interrupted

A Run is `interrupted` when normal authority was lost before a terminal transition, including:

- coordinator crash;
- application crash;
- operating-system shutdown;
- supervisor IPC loss;
- power loss discovered on restart;
- stale active-state snapshot without a matching live session.

On recovery, the coordinator computes `recoveryDisposition`:

- `resume_from_checkpoint`;
- `restart_capture_epoch`;
- `retry_current_phase`;
- `await_user_correction`;
- `cannot_recover`.

The recovery target is never inferred from the state name alone. It is derived from verified artifacts, event sequence, process observations, and checkpoint records.

## 6. Candidate state machine

### 6.1 States

| State | Meaning |
|---|---|
| `registered` | Candidate identity and source snapshot exist |
| `materializing` | Owned workspace is being created |
| `workspace_ready` | Workspace manifest verifies |
| `installing` | Dependency installation is running |
| `building` | Optional build/preparation command is running |
| `ready` | Candidate can be launched for capture |
| `starting` | Development process launch requested |
| `serving` | Process is alive and expected endpoint ownership verifies |
| `capturing` | Browser is producing capture artifacts |
| `captured` | Complete capture group exists in the active epoch |
| `gating` | Candidate gates are running |
| `eligible` | All required gates pass |
| `ineligible` | One or more required gates fail or error |
| `failed` | Candidate preparation or execution failed unrecoverably for the attempt |
| `cancelled` | Candidate work cancelled |
| `cleaned` | Runtime processes ended and workspace cleanup policy completed |

### 6.2 Allowed transitions

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
eligible -> cleaned
ineligible -> cleaned
failed -> cleaned
cancelled -> cleaned
```

A new capture epoch may reuse a prepared candidate workspace. The Candidate returns from `captured`, `eligible`, or `ineligible` to a new execution attempt only through a new Candidate Attempt record; the persisted Candidate summary exposes the effective attempt. The historical attempt states remain in events.

### 6.3 Eligibility

`eligible` is derived, not manually assigned.

- every required gate must have an effective `passed` result;
- advisory failures do not change eligibility;
- a required `error` is ineligible unless a retry supersedes it;
- invalid-epoch capture results cannot support a passed capture-completeness gate;
- source-policy violations are always required in the MVP.

## 7. Workspace state machine

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

Rules:

- only `ready` workspaces may execute project commands;
- a manifest mismatch moves to `quarantined`;
- cleanup failure never causes evidence deletion;
- recovery verifies a workspace before reuse;
- a workspace outside the owned root is rejected, not cleaned automatically.

## 8. Process state machine

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

Rules:

- PID is recorded only after supervisor observation;
- `running` requires containment membership verification;
- service readiness is separate from process running;
- process exit is immutable once observed;
- on recovery, unverifiable identity becomes `identity_lost`, never `running`;
- cleanup uses the containment boundary rather than walking a stale PID list where strong containment is available.

## 9. Capture epoch state machine

States:

- `planned`;
- `opening`;
- `active`;
- `sealing`;
- `valid`;
- `invalidating`;
- `invalid`;
- `failed`.

Transitions:

```text
planned -> opening
opening -> active | failed | invalidating
active -> sealing | invalidating | failed
sealing -> valid | invalidating | failed
invalidating -> invalid
```

Terminal epoch states are `valid`, `invalid`, and `failed`.

Invalidation triggers include:

- browser disconnect;
- browser crash;
- context identity loss;
- environment fingerprint mismatch;
- candidate source mutation;
- required capture artifact corruption;
- manual invalidation;
- capture-plan mismatch;
- local-origin ownership violation.

A failed candidate process does not automatically imply browser invalidation, but the epoch cannot become valid unless every required capture completes. Policy records whether the epoch is `failed` or `invalid` based on whether comparability was broken.

## 10. Capture state machine

States:

- `planned`;
- `navigating`;
- `settling`;
- `capturing`;
- `writing`;
- `verifying`;
- `valid`;
- `invalid`;
- `failed`.

A Capture becomes `valid` only after all required artifacts are atomically committed and hashes verify. Epoch invalidation changes the Capture's effective evidence usability to invalid without rewriting the immutable original completion record.

## 11. Gate-result state machine

States:

- `pending`;
- `running`;
- `passed`;
- `failed`;
- `error`;
- `skipped`.

Terminal states are passed, failed, error, and skipped.

- `failed` means the rule executed and the condition was not satisfied;
- `error` means the rule could not produce a trustworthy result;
- `skipped` requires an explicit policy reason and cannot satisfy a required gate;
- retries create new Gate Result attempts linked by `supersedesResultId`.

## 12. Evaluation state machine

States:

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

`rejected` means evaluator output exists but failed schema, citation, provenance, or policy validation. A retry creates a new Evaluation attempt.

A completed Evaluation is immutable.

## 13. Recommendation state machine

A Recommendation is created atomically in a final outcome and does not transition internally.

Allowed outcomes:

- `contender_recommended`;
- `current_retained`;
- `human_review_required`.

A later valid Evaluation creates a new Recommendation that references and supersedes the prior one. The prior record remains.

## 14. Decision state machine

User Decision actions are append-only facts:

- `accepted`;
- `declined`;
- `kept_current`;
- `deferred`;
- `exported_without_acceptance` where policy permits.

A deferred decision may be followed by another decision. Accepted or declined decisions are final for that Recommendation. Changing the choice requires a new Recommendation or an explicit superseding decision with a reason; history is never rewritten.

## 15. Promotion state machine

States:

- `requested`;
- `validating_preconditions`;
- `exporting`;
- `verifying`;
- `completed`;
- `failed`;
- `cancelled`.

Promotion preconditions include:

- candidate source and exported content hashes verify;
- destination is allowed;
- branch or patch destination does not violate overwrite policy;
- current project working-tree precondition matches the recorded value when required;
- decision authorizes the candidate.

A failed Promotion may be retried with a new Promotion ID.

## 16. Checkpoint model

Canonical checkpoints are:

| Checkpoint | Minimum durable facts |
|---|---|
| `validated` | sealed config, source snapshots, platform capability report |
| `prepared` | verified workspaces, capture plan, runtime availability |
| `current_captured` | complete current capture group in active epoch |
| `contender_captured` | complete contender capture group in active epoch |
| `valid_epoch_sealed` | valid epoch summary and verified capture artifacts |
| `gates_resolved` | effective gate results and eligibility |
| `evaluation_input_committed` | immutable evaluator input manifest |
| `evaluation_output_received` | raw output artifact, even if invalid |
| `recommendation_created` | valid evidence and immutable recommendation |
| `decision_recorded` | append-only user decision |
| `promotion_completed` | verified export record |
| `run_completed` | terminal summary, cleanup result, sealed manifest |

A checkpoint is valid only if its referenced artifacts and events verify.

## 17. Recovery algorithm

On startup, for every nonterminal Run:

1. acquire the run recovery lock;
2. read and verify the event stream sequence and hash chain;
3. read the latest Run snapshot and compare its revision to events;
4. inspect temporary and quarantined files;
5. ask the supervisor for live session and containment observations;
6. verify process identities rather than trusting stored PIDs;
7. verify the latest checkpoint and all referenced artifact hashes;
8. invalidate any epoch whose browser continuity cannot be proven;
9. derive `recoveryDisposition`;
10. append a recovery assessment event;
11. present or execute the allowed recovery action.

Automatic recovery is allowed only when it cannot change user intent or reuse questionable evidence.

## 18. Recovery targets by checkpoint

- before `validated`: return to `draft` or `validating`;
- after `validated`, before `prepared`: resume or restart `preparing`;
- after `prepared`, before a valid epoch: start a new epoch;
- after `current_captured` but before valid epoch: recapture current and contender in a new epoch;
- after `valid_epoch_sealed`, before gates: resume `gating`;
- after `gates_resolved`, before evaluator input: resume `evaluating`;
- after `evaluation_input_committed`: retry or reattach evaluator only if process identity and operation ID verify; otherwise create new Evaluation attempt;
- after valid evaluator output: revalidate and apply deterministic policy;
- after `recommendation_created`: return directly to `awaiting_decision`;
- after `decision_recorded`: resume pending export or complete;
- after `promotion_completed`: verify and complete.

## 19. Cancellation policy

Cancellation is cooperative first and forceful second.

1. append cancellation-requested event;
2. stop scheduling new work;
3. request graceful termination through supervisor;
4. wait configured grace period;
5. terminate the owned containment boundary;
6. verify no owned endpoints or processes remain;
7. invalidate active epoch;
8. quarantine partial artifacts;
9. append cleanup result;
10. enter `cancelled`.

If cleanup verification fails, the Run still becomes `cancelled` only when policy records `cleanupIncomplete: true` and surfaces a system-level diagnostic requiring attention. Security-critical escaped processes may instead force `failed` with a cleanup incident.

## 20. Retry policy

Retries are bounded and phase-specific.

- source validation: no automatic retry for changed content;
- install/build: zero automatic retries by default;
- readiness polling: multiple polls within one attempt, not multiple process launches;
- browser launch: one automatic retry before the epoch becomes failed;
- capture artifact write: one retry only if no canonical artifact was committed;
- evaluator transport failure: one automatic retry with the same immutable input;
- evaluator invalid output: no blind automatic retry unless the adapter has an explicit corrective retry mode;
- export: no automatic retry for destination conflicts.

Every retry creates an attempt record and preserves prior output.

## 21. Invariants

The implementation must enforce:

- terminal Run states never reopen;
- state revisions increase monotonically;
- transitions are driven by durable events;
- no evaluator runs before a valid epoch and resolved eligibility;
- no recommendation references rejected evidence;
- no promotion runs without an explicit decision or documented policy exception;
- invalid epochs never become valid;
- current and contender captures used together share one epoch;
- browser continuity is never inferred after coordinator restart;
- cleanup status is never hidden by a successful business outcome;
- user-visible progress derives from domain and process state, not timers.