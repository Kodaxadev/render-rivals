# 12 — Cross-Spec Normalization and Shared Contracts

**Status:** Canonical implementation contract  
**Purpose:** Remove duplicate authorities for vocabulary, shared types, stable errors, API commands/envelopes, canonical primitives, record invariants, storage paths, process launch, Session/Run ownership, dashboard authentication, Promotion, Export Operation, and command semantics.

## 1. Authority

When older text conflicts:

1. accepted ADRs control architecture decisions;
2. `schemas/primitives.ts` and `spec/18` control canonical JSON, hashes, timestamps, decimals, units, and measurement wire formats;
3. `schemas/domain-types.ts` controls shared persisted unions/interfaces;
4. `schemas/error-codes.ts` controls stable error identifiers;
5. `schemas/api-types.ts` controls shared local API command/envelope vocabulary;
6. `docs/RECORD-INVARIANT-MATRIX.md` controls cross-record cardinality/nullability where structure alone is insufficient;
7. `spec/11` controls canonical filesystem and commit protocols;
8. `spec/13` controls configuration, CLI, local API route inventory, safe mode, and general command semantics;
9. `spec/14` controls Git/source/workspace/branch behavior;
10. `spec/15` controls observability, diagnostics, telemetry, and crash reporting;
11. `spec/16` controls dashboard origin isolation, pairing, cookies, Host/Origin/CSRF, and browser-opening policy;
12. `spec/17` controls API envelopes, operation status, revision requirements, pagination, error detail, and Artifact content responses;
13. this file controls equivalence mappings and relative-path interpretation;
14. older local examples are explanatory only and must not be implemented literally.

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

## 3. Shared primitives, types, errors, API, and invariants

`schemas/primitives.ts` and `spec/18` define:

- full lowercase `sha256:` digests;
- RFC 8785 canonical JSON hash bytes;
- millisecond UTC timestamps;
- canonical decimal strings and `MonetaryAmount`;
- safe integers, revisions, sequences, counts, durations, confidence, units, and canonical paths.

`schemas/domain-types.ts` is sole canonical definition for:

- IDs and prefixes;
- Candidate role;
- Recommendation outcome/reason;
- User Decision action;
- Pairwise verdict;
- Evaluation/Process purpose;
- Session/Run/Epoch states;
- Recovery disposition;
- Inference usage;
- Recommendation, Decision, Promotion, and Export Operation records.

`schemas/error-codes.ts` is sole stable error-code registry.

`schemas/api-types.ts` is sole shared registry for API command names, command/accepted/status/query/page/error envelopes, and operation states.

`docs/RECORD-INVARIANT-MATRIX.md` defines outcome/status-dependent required, nullable, empty, supersession, retry, and terminal-field combinations.

Markdown examples reference rather than redefine these authorities.

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

Canonical `InferenceUsage` uses:

- `adapter` and closed purpose;
- canonical UTC start/end timestamps;
- nonnegative safe-integer token categories or null;
- `MonetaryAmount | null`, never floating JSON dollars;
- policy snapshot identity.

Unknown remains null. Computed/estimated cost uses exact decimal arithmetic and pricing snapshot hash under `spec/18`.

## 7. Process launch authority

Rust owns authorization, managed root-process creation, containment, observation, resource enforcement, and termination.

Approved contained processes may create descendants only when inheritance is expected and doctor-verified. Playwright-launched Chromium follows this contained-descendant policy.

“Rust owns process creation” means managed roots and launch authority; it does not forbid verified contained descendant creation.

The MVP does not auto-spawn the user's ordinary dashboard browser. `spec/16` requires the terminal to display the randomized dashboard origin and pairing code for manual opening.

## 8. Storage roots and hashes

`spec/11` owns live paths and write/recovery ordering. `spec/18` owns value encoding and hashing.

Defaults:

- Windows `%LOCALAPPDATA%/RenderRivals/data`;
- Linux XDG state root;
- macOS Application Support.

Marker: `.render-rivals/project.json`.

Old `.visual-optimizer`, `visual-optimizer/sessions`, and cache-as-canonical layouts are superseded.

Any SHA-256 value shown as raw `...` in an older prose example is an abbreviated placeholder. Executable canonical JSON uses a full `sha256:<64 lowercase hex>` value.

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
  starting -> authenticating_coordinator -> ready/running -> draining -> completed/crashed
       └── hosts sequential Run operations
             draft -> validating -> ready -> preparing -> capturing
             -> gating -> evaluating -> awaiting_decision -> exporting/terminal
```

Session describes native availability. Run describes durable product work. Run may survive Session. Session end does not automatically make Run terminal.

Dashboard browser authentication is a Session capability and never a Run state.

## 13. Dashboard authentication

`spec/16` supersedes any implication that binding `127.0.0.1` alone authenticates a browser.

- socket binds loopback;
- browser uses a randomized `.localhost` Session origin;
- unauthenticated surface is pairing-only;
- one-time pairing code is entered in the browser body, never URL/argv/log;
- browser credential is an HttpOnly host-only SameSite cookie;
- exact Host/Origin/CSRF rules apply;
- credential expires with supervisor Session;
- safe mode still requires pairing;
- default browser is not auto-spawned in MVP.

## 14. CLI/API and re-evaluation

`spec/13` owns filenames, merge rules, CLI commands, route inventory, exit codes, SSE, safe mode, and operation idempotency at the service level.

`spec/17` narrows the HTTP shape:

- closed `ApiCommandName` registry;
- `OperationId` and revision requirements;
- resolvable operation-status route;
- canonical/derived query envelopes;
- bounded opaque-cursor pagination;
- registered/redacted error bodies;
- Artifact content/range behavior.

There is no MVP pause command/state.

Re-evaluation and any sealed source/fixture/gate/factor/policy change create a superseding Run and new Capture Epoch.

## 15. Database

No canonical database initially. SQLite may later be rebuildable. Specs 07/11 express the same rule; spec11 owns persistence detail.

## 16. Conformance

An implementation is nonconforming if it:

- defines duplicate shared primitive/type/error/command registries;
- emits raw/uppercase/base64 SHA-256, noncanonical timestamps, unsafe counts, or floating persisted currency;
- produces different canonical JSON/hash bytes across Rust and TypeScript;
- accepts a structurally valid record that violates the Record Invariant Matrix;
- persists deprecated aliases;
- uses old storage/endpoint/env names;
- treats report export as Promotion;
- allows Promotion without Candidate/Decision;
- invalidates full Epoch for isolated contender failure;
- exposes UI command without legal domain/API command;
- accepts arbitrary free-form API command names;
- returns dead or secret-bearing operation status paths;
- exposes unbounded collection API;
- mutates sealed Run Configuration;
- trusts Session state as Run state;
- serves dashboard data before pairing or uses a shared loopback bearer cookie without randomized host isolation;
- auto-spawns/contains the user's ordinary browser without a later ownership decision;
- requires database for recovery.
