# 11 — Artifact, Event, and Schema Contracts

**Status:** Canonical implementation contract  
**Scope:** Canonical filesystem layout, JSON envelopes, event stream, artifact integrity, atomic writes, locking, reconstruction, migrations, and retention

## 1. Purpose

Render Rivals uses files and append-only event streams as the source of truth. A database, search index, or UI cache may improve performance later, but the complete run must remain understandable and recoverable without them.

This specification defines the on-disk contract. Domain meaning is defined in `spec/09-domain-model-and-identifiers.md`; lifecycle behavior is defined in `spec/10-run-and-candidate-state-machines.md`.

## 2. Data-root policy

Render Rivals stores canonical data under a user-configurable absolute data root outside the source repository by default.

Default conceptual locations:

- Windows: `%LOCALAPPDATA%/RenderRivals/data`
- Linux: `$XDG_STATE_HOME/render-rivals` or `~/.local/state/render-rivals`
- macOS: `~/Library/Application Support/RenderRivals/data`

The exact platform resolver is implementation-defined but must be recorded in diagnostics.

Rules:

- source repositories are not canonical storage roots;
- the data root must be an owned directory;
- every path is canonicalized before access;
- symlink and junction traversal is checked against the owned root;
- project-provided strings cannot create paths outside the data root;
- a portable export is separate from canonical live storage.

## 3. Canonical directory layout

```text
<data-root>/
  installation.json
  projects/
    <project-id>/
      project.json
      project-events.ndjson
      run-index.ndjson
      source-snapshots/
        <source-id>.json
      runs/
        <run-id>/
          run.json
          run-config.json
          events.ndjson
          event-head.json
          lock.json
          integrity.json
          candidates/
            <candidate-id>/
              candidate.json
              attempts/
                <attempt-number>.json
              workspace.json
              processes/
                <process-id>.json
              gates/
                <gate-result-id>.json
          capture-plans/
            <capture-plan-id>.json
          epochs/
            <epoch-id>/
              epoch.json
              captures/
                <capture-id>.json
          comparisons/
            <comparison-id>.json
          evaluations/
            <evaluation-id>/
              evaluation.json
              input-manifest.json
              raw-output.json
              evidence/
                <evidence-id>.json
          recommendations/
            <recommendation-id>.json
          decisions/
            <decision-id>.json
          promotions/
            <promotion-id>.json
          artifacts/
            manifest.ndjson
            files/
              <artifact-id>/
                <safe-filename>
          logs/
            supervisor.ndjson
            coordinator.ndjson
            browser.ndjson
          tmp/
          quarantine/
          exports/
```

Empty directories need not be created in advance.

## 4. Canonical versus rebuildable files

Canonical:

- entity JSON files;
- run and project event streams;
- artifact manifest;
- artifact payload files;
- raw evaluator input and output;
- integrity and terminal summaries;
- process and cleanup observations.

Rebuildable:

- search index;
- recent-project list;
- dashboard summaries;
- thumbnails;
- cached image dimensions;
- database projections;
- derived charts;
- UI preferences not needed to interpret evidence.

A rebuildable projection may never contain the only copy of a decision, state transition, artifact hash, or provenance fact.

## 5. JSON encoding rules

Canonical JSON files use:

- UTF-8 without BOM;
- LF line endings;
- RFC 8259 JSON;
- RFC 3339 UTC timestamps with `Z`;
- no NaN or infinity;
- decimal values serialized as JSON numbers only when deterministic precision is sufficient;
- sorted object keys for files included in reproducibility hashes;
- no comments;
- no trailing commas;
- final newline.

IDs, hashes, versions, paths, and enum values are strings.

## 6. Schema envelope

Every canonical entity JSON file uses:

```json
{
  "schema": "render-rivals/run",
  "schemaVersion": "1.0.0",
  "id": "run_01K0R7J6R8M3KQ6NPG2XYT4A9B",
  "revision": 7,
  "createdAt": "2026-07-20T18:30:00.000Z",
  "updatedAt": "2026-07-20T18:31:44.120Z",
  "data": {},
  "extensions": {}
}
```

