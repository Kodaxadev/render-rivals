# 05 — Repository Preparation, Execution Pipeline, Capture Epochs, and Determinism

**Status:** Canonical implementation contract  
**Domain types:** `schemas/domain-types.ts`  
**Storage authority:** `spec/11-artifact-event-and-schema-contracts.md`  
**Failure behavior:** `docs/FAILURE-RECOVERY-MATRIX.md`

## 1. Pipeline

```text
doctor
→ repository qualification
→ current-source qualification or separate baseline-recovery workflow
→ immutable source snapshots
→ isolated workspace materialization
→ dependency/build preparation
→ pre-capture gates
→ capture epoch
→ runtime and capture gates
→ post-capture evidence gates
→ pairwise evaluation or deterministic retention
→ recommendation
→ explicit user decision
→ optional non-destructive promotion/export
→ cleanup and integrity seal
```

Gate phases are explicit. A gate cannot be required before the evidence it consumes exists.

## 2. Doctor and repository qualification

Doctor checks:

- Git and repository identity;
- package manager and exact Node;
- source status and required untracked material;
- containment and process cleanup;
- Playwright browser and browser membership;
- commands, ports, storage, fixture, states, interaction, and secret declarations.

A repository is qualified when source, commands, dependencies, route, fixture, and required capabilities are available under the frozen policy.

## 3. Baseline recovery

A broken current implementation does not enter the contender comparison path.

Recovery may repair command configuration, restore generated artifacts, fix a non-design compile error, or establish the required fixture. It produces a separate patch/workspace or superseding Run. The repaired source must be accepted and snapshotted before it becomes the current implementation.

Recovery is represented by `RecoveryDisposition`; it is not a special mutable Run state.

## 4. Source snapshots and workspaces

The current implementation and contender each reference an immutable `SourceSnapshotId` from `spec/09`.

Dirty source requires an explicit working-tree snapshot and patch hash. Branch names are provenance only.

Disposable workspaces live under a configured cache root, conceptually:

```text
<cache-root>/worktrees/<project-id>/<run-id>/
  current/
  contender-<candidate-id>/
```

They never live inside the target repository and are not canonical Run history.

## 5. Workspace materialization

```ts
export type MaterializationMode =
  | "copy"
  | "snapshot"
  | "symlink_readonly"
  | "generate"
  | "env";

export interface WorkspaceMaterial {
  source?: string;
  target?: string;
  mode: MaterializationMode;
  secret: boolean;
  mutable: boolean;
  required: boolean;
}
```

Rules:

- Git worktrees do not imply ignored/untracked material exists;
- required material is declared;
- secret material is excluded from evidence, patches, evaluator packets, and standard exports;
- symlinks/junctions are containment checked;
- materialization output is verified against a manifest before commands run.

## 6. Unsupported repository classes

The MVP may reject:

- unknown ignored state;
- singleton mutable database that cannot be cloned/reset;
- manual desktop-only application;
- machine-global side effects;
- undocumented external services;
- required Windows Job breakaway;
- privileged system changes;
- nondeterministic authentication or fixtures that cannot be established safely.

## 7. Dependency preparation

Record lockfile hash, manager/version, Node major, platform, architecture, command, output, time, and disk usage.

Initial policy:

1. share content-addressed package store where safe;
2. use worktree-local install links/tree;
3. prefer frozen install;
4. prefer offline after known cache population;
5. never share a writable `node_modules` tree between candidates;
6. verify protected paths after install/build.

## 8. Contender sources

MVP accepts one independently prepared contender from branch, commit, worktree, directory snapshot, patch, or valid prior candidate snapshot.

In-run generation and multiple contenders are post-MVP. Any generated source used in MVP is prepared outside the sealed Run and imported as an immutable Source Snapshot.

## 9. Sequential execution

- one active candidate server at a time;
- one active browser process per Capture Epoch;
- fresh browser context per candidate/sample;
- no candidate starts while another candidate server remains active;
- current implementation and contender may reuse verified prepared workspaces across epoch retries when source/workspace hashes remain unchanged.

## 10. Commands and ports

Commands use executable plus argument array. No implicit shell.

```jsonc
{
  "executable": "pnpm",
  "args": ["dev", "--port", "${PORT}", "--strictPort"]
}
```

