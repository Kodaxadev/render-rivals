# Render Rivals MVP Vertical Slice

**Status:** Implementation contract  
**Target:** First end-to-end usable alpha  
**Primary platform:** Windows 11 strong-containment reference path  
**Depends on:** Specs 01–12, accepted ADRs, `schemas/domain-types.ts`, the failure-recovery matrix, and the route-level wireframe specification

## 1. Product claim

> Given a current local frontend implementation and one existing contender, Render Rivals can execute both under controlled conditions, capture the same meaningful states and interaction under one valid browser epoch, reject functional and protected regressions, produce a cited pairwise recommendation, and export the selected result without silently modifying the project.

The MVP is the smallest trustworthy comparison loop. It is not a general autonomous design system.

## 2. Primary user

The initial user is a solo frontend developer or AI-assisted builder who:

- has a local Git repository;
- can produce an alternate implementation outside Render Rivals;
- wants repeatable evidence rather than memory or one screenshot;
- needs functional regressions blocked before visual judgment;
- wants evidence, uncertainty, recommendation, and final decision retained locally.

## 3. Golden path

1. Launch Render Rivals.
2. Bootstrap verifies and launches the native supervisor.
3. Supervisor launches the coordinator with the bootstrap's exact `process.execPath`.
4. User opens and trusts a local Git project.
5. Render Rivals resolves commands, route, fixture, states, viewports, gates, protected paths, and evaluator policy.
6. User selects one current source snapshot and one contender snapshot.
7. Validation seals immutable source and Run Configuration identities.
8. Coordinator creates isolated candidate workspaces outside the active repository.
9. Supervisor prepares dependencies, builds, tests when configured, and runs candidate servers sequentially.
10. Playwright opens one capture epoch.
11. Current runs a two-sample gross stability probe in fresh contexts.
12. Current and contender are captured across the identical required state, viewport, and interaction matrix.
13. Mandatory gates resolve eligibility.
14. An ineligible contender skips aesthetic evaluation and produces the deterministic retain-current path.
15. Eligible candidates receive immutable pairwise packets.
16. Model-backed selection runs in A/B and reversed B/A order.
17. Deterministic policy creates one canonical `RecommendationOutcome`.
18. User reviews captures, interactions, gates, evidence, contrary findings, uncertainty, and recommendation.
19. User records one canonical `UserDecisionAction`.
20. Authorized adoption exports a patch or creates a local branch without overwriting the active working tree.
21. Files and append-only events reconstruct the completed run without a database.

## 4. Supported project shape

Required:

- local Git repository;
- npm, pnpm, or yarn project;
- browser-rendered application reachable through localhost HTTP;
- deterministic development command;
- one target route;
- populated/default, empty, and error/unavailable states;
- one reproducible critical interaction;
- controllable or deterministically replaced external dependencies;
- stable readiness and settle policy;
- no required privileged machine-global changes.

The first release-blocking fixture is a Vite TypeScript frontend.

Authentication-heavy projects are supported only when fixture setup establishes authentication without storing credentials in canonical artifacts. Interactive login recording is deferred.

## 5. Source inputs

### Current implementation

Created from:

- clean HEAD; or
- an explicitly captured working-tree snapshot.

### Contender

Accepted from:

- local branch or commit;
- existing worktree;
- selected local directory snapshot;
- patch materialized into an isolated workspace;
- verified prior candidate snapshot.

Agent-driven generation inside Render Rivals is excluded from the MVP.

Source bytes are immutable after validation. Changed source requires a new snapshot and, after execution begins, a superseding Run.

## 6. Run scope

One MVP Run contains:

- one Project;
- one current Candidate;
- one Contender;
- one route;
- three required application states;
- desktop and mobile viewports;
- one critical interaction sequence;
- one fixture identity;
- one color scheme per run;
- one locale and time zone;
- one active candidate workload at a time;
- one valid selection epoch;
- one pairwise evaluator or approved human-only mode;
- one deterministic Recommendation;
- explicit User Decision history.

