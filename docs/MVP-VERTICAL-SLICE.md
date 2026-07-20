# Render Rivals MVP Vertical Slice

**Status:** Implementation contract  
**Target:** First end-to-end usable alpha  
**Primary platform:** Windows 11 strong-containment reference path  
**Depends on:** Canonical specifications, accepted ADRs, the failure-recovery matrix, and the route-level wireframe specification

## 1. Decision summary

The MVP proves one complete product claim:

> Given a current local frontend implementation and one existing contender, Render Rivals can execute both under controlled conditions, capture the same meaningful states and interaction under one valid browser epoch, reject functional and protected regressions, produce a cited pairwise recommendation, and export the selected result without silently modifying the project.

The MVP is not a general autonomous design system. It is the smallest trustworthy comparison loop that exercises the JavaScript bootstrap, Rust supervisor, TypeScript coordinator, Playwright capture layer, file-backed evidence model, evaluator boundary, deterministic policy engine, local UI, recovery system, and explicit promotion workflow.

## 2. Primary user

The primary MVP user is a solo frontend developer or AI-assisted builder who:

- has a local Git repository containing a browser-based frontend;
- can produce or obtain an alternate implementation through any tool or manual process;
- wants a repeatable comparison rather than relying on memory or a single screenshot;
- needs functional regressions blocked before considering visual preference;
- wants the evidence, uncertainty, and final choice retained locally;
- accepts substantial evaluator usage while the quality mechanism is being proven.

The MVP does not optimize for design teams, remote review, CI enforcement, shared workspaces, or nontechnical consumers.

## 3. Golden path

A successful MVP run follows this exact sequence.

1. The user launches Render Rivals.
2. The bootstrap verifies and launches the native supervisor.
3. The supervisor launches the coordinator using the bootstrap's exact `process.execPath`.
4. The user opens a local Git project.
5. Render Rivals detects or receives the project root, package manager, install command, build command, development command, readiness URL, target route, fixture, and protected paths.
6. The user chooses the current source snapshot and one existing contender source.
7. The user reviews a frozen run configuration containing one route, populated/default, empty, and error/unavailable states, desktop and mobile viewports, one critical interaction sequence, required gates, protected dimensions, and one evaluator.
8. Render Rivals validates that both source inputs are stable and distinct.
9. The coordinator creates isolated candidate workspaces outside the active repository.
10. The supervisor executes dependency preparation, build when configured, and development processes sequentially.
11. Playwright opens one capture epoch.
12. The current implementation is captured twice in fresh contexts for a gross stability probe.
13. The current implementation is recaptured for comparison across the complete required state, viewport, and interaction matrix.
14. The contender is captured across the identical matrix in fresh contexts within the same browser epoch.
15. Required gates are evaluated for both candidates.
16. An ineligible contender cannot advance to visual evaluation.
17. The evaluator receives only verified, registered artifacts and returns factor-level conclusions with citations, confidence, and limitations.
18. The same pairwise packet is evaluated in A/B and reversed B/A order.
19. The policy engine produces one of five outcomes: contender recommended, current retained, tie, human review required, or run invalid.
20. The user inspects synchronized captures, interaction steps, gate results, factor evidence, contrary evidence, and limitations.
21. The user explicitly accepts, declines, keeps current, selects another eligible result where permitted, or defers.
22. If adoption is requested, Render Rivals exports a patch or creates a new local branch. It never overwrites the active working tree in place.
23. The completed run remains reconstructable from its files and append-only event stream.

## 4. Supported project shape

The MVP supports projects that satisfy all of the following:

- local Git repository;
- Node-based package manager: npm, pnpm, or yarn;
- browser-rendered application reachable through HTTP on localhost;
- deterministic development command supplied by detection or user configuration;
- one target route;
- three reproducible data states: populated/default, empty, and error or unavailable;
- one reproducible critical interaction sequence;
- no mandatory external service that cannot be reached or deterministically replaced from the local run environment;
- stable rendering after configured readiness and settle policy;
- project commands that can execute without privileged machine-global changes.

