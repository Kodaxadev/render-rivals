# 01 — Scope, Vocabulary, Requirements, and Invariants

**Status:** Canonical implementation contract  
**Shared vocabulary:** `schemas/domain-types.ts` and `spec/12-cross-spec-normalization.md`  
**Resolved scaffold decisions:** `docs/SCAFFOLD-DECISION-REGISTER.md`

## 1. Purpose

This specification defines the product boundary and the rules every implementation must preserve. It separates the quality hypothesis from runtime machinery.

## 2. Product hypothesis

Given a qualified current implementation and one or more independently prepared contenders:

1. hard-gate every candidate;
2. collect comparable evidence;
3. evaluate eligible candidates pairwise;
4. retain the current implementation when improvement is ambiguous;
5. recommend a contender only when evidence indicates a material improvement;
6. require an explicit user decision before any candidate adoption or Promotion.

Ordinary report, diagnostic, and evidence Export Operations may be created without accepting a Contender when their source integrity and redaction policy permit them.

The first question is whether this process produces better decisions. Token efficiency, runtime, and integration breadth are secondary until the quality mechanism demonstrates value.

## 3. Product statement

Render Rivals is a local-first acceptance and comparison layer for frontend changes produced manually or by coding agents.

It does not claim to be a universal designer. It coordinates source snapshots, isolated workspaces, builds, browsers, tests, evidence, evaluators, policy, and human decisions.

## 4. Primary user

The initial user:

- already has a frontend repository;
- can run it locally;
- may use coding agents outside Render Rivals;
- wants stronger visual and interaction outcomes;
- does not want to coordinate worktrees, screenshots, comparisons, and rollback manually;
- accepts substantial evaluator usage while proving the method.

## 5. Experiment scope

The first personal preference-fit experiment is scoped to Justin's repositories and preferences. A successful personal experiment does not establish general OSS efficacy.

The packaged scaffold fixture is defined in `docs/SCAFFOLD-DECISION-REGISTER.md` and exists to validate the product mechanism, not to prove general design quality.

## 6. Canonical vocabulary

### Current implementation

The accepted reference implementation. It is tied to an immutable Source Snapshot, buildable, renderable, recaptured in the current valid Capture Epoch, and eligible for retention.

### Contender

An alternate implementation evaluated against the current implementation.

### Candidate

The current implementation or a contender.

### Hard gate

A deterministic or policy condition that can make a candidate ineligible before aesthetic recommendation.

Examples:

- source or workspace mismatch;
- dependency-policy violation;
- build or required test failure;
- serious accessibility regression;
- route or required state unavailable;
- protected path modified;
- repeated candidate-local page crash;
- listener not owned by the candidate group where ownership is required;
- incomplete or invalid evidence.

### Protected regression

A material loss that visual improvement cannot offset, including harder primary workflow, missing required state, obscured content, keyboard-access regression, fabricated information, failed functional behavior, or broken responsive behavior.

### Evidence bundle

Registered canonical artifacts and cited Evidence Records for one Candidate in one Run.

### Capture Epoch

One browser-process and environment boundary within which selectable captures are produced.

### Recommendation

The deterministic policy conclusion using `RecommendationOutcome`. It does not modify source.

### User Decision

The explicit human response using `UserDecisionAction`.

### Promotion

A non-destructive candidate-adoption handoff authorized by a nonstale User Decision. Promotion may create a patch, local branch, or preserved Workspace. Promotion never means automatic merge and never includes ordinary report or diagnostic export.

### Export Operation

A non-adoption output operation that may create reports, diagnostics, evidence bundles, screenshots, configuration templates, or selected logs. It does not imply Contender acceptance and need not identify a Candidate when its kind does not require one.

### Recovery disposition

A classification describing whether and how a durable Run can resume. Recovery is not a special mutable Run state.

### Opportunity rate

The proportion of candidate sets containing a human-preferred contender.

### Selector uplift

Quality advantage over random eligible selection using the same artifacts.

Explanatory aliases such as champion and challenger are mapped in `spec/12` and are forbidden in persisted schemas and stable APIs.