Reference viewports:

- desktop: `1440 × 900`, scale factor `1`;
- mobile: `390 × 844`, scale factor `1`.

## 7. Required state and interaction matrix

Required states:

- `populated` or `default`;
- `empty`;
- `error` or `unavailable`.

Each declares setup, reset, readiness assertions, required selectors, expected fingerprint, and secret/external dependencies.

The critical interaction supports:

- navigate;
- click;
- hover when semantically necessary;
- focus;
- fill;
- select;
- press;
- wait for selector or response;
- assert visibility, text, URL, enabled state, or final fingerprint;
- capture configured steps.

The same sequence executes for both candidates.

## 8. Required evidence

For each state and viewport:

- screenshot;
- DOM summary;
- accessibility snapshot;
- element geometry;
- selected computed styles;
- console summary;
- network summary;
- capture metadata;
- fixture, source, browser, environment, and epoch identity;
- verified hashes.

For the critical interaction:

- ordered action/assertion trace;
- configured step screenshots;
- per-step result;
- final fingerprint;
- console and network summaries.

A screenshot alone is never complete evidence.

## 9. Comparison validity

The MVP requires:

- pinned Playwright-managed Chromium per epoch;
- one browser process identity per epoch;
- fresh contexts for samples and candidates;
- matching fixture, route, state, viewport, locale, time zone, theme, scale, and motion policy;
- current recapture in the active epoch;
- two current stability samples;
- explicit volatile-region exclusions;
- complete epoch invalidation after browser crash/disconnect;
- no prior-run artifact used for selection.

Validity states:

- `valid`;
- `limited`;
- `invalid`;
- `stale`.

Only `valid` evidence supports automated recommendation in the reference acceptance path.

## 10. Mandatory gates

### Source and workspace

- snapshot/workspace hash match;
- protected paths unchanged;
- dependency policy satisfied;
- workspace remains under owned root.

### Dependency and build

- preparation succeeds;
- build succeeds when configured;
- required tests succeed;
- expected output exists.

### Process and endpoint

- server remains alive;
- expected endpoint belongs to the supervised tree where supported;
- route becomes ready before timeout.

### Route and state

- navigation and local-origin policy pass;
- all required states establish;
- required selectors are visible and nonzero.

### Browser and capture

- browser/context continuity holds;
- matrix and interaction evidence are complete;
- hashes and identities verify;
- blank, wrong-route, and login-redirect captures are rejected.

### Interaction

- every action and assertion succeeds;
- final state fingerprint matches;
- required keyboard-compatible actions remain usable.

### Accessibility

- no configured severe violation is introduced;
- focus visibility and keyboard reachability do not regress;
- required labels and roles remain present.

This is not complete WCAG certification.

### Console and network

- prohibited page exceptions are absent;
- console errors comply with policy;
- required requests succeed;
- undeclared external requests are blocked or surfaced.

A failed mandatory current gate invalidates the baseline. A failed mandatory contender gate makes the contender ineligible.

## 11. Evaluation

The MVP uses pairwise evidence, not an opaque total score.

Factors:

- task and product fit;
- primary-action clarity;
- information hierarchy;
- visual coherence and intentionality;
- responsive quality;
- empty and error-state quality;
- interaction and recovery clarity.

Each factor returns canonical `PairwiseVerdict`, confidence or null, rationale, artifact citations, limitations, and protected-regression concerns.

Protected regressions are vetoes, not weights.

### Order reversal

Model-backed comparison runs twice with candidate order reversed. The evidence set remains identical.

Material disagreement cannot be averaged into certainty.

### Canonical Recommendation outcomes

This document does not define a local TypeScript union. It uses `RecommendationOutcome` from `schemas/domain-types.ts`:

- `contender_recommended`;
- `current_retained`;
- `tie`;
- `human_review_required`;
- `invalid_run`.

Narrative phrases such as “contender recommended” are prose only. Persisted values use the exact enum strings above.

### Policy conditions

A contender may be recommended only when:

