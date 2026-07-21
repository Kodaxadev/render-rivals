# 13 — Configuration Discovery, CLI, and Local API Contracts

**Status:** Canonical implementation contract  
**Scope:** Configuration files/precedence, CLI behavior, exit codes, local API, SSE, idempotency, revision preconditions, safe mode, Promotion, and Export Operation  
**Shared types:** `schemas/domain-types.ts`

## 1. Purpose

CLI and local dashboard expose the same domain/application services. They must not invent different defaults, transitions, retry behavior, or policy.

## 2. Configuration files

### User-global

```text
<data-root>/config/user.jsonc
```

### Project marker

```text
<repository>/.render-rivals/project.json
```

Contains identity/registration only; no secrets, Run history, raw logs, or evidence.

### Project configuration

```text
<repository>/.render-rivals/config.jsonc
```

Optional and created explicitly.

### Run templates

```text
<data-root>/projects/<project-id>/templates/<template-id>.json
```

Mutable planning data. Validation resolves it into immutable `run-config.json`.

### Secret bindings

Session-only; canonical configuration stores reference, presence, scope, transmission policy, and redaction classification, never raw value.

## 3. Precedence

Lowest to highest:

1. built-in defaults;
2. user-global configuration;
3. project configuration;
4. selected Run template;
5. dashboard draft values;
6. explicit CLI flags;
7. Session-only secret bindings.

Every resolved field records provenance.

## 4. Merge semantics

- scalars replace;
- objects recursively merge by schema;
- arrays replace unless explicitly keyed;
- named maps merge by key;
- `null` clears only clearable fields;
- unknown fields reject;
- security/capability cannot silently weaken;
- executable/argument commands replace as complete records;
- Gate/Factor definitions merge only by stable key where schema permits;
- conflicting protected/security definitions fail validation.

## 5. Project discovery

Given a path:

1. canonicalize;
2. locate nearest permitted repository root;
3. reject ambiguous nested repositories until user selects one;
4. read/verify marker;
5. read optional project config;
6. detect Git, package manager, lockfile, scripts, and framework hints;
7. present detected values separately from stored explicit values.

Detection never overwrites configuration automatically.

## 6. Reserved environment

Prefix:

```text
RENDER_RIVALS_
```

Initial variables:

```text
RENDER_RIVALS_BOOTSTRAP_NODE_EXEC_PATH
RENDER_RIVALS_BOOTSTRAP_NODE_VERSION
RENDER_RIVALS_SESSION_ID
RENDER_RIVALS_SUPERVISOR_ENDPOINT
RENDER_RIVALS_SUPERVISOR_NONCE
RENDER_RIVALS_SUPERVISOR_PROTOCOL
RENDER_RIVALS_SESSION_ROOT
RENDER_RIVALS_DATA_ROOT
RENDER_RIVALS_SAFE_MODE
```

Rules:

- endpoint/nonce never argv/URL/log;
- reserved values are not generic config overrides;
- no automatic environment-to-config expansion;
- project environment configured field-by-field;
- secrets use explicit bindings;
- unknown reserved variables ignored with diagnostics unless registered.

## 7. CLI executable and global flags

Conceptual executable:

```text
render-rivals
```

Global flags:

```text
--json
--data-root <path>
--project <path|id>
--run <run-id>
--non-interactive
--verbose
--safe-mode
--version
--help
```

Sensitive values are never accepted through ordinary flags.

## 8. CLI commands

### `init`

```text
render-rivals init [path]
```

Registers Project and optionally writes project config. Never modifies source/package manifests.

### `doctor`

```text
render-rivals doctor [--project <path|id>] [--full]
```

Checks installation, supervisor, containment, browser, Git, commands, paths, storage, ports, fixture, and failure fixtures. Full destructive-looking checks occur only inside owned temp roots after explicit confirmation.

### `run`

```text
render-rivals run --project <path|id> [--template <id>] [--config <path>]
```

Creates/starts Run. Noninteractive missing input is validation error.

### `inspect`

```text
render-rivals inspect <project|run|candidate|artifact|export|diagnostics> <id-or-path>
```

Read-only canonical/derived state.

### `resume`

```text
render-rivals resume --run <run-id> [--action <allowed-action>]
```

Performs only current permitted recovery action.

### `promote`

```text
render-rivals promote --run <run-id> --kind <patch|branch|workspace>
```

Creates candidate adoption handoff. Requires nonstale authorizing User Decision and selected eligible Candidate.

### `export`

```text
render-rivals export [--run <run-id>] --kind <report|diagnostics|run-bundle|evidence|screenshots|config|logs>
```

Creates a general Export Operation. It does not imply candidate acceptance and may not need a Run or Candidate depending kind.

### `cleanup`

```text
render-rivals cleanup [--run <run-id>] [--session <session-id>] [--diagnostics]
```

Cleans verified owned resources only.

## 9. CLI output

Human output uses stable codes, stdout for results, stderr for warnings/failures, no secrets/tokens, and paths only after verification.

JSON:

```ts
interface CliResult<T> {
  schema: "render-rivals/cli-result";
  schemaVersion: "1.0.0";
  command: string;
  ok: boolean;
  status: string;
  data: T | null;
  warnings: Array<{ code: string; message: string }>;
  error: { code: string; message: string; details?: unknown } | null;
}
```

In `--json`, stdout contains one final document. Progress is NDJSON on stderr or explicit progress file.

## 10. Exit codes

