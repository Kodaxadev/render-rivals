# 17 — Local API Envelopes, Operation Status, and Pagination

**Status:** Canonical implementation contract  
**Scope:** Shared API command/query/error envelopes, command registry, operation status, revision rules, pagination, content negotiation, large Artifact responses, and sanitized error detail  
**General routes/commands:** `spec/13-configuration-cli-and-local-api-contracts.md`  
**Browser authentication:** `spec/16-dashboard-session-authentication-and-pairing.md`  
**Shared API types:** `schemas/api-types.ts`  
**Stable errors:** `schemas/error-codes.ts`

## 1. Purpose

`spec/13` defines the local API routes and HTTP status classes, but a developer still needs exact answer shapes, operation-status behavior, revision requirements, collection bounds, and error-detail rules. Without them, dashboard and CLI clients can diverge, accepted commands can return dead status URLs, and list routes can become unbounded.

This specification defines the canonical local API envelope and command-operation model. It does not make the local API a public interoperability standard.

## 2. General protocol

- base path is `/api/v1/`;
- authenticated browser behavior follows `spec/16`;
- request/response JSON is UTF-8 `application/json`;
- unknown top-level fields reject unless the exact versioned schema allows extensions;
- duplicate JSON keys reject;
- request bodies have route-specific byte limits checked before full allocation/parsing;
- JSON numbers that represent revisions/sequences/counts are safe integers;
- timestamps are RFC 3339 UTC with `Z`;
- entity/operation IDs use registered prefixes and validators;
- secrets, cookies, pairing credentials, native nonces, and raw process output never appear in ordinary API bodies;
- all paths returned inside JSON are same-origin absolute-path references beginning `/`, never full URLs and never filesystem paths unless an explicitly authenticated local-only diagnostic schema permits one.

## 3. Shared type authority

`schemas/api-types.ts` is the sole TypeScript authority for:

- `ApiCommandName`;
- `ApiOperationState`;
- `ApiCommandRequest`;
- `ApiCommandAccepted`;
- `ApiOperationStatus`;
- `ApiQueryResponse`;
- `ApiPage`;
- `ApiErrorBody` and `ApiErrorResponse`.

Markdown examples must not define incompatible local versions.

Runtime Zod/JSON Schema validators and generated clients derive from these names plus command-specific payload/result schemas.

## 4. Command registry

Canonical MVP command names:

| Command | HTTP route | Target |
|---|---|---|
| `project.register` | `POST /api/v1/projects/register` | Installation/Project creation |
| `project.doctor` | `POST /api/v1/projects/:projectId/doctor` | Project diagnostic operation |
| `run.create` | `POST /api/v1/runs/create` | New draft Run |
| `run.validate` | `POST /api/v1/runs/:runId/validate` | Existing draft Run |
| `run.start` | `POST /api/v1/runs/:runId/start` | Ready Run |
| `run.cancel` | `POST /api/v1/runs/:runId/cancel` | Active Run operation |
| `run.retry` | `POST /api/v1/runs/:runId/retry` | Legal same-input retry/new Attempt |
| `run.recover` | `POST /api/v1/runs/:runId/recover` | Allowed RecoveryDisposition |
| `decision.record` | `POST /api/v1/runs/:runId/decisions` | New User Decision |
| `promotion.create` | `POST /api/v1/runs/:runId/promotions` | New Promotion |
| `export.create` | `POST /api/v1/exports` | New Export Operation |
| `cleanup.execute` | `POST /api/v1/cleanup` | Verified owned cleanup |
| `session.logout` | `POST /api/v1/session/logout` | Browser Session credential invalidation |

The route and request envelope command must match exactly. A mismatch is `API_COMMAND_UNKNOWN` or `API_REQUEST_INVALID`; the server never chooses one silently.

Adding a command requires:

- shared type amendment;
- command payload/result schema;
- allowed state/revision/idempotency rules;
- API route and UI/CLI availability update;
- stable failure mapping;
- tests and documentation inventory update.

