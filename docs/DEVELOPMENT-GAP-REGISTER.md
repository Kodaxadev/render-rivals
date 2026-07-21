# Render Rivals Development Gap Register

**Status:** Active readiness register  
**Purpose:** Track work that remains genuinely unimplemented after architecture consolidation, distinguish development blockers from deferred product scope, and prevent “documented” from being mistaken for “working.”

## 1. Status values

- **Evidence gate:** required before production Stage 1 may begin.
- **P0 scaffold blocker:** required before the named foundational stage is accepted.
- **P0 MVP blocker:** scaffold may proceed, but MVP alpha cannot be called complete.
- **P1 release blocker:** local/private MVP may work, but public packaging or OSS claims are blocked.
- **Deferred:** outside MVP and must not shape the first scaffold.
- **Milestone decision:** architecture boundary is defined, exact dependency/version is selected during the named spike.

## 1.5 Stage 0.5 — Hypothesis experiment

Production Stage 1 remains blocked by ADR-0013 until this section ends with a valid `proceed` record under `docs/STAGE-0.5-HYPOTHESIS-EXPERIMENT.md`.

| Gap | Status | Completion evidence |
|---|---|---|
| Frozen experiment manifest and thresholds | Evidence gate | Experiment ID, task IDs, evaluator/prompt hashes, environment, thresholds and selection rule committed before outcomes |
| Frozen task sample | Evidence gate | Target 12 and minimum 8 valid comparisons selected without outcome-based removal; diversity requirements recorded |
| Independent Contender preparation | Evidence gate | Current/Contender source identities and preparation method, time and known cost recorded per task |
| Comparable paired evidence | Evidence gate | Three states, desktop/mobile and critical interaction captured for both Candidates with hashes and invalidation record |
| Eligibility and protected-regression review | Evidence gate | Ineligible Contender retains current; broken current invalidates task; all veto observations retained |
| Order-reversed pairwise evaluation | Evidence gate | Immutable A/B and B/A packets, outputs, citations, conflicts and selector result per eligible task |
| Blinded human rating | Evidence gate | Rating committed before Recommendation reveal with randomized labels and explicit preference/adoption result |
| Controls and metrics | Evidence gate | Opportunity, agreement, false recommendation, retain-current, random, conflict, time and cost counts committed |
| Continuation decision | Evidence gate | `proceed`, `pivot`, `stop`, or `inconclusive` record cites raw metrics and deviations; only `proceed` opens Stage 1 |

Experiment-only scripts do not satisfy production containment, durability, schema, security, recovery, packaging, or release gaps below.

## 2. Stage 1 — Primitives, schemas, and domain

| Gap | Status | Completion evidence |
|---|---|---|
| RFC 8785 canonical JSON implementation | P0 scaffold blocker | Rust/TypeScript canonical-byte and digest goldens agree |
| Canonical primitive validators | P0 scaffold blocker | Full prefixed SHA, millisecond UTC, decimal, safe-integer, unit, path and overflow fixtures |
| Exact monetary accounting | P0 scaffold blocker | Decimal/provider/computed/estimated/null cost tests; no floating persisted dollars |
| Zod schemas for all canonical entities and commands | P0 scaffold blocker | Source schemas plus valid/invalid fixtures |
| Generated JSON Schema | P0 scaffold blocker | Deterministic generation and CI drift check |
| Exact ID/ULID validators | P0 scaffold blocker | TypeScript, JSON Schema and Rust fixtures agree |
| Error-code registry integration | P0 scaffold blocker | Rust, TypeScript, API and UI reject unregistered stable codes |
| API command and envelope registry | P0 scaffold blocker | Generated route/payload/result/client agreement |
| Operation ledger schemas | P0 scaffold blocker | Scope/state/result/proof and API projection fixtures |
| Record Invariant Matrix implementation | P0 scaffold blocker | Every outcome/status/nullability/supersession/retry rule enforced by schema and constructor/reducer |
| State transition tables and reducers | P0 scaffold blocker | Allowed and forbidden transitions, including Run `promoting` |
| Pre-scaffold `exporting` Run fixture migration | P0 scaffold blocker | Explicit migration to `promoting`; writer v1 rejects old literal |
| Migration framework | P0 MVP blocker | Copy, validate, adopt, rollback and unknown-major read-only tests |
| Documentation conformance CI gate | P0 scaffold blocker | Existing clean-tree checker and ten mutation tests run automatically on architecture changes and remain green |

