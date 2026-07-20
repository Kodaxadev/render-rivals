# Official Runtime Verification Notes

## Purpose

Record stable claims checked before consolidation and version-sensitive claims to recheck at scaffold.

## Windows console events

Microsoft documents that console control events apply to console processes sharing a console. `CTRL_C_EVENT` cannot be limited to one process group through `GenerateConsoleCtrlEvent`. `CREATE_NEW_PROCESS_GROUP` creates a group and disables Ctrl+C for the new group.

Architecture consequence:

- supervised children do not share normal user-console Ctrl+C handling;
- Rust is terminal authority;
- graceful child cancellation uses private control paths.

Official references:

- Microsoft Learn, GenerateConsoleCtrlEvent function.
- Microsoft Learn, Console Process Groups.
- Microsoft Learn, Process Creation Flags.

## Windows atomic Job assignment

Microsoft documents Job Object handles in a process creation attribute list.

Architecture consequence:

- evaluate `PROC_THREAD_ATTRIBUTE_JOB_LIST` as primary atomic coordinator assignment.

Official reference:

- Microsoft Learn, UpdateProcThreadAttribute function.

## Linux cgroup delegation

systemd documents a single-writer rule and delegation through `Delegate=` on service or scope units. Kernel cgroup v2 documentation describes delegated subtree ownership and containment.

Architecture consequence:

- do not create arbitrary cgroups under systemd-owned hierarchy;
- acquire delegated transient user scope;
- verify ownership and permissions.

Official references:

- systemd.io, Control Group APIs and Delegation.
- systemd.io, New Control Group Interfaces.
- Linux kernel, Control Group v2.

## Linux cgroup kill

Kernel documentation exposes `cgroup.kill` on non-root cgroups and defines recursive SIGKILL behavior.

Architecture consequence:

- probe file and disposable kill;
- do not infer support from mount or version alone.

## Playwright Clock

Playwright documents:

- `setFixedTime` fixes `Date.now()` and `new Date()` while normal timers continue;
- `install` enables controlled clock;
- `pauseAt`, `fastForward`, and `runFor` control progression;
- install ordering matters.

Architecture consequence:

- fixture declares clock mode and settle policy;
- exact semantics are verified against pinned version.

## Scaffold-time rechecks

1. Playwright Clock methods/order.
2. Playwright browser disconnect behavior.
3. systemd `StartTransientUnit` property signatures.
4. user-scope delegation on supported distributions.
5. Windows ConPTY and creation flags.
6. agent CLI event formats.
7. vendor auth/subscription terms.

## Current official URLs

- https://playwright.dev/docs/clock
- https://learn.microsoft.com/en-us/windows/console/generateconsolectrlevent
- https://learn.microsoft.com/en-us/windows/win32/procthread/process-creation-flags
- https://systemd.io/CGROUP_DELEGATION/
- https://systemd.io/CONTROL_GROUP_INTERFACE/
- https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html
