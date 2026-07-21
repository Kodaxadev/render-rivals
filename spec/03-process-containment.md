# 03 — Cross-Platform Process Containment and Resource Enforcement

**Status:** Canonical implementation contract  
**Launch authority:** `spec/02-runtime-and-bootstrap.md`  
**Shared process purposes:** `schemas/domain-types.ts`  
**Resolved/deferred platform decisions:** `docs/SCAFFOLD-DECISION-REGISTER.md`

## 1. Principle

Containment guarantees are asymmetric. Record what was achieved; never infer parity from a common interface or platform name.

Containment limits ordinary and accidental descendant escape. It is not a hostile-code sandbox. Repository code still executes with the user's authority.

## 2. Capability model

```ts
export type ContainmentLevel =
  | "strong"
  | "managed"
  | "best_effort"
  | "unavailable";

export interface ContainmentCapabilities {
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

Capabilities are measured by doctor fixtures and stored per Session.

## 3. Capability gating

Examples:

- Windows 11 reference MVP requires strong containment;
- human-only comparison may allow a lower explicitly accepted capability outside reference acceptance;
- external-server capture is limited and cannot claim server ownership;
- published benchmarks require a controlled environment or strong containment;
- future autonomous generation may require stronger policy than prebuilt-contender comparison.

No command silently lowers the minimum required capability.

## 4. Launch and descendant policy

Rust owns launch authorization, managed root-process creation, containment assignment, observation, resource enforcement, and termination.

Approved managed roots may create descendants only when:

- inheritance into the containment boundary is expected;
- doctor verifies inheritance for the process class;
- descendants remain attributable to the owning group;
- listener/process inspections can detect material escape;
- capability is downgraded or the Run fails when containment cannot be proven.

This permits contained Playwright-to-Chromium spawning on the Windows reference path while preserving Rust as containment authority.

## 5. Windows strong mode

### 5.1 Session Job Object

Rust creates one Session Job Object with:

- kill on Job close;
- normal breakaway disabled;
- silent breakaway disabled;
- accounting;
- configured process/memory limits where supported.

Rust remains outside the Session Job so it can enforce shutdown.

### 5.2 Coordinator membership

Coordinator is created with atomic Job assignment through the process attribute list. Suspended-then-assign is not the primary implementation.

Coordinator receives:

- Session Job membership;
- no inherited user console;
- captured stdio;
- authenticated IPC environment.

### 5.3 Hierarchy

Conceptual hierarchy:

```text
Rust supervisor
└── Session Job
    ├── Node coordinator
    │   └── Playwright-managed Chromium descendants
    └── Run groups
        ├── current candidate process groups
        ├── contender process groups
        ├── dependency/build/test roots
        ├── fixture/evaluator roots
        └── Git/export/doctor utilities
```

Nested child Jobs are used only where doctor proves host support and semantics. A fallback may use one Session Job plus Render Rivals-owned logical groups and verified process membership.

### 5.4 Browser containment

Doctor verifies Job membership for browser, renderer, GPU, crash handler, and utility processes that remain active during capture.

Failure means:

- Session is not reported strong for browser capture;
- the reference MVP cannot start;
- active epoch is invalidated if failure is discovered during capture.

### 5.5 Candidate isolation

Terminating one candidate group must not terminate coordinator, browser, or another candidate group.

If the platform cannot provide nested kernel boundaries, Rust maintains explicit process ownership and termination targeting under the Session Job and doctor must prove candidate-local cleanup.

### 5.6 Session termination

Closing or terminating the Session Job removes coordinator, browser descendants, Run groups, evaluators, and servers. Rust then verifies endpoints and remaining identities.

### 5.7 Listener ownership

Native inspection maps TCP listener PID to verified Session/Run/Candidate ownership. Validity is containment membership, not equality with the original server PID.

## 6. Linux strong mode

Linux strong mode requires all of:

- unified cgroup v2;
- systemd user manager;
- explicit delegation;
- writable owned subtree;
- payload child cgroup;
- usable `cgroup.kill`;
- watchdog outside payload;
- successful disposable create/migrate/kill probe.

Presence of `/sys/fs/cgroup`, systemd, or a recent kernel is insufficient.

### 6.1 Single-writer rule

Rust never creates arbitrary cgroups under a systemd-owned subtree. It first obtains an explicitly delegated unit.

### 6.2 Hierarchy

```text
transient delegated user unit
├── Rust supervisor
├── watchdog
└── payload cgroup
    ├── Node coordinator
    ├── Playwright/Chromium descendants
    └── Run cgroups
        ├── candidate cgroups
        └── evaluator/utility cgroups
