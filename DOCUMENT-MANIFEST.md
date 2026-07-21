# Render Rivals Document Manifest

**Inventory format:** 3.0  
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

Specs 12–14 normalize shared vocabulary/authority, define configuration/CLI/API behavior, and lock Git/source/workspace semantics that would otherwise be left to scaffold implementers.

## Shared schema sources

- [`schemas/domain-types.ts`](schemas/domain-types.ts)
- [`schemas/error-codes.ts`](schemas/error-codes.ts)
- [`schemas/README.md`](schemas/README.md)

These control shared IDs, enums, records, states, purposes, and stable errors. Full Zod/JSON Schema, fixtures, migrations, and compatibility tests remain scaffold work.

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
- [`docs/TEST-AND-VALIDATION-STRATEGY.md`](docs/TEST-AND-VALIDATION-STRATEGY.md)
- [`security/THREAT-MODEL.md`](security/THREAT-MODEL.md)
- [`docs/SCAFFOLD-DECISION-REGISTER.md`](docs/SCAFFOLD-DECISION-REGISTER.md)
- [`docs/PACKAGING-DISTRIBUTION-AND-UPDATES.md`](docs/PACKAGING-DISTRIBUTION-AND-UPDATES.md)

## Product and public planning

- [`docs/PRODUCT-UI-SCENE-PLAN.md`](docs/PRODUCT-UI-SCENE-PLAN.md)
- [`docs/ROUTE-LEVEL-WIREFRAME-SPEC.md`](docs/ROUTE-LEVEL-WIREFRAME-SPEC.md)
- [`docs/PLANNING-SCOPE-STATUS.md`](docs/PLANNING-SCOPE-STATUS.md)
- [`docs/MARKETING-AND-DOCS-SITE-PLAN.md`](docs/MARKETING-AND-DOCS-SITE-PLAN.md)

The UI/route plans expose only legal MVP controls. Marketing pages are claim-gated by implementation, package, license, and proof.

## Runtime source verification

- [`sources/official-runtime-verification.md`](sources/official-runtime-verification.md)

Version-sensitive claims are rechecked at scaffold and upgrades.

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

- Zod/JSON Schema registry;
- valid/invalid fixtures;
- migrations/compatibility tests;
- Rust/TypeScript protocol goldens;
- documentation conformance script;
- implementation monorepo;
- Windows native/package/browser proof.

## Public release blockers

- real license;
- contribution/security policy;
- package/native/browser distribution;
- checksums/provenance/SBOM/notices;
- tested support matrix and migration/rollback path.
