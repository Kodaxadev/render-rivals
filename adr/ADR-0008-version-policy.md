# ADR-0008 — Pin Exact Versions at Scaffold Time, Document Support Channels

**Status:** Accepted

## Context

Patch versions in strategy documents stale quickly, while runtime compatibility still needs explicit support.

## Decision

Architecture states channels/policies. Scaffold pins Node, TypeScript, manager, Playwright/browser, Rust, dependencies. New runtime lines enter after matrix passes. No calendar compiler promise.

## Consequences

Fewer stale claims, explicit upgrade work, deliberate engine updates.
