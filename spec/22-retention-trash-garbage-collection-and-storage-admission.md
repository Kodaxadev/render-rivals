# 22 — Retention, Trash, Garbage Collection, and Storage Admission

**Status:** Canonical implementation contract  
**Scope:** Retention reachability, two-phase deletion, trash manifests, restore/purge, storage quotas, admission, low-disk behavior, cleanup scheduling without a daemon, crash safety, and deletion limitations  
**Store:** `spec/11-artifact-event-and-schema-contracts.md`  
**Operations:** `spec/19-operation-ledger-idempotency-and-reconciliation.md`  
**Security:** `spec/07-storage-security-and-configuration.md`

## 1. Purpose

Render Rivals stores large screenshots, traces, logs, workspaces, browser/package caches, and immutable evidence. `spec/11` requires reference-aware retention and moves deleted Runs to an owned trash area, but it does not define the trash layout, grace period, restore/purge semantics, scheduling, admission calculations, or what “asynchronous deletion” means when the product explicitly has no background daemon/service.

This specification makes cleanup predictable and crash-safe without silently deleting cited evidence or source code.

## 2. No hidden background daemon

MVP has no operating-system background service, scheduled task, or updater/cleanup daemon.

Retention/garbage collection work runs only:

- through an explicit authenticated CLI/UI `cleanup.execute` Operation;
- during startup maintenance after supervisor/coordinator authentication and before conflicting mutation, within a bounded budget;
- during Session-idle maintenance when no Run/Promotion/Export/import/migration writes conflict and policy allows it;
- during controlled shutdown only for small temporary cleanup that does not delay bounded termination materially.

If the app is not running, trash/caches remain on disk. UI/settings must not imply cleanup will occur at a wall-clock time while Render Rivals is closed.

“Scheduled cleanup” in planning documents means eligible-on-next-active-Session maintenance, not a daemon.

## 3. Storage classes

### Canonical data

- Project/Run entities/events/operations;
- registered Artifact payloads/manifests;
- Decisions/Recommendations/Promotions/Exports;
- integrity/recovery/cleanup records;
- required side-effect proof.

Deleted only through canonical deletion protocol and reference policy.

### Disposable cache

- Git worktrees after retention permits cleanup;
- dependency/package caches owned by Render Rivals policy;
- browser downloads where redownloadable and release policy permits;
- thumbnails/contact sheets/derived indexes;
- temporary image/parse files.

Cache is never the only copy of evidence or source snapshot representation needed for rematerialization.

### Temporary operations

- `tmp/<operation-id>/`;
- partial downloads/writes/extractions;
- Session transient files.

Inspected during recovery before deletion.

### Trash

Canonical entities/directories logically deleted but retained for grace/restore/purge.

### Quarantine

Unsafe/corrupt/orphan/ambiguous content. Quarantine is not trash and is never automatically restored merely because a grace period has not expired.

## 4. Data-root amendments

`spec/11` layout is amended:

```text
<data-root>/
  trash/
    runs/
      <deletion-operation-id>/
        trash-manifest.json
        run/
          ...original run directory contents...
    projects/
      <deletion-operation-id>/
        trash-manifest.json
        project/
          ...project canonical directory contents...
  maintenance/
    gc-state.json
    cache-index.json
```

Empty directories need not exist.

Trash remains on the same filesystem/data root so canonical move can use atomic rename where supported.

## 5. Trash manifest

Required schema:

```text
render-rivals/trash-manifest
```

Minimum facts:

- deletion Operation ID;
- scope/kind (Run/Project);
- Project/Run IDs;
- original canonical relative path;
- trash relative path;
- request/Decision/confirmation provenance;
- deletion-request/completion Project Events;
- source directory manifest/hash or bounded inventory sufficient for verification;
- retained external references/exports;
- moved timestamp;
- eligible purge timestamp;
- retention policy snapshot/hash;
- sensitivity/high-level size/counts;
- restore/purge state;
- failure/limitation.

The manifest lives outside the moved Run content and is committed before/with the move transaction according to recovery-safe ordering.

## 6. Reference reachability

