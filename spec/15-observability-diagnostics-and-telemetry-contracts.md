# 15 — Observability, Diagnostics, Telemetry, and Crash-Report Contracts

**Status:** Canonical implementation contract  
**Scope:** Local logs, metrics, traces, health, diagnostics, crash records, optional telemetry, consent, redaction, retention, and support bundles  
**Storage:** `spec/11-artifact-event-and-schema-contracts.md`  
**Security:** `security/THREAT-MODEL.md`

## 1. Purpose

Render Rivals needs enough local observability to debug process containment, browser capture, storage recovery, evaluator output, and UI failures without turning local development activity into surveillance.

This specification defines what is collected, where it lives, when anything may leave the machine, and how users inspect/delete it.

## 2. Default policy

Defaults:

- local structured logs enabled;
- canonical semantic Events enabled;
- native process/output records enabled according to Run policy;
- local health/resource metrics enabled;
- automatic remote telemetry disabled;
- automatic crash upload disabled;
- automatic diagnostic upload disabled;
- no background analytics daemon;
- no third-party analytics scripts in dashboard;
- no advertising or cross-product tracking identifiers;
- no source, screenshots, DOM, logs, paths, commands, or evaluator packets sent as telemetry.

Any remote telemetry capability is opt-in, separately configurable, and absent from MVP acceptance unless explicitly implemented/tested.

## 3. Observability classes

### Canonical semantic Events

Domain facts needed for reconstruction. Stored in Project/Run event streams. They are not optional telemetry.

### Native supervisor observations

Process, containment, resource, listener, signal, and cleanup facts. Stored locally and translated into semantic Events where relevant.

### Structured application logs

Diagnostic records from bootstrap, coordinator, API, browser orchestration, Git/workspace, evaluator adapter, and UI server.

### Raw process output

Binary stdout/stderr from managed processes. Sensitive local Artifacts with separate retention.

### Local metrics

Resource and performance observations such as duration, bytes, memory, process count, event latency, and UI/load timings. Local by default.

### Local traces

Optional bounded diagnostic traces linking operations/Events/processes. Disabled or sampled by policy; never required for canonical reconstruction.

### Diagnostic Export Operation

User-requested sanitized bundle assembled from selected local records.

### Remote telemetry

Optional aggregate product-health data sent to a declared endpoint only after consent.

### Crash report

Local crash metadata and optional user-approved remote submission.

## 4. Stable correlation identifiers

Use canonical IDs and `OperationId` for local correlation.

Do not create a persistent cross-installation tracking identifier by default.

If optional remote telemetry needs installation-level deduplication:

- generate a random revocable telemetry installation ID separate from Project/Session IDs;
- store it only after opt-in;
- display/reset/delete it in Settings;
- never derive it from hardware, account, repository, path, or source-control remote;
- rotate when telemetry is disabled/re-enabled if user requests reset.

Run, Project, Candidate, Artifact, path, branch, commit, and provider-account identifiers are not sent raw as ordinary telemetry.

## 5. Structured log envelope

```ts
interface StructuredLogRecord {
  schema: "render-rivals/log-record";
  schemaVersion: "1.0.0";
  timestamp: string;
  level: "trace" | "debug" | "info" | "warn" | "error";
  component: string;
  code: string | null;
  message: string;
  sessionId: SessionId | null;
  runId: RunId | null;
  operationId: OperationId | null;
  processId: ProcessRecordId | null;
  entityIds: string[];
  fields: Record<string, unknown>;
  redaction: {
    policySnapshotId: PolicySnapshotId;
    substitutions: number;
  };
}
```

Rules:

- message is human-readable but not stable API;
- stable failures use registered `ErrorCode`;
- secrets and sensitive fields are redacted before write;
- raw untrusted output is not copied into structured fields without bounds/redaction;
- stack traces are local sensitive fields and excluded from remote telemetry by default;
- absolute paths are local-only and normalized/omitted in portable diagnostics.