## 3. Stage 2 — Native bootstrap and supervisor

| Gap | Status | Completion evidence |
|---|---|---|
| Exact Node bootstrap | P0 scaffold blocker | Version-manager and PATH fixtures |
| Rust crate and binding selection | Milestone decision | Spike commit with pinned versions and replacement boundary |
| Secure named-pipe IPC | P0 scaffold blocker | ACL, peer, nonce, one-client and adversarial frame tests |
| Windows Job assignment | P0 scaffold blocker | Atomic root assignment and containment proof |
| Browser descendant containment | P0 MVP blocker | Chromium browser, renderer, GPU and utility membership fixture |
| Console and Ctrl+C policy | P0 scaffold blocker | First/second interrupt and terminal restoration |
| Output drain/backpressure/limits | P0 scaffold blocker | Binary, flood, exact 64 MiB termination, opt-in tail and disk-pressure fixtures |
| Supervisor Operation idempotency | P0 scaffold blocker | Transport replay launches one process and cleanup remains idempotent |
| TCP listener owner lookup | P0 MVP blocker | IPv4/IPv6 descendant and PID-reuse fixtures |
| Supervisor crash cleanup | P0 MVP blocker | Job close, remaining process and endpoint verification |

## 4. Stage 3 — Configuration, CLI, local API, and browser pairing

| Gap | Status | Completion evidence |
|---|---|---|
| JSONC discovery, precedence and provenance | P0 scaffold blocker | Layer, merge and security-conflict tests |
| CLI command shell | P0 scaffold blocker | `init`, `doctor`, `inspect` and JSON/exit contracts |
| Randomized dashboard origin and pairing | P0 scaffold blocker | Host isolation, code, cookie, expiry, lockout, Session invalidation and no auto-browser-spawn tests |
| Loopback authentication, CSRF and CSP | P0 scaffold blocker | Exact Host, Origin, custom header, CORS, SSE and Artifact browser tests |
| Pairing route | P0 scaffold blocker | Only pre-auth route; no secret/history/log leakage and accessible narrow layout |
| Closed API command registry | P0 scaffold blocker | Unknown/free-form/mismatched route command rejection |
| Operation idempotency and revision conflicts | P0 scaffold blocker | Exact replay, changed replay and legal expected-revision matrix |
| Durable operation-status route | P0 scaffold blocker | Accepted/running/reconciling/interrupted/terminal state projections |
| Bounded pagination and filtering | P0 scaffold blocker | Default/max limits, opaque cursor binding and no unbounded list routes |
| API error and content envelopes | P0 scaffold blocker | Registered/redacted errors, body/media/range and Artifact ID-only tests |
| SSE replay and gap handling | P0 MVP blocker | `Last-Event-ID`, gap/refetch and slow-client tests |
| Safe mode | P0 MVP blocker | Paired read-only/recovery/cleanup and prohibited-command tests |
| Dashboard client-error local logging | P0 MVP blocker | Bounded/redacted schema tests |

## 5. Stage 4 — Canonical store, Operations, locks, and recovery

| Gap | Status | Completion evidence |
|---|---|---|
| Exact directory/store implementation | P0 scaffold blocker | Entities, Operations, Artifacts, processes, evaluators, trash and maintenance layouts |
| Event hash-chain writer/reader | P0 scaffold blocker | JCS hash, torn, reorder and mutation tests |
| Transition commit ordering | P0 scaffold blocker | Crash injection after every intent, snapshot, Event and proof step |
| Durable Operation ledger | P0 scaffold blocker | Acceptance before side effect, request hashes, proof and retention |
| Operation crash reconciliation | P0 MVP blocker | Branch, export, process, Artifact and cleanup proof-based adoption/failure |
| Artifact write and registration protocol | P0 scaffold blocker | Orphan, quarantine and reconciliation tests |
| OS-held lock implementation | P0 scaffold blocker | Cross-process exclusion on Windows and maintained Unix hosts |
| Lock order and lease rules | P0 scaffold blocker | Deadlock stress, ordering, heartbeat, clock jump and suspend tests |
| Cross-Session Project execution lease | P0 MVP blocker | One active executing Run per Project and read-only second Session |
| Stale lock ownership assessment | P0 MVP blocker | OS lock, Session identity, PID reuse and corrupt metadata tests |
| Reconstruction without database | P0 MVP blocker | Delete index and rebuild full Run |
| Integrity and Recovery reports | P0 MVP blocker | Corruption and allowed-action fixtures |
| Import and archive safety | P0 MVP blocker | Traversal, bomb, schema, checksum and provenance tests |

