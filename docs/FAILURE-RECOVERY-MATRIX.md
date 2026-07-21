# Render Rivals Failure and Recovery Matrix

**Status:** Implementation and product-behavior contract  
**Scope:** Stable failure classification, automatic response, evidence impact, permitted recovery, retry limits, cleanup, and user messaging  
**Stable codes:** `schemas/error-codes.ts`  
**State authority:** `spec/10-run-and-candidate-state-machines.md`  
**Storage authority:** `spec/11-artifact-event-and-schema-contracts.md`

## 1. Principles

1. Never claim success from an unobserved side effect.
2. Never trust PID alone as process identity.
3. Never reuse evidence from an invalid Capture Epoch.
4. Never invalidate an entire Epoch for a Candidate-local failure unless comparison continuity was compromised.
5. Never evaluate corrupt, missing, stale, cross-Run, or ineligible evidence.
6. Never change sealed source/configuration inputs in place.
7. Never expose partial canonical files.
8. Never hide incomplete cleanup behind successful product outcome.
9. Never automatically retry an operation that could duplicate or overwrite user output.
10. Preserve failed attempts and raw bytes for diagnosis.
11. Prefer a conservative unusable/interrupted result over optimistic reuse.
12. Every stable code in this document exists in `schemas/error-codes.ts`; provider/project raw diagnostics use separate nonstable fields.

## 2. Failure classes

| Class | Meaning | Default response |
|---|---|---|
| `user_correctable` | Draft input or destination requires correction | Return to editable state before sealing, otherwise create superseding Run |
| `retryable_transient` | Identical immutable input may safely retry | Bounded new Attempt |
| `candidate_local` | One Candidate Attempt failed without wider environment corruption | Retry/fail that Attempt; preserve other valid evidence |
| `epoch_invalidating` | Browser/environment comparability cannot be trusted | Invalidate full Epoch and recapture participants |
| `candidate_ineligible` | Required Gate proves Contender cannot advance | Retain evidence and current implementation path |
| `run_terminal` | Qualified current or required integrity unavailable | Fail or produce auditable `invalid_run` |
| `security_critical` | Ownership, containment, path, authentication, or integrity boundary violated | Stop scheduling, isolate, cleanup, fail closed |
| `cleanup_incident` | Product outcome exists but owned resources may remain | Persistent warning and cleanup-only operation |

## 3. Recovery dispositions

- `resume_from_checkpoint`;
- `retry_current_phase`;
- `restart_capture_epoch`;
- `await_user_correction`;
- `create_superseding_run`;
- `cannot_recover`;
- `cleanup_only`.

## 4. User-message contract

Every failure shows stable code/title, observation/entity, phase/Attempt, evidence/Epoch effect, retained Artifacts/checkpoint, cleanup, retries used, one permitted action, and expandable technical detail.

Generic “Something went wrong” is nonconforming.

## 5. Startup and Session

| Code | Failure | Automatic response | Recovery |
|---|---|---|---|
| `BOOT_NATIVE_MISSING` | Native package absent | Stop before Session | Repair installation |
| `BOOT_NATIVE_INTEGRITY` | Native checksum/metadata mismatch | Quarantine; do not execute | Reinstall trusted release |
| `BOOT_NODE_UNSUPPORTED` | Bootstrap Node unsupported | Stop | Use pinned Node line |
| `BOOT_EXACT_NODE_MISMATCH` | Rust verifies different Node path/version | Terminate startup | Repair bootstrap/runtime |
| `BOOT_PLATFORM_UNSUPPORTED` | No matching target package | Stop | Use supported platform/build |
| `BOOT_COMPONENT_INCOMPATIBLE` | Package/native/schema compatibility fails | Stop/read-only as declared | Install compatible set |
| `SESSION_ENDPOINT_FAILED` | IPC endpoint cannot be secured/created | Cleanup partial Session | Retry fresh Session after cause fixed |
| `SESSION_AUTH_FAILED` | Nonce/peer/PID/Node/protocol mismatch | Reject peer; cleanup | Security diagnosis/restart |
| `SESSION_PROTOCOL_INCOMPATIBLE` | Major mismatch/required capability absent | Stop before Project commands | Upgrade/downgrade compatible components |
| `SESSION_COORDINATOR_CRASH` | Coordinator exits unexpectedly | Cleanup Session payload; Run interrupted | New Session recovery |
| `SESSION_BOOTSTRAP_LOST` | Liveness EOF | Emergency cleanup | Recover Run later |
| `SESSION_SAFE_MODE_UNAVAILABLE` | Native/IPC startup failed | Do not fake safe mode | Print installation diagnostics |
| `SESSION_SECOND_COORDINATOR` | Another client connects | Reject it | Keep authenticated Session |