Selective cleanup computes a graph rooted in retained records:

- Project registration/index/tombstones;
- nondeleted Run summaries/config/events/operations;
- retained Recommendation/Decision/Promotion/Export;
- Integrity/Recovery/Cleanup and side-effect proof;
- user-protected Runs/Artifacts;
- configured retention requirements.

Edges include:

- entity ID references;
- Artifact owner/reference/citation/input/output/proof IDs;
- Event payload references required for reconstruction;
- manifest/packet/checkpoint hashes;
- Promotion/Export destinations/proof;
- migration/import provenance;
- derived Artifact source links where source must remain.

Rules:

- cited/required Artifact is not independently deletable;
- mutable/rebuildable index is not a root;
- a stale/superseded record may still retain history/evidence;
- reference graph version/policy is recorded;
- unknown reference type/version fails closed for deletion;
- dry-run report lists protected/eligible/unknown bytes and reasons.

## 7. Whole-Run deletion

Preconditions:

- explicit confirmation identifies Run/display/project and estimated bytes;
- no active/nonterminal Operation or live verified process/browser/workspace requiring the Run;
- Project/Run deletion locks acquired under spec23;
- Run integrity/readability assessed enough to move safely;
- source repository is explicitly outside deletion target;
- Export destinations outside data root are not deleted;
- trash/data root is same supported filesystem with sufficient metadata space.

Protocol:

1. create durable deletion Operation and Project `run.deletion_requested` Event/index tombstone intent;
2. prepare/commit trash manifest in temporary trash operation area;
3. atomically rename complete Run directory to `trash/runs/<operation-id>/run` on same filesystem;
4. finalize trash manifest path/hash/state;
5. append/update Project Run index deletion-completed/tombstone record;
6. complete Operation only after original path absent, trash path present, manifest verifies;
7. do not recursively purge bytes in the same logical deletion transaction.

If crash occurs between move and index update, recovery uses Operation/manifest/original/trash presence to reconcile. It never creates an empty replacement Run at original path silently.

## 8. Whole-Project deletion

Options remain distinct:

- unregister Project only;
- delete Render Rivals canonical Project data to trash;
- never delete source repository through this workflow.

Project-data deletion requires all Run/session/operation locks and tombstones at installation index level. Project marker inside source repository is handled only by an explicit separate marker-removal choice and path verification; removing canonical data does not automatically modify source.

Project trash preserves enough installation-level index/tombstone to explain the deletion after canonical Project directory moves.

## 9. Grace period and purge eligibility

MVP default trash grace period:

```text
7 days
```

- configurable user-global policy before deletion;
- stored in deletion policy snapshot/manifest;
- purge eligibility uses canonical UTC timestamp but does not run while app closed;
- changing global policy does not retroactively shorten existing manifest unless user explicitly confirms;
- “Purge now” requires separate confirmation/Operation;
- low-disk emergency never purges noneligible trash silently;
- user-protected trash item is ineligible until protection removed;
- corrupted/unknown manifest is not purged automatically.

Exact default may be amended before scaffold through decision register, but implementation may not invent immediate permanent deletion.

## 10. Restore

Before purge, a trashed Run may be restored when:

- Project still exists or is restored first;
- original canonical path is absent;
- Run/Project ID does not conflict with another canonical entity;
- trash manifest and moved bytes verify sufficiently;
- supported schema/migration policy allows read/write;
- explicit restore Operation/locks succeed.

Protocol:

1. create restore Operation;
2. verify trash/current index state;
3. atomically rename directory back to original canonical path;
4. update Project index/tombstone through Events;
5. run integrity/recovery assessment before mutation/resume;
6. mark trash manifest restored/retain audit copy outside restored path;
7. never auto-resume Project commands or nonterminal work merely due to restore.

If original Project source has moved/changed, historical Run may restore read-only until relink/provenance checks.

## 11. Permanent purge

Purge is irreversible at application level.

Preconditions:

- eligible timestamp or explicit purge-now confirmation;
- manifest/ownership/path under trash root;
- no restore/purge Operation active;
- no canonical reference unexpectedly points into trash item;
- no open verified process/handle dependence where observable;
- dry-run/size summary available.

