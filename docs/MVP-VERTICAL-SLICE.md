# Render Rivals MVP Vertical Slice

**Status:** Implementation contract  
**Target:** First end-to-end usable alpha  
**Primary platform:** Windows 11 x64 strong-containment reference path  
**Depends on:** Specs 01–14, accepted ADRs, shared schemas/error codes, failure/recovery matrix, test strategy, threat model, and route wireframes

## 1. Product claim

> Given a qualified current local frontend implementation and one existing Contender, Render Rivals can execute them under controlled conditions, collect equivalent meaningful states and interaction evidence, reject invalid or regressive work, produce a cited pairwise Recommendation, record explicit User Decision, and create safe non-destructive outputs without silently modifying the active Project.

The MVP is the smallest trustworthy comparison loop, not a general autonomous design system.

## 2. Primary user

A solo frontend developer or AI-assisted builder who:

- has a local Git repository;
- can prepare an alternate implementation outside Render Rivals;
- wants repeatable evidence rather than memory or one screenshot;
- needs functional/protected regressions blocked before visual judgment;
- wants evidence, uncertainty, Recommendation, Decision, and output history retained locally.

## 3. Golden path

1. Launch bootstrap and verified native supervisor.
2. Supervisor launches coordinator using exact bootstrap Node.
3. User registers/trusts a local Git Project.
4. Render Rivals resolves commands, source policy, route, fixture, states, viewports, interaction, Gates, protected paths, evaluator, limits, and storage.
5. User selects one current Source Snapshot and one Contender Snapshot.
6. Validation seals immutable source and Run Configuration.
7. Coordinator creates isolated Workspaces outside active repository.
8. Supervisor prepares dependencies/build/tests and candidate servers sequentially.
9. Pre-capture Gates resolve source/build/readiness.
10. Playwright opens one contained Capture Epoch.
11. Current implementation receives two-sample gross stability probe.
12. Current and capture-capable Contender receive identical required matrix.
13. Candidate-local failures retry/fail locally without destroying valid evidence for the other Candidate.
14. Runtime/post-capture Gates resolve eligibility and evidence completeness.
15. Ineligible Contender skips aesthetic evaluation and produces deterministic current-retained path.
16. Eligible Candidates receive immutable pairwise packets.
17. Model-backed selector runs A/B and reversed B/A, or human-only review uses same packet.
18. Deterministic policy creates canonical Recommendation.
19. User reviews source, Captures, interaction, Gates, Evidence, contrary findings, uncertainty, and Recommendation.
20. User records canonical User Decision.
21. If adoption authorized, Promotion creates patch, local branch, or preserved Workspace.
22. General Export Operation may create report/evidence/diagnostics without implying adoption.
23. Events/files reconstruct Run without database; cleanup/integrity remain explicit.

## 4. Supported Project shape

Required:

- qualified local Git repository;
- npm, pnpm, or yarn target Project;
- browser application reachable on localhost;
- deterministic development command;
- one route;
- populated/default, empty, and error/unavailable states;
- one reproducible critical interaction;
- controllable or deterministically replaced dependencies;
- stable readiness/settle policy;
- no required privileged machine-global changes;
- supported source/workspace semantics from spec14.

Release-blocking fixture is Vite TypeScript `/dashboard`.

Authentication-heavy Projects require deterministic fixture authentication without canonical plaintext credentials. Interactive login recording is deferred.

## 5. Source inputs

Current:

- clean commit; or
- explicit dirty working-tree Snapshot.

Contender:

- branch/commit;
- existing worktree;
- local directory Snapshot;
- patch materialization;
- verified prior Candidate Snapshot.

In-Run generation excluded.

Changed sealed source requires new Snapshot and superseding Run. Render Rivals never stages, commits, stashes, resets, cleans, fetches, pushes, or checks out over active tree automatically.

## 6. Run scope

One MVP Run:

- one Project;
- one current Candidate;
- one Contender;
- one route;
- three states;
- desktop/mobile;
- one critical interaction;
- one fixture/environment identity;
- one active candidate workload;
- one active browser per Epoch;
- one valid selectable Epoch;
- one evaluator or human-only mode;
- one deterministic Recommendation;
- append-only User Decisions;
- optional Promotions/Export Operations.

Reference viewports:

- desktop `1440 × 900`, scale `1`;
- mobile `390 × 844`, scale `1`.

## 7. State and interaction

Required states:

- populated/default;
- empty;
- error/unavailable.

Each declares setup/reset/readiness/selectors/fingerprint/secrets/dependencies.

Interaction vocabulary:

- navigate, click, hover when necessary, focus, fill, select, press;
- wait for selector/response;
- assert visibility/text/URL/enabled/fingerprint;
- capture configured steps.

Same sequence applies to both Candidates.

## 8. Evidence

Per state/viewport:

- screenshot;
- DOM summary;
- accessibility snapshot;
- geometry;
- selected computed styles;
- console/network summaries;
- capture metadata;
- source/fixture/browser/environment/Epoch identity;
- verified hashes.

Interaction additionally records ordered actions/assertions, step Captures, results, final fingerprint, console/network.

Screenshot alone is incomplete.

## 9. Comparison validity

Requires pinned Playwright Chromium, one browser identity per Epoch, fresh contexts, matching fixture/route/state/viewport/locale/time zone/theme/scale/motion, current recapture, two current stability samples, visible exclusions, and no prior-Run selection evidence.

Validity:

- valid;
- limited;
- invalid;
- stale.

