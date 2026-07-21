# 10 — Run and Candidate State Machines

**Status:** Canonical implementation contract  
**Shared states and enums:** `schemas/domain-types.ts`  
**Session integration:** `spec/02-runtime-and-bootstrap.md` and `spec/12-cross-spec-normalization.md`  
**Failure behavior:** `docs/FAILURE-RECOVERY-MATRIX.md`

## 1. Purpose

Render Rivals coordinates untrusted processes, browser capture, durable files, evaluation, explicit decisions, candidate adoption handoffs, and ordinary exports. Every domain transition is represented by durable semantic events and an atomic summary projection.

UI and CLI request commands; they never assign domain state directly.

## 2. Authority

The TypeScript coordinator owns Run, Candidate Attempt, Workspace, Capture, Gate, Evaluation, Evidence, Recommendation, User Decision, Promotion, and Export Operation transitions.

The Rust supervisor owns native observations: process launch/rejection, containment, exit, cleanup, endpoint ownership, signals, resources, IPC, and Session lifecycle.

Coordinator cannot invent native success it has not observed.

## 3. Session and Run

Session and Run are separate aggregates. One Session may host sequential Run operations; one durable Run may resume under another Session.

`recoverable`, safe mode, and cleanup health are not Run states. They are recovery/session capabilities and records.

## 4. Command transaction

A side-effecting command:

1. validates authentication, schema, revision, and state;
2. allocates operation and intent IDs;
3. appends/fsyncs intent when required;
4. performs side effect;
5. records subsystem observations;
6. appends/fsyncs completion/failure transition;
7. atomically writes summary referencing that transition;
8. returns the recorded result.

Same operation ID plus same payload is idempotent. Changed payload is rejected. Command acceptance is not completion.

## 5. Run state machine

`RunState`:

- `draft`;
- `validating`;
- `ready`;
- `preparing`;
- `capturing`;
- `gating`;
- `evaluating`;
- `awaiting_decision`;
- `promoting`;
- `completed`;
- `failed`;
- `cancelled`;
- `interrupted`.

```text
draft -> validating
validating -> draft | ready | failed | cancelled | interrupted
ready -> preparing | cancelled | interrupted
preparing -> capturing | failed | cancelled | interrupted
capturing -> capturing | gating | failed | cancelled | interrupted
gating -> evaluating | awaiting_decision | failed | cancelled | interrupted
evaluating -> awaiting_decision | failed | cancelled | interrupted
awaiting_decision -> promoting | completed | cancelled | interrupted
promoting -> completed | awaiting_decision | failed | cancelled | interrupted
interrupted -> validating | preparing | capturing | gating | evaluating | awaiting_decision | promoting | failed | cancelled
```

Terminal Runs never reopen. Changed terminal work creates a superseding Run.

A general Export Operation may run against a Run in any state allowed by its own policy, including a completed Run, without reopening or changing that Run. Its lifecycle is separate from the Run lifecycle.

## 6. Draft and validation

Draft permits source, route, fixture, states, interaction, commands, gates, factors, evaluator policy, limits, and display edits.

Validation checks trust, identity, source stability, configuration, capability, Session, storage/resource admission, path/command safety, route/fixture semantics, evaluator/human-only availability, and gate/factor dependencies.

Success seals Run Configuration and Source Snapshots. Changed sealed inputs require a superseding Run.

## 7. Ready and preparing

Preparing covers Run allocation, workspace materialization/verification, dependencies, pre-capture build/test gates, browser verification, Capture Plan, and ports.

Exit to capturing requires qualified current workspace, each contender prepared or terminally ineligible, committed Capture Plan, runtime availability, and no unknown preparation process.

A contender pre-capture failure does not fail a qualified-current Run.

## 8. Capturing

- one active Capture Epoch;
- one browser per Epoch;
- sequential candidate workloads;
- current stability samples first;
- frozen matrix for current and capture-capable contender;
- fresh contexts;
- invalid Epoch Artifacts diagnostic only.

Candidate-local failures preserve other valid evidence and receive bounded local retries. Exit to gating requires a sealed valid current Epoch set and each contender either captured completely or terminally resolved as failed/ineligible.

A failed contender does not need a complete capture set.

## 9. Gating

Gate Results are append-only and phased.

- current invalid → auditable `invalid_run` or terminal failure;
- contender ineligible/current qualified → `current_retained` without aesthetic evaluator;
- both eligible/valid → evaluating;
- no eligible contender → `current_retained`;
- integrity/security ambiguity → failure/interruption.

A deterministic Recommendation enters `awaiting_decision`.

## 10. Evaluating

Coordinator builds immutable packets, verifies evidence, invokes evaluators, stores raw bytes, validates outputs/citations, performs order reversal, creates Evidence, and applies deterministic policy.

Exit requires a valid Recommendation using the canonical five outcomes.

## 11. Awaiting decision

Allowed actions:

- `accept_recommendation`;
- `retain_current`;
- `decline_recommendation`;
- `select_other_eligible_candidate`;
- `defer`;
- `invalidate_run`.

`accept_recommendation` may authorize candidate Promotion. Retain/decline/invalidate complete without adoption. Defer remains awaiting decision. Select-other is invalid in one-contender MVP.

Ordinary report or diagnostic export does not require acceptance and is represented by Export Operation, not User Decision or Promotion.

## 12. Promoting the selected contender