The first acceptance fixture is a Vite-based TypeScript frontend. Framework detection may recognize other projects, but only the reference fixture is release-blocking for the first alpha.

Authentication-heavy projects are permitted only when the fixture can establish authentication deterministically without placing credentials in canonical artifacts. Interactive login recording is deferred.

## 5. Source inputs

### 5.1 Current implementation

The current implementation is an immutable source snapshot created from one of:

- the repository HEAD commit with a clean working tree; or
- a captured working-tree snapshot when the user explicitly includes uncommitted changes.

The snapshot records:

- repository identity and root;
- commit SHA when available;
- branch name as provenance only;
- dirty-state declaration and patch hash;
- normalized file-manifest hash;
- dependency lockfile hash;
- configuration hash;
- creation timestamp.

### 5.2 Contender

The MVP accepts exactly one contender from:

- a local Git branch or commit;
- an existing Git worktree;
- a local directory explicitly selected by the user;
- a patch applied into an isolated workspace; or
- a previous candidate snapshot whose provenance and hashes remain valid.

Agent-driven generation is excluded from the MVP. Any coding agent may create the contender outside Render Rivals.

### 5.3 Source stability

After validation begins, source snapshots are immutable. If source bytes change before capture finishes, the candidate becomes stale and cannot continue under the frozen run configuration.

Render Rivals never continues with a silently changed source tree. Source correction requires a new snapshot and, after execution has started, a superseding run.

## 6. Run scope

The MVP run contains:

- one project;
- one current implementation;
- one contender;
- one target route;
- three required application states;
- two required viewports;
- one required critical interaction sequence;
- one color scheme per run, with light as the reference default;
- one locale and time zone;
- one immutable fixture identity;
- one sequential active candidate workload;
- one valid capture epoch used for selection;
- one configured pairwise evaluator or explicit human-only mode;
- one deterministic recommendation policy;
- one explicit human decision.

### 6.1 Fixed reference viewports

The reference defaults are:

- desktop: `1440 x 900`, device scale factor `1`;
- mobile: `390 x 844`, device scale factor `1`.

Users may change these dimensions, but acceptance tests use the reference defaults.

### 6.2 Required state matrix

The route must support:

1. `populated` or `default`: the normal meaningful product state;
2. `empty`: the state with no records, results, or user-created content;
3. `error` or `unavailable`: a realistic failure, unavailable dependency, permission denial, or recoverable error state.

Each state declares:

- stable key;
- setup method;
- readiness assertions;
- required root selectors;
- reset behavior;
- expected state fingerprint;
- secret and external-service requirements;
- whether failure to establish the state blocks the run.

Each candidate is captured at desktop and mobile for every required state. A missing required cell makes the capture set incomplete.

### 6.3 Critical interaction sequence

The MVP includes one repeatable interaction that matters to the page's primary task.

Supported action vocabulary:

- navigate;
- click;
- hover when semantically required;
- focus;
- fill;
- select;
- press;
- wait for selector or response;
- assert visible, text, URL, or enabled state;
- capture step.

The sequence records:

- initial state;
- ordered actions;
- selector strategy;
- per-step timeout;
- assertions;
- screenshots at configured steps;
- console and network errors;
- final state fingerprint.

The same sequence is replayed for current and contender. Interactive recorder tooling, arbitrary branching flows, and multi-user journeys are deferred.

### 6.4 Capture readiness and settling

Each capture occurs only after:

1. navigation succeeds;
2. local-origin and listener-ownership policy passes;
3. fixture setup completes;
4. required readiness checks pass;
5. `document.fonts.ready` resolves or reaches an explicitly configured failure policy;
6. clock and random fixtures are installed before application use where required;
7. configured timers, responses, selectors, network quiet, animation frames, and final delay settle;
8. browser continuity remains intact.

Animations are not blindly disabled when their completion is part of the interaction. The settle policy explicitly declares whether motion is allowed to finish, reduced, frozen, or treated as unsupported.

