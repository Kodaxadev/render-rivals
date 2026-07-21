# Render Rivals Product UI and Scene Plan

**Status:** Implementation-facing product plan  
**Surface:** Local browser application served by the coordinator  
**MVP contract:** `docs/MVP-VERTICAL-SLICE.md`  
**Commands/API:** `spec/13-configuration-cli-and-local-api-contracts.md`  
**Pre-authentication route:** `docs/DASHBOARD-PAIRING-ROUTE.md` and spec16  
**Authenticated route geometry:** `docs/ROUTE-LEVEL-WIREFRAME-SPEC.md`

## 1. Purpose and route scope

This document defines authenticated product scenes and feature availability. It does not authorize commands outside domain, state, API, security, or recovery contracts.

The exact route inventory in section 17 is **authenticated-only**. `/session/pair` is the sole pre-authentication browser route and is intentionally governed separately by `docs/DASHBOARD-PAIRING-ROUTE.md` and spec16.

Every scene or control is conceptually:

- **MVP enabled:** implemented and acceptance-tested;
- **Read-only:** visible data with no mutation;
- **Conditional:** shown only when durable state and capability permit it;
- **Post-MVP:** hidden or visibly disabled in MVP builds.

The wireframe specification owns exact authenticated route decomposition. This document owns product meaning and availability.

## 2. Product principles

Render Rivals is a precise local development instrument, not an esports product or autonomous design casino.

The UI is:

- evidence-first;
- explicit about uncertainty and invalidity;
- accessible without red/green-only meaning;
- clear about local data and external evaluator transmission;
- explicit about destructive and source-affecting operations;
- honest about containment, network-egress, cleanup, and migration capability;
- usable in light/dark themes and compact laptop windows.

Canonical language:

- Current implementation;
- Contender;
- Candidate;
- Run;
- Capture;
- Evidence;
- Recommendation;
- User Decision;
- Promotion;
- Export Operation.

Avoid champion/challenger/winner/battle as stable labels and avoid trophies, crowns, crossed weapons, glowing VS, and arena staging.

## 3. Global shell

### MVP enabled navigation

- Home;
- Projects;
- Runs;
- Artifacts;
- Diagnostics;
- Settings.

### Post-MVP navigation

- Rule Sets, until reusable rule-set entities/editing are implemented and schema-backed.

### Context bar

Shows current Project, Source Snapshot, active Run, runtime health, containment and egress capability, storage state, command palette, and help.

### Run navigation

- Overview;
- Contenders;
- Compare;
- Evidence;
- Decision;
- Timeline.

Preparation and Capture are operational routes linked from Overview, not permanent top-level tabs.

### Global overlays

MVP:

- activity drawer;
- runtime logs;
- destructive confirmation;
- unsaved draft warning;
- runtime-health details;
- help/shortcuts.

Post-MVP:

- extensible command-palette actions beyond existing legal commands.

## 4. Pairing, launch, onboarding, and safe mode

### Pairing

The user manually opens the randomized `.localhost` Session origin and enters the one-time terminal code. No product shell or Project data is available before pairing succeeds.

### Launch

Shows actual operations:

- verify native package;
- start supervisor;
- authenticate coordinator;
- open data root;
- verify component/schema compatibility;
- verify browser runtime;
- assess interrupted Runs and Operations;
- start randomized-host local dashboard;
- print pairing origin and code.

Failure shows exact code, operation, logs, retry when legal, and installation diagnostics. The UI never claims startup or migration success until canonical content is re-read and verified.

### Safe mode

**Conditional.** Available only after supervisor and coordinator authenticate.

Permits:

- read-only Project/Run/Artifact inspection;
- integrity and recovery assessment;
- verified cleanup;
- sanitized diagnostic Export Operation;
- migration/compatibility diagnostics.

Prohibits Project commands, browser/evaluator execution, source/workspace mutation, new Runs, unsafe Promotion, and unsupported schema mutation.

