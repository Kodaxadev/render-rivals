# Render Rivals Route-Level Wireframe Specification

**Status:** Route and layout baseline  
**Applies to:** Desktop application, marketing website, and documentation website  
**Depends on:** `docs/PRODUCT-UI-SCENE-PLAN.md` and `docs/MARKETING-AND-DOCS-SITE-PLAN.md`  
**Purpose:** Convert the page inventory into implementation-ready route contracts with stable layout zones, components, actions, states, and responsive behavior.

---

## 1. Wireframe rules

This document defines information architecture and interface geometry. It does not lock final colors, typography, illustrations, or brand symbols.

Every route must satisfy the following:

1. The route has one dominant user objective.
2. The primary action appears once in the main page header or final review footer, not repeatedly in every card.
3. Runtime facts, evidence, warnings, and destructive actions are visually distinct.
4. Scores never appear without their evidence source, confidence, or evaluation state.
5. A recommendation is never styled as a completed promotion.
6. Current and contender labels remain visible in every comparison mode.
7. Loading states name the operation in progress.
8. Empty, partial, stale, failure, and recovery states are designed before implementation.
9. Narrow layouts preserve sequence and meaning rather than shrinking desktop grids until they become unreadable.
10. Routes remain usable in light and dark themes and without red/green-only distinctions.

---

## 2. Breakpoints and density

### Desktop application

| Name | Width | Behavior |
|---|---:|---|
| Compact | 960–1199 px | Collapsed sidebar, two-column content becomes stacked where necessary |
| Standard | 1200–1599 px | Default application layout |
| Wide | 1600 px and above | Optional evidence rail or expanded comparison canvas |

The desktop application is not optimized for phone use. At widths below 960 px it enters **restricted compact mode** and displays a notice that comparison and evidence work requires a larger window.

### Public websites

| Name | Width | Behavior |
|---|---:|---|
| Mobile | 320–767 px | Single-column reading order and drawer navigation |
| Tablet | 768–1099 px | Two-column sections where meaningful |
| Desktop | 1100–1439 px | Standard marketing and documentation layout |
| Wide | 1440 px and above | Increased outer gutters; content measure remains bounded |

---

## 3. Desktop application shell

### 3.1 Persistent shell geometry

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Context bar: project · source snapshot · active run · health · commands │
├──────────────┬───────────────────────────────────────────────────────────┤
│ Global nav   │ Optional run subnav                                      │
│              ├───────────────────────────────────────────────────────────┤
│ Home         │                                                           │
│ Projects     │ Main route content                                        │
│ Runs         │                                                           │
│ Rule Sets    │                                                           │
│ Artifacts    │                                                           │
│ Diagnostics  │                                                           │
│ Settings     │                                                           │
├──────────────┴───────────────────────────────────────────────────────────┤
│ Optional status strip: storage · containment · browser · update status   │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Global sidebar

Expanded width: 224 px. Collapsed width: 64 px.

Required items:

- Home
- Projects
- Runs
- Rule Sets
- Artifacts
- Diagnostics
- Settings

Footer items:

- Runtime health indicator
- Help
- Application version

The sidebar must not display project-specific nested navigation. Project and run navigation belong in the context bar and route-level subnavigation.

### 3.3 Context bar

Left zone:

- Project selector
- Branch or source snapshot
- Active-run selector when applicable

Center zone:

- Breadcrumb or current route label
- Stale-source warning when applicable

Right zone:

- Runtime-health summary
- Activity drawer trigger
- Command palette
- Help

### 3.4 Run subnavigation

Visible only inside `/runs/:runId/*`.

Items:

- Overview
- Contenders
- Compare
- Evidence
- Decision
- Timeline

Tabs display status markers but do not display unexplained scores.

---

## 4. Reusable desktop route templates

### Template A — Index route

Used by projects, runs, rule sets, artifacts, and history.

```text
┌ Page title ─ description ─────────────────────── [Primary action] ┐
│ Filter/search bar                                                   │
├───────────────────────────────┬─────────────────────────────────────┤
│ Main list or table            │ Optional summary/filter rail        │
│                               │                                     │
└───────────────────────────────┴─────────────────────────────────────┘
```

### Template B — Entity overview

