# 25 — Component Upgrades, Schema Migrations, Backups, and Rollback

**Status:** Canonical implementation contract  
**Scope:** Component compatibility, startup upgrade gates, schema readers/writers, migration planning, backup/staging/verification/atomic adoption, rollback, downgrade, crash recovery, browser/native/package upgrades, and release obligations  
**Schema policy:** `spec/11-artifact-event-and-schema-contracts.md`  
**Operations:** `spec/19-operation-ledger-idempotency-and-reconciliation.md`  
**Locks:** `spec/23-locking-leases-concurrency-and-multi-session-ownership.md`  
**Packaging:** `docs/PACKAGING-DISTRIBUTION-AND-UPDATES.md`

## 1. Purpose

Render Rivals persists evidence, Decisions, Promotions, Operation proofs, and historical Runs across releases. A package upgrade may change JavaScript, native protocol, browser revision, schemas, reducers, canonicalization policy, Capture format, or migration code. “Run migrations” is not a safe protocol by itself.

This specification ensures that:

- incompatible components do not mutate data;
- a migration never rewrites the only copy;
- large immutable Artifacts are preserved without unsafe in-place sharing;
- every migration is crash-recoverable and verifiable;
- rollback means selecting a compatible application plus verified prior data, not guessing that old code can read new writes;
- browser/native upgrades cannot silently change old evidence interpretation.

## 2. Component compatibility gate

Before opening the canonical data root for mutation, bootstrap/supervisor/coordinator verify a compatibility manifest covering:

- main package/version/build;
- bootstrap protocol range;
- native supervisor package/build/platform/architecture/libc where applicable;
- supervisor IPC major/minor capabilities;
- coordinator build;
- schema writer version and reader ranges;
- canonical JSON/hash policy version;
- reducer/event registry version;
- migration set version/hash;
- Playwright package and browser revision;
- dashboard static build/API version;
- optional evaluator adapter versions.

Rules:

- required component/protocol major mismatch stops before Project commands and canonical mutation;
- missing optional capability is reported and feature-gated;
- JavaScript and native package versions are not assumed compatible merely because npm resolved them together;
- browser mismatch blocks new Capture but must not prevent read-only history/diagnostics when data schemas are supported;
- exact compatibility decision is recorded locally without secrets.

## 3. Installation format record

`installation.json` includes or references:

- installation schema version;
- current canonical data-format generation;
- schema writer version;
- supported reader range last used;
- canonicalization/hash policy version;
- reducer/event registry version;
- migration history head;
- last successful application/native/browser versions;
- active/incomplete migration Operation ID when present;
- data-root filesystem capability fingerprint relevant to migration/atomicity/locks.

It is not updated to a new generation until migration adoption has completed and verified.

## 4. Startup modes

### Compatible read/write

Current writer can read/mutate all required canonical versions. Normal startup.

### Compatible read-only

Current reader can interpret data but writer cannot safely mutate one or more versions. Dashboard pairs into read-only/safe mode; no Project command, Run mutation, Promotion, deletion, migration-independent cleanup of affected data, or schema rewrite.

### Migration available

A versioned migration path exists. Startup presents plan, backup/storage requirements, affected Projects/Runs, estimated time/bytes, limitations, and rollback path. Migration never begins silently in MVP.

### Unsupported newer major

Open only installation-level diagnostics/read-only metadata that can be parsed safely; affected data remains untouched. User must use compatible/newer version.

### Corrupt/incomplete migration

Recovery mode inspects migration Operation, locks, staging, backups and canonical paths before any normal mutation.

## 5. Migration scope

Migration may be:

- installation metadata/index;
- one Project aggregate;
- one Run aggregate;
- a specific entity/event/artifact-manifest schema;
- cache/index rebuild only;
- package/browser compatibility metadata without canonical data rewrite.

MVP favors smallest independently verifiable aggregate, but a migration whose semantics span Project/Run/index must use the broader scope. Scope and dependency order are declared in the migration descriptor.

## 6. Migration descriptor

Every migration is code plus immutable descriptor containing:

- migration ID/version;
- source schema/data generation range;
- target exact generation;
- affected schemas/events/artifact classes/indexes;
- reversible or irreversible classification;
- whether Artifact payload bytes change;
- required disk-space model;
- required component/tool versions;
- preconditions and unsupported cases;
- transformation code/build hash;
- validation/integrity procedure;
- rollback procedure;
- known lossy fields/limitations;
- fixture and compatibility-test references.

