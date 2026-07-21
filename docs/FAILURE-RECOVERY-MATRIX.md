# Render Rivals Failure and Recovery Matrix

**Status:** Implementation and product-behavior contract  
**Scope:** Stable failure classification, automatic response, evidence impact, permitted recovery, retry limits, cleanup, and user messaging  
**State authority:** `spec/10-run-and-candidate-state-machines.md`  
**Storage authority:** `spec/11-artifact-event-and-schema-contracts.md`

## 1. Principles

1. Never claim success from an unobserved side effect.
2. Never trust PID alone as process identity.
3. Never reuse evidence from an invalid Capture Epoch.
4. Never invalidate an entire Epoch for a candidate-local failure unless comparison continuity was compromised.
5. Never evaluate corrupt, missing, stale, cross-Run, or ineligible evidence.
6. Never change sealed source/configuration inputs in place.
7. Never expose partial canonical files.
8. Never hide incomplete cleanup behind successful product outcome.
9. Never automatically retry an operation that could duplicate or overwrite user output.
10. Preserve failed attempts and raw bytes for diagnosis.
11. Prefer a conservative unusable/interrupted result over optimistic reuse.

## 2. Failure classes

| Class | Meaning | Default response |
|---|---|---|
| `user_correctable` | Draft input or destination requires correction | Return to editable state before sealing, otherwise create superseding Run |
| `retryable_transient` | Identical immutable input may safely retry | Bounded new attempt |
| `candidate_local` | One Candidate Attempt failed without wider environment corruption | Retry/fail that attempt; preserve other valid evidence |
| `epoch_invalidating` | Browser/environment comparability cannot be trusted | Invalidate full Epoch and recapture participants |
| `candidate_ineligible` | Required gate proves contender cannot advance | Retain evidence and current implementation path |
| `run_terminal` | Qualified current or integrity needed to continue is unavailable | Fail or produce auditable `invalid_run` |
| `security_critical` | Ownership, containment, path, authentication, or integrity boundary violated | Stop scheduling, isolate, cleanup, fail closed |
| `cleanup_incident` | Product outcome exists but owned resources may remain | Persistent health warning and cleanup-only operation |

## 3. Recovery dispositions

Uses `RecoveryDisposition`:

- `resume_from_checkpoint`;
- `retry_current_phase`;
- `restart_capture_epoch`;
- `await_user_correction`;
- `create_superseding_run`;
- `cannot_recover`;
- `cleanup_only`.

## 4. User-message contract

Every surfaced failure includes:

- stable code and plain-language title;
- exact observation and affected entity;
- phase and attempt;
- evidence validity and Epoch effect;
- retained artifacts/checkpoint;
- cleanup status;
- automatic retries already used;
- one recommended permitted action;
- expandable technical details and linked logs/events.

A generic “Something went wrong” page is nonconforming.

## 5. Startup and Session

| Code | Failure | Automatic response | Recovery |
|---|---|---|---|
| `BOOT_NATIVE_MISSING` | Native package absent | Stop before Session | Repair installation |
| `BOOT_NATIVE_INTEGRITY` | Native checksum/metadata mismatch | Quarantine; do not execute | Reinstall trusted release |
| `BOOT_NODE_UNSUPPORTED` | Bootstrap Node unsupported | Stop | Use pinned Node line |
| `BOOT_EXACT_NODE_MISMATCH` | Rust verifies different Node path/version | Terminate startup | Repair bootstrap/runtime |
| `SESSION_ENDPOINT_FAILED` | IPC endpoint cannot be secured/created | Cleanup partial Session | Retry fresh Session once after cause fixed |
| `SESSION_AUTH_FAILED` | Nonce/peer/PID/Node/protocol mismatch | Reject peer; cleanup | Security-critical; restart after diagnosis |
| `SESSION_PROTOCOL_INCOMPATIBLE` | Major mismatch/required capability absent | Stop before project commands | Upgrade/downgrade compatible components |
| `SESSION_COORDINATOR_CRASH` | Authenticated coordinator exits unexpectedly | Cleanup Session payload; active Run interrupted | New Session recovery |
| `SESSION_BOOTSTRAP_LOST` | Liveness EOF | Emergency cleanup | Recover Run later |
| `SESSION_SAFE_MODE_UNAVAILABLE` | Native/IPC startup failed | Do not fake safe mode | Print installation diagnostics and exit |

