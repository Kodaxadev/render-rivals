# 19 — Operation Ledger, Idempotency, and Reconciliation

**Status:** Canonical implementation contract  
**Scope:** Durable command intent, Operation record ownership/storage, request hashing, API/supervisor idempotency, crash reconciliation, side-effect proof, status projection, retention, and cleanup  
**Operation types:** `schemas/operation-types.ts`  
**API:** `spec/17-local-api-envelopes-operations-and-pagination.md`  
**Store:** `spec/11-artifact-event-and-schema-contracts.md`  
**State/recovery:** `spec/10-run-and-candidate-state-machines.md`

## 1. Purpose

Every side-effecting dashboard/CLI command has an `OperationId`, and API clients poll `/api/v1/operations/:operationId`. The supervisor also relies on operation idempotency to avoid duplicate process launches or cleanup. A string ID and in-memory map are insufficient: after a crash, Render Rivals must determine whether intent was accepted, a side effect began, the side effect completed, or the record alone is stale.

This specification defines one operation ledger that threads a command from browser/CLI acceptance through coordinator events and native observations without pretending the Operation record replaces domain state.

## 2. Operation meaning

An Operation is one idempotent request to perform a side effect under one canonical command, target, expected revision, payload, and policy context.

It is not:

- a Run;
- a Candidate Attempt;
- a Process Record;
- a supervisor request ID;
- an Event;
- a retry counter;
- a generic task queue job;
- evidence that the requested side effect succeeded.

One Operation may create or reference multiple domain entities/processes/artifacts, but it has one command semantic and one canonical request hash.

## 3. Shared type authority

`schemas/operation-types.ts` defines:

- `OperationScope`;
- `OperationState`;
- `OperationResultReference`;
- `OperationRecord`.

`OperationId` remains defined in `schemas/domain-types.ts`. `ApiCommandName` remains defined in `schemas/api-types.ts`.

Generated runtime schemas must reject structurally valid records that violate this specification.

## 4. Scope and ownership

Operations have exactly one scope:

### Installation

Used when no Project exists or the action is installation-wide:

- Project registration;
- installation diagnostic Export;
- installation cleanup/maintenance where applicable.

Canonical location:

```text
<data-root>/operations/<operation-id>.json
```

### Project

Used when a Project exists but no Run owns the action:

- Run creation;
- Project doctor;
- Project-scoped configuration/template/export operations.

Canonical location:

```text
<data-root>/projects/<project-id>/operations/<operation-id>.json
```

### Run

Used for Run lifecycle, Decision, Promotion, Run Export, Candidate retry, recovery, and Run cleanup:

```text
<data-root>/projects/<project-id>/runs/<run-id>/operations/<operation-id>.json
```

### Session

Used only for transient browser/native Session actions whose useful lifetime ends with the Session, such as browser logout or native-only cleanup negotiation:

```text
<session-root>/operations/<operation-id>.json
```

Session-scoped records are not canonical Run history. Any Session operation that affects a durable Run must also produce the required Run Event/entity/cleanup records before being considered complete.

## 5. Schema registration

Required schema name:

```text
render-rivals/operation
```

The common entity envelope uses:

- `id = op_<ulid>`;
- mutable `revision` starting at 1;
- canonical timestamps;
- `data` containing `OperationRecord` semantics;
- extension policy as defined by schema.

Operation records are mutable summaries backed by canonical Events/observations where their actions affect a Run or Project. They are never the only copy of a User Decision, Promotion, Export, process exit, or Run transition.

## 6. Canonical request hash

Before acceptance, construct a strict canonical request value containing:

```json
{
  "command": "run.cancel",
  "scope": "run",
  "projectId": "prj_...",
  "runId": "run_...",
  "targetEntityId": "run_...",
  "expectedRevision": 7,
  "payloadHash": "sha256:...",
  "policySnapshotId": "pol_..."
}
```

Rules:

- command and route target agree under `spec/17`;
- payload is validated/redacted/classified before hashing;
- `payloadHash` is SHA-256 of canonical payload JSON;
- `requestHash` is SHA-256 of the canonical request value;
- Session/browser credential, CSRF marker, pairing code, native nonce, raw secret values, transport retry metadata, and wall-clock receipt time are excluded;
- secret references/presence/policy may be included without raw secret;
- path inputs use canonical normalized representation appropriate to the command;
- semantically identical accepted retries produce identical request hash;
- any changed command/scope/target/revision/payload/policy produces a different request hash.

`OperationId` reuse with a different request hash is `API_OPERATION_REPLAY_MISMATCH` and no side effect occurs.

## 7. Acceptance transaction

A command is accepted only after:

1. dashboard/CLI/native caller authentication/authority passes;
2. command/route/payload schema validates;
3. expected revision and legal state validate;
4. capability/admission/security policy validates;
5. Operation ID uniqueness/replay is checked in the correct scope;
6. request/payload hashes are calculated;
7. Operation record revision 1 is atomically committed as `accepted`;
8. required domain intent Event is appended when the command affects a durable aggregate;
9. the accepted API/CLI response is produced.

If operation record commit or required intent Event cannot be made durable, the command is not accepted and the side effect must not begin.

For event-first domain transitions, the exact relationship between Operation acceptance and intent Event follows the crash-safe commit protocol: recovery must be able to detect either committed boundary and reconcile without duplicate side effect. The implementation records both IDs/hashes so neither is guessed.

## 8. State machine

```text
accepted -> running | cancelled | failed | interrupted
running -> reconciling | completed | failed | cancelled | interrupted
reconciling -> completed | failed | cancelled | interrupted
interrupted -> reconciling | failed | cancelled
```

Terminal states:

- `completed`;
- `failed`;
- `cancelled`.

`interrupted` is nonterminal until recovery decides whether proof permits reconciliation or the operation must fail/cancel. It may remain visible across Sessions.

State rules:

- `accepted`: durable intent, side effect not observed started;
- `running`: execution/side effect start observed;
- `reconciling`: recovery is verifying external/native/filesystem effect after authority loss or ambiguous record ordering;
- `completed`: exact intended result verified and canonical domain records committed;
- `failed`: operation cannot safely produce requested result; failure code recorded;
- `cancelled`: cancellation intent won before successful result; retained partial diagnostic facts explicit;
- `interrupted`: Session/coordinator authority was lost before a trustworthy terminal conclusion.

A state revision increments exactly once per successful snapshot replacement. Every transition has a linked Event/observation appropriate to scope.

## 9. Timestamp and terminal invariants

- `acceptedAt` required in every record;
- `startedAt` null in `accepted`, optional in pre-start failed/cancelled/interrupted, required after execution was observed;
- `terminalAt` required only for completed/failed/cancelled;
- `lastUpdatedAt` equals the latest successful operation snapshot time;
- wall-clock timestamps use `CanonicalUtcTimestamp`;
- durations/timeouts derive from monotonic observations and are not inferred from timestamp subtraction alone;
- terminal state never returns to active;
- retry after terminal failure/cancellation uses a new Operation ID, except transport replay of the same idempotent request returns the recorded result.

## 10. Result and failure invariants

### Completed

Requires:

- `result` appropriate to command;
- every referenced entity/artifact/result path exists and verifies;
- `failureCode = null`;
- `recoveryDisposition = null` unless the command itself is a completed recovery assessment result;
- canonical domain completion Event/entity records committed;
- no claim of source/process/filesystem success based solely on exit code or stored PID.

### Failed

Requires:

- registered `failureCode`;
- `result = null` unless command schema permits an explicit diagnostic/partial result that cannot be mistaken for success;
- no completed side-effect claim;
- recovery advice through API error/Run recovery records, not free-form operation mutation.

### Cancelled

Requires:

- cancellation request/observation;
- cleanup attempt/status where resources were started;
- no success result;
- partial Artifacts/entities retained only as diagnostic/incomplete;
- operation cancellation does not automatically mean Run terminal cancellation unless the Run reducer records it.

### Interrupted

Requires:

- loss-of-authority observation or stale active Operation detected;
- no unverified result adoption;
- `recoveryDisposition` where one can be derived;
- transition to `reconciling` before an external effect is adopted.