## 6. Stage 5 — Git and Workspaces

| Gap | Status | Completion evidence |
|---|---|---|
| System Git parser and version floor | Milestone decision | Pinned minimum and NUL-format fixtures |
| Clean and dirty Source Snapshots | P0 MVP blocker | Staged, unstaged, untracked, binary, delete and rename fixtures |
| CRLF, modes, symlinks, case and Unicode | P0 MVP blocker | Windows and Linux manifest tests |
| LFS, submodules, sparse, shallow and partial repositories | P0 MVP blocker | Required-object and no-implicit-fetch fixtures |
| Worktree, copy and patch materialization | P0 MVP blocker | Resulting manifest verification |
| Workspace drift and protected paths | P0 MVP blocker | Dependency/build mutation fixtures |
| Worktree cleanup | P0 MVP blocker | Open CWD, stale metadata and ownership tests |
| Patch Promotion | P0 MVP blocker | No active-tree mutation and result hash/proof |
| Branch Promotion | P0 MVP blocker | Ref validation, collision, idempotent retry, no checkout or push |

## 7. Stage 6 — Browser capture, evidence, and Gates

| Gap | Status | Completion evidence |
|---|---|---|
| Exact Playwright and Chromium pin | Milestone decision | Lockfile, browser revision and package proof |
| Playwright Clock semantics | P0 MVP blocker | Fixed and controlled clock fixture |
| Current ARIA snapshot API proof | P0 scaffold blocker | Pinned `page.ariaSnapshot`/`locator.ariaSnapshot` raw YAML and option tests |
| Deterministic fixture, states and interaction | P0 MVP blocker | `/dashboard` reference fixture |
| Stability probe | P0 MVP blocker | Controlled and intentionally unstable cases |
| Candidate-local failure handling | P0 MVP blocker | Page/readiness/interaction failure retains qualified current evidence |
| Epoch-wide invalidation | P0 MVP blocker | Disconnect, identity, context and fixture drift recapture |
| Complete Capture Artifact registry | P0 scaffold blocker | Class/media/schema registry for PNG, DOM, ARIA, axe, geometry, styles, console, network, interaction, metadata and exclusions |
| Capture metadata-last commit | P0 MVP blocker | Missing/partial Artifact never produces valid Capture |
| Capture redaction and limits | P0 MVP blocker | Secrets, masks, truncation, depth/entry/byte boundaries and limitations |
| Phased Gate scheduler | P0 MVP blocker | Dependency graph forbids premature Gates |
| Accessibility and responsive policy | P0 MVP blocker | Protected regression fixtures and no WCAG overclaim |

## 8. Stage 7–8 — Evaluation and Decision

| Gap | Status | Completion evidence |
|---|---|---|
| Generic command evaluator adapter | P0 MVP blocker | Request, result, raw bytes and validation fixtures |
| Local evaluator trust flow | P0 MVP blocker | Executable identity and warning/acknowledgement |
| Human-only rating path | P0 MVP blocker | Same packet, citations and typed Decision |
| Order reversal | P0 MVP blocker | Identity/order fixtures and conflict outcome |
| Deterministic Recommendation policy | P0 MVP blocker | Five outcomes, reason codes, veto, staleness and confidence coverage |
| Exact Inference accounting | P0 MVP blocker | Null/known token, decimal cost, pricing snapshot and process usage tests |
| Recommendation and Decision supersession | P0 MVP blocker | Acyclic lineage and stale authorization replacement |
| Decision binding and staleness | P0 MVP blocker | Changed evidence, source or policy blocks Promotion |

## 9. Stage 9 — Promotion, Export, Artifact UI, and cleanup

