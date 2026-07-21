# Render Rivals Threat Model

**Status:** Security implementation contract  
**Scope:** Local bootstrap, native supervisor, coordinator/dashboard, Project commands, browser capture, evaluator adapters, canonical storage, Git/Promotion, imports/exports, secrets, and residual risk.

## 1. Security objective

Render Rivals must prevent its orchestration layer from accidentally granting broader authority, corrupting source/history, confusing untrusted output with trusted evidence, leaking known secrets, or claiming containment/isolation it does not provide.

Render Rivals is not a hostile-code sandbox. Project code and local evaluator commands execute with the user's operating-system authority unless the host independently restricts them.

## 2. Protected assets

- active source repository and Git refs;
- canonical Run history and evidence integrity;
- user credentials, tokens, cookies, and environment secrets;
- arbitrary user files outside approved roots;
- local processes, ports, and system resources;
- Decision/Promotion authorization;
- diagnostic/export privacy;
- evaluator packet confidentiality;
- dashboard Session authentication;
- release/native package integrity.

## 3. Actors

- local user;
- Render Rivals bootstrap/supervisor/coordinator/dashboard;
- Project repository code and package scripts;
- local evaluator/agent executable;
- remote evaluator/provider;
- browser-rendered Candidate content;
- another local process under same or different user;
- malicious/corrupt imported bundle;
- compromised dependency or release package.

## 4. Trust boundaries

### Boundary A — Bootstrap to native supervisor

Native binary/package is trusted only after expected package/integrity verification. Bootstrap liveness and exact Node metadata cross this boundary.

### Boundary B — Supervisor IPC

Security-critical. One authenticated coordinator, peer identity, nonce, protocol, exact Node, containment membership, and strict framing.

### Boundary C — Coordinator to Project/evaluator processes

Project and local evaluator commands are user-trusted execution, not sandboxed. Render Rivals minimizes environment/paths and contains process lifetime/resources where possible.

### Boundary D — Dashboard browser to coordinator

Loopback HTTP still requires Session authentication, Origin/CSRF protection, CSP, safe Artifact serving, and revision/idempotency.

### Boundary E — Candidate page to capture/evaluator

Candidate content is untrusted evidence input. DOM text may contain prompt injection, malicious URLs, huge data, malformed SVG/HTML, or attempts to escape navigation policy.

### Boundary F — Coordinator to remote evaluator

Only redacted allowlisted packet is intentionally transmitted. Provider terms, logging, retention, and network transport remain external trust.

### Boundary G — Canonical storage and import/export

Paths, schemas, hashes, archives, and media are untrusted until validated. Canonical history requires atomic writes and integrity checks.

### Boundary H — Git Promotion

Selected Candidate output may affect local refs or create patches. Decision/source/destination preconditions must verify before mutation.

## 5. Explicit non-guarantees

Render Rivals does not guarantee:

- filesystem or network isolation for Project/local evaluator code;
- protection from malicious same-user process reading memory/environment/files;
- complete secret detection in arbitrary raw output/screenshots/source;
- cleanup after OS/kernel failure beyond measured platform mechanisms;
- macOS containment parity;
- security of remote evaluator/provider storage;
- safety of code a user later applies/runs after Promotion;
- complete prevention of a deliberately malicious Project escaping user-level process controls.

UI/documentation must not imply these guarantees.

## 6. Threats and controls

### 6.1 Native package substitution

Threat: malicious or wrong-platform supervisor binary.

Controls:

- platform package resolution;
- checksum/signature metadata where distributed;
- version/protocol handshake;
- release provenance/SBOM before public release;
- stop before execution on mismatch.

### 6.2 IPC hijack/replay

Threat: another process issues spawn/cleanup commands.

Controls:

- random one-Session endpoint;
- restrictive ACL/permissions;
- peer credentials/PID/process identity;
- one-time nonce;
- one coordinator;
- sequence and operation ID;
- strict schemas/size limits;
- close endpoint after authentication.

Residual: malicious same-user process with memory/endpoint/nonce access may defeat local authentication.

### 6.3 Shell/argument injection

Threat: Project strings become shell commands.

Controls:

