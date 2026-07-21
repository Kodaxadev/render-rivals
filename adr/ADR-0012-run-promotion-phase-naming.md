# ADR-0012 — Name the Run Adoption Phase `promoting`

**Status:** Accepted  
**Date:** 2026-07-20  
**Supersedes:** The `exporting` member in the pre-scaffold `RunState` vocabulary and prose that uses Run `exporting` for candidate adoption

## Context

Render Rivals now distinguishes:

- **Promotion** — authorized adoption handoff for one selected Contender through patch, local branch, or preserved Workspace;
- **Export Operation** — non-adoption report, diagnostics, bundle, screenshots, configuration, or logs.

The existing Run state `exporting` predates that distinction. In the Run state machine it is entered only after an authorizing User Decision selects a Contender and it leads to candidate adoption output. Ordinary Export Operations may occur without acceptance and may be created for tied, invalid, failed, cancelled, awaiting-decision, or already completed Runs without changing the analytical Run lifecycle.

Leaving the state named `exporting` would encourage implementations to:

- move a Run into the adoption path for a report download;
- block diagnostics until a Decision exists;
- treat any export as acceptance;
- conflate Export Operation failure with Promotion failure;
- make completed Runs reopen merely to export a bundle.

## Decision

The canonical `RunState` member is:

```text
promoting
```

It replaces:

```text
exporting
```

Run lifecycle meaning:

```text
awaiting_decision -> promoting -> completed
```

`promoting` means a nonstale User Decision has authorized a selected eligible Contender and the Run is executing/verifying a Promotion.

General Export Operations:

- do not transition Run to `promoting`;
- do not reopen terminal Run states;
- have their own `ExportOperationStatus` and Operation record;
- may run concurrently only according to admission/storage policy, without changing the Run analytical state;
- cannot authorize or imply candidate adoption.

Promotion’s own internal status may continue to use `exporting` for the byte/ref creation substep because it is scoped inside a Promotion entity and cannot be confused with Run state.

## State-machine consequences

Canonical transitions become:

```text
awaiting_decision -> promoting | completed | cancelled | interrupted
promoting -> completed | awaiting_decision | failed | cancelled | interrupted
```

- destination/precondition conflict may return Run to `awaiting_decision`;
- successful Promotion enters `completed`;
- ordinary report/diagnostic Export does not alter Run state;
- a completed/failed/cancelled Run remains terminal while Export Operations are created separately;
- recovery checkpoint remains `promotion_completed`, not `export_completed`.

## Schema and migration consequences

- `schemas/domain-types.ts` emits `promoting` only.
- executable `RunState` schema emits `promoting` only.
- no production persisted schema exists yet, so scaffold writer v1 has no compatibility burden.
- any pre-scaffold fixture/prototype value `exporting` maps to `promoting` through an explicit development-fixture migration and is never accepted silently as writer v1.
- documentation conformance rejects `exporting` as a literal Run state outside migration/history contexts.

## API/UI consequences

- UI phase label is `Promoting` or a more specific `Creating patch`, `Creating branch`, or `Preserving workspace`.
- `export.create` does not require or cause Run `promoting`.
- `promotion.create` may cause Run `promoting` after durable authorization/intent.
- API operation status remains separate from Run state.
- no generic “Exporting Run” phase is used for report/diagnostic downloads.

## Rejected alternatives

### Keep `exporting`

Rejected because the domain now has a separate Export Operation with materially different authorization and lifecycle.

### Use `adopting`

Clearer than `exporting`, but Promotion is already the canonical product/entity term and `promoting` maps directly to it.

### Remove the Run phase entirely

Rejected for MVP because Promotion is a durable, recoverable phase that affects terminal completion and needs explicit interruption/recovery behavior.

## Required updates

- shared RunState vocabulary;
- state-machine transition tests/reducers;
- API/UI phase labels;
- recovery mappings;
- stale-token/documentation checks;
- fixtures/migrations before scaffold acceptance.