Migration discovery is closed and versioned. Unknown migration script/plugin is never auto-executed from Project/imported data.

## 7. No in-place-only rewrite

A migration never modifies the only canonical copy of an entity, Event stream, manifest, or Artifact payload.

Allowed strategies:

### Staged aggregate copy

Create a new complete aggregate under owned migration staging, transform and verify it, then atomically adopt through rename/index transaction while retaining original backup.

### Immutable Artifact reuse

When payload bytes do not change, staged aggregate may reference/copy/reflink/hardlink immutable Artifact bytes only under a verified same-filesystem strategy:

- entity/event/manifest files are independent copies, never hardlinked for later replacement;
- payload immutability is enforced and verified;
- hardlink/reflink capability and link-count/deletion semantics are tested;
- source and staged digest/length match;
- no migration code writes through reused payload link;
- fallback is full copy when capability or safety unknown.

### New payload copy

If Artifact format/content changes, create a new Artifact ID/record/payload with migration provenance. Original remains in backup. A changed payload is never silently kept under old ID/hash.

A stream is never rewritten line-by-line in place as the sole copy.

## 8. Migration workspace layout

`spec/11`/`spec/22` data root is amended conceptually:

```text
<data-root>/migration/
  <operation-id>/
    migration-plan.json
    source-inventory.json
    staging/
    backup/
    verification/
    migration-result.json
```

Rules:

- same data-root/filesystem when atomic adoption requires rename;
- restrictive ownership/permissions;
- generated paths from Operation ID;
- no Project-controlled symlink/junction escape;
- source inventory and plan committed before transformation;
- backup/staging status reconstructable after crash;
- completed backups move to the retention policy location or remain under protected migration backup until user-confirmed expiry/purge.

## 9. Preflight and storage admission

Before acceptance:

- acquire data-root/Project/Run migration locks in spec23 order;
- verify no active executing Run/Promotion/Export/import/deletion for affected scope;
- verify component/migration descriptor integrity;
- verify source schemas, Event chains, manifests and required Artifact hashes enough to establish migration input;
- inventory bytes/files and hardlink/reflink/copy capability;
- calculate staging + backup + temporary + verification + reserve bytes under spec22;
- reject insufficient space rather than deleting existing backup/evidence silently;
- verify destination filesystem atomicity/durability;
- show irreversible/lossy/unsupported conditions and require explicit confirmation;
- create durable migration Operation before any effect.

## 10. Migration execution

For each affected aggregate:

1. record immutable source inventory/hashes and current index references;
2. create backup representation or retain original directory as eventual backup according to adoption strategy;
3. create staging aggregate from source through safe copy/reuse;
4. apply transformations only in staging;
5. emit new schema versions/migration provenance and Events where appropriate;
6. validate every entity/stream/Artifact/Operation/reference/invariant;
7. reconstruct Run/Project from staged files without database;
8. compare semantic migration expectations and counts/hashes;
9. create integrity and migration verification reports;
10. mark staging ready for adoption;
11. atomically adopt under locks;
12. update installation/Project indexes and data-generation head;
13. verify canonical adopted paths and read them through target reader/reducer;
14. retain original backup and complete migration Operation.

No Project/process/browser/evaluator command runs against staging or mixed generations.

## 11. Adoption transaction

Preferred same-filesystem aggregate swap:

1. canonical source aggregate is still exact preflight identity;
2. rename canonical source to protected backup path;
3. rename verified staging aggregate to canonical path;
4. update parent index/installation metadata through crash-safe Event/snapshot protocol;
5. reopen/verify canonical target;
6. mark migration completed.

Crash recovery examines canonical, staging, backup and Operation states:

- old canonical present, staging present → migration not adopted; verify/continue or abandon staging;
- backup present, canonical absent, staging present → complete target rename or restore backup based on exact plan/proof;
- backup and target present → verify target/index and complete or rollback;
- ambiguous/mismatched identities → read-only recovery, no guessed deletion.

Windows open-handle rename behavior is tested; all readers/handles for affected directories close before swap.

## 12. Event and provenance rules

