# Render Rivals Development Gap Register

**Status:** Active readiness register  
**Purpose:** Track work that remains genuinely unimplemented after architecture consolidation, distinguish development blockers from deferred product scope, and prevent “documented” from being mistaken for “working.”

## 1. Status values

- **P0 scaffold blocker:** required before the named foundational stage is accepted.
- **P0 MVP blocker:** scaffold may proceed, but MVP alpha cannot be called complete.
- **P1 release blocker:** local/private MVP may work, but public packaging or OSS claims are blocked.
- **Deferred:** outside MVP and must not shape the first scaffold.
- **Milestone decision:** architecture boundary is defined, exact dependency/version is selected during the named spike.

## 2. Stage 1 — Schemas and domain

| Gap | Status | Completion evidence |
|---|---|---|
| Zod schemas for all canonical entities/commands | P0 scaffold blocker | Source schemas plus valid/invalid fixtures |
| Generated JSON Schema | P0 scaffold blocker | Deterministic generation and CI drift check |
| Exact ID/ULID validators | P0 scaffold blocker | TypeScript/JSON Schema/Rust fixtures agree |
| Error-code registry integration | P0 scaffold blocker | Rust/TS/API/UI reject unregistered stable codes |
| Record Invariant Matrix implementation | P0 scaffold blocker | Every outcome/status/nullability/supersession/retry rule has valid and invalid fixtures plus constructor/reducer enforcement |
| State transition tables/reducers | P0 scaffold blocker | Allowed and forbidden transition coverage |
| Canonical JSON/hash implementation | P0 scaffold blocker | Golden bytes and cross-platform tests |
| Migration framework | P0 MVP blocker | Copy/validate/adopt tests and unknown-major read-only |
| Documentation conformance script | P0 scaffold blocker | Missing-link/type/error/invariant/route/old-name/telemetry checks in CI |

## 3. Stage 2 — Native bootstrap and supervisor

| Gap | Status | Completion evidence |
|---|---|---|
| Exact Node bootstrap | P0 scaffold blocker | Version-manager/path fixtures |
| Rust crate/binding selection | Milestone decision | Spike commit with versions and replacement boundary |
| Secure named-pipe IPC | P0 scaffold blocker | ACL/peer/nonce/one-client/adversarial frames |
| Windows Job assignment | P0 scaffold blocker | Atomic root assignment and containment proof |
| Browser descendant containment | P0 MVP blocker | Chromium browser/renderer/GPU/utility membership fixture |
| Console/Ctrl+C policy | P0 scaffold blocker | First/second interrupt and terminal restoration |
| Output drain/backpressure/limits | P0 scaffold blocker | Binary, flood, exact 64 MiB default termination, opt-in tail, and disk-pressure fixtures |
| TCP listener owner lookup | P0 MVP blocker | IPv4/IPv6 descendant and PID-reuse fixtures |
| Supervisor crash cleanup | P0 MVP blocker | Job close/remaining endpoint verification |

## 4. Stage 3 — Configuration, CLI, local API

| Gap | Status | Completion evidence |
|---|---|---|
| JSONC discovery/precedence/provenance | P0 scaffold blocker | Layer/merge/security-conflict tests |
| CLI command shell | P0 scaffold blocker | `init`, `doctor`, `inspect` and JSON/exit contracts |
| Randomized dashboard origin and pairing | P0 scaffold blocker | `spec/16` host isolation, terminal code, one-time pairing, cookie, expiry/lockout, Session invalidation, and no auto-browser-spawn tests |
| Loopback authentication/CSRF/CSP | P0 scaffold blocker | Exact Host/Origin/custom-header/CORS/SSE/Artifact browser security tests |
| Operation idempotency/revision conflicts | P0 scaffold blocker | API and supervisor replay fixtures |
| SSE replay/gap handling | P0 MVP blocker | `Last-Event-ID`, gap/refetch, slow client tests |
| Safe mode | P0 MVP blocker | Paired read-only/recovery/cleanup and prohibited-command tests |
| Dashboard client-error local logging | P0 MVP blocker | Bounded/redacted schema tests |

## 5. Stage 4 — Canonical store and recovery

| Gap | Status | Completion evidence |
|---|---|---|
| Exact directory/store implementation | P0 scaffold blocker | Entity/Artifact/process/evaluator layouts |
| Event hash-chain writer/reader | P0 scaffold blocker | Torn/reorder/mutation tests |
| Transition commit ordering | P0 scaffold blocker | Crash injection after every step |
| Artifact write/registration protocol | P0 scaffold blocker | Orphan/quarantine/reconciliation tests |
| Lock ownership/recovery | P0 MVP blocker | Session identity and stale-lock tests |
| Reconstruction without database | P0 MVP blocker | Delete index/rebuild full Run |
| Integrity/Recovery reports | P0 MVP blocker | Corruption and allowed-action fixtures |
| Retention/deletion reachability | P0 MVP blocker | Cited evidence cannot be removed |
| Import/archive safety | P0 MVP blocker | Traversal, bomb, schema, checksum, provenance tests |

## 6. Stage 5 — Git and Workspaces

| Gap | Status | Completion evidence |
|---|---|---|
| System Git parser/version floor | Milestone decision | Pinned minimum and NUL-format fixtures |
| Clean/dirty Source Snapshots | P0 MVP blocker | staged/unstaged/untracked/binary/delete/rename fixtures |
| CRLF/modes/symlinks/case/Unicode | P0 MVP blocker | Windows and Linux manifest tests |
| LFS/submodules/sparse/shallow/partial | P0 MVP blocker | required-object and no-implicit-fetch fixtures |
| Worktree/copy/patch materialization | P0 MVP blocker | resulting manifest verification |
| Workspace drift/protected paths | P0 MVP blocker | dependency/build mutation fixtures |
| Worktree cleanup | P0 MVP blocker | open CWD/stale metadata/ownership tests |
| Patch Promotion | P0 MVP blocker | no active-tree mutation and result hash |
| Branch Promotion | P0 MVP blocker | ref validation/collision/idempotent retry/no checkout/push |

