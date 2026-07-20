# Render Rivals Failure and Recovery Matrix

**Status:** Implementation and product-behavior contract  
**Scope:** Detection, classification, automatic response, user communication, retained artifacts, capture validity, resume point, and terminal behavior

## 1. Principles

Render Rivals executes untrusted project code and produces evidence that may influence source changes. Recovery must prefer losing work over reusing questionable evidence.

The system follows these rules:

1. Never claim success from an unobserved side effect.
2. Never trust a stored PID as proof of process identity.
3. Never reuse captures after browser continuity is lost.
4. Never evaluate corrupt, missing, stale, or cross-epoch artifacts.
5. Never silently change source inputs after validation.
6. Never overwrite canonical files with partial writes.
7. Never hide incomplete process cleanup behind a successful product outcome.
8. Never automatically retry an operation that could duplicate or overwrite user output.
9. Preserve failed attempts and raw output for diagnosis.
10. Make recovery actions explicit when user intent or evidence validity is uncertain.

## 2. Failure classes

| Class | Meaning | Default behavior |
|---|---|---|
| `user_correctable` | Configuration, source, or destination needs user action | Return to editable or decision state |
| `retryable_transient` | Same immutable input may safely be retried | Bounded automatic or manual retry |
| `epoch_invalidating` | Capture comparability can no longer be trusted | Invalidate full epoch and recapture all candidates |
| `candidate_ineligible` | Contender completed enough to prove a required gate failure | Retain evidence, block recommendation |
| `run_terminal` | Current Run cannot safely continue | Cleanup and fail Run |
| `security_critical` | Ownership, containment, path, or integrity boundary violated | Stop scheduling, isolate, cleanup, fail, surface incident |
| `cleanup_incident` | Business work ended but owned resources may remain | Surface persistent system warning until verified |

## 3. Recovery dispositions

- `resume_from_checkpoint`: continue after the latest verified checkpoint;
- `retry_current_phase`: repeat the current operation with a new attempt ID;
- `restart_capture_epoch`: invalidate and recapture current plus contender;
- `await_user_correction`: preserve state and request a corrected value;
- `create_superseding_run`: terminalize this Run and start a new Run from valid inputs;
- `cannot_recover`: fail and require diagnosis;
- `cleanup_only`: no business work resumes; only owned-resource cleanup continues.

## 4. User-message structure

Every surfaced failure includes:

- plain-language title;
- what Render Rivals observed;
- what was affected;
- whether evidence remains valid;
- what was retained;
- recommended next action;
- stable error code;
- expandable technical details and logs.

Do not expose a raw stack trace as the primary message.

## 5. Startup and session failures

| Failure | Detection | Automatic action | Evidence impact | User action / recovery |
|---|---|---|---|---|
| Native supervisor binary missing | Bootstrap cannot resolve verified binary | Stop before session creation | None | Repair/reinstall; `SUPERVISOR_BINARY_MISSING` |
| Supervisor checksum mismatch | Download/package hash differs | Quarantine binary; do not execute | None | Reinstall from trusted release; security-critical |
| Supervisor fails to start | Child launch error or startup timeout | Capture bootstrap diagnostics; no retry by default | None | Retry after correcting installation |
| IPC endpoint creation fails | Supervisor native observation | Cleanup partial endpoint and session | None | Retry session; fail if repeated |
| IPC authentication fails | Nonce/session proof rejected | Close connection; terminate untrusted peer | None | Restart full session; security-critical if repeated |
| Coordinator fails to start | Supervisor observes launch failure | Retain stderr; cleanup session | None | Repair Node/runtime configuration |
| Bootstrap-supervisor version incompatible | Handshake version range mismatch | Stop before project execution | None | Update/downgrade compatible components |
| Second coordinator attempts same Run | Run lock and live session verify owner | Reject second writer | None | Attach read-only or close first session |
| Stale lock with no live session | Lock lease expired and supervisor confirms absence | Acquire recovery lock; assess Run | Existing valid checkpoints retained | Resume according to recovery assessment |
| Lock identity cannot be verified | Supervisor session unavailable or ambiguous | Do not remove lock automatically | Evidence retained, Run unavailable | User chooses diagnostic recovery after warning |

## 6. Project and configuration failures

