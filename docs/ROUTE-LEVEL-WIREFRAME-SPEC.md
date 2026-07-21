# Render Rivals Route-Level Wireframe Specification

**Status:** MVP route and layout contract  
**Applies to:** Local browser application  
**Product availability:** `docs/PRODUCT-UI-SCENE-PLAN.md`  
**Commands/API:** `spec/13-configuration-cli-and-local-api-contracts.md`

## 1. Rules

1. Every route has one dominant objective.
2. Every mutation maps to a legal command and current durable state.
3. Command acceptance is not displayed as completion.
4. Recommendation is not styled as Decision, Promotion, or deployment.
5. Report/diagnostic export is not styled as contender Promotion.
6. Current/Contender labels remain visible in comparison.
7. Loading names the actual operation.
8. Empty, partial, stale, failure, recovery, safe-mode, and restricted-capability states are designed.
9. No route directly edits canonical files.
10. No MVP Pause command appears.
11. Changed sealed source/configuration creates a superseding Run.
12. Post-MVP routes are not registered in the MVP router.

## 2. Breakpoints

| Mode | Width | Behavior |
|---|---:|---|
| Restricted compact | <960px | Operational lists/settings usable; comparison warns that larger width is required |
| Compact | 960–1199px | Collapsed sidebar, stacked rails |
| Standard | 1200–1599px | Default |
| Wide | >=1600px | Optional evidence rail/expanded canvas |

## 3. Shell

