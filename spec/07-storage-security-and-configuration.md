# 07 — Storage Policy, Configuration, Security, Accounting, and Data Flow

**Status:** Canonical implementation contract  
**Filesystem authority:** `spec/11-artifact-event-and-schema-contracts.md`  
**Configuration/API:** `spec/13-configuration-cli-and-local-api-contracts.md`  
**Observability:** `spec/15-observability-diagnostics-and-telemetry-contracts.md`  
**Threat model:** `security/THREAT-MODEL.md`  
**Shared types/errors:** `schemas/domain-types.ts`, `schemas/error-codes.ts`

## 1. Scope

This specification defines storage policy, configuration security, trust, redaction, accounting, retention, external data flow, and privacy invariants.

It does not define a second filesystem layout, CLI/API contract, or telemetry policy. Those are owned by specs 11, 13, and 15.

## 2. Canonical principle

Files and append-only Event/Artifact streams are canonical. A database may later index them, but deleting the index leaves every retained Run reconstructable.

Canonical data includes Project identity/trust, resolved Run Configuration and Policy Snapshots, Source Snapshots, Events, Process records/output, Artifacts, Gates, Evaluations, Evidence, Recommendations, Decisions, Promotions, Export Operations, Cleanup, Integrity, and Recovery.

## 3. Storage roots and old names

Canonical durable roots and exact layout come only from `spec/11`.

Repository-local metadata:

```text
<repository>/.render-rivals/project.json
<repository>/.render-rivals/config.jsonc
```

The following are superseded and rejected as canonical live storage/configuration names:

- `.visual-optimizer/`;
- `visual-optimizer/sessions/`;
- `VISOPT_*` variables;
- Session cache containing the only Run history;
- top-level old `manifest.json`, `decision.json`, `metrics.json`, `accounting.json`, or `cleanup.json` layouts.

Disposable Workspaces, browser downloads, package stores, and image caches use separate owned cache roots.

## 4. Configuration authority

Exact files, discovery, precedence, merge rules, reserved environment variables, CLI flags, and safe mode are defined by `spec/13`.

Security rules:

- resolved Run Configuration becomes immutable after validation;
- unknown fields and duplicate keys reject;
- executable commands are executable plus argument arrays;
- explicit shell use requires policy acknowledgement;
- relative paths declare base;
- environment keys are classified individually;
- higher-precedence layers cannot silently weaken mandatory containment/security;
- provenance and canonical hash are stored for every resolved field;
- sealed changes create a superseding Run.

## 5. Secret references

Secrets are supplied through approved references/session bindings, never plaintext canonical configuration.

A secret reference records:

- stable reference name;
- source/provider class;
- presence;
- scope;
- redaction category;
- allowed recipients/process purposes;
- whether remote evaluator transmission is permitted.

Raw secret values are excluded from canonical hashes when inclusion would leak them; reference identity and presence may be hashed.

Secrets are passed only to processes explicitly authorized by frozen policy. Project/evaluator child environments do not inherit coordinator/supervisor Session secrets.

## 6. Project and local evaluator trust

Before first execution, user acknowledges:

- Project commands run with the user's OS authority;
- local evaluator commands also run with the user's OS authority;
- process containment focuses on lifecycle/resource control, not filesystem/network sandboxing;
- commands may technically read user-accessible files or use network unless the host independently restricts them;
- Render Rivals minimizes environment/CWD/paths but cannot guarantee hostile-code isolation.

Trust is reviewed/invalidated when repository or executable identity, command configuration, containment level, privilege, or declared data access changes, or when explicitly revoked.

Project trust and local evaluator trust may be separate records because their executables/data access differ.

## 7. Path and source safety

Every path is canonicalized and validated against an approved purpose/root.

Reject:

- traversal;
- absolute/drive/UNC forms where generated relative path required;
- unsafe symlink/junction/mount escape;
- case/Unicode collision;
- NUL/invalid platform forms;
- Project-selected canonical output paths;
- archive traversal/decompression abuse;
- source/workspace semantics unsupported by spec14.

Artifact serving accepts registered Artifact ID, not arbitrary path.

## 8. Dashboard security

Dashboard:

- binds loopback by default;
- uses per-Session HttpOnly SameSite=Strict authentication cookie;
- validates Origin and CSRF-safe mutation header;
- uses restrictive CSP and `nosniff`;
- serves only registered Artifacts through media policy;
- never injects untrusted Artifact text as HTML;
- uses revision and operation idempotency;
- never treats browser connection as native supervisor authentication.

Active HTML/SVG or similar content is downloaded or isolated according to the threat model; it is not rendered with dashboard origin privileges by default.

## 9. Native IPC and managed commands

Endpoint/nonce use environment, never argv/URL/logs. Supervisor verifies peer identity, Session, nonce, protocol, exact Node, containment, and one coordinator.

All Project, evaluator, Git, browser-root, fixture, and utility managed roots are authorized/launched through supervisor. Approved descendants follow specs 02–04.

Command/process records include executable identity, redacted args, CWD, environment hash/redaction, purpose, resource/output policy, stable Process/Group identity, containment, and output Artifacts.

PID is observation only.

## 10. Raw output and Artifact sensitivity

Rust drains stdout/stderr continuously into binary-safe sensitive-local Artifacts.

Raw output:

- may contain secrets;
- is not required UTF-8;
- records truncation/discard ranges/termination explicitly;
- is excluded from standard exports and remote telemetry;
- is parsed into semantic facts only by versioned parsers;
- is never silently discarded.