```

Rust and watchdog remain outside payload.

### 6.3 Acquisition and verification

The Linux spike follows the decisions in `docs/SCAFFOLD-DECISION-REGISTER.md`. Strong mode is reported only after delegated child creation, migration, nested group, writable `cgroup.kill`, and disposable kill tests succeed.

### 6.4 Watchdog

If Rust disappears, watchdog writes to payload `cgroup.kill`, records the outcome outside payload, and exits after cleanup verification.

### 6.5 Normal shutdown

1. stop admitting work;
2. terminate payload cgroup;
3. verify endpoints and descendants absent;
4. remove child cgroups;
5. release delegated unit;
6. stop watchdog.

## 7. Linux managed fallback

When strong delegation is unavailable, use:

- `PR_SET_CHILD_SUBREAPER`;
- dedicated process groups;
- pidfds where available;
- `/proc` descendant and endpoint tracking;
- repeated rescans;
- SIGTERM then SIGKILL;
- explicit cleanup limitations.

Managed mode cannot guarantee cleanup after Rust crash or deliberate fast detach.

## 8. macOS best effort

Use process groups, process event notifications where available, descendant snapshots, known-port inspection, and repeated graceful/forced signals.

UI and manifests must state `best_effort`. No native parity claim is permitted.

## 9. Detachment doctor fixture

The doctor fixture launches:

```text
root helper
├── ordinary child
│   └── ordinary grandchild
└── detacher
    ├── creates a new process group/session
    ├── spawns again
    ├── exits intermediate parent
    ├── binds a TCP listener
    └── sleeps
```

Windows additionally attempts Job/process-group breakaway behavior. Browser fixture verifies every relevant Chromium descendant.

## 10. Doctor scenarios

- normal tree cancellation;
- deliberate detachment cleanup;
- coordinator crash cleanup;
- Rust crash cleanup where claimed;
- browser descendant membership;
- candidate-local termination isolation;
- endpoint ownership;
- breakaway-denial classification;
- Linux delegated kill probe;
- Linux managed fallback;
- PID reuse and identity mismatch;
- cleanup result with unverifiable leftovers.

## 11. Resource policy

```ts
export interface LocalResourcePolicy {
  maxConcurrentCandidates: number;
  maxConcurrentBrowsers: number;
  reserveSystemMemoryMiB: number;
  maxSessionMemoryMiB: number;
  maxCandidateMemoryMiB: number;
  maxRunDiskMiB: number;
  minimumFreeDiskMiB: number;
  maximumProcessCount: number;
  maximumStdoutMiBPerProcess: number;
  maximumStderrMiBPerProcess: number;
}
```

MVP defaults:

```text
maxConcurrentCandidates = 1
maxConcurrentBrowsers = 1
maximumStdoutMiBPerProcess = 64
maximumStderrMiBPerProcess = 64
```

Exact memory/disk/process defaults are pinned during the scaffold after measurements on the Windows 11 reference fixture.

## 12. Admission controller

Inputs:

- free and reserved memory;
- Session/group memory;
- process count;
- free disk and configured reserve;
- browser and candidate counts;
- configured limits;
- historical estimate when available;
- capability to enforce requested limits.

Outcomes:

- admitted;
- queued;
- rejected;
- requires explicit override when policy permits.

No candidate starts while another candidate server is active in the MVP.

## 13. Blocking and advisory limits

Per `docs/SCAFFOLD-DECISION-REGISTER.md`:

Blocking:

- minimum free-disk reserve;
- output byte ceiling;
- process-count ceiling;
- configured hard memory ceiling when enforceable;
- inability to enforce a policy marked mandatory.

Advisory until configured hard threshold:

- CPU usage;
- soft memory pressure;
- estimated duration;
- non-kernel-backed resource observations.

## 14. Resource events

```ts
export type ResourceEvent =
  | { kind: "memory_soft_limit"; groupId: string }
  | { kind: "memory_hard_limit"; groupId: string }
  | { kind: "disk_low"; freeMiB: number }
  | { kind: "process_limit"; groupId: string }
  | { kind: "output_backpressure"; processId: string }
  | { kind: "output_limit"; processId: string };
```

Every event records whether the observation was kernel-enforced, supervisor-enforced, or advisory.

## 15. Cleanup verification

After group termination verify:

- known process identities exited;
- containment descendants are empty where supported;
- owned listeners are absent;
- output files are closed and registered;
- resource accounting is finalized;
- retained workspaces and exceptions are explicit.

```ts
export interface CleanupResult {
  groupId: string;
  completed: boolean;
  remainingProcessIds: string[];
  remainingPids: number[];
  remainingEndpoints: string[];
  forced: boolean;
  verification: "complete" | "incomplete" | "unavailable";
  diagnostics: string[];
}
```

Stored PID values are diagnostic only. Cleanup never kills an unrelated process based only on PID reuse.

## 16. Support declaration

### MVP reference

- Windows 11 x64: strong target after doctor passes.

### Experimental

- Linux x64: strong only when delegation/kill/watchdog probes pass;
- Linux x64: managed fallback;
- macOS: best effort.

Expand support only after doctor and adversarial suites pass on maintained test hosts.

## 17. Implementation order

1. Windows 11 Session Job and exact coordinator launch.
2. Windows console isolation and root-process launch API.
3. Output capture and candidate-local group cleanup.
4. Browser descendant doctor.
5. Endpoint ownership and resource accounting.
6. Linux managed fallback.
7. Linux delegated-scope/watchdog spike.
8. macOS best-effort observer.

Historical `OPEN-CONT-*` decisions are resolved or deferred in `docs/SCAFFOLD-DECISION-REGISTER.md`.