Rules:

- `schema` is a stable URI-like name without a network dependency;
- `schemaVersion` follows semantic versioning;
- immutable entities omit `updatedAt` and use revision `1`;
- mutable summary snapshots increment revision by exactly one;
- canonical writers reject unknown top-level keys;
- extension keys use reverse-domain or project namespaces;
- extension values cannot change core semantics.

## 7. Required schema names

Initial registry:

- `render-rivals/installation`
- `render-rivals/project`
- `render-rivals/source-snapshot`
- `render-rivals/run`
- `render-rivals/run-config`
- `render-rivals/candidate`
- `render-rivals/candidate-attempt`
- `render-rivals/workspace`
- `render-rivals/process`
- `render-rivals/capture-plan`
- `render-rivals/capture-epoch`
- `render-rivals/capture`
- `render-rivals/gate-result`
- `render-rivals/comparison`
- `render-rivals/evaluation`
- `render-rivals/evidence`
- `render-rivals/recommendation`
- `render-rivals/decision`
- `render-rivals/promotion`
- `render-rivals/integrity`
- `render-rivals/event-head`

Schema definitions should live under `schemas/` in the implementation repository and be version-pinned in releases.

## 8. Run summary contract

`run.json` is the latest atomic summary, not the full history.

Minimum `data`:

```json
{
  "projectId": "prj_...",
  "runConfigurationId": "rcf_...",
  "displayName": "Pricing comparison",
  "state": "capturing",
  "currentCandidateId": "can_...",
  "contenderIds": ["can_..."],
  "activeEpochId": "cep_...",
  "latestRecommendationId": null,
  "latestDecisionId": null,
  "startedAt": "2026-07-20T18:30:01.000Z",
  "terminalAt": null,
  "lastDurableCheckpoint": "prepared",
  "lastAppliedEventSequence": 83,
  "recoveryDisposition": null,
  "failure": null
}
```

A Run snapshot is valid only when `lastAppliedEventSequence` exists in the verified event stream and the snapshot hash recorded by the corresponding event matches.

## 9. Immutable run configuration

`run-config.json` contains the fully resolved configuration, not references to mutable defaults.

It must include:

- configuration provenance and precedence sources;
- source input declarations;
- commands and redaction declarations;
- target route and origin policy;
- readiness checks;
- viewports and capture environment;
- gate definitions;
- factor definitions and weights;
- evaluator adapter identity;
- limits and retry policy;
- storage and retention policy;
- export policy;
- configuration hash.

Secrets are represented by secret references or redacted placeholders, never plaintext in the canonical file.

## 10. Event stream contract

### 10.1 Format

`events.ndjson` contains one JSON object per line. Each complete line is one event.

```json
{"schema":"render-rivals/event","schemaVersion":"1.0.0","id":"evt_...","runId":"run_...","sequence":84,"timestamp":"2026-07-20T18:31:44.100Z","actor":"coordinator","type":"run.state_changed","entities":{"runId":"run_..."},"operationId":"op_...","payload":{"from":"preparing","to":"capturing"},"previousEventHash":"sha256:...","eventHash":"sha256:..."}
```

### 10.2 Event hash

`eventHash` is SHA-256 over canonical JSON of the event excluding `eventHash` itself. `previousEventHash` is null for sequence 1 and otherwise equals the prior event's hash.

The chain detects:

- line mutation;
- line deletion from the middle;
- reordering;
- accidental stream concatenation.

It does not replace filesystem access control or signatures.

### 10.3 Event types

Event types use lowercase dotted namespaces:

- `run.validation_requested`
- `run.state_changed`
- `candidate.workspace_materialization_started`
- `process.launch_observed`
- `epoch.invalidated`
- `capture.artifact_committed`
- `gate.result_completed`
- `evaluation.output_rejected`
- `recommendation.created`
- `decision.recorded`
- `promotion.completed`
- `recovery.assessed`
- `cleanup.incomplete`

