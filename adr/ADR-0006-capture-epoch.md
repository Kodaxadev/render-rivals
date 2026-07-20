# ADR-0006 — Same-Run Champion Recapture and Capture-Epoch Invalidation

**Status:** Accepted

## Context

Cross-run evidence is contaminated. Browser crash breaks shared environment.

## Decision

Recapture champion every run. Compared evidence shares browser process, Playwright version, fixture hash, and epoch ID. Browser disconnect invalidates full epoch.

## Consequences

More runtime, stronger comparability, no stale baseline shortcut.