| Code | Meaning |
|---:|---|
| `0` | Success, including current retained/no material improvement |
| `2` | Usage/configuration/validation error |
| `3` | Required platform/runtime capability unavailable |
| `4` | Run/Promotion/Export Operation failed with diagnostics |
| `5` | Interrupted or recovery required |
| `6` | Integrity/security failure; mutation refused |
| `7` | Explicit cancellation |
| `8` | Resource not found |

Recommendation outcome is read from canonical JSON, not exit code.

## 11. Local dashboard server

Serves loopback:

```text
http://127.0.0.1:<port>/
```

Requirements:

- random available port unless configured;
- Session token never URL/query/log/page source;
- HttpOnly SameSite=Strict cookie;
- Origin verification and CSRF-safe custom mutation header;
- restrictive CSP;
- Artifact serving by registered ID only;
- closes with coordinator.

## 12. API version

```text
/api/v1/
```

Local product API, not public interoperability guarantee.

## 13. Query routes

```text
GET /api/v1/session
GET /api/v1/capabilities
GET /api/v1/projects
GET /api/v1/projects/:projectId
GET /api/v1/runs
GET /api/v1/runs/:runId
GET /api/v1/runs/:runId/events
GET /api/v1/runs/:runId/candidates
GET /api/v1/runs/:runId/evidence
GET /api/v1/promotions/:promotionId
GET /api/v1/exports/:exportOperationId
GET /api/v1/artifacts/:artifactId/metadata
GET /api/v1/artifacts/:artifactId/content
GET /api/v1/diagnostics
```

Queries label derived projections explicitly.

## 14. Command routes

```text
POST /api/v1/projects/register
POST /api/v1/projects/:projectId/doctor
POST /api/v1/runs/create
POST /api/v1/runs/:runId/validate
POST /api/v1/runs/:runId/start
POST /api/v1/runs/:runId/cancel
POST /api/v1/runs/:runId/retry
POST /api/v1/runs/:runId/recover
POST /api/v1/runs/:runId/decisions
POST /api/v1/runs/:runId/promotions
POST /api/v1/exports
POST /api/v1/cleanup
```

No MVP pause endpoint. Run-scoped export uses `POST /api/v1/exports` with Run source entity; it is not nested as Promotion.

## 15. Command envelope

```ts
interface CommandRequest<T> {
  operationId: string;
  expectedRevision: number | null;
  command: string;
  payload: T;
}

interface CommandAccepted {
  operationId: string;
  accepted: true;
  currentRevision: number;
  statusUrl: string;
}
```

Acceptance means durable intent, not completed side effect.

## 16. Idempotency and conflicts

- operation ID required for mutation;
- repeated same ID/payload returns result;
- changed payload under same ID rejected;
- expected revision protects stale clients;
- revision/state/operation/destination conflict → `409`;
- semantic validation → `422`;
- auth/origin/CSRF policy → `401/403`.

Promotion retry verifies Candidate/Decision/source/destination. Export retry verifies operation kind/source entities/redaction/destination.

## 17. SSE

```text
GET /api/v1/events
GET /api/v1/runs/:runId/events/stream
```

- canonical event ID/durable offset;
- `Last-Event-ID` resume;
- replay from canonical events;
- heartbeat no domain state;
- clients refetch after gaps;
- raw process bytes excluded;
- slow clients cannot block output draining.

## 18. HTTP statuses

| Status | Meaning |
|---:|---|
| `200` | Query or completed idempotent command |
| `202` | Side-effecting command accepted |
| `400` | Malformed envelope |
| `401` | Invalid/missing Session authentication |
| `403` | Origin/CSRF/safe-mode/policy prohibited |
| `404` | Absent or intentionally undisclosed |
| `409` | Revision/state/operation/destination conflict |
| `413` | Request too large |
| `422` | Invalid domain/config semantics |
| `429` | Local admission/rate limit |
| `500` | Internal failure with stable code |
| `503` | Supervisor/runtime unavailable |

## 19. Safe mode

Safe mode is Session capability, not Run state. Requires healthy authenticated supervisor/coordinator.

Permits read-only inspection, integrity/recovery assessment, verified cleanup, sanitized diagnostic Export Operation, and configuration viewing without secret resolution.

Prohibits project commands, browser/evaluator, source/workspace mutation, new Run, unsafe Decision/Promotion, and exports whose source integrity cannot be verified.

Native/IPC startup failure cannot use safe mode.

## 20. Re-evaluation and revision

Re-evaluating prior decision creates a new Run. It may import source provenance, task/config draft, gates/factors, and report links but must recapture in a new valid Epoch.

Changing sealed source, fixture, gates, factors, evaluator policy, protected dimensions, or runtime policy creates a superseding Run.

## 21. Promotion versus Export Operation rules

- patch/branch/workspace contender handoff → Promotion;
- report/diagnostics/Run bundle/evidence/screenshots/config/logs → Export Operation;
- Export Operation never satisfies or implies User Decision;
- Promotion always requires Candidate and Decision;
- a report may be exported for current-retained, tie, human-review, invalid, cancelled, or failed Runs when safe;
- safe-mode diagnostics are Export Operations, never Promotions.

## 22. Required tests

- configuration precedence/provenance and array replacement;
- security requirements cannot weaken;
- secrets absent from canonical config;
- reserved variables absent argv/logs;
- JSON stdout one final document;
- no-material-improvement exit `0`;
- interrupted exit `5`;
- stale revision `409`;
- operation idempotency and changed replay rejection;
- SSE resume/refetch after gap;
- raw bytes absent from SSE;
- safe mode blocks execution;
- re-evaluation creates new Run/Epoch;
- report export works without Candidate/acceptance;
- patch/branch/workspace command fails without nonstale Decision;
- Promotion and Export Operation status URLs resolve to different entity schemas.