Native package, endpoint, or authentication failure cannot offer safe mode.

### First-run onboarding

MVP steps:

1. product/local execution explanation;
2. project-command trust and data access;
3. runtime/containment/storage check;
4. data-root and retention setup;
5. setup complete.

Results use Ready, Limited, or Blocked—not one opaque score.

## 5. Home

MVP shows:

- recent Projects;
- interrupted Runs or Operations;
- Runs awaiting Decision;
- recent Promotions;
- recent Export Operations;
- runtime/storage health;
- actionable warnings.

Primary action: Open Project.

Empty state offers Open Project, sample fixture, and workflow documentation.

## 6. Project lifecycle

### Open/inspect Project

MVP detects and shows:

- canonical root and nested-repository ambiguity;
- Git status/commit/branch;
- package manager/lockfile/framework hints;
- install/build/development commands;
- default URL/route;
- existing marker/config;
- trust state;
- storage/capability risks.

Detection never overwrites configuration.

### Project configuration

MVP sections:

- Commands;
- Environment and Session-only secret references;
- Routes and fixture states;
- Viewports and interaction;
- Source policy/protected paths;
- Artifact/retention policy;
- Runtime limits;
- Privacy/evaluator transmission and network-egress capability;
- Danger zone.

Exact filenames and precedence come from spec13.

### Remove Project

Choices:

- remove registration only;
- move owned Render Rivals data to trash after explicit confirmation.

Never imply source deletion or secure wipe.

## 7. New Run wizard

The wizard uses persistent steps and creates a draft. Validation seals immutable configuration.

### Intent

**MVP enabled:** Compare existing implementations.

**Post-MVP:** Generate contenders, combined generation/import, and tournament/round modes.

**Re-evaluate prior decision:** creates a new draft Run from selected prior configuration/provenance and must recapture all selectable evidence.

Fields: name, objective, task/design brief, success criteria.

### Scope

**MVP enabled:** one configured route, three required states, two viewports, one critical interaction.

**Post-MVP:** entire application, component/section-only capture as independent scope types, arbitrary responsive sequences, multi-route Runs.

Authentication is allowed only through deterministic Session-bound fixture references; interactive login recording is post-MVP.

### Current implementation

Select immutable Source Snapshot or explicit working-tree snapshot. Show commit/dirty patch, staleness, route preview, and warning that it will be recaptured.

### Contender

**MVP enabled:** exactly one from branch, commit, worktree, folder snapshot, patch, or valid previous Candidate snapshot.

**Post-MVP:** generated contender, manual external URL as reference-equivalent Candidate, duplicate-and-live-edit, multiple contenders.

### Environment

MVP defaults desktop/mobile, one theme, locale, time zone, reduced motion, deterministic data/clock/random policy, Service Worker policy, and declared egress capability. Show capture/artifact estimate.

Tablet, multiple themes/locales, and matrix explosion controls are post-MVP.

### Gates

MVP shows phase and dependencies:

- pre-capture source/dependency/build/readiness;
- runtime route/state/interaction/console/network;
- post-capture completeness/accessibility/responsive/integrity.

A Gate cannot be enabled when its required evidence/capability is unavailable.

### Evaluation

MVP factor set comes from frozen contract. Each factor shows definition, weight, evidence, confidence, missing-data, tie, and protected status.

Changing Gates/Factors after validation creates a superseding Run; it never mutates the sealed Run.

### Limits and review

Show resource/time/output/retry limits, capability enforcement, capture/storage estimate, risks, secret references, external evaluator data flow, and validation status.

Actions: Back, Save Template, Validate/Start.

## 8. Active Run

### Overview

Shows durable state/checkpoint, current Operation, Candidate Attempt, Capture Epoch, browser/process/resources, warnings, and next legal action.

MVP actions:

- Cancel;
- Open Logs;
- Retry current legal Operation;
- Perform permitted recovery action;
- Hide/freeze live preview rendering.

**No MVP Pause command.** Hiding preview does not pause execution.