## 6. Log levels

Production defaults:

- `info` and above for application logs;
- `debug` enabled per Session or component for bounded duration;
- `trace` development-only or explicit short-lived diagnostic session.

Changing verbosity does not alter canonical Events/process raw output policy.

Debug/trace automatically return to default at Session end unless explicitly persisted in user configuration.

## 7. Log destinations

- pre-supervisor bootstrap failures: stderr and optional installation diagnostic file;
- native Session logs: Session/Run-owned structured files;
- coordinator/component logs: Run or installation logs according to ownership;
- browser orchestration logs: Run-owned;
- UI client errors: posted to local coordinator only after schema/size validation and Session authentication;
- raw Project/evaluator output: process files, never merged into coordinator log stream.

No log file is written inside source repository by default.

## 8. Rotation and retention

Structured installation logs:

- size-bounded rotation;
- count/age limit;
- startup cleanup through explicit operation;
- no hidden daemon.

Run logs follow Run retention and references. Raw output may have shorter retention when uncited and policy permits. Security/integrity/cleanup records required to interpret retained Run are preserved.

Deletion creates explicit result/tombstone where canonical references are affected.

## 9. Local metrics

Allowed local metrics include:

- startup/doctor duration;
- process/capture/evaluation/promotion/export duration;
- event append/snapshot latency;
- bytes/hashes/artifact counts;
- resource limits/cleanup latency;
- browser crashes/disconnects/page crashes;
- Gate/evaluator output status;
- UI API/SSE latency and reconnect count;
- schema/recovery/migration outcomes.

Metrics must not contain:

- source text;
- file/branch/remote names;
- screenshot/DOM content;
- commands/arguments/environment values;
- raw exception messages from Project code;
- provider prompts/responses;
- user rationale/notes;
- exact local paths;
- credentials/cookies/tokens.

## 10. Optional remote telemetry

If implemented, consent is:

- off by default;
- explicit and separate from evaluator/provider consent;
- described with exact endpoint/operator, fields, retention, and purpose;
- revocable immediately;
- respected in safe mode/offline mode;
- testable with a local capture fixture.

Permitted initial aggregate fields:

- Render Rivals component versions;
- OS family/architecture and coarse capability level;
- command name, not arguments;
- success/failure category and stable error code;
- bounded duration buckets;
- coarse feature flags;
- schema/protocol version;
- random telemetry installation ID if opted in.

Prohibited remote telemetry:

- Project/Run/Candidate/Artifact IDs;
- repository/commit/branch/package names;
- source, patches, captures, DOM, Evidence, Recommendation rationale, Decision rationale;
- process commands/output;
- local paths/ports/PIDs;
- evaluator packet/output/model prompt content;
- secret/env/cookie/header values;
- precise IP/location or hardware fingerprinting beyond transport-layer necessities.

No telemetry data is sold or used for advertising.

## 11. Telemetry failure behavior

Telemetry is never required for product operation.

- asynchronous bounded queue;
- no blocking startup/Run/cleanup;
- no infinite retry;
- bounded disk buffer only after opt-in;
- buffer follows retention and is user-visible/deletable;
- network/endpoint failure drops or defers according to policy without affecting Run outcome;
- telemetry process is not a separate background daemon.

## 12. Crash records

On bootstrap, supervisor, coordinator, or dashboard-server crash, local crash record may include:

- component/build/version;
- timestamp/exit/signal/native code;
- stable failure code when known;
- Session/Run/Operation IDs locally;
- bounded redacted stack/backtrace;
- capability and recent semantic/native Event references;
- cleanup result;
- paths to local diagnostic Artifacts;
- environment summary without secret values.

It excludes source/capture/raw output/provider payloads unless user later selects them for a diagnostic Export Operation.

Rust panic/core/minidump generation is disabled or carefully policy-controlled by default because dumps may contain secrets. If enabled, dumps are `sensitive_local`, separately consented, size-bounded, never auto-uploaded, and prominently deletable.