## 7. Required capture artifacts

For every state and viewport, each candidate requires:

- screenshot;
- DOM summary;
- accessibility snapshot;
- element geometry;
- selected computed styles;
- console summary;
- network summary;
- capture metadata;
- fixture and epoch identity;
- verified artifact hashes.

The critical interaction additionally requires:

- action and assertion trace;
- configured step screenshots;
- per-step result;
- final state fingerprint;
- interaction console and network summary.

A screenshot alone is never a complete evidence record.

## 8. Stability and comparison validity

The MVP requires:

- one pinned Playwright-managed Chromium version per epoch;
- one browser process identity per epoch;
- fresh browser context per stability sample and candidate;
- one fixture hash across compared candidates;
- matching route, state, viewport, locale, time zone, color scheme, device scale factor, and reduced-motion policy;
- current implementation recapture in the active epoch;
- two current stability samples before selection capture;
- visible volatile-region declarations and exclusions;
- complete epoch invalidation after Chromium disconnect or browser crash;
- no prior-run screenshot, DOM, accessibility, or interaction artifact used for selection.

The two-sample stability probe detects gross nondeterminism only. The report records sample count, observed variation, exclusions, uncontrolled dimensions, and that passing does not prove determinism.

Comparison validity states are:

- `valid`: every required identity and artifact verifies;
- `limited`: an allowed platform capability or declared exclusion reduces confidence without breaking equivalence;
- `invalid`: candidates are not comparable or required evidence is missing;
- `stale`: source, fixture, policy, or environment changed after evidence creation.

Only `valid` comparison evidence may support automated recommendation in the reference MVP acceptance path.

## 9. Required gates

A contender is eligible only when every required gate passes. The current implementation is also gated; a run cannot recommend replacement when its reference is invalid.

### Gate G1: source and workspace integrity

- Candidate workspace matches the immutable source snapshot.
- Protected paths were not modified.
- Dependency and lockfile changes comply with policy.
- Workspace remains inside the owned root.

### Gate G2: dependency and build

- Dependency preparation succeeds.
- Build succeeds when configured.
- Required project tests succeed when configured.
- Expected build outputs exist.

### Gate G3: process and endpoint readiness

- Development process remains alive through capture.
- The expected endpoint belongs to the supervised process tree where the platform can verify ownership.
- The route becomes reachable before timeout.

### Gate G4: route and state readiness

- Navigation completes without a fatal browser error.
- Final URL matches the allowed local origin and route policy.
- Populated, empty, and error/unavailable states establish successfully.
- Required root and state selectors are visible and nonzero.

### Gate G5: browser and capture integrity

- No browser crash or disconnect occurs during the epoch.
- Context identity remains valid.
- Required capture matrix and interaction trace are complete.
- Artifact hashes and identity metadata verify.
- Blank, login-redirect, and wrong-route captures are rejected.

### Gate G6: interaction behavior

- Every required action executes.
- Every required assertion passes.
- The final state matches its expected fingerprint.
- Required controls remain usable through keyboard-compatible actions where declared.

### Gate G7: accessibility baseline

- No configured severe automated accessibility violation is introduced.
- Focus visibility and keyboard reachability for the critical interaction do not regress.
- Required semantic labels and roles remain present.

Automated checks inform the gate but do not constitute complete WCAG certification.

### Gate G8: console and network policy

- No prohibited uncaught page exception occurs.
- Console errors follow the configured allowlist and severity policy.
- Required local or fixture-backed requests succeed.
- External requests outside policy are reported or blocked.

A required failure makes the contender ineligible. If the current implementation fails a required gate, the run enters baseline failure or recovery; it does not proceed to aesthetic judgment.

## 10. Evaluation contract

The MVP uses pairwise evidence rather than one opaque design score.

The evaluator may be backed by an external command or agent integration, but Render Rivals owns packet construction, artifact allowlisting, anonymization where configured, output validation, retries, provenance, accounting, and policy.

### 10.1 Factors