| Failure | Detection | Automatic action | Evidence impact | User action / recovery |
|---|---|---|---|---|
| Project path missing | Validation stat fails | Return to draft | None | Relink project path |
| Project path moved | Fingerprint mismatch, old path absent | Search recent parent only when safe; never guess final link | Prior runs unaffected | Confirm new root |
| Unsupported package manager | Detection/config validation | Return to draft | None | Supply explicit commands or use supported manager |
| Development command absent | Resolved config incomplete | Return to draft | None | Enter command |
| Invalid target route | URL/origin policy validation | Return to draft | None | Correct route |
| Factor weights do not sum to 1 | Config schema validation | Return to draft | None | Correct weights |
| Evaluator unavailable | Adapter capability check | Return to draft or ready-with-warning only if evaluation deferred | None | Configure available evaluator |
| Data root not writable | Preflight write test | Stop validation | None | Choose writable location |
| Insufficient projected disk | Capacity preflight | Warn or block according to threshold | None | Free space or reduce retention |
| Platform containment below required level | Capability report | Block strong-mode run; do not downgrade silently | None | Change policy or use supported platform |
| Secret reference unresolved | Config resolution | Return to draft without logging value | None | Provide secret through allowed mechanism |
| Unknown major config schema | Reader validation | Open read-only | None | Migrate with supported version |

## 7. Source and snapshot failures

| Failure | Detection | Automatic action | Epoch impact | Recovery |
|---|---|---|---|---|
| Current repository dirty when clean required | Git validation | Return to draft | None | Commit, stash, or explicitly include changes |
| Contender ref not found | Git/ref validation | Return to draft | None | Select valid ref |
| Current and contender resolve to same content | Manifest hashes equal | Warn and block meaningless run by default | None | Select distinct contender |
| Source changes during snapshot | Manifest differs between scan boundaries | Abort snapshot attempt | None | Retry snapshot after files settle |
| Source changes after validation, before materialization | Revalidation mismatch | Mark source stale; do not use | No active epoch | Create new snapshot; restart validation |
| Source changes after candidate launch | Workspace/source provenance mismatch | Stop candidate; security/integrity failure | Invalidate active epoch | New Run or new snapshot |
| Symlink escapes allowed source boundary | Canonical path check | Reject snapshot/workspace | None | Remove link or explicitly change policy |
| Protected path changed | Source diff policy gate | Candidate becomes ineligible | Epoch may remain valid for diagnosis | Keep current or provide corrected contender |
| Lockfile missing or changed unexpectedly | Snapshot/workspace verification | Fail workspace verification | None | Recreate snapshot |
| Patch does not apply cleanly | Workspace materialization | Candidate attempt fails | None | Supply corrected patch |
| Workspace manifest differs from source snapshot | Hash verification | Quarantine workspace | None | Rematerialize; fail if repeated |

## 8. Workspace and dependency failures

| Failure | Detection | Automatic action | Evidence impact | Recovery |
|---|---|---|---|---|
| Workspace path outside owned root | Canonical path check | Stop immediately; do not delete external path | None | Security-critical failure |
| Workspace creation fails | Filesystem error | Cleanup partial temp directory | None | Retry manually after correcting storage |
| Dependency install exits nonzero | Supervisor exit observation | Store stdout/stderr; no automatic retry | Candidate not captured | Correct contender or command; superseding Run |
| Dependency install times out | Runtime limit | Graceful then forceful termination | Candidate not captured | Increase limit or fix install |
| Package script spawns stubborn descendants | Containment cleanup verification | Kill containment boundary | None unless epoch active | Retry only after cleanup verifies |
| Dependency cache corruption | Known tool output plus repeatable failure | Do not delete global cache automatically | None | User clears cache or selects isolated install |
| Build exits nonzero | Process exit | Store logs; candidate fails | Candidate ineligible/failed | Correct source and create new Run |
| Build succeeds but expected output absent | Post-build assertion | Mark build attempt failed | None | Correct build configuration |
| Build modifies protected source inputs | Pre/post manifest diff | Stop candidate; quarantine workspace | Invalidate epoch if launched | Correct build behavior |
| Disk full during install/build | Write error or capacity monitor | Terminate candidate; cleanup partial owned files | None unless captures exist | Free disk; retry preparation |

## 9. Process and containment failures

