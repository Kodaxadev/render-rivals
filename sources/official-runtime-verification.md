# Official Runtime Verification Notes

**Status:** Source-reference and scaffold recheck checklist  
**Last architecture review:** 2026-07-20  
**Important:** Documentation of an operating-system or library API is not evidence that the Render Rivals implementation satisfies its invariants. Every reference-platform claim still requires the doctor/adversarial/packaged-build tests.

## 1. Purpose

Record:

- stable upstream API claims used by architecture;
- version-sensitive behavior to recheck against pinned dependencies;
- implementation proofs required before a capability/support claim;
- sources that must be refreshed when packages/platform support change.

This file is not a compatibility matrix and does not replace test evidence.

## 2. Windows console events

Documented claim:

- console control events apply to console processes sharing a console;
- `CTRL_C_EVENT` cannot be targeted to one process group through `GenerateConsoleCtrlEvent`;
- `CREATE_NEW_PROCESS_GROUP` creates a process group and changes control-event behavior.

Architecture consequence:

- managed coordinator/Project/evaluator roots do not rely on the user's shared console for graceful cancellation;
- Rust is terminal/Ctrl+C authority;
- graceful cancellation uses private protocol/stdin/private-group/HTTP/process-specific paths;
- forced cancellation uses verified containment.

Implementation proof:

- packaged Windows build demonstrates first/second Ctrl+C behavior;
- Project server receives no direct user Ctrl+C;
- terminal is restored after clean/crash/force paths.

Primary references:

- Microsoft Learn: GenerateConsoleCtrlEvent;
- Microsoft Learn: Console Process Groups;
- Microsoft Learn: Process Creation Flags.

## 3. Windows atomic Job assignment

Documented claim:

- process creation attribute lists can include Job Object handles.

Architecture consequence:

- evaluate `PROC_THREAD_ATTRIBUTE_JOB_LIST` as the primary atomic coordinator/root assignment path;
- avoid ordinary launch-then-assign as the claimed strong path.

Implementation proof:

- coordinator begins inside Session Job;
- every managed root is assigned before untrusted code runs;
- failure to assign terminates the process and reports stable error;
- browser descendants remain in the required Job relationship.

Primary reference:

- Microsoft Learn: UpdateProcThreadAttribute and process-thread attribute constants.

## 4. Windows Job lifetime and nesting

Scaffold rechecks:

- kill-on-Job-close behavior for the exact handle ownership model;
- nested Job support/limits on supported Windows versions;
- breakaway denial/error classification;
- Job accounting and process-limit behavior;
- Rust remains outside payload boundary and can enforce shutdown.

Implementation proof:

- adversarial detached descendant and browser tree are removed after Session Job close/termination;
- candidate-local group cleanup does not kill coordinator/browser/other Candidate;
- supervisor crash behavior matches the claimed capability.

## 5. Windows listener ownership

Scaffold rechecks:

- owning-PID TCP table API and required privileges/IPv4/IPv6 behavior;
- mapping listener PID to stable Process/Group identity;
- race behavior across process exit/PID reuse.

Implementation proof:

- expected listener is verified as a descendant/member of Candidate group;
- unrelated listener is rejected and never terminated merely by PID;
- ownership unavailable is reported honestly.

Primary reference family:

- Microsoft IP Helper TCP table APIs with owning PID.

## 6. Windows named-pipe security

Scaffold rechecks:

- explicit security descriptor/DACL;
- current-user SID resolution;
- remote-client rejection;
- one-instance behavior;
- peer/client PID retrieval;
- endpoint cleanup after crash.

Implementation proof:

- wrong user/nonce/PID/process identity and second client reject;
- endpoint/nonce never argv/URL/log;
- malformed/oversized frames fail closed.

## 7. Linux cgroup delegation

Documented claim:

- systemd documents single-writer/delegation through `Delegate=`;
- kernel cgroup v2 defines delegated subtrees and controllers.

Architecture consequence:

- do not create arbitrary cgroups under systemd-owned hierarchy;
- obtain an explicitly delegated user unit/scope;
- own a payload subtree while Rust/watchdog remain outside;
- report strong only after live create/migrate/kill probe.

Implementation proof:

- delegated child creation, migration, nested groups, writable `cgroup.kill`, cleanup, and supervisor-loss watchdog on maintained distributions.

Primary references:

- systemd Control Group APIs and Delegation;
- systemd Control Group Interface;
- Linux kernel cgroup v2.

## 8. Linux cgroup kill

Documented claim:

- `cgroup.kill` recursively kills processes in a non-root cgroup when supported.

Architecture consequence:

- probe file/permissions and disposable kill;
- do not infer from mount, kernel, or systemd presence alone.

Implementation proof:

- stubborn/detached payload removed;
- watchdog performs cleanup after Rust loss;
- scope/cgroup removal and listener verification succeed.

## 9. Linux managed fallback

Scaffold rechecks:

- subreaper semantics;
- pidfd support and identity behavior;
- `/proc` descendant/socket inspection;
- process-group/session behavior;
- limitations after supervisor crash or deliberate detachment.

