import {
  HUMAN_VERDICTS,
  SELECTOR_OUTCOMES,
  validateExperimentManifest as validateBaseExperiment,
  validateTaskResult as validateBaseTaskResult,
} from "./kit-core.mjs";

export { HUMAN_VERDICTS, SELECTOR_OUTCOMES };

export function validateExperimentManifest(manifest) {
  return validateBaseExperiment(manifest);
}

function issue(code, path, message) {
  return { code, path, message };
}

export function validateTaskResult(result, manifest) {
  const issues = [...validateBaseTaskResult(result, manifest)];
  if (typeof result?.experimentId !== "string" || result.experimentId.trim() === "") {
    issues.push(issue("TASK_EXPERIMENT_ID_REQUIRED", "$.experimentId", "Task result must identify its experiment."));
  } else if (result.experimentId !== manifest?.experimentId) {
    issues.push(issue("TASK_EXPERIMENT_MISMATCH", "$.experimentId", "Task result belongs to another experiment."));
  }
  if (result?.status === "invalid" && (typeof result.invalidReason !== "string" || result.invalidReason.trim() === "")) {
    issues.push(issue("INVALID_REASON_REQUIRED", "$.invalidReason", "Invalid task requires a non-empty invalidReason."));
  }
  if (result?.status === "valid" && result.currentEligible !== true) {
    issues.push(issue("VALID_TASK_CURRENT_INELIGIBLE", "$.currentEligible", "A broken or ineligible current implementation invalidates the task."));
  }
  if (
    result?.status === "valid" &&
    result.currentEligible === true &&
    result.contenderEligible === true &&
    result.modelEvaluated !== true
  ) {
    issues.push(issue("ELIGIBLE_PAIR_NOT_EVALUATED", "$.modelEvaluated", "A valid eligible pair requires both A/B and B/A evaluator passes."));
  }
  if (result?.status === "valid" && result.selectorOutcome === "invalid_task") {
    issues.push(issue("VALID_TASK_INVALID_SELECTOR_OUTCOME", "$.selectorOutcome", "A valid task cannot use invalid_task selector outcome."));
  }
  return issues;
}

function ratio(numerator, denominator) {
  return denominator === 0 ? null : numerator / denominator;
}

