# 07 — Storage Policy, Configuration, Security, and Accounting

**Status:** Canonical implementation contract  
**Filesystem authority:** `spec/11-artifact-event-and-schema-contracts.md`  
**Shared types:** `schemas/domain-types.ts`  
**Normalization:** `spec/12-cross-spec-normalization.md`

## 1. Scope

This specification defines storage policy, configuration precedence, security boundaries, redaction, accounting, retention, and data-flow requirements.

It does not define a second filesystem layout. All live canonical paths and filenames come from `spec/11`.

## 2. Canonical principle

Files and append-only event streams are canonical. A database may later index them, but deleting the index must leave the full run reconstructable.

Canonical data includes:

- project identity;
- resolved run configuration;
- source snapshots;
- semantic events;
- artifact registrations and payloads;
- gate results;
- evaluator input and output;
- evidence;
- recommendations;
- user decisions;
- promotions;
- cleanup and integrity results.

## 3. Storage roots

Canonical durable storage uses the platform data roots defined by `spec/11`.

The repository marker is:

```text
<repository>/.render-rivals/project.json
```

The following older names are superseded and must not be implemented:

- `.visual-optimizer/`;
- `visual-optimizer/sessions/` as canonical storage;
- session cache directories containing the only copy of run history.

Disposable worktrees, browser downloads, package caches, and image-processing files may use a separate cache root.

## 4. Run layout

The canonical run root is:

```text
<data-root>/projects/<project-id>/runs/<run-id>/
```

Its exact files and directories are defined only in `spec/11`.

Older examples such as top-level `manifest.json`, `decision.json`, `metrics.json`, `accounting.json`, and `cleanup.json` are superseded. Their canonical replacements are described in `spec/12`.

## 5. Configuration sources

Configuration may come from:

1. built-in defaults;
2. user-global configuration;
3. project configuration;
4. run-template values;
5. explicit CLI or dashboard overrides;
6. session-only secret references.

Resolved Run Configuration is immutable after validation.

## 6. Precedence

Higher-precedence layers override lower-precedence layers only for fields whose schema permits override.

The resolved configuration stores:

- final normalized value;
- source layer;
- whether the value was explicit or defaulted;
- schema version;
- redaction classification;
- canonical hash.

Conflicting security or containment requirements fail validation rather than silently choosing the weaker value.

## 7. Configuration format

Project and user configuration use versioned JSONC or JSON validated by the shared schema package.

Rules:

- unknown top-level fields are rejected unless namespaced extensions are allowed;
- duplicate keys are rejected;
- secret values are not stored in resolved canonical JSON;
- executable commands use executable plus argument arrays;
- shell execution requires an explicit shell executable and policy acknowledgement;
- relative paths declare their base;
- environment keys are individually classified.

## 8. Secret references

Secrets are supplied through approved references, not plaintext canonical files.

A secret reference records:

- stable reference name;
- provider or source class;
- presence/absence;
- scope;
- redaction category;
- whether external evaluator transmission is permitted.

Raw values are excluded from hashes where inclusion would leak them. Presence and reference identity may be hashed.

## 9. Project trust

Before first execution, the user acknowledges that project commands run with the user's authority and are not a complete sandbox.

Trust is invalidated or reviewed when:

- repository identity changes;
- command configuration changes materially;
- containment capability is reduced;
- privileged operations are introduced;
- trust is explicitly revoked.

## 10. Path safety

Every path is canonicalized before use.

Reject:

- traversal outside owned roots;
- unsafe symlinks or junctions;
- ambiguous case collisions;
- NUL and invalid platform path forms;
- project-provided absolute destinations where policy requires generated paths;
- archive traversal during import.

Artifact serving accepts Artifact IDs, not arbitrary paths.

## 11. Local dashboard security

The dashboard:

- binds to `127.0.0.1` by default;
- uses a per-session authentication token;
- requires CSRF-safe mutation requests;
- exposes only registered artifacts;
- applies content-type and download headers;
- blocks navigation or serving outside configured roots;
- never treats browser UI connection as native supervisor authentication.

## 12. Native IPC security

Native endpoint identifiers and session nonces are passed through environment, never argv.

The supervisor verifies:

- peer identity;
- session nonce;
- protocol version;
- exact coordinator Node path;
- containment/session membership where applicable;
- single authenticated coordinator ownership.

## 13. Command execution

Project and evaluator processes are launched only through the Rust supervisor.

Command records include:

- executable identity;
- redacted arguments;
- working directory;
- environment hash and redaction summary;
- purpose;
- resource policy;
- process/containment identity;
- output artifact IDs.

