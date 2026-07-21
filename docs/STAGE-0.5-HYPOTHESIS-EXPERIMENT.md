# Render Rivals Stage 0.5 Hypothesis Experiment

**Status:** Frozen pre-production experiment contract  
**Authority:** `adr/ADR-0013-stage-0-5-evidence-gate.md`  
**Purpose:** Determine whether the Render Rivals comparison and recommendation mechanism produces enough decision value to justify the production scaffold.

## 1. Experiment question

The experiment answers:

> For real frontend changes where a qualified current implementation and one independently prepared Contender both exist, does controlled evidence, phased eligibility review, order-reversed pairwise evaluation, and explicit human judgment produce better adoption decisions than always retaining current or selecting randomly among eligible implementations?

The experiment tests the **quality mechanism**, not the production runtime.

## 2. Claims explicitly excluded

Passing Stage 0.5 does not prove:

- broad market demand;
- universal design quality;
- population-level false-recommendation rates;
- production process containment;
- crash-safe durability or recovery;
- secure multi-user operation;
- package/install readiness;
- cross-platform parity;
- complete WCAG conformance;
- model independence;
- automatic source adoption safety.

Experiment scripts and folders are non-production research tools.

## 3. Frozen experiment manifest

Before the first evaluator result or human rating is observed, create an experiment manifest containing:

```json
{
  "schema": "render-rivals/stage-0.5-experiment",
  "schemaVersion": "1.0.0",
  "experimentId": "exp05_<opaque-id>",
  "createdAt": "<UTC timestamp>",
  "owner": "<local actor>",
  "taskIds": [],
  "minimumValidTasks": 8,
  "targetValidTasks": 12,
  "minimumOpportunityCases": 4,
  "selectorAgreementThreshold": 0.75,
  "maximumOrdinaryFalseRecommendations": 1,
  "maximumProtectedRegressionRecommendations": 0,
  "maximumOrderConflictRate": 0.25,
  "minimumNetCorrectAdoptionsOverRetainCurrent": 2,
  "evaluator": {
    "provider": "<provider>",
    "adapter": "<adapter>",
    "model": "<model/version>",
    "promptHash": "<sha256>"
  },
  "captureEnvironment": {
    "node": "<exact version>",
    "playwright": "<exact version>",
    "chromium": "<exact revision>",
    "locale": "en-US",
    "timezone": "<frozen zone>",
    "desktop": "1440x900@1",
    "mobile": "390x844@1"
  },
  "status": "frozen"
}
```

Threshold, task-selection, evaluator, prompt, factor, capture, and human-rating changes after freezing create a new experiment ID. Results from different experiment IDs are not pooled automatically.

## 4. Sample and task selection

### 4.1 Size

- Target: **12 valid task comparisons**.
- Minimum analyzable sample: **8 valid task comparisons**.
- Fewer than 8 valid tasks yields `inconclusive`.

This sample is intended to expose gross failure or useful personal signal. It is not a statistical certification sample.

### 4.2 Task diversity

Select tasks before evaluation from at least:

- three distinct routes or product areas;
- two responsive-layout patterns;
- two information-density levels;
- two interaction types;
- populated/default, empty, and error/unavailable states across the sample.

At least one task must stress each of:

- primary-action clarity;
- responsive behavior;
- empty/error-state quality;
- a critical interaction;
- accessibility or keyboard behavior.

### 4.3 Anti-cherry-picking rule

The task list is frozen before seeing evaluator or human outcomes. A failed or inconvenient task cannot be removed merely because it hurts the result.

A task may be invalidated only for a declared protocol reason. Invalidated tasks and reasons remain in the experiment record and are replaced using the frozen selection rule.

## 5. Candidate preparation

Each task contains:

- one qualified current implementation;
- one independently prepared Contender;
- one task brief;
- one source identity for each implementation;
- one declared protected-regression list.

The Contender is created outside the comparison/evaluation step. It may be produced manually or by a coding agent, but the preparation method, model/tool, prompt or brief, elapsed time, and observed cost are recorded.

The selector/evaluator must not generate, repair, or revise the Contender during the sealed comparison.

## 6. Lightweight execution boundary

Allowed experiment mechanics:

- manual Git worktrees or copied source folders;
- manually started or simple scripted local servers;
- pinned Playwright capture scripts;
- ordinary filesystem directories and SHA-256 manifests;
- direct command/API evaluator invocation;
- manual cleanup and restart when documented.

Required warning on every experiment report:

> Stage 0.5 does not implement or prove Render Rivals production containment, durability, recovery, authentication, migration, packaging, or release security.

No experiment shortcut becomes production code by default.

