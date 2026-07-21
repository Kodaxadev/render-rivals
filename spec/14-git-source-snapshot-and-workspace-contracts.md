# 14 — Git, Source Snapshot, Workspace, and Branch Export Contracts

**Status:** Canonical implementation contract  
**Scope:** Repository qualification, system Git invocation, source identity, dirty snapshots, manifests, worktrees, submodules, LFS, symlinks, line endings, case collisions, patches, cleanup, and local branch Promotion  
**Domain:** `spec/09-domain-model-and-identifiers.md`  
**Process execution:** `spec/04-supervisor-ipc-and-process-io.md`

## 1. Purpose

Source identity is foundational. If current and Contender bytes are not sealed reproducibly, capture/evidence hashes and Promotion preconditions are meaningless.

This specification removes ambiguity around how Render Rivals reads Git repositories, snapshots dirty state, materializes workspaces, verifies bytes, and creates non-destructive branches/patches.

## 2. Git implementation

MVP uses the installed system Git through supervisor-managed processes.

Rules:

- no JavaScript Git reimplementation;
- executable identity/version recorded;
- every invocation uses explicit argument array;
- locale/config sources that affect parsing are controlled;
- machine-readable `-z`/porcelain formats used where available;
- stdout/stderr retained as process Artifacts;
- user/global Git configuration is not silently modified;
- credentials are never requested interactively by MVP operations;
- network fetch/push is not automatic.

## 3. Qualified repository

A Git repository is qualified when Render Rivals can establish:

- working-tree root and Git common directory;
- object format and repository version;
- current HEAD state, including detached/unborn;
- worktree and index status;
- case-sensitivity/collision risk;
- symlink capability;
- submodule state;
- LFS requirements;
- package lock/source prerequisites;
- filesystem and path-length support;
- ability to create/remove an external worktree or snapshot workspace.

Bare repositories are source inputs only when explicitly materialized into an owned worktree and are not the normal MVP Project root.

## 4. Repository identity

Project repository fingerprint includes, without exposing credentials:

- canonical working-tree root;
- canonical Git common directory identity;
- object format;
- initial root manifest hash;
- normalized primary remote fingerprint when present;
- first-seen timestamp.

Remote URL is provenance only and is normalized/redacted before hashing. Moving a repository preserves Project identity only after marker/fingerprint verification.

## 5. Source Snapshot kinds

Supported MVP kinds:

- clean Git commit;
- branch resolved to immutable commit;
- existing worktree resolved and verified;
- explicit dirty working-tree snapshot;
- patch materialized onto an immutable base;
- local directory snapshot under a qualified Project;
- imported previous Candidate snapshot with valid provenance.

A branch name alone is never identity. It resolves to commit plus manifest.

## 6. Clean commit snapshot

For a clean commit:

1. resolve full commit object ID;
2. verify object exists;
3. record tree object ID;
4. record submodule gitlinks;
5. generate normalized file manifest from materialized bytes/policy;
6. record lockfile/configuration hashes;
7. seal Source Snapshot.

The Git tree ID is useful provenance but does not replace the normalized workspace manifest because attributes, filters, submodules, and platform materialization may affect visible bytes.

## 7. Dirty working-tree snapshot

Dirty state includes:

- index/staged changes;
- unstaged tracked changes;
- untracked files selected by policy;
- deletions;
- renames/copies as observed provenance;
- file mode and symlink changes;
- ignored required material declared separately.

Snapshot procedure:

1. record HEAD or unborn state;
2. acquire a short-lived source-scan guard and record start fingerprint;
3. collect status with NUL-delimited porcelain;
4. create a binary-capable patch for tracked/index differences where representable;
5. copy selected untracked files into an owned snapshot area;
6. generate full normalized manifest from intended Candidate source;
7. record end fingerprint/status;
8. reject when source changed during scan;
9. seal immutable patch/untracked/manifest Artifacts.

Render Rivals never automatically stages, commits, stashes, resets, cleans, or modifies the user's working tree.

## 8. File manifest

Each entry records:

```ts
interface SourceManifestEntry {
  path: string;
  kind: "file" | "symlink" | "submodule";
  byteLength: number | null;
  sha256: string | null;
  executable: boolean | null;
  symlinkTarget: string | null;
  submoduleCommit: string | null;
  sourceClass: "tracked" | "untracked_selected" | "materialized_required" | "generated_allowed";
}
```

