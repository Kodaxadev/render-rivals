# Render Rivals Schemas

**Status:** Shared type vocabulary established; executable validation scaffold pending  
**Canonical storage contract:** [`spec/11-artifact-event-and-schema-contracts.md`](../spec/11-artifact-event-and-schema-contracts.md)  
**Cross-spec normalization:** [`spec/12-cross-spec-normalization.md`](../spec/12-cross-spec-normalization.md)

## Canonical shared types

[`domain-types.ts`](domain-types.ts) is the sole canonical TypeScript vocabulary for shared persisted-domain names that previously drifted across Markdown specifications.

It currently defines:

- ID aliases used in cross-document examples;
- `CandidateRole`;
- `RecommendationOutcome`;
- `UserDecisionAction`;
- `PairwiseVerdict`;
- `EvaluationPurpose`;
- `InferenceUsage`;
- Recommendation, User Decision, and Promotion record shapes;
- `RunState`;
- `RecoveryDisposition`.

Specifications must reference these types rather than define incompatible local unions.

## Required executable schema contents

Before the first scaffold milestone is accepted, the implementation schema package must contain:

- versioned Zod schemas for every canonical entity and stream record;
- generated JSON Schema documents;
- valid fixtures;
- invalid fixtures;
- migration functions and migration metadata;
- compatibility tests;
- canonical JSON and hashing tests;
- schema-version support declarations;
- compile-time and runtime tests preventing duplicate enum drift.

## Initial schema registry

The first implementation must cover at least:

- installation;
- project and trust record;
- source snapshot;
- run and Run Configuration;
- candidate and candidate attempt;
- workspace;
- process record;
- capture plan;
- capture epoch;
- capture;
- gate definition and result;
- comparison;
- evaluation and `InferenceUsage`;
- evidence record;
- recommendation;
- user decision;
- promotion/export;
- artifact record;
- event and event head;
- integrity report;
- recovery report;
- cleanup result.

## Generation model

The intended scaffold flow is:

```text
TypeScript/Zod source
  -> inferred TypeScript types
  -> generated JSON Schema
  -> valid/invalid fixtures
  -> compatibility and migration tests
```

Markdown specifications describe behavior and invariants. Generated schemas and shared source types define serialized shapes.

## Current limitation

`domain-types.ts` establishes canonical names and record shapes, but the complete executable Zod/JSON Schema registry does not exist yet. This directory therefore represents a partially completed prerequisite, not proof that `spec/11` is fully implemented.
