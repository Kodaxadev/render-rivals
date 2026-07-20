# 06 — Pairwise Evaluation, Controls, Human Ratings, and Experimental Sequence

**Status:** Canonical implementation contract  
**Shared types:** `schemas/domain-types.ts`  
**Vocabulary normalization:** `spec/12-cross-spec-normalization.md`

## 1. Hypothesis

Given one shared renderable current implementation, one or more hard-gate-valid contenders, the same task brief, and same-epoch evidence, an evidence-backed selector can recommend a better final implementation than retaining current, random eligible selection, or serious linear refinement.

The first proof is quality-first rather than token-constrained. Usage is measured, not silently optimized away.

## 2. Eligible set

The eligible set contains:

- the qualified current implementation;
- each contender whose mandatory gates pass;
- only candidates with complete, valid same-epoch evidence.

Rejected or stale candidates remain recorded for diagnosis but do not enter aesthetic selection.

## 3. Canonical outcomes

This specification does not define a local outcome union. It uses `RecommendationOutcome` from `schemas/domain-types.ts`:

- `contender_recommended`;
- `current_retained`;
- `tie`;
- `human_review_required`;
- `invalid_run`.

A recommendation is produced by deterministic policy over validated gates and evidence. An evaluator never writes the recommendation directly.

## 4. Pairwise verdicts

Each factor uses `PairwiseVerdict`:

- `a_materially_better`;
- `b_materially_better`;
- `no_material_difference`;
- `unable_to_judge`.

Every verdict includes:

- confidence or explicit unknown;
- concise rationale;
- artifact citations;
- limitations;
- protected-regression concerns.

A scalar quality score without cited factor evidence is invalid output.

## 5. Comparison packet

An immutable packet contains:

- task brief and product constraints;
- anonymous candidate labels where configured;
- valid capture-epoch identity;
- state/viewport/interaction matrix;
- registered artifact allowlist;
- gate eligibility summary;
- factor definitions;
- protected dimensions;
- evaluator instructions and policy hash;
- excluded evidence and reasons.

The evaluator may cite only artifacts in the packet.

## 6. Evaluation factors

The MVP factor set is:

- task and product fit;
- primary-action clarity;
- information hierarchy;
- visual coherence and intentionality;
- responsive quality;
- empty and error-state quality;
- interaction and recovery clarity.

Factor weights and thresholds are frozen in the Run Configuration. Protected regressions are vetoes, not weighted tradeoffs.

## 7. Order reversal

Every model-backed selector comparison runs twice:

1. current as A, contender as B;
2. contender as A, current as B.

The evidence, task brief, factor definitions, and policy remain identical. Only presentation order changes.

Material disagreement cannot be averaged into a winner. It yields `tie`, `human_review_required`, or `current_retained` according to frozen policy.

## 8. Critic and selector separation

When multiple evaluator roles are used:

- critics identify evidence-backed strengths, weaknesses, and regressions;
- selectors compare candidates using validated evidence;
- the policy engine applies gates, vetoes, thresholds, and outcome rules.

A critic may disagree with another critic. Disagreement is retained and surfaced.

## 9. Human-only mode

Human-only mode uses the same immutable comparison packet and evidence allowlist.

It still requires:

- complete gates;
- valid comparison evidence;
- factor-level ratings;
- citations or region/step references;
- explicit limitations;
- a typed User Decision.

Human-only mode does not claim automated selector performance.

## 10. Human rating contract

A human review may record:

- factor verdicts;
- confidence;
- rationale;
- evidence references;
- overall preference;
- protected-regression flags;
- usability concerns;
- whether the result would be adopted.

Ratings are append-only artifacts. Later ratings do not erase prior ratings.

## 11. Deterministic recommendation policy

The policy engine considers:

- current and contender eligibility;
- comparison validity;
- factor coverage;
- confidence thresholds;
- order-reversal stability;
- protected-regression vetoes;
- contradictory evidence;
- source, fixture, policy, and artifact staleness.

Typical mapping:

- material, stable contender advantage with no veto → `contender_recommended`;
- valid evidence without proven improvement → `current_retained`;
- materially indistinguishable eligible candidates → `tie`;
- valid but unresolved evidence → `human_review_required`;
- invalid baseline or comparison → `invalid_run`.

## 12. Experimental controls

The first experiment compares Render Rivals against:

- retain current;
- random eligible choice;
- serious linear refinement using the same task brief;
- evidence-only human review where useful.

Controls must use:

- the same source baseline;
- the same target route and states;
- the same fixture;
- the same viewports;
- the same time window where practical;
- the same evaluator policy where applicable.

## 13. Experimental unit

The experimental unit is one task on one project with:

- one current source snapshot;
- one or more contender snapshots;
- one frozen Run Configuration;
- one valid evidence set per compared candidate;
- one recommendation;
- one or more blinded human ratings.

Do not treat individual screenshots as independent experimental samples.

## 14. Randomization and blinding

Where practical:

- candidate labels are neutral;
- left/right order is randomized;
- source/agent identity is hidden from raters;
- order reversal is recorded;
- raters do not see token cost before quality judgment;
- invalid candidates are excluded before aesthetic review.

## 15. Primary and secondary measures

Primary measure:

- blinded human preference or adoption rate for the selected implementation versus controls.

Secondary measures:

- gate-failure rate;
- no-material-improvement rate;
- order-reversal conflict rate;
- evaluator rejection rate;
- protected-regression veto rate;
- run completion and recovery rate;
- elapsed time;
- token and cost telemetry;
- candidate diversity.

## 16. Accounting

This specification uses the sole canonical `InferenceUsage` interface from `schemas/domain-types.ts`.

It uses:

- `adapter`, not `agent`;
- closed `EvaluationPurpose` values;
- start and completion timestamps;
- nullable token and cost values;
- `policySnapshotId`.

Unknown values remain `null`.

## 17. Evaluator provenance

Each invocation records:

- provider;
- adapter and version;
- model when known;
- purpose;
- immutable input artifact;
- raw output artifact;
- normalized output artifact;
- schema-validation result;
- citation-validation result;
- usage;
- retry/supersession links.

Raw output is never overwritten by normalized output.

## 18. Invalid output

Evaluator output is rejected when:

- it is malformed;
- required factors are absent;
- citations cannot be resolved;
- cited artifacts are outside the packet;
- confidence is invalid;
- candidate identity is confused;
- conclusions rely on unrecorded external evidence;
- policy/provenance does not match the invocation.

Rejected output remains stored for diagnosis and cannot feed recommendation policy.

## 19. Tie breaking

Tie-break evaluation is optional and must be declared in the frozen policy.

A tie breaker:

- receives the same canonical evidence set;
- cannot override mandatory gates;
- cannot convert invalid evidence into valid evidence;
- records separate usage and provenance;
- may still return `tie` or `human_review_required`.

## 20. Decision and export separation

Recommendation, User Decision, and Promotion are separate entities.

- Recommendation states what the policy advises.
- User Decision records the user's response.
- Promotion performs a non-destructive export.

`exported_without_acceptance` is not a User Decision action.

## 21. Required tests

- outcome vocabulary imports from `schemas/domain-types.ts`;
- no persisted `champion`, `challenger`, `promote`, `retain_champion`, or `escalate` enum values;
- A/B and B/A packets differ only in presentation order;
- invalid citation rejects evaluator output;
- protected regression vetoes recommendation;
- unknown accounting fields remain null;
- human-only mode uses the same evidence allowlist;
- rejected output cannot create a Recommendation;
- no-material-improvement maps to `current_retained`;
- invalid baseline maps to `invalid_run`.
