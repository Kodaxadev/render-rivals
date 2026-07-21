# Render Rivals Schemas

**Status:** Shared primitive, domain, API, and Operation types plus stable error registry established; executable validation scaffold pending  
**Storage:** [`spec/11-artifact-event-and-schema-contracts.md`](../spec/11-artifact-event-and-schema-contracts.md)  
**API routes:** [`spec/13-configuration-cli-and-local-api-contracts.md`](../spec/13-configuration-cli-and-local-api-contracts.md)  
**Pairing:** [`spec/16-dashboard-session-authentication-and-pairing.md`](../spec/16-dashboard-session-authentication-and-pairing.md)  
**API envelopes:** [`spec/17-local-api-envelopes-operations-and-pagination.md`](../spec/17-local-api-envelopes-operations-and-pagination.md)  
**Primitive wire formats:** [`spec/18-canonical-primitives-json-hashing-and-measurements.md`](../spec/18-canonical-primitives-json-hashing-and-measurements.md)  
**Operation ledger:** [`spec/19-operation-ledger-idempotency-and-reconciliation.md`](../spec/19-operation-ledger-idempotency-and-reconciliation.md)  
**Capture registry:** [`spec/20-capture-artifact-formats-and-evidence-registry.md`](../spec/20-capture-artifact-formats-and-evidence-registry.md)  
**Cross-record invariants:** [`docs/RECORD-INVARIANT-MATRIX.md`](../docs/RECORD-INVARIANT-MATRIX.md)

## 1. Canonical shared sources

### [`primitives.ts`](primitives.ts)

Sole TypeScript vocabulary for shared JSON-facing primitives:

- full lowercase `sha256:` digest strings;
- canonical UTC timestamps;
- canonical decimal strings;
- canonical relative paths;
- safe integers, revisions, sequences and counts;
- byte, duration and confidence aliases;
- exact `MonetaryAmount` and cost basis.

`spec/18` defines lexical, range, unit and canonicalization rules. Template aliases alone do not validate a value.

### [`domain-types.ts`](domain-types.ts)

Sole TypeScript authority for shared persisted-domain vocabulary:

- registered ID aliases and prefixes;
- Candidate, Session, Run and Epoch states and roles;
- Run `promoting` state;
- Recommendation outcomes and reason codes;
- User Decision actions;
- Pairwise verdicts;
- Evaluation and Process purposes;
- Recovery and Comparison validity;
- `InferenceUsage` with safe integer tokens and exact monetary cost;
- Recommendation, Decision, Promotion and Export Operation records;
- supersession, retry and terminal fields.

### [`error-codes.ts`](error-codes.ts)

Sole stable error-identifier registry for Rust and TypeScript protocol fixtures, canonical failures, CLI/API envelopes, UI messages, tests and diagnostics.

Human wording may change. Stable code meaning does not change silently.

### [`api-types.ts`](api-types.ts)

Sole TypeScript authority for local API vocabulary:

- closed `ApiCommandName` registry;
- command request and accepted envelopes;
- accepted, running, reconciling, interrupted and terminal Operation projections;
- canonical and derived query responses;
- bounded page shape;
- stable error response and body.

Command-specific payload and result schemas must map one-to-one to spec17.

### [`operation-types.ts`](operation-types.ts)

Sole TypeScript authority for durable Operation ledger vocabulary:

- installation, Project, Run and Session scopes;
- accepted, running, reconciling, interrupted and terminal states;
- request and payload hashes;
- Session, Project, Run, target and revision binding;
- result references, failure, recovery and side-effect proof;
- Operation supersession.

Spec19 defines persistence, idempotency and crash reconciliation.

### [`docs/RECORD-INVARIANT-MATRIX.md`](../docs/RECORD-INVARIANT-MATRIX.md)

Authoritative cross-record requirements that interfaces cannot express alone, including outcome-dependent cardinality, nullability, ownership, timestamps, allowed empty arrays, supersession and retry lineage, and valid relationships among Recommendation, Decision, Promotion, Export, Evaluation, Gate, Capture, Process, Event and Artifact records.

Markdown specifications reference these sources rather than create incompatible primitives, unions, registries, command names, envelopes or cross-field meanings.

## 2. Required executable contents

