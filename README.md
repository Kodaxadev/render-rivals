# Render Rivals

> Build contenders. Keep the best.

Render Rivals is a local-first visual optimization harness for AI-assisted frontend work. It compares a qualified current implementation with independently prepared Contenders under controlled conditions, blocks functional and protected regressions, preserves cited evidence, and requires an explicit human Decision before candidate adoption.

## Repository status

**Architecture:** Canonical MVP contracts established  
**Implementation:** Product/runtime remains pre-scaffold; dependency-free documentation conformance is executable  
**Reference platform:** Windows 11 x64 strong-containment target  
**License:** Not yet licensed for general reuse or contribution; see [`LICENSE-TBD.md`](LICENSE-TBD.md)  
**Public packaging:** Not yet available

This repository is an architecture and product implementation baseline, not a shipped product or open-source release yet.

## Product boundary

MVP includes:

- one local Git Project;
- one current implementation and one existing Contender;
- populated, empty, and unavailable/error states;
- desktop/mobile and one critical interaction;
- sequential Workspaces/servers and one contained Chromium per Capture Epoch;
- phased deterministic Gates;
- pairwise evaluator with order reversal or human-only mode;
- deterministic Recommendation and explicit User Decision;
- Run `promoting` phase for patch/local branch/preserved Workspace;
- independent Export Operations for reports, diagnostics, and bundles;
- files, Events, Artifacts, and durable Operations as canonical history;
- complete Capture evidence rather than screenshot-only output;
- safe attachment/escaped Artifact inspection with active content blocked;
- two-phase trash/restore/purge and storage admission without a daemon;
- OS-held locks plus metadata/identity and one active executing Run per Project;
- one manually opened, terminal-paired local dashboard browser Session;
- canonical cross-language JSON/hash/timestamp/measurement formats;
- Session-only secret bindings and explicit network-egress capability;
- staged schema migrations with protected backup and rollback;
- local observability with remote telemetry/crash upload disabled by default.

MVP excludes automatic merge, push, deployment, generation, Pause, cloud service, browser auto-launch, updater, background daemon, multi-client pairing, and platform-parity claims.

Project and local evaluator commands run with the user's operating-system authority. Process containment controls lifecycle/resources where measured; it is not a filesystem/network sandbox.

## Canonical reading order

1. [`spec/01-scope-and-invariants.md`](spec/01-scope-and-invariants.md)
2. [`spec/02-runtime-and-bootstrap.md`](spec/02-runtime-and-bootstrap.md)
3. [`spec/03-process-containment.md`](spec/03-process-containment.md)
4. [`spec/04-supervisor-ipc-and-process-io.md`](spec/04-supervisor-ipc-and-process-io.md)
5. [`spec/05-execution-and-capture.md`](spec/05-execution-and-capture.md)
6. [`spec/06-evaluation-and-experiments.md`](spec/06-evaluation-and-experiments.md)
7. [`spec/07-storage-security-and-configuration.md`](spec/07-storage-security-and-configuration.md)
8. [`spec/08-stack-repository-and-sequence.md`](spec/08-stack-repository-and-sequence.md)
9. [`spec/09-domain-model-and-identifiers.md`](spec/09-domain-model-and-identifiers.md)
10. [`spec/10-run-and-candidate-state-machines.md`](spec/10-run-and-candidate-state-machines.md)
11. [`spec/11-artifact-event-and-schema-contracts.md`](spec/11-artifact-event-and-schema-contracts.md)
12. [`spec/12-cross-spec-normalization.md`](spec/12-cross-spec-normalization.md)
13. [`spec/13-configuration-cli-and-local-api-contracts.md`](spec/13-configuration-cli-and-local-api-contracts.md)
14. [`spec/14-git-source-snapshot-and-workspace-contracts.md`](spec/14-git-source-snapshot-and-workspace-contracts.md)
15. [`spec/15-observability-diagnostics-and-telemetry-contracts.md`](spec/15-observability-diagnostics-and-telemetry-contracts.md)
16. [`spec/16-dashboard-session-authentication-and-pairing.md`](spec/16-dashboard-session-authentication-and-pairing.md)
17. [`spec/17-local-api-envelopes-operations-and-pagination.md`](spec/17-local-api-envelopes-operations-and-pagination.md)
18. [`spec/18-canonical-primitives-json-hashing-and-measurements.md`](spec/18-canonical-primitives-json-hashing-and-measurements.md)
19. [`spec/19-operation-ledger-idempotency-and-reconciliation.md`](spec/19-operation-ledger-idempotency-and-reconciliation.md)
20. [`spec/20-capture-artifact-formats-and-evidence-registry.md`](spec/20-capture-artifact-formats-and-evidence-registry.md)
21. [`spec/21-artifact-serving-preview-and-active-content-security.md`](spec/21-artifact-serving-preview-and-active-content-security.md)
22. [`spec/22-retention-trash-garbage-collection-and-storage-admission.md`](spec/22-retention-trash-garbage-collection-and-storage-admission.md)
23. [`spec/23-locking-leases-concurrency-and-multi-session-ownership.md`](spec/23-locking-leases-concurrency-and-multi-session-ownership.md)
24. [`spec/24-secrets-authentication-state-and-network-egress-policy.md`](spec/24-secrets-authentication-state-and-network-egress-policy.md)
25. [`spec/25-component-upgrades-schema-migrations-backups-and-rollback.md`](spec/25-component-upgrades-schema-migrations-backups-and-rollback.md)

