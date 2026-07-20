# 12 — Cross-Spec Normalization and Shared Contracts

**Status:** Canonical implementation contract  
**Purpose:** Remove duplicate authorities for vocabulary, shared types, storage paths, and session/run ownership.

## 1. Authority

This specification normalizes terms used by specs 01–11. It does not replace their detailed runtime requirements.

When an older section conflicts with this file:

1. accepted ADRs control;
2. `schemas/domain-types.ts` controls persisted enum and interface names;
3. `spec/11-artifact-event-and-schema-contracts.md` controls canonical filesystem layout;
4. this file controls equivalence mappings and relative-path interpretation;
5. the older local example is noncanonical and must not be implemented literally.

## 2. Canonical vocabulary

Persisted and API vocabulary:

- `current implementation`
- `contender`
- `candidate`
- `contender_recommended`
- `current_retained`
- `tie`
- `human_review_required`
- `invalid_run`

Explanatory prose may use these aliases:

| Explanatory term | Canonical term |
|---|---|
| champion | current implementation |
| challenger | contender |
| promote | recommend or export, depending context |
| escalate | human review required |
| winner | recommended candidate |

Aliases must not appear as persisted enum values, schema keys, event payload values, or stable API names.

## 3. Shared TypeScript contracts

`schemas/domain-types.ts` is the sole canonical definition for:

- `RecommendationOutcome`;
- `UserDecisionAction`;
- `PairwiseVerdict`;
- `EvaluationPurpose`;
- `InferenceUsage`;
- recommendation, decision, and promotion record shapes;
- run and recovery state unions.

Markdown examples are explanatory. They must import, quote, or reference these types rather than define competing unions.

## 4. Recommendation semantics

The five recommendation outcomes are:

- `contender_recommended`: an eligible contender materially proves better;
- `current_retained`: improvement is not proven or a contender is ineligible;
- `tie`: eligible candidates are materially indistinguishable under the policy;
- `human_review_required`: evidence is valid but automated policy cannot safely resolve it;
- `invalid_run`: comparison or baseline validity is insufficient for a recommendation.

A recommendation is advisory and does not modify source.

## 5. User-decision semantics

The six decision actions are:

- `accept_recommendation`;
- `retain_current`;
- `decline_recommendation`;
- `select_other_eligible_candidate`;
- `defer`;
- `invalidate_run`.

`exported_without_acceptance` is not a decision action. Export is represented only by a Promotion record. A decision may authorize an export; it is not itself an export.

## 6. Canonical inference accounting

The canonical `InferenceUsage` uses:

- `adapter`, not `agent`;
- the closed `EvaluationPurpose` union;
- `startedAt` and `completedAt`;
- nullable token and cost fields;
- `policySnapshotId`, not `policySnapshot`.

Unavailable values remain `null`. They are never estimated silently.

## 7. Canonical storage roots

`spec/11` owns all canonical live-storage paths.

Conceptual defaults:

- Windows: `%LOCALAPPDATA%/RenderRivals/data`
- Linux: `$XDG_STATE_HOME/render-rivals` or `~/.local/state/render-rivals`
- macOS: `~/Library/Application Support/RenderRivals/data`

The repository marker is `.render-rivals/project.json`.

Old `.visual-optimizer`, `visual-optimizer/sessions`, and cache-root canonical layouts are superseded. Candidate workspaces and disposable browser/package caches may use a separate cache root, but durable run history does not.

## 8. Run directory authority

The canonical run directory is:

```text
<data-root>/projects/<project-id>/runs/<run-id>/
```

`spec/11` defines its exact layout.

Older examples named `manifest.json`, `decision.json`, `metrics.json`, `accounting.json`, or `cleanup.json` as top-level run files. These are superseded as follows:

| Older name | Canonical representation |
|---|---|
| `manifest.json` | `run.json`, `run-config.json`, and artifact manifest |
| `decision.json` | `decisions/<decision-id>.json` |
| `metrics.json` | typed artifacts and derived projections |
| `accounting.json` | evaluation/process usage records and derived reports |
| `cleanup.json` | cleanup entity/result under the canonical run layout |

No compatibility file with the older name is required in the MVP.

## 9. Candidate and process paths

Candidate-attempt and process records follow `spec/11`.

Any path in specs 03 or 04 written as:

```text
processes/<process-id>/stdout.bin
```

is a path relative to the owning candidate or run process directory, not a second top-level storage root.

Raw agent/provider streams are registered artifacts or process outputs. Files named `agent-events.raw` or `agent-events.ndjson` are not required canonical siblings unless an adapter explicitly registers them as artifacts.

## 10. Database policy

There is no canonical database in the initial implementation.

SQLite or another local database may later be a rebuildable projection. Deleting it must leave every run, event, artifact, recommendation, decision, and promotion reconstructable from canonical files.

Specs 07 and 11 describe the same rule; `spec/11` owns the persistence details.

## 11. Session and run lifecycles

A Session and a Run are separate aggregates.

```text
Supervisor Session
  starting
  authenticating_coordinator
  ready
  running / idle
  draining
  ended
       │
       └── owns zero or more sequential Run operations
             draft
             validating
             ready
             preparing
             capturing
             gating
             evaluating
             awaiting_decision
             exporting
             terminal/interrupted
```

Rules:

- Session state describes native supervisor/coordinator availability.
- Run state describes one durable product attempt.
- A session may observe multiple runs over time.
- A run may survive one session and resume in another.
- Session `running` does not imply a particular Run state.
- Session `draining` stops new side effects and cleans native resources; it does not rewrite Run history.
- `recoverable` is never a Run state; it is represented by `RecoveryDisposition`.

## 12. Natural-language wording

Narrative phrases such as “run invalid” or “contender recommended” are allowed in prose. Code, schemas, event payloads, fixtures, and tests use the exact enum values from `schemas/domain-types.ts`.

## 13. Required follow-through

Conforming implementation work must:

- import canonical shared types rather than copy unions;
- generate JSON Schemas from the shared schema package when scaffolding begins;
- reject deprecated persisted vocabulary;
- use only the `spec/11` live-storage layout;
- treat old path examples as relative or superseded according to this file;
- include compatibility tests that fail if duplicate enum definitions drift.
