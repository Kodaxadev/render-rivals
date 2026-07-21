# 21 — Artifact Serving, Preview, and Active-Content Security

**Status:** Canonical implementation contract  
**Scope:** Artifact download/preview routes, media verification, active-content blocking, escaped renderers, iframe/origin policy, Content-Disposition, CSP, ranges, filenames, cache, redaction, and browser-session safety  
**Artifact storage:** `spec/11-artifact-event-and-schema-contracts.md`  
**API content route:** `spec/17-local-api-envelopes-operations-and-pagination.md`  
**Dashboard authentication:** `spec/16-dashboard-session-authentication-and-pairing.md`

## 1. Purpose

Artifacts originate from Project code, browsers, agents, evaluators, Git, imports, and diagnostics. They may contain HTML, SVG, script-bearing documents, malformed media, Markdown with raw HTML, PDF actions, source maps, ANSI escape sequences, ZIP archives, or content whose declared media type is false.

Serving arbitrary Artifact bytes from the authenticated dashboard origin can create stored same-origin script/content injection, credential theft, command submission, browser-resource exhaustion, or misleading preview behavior. Authentication and path allowlisting alone do not make content safe to render.

This specification defines a fail-closed MVP model:

- raw bytes are downloaded, not executed;
- only a small passive-media allowlist is rendered directly;
- text/JSON/YAML/logs are displayed through escaping application renderers;
- active or ambiguous formats are never served inline from the authenticated application origin;
- previewability is independent from Artifact validity/evidence eligibility.

## 2. Route separation

### Metadata

```text
GET /api/v1/artifacts/:artifactId/metadata
```

Returns authenticated JSON metadata under specs 16–17.

### Raw download

```text
GET /api/v1/artifacts/:artifactId/content
```

Returns exact registered bytes as a download-oriented response. It is not an inline preview route.

### Safe preview model

The authenticated application renders safe previews through typed components using metadata plus either:

- passive image bytes from an explicitly allowed image endpoint/response policy; or
- bounded text/structured data fetched as bytes/JSON and escaped/interpreted as data;
- generated derived preview Artifacts whose class and tool provenance are registered.

No generic `/preview?path=` or arbitrary media renderer exists.

## 3. Raw download policy

Every raw Artifact response:

- resolves by Artifact ID only;
- verifies record, path ownership, file existence, byte length, digest, validity/status, and media metadata according to access policy;
- uses `Content-Disposition: attachment` with sanitized ASCII fallback plus RFC 5987-compatible UTF-8 filename when implemented/tested;
- uses `X-Content-Type-Options: nosniff`;
- uses `Cache-Control: no-store`;
- uses restrictive CSP such as `default-src 'none'; sandbox` where browsers apply it to navigated content;
- uses registered media type only when safe for download; otherwise `application/octet-stream`;
- never reflects arbitrary Project filename into headers without CR/LF/control/path sanitization;
- does not set `Content-Disposition: inline` for active/ambiguous content;
- does not include dashboard credential in URL or body;
- does not transform/decompress/execute the bytes;
- records bounded local access observation without content/cookie logging.

Opening a downloaded file outside Render Rivals is the user’s action and follows operating-system/browser risk; the product does not label downloaded active content safe.

## 4. Direct passive preview allowlist

MVP may display these registered, verified formats directly inside controlled application components:

- `image/png`;
- `image/jpeg` only for derived/noncanonical assets when registered;
- `image/webp` only for derived previews;
- `image/gif` only when animation policy explicitly permits it; otherwise derive a static frame or download;
- `image/avif` only after pinned decoder/browser tests and explicit registry support.

Default MVP evidence path needs only PNG.

Rules:

- SVG is not on the passive image allowlist;
- media magic/signature and decoder result must agree with registered type;
- dimensions, decoded pixel count, frame count, and compressed/decompressed size are bounded before display/processing;
- decode failure or mismatch is `ARTIFACT_MEDIA_TYPE_MISMATCH`/corruption, not browser fallback;
- image element uses fixed/contained layout and no user-controlled event attributes/HTML;
- image source URL remains authenticated exact origin and identifies only Artifact ID;
- passive preview does not imply the image lacks sensitive content.

## 5. Active and ambiguous formats

Never rendered inline as raw same-origin content in MVP:

- `text/html`, XHTML, XML with stylesheet/script semantics;
- `image/svg+xml`;
- Markdown rendered as HTML;
- PDF;
- JavaScript, CSS, source maps;
- MHTML/web archives;
- office documents;
- audio/video with unreviewed codecs/metadata;
- ZIP/tar/gzip or other archives;
- Playwright traces;
- executable/native/binary package files;
- data URLs or blob documents derived from untrusted active bytes;
- any unknown/mismatched media.

Behavior:

- raw bytes are attachment download only;
- preview action is hidden/disabled with `ARTIFACT_PREVIEW_UNSUPPORTED` or `ARTIFACT_ACTIVE_CONTENT_BLOCKED`;
- metadata and safe text/hex summary may be shown;
- a later isolated preview origin requires a separate accepted security design and cannot share dashboard cookies or same-origin privileges.

A CSP header alone is not used as justification to render arbitrary active content on the authenticated origin.

## 6. Text preview

Text-like Artifacts are rendered as escaped text by the application, never injected as HTML:

- JSON;
- YAML;
- NDJSON;
- plain text;
- source/patch/diff;
- process/log text decoded through explicit policy;
- CSS/JS source shown as text only;
- Markdown shown as source or through a separately reviewed sanitizer with raw HTML disabled—MVP defaults to source/plain text.

Rules:

- fetch bounded byte ranges or server-generated safe slices, not necessarily full large file;
- detect/declare encoding; UTF-8 validation failure uses escaped replacement/hex view according to policy without rewriting canonical bytes;
- escape `<`, `>`, `&`, quotes and any rendering-context-sensitive characters through framework-safe text nodes;
- ANSI/control sequences are parsed only by an allowlisted bounded terminal-text renderer or visibly escaped; they never reach terminal/browser control directly;
- bidi/control/invisible characters may be visualized in security-sensitive source/log views;
- line length/count and total decoded characters are bounded/virtualized;
- links are not auto-activated from arbitrary log/source text by default;
- search treats input as data and is bounded;
- selection/copy returns displayed source text, not hidden HTML;
- secrets remain subject to sensitivity/redaction policy.

## 7. Structured JSON/YAML preview

- server/client parses with strict size/depth/key/string limits;
- duplicate JSON keys reject; YAML parser uses safe schema with no custom tags/object construction;
- raw YAML remains data and does not instantiate aliases beyond bounded policy;
- tree renderer creates UI elements from parsed scalar/container values, not raw markup;
- canonical/entity schema validation state is shown separately from parse success;
- malformed content can be shown as escaped raw text/hex but never treated as valid entity/evidence;
- large arrays/objects paginate/virtualize;
- path strings are display data and never become fetch routes without explicit Artifact/entity link mapping.

## 8. HTML-like report preview

MVP-generated reports intended for in-app viewing use application-owned structured JSON/Markdown data rendered by trusted dashboard components.

If an Export Operation creates a standalone HTML report:

- it is a download Artifact;
- it is not loaded raw inside authenticated dashboard origin;
- report generation escapes Project/evaluator content and includes its own CSP/offline asset policy;
- verification tests for injection remain required;
- opening the downloaded report is outside the authenticated Session origin.

The dashboard never trusts an Artifact merely because Render Rivals generated it; generator/version/provenance and security tests still apply.

## 9. SVG policy

SVG is treated as active content because it may contain script, links, external references, animation, filters, embedded HTML, and resource loads.

MVP:

- no inline/raw SVG Artifact preview;
- no `<img src>` exception on authenticated origin unless a later reviewed sanitizer/isolated origin policy is accepted;
- brand/application-owned static SVG bundled with trusted dashboard build is not an Artifact and follows normal build CSP/review;
- Project/evaluator/generated SVG Artifact is download-only or converted to a bounded raster derived Artifact in an isolated image-processing process/library with external-resource/network disabled and tested limits;
- raster derivative records source hash/tool/version and does not replace original.

## 10. PDF and archive policy

PDF:

- download-only in MVP;
- no browser PDF viewer iframe/embed on authenticated origin;
- optional future raster/text derivative requires bounded isolated parser/tool and provenance.

Archives/traces:

- download-only;
- no client-side automatic extraction;
- import inspection follows decompression/path/entry limits in storage/import security;
- Playwright Trace Viewer is not embedded in MVP because it may introduce active application/content and a separate trust surface;
- metadata may show archive class, size, checksum, and known contents manifest if separately generated safely.

## 11. Artifact media verification

At registration and before first preview/download:

- declared media/class/file extension are compared against magic/signature/parser result where feasible;
- mismatch is explicit;
- extension never determines safety;
- polyglot/ambiguous content uses the more restrictive classification;
- media sniffing by browser is disabled through headers and server-selected type;
- a valid digest only proves byte identity, not media safety;
- content status may be valid evidence yet preview unsupported.

`ARTIFACT_MEDIA_TYPE_MISMATCH` blocks direct preview and may quarantine when corruption/identity is implicated.

## 12. Preview derivatives

A preview derivative is a registered rebuildable Artifact/projection with:

- source Artifact ID/hash;
- derivative class/media/dimensions/limits;
- tool/library/version/configuration hash;
- creation Operation/Event;
- failure/limitation;
- sensitivity at least as restrictive as source;
- retention tied to source or rebuildable cache policy.

Examples:

- WebP thumbnail from PNG;
- first-frame/static GIF preview;
- rasterized SVG/PDF page after future policy;
- escaped/normalized text slice;
- contact sheet.

