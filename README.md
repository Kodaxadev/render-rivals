# Render Rivals

**Build contenders. Keep the best.**

Render Rivals is a local-first visual optimization and selection harness for AI-assisted frontend development.

It preserves a current implementation as the champion, generates or accepts competing challengers, builds and renders each eligible candidate under comparable conditions, applies functional and accessibility gates, evaluates candidates pairwise using cited evidence, and recommends promotion only when a challenger demonstrates a material improvement.

## Project status

This repository currently contains the canonical architecture specification and accepted architecture decision records. Production scaffolding has not started.

## Canonical reading order

1. [`spec/01-scope-and-invariants.md`](spec/01-scope-and-invariants.md)
2. [`spec/02-runtime-and-bootstrap.md`](spec/02-runtime-and-bootstrap.md)
3. [`spec/03-process-containment.md`](spec/03-process-containment.md)
4. [`spec/04-supervisor-ipc-and-process-io.md`](spec/04-supervisor-ipc-and-process-io.md)
5. [`spec/05-execution-and-capture.md`](spec/05-execution-and-capture.md)
6. [`spec/06-evaluation-and-experiments.md`](spec/06-evaluation-and-experiments.md)
7. [`spec/07-storage-security-and-configuration.md`](spec/07-storage-security-and-configuration.md)
8. [`spec/08-stack-repository-and-sequence.md`](spec/08-stack-repository-and-sequence.md)

Accepted decisions are recorded under [`adr/`](adr/). Official-source verification notes are under [`sources/`](sources/). Earlier Design Warden drafts are retained under [`archive/`](archive/) for historical context only and are explicitly noncanonical.

## Locked architecture

- TypeScript control plane with a narrowly scoped Rust native supervisor.
- JavaScript npm bootstrap outside native containment.
- Rust launches the coordinator with the bootstrap's exact `process.execPath`.
- Rust owns terminal interrupts, containment, process I/O, cleanup, resource enforcement, and native endpoint inspection.
- Windows is the first strong-containment reference platform.
- Linux strong mode requires a delegated systemd user scope and a verified `cgroup.kill` boundary.
- macOS is best effort initially.
- Candidate execution is sequential in the first implementation.
- Every comparison recaptures the champion in the same valid capture epoch.
- A browser disconnect invalidates the complete capture epoch.
- Files and append-only event streams are canonical.
- Automatic merging is out of scope for the exploratory prototype.

## Canonicality rule

When statements conflict:

1. An accepted ADR overrides a general specification statement.
2. A later-numbered ADR overrides an earlier ADR only when it explicitly supersedes it.
3. Canonical specifications override archived material.
4. Code does not silently override the specification; deliberate deviations require an ADR amendment or replacement.

## License

A license has not yet been selected. See [`LICENSE-TBD.md`](LICENSE-TBD.md).
