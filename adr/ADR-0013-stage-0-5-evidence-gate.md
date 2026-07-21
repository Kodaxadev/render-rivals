# ADR-0013 — Stage 0.5 Evidence Gate Before Production Scaffold

**Status:** Accepted  
**Date:** 2026-07-20  
**Decision owners:** Render Rivals maintainers

## Context

Render Rivals has a detailed production architecture for process containment, durable storage, recovery, browser capture, evaluation, security, packaging, and local UI. Implementing that architecture requires substantial Rust, TypeScript, browser, schema, fixture, and platform work.

The central product hypothesis remains less mature than the implementation architecture:

> Does controlled evidence collection plus pairwise recommendation produce better frontend adoption decisions than retaining the current implementation, choosing randomly among eligible alternatives, or reviewing alternatives without the Render Rivals protocol?

Building the production supervisor and store before testing that question would commit substantial time to an unproven value mechanism.

The documentation-conformance checker is allowed before this gate because it protects the decision surface and does not assume the product hypothesis is true.

## Decision

Insert **Stage 0.5 — Hypothesis Experiment** between the documentation/decision gate and the production scaffold.

The experiment is governed by `docs/STAGE-0.5-HYPOTHESIS-EXPERIMENT.md`.

Production scaffold work beyond the documentation-conformance checker and explicitly experiment-only harnesses does not begin until Stage 0.5 ends with a recorded `proceed` decision.

Allowed before a `proceed` decision:

- documentation-conformance tooling;
- experiment-only capture/evaluation scripts;
- fixture pages needed solely for the experiment;
- manual or lightweight source/worktree preparation;
- analysis notebooks or scripts that compute frozen experiment metrics;
- corrections required to keep architecture documents internally consistent.

Not allowed before a `proceed` decision:

- treating the Rust supervisor as committed production work;
- building the canonical store, dashboard, local API, migration system, packaging pipeline, or cross-platform runtime as though continuation were already approved;
- representing experiment shortcuts as production containment, durability, recovery, security, or release capability;
- silently converting experiment artifacts into canonical product records.

## Experiment boundary

Stage 0.5 deliberately uses the smallest process capable of testing the value hypothesis. It may use manual worktrees, ordinary local processes, pinned Playwright scripts, filesystem folders, and direct evaluator calls.

It makes no claim of:

- process containment;
- crash-safe durability;
- authenticated local API behavior;
- canonical schema compatibility;
- automatic recovery;
- secure secret isolation beyond the experiment's explicit handling rules;
- package/install readiness;
- public or multi-user safety.

Experiment code is disposable unless it later passes the corresponding production contracts and tests.

## Decision outcomes

Stage 0.5 ends with exactly one recorded outcome:

- `proceed` — evidence meets every required threshold; production scaffold may begin;
- `pivot` — evidence capture or comparison is useful, but the selector/protocol needs another frozen experiment before production scaffold;
- `stop` — observed opportunity or utility does not justify the production architecture;
- `inconclusive` — the sample or execution quality is insufficient; no production scaffold begins.

Only `proceed` opens Stage 1 of the production scaffold.

## Threshold authority

The experiment contract defines default thresholds and requires them to be frozen in the experiment manifest before the first evaluator result or human rating is observed.

Thresholds may not be relaxed after results are known. A changed threshold creates a new experiment ID and must rerun on newly selected or properly held-out tasks.

## Relationship to existing sequence

This ADR amends the sequencing in `spec/08-stack-repository-and-sequence.md`:

```text
Stage 0 — documentation and decision gate
Stage 0.5 — hypothesis experiment
Stage 1 — production schemas and domain primitives, only after proceed
```

Any reading of spec/08 that starts Stage 1 immediately after Stage 0 is superseded by this ADR.

## Consequences

Positive:

- the most expensive implementation work is conditioned on evidence;
- selector failure can be discovered while changes are cheap;
- experiment artifacts provide concrete fixtures for later schemas and acceptance tests;
- the project can stop or pivot without sunk-cost pressure from the runtime architecture.

Negative:

- production scaffold starts later;
- experiment-only scripts may be discarded;
- a small personal experiment cannot prove broad market or population-level efficacy;
- an inconclusive result may require another frozen experiment.

## Required records

The repository must retain:

- the frozen experiment manifest;
- task-selection record;
- source and capture identities;
- evaluator inputs and outputs;
- blinded human ratings;
- control calculations;
- protocol deviations and invalidations;
- final metric table;
- signed or explicitly attributable continuation decision.

These are research records, not canonical product Run records.

## Review rule

Starting production scaffold work without a valid `proceed` record requires a new accepted ADR that explicitly overturns this evidence gate and explains why proceeding on faith is justified.
