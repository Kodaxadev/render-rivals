# Render Rivals Document Manifest

**Inventory format:** 4.1  
**Updated:** 2026-07-20  
**Content identity:** Git blob SHA and commit history

This tracks the maintained repository surface. It is intentionally not a line-count/checksum manifest that becomes self-stale after every edit. Tagged release bundles may later carry CI-generated checksums.

## Repository status

- Architecture/MVP contracts: established.
- Executable implementation: pre-scaffold.
- License: placeholder only; no general reuse or contribution permission yet.
- Public packages: unavailable.

## Canonical specifications

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

Specs 12–25 normalize shared authority, make Rust/TypeScript records byte-compatible, provide durable command reconciliation, register complete Capture evidence, prevent same-origin Artifact execution, define recoverable deletion and cross-Session ownership, constrain secret/network behavior, and make upgrades/migrations recoverable.

## Shared schema and invariant sources

- [`schemas/primitives.ts`](schemas/primitives.ts)
- [`schemas/domain-types.ts`](schemas/domain-types.ts)
- [`schemas/error-codes.ts`](schemas/error-codes.ts)
- [`schemas/api-types.ts`](schemas/api-types.ts)
- [`schemas/operation-types.ts`](schemas/operation-types.ts)
- [`schemas/README.md`](schemas/README.md)
- [`docs/RECORD-INVARIANT-MATRIX.md`](docs/RECORD-INVARIANT-MATRIX.md)

These control canonical digest, timestamp, decimal and unit formats; shared IDs, records and states; stable errors; API commands and envelopes; Operation records and reconciliation states; and cross-record cardinality/nullability. Full executable schemas, generated clients, fixtures, migrations, and compatibility tests remain scaffold work.

## Accepted ADRs

- [`adr/ADR-0001-typescript-rust-boundary.md`](adr/ADR-0001-typescript-rust-boundary.md)
- [`adr/ADR-0002-bootstrap-terminal-and-session.md`](adr/ADR-0002-bootstrap-terminal-and-session.md)
- [`adr/ADR-0003-containment-capabilities.md`](adr/ADR-0003-containment-capabilities.md)
- [`adr/ADR-0004-secure-ipc-and-output.md`](adr/ADR-0004-secure-ipc-and-output.md)
- [`adr/ADR-0005-sequential-execution.md`](adr/ADR-0005-sequential-execution.md)
- [`adr/ADR-0006-capture-epoch.md`](adr/ADR-0006-capture-epoch.md)
- [`adr/ADR-0007-files-canonical.md`](adr/ADR-0007-files-canonical.md)
- [`adr/ADR-0008-version-policy.md`](adr/ADR-0008-version-policy.md)
- [`adr/ADR-0009-experimental-controls.md`](adr/ADR-0009-experimental-controls.md)
- [`adr/ADR-0010-quality-first-accounting.md`](adr/ADR-0010-quality-first-accounting.md)
- [`adr/ADR-0011-selection-outcomes-and-user-decisions.md`](adr/ADR-0011-selection-outcomes-and-user-decisions.md)
- [`adr/ADR-0012-run-promotion-phase-naming.md`](adr/ADR-0012-run-promotion-phase-naming.md)

ADR-0011 is incorporated history. ADR-0012 makes `promoting` the Run adoption phase; general Export Operations remain separate.

## Development and release contracts

- [`docs/MVP-VERTICAL-SLICE.md`](docs/MVP-VERTICAL-SLICE.md)
- [`docs/FAILURE-RECOVERY-MATRIX.md`](docs/FAILURE-RECOVERY-MATRIX.md)
- [`docs/RECORD-INVARIANT-MATRIX.md`](docs/RECORD-INVARIANT-MATRIX.md)
- [`docs/TEST-AND-VALIDATION-STRATEGY.md`](docs/TEST-AND-VALIDATION-STRATEGY.md)
- [`security/THREAT-MODEL.md`](security/THREAT-MODEL.md)
- [`docs/SCAFFOLD-DECISION-REGISTER.md`](docs/SCAFFOLD-DECISION-REGISTER.md)
- [`docs/DEVELOPMENT-GAP-REGISTER.md`](docs/DEVELOPMENT-GAP-REGISTER.md)
- [`docs/PACKAGING-DISTRIBUTION-AND-UPDATES.md`](docs/PACKAGING-DISTRIBUTION-AND-UPDATES.md)