## 11. Side-effect proof

`sideEffectProofArtifactIds` references immutable evidence needed to reconcile non-transactional effects, for example:

- process launch/native identity observation;
- branch ref/commit/tree observation;
- exported file path/hash/destination manifest;
- atomic rename/output manifest;
- listener ownership observation;
- cleanup boundary/listener scan;
- migration input/output hashes;
- import extraction/adoption manifest.

Proof requirements are command-specific. A log message, exit code, expected path, stored PID, or user-facing success toast is never sufficient alone where the domain specification requires stronger verification.

Proof Artifacts are retained as long as needed to interpret the Operation and any resulting entity. Redaction/sensitivity policy applies.

## 12. Supervisor idempotency

The coordinator forwards the same Operation ID or a deterministic child operation identity according to the versioned supervisor method schema.

For each side-effecting supervisor request:

- Rust registers operation/method/canonical payload hash before process/group effect;
- same Operation ID + same method/payload returns/attaches to recorded native result;
- changed replay is rejected;
- process launch never creates a second root for transport retry;
- cleanup retry re-verifies current ownership/resources and is idempotent;
- native in-memory replay tables are persisted in Session root where required for crash diagnostics;
- durable Run reconciliation relies on canonical Operation/domain/native observations, not on an unavailable old Rust process alone.

A single high-level Operation may issue multiple supervisor methods. Each method request has distinct request ID/sequence and explicit relationship to the owning Operation. Child process/group IDs remain stable for that accepted launch attempt.

## 13. API status projection

`GET /api/v1/operations/:operationId` reads the authoritative Operation record plus verified linked domain/native state and returns `ApiOperationStatus`.

API `ApiOperationState` includes:

- `accepted`;
- `running`;
- `reconciling`;
- `completed`;
- `failed`;
- `cancelled`;
- `interrupted`.

Projection rules:

- does not optimistically advance state from UI timers;
- exposes current revision and legal recovery/commands when safe;
- `resultPath` is same-origin API/application path, not filesystem path;
- Session-scoped logout may terminate authentication before a later status poll; the response may be synchronous and no post-logout status access is promised;
- status for durable Project/Run Operation remains queryable after a new paired Session if permissions/ownership match;
- unknown/unauthorized ID remains nondisclosing 404.

## 14. Recovery scan

On startup/recovery:

1. enumerate nonterminal Operation records in installation/Project/Run scope;
2. validate schema/revision/request hash;
3. correlate linked intent/completion Events;
4. inspect target entity snapshots/checkpoints;
5. inspect native/process/cleanup observations;
6. inspect command-specific external side-effect proof;
7. classify:
   - never started;
   - active resource still verified;
   - exact result completed but record unfinished;
   - partial/ambiguous effect;
   - no recoverable effect;
8. write recovery assessment Event/Artifact;
9. transition to `reconciling`, terminal state, or permitted resume;
10. never reissue a non-idempotent effect merely because status was nonterminal.

Examples:

- branch exists at exact expected commit/tree and operation proof matches → reconcile completed;
- destination file exists with exact operation manifest/hash → reconcile completed;
- process PID exists but native identity/group does not verify → do not adopt; cleanup/recovery path;
- Artifact canonical file exists without registration → quarantine until exact operation/Event proof;
- accepted build with no process-start observation → may start under same Operation only if command method contract explicitly supports resuming pre-side-effect state; otherwise create a new Attempt/Operation according to reducer.

## 15. Retries and supersession

There are three distinct cases:

### Transport replay

Same Operation ID and request hash. Returns/attaches to existing Operation. No new attempt or effect.

### Semantic retry

User/system intentionally retries after terminal/transient failure. Creates a new Operation ID and, where domain semantics require, new Candidate/Evaluation/Promotion/Export Attempt ID. The new record references the prior attempt through the entity-specific retry/supersession field, not by reusing Operation ID.

### Superseding command

A later command changes the desired state/decision. Creates a new Operation and may set `supersededByOperationId` on the prior nonterminal/obsolete Operation only when the command/state policy permits it. Supersession is not retroactive deletion and cannot erase an already completed side effect.

