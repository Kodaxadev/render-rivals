# Superseded Runtime Decisions

**Status:** Historical only

## Node-only phase zero

Superseded because judge-only pilot still starts dev servers and Playwright on Windows.

Canonical: Rust is required from first runnable process prototype.

## Selected-child containment

Superseded because Chromium is launched through contained Node.

Canonical: coordinator is ancestor of Playwright and browser membership is verified.

## Root containment per run

Superseded because coordinator/dashboard outlive runs.

Canonical: session root with subordinate run/candidate groups.

## Coordinator terminal ownership

Superseded because Windows console events fan out.

Canonical: Rust owns terminal; coordinator/children use pipes/private PTYs.

## NDJSON stdout protocol

Superseded due binary, interleaving, and backpressure problems.

Canonical: authenticated control IPC and separate binary output files.

## Generic cross-platform containment

Superseded because mechanisms differ.

Canonical: strong, managed, best effort, unavailable.

## Linux arbitrary cgroup creation

Superseded by systemd single-writer rule.

Canonical: delegated user scope, owned subtree, kill probe, watchdog.

## Cached champion evidence

Superseded.

Canonical: same-run same-epoch champion recapture.

## One clock behavior

Superseded.

Canonical: explicit fixed-date versus installed-controlled mode and settle policy.

## Two-capture determinism proof

Superseded.

Canonical: probe detects gross variance only and records sampling limitation.

## Patch pins in architecture

Superseded.

Canonical: channel policy in docs, exact pins in scaffold.

## Selector without random control

Superseded.

Canonical: random eligible, retain, oracle, linear.
