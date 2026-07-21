# 12 — Cross-Spec Normalization and Shared Contracts

**Status:** Canonical implementation contract  
**Purpose:** Remove duplicate authorities for vocabulary, shared types, storage paths, process launch, Session/Run ownership, Promotion, Export Operation, and command semantics.

## 1. Authority

When older text conflicts:

1. accepted ADRs control architecture decisions;
2. `schemas/domain-types.ts` controls shared persisted unions/interfaces;
3. `spec/11` controls canonical filesystem and commit protocols;
4. `spec/13` controls configuration, CLI, local API, and safe mode;
5. this file controls equivalence mappings and relative-path interpretation;
6. older local examples are explanatory only and must not be implemented literally.

## 2. Vocabulary

Canonical persisted/API terms:

- current implementation;
- contender;
- candidate;
- Recommendation;
- User Decision;
- Promotion;
- Export Operation;
- `contender_recommended`;
- `current_retained`;
- `tie`;
- `human_review_required`;
- `invalid_run`.

Explanatory mappings:

| Older/prose term | Canonical meaning |
|---|---|
| champion | current implementation |
| challenger | contender |
| winner | recommended Candidate |
| promote | recommend or create Promotion, depending context |
| escalate | `human_review_required` |
| export evidence/report | Export Operation |

Aliases never appear as persisted enum values or stable API names.

## 3. Shared types

`schemas/domain-types.ts` is sole canonical definition for:

- IDs and prefixes;
- Candidate role;
- Recommendation outcome;
- User Decision action;
- Pairwise verdict;
- Evaluation/Process purpose;
- Session/Run/Epoch states;
- Recovery disposition;
- Inference usage;
- Recommendation, Decision, Promotion, and Export Operation records.

Markdown examples reference rather than redefine these.

## 4. Recommendation and Decision

Recommendation outcomes:

- contender recommended;
- current retained;
- tie;
- human review required;
- invalid Run.

Decision actions:

- accept Recommendation;
- retain current;
- decline Recommendation;
- select another eligible Candidate;
- defer;
- invalidate Run.

Export is not a Decision action.

## 5. Promotion versus Export Operation

Promotion is a candidate adoption handoff:

- patch;
- local branch;
- preserved workspace.

It always requires selected Candidate and authorizing nonstale Decision.

Export Operation is non-adoption output:

- report;
- diagnostics;
- Run/evidence bundle;
- screenshots;
- configuration template;
- selected logs.

It may have no Candidate or Decision and never implies acceptance.

Any older text describing report/diagnostic export as Promotion is superseded.

## 6. Inference accounting

Canonical `InferenceUsage` uses `adapter`, closed purpose, start/end timestamps, nullable token/cost values, and `policySnapshotId`. Unknown remains null.

## 7. Process launch authority

Rust owns authorization, managed root-process creation, containment, observation, resource enforcement, and termination.

Approved contained processes may create descendants only when inheritance is expected and doctor-verified. Playwright-launched Chromium follows this contained-descendant policy.

“Rust owns process creation” means managed roots and launch authority; it does not forbid verified contained descendant creation.

## 8. Storage roots

`spec/11` owns live paths.

Defaults:

- Windows `%LOCALAPPDATA%/RenderRivals/data`;
- Linux XDG state root;
- macOS Application Support.

Marker: `.render-rivals/project.json`.

Old `.visual-optimizer`, `visual-optimizer/sessions`, and cache-as-canonical layouts are superseded.

## 9. Run layout mappings

Canonical Run root:

```text
<data-root>/projects/<project-id>/runs/<run-id>/
```

Older mappings:

| Older | Canonical |
|---|---|
| top-level `manifest.json` | `run.json`, `run-config.json`, Artifact manifest |
| top-level `decision.json` | `decisions/<id>.json` |
| `metrics.json` | typed Artifacts/derived projections |
| `accounting.json` | Evaluation/Process usage and derived reports |
| `cleanup.json` | cleanup operation records |
| `raw-output.json` | `raw-output.bin` plus `validation.json` |
| report under Promotion | Export Operation |

## 10. Candidate and process paths

Any `processes/<process-id>/...` example in earlier specs is relative to the owning Candidate/Run process directory defined by `spec/11`.

Raw provider/agent streams are registered Artifacts or process output; arbitrary sibling filenames are not required unless an adapter registers them.

## 11. Gates and failure scope

Gate phases:

- pre-capture;
- runtime/capture;
- post-capture evidence.

Candidate-local failures do not invalidate full Epoch unless browser/environment comparability is compromised. Browser crash/disconnect/identity loss, isolation leak, fixture/environment drift, source mutation during capture, or unscoped Artifact corruption invalidate full Epoch.

## 12. Session and Run

```text
Supervisor Session
  starting -> authenticating -> ready/running -> draining -> completed/crashed
       └── hosts sequential Run operations
             draft -> validating -> ready -> preparing -> capturing
             -> gating -> evaluating -> awaiting_decision -> exporting/terminal
```

Session describes native availability. Run describes durable product work. Run may survive Session. Session end does not automatically make Run terminal.

## 13. CLI/API and re-evaluation

`spec/13` owns filenames, merge rules, commands, exit codes, local routes, SSE, safe mode, and operation idempotency.

There is no MVP pause command/state.

Re-evaluation and any sealed source/fixture/gate/factor/policy change create a superseding Run and new Capture Epoch.

## 14. Database

No canonical database initially. SQLite may later be rebuildable. Specs 07/11 express the same rule; spec11 owns persistence detail.

## 15. Conformance

An implementation is nonconforming if it:

- defines duplicate shared unions;
- persists deprecated aliases;
- uses old storage/endpoint/env names;
- treats report export as Promotion;
- allows Promotion without Candidate/Decision;
- invalidates full Epoch for isolated contender failure;
- exposes UI command without legal domain command;
- mutates sealed Run Configuration;
- trusts Session state as Run state;
- requires database for recovery.