- historical original Event stream is never falsified to imply new writer created old facts;
- migrations may create a new representation plus migration Events/provenance according to schema policy;
- raw original representation remains in backup;
- each transformed entity records migration source version/hash, migration ID/tool hash and target hash;
- event/reducer semantic changes require explicit versioned reducer and migration proof;
- a migration cannot recalculate Recommendation as if historical evaluator/policy ran again unless it creates a new superseding analytical record with explicit provenance;
- hash-bound Decisions/Recommendations/Promotions remain interpretable through migration mapping or become read-only/limited, never silently rebound to different evidence.

## 13. Backup retention

Migration backup:

- contains the pre-migration aggregate/data needed for rollback;
- inherits highest sensitivity of source;
- is protected from ordinary GC until rollback window expires and migration integrity/user policy permits purge;
- default rollback retention is at least 14 days for public alpha unless a release policy deliberately changes it;
- consumes disk and is shown separately;
- may use immutable payload hardlinks/reflinks only under verified semantics;
- is not a portable export and may depend on same installation/data-root;
- is not source-code backup beyond Render Rivals canonical data;
- is not encrypted unless data root/filesystem policy provides it; no encryption claim.

User may export a portable Run bundle separately, but that does not replace migration rollback backup.

## 14. Rollback

Rollback uses a new durable Operation and requires:

- compatible older/current application component set or target reader/writer that understands backup generation;
- intact verified backup;
- no post-migration mutations that would be lost unless user explicitly accepts and they are separately exported/backed up;
- target locks and storage reserve;
- explicit explanation of data created after migration;
- verified swap/adoption back to prior aggregate;
- installation/index generation restored;
- integrity/reconstruction under rollback version.

If post-migration Runs/Decisions/Promotions exist, automatic rollback is blocked by default. Options:

- retain current version;
- export new data then manually choose a supported recovery plan;
- install a fixed forward version;
- advanced migration path that preserves both generations, only when explicitly implemented.

Rollback is not “install older npm package and hope.”

## 15. Downgrade behavior

An older application encountering newer generation:

- must not auto-migrate backward;
- opens read-only only if declared compatible;
- otherwise stops with component/schema incompatibility and points to compatible version or backup rollback;
- never rewrites unknown fields/events/schema as older version;
- never deletes unsupported Artifacts or indexes as “cache” without knowing reachability;
- browser/native package version downgrade follows compatibility manifest.

## 16. Browser and Capture upgrades

Changing Playwright or Chromium does not rewrite historical Capture bytes.

- historical Capture metadata retains exact Playwright/browser/policy;
- UI/evaluator reads old evidence through supported schemas but does not claim visual pixel comparability across browser revisions beyond recorded Run;
- re-evaluation creates a superseding Run/new Epoch under current browser;
- cached browser package may be cleaned only after retained Runs remain interpretable and rematerialization policy permits;
- upgrading browser requires Clock, ARIA, screenshot, service-worker/WebSocket, crash and containment fixture matrix;
- unsupported old diagnostic trace viewer remains download-only rather than forcing old active runtime into dashboard.

## 17. Native and package upgrade

- main package declares exact compatible native optional package/protocol range;
- bootstrap verifies native metadata/integrity before execution;
- partial npm install with mismatched native package fails before data mutation;
- coordinator/native protocol negotiation happens before opening Project commands;
- self-update is absent; user package-manager install changes version;
- upgrade does not delete old migration backup automatically;
- package scripts do not run canonical migration implicitly during install;
- first launch of new version performs compatibility/read-only/migration decision.

## 18. Failed migration

On any failure:

- stop transformation/adoption;
- preserve original canonical data and backup;
- quarantine/retain staging according to diagnostics and disk safety;
- record exact phase, code, source/staging hashes, remaining paths and cleanup status;
- installation generation remains old unless verified adoption completed;
- no partially migrated aggregate becomes ordinary read/write;
- next startup enters migration recovery when an Operation remains nonterminal;
- retry with identical migration may reuse verified staged work only through spec19 proof and explicit migration contract; otherwise new Operation/staging.

## 19. Migration of pre-scaffold/development fixtures

Because no public persisted writer exists yet:

- writer v1 emits only current canonical vocabulary, including Run state `promoting`;
- old planning fixtures using `exporting` may be migrated explicitly for development tests;
- abbreviated digests/floating cost/noncanonical timestamps are not accepted silently;
- migration fixtures preserve original bytes and show limitations;
- no promise is made to migrate arbitrary archived Markdown examples into production data.

## 20. Security

Migration code processes hostile/corrupt local/imported data:

- strict parsers and size/depth/count/path/decompression limits;
- no code execution, custom YAML tags, dynamic module paths or Project-supplied migration;
- no network access unless descriptor explicitly requires a trusted package resource and policy permits it—MVP migrations should be offline;
- secrets/auth state remain excluded;
- backup/staging permissions equal source;
- active-content Artifacts are copied as bytes, never rendered;
- source-controlled symlinks/junctions never guide backup/delete paths;
- migration diagnostics redact paths/content according to policy;
- migration package/tool integrity comes from installed signed/checksummed release provenance where available.

## 21. UI and CLI

Before migration:

- current/target version and support state;
- affected Projects/Runs/schemas;
- estimated active/staging/backup/reserve bytes;
- lossy/irreversible/unsupported items;
- backup retention/rollback limits;
- no-run/no-source mutation statement;
- confirm/start/cancel.

During migration:

- Operation phase and aggregate progress;
- verified bytes/items, not optimistic generic percentage;
- cancel availability only where safe before adoption boundary;
- logs/diagnostics.

After:

- verification summary;
- backup location/expiry/size;
- rollback eligibility;
- failed/limited Runs;
- next action.

CLI noninteractive migration requires explicit source/target/confirmation flags and fails when user acknowledgement is required. It never auto-confirms lossy migration.

## 22. Stable errors

Existing codes apply:

- `BOOT_COMPONENT_INCOMPATIBLE`;
- `SESSION_PROTOCOL_INCOMPATIBLE`;
- `SCHEMA_MAJOR_UNSUPPORTED`;
- `MIGRATION_FAILED`;
- `STORAGE_OUT_OF_SPACE`;
- `ATOMIC_RENAME_FAILED`;
- `ENTITY_SCHEMA_INVALID`;
- `EVENT_HASH_MISMATCH`;
- `ARTIFACT_HASH_MISMATCH`;
- lock/path/Operation/integrity errors.

Implementation may add migration-phase-specific stable codes before schema freeze, but it must not hide backup, validation, adoption and rollback failures behind one user message.

## 23. Required tests

- compatibility manifest exact/optional/mismatched JS/native/protocol/schema/browser combinations;
- no canonical mutation before compatibility gate;
- read/write, read-only, migration-available, unsupported-newer and incomplete-migration startup modes;
- migration descriptor integrity and unsupported/lossy acknowledgement;
- storage admission including backup/staging/reserve;
- local filesystem, hardlink/reflink/copy immutable payload strategies and no in-place linked writes;
- strict hostile/corrupt data parser/path/size tests;
- crash after every plan/inventory/copy/transform/verify/rename/index/reopen/complete step;
- source identity changes during migration;
- Event/Recommendation/Decision/Promotion semantic preservation;
- exact reconstruction of staged/adopted aggregate without index;
- Windows open-handle rename and recovery;
- backup protection, 14-day default and explicit purge;
- rollback with no new data, with new post-migration data, missing/corrupt backup and incompatible package;
- older-version read-only/refusal and no backward rewrite;
- Playwright/browser upgrade Capture fixture matrix and no historical rewrite;
- partial package/native mismatch before data access;
- failed migration leaves old generation and recoverable staging;
- development fixture migration from `exporting` to `promoting`, raw digest/floating cost limitations;
- secrets/active content/network absence in migration.

## 24. Nonconforming behavior

- automatic canonical migration during package install or silent first launch;
- mutating data before component compatibility check;
- rewriting the only copy or in-place Event stream;
- deleting original before verified target and rollback backup;
- reusing Artifact ID after payload transformation;
- marking installation generation new before aggregate/index verification;
- blind restart/retry after ambiguous adoption;
- old app rewriting unknown newer schema;
- treating portable Export as equivalent to rollback backup;
- automatic rollback that discards post-migration data;
- package downgrade without compatible backup/data generation;
- rewriting historical Capture for new browser;
- Project-supplied migration code or network-dependent hidden migration;
- claiming encrypted/secure backup without implementation.
