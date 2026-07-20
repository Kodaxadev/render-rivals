# ADR-0011 — Selection Outcomes and User Decision Vocabulary

**Status:** Accepted  
**Date:** 2026-07-20  
**Supersedes:** The three-outcome Recommendation vocabulary and narrower User Decision action lists currently stated in `spec/09-domain-model-and-identifiers.md` and `spec/10-run-and-candidate-state-machines.md`

## Context

The canonical domain and state-machine specifications currently define three recommendation outcomes:

- `contender_recommended`;
- `current_retained`;
- `human_review_required`.

The locked MVP implementation contract requires two additional first-class outcomes:

- an explicit tie where valid evidence does not distinguish the candidates;
- an invalid run where no trustworthy recommendation may exist.

The specifications also define a narrower set of user-decision actions than the MVP workflow. The product needs explicit actions for invalidating a run and, in future multi-contender modes, selecting another eligible candidate without pretending that selection was the automated recommendation.

Encoding these conditions as reason strings under one of the old outcomes would make state handling, analytics, recovery, and UI behavior ambiguous.

## Decision

### Recommendation outcomes

The canonical Recommendation outcome vocabulary is:

```ts
type RecommendationOutcome =
  | "contender_recommended"
  | "current_retained"
  | "tie"
  | "human_review_required"
  | "invalid_run";
```

Meanings:

- `contender_recommended`: one eligible contender demonstrated a material improvement under the frozen policy.
- `current_retained`: evidence is valid, but improvement was not proven or a protected-regression veto applies.
- `tie`: evidence is valid and sufficiently complete, but candidates remain materially indistinguishable after configured tie handling.
- `human_review_required`: evidence exists but automation cannot resolve the choice safely because of low confidence, conflicting evidence, or a declared limitation.
- `invalid_run`: the comparison, baseline, evidence set, source identity, fixture, or policy integrity is invalid; no selection recommendation exists.

`tie` is not an error and does not imply invalid evidence. `invalid_run` is not a preference result and cannot be accepted as a candidate recommendation.

### User decision actions

The canonical User Decision action vocabulary is:

```ts
type UserDecisionAction =
  | "accept_recommendation"
  | "retain_current"
  | "decline_recommendation"
  | "select_other_eligible_candidate"
  | "defer"
  | "invalidate_run";
```

Rules:

- `accept_recommendation` requires `contender_recommended` and selects its recommended candidate.
- `retain_current` may respond to any non-invalid recommendation and selects the current implementation.
- `decline_recommendation` records rejection without implying a different candidate was selected.
- `select_other_eligible_candidate` is valid only when the selected candidate is eligible and the product mode exposes multiple contenders. It is reserved in the one-contender MVP and must not appear as an enabled action there.
- `defer` leaves the run in `awaiting_decision`.
- `invalidate_run` records the user's determination that the run must not support adoption or export.

The prior values `accepted`, `declined`, `kept_current`, and `deferred` map respectively to `accept_recommendation`, `decline_recommendation`, `retain_current`, and `defer` during schema migration.

`exported_without_acceptance` is removed as a User Decision action. Report export may occur without adoption, but candidate patch or branch promotion requires an explicit decision authorizing that candidate.

## State-machine consequences

- A valid `tie` recommendation enters `awaiting_decision`.
- A valid `human_review_required` recommendation enters `awaiting_decision`.
- An `invalid_run` recommendation is a terminal analytical outcome. The run may enter `awaiting_decision` only to let the user acknowledge or explicitly invalidate it; candidate promotion remains blocked.
- `defer` does not terminalize the run.
- `invalidate_run` terminalizes the run after cleanup and prevents promotion.
- The one-contender MVP does not enable `select_other_eligible_candidate`, although the schema reserves it.

## Storage and migration consequences

- Recommendation and User Decision schemas receive a major-version amendment before implementation.
- Existing pre-scaffold documents using the former enum values are migrated deterministically.
- Historical records retain their raw original representation and migration provenance.
- Recommendation reproducibility hashes include the exact outcome vocabulary and policy version.

## UI consequences

- Tie, human review, invalid run, and no-material-improvement are distinct scenes.
- The UI must not style `tie` as a failed run.
- The UI must not style `invalid_run` as retention based on preference evidence.
- `select_other_eligible_candidate` remains hidden or disabled in the one-contender MVP.

## Follow-up amendments

Amend:

1. `spec/09-domain-model-and-identifiers.md` Recommendation and User Decision sections;
2. `spec/10-run-and-candidate-state-machines.md` Recommendation, Decision, and run-transition sections;
3. `spec/11-artifact-event-and-schema-contracts.md` Recommendation and Decision schema registry examples;
4. failure and recovery handling for invalid-run terminalization;
5. route copy and action availability in the MVP dashboard.

Until those textual amendments land, this accepted ADR is authoritative under the repository canonicality rule.