# 07 — Canonical Storage, Configuration, Security, and Accounting

## 1. Canonical principle

Files are canonical. A database may index them later. Deleting index cannot destroy run record.

## 2. Project metadata

```text
.visual-optimizer/
  project.json
  preferences.jsonl
  suppressions.jsonl
```

Large evidence defaults to user cache.

## 3. Session storage

```text
<cache>/visual-optimizer/sessions/<session-id>/
  session.json
  native-events.ndjson
  processes/
  runs/
  temp/
```

## 4. Run storage

```text
runs/<run-id>/
  manifest.json
  events.ndjson
  decision.json
  metrics.json
  accounting.json
  cleanup.json
  champion/
  candidates/
  comparisons/
  human-ratings/
```

## 5. Candidate storage

```text
candidates/<candidate-id>/
  manifest.json
  source.json
  patch.diff
  agent-events.raw
  agent-events.ndjson
  build/
  tests/
  server/
  captures/
  accessibility/
  traces/
  judge/
  resource.json
```

## 6. Process storage

```text
processes/<process-id>/
  lifecycle.json
  stdout.bin
  stderr.bin
  usage.json
```

## 7. Event log

Append-only NDJSON with schema version, sequence, timestamp, session, run, type, payload.

## 8. Recovery

Recovery:

1. validate sequence;
2. identify incomplete phase;
3. classify cleanup;
4. preserve partial artifacts;
5. invalidate bad captures;
6. write summary.

## 9. Atomic writes

Small JSON: temp write, flush/fsync where supported, rename. Streams use explicit flush policy.

## 10. Hashes

Hash config, fixture, patch, screenshots, DOM, packet, decision, accounting. Hashes support integrity/cache invalidation, not signed attestation.

## 11. Database

No initial database. Later SQLite may index history and preferences; always rebuildable.

## 12. Configuration

Use static JSONC:

```text
visual-optimizer.config.jsonc
```

Human/agent readable, nonexecutable, strict validation, no YAML coercion.

## 13. Loading

Config loading does not execute JavaScript. Complex fixture code is separate explicitly trusted module.

## 14. Config areas

```ts
interface ProjectConfig {
  project: ProjectSection;
  commands: CommandSection;
  workspace: WorkspaceSection;
  server: ServerSection;
  captures: CaptureSection[];
  gates: GateSection;
  resources: ResourceSection;
  agents: AgentSection;
  judges: JudgeSection;
  storage: StorageSection;
  security: SecuritySection;
}
```

## 15. Commands

Use executable, args, CWD, env allowlist, timeout, expected outputs. No implicit shell.

## 16. Fixture module

Optional trusted file:

```text
visual-optimizer.fixtures.ts
```

May prepare state, mock network, reset database, login, identify state, implement custom settle.

## 17. Workspace materials

Declare required untracked resources. Doctor verifies in disposable worktree.

## 18. Secret classification

Credentials, personal data, API tokens, cookies, private database contents.

## 19. Secret sources

Environment, declared local file, later OS secret store, one-session input.

## 20. Secret rules

Secrets absent from argv, patches, lifecycle JSON, terminal progress, dashboard responses, judge packets, exports.

Raw child output may still print secrets; treat it as locally sensitive and exclude from export by default.

## 21. Judge payload declaration

Record provider, model, screenshots, DOM/text, task brief, code excerpts, redactions, policy snapshot.

## 22. Local server

Bind `127.0.0.1`, not all interfaces.

## 23. Dashboard auth

Random session token. Mutations require token. Short-lived URL bootstrap token may become HttpOnly cookie.

## 24. Server protections

- no broad CORS;
- same-origin UI;
- CSP;
- path canonicalization;
- no arbitrary local file endpoint;
- content type validation;
- CSRF protection;
- per-session token.

## 25. Evidence serving

Serve only files registered in manifest. Never accept arbitrary path.

## 26. Path security

Canonicalize roots, check containment, consider symlink traversal.

## 27. Repository trust

Target repository executes as user. Not a sandbox.

