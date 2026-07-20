# 03 — Cross-Platform Process Containment and Resource Enforcement

## 1. Principle

Containment guarantees are asymmetric. Record what was achieved; never infer parity from a common interface.

## 2. Capability model

```ts
type ContainmentLevel =
  | "strong"
  | "managed"
  | "best_effort"
  | "unavailable";
```

```ts
interface ContainmentCapabilities {
  platform: "windows" | "linux" | "macos";
  level: ContainmentLevel;
  mechanism:
    | "windows-job-object"
    | "linux-systemd-delegated-cgroup-v2"
    | "linux-subreaper-proc-tracking"
    | "macos-process-observer"
    | "none";
  survivesSupervisorCrash: boolean;
  containsDetachedChildren: boolean;
  supportsNestedGroups: boolean;
  supportsResourceLimits: boolean;
  supportsEndpointOwnerLookup: boolean;
  diagnostics: string[];
}
```

## 3. Capability gating

Examples:

- autonomous generation may require `strong`;
- judge-only comparison may allow `managed`;
- external server capture may allow `best_effort`;
- published benchmark may require container or `strong`.

## 4. Windows strong mode

### Session Job Object

Rust creates one session Job Object with:

- kill on job close;
- normal breakaway disabled;
- silent breakaway disabled;
- accounting;
- optional memory/process limits.

### Atomic coordinator membership

Create coordinator with atomic Job Object assignment through process attribute list. Suspended-then-assign is not primary.

### Console isolation

Job membership and console policy are separate. Coordinator receives job membership, no user console, captured stdio, and IPC environment.

### Nested groups

Where verified:

```text
session job
├── coordinator
├── Playwright/Chromium
└── run job
    ├── champion server job
    ├── challenger server jobs
    ├── build/test jobs
    └── agent/judge jobs
```

### Browser containment

Chromium is a coordinator descendant. Doctor verifies Job membership for browser, renderer, GPU, and utility processes.

Failure means session is not reported strong.

### Candidate termination

Killing Candidate A must not kill coordinator, browser, or Candidate B.

### Session termination

Closing/terminating session Job removes coordinator, Chromium, run groups, agents, and servers. Rust remains outside.

### Breakaway

Breakaway is denied and classified as unsupported repository behavior.

### Listener ownership

Native layer maps TCP listener PID and Job membership.

## 5. Linux strong mode

Linux strong mode requires:

- unified cgroup v2;
- systemd user manager;
- explicit delegation;
- writable owned subtree;
- payload child cgroup;
- usable `cgroup.kill`;
- watchdog.

Presence of `/sys/fs/cgroup` is insufficient.

## 6. Linux single-writer rule

Supervisor never creates arbitrary cgroups under a systemd-owned subtree.

It obtains an explicitly delegated unit.

## 7. Linux scope acquisition

Preferred mechanism: transient user scope with `Delegate=yes` through systemd user-manager transient-unit API.

Conceptual equivalent:

```text
systemd-run --user --scope --property=Delegate=yes ...
```

Exact D-Bus signatures are reverified at scaffold time.

## 8. Linux hierarchy

```text
transient delegated scope
├── Rust supervisor
├── watchdog
└── payload cgroup
    ├── Node coordinator
    ├── Playwright/Chromium
    └── run cgroups
        ├── candidate cgroups
        └── judge cgroups
```

Rust and watchdog remain outside payload so they can kill it.

## 9. Coordinator placement

Coordinator must not run uncontrolled before cgroup placement.

Implementation spike chooses and verifies one:

- fork child behind synchronization barrier;
- create scope with child PID before exec;
- tested transient-scope launcher;
- equivalent bounded method.

## 10. Delegation verification

Verify:

- unified hierarchy;
- scope cgroup path;
- delegated permissions/marker;
- child cgroup creation;
- disposable child migration;
- nested cgroup creation;
- `cgroup.kill` exists and is writable;
- disposable kill works.

## 11. `cgroup.kill`

Do not infer from kernel version alone.

Strong mode requires file and successful test.

Cgroup v2 without usable `cgroup.kill` is not strong mode.

## 12. Linux watchdog

Watchdog outside payload monitors Rust liveness.

If Rust disappears, watchdog writes `1` to payload `cgroup.kill` and records outcome.

## 13. Normal Linux shutdown

1. Kill payload cgroup.
2. Remove child cgroups.
3. Release transient scope.
4. Confirm descendants gone.
5. Stop watchdog.

## 14. Linux managed fallback

When delegation unavailable:

- `PR_SET_CHILD_SUBREAPER`;
- dedicated process groups;
- `/proc` descendant tracking;
- pidfds where available;
- repeated rescans;
- SIGTERM then SIGKILL;
- known-port verification.

## 15. Managed limitations

