# 23 — Locking, Leases, Concurrency, and Multi-Session Ownership

**Status:** Canonical implementation contract  
**Scope:** Data-root/Project/Run/Operation/deletion locks, OS lock handles, metadata/heartbeats, lock order, stale-owner assessment, multi-Session behavior, clock changes, read-only access, recovery, and unsupported filesystems  
**Store:** `spec/11-artifact-event-and-schema-contracts.md`  
**Operations:** `spec/19-operation-ledger-idempotency-and-reconciliation.md`  
**Retention:** `spec/22-retention-trash-garbage-collection-and-storage-admission.md`

## 1. Purpose

Render Rivals may have multiple supervisor Sessions or CLI invocations using the same data root. A browser tab can also submit competing commands. `lock.json` plus a heartbeat timestamp and exclusive creation is not sufficient by itself:

- a crashed process leaves stale files;
- wall clock can jump;
- PID may be reused;
- another Session may still own the aggregate;
- network/synchronized filesystems may not provide required atomic/locking semantics;
- lock acquisition order can deadlock;
- deletion/restore/migration need stronger scope than ordinary Run mutation.

This specification defines one ownership and concurrency model for the Windows reference path and explicit degraded/unsupported behavior elsewhere.

## 2. Principle

A lock grants temporary mutation authority over a declared aggregate/resource. It is not proof that a prior side effect succeeded, not a substitute for expected revision, and not a security sandbox.

Mutation requires all applicable checks:

- authenticated/authorized caller;
- legal domain state;
- expected aggregate revision;
- correct lock scope/ownership;
- durable Operation intent;
- native/process/path/capability preconditions.

Readers may inspect without mutation locks when they tolerate atomic snapshot replacement and verify revisions/hashes.

## 3. Lock layers

### Data-root maintenance lock

Protects installation-wide schema migration, Project-index replacement, trash/maintenance structures, and operations that cannot coexist across the data root.

### Project lock

Protects:

- Project registration/config/trust summary mutation;
- Source Snapshot/index/template mutation;
- Run-index/tombstone mutation;
- whole-Project deletion/restore;
- Project-scoped Operation updates where aggregate state changes.

### Run mutation lock

Protects one Run’s canonical events/summaries/entities/artifact manifest/operations from concurrent mutation.

### Operation record lock

Protects one mutable Operation snapshot/reconciliation. It never replaces owning Project/Run lock for domain effects.

### Deletion/restore/purge lock

Operation-specific exclusion over trash/original paths and indexes. It is acquired under the owning data-root/Project/Run order.

### Session/native locks

Supervisor-owned in-memory/native synchronization protects IPC sequences, process/group tables, output files, and terminal lifecycle. Durable domain mutation still uses filesystem aggregate locks.

## 4. Canonical lock metadata

Lock metadata uses strict schema:

```text
render-rivals/lock
```

Minimum fields:

- lock format/schema version;
- lock scope/kind;
- canonical resource ID/path fingerprint;
- owning Session ID;
- coordinator native process identity, not PID alone;
- supervisor Session identity;
- owning Operation ID when applicable;
- acquisition nonce (nonsecret uniqueness, not authentication credential);
- acquired timestamp;
- last heartbeat timestamp;
- monotonic heartbeat counter;
- requested/held mode;
- implementation/platform lock mechanism;
- process/host diagnostic fingerprint without treating hostname as authority;
- lock revision;
- release/recovery state when persisted outside the live handle.

Raw dashboard/native authentication secrets are absent.

Metadata is diagnostic/coordination state. Live ownership requires the OS lock handle plus identity assessment; file contents alone never prove ownership.

## 5. OS lock handle plus metadata

Reference implementation uses a held operating-system file lock/handle and metadata together.

### Windows

- open/create a generated lock file under owned root;
- hold a file handle with sharing modes that prevent another writer/lock owner according to tested policy;
- use supported byte-range/file locking or exclusive-handle semantics selected by the implementation spike;
- record handle/process identity through supervisor where needed;
- release automatically when owning process/handle closes, while stale metadata remains recoverable.

### Unix

- use tested advisory file locking (`flock`/`fcntl` strategy chosen/pinned) on an owned local filesystem;
- all Render Rivals writers participate;
- lock release follows descriptor/process lifetime;
- metadata remains separate or atomically updated without replacing the inode carrying the live lock unexpectedly.

