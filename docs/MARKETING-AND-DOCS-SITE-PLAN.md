# Render Rivals Marketing and Documentation Site Plan

**Status:** Public-surface planning with claim gates  
**Purpose:** Define pages that may be published only when the corresponding capability and proof exist  
**Product scope:** `docs/MVP-VERTICAL-SLICE.md` and `docs/PLANNING-SCOPE-STATUS.md`  
**Packaging/license:** `docs/PACKAGING-DISTRIBUTION-AND-UPDATES.md`

## 1. Publication principle

The website must describe the product that exists, not the complete-product roadmap.

Every public capability claim requires:

- implemented feature;
- acceptance test or real product evidence;
- documented limitations;
- current support matrix;
- matching product screenshot or verified report where visual;
- no contradiction with license/package status.

Pages may exist as private drafts before their claim gate passes, but are not linked in public navigation as available product features.

## 2. Positioning

Current MVP direction:

> Compare a current implementation with an independently prepared Contender. Capture equivalent states. Block regressions. Inspect cited evidence. Decide explicitly.

Render Rivals is not:

- an AI website generator in the MVP;
- a hostile-code sandbox;
- an automatic merge/deployment system;
- a universal design oracle;
- a single opaque score;
- a production traffic A/B platform;
- cross-platform containment parity.

Do not say Render Rivals creates/generates Contenders until in-Run generation is implemented and released.

## 3. Canonical public language

Use:

- current implementation;
- Contender;
- Candidate;
- Capture Epoch;
- Gate;
- Evidence;
- Recommendation;
- User Decision;
- Promotion for patch/branch/workspace adoption handoff;
- Export Operation for report/diagnostics/bundles.

Avoid winner/champion/challenger/battle, “AI judged best,” automatic promotion, or report-as-Promotion language.

## 4. Navigation by maturity

### Before packaged alpha

- Product status;
- Architecture;
- Security model;
- Documentation/specifications;
- GitHub source;
- Roadmap;
- License status.

No prominent Download, Install, Contributing, Releases, Pricing, or Open Source CTA until their gates pass.

### Packaged alpha

May add:

- Download/Installation;
- How it works;
- Product screenshots;
- Example reports;
- Changelog/Releases;
- Troubleshooting.

### Licensed public OSS release

May add:

- Contributing;
- Open Source page;
- governance/issue labels;
- contributor setup;
- security reporting.

## 5. Homepage

### Pre-alpha hero

> Build contenders elsewhere. Compare them fairly. Keep the evidence local.

Primary actions:

- Read the architecture;
- View source/status.

Do not show a Download CTA until a tested package exists.

### Alpha hero

> Compare implementations. Adopt only what proves better.

Supporting copy must state:

- one current + one existing Contender MVP;
- local commands run with user authority and are not sandboxed;
- optional external evaluator receives a disclosed packet;
- no automatic merge/push;
- Windows is reference platform;
- no-winner/tie/invalid outcomes are normal.

### Required homepage proof before alpha

- real side-by-side state/viewport/interaction view;
- factor Evidence with citations and limitations;
- Contender Gate failure/current retained case;
- browser Epoch invalidation/recovery example;
- exact local/external data-flow table;
- real package/install command and support matrix.

## 6. How it works

MVP sequence:

1. register/trust Project;
2. select current and existing Contender Source Snapshots;
3. seal route/states/viewports/interaction/Gates;
4. prepare isolated Workspaces;
5. recapture current and Contender under one valid Epoch;
6. resolve deterministic Gates;
7. evaluate eligible Candidates pairwise or human-only;
8. create Recommendation;
9. record User Decision;
10. create Promotion or ordinary Export Operation;
11. preserve canonical history and cleanup results.

Required disclaimer: no silent merge, push, checkout over active tree, or deployment.

## 7. Product pages and gates

### Available with MVP

#### Capture

- three states;
- desktop/mobile;
- one critical interaction;
- current stability samples;
- Epoch validity;
- candidate-local versus browser-wide failures;
- evidence Artifacts.

#### Side-by-side comparison

- matched state/viewport/step;
- visible current/Contender labels;
- validity and limitations;
- cited Evidence.

Overlay is optional/P1. Difference/flicker/annotations/responsive sequences are not marketed as available until implemented.

#### Gates and Evidence

- phased Gates;
- Factor verdict/confidence/citations;
- protected regressions;
- conflicts/missing Evidence;
- order reversal/human-only mode;
- no-winner/tie/invalid outcomes.

#### Local runtime and diagnostics

- bootstrap/supervisor/coordinator;
- measured containment levels;
- process/output/resource handling;
- safe mode and cleanup;
- canonical files/events;
- explicit security non-guarantees.

#### Decision and output

Separate pages/sections:

- Recommendation/User Decision;
- Promotion: patch, local branch, preserved Workspace;
- Export Operation: report, diagnostics, Run/evidence bundle, screenshots, config, selected logs.

### Post-MVP pages

Do not publish as current capability:

- generated Contenders;
- multiple Contenders/rounds;
- Rule Sets editor/product;
- annotation collaboration;
- historical comparison product;
- CI/PR automation;
- team/cloud/remote workers;
- plugin/evaluator marketplace;
- Figma;
- automatic updates.

Roadmap may list them as uncommitted future exploration.

## 8. Security and privacy page

Must reflect `security/THREAT-MODEL.md`.

Required sections:

- Project/local evaluator commands run with user authority;
- containment is lifecycle/resource control, not filesystem sandbox;
- dashboard authentication/CSRF/Origin/CSP;
- Project/source/storage paths;
- browser navigation/network policy;
- remote evaluator packet/redaction/provider retention;
- raw logs/screenshots may contain undeclared secrets;
- canonical integrity/recovery;
- import/export protections;
- platform capability/non-parity;
- telemetry/crash reporting defaults;
- deletion/retention;
- responsible disclosure when established.