Derivative bytes never become the only copy of evidence or authorize evaluator citation unless immutable packet explicitly assigns that role.

## 13. Range requests

Raw download may support one valid byte range:

- parse strictly under bounded header length;
- validate safe integer offset/end and file length;
- no multipart ranges in MVP;
- unsatisfiable/malformed range returns `416` and `ARTIFACT_RANGE_INVALID` where JSON detail can be safely delivered, without partial body confusion;
- range response uses correct `206`, `Content-Range`, `Content-Length`, media/download headers;
- range hash is not represented as full Artifact hash;
- range access does not bypass full Artifact validity/access checks;
- text preview range aligns/labels partial UTF-8/line boundaries rather than claiming a complete document.

## 14. Filenames and headers

Sanitized filename policy:

- strip/replace control characters, CR/LF, path separators, colon/drive/UNC syntax, reserved device names, leading/trailing dots/spaces where platform relevant;
- bound byte/character length;
- preserve a safe extension only as display aid;
- use generated fallback from Artifact ID/class when empty/unsafe;
- never use filename to select disk path or media behavior;
- quote/encode header values through tested library;
- no duplicate Content-Disposition headers;
- metadata retains original display name separately when safe, with sensitivity.

## 15. CSP and application rendering

Authenticated dashboard CSP:

- does not add broad `object-src`, `frame-src`, `script-src`, `connect-src`, or `worker-src` merely to preview Artifacts;
- `object-src 'none'` in MVP;
- no untrusted inline HTML/script/styles;
- passive image endpoint is constrained to exact origin/path;
- blob/data URLs disabled unless one reviewed passive preview need is explicitly allowed;
- iframe embedding of Artifact content disabled in MVP;
- trusted dashboard static assets are build-owned, not Artifact-served.

If an implementation cannot preview a class without weakening CSP, it downloads instead.

## 16. Authentication and authorization

- all metadata/content/preview-derived access requires paired Session;
- exact Host/origin policy remains;
- Artifact access checks Project/Run/sensitivity/retention/status;
- unauthenticated pairing route cannot request Artifact bytes;
- same browser cookie is never exposed to Artifact content scripts because active content is not rendered inline;
- download URLs are nonsecret relative paths but still require cookie at request time;
- no long-lived bearer/share URL in MVP;
- logout/Session end prevents further access;
- operation/status IDs do not grant Artifact access by possession alone.

## 17. UI behavior

Artifact detail shows:

- class/media/size/hash/status/sensitivity/provenance;
- `Preview` only when safe renderer/allowlist supports it;
- `View as text` only for bounded text policy;
- `Download` with active-content warning where relevant;
- corruption/mismatch/quarantine/deleted/unsupported state;
- derived-preview label and source linkage;
- redaction/omission/truncation warnings;
- no implication that browser preview verifies content correctness.

Clicking an unsupported preview never navigates raw content as fallback.

## 18. Tests

- raw content response is attachment/no-sniff/no-store and sanitized filename;
- HTML/SVG/PDF/Markdown/JS/CSS/archive/trace never inline-render from authenticated origin;
- SVG/PDF/HTML stored injection cannot read cookie, issue command, access API/SSE, or execute in app origin;
- passive PNG/JPEG/WebP magic/type/dimension/decode limits;
- media mismatch/polyglot fail closed;
- escaped text prevents HTML/script/bidi/control/ANSI execution;
- JSON duplicate keys, YAML unsafe tags/alias bombs, depth/size limits;
- large text/tree virtualized/bounded;
- raw report HTML download versus trusted structured in-app report separation;
- derivative provenance/sensitivity/source retention;
- range valid/invalid/overflow/multipart/abort behavior;
- header filename CRLF/path/device/Unicode cases;
- CSP remains strict and no blob/data/object/frame broadening;
- pairing/unauthenticated route cannot fetch Artifacts;
- logout/session end revokes access;
- unsupported preview has no raw-navigation fallback;
- quarantine/missing/corrupt/deleted never served as valid;
- access logs omit content/cookies/secrets.

## 19. Conformance

Nonconforming behavior includes:

- serving Project-controlled HTML/SVG/PDF/Markdown/raw trace inline on authenticated origin;
- trusting extension or declared media without verification;
- using `Content-Disposition: inline` for active/ambiguous Artifact;
- allowing Artifact content to run with dashboard origin/cookie/API privileges;
- injecting log/source/YAML/JSON strings through HTML;
- weakening application CSP to support arbitrary preview;
- auto-extracting archives or embedding Trace Viewer in MVP;
- treating digest-valid bytes as safe media;
- bypassing Artifact status/access through range/derived route;
- raw filesystem path preview;
- fallback from unsupported preview to browser navigation;
- derivative replacing canonical evidence or becoming less sensitive than source.
