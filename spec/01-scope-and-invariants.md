# 01 — Scope, Vocabulary, Requirements, and Invariants

## 1. Status

This file defines the product boundary and the rules every implementation must preserve.

It separates the quality hypothesis from runtime machinery.

## 2. Product hypothesis

Given a renderable champion and multiple challengers:

1. hard-gate every candidate;
2. collect comparable evidence;
3. evaluate surviving candidates pairwise;
4. preserve the champion when improvement is ambiguous;
5. recommend a challenger only when evidence indicates a material improvement.

The first question is whether this process works. Token efficiency, runtime, and integration breadth are secondary until the quality mechanism demonstrates value.

## 3. Product statement

The Visual Optimization Harness is a local-first acceptance and search layer for frontend changes produced by coding agents.

It does not claim to be a universal designer. It coordinates design strategies, agents, builds, browsers, tests, evidence, judges, and human decisions.

## 4. Primary user

The initial user:

- already has a frontend repository;
- can run it locally;
- uses coding agents;
- wants stronger visual outcomes;
- does not want to manually manage branches, screenshots, comparisons, and rollbacks;
- accepts substantial model usage while proving the method.

## 5. First experiment

The first personal preference-fit experiment is scoped to Justin’s repositories and preferences.

A successful personal experiment does not establish general OSS efficacy.

## 6. Vocabulary

### Champion

The current accepted implementation used as baseline. It is tied to a Git commit or immutable snapshot, buildable, renderable, captured in the current epoch, and eligible for retention.

### Challenger

An alternative implementation derived from the same task and baseline evidence.

### Candidate

Champion or challenger.

### Hard gate

A deterministic or policy condition that can disqualify a candidate before aesthetic selection.

Examples:

- build failure;
- required test failure;
- serious accessibility regression;
- route unavailable;
- required content removed;
- protected file modified;
- repeated candidate page crash;
- listener not owned by candidate group.

### Protected regression

A material loss a visual improvement cannot offset.

Examples:

- primary workflow becomes harder;
- required state disappears;
- content becomes obscured;
- keyboard access regresses;
- fabricated information appears;
- functional tests fail;
- responsive behavior breaks.

### Evidence bundle

Canonical files collected for one candidate in one run.

### Capture epoch

Captures produced by one browser process under one fixture hash and browser version.

### Promotion

A selector recommendation that a challenger replace the champion. During exploratory phases it is a recommendation only.

### Retention

The champion remains preferred.

### Escalation

Human judgment is required because automated evidence is insufficient or unstable.

### Opportunity rate

Proportion of candidate sets containing a human-preferred challenger.

### Selector uplift

Quality advantage over random eligible selection using the same artifacts.

## 7. Product modes

### Exploratory personal

Determine whether the approach helps the owner’s projects and expose obvious selector failure. No safety claim.

### External exploratory

Test unfamiliar tasks with outside raters and less owner steering.

### Confirmatory benchmark

Freeze protocol and thresholds, then use new tasks and raters in a reproducible environment.

### Product mode

Ordinary repository use. Not part of the first scaffold.

## 8. Functional requirements

### FR-001 — Baseline qualification

Refuse visual optimization until a buildable, renderable baseline exists.

### FR-002 — Baseline recovery

Broken baseline enters a separate recovery state. Recovery uses a separate patch, avoids visual redesign, preserves failure evidence, and requires acceptance before champion status.

### FR-003 — Candidate isolation

Each challenger has an isolated worktree or equivalent immutable workspace.

### FR-004 — Workspace materialization

Required ignored or untracked state is declared and materialized explicitly.

### FR-005 — Exact runtime

Coordinator runs under the exact Node executable used by the npm bootstrap.

### FR-006 — Session containment

Record containment capability for every session.

### FR-007 — Sequential default

First scheduler executes one candidate workload at a time.

### FR-008 — Same-run recapture

Champion is recaptured in every selection run.

### FR-009 — Same-epoch evidence

One comparison cannot mix capture epochs.

### FR-010 — State matrix

First meaningful route includes multiple data states and at least one interaction sequence.

### FR-011 — Hard gates first

Do not run aesthetic selection on mandatory hard-gate failures.

### FR-012 — Pairwise evaluation

Compare candidates pairwise rather than use one universal design score.

### FR-013 — Order reversal

Support reversed candidate ordering for model judges.

### FR-014 — Ties

Support tie and insufficient-evidence outcomes.

### FR-015 — Random control

Compute expected random eligible-selection result from the same candidates.

### FR-016 — Retention control

Include an always-retain-champion control.

### FR-017 — Oracle ceiling

Calculate human-preferred best eligible candidate after ratings.

### FR-018 — Usage accounting

Record generation, critique, selection, tie-break, human, runtime, and local resources separately.

### FR-019 — Canonical files

Artifacts remain readable without a database.

### FR-020 — Crash recovery

Coordinator crash leaves enough evidence to classify the run and clean contained processes.

### FR-021 — Explicit cleanup result

Cleanup lists remaining processes, ports, worktrees, and temp paths.

### FR-022 — Secure IPC

Only the expected coordinator may connect to the supervisor endpoint.

### FR-023 — Console isolation

Third-party supervised processes do not receive user Ctrl+C directly.

### FR-024 — Exact executable arguments

Supervisor accepts executable plus argument array, not shell command strings.