```text
┌ Breadcrumb                                                     ⋯ ┐
│ Entity title · status                              [Primary action]│
│ Metadata strip                                                     │
├───────────────────────────────┬─────────────────────────────────────┤
│ Main operational content      │ Health / warnings / recent activity│
├───────────────────────────────┴─────────────────────────────────────┤
│ Secondary sections                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Template C — Wizard step

```text
┌ Wizard title                                                       ┐
├──────────────┬──────────────────────────────────────────────────────┤
│ Step list    │ Step title                                           │
│ 1 Intent     │ Description                                          │
│ 2 Scope      │                                                      │
│ 3 Baseline   │ Form or selection content                            │
│ ...          │                                                      │
├──────────────┴──────────────────────────────────────────────────────┤
│ [Back]                                           [Save] [Continue]  │
└─────────────────────────────────────────────────────────────────────┘
```

### Template D — Active operation

```text
┌ Operation title · state                         [Pause] [Cancel] ┐
│ Progress summary · elapsed · current phase                         │
├────────────────────────────────┬───────────────────────────────────┤
│ Current operation              │ Runtime / resource rail           │
│ preview, steps, or candidate   │ warnings, process, storage        │
├────────────────────────────────┴───────────────────────────────────┤
│ Event stream or expandable logs                                   │
└────────────────────────────────────────────────────────────────────┘
```

### Template E — Evidence workspace

```text
┌ Route title · scope controls · viewport · step · mode              ┐
├──────────────┬──────────────────────────────────────┬───────────────┤
│ Candidate    │ Comparison or evidence canvas        │ Evidence rail │
│ rail         │                                      │               │
├──────────────┴──────────────────────────────────────┴───────────────┤
│ Details drawer / provenance / annotation list                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Template F — Settings

```text
┌ Settings title                                                     ┐
├──────────────────┬──────────────────────────────────────────────────┤
│ Section nav      │ Section heading                                  │
│                  │ Description                                      │
│                  │ Grouped controls                                 │
│                  │                                                  │
│                  │                          [Reset] [Save changes]    │
└──────────────────┴──────────────────────────────────────────────────┘
```

---

# 5. Launch and onboarding routes

## `/launch`

**Template:** Full-window operational scene without application shell.

Zones:

1. Centered identity mark and application name.
2. Ordered runtime initialization list.
3. Current operation with elapsed time.
4. Footer containing version, safe-mode action, and log action.

Primary state:

- Starting supervisor
- Opening data directory
- Checking browser runtime
- Restoring session

Failure state:

- Exact failed operation
- Short reason
- `Retry`, `Open logs`, and `Start in safe mode`

No decorative animation beyond a restrained progress indicator.

## `/onboarding/welcome`

**Template:** Focused reading layout.

Zones:

1. Product statement.
2. Four local-first principles.
3. Small workflow diagram.
4. Primary action `Set up Render Rivals`.
5. Secondary actions `Documentation` and `Exit`.

## `/onboarding/permissions`

**Template:** Step-based onboarding.

Main content uses one permission row per capability:

- Project directories
- Child processes
- Browser automation
- Local ports
- Artifact storage

Each row includes purpose, access boundary, and data-retention note.

Footer actions: `Back`, `Accept and continue`.

## `/onboarding/runtime-check`

**Template:** Diagnostic checklist.

Left/main zone:

- Operating system
- Node
- Browser
- Supervisor
- Git
- Storage
- Port range
- Containment capability

Right rail:

- Overall state: Ready, Limited, or Blocked
- Technical summary
- `Re-run checks`

Blocked items expand in place with remediation.

## `/onboarding/containment`

**Template:** Explanation and acknowledgment.

Main zones:

- Detected containment level
- Guaranteed capabilities
- Unavailable capabilities
- Platform-specific risks

Footer actions:

- `View technical details`
- `Back`
- `Continue`

## `/onboarding/storage`

**Template:** Form with estimation rail.

Main form:

- Artifact directory
- Maximum storage
- Screenshot retention
- Build-output retention
- Log retention
- Cleanup threshold

Right rail:

- Estimated run size
- Estimated retained run count
- Current free space

## `/onboarding/complete`

Three equal actions:

- Open a project
- Explore sample project
- Read first-run guide

The default primary action is `Open a project`.

---

# 6. Home and global workspace

## `/home`

**Template:** Dashboard variation of Template B.

Header:

- `Home`
- `Open project`

First row:

- Interrupted runs
- Decisions awaiting review
- Runtime warnings
- Storage pressure

Main left:

- Recent projects list
- Resume points

Main right:

- Recent promotions
- Runtime health
- Recent activity

Empty state replaces all dashboard modules with the five-step workflow and project-opening actions.

## `/activity`

Normally presented as a drawer; routable for deep links.

Content:

- Filter by project, run, event type, and severity
- Chronological event list
- Each event links to exact run, contender, artifact, or diagnostic source

## `/command-palette`

Overlay rather than full page.

Groups:

- Navigation
- Projects
- Active run actions
- Diagnostics
- Settings

Destructive commands require a second confirmation outside the palette.

---

# 7. Project routes

## `/projects`

**Template:** A.

Header action: `Open project`.

List columns:

- Project
- Path
- Framework
- Source state
- Last run
- Pending decision
- Health