| Failure | Detection | Automatic action | Epoch impact | Recovery |
|---|---|---|---|---|
| Process launch rejected | Supervisor API result | Record launch failure | None | Correct command/path |
| Process launches outside containment | Membership verification fails | Terminate process immediately | Invalidate active epoch | Security-critical; fail Run |
| PID reused during recovery | Native identity mismatch | Mark stored process `identity_lost` | Invalidate epoch if continuity needed | Cleanup by containment; restart phase |
| Development process exits before readiness | Exit observation | Stop readiness polling | Current failure: Run fails; contender: ineligible/failed | Correct source/config |
| Development process exits during capture | Exit observation | Stop browser work; preserve diagnostics | Epoch cannot become valid | New epoch after correction |
| Resource limit exceeded | Supervisor native limit event | Terminate owned process tree | Invalidate active epoch | Increase limit or correct candidate |
| Endpoint owned by unexpected process | Native endpoint inspection | Do not navigate; terminate candidate if owned conflict | Invalidate active epoch | Resolve port conflict; security-critical if impersonation suspected |
| Port already occupied by unrelated process | Preflight/ownership check | Select another allowed port when config permits | None | Automatic retry with new port or user correction |
| Child escapes strong boundary | Endpoint/process inspection finds attributable escaped child | Stop all scheduling; cleanup | Invalidate epoch | Security-critical terminal failure |
| Graceful termination ignored | Grace timeout | Force terminate containment boundary | Active epoch invalid | Continue cleanup; record forceful termination |
| Forceful cleanup cannot verify empty boundary | Native verification failure | Mark cleanup incident | Evidence retained but system health degraded | Diagnostics and manual cleanup required |
| Supervisor crashes while children run | IPC loss plus OS observations on restart | Recovery supervisor claims owned boundary where possible | Active epoch invalid | Cleanup-only, then resume from safe checkpoint |

## 10. Readiness and local-origin failures

| Failure | Detection | Automatic action | Epoch impact | Recovery |
|---|---|---|---|---|
| Readiness timeout | Poll deadline | Capture final logs and optional diagnostic screenshot | Epoch fails/incomplete | Increase timeout or fix app |
| HTTP endpoint responds but process ownership fails | Endpoint inspection | Reject endpoint | Invalidate epoch | Resolve conflicting service |
| Route returns fatal status | Navigation response policy | Gate failure or candidate failure per config | Epoch may continue for diagnostics but cannot validate candidate | Correct route/app |
| Redirect leaves allowed local origin | Navigation policy | Abort navigation | Invalidate epoch | Correct app or origin policy |
| TLS/local certificate error | Browser navigation error | Fail route readiness | Epoch incomplete | Configure supported local URL |
| Readiness selector never appears | Poll timeout | Save failure screenshot/DOM | Candidate gate fails | Correct selector or app |
| Readiness passes then root disappears | Capture-time assertion | Capture invalid | Epoch may fail | Fix unstable app and recapture |
| Network dependency unavailable | Browser/network observation | Record failed requests; apply configured gate | Depends on required gate | Restore dependency or provide deterministic fixture |

## 11. Browser and capture failures

| Failure | Detection | Automatic action | Epoch impact | Recovery |
|---|---|---|---|---|
| Browser launch fails | Playwright launch rejection | One bounded retry with same version | Epoch opening fails | Repair browser bundle |
| Browser crashes | Process/disconnect event | Stop all capture work | Invalidate full epoch | Start new browser and recapture all candidates |
| Browser disconnects | Playwright disconnect | Stop and seal diagnostics | Invalidate full epoch | Start new epoch |
| Context identity lost | Registered context unavailable/mismatch | Abort | Invalidate full epoch | Start new epoch |
| Page crash | Page crash event | Save available diagnostics | Invalidate full epoch in MVP | Start new epoch after correction |
| Navigation timeout | Playwright timeout | Save diagnostics | Epoch incomplete | Correct app or timeout; new epoch |
| Fonts fail readiness | `document.fonts.ready` timeout | Apply configured failure policy; MVP fails capture | Epoch incomplete | Fix fonts or explicitly change policy |
| Settle period never stabilizes | Mutation/layout policy timeout | Mark capture unstable | Epoch cannot validate | Fix animation/streaming behavior |
| Screenshot API fails before commit | Capture error | One retry within same page only when browser continuity intact | Epoch remains active if retry succeeds | Otherwise invalidate/restart epoch |
| Screenshot write fails | Atomic artifact protocol error | Quarantine temp file | Epoch incomplete | Free storage; new epoch unless retry before candidate teardown is safe |
| Screenshot hash mismatch | Verification | Quarantine artifact | Invalidate epoch | New epoch |
| DOM summary serialization fails | Browser or writer error | Retain screenshot diagnostic | Required capture incomplete | New epoch after fix |
| Console summary missing | Writer/instrumentation error | Required capture incomplete | Epoch invalid/incomplete | New epoch |
| Viewport differs from plan | Metadata verification | Reject capture | Invalidate epoch | New epoch |
| Browser version changes mid-run | Runtime fingerprint mismatch | Abort | Invalidate epoch | Start new epoch with pinned browser |
| Current captured, then contender capture fails | Candidate/browser failure | Preserve current diagnostics | Epoch not valid | Correct cause and recapture both |
| Coordinator crashes after current capture | Recovery finds no provable browser continuity | Cleanup browser | Invalidate epoch | Recapture current and contender |
| Coordinator crashes after valid epoch sealed | Verify epoch and artifact hashes | Do not recapture | Epoch remains valid | Resume gating |

