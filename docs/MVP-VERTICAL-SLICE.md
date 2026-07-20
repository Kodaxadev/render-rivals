# Render Rivals MVP Vertical Slice

**Status:** Implementation contract  
**Target:** First end-to-end usable alpha  
**Primary platform:** Windows 11 strong-containment reference path  
**Depends on:** Canonical specifications, accepted ADRs, and the route-level wireframe specification

## 1. Decision summary

The MVP proves one complete product claim:

> Given a current local frontend implementation and one existing contender, Render Rivals can execute both under controlled conditions, capture comparable evidence, reject functionally invalid work, produce a cited pairwise recommendation, and export the selected result without silently modifying the project.

The MVP is not a general autonomous design system. It is the smallest trustworthy comparison loop that exercises the JavaScript bootstrap, Rust supervisor, TypeScript coordinator, Playwright capture layer, file-backed evidence model, evaluator boundary, local UI, and explicit promotion workflow.

## 2. Primary user

The primary MVP user is a solo frontend developer or AI-assisted builder who:

- has a local Git repository containing a browser-based frontend;
- can produce or obtain an alternate implementation through any tool or manual process;
- wants a repeatable comparison rather than relying on memory or a single screenshot;
- needs functional regressions blocked before considering visual preference;
- wants the evidence and final choice retained locally.

The MVP does not optimize for design teams, remote review, CI enforcement, shared workspaces, or nontechnical consumers.

## 3. Golden path

A successful MVP run follows this exact sequence.

1. The user launches Render Rivals.
2. The bootstrap verifies and launches the native supervisor.
3. The supervisor launches the coordinator using the bootstrap's exact `process.execPath`.
4. The user opens a local Git project.
5. Render Rivals detects or receives the project working directory, package manager, install command, development command, readiness URL, and target route.
6. The user chooses the current source snapshot and one existing contender source.
7. The user reviews a run configuration containing one route, two viewports, required gates, and one evaluator.
8. Render Rivals validates that both source inputs are stable and distinct.
9. The coordinator creates isolated candidate workspaces.
10. The supervisor executes install, build when configured, and development processes sequentially.
11. Playwright opens one capture epoch and recaptures the current implementation before capturing the contender.
12. Both candidates are captured at the same two viewports with equivalent environment metadata.
13. Required gates are evaluated for both candidates.
14. An ineligible contender cannot advance to visual evaluation.
15. The evaluator receives only verified artifacts and returns factor-level conclusions with citations and confidence.
16. The decision engine produces one of three outcomes: contender recommended, current retained, or human review required.
17. The user inspects side-by-side captures, gate results, factor evidence, and limitations.
18. The user explicitly accepts or declines the recommendation.
19. If accepted, Render Rivals exports a patch or creates a new local branch from the contender source. It never overwrites the current working tree in place.
20. The completed run remains reconstructable from its files and append-only event stream.

## 4. Supported project shape

The MVP supports projects that satisfy all of the following:

- local Git repository;
- Node-based package manager: npm, pnpm, or yarn;
- browser-rendered application reachable through HTTP on localhost;
- deterministic development command supplied by detection or user configuration;
- one target route that does not require interactive authentication;
- no mandatory external service that cannot be reached from the local run environment;
- stable rendering after a configured readiness and settle period.

The first acceptance fixture is a Vite-based TypeScript frontend. Framework detection may recognize other projects, but only the reference fixture is release-blocking for the first alpha.

## 5. Source inputs

### 5.1 Current implementation

The current implementation is an immutable source snapshot created from one of:

- the repository HEAD commit with a clean working tree; or
- a captured working-tree snapshot when the user explicitly includes uncommitted changes.

The snapshot records:

- repository root;
- commit SHA when available;
- branch name when available;
- dirty-state declaration;
- normalized file manifest hash;
- dependency lockfile hash;
- configuration hash;
- creation timestamp.

### 5.2 Contender

The MVP accepts exactly one contender from:

- a local Git branch or commit;
- an existing Git worktree;
- a local directory explicitly selected by the user; or
- a patch applied into an isolated workspace.

Agent-driven generation is excluded from the MVP. Any coding agent may create the contender outside Render Rivals.

### 5.3 Source stability

After validation begins, source snapshots are immutable. If the source manifest changes before its capture finishes, the candidate is marked stale and must be re-snapshotted. Render Rivals does not continue with an silently changed source tree.

## 6. Run scope

The MVP run contains:

- one project;
- one current implementation;
- one contender;
- one target route;
- one initial application state;
- two viewports;
- one light color scheme;
- one locale and time zone;
- one sequential capture epoch;
- one configured evaluator;
- one explicit human decision.

### 6.1 Fixed reference viewports

The reference defaults are:

- desktop: `1440 x 900`, device scale factor `1`;
- mobile: `390 x 844`, device scale factor `1`.

Users may change these dimensions, but acceptance tests use the reference defaults.

