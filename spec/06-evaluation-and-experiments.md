# 06 — Pairwise Evaluation, Controls, Human Ratings, and Experimental Sequence

## 1. Hypothesis

Given one shared renderable champion, multiple hard-gate-valid challengers, the same baseline evidence, and same-run captures, an evidence-backed selector can recommend a better final implementation than retaining, random eligible selection, and serious linear refinement.

## 2. Quality-first policy

The first proof is not token constrained. Spend enough to test whether the mechanism can work. Record usage.

## 3. Eligible set

Contains champion and every challenger passing mandatory gates. Rejected candidates remain recorded but do not enter aesthetic selection.

## 4. Outcomes

```ts
type SelectionOutcome =
  | { kind: "promote"; candidateId: string }
  | { kind: "retain_champion" }
  | { kind: "tie" }
  | { kind: "escalate"; reason: string }
  | { kind: "invalid_run"; reason: string };
```

## 5. Protected regression

Any protected regression vetoes promotion:

- task clarity;
- functionality;
- responsive integrity;
- required states;
- accessibility;
- truthfulness;
- maintainability policy;
- protected-file policy.

## 6. Judge roles

### Visual critic

Hierarchy, typography, composition, coherence, product fit, distinctiveness, state presentation.

### UX/task critic

Primary action, workflow clarity, error recovery, information priority, interaction state.

### Code/regression critic

Implementation risk, duplication, scope, maintainability, tests, build evidence.

### Selector

Combines critic evidence and protected-regression results.

## 7. Separate critics

Visual and code criticism remain separate so visual gain cannot conceal implementation regression.

## 8. Pairwise packet

```ts
interface PairwisePacket {
  comparisonId: string;
  candidateA: AnonymousCandidateEvidence;
  candidateB: AnonymousCandidateEvidence;
  taskBrief: TaskBrief;
  protectedDimensions: string[];
  comparisonDimensions: string[];
  evidenceIndex: EvidenceIndex;
}
```

Hide candidate identity, strategy, and model.

## 9. Dimensions

1. product/brief fit;
2. primary-action clarity;
3. information hierarchy;
4. visual coherence;
5. intentionality;
6. distinctiveness without usability loss;
7. responsive quality;
8. state quality.

## 10. Dimension verdict

```ts
type DimensionVerdict =
  | "a_materially_better"
  | "b_materially_better"
  | "no_material_difference"
  | "unable_to_judge";
```

Every verdict cites evidence.

## 11. Materiality

A visible difference is not automatically worth accepting. Model/human must state whether replacement is meaningful.

## 12. Order reversal

For model pairwise comparison:

1. A/B fresh context;
2. B/A fresh context;
3. compare dimensions;
4. calculate stability;
5. retain/escalate on material conflict.

## 13. Tie-break

Optional when order conflicts, critics disagree, confidence is insufficient, or opportunity appears high. Usage recorded separately.

## 14. No opaque score

Store dimension verdicts, vetoes, confidence, evidence, and policy decision. No universal 0–100 design score.

## 15. Promotion policy

Recommend challenger only when:

- gates pass;
- no protected regression;
- visual/UX evidence supports material improvement;
- order reversal sufficiently stable;
- no applicable explicit preference rejection;
- selector chooses promotion.

Ambiguity retains or escalates.

## 16. Random control

Condition E1 uses same eligible set. Expected random result is calculated from human outcomes, not one random draw.

## 17. Retain control

Condition E2 always selects champion.

## 18. Human oracle

After ratings, oracle selects human-preferred best eligible candidate. It is a ceiling, not deployable.

## 19. Selector metrics

- uplift over random;
- uplift over retention;
- oracle gap.

## 20. Linear condition

Condition C uses same initial artifact as D:

```text
X0
→ critique
→ repair X1
→ critique
→ repair X2
```

## 21. Challenger condition

```text
X0 + same baseline packet
├── Y1
├── Y2
├── Y3
└── Y4
```

Challengers do not see one another.

## 22. Information flow

Both C and D receive:

- task brief;
- X0 source;
- X0 screenshots;
- deterministic findings;
- one shared X0 critique.

C receives sequential feedback after repairs. D receives independent diversity. Report this explicitly.

## 23. Budget reporting

### Generation allocation

Initial generation, repair generations, challenger generations.

### Selection allocation

Critics, selector, reversal, tie break.

### Total usage

Tokens/credits where known, wall time, human time, local resources.

Equal generations and equal total cost are separate analyses.

## 24. Phase 1 — Personal preference-fit

Purpose: determine owner utility and expose obvious selector failure.

Rater: Justin primary.

Claim: personal utility only.

## 25. Phase 1 scale

Because token use is unconstrained:

- one champion;
- four challengers;
- at least two strategies;
- top two may receive one refinement;
- finalist pairwise tournament.

Execution remains sequential.

## 26. Phase 1 state matrix

- meaningful route;
- populated;
- empty;
- error/unavailable;
- mobile;
- desktop;
- critical interaction.

## 27. Phase 1 controls

- linear;
- selector;
- expected random;
- retain;
- human oracle.