- executable plus argument array;
- no implicit shell;
- explicit shell executable/acknowledgement;
- bounded args/environment;
- purpose/root validation;
- redacted audit record.

### 6.4 Path traversal and link escape

Threat: source, Artifact, import, or export path escapes owned roots.

Controls:

- canonicalization;
- generated IDs;
- traversal/absolute/UNC rejection;
- symlink/junction/mount containment;
- case/Unicode collision checks;
- archive extraction limits;
- exclusive create and destination preconditions;
- Artifact serving by ID.

### 6.5 Process escape and stubborn descendants

Threat: child detaches, binds port, survives cleanup.

Controls:

- Windows Job/verified inheritance;
- Linux delegated cgroup/watchdog where measured;
- process groups/subreaper fallback;
- listener ownership;
- doctor adversarial fixture;
- Session/group cleanup verification;
- no strong claim when unverified.

Residual: managed/best-effort modes may leave descendants after supervisor crash or malicious escape.

### 6.6 Resource exhaustion

Threat: process floods output, memory, process count, disk, browser contexts, event clients.

Controls:

- admission controller;
- one Candidate/browser MVP;
- memory/process/disk/output limits;
- continuous Rust draining;
- bounded buffers/frames;
- SSE backpressure isolation;
- Artifact/request/decompression limits;
- terminate when durability cannot be maintained.

### 6.7 Port impersonation

Threat: unrelated/malicious process responds at expected URL.

Controls:

- strict port policy;
- native listener owner lookup;
- containment-group membership;
- local origin restrictions;
- ownership unavailable labeled limited/blocked;
- never kill unrelated PID.

### 6.8 Dashboard cross-site requests

Threat: malicious site sends local mutation or reads data.

Controls:

- loopback bind;
- unguessable HttpOnly SameSite=Strict cookie;
- Origin validation;
- custom CSRF header;
- restrictive CORS/CSP;
- no token URL;
- mutation revision/operation ID;
- no wildcard static file serving.

### 6.9 Malicious Artifact preview

Threat: HTML/SVG/script executes in dashboard origin or content sniffing leaks data.

Controls:

- explicit media-type allowlist;
- `X-Content-Type-Options: nosniff`;
- download attachment for active content;
- image decoding/normalization in isolated library process where practical;
- sandboxed separate-origin/opaque preview for HTML if ever supported;
- CSP disallow inline/remote script;
- never inject Artifact text as HTML.

### 6.10 Candidate navigation/network exfiltration

Threat: Candidate page navigates externally or sends secrets/data.

Controls:

- allowed origin/navigation policy;
- intercept/report/block external requests according to frozen policy;
- minimal Candidate environment/secrets;
- deterministic local fixture;
- no browser profile reuse;
- fresh contexts;
- cookies/storage excluded/redacted.

Residual: Project server itself can use network/filesystem with user authority unless host restricts it.

### 6.11 Prompt injection and evaluator manipulation

Threat: Candidate text instructs evaluator to ignore schema, reveal files, or select itself.

Controls:

- Candidate content treated as evidence data;
- immutable packet and explicit evaluator instructions;
- strict result schema;
- Artifact citation allowlist;
- order reversal/anonymization;
- protected gates override evaluator;
- raw output retained and malformed output rejected;
- local evaluator not given arbitrary source paths by default.

Residual: model judgment can still be manipulated while producing schema-valid output; human review and controls are required.

### 6.12 Remote evaluator leakage

Threat: sensitive source/screenshot/text transmitted or retained.

Controls:

- allowlisted packet;
- redaction and source-content policy;
- preflight data-flow display;
- provider/model/policy snapshot;
- exact sent Artifact record;
- optional human-only mode;
- no arbitrary local file access through remote adapter.

### 6.13 Local evaluator overreach

Threat: user-configured evaluator reads unrelated local files/network.

Controls:

- explicit trust acknowledgement;
- executable identity/audit;
- minimized environment/CWD;
- owned input/output paths;
- process containment/resources;
- documentation that allowlist is not OS sandbox.

Residual: it runs with user authority and may access user-readable resources.

### 6.14 Secret leakage

Threat: secrets enter logs, packets, screenshots, diagnostics, patches, or exports.