## 12. Gate failures

| Failure | Detection | Automatic action | Evidence impact | Recovery |
|---|---|---|---|---|
| Required gate condition fails | Gate result `failed` | Mark contender ineligible | Captures remain valid evidence of failure | Create current-retained recommendation |
| Advisory gate fails | Gate result `failed` | Record warning | Evaluation may proceed | Surface limitation |
| Gate implementation throws | Gate result `error` | One retry only if declared safe | Required gate blocks eligibility | Fix gate/runtime or retry attempt |
| Gate cites missing artifact | Result validation | Reject result as error | Candidate not eligible | Repair artifact/re-run epoch |
| Gate config changed after run start | Config hash mismatch | Reject changed definition | Existing results remain tied to old config | New Run required |
| Current reference fails required gate | Effective current eligibility false | Do not compare quality | No valid recommendation against broken reference | Fail Run or require new current snapshot |
| Retried gate conflicts with prior result | Supersession validation | Use explicit latest completed attempt only | Prior attempt retained | Surface retry history |

## 13. Evaluator failures

| Failure | Detection | Automatic action | Evidence impact | Recovery |
|---|---|---|---|---|
| Evaluator command fails to launch | Supervisor result | Store adapter diagnostics | No recommendation | Retry after correcting adapter |
| Evaluator times out | Runtime deadline | Terminate evaluator process | No accepted evidence | One bounded retry with immutable input |
| Evaluator transport disconnects | Adapter protocol | Preserve partial raw output in quarantine | No accepted evidence | Retry new Evaluation attempt |
| Output is not valid JSON | Parser | Store raw output, mark rejected | None accepted | Corrective retry only if adapter supports it |
| Output schema invalid | Schema validator | Mark rejected with field errors | None accepted | New attempt |
| Factor missing | Semantic validation | Reject output | None accepted | New attempt |
| Confidence outside `[0,1]` | Semantic validation | Reject output | None accepted | New attempt |
| Citation not in input manifest | Citation validator | Reject output | None accepted | Security/integrity failure for attempt |
| Cited artifact missing or hash changed | Integrity validation | Reject output and mark artifact incident | Existing evaluation unusable | Repair from valid source or new epoch |
| Evaluator references external unstored evidence | Output validation/rationale policy | Reject or require human review according to policy | Not reproducible | New attempt with constrained adapter |
| Prompt injection-like instructions in page content alter evaluator format | Schema/provenance validation or explicit adapter defense | Reject malformed output; retain diagnostics | None accepted | Harden adapter; no blind retry |
| Aggregate confidence below threshold | Decision policy | Produce human-review-required | Evidence remains valid but insufficient | Human chooses or runs new evaluation |
| Evaluator contradicts required gate | Decision policy | Gate wins; contender cannot be recommended | Evidence retained as conflicting | Surface contradiction |
| Evaluator output accepted, coordinator crashes before recommendation | Recovery verifies immutable output | Re-run deterministic policy only | Evidence valid | Resume evaluating |

## 14. Recommendation and decision failures

