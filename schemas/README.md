# Render Rivals Schemas

**Status:** Shared types and stable error registry established; executable validation scaffold pending  
**Storage contract:** [`spec/11-artifact-event-and-schema-contracts.md`](../spec/11-artifact-event-and-schema-contracts.md)  
**Configuration/API:** [`spec/13-configuration-cli-and-local-api-contracts.md`](../spec/13-configuration-cli-and-local-api-contracts.md)

## 1. Canonical shared sources

### [`domain-types.ts`](domain-types.ts)

Sole TypeScript authority for shared persisted-domain vocabulary:

- all registered ID aliases/prefixes;
- Candidate/Session/Run/Epoch states and roles;
- Recommendation outcomes;
- User Decision actions;
- Pairwise verdicts;
- Evaluation and Process purposes;
- Recovery/Comparison validity;
- `InferenceUsage`;
- Recommendation, Decision, Promotion, and Export Operation records.

### [`error-codes.ts`](error-codes.ts)

Sole stable error-identifier registry for Rust/TypeScript protocol fixtures, canonical failures, CLI/API envelopes, UI messages, tests, and diagnostics.

Human wording may change. The stable code does not change meaning silently.

Markdown specifications reference these files rather than define incompatible local unions/registries.

## 2. Required executable contents

Before scaffold Stage 1 is accepted:

- versioned Zod schemas for every canonical entity/stream/command envelope;
- generated JSON Schema;
- valid and invalid fixtures;
- migration functions/metadata;
- compatibility tests;
- canonical JSON/hashing tests;
- schema writer/reader support declarations;
- duplicate enum/error-code drift checks;
- Rust/TypeScript protocol fixture generation;
- documentation/schema registry conformance script.

## 3. Initial schema registry

At minimum:

- installation and user/project configuration;
- Project, trust, Source Snapshot;
- Run and Run Configuration;
- Candidate, Attempt, Workspace, Process;
- Capture Plan, Epoch, Capture;
- Gate Definition/Result;
- Evaluation Factor, Comparison, Evaluation, validation, `InferenceUsage`;
- Evidence;
- Recommendation and User Decision;
- Promotion and Export Operation;
- Artifact creation/amendment;
- Project/Run event and event head;
- Integrity, Recovery, Cleanup;
- evaluator command request/result;
- CLI result/command envelopes;
- local API command/error envelopes;
- import/export manifests;
- native package compatibility manifest where JSON-backed.

## 4. Directory target

```text
schemas/
  domain-types.ts
  error-codes.ts
  zod/
  json-schema/
  fixtures/
    valid/
    invalid/
  migrations/
```

Implementation packages may generate compiled artifacts elsewhere, but source registry remains here unless an ADR intentionally moves it.

## 5. Generation model

```text
Zod/source declarations
  -> inferred TypeScript types where practical
  -> generated JSON Schema
  -> valid/invalid fixtures
  -> compatibility/migration tests
  -> Rust/TypeScript golden protocol fixtures
```

`domain-types.ts` may initially be imported by Zod definitions; over time one direction of generation should be chosen so the same shape is not manually maintained twice.

## 6. Runtime rules

- unknown top-level fields reject unless namespaced extensions allowed;
- duplicate JSON keys reject;
- IDs require exact prefix + lowercase ULID;
- finite numeric/confidence/token/cost rules enforce explicit null;
- unknown major schema read-only;
- migrations never rewrite the only copy;
- output schemas distinguish raw bytes from parsed JSON;
- Promotion requires Candidate/Decision;
- Export Operation permits non-adoption output without Candidate;
- error code must exist in `error-codes.ts` unless classified as provider/project raw diagnostic only.

## 7. Current limitation

The shared vocabulary and error registry exist, but executable Zod/JSON Schema, fixtures, migrations, and compatibility tests do not. This is a visible scaffold prerequisite, not evidence that persistence validation is implemented.