There is no generic arbitrary `PATCH` or free-form `command: string` endpoint.

## 5. Command request envelope

Every side-effecting request except the pairing ceremony uses `ApiCommandRequest<TPayload>`.

Example:

```json
{
  "schema": "render-rivals/api-command-request",
  "schemaVersion": "1.0.0",
  "operationId": "op_01K...",
  "expectedRevision": 7,
  "command": "run.cancel",
  "payload": {"reason":"user_requested"}
}
```

Rules:

- client creates a fresh `OperationId` before first submission;
- same operation ID and canonical request hash is idempotent;
- same operation ID with changed command, target, expected revision, or payload is `API_OPERATION_REPLAY_MISMATCH`;
- operation IDs never identify a Run entity or replace target IDs in the route/payload;
- command-specific payload is strict and size-bounded;
- omission of `expectedRevision` is invalid; use explicit `null` only where permitted.

## 6. Expected revision rules

`expectedRevision` is:

### Required non-null

- `run.validate`;
- `run.start`;
- `run.cancel`;
- `run.retry` when mutating current Run operation state;
- `run.recover`;
- `decision.record`;
- `promotion.create`;
- a Run-scoped `export.create` when authorization depends on current revision;
- mutation of an existing Project registration/configuration when later commands are added.

### Required null

- `project.register`;
- `run.create`;
- installation/project-only diagnostic Export without mutable target;
- `session.logout`;
- cleanup whose explicit target preconditions are identity/ownership records rather than one aggregate revision.

### Command-specific

- `project.doctor` may use Project revision when its result is registered into mutable Project summary;
- `cleanup.execute` may require Run revision when it will write Run cleanup status;
- `export.create` uses the revision of the owning Run/Project where its source set depends on mutable summary state.

A stale revision returns HTTP `409`, stable `ENTITY_REVISION_CONFLICT`, current revision when disclosure is safe, and legal commands for that current state. It does not partially perform the side effect.

## 7. Accepted response

A newly accepted asynchronous command returns HTTP `202` and `ApiCommandAccepted`.

`statusPath`:

- is exactly `/api/v1/operations/<operation-id>`;
- is same-origin relative;
- contains no auth token or other secret;
- resolves for the lifetime required by operation and retained audit policy;
- never points directly to a filesystem path.

`accepted=true` means durable intent and idempotency registration succeeded. It does not mean the domain side effect started or completed.

A repeat of an already completed identical operation may return HTTP `200` with `ApiOperationStatus`, or HTTP `202` with the same accepted/status reference when still active. It never creates a second operation.

## 8. Operation status route

Add:

```text
GET /api/v1/operations/:operationId
```

It returns `ApiOperationStatus<TResult>`.

State rules:

| State | `startedAt` | `terminalAt` | `result` | `error` |
|---|---|---|---|---|
| `accepted` | null | null | null | null |
| `running` | required | null | null or bounded progress-independent preliminary metadata | null |
| `completed` | required when execution phase exists | required | required command result or result-path reference | null |
| `failed` | optional when failure occurred before start | required | null | required |
| `cancelled` | optional | required | null or explicit partial-retention summary | null or cancellation detail according to command schema |

Rules:

- `terminalAt` never appears for active states;
- a failed operation includes registered stable code;
- operation status does not replace canonical Run/Promotion/Export/Cleanup records;
- result references point to canonical entity/query paths;
- progress percentages are derived elsewhere and cannot alter operation state;
- status query for unknown/unauthorized ID returns `404` and does not reveal whether another Session/user owns it;
- active operation status is invalidated/terminalized appropriately on Session loss while durable Run recovery remains separate.

## 9. Query response envelope

JSON query routes return `ApiQueryResponse<TData>`.

- `projection="canonical"` when the payload is a direct validated canonical record or lossless aggregate representation;
- `projection="derived"` for dashboard summaries, health, indexes, counts, thumbnails, or computed views;
- `revision` is the owning mutable aggregate revision when meaningful, otherwise null;
- `generatedAt` is response projection time, not entity creation time;
- canonical entity timestamps remain in data;
- HTTP cache headers default to `no-store` for authenticated product data in MVP;
- conditional `ETag` support may be added only from canonical/derived content identity with authentication and no secret leakage.