```text
┌ Context: Project · Snapshot · Run · Session health · Commands ┐
├──────────────┬──────────────────────────────────────────────────┤
│ Home         │ Optional Run subnavigation                      │
│ Projects     ├──────────────────────────────────────────────────┤
│ Runs         │ Main route                                      │
│ Artifacts    │                                                  │
│ Diagnostics  │                                                  │
│ Settings     │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

MVP sidebar excludes Rule Sets until their domain/schema implementation exists.

Run subnavigation: Overview, Contenders, Compare, Evidence, Decision, Timeline.

Preparation/Capture are operational routes linked from Overview.

## 4. Reusable templates

### Index

Title/description, one primary action, filters, list/table, optional summary rail.

### Entity overview

Breadcrumb, title/status, metadata, legal primary action, main content, health/warnings/activity rail.

### Wizard

Persistent step list, current step form, provenance/risk rail, Back/Save/Continue. Save applies to draft/template only.

### Active operation

```text
┌ Operation · durable state                          [Cancel] ┐
│ Current operation · Attempt · checkpoint · warnings        │
├──────────────────────────────┬───────────────────────────────┤
│ Preview/step/Candidate       │ Process/resource/Epoch rail  │
├──────────────────────────────┴───────────────────────────────┤
│ Events and scoped logs                                      │
└──────────────────────────────────────────────────────────────┘
```

Legal secondary actions: hide preview, open logs, retry permitted operation, perform allowed recovery. No Pause.

### Evidence workspace

Candidate rail, synchronized comparison canvas, evidence rail, details/provenance drawer.

### Settings

Section navigation, grouped controls, Reset/Save. Settings that would change a sealed Run show “Create new Run” rather than mutate it.

## 5. Launch/onboarding

### `/launch`

Full-window operation list, elapsed operation, component versions, logs, Retry only when legal.

Safe Mode shown only after native supervisor/coordinator authenticate. Native startup failure offers installation diagnostics, not safe mode.

### `/onboarding/welcome`

Product statement, local-first principles, workflow diagram, Set up, Documentation, Exit.

### `/onboarding/permissions`

Rows for Project commands, filesystem roots, browser automation, ports, external evaluator transmission, and retention. Each explains scope and exclusion.

### `/onboarding/runtime`

Checks OS, exact Node, supervisor, containment, browser descendants, Git, data root, storage, ports. Labels Ready/Limited/Blocked. Limited cannot satisfy a Run requiring stronger policy.

### `/onboarding/storage`

Data root, retention, reserve, raw-log policy, export destination defaults. Warn when filesystem lacks required atomic semantics.

### `/onboarding/complete`

Open Project, Sample Fixture, Workflow Guide.

## 6. Home and Projects

### `/`

Recent Projects, interrupted Runs, Decisions, Promotions, Export Operations, health, disk warnings. Primary Open Project.

### `/projects`

Project list with root, trust, framework, Git, recent Run, health. Primary Open Project.

### `/projects/open`

Filesystem picker and detection. Warnings for nested repo, dirty state, missing commands, unsupported side effects. Actions Review Configuration or Cancel.

### `/projects/:projectId`

Project identity, current Snapshot, health, recent Runs/Artifacts, pending Decisions. Primary New Run.

### `/projects/:projectId/health`

Check rows: source/Git, dependencies/build, server/readiness, containment/browser, fixture/states/interaction, storage. Retry is a doctor/health operation, not a Run mutation.

### `/projects/:projectId/settings`

Commands, environment/secrets, route/fixture, viewports/interaction, source policy, Artifacts/retention, limits, privacy, danger.

### `/projects/:projectId/remove`

Explicit registration-only or registration+owned-data removal. Source excluded.

## 7. New Run wizard

Root redirects to first incomplete step.

### `/projects/:projectId/runs/new/intent`

MVP mode fixed to Existing implementations. Name, objective, brief, success criteria.

“Re-evaluate previous” is an entry action that creates a new draft populated from prior provenance; it is not an in-place mode.

Generated/combined modes are absent in MVP.

### `/projects/:projectId/runs/new/scope`

One route, populated/empty/unavailable states, desktop/mobile, critical interaction, deterministic authentication/seed fixture where used.

Entire-app/component/section/arbitrary multi-route controls absent in MVP.

### `/projects/:projectId/runs/new/baseline`

Current Source Snapshot/working-tree snapshot, commit/patch, staleness, preview, recapture warning.

### `/projects/:projectId/runs/new/contenders`

Exactly one Contender from branch, commit, worktree, folder snapshot, patch, or prior Candidate snapshot. Validation state and remove-before-seal action.

Generated/manual URL/duplicate-live-edit absent in MVP.

### `/projects/:projectId/runs/new/environment`

Desktop/mobile, device scale, one theme, locale/time zone, reduced motion, clock/random/data fixture. Shows capture/artifact estimate.

### `/projects/:projectId/runs/new/gates`

Groups by pre-capture, runtime/capture, post-capture. Gate row shows required/advisory, evidence dependency, threshold, retry, capability, blocking effect.

### `/projects/:projectId/runs/new/evaluation`

Factors with weight, evidence, confidence, missing-data, tie, protected status. Validates sum and capability.

### `/projects/:projectId/runs/new/limits`

Timeouts, memory/process/output/disk, retry budget, capability enforcement.

### `/projects/:projectId/runs/new/review`

Summary, source/fixture/gates/evaluation/limits, external data flow, capture/storage estimate, risks, validation.

Actions Back, Save Template, Validate/Start.

## 8. Runs

### `/runs`

Filters by Project/state/outcome/date. Shows cleanup/integrity incidents separately from business outcome.

### `/runs/:runId/overview`

Run name, durable state, checkpoint, Cancel if active, current operation, Candidate Attempt, viewport/step, Epoch/browser/process/resources, warnings, recent Events.

Legal recovery/retry buttons are derived from API allowed commands.

### `/runs/:runId/preparation`

Workspace, dependency, build/test, launch, ownership/readiness. Each step shows Attempt, result, Artifacts, retry legality.

### `/runs/:runId/capture`

Preview, Candidate/source, state/viewport/step, Epoch, browser continuity, matrix progress, Artifact commit state. Candidate-local failure and Epoch invalidation use distinct banners.

### `/runs/:runId/contenders`

Current + Contender rows/cards: role, source, Attempt, eligibility, phase, gates, capture, changes, failure.

### `/runs/:runId/contenders/:candidateId`

Summary, Source, Captures, Gates, Evidence, Logs, Artifacts.

Actions:

- Retry identical operation when legal;
- Create Superseding Run for revision;
- Open Workspace read-only;
- Export selected diagnostics via Export Operation.

No arbitrary post-seal Exclude or in-place Duplicate/Revise.

### `/runs/:runId/contenders/:candidateId/source`

Changed files, patch, dependencies, protected paths, manifest/hash/provenance.

### `/runs/:runId/contenders/:candidateId/captures`

State/viewport/step filters. Preview plus DOM/accessibility/geometry/styles/console/network/metadata and validity.

### `/runs/:runId/contenders/:candidateId/gates`

Phase, exact assertion, evidence, Attempt/supersession, timestamp, blocking effect.

### `/runs/:runId/timeline`

Canonical Event stream with sequence, time, actor/process, entity, operation, Artifact, failure code. Detail drawer; no mutation.

## 9. Compare and Evidence

### `/runs/:runId/compare`

Redirects to side-by-side in MVP.

### `/runs/:runId/compare/side-by-side`

Candidate A/B, route/state/viewport/interaction step, synchronized frames, pinned labels, validity, Gate/Evidence rail, metadata/provenance drawer.

Compact mode stacks frames with A/B switch and position indicator.

Overlay/difference/flicker/annotations routes are not registered in MVP.

### `/runs/:runId/evidence`

Factors, Verdict, confidence/null, citations, protected regressions, conflicts, missing evidence, Recommendation state, provenance/order reversal.

Actions: legal retry, Human Review, Create Superseding Run, Export Report/Evidence.

### `/runs/:runId/evidence/:factorId`

Definition, weight/protected status, required Artifacts, verdicts, citations, limitations, validation, conflicting evidence.

No post-seal factor exclusion/edit.

## 10. Decision, Promotion, Export

### `/runs/:runId/decision`

Recommendation outcome, eligible Candidate, source changes, Gates, supporting/contrary evidence, limitations, staleness.

Allowed Decision actions are filtered by outcome and one-contender MVP. Select-other absent.

Promotion panel appears only after authorizing Decision and offers Patch, Local Branch, Preserve Workspace.

General Export panel offers Report, Evidence Bundle, Screenshots, or selected logs without implying acceptance.

### `/promotions/:promotionId`

Candidate, Decision, type, preconditions, destination, output Artifacts, verification, failure/retry. Never report/diagnostics.

### `/exports/:exportOperationId`

Kind, owner scope, source entities, redaction, omissions, destination, Artifacts, verification, status. Candidate optional/usually absent.

## 11. Artifacts and Diagnostics

### `/artifacts`

Filters by Project/Run/Candidate/Epoch/class/validity/sensitivity/retention.

### `/artifacts/:artifactId`

Preview/download when safe, hash, owner, operation/event, citations, validity, sensitivity, retention. Raw sensitive content requires explicit local warning.

### `/diagnostics`

Session/components/capabilities/storage/integrity/cleanup/recent failures. Diagnostic export creates Export Operation.

### `/diagnostics/processes`

Stable Process Record/group plus PID observation, executable/purpose, containment, resources, output, endpoints.

### `/diagnostics/ports`

Endpoint, state, owner Process/Group, ownership confidence, conflicts.

### `/diagnostics/browser`

Browser version/process, containment descendants, Epoch, contexts/pages, disconnect/crash history.

### `/diagnostics/storage`

Data/cache roots, filesystem semantics, free/reserve, large Artifacts, orphan/quarantine, integrity/cleanup.

## 12. Settings

MVP routes:

```text
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

