# ADR-0010 — Maximize Quality First, Record Usage from the Beginning

**Status:** Accepted

## Context

Premature token optimization may create an efficient but mediocre selector. Usage still needs to be measurable from the first experiment.

## Decision

Permit quality-oriented critique, order reversal, bounded tie-breaks, human review, and serious refinement strategies while recording every available model invocation, local process resource, elapsed time, and human-time observation.

The one-Contender MVP does not need in-Run generation or multiple Contenders to honor this decision. Broader search may be added only after the first vertical slice proves value.

## Consequences

Initial Runs may be long and usage-heavy, but later optimization has reliable accounting and quality evidence. Unknown usage remains explicit rather than estimated.