The Run enters `promoting` only when a nonstale User Decision authorizes a Promotion for an eligible selected Candidate.

Promotion kinds:

- patch export;
- local branch creation;
- workspace preservation.

Promotion requires a nonstale authorizing Decision, selected eligible Candidate, bound hashes, safe destination, no working-tree overwrite, and idempotent verification.

Destination conflict returns the Run to `awaiting_decision` when the Promotion cannot complete safely. A verified matching prior result may complete the same durable Operation idempotently.

General Export Operations remain independent. They may produce reports, diagnostic bundles, Run/evidence bundles, screenshots, configuration templates, and selected logs without changing the Run state or implying adoption.

## 13. Terminal states

Completed requires terminal event/summary, no active Epoch, Recommendation or explicit reason, required Decision, sealed Artifact manifest, integrity, and cleanup result/incident.

Failed records stable code, phase, retained evidence, technical Artifact, recovery advice, and cleanup.

Cancelled requires durable intent, cleanup attempt, Epoch invalidation, quarantine, terminal event, and summary.

Interrupted means authority was lost; recovery derives disposition from verified facts.

## 14. Candidate Attempt

States:

- `registered`, `materializing`, `workspace_ready`, `installing`, `building`, `ready`, `starting`, `serving`, `capturing`, `captured`, `gating`, `eligible`, `ineligible`, `failed`, `cancelled`, `cleaned`.

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

Retries create new Attempts.

## 15. Workspace and Process

Workspace states: allocated, materializing, verifying, ready, cleanup_requested, cleaning, cleaned, cleanup_failed, quarantined.

Process states: launch_requested, starting, running, exit_observed, termination_requested, terminating, terminated, launch_failed, cleanup_failed, identity_lost.

Only verified workspaces execute commands. Running requires supervisor observation and containment. PID alone never proves identity.

## 16. Capture Epoch and Capture

Epoch transitions:

```text
planned -> opening
opening -> active | failed | invalidating
active -> sealing | invalidating | failed
sealing -> valid | invalidating | failed
invalidating -> invalid
```

Browser/environment continuity failures invalidate full Epoch. Candidate-local page/readiness/interaction failures do not alone invalidate it.

Capture states: planned, navigating, settling, capturing, writing, verifying, valid, invalid, failed.

## 17. Gate and Evaluation

Gate states: pending, running, passed, failed, error, skipped. Required skipped never passes. Retries create superseding results.

Evaluation states: pending, input_preparing, ready, running, output_received, validating, completed, rejected, failed, cancelled.

Rejected raw output remains stored but creates no accepted Evidence or Recommendation.

## 18. Recommendation and Decision

Recommendation is immutable with outcomes:

- `contender_recommended`;
- `current_retained`;
- `tie`;
- `human_review_required`;
- `invalid_run`.

User Decisions are immutable append-only facts. Reversal requires an explicit superseding Decision with reason and nonstale context.

## 19. Promotion state machine

- `requested`;
- `validating_preconditions`;
- `exporting`;
- `verifying`;
- `completed`;
- `failed`;
- `cancelled`;
- `stale`.

Promotion always has Candidate and authorizing Decision.

## 20. Export Operation state machine

- `requested`;
- `validating_preconditions`;
- `exporting`;
- `verifying`;
- `completed`;
- `failed`;
- `cancelled`.

Export Operation records source entities, redaction/omission policy, output Artifacts, and verification. It never changes Recommendation/Decision semantics.

## 21. Checkpoints

- validated;
- prepared;
- current_stability_checked;
- current_captured;
- candidate_capture_attempts_resolved;
- valid_epoch_sealed;
- gates_resolved;
- evaluation_input_committed;
- evaluation_output_received;
- recommendation_created;
- decision_recorded;
- promotion_completed when applicable;
- run_completed.

Independent post-completion Export Operations are not Run checkpoints.

## 22. Recovery

Recovery verifies lock, events, snapshot, temp/quarantine, native observations, process identities, checkpoint Artifacts, and Epoch continuity; then derives `RecoveryDisposition`.

Typical targets:

- before validation → draft/validating;
- sealed drift → superseding Run;
- partial preparation → preparing;
- partial Epoch → new Epoch;
- valid Epoch → gating;
- resolved gates → evaluating/decision;
- Recommendation → decision;
- Decision → Promotion/completion;
- interrupted Promotion with verified resumable proof → promoting;
- terminal result with cleanup failure → cleanup only.

## 23. Retry and cancellation

Retry policy is frozen and preserves attempts. There is no MVP pause/suspend.

Cancellation stops scheduling, performs graceful then forced verified termination, verifies endpoints, invalidates active Epoch, quarantines partial Artifacts, writes cleanup, and enters terminal state.

## 24. Invariants and tests

- terminal Runs never reopen;
- events drive revisions;
- contender local/pre-capture failure can yield deterministic retention;
- current failure cannot yield retention;
- page crash local, browser disconnect Epoch-wide;
- no evaluator on invalid/ineligible evidence;
- Promotion always Candidate + Decision;
- general Export Operation may have no Candidate;
- report/diagnostic export never implies adoption;
- all canonical Recommendation/Decision values serialize;
- export is not a Decision action;
- invalid Epoch never valid;
- mixed-Epoch evidence rejected;
- sealed drift requires superseding Run;
- cleanup remains visible.