| Failure | Detection | Automatic action | Evidence impact | Recovery |
|---|---|---|---|---|
| Deterministic policy throws | Coordinator error | Preserve validated evaluation | Evidence valid | Retry policy calculation after fix/restart |
| Reproducibility hash mismatch | Recalculation | Reject recommendation | Evidence may remain valid | Recompute from canonical inputs; investigate code/version |
| Recommendation references ineligible contender | Invariant check | Reject recommendation; fail phase | Evidence retained | Fix policy implementation |
| UI closes while awaiting decision | Session loss | No mutation | Recommendation valid | Reopen directly to decision page |
| Duplicate accept command | Same operation ID | Return recorded decision | None | No duplicate decision/export |
| Conflicting accept and decline commands | Revision/operation precondition | First durable command wins; reject stale command | None | Show current decision history |
| Recommendation superseded before decision | New evaluation/recommendation | Mark prior recommendation superseded | Prior evidence retained | User decides on latest recommendation |

## 15. Promotion and export failures

| Failure | Detection | Automatic action | Evidence impact | Recovery |
|---|---|---|---|---|
| Patch generation fails | Exporter error | Store logs; no partial canonical export | Recommendation unaffected | Retry new Promotion attempt |
| Patch destination exists | Exclusive create/precondition | Do not overwrite | None | Choose new destination |
| Branch name already exists | Git preflight | Do not modify existing branch | None | Choose another name |
| Project working tree changed since decision | Precondition hash mismatch | Block branch/export action that assumes prior state | Evidence remains tied to old snapshot | Review changes or export standalone patch |
| Git branch creation partially succeeds | Git observation | Verify branch ref target | None | Record completed if exact target; otherwise fail and request cleanup |
| Export write interrupted | Atomic write protocol | Quarantine temp output | None | Retry |
| Exported file hash mismatch | Verification | Mark Promotion failed; quarantine | Recommendation unaffected | Retry |
| Remote push requested | Unsupported in MVP | Reject command | None | User pushes manually |
| Merge requested | Unsupported/non-goal | Reject command | None | Use patch or local branch |
| Coordinator crashes after export before record | Recovery inspects destination and operation manifest | Adopt only when identity/hash/preconditions exactly match | None | Complete record or quarantine ambiguous output |

## 16. Storage and integrity failures

| Failure | Detection | Automatic action | Evidence impact | Recovery |
|---|---|---|---|---|
| Data root disappears | Filesystem operation | Stop scheduling and terminate active work safely | Active epoch invalid/incomplete | Restore storage; verify integrity |
| Disk fills during canonical write | Write failure | Abandon temp; do not expose partial canonical file | Depends on artifact | Free disk; retry safe phase |
| Atomic rename unsupported/fails | Filesystem result | Do not fall back to unsafe overwrite | No canonical commit | Choose supported data root |
| Partial final event line | Recovery scan | Quarantine partial bytes and truncate under lock | Prior complete events valid | Resume from last complete event |
| Event sequence gap | Recovery verification | Open Run read-only; stop mutation | Evidence cannot be fully trusted | Diagnose/restore backup; cannot auto-repair |
| Event hash mismatch | Recovery verification | Quarantine Run from mutation | Evidence integrity compromised | Restore or export diagnostics only |
| Run snapshot ahead of event stream | Revision/sequence comparison | Rebuild from verified events; quarantine snapshot | Event-backed evidence may remain valid | Write repaired snapshot through recovery event |
| Event stream ahead of snapshot | Replay | Rebuild snapshot | Evidence valid if artifacts verify | Resume |
| Canonical artifact exists without manifest record | Recovery scan | Move to quarantine | Not usable | Reconcile only with matching operation/event proof |
| Manifest record exists but file missing | Integrity scan | Mark Artifact missing | Any citation invalid | Recreate through new epoch/evaluation; no silent repair |
| Artifact hash mismatch | Integrity scan | Mark corrupt; quarantine payload | Citations invalid | New capture/evaluation |
| Unknown major entity schema | Reader | Read-only | Existing bytes retained | Use compatible migration tool |
| Migration fails | Migration validation | Preserve original; delete/quarantine output | Original remains canonical | Fix migrator |
| Backup/restore introduces path changes | Import validation | Rebind only through explicit import provenance | Evidence content may remain valid | Create imported Run identity |

## 17. Application, coordinator, and OS interruption

