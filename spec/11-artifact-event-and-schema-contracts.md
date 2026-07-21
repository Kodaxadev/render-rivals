# 11 — Artifact, Event, and Schema Contracts

**Status:** Canonical implementation contract  
**Scope:** Canonical filesystem layout, schema registry, event and artifact streams, atomic writes, locking, reconstruction, migrations, retention, import, and export  
**Shared types:** `schemas/domain-types.ts`

## 1. Purpose

Render Rivals uses files and append-only streams as the source of truth. A database, index, or UI cache may improve performance, but a complete Run remains reconstructable without them.

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
- data root is owned and writable;
- every path is canonicalized and containment checked;
- project strings cannot escape approved roots;
- portable exports are separate from live storage.

## 3. Repository-local metadata

Required marker:

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
  exports/
    <export-operation-id>/
      export.json
      files/
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
      exports/
        <export-operation-id>/
          export.json
          files/
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
          exports/
            <export-operation-id>/
              export.json
              files/
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
```

An Export Operation is stored under the narrowest owner scope: installation, Project, or Run. Promotion is always Run-scoped and remains under `promotions/`.

Empty directories need not exist in advance. `lock.json` and `tmp/` are operational and excluded from portable evidence bundles unless needed for diagnostics.

## 5. Canonical versus derived

Canonical:

- entity JSON;
- Project/Run event streams;
- Artifact manifest and payloads;
- process lifecycle/raw output;
- evaluator input/raw/validation/accepted Evidence;
- Recommendations, Decisions, Promotions, Export Operations;
- cleanup, integrity, and recovery observations.

Derived:

- SQLite/search indexes;
- recent lists/dashboard projections;
- thumbnails/contact sheets;
- aggregate charts/metrics;
- UI preferences not needed to interpret evidence.

Derived data never contains the only copy of a domain fact.

## 6. Encoding and hashes

Canonical JSON:

- UTF-8 without BOM;
- LF and final newline;
- RFC 8259;
- RFC 3339 UTC timestamps;
- no duplicate keys, NaN, or infinity;
- deterministic canonicalization for hashes;
- no comments/trailing commas.

Input configuration may be JSONC; resolved entities are JSON.

SHA-256 is lowercase hexadecimal. Records identify whether hashes cover raw bytes, canonical JSON, or normalized manifests.

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

Immutable entities use revision `1`; mutable summaries increment exactly once per replacement. Writers reject unknown top-level fields. Runtime validators enforce ID prefixes and ULIDs.

## 8. Schema registry

Initial schemas include:

- installation, user/project configuration;
- Project and Project event/head;
- Source Snapshot;
- Run and Run Configuration;
- Candidate, Attempt, Workspace, Process;
- Capture Plan, Epoch, Capture;
- Gate Definition/Result;
- Evaluation Factor, Comparison, Evaluation, validation;
- Evidence, Recommendation, Decision;
- Promotion and Export Operation;
- Artifact creation/amendment;
- Run event/head;
- Cleanup, Integrity, Recovery;
- CLI/API envelopes used by fixtures.

Implementation locations:

```text
schemas/zod/
schemas/json-schema/
schemas/fixtures/valid/
schemas/fixtures/invalid/
schemas/migrations/
```

Every schema has version, type, Zod validator, generated JSON Schema, fixtures, migration list, and compatibility tests.

## 9. Run summary and configuration

`run.json` is latest atomic projection, not history. It records Project/Configuration, state, Candidates, active Epoch, latest Recommendation/Decision, checkpoint, event sequence, recovery, and terminal/failure details.

It is valid only when referenced transition exists and snapshot revision/hash matches deterministic replay.

`run-config.json` stores fully resolved frozen values/provenance, with secrets represented only by references and transmission policy.

## 10. Semantic event streams

Run event:

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

Sequence is a safe integer; writer fails before overflow. Hash chain covers canonical event excluding `eventHash`.

Project streams follow equivalent complete-line, sequence, hash, and recovery rules. Large bytes are Artifacts. Event paths are relative. Error payloads use stable codes.

Event heads store latest sequence/ID/hash, complete-line offset, length, and update time; they are rebuildable.

## 11. Exact transition ordering

1. validate command/state/revision;
2. allocate operation/event IDs;
3. append/fsync intent when operation can outlive request;
4. perform side effect and collect observations;
5. append/fsync completion/failure transition;
6. serialize summary with `lastAppliedEventSequence` set to transition;
7. temp write, flush/fsync, atomic replace, directory fsync;
8. optionally append `snapshot.committed` observation with revision/hash;
9. return result.

Recovery:

- event ahead/snapshot old → replay and rewrite;
- intent without completion → inspect facts and classify;
- snapshot claims nonexistent event → quarantine snapshot and replay prior state;
- snapshot is never the sole proof of its state.

## 12. Artifact manifest and classes

`artifacts/manifest.ndjson` is append-only. Records include Artifact/Run/owner, class, path, media, length/hash, validity/sensitivity, retention, operation/creation event, redaction, Epoch/Candidate, and amendments.

Classes include source; process output/lifecycle/usage; capture screenshot/DOM/accessibility/geometry/styles/console/network/interaction/metadata; gate observations; evaluation input/raw/validation/normalized; Evidence; Recommendation/Decision; Promotion outputs; Export Operation outputs; cleanup/diagnostic/integrity/recovery.

New classes require schema registry updates.

## 13. Artifact write protocol

1. allocate Artifact/operation and safe path;
2. exclusively create in same-filesystem `tmp/<operation-id>/`;
3. stream while hashing/counting;
4. flush/fsync/close;
5. verify bytes/media;
6. create destination;
7. atomic rename and directory fsync;
8. append/fsync Artifact record with operation;
9. append semantic event;
10. update owner summary through transition protocol.

Pre-rename bytes are noncanonical. Rename without manifest creates orphan reconciled only with exact operation proof; otherwise quarantine.

## 14. Process and evaluator bytes

Process directory contains canonical `process.json`, `lifecycle.json`, `usage.json`, and raw `stdout.bin`/`stderr.bin`, all registered/owned appropriately.

Evaluator `raw-output.bin` stores exact post-transport bytes and may be invalid JSON/text/truncated. `validation.json` records parsing, schema, citations, provenance, normalization, and rejection.

Accepted Evidence cites only immutable input-manifest Artifacts.

## 15. Promotion persistence

A Promotion record:

- is Run-scoped under `promotions/`;
- always references authorizing Decision and selected Candidate;
- records patch/branch/workspace kind;
- records destination preconditions, output Artifacts, verification, status, failure, and timestamps;
- never represents ordinary reports, diagnostics, or bundles.

## 16. Export Operation persistence

An Export Operation record:

- is stored under installation, Project, or Run scope;
- may have no Candidate or Decision;
- records source entity IDs, kind, redaction policy, omission report, output Artifacts, destination, verification, status, failure, and timestamps;
- creates files only inside its generated operation directory or explicit user-selected destination after path/precondition validation;
- never implies contender adoption.

Run-bundle/report/evidence/screenshot/configuration/log/diagnostic output uses Export Operation.

## 17. Locks, temporary files, and quarantine

Only one coordinator mutates a Run. `lock.json` records Run, Session, identities, heartbeat, and format; file alone never proves ownership.

`tmp/` is inspected before cleanup. `quarantine/` stores malformed/torn/hash-mismatched/orphan/unsafe/failed-migration content. Quarantined bytes are never normal evidence.

## 18. Path safety

Relative paths use `/`, no empty/`.`/`..`, no absolute/drive/UNC prefix, stay under owning root after canonicalization, reject disallowed symlink/junction/mount/case collisions, use generated IDs, and sanitize display names separately.

Violation is security failure.

## 19. Integrity and reconstruction

Integrity records stream/schema/manifest status, Artifact issues, checkpoint, cleanup, verifier/time.

Recovery records verified state, interrupted operations, invalid Epochs, process facts, and permitted disposition.

Reconstruction verifies stream/hash/schema, replays events, reconciles snapshot/entities/Artifacts/attempts/native facts, and produces Integrity/Recovery reports. Verified events take precedence.

## 20. Torn lines

Only complete newline-terminated lines are accepted. Partial final bytes are quarantined and truncated under recovery lock. Partial middle line is corruption. Sequence reuse occurs only when no complete event exists.

## 21. Versioning and migration

Patch = compatible clarification; minor = additive compatible change; major = incompatible meaning/shape. Unknown major is read-only.

Migrations copy/validate/atomically adopt, record hashes/events, preserve original on failure, never rehabilitate invalid evidence/Epochs, and never infer unknown accounting.

## 22. Redaction and sensitivity

Redaction precedes structured logs, external transmission, diagnostics, and standard export using declared values/keys, auth/cookie filtering, token patterns, user regex, and home-path normalization.

Sensitivity: public, project, sensitive_local. Secret material is prohibited as canonical Artifact. Declassification requires explicit review.

## 23. Retention and deletion

Retention includes Run lifetime, decision/protected evidence, diagnostic-temporary, exported, explicit protection. Cited evidence cannot be deleted independently.

Whole-Run deletion requires confirmation, locks, no active ownership, Project deletion intent, atomic move to owned trash where possible, completion/tombstone, then explicit in-process/startup cleanup result. No hidden daemon is assumed.

Export Operation records remain according to their owner/retention policy even if an external destination is later deleted.

## 24. Portable export and import

Portable output is produced by Export Operation and includes manifest/version, selected canonical entities, verified event/Artifact manifests, included payloads, integrity/redaction/omission reports, and checksums.

Default excludes source contents, raw process output, secrets, cookies/storage, absolute paths, and quarantine.

Import validates checksums, schemas, paths, decompression limits, provenance, no auto-execution, and read-only status until adoption.

## 25. Stable persistence errors

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

## 26. Required tests

- reconstruction survives index deletion;
- every schema has valid/invalid fixtures;
- ID validators agree;
- crash after every transition step recovers deterministically;
- snapshot/event disagreement recovers correctly;
- torn tail and middle corruption handled distinctly;
- process bytes/records resolve under canonical path;
- malformed evaluator bytes preserved;
- orphan reconciles only with proof;
- hash mismatch blocks citations;
- unknown major read-only;
- traversal/junction/case collision fail closed;
- standard exports exclude sensitive bytes;
- cited evidence blocks deletion;
- Project streams/index reconcile;
- Promotion requires Candidate/Decision;
- report/diagnostic uses Export Operation with nullable Run/Candidate semantics;
- cleanup/deletion/export partial results are explicit.