## 7. Product modes

### Exploratory personal

Determine whether the approach helps the owner's projects and exposes obvious selector failure. No universal safety claim.

### External exploratory

Test unfamiliar tasks with outside raters and less owner steering.

### Confirmatory benchmark

Freeze protocol and thresholds, then use new tasks and raters in a reproducible environment.

### Product mode

Ordinary repository use. Broader generation, multi-contender rounds, CI integration, and teams are outside the first MVP.

## 8. Functional requirements

- `FR-001` Refuse optimization until a qualified current implementation exists.
- `FR-002` Baseline repair occurs in a separate recovery workflow or superseding Run; it is not a contender design pass and must be accepted before becoming the current implementation.
- `FR-003` Every contender uses an isolated workspace or equivalent immutable materialization.
- `FR-004` Required ignored or untracked state is declared and materialized explicitly.
- `FR-005` The coordinator runs under the exact Node executable used by the npm bootstrap.
- `FR-006` Every Session records actual containment capability.
- `FR-007` The first scheduler executes one candidate workload at a time.
- `FR-008` The current implementation is recaptured in every selection Run.
- `FR-009` A comparison cannot mix Capture Epochs.
- `FR-010` The first meaningful route includes populated/default, empty, and unavailable/error states plus one critical interaction.
- `FR-011` Mandatory gate failures never reach aesthetic recommendation.
- `FR-012` Candidate quality is judged pairwise rather than through one unexplained universal score.
- `FR-013` Model-backed pairwise evaluation supports reversed candidate order.
- `FR-014` `tie`, `human_review_required`, and `invalid_run` are ordinary canonical outcomes.
- `FR-015` Experimental analysis can compute random eligible-selection control from the same candidate set.
- `FR-016` Experimental analysis includes an always-retain-current control.
- `FR-017` Experimental analysis may calculate a human-preferred eligible oracle after ratings.
- `FR-018` Generation, critique, selection, tie-break, runtime, local resources, and human time are accounted separately where observed.
- `FR-019` Canonical artifacts remain readable without a database.
- `FR-020` Coordinator interruption leaves enough evidence to classify the Run and clean verified owned resources.
- `FR-021` Cleanup explicitly lists remaining processes, endpoints, workspaces, temporary paths, and verification limitations.
- `FR-022` Only the expected coordinator may authenticate to a supervisor Session.
- `FR-023` Supervised project and evaluator processes do not receive user Ctrl+C directly.
- `FR-024` Process requests use executable plus argument array, never implicit shell strings.
- `FR-025` Candidate listener ownership is verified where supported and required by frozen policy.
- `FR-026` Browser crash, disconnect, or browser identity loss invalidates the complete active Capture Epoch.
- `FR-027` The current implementation is sampled more than once to detect gross uncontrolled variation.
- `FR-028` Passing the stability probe is explicitly not proof of determinism.
- `FR-029` Secrets do not enter evaluator packets, patches, standard exports, or structured logs.
- `FR-030` Exploratory implementation never modifies or merges into the accepted branch automatically.
- `FR-031` Candidate-local failures do not invalidate an otherwise continuous browser epoch unless comparison integrity was compromised.
- `FR-032` Re-evaluation and changes to sealed source, fixture, gates, factors, or policy create a new or superseding Run.
- `FR-033` CLI and dashboard commands call the same domain services and state transitions.
- `FR-034` General Export Operation is distinct from User Decision and Promotion.

## 9. Nonfunctional requirements

- `NFR-001` Code, workspaces, captures, logs, preferences, and reports remain local unless a declared external evaluator receives an allowlisted packet.
- `NFR-002` Every Recommendation identifies candidates, gates, evidence, order-reversal result, limitations, policy version, and usage where known.
- `NFR-003` Unsupported repository classes and unavailable capabilities fail explicitly.
- `NFR-004` Avoid distributed infrastructure and generic workflow frameworks.
- `NFR-005` Published benchmarks pin runtime, browser, fonts, locale, time zone, fixture, and dependencies.
- `NFR-006` Ordinary experiments do not require Docker.
- `NFR-007` UI and manifests expose actual containment level.
- `NFR-008` Vendor assumptions include a dated policy snapshot.
- `NFR-009` Process output is drained continuously and retained per process under explicit limits.
- `NFR-010` Workloads do not start when resource admission fails.
- `NFR-011` Configuration, CLI, and local API behavior follow specs 13, 16, 17, and 19.