Controls:

- explicit secret references;
- no secret values in canonical config;
- value/key/token/authorization/cookie redaction;
- raw logs sensitive and excluded by default;
- source and environment excluded from diagnostics by default;
- export redaction/omission report;
- packet preview;
- no endpoint/nonce argv/log/URL.

Residual: arbitrary secrets not declared or recognizable may leak; UI must state this.

### 6.15 Canonical history corruption

Threat: crash/torn write/mutation/reorder/orphan makes false history.

Controls:

- append-only hash chain;
- exact transition ordering;
- atomic replace/fsync;
- Artifact hash/manifest;
- revision preconditions;
- lock identity;
- quarantine/reconstruction;
- database noncanonical;
- integrity report.

### 6.16 Import/archive attack

Threat: traversal, decompression bomb, malformed schema/media, executable auto-run, ID collision.

Controls:

- path/symlink validation;
- compressed/uncompressed/count limits;
- checksums/schema versions;
- quarantine;
- no executable auto-run;
- read-only import until adoption;
- provenance/new IDs where required.

### 6.17 Git/source damage

Threat: stash/reset/clean/checkout/branch collision/patch overwrite modifies active source.

Controls:

- system Git explicit arguments;
- no implicit network/stash/reset/clean;
- workspaces outside repository;
- immutable Source Snapshot;
- branch exclusive-create/preconditions;
- no checkout over active tree;
- no push/upstream changes;
- patch exclusive destination;
- result verification.

### 6.18 Stale or forged approval

Threat: old Decision authorizes changed Candidate/export.

Controls:

- Decision binds Recommendation/evidence/source/policy hashes;
- Promotion validates all hashes/destination;
- selected eligible Candidate required;
- revision/operation idempotency;
- stale status blocks action;
- ordinary Export Operation separated from adoption.

### 6.19 Diagnostic/export leakage

Threat: user shares sensitive bundle unintentionally.

Controls:

- default minimal bundle;
- explicit file list before creation;
- redaction/omission report;
- raw logs/source/screenshots/evaluator packet excluded unless selected;
- checksums and sensitivity labels;
- no automatic upload.

## 7. Security capability states

- **Strong:** reference containment/security probes pass.
- **Managed/Limited:** explicit missing guarantees; policy may block Run.
- **Best effort:** observation/cleanup only, no strong claim.
- **Safe mode:** authenticated read-only/recovery Session capability, not a security sandbox.
- **Blocked:** mandatory boundary cannot be established.

## 8. Security events

At minimum record:

- native package integrity failure;
- peer/auth/protocol violation;
- path/symlink/junction escape;
- containment/descendant escape;
- listener ownership mismatch;
- secret/redaction policy violation;
- Artifact hash/schema failure;
- evaluator citation/provenance violation;
- stale Decision/Promotion;
- import/export validation failure;
- cleanup ownership uncertainty.

Security events include stable code, affected entity, observation source, retained diagnostics, and cleanup/result without secret values.

## 9. Security release requirements

Before public alpha:

- threat tests in `docs/TEST-AND-VALIDATION-STRATEGY.md` pass;
- native dependency audit and package checksums;
- dashboard CSP/CSRF/Origin review;
- Artifact preview media policy;
- archive import limits;
- secrets/redaction fixture suite;
- Git non-destructive suite;
- documented support/non-guarantees;
- security reporting process;
- license and third-party notices.

## 10. Residual-risk communication

First-run trust and docs must say plainly:

- Project/local evaluator commands can access what the user account can access;
- containment focuses on lifecycle/resource cleanup, not filesystem sandboxing;
- remote evaluator receives the listed packet and may retain it under provider terms;
- raw output and captures may contain undeclared secrets;
- users should run untrusted repositories in an OS/container/VM security boundary they control.

## 11. Review triggers

Review this threat model when:

- adding in-run generation;
- adding remote workers/cloud sync;
- adding CI/PR automation;
- enabling external URLs/network capture;
- adding HTML/SVG active previews;
- adding ConPTY/interactive agents;
- changing IPC/auth/storage/import formats;
- broadening Git Promotion;
- adding automatic updates;
- claiming new platform containment level.