Protocol:

- create purge Operation;
- mark manifest purge requested;
- recursively delete without following symlinks/junctions/reparse points outside item;
- use safe directory-descriptor/handle-relative traversal where platform implementation permits;
- retry bounded transient sharing violations;
- record remaining paths/errors;
- complete only when item directory absent and trash index/manifest tombstone updated;
- partial purge is failure/cleanup incident, not success;
- secure physical erasure is not claimed.

After bytes are gone, a compact installation/Project deletion tombstone may remain for audit unless policy permits removing it.

## 12. Selective diagnostic/derived cleanup

Eligible examples:

- thumbnails/contact sheets;
- expired Playwright traces not referenced/protected;
- process logs after retention when no retained diagnostic/reconstruction reference;
- failed temporary files after recovery inspection;
- derived indexes/caches;
- old unneeded workspaces/dependencies after process/Promotion policy.

For canonical Artifact payload cleanup:

- append manifest deletion amendment first/according to exact crash-safe protocol;
- verify no retained references;
- delete payload;
- record result/remaining bytes;
- never leave Artifact appearing valid/present after confirmed deletion;
- recovery handles amendment-before-delete or delete-before-final-observation crash without inventing content.

Rebuildable derived files may use simpler cache index but still require root/path safety.

## 13. Workspace retention

Workspace states:

- transient cleanup eligible after Candidate/run policy;
- retained for inspection until configured expiry;
- preserved through Promotion (`workspace_preserve`), which becomes explicitly protected/owned output;
- cleanup failed/quarantined.

Rules:

- no Workspace deletion while a verified process has CWD/open dependency/listener relation;
- source repository is never considered a Workspace;
- preserved Workspace is not cache and is excluded from automatic GC until user revokes preservation;
- deleting canonical Run does not automatically delete an external preserved Workspace without explicit action/policy and ownership proof;
- cleanup failure remains health warning/storage accounting.

## 14. Storage admission

Before accepting operations that may materially increase disk use, admission estimates:

- current free bytes;
- configured reserve bytes;
- data/cache/trash/quarantine sizes;
- projected Workspace/dependency/build/output/Capture/evaluator/export temporary and final bytes;
- rollback/atomic-write duplicate space;
- browser/package downloads;
- concurrent accepted Operations;
- uncertainty margin from historical/fixture estimates.

Outcomes:

- admitted;
- admitted with warning;
- requires explicit override;
- rejected `STORAGE_OUT_OF_SPACE`/`CONFIG_STORAGE_ADMISSION`.

Rules:

- estimate is not guarantee; active monitor remains;
- reserve is evaluated in bytes;
- atomic operation includes enough space for temporary + final + metadata where applicable;
- trash bytes still consume disk;
- cleanup preview cannot count bytes until actually deleted;
- external source/export volumes are evaluated separately;
- override/policy snapshot is durable.

## 15. Low-disk response

Thresholds:

- advisory low disk;
- stop admitting new disk-heavy work;
- hard emergency threshold.

On hard threshold:

1. stop admitting new work;
2. preserve output draining/critical canonical Event/entity commits as long as possible;
3. cancel/terminate disk-heavy owned work according to safe policy;
4. close Capture/evaluator contexts;
5. commit explicit failure/incomplete status if storage permits;
6. never purge protected/canonical/not-yet-eligible trash silently;
7. suggest explicit cleanup choices with estimated reclaimable bytes;
8. surface cleanup incident when durable status cannot be fully written.

Reserve policy allocates space for terminal/failure/integrity metadata. No guarantee can overcome complete volume exhaustion; tests simulate it.

## 16. Cache policy

- cache root distinct from canonical data root when configured, with each filesystem recorded;
- cache entries have ownership, kind, key/hash, byte estimate, last-use, rebuild source, protection/in-use status;
- LRU/age policy may choose among truly rebuildable, inactive entries;
- Project/package manager global/shared caches outside Render Rivals ownership are never deleted automatically;
- dependency store sharing uses package-manager-safe mechanisms and does not remove other Projects’ live entries blindly;
- browser/package artifacts required for offline/reproducible support may be protected by release policy;
- deleting cache cannot make canonical Run uninterpretable, though it may prevent rematerialization until dependency/browser is restored.

