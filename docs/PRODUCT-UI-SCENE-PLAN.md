# Render Rivals Product UI and Scene Plan

**Status:** Product-planning baseline  
**Surface:** Local desktop application  
**Purpose:** Define every route, workflow scene, persistent shell element, overlay, and required state before wireframing or implementation.

## Product principles

Render Rivals is a precise local development instrument, not an esports product or autonomous design casino.

The product UI should be:

- competitive without aggression;
- analytical without becoming clinical;
- technical without obscuring meaning;
- quiet enough for long work sessions;
- explicit about evidence, uncertainty, and destructive actions;
- usable in light and dark themes;
- accessible without relying on red/green distinctions.

Preferred product language:

- Current
- Contender
- Candidate
- Comparison
- Evidence
- Promotion
- Run
- Round
- Capture
- Decision

Avoid trophies, crowns, crossed weapons, arena staging, glowing `VS` graphics, and other sports-game metaphors inside the application.

---

# 1. Application shell

## 1.1 Global sidebar

Primary destinations:

- Home
- Projects
- Runs
- Rule Sets
- Artifacts
- Diagnostics
- Settings

The active project and run belong in the context bar rather than permanently expanding the sidebar.

## 1.2 Top context bar

Shows:

- current project;
- Git branch or source snapshot;
- active run;
- runtime health;
- containment capability;
- artifact-storage state;
- command-palette trigger;
- help menu.

## 1.3 Active-run navigation

When a run is selected:

- Overview
- Contenders
- Compare
- Evidence
- Decision
- Timeline

## 1.4 Global overlays

- Command palette
- Activity drawer
- Runtime-log drawer
- Help panel
- Keyboard-shortcut panel
- Destructive-action confirmation
- Unsaved-configuration warning
- Runtime-health details

---

# 2. Launch and onboarding

## 2.1 Launch screen

Communicates actual startup work:

- starting the native supervisor;
- opening the local data directory;
- verifying browser runtime;
- restoring the previous session;
- recovering an interrupted run.

States:

- initializing;
- taking longer than expected;
- safe-mode available;
- startup failed;
- recovery available.

## 2.2 First-run welcome

Core message: Render Rivals runs locally, captures comparable evidence, and never promotes silently.

Actions:

- Set up Render Rivals
- Open documentation
- Exit

## 2.3 Local access and permissions

Explain access to:

- project directories;
- temporary build processes;
- browser automation;
- local ports;
- artifact storage.

For each permission, explain why it is needed, what can be accessed, what is excluded, and where data is written.

## 2.4 Runtime compatibility check

Checks:

- operating system;
- Node runtime;
- browser availability;
- native supervisor;
- Git availability;
- available storage;
- local port allocation;
- project-directory permissions;
- process-containment capability.

Results are labeled `Ready`, `Limited`, or `Blocked`; do not collapse them into one opaque health score.

## 2.5 Containment capability

Detected modes:

- Strong containment
- Limited containment
- Best effort

The page must state the exact enforcement available and the consequences of missing capabilities.

## 2.6 Storage setup

Configure:

- artifact directory;
- maximum retained storage;
- cleanup threshold;
- screenshot retention;
- build-output retention;
- log retention.

## 2.7 Setup complete

Actions:

- Open a project
- Explore a sample project
- Read the workflow guide

---

# 3. Home and workspace

## 3.1 Home dashboard

Shows:

- recent projects;
- interrupted runs;
- runs awaiting decisions;
- recent promotions;
- runtime health;
- disk usage;
- actionable warnings.

Primary action: `Open project`.

## 3.2 Empty home

Shows:

- Open local project
- Try sample project
- Import Render Rivals configuration

Include a compact workflow diagram:

`Current implementation -> contenders -> comparable captures -> evidence -> decision`

## 3.3 Recent activity drawer

Chronological events linking to their source:

- project opened;
- run created;
- capture completed;
- candidate invalidated;
- evidence generated;
- promotion approved;
- artifacts exported;
- runtime warning.

---

# 4. Project lifecycle

## 4.1 Open project

File-system selection with:

- recent locations;
- framework detection;
- package-manager detection;
- Git status;
- existing Render Rivals configuration.

Warnings:

- uncommitted changes;
- unsupported framework;
- nested repository;
- very large workspace;
- missing build command.

## 4.2 Project inspection

Pre-import summary:

- project name;
- framework;
- package manager;
- detected scripts;
- application entry point;
- development command;
- build command;
- default URL;
- Git branch and commit;
- existing configuration.