Port modes:

- strict assigned;
- server assigned and reported;
- external limited mode.

A port lease never proves listener ownership. Native ownership verification follows `spec/04`.

## 11. Readiness

Readiness may combine:

- process alive;
- TCP listener;
- listener ownership;
- HTTP response;
- output pattern;
- Playwright navigation/readiness selector;
- custom fixture command.

Readiness polling occurs inside one candidate attempt and one configured deadline.

## 12. Gate phases

### 12.1 Pre-capture gates

May run before browser evidence:

- source/workspace manifest integrity;
- protected paths and dependency policy;
- dependency preparation;
- build and required nonbrowser tests;
- server launch and listener ownership;
- route readiness prerequisites;
- fixture availability.

A mandatory pre-capture failure stops that Candidate Attempt before aesthetic capture.

### 12.2 Runtime/capture gates

Run while establishing states and interaction:

- route/origin correctness;
- required state setup;
- required selectors/content;
- browser/page exceptions;
- interaction actions and assertions;
- console/network policy;
- font and settle policy;
- blank/login/wrong-route checks.

### 12.3 Post-capture evidence gates

Run after artifact commit:

- capture completeness;
- artifact hash and identity verification;
- accessibility policy;
- responsive integrity;
- DOM/geometry/style evidence checks;
- interaction trace completeness;
- same-epoch/same-fixture validity.

Mandatory failure makes the contender ineligible. The current implementation must remain qualified for `current_retained`; otherwise policy produces `invalid_run` or terminal failure.

## 13. Capture plan

A frozen Capture Plan references:

- Run Configuration;
- route;
- populated/default, empty, and unavailable/error states;
- desktop and mobile viewports;
- one critical interaction sequence;
- fixture identity;
- required artifact classes;
- settle policy;
- retry budget;
- current stability sample count.

Changing it requires a superseding Run.

## 14. Capture Epoch

`CaptureEpochState` is imported from `schemas/domain-types.ts` and lifecycle follows `spec/10`.

One Epoch binds:

- one Chromium process identity;
- browser and Playwright versions;
- fixture and environment hashes;
- Capture Plan;
- start/end timestamps;
- invalidation reasons.

Every artifact used in one Comparison cites the same valid Epoch.

## 15. Browser lifecycle

1. launch one contained Chromium;
2. current stability sample A in fresh context;
3. current stability sample B in fresh context;
4. current comparison matrix in fresh contexts as required;
5. contender comparison matrix in fresh contexts;
6. seal or invalidate Epoch;
7. close Chromium and verify descendants.

No prior-run capture, DOM, accessibility result, or trace enters selection.

## 16. Epoch-wide invalidation

Invalidate the complete active Epoch when comparison continuity is compromised, including:

- Chromium crash or disconnect;
- browser-process identity loss;
- context-isolation leak;
- fixture/environment hash change;
- candidate source mutation during capture;
- Capture Plan mismatch;
- origin/ownership violation affecting trust in the environment;
- required artifact corruption whose scope cannot be isolated safely.

Preserve diagnostics, stop active candidate server, create a new Epoch, and recapture current plus every contender still participating.

Invalid Epoch evidence is diagnostic only and never becomes valid later.

## 17. Candidate-local failures

The following are local unless they reveal wider comparison corruption:

- contender build/readiness failure;
- one page crash while Chromium remains connected;
- one missing required state or selector;
- interaction assertion failure;
- candidate-only console/accessibility regression;
- candidate artifact write failure whose bytes were never registered.

Policy:

1. preserve diagnostics;
2. apply the bounded local retry where allowed;
3. fail or mark that Candidate Attempt ineligible after retry exhaustion;
4. keep valid current captures and browser epoch evidence;
5. proceed to gating when every candidate has either a complete capture set or a terminal local failure result;
6. permit deterministic `current_retained` when the current implementation remains qualified.

A repeated current-implementation local failure produces `invalid_run` or terminal failure; there is no qualified baseline to retain.

## 18. Page crash

When Chromium remains connected:

- preserve crash event and available diagnostics;
- retry once in a fresh context for that Candidate Attempt;
- repeated contender crash makes the contender ineligible;
- repeated current crash invalidates the Run's baseline;
- do not invalidate the entire Epoch solely because one page crashed.

