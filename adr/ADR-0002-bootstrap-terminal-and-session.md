# ADR-0002 — JavaScript Bootstrap, Rust Terminal Authority, Exact Node Handoff

**Status:** Accepted

## Context

Npm starts outside containment. Windows Ctrl+C fans out to console-attached processes. PATH shims can resolve a different Node.

## Decision

Use shell → JavaScript bootstrap → Rust → Node coordinator.

Bootstrap passes exact `process.execPath`. Rust launches it exactly.

Rust owns terminal and interrupt policy. Coordinator/children do not inherit user interactive console. Endpoint/nonce use environment, not argv.

## Consequences

Predictable Node, no dev-server Ctrl+C race, one extra process, private PTY requirement for interactive agents.

## Supersedes

Coordinator terminal ownership and PATH Node resolution.
