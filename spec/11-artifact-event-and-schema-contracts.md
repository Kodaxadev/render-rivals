# 11 — Artifact, Event, and Schema Contracts

**Status:** Canonical implementation contract  
**Scope:** Canonical filesystem layout, schema registry, event and artifact streams, atomic writes, locking, reconstruction, migrations, retention, import, and export  
**Shared types:** `schemas/domain-types.ts`

## 1. Purpose

Render Rivals uses files and append-only streams as the source of truth. A database, search index, or UI cache may improve performance, but the complete Run remains understandable and recoverable without them.

Domain meaning is defined by `spec/09`; lifecycle by `spec/10`; configuration/CLI/API by `spec/13`.

## 2. Storage roots

Canonical durable storage uses a user-configurable absolute data root outside source repositories.

Conceptual defaults:

- Windows: `%LOCALAPPDATA%/RenderRivals/data`
- Linux: `$XDG_STATE_HOME/render-rivals` or `~/.local/state/render-rivals`
- macOS: `~/Library/Application Support/RenderRivals/data`

Disposable worktrees, browser downloads, package caches, and image-processing files use a separate cache root.

Rules:

- source repositories are not canonical Run roots;
- the data root is owned and writable;
- every path is canonicalized and containment checked;
- project strings cannot escape approved roots;
- portable exports are separate from live storage.

## 3. Repository marker

The only required repository-local metadata is:

```text
<repository>/.render-rivals/project.json
```

Optional project configuration:

```text
<repository>/.render-rivals/config.jsonc
```

No Run history, raw output, secrets, or large evidence is stored there.

## 4. Canonical directory layout

```text
<data-root>/
  installation.json
  config/
    user.jsonc
  projects/
    <project-id>/
      project.json
      project-events.ndjson
      project-event-head.json
      run-index.ndjson
      source-snapshots/
        <source-id>.json
      templates/
        <template-id>.json
      runs/
        <run-id>/
          run.json
          run-config.json
          events.ndjson
          event-head.json
          integrity.json
          recovery.json
          lock.json
          candidates/
            <candidate-id>/
              candidate.json
              attempts/
                <attempt-number>.json
              workspace.json
              processes/
                <process-id>/
                  process.json
                  stdout.bin
                  stderr.bin
                  lifecycle.json
                  usage.json
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
              raw-output.bin
              validation.json
              evidence/
                <evidence-id>.json
          recommendations/
            <recommendation-id>.json
          decisions/
            <decision-id>.json
          promotions/
            <promotion-id>.json
          cleanup/
            <cleanup-operation-id>.json
          artifacts/
            manifest.ndjson
            files/
              <artifact-id>/
                <safe-filename>
          logs/
            supervisor.ndjson
            coordinator.ndjson
            browser.ndjson
          reports/
          tmp/
          quarantine/
          exports/
```

Empty directories need not exist before use.

`lock.json` and `tmp/` are operational, not portable canonical evidence. They remain inside the Run root so recovery can inspect them.

## 5. Canonical versus derived data

Canonical:

- entity JSON files;
- project/Run semantic event streams;
- artifact manifest and payloads;
- process lifecycle and raw output;
- evaluator input, raw output, validation, and accepted evidence;
- recommendations, decisions, promotions;
- cleanup, integrity, and recovery observations.

Derived/rebuildable:

- search/SQLite indexes;
- recent lists and dashboard projections;
- thumbnails, contact sheets, and cached image dimensions;
- aggregate charts and metrics;
- UI state not needed to interpret evidence.

A derived projection never contains the only copy of a domain fact.

## 6. JSON encoding and canonical hashing

Canonical JSON:

- UTF-8 without BOM;
- LF endings and final newline;
- RFC 8259;
- RFC 3339 UTC timestamps with `Z`;
- no duplicate keys, NaN, or infinity;
- deterministic canonicalization for hashes;
- no comments or trailing commas.