## 19. Retry defaults

- browser launch: 1;
- complete Epoch restarts: frozen bounded policy, reference default 2;
- candidate context/page retry: 1;
- screenshot call before canonical registration: 1 while continuity remains intact;
- port attempts: up to 3 allowed ports;
- build/install: 0 automatic retries unless explicitly classified transient;
- evaluator retries: controlled by `spec/06` and failure matrix.

Every retry creates an attempt record and preserves prior diagnostics.

## 20. Fixture identity

Fixture includes:

- time zone and locale;
- color scheme and reduced motion;
- clock and random policy;
- server-environment hash;
- optional network fixture;
- volatile-region declarations;
- settle policy;
- authentication/seed-state reference when used.

Secrets are references, never fixture plaintext.

## 21. Clock and randomness

Supported clock modes:

- fixed displayed date with real timers;
- installed controlled clock with explicit advancement/pause;
- real time with recorded reason and limitation.

Supported random modes:

- seeded browser `Math.random` before application scripts;
- project fixture;
- uncontrolled with recorded reason.

Do not override cryptographic randomness by default. Server-rendered time/randomness must be fixed, mocked, excluded visibly, or classified unsupported.

Exact Playwright Clock behavior is verified against the pinned release before scaffold acceptance.

## 22. Settle policy

May include load state, selectors, responses, network quiet, controlled clock advancement, animation frames, final delay, and custom fixture step.

Motion is not blindly disabled when completion is part of the required interaction. Policy declares finish, reduce, freeze, or unsupported.

## 23. Volatile regions

A volatile region declares selector, treatment, and reason.

Treatments:

- mask visual;
- exclude text;
- exclude geometry;
- manual review.

Exclusions are visible in reports and evaluator packets.

## 24. Stability probe

Capture the current implementation at least twice in fresh contexts and compare configured screenshot regions, text, DOM, geometry, accessibility, and console evidence.

Two samples detect gross nondeterminism only. Record sample count, observed variance, exclusions, and limitations.

## 25. Evidence matrix and interaction

Minimum:

```text
one route
× populated/default
× empty
× unavailable/error
× desktop
× mobile
+ one critical interaction sequence
```

Interaction action vocabulary and configuration are frozen in the Run Configuration. The trace records ordered actions, assertions, screenshots, resulting state, console/network observations, and final fingerprint.

## 26. Required artifacts

Per state/viewport:

- screenshot;
- DOM summary;
- accessibility snapshot;
- geometry;
- selected computed styles;
- console summary;
- network summary;
- capture metadata;
- fixture and Epoch identity.

Interaction additionally requires action/assertion trace and configured step captures.

## 27. Evidence validation

Verify:

- Run, source, Candidate, Capture Plan, Epoch, fixture, route, state, viewport, and interaction identity;
- nonblank and non-login-redirect result;
- server ownership/capability;
- required artifact registration and hashes;
- current/contender matrix equivalence;
- invalidation/staleness status.

Invalid evidence never enters an evaluator packet.

## 28. Candidate cleanup

After each candidate:

1. close browser context;
2. stop candidate server;
3. verify listener released;
4. finalize logs/resources and Gate Results;
5. preserve or clean workspace according to policy;
6. continue only when cleanup admission allows it.

Cleanup failure remains visible and may block the next workload when ownership is uncertain.

## 29. External server mode

External URL mode is post-MVP/limited:

- no server cleanup claim;
- no listener ownership claim;
- weaker reproducibility classification;
- explicit local-origin/network policy;
- never used for Windows reference acceptance.

## 30. Required tests

- current recaptured in active Run/Epoch;
- prior-run captures rejected;
- browser disconnect invalidates entire Epoch;
- one contender page crash retries locally without invalidating current evidence;
- repeated contender crash leads to deterministic retention path;
- repeated current crash produces invalid baseline outcome;
- fixed/controlled Clock semantics verified;
- seeded randomness stable across contexts;
- visible server nondeterminism detected where sampled;
- volatile exclusions represented;
- listener ownership tied to candidate group;
- three states and critical interaction validated;
- gate scheduler never runs a gate before its required evidence exists;
- source/config change after sealing requires a superseding Run.
