# 13 — Configuration Discovery, CLI, and Local API Contracts

**Status:** Canonical implementation contract  
**Scope:** Configuration filenames and precedence, command-line behavior, exit codes, dashboard API, SSE events, idempotency, revision preconditions, and safe mode  
**Shared types:** `schemas/domain-types.ts`

## 1. Purpose

Render Rivals exposes the same domain services through a local browser dashboard and a CLI. The two surfaces must not invent different defaults, transitions, retry behavior, or policy.

This specification removes implementation ambiguity around:

- where configuration lives;
- how configuration layers merge;
- which environment variables are reserved;
- which CLI commands exist;
- what exit codes mean;
- how dashboard commands map to domain operations;
- how clients resume event streams;
- how safe mode behaves.

## 2. Configuration files

### 2.1 User-global configuration

The user-global configuration is:

```text
<data-root>/config/user.jsonc
```

It contains user defaults only. It is not copied into source repositories.

### 2.2 Project marker

The project marker is:

```text
<repository>/.render-rivals/project.json
```

It contains stable project identity and minimal registration metadata. It must not contain secrets, run history, raw logs, or large evidence.

### 2.3 Project configuration

The project configuration is:

```text
<repository>/.render-rivals/config.jsonc
```

A project may omit this file and rely on detected/default values. Creating it is an explicit user action.

### 2.4 Run templates

Run templates are stored outside the repository:

```text
<data-root>/projects/<project-id>/templates/<template-id>.json
```

A template is mutable planning data. Starting validation resolves it into an immutable `run-config.json` under the Run root.

### 2.5 Session secret bindings

Secret bindings are session-only and are not written to the files above. The canonical Run Configuration stores only references, presence, transmission policy, and redaction classification.

## 3. Configuration precedence

Lowest to highest:

1. built-in defaults;
2. user-global `user.jsonc`;
3. project `config.jsonc`;
4. selected run template;
5. explicit dashboard draft values;
6. explicit CLI flags;
7. session-only secret bindings.

The resolved configuration records provenance for every field.

## 4. Merge semantics

- Scalars replace lower-precedence scalars.
- Objects merge recursively by schema field.
- Arrays replace the complete lower-precedence array unless the schema explicitly declares keyed merge behavior.
- Named maps merge by key.
- `null` clears a value only when the schema declares the field clearable.
- Unknown fields are rejected.
- Security and containment requirements cannot be weakened silently by a higher layer.
- Command arrays replace as complete executable-plus-argument records; arguments are not concatenated across layers.
- Gate and factor definitions merge only by stable key when the schema explicitly permits it; conflicting definitions fail validation.

## 5. Configuration discovery

Given a selected path, project discovery:

1. canonicalizes the path;
2. locates the nearest permitted repository root;
3. rejects ambiguous nested repositories unless the user chooses one explicitly;
4. reads `.render-rivals/project.json` when present;
5. verifies project identity;
6. reads `.render-rivals/config.jsonc` when present;
7. detects package manager, lockfile, scripts, and framework hints;
8. presents detected values separately from stored explicit values.

Detection never overwrites project configuration automatically.

## 6. Environment variables

Reserved bootstrap/session variables use the prefix:

```text
RENDER_RIVALS_
```

Initial reserved variables:

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

- endpoint and nonce never appear in argv;
- reserved variables are not generic user configuration overrides;
- no automatic double-underscore environment-to-config expansion exists in the MVP;
- project command environment is configured field-by-field;
- secret values use explicit references or session bindings;
- unknown `RENDER_RIVALS_*` variables are ignored with diagnostics unless a future version registers them.

## 7. CLI executable

The canonical CLI command is conceptually:

```text
render-rivals
```

The npm package may expose the same binary name even if the final package scope differs.

## 8. Global CLI options

```text
--json                 Machine-readable stdout
--data-root <path>     Explicit canonical data root for this invocation
--project <path|id>    Select project
--run <run-id>         Select run where supported
--non-interactive      Never prompt; fail when required input is missing
--verbose              Include structured diagnostic detail
--safe-mode            Start read-only recovery mode
--version              Print component versions
--help                 Print command help
```