Settings update defaults/templates, never sealed Run Configuration.

Integrations, Notifications, Updates, and Rule Sets are post-MVP routes and absent from router.

## 13. Route guards

- Project routes require registered Project.
- Run routes require matching Run.
- Compare/Evidence require valid or diagnostic evidence state.
- Decision requires Recommendation or explicit invalid terminal reason.
- Promotion requires authorizing nonstale Decision and selected eligible Candidate.
- Export requires source integrity/redaction capability appropriate to kind.
- Mutation routes disabled in safe mode except verified cleanup/recovery.
- Completed/terminal Runs are read-only except independent Promotion retry, Export Operation, cleanup, and deletion.
- Stale revisions return refresh/conflict UI; no optimistic overwrite.

## 14. Required state matrix

Every route implements applicable:

- loading;
- empty;
- partial;
- failure code;
- recovery/allowed actions;
- stale revision/source;
- safe mode/read-only;
- restricted capability;
- SSE disconnected/reconnecting/gap-refetch;
- cleanup incident;
- deleted/missing entity.

## 15. Accessibility and keyboard

- logical landmarks/headings;
- visible focus;
- full keyboard wizard/dialog/table navigation;
- comparison controls outside local scroll traps;
- no color-only status;
- reduced-motion treatment;
- screen-reader labels for Candidate role/validity;
- destructive confirmations identify exact entity/effect;
- live progress announcements throttled and nonrepetitive.

## 16. MVP routes

The exact MVP route list is the inventory in `docs/PRODUCT-UI-SCENE-PLAN.md`. Any new route requires availability classification, domain command mapping, guard/state matrix, and update to both documents.