Before scaffold Stage 1 is accepted:

- versioned Zod schemas for every canonical primitive, entity, stream, API, CLI and native envelope;
- RFC 8785 canonical JSON implementation and Rust/TypeScript goldens;
- generated JSON Schema;
- generated API command and client registry where practical;
- valid and invalid fixtures;
- migration functions and metadata;
- compatibility tests;
- hash, timestamp, decimal, unit, range and overflow tests;
- schema writer and reader support declarations;
- duplicate primitive, enum, error, command and Operation drift checks;
- Rust/TypeScript protocol fixtures;
- documentation, schema, invariant, API, Artifact-class and Operation-registry conformance script;
- one valid fixture and targeted invalid fixtures for every applicable Record Invariant Matrix rule.

## 3. Initial schema registry

At minimum:

- every primitive from `primitives.ts`;
- installation and user/project configuration;
- Project, trust and Source Snapshot;
- Run and Run Configuration;
- Candidate, Attempt, Workspace and Process;
- Capture Plan, Epoch and Capture;
- every spec20 Capture Artifact structured schema;
- Gate Definition and Result;
- Evaluation Factor, Comparison, Evaluation, validation and `InferenceUsage`;
- Evidence;
- Recommendation and User Decision;
- Promotion and Export Operation;
- Operation ledger record;
- Artifact creation and amendment;
- Project and Run Event and Event Head;
- Integrity, Recovery and Cleanup;
- lock and execution-lease metadata;
- trash, restore and purge manifests;
- evaluator command request and result;
- API command request, accepted, status, error, query and page envelopes;
- every command-specific API payload and result;
- CLI result and command envelopes;
- import and export manifests;
- native package compatibility manifest where JSON-backed.

Required Artifact classes/media are registered under spec20 and spec21. A filename is never schema authority.

## 4. Directory target

```text
schemas/
  primitives.ts
  domain-types.ts
  error-codes.ts
  api-types.ts
  operation-types.ts
  zod/
  json-schema/
  fixtures/
    valid/
    invalid/
  migrations/
```

Implementation packages may generate compiled output elsewhere, but the source registry remains here unless an ADR intentionally moves it.

## 5. Generation model

```text
Zod/source declarations
  -> inferred TypeScript types where practical
  -> RFC 8785 canonical values and hashes
  -> generated JSON Schema
  -> generated API command/client and registry data
  -> valid/invalid fixtures
  -> compatibility/migration tests
  -> Rust/TypeScript protocol goldens
```

One generation direction must be selected so primitive, record and command shapes are not manually maintained in multiple sources. Until then, CI compares source types, runtime schemas, JSON Schema, routes, Artifact classes and fixtures.

## 6. Runtime rules

- unknown top-level fields reject unless namespaced extensions are allowed;
- duplicate JSON keys reject;
- IDs require exact prefix and lowercase ULID;
- SHA-256 fields require full lowercase `sha256:<64 hex>`;
- canonical value hashes use validated RFC 8785 bytes;
- timestamps use exact millisecond UTC form;
- numeric confidence, token, size, revision and sequence values use explicit safe ranges and null;
- monetary cost uses canonical decimal strings, not floating JSON dollars;
- unknown major schema is read-only;
- migrations never rewrite the only copy;
- pre-scaffold Run state `exporting` migrates explicitly to `promoting` and is not accepted by writer v1;
- output schemas distinguish raw bytes from parsed JSON;
- Promotion requires Candidate and Decision;
- Export Operation permits non-adoption output without Candidate;
- Operation request/status must follow spec19 and cannot exist only in memory;
- Capture validity requires every configured spec20 Artifact;
- active-content preview support is independent from Artifact validity;
- stable error codes must exist in `error-codes.ts` unless classified as raw provider/Project diagnostics only;
- API command must exist in `api-types.ts` and match its route/payload schema;
- cross-field validation must match the Record Invariant Matrix.

## 7. Current limitation

The shared primitive, domain, error, API and Operation registries and the cross-record invariant contract exist, but executable Zod/JSON Schema, canonical JSON implementation, generated clients, Capture/lock/trash schemas, fixtures, migrations and compatibility tests do not. This is a visible scaffold prerequisite, not evidence that persistence or API validation is implemented.