A stored PID is observational metadata, not durable identity.

## 14. Raw output

Stdout and stderr are drained continuously by Rust into binary-safe files registered as sensitive local artifacts.

Raw output:

- may contain secrets;
- is excluded from standard exports;
- is not required to be UTF-8;
- records truncation explicitly;
- is parsed into semantic events only by versioned parsers;
- is never silently discarded.

## 15. Artifact sensitivity

Sensitivity classes:

- `public`;
- `project`;
- `sensitive_local`.

Secret material is prohibited as a canonical artifact.

Sensitivity may become more restrictive automatically. Declassification requires an explicit review record.

## 16. Redaction

Redaction occurs before structured logging, evaluator transmission, diagnostics, and standard export.

Supported mechanisms:

- declared secret values;
- secret environment keys;
- authorization/header filtering;
- cookie and storage filtering;
- token-pattern matching;
- user-defined regex rules;
- home-directory normalization in portable diagnostics.

Render Rivals does not claim to detect every arbitrary secret emitted by child code.

## 17. External evaluator data flow

Before an evaluator invocation, the immutable packet records:

- provider;
- adapter;
- model when known;
- artifact allowlist;
- redactions;
- excluded artifacts;
- source-content policy;
- user/project policy;
- packet hash.

The system records exactly what was sent. External evaluators cannot access arbitrary local files.

## 18. Accounting

The sole canonical accounting interface is `InferenceUsage` from `schemas/domain-types.ts`.

It includes:

- provider;
- adapter;
- model;
- closed purpose enum;
- start and completion timestamps;
- nullable token counts;
- nullable cost;
- policy snapshot ID.

Unknown values remain null. Accounting records are immutable invocation facts.

## 19. Process accounting

Process usage may record:

- elapsed wall time;
- CPU time;
- peak memory;
- process count;
- bytes written to stdout/stderr;
- termination reason;
- resource-limit events.

Unavailable platform values remain unknown rather than estimated.

## 20. Configuration hashing

The Run Configuration hash covers normalized, nonsecret semantics including:

- commands;
- source declarations;
- route and fixture;
- viewports and browser policy;
- gates;
- factors and evaluator policy;
- resource limits;
- storage and retention policy;
- export policy;
- security policy references.

Changing a frozen value requires a new run or superseding Run Configuration according to lifecycle policy.

## 21. Retention

Retention classes and deletion protocol are owned by `spec/11`.

Policy must preserve every artifact cited by a retained recommendation, decision, or promotion.

Raw logs, traces, and other diagnostic artifacts may have shorter retention when no retained entity references them.

## 22. Database policy

No database is canonical in the initial implementation.

A later SQLite index may provide:

- search;
- recent-run summaries;
- dashboard projections;
- aggregate metrics;
- cached artifact metadata.

It must be fully rebuildable from canonical files. This section delegates persistence mechanics to `spec/11` rather than repeating them.

## 23. Import and export security

Imports require:

- checksum verification;
- schema support;
- archive traversal protection;
- decompression limits;
- provenance declaration;
- no executable auto-run;
- read-only status until adopted.

Exports require:

- allowlisted artifacts;
- redaction report;
- omission report;
- checksums;
- no raw secrets;
- no raw process output by default;
- no unrelated source content.

## 24. Diagnostics

Default diagnostic bundles include:

- versions and capability report;
- redacted resolved configuration;
- failure records;
- event and integrity summaries;
- cleanup results;
- selected structured logs;
- artifact manifest without sensitive payloads;
- explicit omissions.

Source, screenshots, raw output, evaluator payloads, and environment values require explicit selection.

## 25. Security invariants

- Project code cannot select arbitrary canonical output paths.
- Invalid or cross-run artifacts cannot enter evaluator packets.
- External evaluator access is allowlist-based.
- Secrets never appear in canonical resolved configuration.
- Unknown containment capability is never represented as strong containment.
- An optional database never becomes the only copy of a fact.
- Standard exports are non-executable and sanitized.
- Cleanup failure remains visible after a successful product outcome.

## 26. Required tests

- `.visual-optimizer` paths are rejected as canonical live storage;
- resolved configuration records provenance and hash;
- secret values do not appear in canonical JSON;
- path traversal and unsafe symlink tests fail closed;
- dashboard cannot serve unregistered paths;
- evaluator packets contain only allowlisted artifacts;
- `InferenceUsage` imports from `schemas/domain-types.ts`;
- unknown usage values remain null;
- database deletion leaves run reconstruction intact;
- standard diagnostic export excludes raw output and source by default;
- retained recommendation prevents deletion of cited evidence.