- current and contender are eligible;
- comparison validity is `valid`;
- evaluator output passes schema, provenance, coverage, and citation validation;
- no protected regression applies;
- material improvement is proven;
- order reversal is sufficiently stable;
- confidence meets policy;
- source, fixture, evidence, and policy remain current.

No proven improvement maps to `current_retained`.

## 12. Human authority

This document uses `UserDecisionAction` from `schemas/domain-types.ts`:

- `accept_recommendation`;
- `retain_current`;
- `decline_recommendation`;
- `select_other_eligible_candidate`;
- `defer`;
- `invalidate_run`.

The one-contender MVP normally rejects `select_other_eligible_candidate` because no second eligible contender exists.

`exported_without_acceptance` is not valid. Export is a Promotion operation.

A Decision binds to recommendation, evidence, source, and policy hashes. Drift makes it stale.

## 13. UI included

- project launch/trust and doctor status;
- new-run wizard;
- preparation/capture progress;
- state and viewport selector;
- synchronized desktop/mobile comparison;
- critical interaction step navigator;
- gate and evidence detail;
- conflicting/missing evidence states;
- recommendation and no-improvement states;
- explicit Decision review;
- Promotion review;
- event/log timeline;
- interrupted-run recovery;
- completed-run reconstruction.

Generated-contender controls are post-MVP and must be labeled deferred or unavailable.

## 14. Non-destructive outputs

Supported:

- patch export;
- local branch creation;
- workspace preservation;
- sanitized report export.

Forbidden:

- overwrite active working tree;
- force reset;
- remote push;
- pull-request creation;
- merge;
- deployment claims;
- automatic source deletion.

## 15. Exclusions

- contender generation inside the Run;
- more than one contender;
- tournament rounds;
- parallel candidate workloads;
- automatic repair;
- automatic merge or replacement;
- hosted accounts/storage;
- team review;
- remote workers;
- CI/PR checks;
- interactive authentication recording;
- arbitrary branching journeys;
- visual annotation authoring;
- pixel-difference quality scoring;
- plugin/evaluator marketplace;
- preference learning;
- cross-platform containment parity claims;
- canonical database.

## 16. Reference platform acceptance

Windows acceptance requires:

- every launched process in owned containment;
- full-tree cancellation and cleanup verification;
- endpoint ownership attribution;
- console isolation;
- Rust terminal/Ctrl+C authority;
- durable recovery after coordinator loss;
- stale-descendant detection;
- complete state/viewport/interaction matrix;
- complete recapture after epoch invalidation.

Linux and macOS may run experimentally with explicit limitations.

## 17. Recovery requirements

Durable checkpoints include:

- validated configuration/source;
- prepared workspaces;
- stability samples;
- current and contender capture groups;
- valid epoch seal;
- gate results;
- evaluator packets and outputs;
- Evidence Records;
- Recommendation;
- User Decision;
- Promotion result;
- cleanup and integrity result.

Browser continuity is never inferred after restart. Stored PID is never sufficient process identity.

## 18. Acceptance fixtures

Required fixtures cover:

- materially stronger valid contender;
- different but not materially stronger contender;
- protected interaction regression;
- populated/empty/error states;
- mobile-only regression;
- interaction assertion failure;
- severe accessibility regression;
- build/readiness/browser failures;
- source mutation;
- stability failure;
- invalid evaluator citation;
- low confidence;
- order-reversal conflict;
- stubborn descendant cleanup;
- coordinator crash before and after epoch seal;
- interrupted artifact write;
- artifact tampering;
- stale Decision;
- idempotent branch retry;
- non-destructive patch export.

## 19. Definition of done

The MVP is complete when a real project and real contender traverse the full path without:

- hand-editing canonical files;
- manually coordinating worktrees;
- manually killing descendants;
- guessing whether states are comparable;
- trusting an unexplained score;
- losing evidence after interruption;
- confusing Recommendation, User Decision, and Promotion;
- risking automatic modification of the accepted branch.

A polished screenshot-only demo is not the MVP.