Actions: accept detection, edit setup, cancel.

## 4.3 Project configuration

Configure:

- install command;
- build command;
- development command;
- expected local URL;
- startup timeout;
- working directory;
- environment-file policy;
- allowed ports;
- ignored paths;
- artifact path.

## 4.4 Project overview

Shows:

- project identity;
- current source snapshot;
- last successful run;
- pending decisions;
- saved rule sets;
- recent artifacts;
- runtime-configuration summary.

Primary action: `New run`.

## 4.5 Project health

Checks:

- build command;
- application startup;
- route availability;
- browser connection;
- capture readiness;
- Git status;
- environment variables;
- storage access.

## 4.6 Project settings

Sections:

- Commands
- Environment
- Routes
- Viewports
- Source-control behavior
- Artifact storage
- Runtime limits
- Privacy
- Danger zone

## 4.7 Remove project

Choices:

- remove project reference only;
- remove reference and Render Rivals artifacts;
- cancel.

Never imply that source code will be deleted unless an explicit destructive option says so.

---

# 5. New run wizard

Use a persistent step list rather than a carousel.

## 5.1 Run intent

Choose:

- compare existing implementations;
- generate new contenders;
- combine existing and generated contenders;
- re-evaluate a previous decision.

Fields:

- run name;
- objective;
- design brief;
- success criteria.

## 5.2 Scope selection

Choose:

- entire application;
- route;
- component;
- page section;
- responsive state;
- interaction flow.

Configure route, selector, application state, authentication state, and seed data.

## 5.3 Current implementation

Show:

- source snapshot;
- branch;
- commit;
- target route;
- preview;
- last-capture age;
- staleness warning.

The current implementation is always recaptured in the valid capture epoch.

## 5.4 Contender sources

Sources:

- existing branch;
- existing worktree;
- local folder;
- patch;
- generated contender;
- previous-run candidate;
- manual URL;
- duplicate current implementation for controlled modification.

## 5.5 Generation configuration

When generation is enabled:

- number of contenders;
- allowed files;
- protected files;
- maximum changed lines;
- model/provider;
- iteration limit;
- dependency policy;
- asset policy;
- accessibility constraints.

## 5.6 Viewport and environment matrix

Configure:

- desktop, tablet, and mobile widths;
- device-pixel ratio;
- color scheme;
- reduced motion;
- locale;
- time zone;
- test data;
- authentication state.

Show estimated capture count.

## 5.7 Functional gates

Available gates:

- route loads;
- no uncaught browser errors;
- required selectors exist;
- interaction script passes;
- links work;
- forms remain usable;
- no severe accessibility violations;
- performance threshold;
- screenshot stability.

## 5.8 Evaluation factors

Factors may include:

- visual hierarchy;
- clarity;
- consistency;
- information density;
- alignment;
- readability;
- accessibility;
- responsive behavior;
- task completion;
- custom project criteria.

Every factor defines weight, evidence source, minimum confidence, and tie behavior.

## 5.9 Runtime limits

- per-process memory;
- total run memory;
- candidate timeout;
- build timeout;
- capture timeout;
- evaluation timeout;
- maximum artifact size;
- maximum retries.

## 5.10 Review run

Summary:

- source snapshot;
- contenders;
- capture count;
- gates;
- factors;
- runtime limits;
- estimated disk use;
- estimated duration range;
- detected risks.

Actions: start run, save template, go back.

---

# 6. Active run

## 6.1 Run overview

Shows:

- current phase;
- overall progress;
- current operation;
- completed contenders;
- invalid contenders;
- runtime usage;
- capture-epoch status;
- warnings;
- next expected action.

Actions:

- Pause
- Cancel
- Open logs
- Open current contender
- Continue after recoverable failure

## 6.2 Environment preparation

Operations:

- create isolated workspace;
- install dependencies;
- build contender;
- launch application;
- wait for readiness;
- connect browser;
- verify route.

## 6.3 Baseline capture

Shows current implementation, viewport, interaction step, epoch identifier, browser state, capture progress, and artifacts being written.

## 6.4 Contender execution

One contender at a time in the first scheduler:

- contender identifier;
- source;
- build state;
- process state;
- capture progress;
- resource usage;
- active viewport;
- interaction step.

## 6.5 Live capture preview

Controls:

- pause preview;
- fit to window;
- inspect step;
- hide preview;
- open logs.

A visible preview is not automatically valid evidence.

## 6.6 Run timeline