Right rail:

- Recently opened
- Projects with warnings
- Storage by project

## `/projects/open`

**Layout:** Two-column file-location selection.

Left:

- Recent paths
- Pinned paths
- Browse action

Right:

- Detection preview
- Framework
- Package manager
- Repository state
- Existing Render Rivals configuration

Primary action remains disabled until a valid directory is selected.

## `/projects/inspect`

Temporary route before project creation.

Header:

- Selected project path
- Detection confidence

Main:

- Detected commands
- Expected URL
- Entry route
- Git branch and commit
- Existing configuration

Right rail:

- Warnings
- Unsupported features
- Required manual input

Actions: `Cancel`, `Edit setup`, `Accept detection`.

## `/projects/:projectId`

**Template:** B.

Header action: `New run`.

Metadata strip:

- Framework
- Branch
- Commit
- Last health check
- Runtime mode

Main left:

- Last run summary
- Pending decisions
- Recent captures

Right rail:

- Project health
- Source-state warnings
- Saved rule sets
- Storage use

Bottom:

- Recent runs table
- Project activity

## `/projects/:projectId/health`

Checklist route.

Each check has:

- State
- Last run time
- Duration
- Result details
- Individual retry

Checks:

- Install
- Build
- Start
- Route readiness
- Browser connection
- Capture readiness
- Git state
- Storage

Header action: `Run full health check`.

## `/projects/:projectId/settings`

**Template:** F.

Sections:

- Commands
- Environment
- Routes
- Viewports
- Source control
- Artifacts
- Runtime limits
- Privacy
- Danger zone

## `/projects/:projectId/remove`

Modal or focused confirmation route.

Choices:

- Remove project reference only
- Remove reference and Render Rivals artifacts

Source files are explicitly excluded from deletion.

---

# 8. New-run wizard routes

Wizard root redirects to the first incomplete step.

## `/projects/:projectId/runs/new/intent`

Fields:

- Run name
- Objective
- Design brief
- Success criteria
- Run mode

Run modes:

- Existing implementations
- Generated contenders
- Combined
- Re-evaluate prior decision

Right rail:

- Summary of selected project and source snapshot

## `/projects/:projectId/runs/new/scope`

Controls:

- Entire app, route, component, section, responsive state, or interaction flow
- Route
- Selector or boundary
- Required application state
- Authentication fixture
- Seed data

Preview panel shows the resolved scope.

## `/projects/:projectId/runs/new/baseline`

Main:

- Current branch/worktree
- Commit
- Staleness
- Route preview
- Last capture metadata

Warning callout:

- Baseline will be recaptured in the same epoch as contenders

## `/projects/:projectId/runs/new/contenders`

List-builder interface.

Each contender row contains:

- Stable ID
- Source type
- Source location
- Validation state
- Remove action

Add menu:

- Branch
- Worktree
- Folder
- Patch
- Generated
- Previous-run candidate
- Manual URL

## `/projects/:projectId/runs/new/generation`

Conditionally included.

Controls:

- Number of contenders
- Allowed paths
- Protected paths
- Maximum changed lines
- Provider/model
- Iteration limit
- Dependency policy
- Asset policy
- Accessibility constraints

Right rail:

- Estimated generation operations
- Policy conflicts

## `/projects/:projectId/runs/new/environment`

Matrix builder for:

- Viewports
- Pixel ratios
- Color schemes
- Reduced motion
- Locale
- Time zone
- Authentication state

Bottom summary:

- Total capture combinations
- Estimated artifact volume

## `/projects/:projectId/runs/new/gates`

Two groups:

- Required gates
- Advisory gates

Each gate row:

- Enabled
- Rule name
- Threshold
- Retry policy
- Blocking effect

Right rail explains the currently selected gate.

## `/projects/:projectId/runs/new/evaluation`

Factor table:

- Factor
- Weight
- Evidence source
- Minimum confidence
- Missing-data behavior
- Tie behavior

Footer validates total weighting and unsupported combinations.

## `/projects/:projectId/runs/new/limits`

Controls:

- Build timeout
- Startup timeout
- Capture timeout
- Evaluation timeout
- Per-process memory
- Total memory
- Maximum retries
- Maximum artifact size

Right rail shows platform enforcement capability.

## `/projects/:projectId/runs/new/review`

**Layout:** Review document with sticky summary rail.

Main sections:

- Intent and scope
- Baseline
- Contenders
- Environment matrix
- Gates
- Evaluation
- Runtime limits

Right rail:

- Estimated captures
- Estimated storage
- Risks
- Validation status

Footer actions:

- `Back`
- `Save as template`
- `Start run`

---

# 9. Active-run routes

## `/runs/:runId/overview`

**Template:** D.