## 10. Pagination

Collection routes are bounded and use `ApiPage<TItem>`.

Applies at minimum to:

- Projects;
- Runs;
- Candidates where future cardinality grows;
- Run Events history query;
- Artifacts;
- Promotions;
- Export Operations;
- diagnostics/log summaries;
- operation history where exposed.

Request:

```text
?limit=<integer>&cursor=<opaque-string>
```

Rules:

- default limit `50`;
- minimum `1`, maximum `200` unless a route declares a smaller maximum;
- cursor is opaque, authenticated to server implementation, bounded in size, and never contains raw filesystem path/secret;
- ordering is deterministic and documented per route;
- next page does not repeat/skip entries under the route's snapshot policy;
- a cursor binds route, filters, sort, scope, and projection version;
- changed cursor parameters return `API_CURSOR_INVALID`;
- expired/rebuild-invalid cursor returns `API_CURSOR_INVALID` with restart guidance, not silent first-page fallback;
- `hasMore` agrees with `nextCursor != null`;
- empty page may have `nextCursor=null` only;
- no endpoint returns an unbounded “all” collection.

Run Events query may additionally accept an explicit `afterSequence` for canonical replay. If both cursor and sequence are supplied, the route schema defines one mode and rejects ambiguous combinations.

SSE replay remains governed by durable event ID/offset and `Last-Event-ID`; pagination cursor is not an SSE credential.

## 11. Filtering and sorting

- filter/sort keys are closed per route;
- unknown keys reject rather than being ignored;
- text filters are length-bounded and treated as data;
- IDs validate before lookup;
- date ranges use explicit UTC timestamps;
- sort has deterministic tie-breaker, normally canonical ID or sequence;
- filters do not interpolate into shell, SQL, filesystem glob, or regular expression without a safe bounded implementation;
- derived indexes may answer queries, but canonical files remain authority.

## 12. Error envelope

Every JSON API failure returns `ApiErrorResponse` unless the connection cannot safely produce JSON.

`ApiErrorBody` rules:

- `code` exists in `schemas/error-codes.ts`;
- `message` is concise user-facing wording, not stable machine contract;
- `retryable` reflects same immutable command/request safety, not generic optimism;
- `operationId` is present when the failure belongs to a registered operation;
- `currentRevision` is disclosed only for a target the authenticated caller may inspect;
- `allowedCommands` contains only currently legal commands and is empty when unknown/security-sensitive;
- `recoveryDisposition` is included only for Run recovery semantics;
- `details` is strict, bounded, redacted, nonsecret, and schema-specific;
- stack traces, raw child output, request cookies, paths, pairing codes, native nonces, and provider payloads are never ordinary details.

The same stable code may map to different HTTP classes only when the condition context genuinely differs; mapping is tested and documented.

## 13. HTTP/error mapping

Minimum mappings:

| HTTP | Typical stable code |
|---:|---|
| `400` | `API_REQUEST_INVALID` |
| `401` | `DASHBOARD_PAIRING_REQUIRED`, `DASHBOARD_SESSION_INVALID` |
| `403` | `DASHBOARD_HOST_INVALID`, `DASHBOARD_ORIGIN_INVALID`, `DASHBOARD_CSRF_INVALID`, policy prohibition |
| `404` | `API_OPERATION_NOT_FOUND` or resource-specific not-found code when defined |
| `409` | `ENTITY_REVISION_CONFLICT`, `API_OPERATION_REPLAY_MISMATCH`, destination/state conflict |
| `413` | `API_BODY_TOO_LARGE` |
| `415` | `API_MEDIA_TYPE_UNSUPPORTED` |
| `422` | schema/domain-specific validation code |
| `429` | `API_RATE_LIMITED` |
| `500` | registered internal domain/storage/runtime failure |
| `503` | supervisor/runtime unavailable code |