Append-only events with timestamp, source process, contender, artifact link, and technical detail.

## 6.7 Runtime logs

Filters:

- Supervisor
- Coordinator
- Build
- Application
- Browser
- Evaluator
- System

Features: follow mode, search, severity filter, copy selection, export, jump to event.

## 6.8 Pause run

Explain platform behavior, epoch invalidation risk, process suspension or termination, and retained artifacts.

## 6.9 Cancel run

Explain completed work, retained artifacts, process termination, and treatment of incomplete output.

---

# 7. Contenders

## 7.1 Contender gallery

Grid or dense list containing:

- stable contender ID;
- source;
- eligibility;
- current phase;
- gate summary;
- capture completeness;
- preliminary evidence;
- source-change size.

Do not emphasize a winner before evaluation is complete.

## 7.2 Contender detail

Tabs:

- Summary
- Source
- Captures
- Gates
- Evidence
- Logs
- Artifacts

## 7.3 Source-change view

- changed files;
- added/deleted lines;
- protected-file warnings;
- dependency changes;
- configuration changes;
- patch viewer.

This is inspection, not source editing.

## 7.4 Capture set

Organize by route, viewport, interaction step, theme, and locale.

Each capture exposes screenshot, DOM snapshot, accessibility snapshot, console output, network summary, and metadata.

## 7.5 Gate results

Separate required and advisory gates. Every result includes rule, evidence, timestamp, retry count, and blocking effect.

## 7.6 Invalid contender

Reasons may include build failure, readiness failure, interaction failure, incomplete capture, severe accessibility failure, or source-policy violation.

Actions: retry, duplicate and revise, exclude, open logs.

---

# 8. Comparison workspace

## 8.1 Compare workspace

Layout zones:

- candidate rail;
- main comparison canvas;
- evidence-summary rail;
- view controls;
- viewport selector;
- interaction-step selector.

Modes:

- side by side;
- overlay;
- difference;
- flicker;
- DOM structure;
- responsive sequence.

## 8.2 Side-by-side

- synchronized scrolling;
- synchronized zoom;
- shared viewport frame;
- matching interaction state;
- explicit labels;
- capture-validity indicator;
- annotation pins.

## 8.3 Overlay

Controls:

- opacity;
- split position;
- stacking order;
- alignment reference;
- pixel-offset display.

## 8.4 Difference view

Show differences in position, size, contrast, typography, density, wrapping, missing elements, and responsive behavior.

A difference is not automatically an improvement or defect.

## 8.5 Flicker view

Controls: interval, pause, order, full-page or selected region. Respect reduced-motion settings.

## 8.6 Responsive sequence

Modes:

- candidate-focused;
- viewport-focused;
- current-versus-contender at each width.

## 8.7 Interaction replay

Synchronized navigation through scripted states such as initial, hover, menu open, populated form, submission, success, and error.

## 8.8 Region focus

Focus on semantic regions while retaining enough surrounding context for fair comparison.

## 8.9 Annotations

Types:

- improvement;
- regression;
- neutral change;
- question;
- gate issue;
- evidence reference.

---

# 9. Evidence

## 9.1 Evidence overview

Shows eligible contenders, factor results, confidence, gate outcomes, missing evidence, provenance, and recommendation state.

Avoid one unexplained master score.

## 9.2 Evidence matrix

Rows are factors; columns are current and contenders. Cells contain result, confidence, evidence count, gate impact, and explanation link.

## 9.3 Factor detail

- definition;
- weight;
- evaluation method;
- candidate results;
- supporting captures;
- citations;
- confidence;
- limitations;
- conflicting evidence.

## 9.4 Visual hierarchy

- attention order;
- heading structure;
- primary-action prominence;
- grouping;
- competing focal points.

## 9.5 Clarity and readability

- contrast;
- line length;
- font size;
- label clarity;
- call-to-action clarity;
- overload;
- truncation.

## 9.6 Layout and alignment

- alignment lines;
- spacing consistency;
- container shifts;
- overflow;
- wrapping;
- breakpoint changes.

## 9.7 Accessibility

- automated violations;
- keyboard flow;
- focus visibility;
- reduced motion;
- semantic structure;
- color dependence;
- manual-review items.

## 9.8 Functional evidence

Every interaction step shows expected behavior, actual behavior, screenshot, console state, DOM assertion, and outcome.

## 9.9 Performance evidence

Optional and separate from visual judgment:

- startup time;
- route-ready time;
- interaction latency;
- layout instability;
- asset weight;
- memory use.