## 6. Project and configuration

| Code | Failure | Automatic response | Recovery |
|---|---|---|---|
| `PROJECT_PATH_MISSING` | Registered source absent | Mark Project unavailable | Explicit relink |
| `PROJECT_IDENTITY_MISMATCH` | Marker/fingerprint conflict | Block commands | Adopt/move explicitly or new Project |
| `PROJECT_NOT_TRUSTED` | Trust absent/revoked | Block execution | Review commands and accept |
| `PROJECT_NESTED_REPOSITORY_AMBIGUOUS` | Multiple roots plausible | Do not guess | User selects root |
| `CONFIG_SCHEMA_INVALID` | JSONC/schema/semantic failure | Keep draft | Correct input |
| `CONFIG_SECURITY_CONFLICT` | Layer weakens mandatory security | Fail validation | Resolve layer conflict |
| `CONFIG_SECRET_MISSING` | Required secret unresolved | Block before launch | Bind secret for Session |
| `CONFIG_STORAGE_ADMISSION` | Data root/reserve fails | Stop scheduling | Repair/select storage |
| `CONFIG_CAPABILITY_BLOCKED` | Platform below frozen minimum | Block Run | Supported platform or new policy/Run |
| `CONFIG_SEALED_CHANGED` | Source/fixture/Gates/Factors/policy changed after seal | Mark stale | Create superseding Run |
| `CONFIG_COMMAND_UNSAFE` | Shell/path/environment request unsafe | Reject config | Use explicit safe command |

## 7. Source and Workspace

| Code | Failure | Epoch effect | Recovery |
|---|---|---|---|
| `SOURCE_CHANGED_DURING_SNAPSHOT` | Files change while Snapshot seals | None | Retry after source settles |
| `SOURCE_CHANGED_AFTER_SEAL` | Manifest differs after validation | Invalidate active Epoch if started | Superseding Run/new Snapshot |
| `SOURCE_PROTECTED_PATH` | Contender changes protected path | Candidate-local/ineligible | Retain current or new Contender |
| `SOURCE_DEPENDENCY_POLICY` | Package/lockfile policy violated | Candidate-local/ineligible | New Contender/Run |
| `SOURCE_SYMLINK_ESCAPE` | Link/junction escapes approved root | Security critical | Reject source/workspace |
| `SOURCE_CASE_COLLISION` | Paths collide on target filesystem | No safe workspace | Unsupported/new target |
| `SOURCE_SYMLINK_UNSUPPORTED` | Required symlink semantics unavailable | Candidate invalid/limited | Supported environment |
| `SOURCE_SUBMODULE_MISSING` | Required submodule/object absent | Candidate unqualified | Materialize explicitly |
| `SOURCE_SUBMODULE_DIRTY` | Nested source not snapshotted | Candidate unqualified | Nested policy or clean state |
| `SOURCE_LFS_OBJECT_MISSING` | Required LFS bytes absent | Candidate unqualified | Explicit materialization |
| `WORKSPACE_CREATE_FAILED` | Materialization I/O failure | None | Retry after storage correction |
| `WORKSPACE_MANIFEST_MISMATCH` | Materialized bytes differ | Candidate-local; quarantine | Rematerialize once, then new Run |
| `WORKSPACE_OUTSIDE_ROOT` | Workspace escapes cache root | Security critical | Reject; do not delete external path |
| `WORKSPACE_UNEXPECTED_MUTATION` | Command changes disallowed source | Candidate-local/security | Quarantine/new source |
| `WORKTREE_CREATE_FAILED` | Git worktree operation fails | Candidate-local | Correct repository/storage |
| `WORKTREE_MANIFEST_MISMATCH` | Worktree bytes differ from Snapshot | Candidate-local | Remove/recreate; then fail |
| `WORKTREE_CLEANUP_FAILED` | Owned worktree remains | Cleanup incident | Retry verified cleanup |
| `DEPENDENCY_FAILED` | Install exits/times out | Candidate-local | Retry only if proven transient |
| `BUILD_FAILED` | Build/output assertion fails | Current terminal; Contender ineligible | Baseline recovery or retain current |