Header:

- Run name
- Current phase
- Pause
- Cancel

Progress strip:

- Preparation
- Baseline capture
- Contender execution
- Evaluation
- Decision

Main left:

- Current operation
- Current contender
- Current viewport and interaction step
- Preview when available

Right rail:

- Capture epoch
- Browser state
- Process state
- CPU and memory
- Disk use
- Warnings

Bottom:

- Recent event stream
- Expandable logs

## `/runs/:runId/preparation`

Operational step list:

- Create workspace
- Install dependencies
- Build
- Launch
- Wait for readiness
- Connect browser
- Verify route

Selected step exposes scoped logs and retry action.

## `/runs/:runId/capture`

Main:

- Live preview
- Current source label
- Viewport frame
- Interaction-step name

Right rail:

- Epoch ID
- Capture set progress
- Browser connection
- Artifact write status

Invalidation banner appears immediately if the epoch becomes unusable.

## `/runs/:runId/contenders`

**Template:** A inside run shell.

View switch:

- Dense list
- Visual gallery

Each contender displays:

- ID
- Source
- Eligibility
- Phase
- Gate summary
- Capture completeness
- Change size

No winner styling appears before evaluation is complete.

## `/runs/:runId/contenders/:contenderId`

**Template:** B.

Tabs:

- Summary
- Source
- Captures
- Gates
- Evidence
- Logs
- Artifacts

Header actions depend on state:

- Retry
- Duplicate and revise
- Exclude
- Open workspace

## `/runs/:runId/contenders/:contenderId/source`

Layout:

- Changed-file tree
- Patch viewer
- Policy-warning rail

Top metadata:

- Files changed
- Additions/deletions
- Dependencies changed
- Protected files touched

## `/runs/:runId/contenders/:contenderId/captures`

Left filters:

- Route
- Viewport
- Theme
- Locale
- Interaction step

Main:

- Capture grid or single preview

Right detail rail:

- Screenshot
- DOM snapshot
- Accessibility snapshot
- Console
- Network summary
- Metadata

## `/runs/:runId/contenders/:contenderId/gates`

Required gates appear first.

Each gate expands to:

- Exact assertion
- Evidence
- Timestamp
- Retry history
- Blocking consequence

## `/runs/:runId/timeline`

Full-width event stream.

Columns:

- Time
- Process/source
- Event
- Contender
- Artifact
- Severity

Selection opens a detail drawer rather than navigating away.

---

# 10. Comparison workspace routes

## `/runs/:runId/compare`

**Template:** E.

Top controls:

- Candidate A
- Candidate B
- Route
- Viewport
- Interaction step
- Comparison mode

Left candidate rail:

- Eligible contenders
- Current implementation
- Invalid contenders collapsed separately

Center canvas:

- Selected comparison mode

Right evidence rail:

- Gate state
- Factor deltas
- Confidence
- Annotations

Bottom drawer:

- Capture metadata
- Provenance
- Linked artifacts

## `/runs/:runId/compare/side-by-side`

Center canvas contains two equal frames.

Controls:

- Synchronized scroll
- Synchronized zoom
- Fit width
- Fit height
- Region focus

Labels remain pinned above each frame.

At compact width, the frames stack vertically with a persistent A/B switch and synchronized-position indicator.

## `/runs/:runId/compare/overlay`

Center controls:

- Opacity
- Split position
- Layer order
- Alignment reference
- Pixel offset

Canvas maintains one shared frame.

## `/runs/:runId/compare/difference`

Left toolbar filters difference categories:

- Position
- Size
- Contrast
- Typography
- Wrapping
- Missing elements
- Responsive behavior

Right rail explains selected difference and explicitly separates difference from judgment.

## `/runs/:runId/compare/flicker`

Controls:

- Interval
- Pause
- Order
- Full page or region

Reduced-motion mode defaults to manual alternation.

## `/runs/:runId/compare/responsive`

Modes:

- One candidate across widths
- Current versus contender per width
- One width across contenders

Canvas uses a labeled sequence rather than unlabeled thumbnail cards.

## `/runs/:runId/compare/replay`

Top stepper:

- Initial
- Hover
- Open
- Populated
- Submitted
- Success/error

Frames remain synchronized to the same scripted step.

---

# 11. Evidence routes

## `/runs/:runId/evidence`

**Template:** E with matrix canvas.

Top summary:

- Evidence completeness
- Eligible contenders
- Missing factors
- Evaluation provenance
- Recommendation state

Center:

- Factor-by-candidate matrix

Right rail:

- Selected cell explanation
- Confidence
- Evidence count
- Gate impact

## `/runs/:runId/evidence/factors/:factorId`

Header:

- Factor name
- Definition
- Weight
- Evaluator

Main left:

- Candidate results
- Supporting captures
- Annotations

Right rail:

- Confidence
- Limitations
- Conflicting evidence
- Provenance

## `/runs/:runId/evidence/accessibility`

Sections:

- Automated violations
- Keyboard flow
- Focus visibility
- Semantics
- Reduced motion
- Color dependence
- Manual review items

Every violation links to contender, route, viewport, and artifact.

## `/runs/:runId/evidence/functional`

Interaction-step table:

- Expected result
- Actual result
- Assertion
- Screenshot
- Console state
- Pass/fail

## `/runs/:runId/evidence/performance`

Metrics are kept separate from visual evaluation:

- Startup
- Ready time
- Interaction latency
- Layout instability
- Asset weight
- Memory

## `/runs/:runId/evidence/conflicts`

List of disputed factors.

Detail view contains:

- Conclusion A
- Conclusion B
- Evidence for each
- Confidence
- Human-review question
- Resolution action

## `/runs/:runId/evidence/missing`

Grouped by recoverability:

- Retryable
- Excludable advisory evidence
- Blocking required evidence

Actions are scoped per item and available as a batch only when consequences are equivalent.

## `/runs/:runId/evidence/provenance`

Audit table:

- Evaluator
- Version
- Criteria hash
- Input artifacts
- Timestamp
- Retry history
- Confidence method

---

# 12. Decision and promotion routes

## `/runs/:runId/decision`

Header state:

- Recommendation ready
- No material improvement
- Tie
- Low confidence
- Human review required
- No eligible contender

Main left:

- Recommended outcome
- Material differences
- Strengths
- Weaknesses
- Remaining uncertainty

Right rail:

- Evidence completeness
- Required gates
- Confidence
- Source freshness

Primary action changes by state:

- `Review promotion`
- `Keep current`
- `Resolve tie`
- `Gather evidence`

## `/runs/:runId/decision/no-winner`

Focused result page.

Message:

- No contender demonstrated a sufficiently reliable material improvement

Sections:

- Why no contender qualified
- Best observed improvements
- Blocking regressions
- Suggested next iteration

Actions:

- Keep current
- Start another iteration
- Modify criteria
- Export evidence

## `/runs/:runId/decision/tie`

Shows tied contenders and exact unresolved factors.

Options:

- Add viewport
- Add interaction test
- Gather more evidence
- Human selection
- Preserve current
- Declare no material improvement

## `/runs/:runId/promotion/review`

Review document:

- Source changes
- Dependency changes
- Gate results
- Evidence summary
- Confidence
- Git status
- Export destination

Sticky right rail:

- Promotion method
- Blocking warnings
- Source freshness

## `/runs/:runId/promotion/confirm`

Choose one output:

- Mark recommended
- Export patch
- Create local branch
- Copy worktree path
- Generate implementation report

Destructive replacement requires typed confirmation.

## `/runs/:runId/promotion/complete`

Summary:

- Selected contender
- Output path or branch
- Evidence report
- Artifact bundle
- Verification checklist

Actions:

- Open branch
- Start validation run
- View completed run

## `/runs/:runId/promotion/blocked`

Exact blocker plus remediation:

- Source changed
- Working tree mismatch
- Gate regression
- Stale evidence
- Missing artifacts
- Output unavailable

---

# 13. History and artifacts

## `/runs`

**Template:** A.

Filters:

- Project
- Status
- Date
- Branch
- Outcome
- Rule set

Columns:

- Run
- Project
- Source snapshot
- Contenders
- Status
- Outcome
- Completed

Header action: `New run` opens project selection when no project is active.

## `/runs/:runId/completed`

Read-only reconstruction using the active-run subnavigation.

A persistent `Historical run` banner prevents confusion with current project state.

## `/runs/compare-history`

Two-run selector above a difference table:

- Configuration
- Source
- Rules
- Evaluators
- Outcomes
- Runtime

## `/artifacts`

**Template:** A with tree/table switch.

Left filters:

- Project
- Run
- Contender
- Artifact type
- Retention

Main:

- Artifact tree or table

Right rail:

- Storage summary
- Cleanup candidates
- Protected artifacts

## `/artifacts/:artifactId`

Preview route.

Header metadata:

- Type
- Hash
- Size
- Created
- Source event

Main preview adapts to image, JSON, log, HTML, patch, or report.

Right rail:

- Related run
- Contender
- Evidence
- Retention
- Export

## `/artifacts/export`

Selectable export contents:

- Full bundle
- Evidence report
- Screenshots
- JSON
- Markdown
- Patch
- Logs
- Configuration

## `/artifacts/cleanup`

Storage summary and deletion preview.

Nothing is deleted until the exact artifact groups and reclaimed size are shown.

---

# 14. Rule-set routes