## 9.10 Evidence provenance

- evaluator;
- version;
- prompt or criteria hash;
- input artifacts;
- timestamp;
- retry history;
- confidence method.

## 9.11 Conflicting evidence

Show competing conclusions, support, confidence, and a focused human-review question.

## 9.12 Missing evidence

Actions: rerun missing evidence, exclude factor, or mark for human review.

---

# 10. Rounds and progression

## 10.1 Round overview

Shows remaining, completed, eliminated, and invalid contenders plus the next comparison.

Prefer a progression list over a sports bracket.

## 10.2 Pairwise queue

Shows scheduled pairs, completed pairs, ties, rematches, and missing evidence.

## 10.3 Round result

Shows advancement decision, evidence basis, confidence, dissent, eliminated contender, and next round.

## 10.4 Tie resolution

Options:

- gather more evidence;
- increase viewport coverage;
- add interaction test;
- human decision;
- preserve current implementation;
- declare no material improvement.

---

# 11. Decision and promotion

## 11.1 Decision overview

States:

- recommendation ready;
- no eligible contender;
- no material improvement;
- low confidence;
- tie;
- human review required.

## 11.2 Recommendation detail

- why the contender is stronger;
- where it is weaker;
- what changed;
- supporting evidence;
- counter-evidence;
- remaining uncertainty;
- suggested verification.

## 11.3 No-winner outcome

A valid successful outcome:

> No contender demonstrated a sufficiently reliable improvement over the current implementation.

Actions: keep current, iterate again, modify criteria, export evidence.

## 11.4 Promotion review

Show source changes, dependencies, gates, evidence, confidence, Git status, and destination.

Promotion selects output; it does not silently merge.

## 11.5 Promotion confirmation

Options:

- mark as recommended;
- export patch;
- create local branch;
- copy worktree path;
- generate implementation report.

## 11.6 Promotion completed

Show selected contender, export location, branch or patch, evidence report, artifact bundle, and next verification steps.

## 11.7 Promotion blocked

Reasons:

- source changed since capture;
- working tree mismatch;
- gate regression;
- stale evidence;
- missing artifacts;
- unavailable output path.

---

# 12. History and artifacts

## 12.1 Run history

Filters: project, status, date, source branch, outcome, interrupted runs, and rule set.

## 12.2 Completed run detail

Read-only reconstruction of configuration, source snapshots, timeline, contenders, captures, evidence, decision, and exports.

## 12.3 Compare historical runs

Compare rule changes, evaluation changes, outcomes, evidence movement, source changes, and runtime changes.

## 12.4 Artifact explorer

Organize by run, contender, capture epoch, route, viewport, and evidence type.

## 12.5 Artifact detail

Show preview, hash, creation event, related contender, linked evidence, retention state, and export actions.

## 12.6 Export center

- full run bundle;
- evidence report;
- screenshots;
- machine-readable JSON;
- Markdown report;
- patch;
- logs;
- configuration template.

## 12.7 Storage cleanup

Show storage by project/run, old artifacts, incomplete runs, protected artifacts, and estimated reclaimed space.

---

# 13. Rule sets

## 13.1 Rule-set library

Built-in, project, imported, recent, and incompatible rule sets.

## 13.2 Rule-set detail

Scope, gates, factors, weights, confidence rules, tie rules, runtime requirements, and version history.

## 13.3 Rule-set editor

Visual form, raw configuration, validation, historical-run testing, duplication, and export.

## 13.4 Gate editor

Name, required/advisory status, assertion type, target, threshold, retry behavior, and failure message.

## 13.5 Factor editor

Definition, evidence inputs, evaluator, weight, confidence threshold, missing-data behavior, and explanation requirements.

## 13.6 Rule-set validation

Schema issues, contradictions, missing evaluators, unsupported capabilities, impossible thresholds, and circular dependencies.

---

# 14. Diagnostics

## 14.1 Diagnostics overview

Supervisor, coordinator, browser, storage, ports, process limits, recent failures, and platform capability.

## 14.2 Process viewer

Shows PID, parent, contender, CPU, memory, state, and containment boundary.

## 14.3 Port inspector

Allocated ports, owning process, expected application, conflicts, and stale listeners.

## 14.4 Browser diagnostics

Browser version, connection, contexts, pages, current epoch, disconnects, and crashes.

## 14.5 Storage diagnostics

Writable paths, free space, large artifacts, cleanup failures, hash failures, and corruption detection.

## 14.6 Diagnostic bundle