### Common

- exclusive-create metadata without an OS-held lock is not the strong reference path;
- replacing a locked file must not silently drop the active lock inode/handle relationship;
- implementation documents whether lock and metadata share one file or stable lock file + replaceable metadata sibling;
- doctor/fixtures verify actual cross-process exclusion.

## 6. Lock file locations

Conceptual locations:

```text
<data-root>/installation.lock
<data-root>/projects/<project-id>/project.lock
<data-root>/projects/<project-id>/runs/<run-id>/run.lock
.../operations/<operation-id>.lock
.../trash/.../deletion.lock
```

Exact names may use stable generated forms, but:

- all are under owned canonical/maintenance roots;
- Project strings never choose paths;
- lock files are not placed in source repository except the non-lock Project marker;
- Session transient locks live under Session root;
- stale compatibility names are not recognized silently.

The `lock.json` example in `spec/11` is interpreted as lock metadata; implementation may split stable `.lock` handle and `.lock.json` metadata to preserve OS-lock semantics.

## 7. Lock order

Global acquisition order:

```text
data-root
  -> project
    -> run
      -> operation
        -> artifact/entity-local temporary commit guard
```

Deletion/restore/purge:

```text
data-root -> project -> run (when present) -> deletion/restore/purge operation
```

Rules:

- never acquire an earlier/higher lock while holding a later/lower lock;
- multiple resources at same level sort by canonical ID byte order before acquisition;
- no blocking network/process/browser operation while holding broad data-root/Project lock;
- Run lock may be held across short canonical state/Event transactions, not whole builds/captures/evaluator calls;
- long work is represented by Operation/Run state and reacquires locks at commit boundaries;
- violation in debug/test is `LOCK_ORDER_VIOLATION` and production fails closed rather than risking deadlock;
- callbacks from Rust output/events do not synchronously acquire broad locks while native mutexes are held.

## 8. Acquisition

1. canonicalize/verify data root and target resource;
2. validate caller/Operation/legal intent;
3. acquire required higher-scope locks in order with bounded timeout;
4. acquire OS lock for target;
5. read/validate existing metadata and aggregate state;
6. verify no contradictory live owner/Session identity;
7. write/update metadata atomically while preserving live lock handle;
8. record acquisition observation/Event where domain recovery needs it;
9. perform only the bounded transaction/work registration;
10. release in reverse order.

Acquisition timeout produces `LOCK_ACQUISITION_TIMEOUT`; it does not break/remove the lock.

## 9. Default timing

MVP defaults:

- heartbeat interval: `5_000 ms` while a long-lived Run mutation ownership lease is intentionally held/renewed;
- stale-suspicion threshold: `30_000 ms` without heartbeat;
- ordinary interactive lock acquisition timeout: `5_000 ms`;
- cleanup/recovery acquisition may use a configured longer bounded timeout with UI progress/cancel.

These values are policy defaults recorded in capability/config diagnostics and may be amended before scaffold. They never override verified live OS lock/Session ownership.

Most canonical commit locks should be short-lived and need no heartbeat. Heartbeat is for a longer ownership lease/coordination record, not a reason to hold filesystem mutex across external work.

## 10. Heartbeats and clocks

- heartbeat counter increments monotonically under lock/owner authority;
- wall-clock `lastHeartbeatAt` aids diagnostics/other-process stale suspicion;
- owner also records monotonic elapsed/sequence in Session/native observations while alive;
- wall time alone never proves staleness due to sleep/clock changes;
- counter unchanged plus elapsed threshold only starts assessment;
- system suspend/resume may delay heartbeat without forfeiting live OS lock;
- heartbeat write failure is surfaced and may interrupt mutation scheduling, but does not let another writer steal an OS-held lock;
- counter/timestamp updates are bounded atomic metadata writes and do not rewrite canonical domain records.

## 11. Owner identity

PID is observational only.

Owner assessment uses, where available:

- live OS lock acquisition result;
- supervisor Session identity;
- coordinator expected native process identity/start token/handle relationship;
- containment membership;
- bootstrap liveness/session endpoint observations;
- process creation/start time or platform stable identity;
- current Session registry under data root;
- metadata Session/Operation/resource match.

