# Render Rivals Schemas

**Status:** Shared domain/API types and stable error registry established; executable validation scaffold pending  
**Storage contract:** [`spec/11-artifact-event-and-schema-contracts.md`](../spec/11-artifact-event-and-schema-contracts.md)  
**Configuration/API routes:** [`spec/13-configuration-cli-and-local-api-contracts.md`](../spec/13-configuration-cli-and-local-api-contracts.md)  
**Dashboard authentication:** [`spec/16-dashboard-session-authentication-and-pairing.md`](../spec/16-dashboard-session-authentication-and-pairing.md)  
**API envelopes/operations:** [`spec/17-local-api-envelopes-operations-and-pagination.md`](../spec/17-local-api-envelopes-operations-and-pagination.md)  
**Cross-record invariants:** [`docs/RECORD-INVARIANT-MATRIX.md`](../docs/RECORD-INVARIANT-MATRIX.md)

## 1. Canonical shared sources

### [`domain-types.ts`](domain-types.ts)

Sole TypeScript authority for shared persisted-domain vocabulary:

- all registered ID aliases/prefixes;
- Candidate/Session/Run/Epoch states and roles;
- Recommendation outcomes and reason codes;
- User Decision actions;
- Pairwise verdicts;
- Evaluation and Process purposes;
- Recovery/Comparison validity;
- `InferenceUsage`;
- Recommendation, Decision, Promotion, and Export Operation records;
- supersession/retry/terminal-status fields used by those records.

### [`error-codes.ts`](error-codes.ts)

Sole stable error-identifier registry for Rust/TypeScript protocol fixtures, canonical failures, CLI/API envelopes, UI messages, tests, and diagnostics.

Human wording may change. The stable code does not change meaning silently.

### [`api-types.ts`](api-types.ts)

Sole TypeScript authority for local API command and envelope vocabulary:

- closed `ApiCommandName` registry;
- command request and accepted envelopes;
- asynchronous operation state/status;
- canonical/derived query responses;
- bounded page shape;
- stable error response/body.

Command-specific payload/result schemas remain under the executable schema registry and must map one-to-one to the command list in `spec/17`.

### [`docs/RECORD-INVARIANT-MATRIX.md`](../docs/RECORD-INVARIANT-MATRIX.md)

Authoritative cross-record requirements that interfaces cannot express alone, including outcome-dependent cardinality, nullability, ownership, completion timestamps, allowed empty arrays, supersession/retry lineage, and valid relationships between Recommendation, Decision, Promotion, Export, Evaluation, Gate, Capture, Process, Event, and Artifact records.

Markdown specifications reference these sources rather than define incompatible local unions, registries, command names, envelopes, or cross-field meanings.

## 2. Required executable contents

Before scaffold Stage 1 is accepted:

- versioned Zod schemas for every canonical entity/stream/API/CLI/native command envelope;
- generated JSON Schema;
- generated command registry/client types where practical;
- valid and invalid fixtures;
- migration functions/metadata;
- compatibility tests;
- canonical JSON/hashing tests;
- schema writer/reader support declarations;
- duplicate enum/error/command drift checks;
- Rust/TypeScript protocol fixture generation;
- documentation/schema/invariant/API registry conformance script;
- one valid fixture and targeted invalid fixtures for every applicable Record Invariant Matrix rule.

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
- API command request/accepted/status/error/query/page envelopes;
- every command-specific API payload/result;
- CLI result/command envelopes;
- import/export manifests;
- native package compatibility manifest where JSON-backed.

## 4. Directory target

```text
schemas/
  domain-types.ts
  error-codes.ts
  api-types.ts
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
  -> generated command/client registry
  -> valid/invalid fixtures
  -> compatibility/migration tests
  -> Rust/TypeScript golden protocol fixtures
```

One generation direction must be selected so shared record/command shapes are not manually maintained in multiple sources. Until then, CI drift tests compare source types, runtime schemas, JSON Schema, command routes, and fixtures.

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
- error code must exist in `error-codes.ts` unless classified as provider/project raw diagnostic only;
- API command must exist in `api-types.ts` and match its route/payload schema;
- cross-field validation must match the Record Invariant Matrix rather than accept structurally valid but semantically impossible records.

## 7. Current limitation

The shared vocabulary, stable error/API registries, and cross-record invariant contract exist, but executable Zod/JSON Schema, generated clients, fixtures, migrations, and compatibility tests do not. This is a visible scaffold prerequisite, not evidence that persistence or API validation is implemented.