Configuration input may be JSONC, but resolved canonical entities are JSON.

SHA-256 is encoded lowercase hexadecimal. A record states whether its hash covers raw bytes, canonical JSON bytes, or normalized manifest bytes.

## 7. Entity envelope

```ts
interface CanonicalEntity<T> {
  schema: string;
  schemaVersion: string;
  id: string;
  revision: number;
  createdAt: string;
  updatedAt?: string;
  data: T;
  extensions?: Record<string, unknown>;
}
```

Rules:

- immutable entities use revision `1` and omit `updatedAt`;
- mutable summaries increment revision exactly once per accepted replacement;
- writers reject unknown top-level keys;
- namespaced extensions cannot change core meaning;
- IDs follow `spec/09` and runtime validators enforce prefix plus 26-character ULID.

## 8. Required schema registry

Initial schema names include:

- installation;
- user/project configuration;
- project and project event/head;
- source snapshot;
- Run and Run Configuration;
- Candidate, Candidate Attempt, Workspace, Process;
- Capture Plan, Capture Epoch, Capture;
- Gate Definition and Gate Result;
- Evaluation Factor, Comparison, Evaluation, Evaluation validation;
- Evidence Record;
- Recommendation, User Decision, Promotion;
- Artifact creation/amendment;
- Run event and event head;
- Cleanup result;
- Integrity and recovery reports;
- CLI/API envelopes where persisted as fixtures.

Implementation location:

```text
schemas/zod/
schemas/json-schema/
schemas/fixtures/valid/
schemas/fixtures/invalid/
schemas/migrations/
```

Every schema has version, TypeScript type, Zod validator, generated JSON Schema, valid/invalid fixtures, migration list, and compatibility tests.

## 9. Run summary

`run.json` is the latest atomic projection, not full history. It contains at minimum project/Run Configuration IDs, state, current/contender IDs, active Epoch, latest Recommendation/Decision, terminal timestamps/reasons, last checkpoint, last applied event sequence, recovery disposition, and failure summary.

A summary is valid only when:

- its `lastAppliedEventSequence` exists in the verified stream;
- the referenced transition/checkpoint event is durable;
- its revision and canonical hash match the snapshot-committed event or deterministic replay.

## 10. Immutable Run Configuration

`run-config.json` contains the fully resolved frozen values and provenance from `spec/13`, including source declarations, commands, route/origin, fixture/states/viewports/interaction, gates, factors, evaluator, resource/retry policy, storage/retention, security/redaction, export policy, and configuration hash.

Secrets appear only as references and transmission policy.

## 11. Semantic event stream

`events.ndjson` contains one newline-terminated JSON event per line.

```ts
interface RunEvent {
  schema: "render-rivals/event";
  schemaVersion: "1.0.0";
  id: EventId;
  runId: RunId;
  sequence: number;
  timestamp: string;
  actor: string;
  type: string;
  entities: Record<string, string>;
  operationId: string | null;
  causationId: EventId | null;
  payload: unknown;
  previousEventHash: string | null;
  eventHash: string;
}
```

`sequence` is a nonnegative safe integer. Writers fail before exceeding `Number.MAX_SAFE_INTEGER`; a future schema may migrate to decimal strings if ever required.

`eventHash` covers canonical event JSON excluding `eventHash`. The chain detects mutation, deletion, reorder, and accidental concatenation; it is not a signature.

Event types use lowercase dotted namespaces and a versioned registry.

Large bytes are Artifacts, not event payloads. Paths inside the Run are relative. Errors include stable code and human/technical summaries.

## 12. Project streams

`project-events.ndjson` and `run-index.ndjson` follow the same complete-line, sequence, hash, and recovery principles as Run streams, with project-scoped schemas and heads.

A Run deletion or import cannot rely on a missing project index entry as proof; canonical Run directories and project events are reconciled during recovery.

## 13. Event head

Event-head files store latest sequence, event ID/hash, byte offset after the latest complete line, stream length, and update time.

