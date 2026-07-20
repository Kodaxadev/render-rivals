# ADR-0007 — Files and Append-Only Events Are Canonical

**Status:** Accepted

## Context

Early workflow/schema change is frequent; database-first hides evidence and adds migration burden.

## Decision

Canonical JSON, NDJSON, binary logs, screenshots, traces, and patches. Later SQLite is rebuildable index.

## Consequences

Easy inspection/export and crash evidence; slower global queries later.
