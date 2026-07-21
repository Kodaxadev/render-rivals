# ADR-0011 — Selection Outcomes and User Decision Vocabulary

**Status:** Accepted and incorporated  
**Date:** 2026-07-20  
**Incorporated by:** `schemas/domain-types.ts`, specs 06, 09–13, failure/recovery and UI contracts

## Context

The earlier domain/state drafts defined only contender recommended, current retained, and human review. The MVP required explicit tie and invalid-Run outcomes plus unambiguous User Decision actions.

Encoding these as reason strings would make state handling, analytics, recovery, and UI behavior ambiguous.

## Decision

### Recommendation outcomes

```ts
type RecommendationOutcome =
  | "contender_recommended"
  | "current_retained"
  | "tie"
  | "human_review_required"
  | "invalid_run";
```

Meanings:

- `contender_recommended`: eligible Contender demonstrated material improvement under frozen policy;
- `current_retained`: valid evidence did not prove improvement or a protected veto applies;
- `tie`: valid complete evidence remains materially indistinguishable after tie policy;
- `human_review_required`: valid evidence cannot be safely resolved automatically;
- `invalid_run`: baseline/comparison/evidence/source/fixture/policy integrity is invalid and no selection Recommendation exists.

Tie is not error. Invalid Run is not a preference result and cannot authorize Candidate Promotion.

### User Decision actions

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

- accept requires contender recommendation and selects its Candidate;
- retain current selects current implementation for any applicable non-invalid outcome;
- decline records rejection without implying an alternate selection;
- select-other requires an eligible alternate and a mode exposing multiple Contenders; hidden in MVP;
- defer leaves Run awaiting Decision;
- invalidate records that Run cannot support Candidate adoption.

Former values map deterministically during migration:

- `accepted` → `accept_recommendation`;
- `declined` → `decline_recommendation`;
- `kept_current` → `retain_current`;
- `deferred` → `defer`.

`exported_without_acceptance` is not a Decision. Candidate patch/branch/workspace Promotion requires authorizing Decision. General report/diagnostic/evidence Export Operation may occur without adoption subject to integrity/redaction policy.

## State consequences

- tie and human review enter awaiting Decision;
- invalid Run may enter awaiting Decision for acknowledgement/invalidation but blocks Promotion;
- defer does not terminalize;
- invalidate terminalizes after cleanup and blocks Promotion;
- one-Contender MVP hides select-other.

## Storage consequences

- Recommendation/Decision schemas use canonical shared types;
- migration preserves original bytes and provenance;
- reproducibility hashes include outcome vocabulary/policy;
- Promotion and Export Operation remain distinct entities.

## UI consequences

- tie, human review, invalid Run, and current retained are distinct scenes;
- tie is not styled as failure;
- invalid Run is not styled as preference retention;
- select-other hidden in MVP;
- report/diagnostic export is not styled as Promotion.

## Incorporation status

The follow-up amendments are complete in:

- `schemas/domain-types.ts`;
- `spec/06-evaluation-and-experiments.md`;
- `spec/09-domain-model-and-identifiers.md`;
- `spec/10-run-and-candidate-state-machines.md`;
- `spec/11-artifact-event-and-schema-contracts.md`;
- `spec/12-cross-spec-normalization.md`;
- `spec/13-configuration-cli-and-local-api-contracts.md`;
- `docs/FAILURE-RECOVERY-MATRIX.md`;
- product UI and wireframe plans.

This ADR now records the rationale and migration history rather than serving as a temporary textual override.