Sensitive values are never accepted through ordinary command-line flags because argv may be observable.

## 9. CLI commands

### 9.1 `init`

Registers a project and optionally creates `.render-rivals/config.jsonc`.

```text
render-rivals init [path]
```

It never modifies source code or package manifests.

### 9.2 `doctor`

Checks installation, supervisor, containment, browser, Git, project commands, paths, storage, ports, and fixture prerequisites.

```text
render-rivals doctor [--project <path|id>] [--full]
```

`--full` may execute destructive-looking doctor fixtures only inside owned temporary roots and after explicit trust/confirmation.

### 9.3 `run`

Creates or starts a Run from explicit inputs or a template.

```text
render-rivals run --project <path|id> [--template <id>] [--config <path>]
```

In noninteractive mode, missing required fields are configuration errors.

### 9.4 `inspect`

Shows project, run, candidate, event, artifact, integrity, or capability state without mutation.

```text
render-rivals inspect <project|run|candidate|artifact|diagnostics> <id-or-path>
```

### 9.5 `resume`

Assesses and performs only the recovery action allowed by the current durable state.

```text
render-rivals resume --run <run-id> [--action <allowed-action>]
```

It never assumes that the requested action is valid merely because the user supplied it.

### 9.6 `export`

Creates a report, patch, branch, workspace preservation record, or diagnostic bundle after validating preconditions.

```text
render-rivals export --run <run-id> --kind <report|patch|branch|workspace|diagnostics>
```

### 9.7 `cleanup`

Cleans verified owned resources and reports anything remaining.

```text
render-rivals cleanup [--run <run-id>] [--session <session-id>] [--diagnostics]
```

It never terminates a process whose ownership cannot be verified.

## 10. CLI output contract

Human output:

- uses concise headings and stable error codes;
- sends normal results to stdout;
- sends warnings and failures to stderr;
- never prints secrets or session tokens;
- prints artifact/report paths only after durable verification.

JSON output uses one envelope:

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

Progress in `--json` mode is emitted as NDJSON on stderr or through an explicitly selected progress file; stdout contains exactly one final result document.

## 11. Exit codes

| Code | Meaning |
|---:|---|
| `0` | Command completed successfully, including valid current-retained or no-material-improvement outcomes |
| `2` | Usage, configuration, or validation error |
| `3` | Required platform/runtime capability unavailable |
| `4` | Run or requested operation failed with valid diagnostics |
| `5` | Run interrupted or recovery action required |
| `6` | Integrity or security failure; mutation refused |
| `7` | Explicit user cancellation |
| `8` | Requested resource not found |

Exit codes do not encode Recommendation outcome. Machine consumers read the JSON result and canonical run records.

## 12. Local dashboard server

The coordinator serves:

```text
http://127.0.0.1:<port>/
```

Rules:

- bind loopback only by default;
- random available port unless explicitly configured;
- per-session authentication token;
- no token in URL, query string, logs, or page source;
- HttpOnly SameSite=Strict session cookie;
- verify `Origin` on mutation requests;
- require a CSRF-safe custom mutation header;
- set restrictive content-security policy;
- serve artifacts only by registered Artifact ID;
- close with the coordinator session.

## 13. API versioning

All API routes use:

```text
/api/v1/
```

The API is local product API, not a public compatibility standard in the MVP.

## 14. Query routes

Minimum query surface:

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
GET /api/v1/artifacts/:artifactId/metadata
GET /api/v1/artifacts/:artifactId/content
GET /api/v1/diagnostics
```

Queries expose canonical or explicitly labeled derived projections.

## 15. Command routes

Commands are nouns plus explicit operations rather than generic PATCH mutation:

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
POST /api/v1/runs/:runId/exports
POST /api/v1/cleanup
```

There is no MVP `pause` command.