Heads are rebuildable optimizations. The stream remains canonical.

## 14. Exact transition commit ordering

For a state-changing command:

1. validate command/state/revision;
2. allocate operation and event IDs;
3. append and fsync intent event when the operation can outlive the request;
4. perform side effect and collect observations;
5. append and fsync completion/failure transition event;
6. serialize the new summary snapshot with `lastAppliedEventSequence` set to that transition sequence;
7. write sibling temp, flush/fsync, atomically replace summary, and fsync directory;
8. append optional `snapshot.committed` observation containing snapshot revision/hash;
9. return command result.

Recovery rules:

- transition event with old snapshot → replay and rewrite snapshot;
- intent without completion → inspect operation/native facts and classify;
- snapshot claiming nonexistent transition → quarantine snapshot and replay prior valid state;
- no event is appended after a snapshot as the only proof of the state it contains.

This ordering replaces ambiguous event-first/snapshot-first alternatives.

## 15. Artifact manifest

`artifacts/manifest.ndjson` is append-only. Creation/amendment records include:

- artifact ID, Run, owner, class, path, media type;
- byte length and SHA-256;
- validity and sensitivity;
- retention;
- operation ID and creation event ID;
- redaction metadata;
- Epoch/Candidate IDs where applicable;
- supersession or deletion reason for amendments.

Status amendments never rewrite creation history.

## 16. Artifact classes

Initial classes include:

- source manifest/patch;
- process stdout/stderr/lifecycle/usage/endpoint observation;
- screenshot, DOM summary, accessibility snapshot, geometry, computed styles, console, network, interaction trace, metadata, failure screenshot;
- gate observation;
- evaluation input, raw output, validation, normalized output;
- evidence record;
- recommendation/decision/report;
- promotion patch/branch manifest;
- cleanup, diagnostics, integrity, recovery.

New classes require schema/registry documentation.

## 17. Artifact write protocol

1. allocate Artifact and operation IDs plus safe final path;
2. exclusively create under `tmp/<operation-id>/` on the same filesystem;
3. stream bytes while hashing/counting;
4. flush/fsync and close;
5. reopen/stat and verify media-specific requirements;
6. create destination directory;
7. atomically rename to final path and fsync directory;
8. append/fsync Artifact creation record with operation ID;
9. append semantic event referencing Artifact;
10. update owner summary through the transition protocol when required.

Failure before rename leaves noncanonical temp bytes. Rename without manifest creates an orphan that recovery reconciles only with exact operation proof; otherwise quarantine.

## 18. Process output

`stdout.bin` and `stderr.bin` are raw binary-safe bytes. `process.json`, `lifecycle.json`, and `usage.json` are canonical JSON.

All are registered with process ownership and sensitivity. Raw output is excluded from standard exports and may be retention-limited only with explicit truncation/amendment records.

## 19. Evaluator raw output

`raw-output.bin` stores exact post-transport bytes and may contain invalid JSON, text, or truncated provider output. It is never named or parsed as canonical JSON merely because valid output is expected.

`validation.json` separately records parse, schema, citation, provenance, semantic validation, normalization, and rejection reasons.

Accepted Evidence can cite only Artifacts in immutable `input-manifest.json`.

## 20. Locks

Only one coordinator mutates a Run.

`lock.json` records Run, Session, coordinator/native identity, acquired/heartbeat time, and format version.

The file alone never proves ownership. Recovery verifies Session/process identity. Stale locks are not removed by age alone. UI readers do not require mutation lock. Cleanup may use a separate verified operation lock.

## 21. Temporary and quarantine areas

`tmp/` contains incomplete operations and is inspected before cleanup.

`quarantine/` contains malformed JSON, partial streams, hash mismatches, orphan files, unsafe path content copied only when safe, partial evaluator output, and failed migration output.

Quarantined content is never normal evidence and never silently restored.

## 22. Path safety

Canonical relative paths:

