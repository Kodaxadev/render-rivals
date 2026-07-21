# Playwright Capture API Verification Notes

**Status:** Current primary-source note; reverify at exact dependency pin  
**Checked:** 2026-07-20  
**Applies to:** `spec/20-capture-artifact-formats-and-evidence-registry.md`

## 1. ARIA snapshot API

Current official Playwright documentation exposes:

- `page.ariaSnapshot()`;
- `locator.ariaSnapshot()`;
- `expect(locator).toMatchAriaSnapshot()` for testing.

The snapshot is documented as a YAML representation of accessible elements. Current options include version-dependent depth, mode, and bounding-box controls.

Architecture consequence:

- Render Rivals stores the exact raw YAML returned by the pinned public API;
- default semantic mode is used for MVP unless a later policy changes it;
- geometry remains a separate Artifact instead of enabling snapshot boxes by default;
- exact method/options/Playwright version are recorded;
- ARIA snapshot is structural evidence, not an accessibility audit;
- axe-core findings remain a separate Artifact/Gate input.

Scaffold proof:

- pinned Playwright package supports the selected page/root call;
- raw output is stable enough under deterministic fixture for same-version capture;
- iframe/root/depth behavior is tested;
- secret/redaction handling is tested;
- API change/removal blocks scaffold upgrade rather than silently using private internals.

Primary references:

- https://playwright.dev/docs/aria-snapshots
- https://playwright.dev/docs/api/class-page#page-aria-snapshot
- https://playwright.dev/docs/api/class-locator#locator-aria-snapshot

## 2. Screenshot API

Current official Playwright Page/Locator screenshot APIs support PNG and JPEG output and return/write screenshot bytes.

Architecture consequence:

- MVP canonical evidence uses PNG;
- WebP/contact sheets/thumbnails remain derived through the pinned image-processing tool;
- exact screenshot options are pinned and recorded;
- Render Rivals does not depend on undocumented browser screenshot internals.

Scaffold proof:

- exact PNG bytes and dimensions are captured for the reference fixture;
- viewport/full-page, scale, masks, animations, caret, background, clipping, font readiness, and timeout behavior are tested for the pinned release;
- browser disconnect/page crash/write failure paths match Capture invalidation policy;
- current and Contender use identical options.

Primary references:

- https://playwright.dev/docs/screenshots
- https://playwright.dev/docs/api/class-page#page-screenshot
- https://playwright.dev/docs/api/class-locator#locator-screenshot

## 3. Version-sensitive warning

The online documentation may describe a newer Playwright release than the eventual pinned package. Render Rivals implementation must validate feature availability from the exact installed type/runtime version and record the package/browser revision in Capture metadata.

A current website claim is not implementation proof. The fixture and packaged build remain authoritative for support.
