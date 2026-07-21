# 24 — Secrets, Authentication State, and Network Egress Policy

**Status:** Canonical implementation contract  
**Scope:** Secret references and Session bindings, environment construction, browser authentication fixtures, cookies/storage state, redaction, external evaluator transmission, browser-layer network enforcement, Service Workers, WebSockets, server/evaluator process egress, determinism, and truthful capability claims  
**Security/configuration:** `spec/07-storage-security-and-configuration.md`  
**Capture evidence:** `spec/20-capture-artifact-formats-and-evidence-registry.md`  
**Threat model:** `security/THREAT-MODEL.md`

## 1. Purpose

Render Rivals needs credentials and authentication state for some Projects and may invoke external evaluators. It also promises controlled captures and can block or surface undeclared browser requests. Those statements are dangerous unless the implementation distinguishes:

- a secret reference from its raw value;
- Session memory from canonical storage;
- browser cookies/storage from Capture evidence;
- browser request interception from Project server/process network access;
- observed network activity from enforced egress isolation;
- a redacted text field from an unreviewed screenshot containing sensitive pixels.

This specification defines what the MVP can enforce, what it can only observe, and what it must reject rather than overclaim.

## 2. Security boundary

Project commands, development servers, fixture commands, Git, local evaluator commands, and helper processes execute with the user's operating-system authority unless a future sandbox/container policy explicitly says otherwise.

MVP process containment:

- controls lifecycle, grouping, resource limits, output, and cleanup where measured;
- does not generically restrict filesystem reads;
- does not generically restrict process network egress;
- does not prevent a malicious trusted Project/local evaluator from reading user-accessible files or opening sockets before detection;
- must not be described as secret isolation or network sandboxing.

Browser-context routing can enforce a declared policy for browser-originated HTTP requests and WebSockets under the pinned Playwright capability, but it cannot control arbitrary server-side or evaluator-process egress.

## 3. Secret vocabulary

### Secret reference

A nonsecret stable name and policy record describing where a Session may obtain a secret.

Minimum fields:

- reference ID/name;
- source class;
- intended consumer/purpose;
- Project and Session scope;
- required/optional;
- presence state;
- allowed delivery channel (`environment`, `stdin`, `browser_fixture`, `external_provider_transport`);
- external-transmission permission;
- redaction category and match policy;
- expiry/rotation hint where known;
- policy snapshot/hash.

A reference never contains the raw value.

### Secret binding

A Session-only association between one approved reference and one raw value in memory or an explicitly approved operating-system credential mechanism.

Bindings:

- are never canonical entities or Artifacts;
- receive no reusable public ID that can retrieve the value through API;
- are not placed in URL, argv, browser storage, logs, telemetry, crash uploads, Operation payloads, Run Configuration, Event payloads, hashes, or exports;
- disappear when Session ends or the binding is revoked;
- must be rebound after Session restart before a phase needing them resumes/recaptures.

### Secret observation

A nonsecret fact such as present/missing, reference/policy identity, delivery destination, redaction applied, or transmission allowed. Observations may be canonical where needed for reproducibility/security without raw values.

## 4. MVP secret sources

Approved initial binding sources:

### Existing process environment reference

Configuration names an environment key. Coordinator reads the raw value from its own approved Session environment at binding time.

Rules:

- config stores only key/reference name;
- raw value is not copied into canonical resolved config;
- inherited environment is not passed wholesale to child processes;
- same-user environment/process inspection risk is disclosed;
- value is removed from ordinary coordinator data structures when no longer needed where practical.

### Terminal no-echo prompt

Rust terminal authority may request a secret through an explicit no-echo prompt initiated by a user action.

Rules:

- prompt is unavailable in noninteractive mode unless another binding source exists;
- input is never echoed, command history, clipboard, structured progress, or terminal log;
- bootstrap/coordinator IPC carries the value only through a dedicated bounded sensitive message/channel whose payload is never audited verbatim;
- cancellation leaves no partial binding.

### OS credential store

Deferred unless one platform-specific provider is deliberately implemented and tested. The architecture permits a provider adapter, but the MVP does not promise Windows Credential Manager, Keychain, Secret Service, or cross-platform parity.