## 8. Process, containment, ports, readiness

| Code | Failure | Epoch effect | Recovery |
|---|---|---|---|
| `PROCESS_LAUNCH_REJECTED` | Native validation/spawn fails | Candidate-local when scoped | Correct command/path/policy |
| `PROCESS_CONTAINMENT_FAILED` | Root/descendant not in required boundary | Invalidate Epoch; security critical | Cleanup/fail reference Run |
| `PROCESS_IDENTITY_LOST` | Recovery cannot prove process | Invalidate continuity-dependent Epoch | Treat absent/unrelated; never kill by PID |
| `PROCESS_RESOURCE_LIMIT` | Hard limit crossed | Candidate-local unless Session/storage-wide | New policy/source/Run |
| `PROCESS_BREAKAWAY_UNSUPPORTED` | Tool requires prohibited Windows Job breakaway | Candidate unsupported | Different tool/repository policy |
| `OUTPUT_DURABILITY_FAILED` | Rust cannot preserve output | Stop affected process | Repair storage/recover |
| `OUTPUT_LIMIT_EXCEEDED` | Stream crosses configured cap | Truncate/terminate exactly as policy | New limits/source/Run |
| `PORT_COLLISION` | Port owned by unrelated process | None | Try allowed ports |
| `LISTENER_OWNER_MISMATCH` | Endpoint outside Candidate group | Candidate-local/security | Stop Candidate; never kill unrelated |
| `LISTENER_OWNER_UNAVAILABLE` | Platform cannot verify | None if policy permits | Mark limited or block |
| `SERVER_EXITED_EARLY` | Process exits before readiness/capture | Candidate-local | Retry only if transient |
| `READINESS_TIMEOUT` | Probes fail deadline | Candidate-local | Correct app/config |
| `ORIGIN_OR_REDIRECT_INVALID` | Navigation leaves allowed origin | Candidate-local/security | Correct app/policy |
| `FIXTURE_SETUP_FAILED` | Required state unavailable | Candidate-local | Retry only if idempotent |

## 9. Browser and Capture

