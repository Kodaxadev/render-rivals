# Render Rivals Planning Scope Status

**Status:** Implementation-scope clarification  
**Purpose:** Prevent complete-product ideas, brand concepts, and archived drafts from becoming accidental MVP requirements.

## 1. Authority order

1. accepted ADRs;
2. canonical specifications in the maintained reading order from `README.md` and `DOCUMENT-MANIFEST.md`;
3. shared schema, error, API, Operation, and invariant registries;
4. locked MVP vertical slice;
5. failure/recovery, threat model, test strategy, observability, retention, lock, secret/network, and migration contracts;
6. Product UI and Route Wireframe contracts for enabled MVP surfaces;
7. marketing/brand planning;
8. archive/history only.

Configuration, CLI, local API, safe mode, command idempotency, Promotion, and Export Operation follow specs 13, 16, 17, and 19 even when older planning prose differs.

## 2. MVP-only implementation rule

A feature is scaffolded only when:

- present in MVP contract;
- supported by domain/state/schema;
- has legal CLI/API command when mutable;
- appears as enabled in UI plan/wireframe;
- has required failure/security/tests.

Appearance in an old complete-product diagram is insufficient.

## 3. Deferred product features

Post-MVP unless later milestone/ADR activates them:

- in-Run contender generation;
- combined generated/imported modes;
- multiple Contenders and tournament rounds;
- parallel Candidate workloads;
- Pause/suspend;
- arbitrary multi-route/full-app/component scope types;
- manual external URL as equivalent Candidate;
- historical captures reused for selection;
- annotation/collaboration;
- Rule Sets editor/entity;
- CI/PR automation;
- cloud/team/remote workers;
- Figma/integration marketplace;
- automatic merge/source replacement;
- self-updater/background daemon.

Deferred controls/routes are absent from the MVP router rather than enabled placeholders.

## 4. New Run wizard

Enabled intent:

- compare current implementation with one existing Contender.

Re-evaluate previous creates a new draft Run and new Capture Epoch. It is not an in-place re-evaluation mode.

## 5. Route authority

The Product UI plan owns exact authenticated MVP route inventory and availability. The pre-authentication pairing route is governed separately by `docs/DASHBOARD-PAIRING-ROUTE.md` and spec16. The Route Wireframe specification owns authenticated route geometry, guards, and state behavior. These inventories must be updated together and checked mechanically.

Preparation/Capture and wizard subroutes are intentional MVP decompositions.

## 6. Mutation authority

- retry identical sealed operation → new Attempt when legal;
- change sealed source/fixture/Gate/Factor/policy → superseding Run;
- accept/retain/decline/defer/invalidate → User Decision;
- patch/branch/workspace adoption → Promotion;
- report/diagnostics/bundle/screenshots/config/logs → Export Operation;
- no arbitrary post-seal exclusion/revision;
- no Pause.

## 7. Scaffold decisions

Historical `OPEN-*` items are classified in `docs/SCAFFOLD-DECISION-REGISTER.md`. A milestone decision remains work for that milestone, not an ambiguous invitation for an implementer to choose privately.

## 8. Public claims

Until a real license and release/security requirements exist:

- do not call repository open source;
- do not invite external contributions;
- do not claim signed/notarized/easy installation;
- do not claim cross-platform containment parity;
- do not claim universal design quality or complete WCAG compliance.