### Dashboard secret entry

Not enabled by default in MVP. Adding it requires a dedicated paired-route control, no client persistence/autofill, bounded body, redacted diagnostics, memory lifecycle, and threat-model amendment. General configuration forms never accept plaintext secret values silently.

## 5. Secret delivery to processes

Child environment is constructed from an explicit allowlist:

- baseline safe variables required by runtime/tooling;
- configured nonsecret values;
- required secret bindings for that exact process purpose;
- generated local ports/fixture values.

Rules:

- no wholesale inheritance of coordinator environment;
- each variable declares secret classification and consumer;
- raw environment map is never canonical or logged;
- process record stores redacted key list/hash/classification, not raw secret;
- secret values may be visible to that process and descendants, so consumer must be trusted;
- secret binding is not passed to unrelated build/test/server/evaluator commands;
- Windows environment block and Unix env handling are bounded and tested;
- duplicate/case-colliding environment keys are rejected according to platform semantics;
- values with NUL/invalid encoding reject;
- child output is redacted through declared exact values/patterns before structured logging, but raw binary output remains sensitive local and may still contain secrets.

`stdin` delivery is allowed only for an adapter/command contract that consumes it without echo and does not require replay. It is never used to fake an interactive shell prompt generically.

## 6. Raw output and secret leakage

Because child code may print any data:

- stdout/stderr are `sensitive_local` by default;
- raw binary files are excluded from standard exports/evaluator packets;
- live UI applies redaction before display and labels possible incompleteness;
- exact configured secret values and token/header patterns are redacted from structured logs;
- redaction failure or detected canonical leak is security-critical;
- no claim is made to find arbitrary secrets not declared or pattern-matched;
- output truncation does not guarantee a secret was not emitted before/after retained bytes;
- user can inspect/delete sensitive raw logs subject to reference/retention requirements.

Canonical entities/events/Operation records must never include raw secret. A precommit secret scanner checks serialized canonical JSON against bound secret values/patterns before write where practical; a match blocks/quarantines the write as `SECRET_CANONICAL_LEAK_DETECTED` rather than replacing blindly inside hash-bound semantics.

## 7. Browser authentication fixture

Authentication-heavy Projects are supported only through a deterministic fixture that establishes required browser state separately for each Candidate context.

Fixture may:

- navigate to a controlled local login route;
- call a controlled local fixture endpoint;
- fill credentials from secret bindings;
- set cookies/localStorage/sessionStorage through approved fixture code;
- import an approved Session-only state object produced by trusted fixture setup.

Rules:

- same logical fixture policy runs for current and Contender;
- fresh browser context per Candidate receives its own setup;
- raw credentials are never recorded in interaction trace, screenshot metadata, DOM, ARIA, console/network summary, Operation, Event, or evaluator packet;
- selectors/actions refer to secret reference placeholders rather than values;
- fixture success verifies expected authenticated state/fingerprint without exposing secret;
- login UI/cookies that render real private data make Capture sensitive and require explicit Project policy;
- fixture failure is typed and cannot be treated as empty/error product state.

## 8. Cookies and browser storage state

Browser authentication material includes:

- cookies;
- localStorage/sessionStorage;
- IndexedDB where used;
- service-worker/cache state;
- HTTP auth/client certificates where applicable;
- Playwright storage-state structures.

MVP policy:

- authentication state is Session-sensitive ephemeral material;
- it is not a canonical Artifact and is not included in portable Run bundles, reports, evaluator packets, diagnostics, screenshots, traces, or logs by default;
- Playwright `storageState({ path })` is not used for canonical persistence;
- prefer in-memory state objects or repeat fixture setup;
- if a temporary state file is unavoidable, it lives under restrictive Session temp, is marked sensitive, never registered as evidence, is deleted after context setup/Session cleanup, and is included in crash cleanup/secret scan;
- no authentication state is reused across Candidates unless a fixture explicitly creates equivalent independent state and proves no cross-context contamination;
- Session restart loses raw state; recovery requiring Capture starts a new Epoch after the user rebinds secrets and fixture reauthenticates;
- browser context close verifies best-effort cleanup; browser crash invalidates Epoch and Session temp cleanup remains required.