| Code | Failure | Scope | Recovery |
|---|---|---|---|
| `BROWSER_LAUNCH_FAILED` | Chromium cannot start/connect | Epoch opening | One bounded retry |
| `BROWSER_DISCONNECTED` | Playwright disconnect | Entire Epoch invalid | New Epoch, recapture participants |
| `BROWSER_PROCESS_CHANGED` | Browser identity changes | Entire Epoch invalid | New Epoch |
| `CONTEXT_ISOLATION_LEAK` | Storage/service worker crosses contexts | Entire Epoch invalid | Fix isolation/new Epoch |
| `FIXTURE_OR_ENV_CHANGED` | Fixture/environment hash drifts | Entire Epoch invalid | Restore/freeze/new Epoch |
| `PAGE_CRASHED` | One page crashes; browser connected | Candidate-local | Preserve; one fresh-context retry |
| `PAGE_CRASH_REPEATED` | Candidate crashes again | Current invalid; Contender ineligible | Invalid/failed or retain current |
| `NAVIGATION_FAILED` | Candidate route fails locally | Candidate-local | Retry only transient race |
| `REQUIRED_STATE_MISSING` | State/selector/assertion absent | Candidate-local/ineligible | Correct in new Contender/Run |
| `INTERACTION_FAILED` | Action/assertion/fingerprint fails | Candidate-local/ineligible | Preserve trace/retain current |
| `BLANK_OR_LOGIN_CAPTURE` | Wrong target state | Candidate-local/ineligible | One retry if safe |
| `FONT_OR_SETTLE_TIMEOUT` | Required condition fails | Candidate-local | New fixture/policy/Run |
| `STABILITY_PROBE_FAILED` | Current variation exceeds policy | Comparison invalid | New fixture/policy/Run |
| `CAPTURE_WRITE_UNCOMMITTED` | Write fails before registration | Candidate-local while continuity active | One identical write retry |
| `CAPTURE_ARTIFACT_CORRUPT` | Registered required bytes mismatch | Entire Epoch invalid if trust affected | New Epoch |
| `CAPTURE_MATRIX_INCOMPLETE` | Required cells absent | Candidate-local | Retry cells in live Epoch or fail Candidate |

Failed Contender does not force recapture of valid current evidence unless Epoch itself invalidates.

## 10. Gates

| Code | Failure | Response | Recovery |
|---|---|---|---|
| `GATE_REQUIRED_FAILED` | Required condition false | Contender ineligible/current invalid | Retain current or invalid Run |
| `GATE_REQUIRED_ERROR` | Required Gate cannot determine | One safe retry, then ineligible/invalid | Repair Gate/evidence |
| `GATE_ADVISORY_FAILED` | Advisory false | Continue with warning | Surface limitation |
| `GATE_DEPENDENCY_NOT_READY` | Gate scheduled before evidence exists | Implementation invariant failure | Fix phase/dependency graph |
| `GATE_CITATION_INVALID` | Missing/wrong Artifact | Reject Result | Repair/recapture |
| `GATE_SUPERSESSION_CONFLICT` | Retry chain inconsistent | Integrity failure | Read-only diagnosis |

## 11. Evaluation and Recommendation

| Code | Failure | Response | Recovery |
|---|---|---|---|
| `EVALUATION_PACKET_INCOMPLETE` | Required evidence cannot form packet | Do not invoke | Repair/recapture/deterministic result |
| `EVALUATOR_LAUNCH_FAILED` | Adapter process fails | Store diagnostics | One bounded Attempt |
| `EVALUATOR_TIMEOUT` | Deadline exceeded | Terminate/preserve partial bytes | One identical-packet retry |
| `EVALUATOR_OUTPUT_INVALID` | Missing/malformed/schema/factor/confidence failure | Store raw; accept no Evidence | Explicit corrective retry only |
| `EVALUATOR_CITATION_INVALID` | Citation outside allowlist/hash invalid | Reject | New trusted packet/diagnosis |
| `EVALUATOR_ORDER_CONFLICT` | A/B and B/A disagree materially | No automatic recommendation | Tie/human review/retain per policy |
| `EVALUATOR_PROTECTED_REGRESSION` | Valid veto evidence | Contender not recommendable | Current retained |
| `RECOMMENDATION_POLICY_FAILED` | Deterministic reducer fails/hash mismatch | Preserve Evidence; no Recommendation | Retry code path, not evaluator unnecessarily |
| `RECOMMENDATION_STALE` | Bound inputs change | Disable Decision/Promotion | New Run/Evaluation |

Unknown usage remains null.

## 12. Decision, Promotion, Export Operation

