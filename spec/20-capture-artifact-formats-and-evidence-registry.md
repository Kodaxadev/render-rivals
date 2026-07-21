# 20 — Capture Artifact Formats and Evidence Registry

**Status:** Canonical implementation contract  
**Scope:** Required Capture Artifact classes, formats, media types, screenshot policy, ARIA snapshot handling, DOM/geometry/style/console/network/interaction schemas, redaction, limits, evaluator eligibility, and derived previews  
**Capture lifecycle:** `spec/05-execution-and-capture.md`  
**Artifact storage:** `spec/11-artifact-event-and-schema-contracts.md`  
**Primitives/hashes:** `spec/18-canonical-primitives-json-hashing-and-measurements.md`

## 1. Purpose

The MVP requires more than screenshots: DOM, ARIA/accessibility, geometry, selected styles, console, network, interaction, fixture, browser, and Epoch identity are all required evidence. The existing Artifact class examples do not register every required class or define exact formats. That would force capture, evaluator, UI, and store implementations to invent incompatible files.

This specification defines the complete MVP Capture Artifact registry and separates canonical evidence from derived preview/cache assets.

## 2. Registry authority

This specification amends the initial Artifact class list in `spec/11`.

Canonical MVP Capture classes:

| Artifact class | Required media type/format | Selection evidence by default |
|---|---|---|
| `capture.screenshot` | `image/png` | Yes |
| `capture.dom-summary` | `application/json` | Yes |
| `capture.aria-snapshot` | `application/yaml; charset=utf-8` | Yes |
| `capture.accessibility-findings` | `application/json` | Yes |
| `capture.geometry` | `application/json` | Yes |
| `capture.computed-styles` | `application/json` | Yes |
| `capture.console-summary` | `application/json` | Yes |
| `capture.network-summary` | `application/json` | Yes |
| `capture.interaction-trace` | `application/json` | Required for configured interaction steps |
| `capture.metadata` | `application/json` | Yes |
| `capture.volatile-region-manifest` | `application/json` | When exclusions/treatments exist |
| `capture.failure-screenshot` | `image/png` | Diagnostic only |
| `capture.playwright-trace` | `application/zip` | Diagnostic/sensitive, excluded by default |

New classes require registry amendment. A generic `capture.data` or filename extension is not a class.

## 3. Canonical versus derived image assets

### Canonical screenshot

- lossless PNG produced by the pinned Playwright/Chromium capture path;
- exact bytes registered and hashed without post-capture visual compression;
- one screenshot per required Candidate/state/viewport/interaction capture point;
- viewport screenshot by default; full-page screenshot only when Capture Plan explicitly declares it and both Candidates use the same policy;
- screenshot metadata records viewport, device scale factor, clip/full-page policy, browser/Playwright version, page scroll position, background policy, animation/caret handling, masks, and capture time;
- no JPEG/WebP as canonical selection screenshot in MVP;
- PNG ancillary metadata is not used as semantic evidence; exact bytes still remain Artifact identity.

### Derived image

Thumbnails, contact sheets, WebP previews, overlays, diffs, crops, and annotated renders are rebuildable derived assets:

- generated from registered canonical PNGs;
- record source Artifact IDs/hashes and image-tool version;
- never replace canonical screenshot;
- excluded from evaluator packet unless a specific immutable packet explicitly allows the derived role and retains originals;
- deletion/rebuild does not affect canonical evidence.

## 4. Screenshot capture contract

Before screenshot:

- required state/interaction assertion passes;
- settle policy completes;
- font policy resolves;
- viewport/device scale matches Capture Plan;
- page is on allowed local origin/route;
- current browser/context/Epoch identity verifies;
- volatile-region treatments are resolved and recorded;
- screenshot call uses one exact pinned option set.

The exact Playwright screenshot options are pinned at scaffold and recorded. At minimum policy decides:

- `type="png"`;
- full-page versus viewport;
- animations behavior;
- caret visibility;
- background omission;
- mask locators and mask color;
- clip/scale policy;
- timeout.

A mask is never applied silently. Every mask maps to the volatile-region manifest and appears in UI/report limitations.

A screenshot that is blank, login/redirect, wrong route, wrong viewport, wrong Candidate, clipped unexpectedly, or unverified after write is invalid.

## 5. ARIA snapshot

The pinned Playwright version must support `page.ariaSnapshot()` or `locator.ariaSnapshot()`.

MVP policy:

- capture the configured semantic root, normally `page`/document body or one declared application root;
- use Playwright’s default semantic snapshot mode, not an AI-optimized/ref mode, unless a later versioned policy explicitly changes it;
- bounding boxes are excluded because geometry is a separate Artifact;
- depth is complete for the configured root unless a declared bounded policy is recorded;
- exact returned UTF-8 YAML text is stored as `capture.aria-snapshot`;
- no YAML reformatting, key reordering, or lossy parse/reserialize before raw Artifact registration;
- Playwright version and exact method/options are in Capture metadata;
- a validated normalized representation may be derived for indexing/evaluation, but raw YAML remains source and the derived schema/hash/provenance is explicit;
- secrets/accessibility names/text receive the same declared redaction policy as DOM/evaluator output;
- ARIA snapshot is structural evidence and does not prove accessibility conformance.

If the pinned Playwright API changes or cannot capture the required root, the scaffold verification task updates this contract before implementation; it does not fall back to an undocumented private API.

## 6. Accessibility findings

`capture.accessibility-findings` is separate from ARIA snapshot.

MVP source is the pinned axe-core integration plus configured Render Rivals checks.

Minimum JSON data:

- schema/version;
- Capture/Candidate/Epoch IDs;
- engine name/version/configuration hash;
- tested document/root;
- rule/tag policy;
- violations, incomplete/manual-review items, passes where retained by policy;
- impact/severity from engine without silently remapping;
- affected target references tied to DOM/geometry identifiers;
- help/rationale identifiers;
- redaction summary;
- execution errors/limitations;
- Artifact/capture hashes.

Rules:

- automated findings do not claim complete WCAG compliance;
- required severe-regression Gate uses frozen rule/severity policy;
- engine error or missing Artifact cannot be converted into a pass;
- raw snippets are bounded/redacted;
- unstable generated selectors are evidence locators, not durable source-edit paths.

## 7. DOM summary

The MVP does not store unrestricted `outerHTML` as standard evidence.

`capture.dom-summary` is a bounded normalized JSON representation containing, according to frozen policy:

- stable capture-local node identifier;
- parent/child order;
- element/tag and relevant semantic role;
- selected safe attributes (`id`, `class` summary, role, ARIA state, name references, href/action origin class, data-testid when allowed);
- normalized visible text or redaction placeholder;
- visibility/display/disabled/focusable/interactable summary;
- form-control type/state without secret value by default;
- landmark/heading/list/table/form relationships;
- selected source locator hints;
- truncation/omission/redaction markers.

Excluded by default:

- script/style source;
- inline event-handler code;
- arbitrary data attributes;
- hidden secret/auth tokens;
- password/value/autofill/storage contents;
- full URLs with credentials/query secrets;
- raw comments and oversized text;
- cross-origin iframe contents not explicitly controlled.

Node identifiers are deterministic within one Capture under the declared traversal policy but are not assumed stable across Candidate implementations.

## 8. Geometry

`capture.geometry` records finite CSS-pixel measurements for selected nodes/regions:

- capture-local node ID;
- bounding client rect `x`, `y`, `width`, `height`;
- viewport intersection/visibility;
- scroll offsets and viewport dimensions;
- client/scroll dimensions where relevant;
- stacking/order hints only when deterministically observable;
- text line/wrapping summary where implemented;
- measurement method/version.

Rules:

- values are finite JSON numbers; negative zero normalizes under canonical JSON;
- no arbitrary integer rounding before storage;
- device-pixel conversion is derived from recorded scale, not mixed into CSS fields;
- transforms and writing modes are recorded/limited explicitly;
- geometry from different viewport/scroll/state is never compared as equivalent;
- hidden/detached/missing nodes have typed status, not fabricated zero rectangle;
- geometry selection policy is identical for current and Contender.

## 9. Computed styles

`capture.computed-styles` stores strings for a frozen allowlist of properties on selected nodes.

Initial candidate properties may include:

- display/position/overflow;
- width/height/min/max;
- margin/padding/gap;
- grid/flex alignment/order;
- font family/size/weight/line-height/letter-spacing;
- color/background/border/radius;
- opacity/visibility;
- white-space/text-overflow/word-break;
- focus-outline properties;
- transform where relevant.

Rules:

- property allowlist/version is in Run Configuration/Capture metadata;
- store browser-returned normalized string, not parser-dependent CSS AST unless separately derived;
- custom properties are excluded by default because they may contain secrets/large values;
- pseudo-elements require explicit policy;
- style Artifact supports explanation/diagnosis, not direct quality scoring by raw pixel/property difference;
- missing/unsupported property is explicit.

## 10. Console summary

`capture.console-summary` records bounded page/worker console and uncaught error facts for the Capture window:

- type/severity;
- canonical timestamp and monotonic offset;
- redacted text;
- source URL class and sanitized location;
- exception/error classification;
- repeat count/fingerprint;
- expected/ignored policy match;
- truncation/omission;
- listener installation and Capture window boundaries.

Rules:

- no raw cyclic JS objects serialized blindly;
- handles/arguments are converted through bounded safe preview policy;
- stacks are sensitive local details and excluded/redacted by default;
- messages before listener installation or outside window are not attributed silently;
- duplicate collapse retains count and first/last occurrence;
- console absence is not proof that application is correct;
- instrumentation failure creates required Artifact failure, not empty-success summary.

## 11. Network summary

`capture.network-summary` records requests relevant to readiness/state/interaction/capture:

- request fingerprint/ordinal;
- method;
- sanitized URL/origin/path classification;
- resource type;
- initiator category where available;
- start/end/elapsed monotonic measurements;
- response status/failure reason;
- cache/service-worker classification where available;
- declared fixture/mock/external classification;
- required-request assertion link;
- byte sizes when reliably reported;
- redirect chain summary;
- omission/redaction/limitation.

Excluded by default:

- authorization/cookie headers;
- request/response bodies;
- secret query values;
- TLS credentials/cert material;
- unrelated browser background traffic.

Network summary is based on browser-observed events and does not claim packet-level capture. Missing/unreliable timing/size remains null.

## 12. Interaction trace

`capture.interaction-trace` is canonical JSON for the configured critical sequence, not a Playwright ZIP trace.

For each step:

- stable step ID/ordinal;
- action kind;
- redacted locator/target description;
- redacted input reference, never raw secret by default;
- preconditions;
- start/end/elapsed;
- expected assertions;
- actual typed outcomes;
- resulting route/state/fingerprint;
- screenshot/Capture/Artifact references;
- console/network observations associated with step;
- retry/attempt information;
- failure/limitation.

Rules:

- same logical script/policy executes for both Candidates;
- raw passwords/tokens/form secrets are references/placeholders;
- no arbitrary executable JavaScript in persisted trace;
- custom fixture step references versioned project code/config rather than embedding code;
- failed step remains in trace and blocks required interaction Gate;
- trace is replay description/evidence, not guaranteed automation source for changed application.

## 13. Playwright diagnostic trace

`capture.playwright-trace` may be retained for failed or configured diagnostic captures.

- sensitive local Artifact;
- may include DOM/network/screenshots/source snippets depending Playwright behavior;
- excluded from standard evaluator packet/export/diagnostic bundle unless explicitly selected and reviewed;
- exact Playwright version/options/retention recorded;
- size-bounded;
- failure to create diagnostic trace does not erase primary failure but is surfaced;
- never treated as required selection evidence in MVP.

## 14. Capture metadata

`capture.metadata` is required and binds all other Capture Artifacts.

Minimum fields:

- Capture, Candidate, Attempt, Run, Plan, Epoch IDs;
- Source Snapshot/Workspace manifest hash;
- route and allowed-origin result;
- state/interaction step;
- viewport CSS width/height and device scale;
- color scheme, motion, locale, timezone, clock/random/network fixture identities;
- browser executable/build/version/process identity;
- Playwright version;
- context/page identity;
- settle/font/readiness results;
- screenshot options;
- DOM/ARIA/axe/geometry/style/console/network policy versions;
- volatile-region treatment;
- Artifact IDs/classes/hashes/byte lengths;
- capture start/end and monotonic durations;
- redaction/omission/truncation summary;
- completeness/validity and reason codes;
- environment fingerprint.

A Capture cannot be `valid` until metadata references every required committed/verified Artifact.

## 15. Volatile-region manifest

Required whenever any visual/text/geometry/manual-review exclusion or mask applies.

Each entry includes:

- configured selector/region identity;
- treatment;
- reason;
- matched node/geometry summary;
- whether match count met expectation;
- screenshot mask relationship;
- affected Artifact/factor/Gate classes;
- user-visible limitation;
- policy/config hash.

A missing/unexpected selector does not silently disable masking. It fails or requires explicit manual-review policy.

## 16. Failure screenshot

A failure screenshot:

- is captured only when browser/page continuity remains sufficient;
- is diagnostic, not selectable evidence;
- records failure timing/state and may show incomplete/wrong UI;
- uses PNG and the same redaction/mask policy when possible;
- does not make a failed Capture complete;
- may be absent when screenshot itself/browser failed, with explicit reason.

## 17. Schema envelopes and paths

JSON Capture Artifacts use strict versioned schemas such as:

```text
render-rivals/capture-dom-summary
render-rivals/capture-accessibility-findings
render-rivals/capture-geometry
render-rivals/capture-computed-styles
render-rivals/capture-console-summary
render-rivals/capture-network-summary
render-rivals/capture-interaction-trace
render-rivals/capture-metadata
render-rivals/capture-volatile-region-manifest
```

ARIA raw YAML and PNG/ZIP are registered through Artifact records and bound by Capture metadata.