## 28. Phase 1 metrics

- opportunity count/rate;
- promotion count/rate;
- correct promotions;
- false promotions;
- promotion recall;
- correct retentions;
- escalation count/rate;
- human ambiguity;
- reversal stability;
- uplift over random;
- uplift over retention;
- oracle gap;
- D versus C;
- protected regressions;
- human time.

Always show counts with percentages.

## 29. Phase 1 interpretation

Positive means not obviously broken and personally useful enough to continue. It does not establish production safety.

## 30. Phase 2 — External exploratory

Only after promising Phase 1.

Use unfamiliar tasks, reduced owner prompting, external raters, hidden method identity, randomized display, same gates/capture.

## 31. Rater interface

Per dimension:

- A materially better;
- B materially better;
- no material difference;
- unable to judge.

Also:

- replacement worth accepting?
- protected regression visible?

## 32. Human materiality rule

Candidate materially better for one rater when it wins at least two more dimensions, has no protected regression, and rater says replacement is worth accepting.

## 33. Three-rater aggregation

- 3 A → A;
- 2 A + 1 tie → A;
- 3 B → B;
- 2 B + 1 tie → B;
- all tie → tie;
- direct A/B split → human ambiguous.

Consensus-labeled comparisons feed confusion metrics.

## 34. Rater limitations

Report agreement, ambiguity, rater trends, and tie frequency. Three raters do not eliminate preference noise.

## 35. Phase 3 — Confirmatory

Freeze prompts, metrics, aggregation, thresholds; use new tasks/raters; preregister analysis.

The first pilot is exploratory, not preregistered.

## 36. Generator confound

Manual candidate preparation tests curated candidates. It does not prove safe autonomous generation. State this in every result.

## 37. Adversarial candidate phase

Inject:

- mobile regression;
- lost empty state;
- fabricated metric;
- duplicated logic;
- excessive patch;
- visual novelty with worse task clarity;
- intermittent crash.

Gates and selector must reject.

## 38. Usage record

```ts
interface InferenceUsage {
  provider: string;
  agent: string;
  model: string | null;
  purpose:
    | "generation"
    | "critique"
    | "selection"
    | "order_reversal"
    | "tie_break";
  inputTokens: number | null;
  outputTokens: number | null;
  cachedInputTokens: number | null;
  subscriptionUnits: number | null;
  reportedCostUsd: number | null;
  policySnapshot: string;
}
```

Unknown stays null.

## 39. Vendor snapshot

Store date, provider, auth mode, plan, known policy, source note, uncertainty.

## 40. Preference ledger

Not required for first proof. Later preferences are project-scoped, contextual, inspectable, and subordinate to hard gates.

## 41. Convergence

Stop expansion when:

- two generations fail to improve;
- judges repeatedly disagree;
- candidates repeat rejected patterns;
- protected regressions increase;
- human says preference-level only;
- configured depth reached.

## 42. Fatal exploratory outcomes

Independent stop reasons:

- selector loses to linear;
- selector does not beat random;
- recurring false promotions;
- near-total escalation;
- human ambiguity dominates;
- oracle shows little headroom;
- operational instability prevents valid evidence;
- outside raters reject owner-only effect.

## 43. Unpromising outcomes

- safe but inert;
- selector overhead adds little;
- random similar;
- generator supplies almost all value;
- gains inconsistent.

## 44. Promising Phase 1

- selector beats linear on owner preference;
- uplift over random;
- promotes some preferred challengers;
- no obvious recurring false promotion;
- escalation not constant;
- workflow reliable.

## 45. Small-sample caveat

Pilot cannot certify low false-promotion probability. Use “not obviously broken under this limited sample,” never “safe for autonomous use.”

## 46. Experiment model

```ts
interface ExperimentResult {
  conditions: ConditionResult[];
  candidateSet: CandidateSummary[];
  humanRatings: HumanRating[];
  automatedDecisions: AutomatedDecision[];
  controls: ControlResult[];
  metrics: ExperimentMetrics;
  usage: InferenceUsage[];
  limitations: string[];
}
```

## 47. Tests

- `EVAL-001`: random uses same eligible set.
- `EVAL-002`: retain chooses champion.
- `EVAL-003`: hard-gate failure cannot promote.
- `EVAL-004`: reversal conflict escalates under strict policy.
- `EVAL-005`: tie remains tie.
- `EVAL-006`: protected regression vetoes.
- `EVAL-007`: counts accompany rates.
- `EVAL-008`: unknown usage null.
- `EVAL-009`: ambiguous humans excluded from consensus matrix.
- `EVAL-010`: C and D share X0.
- `EVAL-011`: selection usage in total cost.
- `EVAL-012`: oracle marked nondeployable.

## 48. Open items

- `OPEN-EVAL-001`: initial judge ensemble.
- `OPEN-EVAL-002`: evidence citation schema.
- `OPEN-EVAL-003`: Phase 1 strategies.
- `OPEN-EVAL-004`: external rater path.
- `OPEN-EVAL-005`: quality encoding for uplift.