Authentication/authorization failures may intentionally collapse status/detail to avoid resource-existence or pairing-verifier oracles.

## 14. Content negotiation

MVP JSON routes:

- require `Content-Type: application/json` for JSON bodies;
- accept `Accept: application/json` or generic `*/*`;
- return `API_MEDIA_TYPE_UNSUPPORTED`/`415` for unsupported request media;
- return `API_RESPONSE_NOT_ACCEPTABLE`/`406` when the client explicitly excludes supported response media;
- do not accept form-encoded mutation bodies except the minimal pairing implementation if `spec/16`/route contract explicitly chooses one—and current pairing route uses JSON;
- do not perform automatic XML/YAML/HTML conversion of API errors.

## 15. Artifact content responses

`GET /api/v1/artifacts/:artifactId/content` is not wrapped in JSON.

Requirements:

- authenticated exact-origin request;
- Artifact ID lookup only, no arbitrary relative path parameter;
- registered media type and `X-Content-Type-Options: nosniff`;
- active content uses attachment or approved sandboxed preview policy;
- `Content-Length` when known;
- single byte-range requests may be supported for large local files;
- invalid/unsupported/multipart range returns explicit `416` or full response only according to one tested policy—never malformed partial bytes;
- response never serves quarantined/missing/corrupt/deleted Artifact as valid;
- download filename is sanitized display metadata, not path authority;
- no-store cache policy by default;
- aborting browser response does not delete or mutate Artifact;
- access is locally audited without logging cookie/secret/content.

Metadata remains JSON-wrapped separately.

## 16. Rate and admission limits

Local does not mean unlimited.

- pairing limits follow `spec/16`;
- mutation endpoint concurrency is bounded by command/admission policy;
- repeated invalid requests and expensive diagnostics are rate-limited per Session/origin;
- query limits prevent huge projections;
- rate limiting never blocks native output draining or cleanup authority;
- `429` includes `API_RATE_LIMITED`, retry guidance, and no sensitive global load detail;
- security-critical flooding may end browser Session after local diagnostic record.

## 17. CLI relationship

CLI may invoke the same application services directly inside coordinator or through authenticated local API according to implementation, but:

- command names, payload schemas, operation IDs, error codes, revision and idempotency semantics are shared;
- CLI result envelope remains distinct from HTTP envelope;
- CLI does not scrape human API messages;
- exit code derives from typed result/error class, not HTTP status alone;
- pairing is browser-only and is not required for the owning terminal CLI/native control path.

## 18. Required tests

- all command names/routes/payload schemas match generated registry;
- free-form/unknown command rejected;
- operation ID exact replay is idempotent and changed replay conflicts;
- expected revision required/null rules per command;
- accepted command status path exists and contains no secret/full URL;
- operation status state/timestamp/result/error combinations validate;
- operation status cannot replace or contradict canonical entity state;
- query response labels canonical versus derived correctly;
- every collection defaults/bounds limit and uses deterministic cursor;
- cursor binds filters/sort/scope and rejects tampering/expiry/ambiguity;
- no unbounded list endpoint;
- error codes registered, details bounded/redacted, allowed commands state-correct;
- authentication failures do not reveal resource/operation existence;
- content negotiation and body-size failures are stable;
- Artifact ID content serving, range, MIME, quarantine, and filename rules;
- CLI/API command and error semantics agree;
- generated API types/schema/client drift check passes.

## 19. Conformance

An implementation is nonconforming if it:

- uses `string` as an unrestricted command registry;
- accepts mutation without OperationId or required expected revision;
- returns a status URL that does not resolve;
- returns full URLs/tokens/filesystem paths in ordinary status references;
- exposes unbounded collection queries;
- silently resets invalid pagination cursors;
- returns unregistered stable error codes or leaks secrets/raw output in details;
- reports an accepted operation as completed before observed canonical completion;
- serves arbitrary paths through Artifact endpoint;
- lets CLI and dashboard assign different semantics to the same command.
