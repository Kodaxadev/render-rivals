# ADR-0001 — TypeScript Control Plane and Rust Native Supervisor

**Status:** Accepted

## Context

Browser, agent, JSON, and dashboard work favors TypeScript. Windows containment, secure IPC, and process accounting favor Rust.

## Decision

TypeScript owns policy, Git/workspaces, Playwright, evidence, evaluation, accounting, adapters, server, and UI.

Rust owns session supervision, process containment/creation/I/O, resources, terminal signals, secure IPC, and listener ownership.

Use sidecar protocol, not N-API.

## Consequences

Positive: first-class browser/agent integration, reliable Windows control, narrow native surface, crash isolation.

Negative: two-language build, protocol tests, native packaging.

## Supersedes

Rust-as-later-optional drafts.