## 6. Project and configuration

| Code | Failure | Automatic response | Recovery |
|---|---|---|---|
| `PROJECT_PATH_MISSING` | Registered source absent | Mark project unavailable | Explicit relink after identity check |
| `PROJECT_IDENTITY_MISMATCH` | Marker/fingerprint conflict | Block commands | Adopt/move explicitly or create new Project |
| `PROJECT_NOT_TRUSTED` | Trust absent/revoked | Block project execution | Review commands and accept trust |
| `CONFIG_SCHEMA_INVALID` | JSONC/schema/semantic failure | Keep draft | Correct input |
| `CONFIG_SECURITY_CONFLICT` | Layer weakens mandatory security/capability | Fail validation | Resolve conflicting layer |
| `CONFIG_SECRET_MISSING` | Required secret reference unresolved | Block before launch | Bind secret for Session |
| `CONFIG_STORAGE_ADMISSION` | Data root unavailable or reserve fails | Stop scheduling | Repair/select storage |
| `CONFIG_CAPABILITY_BLOCKED` | Platform below frozen minimum | Block Run | Use supported platform or create new policy/Run |
| `CONFIG_SEALED_CHANGED` | Source/fixture/gates/factors/policy changed after seal | Mark current Run stale | `create_superseding_run` |

## 7. Source and workspace

| Code | Failure | Epoch effect | Recovery |
|---|---|---|---|
| `SOURCE_UNSTABLE_DURING_SNAPSHOT` | Files change while snapshot sealing | None | Retry after source settles |
| `SOURCE_CHANGED_AFTER_SEAL` | Manifest differs after validation | Invalidate active Epoch if started | Superseding Run with new Source Snapshot |
| `SOURCE_PROTECTED_PATH` | Contender changes protected path | Candidate local/ineligible | Retain current or new contender/Run |
| `SOURCE_DEPENDENCY_POLICY` | Package/lockfile policy violated | Candidate local/ineligible | New contender/Run |
| `SOURCE_SYMLINK_ESCAPE` | Link/junction escapes approved root | Security critical | Reject source/workspace |
| `WORKSPACE_CREATE_FAILED` | Materialization filesystem failure | None | Retry after storage correction |
| `WORKSPACE_MANIFEST_MISMATCH` | Materialized bytes differ from snapshot | Candidate local; quarantine workspace | Rematerialize once, then superseding Run |
| `WORKSPACE_OUTSIDE_ROOT` | Workspace canonicalizes outside cache root | Security critical | Reject; do not delete external path |
| `DEPENDENCY_FAILED` | Install exits/times out | Candidate local | No automatic retry unless classifier proves transient |
| `BUILD_FAILED` | Build/output assertion fails | Current: terminal; contender: ineligible | Current requires baseline recovery; contender retains current |
| `WORKSPACE_UNEXPECTED_MUTATION` | Command modifies disallowed input | Candidate local/security depending path | Quarantine; new source/Run |

## 8. Process, containment, ports, readiness