The event registry is versioned. Unknown events are preserved by readers and ignored only when their absence cannot affect reconstruction.

### 10.4 Event payload rules

- payloads contain facts needed for history and reconstruction;
- large content is stored as an Artifact and referenced by ID;
- secrets are redacted before serialization;
- path fields are relative when inside the run root;
- event payloads do not contain mutable display-only caches;
- error payloads contain stable error code plus human and technical summaries.

## 11. Event-head contract

`event-head.json` stores:

- latest sequence;
- latest event ID;
- latest event hash;
- byte offset after the latest complete line;
- stream byte length;
- updated timestamp.

It is an optimization and consistency check. The event stream remains canonical. If the head is missing or inconsistent, it is rebuilt by scanning verified complete lines.

## 12. Artifact manifest

`artifacts/manifest.ndjson` is append-only. Each line records one Artifact or status amendment.

Creation record:

```json
{
  "schema": "render-rivals/artifact-record",
  "schemaVersion": "1.0.0",
  "operation": "created",
  "artifactId": "art_...",
  "runId": "run_...",
  "owner": {"captureId": "cap_..."},
  "class": "capture.screenshot",
  "relativePath": "artifacts/files/art_.../desktop.webp",
  "mediaType": "image/webp",
  "byteLength": 182445,
  "sha256": "...",
  "validity": "valid",
  "createdAt": "2026-07-20T18:31:20.000Z",
  "creationEventId": "evt_...",
  "redaction": {"applied": false},
  "retention": "run"
}
```

Status amendments may mark an artifact diagnostic, quarantined, missing, corrupt, exported, or deleted. They do not rewrite creation history.

## 13. Artifact classes

Initial classes include:

- `source.manifest`
- `source.patch`
- `process.stdout`
- `process.stderr`
- `process.endpoint-observation`
- `capture.screenshot`
- `capture.dom-summary`
- `capture.console-summary`
- `capture.metadata`
- `capture.failure-screenshot`
- `gate.observation`
- `evaluation.input-manifest`
- `evaluation.raw-output`
- `evaluation.validation-report`
- `recommendation.report`
- `promotion.patch`
- `promotion.branch-manifest`
- `diagnostic.bundle`
- `integrity.report`

New classes require registry documentation.

## 14. Artifact write protocol

Writers must never expose a partial payload at its canonical path.

Protocol:

1. allocate Artifact ID and safe filename;
2. create a file under `tmp/<operation-id>/` with exclusive creation;
3. stream content while calculating SHA-256 and byte length;
4. flush application buffers;
5. fsync the file where supported;
6. close the file;
7. reopen or stat to verify length and hash according to artifact policy;
8. create the destination artifact directory;
9. atomically rename the payload into its canonical path on the same filesystem;
10. fsync the containing directory where supported;
11. append Artifact creation record;
12. append domain event referencing the Artifact;
13. update the owning entity snapshot.

If any step before canonical rename fails, the temporary file is abandoned or quarantined. If rename succeeds but manifest append fails, recovery discovers an orphan canonical file and quarantines it until reconciled.

## 15. Atomic entity write protocol

For `run.json` and other mutable snapshots:

1. read current revision and verify expected revision;
2. serialize deterministic JSON to a sibling temp file;
3. flush and fsync;
4. atomically replace canonical file;
5. fsync directory where supported;
6. append or confirm the state-change event linkage.

Implementations must define ordering carefully so recovery can reconcile either event-first or snapshot-first crashes. Render Rivals uses event-first intent and snapshot-linked completion events; state reducers prefer verified events when disagreement exists.

## 16. Locks and ownership

### 16.1 Run lock

Only one coordinator may mutate a Run at a time.

`lock.json` contains:

- run ID;
- session ID;
- coordinator process identity;
- supervisor session identity;
- acquired timestamp;
- lease heartbeat timestamp;
- lock format version.