Persisting raw authentication state is `AUTH_STATE_PERSISTENCE_FORBIDDEN` in MVP.

## 9. Capture sensitivity and screenshots

Structured redaction cannot guarantee a screenshot lacks sensitive pixels.

Project capture policy declares:

- synthetic fixture data preferred/required;
- whether real user/private data may be captured locally;
- whether screenshots/DOM/ARIA may be sent externally;
- mask/volatile/redaction regions;
- pretransmission review requirement;
- retention and Export sensitivity.

Rules:

- standard first-party fixture uses synthetic data;
- a screenshot with potentially real/private data is at least `project` or `sensitive_local` according to policy;
- unknown visual secrets cannot be auto-certified absent;
- masking is disclosed and may limit evaluation;
- external evaluator invocation is blocked unless every selected Artifact class is permitted and the Project/user policy authorizes transmission;
- UI shows an immutable outbound manifest and redaction/omission summary before first external transmission for that Project/policy, with explicit acknowledgement;
- later invocations may reuse acknowledgement only while Project, provider, Artifact classes, redaction and source-content policy remain unchanged;
- provider response/raw output is sensitive local.

## 10. External evaluator credentials and transmission

Provider credential:

- supplied by secret binding/reference;
- delivered only to the external-provider adapter/HTTP client;
- never included in evaluator packet or provider prompt/body except protocol authorization header as required;
- excluded from logs/Operation/hash/export;
- revoked by Session binding removal/provider mechanism.

External packet:

- immutable Artifact allowlist and exact bytes/hashes;
- provider, endpoint class, model/version when known;
- redaction and omission report;
- source-content policy;
- user acknowledgement/policy snapshot;
- transmission start/result metadata without secret headers.

Transport:

- HTTPS required for remote provider in MVP unless explicitly local loopback endpoint;
- certificate/TLS verification uses platform/runtime defaults and cannot be disabled silently;
- redirect policy is explicit and does not forward authorization to unapproved host;
- response byte/time limits;
- retries use same immutable packet and separate Evaluation Attempt/usage;
- provider-side retention/privacy is outside local guarantee and is disclosed.

A local evaluator command is not an external transmission but remains a trusted executable with user-level filesystem/network authority.

## 11. Network policy layers

### Browser network policy

Can be enforced for browser-context HTTP(S) and supported WebSocket traffic under the exact pinned Playwright APIs.

### Project process network policy

MVP cannot generically enforce egress restrictions for development servers/build/test/fixture/local evaluator processes. It may observe some endpoints through platform/native tooling, but incomplete observation is not enforcement.

### External evaluator client policy

Render Rivals-owned provider HTTP client can enforce approved endpoint, TLS, redirect, body and timeout rules for that adapter.

### Dependency/Git/package operations

Network may occur only when the configured command/policy explicitly permits it. No hidden fetch/update. Project/package-manager subprocesses remain user-trusted and may open unobserved network connections unless a future sandbox/firewall mode exists.

UI/report distinguishes:

- `enforced_browser`;
- `enforced_render_rivals_client`;
- `observed_only`;
- `uncontrolled_process`;
- `not_applicable`.

No common “network isolated” badge collapses these layers.

## 12. Browser HTTP request policy

Capture Plan defines allowed browser origins/request classes:

- Candidate local origin;
- declared local fixture/mock origins;
- explicitly approved external origins when reproducibility policy allows;
- blocked undeclared traffic.

For deterministic reference Capture:

- Browser Context is created with Service Workers blocked unless the Project is explicitly unsupported/limited for that state;
- context/page routes are installed before navigation and before application code;
- routing decision covers document, fetch/XHR, script, stylesheet, image, font and other HTTP(S) requests;
- redirects are revalidated at every hop;
- credentials/headers/body are not logged by default;
- request classification and blocked/allowed result enter network summary;
- an undeclared request is blocked/fails the required Gate according to frozen policy;
- routing/interception may disable browser cache or alter behavior; this limitation is recorded and applied equally to both Candidates;
- requests already owned by Service Workers are not assumed intercepted; hence the default block policy.

If the application requires Service Workers for the evaluated behavior, MVP either:

- supplies a controlled same-origin fixture and a separately verified deterministic policy; or
- classifies network enforcement limited/unsupported and blocks automated Recommendation for the reference path.

## 13. Browser WebSocket policy

WebSockets require separate interception/observation capability from ordinary HTTP routing.

- pinned Playwright must support the selected context/page WebSocket routing API before any connection is created;
- declared URL/origin allowlist applies;
- undeclared WebSocket is blocked or makes Capture invalid according to frozen policy;
- messages are not logged by default because they may contain secrets and volume;
- fixture may provide controlled mock frames with versioned script;
- unsupported API/version means WebSocket-dependent strict policy is `NETWORK_POLICY_UNENFORCEABLE`, not silently allowed;
- WebRTC, raw browser extensions, downloads and other channels receive explicit capability classification; absent enforcement is not called blocked.

## 14. Server-side and process egress

Development server, SSR code, API routes, build/test scripts, fixture commands and local evaluator processes may make network requests outside browser visibility.

MVP rules:

- Project trust warning states this clearly;
- strict deterministic fixture should replace or localize server-side external dependencies;
- configuration declares known external dependencies and whether they are fixture-controlled;
- Render Rivals may collect observed endpoint/listener/process metadata when platform supports it, labeled incomplete;
- an observed undeclared server/process endpoint may fail qualification/Gate;
- absence of observation is never proof of no egress;
- if deterministic correctness depends on preventing server/process egress, native MVP is unsupported unless executed under an explicit external sandbox/container/firewall environment whose policy and evidence are recorded;
- benchmark mode may use a controlled container/network namespace, but native local mode does not inherit that claim;
- `NETWORK_SERVER_EGRESS_UNCONTROLLED` is a limitation/blocking result, not a process kill based solely on missing observation.

## 15. DNS, proxy, and environment

