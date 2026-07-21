# Render Rivals Record Invariant Matrix

**Status:** Schema and reducer implementation contract  
**Purpose:** Define cross-field requirements that TypeScript interfaces alone cannot enforce and prevent nullable fields from acquiring inconsistent meanings.

## 1. General rules

- IDs use registered prefixes and exact ULIDs.
- Required arrays may be empty only where this matrix permits.
- `null` means intentionally absent/unknown, not omitted work.
- Unknown measured values remain `null`; invalid values are rejected.
- Every bound hash refers to the exact canonical input set and algorithm/version.
- Entity ownership IDs must resolve within permitted aggregate scope.
- Record-level invariants are enforced in Zod/JSON Schema-compatible validation and domain constructors/reducers.

## 2. Recommendation

| Outcome | `recommendedCandidateId` | `comparisonIds` | `evaluationIds` | Required reason/evidence semantics |
|---|---|---|---|---|
| `contender_recommended` | Required; eligible Contender | At least 1 | At least 1 | Material improvement, no protected veto, valid comparison |
| `current_retained` after evaluated comparison | Required; current Candidate | At least 1 | At least 1 | Valid comparison did not prove improvement, or accepted evaluation exposed a protected veto |
| `current_retained` after deterministic Contender failure/ineligibility | Required; current Candidate | May be empty | May be empty | Qualified current and cited blocking Attempt/Gate; aesthetic evaluation was not required |
| `tie` | `null` | At least 1 | At least 1 | Eligible Candidates materially indistinguishable |
| `human_review_required` | `null` | At least 1 unless a valid comparison packet could not form | May include rejected and accepted Evaluation Attempts, but only accepted Evidence IDs enter Recommendation | Explicit unresolved reason |
| `invalid_run` | `null` | May be empty | May be empty | Baseline/comparison/source/fixture/integrity invalid; no Candidate adoption |

Additional rules:

- `consideredCandidateIds` includes current plus every Candidate considered by policy, with no duplicates.
- `gateResultIds` contains effective Results used by policy, including veto/failure Results.
- `evidenceRecordIds` contains accepted Evidence only.
- `confidence` is finite `[0,1]` or `null`; invalid Run normally uses `null`.
- `contender_recommended` cannot reference current Candidate.
- `current_retained` cannot reference a Contender.
- tie/human-review/invalid cannot carry `recommendedCandidateId`.

## 3. User Decision

| Action | `selectedCandidateId` | Valid Recommendation context | Effect |
|---|---|---|---|
| `accept_recommendation` | Required; equals Recommendation's Contender | `contender_recommended` | May authorize Promotion |
| `retain_current` | Required; current Candidate | `current_retained`, `tie`, `human_review_required`, or explicit user override of contender recommendation if policy permits | Completes without Contender Promotion |
| `decline_recommendation` | `null` | Any non-invalid Recommendation | Records rejection without alternate selection |
| `select_other_eligible_candidate` | Required; eligible Candidate different from Recommendation selection | Multi-Contender mode only | Hidden/rejected in MVP |
| `defer` | `null` | Any Recommendation awaiting Decision | Run remains awaiting Decision |
| `invalidate_run` | `null` | `invalid_run` or explicit user invalidation context | Blocks Candidate Promotion and terminalizes after cleanup |

Rules:

- `accept_recommendation` is invalid when Recommendation lacks selected Contender.
- `retain_current` verifies selected ID is the Run's current Candidate.
- declined/deferred/invalidated Decisions cannot authorize Promotion.
- changing a final Decision requires explicit superseding Decision with reason and policy permission; history remains.
- Recommendation/evidence/source/policy hashes must match current bound set.

## 4. Promotion

All Promotions require:

- non-null Run, Decision, and Candidate;
- Candidate is eligible Contender selected/authorized by Decision;
- Decision is nonstale and action authorizes adoption;
- kind is patch, local branch, or Workspace preservation;
- output Artifacts appropriate to kind;
- destination/precondition/result verification;
- no report/diagnostic/bundle kind.

Per kind:

| Kind | Destination | Required output |
|---|---|---|
| `patch_export` | Explicit exclusive-create file/directory | Patch Artifact plus provenance/verification |
| `branch_create` | Valid nonconflicting local ref | Branch/commit manifest and verification |
| `workspace_preserve` | Owned Workspace path retained | Preservation/ownership/cleanup policy record |

Completed Promotion requires `completedAt`; nonterminal statuses require `completedAt = null`.

## 5. Export Operation