| Code | Failure | Epoch effect | Recovery |
|---|---|---|---|
| `PROCESS_LAUNCH_REJECTED` | Native validation/spawn fails | Candidate local if candidate-scoped | Correct command/path/policy |
| `PROCESS_CONTAINMENT_FAILED` | Managed root/descendant not in required boundary | Invalidate active Epoch; security critical | Cleanup and fail reference Run |
| `PROCESS_IDENTITY_LOST` | Recovery cannot prove recorded process | Invalidate Epoch if continuity required | Treat process absent/unowned; never kill by PID alone |
| `PROCESS_RESOURCE_LIMIT` | Hard limit crossed | Candidate local unless wider storage/session issue | New Run with changed limits/source |
| `OUTPUT_DURABILITY_FAILED` | Rust cannot preserve required output | Stop affected process; possibly Session-wide | Repair storage and recover |
| `PORT_COLLISION` | Selected port owned by unrelated process | None | Try up to 3 allowed ports |
| `LISTENER_OWNER_MISMATCH` | Endpoint belongs outside candidate group | Candidate local/security | Stop candidate; never kill unrelated process |
| `LISTENER_OWNER_UNAVAILABLE` | Platform cannot verify | None if frozen policy permits limitation | Mark limited or block according to policy |
| `SERVER_EXITED_EARLY` | Process exits before readiness/capture | Candidate local | Bounded retry only if transient |
| `READINESS_TIMEOUT` | Required probes fail deadline | Candidate local | Correct app/config; new attempt/Run |
| `ORIGIN_OR_REDIRECT_INVALID` | Navigation leaves allowed local origin | Candidate local or security | Correct app/origin policy |
| `FIXTURE_SETUP_FAILED` | Required state cannot be established | Candidate local | Retry only if fixture operation is declared idempotent |

## 9. Browser and capture

| Code | Failure | Scope | Recovery |
|---|---|---|---|
| `BROWSER_LAUNCH_FAILED` | Chromium cannot launch/connect | Epoch opening | One bounded launch retry |
| `BROWSER_DISCONNECTED` | Playwright disconnect | Entire Epoch invalid | New Epoch; recapture current and participants |
| `BROWSER_PROCESS_CHANGED` | Browser identity changes | Entire Epoch invalid | New Epoch |
| `CONTEXT_ISOLATION_LEAK` | Storage/cookie/service-worker leakage | Entire Epoch invalid | Fix isolation; new Epoch |
| `FIXTURE_OR_ENV_CHANGED` | Fixture/environment hash drifts | Entire Epoch invalid | Restore/freeze; new Epoch |
| `PAGE_CRASHED` | One page crashes while Chromium remains connected | Candidate local | Preserve diagnostics; one fresh-context retry |
| `PAGE_CRASH_REPEATED` | Candidate page crashes again | Current: invalid baseline; contender: ineligible | Current → invalid/failed; contender → retain current |
| `NAVIGATION_FAILED` | Candidate route fails without wider browser loss | Candidate local | Bounded retry only for classified transient race |
| `REQUIRED_STATE_MISSING` | State/selector/assertion absent | Candidate local/ineligible | New contender/Run after correction |
| `INTERACTION_FAILED` | Action/assertion/final fingerprint fails | Candidate local/ineligible | Preserve trace; retain current path |
| `BLANK_OR_LOGIN_CAPTURE` | Evidence does not represent target state | Candidate local/ineligible | One retry when safe |
| `FONT_OR_SETTLE_TIMEOUT` | Required capture condition fails | Candidate local | Fix fixture/policy in superseding Run |
| `STABILITY_PROBE_FAILED` | Current variation exceeds policy | Run comparison invalid | New fixture/policy/Run |
| `CAPTURE_WRITE_UNCOMMITTED` | Artifact write fails before registration | Candidate local while continuity active | One identical write retry |
| `CAPTURE_ARTIFACT_CORRUPT` | Registered required bytes mismatch | Entire Epoch invalid when capture evidence trust affected | New Epoch |
| `CAPTURE_MATRIX_INCOMPLETE` | Candidate lacks required cells | Candidate local | Retry missing cells only while same Epoch/browser continuity remains; otherwise candidate fails |

A failed contender does not force recapture of valid current evidence unless the active Epoch itself became invalid.

## 10. Gates

| Code | Failure | Response | Recovery |
|---|---|---|---|
| `GATE_REQUIRED_FAILED` | Required condition false | Contender ineligible; current invalid if current-scoped | Deterministic retention or invalid Run |
| `GATE_REQUIRED_ERROR` | Required gate cannot produce trusted result | One safe retry, then ineligible/invalid | Repair gate/evidence |
| `GATE_ADVISORY_FAILED` | Advisory condition false | Continue with warning | Human/evaluator sees limitation |
| `GATE_DEPENDENCY_NOT_READY` | Scheduler tries gate before required evidence | Implementation invariant failure | Fix gate phase/dependency graph |
| `GATE_CITATION_INVALID` | Result cites missing/wrong artifact | Reject result | Repair artifact or recapture |
| `GATE_SUPERSESSION_CONFLICT` | Retry chain inconsistent | Integrity failure | Read-only recovery/diagnosis |