Hostname/user name alone is not proof. Another user’s inaccessible lock is not broken; permissions/security failure is surfaced.

## 12. Stale lock assessment

A lock is not removed merely because heartbeat is old.

Assessment:

1. attempt non-destructive OS lock acquisition;
2. if acquisition fails, classify owner active/unknown and do not mutate/remove;
3. if acquisition succeeds, no live participating owner holds that OS lock;
4. inspect metadata schema/resource/Session/process identity;
5. query current supervisor Session registry/native observations where available;
6. inspect aggregate Operation/Run state and incomplete commits;
7. acquire dedicated recovery ownership;
8. archive/amend stale metadata for diagnosis;
9. perform recovery before ordinary mutation;
10. write fresh lock metadata only under new live handle.

Old heartbeat + live OS lock = active/suspended/unknown owner, not stale removal.

No OS lock + ambiguous external/native identity = `LOCK_IDENTITY_UNKNOWN`; safe mode/diagnostic path rather than optimistic deletion.

## 13. Multiple supervisor Sessions

MVP permits multiple Render Rivals Sessions on the same machine/data root for read-only access or distinct Projects/Runs, subject to locks/admission.

Rules:

- each has unique Session/endpoint/pairing origin;
- no global “only one app instance” requirement unless a broad migration/maintenance operation takes data-root lock;
- two Sessions cannot mutate same Run simultaneously;
- Project-index/config mutation serializes at Project lock;
- Runs in same Project may execute concurrently only if scheduler/resource/source/dependency policies later allow it; MVP sequential scheduler within one Session does not automatically prohibit a different Session, so Project policy must explicitly block cross-Session concurrent Project command execution where shared Project resources could conflict;
- MVP default: at most one active executing Run per Project across all Sessions;
- read-only dashboard can inspect a Run owned by another Session and displays owner/state, but mutation commands reject/attach only under explicit supported behavior;
- no second Session attaches to old supervisor IPC; it reads canonical state and performs recovery only after ownership loss proves safe.

## 14. Project execution lease

Because Candidate work may use shared Project-level package stores, source snapshot, ports, external fixtures, or singleton data, MVP acquires a Project execution lease before `preparing` begins and retains/renews it through Capture/Gating/Evaluation until no Project process/browser/evaluator resource remains.

This lease:

- does not hold the short filesystem Project lock continuously;
- is represented by metadata/OS coordination mechanism under Project root;
- blocks another active executing Run for that Project;
- permits read-only inspection and nonconflicting Export of already committed data;
- ends after cleanup/release observation;
- becomes stale only through full assessment;
- is separate from source repository’s own Git locks.

Later cross-Run concurrency requires an ADR/spec update describing shared dependencies/fixtures/ports/resource isolation.

## 15. Run mutation behavior

- only one coordinator Session owns active Run mutation/execution lease;
- canonical Event/snapshot/Artifact/Operation commits acquire short Run mutation lock;
- owner Session ID in `run.json`/lock is current coordination, not immutable Run identity;
- UI command from nonowner Session returns owner-active/legal read-only state rather than stealing;
- if owner Session intentionally transfers/relinquishes, it records interruption/checkpoint/release before new Session recovery;
- coordinator crash leaves Run `interrupted` and releases OS handles through process death, but recovery verifies native descendants/side effects before new owner proceeds.

## 16. Operation and destination locks

Operation lock serializes Operation record state/reconciliation. Command-specific destination protection still applies:

- patch/report files use exclusive create + destination manifest;
- Git branch uses Git ref transaction/preconditions;
- trash move uses deletion lock + atomic rename;
- Artifact canonical path uses generated ID + exclusive temp/final protocol;
- port/listener uses supervisor admission/ownership, not filesystem lock;
- process launch uses supervisor idempotency/group identity.

A filesystem lock cannot make an external Git/filesystem/network side effect transactional; spec19 proof/reconciliation remains required.

## 17. Lock metadata corruption

If metadata is malformed/hash/schema/resource mismatched:

- do not trust owner/path/Operation values;
- OS lock result still determines whether a participating live owner may exist;
- preserve corrupt metadata in quarantine/diagnostic when safe;
- block mutation until recovery establishes resource/aggregate state;
- use `LOCK_METADATA_CORRUPT`/integrity errors;
- never replace metadata while another owner holds lock;
- canonical Run/Event integrity remains independently verified.