## 13. Crash upload

Remote crash submission, if implemented:

- never automatic by default;
- shows exact included files/fields;
- runs as user-approved Export Operation or explicit send action;
- applies redaction and omission report;
- allows deselection of source/capture/log/raw/provider content;
- records destination/operator/retention;
- verifies upload result without deleting local evidence automatically.

## 14. Diagnostic bundles

Diagnostic Export Operation defaults include:

- component versions/capabilities;
- redacted configuration/provenance;
- selected stable failure records;
- Event/integrity/cleanup summaries;
- schema/protocol versions;
- Artifact manifest metadata without sensitive payloads;
- explicit omission/redaction report.

Excluded by default:

- source/patches;
- screenshots/DOM/accessibility/geometry/styles;
- raw process output;
- evaluator packets/raw output;
- cookies/storage/environment values;
- absolute user paths;
- memory dumps;
- quarantine payloads.

User reviews bundle manifest before creation and before any upload.

## 15. Dashboard client errors

The dashboard may report client errors to local coordinator only when:

- Session authenticated;
- payload schema/size bounded;
- URL/query/token/path values stripped;
- component/route/build included;
- repeated identical errors rate-limited;
- user-entered text and rendered Candidate content excluded.

Browser console collection from Candidate pages remains Capture evidence/process data, not product telemetry.

## 16. Health status

Local health projections may summarize:

- supervisor/coordinator/browser/storage/Git/evaluator status;
- containment/ownership capability;
- active processes/ports;
- Event/Artifact integrity;
- cleanup incidents;
- disk/resource pressure;
- package/schema/protocol compatibility.

Health is derived and rebuildable. It does not replace canonical failure/cleanup records.

## 17. Privacy controls

Settings expose:

- telemetry on/off and exact field preview;
- crash upload policy;
- local log verbosity;
- local log/raw output retention;
- telemetry ID reset;
- delete queued telemetry;
- open local data/log paths;
- create diagnostic Export Operation;
- delete local installation diagnostics where safe.

Privacy controls do not permit deletion of Artifacts still required by retained canonical Evidence/Decision/Promotion.

## 18. Offline and safe mode

Offline mode:

- no telemetry/crash upload/update check;
- local logs/health/diagnostics continue;
- external evaluator unavailable unless local;
- queued opted-in telemetry is not sent until network allowed and consent remains active.

Safe mode:

- no telemetry upload by default;
- permits local integrity/recovery logs and diagnostic Export Operation;
- does not start Project/evaluator/browser processes.

## 19. Security events

Security-critical observations are retained locally even when ordinary log verbosity is low, including IPC auth violation, path escape, containment escape, listener mismatch, Artifact hash failure, invalid citation/provenance, stale approval, import attack, and cleanup ownership uncertainty.

Security Events never include secret values.

## 20. Development diagnostics

Development builds may enable richer traces only when:

- clearly labeled development mode;
- not published as ordinary package;
- output remains local;
- test secrets are synthetic;
- private source paths are removed from distributable source maps/builds where practical.

## 21. Required tests

- telemetry disabled sends no network request and creates no telemetry ID;
- opt-in shows exact payload and sends only permitted fields;
- Project/Run IDs, paths, commands, source, captures, Evidence absent from telemetry;
- telemetry failure never affects Run;
- queue bounded/deletable and no infinite retry;
- crash record redacts secrets and excludes raw content;
- crash upload requires explicit review/approval;
- minidump policy off by default and sensitive when enabled;
- dashboard client error schema strips URL/user/Candidate content;
- structured log stable code exists in registry;
- debug verbosity resets at Session end;
- rotation/retention preserves referenced canonical records;
- diagnostic bundle manifest/omissions correct;
- safe/offline mode sends nothing remotely;
- no third-party analytics script in dashboard build;
- no hidden background telemetry process.