Shared sources and cross-record validation:

- [`schemas/primitives.ts`](schemas/primitives.ts)
- [`schemas/domain-types.ts`](schemas/domain-types.ts)
- [`schemas/error-codes.ts`](schemas/error-codes.ts)
- [`schemas/api-types.ts`](schemas/api-types.ts)
- [`schemas/operation-types.ts`](schemas/operation-types.ts)
- [`schemas/README.md`](schemas/README.md)
- [`docs/RECORD-INVARIANT-MATRIX.md`](docs/RECORD-INVARIANT-MATRIX.md)

Architecture decisions are under [`adr/`](adr/), including [`ADR-0012`](adr/ADR-0012-run-promotion-phase-naming.md). Runtime and capture API verification notes are under [`sources/`](sources/). Historical drafts are under [`archive/`](archive/) and are not implementation inputs.

## Product, development, and release contracts

- [`docs/MVP-VERTICAL-SLICE.md`](docs/MVP-VERTICAL-SLICE.md) — locked first usable path.
- [`docs/FAILURE-RECOVERY-MATRIX.md`](docs/FAILURE-RECOVERY-MATRIX.md) — stable failures, retries, recovery, cleanup.
- [`docs/RECORD-INVARIANT-MATRIX.md`](docs/RECORD-INVARIANT-MATRIX.md) — cardinality, nullability, supersession, retry, and cross-field validation.
- [`docs/TEST-AND-VALIDATION-STRATEGY.md`](docs/TEST-AND-VALIDATION-STRATEGY.md) — fixtures, fault injection, CI, release gates.
- [`security/THREAT-MODEL.md`](security/THREAT-MODEL.md) — trust boundaries, controls, residual risk.
- [`docs/SCAFFOLD-DECISION-REGISTER.md`](docs/SCAFFOLD-DECISION-REGISTER.md) — resolved, deferred, and milestone decisions.
- [`docs/DEVELOPMENT-GAP-REGISTER.md`](docs/DEVELOPMENT-GAP-REGISTER.md) — remaining proof, implementation, and release gaps.
- [`docs/PRODUCT-UI-SCENE-PLAN.md`](docs/PRODUCT-UI-SCENE-PLAN.md) — enabled authenticated UI scenes and MVP inventory.
- [`docs/DASHBOARD-PAIRING-ROUTE.md`](docs/DASHBOARD-PAIRING-ROUTE.md) — only pre-authentication browser route.
- [`docs/ROUTE-LEVEL-WIREFRAME-SPEC.md`](docs/ROUTE-LEVEL-WIREFRAME-SPEC.md) — authenticated route geometry, guards, and state behavior.
- [`docs/PLANNING-SCOPE-STATUS.md`](docs/PLANNING-SCOPE-STATUS.md) — MVP versus post-MVP authority.
- [`docs/MARKETING-AND-DOCS-SITE-PLAN.md`](docs/MARKETING-AND-DOCS-SITE-PLAN.md) — public claim gates.
- [`docs/PACKAGING-DISTRIBUTION-AND-UPDATES.md`](docs/PACKAGING-DISTRIBUTION-AND-UPDATES.md) — package, release, and license blockers.
- [`conformance/README.md`](conformance/README.md) — checker scope and commands.
- [`conformance/check-core.mjs`](conformance/check-core.mjs) — class-specific conformance logic.
- [`conformance/check.mjs`](conformance/check.mjs) — stable clean-tree CLI.
- [`conformance/check.test.mjs`](conformance/check.test.mjs) — mutation-based regression suite.
- [`conformance/fixtures/documentation-drift-regression.json`](conformance/fixtures/documentation-drift-regression.json) — real pre-repair drift cases.

Run:

```text
node conformance/check.mjs
node --test conformance/check.test.mjs
```

Brand exploration is under [`brand/`](brand/) and is not an architecture input.

## Canonicality rule

When statements conflict:

1. accepted ADRs control deliberate architecture decisions;
2. `schemas/primitives.ts` and spec18 control canonical wire primitives and canonicalization;
3. shared domain/error/API/Operation sources control vocabulary they define;
4. canonical specifications control implementation behavior according to spec12's delegated authority;
5. the Record Invariant Matrix controls cross-record combinations;
6. the MVP contract narrows the first release without weakening invariants;
7. failure, security, test, observability, retention, lock, secret/network, and migration contracts control required negative behavior and proof;
8. UI documents expose only legal enabled commands;
9. marketing, brand, and archive never override implementation;
10. code deviations require matching specification and ADR changes where architectural.