## 18. Unsupported filesystems

Strong mutation support requires doctor probes for:

- reliable local file locking across processes;
- same-filesystem atomic replace/rename;
- flush/durability policy;
- path/case/symlink behavior;
- ownership/permissions.

Network shares, cloud-synced folders, FUSE/provider filesystems, removable media, or filesystems with unreliable advisory locks/atomicity may be:

- read-only;
- blocked for canonical data root;
- explicitly degraded only after a tested capability policy—never silently treated as reference durability.

Source repositories may live elsewhere under spec14, but canonical data root must pass storage/lock doctor.

## 19. Readers and snapshots

Read-only queries:

- do not take long exclusive locks;
- read atomic entity snapshots and verified complete Event/manifest lines;
- compare revision/lastApplied sequence and retry bounded if replacement races;
- never expose half temp file;
- may return derived projection marked stale/refreshing;
- cannot infer active ownership from metadata alone;
- Artifact byte serving holds an ordinary file read handle but not Run mutation authority.

Large reconstruction/integrity scans may take read/maintenance coordination so deletion/migration does not remove inputs mid-scan. Exact shared/read lock model is selected/tested at scaffold; fallback is short metadata snapshot + hash verification/retry rather than blocking active Run indefinitely.

## 20. Release and shutdown

Normal release:

- finalize/flush required canonical transaction;
- update/release execution lease metadata;
- release lower locks before higher;
- close OS handles;
- optionally archive/remove live metadata according to recovery policy;
- record cleanup/release observation when domain needs it.

Process crash automatically releases OS locks but not necessarily child processes/external effects/metadata; recovery follows specs 10/19/23.

Shutdown must not delete lock file/path through a Project-controlled symlink and must tolerate already-lost handle without claiming successful cleanup solely from metadata deletion.

## 21. Stable errors

Use:

- `LOCK_ACQUISITION_TIMEOUT`;
- `LOCK_OWNER_ACTIVE`;
- `LOCK_METADATA_CORRUPT`;
- `LOCK_IDENTITY_UNKNOWN`;
- `LOCK_ORDER_VIOLATION`;
- legacy/context-specific `RUN_LOCK_HELD` and `RUN_LOCK_IDENTITY_UNKNOWN` may map to the general lock model until schema migration consolidates them;
- storage/path/session/integrity errors as applicable.

Error response includes resource/scope and safe owner status, never native auth secret or unsafe raw path.

## 22. Required tests

- cross-process exclusion on Windows and maintained Unix hosts;
- lock inode/file replacement does not drop ownership;
- exclusive create alone fixture demonstrates why OS lock is required;
- acquisition timeout/no break;
- lock order graph and injected violations/deadlock stress;
- same-level sorted multi-lock acquisition;
- heartbeat counter/wall-clock jump/suspend/resume/write failure;
- PID reuse/owner process death/live Session/unknown identity;
- stale metadata with OS lock held versus released;
- metadata corruption/quarantine;
- two Sessions distinct Runs/Projects/read-only and same-Run mutation rejection;
- one active executing Run per Project across Sessions;
- coordinator crash/native descendants/recovery ownership;
- deletion/restore/migration locks versus readers/writers;
- Operation reconciliation/destination side effects;
- unsupported/network/cloud-sync filesystem doctor/block;
- read snapshot/revision retry during atomic replacement;
- shutdown/crash handle release without optimistic side-effect success.

## 23. Nonconforming behavior

- relying only on heartbeat timestamp, PID, hostname, or lock-file existence;
- deleting/breaking a lock because wall time threshold passed;
- exclusive-create metadata as sole reference lock;
- replacing/removing live lock inode/file and losing OS lock semantics;
- holding broad Project/Run filesystem lock across builds/captures/model calls;
- acquiring locks out of global order;
- permitting two active executing Runs for one Project in MVP across Sessions;
- stealing a Run from an active/unknown owner;
- treating file lock as proof external side effect completed;
- supporting canonical mutation on unverified unreliable filesystem;
- exposing half-written snapshots to readers;
- source repository lock/path used as Render Rivals canonical ownership.