The invariant matrix defines semantic record combinations; the gap register distinguishes implementation proof from architecture; the test strategy turns those requirements into release gates.

## Documentation conformance

- [`conformance/README.md`](conformance/README.md)
- [`conformance/fixtures/documentation-drift-regression.json`](conformance/fixtures/documentation-drift-regression.json)

The initial negative fixture records real repository drift before repair. The first executable checker must prove it catches equivalent mutations and passes the repaired tree.

## Product and public planning

- [`docs/DASHBOARD-PAIRING-ROUTE.md`](docs/DASHBOARD-PAIRING-ROUTE.md)
- [`docs/PRODUCT-UI-SCENE-PLAN.md`](docs/PRODUCT-UI-SCENE-PLAN.md)
- [`docs/ROUTE-LEVEL-WIREFRAME-SPEC.md`](docs/ROUTE-LEVEL-WIREFRAME-SPEC.md)
- [`docs/PLANNING-SCOPE-STATUS.md`](docs/PLANNING-SCOPE-STATUS.md)
- [`docs/MARKETING-AND-DOCS-SITE-PLAN.md`](docs/MARKETING-AND-DOCS-SITE-PLAN.md)

The pairing route is the only pre-authentication browser surface. Authenticated UI exposes only legal MVP commands. Marketing pages remain claim-gated by implementation, package, license, and proof.

## Runtime and capture API verification

- [`sources/official-runtime-verification.md`](sources/official-runtime-verification.md)
- [`sources/playwright-capture-api-verification.md`](sources/playwright-capture-api-verification.md)
- [`sources/playwright-network-api-verification.md`](sources/playwright-network-api-verification.md)

Upstream documentation is separated from Render Rivals capability proof. Current Playwright ARIA, screenshot, routing, Service Worker and WebSocket facts are noted, but exact pinned package and fixture behavior remain authoritative.

## Brand exploration

- [`brand/README.md`](brand/README.md)
- [`brand/VISUAL-DIRECTION.md`](brand/VISUAL-DIRECTION.md)
- `brand/concepts/01-arena-purple-orange.webp`
- `brand/concepts/02-evidence-editorial.webp`
- `brand/concepts/03-premium-champion.webp`
- `brand/concepts/04-neon-creative-tech.webp`
- `brand/concepts/05-minimal-r-monogram.webp`
- `brand/concepts/06-twin-slash-lime.webp`

Brand files are exploratory and not architecture inputs. Legacy words in historical asset filenames are not schema vocabulary.

## Historical archive

- [`archive/SUPERSEDED-RUNTIME-DECISIONS.md`](archive/SUPERSEDED-RUNTIME-DECISIONS.md)
- [`archive/original-design-warden-part-01.md`](archive/original-design-warden-part-01.md)

Only files that actually exist in Git history are listed. The partial Design Warden fragment explicitly states that the full draft was never preserved in this repository. Archive never drives scaffolding.

## Root documents

- [`README.md`](README.md)
- [`MANIFEST.json`](MANIFEST.json)
- [`LICENSE-TBD.md`](LICENSE-TBD.md)

## Pending scaffold artifacts

- executable Zod and generated JSON Schema for primitives, entities, Operations, Capture classes, API payloads, locks and trash manifests;
- RFC 8785 plus Rust/TypeScript digest, timestamp, decimal and unit goldens;
- valid and invalid fixtures covering the Record Invariant Matrix;
- Run-state fixture migration from pre-scaffold `exporting` to `promoting`;
- Operation reconciliation, store crash-injection, Capture completeness, active-content preview, trash and lock suites;
- generated API command/client registry;
- executable documentation-conformance checker using the committed real-drift fixture;
- implementation monorepo;
- randomized-host pairing and Windows 11 native/package/browser proof.

## Public release blockers

- real license;
- contribution and security policy;
- package, native and browser distribution;
- checksums, provenance, SBOM and notices;
- tested support matrix and migration/rollback path;
- external-user validation of security, recovery and deletion behavior.

## Conformance note

Intentional references to rejected old names, abbreviated digest placeholders, or migration values exist in normalization, tests, ADR history, fixtures and archive. Future automated checks must use explicit path and context allowlists rather than fail on every raw occurrence.
