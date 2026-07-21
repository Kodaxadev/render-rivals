# Render Rivals Document Manifest

**Inventory format:** 3.4  
**Updated:** 2026-07-20  
**Content identity:** Git blob SHA and commit history

This tracks the maintained repository surface. It is intentionally not a line-count/checksum manifest that becomes self-stale after every edit. Tagged release bundles may later carry CI-generated checksums.

## Repository status

- Architecture/MVP contracts: established.
- Executable implementation: pre-scaffold.
- License: placeholder only; no general reuse/contribution permission yet.
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

Specs 12–17 normalize shared authority, lock configuration/CLI/API and Git behavior, prevent local observability from becoming implicit remote telemetry, define the first-browser pairing ceremony, and bound local API operations/collections.

## Shared schema and invariant sources

- [`schemas/domain-types.ts`](schemas/domain-types.ts)
- [`schemas/error-codes.ts`](schemas/error-codes.ts)
- [`schemas/api-types.ts`](schemas/api-types.ts)
- [`schemas/README.md`](schemas/README.md)
- [`docs/RECORD-INVARIANT-MATRIX.md`](docs/RECORD-INVARIANT-MATRIX.md)

These control shared IDs, enums, records, states, purposes, policy references, stable errors, API commands/envelopes, and cross-record cardinality/nullability. Full Zod/JSON Schema, generated clients, fixtures, migrations, and compatibility tests remain scaffold work.

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

ADR-0011 is incorporated and now serves as history/rationale rather than active override.

## Development and release contracts

- [`docs/MVP-VERTICAL-SLICE.md`](docs/MVP-VERTICAL-SLICE.md)
- [`docs/FAILURE-RECOVERY-MATRIX.md`](docs/FAILURE-RECOVERY-MATRIX.md)
- [`docs/RECORD-INVARIANT-MATRIX.md`](docs/RECORD-INVARIANT-MATRIX.md)
- [`docs/TEST-AND-VALIDATION-STRATEGY.md`](docs/TEST-AND-VALIDATION-STRATEGY.md)
- [`security/THREAT-MODEL.md`](security/THREAT-MODEL.md)
- [`docs/SCAFFOLD-DECISION-REGISTER.md`](docs/SCAFFOLD-DECISION-REGISTER.md)
- [`docs/DEVELOPMENT-GAP-REGISTER.md`](docs/DEVELOPMENT-GAP-REGISTER.md)
- [`docs/PACKAGING-DISTRIBUTION-AND-UPDATES.md`](docs/PACKAGING-DISTRIBUTION-AND-UPDATES.md)

The invariant matrix defines semantic record combinations; the gap register distinguishes remaining implementation evidence from architectural ambiguity.

## Product and public planning

- [`docs/DASHBOARD-PAIRING-ROUTE.md`](docs/DASHBOARD-PAIRING-ROUTE.md)
- [`docs/PRODUCT-UI-SCENE-PLAN.md`](docs/PRODUCT-UI-SCENE-PLAN.md)
- [`docs/ROUTE-LEVEL-WIREFRAME-SPEC.md`](docs/ROUTE-LEVEL-WIREFRAME-SPEC.md)
- [`docs/PLANNING-SCOPE-STATUS.md`](docs/PLANNING-SCOPE-STATUS.md)
- [`docs/MARKETING-AND-DOCS-SITE-PLAN.md`](docs/MARKETING-AND-DOCS-SITE-PLAN.md)

The pairing route is the only pre-authentication browser surface. Authenticated UI/route plans expose only legal MVP controls. Marketing pages are claim-gated by implementation, package, license, and proof.

## Runtime source verification

- [`sources/official-runtime-verification.md`](sources/official-runtime-verification.md)

Upstream documentation is separated from actual Render Rivals capability proof. Version-sensitive behavior is rechecked at scaffold and upgrades.

## Brand exploration

- [`brand/README.md`](brand/README.md)
- [`brand/VISUAL-DIRECTION.md`](brand/VISUAL-DIRECTION.md)
- `brand/concepts/01-arena-purple-orange.webp`
- `brand/concepts/02-evidence-editorial.webp`
- `brand/concepts/03-premium-champion.webp`
- `brand/concepts/04-neon-creative-technology.webp`
- `brand/concepts/05-minimal-r-monogram.webp`
- `brand/concepts/06-twin-slash-lime.webp`

Brand files are exploratory and not architecture inputs. Legacy terms in historical asset filenames are not schema vocabulary.

## Historical archive

- `archive/README.md`
- `archive/SUPERSEDED-RUNTIME-DECISIONS.md`
- `archive/original-design-warden-part-01.md`
- `archive/original-design-warden-part-02.md`
- `archive/original-design-warden-part-03.md`
- `archive/original-design-warden-part-04.md`
- `archive/original-roadmap.md`

Archive never drives scaffolding.

## Root documents

- [`README.md`](README.md)
- [`MANIFEST.json`](MANIFEST.json)
- [`LICENSE-TBD.md`](LICENSE-TBD.md)

## Pending scaffold artifacts

- Zod/JSON Schema registry and generated API command/client registry;
- valid/invalid fixtures covering the Record Invariant Matrix;
- migrations/compatibility tests;
- Rust/TypeScript protocol goldens;
- documentation conformance script;
- implementation monorepo;
- randomized-host dashboard pairing proof;
- Windows native/package/browser proof.

## Public release blockers

- real license;
- contribution/security policy;
- package/native/browser distribution;
- checksums/provenance/SBOM/notices;
- tested support matrix and migration/rollback path.

## Conformance note

Intentional references to rejected old names or migration values exist in normalization, tests, ADR history, and archive. Future stale-token automation must use explicit path/section allowlists rather than fail on every raw string occurrence.
