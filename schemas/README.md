# Render Rivals Schemas

**Status:** Shared primitive/domain/API types and stable error registry established; executable validation scaffold pending  
**Storage contract:** [`spec/11-artifact-event-and-schema-contracts.md`](../spec/11-artifact-event-and-schema-contracts.md)  
**Configuration/API routes:** [`spec/13-configuration-cli-and-local-api-contracts.md`](../spec/13-configuration-cli-and-local-api-contracts.md)  
**Dashboard authentication:** [`spec/16-dashboard-session-authentication-and-pairing.md`](../spec/16-dashboard-session-authentication-and-pairing.md)  
**API envelopes/operations:** [`spec/17-local-api-envelopes-operations-and-pagination.md`](../spec/17-local-api-envelopes-operations-and-pagination.md)  
**Primitive wire formats:** [`spec/18-canonical-primitives-json-hashing-and-measurements.md`](../spec/18-canonical-primitives-json-hashing-and-measurements.md)  
**Cross-record invariants:** [`docs/RECORD-INVARIANT-MATRIX.md`](../docs/RECORD-INVARIANT-MATRIX.md)

## 1. Canonical shared sources

### [`primitives.ts`](primitives.ts)

Sole TypeScript vocabulary for shared JSON-facing primitives:

- full `sha256:` digest strings;
- canonical UTC timestamps;
- canonical decimal strings;
- canonical relative paths;
- safe integers/revisions/sequences/counts;
- byte/duration/confidence aliases;
- exact `MonetaryAmount` and cost basis.

`spec/18` defines the runtime lexical/range/canonicalization rules. Template/string aliases alone never validate a value.

### [`domain-types.ts`](domain-types.ts)

Sole TypeScript authority for shared persisted-domain vocabulary:

- all registered ID aliases/prefixes;
- Candidate/Session/Run/Epoch states and roles;
- Recommendation outcomes and reason codes;
- User Decision actions;
- Pairwise verdicts;
- Evaluation and Process purposes;
- Recovery/Comparison validity;
- `InferenceUsage` with safe integer tokens and exact monetary cost;
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

Markdown specifications reference these sources rather than define incompatible local primitives, unions, registries, command names, envelopes, or cross-field meanings.

## 2. Required executable contents

Before scaffold Stage 1 is accepted:

- versioned Zod schemas for every canonical primitive/entity/stream/API/CLI/native command envelope;
- RFC 8785 canonical JSON implementation and cross-language golden fixtures;
- generated JSON Schema;
- generated command registry/client types where practical;
- valid and invalid fixtures;
- migration functions/metadata;
- compatibility tests;
- hash/timestamp/decimal/unit tests;
- schema writer/reader support declarations;
- duplicate primitive/enum/error/command drift checks;
- Rust/TypeScript protocol fixture generation;
- documentation/schema/invariant/API registry conformance script;
- one valid fixture and targeted invalid fixtures for every applicable Record Invariant Matrix rule.

## 3. Initial schema registry

At minimum:

- every primitive from `primitives.ts`;
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
  primitives.ts
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
  -> RFC 8785 canonical values/hashes
  -> generated JSON Schema
  -> generated command/client registry
  -> valid/invalid fixtures
  -> compatibility/migration tests
  -> Rust/TypeScript golden protocol fixtures
```

One generation direction must be selected so shared primitive/record/command shapes are not manually maintained in multiple sources. Until then, CI drift tests compare source types, runtime schemas, JSON Schema, command routes, and fixtures.

## 6. Runtime rules

- unknown top-level fields reject unless namespaced extensions allowed;
- duplicate JSON keys reject;
- IDs require exact prefix + lowercase ULID;
- SHA-256 fields require full lowercase `sha256:<64 hex>`;
- canonical value hashes use validated RFC 8785 bytes;
- timestamps use exact millisecond UTC form;
- finite numeric/confidence/token rules enforce safe ranges and explicit null;
- monetary cost uses canonical decimal strings, not floating JSON dollars;
- unknown major schema read-only;
- migrations never rewrite the only copy;
- output schemas distinguish raw bytes from parsed JSON;
- Promotion requires Candidate/Decision;
- Export Operation permits non-adoption output without Candidate;
- error code must exist in `error-codes.ts` unless classified as provider/project raw diagnostic only;
- API command must exist in `api-types.ts` and match its route/payload schema;
- cross-field validation must match the Record Invariant Matrix rather than accept structurally valid but semantically impossible records.

## 7. Current limitation

The shared primitive/domain/error/API registries and cross-record invariant contract exist, but executable Zod/JSON Schema, canonical JSON implementation, generated clients, fixtures, migrations, and compatibility tests do not. This is a visible scaffold prerequisite, not evidence that persistence or API validation is implemented.
