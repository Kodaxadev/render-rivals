# ADR-0005 — Sequential Candidate Execution by Default

**Status:** Accepted

## Context

Parallel candidates multiply memory, ports, servers, installs, and cleanup complexity. First hypothesis is quality.

## Decision

One candidate workload and one browser at a time. Candidate generation may also be sequential.

## Consequences

Simpler and slower; candidate independence preserved; bounded concurrency later.