| Code | Failure | Response | Recovery |
|---|---|---|---|
| `DECISION_STALE` | Bound hashes changed | Reject Promotion | Review new Recommendation |
| `DECISION_CONFLICT` | Revision/competing command | First durable valid wins | Refresh |
| `DECISION_WRITE_FAILED` | Record not durable | No Decision accepted | Repair/retry same operation |
| `DECISION_ACTION_NOT_ALLOWED` | Outcome/mode forbids action | Reject | Choose allowed action |
| `PROMOTION_PRECONDITION` | Decision/source/destination mismatch | Stale/failed before mutation | Return to Decision |
| `PROMOTION_DESTINATION_EXISTS` | Branch/patch/workspace conflict | Never overwrite | New destination or exact match |
| `PROMOTION_PARTIAL` | Side effect may have occurred | Inspect exact operation | Adopt exact match only |
| `PROMOTION_REDACTION_FAILED` | Candidate handoff safety report fails | Block | Repair policy |
| `PROMOTION_REMOTE_OR_MERGE` | Push/PR/merge requested | Reject MVP command | Manual outside product |
| `PATCH_APPLY_FAILED` | Verification application fails | Promotion failed | Correct source/destination |
| `PATCH_RESULT_MISMATCH` | Result differs from expected manifest | Promotion failed | Quarantine/diagnose |
| `BRANCH_INVALID_NAME` | Ref invalid | Reject before mutation | Choose valid name |
| `BRANCH_ALREADY_EXISTS` | Ref conflict | No overwrite | New name or exact idempotent match |
| `BRANCH_RESULT_MISMATCH` | Commit/tree differs | Promotion failed | Diagnose/quarantine |
| `EXPORT_PRECONDITION_FAILED` | Source/redaction/integrity invalid | Export Operation failed | Correct/choose safe kind |
| `EXPORT_DESTINATION_EXISTS` | Output conflict | No overwrite | New destination/exact match |
| `EXPORT_REDACTION_FAILED` | Safe bundle cannot be proven | Block | Repair policy |
| `EXPORT_WRITE_FAILED` | Output not durable | Quarantine partial | Repair/retry |
| `EXPORT_RESULT_MISMATCH` | Checksum/content mismatch | Fail | Remove/quarantine |
| `EXPORT_KIND_UNSUPPORTED` | Kind unavailable in scope/mode | Reject | Choose supported kind |

## 13. Storage and integrity

| Code | Failure | Response | Recovery |
|---|---|---|---|
| `STORAGE_ROOT_UNAVAILABLE` | Data root missing/read-only | Stop side effects | Restore/select root |
| `STORAGE_OUT_OF_SPACE` | Reserve/write fails | Stop admission/output as needed | Free space/retry uncommitted |
| `PATH_OUTSIDE_OWNED_ROOT` | Canonical path escape | Security failure | Reject/quarantine |
| `ATOMIC_RENAME_FAILED` | Required replacement unavailable | Keep old canonical | Supported filesystem/root |
| `ENTITY_SCHEMA_INVALID` | Canonical entity invalid | Reject/quarantine | Migration/repair |
| `ENTITY_REVISION_CONFLICT` | Expected revision stale | Reject mutation | Refresh/retry legal command |
| `EVENT_PARTIAL_FINAL_LINE` | Torn final NDJSON | Quarantine/truncate under lock | Resume prior sequence |
| `EVENT_SEQUENCE_GAP` | Missing/reordered event | Read-only/corrupt | Restore/diagnose |
| `EVENT_HASH_MISMATCH` | Event bytes/history changed | Read-only/corrupt | Restore/diagnose |
| `SNAPSHOT_BEHIND_STREAM` | Completion event durable, snapshot old | Replay/rewrite | Resume verified state |
| `SNAPSHOT_AHEAD_OF_STREAM` | Snapshot claims nonexistent event | Quarantine snapshot | Replay prior state |
| `ARTIFACT_ORPHANED` | Payload lacks registration | Not evidence | Reconcile with proof or quarantine |
| `ARTIFACT_MISSING` | Record lacks bytes | Invalidate citations | Restore/recapture |
| `ARTIFACT_HASH_MISMATCH` | Bytes changed | Quarantine/block Recommendation | New trusted Artifact |
| `SCHEMA_MAJOR_UNSUPPORTED` | Reader cannot interpret | Read-only | Upgrade/migrate |
| `MIGRATION_FAILED` | Migrated copy invalid/interrupted | Original remains | Fix migration |
| `RUN_LOCK_HELD` | Verified active writer exists | Reject mutation | Attach read-only/wait |
| `RUN_LOCK_IDENTITY_UNKNOWN` | Lock owner cannot be verified | Block mutation | Recovery diagnosis |