## 17. Maintenance scheduling

At Session startup:

- inspect interrupted tmp/trash/purge Operations first;
- perform only bounded metadata reconciliation automatically;
- no large purge before dashboard readiness unless storage emergency prevents safe startup;
- report pending trash/cleanup.

During idle Session:

- maintenance scheduler uses low priority/admission;
- no work while Run/Promotion/Export/import/migration or lock conflict;
- bounded bytes/time per slice;
- interrupt/cancel safe;
- Session shutdown may stop and leave Operation resumable.

User-triggered cleanup:

- has explicit dry run/selection/confirmation;
- shows effect on history/exports/workspaces;
- uses Operation status/progress derived from bytes/items but completion proof remains filesystem/manifest observation.

## 18. Size accounting

Storage reports distinguish:

- canonical active;
- protected;
- trash grace;
- trash purge eligible;
- quarantine;
- temporary/recovery pending;
- derived cache;
- Workspaces/dependencies/browser packages;
- external preserved outputs not under data root.

Counts use integer bytes. Directory size is an observation with scan timestamp/completeness/permission/error; it is not assumed exact during concurrent writes.

Hard links/reflinks/sparse/compressed files may make logical and allocated bytes differ. Report metric type/platform capability explicitly and avoid double-counting claims when unknown.

## 19. Security and privacy

- deletion path is generated from canonical IDs/Operation, never arbitrary Project path;
- do not follow symlink/junction/mount escape;
- source/exports outside owned roots are not deleted;
- trash remains same sensitivity/access control as source data;
- purge logs omit sensitive filenames/content where policy requires;
- secure wipe is not guaranteed on SSD/COW/journaled/cloud-backed filesystems;
- deleting local Render Rivals data does not delete copies already exported, backed up, synced, or sent to external evaluator;
- UI explains those boundaries.

## 20. Errors

Use stable classes including:

- storage/path/lock errors;
- `CLEANUP_WORKSPACE_FAILED`;
- `CLEANUP_OWNERSHIP_UNKNOWN`;
- operation/integrity errors;
- a later dedicated trash/purge code amendment if implementation requires distinctions not covered by current registry.

Do not collapse partial purge, protected reference, lock conflict, path violation, and unknown ownership into “cleanup failed” only.

## 21. Required tests

- reference graph retains every cited/required Artifact/proof and fails closed on unknown reference;
- dry-run byte/category/protection reasons;
- whole Run atomic move and crash at every manifest/index/move step;
- Project unregister versus canonical-data trash versus source marker separation;
- seven-day default/nonretroactive policy/protection/purge-now confirmation;
- restore path/ID/source/schema/integrity cases;
- purge symlink/junction/reparse/open-handle/partial failure and no secure-wipe claim;
- selective Artifact amendment/delete crash order;
- preserved Workspace exclusion and cleanup failure;
- storage admission temporary+final+reserve/trash/uncertainty/concurrency;
- disk-full at every canonical commit step;
- app-closed scheduled cleanup does not occur/claim it did;
- startup bounded reconciliation and idle maintenance cancellation;
- cache ownership/shared-store safety;
- logical versus allocated size reporting;
- no source/external export deletion;
- Session interruption resumes/reconciles cleanup Operation through spec19.

## 22. Nonconforming behavior

- hidden OS daemon/scheduled task for cleanup in MVP;
- claiming cleanup occurs while app is closed;
- deleting cited/protected/unknown-reference evidence;
- immediate permanent Run deletion without trash/explicit policy;
- silent low-disk purge of noneligible trash/canonical data;
- following Project-controlled symlinks/junctions during deletion;
- deleting source repository or external exports through Project cleanup;
- marking purge complete with remaining bytes;
- treating trash bytes as reclaimed before deletion;
- deleting preserved Workspace/cache-only copy needed for evidence/rematerialization;
- using floating/ambiguous size units;
- claiming secure physical erasure.
