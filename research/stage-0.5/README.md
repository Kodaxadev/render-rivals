# Stage 0.5 Research Kit

This directory operationalizes [`docs/STAGE-0.5-HYPOTHESIS-EXPERIMENT.md`](../../docs/STAGE-0.5-HYPOTHESIS-EXPERIMENT.md) without implementing the production Render Rivals runtime.

It is deliberately small, dependency-free, and research-only. It does not provide process containment, crash-safe storage, authenticated APIs, migrations, packaging, or source adoption.

## Files

- `kit-core.mjs` — validates frozen experiment/task summaries and calculates metrics.
- `validate.mjs` — validates one experiment directory.
- `analyze.mjs` — calculates frozen metrics and optionally writes `analysis/metrics.json` and `analysis/metrics.md`.
- `kit.test.mjs` — verifies thresholds, false-recommendation vetoes, order conflict, blinding chronology, and ineligible-Contender behavior.
- `templates/` — copy-only starting records. Templates contain placeholders and are intentionally invalid until completed and frozen.

## Start an experiment

1. Create `research/stage-0.5/runs/<experiment-id>/` locally. Completed experiment records may be committed later, but raw private screenshots, cookies, secrets, environment files, or unrelated source files must not enter Git.
2. Copy `templates/experiment.json` to `experiment.json`.
3. Copy `templates/task-selection.json` to `task-selection.json`.
4. Copy `templates/protocol.md` to `protocol.md`.
5. Select the entire task pool before observing evaluator or human outcomes.
6. Replace every placeholder with exact values.
7. Set both experiment and task-selection status to `frozen`.
8. Record the exact contract and metric implementation commits in `protocol.md`.
9. Run validation before the first evaluator result or human rating.

```text
node research/stage-0.5/validate.mjs --experiment research/stage-0.5/runs/<experiment-id>
```

A frozen manifest containing `<placeholder>`, `TODO`, `TBD`, or `replace-me` values is rejected.

## Per-task records

Create `tasks/<task-id>/` and copy the relevant templates:

```text
task.json
eligibility.json
evaluator-packet-a-b.json
evaluator-packet-b-a.json
evaluator-a-b.json
evaluator-b-a.json
selector-result.json
human-rating.blinded.json
unblinding.json
task-result.json
```

The summary `task-result.json` is written only after the selector result, blinded human rating, and unblinding records exist. Its timestamps must satisfy:

```text
selectorCompletedAt <= humanRatingCommittedAt <= unblindedAt
```

A task marked valid must be protocol-trustworthy. An ineligible Contender cannot be recommended or sent to the model evaluator.

## Analyze

```text
node research/stage-0.5/analyze.mjs \
  --experiment research/stage-0.5/runs/<experiment-id> \
  --write
```

The analyzer reports raw counts, rates, utility, validation defects, and every frozen threshold. It never writes `decision.json` and never emits `proceed` automatically.

`eligible_for_owner_decision` means only that quantitative thresholds passed. The owner must still judge whether the workflow produced enough value to justify the production cost and record one of:

- `proceed`;
- `pivot`;
- `stop`;
- `inconclusive`.

## Utility rule in v1

The v1 kit computes:

```text
correct Contender recommendations
- ordinary false Contender recommendations
- protected-regression Contender recommendations
```

The missed-opportunity penalty is frozen at zero. Introducing another penalty changes the metric protocol and requires a new experiment ID or a contract amendment before outcomes are observed.

## Tests

```text
node --test research/stage-0.5/kit.test.mjs
```

The tests cover:

- placeholder rejection;
- a quantitatively passing sample;
- insufficient valid sample;
- excessive ordinary false recommendations;
- zero-tolerance protected-regression recommendation;
- excessive order conflict;
- blinding chronology;
- ineligible-Contender recommendation rejection.

## First-run checklist

Before freezing:

- exact evaluator provider, adapter, model/version, and prompt hash recorded;
- exact Node, Playwright, Chromium, locale, timezone, and viewports recorded;
- 12 target tasks selected with at least 8 capable of remaining valid;
- task diversity and replacement rules recorded;
- protected-regression lists written before Contender review;
- randomization method chosen;
- evidence packet and rating instructions frozen;
- owner and decision authority named;
- conformance and research-kit tests green on Windows and Linux.

Before deciding:

- every invalidated task retained with reason;
- no selector result shown before human rating commit;
- A/B and B/A results retained;
- raw counts reviewed rather than only rates;
- protocol deviations reviewed;
- owner-value judgment written separately from threshold math;
- `decision.json` cites `analysis/metrics.json` and names a bounded next action.
