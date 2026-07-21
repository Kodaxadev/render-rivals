# 16 — Dashboard Session Authentication and Pairing

**Status:** Canonical implementation contract  
**Scope:** Local dashboard origin isolation, first-browser pairing, cookies, Host/Origin validation, CSRF, unauthenticated surface, Session invalidation, and browser-opening policy  
**Local API:** `spec/13-configuration-cli-and-local-api-contracts.md`  
**Threat model:** `security/THREAT-MODEL.md`  
**Stable errors:** `schemas/error-codes.ts`

## 1. Purpose

The dashboard is served over loopback HTTP, but loopback is not an authentication boundary. Another local user/process or a malicious website may attempt to connect, submit cross-site requests, exploit DNS rebinding, or obtain credentials sent automatically to a shared loopback host.

`spec/13` requires an authenticated Session cookie and forbids placing the credential in URLs, logs, or argv. This specification defines the missing first-browser authentication ceremony and the exact local-origin policy.

## 2. Security goals

The MVP must:

- expose no Project, Run, Artifact, log, diagnostic, or mutation API before pairing;
- keep the dashboard Session credential out of URLs, terminal arguments, page source, JavaScript storage, logs, and telemetry;
- prevent cookies from being shared across ordinary `127.0.0.1` ports or separate Render Rivals Sessions;
- bind the browser session to one authenticated supervisor Session;
- reject unexpected Host, Origin, CORS, and CSRF contexts;
- make pairing one-time, short-lived, rate-limited, and auditable without recording the secret;
- avoid automatically spawning or containing the user's ordinary browser in the MVP.

This does not protect against a fully compromised same-user process that can read browser memory, terminal contents, or process memory.

## 3. Socket bind and browser origin

The coordinator binds the HTTP listener only to IPv4 loopback in the MVP:

```text
127.0.0.1:<random-port>
```

The canonical browser origin is not the shared numeric host. Each Session generates at least 128 bits of independent origin entropy and uses:

```text
http://rr-<lowercase-base32-origin-nonce>.localhost:<port>/
```

Rules:

- the origin nonce is independent from supervisor nonce, pairing code, and browser Session credential;
- it is an origin-isolation value, not sufficient authentication by itself;
- it may appear in the displayed dashboard URL and browser history;
- the server accepts only the exact generated Host value and selected port;
- requests using `127.0.0.1`, plain `localhost`, another `.localhost` name, an alternate port, absolute-form proxy target, or unexpected forwarded-host headers are rejected;
- no wildcard Host policy exists;
- no CORS response permits another origin;
- DNS/proxy headers never override the socket/Host-derived origin;
- doctor verifies that the supported dashboard browser resolves the randomized `.localhost` host to loopback.

The randomized host provides host-only cookie separation between Sessions and avoids relying on cookies being port-scoped, because browser cookies are not scoped by TCP port.

If exact randomized-host behavior cannot be verified, the product must block authenticated dashboard startup rather than silently fall back to a shared `127.0.0.1` bearer cookie.

## 4. Browser-opening policy

The MVP does not spawn the user's default browser automatically.

Rust prints:

- the randomized dashboard URL;
- the one-time pairing code;
- Session status and expiry guidance.

The user opens the URL manually in a browser.

Rationale:

- opening a default browser may reuse an existing unmanaged process;
- containing that process could terminate unrelated browser windows at Session end;
- leaving a newly spawned browser unmanaged would contradict process-ownership claims;
- shell-association behavior differs across platforms and profiles.

A later `open browser` convenience feature requires a separate decision defining process ownership, existing-browser reuse, credential delivery, and cleanup. It must never pull an existing user browser into the Session Job/cgroup.

## 5. Unauthenticated surface

Before pairing, the only permitted browser resources are:

- `GET /session/pair`;
- the minimal same-origin static CSS/JS/assets required by that page;
- `POST /api/v1/session/pair`;
- a generic health response that reveals no version, path, Session, Project, or capability detail when needed for the pairing page.

The pairing page:

- uses no application shell or Project data;
- loads no third-party resources;
- has restrictive CSP;
- contains one pairing-code form;
- displays generic expired/invalid/locked messages without revealing which check failed;
- cannot access Artifact, API query, SSE, log, diagnostics, or mutation routes.

Every other route returns an authentication-required response without redirecting sensitive route names/data into query parameters.

## 6. Pairing secrets

At coordinator readiness, the Session creates:

### Origin nonce

- at least 128 random bits;
- used only in randomized `.localhost` hostname;
- not accepted as an authentication credential.

### Pairing code

- at least 128 random bits encoded as a copyable lowercase Base32 value;
- shown only in the owning terminal;
- never placed in URL, browser command, environment passed to Project processes, structured logs, telemetry, crash reports, or page source;
- retained only in memory as a one-way verifier or in a restrictive Session-owned secret record if implementation requires recovery before first pairing;
- expires five minutes after dashboard readiness;
- single-use;
- invalidated after five failed attempts, successful pairing, Session shutdown, or coordinator failure.

### Browser Session credential

- at least 256 random bits;
- generated only after successful pairing;
- independent from pairing code and native supervisor nonce;
- stored server-side only as a one-way verifier where practical;
- sent to the browser only as an HttpOnly host-only cookie;
- invalidated when the supervisor Session ends.

Randomness uses an operating-system cryptographic random source. No secret derives from Session ID, timestamp, PID, port, hostname, repository, or user identity.

## 7. Pairing request

The browser submits:

```text
POST /api/v1/session/pair
Content-Type: application/json
Origin: <exact randomized origin>
```

Body:

```json
{"pairingCode":"<code>"}
```

Validation order:

1. socket peer is loopback;
2. Host exactly matches randomized Session host/port;
3. Origin exactly matches randomized origin;
4. content type and body size are valid;
5. Session is pairable and code has not expired/locked/been used;
6. pairing-code verifier comparison is constant-time;
7. attempt counter updates without logging the code;
8. successful request atomically invalidates the pairing code and creates browser credential;
9. response sets cookie and returns a generic paired result.

Pairing is not represented as a Run mutation. It is a Session security event/observation.

## 8. Cookie contract

The browser credential cookie:

- uses a Session-specific random cookie name or a fixed name on the randomized host;
- is host-only: no `Domain` attribute;
- uses `Path=/`;
- uses `HttpOnly`;
- uses `SameSite=Strict`;
- is a nonpersistent browser Session cookie;
- is never readable by dashboard JavaScript;
- is never copied into localStorage, sessionStorage, IndexedDB, URL fragments, service-worker caches, page HTML, or client logs;
- is cleared/invalidated on logout or supervisor Session end.

The MVP uses loopback HTTP and does not claim transport encryption. `Secure` may be enabled only when its behavior on the chosen local origin/browser is verified; authentication must not depend on inconsistent browser exceptions for Secure cookies over HTTP.

The server must ignore credentials under any cookie name not registered for the current Session.

## 9. Authenticated request contract

After pairing:

- every API query, command, SSE stream, Artifact response, diagnostics route, and application shell route requires the current browser Session credential;
- Host must match exact randomized origin;
- mutation requests additionally require exact Origin and a CSRF-safe custom header;
- requests with missing/multiple/ambiguous credential cookies fail closed;
- no credential is accepted from query string, fragment, form field, basic auth, arbitrary bearer header, or alternate cookie name;
- CORS is disabled; preflight requests from other origins are rejected;
- SSE requires the same credential and emits no data before authentication;
- WebSocket is not used in MVP;
- authentication failure does not disclose whether a Project/Run/Artifact ID exists.

## 10. CSRF and request provenance

Authenticated mutations require:

- exact Host;
- exact Origin;
- Session cookie;
- `Content-Type: application/json` where applicable;
- registered custom header such as `X-Render-Rivals-Command: 1`;
- strict command schema, operation ID, and expected revision.

Navigation GETs may lack Origin in ordinary browsers, so credential plus exact Host is required. State-changing behavior is never performed by GET.