Manifest rules:

- paths normalized to `/` and repository-relative;
- ordinal bytewise path sort after normalized Unicode policy;
- duplicate/case-colliding paths reject on incompatible target filesystem;
- file hash covers exact materialized bytes;
- no line-ending normalization for content identity;
- executable bit recorded where meaningful;
- symlink target text recorded without following for identity;
- directories implied by entries and not independently hashed;
- excluded paths and reasons stored separately;
- generated build output is not source unless policy explicitly includes it.

Manifest hash covers canonical ordered entries plus policy/version.

## 9. Line endings and attributes

Render Rivals records:

- `core.autocrlf` effective value;
- `core.eol` when set;
- relevant `.gitattributes` hashes;
- checkout/materialization platform;
- working-tree byte hashes.

It does not normalize CRLF/LF before hashing. Comparison is between actual candidate bytes that will execute.

A patch exported for Git may use Git's patch semantics, but the Promotion manifest records resulting target tree/workspace hashes after application.

## 10. File modes

Executable-bit changes are preserved on filesystems/Git configurations that support them.

On platforms that cannot represent a mode faithfully:

- record limitation;
- preserve Git index mode in provenance;
- block Promotion when mode is required for correctness and cannot be verified;
- do not silently report identical source.

## 11. Symlinks and junctions

Source symlink identity is target text, not followed content.

Materialization:

- rejects target escape unless policy explicitly allows a read-only declared material;
- rejects junction/mount escape from workspace;
- records when Windows checkout materializes symlink as plain file due to capability;
- blocks comparison when Candidate semantics differ because symlink capability is unavailable;
- never deletes outside workspace through followed links.

## 12. Case and Unicode collisions

Before materialization, detect paths that collide under target filesystem case-folding or normalization behavior.

Examples:

- `Button.tsx` and `button.tsx`;
- canonically equivalent Unicode spellings.

When collisions cannot be represented safely, repository/Candidate is unsupported for that target workspace. Do not pick one entry silently.

## 13. Git LFS

Doctor detects LFS pointer files and Git LFS availability.

Policy:

- if required LFS objects are already materialized, hash actual bytes and record LFS provenance;
- no implicit network fetch without explicit user action/policy;
- unresolved required pointer makes Candidate unqualified;
- evaluator/capture never mistakes pointer text for intended asset;
- LFS credentials/output remain sensitive.

## 14. Submodules

Record each gitlink path, expected commit, initialized state, and worktree manifest status.

MVP policy:

- no implicit network update;
- initialized required submodules must match expected commit;
- uninitialized/missing required submodule blocks qualification;
- dirty submodule state requires explicit nested snapshot policy or rejection;
- recursive submodules follow the same rules;
- workspace cleanup never deletes a shared external submodule checkout outside owned roots.

## 15. Sparse, shallow, and partial repositories

- sparse checkout is supported only when required source/material exists and sparse rules are recorded;
- shallow/partial repository is acceptable when all selected commits/objects are local;
- no implicit fetch;
- missing object blocks Snapshot or Promotion;
- promisor/lazy fetch behavior is disabled or explicitly controlled during deterministic operations.

## 16. Workspace materialization modes

### Git worktree

Preferred for clean commits/branches when supported.

- created outside source repository under owned cache root;
- detached at exact commit by default;
- no branch checkout unless operation requires it;
- dependencies remain worktree-local;
- after creation, manifest verification is mandatory.

### Snapshot copy/reflink

Used for dirty snapshots, local directories, or unsupported worktree cases.

- copy from sealed owned snapshot, not mutable live source where possible;
- preserve supported file modes/symlinks;
- verify full manifest;
- record copy/reflink method.

### Patch materialization

- start from exact immutable base;
- apply patch in owned workspace;
- preserve rejects/diagnostics;
- require resulting manifest;
- patch success alone is not verification.

## 17. Required ignored/untracked material

Ignored/untracked runtime material is never assumed.

Each declaration includes source, target, mode, secret, mutable, required, and cleanup policy.

- secret/env material excluded from Source Snapshot content hashes when raw inclusion leaks it; reference/presence identity is hashed;
- mutable databases/data stores require isolated copy/reset contract;
- read-only shared material is containment checked;
- generated material uses supervised explicit command and resulting verification.

## 18. Workspace verification and drift