The lock file alone does not prove ownership. Recovery asks the supervisor whether the session identity remains valid.

### 16.2 Lock rules

- exclusive creation for acquisition;
- heartbeat interval shorter than lease timeout;
- stale lock cannot be removed until process/session identity is checked;
- UI readers do not require the mutation lock;
- artifact preview never writes canonical state;
- cleanup has a separate operation lock when coordinator ownership is absent.

## 17. Temporary and quarantine areas

`tmp/` contains incomplete operations and may be cleaned after recovery inspection.

`quarantine/` contains:

- hash-mismatched artifacts;
- orphan canonical files;
- path-policy violations copied for diagnosis when safe;
- partial evaluator output;
- malformed JSON;
- files from invalid schema migrations.

Quarantined content is never evaluator input and never silently restored.

## 18. Path safety

All canonical relative paths must:

- use `/` separators in JSON;
- contain no empty, `.` or `..` segments;
- contain no absolute-drive or UNC prefix;
- resolve under the owning root after canonicalization;
- not traverse symlinks, junctions, or mount points outside policy;
- use generated artifact directories rather than user filenames as directory names;
- sanitize display filenames independently of identity.

Path-policy violations are security failures, not normal missing-file errors.

## 19. Integrity report

`integrity.json` summarizes the latest verification:

- event sequence and chain status;
- entity schema validation status;
- artifact manifest status;
- artifact counts by validity;
- missing or orphan files;
- latest verified checkpoint;
- cleanup status;
- verification timestamp;
- verifier version.

A terminal Run must have a final integrity report. A report is an observation and may be superseded by a later verification.

## 20. Evaluation input manifest

Each Evaluation has an immutable `input-manifest.json` containing:

- Comparison ID;
- current and contender IDs;
- valid epoch ID;
- Capture IDs by viewport;
- allowed Artifact IDs with class, hash, media type, and role;
- gate eligibility summary;
- factor definitions and weights;
- evaluator instructions hash;
- environment fingerprint;
- excluded artifacts and reasons;
- manifest hash.

The evaluator may cite only Artifact IDs in this manifest.

## 21. Raw evaluator output

Raw output is stored exactly as received after transport framing is removed. It is never overwritten by normalized output.

The Evaluation record separately stores:

- parse status;
- schema validation;
- citation validation;
- semantic validation;
- normalization results;
- rejection reasons.

This preserves evidence of malformed or unsafe evaluator behavior.

## 22. Reproducibility hash

A Recommendation's reproducibility hash covers canonical hashes of:

- resolved Run Configuration;
- source snapshots;
- valid epoch summary;
- capture metadata and artifact hashes;
- effective Gate Results;
- Evaluation input manifest;
- accepted evaluator output;
- recommendation policy and version.

Recomputing the same inputs must yield the same deterministic recommendation outcome and reproducibility hash.

## 23. Reconstruction algorithm

A reader reconstructs a Run by:

1. locating `run.json` and `events.ndjson`;
2. verifying complete event lines, contiguous sequence, and hash chain;
3. validating the latest Run snapshot schema;
4. replaying events through the versioned reducer;
5. comparing reconstructed state and snapshot revision;
6. validating referenced entity files;
7. reading the artifact manifest and applying amendments;
8. verifying hashes required by the latest checkpoint;
9. deriving effective attempts and supersessions;
10. producing an integrity and recovery assessment.

If snapshot and replay disagree, verified events take precedence and a repaired snapshot may be written only through an explicit recovery event.

## 24. Incomplete NDJSON lines

A crash may leave a partial final line.

Rules:

- readers accept complete newline-terminated lines only;
- a partial final line is copied to quarantine and truncated from the canonical stream after recovery lock acquisition;
- a partial line in the middle is corruption;
- truncation appends a project- or run-level recovery event after the stream is restored;
- sequence reuse after a partial uncommitted line is allowed only when no complete event with that sequence exists.