`Referer` is not the primary security decision and may be absent. Proxy-forwarding headers are ignored because the MVP server is not deployed behind a proxy.

## 11. Pairing lifecycle

MVP supports one paired browser credential per supervisor Session.

- successful pairing disables the pairing endpoint for additional credentials;
- opening more tabs in the same browser profile uses the existing host-only Session cookie;
- a different browser/profile cannot pair after first success;
- losing the cookie requires starting a new supervisor Session in MVP;
- logout invalidates the credential and ends authenticated dashboard access; re-pairing within the same Session is not supported in MVP;
- Session shutdown invalidates credential before/while HTTP listener closes.

Multi-client pairing is post-MVP and requires explicit credential inventory, revocation, client labeling, and audit semantics.

## 12. Safe mode

Safe mode still requires successful pairing. It does not weaken Host, cookie, Origin, or CSRF requirements.

The unauthenticated pairing page cannot inspect integrity/recovery data. After authentication, safe mode exposes only the read-only/recovery/verified-cleanup surface defined by `spec/13`.

## 13. Logging and events

Local security observations may record:

- Session ID;
- pairing started/expired/locked/succeeded;
- failed-attempt count and coarse time;
- exact origin host only in local sensitive diagnostics;
- client loopback address;
- stable dashboard error code;
- logout/credential invalidation.

They never record:

- pairing code;
- browser Session credential;
- credential cookie header/value;
- code verifier;
- full request body;
- secrets in error details.

Portable diagnostics normalize the randomized hostname unless explicit local detail is selected.

## 14. Stable errors

Use registered codes:

- `DASHBOARD_HOST_INVALID`;
- `DASHBOARD_ORIGIN_INVALID`;
- `DASHBOARD_PAIRING_REQUIRED`;
- `DASHBOARD_PAIRING_CODE_INVALID`;
- `DASHBOARD_PAIRING_EXPIRED`;
- `DASHBOARD_PAIRING_LOCKED`;
- `DASHBOARD_SESSION_INVALID`;
- `DASHBOARD_CSRF_INVALID`.

The unauthenticated HTTP response may intentionally collapse several internal codes into one generic message to avoid becoming an oracle. Detailed stable code remains in local security diagnostics when safe.

## 15. Required tests

- browser cookies are isolated by randomized `.localhost` host and not shared with plain `127.0.0.1`, plain `localhost`, another Session host, or a different host;
- unsupported randomized-host resolution blocks dashboard authentication instead of falling back;
- pairing page reveals no Project/Run/version/capability data;
- pairing code is absent from URL, argv, environment, logs, page source, telemetry, and crash records;
- pairing code expires, is single-use, locks after bounded failures, and compares through constant-time verifier;
- successful pairing sets only the expected host-only HttpOnly SameSite cookie;
- credential is absent from browser JavaScript storage and API response bodies;
- API/SSE/Artifact requests fail before pairing and after Session invalidation;
- exact Host and Origin checks reject alternate loopback names, ports, forwarded hosts, DNS-rebinding attempts, cross-site forms, and CORS/preflight requests;
- mutation without custom header or correct revision/operation envelope is rejected;
- logout invalidates credential;
- safe mode requires pairing;
- ordinary default browser is not auto-spawned or placed in Session containment;
- no dashboard authentication secret is reused as supervisor nonce, origin nonce, Session ID, or CSRF marker.

## 16. Conformance

An MVP implementation is nonconforming if it:

- serves application data before pairing;
- puts the pairing code or browser credential in a URL, log, argv, page source, or JavaScript storage;
- uses a shared `127.0.0.1`/`localhost` bearer cookie without randomized host isolation;
- accepts alternate Host/Origin/CORS contexts;
- performs mutations with cookie alone and no CSRF-safe custom header;
- allows a pairing code to be reused;
- preserves browser authentication after supervisor Session end;
- silently falls back to unauthenticated local access;
- automatically spawns/contains an existing user browser without a later accepted ownership contract.