### Preparation

Shows Workspace, dependencies, build/test Gates, launch, listener ownership, readiness, and exact retry availability.

### Capture

Shows Candidate, state, viewport, interaction step, Epoch/browser identity, Artifact commit progress, and immediate invalidation banner.

A visible preview is never represented as valid evidence until committed and verified.

### Timeline and logs

Timeline derives from canonical Events. Logs expose Supervisor, Coordinator, Dependency/Build/Test, Application, Browser, Evaluator, Git/Export, and System streams.

Raw logs are sensitive local data; exporting them creates a redacted Export Operation.

## 9. Contenders

### Gallery/detail

MVP has current plus one Contender but uses scalable list/card components.

Shows stable ID, source, Attempt, eligibility, Gates, capture completeness, source-change summary, and failure.

No winner styling before Recommendation.

### Actions

- Retry: creates a new Candidate Attempt only when sealed inputs remain identical and policy permits it.
- Revise source/configuration: creates a superseding Run.
- Exclude: unavailable as arbitrary post-seal mutation; exclusion is presealed policy or terminal eligibility result.
- Open Workspace: read-only/external inspection, with stale warning.

### Capture/Gate/Source views

Show registered Artifacts, hashes, validity, phase, retry history, evidence links, and source changes. This is inspection, not editing.

## 10. Comparison and Evidence

### MVP comparison mode

- side-by-side desktop/mobile/state/interaction-step comparison;
- synchronized scroll/zoom where technically reliable;
- explicit current/Contender labels;
- validity and limitation indicators;
- cited Evidence rail.

### Conditional/P1

- simple overlay if it does not delay required MVP;
- interaction replay navigator beyond step-by-step static capture;
- responsive sequence.

### Post-MVP

- pixel/difference workspace as an authored analysis mode;
- flicker mode;
- annotation authoring/pins;
- region issue collaboration;
- tournament rounds/pair queue.

Difference diagnostics never equal quality judgment.

### Evidence

Show factor verdict, confidence/null, citations, limitations, conflicts, protected regressions, eligibility, provenance, evaluator/order-reversal Attempts, and missing evidence.

Actions:

- rerun identical failed/missing Operation when legal;
- create superseding Run to change factor, Gate, viewport, interaction, or policy;
- request human review;
- export report/evidence through Export Operation.

There is no post-seal “exclude factor and continue” mutation.

## 11. Decision, Promotion, and Export

### Decision states

- contender recommended;
- current retained/no material improvement;
- tie;
- human review required;
- invalid Run.

Show supporting and contrary evidence, limitations, source changes, Gates, staleness, and suggested verification.

### User Decision

Actions map exactly to canonical actions. One-contender MVP does not expose select-other.

### Promotion

Only after nonstale authorizing Decision and selected eligible Contender:

- export patch;
- create local branch;
- preserve Workspace.

Promotion never means report, mark recommended, merge, push, checkout over active tree, or deployment.

### Export Operation

Available according to integrity/redaction policy, independent of contender adoption:

- report;
- diagnostics;
- Run/evidence bundle;
- screenshots;
- configuration template;
- selected logs.

No-winner/tie/invalid/failed/cancelled Runs may export reports/diagnostics safely.

## 12. History, Artifacts, retention, and migration

MVP:

- Run history;
- completed/interrupted Run reconstruction;
- Artifact explorer/detail;
- Promotion history;
- Export Operation history;
- storage usage, trash, restore, and purge;
- component/schema compatibility and migration status.

Historical comparison across Runs is P1 and never reuses historical Captures as current selectable evidence.

Cleanup schedules run only while Render Rivals is active or at startup/explicit command; no hidden background daemon is assumed.

## 13. Diagnostics and Settings

### Diagnostics

MVP covers component versions, Session, containment, managed processes/groups, ports/listeners, browser/Epoch, network-egress capability, storage/integrity, recent failures, cleanup incidents, migration state, and diagnostic export.