| Interruption point | Recovery assessment | Safe resume point |
|---|---|---|
| Before configuration sealed | Discard incomplete draft write; keep UI draft backup if valid | `draft` |
| After validation checkpoint | Verify snapshots/config | `ready` or `preparing` |
| During workspace materialization | Remove/quarantine partial workspace | Restart `preparing` |
| After prepared checkpoint | Verify workspaces | New capture epoch |
| During current capture | Browser continuity cannot be proven after restart | New capture epoch |
| Between current and contender capture | Same | New capture epoch |
| During contender capture | Same | New capture epoch |
| After valid epoch sealed | Verify artifacts/hashes | `gating` |
| During gates | Preserve completed attempts | Resume missing gates |
| After gates resolved | Verify effective results | `evaluating` or eligibility recommendation |
| During evaluator run | Reattach only with verified process/operation identity; otherwise terminate | New Evaluation attempt |
| After raw evaluator output | Validate stored raw output | Continue validation |
| After recommendation | Verify reproducibility hash | `awaiting_decision` |
| After user decision | Verify decision event | Export or complete |
| During export | Inspect exact destination and operation manifest | Adopt exact result or retry new Promotion |
| After terminal event, before cleanup summary | Run business outcome terminal; cleanup assessment pending | `cleanup_only` |

## 18. Cleanup matrix

| Resource | Normal cleanup | Failure behavior |
|---|---|---|
| Install/build process | Terminate after exit observation | Verify boundary empty |
| Development server | Graceful request, then containment kill | Persistent cleanup incident if unverifiable |
| Browser | Close contexts/browser, then process cleanup | Active epoch invalidated |
| Evaluator process | Terminate after result or timeout | Raw partial output quarantined |
| Temporary artifact files | Delete after operation | Quarantine if ownership/path uncertain |
| Candidate workspace | Retain or delete by policy after processes stop | `cleanup_failed`; retry later |
| Port reservation | Release after owning process exit | Inspect listener ownership |
| Run lock | Release after final snapshot and event flush | Stale-lock recovery protocol |

## 19. Automatic retry limits

Default MVP policy:

- browser launch: 1 retry;
- screenshot call before artifact commit: 1 retry while browser continuity remains intact;
- evaluator transport/timeout: 1 retry with same immutable input;
- event or artifact write: retry only when no canonical commit occurred and storage is healthy;
- port selection: up to 3 allowed ports when dynamic selection is enabled;
- readiness polling: repeated polls within one configured deadline;
- build/install: 0 automatic retries;
- invalid evaluator output: 0 blind retries;
- export destination conflict: 0 automatic retries;
- security-critical failure: 0 retries.

## 20. No-reuse rules

The following are never reused after the stated failure:

- any capture from an invalid epoch;
- a workspace with manifest mismatch;
- evaluator output with invalid citations;
- an artifact with hash mismatch;
- a process identity that cannot be verified;
- a Run Configuration changed after sealing;
- a Source Snapshot whose source changed;
- partial export output without exact operation proof.

## 21. Product-state requirements

Every failure state must expose:

- phase and affected candidate;
- retained valid checkpoint;
- whether current and contender captures are still comparable;
- cleanup status;
- available action: retry, restart epoch, edit configuration, create new Run, export diagnostics, or abandon;
- links to relevant event and log ranges.

A generic “Something went wrong” page is nonconforming.

## 22. Acceptance tests

The failure system is accepted only when automated fixtures demonstrate:

- browser disconnect invalidates current and contender captures;
- coordinator crash after a valid epoch resumes at gates without recapture;
- coordinator crash mid-epoch forces complete recapture;
- stubborn descendants are terminated by the supervisor boundary;
- PID reuse is not treated as process continuity;
- disk-full simulation never leaves a partial canonical artifact;
- partial NDJSON final line is safely recovered;
- middle-stream event corruption is detected and not auto-repaired;
- invalid evaluator citations cannot produce a recommendation;
- duplicate decision commands are idempotent;
- branch destination conflicts never overwrite existing branches;
- source mutation after validation blocks continuation;
- cleanup failure remains visible after cancellation;
- completed runs reconstruct without a database.

## 23. Escalation rule

When the implementation cannot determine whether evidence or ownership remains valid, it must choose the more conservative state:

- evidence becomes unusable;
- active work stops;
- resources are cleaned where ownership is proven;
- ambiguous external resources are not deleted;
- the Run becomes interrupted or failed;
- the user receives a diagnostic path rather than an optimistic resume button.