Only valid supports automated contender recommendation on reference path.

Browser crash/disconnect/identity loss or wider environment corruption invalidates full Epoch. Candidate-local page/readiness/interaction failure does not alone.

## 10. Gate phases

### Pre-capture

- Source/Workspace integrity;
- protected/dependency policy;
- dependency/build/test;
- process/listener/readiness prerequisites;
- fixture availability.

### Runtime/capture

- route/origin;
- required states/selectors;
- browser/page errors;
- interaction;
- console/network;
- font/settle;
- blank/login/wrong-route.

### Post-capture

- completeness/hash/identity;
- accessibility;
- responsive integrity;
- DOM/geometry/style requirements;
- interaction trace;
- same-Epoch/fixture validity.

Current mandatory failure invalidates baseline. Contender mandatory failure makes it ineligible and may lead to current retained without model judgment.

## 11. Evaluation

Pairwise Factors:

- task/product fit;
- primary-action clarity;
- information hierarchy;
- visual coherence/intentionality;
- responsive quality;
- empty/error-state quality;
- interaction/recovery clarity.

Each returns canonical Verdict, confidence/null, rationale, citations, limitations, protected concerns.

Order reversal uses fresh evaluator Attempt with identical evidence/policy and reversed anonymous presentation.

Recommendation outcomes:

- contender recommended;
- current retained;
- tie;
- human review required;
- invalid Run.

Contender recommendation requires both eligible, valid comparison, valid output/citations, no protected veto, material improvement, stable reversal, threshold, and nonstale inputs.

## 12. Human authority

User Decision actions are canonical six. One-Contender MVP hides select-other.

Decision binds Recommendation/evidence/source/policy hashes. Drift blocks Promotion.

A report Export Operation does not need contender acceptance and is not a Decision.

## 13. UI included

- launch/trust/doctor/safe mode;
- Project setup;
- existing-implementation Run wizard;
- Overview/Preparation/Capture;
- Candidate source/Captures/Gates;
- side-by-side states/viewports/steps;
- Evidence/conflict/missing states;
- Recommendation and Decision;
- Promotion review;
- Export Operation review/history;
- Events/logs;
- recovery/reconstruction;
- Artifacts/Diagnostics/Settings.

No Pause. Generation/rounds/annotations/Rule Sets/integrations are post-MVP.

## 14. Outputs

### Promotion

Requires nonstale authorizing Decision and selected eligible Contender:

- patch;
- local branch;
- preserved Workspace.

### Export Operation

Does not imply adoption:

- report;
- diagnostics;
- Run/evidence bundle;
- screenshots;
- configuration template;
- selected logs.

Forbidden:

- overwrite active tree;
- force reset;
- remote push/PR/merge;
- deployment claims;
- automatic source deletion;
- report represented as Promotion.

## 15. Exclusions

- in-Run generation;
- more than one Contender;
- rounds/parallel workloads;
- automatic repair/merge/replacement;
- hosted/team/remote/CI integrations;
- interactive login recording;
- arbitrary branching journeys;
- annotation authoring;
- pixel difference as quality score;
- marketplace/preference learning;
- containment parity claims;
- canonical database;
- Pause/suspend;
- automatic self-update/background daemon.

## 16. Windows reference acceptance

Requires:

- managed roots and approved descendants inside owned containment;
- full-tree cancellation/cleanup;
- endpoint ownership;
- console isolation/Rust Ctrl+C authority;
- durable recovery;
- stale descendant detection;
- complete matrix and local-failure behavior;
- full recapture after Epoch invalidation;
- packaged-build E2E before public alpha.

Linux/macOS experimental with explicit limitations.

## 17. Durable checkpoints

- validated configuration/source;
- prepared Workspaces and pre-capture results;
- stability samples;
- valid current capture set;
- Contender capture Attempt resolved as complete or terminal local failure;
- valid Epoch seal where selection evidence exists;
- Gate results/eligibility;
- evaluator packet/raw/validation/Evidence;
- Recommendation;
- User Decision;
- Promotion when applicable;
- terminal summary, cleanup, integrity.

Independent post-completion Export Operations are not Run checkpoints.

## 18. Acceptance fixtures

At minimum:

- material improvement;
- no material improvement;
- protected regression;
- three states/mobile regression;
- interaction/accessibility failures;
- Contender build failure retaining current;
- current invalid baseline;
- one page crash retry and repeated Contender crash;
- browser disconnect full Epoch;
- context leak;
- source mutation/stability failure;
- invalid evaluator citation/output/reversal conflict;
- stubborn descendants/PID reuse;
- coordinator crash before/after Epoch seal;
- storage crash at each commit point/tampering;
- stale Decision;
- idempotent branch/patch Promotion;
- report Export Operation without Candidate acceptance.

Full catalog is `docs/TEST-AND-VALIDATION-STRATEGY.md`.

## 19. Security and release gates

- threat model controls implemented/tested;
- local evaluator/Project commands presented as user-authority code, not sandboxed;
- diagnostic/export redaction and omissions;
- package/native/browser integrity;
- license status honest;
- public OSS claims blocked until real license/security/contribution policies.

## 20. Definition of done

A real Project/Contender completes the path without:

- hand-editing canonical files;
- manual worktree coordination/process killing;
- guessing comparison validity;
- trusting unexplained score;
- losing evidence after interruption;
- confusing Recommendation, Decision, Promotion, and Export Operation;
- risking automatic active-branch modification.

A polished screenshot-only demo or happy path without failure/recovery tests is not the MVP.