## 11. Evaluation and Recommendation

| Code | Failure | Response | Recovery |
|---|---|---|---|
| `EVALUATION_PACKET_INCOMPLETE` | Required evidence cannot form packet | Do not invoke evaluator | Repair/recapture or deterministic outcome |
| `EVALUATOR_LAUNCH_FAILED` | Adapter process fails | Store diagnostics | One bounded new attempt after correction |
| `EVALUATOR_TIMEOUT` | Deadline exceeded | Terminate; preserve partial raw bytes | One retry with identical packet |
| `EVALUATOR_OUTPUT_INVALID` | Non-JSON/schema/factor/confidence failure | Store raw output; accept no Evidence | Corrective retry only if adapter explicitly supports it |
| `EVALUATOR_CITATION_INVALID` | Citation outside allowlist or hash mismatch | Reject output | Security/integrity diagnosis or new valid packet |
| `EVALUATOR_ORDER_CONFLICT` | A/B and B/A materially disagree | No automatic contender recommendation | `tie`, `human_review_required`, or retain per policy |
| `EVALUATOR_PROTECTED_REGRESSION` | Valid evidence finds veto | Contender cannot be recommended | `current_retained` |
| `RECOMMENDATION_POLICY_FAILED` | Deterministic reducer throws/mismatches hash | Preserve valid evidence; no Recommendation | Retry after code recovery; do not reinvoke evaluator unnecessarily |
| `RECOMMENDATION_STALE` | Bound inputs changed | Disable Decision/Promotion | New Evaluation/Run as required |

Unknown token/cost usage remains null and does not fail evaluation.

## 12. Decision and Promotion

| Code | Failure | Response | Recovery |
|---|---|---|---|
| `DECISION_STALE` | Recommendation/evidence/source/policy hash changed | Reject mutation/export | Review new Recommendation |
| `DECISION_CONFLICT` | Competing commands/revision mismatch | First durable valid command wins | Refresh current state |
| `DECISION_WRITE_FAILED` | Approval artifact not durable | No Decision accepted | Repair storage; retry same operation ID |
| `PROMOTION_PRECONDITION` | Decision/source/destination mismatch | Mark stale/failed before mutation | Return to decision or choose new destination |
| `PROMOTION_DESTINATION_EXISTS` | Patch/branch path exists | Never overwrite | User selects new destination or exact idempotent match verifies |
| `PROMOTION_PARTIAL` | Export/branch side effect may have occurred | Inspect operation manifest and exact output | Adopt only exact match, otherwise fail/quarantine |
| `PROMOTION_REDACTION_FAILED` | Export safety cannot be verified | Block export | Repair policy and retry |
| `PROMOTION_REMOTE_OR_MERGE` | Push/PR/merge requested | Reject as unsupported MVP command | User performs manually outside product |

## 13. Storage and integrity

| Code | Failure | Response | Recovery |
|---|---|---|---|
| `STORAGE_ROOT_UNAVAILABLE` | Data root missing/read-only | Stop side effects safely | Restore/select root; integrity scan |
| `STORAGE_OUT_OF_SPACE` | Reserve/write fails | Stop admission/output producer as needed | Free space; retry uncommitted work |
| `ATOMIC_RENAME_FAILED` | Canonical replace unavailable | Keep old canonical file | Use supported filesystem/root |
| `EVENT_PARTIAL_FINAL_LINE` | Torn final NDJSON record | Quarantine/truncate under lock | Resume previous complete sequence |
| `EVENT_SEQUENCE_GAP` | Missing/mutated/reordered event | Read-only/corrupt | Restore backup or diagnostics only |
| `SNAPSHOT_BEHIND_STREAM` | Completion event durable, snapshot old | Replay and rewrite snapshot | Resume from verified state |
| `SNAPSHOT_AHEAD_OF_STREAM` | Snapshot claims nonexistent event | Quarantine snapshot | Replay prior valid state |
| `ARTIFACT_ORPHANED` | Payload exists without registration | Not evidence | Reconcile only with exact operation proof; otherwise quarantine |
| `ARTIFACT_MISSING` | Registration points to absent bytes | Invalidate citations | Recapture/reevaluate |
| `ARTIFACT_HASH_MISMATCH` | Bytes changed | Quarantine; block Recommendation | New trusted artifact |
| `SCHEMA_MAJOR_UNSUPPORTED` | Reader cannot safely interpret | Read-only | Compatible upgrade/migration |
| `MIGRATION_FAILED` | Migrated copy invalid/interrupted | Original remains canonical | Fix migrator |