## `/rules`

**Template:** A.

Groups:

- Built in
- Project
- Imported
- Recently used

Columns:

- Name
- Scope
- Version
- Last used
- Compatibility

Header action: `New rule set`.

## `/rules/:ruleSetId`

**Template:** B.

Sections:

- Scope
- Gates
- Factors
- Confidence
- Tie rules
- Runtime requirements
- Version history

Actions:

- Duplicate
- Export
- Edit
- Test against previous run

## `/rules/:ruleSetId/edit`

Split editor:

- Form mode
- Raw configuration mode

Validation rail remains visible in both modes.

## `/rules/:ruleSetId/gates/:gateId`

Controls:

- Name
- Required/advisory
- Assertion
- Target
- Threshold
- Retry
- Failure message

## `/rules/:ruleSetId/factors/:factorId`

Controls:

- Definition
- Inputs
- Evaluator
- Weight
- Confidence
- Missing data
- Explanation requirements

## `/rules/:ruleSetId/validate`

Results grouped by:

- Schema
- Contradiction
- Unsupported capability
- Missing evaluator
- Impossible threshold
- Dependency cycle

---

# 15. Diagnostics routes

## `/diagnostics`

**Template:** B.

Top health row:

- Supervisor
- Coordinator
- Browser
- Storage
- Ports
- Containment

Main left:

- Recent failures
- Active warnings
- Recovery actions

Right rail:

- Platform capability
- Version alignment
- Export diagnostic bundle

## `/diagnostics/processes`

Process table:

- PID
- Parent
- Run
- Contender
- CPU
- Memory
- State
- Boundary

Selection opens logs and ownership details.

## `/diagnostics/ports`

Table:

- Port
- Owning PID
- Expected owner
- Listener address
- State
- Conflict action

## `/diagnostics/browser`

Sections:

- Version
- Connection
- Contexts
- Pages
- Current epoch
- Disconnect history
- Crash history

## `/diagnostics/storage`

Sections:

- Paths
- Free space
- Largest runs
- Cleanup failures
- Hash failures
- Corruption checks

## `/diagnostics/export`

Redaction-first bundle builder.

Source files are excluded by default.

---

# 16. Settings routes

All settings use Template F.

## `/settings/general`

- Startup
- Default project directory
- Default run template
- Confirmation behavior
- Locale formatting

## `/settings/appearance`

- System/light/dark
- Density
- Reduced motion
- Syntax theme
- Comparison background
- Evidence-label size

## `/settings/runtime`

- Node runtime
- Browser runtime
- Supervisor
- Process limits
- Timeouts
- Port range
- Sequential-execution explanation

## `/settings/containment`

- Detected capability
- Minimum required capability
- Memory enforcement
- Process-tree enforcement
- Network policy
- Filesystem restrictions

## `/settings/capture`

- Viewports
- Pixel ratio
- Themes
- Locale
- Time zone
- Screenshot format
- Settling rules
- Retry policy

## `/settings/evaluators`

- Deterministic evaluators
- Model-backed evaluators
- Local endpoints
- Provider credentials
- Version pinning
- Confidence defaults

## `/settings/storage`

- Artifact location
- Capacity
- Retention
- Cleanup
- Protected runs
- Export destination

## `/settings/privacy`

- Network access
- Telemetry
- Crash reporting
- Redaction
- Environment variables
- Source inclusion
- External-service permissions

## `/settings/integrations`

Integration list and permission details for Git, GitHub, GitLab, Figma, Playwright, local models, and external providers.

## `/settings/notifications`

- Completed run
- Decision ready
- Failure
- Storage warning
- Update available

## `/settings/updates`

- Application
- Supervisor
- Browser bundle
- Release channel
- Changelog
- Verification

## `/settings/about`

- Version
- Repository
- Architecture docs
- License
- Contributors
- Third-party notices
- Data directory

---

# 17. Desktop overlays and drawers

## Activity drawer

Width: 420 px standard, full-width overlay in compact mode.

## Runtime logs drawer

Height: 40–60% of workspace. It never covers the page header so run state and cancel controls remain visible.

## Command palette

Centered, maximum width 680 px, maximum height 70% of window.

## Artifact detail drawer

Used for quick inspection from evidence and timeline routes. Full artifact routes remain available.

## Confirmation modal

Contains:

- Action
- Consequence
- Scope
- Reversibility
- Explicit confirm and cancel

## Stale-source banner

Persistent under the context bar. It cannot be dismissed while the source mismatch remains.

---

# 18. Desktop responsive behavior

At compact desktop width:

- Sidebar collapses.
- Optional right rails become drawers.
- Comparison frames may stack vertically.
- Tables hide secondary columns behind row expansion.
- Wizard step labels collapse to numbers plus current title.
- Context-bar project and run selectors remain available.
- Destructive actions remain in the page header rather than moving into overflow-only menus.