Process views show PID as observation plus stable Process Record/group identity.

### Settings

MVP routes and sections:

- general;
- appearance;
- runtime;
- containment;
- capture defaults;
- evaluator configuration;
- storage/retention;
- privacy/security;
- about/license/data location.

Post-MVP:

- integration marketplace;
- Figma/team/cloud;
- update channels beyond documented manual/package update flow;
- notification service outside active application.

## 14. Required page states

Every applicable route defines:

- loading with named Operation;
- empty;
- partial/incomplete;
- failure with stable code;
- recovery with only legal action;
- stale sealed inputs;
- safe-mode/read-only;
- restricted capability;
- disconnected UI/SSE recovery;
- cleanup incident;
- migration/read-only compatibility state where applicable.

Offline/local mode remains useful unless an explicitly selected external evaluator requires network.

## 15. Responsive behavior

Desktop-first local browser app:

- standard >=1200px;
- compact 960–1199px;
- restricted compact below 960px for comparison-heavy routes.

Sidebar collapses before content. Secondary rails become drawers. Evidence matrices may scroll horizontally. Side-by-side may stack while preserving A/B labels and synchronized-position indicator.

## 16. MVP priority

### P0

- pairing, launch, onboarding, safe mode;
- Home;
- Project register/configure/health;
- existing-implementation Run wizard;
- Overview/Preparation/Capture;
- Contender detail;
- side-by-side comparison;
- Gate/Evidence detail;
- Recommendation/User Decision;
- Promotion patch/branch/workspace;
- report/diagnostic Export Operation;
- history/Artifacts;
- diagnostics/core settings.

### P1

- optional overlay;
- richer interaction replay;
- responsive sequence;
- conflicting-evidence workflow;
- storage cleanup UX refinements;
- historical comparison;
- reusable Rule Sets after domain/schema implementation.

### P2

- in-Run generation;
- multiple Contenders/rounds;
- annotations/collaboration;
- CI/PR integration;
- cloud/remote workers;
- Figma;
- scheduled/background evaluations.

## 17. Authenticated MVP route inventory

The following routes require a paired Session. `/session/pair` is intentionally excluded and defined in the pairing-route contract.

```text
/launch
/onboarding/welcome
/onboarding/permissions
/onboarding/runtime
/onboarding/storage
/onboarding/complete
/
/projects
/projects/open
/projects/:projectId
/projects/:projectId/health
/projects/:projectId/settings
/projects/:projectId/remove
/projects/:projectId/runs/new/intent
/projects/:projectId/runs/new/scope
/projects/:projectId/runs/new/baseline
/projects/:projectId/runs/new/contenders
/projects/:projectId/runs/new/environment
/projects/:projectId/runs/new/gates
/projects/:projectId/runs/new/evaluation
/projects/:projectId/runs/new/limits
/projects/:projectId/runs/new/review
/runs
/runs/:runId/overview
/runs/:runId/preparation
/runs/:runId/capture
/runs/:runId/contenders
/runs/:runId/contenders/:candidateId
/runs/:runId/contenders/:candidateId/source
/runs/:runId/contenders/:candidateId/captures
/runs/:runId/contenders/:candidateId/gates
/runs/:runId/compare
/runs/:runId/compare/side-by-side
/runs/:runId/evidence
/runs/:runId/evidence/:factorId
/runs/:runId/decision
/runs/:runId/timeline
/artifacts
/artifacts/:artifactId
/promotions/:promotionId
/exports/:exportOperationId
/diagnostics
/diagnostics/processes
/diagnostics/ports
/diagnostics/browser
/diagnostics/storage
/settings/general
/settings/appearance
/settings/runtime
/settings/containment
/settings/capture
/settings/evaluators
/settings/storage
/settings/privacy
/settings/about
```

Post-MVP routes such as generation, Rule Sets, rounds, annotations, integrations, notifications, updates, and overlay/difference/flicker are not registered in the MVP router.