## 7. Stage 6 — Browser capture and Gates

| Gap | Status | Completion evidence |
|---|---|---|
| Exact Playwright/Chromium pin | Milestone decision | lockfile/browser revision and package proof |
| Playwright Clock semantics | P0 MVP blocker | fixed/controlled clock fixture |
| Deterministic fixture/states/interaction | P0 MVP blocker | `/dashboard` reference fixture |
| Stability probe | P0 MVP blocker | controlled and intentionally unstable cases |
| Candidate-local failure handling | P0 MVP blocker | page/readiness/interaction failure retains current evidence |
| Epoch-wide invalidation | P0 MVP blocker | disconnect/identity/context/fixture drift recapture |
| Complete evidence Artifact matrix | P0 MVP blocker | screenshot/DOM/a11y/geometry/styles/console/network/trace |
| Phased Gate scheduler | P0 MVP blocker | dependency graph forbids premature Gates |
| Accessibility/responsive policy | P0 MVP blocker | protected regression fixtures |

## 8. Stage 7–8 — Evaluation and Decision

| Gap | Status | Completion evidence |
|---|---|---|
| Generic command evaluator adapter | P0 MVP blocker | request/result/raw/validation fixtures |
| Local evaluator trust flow | P0 MVP blocker | executable identity and warning/acknowledgement |
| Human-only rating path | P0 MVP blocker | same packet/citations and typed Decision |
| Order reversal | P0 MVP blocker | identity/order fixtures and conflict outcome |
| Deterministic Recommendation policy | P0 MVP blocker | five outcomes/reason codes and veto/staleness coverage |
| Inference accounting | P0 MVP blocker | null/known token/cost/process usage tests |
| Recommendation/Decision supersession | P0 MVP blocker | acyclic lineage and stale authorization replacement tests |
| Decision binding/staleness | P0 MVP blocker | changed evidence/source/policy blocks Promotion |

## 9. Stage 9 — Promotion, Export, and UI

| Gap | Status | Completion evidence |
|---|---|---|
| Promotion versus Export Operation services | P0 MVP blocker | report without Candidate; patch/branch requires Decision |
| Promotion/Export retry and terminal records | P0 MVP blocker | retry lineage, terminal timestamps, failure codes, and idempotent destination verification |
| Redaction/omission reports | P0 MVP blocker | diagnostics/export fixture suite |
| Side-by-side UI | P0 MVP blocker | all states/viewports/steps and validity |
| Recovery/cleanup UI | P0 MVP blocker | only legal commands exposed |
| Route/API inventory conformance | P0 scaffold blocker | generated route comparison test, including pairing-only unauthenticated route |
| Keyboard/screen-reader behavior | P0 MVP blocker | automated/manual accessibility acceptance |
| Large Event/Artifact UI performance | P0 MVP blocker | bounded reference data tests |
| Final double-R/vector brand assets | Deferred from runtime | Required before polished public identity, not MVP engine |

## 10. Observability

| Gap | Status | Completion evidence |
|---|---|---|
| Structured local logging | P0 scaffold blocker | schema/redaction/rotation tests |
| Health/resource projections | P0 MVP blocker | derived/rebuildable behavior |
| Diagnostic Export Operation | P0 MVP blocker | manifest/redaction/omission review |
| Crash record/cleanup linkage | P0 MVP blocker | coordinator/supervisor crash fixtures |
| Remote telemetry | Deferred | Off by default; no MVP implementation required |
| Remote crash upload | Deferred | Explicit review/upload only if later implemented |

## 11. Packaging and public release

| Gap | Status | Completion evidence |
|---|---|---|
| npm name/scope | P1 release blocker | Availability and trademark review |
| Main/native package build | P1 release blocker | Clean-machine npm/pnpm smoke tests |
| Browser distribution/offline install | P1 release blocker | Tested bundle and checksums |
| Compatibility manifest | P1 release blocker | JS/native/protocol/schema/browser matrix |
| Checksums/provenance/SBOM/notices | P1 release blocker | Tagged release outputs |
| Windows signing | P1 release blocker | Signed/timestamped package smoke test or explicit pre-alpha caveat |
| Migration/backup/rollback | P1 release blocker | Upgrade/downgrade fixtures |
| Real license | P1 release blocker | Replace `LICENSE-TBD.md` |
| CONTRIBUTING/SECURITY policies | P1 release blocker | Published policies and contact path |
| External-user validation | P1 release blocker | Real non-owner Project fixture feedback |

## 12. Deferred complete-product scope

Not MVP blockers:

- in-Run generation;
- multiple Contenders/rounds/parallelism;
- Pause/suspend;
- Rule Sets editor;
- annotation/collaboration;
- CI/PR automation;
- cloud sync/remote workers;
- plugin/evaluator marketplace;
- Figma;
- automatic updater/background daemon;
- preference learning;
- platform parity claims;
- automatic default-browser launching and multi-client dashboard pairing.

## 13. Exit condition

A gap leaves this register only when evidence is committed and the affected canonical documents/tests are updated. “Implemented locally,” “works on my machine,” or “the upstream docs say it should work” is insufficient.