Below 960 px:

- Editing and inspection routes remain available.
- Side-by-side, overlay, evidence matrix, and source diff routes show a larger-window requirement.
- No data or run state is lost.

---

# 19. Marketing website shell

```text
┌ Logo ─ Product ─ How it works ─ Examples ─ Docs ─ GitHub ─ Download ┐
├─────────────────────────────────────────────────────────────────────┤
│ Route content                                                       │
├─────────────────────────────────────────────────────────────────────┤
│ Footer: docs · repository · security · legal · releases             │
└─────────────────────────────────────────────────────────────────────┘
```

Desktop navigation is horizontal. Mobile navigation uses a drawer with the same information order.

---

# 20. Marketing routes

## `/`

Section order:

1. Hero with direct positioning and two actions
2. Controlled current-versus-contender product demonstration
3. Six-step workflow
4. Evidence and no-winner explanation
5. Local-first architecture
6. Product screenshots
7. Example outcome
8. Installation call to action
9. GitHub/open-source call to action

Hero actions:

- Download
- View GitHub

Suggested core message:

- Compare implementations. Promote only what proves better.

## `/how-it-works`

Long-form six-step sequence:

- Preserve current
- Add contenders
- Capture fairly
- Apply gates
- Inspect evidence
- Promote deliberately

Each step includes one product screenshot and one technical proof point.

## `/product/capture`

Sections:

- Capture epochs
- Comparable environments
- Interaction steps
- Failure and invalidation
- Artifact provenance

## `/product/compare`

Sections:

- Side by side
- Overlay
- Difference
- Responsive
- Interaction replay
- Annotation

## `/product/evidence`

Sections:

- Factors
- Gates
- Confidence
- Provenance
- Conflicts
- No-winner outcome

## `/product/rules`

Sections:

- Gates
- Factors
- Weights
- Confidence
- Tie behavior
- Reusable project policies

## `/product/local-first`

Sections:

- Local execution
- Artifact ownership
- Optional network use
- Containment
- No automatic merging

## `/product/promotion`

Sections:

- Recommendation versus promotion
- Source review
- Patch/branch/export outputs
- Stale-source blocking
- Validation runs

## `/security`

Page zones:

- Threat and trust model
- Data boundaries
- Process containment
- Network policy
- Artifact retention
- Vulnerability reporting
- Platform limitations

## `/download`

Tabs:

- macOS
- Windows
- Linux
- npm bootstrap
- Source

Each tab contains requirements, installation, checksum, known limitations, and release notes.

## `/examples`

Filterable case-study index.

Cases:

- Pricing
- Dashboard
- Checkout
- Mobile navigation
- Enterprise table
- No-winner result

## `/examples/:exampleId`

Case-study structure:

- Problem
- Current implementation
- Contenders
- Gates
- Evidence
- Decision
- Source changes
- Limitations

## `/compare`

Comparison table against:

- AI generators
- Screenshot diff tools
- Visual regression
- A/B testing
- Design review
- Autonomous coding agents

The page must explain category boundaries without unsourced superiority claims.

## `/open-source`

Sections:

- Repository
- Architecture
- Governance
- Roadmap
- Contributing
- License status
- Security reporting

## `/roadmap`

Milestone groups:

- Prototype
- Reliable local runner
- Extensible evaluation
- Team workflows
- Broader platform support

## `/changelog`

Filters:

- App
- Supervisor
- Evaluators
- Rules
- Docs

## `/legal/privacy`, `/legal/terms`, `/legal/licenses`, `/legal/trademark`

Simple reading layouts with updated date, table of contents, and canonical source link.

---

# 21. Documentation website shell

```text
┌ Docs logo · Version selector · Search · GitHub                    ┐
├──────────────────┬───────────────────────────────┬─────────────────┤
│ Section nav      │ Article content               │ On this page    │
│                  │                               │                 │
└──────────────────┴───────────────────────────────┴─────────────────┘
```

Mobile:

- Section nav becomes a drawer.
- On-this-page becomes an inline expandable outline.
- Search remains in the top bar.

---

# 22. Documentation routes

## `/docs`

Landing sections:

- Start here
- Core concepts
- Configure a project
- Platform guides
- Troubleshooting
- Development

## `/docs/getting-started/introduction`

- What Render Rivals is
- What it is not
- Local-first model
- End-to-end workflow

## `/docs/getting-started/install`

- Platform selector
- Requirements
- Installation
- Verification
- Common failures

## `/docs/getting-started/first-project`

- Open project
- Detection
- Health check
- Configuration

## `/docs/getting-started/first-run`