## 25. Schema versioning

Semantic version interpretation:

- patch: compatible clarification or optional validation tightening that does not change stored meaning;
- minor: backward-compatible additive fields or enum values handled through explicit capability checks;
- major: incompatible structure or meaning.

Writers emit one exact supported version. Readers declare a supported range per schema.

Unknown major versions are read-only and cannot be mutated.

## 26. Migration policy

- migrations never modify the only copy in place;
- a migration creates a backup or new run representation;
- migration input hash and output hash are recorded;
- every changed entity has a migration event;
- artifact payloads are not rewritten unless their format itself changes;
- a failed migration leaves the original readable;
- downgrade is not assumed;
- public alpha may reject unsupported pre-alpha schemas rather than promise indefinite migration.

## 27. Redaction

Redaction occurs before canonical logging or evaluator input.

Supported redaction sources:

- configured secret values;
- environment keys marked secret;
- authorization headers;
- cookies and storage values when captured;
- filesystem user-home prefix in exportable diagnostics;
- provider tokens;
- user-defined regular expressions.

Each redacted Artifact records policy version and whether substitutions occurred. Render Rivals must not claim redaction guarantees for arbitrary secrets it was not configured to recognize.

## 28. Retention

Retention values:

- `run`: retained while the Run exists;
- `decision`: cannot be removed while cited by a retained Recommendation or Decision;
- `diagnostic-temporary`: eligible for early cleanup after terminal state;
- `exported`: local copy may be cleaned after verified export under policy;
- `protected`: explicit user protection.

Required evidence cannot be deleted independently. Cleanup calculates reference reachability from retained recommendations, decisions, and promotions.

## 29. Deletion protocol

Whole-run deletion:

1. require explicit confirmation;
2. acquire project and run deletion locks;
3. verify no active session;
4. append project run-deletion-requested record;
5. move run directory to an owned trash area atomically when possible;
6. append deletion-completed record to project index;
7. delete trash asynchronously under retention policy.

Selective diagnostic cleanup uses manifest amendments and must preserve all cited artifacts.

## 30. Export bundle

A portable run bundle contains:

- bundle manifest and version;
- immutable Run Configuration;
- source provenance without source contents by default;
- selected entity files;
- verified event stream;
- artifact manifest;
- included artifacts;
- integrity report;
- redaction report;
- checksums file.

Exports never become the canonical live Run unless explicitly imported as a new Project/Run with provenance.

## 31. Error codes

Persistence errors use stable codes, including:

- `STORAGE_ROOT_UNAVAILABLE`
- `STORAGE_OUT_OF_SPACE`
- `PATH_OUTSIDE_OWNED_ROOT`
- `ATOMIC_RENAME_FAILED`
- `ENTITY_SCHEMA_INVALID`
- `ENTITY_REVISION_CONFLICT`
- `EVENT_SEQUENCE_GAP`
- `EVENT_HASH_MISMATCH`
- `EVENT_PARTIAL_FINAL_LINE`
- `ARTIFACT_HASH_MISMATCH`
- `ARTIFACT_MISSING`
- `ARTIFACT_ORPHANED`
- `RUN_LOCK_HELD`
- `RUN_LOCK_IDENTITY_UNKNOWN`
- `SCHEMA_MAJOR_UNSUPPORTED`
- `MIGRATION_FAILED`

User-facing messages add context without replacing stable codes.

## 32. Conformance requirements

An implementation is nonconforming if:

- a database is required to recover a Run;
- mutable entity files are overwritten without revision checks and atomic replacement;
- partial artifacts can appear at canonical paths;
- evaluator citations are not resolved against the immutable input manifest;
- artifact hashes are optional for evidence;
- source-provided paths can escape owned roots;
- unknown major schemas are silently rewritten;
- failed evaluator output overwrites raw output;
- retries erase previous attempts;
- the event stream can be reordered without detection;
- deleting a thumbnail can delete the only copy of cited evidence.