Required tables:

1. data type / local location / external transmission;
2. capability / platform / guarantee / limitation;
3. command/integration / permission / revocation;
4. Export kind / default included/excluded data.

Do not say “your code never leaves the machine” when an external evaluator is enabled.

## 9. Download and installation page

Publication gate:

- public package name finalized;
- tested package/native/browser path;
- checksums/provenance;
- license status clear;
- support matrix;
- install/uninstall/data-retention instructions;
- known issues;
- migration/rollback policy;
- no self-updater implication.

Tabs appear only for tested distributions. Experimental macOS/Linux source builds are labeled experimental, not equal downloads.

## 10. Source/status page before licensing

Title: Project Status or Source Repository—not Open Source.

Include:

- architecture reading order;
- implementation maturity;
- support status;
- license placeholder meaning;
- no permission for reuse/contribution until license selected;
- roadmap without dates;
- security-contact status;
- build-from-source only when scaffold exists.

After real license, it may become Open Source/Contributing page.

## 11. Examples and case studies

Publish only real complete cases.

Each includes:

1. task/constraints;
2. current/Contender source provenance;
3. controlled environment;
4. three states and interaction;
5. Gates and eligibility;
6. comparison;
7. cited Evidence/limitations;
8. Recommendation;
9. User Decision;
10. Promotion or no-adoption result;
11. downloadable redacted report via Export Operation;
12. exact versions/capabilities.

Include no-improvement, Contender ineligible, tie/human review, and invalid Run examples—not only successful adoption.

## 12. Adjacent-tool comparison

Categories:

- coding agents;
- website generators;
- screenshot/visual regression;
- design review;
- A/B testing;
- benchmarks.

Compare factual capabilities at publication date. Do not imply competitors lack features without current verification. Distinguish source generation, local execution, Gates, same-Epoch evidence, cited judgment, human Decision, traffic requirement, automatic merge, and Artifact ownership.

## 13. Documentation information architecture

### Status/getting started

- maturity/support/license panel;
- installation only after package gate;
- first Project;
- first existing-Contender Run;
- reading comparison/evidence;
- Decision;
- Promotion versus Export Operation;
- failure/recovery;
- uninstall/data retention.

### Concepts

- current/Contender/Candidate;
- Project/Run/Session;
- Source Snapshot/Workspace;
- Capture Plan/Epoch/Capture;
- phased Gates;
- Evidence/Confidence/limitations;
- Recommendation/User Decision;
- Promotion/Export Operation;
- containment and security non-guarantees;
- canonical storage/recovery.

Rounds, Rule Sets, generated Contenders, and integrations remain roadmap concepts until implemented.

### Configuration

Must match `spec/13` exactly:

- `user.jsonc`;
- `.render-rivals/project.json`;
- `.render-rivals/config.jsonc`;
- template location;
- precedence/merge;
- commands/env/secrets;
- route/states/viewports/interaction;
- Gates/Factors;
- limits/storage/retention;
- CLI/API.

No whole-app/component/selector scope docs as current MVP capability.

### Evaluator adapter

Use exact command request/result from spec06, trust boundary, timeouts, output validation, packet allowlist, remote data flow, fixtures, and rejection behavior.

### Git/source

Use spec14 for dirty trees, LFS, submodules, line endings, symlinks, case collisions, patches, branches, and cleanup.

### Platform guides

Windows reference; Linux/macOS experimental according to measured capabilities. Do not document parity.

### Troubleshooting

Use canonical stable error codes and exact permitted actions. Avoid fixes that mutate active source or canonical files manually.

### Development/contributing

Publish contribution workflow only after license and scaffold exist. Include schema/protocol/store/native/browser/security test requirements.

## 14. Changelog and roadmap

Changelog categories reflect actual components:

- Bootstrap/CLI;
- Native supervisor;
- Coordinator/API/UI;
- Git/Workspace;
- Capture/Gates;
- Evaluation;
- Storage/Recovery;
- Promotion/Export;
- Security;
- Documentation.

Roadmap groups outcomes, marks speculative items, and avoids release dates/commitments.

## 15. Pricing/sustainability

Do not publish until a real model exists. Do not call a core open-source product or promise cloud/hosted services before license and implementation decisions.

## 16. Legal/trust prerequisites

Before broad public launch:

- real license;
- privacy/terms appropriate to actual product;
- security policy/responsible disclosure;
- third-party notices/SBOM;
- trademark guidance;
- provider data-processing explanations;
- accurate telemetry/crash-reporting defaults.

## 17. Asset inventory

Create only from real implementation:

- product wordmark/logo;
- real dashboard screenshots;
- workflow/Epoch/containment/data-flow diagrams;
- matched comparison sets;
- Evidence detail;
- no-winner/invalid/recovery scenes;
- installation images from tested package;
- architecture/runtime diagrams;
- redacted example reports.

Brand concept boards are exploration and must not be presented as shipped UI.

## 18. Public claim checklist

A page fails publication review when it:

- says generate/create Contenders in MVP;
- says report is Promotion;
- calls project open source before license;
- shows Download before package exists;
- shows Contributing before license/process;
- claims code never leaves machine without evaluator caveat;
- claims sandbox or platform parity;
- markets post-MVP comparison modes/Rule Sets/rounds as current;
- promises automatic update/background service;
- uses fake product screenshots or unverifiable examples;
- omits no-winner/invalid/limitations;
- describes active source merge/push/deployment.