export function calculateMetrics(manifest, taskResults) {
  const manifestIssues = validateExperimentManifest(manifest);
  const resultIssues = [];
  const validationByResult = new Map();
  const seen = new Set();

  for (const result of taskResults) {
    const issues = validateTaskResult(result, manifest);
    validationByResult.set(result, issues);
    issues.forEach((item) => resultIssues.push({ taskId: result?.taskId ?? null, ...item }));
    if (seen.has(result?.taskId)) {
      resultIssues.push({
        taskId: result?.taskId ?? null,
        code: "TASK_RESULT_DUPLICATE",
        path: "$.taskId",
        message: "Only one task-result.json is allowed per task.",
      });
    }
    seen.add(result?.taskId);
  }

  const valid = taskResults.filter(
    (item) => item.status === "valid" && (validationByResult.get(item)?.length ?? 0) === 0,
  );
  const invalid = taskResults.filter(
    (item) => item.status !== "valid" || (validationByResult.get(item)?.length ?? 0) > 0,
  );
  const clear = valid.filter(
    (item) =>
      item.humanVerdict === "current_materially_better" ||
      item.humanVerdict === "contender_materially_better",
  );
  const opportunities = valid.filter(
    (item) => item.humanVerdict === "contender_materially_better",
  );
  const selectorCorrect = clear.filter(
    (item) =>
      (item.humanVerdict === "contender_materially_better" &&
        item.selectorOutcome === "recommend_contender" &&
        !item.protectedRegressionPresent) ||
      (item.humanVerdict === "current_materially_better" &&
        item.selectorOutcome === "retain_current"),
  );
  const protectedFalse = valid.filter(
    (item) =>
      item.selectorOutcome === "recommend_contender" &&
      item.protectedRegressionPresent,
  );
  const ordinaryFalse = valid.filter(
    (item) =>
      item.selectorOutcome === "recommend_contender" &&
      item.humanVerdict === "current_materially_better" &&
      !item.protectedRegressionPresent,
  );
  const correctContender = valid.filter(
    (item) =>
      item.selectorOutcome === "recommend_contender" &&
      item.humanVerdict === "contender_materially_better" &&
      !item.protectedRegressionPresent,
  );
  const missedContender = opportunities.filter(
    (item) => item.selectorOutcome !== "recommend_contender",
  );
  const modelEvaluated = valid.filter((item) => item.modelEvaluated);
  const orderConflicts = modelEvaluated.filter((item) => item.orderConflict);
  const falseRecommendations = ordinaryFalse.length + protectedFalse.length;
  const netCorrectAdoptions = correctContender.length - falseRecommendations;
  const frozenTasks = Array.isArray(manifest?.taskIds) ? manifest.taskIds.length : 0;
  const recordedFrozenTasks = new Set(
    taskResults.filter((item) => manifest?.taskIds?.includes(item.taskId)).map((item) => item.taskId),
  ).size;

  const metrics = {
    schema: "render-rivals/stage-0.5-metrics",
    schemaVersion: "1.0.0",
    experimentId: manifest?.experimentId ?? null,
    counts: {
      frozenTasks,
      recordedTasks: taskResults.length,
      recordedFrozenTasks,
      validTasks: valid.length,
      invalidTasks: invalid.length,
      clearPreferenceTasks: clear.length,
      opportunityCases: opportunities.length,
      selectorCorrect: selectorCorrect.length,
      ordinaryFalseContenderRecommendations: ordinaryFalse.length,
      protectedRegressionRecommendations: protectedFalse.length,
      correctContenderRecommendations: correctContender.length,
      missedContenderOpportunities: missedContender.length,
      modelEvaluatedEligibleTasks: modelEvaluated.length,
      orderConflicts: orderConflicts.length,
      alwaysRetainCurrentClearPreferenceMatches: clear.filter(
        (item) => item.humanVerdict === "current_materially_better",
      ).length,
    },
    rates: {
      opportunityRate: ratio(opportunities.length, valid.length),
      selectorAgreement: ratio(selectorCorrect.length, clear.length),
      orderConflictRate: ratio(orderConflicts.length, modelEvaluated.length),
      evidenceInvalidRate: ratio(invalid.length, taskResults.length),
    },
    utility: {
      formula:
        "correctContenderRecommendations - ordinaryFalseContenderRecommendations - protectedRegressionRecommendations",
      missedOpportunityPenalty: 0,
      netCorrectAdoptionsOverRetainCurrent: netCorrectAdoptions,
    },
    validation: { manifestIssues, taskResultIssues: resultIssues },
  };

  const thresholdChecks = [
    {
      id: "all_frozen_tasks_recorded",
      passed: frozenTasks > 0 && recordedFrozenTasks === frozenTasks,
      observed: recordedFrozenTasks,
      required: frozenTasks,
    },
    {
      id: "minimum_valid_tasks",
      passed: valid.length >= manifest.minimumValidTasks,
      observed: valid.length,
      required: manifest.minimumValidTasks,
    },
    {
      id: "minimum_opportunity_cases",
      passed: opportunities.length >= manifest.minimumOpportunityCases,
      observed: opportunities.length,
      required: manifest.minimumOpportunityCases,
    },
    {
      id: "selector_agreement",
      passed:
        metrics.rates.selectorAgreement !== null &&
        metrics.rates.selectorAgreement >= manifest.selectorAgreementThreshold,
      observed: metrics.rates.selectorAgreement,
      required: manifest.selectorAgreementThreshold,
    },
    {
      id: "ordinary_false_recommendations",
      passed:
        ordinaryFalse.length <= manifest.maximumOrdinaryFalseRecommendations,
      observed: ordinaryFalse.length,
      required: manifest.maximumOrdinaryFalseRecommendations,
    },
    {
      id: "protected_regression_recommendations",
      passed:
        protectedFalse.length <= manifest.maximumProtectedRegressionRecommendations,
      observed: protectedFalse.length,
      required: manifest.maximumProtectedRegressionRecommendations,
    },
    {
      id: "order_conflict_rate",
      passed:
        metrics.rates.orderConflictRate !== null &&
        metrics.rates.orderConflictRate <= manifest.maximumOrderConflictRate,
      observed: metrics.rates.orderConflictRate,
      required: manifest.maximumOrderConflictRate,
    },
    {
      id: "net_correct_adoptions",
      passed:
        netCorrectAdoptions >=
        manifest.minimumNetCorrectAdoptionsOverRetainCurrent,
      observed: netCorrectAdoptions,
      required: manifest.minimumNetCorrectAdoptionsOverRetainCurrent,
    },
    {
      id: "protocol_trustworthy",
      passed: manifestIssues.length === 0 && resultIssues.length === 0,
      observed: manifestIssues.length + resultIssues.length,
      required: 0,
    },
  ];

  return {
    metrics,
    thresholdChecks,
    quantitativeGate: thresholdChecks.every((item) => item.passed)
      ? "eligible_for_owner_decision"
      : valid.length < manifest.minimumValidTasks || recordedFrozenTasks < frozenTasks
        ? "inconclusive"
        : "thresholds_not_met",
  };
}