### 6.2 Initial application state

The MVP captures the route after:

1. navigation succeeds;
2. the configured readiness check passes;
3. `document.fonts.ready` resolves or times out according to policy;
4. animations and transitions are disabled through the capture stylesheet;
5. a configurable settle interval passes without a browser disconnect.

Scripted interactions, authentication flows, network mocking, hover states, and multi-step journeys are deferred.

## 7. Required gates

A contender is eligible only when every required gate passes. The current implementation is also gated; a run cannot produce a promotion recommendation if the current reference itself is invalid.

### Gate G1: process readiness

- Development process remains alive through capture.
- The expected endpoint is owned by the supervised process tree.
- The route becomes reachable before timeout.

### Gate G2: route readiness

- Navigation completes without a fatal browser error.
- The final URL matches the allowed local origin and expected route policy.
- The document reaches the configured readiness condition.

### Gate G3: browser integrity

- No uncaught page exception occurs after navigation begins.
- No browser crash or disconnect occurs during the epoch.
- The capture context remains the context registered for the epoch.

### Gate G4: required content

- The configured root selector is visible.
- Its bounding box has nonzero dimensions.
- It is not entirely outside the viewport.

### Gate G5: capture completeness

For each viewport, the candidate has:

- screenshot;
- DOM summary;
- console summary;
- metadata record;
- matching source, environment, browser, and epoch identifiers;
- verified artifact hashes.

### Gate G6: source-policy compliance

- The candidate was created from the declared source snapshot.
- Protected paths were not modified when a protected-path policy is configured.
- Dependency changes are disclosed.

Accessibility scanning, performance budgets, interaction scripts, and network policies become additional gates after the vertical slice.

## 8. Evaluation contract for the MVP

The MVP uses one pairwise evaluator behind a stable adapter. The evaluator may be backed by an external command or agent integration, but Render Rivals owns input construction, output validation, provenance, retries, and decision policy.

### 8.1 Evaluation factors

The MVP evaluates four factors:

| Factor | Weight | Required evidence |
|---|---:|---|
| Visual hierarchy | 0.30 | Desktop and mobile captures |
| Clarity and readability | 0.30 | Captures and DOM text summary |
| Consistency and composition | 0.20 | Captures at both viewports |
| Responsive behavior | 0.20 | Cross-viewport comparison |

Each factor returns:

- `current`, `contender`, or `tie`;
- confidence from `0.00` to `1.00`;
- concise rationale;
- citations to one or more artifact IDs;
- limitations or missing evidence.

A scalar score without citations is invalid evaluator output.

### 8.2 Decision rule

The contender is recommended only when all of the following are true:

1. all required contender gates pass;
2. all current-reference gates pass;
3. the evaluation payload passes schema and citation validation;
4. aggregate evaluator confidence is at least `0.70`;
5. weighted contender support is at least `0.60`;
6. no factor with confidence at least `0.80` reports the current implementation materially better on responsive behavior;
7. the evaluator reports no blocking limitation that makes the comparison invalid.

Weighted support is calculated as:

- contender win: full factor weight;
- tie: half factor weight;
- current win: zero factor weight.

The current implementation is retained when the evidence is valid but the contender does not meet the promotion threshold.

Human review is required when:

- aggregate confidence is below threshold;
- evidence is contradictory;
- a required citation cannot be resolved;
- the evaluator marks a material limitation;
- the decision cannot be reproduced from stored inputs.

### 8.3 Human authority

A recommendation is advisory. The user must explicitly accept it. Declining a recommendation is a valid completed outcome and does not mutate the evidence record.

## 9. Comparison UI included in the MVP

The local UI must provide:

- run overview and phase progress;
- contender eligibility summary;
- side-by-side desktop comparison;
- side-by-side mobile comparison;
- synchronized zoom and pan;
- current and contender labels that remain visible;
- gate-result detail;
- factor-level evidence and citations;
- decision overview;
- current retained / no material improvement outcome;
- explicit promotion review;
- event timeline and filtered logs;
- completed-run reconstruction.

Overlay, flicker, pixel-difference, responsive-sequence, annotation, historical-comparison, and multi-round interfaces are deferred.

## 10. Export behavior

The MVP supports two non-destructive exports.

### 10.1 Patch export

Render Rivals produces:

- unified patch;
- source provenance manifest;
- evidence report;
- artifact references;
- verification instructions.

### 10.2 Branch export

When the project is a compatible Git repository, Render Rivals may create a new branch from the contender snapshot. The branch name is user-editable and defaults to:

`render-rivals/<run-id-short>/<contender-slug>`

The MVP does not:

- check out the branch over the user's active working tree;
- push to a remote;
- open a pull request;
- merge;
- delete the source contender.

## 11. Explicit exclusions

The MVP excludes:

- contender generation inside Render Rivals;
- more than one contender per run;
- tournament rounds;
- parallel candidate execution;
- automatic merging or source replacement;
- cloud accounts or hosted storage;
- team collaboration and comments;
- remote workers;
- CI and pull-request checks;
- scripted interaction flows;
- authenticated capture flows;
- visual annotation tools;
- pixel-difference scoring as a quality metric;
- design-system plugins;
- evaluator marketplaces;
- model training or preference learning;
- macOS parity claims;
- Linux strong-containment parity claims until verified;
- a database as canonical storage.

## 12. Reference platform policy

The first release-blocking path is Windows 11 with strong process containment.

The MVP is accepted on Windows only when:

- every launched process is assigned to the owned containment boundary;
- cancellation terminates the complete supervised process tree;
- endpoint ownership can be attributed to that process tree;
- coordinator and child processes do not inherit the interactive terminal;
- Ctrl+C is owned by the Rust supervisor;
- run artifacts survive coordinator failure;
- stale descendants are detected during recovery.

Linux and macOS may run in development, but their limitations must be explicit. They do not block the first Windows reference milestone.

## 13. Persistence and recovery requirements

The run is durable at every phase boundary. At minimum, the following checkpoints must survive coordinator restart:

- validated configuration;
- source snapshots;
- workspace preparation result;
- completed current capture set;
- completed contender capture set;
- gate results;
- evaluator input manifest;
- evaluator output;
- recommendation;
- user decision;
- export result.

A browser disconnect invalidates the complete active capture epoch. Captures from that epoch remain for diagnostics but cannot be used as valid evidence.

A resumed run never assumes a process is alive solely because a PID was stored. The supervisor must verify process identity, containment membership, and endpoint ownership.

## 14. Security boundaries

The MVP must:

- treat project commands as untrusted local code;
- execute project processes only through the Rust supervisor;
- prevent project-provided paths from escaping owned run directories;
- redact configured secrets from structured logs;
- avoid placing session nonces or native endpoint identifiers in argv;
- reject evaluator citations outside the run artifact manifest;
- restrict browser navigation to the configured local origin after startup;
- record all external evaluator data flows;
- never include source files in diagnostic exports by default.

## 15. Acceptance fixtures

The repository must include fixture applications covering:

1. valid current and visually stronger valid contender;
2. valid current and visually weaker contender;
3. contender build failure;
4. contender route readiness timeout;
5. uncaught browser exception;
6. missing required selector;
7. browser disconnect during current capture;
8. browser disconnect during contender capture;
9. source mutation after validation;
10. evaluator output with an unresolved citation;
11. low-confidence evaluation;
12. cancellation with a stubborn descendant process;
13. coordinator crash after current capture;
14. disk-write interruption before atomic rename;
15. successful patch export without changing the active working tree.

## 16. Release acceptance criteria

The MVP is complete only when all of the following are demonstrated by automated or repeatable acceptance tests.

### Runtime

- Bootstrap, supervisor, and coordinator establish authenticated local IPC.
- The supervisor owns terminal signals and complete process cleanup.
- One current implementation and one contender run sequentially.
- Port ownership is verified before the browser trusts the endpoint.

### Capture

- Current and contender are recaptured in one valid epoch.
- Desktop and mobile capture sets are complete and hash-verified.
- Browser disconnect invalidates the entire epoch.
- Invalidated artifacts are visible for diagnosis but excluded from evaluation.

### Evidence

- Required gates block an invalid contender.
- Evaluator output is factorized, cited, confidence-bearing, and schema-valid.
- The recommendation can be reproduced from stored artifacts and policy.
- A no-material-improvement result is treated as successful completion.

### Persistence

- The run can be reconstructed from files and events without a database.
- Coordinator restart resumes from the latest safe checkpoint.
- Partial writes do not appear as committed artifacts.
- Artifact tampering is detected through hash verification.

### User control

- The user can inspect all evidence used for the recommendation.
- Promotion requires explicit confirmation.
- Patch or branch export does not overwrite the current working tree.
- Cancellation terminates owned processes and records a durable terminal event.

## 17. Implementation sequence

The vertical slice should be built in this order:

1. file and event primitives;
2. domain entities and state reducers;
3. authenticated bootstrap-supervisor-coordinator session;
4. Windows process containment and cleanup;
5. project detection and immutable source snapshots;
6. isolated workspace preparation;
7. sequential application launch and readiness verification;
8. Playwright capture epoch and artifact verification;
9. required gates;
10. pairwise evaluator adapter and output validation;
11. deterministic decision policy;
12. run reconstruction and recovery;
13. minimum local UI;
14. patch and branch export;
15. acceptance fixture suite.

No generated-contender work should begin until this vertical slice passes its acceptance suite.

## 18. Definition of done

The MVP is done when a user can take a real local project and a real alternative implementation through the complete golden path without hand-editing run files, manually killing descendant processes, guessing whether screenshots are comparable, or trusting an unexplained score.