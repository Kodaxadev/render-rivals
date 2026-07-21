# Playwright Network API Verification Notes

**Status:** Current primary-source note; reverify at exact dependency pin  
**Checked:** 2026-07-20  
**Applies to:** `spec/24-secrets-authentication-state-and-network-egress-policy.md`

## 1. HTTP request routing and Service Workers

Current official Playwright `browserContext.route()` documentation states that requests handled by Service Workers are not intercepted by that routing mechanism and recommends setting `serviceWorkers` to `block` when interception is required.

Architecture consequence:

- strict deterministic browser request policy blocks Service Workers by default;
- Render Rivals does not claim ordinary route interception covers Service Worker-owned requests;
- a Project requiring Service Worker behavior is either handled under a separately verified controlled policy or marked limited/unsupported for automated reference selection;
- routing/cache behavior and limitations are recorded equally for both Candidates.

Primary references:

- https://playwright.dev/docs/api/class-browsercontext#browser-context-route
- https://playwright.dev/docs/network

## 2. WebSocket routing

Current official Playwright documentation exposes WebSocket routing through APIs such as `browserContext.routeWebSocket()` in supported versions. The route must be installed before the WebSocket is created to intercept it.

Architecture consequence:

- WebSocket policy is separate from HTTP request routing;
- the exact pinned Playwright version must expose and pass the selected context/page API before strict WebSocket enforcement is claimed;
- undeclared or unsupported WebSocket behavior fails closed according to the frozen Capture/network policy;
- messages are not retained by default because they may be sensitive/high volume.

Primary references:

- https://playwright.dev/docs/api/class-browsercontext#browser-context-route-web-socket
- https://playwright.dev/docs/api/class-websocketroute
- https://playwright.dev/docs/network

## 3. Browser-only boundary

Playwright browser routing controls browser-context traffic available to those APIs. It does not generically constrain Node/Rust/Project development servers, SSR processes, build/test commands, package managers, Git, or local evaluator subprocess network access.

Architecture consequence:

- browser enforcement and process egress are reported separately;
- native local mode is not described as a network sandbox;
- server/process determinism must use local fixtures, explicit external dependencies, or an independently controlled sandbox/container environment.

## 4. Version-sensitive warning

The online documentation may describe a newer release than the eventual pinned package. Implementation support is established by:

- installed TypeScript declarations and runtime methods;
- reference fixture tests;
- Service Worker/WebSocket timing tests;
- packaged Chromium behavior;
- capability report recorded with the Run.

A website API claim alone is not Render Rivals proof.