Implementation proof must label the capability managed rather than strong.

## 10. macOS best effort

Scaffold rechecks:

- process-group/session creation;
- peer credential APIs for Unix sockets;
- process event/descendant observation APIs;
- listener ownership capability;
- child cleanup limitations;
- signing/notarization requirements for distributed native binary.

No parity claim without a new accepted decision and maintained host tests.

## 11. Playwright Clock

Documented behavior to verify against pinned release:

- fixed time affects date APIs while timers may continue;
- installed controlled clock supports explicit progression;
- install ordering matters.

Architecture consequence:

- fixture declares clock mode;
- setup occurs before application scripts when required;
- settle policy records advancement/pause;
- server-side time remains separate.

Implementation proof:

- reference fixture confirms Date/timers/animation behavior for the exact pinned Playwright/Chromium revision;
- unsupported method/version fails validation rather than silently falling back.

Primary reference:

- Playwright Clock documentation for the pinned package.

## 12. Playwright browser lifecycle and containment

Scaffold rechecks:

- browser disconnect/crash events;
- page crash behavior distinct from browser disconnect;
- process/child relationship for launched Chromium;
- browser-server/executable launch options;
- persistent context/service worker cleanup;
- browser download/revision/integrity strategy.

Implementation proof:

- browser descendants inherit Windows Session containment;
- browser disconnect invalidates full Epoch;
- page crash remains Candidate-local while browser continuity holds;
- context isolation-leak fixture is detected;
- close/force cleanup leaves no owned browser descendants/listeners.

## 13. Filesystem atomicity and durability

Scaffold rechecks per supported filesystem:

- same-filesystem atomic rename/replace semantics;
- file and directory fsync/flush availability and error behavior;
- Windows replace behavior with antivirus/indexer/open handles;
- path-length/case/Unicode behavior;
- network/removable filesystem limitations.

Implementation proof:

- data-root doctor probe;
- crash/fault injection at each Event/Artifact/snapshot commit step;
- unsupported filesystem blocks mutation or clearly downgrades durability.

## 14. Git, worktrees, LFS, and submodules

Scaffold rechecks against pinned minimum system Git:

- porcelain `-z` formats;
- worktree creation/removal/prune;
- binary/mode/symlink patches;
- branch/ref validation;
- CRLF and attributes;
- LFS pointer/materialized detection;
- submodule gitlink/dirty state;
- sparse/shallow/partial clone object behavior;
- Windows case/path behavior.

Implementation proof is the spec14 fixture suite. No implicit fetch/push/stash/reset/clean.

## 15. Node and package-manager runtime

Scaffold rechecks:

- exact supported Node line;
- `process.execPath` behavior under version managers;
- optional dependency platform filtering;
- ESM/bundle/runtime behavior;
- npm/pnpm install and `npx` execution;
- browser installation behavior;
- environment injection such as `NODE_OPTIONS`.

Implementation proof:

- clean-machine package smoke tests;
- exact Node despite changed `PATH`;
- missing/mismatched native package diagnostics;
- no Project code during install.

## 16. Native distribution

Before public packaging verify:

- target triples/libc selection;
- executable/package checksums;
- package compatibility manifest;
- Windows signing/SmartScreen behavior;
- macOS signing/notarization if distributed;
- SBOM/third-party notices;
- offline bundle/browser artifact;
- migration/rollback behavior.

Architecture details are in packaging contract.

## 17. Evaluator/provider adapters

Scaffold rechecks:

- command adapter process/file semantics;
- provider authentication/configuration;
- provider input/output/usage fields;
- timeout/cancellation;
- remote data retention/terms;
- model/CLI format changes.

Provider-specific claims are dated policy snapshots. Generic command adapter schema remains Render Rivals-owned.

## 18. Version-sensitive recheck register

At minimum before Stage acceptance or upgrade:

1. Node/package manager/ESM support;
2. Rust/native binding APIs;
3. Windows Job/console/named-pipe/TCP owner behavior;
4. Playwright Clock/browser lifecycle/download revision;
5. filesystem atomicity on selected data root;
6. Git/worktree/LFS/submodule behavior;
7. systemd transient/delegation/cgroup kill;
8. evaluator/provider formats and terms;
9. signing/notarization/package-manager behavior.

Each completed recheck records:

- date;
- exact version/OS/build;
- primary source;
- small verification program or test fixture;
- observed result;
- affected spec/ADR/compatibility matrix;
- follow-up issue or accepted change.

## 19. Current primary URLs

These are starting references and must be checked for current authoritative location at revalidation time:

- `https://playwright.dev/docs/clock`
- `https://learn.microsoft.com/en-us/windows/console/generateconsolectrlevent`
- `https://learn.microsoft.com/en-us/windows/win32/procthread/process-creation-flags`
- `https://systemd.io/CGROUP_DELEGATION/`
- `https://systemd.io/CONTROL_GROUP_INTERFACE/`
- `https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html`

The repository does not claim these URLs alone prove Render Rivals capability.
