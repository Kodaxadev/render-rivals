# ADR-0003 — Explicit Asymmetric Containment Capabilities

**Status:** Accepted

## Context

Job Objects, cgroups, subreapers, and macOS observation differ materially.

## Decision

Record strong, managed, best effort, or unavailable per session.

Windows uses Job Objects. Linux strong requires delegated systemd scope, owned subtree, `cgroup.kill`, watchdog. Linux managed uses subreaper/tracking. macOS best effort.

Doctor tests detached descendants.

## Consequences

Honest UI and feature gates; more platform-specific code; Windows-first reference.

## Supersedes

Cross-platform parity claims.
