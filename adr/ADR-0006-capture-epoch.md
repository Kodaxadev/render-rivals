# ADR-0006 — Same-Run Current Recapture and Capture-Epoch Invalidation

**Status:** Accepted

## Context

Cross-Run evidence is contaminated. Loss of browser or shared environment continuity breaks comparison validity.

## Decision

Recapture the current implementation in every Run. Compared evidence shares browser process identity, Playwright/browser version, fixture/environment hash, Capture Plan, and Epoch ID.

Browser crash, disconnect, browser identity loss, context-isolation leak, or environment/fixture drift invalidates the complete active Capture Epoch.

A Candidate-local page/readiness/interaction failure does not invalidate the complete Epoch unless it reveals wider comparison corruption.

## Consequences

More runtime and recapture work, stronger comparability, no stale baseline shortcut, and less unnecessary recapture when only one Contender Attempt fails locally.
