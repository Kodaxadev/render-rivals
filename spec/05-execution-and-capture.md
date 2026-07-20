# 05 — Repository Preparation, Execution Pipeline, Capture Epochs, and Determinism

## 1. Pipeline

```text
doctor
→ repository qualification
→ baseline recovery if required
→ champion snapshot
→ challenger preparation
→ workspace materialization
→ dependency preparation
→ hard gates
→ capture epoch
→ evidence validation
→ pairwise evaluation
→ recommendation
→ cleanup
```

## 2. Doctor

Checks:

- Git;
- repository status;
- package manager;
- exact Node;
- containment;
- Playwright browser;
- required untracked state;
- ports;
- free disk;
- baseline commands;
- fixture config;
- secret declarations.

Produces machine-readable report.

## 3. Repository qualification

Qualified when source root, Git state, dependencies, build, server, route, and fixture are available.

## 4. Baseline recovery

Broken baseline pauses optimization. Recovery may repair dependency command, restore generated artifacts, fix non-design compile error, or create required fixture.

Recovery patch is separate. No challengers before acceptance.

## 5. Champion identity

```ts
interface ChampionIdentity {
  repositoryId: string;
  commit: string;
  dirtyPatchHash: string | null;
  workspaceManifestHash: string;
  configurationHash: string;
}
```

Dirty repositories require explicit snapshot policy.

## 6. Worktree layout

```text
<cache>/visual-optimizer/worktrees/<project-hash>/<run-id>/
  champion/
  challenger-a/
  challenger-b/
```

Never inside target repository.

## 7. Workspace materialization

Git worktrees omit ignored/untracked state.

```ts
type MaterializationMode =
  | "copy"
  | "snapshot"
  | "symlink_readonly"
  | "generate"
  | "env";
```

```ts
interface WorkspaceMaterial {
  source?: string;
  target?: string;
  mode: MaterializationMode;
  secret: boolean;
  mutable: boolean;
  required: boolean;
}
```

## 8. Material modes

- `copy`: ordinary copy.
- `snapshot`: isolated writable copy/reflink.
- `symlink_readonly`: declared immutable share.
- `generate`: configured prep command.
- `env`: inject value only.

## 9. Secret material

Secrets excluded from evidence, patches, judge packets, and exports; redacted from logs; removed during cleanup; restrictive permissions where possible.

## 10. Unsupported repo classes

May reject:

- unknown ignored state;
- singleton mutable database not cloneable;
- manual desktop app;
- machine-global side effect;
- undocumented external service;
- Windows breakaway requirement;
- privileged system change.

## 11. Dependency preparation

Hash lockfile, manager/version, Node major, platform, architecture.

Share content-addressed store, not writable `node_modules` tree.

Initial policy:

1. populate store;
2. frozen worktree-local install;
3. prefer offline after population;
4. record time and disk;
5. reuse worktree for later passes.

## 12. Candidate generation

May initially be manual. First selector experiment can receive prebuilt branches.

This tests curated candidates, not autonomous-generator safety.

## 13. Sequential rule

One active candidate build, server, browser, and capture context at a time.

## 14. Port allocation

Server profile declares strict assigned, server assigned, or external.

Strict assigned uses range, strict port behavior, ownership verification, and retry.

## 15. Server command

Executable and args, no implicit shell:

```jsonc
{
  "executable": "pnpm",
  "args": ["dev", "--port", "${PORT}", "--strictPort"]
}
```

## 16. Readiness

May combine listener, ownership, output, HTTP, Playwright, and custom command. Health endpoint optional.

## 17. Hard gates

Before visual capture:

- build;
- tests;
- protected files;
- serious accessibility;
- server readiness;
- route availability;
- state setup;
- console policy.

Mandatory failure makes candidate ineligible.

## 18. Capture epoch

```ts
interface CaptureEpoch {
  epochId: string;
  browserName: "chromium";
  browserVersion: string;
  browserProcessIdentity: string;
  playwrightVersion: string;
  fixtureHash: string;
  startedAt: string;
  status:
    | "active"
    | "completed"
    | "invalid_browser_disconnect"
    | "invalid_fixture_change"
    | "invalid_environment_change";
}
```

## 19. Same-epoch invariant

Every selector artifact has same epoch ID.

## 20. Browser lifecycle

1. Launch one Chromium.
2. Fresh context for champion stability A.
3. Close.
4. Fresh context for champion stability B.
5. Close.
6. Champion comparison capture.
7. Close.
8. Each challenger in fresh context.
9. Close all.
10. Close Chromium.
11. Complete epoch.

## 21. Champion recapture

No prior-run screenshot, DOM, accessibility result, or trace is accepted for selection.

## 22. Browser disconnect

1. Invalidate epoch.
2. Preserve diagnostics.
3. Stop active server.
4. Launch new browser.
5. Create new epoch.
6. Recapture champion.
7. Recapture all challengers.

No failed-epoch evidence participates.

## 23. Page crash

