# Render Rivals Document Manifest

**Inventory format:** 2.1  
**Updated:** 2026-07-20  
**Content identity:** Git blob SHA and commit history

This manifest tracks the maintained repository surface. Tagged release bundles may later include a CI-generated checksum manifest.

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

`spec/12` normalizes explanatory aliases, shared-type authority, storage-path precedence, and Session/Run lifecycle separation across earlier specs.

## Canonical shared type vocabulary

- [`schemas/domain-types.ts`](schemas/domain-types.ts)

This file is the sole canonical source for `RecommendationOutcome`, `UserDecisionAction`, `PairwiseVerdict`, `EvaluationPurpose`, `InferenceUsage`, shared record shapes, `RunState`, and `RecoveryDisposition`.

Markdown specifications must reference these definitions rather than create competing unions.

## Accepted architecture decisions

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

ADR-0011 is now textually incorporated into specs 06, 09, 10, the MVP contract, and the shared type file. It remains the historical decision record.

## Implementation contracts

- [`docs/MVP-VERTICAL-SLICE.md`](docs/MVP-VERTICAL-SLICE.md)
- [`docs/FAILURE-RECOVERY-MATRIX.md`](docs/FAILURE-RECOVERY-MATRIX.md)

## Product and route planning

- [`docs/PRODUCT-UI-SCENE-PLAN.md`](docs/PRODUCT-UI-SCENE-PLAN.md)
- [`docs/MARKETING-AND-DOCS-SITE-PLAN.md`](docs/MARKETING-AND-DOCS-SITE-PLAN.md)
- [`docs/ROUTE-LEVEL-WIREFRAME-SPEC.md`](docs/ROUTE-LEVEL-WIREFRAME-SPEC.md)
- [`docs/PLANNING-SCOPE-STATUS.md`](docs/PLANNING-SCOPE-STATUS.md)

The scope-status document marks generated contenders and other complete-product concepts as post-MVP. The wireframe specification is authoritative for concrete route decomposition.

## Schema implementation surface

- [`schemas/README.md`](schemas/README.md)
- [`schemas/domain-types.ts`](schemas/domain-types.ts)

The shared type vocabulary now exists. Full executable Zod schemas, generated JSON Schema, fixtures, migrations, hashing tests, and compatibility tests remain scaffold deliverables.

## Runtime source verification

- [`sources/official-runtime-verification.md`](sources/official-runtime-verification.md)

## Brand and visual exploration

- [`brand/README.md`](brand/README.md)
- [`brand/VISUAL-DIRECTION.md`](brand/VISUAL-DIRECTION.md)
- `brand/concepts/01-arena-purple-orange.webp`
- `brand/concepts/02-evidence-editorial.webp`
- `brand/concepts/03-premium-champion.webp`
- `brand/concepts/04-neon-creative-technology.webp`
- `brand/concepts/05-minimal-r-monogram.webp`
- `brand/concepts/06-twin-slash-lime.webp`

Brand concepts are exploratory assets, not architecture inputs. Legacy wording in asset filenames is not persisted-domain vocabulary.

## Historical archive

- `archive/README.md`
- `archive/SUPERSEDED-RUNTIME-DECISIONS.md`
- `archive/original-design-warden-part-01.md`
- `archive/original-design-warden-part-02.md`
- `archive/original-design-warden-part-03.md`
- `archive/original-design-warden-part-04.md`
- `archive/original-roadmap.md`

Archived files are retained for history and must not drive scaffolding.

## Root documents

- [`README.md`](README.md)
- [`MANIFEST.json`](MANIFEST.json)
- `LICENSE-TBD.md`