Artifact filenames are generated/safe and not schema authority. Suggested display names may be `screenshot.png`, `aria.yml`, `geometry.json`, etc., but class/media/schema determine meaning.

## 18. Artifact commit order

For one Capture:

1. allocate Capture/Operation and temp area;
2. collect required raw data under one page/state window;
3. apply redaction/normalization according to class;
4. commit each payload through Artifact write protocol;
5. register each Artifact creation;
6. write/commit metadata last, referencing every Artifact;
7. verify all hashes/classes/media/schema/identity;
8. transition Capture to valid and append completion Event.

If any required Artifact fails:

- Capture remains incomplete/failed;
- already committed Artifacts remain diagnostic/incomplete and are not evaluator input;
- metadata may be written as failure/incomplete record when safely possible;
- retry semantics follow same-page or new Epoch rules;
- no placeholder empty Artifact satisfies completeness.

## 19. Size and truncation policy

Each class has a frozen byte/entry/depth/text limit in Run Configuration/policy.

Rules:

- canonical screenshot exceeding limit fails Capture unless a predeclared tiling policy exists; it is not silently recompressed to lossy format;
- DOM/ARIA/geometry/style/console/network/trace truncation is explicit at the exact node/message/request/step boundary;
- a required completeness-sensitive Artifact that truncates beyond allowed policy makes Capture limited/invalid according to Gate policy;
- evaluator packet receives truncation/omission limitations;
- process-output limits are separate from Capture Artifact limits;
- zip/decompression limits apply to diagnostic trace serving/export.

## 20. Evaluator packet roles

Allowed-by-default selection inputs:

- canonical screenshots;
- DOM summary;
- raw ARIA snapshot or approved normalized derivative;
- accessibility findings;
- geometry;
- selected styles;
- console/network summaries;
- interaction trace;
- metadata and volatile-region manifest;
- relevant Gate Results.

Excluded by default:

- failure screenshots of ineligible Capture except when evaluator task explicitly analyzes failure and cannot recommend it;
- Playwright ZIP trace;
- raw process logs;
- source files/patch beyond allowed change summary;
- derived overlays/diffs/thumbnails unless immutable packet explicitly permits them;
- unrelated Artifacts.

Every allowed Artifact is listed by ID/hash/class/media/role in immutable input manifest.

## 21. Privacy and redaction

Capture may contain sensitive Project/user data.

- state fixtures should prefer synthetic deterministic data;
- secret values are never intentionally rendered into evidence;
- configured redaction occurs before evaluator transmission and portable export;
- canonical local screenshot may still contain unrecognized sensitive pixels/text; UI warns and provides review;
- visual redaction/masking itself becomes a disclosed limitation and cannot hide a relevant regression silently;
- DOM/ARIA/console/network/action values use declared structured redaction;
- no claim to detect every arbitrary secret;
- local evaluator command remains trusted executable despite packet allowlist.

## 22. Required tests

- every required Artifact class registered and schema/media match;
- PNG canonical versus WebP/thumbnail derived separation;
- exact screenshot option metadata and same-plan current/Contender behavior;
- blank/wrong-route/login/viewport/mask mismatch rejection;
- current pinned `page.ariaSnapshot()`/`locator.ariaSnapshot()` raw YAML capture and version/options recording;
- ARIA snapshot and axe findings remain distinct;
- DOM exclusion/redaction/limit/node ordering;
- geometry finite/subpixel/hidden/detached/transform cases;
- style allowlist/missing/pseudo/custom-property rules;
- console cyclic args/repeats/stacks/window/instrumentation failure;
- network redirect/cache/service-worker/failure/redaction/null measurements;
- interaction secret references/failure/retry/Artifact links;
- metadata-last commit and incomplete Artifact recovery;
- volatile selector zero/multiple/unexpected match behavior;
- diagnostic trace sensitivity/size/export exclusion;
- evaluator allowlist includes only valid committed same-Run/Epoch Artifacts;
- derived asset deletion does not affect evidence;
- Capture invalidation makes all owned evidence unusable without rewriting bytes.

## 23. Nonconforming behavior

- treating screenshot alone as complete evidence;
- storing WebP/JPEG as canonical screenshot in MVP;
- using a removed/private Playwright accessibility API without pinned verification;
- claiming ARIA snapshot proves accessibility compliance;
- omitting required accessibility/geometry/style/network/interaction classes from registry;
- storing unrestricted outerHTML, headers/bodies, secrets, or JS objects as standard evidence;
- silently truncating/masking/omitting Capture evidence;
- registering placeholder empty Artifact as success;
- letting derived thumbnail/diff replace canonical screenshot;
- allowing failed/invalid/incomplete/cross-Epoch Artifact into selector packet;
- hiding redaction/exclusion limitations from report/Decision.