ADR-0011 is incorporated history. ADR-0012 changes the Run adoption state from `exporting` to `promoting`; Promotion and Export Operation internal `exporting` statuses remain valid.

## Locked ownership and safety decisions

- Minimal JavaScript bootstrap remains outside containment; Rust launches the exact bootstrap Node.
- Rust owns terminal, managed root launch, containment, process I/O, resource enforcement, listener ownership, and verified termination.
- Approved descendants such as Playwright Chromium are allowed only with verified containment inheritance.
- The ordinary dashboard browser is manually opened and never placed in Render Rivals containment.
- Dashboard access uses randomized-host one-time pairing and a host-only HttpOnly Session cookie.
- Windows 11 x64 is the first strong reference; Linux and macOS claims are measured and explicit.
- MVP scheduling is sequential and the Project execution lease permits one active executing Run per Project across Sessions.
- Current implementation is recaptured in each selection Run.
- Browser continuity failures invalidate the full Epoch; Candidate-local failures do not unless comparability is compromised.
- Canonical screenshot is PNG; ARIA YAML, axe findings, DOM, geometry, styles, console, network, interaction, and metadata are separate registered evidence.
- Active or ambiguous Artifact content is download-only; no same-origin raw HTML, SVG, PDF, Markdown, or trace rendering.
- Files, Events, and the durable Operation ledger are canonical; a database may be a rebuildable index only.
- SHA-256 values are full lowercase prefixed; canonical value hashes use RFC 8785; persisted cost uses exact decimal `MonetaryAmount`.
- General Export does not change Run state; authorized Promotion uses `promoting`.
- Deletion moves canonical data to owned trash with a default seven-day grace period; no cleanup occurs while the app is closed and no secure-wipe claim is made.
- An OS lock handle plus metadata and verified identity is required; heartbeat, PID, hostname, or file existence alone never proves ownership.
- Raw secret values remain Session-only; browser-layer routing is not represented as Project-process network isolation.
- Upgrades verify component compatibility before mutation and use staged migration, protected backup, verification, atomic adoption, and explicit rollback rules.
- Remote telemetry, automatic crash upload, third-party analytics, and hidden background services are absent or disabled by default.

## Scaffold gate

Architecture decisions are classified, but foundational scaffold acceptance still requires:

- exact Node, pnpm, Playwright, Chromium, Rust, and dependency pins;
- Zod/JSON Schema, migrations, fixtures, invariant/API/Operation registries, and generated clients;
- RFC 8785 plus cross-language digest, timestamp, decimal, and unit goldens;
- durable Operation ledger and proof-based reconciliation;
- randomized-host pairing, revision/idempotency/status/pagination tests;
- Windows 11 console, Job, browser-descendant, lock, and listener proof;
- complete Capture Artifact schemas and current ARIA/screenshot API proof;
- Artifact active-content and preview security tests;
- secret lifecycle, browser authentication-state, and egress-capability tests;
- staged migration, backup, crash recovery, rollback, and downgrade tests;
- store crash injection, trash/restore/purge, storage admission, filesystem and lock doctor;
- documentation conformance checker and mutation suite remain green;
- telemetry/crash “off means zero network” tests;
- license and public packaging claims remain blocked.

Milestone dependency and version choices remain in the Scaffold Decision Register.

## First scaffold non-goals

Hosted/cloud operation, MCP core, public plugin/interchange standard, preference training, parallel or multiple Candidates, SQLite source of truth, Electron/Tauri, in-Run generation, rounds, Pause, automatic Promotion/merge, cross-platform parity, automatic browser opening, multi-client pairing, updater/background daemon, and remote telemetry/crash upload.

## Maintenance

Architecture changes update affected specifications, shared sources and invariants, an ADR when architectural, failure/security/test/observability/UI/API/package contracts, and both manifests.

Every repository write must be verified by re-reading the pushed content. A successful API response alone is not proof that the intended bytes became canonical.

Automated conformance should detect missing links, duplicate registries, unregistered errors/classes/commands, deprecated active names or Run `exporting`, raw canonical digests, floating currency, route/API/Operation/storage/lock drift, incomplete Capture classes, unsafe Artifact preview, hidden cleanup/telemetry, absent active documents, phantom archive entries, or unsupported public claims.

## Source freshness

Reverify RFC 8785 libraries, Playwright Clock/ARIA/screenshot/browser lifecycle/routing/WebSocket behavior, randomized `.localhost` cookies, Windows Job/console/pipe/TCP/lock APIs, filesystem atomicity, Git worktree/LFS/submodules, evaluator/provider formats, package signing/distribution, and Node/TypeScript/Rust support ranges at scaffold and dependency upgrades.