- Intent
- Scope
- Baseline
- Contenders
- Gates
- Evidence
- Start

## `/docs/getting-started/read-evidence`

- Matrix
- Factor detail
- Confidence
- Provenance
- Conflict
- Missing evidence

## `/docs/getting-started/promote`

- Review
- Output choices
- Stale source
- Validation

## `/docs/concepts/:concept`

Concept routes:

- Current implementation
- Contenders
- Capture epochs
- Gates
- Evidence
- Confidence
- Promotion
- No-winner decisions
- Containment

Every concept article uses:

- Definition
- Why it exists
- Lifecycle
- Failure cases
- Related configuration
- Related routes

## `/docs/configuration/:topic`

Topics:

- Project
- Viewports
- Interactions
- Rules
- Evaluators
- Runtime limits
- Storage
- Environment variables

## `/docs/platforms/:platform`

Platforms:

- Windows
- Linux
- macOS
- Containers
- CI

Each page includes capability matrix and limitations.

## `/docs/troubleshooting/:issue`

Issues:

- Build failures
- Browser failures
- Capture instability
- Port conflicts
- Missing evidence
- Storage pressure
- Containment limitations
- Interrupted-run recovery

Each troubleshooting page uses:

- Symptoms
- Likely causes
- Diagnostic route
- Recovery steps
- Data-retention consequences

## `/docs/development/:topic`

Topics:

- Repository structure
- Native supervisor
- Coordinator
- IPC
- Artifact schema
- Evaluator API
- Rule schema
- Plugin model
- Testing
- Contributing

---

# 23. Route-state contract

Every data-backed route must implement these states.

## Loading

- Route shell renders immediately.
- Operation is named.
- Existing stale data remains visible when safe.

## Empty

- Explain why nothing exists.
- Provide one primary creation or recovery action.
- Do not show placeholder charts.

## Partial

- Completed data remains usable.
- Missing regions are labeled.
- Recommendation controls remain blocked if required evidence is incomplete.

## Failure

- State the failed operation.
- Preserve completed artifacts.
- Offer exact retry or diagnostic action.

## Stale

- Show what changed and when.
- Block actions that require source equivalence.
- Provide recapture or re-evaluation action.

## Restricted capability

- State which platform capability is missing.
- Explain operational consequences.
- Do not imply parity with strong containment.

## Offline

- Local routes remain functional.
- External evaluators or generators show scoped unavailability.

---

# 24. Route guards

| Route family | Guard |
|---|---|
| Project detail | Project exists and path is accessible |
| New run | Project health has no blocking failure |
| Active run | Run exists and session can be reconstructed |
| Compare | At least two valid comparable capture sets |
| Evidence | At least one eligible contender or explicit no-eligible state |
| Decision | Required gates and evidence have resolved |
| Promotion | Recommendation exists, source is fresh, output destination is writable |
| Historical comparison | Two completed runs are selected |
| Rule editor | Rule set is writable or duplicated first |
| Diagnostic process action | Process belongs to the active Render Rivals boundary |

Guard failures render a recovery page inside the normal shell rather than redirecting silently.

---

# 25. MVP route delivery order

## Phase 1 — shell and project setup

1. `/launch`
2. Onboarding routes
3. `/home`
4. `/projects`
5. `/projects/open`
6. `/projects/inspect`
7. `/projects/:projectId`
8. `/projects/:projectId/health`
9. Core project settings

## Phase 2 — run creation and execution

1. New-run wizard
2. `/runs/:runId/overview`
3. Preparation
4. Capture
5. Contender index and detail
6. Timeline
7. Logs drawer

## Phase 3 — comparison and evidence

1. Compare shell
2. Side by side
3. Overlay
4. Gate results
5. Evidence matrix
6. Factor detail
7. Functional evidence
8. Accessibility evidence

## Phase 4 — decision and history

1. Decision
2. No-winner
3. Tie
4. Promotion review and confirmation
5. Runs index
6. Completed-run reconstruction
7. Artifact explorer

## Phase 5 — rules, diagnostics, and public sites

1. Rule library and editor
2. Diagnostics
3. Remaining settings
4. Marketing routes
5. Documentation routes

---

# 26. Wireframe acceptance checklist

A route is ready for high-fidelity design only when:

- its dominant objective is explicit;
- its route guard is defined;
- its shell and template are selected;
- all layout zones are named;
- its primary and destructive actions are placed;
- empty, loading, partial, failure, stale, and restricted states are covered;
- narrow-screen behavior is specified;
- evidence and confidence are not collapsed into unexplained scores;
- promotion cannot occur accidentally;
- all deep-linked entities have stable URLs;
- keyboard and screen-reader reading order matches visual order;
- the route can be reconstructed from canonical run artifacts when historical.