Sensitivity:

- public;
- Project;
- sensitive_local.

Secret material is prohibited as canonical Artifact. Sensitivity can become more restrictive automatically; declassification requires explicit review.

## 11. Redaction

Redaction occurs before structured logs, remote evaluator transmission, diagnostic/export output, telemetry/crash upload, and any user-approved sharing.

Mechanisms:

- declared secret values/keys;
- authorization/header/cookie/storage filtering;
- token-pattern matching;
- user regex;
- path normalization;
- field allowlists;
- size/content limits.

Render Rivals does not claim to detect every arbitrary secret emitted or rendered by child code. Raw logs/captures remain sensitive even after best-effort redaction.

## 12. Remote evaluator data flow

A remote provider adapter receives only the immutable allowlisted/redacted packet through Render Rivals-owned transport code.

Before invocation, record/show:

- provider/adapter/model when known;
- exact Artifact allowlist and hashes;
- redactions/exclusions;
- source-content policy;
- provider/policy snapshot;
- packet hash;
- destination/retention/terms metadata available to the product.

The system records exactly what it intentionally transmitted.

A **remote provider** cannot request arbitrary local filesystem paths through the adapter contract. This is distinct from a **local evaluator executable**, which is trusted user-authority code and is not OS-sandboxed by the packet allowlist.

## 13. Candidate page network/data flow

Capture policy declares:

- permitted local origin(s);
- external request allow/block/report behavior;
- fixture/network mocks;
- authentication/cookie/storage policy;
- whether Project server may access network;
- redaction/exclusion for request/response summaries.

Browser navigation and request policy reduce accidental exfiltration but do not sandbox the Project server's own filesystem/network authority.

## 14. Accounting

Canonical `InferenceUsage` records provider, adapter, model, closed purpose, timestamps, nullable token/cost fields, and typed Policy Snapshot ID.

Process accounting may record wall/CPU time, memory, process count, stdout/stderr bytes, termination reason, resource events, and capability/measurement source.

Unknown values remain null/unknown, never estimated silently.

Accounting is local canonical/derived data. Remote telemetry policy is separate and cannot transmit Project-specific accounting detail by default.

## 15. Configuration and policy hashes

Run Configuration hash covers normalized nonsecret semantics: commands, sources, route/fixture/states/interaction, browser/viewports, Gates/Factors/evaluator, limits/retry, storage/retention, Promotion/Export policy, security/redaction references.

Policy Snapshots bind specific Gate, evaluation, security, redaction, retry/resource/output, telemetry, and export semantics used by records.

Changing frozen semantics requires a new/superseding Run or new explicitly scoped Export Operation, never reinterpretation of old evidence.

## 16. Retention and deletion

Exact classes/protocol come from `spec/11` and spec15.

Policy preserves every Artifact needed by retained Evidence, Recommendation, Decision, Promotion, Export manifest, Integrity, or security/cleanup fact.

Raw logs/traces may have shorter retention only when unreferenced and deletion is explicit. No hidden daemon is assumed; cleanup runs during application startup/active command.

Uninstall does not silently delete data.

## 17. Import, Promotion, and Export security

Imports require checksum/schema/path/decompression/provenance validation, no executable auto-run, and read-only status until adoption.

Promotion requires selected eligible Candidate, authorizing nonstale Decision, safe destination, source/result verification, no active-tree overwrite, and no automatic push/merge.

Export Operation requires source-entity integrity appropriate to kind, redaction/omission report, checksums, safe destination, and no executable auto-run.

Report/diagnostics/bundle Export never implies Contender adoption.

## 18. Observability and telemetry

`spec/15` controls logs, metrics, traces, diagnostic bundles, crash records, optional telemetry, consent, and uploads.

Locked defaults:

- local observability enabled;
- remote telemetry disabled;
- automatic crash upload disabled;
- no third-party analytics script;
- no background analytics daemon;
- no source/capture/command/path/evaluator content sent as ordinary telemetry.

Telemetry is never required for Run operation.

## 19. Database policy

No database is canonical. A later SQLite index may provide search/recent summaries/aggregate metrics/cached metadata, but is fully rebuildable and contains no sole domain fact.

## 20. Security invariants

- Project/local evaluator code is never represented as sandboxed.
- Project code cannot choose arbitrary canonical output path.
- invalid/cross-Run/unallowlisted Artifacts cannot enter evaluator packet.
- remote evaluator transport sends only declared packet.
- local evaluator trust is separate from remote packet allowlist.
- secrets never appear in resolved canonical configuration.
- unknown containment is never strong.
- optional database is never sole fact.
- Promotion and Export Operation remain distinct.
- standard outputs are sanitized/non-executable by default.
- cleanup/security incidents remain visible.
- remote telemetry/crash upload are off by default and consented separately.

## 21. Required tests

- old paths/env names rejected;
- resolved configuration provenance/hash;
- secrets absent canonical JSON and child envs unless authorized;
- Project/local evaluator trust review triggers;
- traversal/symlink/case/archive tests;
- dashboard auth/Origin/CSRF/CSP/media tests;
- remote packet contains only allowlisted redacted Artifacts;
- local evaluator warning/non-sandbox guarantee visible;
- unknown accounting null;
- index deletion leaves reconstruction;
- Promotion/Export security separation;
- standard diagnostics exclude source/raw/captures/evaluator payloads;
- telemetry/crash defaults send nothing;
- retained references block unsafe deletion.