## 7. Evidence protocol

Each valid task captures the same required evidence for current and Contender:

### Required states and viewports

```text
populated/default × desktop
populated/default × mobile
empty × desktop
empty × mobile
error/unavailable × desktop
error/unavailable × mobile
one critical interaction sequence with configured step captures
```

### Required evidence

- lossless screenshot;
- route and state identity;
- viewport and environment identity;
- DOM or structural summary;
- ARIA snapshot or equivalent structural accessibility evidence;
- automated accessibility findings;
- console-error summary;
- network-error summary;
- critical-interaction actions and assertions;
- protected-regression observations;
- source and artifact hashes.

A task is invalid when required evidence is missing, source identity changes, current and Contender use different declared conditions, or the critical interaction cannot be applied comparably.

## 8. Eligibility review

Before aesthetic evaluation, apply a recorded human/deterministic eligibility checklist:

- source corresponds to declared snapshot;
- application builds and route loads;
- required states are reachable;
- critical interaction works;
- no disallowed protected path/dependency change;
- no severe declared accessibility regression;
- no fatal console/runtime failure;
- evidence set is complete and comparable.

An ineligible Contender produces the protocol outcome `retain current` without model-backed aesthetic recommendation.

A broken current implementation invalidates the task; it is not an opportunity to promote a merely less-broken Contender.

## 9. Pairwise evaluator protocol

For each task with two eligible Candidates:

1. Build one immutable evidence packet.
2. Replace source/tool identity with neutral labels A and B.
3. Invoke the evaluator with current as A and Contender as B.
4. Invoke a fresh evaluator context with the order reversed.
5. Validate factor coverage, citations, confidence, and protected-regression concerns.
6. Apply the frozen deterministic selection rule.

Factors:

- task/product fit;
- primary-action clarity;
- information hierarchy;
- visual coherence and intentionality;
- responsive quality;
- empty/error-state quality;
- interaction and recovery clarity.

Factor verdicts:

- A materially better;
- B materially better;
- no material difference;
- unable to judge.

Allowed selector outcomes:

- recommend Contender;
- retain current;
- tie;
- human review required;
- invalid task.

Material disagreement between A/B and B/A cannot be averaged into a recommendation.

## 10. Blinded human rating

Human rating is the experiment reference outcome.

Rules:

- Candidate sides are randomized and labeled neutrally.
- The rater does not see the evaluator recommendation, order-reversal result, source identity, or preparation method before rating.
- The rater reviews the same evidence packet and protected-regression information available to the evaluator.
- Rating occurs before recommendation reveal.
- The rating is committed before the evaluator outcome is unblinded.

Human verdict:

- current materially better;
- Contender materially better;
- no material difference;
- unable to judge;
- invalid comparison.

The rater also records confidence, factor notes, protected regressions, and whether either implementation would actually be adopted.

For the personal experiment, Justin may be the primary rater because the first question is personal decision utility. This must be described as preference fit, not general design truth.

## 11. Controls and metrics

### 11.1 Opportunity rate

```text
Contender-preferred valid tasks / valid tasks
```

This answers whether useful alternatives existed. A selector cannot create value when every Contender is worse or indistinguishable.

### 11.2 Selector agreement

Among clear human-preference tasks:

```text
selector chose human-preferred implementation / clear-preference tasks
```

Tie, escalation, and unable-to-judge are not counted as correct selection, but remain separately reported.

### 11.3 False Contender recommendation

A false Contender recommendation occurs when the selector recommends the Contender and the blinded human verdict is:

- current materially better; or
- Contender contains a protected regression that should veto adoption.

Protected-regression false recommendations are reported separately and have zero tolerance for `proceed`.

### 11.4 Always-retain-current control

For every valid task, calculate whether always retaining current would match the blinded human preference.

### 11.5 Random eligible-selection control

For tasks with two eligible implementations, expected random accuracy is `0.5` on clear binary-preference cases. Ties and invalid tasks remain separate.

### 11.6 Net correct adoptions over retain-current

```text
correct Contender recommendations
- false Contender recommendations
- opportunities missed by selector that retain-current also misses only when the frozen utility rule assigns a cost
```

The experiment report must show the uncompressed counts, not only one net number.

### 11.7 Additional diagnostics

Record:

- order-reversal conflict rate;
- tie/escalation rate;
- evaluator invalid-output rate;
- evidence-invalid task rate;
- preparation, capture, evaluation, and human-review time;
- known model usage/cost;
- factor-specific disagreement;
- recommendation confidence calibration descriptively.

## 12. Default continuation thresholds

A `proceed` decision requires all of:

1. at least **8 valid tasks**;
2. at least **4 human-preferred Contender opportunities**;
3. selector agreement at least **75%** on clear human-preference tasks;
4. no more than **1 ordinary false Contender recommendation**;
5. exactly **0 protected-regression Contender recommendations**;
6. order-reversal conflict rate no greater than **25%** of model-evaluated eligible tasks;
7. at least **2 net correct Contender adoptions beyond the always-retain-current control**;
8. no protocol defect that makes the metrics untrustworthy;
9. the owner judges the observed workflow valuable enough to justify the production cost.

A `pivot` decision is required when evidence collection is useful but one or more selector thresholds fail and a specific evaluator, factor, packet, or protocol change is justified.

A `stop` decision is appropriate when:

- opportunity rate is too low to justify orchestration;
- the selector does not beat retain-current meaningfully;
- false recommendation risk is unacceptable;
- operational burden exceeds observed decision value;
- the workflow duplicates simpler existing tools without material benefit.

An `inconclusive` decision is required when sample size, opportunity count, protocol adherence, or evidence quality is insufficient.

Thresholds are not relaxed after results are visible.

## 13. Artifact layout

Recommended experiment-only layout:

```text
research/stage-0.5/<experiment-id>/
  experiment.json
  protocol.md
  task-selection.json
  tasks/
    <task-id>/
      task.json
      sources.json
      evidence-manifest.json
      current/
      contender/
      eligibility.json
      evaluator-a-b.json
      evaluator-b-a.json
      selector-result.json
      human-rating.blinded.json
      unblinding.json
      task-result.json
  analysis/
    metrics.json
    metrics.md
    deviations.json
  decision.json
```

These records should use deterministic JSON and hashes where convenient, but they are not canonical Render Rivals product schemas.

Raw secrets, cookies, private environment files, and unrelated source files are excluded.

## 14. Task procedure

For each task:

1. confirm frozen task and protected-regression brief;
2. seal source identities;
3. prepare current and Contender separately;
4. start each implementation under the same declared environment;
5. capture the required matrix;
6. validate evidence completeness and comparability;
7. perform eligibility review;
8. if both eligible, create immutable anonymized evaluator packet;
9. run A/B and B/A evaluator passes;
10. produce selector outcome without showing it to the human rater;
11. randomize presentation and collect blinded human rating;
12. commit rating;
13. unblind source identity and selector outcome;
14. calculate task metrics and record deviations;
15. clean temporary processes/worktrees manually and record cleanup limitations.

## 15. Invalidation and deviations

Invalidate a task when:

- current is not a qualified reference;
- source changes after sealing;
- compared evidence uses materially different fixture/environment conditions;
- required states or interaction evidence are absent;
- evaluator sees identity information prohibited by the protocol;
- human sees recommendation before committing the blinded rating;
- artifacts cannot be attributed to the correct Candidate;
- a protocol deviation could change the preference or recommendation outcome.

Minor deviations that cannot affect outcome remain recorded but do not automatically invalidate.

Invalid tasks remain in the record and are replaced according to the frozen task-selection rule.

## 16. Final decision record

`decision.json` records:

```json
{
  "schema": "render-rivals/stage-0.5-decision",
  "schemaVersion": "1.0.0",
  "experimentId": "exp05_<opaque-id>",
  "decision": "proceed | pivot | stop | inconclusive",
  "decidedAt": "<UTC timestamp>",
  "decidedBy": "<actor>",
  "metricArtifact": "analysis/metrics.json",
  "thresholdsMet": [],
  "thresholdsMissed": [],
  "protocolLimitations": [],
  "rationale": "<explicit rationale>",
  "nextAction": "<bounded next action>"
}
```

The decision must cite raw counts and deviations. It cannot rely only on a narrative summary.

## 17. Production gate

Only a valid `proceed` record permits the production scaffold to enter Stage 1.

- `pivot` permits only another frozen experiment or small experiment-support changes.
- `stop` ends production scaffold work unless ADR-0013 is explicitly overturned.
- `inconclusive` permits sample/protocol repair but not assumption of success.

Production code may reuse experiment ideas only after satisfying the canonical production specifications, threat model, failure matrix, schemas, and tests.

## 18. Completion criteria

Stage 0.5 is complete when:

- manifest and task list were frozen before outcomes;
- minimum sample and opportunity rules were applied honestly;
- every valid task has complete paired evidence;
- evaluator order reversal and blinded human rating were performed;
- controls and raw counts were calculated;
- invalidations and deviations remain visible;
- final decision is one of the four allowed outcomes;
- the production scaffold either remains blocked or opens through an explicit `proceed` record.
