# ADR-0004 — Authenticated Single-Client IPC and File-Backed Process Output

**Status:** Accepted

## Context

Supervisor IPC can spawn arbitrary processes. One NDJSON output stream cannot safely carry all process bytes and control.

## Decision

Use random session endpoint, peer identity, expected PID, nonce, single connection. Use length-prefixed JSON control and separate binary stdout/stderr files with offset events.

## Consequences

Binary-safe durable output and replay; more protocol/security work.

## Supersedes

NDJSON-over-stdio supervisor protocol.