- use `/` in JSON;
- contain no empty, `.`, or `..` segments;
- contain no drive/UNC/absolute prefix;
- resolve under owning root after canonicalization;
- do not cross disallowed symlink, junction, mount, or case-collision boundaries;
- use generated IDs for directories;
- sanitize display names separately.

Path-policy violation is security failure.

## 23. Integrity and reconstruction

`integrity.json` records stream/schema/manifest status, artifact counts/violations, latest verified checkpoint, cleanup status, verifier version, and time.

`recovery.json` records last verified state, interrupted operations, invalid Epochs, process observations, and permitted `RecoveryDisposition`.

Reconstruction:

1. locate Run summary/stream;
2. verify complete lines, sequences, and hash chain;
3. validate schema versions;
4. replay events;
5. compare/rebuild summary;
6. validate entity references;
7. apply Artifact amendments;
8. verify checkpoint-required hashes;
9. derive effective attempts/supersessions;
10. reconcile native process/cleanup facts;
11. produce integrity/recovery reports.

Verified events take precedence over a conflicting snapshot.

## 24. Incomplete stream lines

- only complete newline-terminated lines are accepted;
- partial final bytes are copied to quarantine then truncated under recovery lock;
- partial middle line is corruption;
- sequence may be reused only when no complete event exists;
- recovery action is recorded after stream restoration.

## 25. Schema versioning and migration

- patch: compatible clarification without changed meaning;
- minor: additive compatible fields/enums with capability checks;
- major: incompatible structure or meaning.

Unknown major versions are read-only.

Migrations:

- never mutate the only copy in place;
- record input/output hashes and changed entities;
- validate before atomic adoption;
- preserve original on failure;
- do not make invalid evidence valid;
- do not resurrect invalid Epochs;
- do not infer unknown accounting values.

## 26. Redaction and sensitivity

Redaction occurs before structured logs, evaluator transmission, diagnostics, and standard export using declared values/keys, authorization/cookie filtering, token patterns, user regex, and home-path normalization.

Sensitivity:

- `public`;
- `project`;
- `sensitive_local`.

Secret material is prohibited as canonical Artifact. Declassification requires explicit review.

## 27. Retention and deletion

Retention classes include Run lifetime, decision/protected evidence, diagnostic-temporary, exported, and explicit protection.

Required cited evidence cannot be deleted independently.

Whole-Run deletion:

1. explicit confirmation;
2. project/Run deletion locks;
3. verify no active ownership;
4. append project deletion intent;
5. atomically move Run to owned trash where possible;
6. append project deletion completion/tombstone;
7. delete trash through an in-process/startup cleanup operation with explicit result.

No invisible background daemon is assumed.

## 28. Export and import

Portable export includes manifest/version, Run Configuration, selected entity files, verified event/artifact manifests, included Artifacts, integrity/redaction/omission reports, and checksums.

Default excludes source contents, raw process output, secrets, cookies/storage, absolute local paths, and quarantined content.

Import requires checksum/schema/path/decompression validation, provenance, no executable auto-run, and read-only status until adoption.

## 29. Stable persistence errors

At minimum:

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

## 30. Required tests

- database/index deletion does not affect reconstruction;
- every schema has valid/invalid fixtures;
- ID prefix/ULID validators match `spec/09` and `schemas/domain-types.ts`;
- exact transition ordering survives crashes after every step;
- snapshot ahead/behind event stream recovers correctly;
- partial final line preserves earlier events;
- middle corruption is detected;
- process byte files and records resolve under canonical path;
- malformed evaluator bytes remain preserved in `raw-output.bin`;
- orphan Artifact is reconciled only with operation proof;
- hash mismatch blocks citations/recommendation;
- unknown major schema is read-only;
- path traversal, junction, and case collisions fail closed;
- standard exports exclude sensitive raw output/source;
- cited evidence blocks selective deletion;
- project streams and Run index rebuild/reconcile;
- cleanup/deletion operation records exact partial results.