## 16. Command envelope

Every mutation request contains:

```ts
interface CommandRequest<T> {
  operationId: string;
  expectedRevision: number | null;
  command: string;
  payload: T;
}
```

Every accepted command returns:

```ts
interface CommandAccepted {
  operationId: string;
  accepted: true;
  currentRevision: number;
  statusUrl: string;
}
```

Acceptance means validation and durable command intent succeeded. It does not mean the side effect completed.

## 17. Idempotency and conflicts

- `operationId` is required for every mutation.
- Repeating the same operation ID and canonical payload returns the recorded result.
- Reusing an operation ID with a different payload is rejected.
- `expectedRevision` protects against stale dashboard tabs and conflicting commands.
- A revision mismatch returns HTTP `409` with current state metadata.
- Invalid state transition returns HTTP `409` with allowed commands.
- Validation errors return HTTP `422`.
- Authentication failures return HTTP `401` or `403` without leaking endpoint detail.

## 18. Event streaming

The dashboard uses Server-Sent Events:

```text
GET /api/v1/events
GET /api/v1/runs/:runId/events/stream
```

Requirements:

- event IDs are canonical event IDs or durable stream offsets;
- support `Last-Event-ID` resume;
- replay from canonical events when available;
- heartbeats contain no domain state;
- clients treat SSE as notification and refetch authoritative state after gaps;
- high-volume raw process bytes are never embedded in SSE;
- slow clients cannot block canonical output draining.

## 19. HTTP status semantics

| Status | Meaning |
|---:|---|
| `200` | Query or already-completed idempotent command result |
| `202` | Side-effecting command accepted and running |
| `400` | Malformed request envelope |
| `401` | Missing or invalid session authentication |
| `403` | Authenticated but prohibited by origin, CSRF, safe mode, or policy |
| `404` | Resource absent or intentionally undisclosed |
| `409` | Revision, state, operation, or destination conflict |
| `413` | Request exceeds configured size |
| `422` | Schema-valid request with invalid domain/configuration semantics |
| `429` | Local admission or command-rate limit |
| `500` | Internal failure with stable diagnostic code |
| `503` | Supervisor/runtime dependency unavailable |

## 20. Safe mode

Safe mode is a session capability, not a Run state.

It requires a healthy authenticated supervisor/coordinator session and permits:

- read-only project/run/artifact inspection;
- integrity scanning;
- recovery assessment;
- verified cleanup;
- sanitized diagnostic export;
- configuration viewing without secret resolution.

It prohibits:

- project command execution;
- browser launch and capture;
- evaluator invocation;
- source/workspace mutation;
- new Run start;
- decision or promotion mutation when required state cannot be verified.

If the native supervisor or IPC cannot start, safe mode is unavailable; the bootstrap prints installation diagnostics and exits.

## 21. Re-evaluation and revision commands

Re-evaluating a previous decision creates a new Run.

The new Run may import:

- source snapshot provenance;
- task brief;
- configuration as a draft template;
- factor/gate definitions;
- historical report links.

It must recapture current and contender evidence in a new valid epoch. It never treats prior-run captures as selectable evidence.

Changing source, fixture, gates, factors, evaluator policy, protected dimensions, or runtime policy after validation creates a superseding Run rather than mutating the sealed Run Configuration.

## 22. Required tests

- user/project/template/CLI precedence and provenance;
- arrays replace rather than accidentally concatenate;
- security requirements cannot be weakened silently;
- secrets never appear in resolved canonical configuration;
- reserved session variables never enter argv or logs;
- CLI JSON stdout contains one final document;
- no-material-improvement exits `0`;
- interrupted run exits `5`;
- stale expected revision returns `409`;
- repeated operation ID is idempotent;
- repeated operation ID with changed payload is rejected;
- SSE resumes after `Last-Event-ID` and refetches after a gap;
- raw process output is not streamed through SSE;
- safe mode blocks command execution;
- re-evaluation creates a new Run and new Capture Epoch.