| Factor | Weight | Required evidence |
|---|---:|---|
| Task and product fit | 0.15 | Task brief, all states, critical interaction |
| Primary-action clarity | 0.15 | Populated state and interaction evidence |
| Information hierarchy | 0.15 | Desktop and mobile captures |
| Visual coherence and intentionality | 0.15 | All state captures and selected style evidence |
| Responsive quality | 0.15 | Desktop/mobile pairs across states |
| Empty and error-state quality | 0.10 | Empty and error/unavailable captures |
| Interaction and recovery clarity | 0.15 | Interaction trace, focus, assertions, resulting state |

Protected regressions are vetoes, not weights.

Each factor returns one verdict:

- `a_materially_better`;
- `b_materially_better`;
- `no_material_difference`;
- `unable_to_judge`.

Every verdict includes:

- confidence from `0.00` to `1.00` or `null` when unavailable;
- concise rationale;
- citations to registered artifact IDs and optional regions or interaction steps;
- limitations;
- any protected-regression concern.

A scalar score or uncited preference is invalid evaluator output.

### 10.2 Order reversal

The model-backed comparison runs twice:

1. packet with current as A and contender as B;
2. fresh invocation with contender as A and current as B.

Inputs, artifacts, task brief, and factor definitions remain identical apart from presentation order and anonymous labels.

Material disagreement between orders cannot be averaged into certainty. It produces tie handling, retain-current, or human review according to frozen policy.

### 10.3 Recommendation outcomes

```ts
type SelectionOutcome =
  | { kind: "recommend_contender"; candidateId: CandidateId }
  | { kind: "retain_current"; reasonCodes: string[] }
  | { kind: "tie"; candidateIds: CandidateId[] }
  | { kind: "human_review_required"; reasonCodes: string[] }
  | { kind: "invalid_run"; reasonCodes: string[] };
```

The contender may be recommended only when:

1. all current and contender required gates pass;
2. comparison validity is `valid`;
3. evaluator outputs pass schema, provenance, factor-coverage, and citation validation;
4. no protected regression applies;
5. factor evidence supports a material improvement rather than mere difference;
6. order reversal is sufficiently stable;
7. confidence meets the frozen policy threshold;
8. source, fixture, artifact, and policy identities remain current;
9. deterministic policy chooses recommendation.

The current implementation is retained when evidence is valid but improvement is not proven. `No material improvement` is a successful completed outcome.

### 10.4 Human-only mode

The same immutable comparison packet may be rated manually when no model evaluator is configured and the frozen run configuration permits human-only mode.

Human-only mode remains auditable but does not claim automated selector performance. It still requires gates, comparable evidence, explicit decision artifacts, and non-destructive export.

## 11. Explicit human authority

A recommendation is advisory. The user records one typed decision:

- accept recommendation;
- keep current;
- decline recommendation;
- select another eligible candidate where a later multi-contender mode permits it;
- defer;
- invalidate the run.

The decision binds to:

- recommendation ID and hash;
- source-set hash;
- evidence-set hash;
- policy hash;
- actor and timestamp;
- rationale or structured ratings;
- acknowledged warnings.

A changed bound input makes the decision stale and blocks promotion.

## 12. Comparison UI included in the MVP

The local UI must provide:

- run overview and phase progress;
- contender eligibility summary;
- state and viewport selector;
- side-by-side desktop comparison;
- side-by-side mobile comparison;
- synchronized zoom and pan;
- current and contender labels that remain visible;
- critical interaction step navigator with synchronized state;
- gate-result detail;
- factor-level evidence and citations;
- conflicting and missing-evidence states;
- decision overview;
- current-retained / no-material-improvement outcome;
- explicit promotion review;
- event timeline and filtered logs;
- interrupted-run recovery state;
- completed-run reconstruction.

Overlay, flicker, pixel-difference quality scoring, annotation authoring, historical comparison, and multi-round interfaces are deferred. A basic overlay may be implemented if it does not delay the required path.

## 13. Export behavior

The MVP supports non-destructive outputs.