## 14. Import and cleanup

| Code | Failure | Response | Recovery |
|---|---|---|---|
| `IMPORT_CHECKSUM_FAILED` | Bundle checksum invalid | Reject/quarantine | Obtain valid bundle |
| `IMPORT_SCHEMA_UNSUPPORTED` | Version unsupported | Read-only/reject | Compatible version |
| `IMPORT_PATH_TRAVERSAL` | Archive path/link escape | Security reject | None |
| `IMPORT_SIZE_LIMIT` | Decompression/file/count exceeds cap | Abort/quarantine | Smaller/approved bundle |
| `IMPORT_PROVENANCE_INVALID` | Ownership/identity inconsistent | Reject adoption | Valid provenance |
| `CLEANUP_GRACE_TIMEOUT` | Graceful stop exceeded | Force verified boundary | Continue cleanup |
| `CLEANUP_FORCE_FAILED` | Owned process remains | Cleanup incident | Retry/manual guidance |
| `CLEANUP_LISTENER_REMAINS` | Owned endpoint persists | Cleanup incident | Verify owner/terminate |
| `CLEANUP_WORKSPACE_FAILED` | Owned path remains | Cleanup incident | Retry later |
| `CLEANUP_OWNERSHIP_UNKNOWN` | Resource cannot be attributed | Do not kill/delete | Diagnostic/manual review |

## 15. Interruption checkpoints

| Interruption | Safe target |
|---|---|
| Before seal | Draft |
| After seal with drift | Superseding Run |
| During preparation | Verify/resume preparing |
| During partial Epoch | New Epoch |
| Current valid + Contender local failure | Preserve current, resolve Attempt, then gating |
| After valid Epoch | Gating |
| During Gates | Resume missing Results |
| After Gates | Evaluating or deterministic Recommendation |
| During evaluator | Verified reattach or new Attempt |
| After raw output | Validate stored bytes |
| After Recommendation | Awaiting Decision |
| After Decision | Promotion/completion |
| During Promotion/Export | Verify exact destination/operation |
| Terminal before cleanup | Cleanup only |

## 16. Automatic retry defaults

- browser launch 1;
- complete Epoch restart 2;
- Candidate page/context 1;
- screenshot pre-registration 1;
- evaluator timeout/transport 1 identical-packet retry;
- event/Artifact write only before canonical commit;
- port up to 3;
- readiness polls within one Attempt;
- build/install 0 unless proven transient;
- invalid evaluator output 0 blind retries;
- destination/security/integrity 0 automatic retries.

Every retry preserves prior Attempts.

## 17. No-reuse rules

Never reuse invalid-Epoch Artifact, mismatched Workspace, invalid evaluator output, hash-mismatched Artifact, unverifiable process identity, changed sealed config/source, ambiguous partial output, or stale Decision.

## 18. Acceptance tests

- browser disconnect full Epoch;
- Contender page crash local retry/current evidence preserved;
- repeated Contender crash retention path;
- repeated current crash invalid baseline;
- source drift creates superseding Run;
- coordinator crash after valid Epoch resumes Gates;
- mid-Epoch crash recaptures participants;
- stubborn descendants and PID reuse;
- disk-full no partial canonical Artifact;
- event/snapshot crash points deterministic;
- invalid evaluator citation no Recommendation;
- Decision/Promotion/Export idempotency;
- destinations never overwritten;
- report Export without Candidate acceptance;
- cleanup failure visible after terminal outcome;
- reconstruction without database.