- Project command environment does not inherit proxy/auth variables unless explicitly permitted/configured;
- variables such as `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, `NO_PROXY`, package-manager tokens/registries and cloud credentials are classified and filtered;
- DNS resolution itself may leave the machine and is not blocked merely because HTTP is routed;
- browser allowed-origin checks use parsed URL origin/host policy and redirect validation, not string prefix;
- localhost, loopback IPs, IPv6, wildcard interfaces and rebinding are distinguished;
- external evaluator endpoint uses configured normalized URL and no ambient proxy unless policy explicitly permits it;
- proxy permission and endpoint become part of transmission policy/provenance.

## 16. Environment hashing and reproducibility

Run Configuration/environment hash includes nonsecret semantics:

- secret reference identities, presence and delivery permission—not values;
- allowed environment key names and classifications;
- browser network policy/origin allowlist;
- Service Worker/WebSocket policy;
- known external dependency declarations;
- external evaluator endpoint/provider policy;
- proxy/network capability classification;
- acknowledgement/policy version.

Two Runs with different raw credential values may share the same nonsecret policy hash only when the references/presence/policy remain equivalent. Source/data returned by authenticated systems must still be fixture-controlled or evidence may be nondeterministic/stale.

## 17. Secret rotation and staleness

- raw secret rotation alone does not rewrite sealed Run Configuration;
- binding is Session input and its reference/presence/policy is checked before use;
- if changed credential changes fixture identity/data/user/tenant/environment, a new Source/fixture/data snapshot or superseding Run is required according to policy;
- failed/expired credential produces authentication fixture failure, not Product unavailable/error state;
- provider credential change does not alter accepted evaluator output already stored, but new Evaluation records current provider/model/policy and cannot silently supersede old without normal policy;
- revoked binding cancels or blocks future consumers; already running trusted process may retain value until terminated.

## 18. Cleanup

On consumer end or Session shutdown:

- close browser contexts before browser;
- delete Session secret/temp authentication files without following links;
- clear in-memory references where practical;
- terminate consumer process groups;
- remove dedicated environment/stdin buffers;
- invalidate external client/session objects;
- verify temporary files absent or record cleanup incident;
- do not claim secure memory/disk erasure;
- preserve only nonsecret presence/policy/cleanup observations.

Crash cleanup follows supervisor/session/temp recovery; inability to prove temporary auth material deletion is a persistent sensitive cleanup warning.

## 19. API and UI

Authenticated settings/configuration UI shows:

- reference name/source class/presence;
- consumer and scope;
- external-transmission permission;
- last binding/check result without value;
- revoke/rebind action;
- policy limitations.

It never displays/retrieves existing raw value.

Run review shows:

- required missing bindings;
- browser network allowed origins and enforcement class;
- server/process egress limitation;
- Service Worker/WebSocket support;
- external Artifact transmission scope;
- synthetic/real data sensitivity;
- blocked Recommendation when policy cannot meet required determinism/security.

API returns only nonsecret reference/observation data. There is no `GET secret` endpoint. Secret entry/binding commands, if later enabled, use separate sensitive API schema and are excluded from Operation payload persistence/hashes except reference identity.

## 20. Stable errors

Use registered codes:

- `SECRET_BINDING_REQUIRED`;
- `SECRET_BINDING_UNAVAILABLE`;
- `SECRET_SCOPE_VIOLATION`;
- `SECRET_TRANSMISSION_FORBIDDEN`;
- `SECRET_CANONICAL_LEAK_DETECTED`;
- `SECRET_REDACTION_POLICY_INVALID`;
- `AUTH_STATE_PERSISTENCE_FORBIDDEN`;
- `AUTH_FIXTURE_FAILED`;
- `NETWORK_POLICY_UNENFORCEABLE`;
- `NETWORK_BROWSER_REQUEST_BLOCKED`;
- `NETWORK_BROWSER_REQUEST_UNDECLARED`;
- `NETWORK_WEBSOCKET_UNDECLARED`;
- `NETWORK_SERVICE_WORKER_UNSUPPORTED`;
- `NETWORK_SERVER_EGRESS_UNCONTROLLED`;
- `NETWORK_EXTERNAL_DEPENDENCY_UNAVAILABLE`.

## 21. Required tests

- config/reference/binding never stores raw secret canonically;
- environment and terminal prompt binding, no echo/history/argv/log/Operation/hash;
- explicit per-process env allowlist and no wholesale inheritance;
- case/duplicate/NUL/size environment handling;
- consumer scope violation and unrelated-process noninheritance;
- stdout/stderr structured redaction and raw-output sensitivity;
- precommit canonical leak detection and quarantine/failure;
- browser fixture uses placeholders and separate current/Contender contexts;
- cookies/storage/IndexedDB/service-worker state absent from canonical Artifacts/exports/diagnostics;
- Session restart requires rebind and new Epoch for Capture;
- screenshot/DOM/ARIA sensitivity and outbound manifest acknowledgement;
- provider credential header absent from packet/log/redirected host;
- TLS/redirect/timeout/byte/retry policy;
- browser routing installed before navigation and blocks undeclared HTTP redirects/resources;
- Service Workers blocked by default and strict mode fails closed when required unsupported;
- WebSocket separate allowlist/routing and unsupported-version behavior;
- browser cache/interception limitation recorded equally;
- server-side process opens undeclared endpoint and UI/report says uncontrolled/observed-only rather than isolated;
- proxy/DNS/environment filtering;
- no absent observation interpreted as no egress;
- cleanup of temp auth material and no secure-erasure claim;
- telemetry/crash/Artifact preview paths never leak bindings.

## 22. Nonconforming behavior

- plaintext secret in config, Run Configuration, Event, Operation, Artifact, URL, argv, log, telemetry or export;
- API endpoint that returns an existing secret value;
- wholesale coordinator environment inherited by child processes;
- canonical Playwright storage-state/cookie Artifact;
- reusing browser auth context across Candidates without explicit independent fixture semantics;
- treating authentication failure as Product error/unavailable state;
- sending screenshot/source/DOM externally without declared policy and acknowledgement;
- calling local evaluator command filesystem/network isolated;
- claiming browser routing controls server/build/evaluator egress;
- allowing Service Worker or WebSocket traffic silently outside strict policy;
- using absence of observed endpoint as proof of no process egress;
- inheriting ambient proxies/cloud/package credentials silently;
- describing native local mode as network sandboxed;
- claiming secure deletion of memory/temp secrets.
