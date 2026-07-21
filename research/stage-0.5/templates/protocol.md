# Stage 0.5 Protocol Snapshot

**Experiment:** `exp05_<opaque-id>`  
**Frozen at:** `<UTC timestamp>`  
**Contract commit:** `<Git commit containing docs/STAGE-0.5-HYPOTHESIS-EXPERIMENT.md>`

> Stage 0.5 does not implement or prove Render Rivals production containment, durability, recovery, authentication, migration, packaging, or release security.

## Frozen choices

- task-selection rule: `<rule>`
- invalid-task replacement rule: `<rule>`
- evaluator identity: `<provider / adapter / model>`
- evaluator prompt hash: `sha256:<64 lowercase hexadecimal characters>`
- capture environment: `<exact Node / Playwright / Chromium / locale / timezone>`
- human rater: `<actor>`
- randomization method: `<method>`
- metric implementation commit: `<commit>`

## Deviations

Record deviations only in `analysis/deviations.json`. Thresholds, task selection, evaluator, prompt, factors, capture conditions, and human-rating rules cannot be changed under the same experiment ID after freezing.