Verify before every phase that depends on source identity:

- after materialization;
- after dependency preparation when protected/source mutation policy applies;
- after build when build may mutate source;
- before candidate launch;
- before Promotion.

Unexpected drift creates Candidate failure/staleness and may invalidate active Epoch when discovered during capture.

Allowed generated paths are declared and separately manifested; they do not alter Source Snapshot identity unless policy says they are source.

## 19. Worktree cleanup

Cleanup:

1. ensure no owned process has CWD/open dependency in worktree where observable;
2. remove through Git worktree command when Git-owned;
3. prune only Render Rivals-created stale metadata;
4. delete filesystem path only after canonical root/ownership verification;
5. record retained/preserved paths and failure;
6. never run broad `git clean`, reset, or prune against user's active worktree.

A failed cleanup remains explicit and retriable.

## 20. Patch Promotion

Patch Promotion records:

- selected Candidate and authorizing Decision;
- exact base Source Snapshot;
- changed file list and binary/mode/symlink handling;
- generated patch Artifact;
- target applicability verification;
- resulting expected manifest/tree hash where computable;
- limitations and manual verification instructions.

Patch is written to explicit generated destination with exclusive create. It is never automatically applied to active working tree.

## 21. Branch Promotion

Local branch creation:

1. verify authorizing Decision and Candidate/source hashes;
2. verify repository identity and required objects;
3. validate branch name under Git ref rules;
4. require branch not exist unless exact idempotent operation match;
5. create branch/ref pointing to an exact commit representing Candidate;
6. when Candidate is patch/directory/dirty snapshot, create commit only in an owned temporary worktree with explicit generated author/committer policy and user-visible message;
7. verify resulting commit/tree/manifest;
8. do not checkout branch over active worktree;
9. do not push or modify upstream/tracking config;
10. record branch ref/commit and verification.

If commit author identity is unavailable, use an explicit Render Rivals local identity recorded in Promotion metadata rather than mutating global Git config. The user may configure identity beforehand.

## 22. Branch names

Default proposal:

```text
render-rivals/<run-id-short>/<candidate-slug>
```

Sanitize and validate:

- no invalid ref sequences/components;
- bounded length;
- collision checked;
- display slug is not identity;
- user can edit before operation.

## 23. Importing previous Candidate

A previous Candidate may be imported only when:

- Source Snapshot and manifest Artifacts verify;
- provenance chain is readable;
- source bytes can be rematerialized;
- it becomes a new Candidate in a new Run;
- selectable evidence is not imported as current evidence;
- a new Capture Epoch recaptures it.

## 24. Error classes

At minimum:

- `GIT_NOT_FOUND`
- `GIT_VERSION_UNSUPPORTED`
- `REPOSITORY_UNBORN_HEAD`
- `REPOSITORY_OBJECT_MISSING`
- `SOURCE_CHANGED_DURING_SNAPSHOT`
- `SOURCE_CASE_COLLISION`
- `SOURCE_SYMLINK_UNSUPPORTED`
- `SOURCE_SUBMODULE_MISSING`
- `SOURCE_SUBMODULE_DIRTY`
- `SOURCE_LFS_OBJECT_MISSING`
- `WORKTREE_CREATE_FAILED`
- `WORKTREE_MANIFEST_MISMATCH`
- `PATCH_APPLY_FAILED`
- `PATCH_RESULT_MISMATCH`
- `BRANCH_INVALID_NAME`
- `BRANCH_ALREADY_EXISTS`
- `BRANCH_RESULT_MISMATCH`
- `WORKTREE_CLEANUP_FAILED`

## 25. Required tests

Fixtures cover:

- clean commit and detached HEAD;
- unborn repository;
- staged/unstaged/untracked/deleted/renamed/binary changes;
- source mutation during snapshot;
- CRLF/LF and `.gitattributes`;
- executable-bit change;
- safe and escaping symlink/junction;
- case/Unicode collision;
- LFS materialized and missing pointer;
- initialized, missing, dirty, and nested submodules;
- sparse/shallow/partial repositories with present/missing objects;
- worktree creation/verification/cleanup;
- patch apply success/reject/result mismatch;
- branch valid/invalid/collision/idempotent retry;
- active working tree remains unchanged;
- no implicit fetch/push/stash/reset/clean;
- previous Candidate import forces recapture.
