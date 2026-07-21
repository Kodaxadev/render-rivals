# Render Rivals Packaging, Distribution, and Update Contract

**Status:** Pre-publication implementation contract  
**Scope:** npm package composition, native package selection, version compatibility, release artifacts, checksums/signing, installation, updates, rollback, SBOM, and platform claims.

## 1. Product packaging model

Render Rivals distributes as:

1. one JavaScript bootstrap/coordinator/dashboard package;
2. platform-native supervisor packages selected as optional dependencies;
3. source repository for development builds;
4. GitHub release artifacts/checksums for tagged releases.

Users of packaged releases do not install Rust.

## 2. Package names

Working conceptual names:

```text
render-rivals
<selected-scope>/render-rivals-supervisor-win32-x64
<selected-scope>/render-rivals-supervisor-linux-x64-gnu
<selected-scope>/render-rivals-supervisor-linux-x64-musl
<selected-scope>/render-rivals-supervisor-darwin-arm64
<selected-scope>/render-rivals-supervisor-darwin-x64
```

Exact npm scope/name is verified before publication. Internal paths, package metadata, diagnostics, and environment variables use Render Rivals naming now and do not wait for npm availability.

## 3. Main JavaScript package

Contains:

- minimal `bin` bootstrap;
- coordinator bundle;
- CLI bundle;
- dashboard static assets;
- schema/protocol metadata needed at runtime;
- native package resolver;
- license/third-party notices;
- package version/compatibility manifest.

Does not contain:

- Project source;
- browser binaries except through supported Playwright installation strategy;
- secrets or provider credentials;
- Rust build toolchain;
- mutable user configuration.

## 4. Native packages

Each native package contains:

- one supervisor executable;
- native package manifest;
- executable SHA-256;
- build target/architecture/libc;
- supervisor protocol major/minor;
- minimum compatible coordinator version range;
- source commit/build provenance;
- license/third-party notices where required.

Native package install scripts must not download an unverified executable from an arbitrary mutable URL.

## 5. Native package selection

Bootstrap determines:

- OS;
- architecture;
- libc on Linux;
- package version;
- expected native package name;
- executable path;
- manifest/checksum compatibility.

Selection rules:

- exact platform/architecture match;
- no fallback from strong Windows binary to a differently targeted binary;
- Linux GNU/musl mismatch fails explicitly;
- missing optional dependency reports exact package to install;
- unsupported platform exits before Session creation;
- user-supplied native binary override is development-only, explicit, and recorded.

## 6. Component version compatibility

A release compatibility manifest records:

- JavaScript package version;
- coordinator build ID;
- supervisor build/version;
- IPC protocol range;
- schema writer/reader versions;
- supported Node range;
- Playwright/Chromium revision;
- supported data-schema migration range.

Rules:

- bootstrap package and native optional package use the same release version unless manifest explicitly permits otherwise;
- protocol major mismatch blocks startup;
- incompatible schema writer blocks mutation/read-only access as applicable;
- browser revision mismatch blocks benchmark/reference acceptance and may block ordinary capture according to policy;
- UI displays all component versions separately.

## 7. Package-manager behavior

Reference package manager for development: pnpm.

Consumer installation supports npm/npx and pnpm on the tested Node line.

Requirements:

- package `bin` points only to minimal bootstrap;
- optional native dependencies are platform-filtered;
- postinstall does not run Project code;
- postinstall does not mutate shell profiles or global configuration;
- installation does not create Project registration/data roots until first run;
- missing optional native package yields actionable error, not a JavaScript stack trace;
- package can be installed without provider credentials.

## 8. Playwright/Chromium distribution

The exact strategy is pinned before alpha:

- use official Playwright-managed Chromium revision matching the locked package;
- browser installation path recorded in diagnostics;
- browser integrity/version verified before capture;
- no silent use of arbitrary system Chrome in the reference MVP;
- offline installation instructions identify required browser cache/artifact;
- browser download network behavior is explicit to the user/package manager.

A later system-browser mode is experimental and cannot claim reference reproducibility.

## 9. Release artifact set

Each tagged release publishes:

- npm main package;
- native npm packages;
- platform-native standalone archives where useful;
- SHA-256 checksum file;
- provenance/build metadata;
- SBOM;
- third-party notices;
- changelog/release notes;
- schema/protocol compatibility manifest;
- migration notes;
- support matrix.

## 10. Build reproducibility and provenance

CI records:

- source commit and tag;
- clean working-tree check;
- Node/pnpm/Rust versions;
- lockfile hashes;
- target triple;
- compiler flags;
- dependency graph/SBOM;
- executable/package hashes;
- workflow identity and timestamps.

Bit-for-bit reproducibility is a goal where practical but is not claimed until independently verified. Provenance must not overstate reproducibility.

## 11. Signing and platform trust

### Windows

Before broad public distribution:

- Authenticode-sign supervisor executable/package where feasible;
- timestamp signature;
- verify signature in release smoke test;
- document SmartScreen expectations for unsigned pre-alpha builds.

Unsigned local/source builds are labeled development builds.

### macOS

macOS remains experimental. Public native distribution requires code signing/notarization appropriate to packaging before claiming ordinary installability.

### Linux

Publish checksums/provenance. Distribution-specific package formats are deferred; standalone/npm packages are initial path.

## 12. Update policy

MVP has **no automatic self-updater**.

Updates occur through package manager or explicit release installation.

UI may:

- display current versions;
- check for update only when user enables network check;
- link to release notes;
- warn about incompatible data/protocol migrations.

UI does not:

- download/replace native executable silently;
- mutate global npm installation;
- restart itself into an unverified binary;
- promise background update service.

## 13. Migration-before-update behavior

Before a new version mutates existing data:

1. read installation/data schema versions;
2. determine read/write compatibility;
3. show migration plan and backup requirement;
4. create verified backup/copy where policy requires;
5. run deterministic migration;
6. validate output/integrity;
7. atomically adopt;
8. retain original until success;
9. record migration result.

An update may open old data read-only when migration is unavailable. It never silently writes unsupported major schemas.

## 14. Rollback

Application binary rollback is supported only when the older version can safely read the current data schemas.

Rules:

- release notes state downgrade compatibility;
- backup from before migration is the primary rollback path;
- old binary must not mutate newer unsupported schemas;
- browser/native/coordinator versions roll back as a compatible set;
- mixed ad hoc component rollback is unsupported.

## 15. Offline installation

Document an offline bundle containing:

- main npm tarball;
- matching native package tarball;
- matching Playwright Chromium artifact/cache;
- checksums and compatibility manifest;
- installation commands with scripts/network behavior explained.

Offline mode does not imply external evaluator availability.

## 16. Release channels

Initial channels:

- source/dev builds;
- alpha prereleases;
- stable only after release requirements pass.

No hidden canary channel or automatic channel switching.

Versioning uses SemVer for packages. Pre-1.0 minor releases may contain breaking product changes but schema/protocol compatibility is still explicit and never inferred from package version alone.

## 17. Installation safety

Bootstrap/native resolver rejects:

- writable-by-untrusted-user native executable path where detectable;
- checksum/manifest mismatch;
- unexpected executable type/target;
- protocol/build mismatch;
- native binary from Project directory;
- path traversal in package manifest;
- environment override in nondevelopment mode without explicit acknowledgement.

## 18. Uninstall and data retention

Uninstalling npm package does not automatically delete:

- data root;
- Project markers/configuration;
- Run history;
- browser cache;
- workspaces awaiting cleanup.

Documentation provides explicit commands/paths for cleanup. Deletion remains user-controlled and follows canonical deletion/ownership rules.

## 19. License and contribution gate

`LICENSE-TBD.md` means the repository is not yet licensed for public reuse/contribution.

Before describing Render Rivals as open source or accepting external contributions:

- select real license;
- replace placeholder;
- add copyright notice;
- add third-party notices;
- add contribution and security policies;
- verify dependency/license compatibility.

Local scaffolding and private experimentation may proceed meanwhile.

## 20. Required release tests

- install main package with matching native optional dependency;
- missing/wrong native package gives stable error;
- checksum/manifest mismatch rejected;
- exact Node/coordinator/native compatibility;
- npm and pnpm smoke tests;
- clean machine first-run/data-root behavior;
- package contains no secrets/dev paths/source maps with private paths unless intentionally published;
- Windows Job/Ctrl+C/browser containment in packaged build;
- browser revision installation/verification;
- upgrade/migration/read-only incompatibility;
- rollback compatibility enforcement;
- offline bundle checksum/install;
- uninstall leaves data untouched;
- SBOM/third-party notices/release manifest generated;
- no self-update or background daemon paths in MVP.

## 21. Publication blockers

- real license;
- Windows packaged E2E;
- native package integrity/provenance;
- schema/protocol compatibility manifest;
- browser distribution decision;
- support matrix;
- security reporting process;
- migration/backup test;
- release checksum/SBOM/notices;
- package-name/scope availability.