## 14. Interruption checkpoints

| Interruption | Safe target |
|---|---|
| Before seal | `draft` |
| After seal but source/config drifted | `create_superseding_run` |
| During preparation | restart/resume `preparing` after verification |
| During partial Epoch | invalidate and start new Epoch |
| After current valid but contender candidate-local failure | preserve current, resolve candidate attempt, then `gating` |
| After valid Epoch seal | `gating` |
| During gates | resume missing Gate Results |
| After gates | `evaluating` or deterministic Recommendation |
| During evaluator | verified reattach or new Evaluation attempt |
| After raw output | validate stored bytes |
| After Recommendation | `awaiting_decision` |
| After Decision | export or complete |
| During Promotion | verify exact destination/operation |
| Terminal outcome before cleanup report | `cleanup_only` |

## 15. Cleanup matrix

| Resource | Normal cleanup | Failure behavior |
|---|---|---|
| dependency/build/test root | observe exit then group verification | cleanup incident if descendants remain |
| candidate server | graceful request then group termination | block next candidate if ownership uncertain |
| browser | close contexts/browser then verify descendants | invalidate active Epoch if continuity lost |
| evaluator | terminate after result/timeout | quarantine partial raw bytes |
| temp artifact | delete after operation | quarantine when ownership/path uncertain |
| workspace | retain/delete by policy after process cleanup | explicit `cleanup_failed` and retry |
| port lease | release after owner exit | inspect remaining listener |
| Run lock | release after events/snapshot flush | stale-lock recovery with identity verification |

## 16. Automatic retry defaults

- browser launch: 1;
- complete Epoch restart: 2;
- page/context candidate-local retry: 1;
- screenshot write before registration: 1;
- evaluator transport/timeout: 1 identical-packet retry;
- event/artifact write: only when no canonical commit occurred;
- port selection: up to 3 allowed ports;
- readiness: repeated polls in one deadline;
- build/install: 0 unless classified transient;
- invalid evaluator output: 0 blind retries;
- destination/security/integrity conflict: 0 automatic retries.

Every retry preserves prior attempt records.

## 17. No-reuse rules

Never reuse:

- any Artifact from invalid Epoch;
- mismatched workspace;
- invalid-citation evaluator output;
- hash-mismatched Artifact;
- unverifiable process identity;
- changed sealed Run Configuration;
- changed Source Snapshot;
- ambiguous partial export;
- stale Decision.

## 18. Acceptance tests

- browser disconnect invalidates complete Epoch;
- one contender page crash retries locally and preserves current evidence;
- repeated contender crash yields ineligible/retention path without full recapture;
- repeated current crash yields invalid baseline;
- source drift after seal creates superseding Run;
- coordinator crash after valid Epoch resumes at gates;
- coordinator crash mid-Epoch recaptures all participants;
- stubborn descendants cleaned by verified boundary;
- PID reuse never proves identity;
- disk-full leaves no partial canonical Artifact;
- exact event/snapshot crash points recover deterministically;
- invalid evaluator citation cannot produce Recommendation;
- duplicate Decision/Promotion commands are idempotent;
- existing destination never overwritten;
- cleanup failure remains visible after terminal outcome;
- completed Runs reconstruct without database.