Provide first-run warning, trust record, command preview, protected roots, later network policy.

## 28. Accounting package

```text
packages/accounting
```

Owns generation, critique, selection, reversal, tie break, wall time, human time, CPU, memory, disk, vendor snapshot.

## 29. Inference usage

```ts
interface InferenceUsage {
  provider: string;
  adapter: string;
  model: string | null;
  purpose: string;
  inputTokens: number | null;
  outputTokens: number | null;
  cachedInputTokens: number | null;
  subscriptionUnits: number | null;
  reportedCostUsd: number | null;
  startedAt: string;
  completedAt: string;
  policySnapshotId: string;
}
```

## 30. Experimental allocation

```ts
interface ExperimentAllocation {
  generationCalls: number;
  refinementCalls: number;
  criticCalls: number;
  selectorCalls: number;
  orderReversalCalls: number;
  tieBreakCalls: number;
  humanComparisons: number;
}
```

## 31. Local resources

```ts
interface LocalResourceRecord {
  peakMemoryMiB: number | null;
  cpuTimeMs: number | null;
  diskWrittenMiB: number | null;
  wallTimeMs: number;
  processPeak: number | null;
}
```

## 32. Policy snapshot

```ts
interface VendorPolicySnapshot {
  id: string;
  provider: string;
  capturedAt: string;
  authenticationMode: string;
  plan: string | null;
  summary: string;
  sourceReference: string | null;
  uncertainty: string[];
}
```

## 33. Quality-first usage

No initial token cap. Accounting mandatory so later optimization can reduce candidates, critics, reversals, refinements, and ensemble size while measuring quality loss.

## 34. Retention policy

- manifests/decisions: retain;
- screenshots: retain;
- traces: configurable;
- raw output: shorter retention;
- worktrees: remove after export unless preserved;
- secrets: delete after use.

## 35. Export

Sanitized bundle excludes secrets, env dumps, raw output by default, absolute paths where possible, private databases.

## 36. Import

Validate schema, hashes, path safety, archive traversal, provenance. Imported evidence read-only unless adopted.

## 37. Preferences

Append-only entries include project scope, candidates, selected/rejected characteristics, rationale, source, confidence, date. Learning deferred.

## 38. Suppressions

Include fingerprint, reason, actor, scope, expiry, evidence. Cannot override protected gates during exploratory mode unless protocol says so.

## 39. Schemas

Use Zod internally; export JSON Schema for structured agent outputs. Do not claim public standard.

## 40. Migrations

Every artifact has schema version. Migrations deterministic, tested, non-destructive, explicit.

## 41. Logging

Coordinator semantic logs; native raw output separate. Terminal logs are not run events.

## 42. Redaction

Declared values, token patterns, configured regexes, env-key classification. Redaction can fail; threat model states this.

## 43. Security tests

- `SEC-001`: dashboard cannot read arbitrary path.
- `SEC-002`: mutation without token fails.
- `SEC-003`: IPC inaccessible to another user.
- `SEC-004`: wrong coordinator peer fails.
- `SEC-005`: secret absent from lifecycle JSON.
- `SEC-006`: secret excluded from export.
- `SEC-007`: archive traversal rejected.
- `SEC-008`: symlink escape rejected.
- `SEC-009`: metacharacters inert.
- `SEC-010`: cloud packet matches declaration.

## 44. Storage tests

- `STORE-001`: reconstruct after crash.
- `STORE-002`: temp JSON does not replace valid manifest.
- `STORE-003`: no index still preserves history.
- `STORE-004`: hash mismatch detected.
- `STORE-005`: invalid epoch not selectable.
- `STORE-006`: unknown usage null.
- `STORE-007`: cleanup persists after force.

## 45. Open items

- `OPEN-STORE-001`: platform cache roots.
- `OPEN-STORE-002`: raw-output retention.
- `OPEN-STORE-003`: export format after prototype.
- `OPEN-STORE-004`: SQLite trigger point.
- `OPEN-STORE-005`: cookie versus header dashboard token.