| Gap | Status | Completion evidence |
|---|---|---|
| Run `promoting` reducer and UI phase | P0 scaffold blocker | No general Export changes Run state; Promotion transitions recoverably |
| Promotion versus Export services | P0 MVP blocker | Report without Candidate; patch/branch requires Decision |
| Promotion and Export retry/terminal records | P0 MVP blocker | Lineage, timestamps, failure codes and destination proof |
| Artifact active-content security | P0 scaffold blocker | HTML/SVG/PDF/Markdown/trace cannot execute with dashboard origin/cookie |
| Safe Artifact preview/download | P0 MVP blocker | Passive image allowlist, escaped text/JSON/YAML, MIME magic, ranges and filenames |
| Redaction and omission reports | P0 MVP blocker | Diagnostics and Export fixture suite |
| Side-by-side UI | P0 MVP blocker | All states, viewports, steps and validity |
| Recovery and cleanup UI | P0 MVP blocker | Only legal commands and owner/retention status exposed |
| Route and API inventory conformance | P0 scaffold blocker | Generated route comparison including pairing and Operation status |
| Keyboard and screen-reader behavior | P0 MVP blocker | Automated and manual accessibility acceptance |
| Large Event and Artifact UI performance | P0 MVP blocker | Bounded reference data and virtualization tests |
| Final double-R vector assets | Deferred from runtime | Required before polished public identity, not MVP engine |

## 10. Retention, storage, and observability

| Gap | Status | Completion evidence |
|---|---|---|
| Reference-aware reachability | P0 MVP blocker | Cited/protected/proof Artifacts never deleted |
| Whole-Run and Project trash protocol | P0 MVP blocker | Atomic move, manifest, index and crash reconciliation |
| Seven-day grace, restore and purge | P0 MVP blocker | Nonretroactive policy, restore conflicts and partial purge tests |
| Storage admission and low-disk reserve | P0 scaffold blocker | Temporary plus final plus reserve plus trash accounting |
| No-daemon maintenance scheduling | P0 scaffold blocker | No cleanup while app closed; bounded startup/idle cleanup |
| Cache and preserved Workspace policy | P0 MVP blocker | Ownership, shared-store safety and preserved output exclusion |
| Structured local logging | P0 scaffold blocker | Schema, redaction, rotation and sensitive-field tests |
| Health and resource projections | P0 MVP blocker | Derived and rebuildable behavior |
| Diagnostic Export Operation | P0 MVP blocker | Manifest, redaction, omission and active-content safety review |
| Crash record and cleanup linkage | P0 MVP blocker | Coordinator and supervisor crash fixtures |
| Remote telemetry | Deferred | Off by default; no MVP implementation required |
| Remote crash upload | Deferred | Explicit review and upload only if later implemented |

## 11. Packaging and public release

| Gap | Status | Completion evidence |
|---|---|---|
| npm name and scope | P1 release blocker | Availability and trademark review |
| Main and native package build | P1 release blocker | Clean-machine npm/pnpm smoke tests |
| Browser distribution and offline install | P1 release blocker | Tested bundle and checksums |
| Compatibility manifest | P1 release blocker | JS, native, protocol, schema and browser matrix |
| Checksums, provenance, SBOM and notices | P1 release blocker | Tagged release outputs |
| Windows signing | P1 release blocker | Signed/timestamped smoke test or explicit pre-alpha caveat |
| Migration, backup and rollback | P1 release blocker | Upgrade and rollback fixtures |
| Real license | P1 release blocker | Replace `LICENSE-TBD.md` |
| CONTRIBUTING and SECURITY policies | P1 release blocker | Published policies and contact path |
| External-user validation | P1 release blocker | Non-owner Project security, recovery, deletion and install feedback |

## 12. Deferred complete-product scope

Not MVP blockers:

- in-Run generation;
- multiple Contenders, rounds and parallelism;
- Pause or suspend;
- Rule Sets editor;
- annotation and collaboration;
- CI and pull-request automation;
- cloud sync and remote workers;
- plugin/evaluator marketplace;
- Figma;
- automatic updater/background daemon;
- preference learning;
- platform parity claims;
- automatic default-browser launching and multi-client dashboard pairing;
- inline active-document preview or embedded Playwright Trace Viewer.

## 13. Exit condition

A gap leaves this register only when evidence is committed and affected canonical documents, schemas and tests are updated. “Implemented locally,” “works on my machine,” or “the upstream docs say it should work” is insufficient.