Configurable redacted export of runtime information, logs, configuration, platform details, and failure events. Source files are excluded by default.

---

# 15. Settings

## 15.1 General

Startup, project defaults, run template, confirmations, dates, and numbers.

## 15.2 Appearance

System/light/dark, density, reduced motion, syntax theme, canvas background, and evidence-label size.

## 15.3 Runtime

Node, browser, supervisor, process limits, timeouts, port range, and scheduler policy.

## 15.4 Containment

Detected capability, minimum required capability, memory limits, process-tree enforcement, network policy, filesystem restrictions, and platform details.

## 15.5 Capture defaults

Viewports, pixel ratio, themes, locale, time zone, format, settling, font readiness, and retry policy.

## 15.6 Evaluators

Deterministic rules, model-backed evaluators, local endpoints, credentials, version pinning, and confidence defaults.

## 15.7 Storage and retention

Directory, maximum storage, retention policy, cleanup schedule, protected runs, and export destination.

## 15.8 Privacy and security

Network access, telemetry, crash reporting, redaction, environment variables, source inclusion, clipboard, and external services.

## 15.9 Integrations

Git, GitHub, GitLab, Figma, Playwright, local model servers, and external evaluation providers.

## 15.10 Notifications

Run complete, decision ready, failure, disk warning, and update availability.

## 15.11 Updates

Application, supervisor, browser bundle, release channel, changelog, and verification.

## 15.12 About

Version, license, repository, architecture, contributors, third-party notices, and local data location.

---

# 16. Required state coverage

Every applicable page must define:

## Loading

Name the actual operation rather than showing an unexplained spinner.

## Empty

No projects, runs, contenders, evidence, artifacts, or rule sets.

## Partial completion

Missing captures, unavailable evaluator, incomplete viewport, or advisory failure.

## Failure

Build failure, browser crash, disk full, port conflict, containment escape, or evaluator timeout.

## Recovery

Retry contender, restart epoch, resume completed work, continue without advisory factor, or restore prior state.

## Stale data

Source, rules, browser, or evaluator changed after evidence was generated.

## Offline

The local product remains useful unless an explicitly selected external evaluator or generator requires connectivity.

## Restricted capability

Platform cannot provide a requested containment or runtime feature.

---

# 17. Responsive behavior

The desktop application is desktop-first but must remain usable on small laptop displays.

- The sidebar collapses to icons and then a navigation drawer.
- Secondary rails become drawers before the comparison canvas is compressed beyond usefulness.
- Comparison controls remain outside local horizontal scrollers.
- Dense evidence matrices may use a contained horizontal scroller.
- Side-by-side comparison may switch to vertical stacking below the minimum fair comparison width.
- Critical state, eligibility, and capture-validity labels remain visible at every supported width.

---

# 18. MVP priority

## P0: first functional product

- launch and runtime check;
- home;
- open/configure project;
- project overview;
- new-run wizard;
- active-run overview;
- environment preparation;
- contender gallery/detail;
- side-by-side and overlay comparison;
- gate results;
- evidence overview/factor detail;
- decision and no-winner outcome;
- promotion review;
- run history;
- artifact explorer;
- diagnostics overview;
- core settings.

## P1: trustworthy public release

- responsive sequence;
- interaction replay;
- conflicting evidence;
- rule-set editor;
- historical comparison;
- storage cleanup;
- diagnostic bundle;
- integrations;
- update management.

## P2: later expansion

- team collaboration;
- shared comments;
- remote workers;
- cloud artifact synchronization;
- hosted dashboards;
- portfolio views;
- scheduled evaluations;
- pull-request integration.

---

# 19. Route model

```text
/
/projects
/projects/open
/projects/:projectId
/projects/:projectId/health
/projects/:projectId/settings
/runs
/runs/new
/runs/:runId
/runs/:runId/contenders
/runs/:runId/contenders/:contenderId
/runs/:runId/compare
/runs/:runId/evidence
/runs/:runId/evidence/:factorId
/runs/:runId/decision
/runs/:runId/timeline
/rule-sets
/rule-sets/:ruleSetId
/artifacts
/artifacts/:artifactId
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
/settings/integrations
/settings/notifications
/settings/updates
/settings/about
```

---

# 20. Next design deliverable

Create a route-level wireframe specification for every P0 page containing:

- layout zones;
- component inventory;
- data dependencies;
- primary and secondary actions;
- state matrix;
- keyboard behavior;
- responsive behavior;
- accessibility requirements;
- event and artifact links.