### 13.1 Patch export

Render Rivals produces:

- unified patch;
- source provenance manifest;
- evidence and decision report;
- artifact references and hashes;
- verification instructions.

### 13.2 Branch export

When the project is a compatible Git repository, Render Rivals may create a new branch from the contender snapshot. The branch name is user-editable and defaults to:

```text
render-rivals/<run-id-short>/<contender-slug>
```

### 13.3 Report export

A sanitized report may be exported without adopting the contender. It includes recommendation, decision, gates, evidence, limitations, provenance, integrity, and declared omissions.

The MVP does not:

- check out a branch over the user's active working tree;
- push to a remote;
- open a pull request;
- merge;
- force reset;
- delete the source contender;
- represent a successful export as deployment.

## 14. Explicit exclusions

The MVP excludes:

- contender generation inside Render Rivals;
- more than one contender per run;
- tournament rounds;
- parallel candidate execution;
- automatic repair after gate failure;
- automatic merging or source replacement;
- cloud accounts or hosted storage;
- team collaboration and comments;
- remote workers;
- CI and pull-request checks;
- interactive authentication recording;
- arbitrary branching interaction flows;
- visual annotation authoring;
- pixel-difference scoring as a quality metric;
- design-system plugins;
- evaluator marketplaces;
- model training or preference learning;
- macOS parity claims;
- Linux strong-containment parity claims until verified;
- a database as canonical storage.

## 15. Reference platform policy

The first release-blocking path is Windows 11 with strong process containment.

The MVP is accepted on Windows only when:

- every launched process is assigned to the owned containment boundary;
- cancellation terminates the complete supervised process tree;
- endpoint ownership can be attributed to that process tree;
- coordinator and child processes do not inherit the interactive terminal;
- Ctrl+C is owned by the Rust supervisor;
- run artifacts survive coordinator failure;
- stale descendants are detected during recovery;
- the complete required state, viewport, and interaction matrix runs sequentially;
- browser invalidation forces complete epoch recapture.

Linux and macOS may run in development, but their limitations must be explicit. They do not block the first Windows reference milestone.

## 16. Persistence and recovery requirements

The run is durable at every phase boundary. At minimum, these checkpoints survive coordinator restart:

- validated configuration and policy;
- sealed source snapshots;
- workspace preparation result;
- capture plan;
- completed current stability samples;
- completed current comparison capture set;
- completed contender capture set;
- valid epoch seal;
- gate results and eligibility;
- evaluator input manifests;
- raw and normalized evaluator output;
- evidence records;
- recommendation;
- user decision;
- promotion/export result;
- cleanup and integrity result.

A browser disconnect invalidates the complete active capture epoch. Captures from that epoch remain for diagnostics but cannot be used as valid evidence.

A resumed run never assumes a process is alive solely because a PID was stored. The supervisor verifies process identity, containment membership, endpoint ownership, and session continuity.

Recovery targets follow `spec/10-run-and-candidate-state-machines.md` and `docs/FAILURE-RECOVERY-MATRIX.md`.

## 17. Security boundaries

The MVP must:

- treat project commands as untrusted local code;
- execute project processes only through the Rust supervisor;
- prevent project-provided paths from escaping owned run directories;
- redact configured secrets from structured logs;
- avoid placing session nonces or native endpoint identifiers in argv;
- reject evaluator citations outside the immutable input manifest;
- restrict browser navigation to the configured local origin after startup;
- record all external evaluator data flows;
- isolate candidate browser contexts and state;
- exclude source files, raw process output, cookies, and secret values from diagnostic exports by default;
- require explicit trust acknowledgement before first project execution.

## 18. Acceptance fixtures

The repository must include fixtures covering:

1. valid current and materially stronger valid contender;
2. valid current and visually different but not materially stronger contender;
3. contender with stronger appearance but protected interaction regression;
4. populated, empty, and error/unavailable states;
5. mobile-only responsive regression;
6. critical interaction success for current and contender;
7. critical interaction assertion failure;
8. severe accessibility regression;
9. contender build failure;
10. contender route readiness timeout;
11. uncaught browser exception;
12. missing required selector;
13. browser disconnect during current capture;
14. browser disconnect during contender capture;
15. source mutation after validation;
16. current stability probe failure;
17. evaluator output with unresolved citation;
18. low-confidence evaluation;
19. order-reversal conflict;
20. cancellation with stubborn descendant process;
21. coordinator crash after partial epoch;
22. coordinator crash after valid epoch seal;
23. disk-write interruption before atomic rename;
24. artifact hash mismatch;
25. stale human decision blocking export;
26. successful patch export without changing the active working tree;
27. idempotent branch retry detecting an already-created matching branch.

## 19. Release acceptance criteria

The MVP is complete only when all of the following are demonstrated by automated or repeatable acceptance tests.

### Runtime

- Bootstrap, supervisor, and coordinator establish authenticated local IPC.
- The supervisor owns terminal signals and complete process cleanup.
- Current and contender workloads run sequentially.
- Port ownership is verified before the browser trusts the endpoint where supported.
- Platform capability and limitations are stored and visible.

### Capture

- Current and contender are recaptured in one valid epoch.
- The current stability probe runs in fresh contexts.
- Populated, empty, and error/unavailable states are captured at desktop and mobile.
- The critical interaction is replayed and asserted for both candidates.
- Required accessibility, geometry, console, network, and metadata artifacts verify.
- Browser disconnect invalidates the entire epoch.
- Invalidated artifacts remain diagnostic and cannot enter evaluation.

### Evidence and policy

- Required gates block invalid contenders.
- Protected regressions veto recommendation.
- Evaluator output is factorized, cited, confidence-bearing, and schema-valid.
- A/B and B/A order reversal is recorded and checked.
- The recommendation is reproducible from stored artifacts and policy.
- No-material-improvement, tie, and escalation are ordinary outcomes.

### Persistence and recovery

- The run reconstructs from files and events without a database.
- Coordinator restart resumes from the latest safe checkpoint.
- Partial writes do not appear as committed artifacts.
- Artifact tampering is detected through hash verification.
- Invalid epoch evidence cannot become valid during recovery.
- Terminal business outcome remains distinct from cleanup status.

### User control

- The user can inspect all evidence used for the recommendation.
- Promotion requires an explicit, nonstale decision artifact.
- Patch or branch export does not overwrite the active working tree.
- Cancellation terminates owned processes or records an explicit cleanup incident.
- No source is merged, pushed, or replaced automatically.

## 20. Implementation sequence

Build the vertical slice in this order:

1. canonical file, event, hash, and artifact primitives;
2. domain entities, identifiers, and pure state reducers;
3. authenticated bootstrap-supervisor-coordinator session;
4. Windows process containment, output capture, endpoint ownership, and cleanup;
5. project trust, detection, and immutable source snapshots;
6. isolated workspace and dependency preparation;
7. fixture, state, viewport, and interaction contracts;
8. sequential application launch and readiness verification;
9. Playwright stability probe, capture epoch, and artifact validation;
10. required deterministic gates;
11. comparison UI and human-only evidence review;
12. pairwise evaluator adapter, order reversal, and output validation;
13. deterministic recommendation policy;
14. typed user decision and staleness checks;
15. run reconstruction and recovery;
16. patch, branch, and report export;
17. complete acceptance and failure fixture suite.

No generated-contender work should begin until this vertical slice passes its acceptance suite.

## 21. Definition of done

The MVP is done when a user can take a real local project and a real alternative implementation through the complete golden path without:

- hand-editing canonical run files;
- manually coordinating worktrees;
- manually killing descendant processes;
- guessing whether screenshots and interaction states are comparable;
- trusting an unexplained score;
- losing evidence after interruption;
- confusing recommendation with adoption;
- risking automatic modification of the accepted branch.

A polished happy-path demo that omits empty/error states, critical interaction evidence, epoch invalidation, recovery, or explicit human approval is not the MVP.