If browser connected, retry candidate once in fresh context. Preserve crash. Repeated crash fails capture.

## 24. Retry defaults

- epoch restarts: 2;
- candidate context retry: 1;
- port/readiness retries: bounded.

## 25. Fixture identity

```ts
interface CaptureFixture {
  fixtureId: string;
  timezoneId: string;
  locale: string;
  colorScheme: "light" | "dark";
  reducedMotion: "reduce" | "no-preference";
  clock: ClockFixture;
  random: RandomFixture;
  serverEnvironment: Record<string, string>;
  networkFixtureId?: string;
  volatileRegions: VolatileRegion[];
  settle: SettlePolicy;
}
```

## 26. Clock modes

```ts
type ClockFixture =
  | { mode: "fixed_date"; instant: string }
  | {
      mode: "installed_controlled";
      startInstant: string;
      pauseAt?: string;
      runForMsBeforeCapture?: number;
    }
  | { mode: "real_time"; reason: string };
```

## 27. Fixed-date mode

For fixed displayed Date with naturally running timers. Verify exact Playwright behavior at scaffold.

## 28. Installed-controlled mode

For controlled timer advancement and pausing. Install before app clock use.

## 29. Settle policy

```ts
interface SettlePolicy {
  waitForLoadState?: "domcontentloaded" | "load";
  waitForSelectors?: string[];
  waitForResponses?: string[];
  quietNetworkMs?: number;
  runClockForMs?: number;
  animationFrames?: number;
  finalDelayMs?: number;
  customFixtureStep?: string;
}
```

Some pages need timers to finish; others must freeze. It is explicit.

## 30. Random fixture

```ts
type RandomFixture =
  | { mode: "seed_math_random"; seed: string }
  | { mode: "project_fixture"; fixtureId: string }
  | { mode: "uncontrolled"; reason: string };
```

Seed browser `Math.random` before scripts. Do not override crypto randomness by default.

## 31. Server time/randomness

Playwright cannot generically control server-rendered time, IDs, ordering, or random API responses.

Project must fix, mock, exclude, or be marked unsupported.

## 32. Volatile regions

```ts
interface VolatileRegion {
  selector: string;
  treatment:
    | "mask_visual"
    | "exclude_text"
    | "exclude_geometry"
    | "manual_review";
  reason: string;
}
```

Exclusions are visible in report.

## 33. Stability probe

Capture champion at least twice in fresh contexts and compare screenshot regions, text, DOM, geometry, accessibility, and console.

## 34. Stability limitation

Two captures detect gross nondeterminism only. A one-in-five flake can pass.

Manifest records sample count, observed variance, exclusions, and classification.

Initial sample count is 2; later configurable.

## 35. Evidence matrix

Initial minimum:

```text
one route
× populated/default
× empty
× error/unavailable
× mobile
× desktop
+ one interaction sequence
```

## 36. Interaction trace

Records actions, screenshots, assertions, resulting state, console errors, and network errors.

## 37. Capture artifacts

Per state/viewport:

- screenshot;
- DOM summary;
- accessibility snapshot;
- element geometry;
- computed styles sample;
- console log;
- network summary;
- fixture identity;
- epoch identity.

## 38. Accessibility

Automated checks inform gates but do not prove complete accessibility.

## 39. Evidence validation

Check same epoch, same fixture, route, state, nonblank screenshot, no login redirect, viewport, server ownership, hashes.

Invalid/blank capture never reaches visual judge.

## 40. Cleanup per candidate

1. Close context.
2. Stop server.
3. Verify listener released.
4. Finalize logs/resources.
5. Retain worktree for evaluation.
6. Continue.

## 41. External server mode

User-managed URL; no server cleanup or ownership guarantee; weaker reproducibility flag.

## 42. Failure classes

- baseline unrenderable;
- build failed;
- tests failed;
- server not ready;
- listener not owned;
- fixture failed;
- blank capture;
- page crashed;
- browser disconnected;
- unstable baseline;
- uncontrolled volatile content;
- cleanup failed.

## 43. Tests

- `CAP-001`: champion has current run ID.
- `CAP-002`: cached champion rejected.
- `CAP-003`: browser disconnect invalidates all.
- `CAP-004`: page crash retries locally.
- `CAP-005`: fixed-date semantics verified for pinned Playwright.
- `CAP-006`: installed-controlled semantics verified.
- `CAP-007`: seeded random stable across contexts.
- `CAP-008`: visible server nondeterminism detected where sampled.
- `CAP-009`: volatile masking represented.
- `CAP-010`: listener owner is candidate group.
- `CAP-011`: three states validated.
- `CAP-012`: interaction replayable.
- `CAP-013`: stability report states limitations.

## 44. Scaffold verification

Against exact Playwright version verify:

- `setFixedTime`;
- install ordering;
- `pauseAt`;
- `runFor`;
- browser disconnect event;
- context isolation;
- service-worker cleanup;
- init-script ordering.
