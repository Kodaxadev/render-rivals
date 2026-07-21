# Render Rivals Dashboard Pairing Route

**Status:** Security-critical route implementation contract  
**Route:** `/session/pair`  
**Authentication authority:** `spec/16-dashboard-session-authentication-and-pairing.md`  
**Application route authority after pairing:** `docs/ROUTE-LEVEL-WIREFRAME-SPEC.md`

## 1. Purpose

This route is the only interactive browser surface available before dashboard Session authentication. It converts the one-time terminal pairing code into the host-only HttpOnly browser Session cookie defined by `spec/16` without exposing Project, Run, Artifact, diagnostic, version, or capability data.

It is intentionally separate from onboarding. Pairing proves possession of the owning terminal Session; onboarding configures the product after authentication.

## 2. Route guard

### Before pairing

- `/session/pair` and its minimal same-origin static assets are available.
- `POST /api/v1/session/pair` is available under the exact randomized Session origin.
- every application shell, query API, command API, SSE stream, Artifact response, log route, and diagnostics route is blocked.
- blocked browser navigation may return or redirect to `/session/pair` only when doing so does not place the attempted sensitive path, query, or identifier into the URL, page, analytics, or logs.

### After pairing

- navigating to `/session/pair` redirects to `/` without rendering the form;
- the pairing endpoint no longer accepts another credential;
- application routes require the Session cookie and their ordinary guards.

### Expired, locked, or ended Session

The route renders a terminal state with no retry field:

- pairing expired;
- too many invalid attempts;
- Session ended;
- coordinator unavailable.

The only action is to return to the owning terminal and start a new Render Rivals Session. The page never offers a weaker unauthenticated mode.

## 3. Layout

Full-window focused layout without the application shell:

```text
┌──────────────────────────────────────────────────────────────┐
│ Render Rivals                                                │
│                                                              │
│ Pair this browser                                            │
│ Enter the one-time code shown in the Render Rivals terminal. │
│                                                              │
│ Pairing code                                                 │
│ [__________________________________________________________] │
│                                              [Pair browser]  │
│                                                              │
│ This code expires shortly and is used only once.             │
│ No Project or Run data is available before pairing.          │
└──────────────────────────────────────────────────────────────┘
```

Required zones:

1. product identity as text or approved static mark;
2. concise explanation of terminal possession and one-time use;
3. pairing-code field;
4. one primary submit action;
5. generic status/error area;
6. privacy/security note;
7. no global navigation, recent data, runtime details, help integrations, release links, or external resources.

## 4. Input behavior

- one text field with an explicit visible label;
- autocomplete disabled;
- spellcheck and autocorrect disabled;
- no browser password-manager classification;
- paste supported;
- accepted display separators may be normalized only when the code decoder explicitly supports them;
- leading/trailing whitespace is trimmed;
- code is never echoed into the URL, page title, client log, error report, or accessibility announcement;
- submission disables while the one request is in flight;
- repeated clicks do not create parallel pairing attempts;
- field is cleared after a failed attempt;
- page does not reveal how many characters were correct or whether the code was merely expired versus incorrect.

The client does not validate secret correctness. It may validate only safe structural constraints such as maximum request size and supported character set.

## 5. Request and success behavior

Submit exactly one JSON request to the relative same-origin endpoint:

```text
POST /api/v1/session/pair
```

Requirements:

- no absolute URL assembled from user-controlled input;
- no credential or pairing code in headers other than ordinary request body content;
- no retry library automatically resends the request;
- response body contains no browser credential;
- successful response relies on the Set-Cookie contract from `spec/16`;
- after success, client performs a same-origin navigation to `/` using a response-provided relative path from an allowlisted fixed set or the fixed root path;
- browser history replacement prevents Back from showing a usable pairing form;
- no service worker caches the route or response.

## 6. Error presentation

Externally visible messages are intentionally coarse:

| Condition | User-facing message | Action |
|---|---|---|
| malformed local entry | `Check the code and try again.` | Re-enter while Session remains pairable |
| invalid code | `The code was not accepted.` | Re-enter while Session remains pairable |
| expired or locked | `This pairing code can no longer be used.` | Start a new Session from terminal |
| Session ended/unavailable | `The Render Rivals Session is no longer available.` | Start a new Session |
| network/request interruption | `The local Session could not be reached.` | One manual retry when Session still pairable |

The server may record a more specific registered dashboard error code in local sensitive diagnostics. The page does not expose an oracle that distinguishes internal verifier state.

No stack trace, port-owner data, filesystem path, Session identifier, version, or native diagnostic appears on this unauthenticated page.

## 7. Accessibility

- document title: `Pair browser — Render Rivals`;
- one `main` landmark and one level-one heading;
- field error associated through `aria-describedby`;
- status region uses polite announcement and never repeats the entered code;
- focus moves to the error summary or field after failure;
- successful navigation does not announce credential material;
- submit reachable and operable by keyboard;
- visible focus and sufficient contrast;
- no motion-dependent state;
- page remains usable at 320 CSS pixels even though the authenticated comparison application is desktop-first.

## 8. Security headers and caching

The pairing document and endpoint use:

- `Cache-Control: no-store`;
- `Pragma: no-cache` where compatibility requires it;
- `X-Content-Type-Options: nosniff`;
- restrictive frame policy through CSP `frame-ancestors 'none'`;
- CSP permitting only required same-origin static assets and no remote connections;
- no `unsafe-inline` script unless replaced by a reviewed nonce/hash policy and never containing secret data;
- no referrer leakage beyond the randomized local origin;
- no CORS allowance;
- no third-party fonts, analytics, error reporting, or support widgets.

The page and assets are not registered in a service worker or persistent application cache.

## 9. Client-side failure boundary

A pairing-page JavaScript failure:

- renders or falls back to a static local message that the terminal Session must be restarted or the page reloaded;
- is not posted to the authenticated dashboard client-error endpoint because no browser Session exists;
- may be recorded only by the coordinator from bounded HTTP/static-serving observations without request body or secret content;
- never relaxes authentication or exposes the main application shell.

The route should remain functional with minimal JavaScript. A progressively enhanced plain HTML form is preferred when it can preserve the exact JSON/Origin/security contract through a small local script.

## 10. Tests

- route is the only interactive unauthenticated document;
- application shell/data/API/SSE/Artifact/log routes remain unavailable before pairing;
- attempted sensitive route is not copied into pairing URL/query/page/log;
- pairing code absent from DOM after submission, history, title, console, client error, and service-worker/cache storage;
- no automatic request retry or duplicate concurrent attempt;
- successful Set-Cookie response navigates to `/` and Back does not restore a usable pairing form;
- after pairing, route redirects without rendering form;
- expired/locked/ended states expose no weaker action;
- generic UI messages do not reveal verifier detail;
- CSP/cache/referrer/frame/content-type headers pass security assertions;
- no third-party request occurs;
- keyboard, screen reader, narrow viewport, and reduced-motion checks pass;
- unauthenticated JavaScript failure does not expose main shell or post secret-bearing diagnostics.

## 11. Post-MVP exclusions

Not part of this route:

- QR-code pairing;
- URL-embedded secrets;
- automatic browser opening;
- multiple independently paired browsers;
- remote access;
- user accounts;
- remembered authentication across supervisor Sessions;
- recovery or onboarding content before pairing.