### FR-025 — Port ownership

Verify candidate listener belongs to candidate containment group when supported.

### FR-026 — Browser invalidation

Browser disconnect invalidates complete capture epoch.

### FR-027 — Stability probe

Capture champion more than once to detect gross uncontrolled variation.

### FR-028 — Stability honesty

Passing probe is not proof of determinism.

### FR-029 — Project secrets

Secrets do not enter judge packets, patches, exported evidence, or normal logs.

### FR-030 — No automatic merge

Exploratory implementation never modifies accepted branch automatically.

## 9. Nonfunctional requirements

### NFR-001 — Local-first storage

Code, worktrees, screenshots, logs, preferences, and reports remain local unless a configured cloud model receives a declared payload.

### NFR-002 — Auditable decisions

Each recommendation identifies candidates, gates, judge evidence, order result, human override, and usage.

### NFR-003 — Failure transparency

Unsupported repository classes and unavailable capabilities fail explicitly.

### NFR-004 — Small-core maintainability

Avoid distributed infrastructure and generic workflow frameworks.

### NFR-005 — Reproducible benchmark

Published benchmarks pin runtime, browser, fonts, locale, timezone, fixtures, and dependencies.

### NFR-006 — Native usability

Ordinary experiments do not require Docker.

### NFR-007 — Platform honesty

UI and manifests expose actual containment level.

### NFR-008 — Vendor uncertainty

Vendor usage assumptions include dated policy snapshot.

### NFR-009 — Output durability

Drain process output continuously and preserve per process.

### NFR-010 — Resource admission

Do not start workloads when local admission fails.

## 10. Core invariants

### INV-001 — Rust terminal authority

Rust alone interprets user terminal interrupt as session shutdown.

### INV-002 — Exact Node executable

Rust launches coordinator using canonical Node path supplied by bootstrap.

### INV-003 — No secret argv

Endpoint and nonce never appear in coordinator argv.

### INV-004 — Coordinator isolation

Coordinator does not share user interactive console on Windows.

### INV-005 — Child console isolation

Build tools, servers, agents, and judges do not share user interactive console.

### INV-006 — Candidate group ownership

Every supervised candidate process belongs to a declared containment group.

### INV-007 — Same-epoch comparison

Selector packet cannot contain mixed epoch evidence.

### INV-008 — Same fixture

Compared candidates share fixture hash.

### INV-009 — Champion recapture

Cached champion screenshots from another run are forbidden for selection.

### INV-010 — Hard-gate veto

Mandatory gate failure cannot be promoted.

### INV-011 — Ambiguity retains

Ambiguous automation retains or escalates.

### INV-012 — Human decisions explicit

Human decision stores rationale or structured dimensions.

### INV-013 — Files canonical

Deleting an index cannot delete canonical history.

### INV-014 — Raw provider preservation

Normalized events never replace raw provider events.

### INV-015 — Unknown usage remains unknown

Missing token/cost data is `null`, never silently estimated.

### INV-016 — Sequential first

At most one active candidate server and capture browser initially.

### INV-017 — Browser crash restarts epoch

No pre-disconnect capture is reused.

### INV-018 — Measured containment

Do not infer strong containment from platform name.

### INV-019 — Linux strong probe

Strong mode requires delegated subtree and usable `cgroup.kill`.

### INV-020 — Stability sampled

Stability probe is evidence, not guarantee.

## 11. Quality-first policy

Token use is not an early kill criterion. The system may use multiple strategies, critics, order reversals, tie breaks, refinement, and human review. Usage is recorded from the first run.

## 12. Experiment conditions

- A: base agent.
- B: Impeccable or another strong design skill.
- C: linear rendered critique and repair.
- D: champion–challenger selection.
- E1: expected random eligible selection.
- E2: always retain champion.
- Oracle: human-preferred best eligible candidate.

## 13. Existential metrics

- opportunity rate;
- automatic promotion rate;
- correct-promotion count;
- false-promotion count;
- promotion recall;
- correct-retention count;
- escalation rate;
- human ambiguity;
- order-reversal stability;
- uplift over random;
- uplift over retention;
- oracle gap;
- D versus C;
- functional preservation.

## 14. Interpretation limits

A small study can expose frequent false promotion, inertia, escalation, failure against linear refinement, or operational instability. It cannot certify a production false-promotion rate.

## 15. First platform and scope

Reference platform:

- Windows 10/11 strong Job Object mode.

First repository scope:

- one repository;
- one meaningful route;
- three states;
- mobile and desktop;
- one interaction;
- manually prepared candidate branches permitted;
- one agent adapter optional.

Execution scope:

- one workload at a time;
- one Chromium per valid epoch;
- recommendation only;
- filesystem artifacts only.

## 16. Explicitly unsupported in v0

- automatic merging;
- unknown untracked state;
- nonisolatable machine-global services;
- Windows process breakaway requirements;
- strong native macOS claims;
- unbounded parallelism;
- cross-run champion evidence;
- judge claims without cited evidence.

## 17. Open items

- `OPEN-001`: choose first experiment route.
- `OPEN-002`: define protected-file policy.
- `OPEN-003`: define human comparison UI.
- `OPEN-004`: choose challenger strategies.
- `OPEN-005`: choose judge ensemble.
- `OPEN-006`: define first fixed-time/server fixture.