Operation supersession chains are acyclic and scope-consistent.

## 16. Locks and concurrency

- Operation record creation uses exclusive create;
- mutation uses expected Operation revision;
- owning Run/Project lock and state revision are still required for aggregate changes;
- Operation lock does not grant permission to mutate the aggregate;
- two different Operation IDs racing the same state are resolved by aggregate revision/state/destination preconditions;
- loser records a conflict failure without side effect;
- cleanup/security authority may preempt ordinary scheduling but records distinct Operation/observation;
- deadlock order is specified in implementation: installation/project/run aggregate lock before operation mutation where both are required, with bounded acquisition and no waiting while holding native I/O callbacks.

## 17. Retention and deletion

- Operation records required to interpret retained entities/events/results are retained with those records;
- completed read-only query projections may be rebuilt but Operation request/result/proof cannot be the only data deleted while its Promotion/Export/Decision/Run remains;
- Session-only Operation records may be deleted with Session root after durable effects/diagnostics are reconciled;
- API operation history is paginated and may omit records removed by permitted retention, but canonical retained entities remain understandable;
- whole Run deletion removes Run-scoped Operations through the Run deletion protocol;
- Project/installation operation deletion follows ownership and no-active-operation checks;
- secrets are never stored in Operation payload/result; raw original request body is not retained by default—validated payload hash and command-specific canonical data are.

## 18. Error codes

Use existing stable codes where applicable:

- `API_OPERATION_REPLAY_MISMATCH`;
- `API_OPERATION_NOT_FOUND`;
- `ENTITY_REVISION_CONFLICT`;
- command/domain-specific failure;
- Session interruption codes;
- storage/integrity/cleanup codes.

No generic `OPERATION_FAILED` hides a more specific registered cause. An internal unexpected failure records the most accurate component/domain code and a bounded diagnostic reference.

## 19. Storage amendments

`spec/11` canonical directory layout is amended to include:

```text
<data-root>/
  operations/
    <operation-id>.json
  projects/<project-id>/
    operations/
      <operation-id>.json
    runs/<run-id>/
      operations/
        <operation-id>.json
```

The schema registry includes `render-rivals/operation`.

Run/Project Event registries include operation lifecycle facts such as:

- `operation.accepted`;
- `operation.started`;
- `operation.reconciliation_started`;
- `operation.completed`;
- `operation.failed`;
- `operation.cancelled`;
- `operation.interrupted`;
- `operation.superseded`.

High-volume native progress is not duplicated as canonical operation Events.

## 20. Required tests

- operation scope/path/schema selection for installation/Project/Run/Session;
- exclusive creation and same-ID exact replay;
- changed command/target/revision/payload/policy replay rejection;
- no side effect before durable acceptance/intent boundary;
- crash injection after every acceptance/start/effect/proof/completion step;
- API status state/timestamp/result/error projection;
- interrupted/reconciling recovery;
- branch/export/process/Artifact/cleanup exact proof adoption;
- ambiguous effect fails closed and does not blind retry;
- aggregate revision race produces one winner/no duplicate effect;
- supervisor transport retry launches one process only;
- semantic retry creates new Operation and entity Attempt lineage;
- supersession acyclic and cannot erase completed side effect;
- Session Operation cleanup does not remove required Run proof;
- Operation retention/deletion preserves retained entity interpretation;
- secrets absent from record/request hash inputs/results/logs;
- operation record alone never overrides contradictory verified domain Events/native facts.

## 21. Nonconforming behavior

- in-memory-only idempotency for durable commands;
- API status path with no durable backing;
- reusing Operation ID for a changed payload or semantic retry;
- beginning a side effect before durable acceptance boundary;
- marking completed from process exit/path existence without required proof;
- blindly reissuing branch/export/process effects after crash;
- treating Operation record as sole User Decision/Promotion/Run transition;
- losing Operation lineage on retry/supersession;
- omitting interrupted/reconciling state where outcome is ambiguous;
- storing raw secrets/browser credentials in Operation record;
- deleting proof needed to interpret retained result.