- no complete cleanup after Rust crash;
- rapid detached process may escape;
- malicious evasion possible;
- not equivalent to Job Objects/cgroup kill.

## 16. Linux classification

### Strong

Delegation and kill probes pass.

### Managed

Subreaper/tracking works but delegated kill boundary unavailable.

### Best effort

Only ordinary process-group cleanup works.

### Unavailable

Normal child tree cannot be cleaned reliably.

## 17. macOS best effort

Use:

- process groups;
- process event notifications;
- descendant snapshots;
- known-port inspection;
- repeated graceful/forced signals.

## 18. macOS limitations

- deliberate detach may escape;
- supervisor-crash cleanup not guaranteed;
- UI must say `best_effort`;
- strict benchmark should use controlled Linux environment.

## 19. Detachment doctor fixture

```text
root helper
├── ordinary child
│   └── ordinary grandchild
└── detacher
    ├── creates new session/process group
    ├── forks/spawns again
    ├── exits intermediate parent
    ├── binds TCP listener
    └── sleeps
```

Windows fixture attempts process-group and Job breakaway behavior.

## 20. Doctor scenarios

- `CONT-001`: normal tree cancellation.
- `CONT-002`: deliberate detachment cleanup.
- `CONT-003`: coordinator crash cleanup.
- `CONT-004`: Rust crash cleanup.
- `CONT-005`: browser descendant membership.
- `CONT-006`: candidate isolation.
- `CONT-007`: endpoint ownership.
- `CONT-008`: breakaway denial classification.
- `CONT-009`: cgroup strong probe.
- `CONT-010`: subreaper fallback.

## 21. Resource policy

```ts
interface LocalResourcePolicy {
  maxConcurrentCandidates: number;
  maxConcurrentBrowsers: number;
  reserveSystemMemoryMiB: number;
  maxSessionMemoryMiB: number;
  maxCandidateMemoryMiB: number;
  maxRunDiskMiB: number;
  minimumFreeDiskMiB: number;
  maximumProcessCount: number;
  maximumOutputMiBPerProcess: number;
}
```

## 22. Initial defaults

```text
maxConcurrentCandidates = 1
maxConcurrentBrowsers = 1
```

No candidate starts while another candidate server is active.

## 23. Admission controller

Inputs:

- free memory;
- session memory;
- process count;
- free disk;
- browser count;
- candidate count;
- configured limits;
- historical workload estimate.

Outcomes:

- admitted;
- queued;
- rejected;
- requires override.

## 24. Enforcement

Rust may enforce:

- memory ceiling;
- process count;
- CPU accounting;
- output-size limit;
- termination deadline.

Platform capability determines kernel-backed status.

## 25. Resource events

```ts
type ResourceEvent =
  | { kind: "memory_soft_limit"; groupId: string }
  | { kind: "memory_hard_limit"; groupId: string }
  | { kind: "disk_low"; freeMiB: number }
  | { kind: "process_limit"; groupId: string }
  | { kind: "output_backpressure"; processId: string }
  | { kind: "output_limit"; processId: string };
```

## 26. Sequential rationale

Sequential execution reduces memory contention, ports, install contention, database conflicts, cleanup complexity, and experimental noise without reducing candidate independence.

## 27. Cleanup verification

After group termination, verify:

- known handles exited;
- descendants empty where supported;
- listeners absent;
- output files closed;
- accounting finalized.

```ts
interface CleanupResult {
  groupId: string;
  completed: boolean;
  remainingPids: number[];
  remainingEndpoints: NetworkEndpoint[];
  forced: boolean;
  diagnostics: string[];
}
```

If platform cannot prove cleanup, record `cleanup_verification=incomplete`.

## 28. Support declaration

### v0

- Windows: strong reference target.
- Linux: experimental strong when delegation probe passes.
- Linux: managed fallback.
- macOS: best effort.

### Later

Expand only after doctor/adversarial suites pass on test hosts.

## 29. Security boundary

Containment limits accidental and ordinary descendant escape. It is not a hostile-code sandbox.

Repository code runs as user and may access user-readable files/network or consume resources before limits react.

## 30. Implementation order

1. Windows session Job.
2. Exact coordinator launch.
3. Windows console isolation.
4. Child Job lifecycle.
5. Browser doctor.
6. Resource accounting.
7. Linux managed fallback.
8. Linux delegated-scope spike.
9. Linux strong watchdog.
10. macOS best-effort observer.

## 31. Open items

- `OPEN-CONT-001`: Rust Windows API binding layer.
- `OPEN-CONT-002`: direct systemd D-Bus versus scaffold-stage `systemd-run` acquisition.
- `OPEN-CONT-003`: supported systemd versions.
- `OPEN-CONT-004`: macOS observation implementation.
- `OPEN-CONT-005`: fatal versus advisory resource limits.