- Run may be `null` for installation diagnostics/configuration template.
- Candidate/Decision are not required and are not represented by Promotion fields.
- `sourceEntityIds` must match kind/scope and resolve.
- `redactionPolicyId` always required, even when policy performs no substitutions.
- output Artifacts appropriate to kind.
- omission report required when any potentially sensitive default category is excluded or user customizes inclusion; otherwise may be null only when schema/policy proves no omission category applies.
- completed requires `completedAt`; nonterminal requires null.
- report/diagnostics/Run/evidence/screenshots/config/logs never imply adoption.

## 6. Comparison

- exactly two distinct Candidate IDs;
- one must be current and one Contender in MVP;
- same Run Configuration, valid Capture Epoch, fixture/environment, route/state/viewport/interaction contract;
- no invalid/stale Capture used as selectable Evidence;
- validity `valid` required for automated contender recommendation;
- limited/invalid/stale include nonempty reason codes;
- Comparison packet hash binds Artifact allowlist and presentation order.

## 7. Evaluation

- belongs to one Comparison;
- input packet/manifest/hash required before running;
- raw output Artifact required for any received result, even rejected;
- normalized output and Evidence IDs only when validation completed successfully;
- rejected includes validation reasons and no accepted Evidence IDs;
- completed includes every required Factor exactly once;
- order-reversal Attempt points to same evidence/policy hash with reversed labels;
- usage may be null only for manual mode or adapter incapable of reporting, with reason.

## 8. Evidence Record

- exactly one Evaluation and Factor;
- Candidate IDs match Comparison pair;
- verdict canonical;
- confidence finite `[0,1]` or explicit null allowed by policy;
- at least one valid citation unless verdict `unable_to_judge` and policy allows cited missing-evidence record;
- every citation appears in packet allowlist and hash verifies;
- limitations array present, may be empty;
- protected concern cannot directly create Recommendation but is consumed by deterministic policy.

## 9. Gate Result

- one Gate Definition and subject;
- phase matches Gate Definition;
- terminal Result has completed timestamp;
- required `skipped` never satisfies eligibility;
- retry creates new Result with supersession link;
- supersession chain is acyclic and only one effective terminal Result;
- cited Artifacts exist and match required phase/scope.

## 10. Capture Epoch and Capture

Epoch:

- one Run/Capture Plan/browser process identity/fixture/environment hash;
- valid only after every participating Candidate Attempt is resolved and required current Captures verify;
- invalid never returns to valid;
- invalidation reasons nonempty;
- browser continuity cannot be inferred across coordinator restart.

Capture:

- exactly one Candidate/Epoch/state/viewport and optional interaction step;
- valid only when configured required Artifacts exist/hash/identity verify;
- effective usability becomes invalid when owning Epoch invalidates without rewriting historical completion;
- failed Contender Capture may coexist with valid current Captures in active valid Epoch when failure was Candidate-local and policy resolves Candidate terminally.

## 11. Source Snapshot and Workspace

Snapshot:

- immutable manifest/policy/hash;
- branch name is provenance only;
- clean Git source requires commit/tree;
- dirty source requires base identity plus patch/untracked representation;
- every required byte/material identity accounted for or declared external/secret.

Workspace:

- path inside owned cache root;
- Source Snapshot/manifest verification before execution;
- unexpected drift invalidates Attempt;
- removed/preserved/cleanup-failed states have corresponding cleanup/ownership result.

## 12. Process and Cleanup

Process:

- stable Process Record and Group IDs;
- PID only after native observation;
- running requires containment verification;
- exit observed is immutable;
- stdout/stderr/lifecycle Artifacts registered or explicit absence reason;
- purpose canonical.

Cleanup:

- target IDs and ownership verified;
- complete means no unexpected owned processes/listeners/transient Workspaces remain;
- intentional preserved Workspace listed separately;
- unknown ownership prevents destructive action and yields incomplete result;
- terminal Run outcome does not imply cleanup complete.

## 13. Event and Artifact

Event:

- contiguous safe-integer sequence;
- previous hash correct;
- operation/causation IDs valid when present;
- payload schema matches event type/version;
- secret values prohibited.

Artifact:

- immutable bytes after registration;
- relative safe path and owner;
- length/hash/media/sensitivity/retention;
- valid creation event/operation;
- invalid/missing/deleted represented by amendment, not creation rewrite;
- cited Artifact cannot be deleted while reference retained.

## 14. Schema test requirement

Each matrix row receives:

- valid fixture;
- one invalid fixture per violated cross-field condition;
- domain-constructor test;
- serialization round-trip;
- migration test where old records can map;
- UI/API command test for user-triggerable records.