## 10. Core invariants

- `INV-001` Rust alone interprets user terminal interrupt as Session shutdown intent.
- `INV-002` Rust launches the coordinator using the canonical Node path supplied by bootstrap.
- `INV-003` Supervisor endpoint and nonce never appear in coordinator argv.
- `INV-004` Coordinator does not share the user's interactive console on Windows.
- `INV-005` Managed project/evaluator roots do not share the user's interactive console.
- `INV-006` Every managed root process belongs to a declared containment group; approved descendants must inherit and verify membership according to `docs/SCAFFOLD-DECISION-REGISTER.md`.
- `INV-007` A selector packet cannot contain mixed-epoch evidence.
- `INV-008` Compared candidates share fixture and environment identity.
- `INV-009` Prior-run current captures are forbidden for selection.
- `INV-010` Mandatory gate failure cannot produce `contender_recommended`.
- `INV-011` Ambiguous automation produces `current_retained`, `tie`, or `human_review_required` according to policy.
- `INV-012` User Decisions are explicit, typed, append-only, and bound to nonstale hashes.
- `INV-013` Deleting an index cannot delete canonical history.
- `INV-014` Normalized provider records never replace raw provider output.
- `INV-015` Missing token or cost data remains `null`.
- `INV-016` At most one candidate workload and one browser process are active in the MVP.
- `INV-017` No pre-disconnect capture is reused after epoch invalidation.
- `INV-018` Strong containment is measured, not inferred from platform name.
- `INV-019` Linux strong mode requires delegated ownership and a verified kill boundary.
- `INV-020` Stability samples are evidence, not guarantees.
- `INV-021` Recommendation is not Promotion, User Decision is not export, and Export Operation is not adoption.
- `INV-022` Terminal business outcome never hides cleanup status.
- `INV-023` A candidate-local failure cannot silently alter or invalidate evidence belonging to another candidate.

## 11. Quality-first policy

Token use is not an early kill criterion. The system may use critique, order reversal, bounded tie-breaks, refinement outside the sealed Run, and human review. Usage is recorded from the first Run.

## 12. Experimental conditions

- A: base agent or manually prepared contender.
- B: strong design-skill contender.
- C: linear rendered critique and repair.
- D: current-versus-contender selection.
- E1: expected random eligible selection.
- E2: always retain current.
- Oracle: human-preferred best eligible candidate.

These labels are research conditions, not persisted Candidate roles.

## 13. Interpretation limits

A small study can expose false recommendation, inertia, excessive escalation, failure against linear refinement, or operational instability. It cannot certify a production false-recommendation rate.

## 14. First platform and scope

Reference platform:

- Windows 11 x64 strong Job Object mode.

First repository scope:

- one repository;
- one meaningful route;
- three states;
- mobile and desktop;
- one critical interaction;
- one independently prepared contender;
- one evaluator or human-only mode;
- one workload at a time;
- one Chromium per valid epoch;
- recommendation plus explicit decision;
- filesystem artifacts only.

## 15. Explicitly unsupported in MVP

- automatic merging;
- in-run contender generation;
- unknown untracked state;
- nonisolatable machine-global services;
- required Windows Job breakaway;
- strong native macOS claims;
- unbounded parallelism;
- cross-run capture evidence used for selection;
- evaluator claims without cited evidence;
- run pause/suspend;
- multi-contender tournament rounds;
- cloud collaboration or hosted storage.

## 16. Scaffold decisions

Historical `OPEN-*` questions are resolved, deferred, or assigned to milestones in `docs/SCAFFOLD-DECISION-REGISTER.md`. Implementers must not invent alternative answers without updating that register and, where architectural, an ADR.
