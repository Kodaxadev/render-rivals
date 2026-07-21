const EXPERIMENT_SCHEMA = "render-rivals/stage-0.5-experiment";
const TASK_RESULT_SCHEMA = "render-rivals/stage-0.5-task-result";

export const HUMAN_VERDICTS = new Set([
  "current_materially_better",
  "contender_materially_better",
  "no_material_difference",
  "unable_to_judge",
  "invalid_comparison",
]);

export const SELECTOR_OUTCOMES = new Set([
  "recommend_contender",
  "retain_current",
  "tie",
  "human_review_required",
  "invalid_task",
]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasPlaceholder(value) {
  if (typeof value === "string") {
    return /<[^>]+>|\bTODO\b|\bTBD\b|replace[-_ ]me/i.test(value);
  }
  if (Array.isArray(value)) return value.some(hasPlaceholder);
  if (isRecord(value)) return Object.values(value).some(hasPlaceholder);
  return false;
}

function addIssue(issues, code, path, message) {
  issues.push({ code, path, message });
}

function requireString(issues, value, path) {
  if (typeof value !== "string" || value.trim() === "") {
    addIssue(issues, "REQUIRED_STRING", path, "Expected a non-empty string.");
    return false;
  }
  return true;
}

function requireNumber(issues, value, path, { min = -Infinity, max = Infinity } = {}) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    addIssue(
      issues,
      "REQUIRED_NUMBER",
      path,
      `Expected a finite number between ${min} and ${max}.`,
    );
    return false;
  }
  return true;
}

function requireTimestamp(issues, value, path) {
  if (!requireString(issues, value, path)) return false;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed) || !value.endsWith("Z")) {
    addIssue(issues, "TIMESTAMP_INVALID", path, "Expected an RFC 3339 UTC timestamp ending in Z.");
    return false;
  }
  return true;
}

function requireSha256(issues, value, path) {
  if (!requireString(issues, value, path)) return false;
  if (!/^sha256:[0-9a-f]{64}$/.test(value)) {
    addIssue(issues, "SHA256_INVALID", path, "Expected sha256: followed by 64 lowercase hexadecimal characters.");
    return false;
  }
  return true;
}

export function validateExperimentManifest(manifest) {
  const issues = [];
  if (!isRecord(manifest)) {
    return [{ code: "EXPERIMENT_NOT_OBJECT", path: "$", message: "Experiment manifest must be an object." }];
  }

  if (manifest.schema !== EXPERIMENT_SCHEMA) {
    addIssue(issues, "EXPERIMENT_SCHEMA_INVALID", "$.schema", `Expected ${EXPERIMENT_SCHEMA}.`);
  }
  if (manifest.schemaVersion !== "1.0.0") {
    addIssue(issues, "EXPERIMENT_VERSION_INVALID", "$.schemaVersion", "Expected schemaVersion 1.0.0.");
  }
  requireString(issues, manifest.experimentId, "$.experimentId");
  if (typeof manifest.experimentId === "string" && !/^exp05_[A-Za-z0-9._-]+$/.test(manifest.experimentId)) {
    addIssue(issues, "EXPERIMENT_ID_INVALID", "$.experimentId", "Expected exp05_ followed by an opaque identifier.");
  }
  requireTimestamp(issues, manifest.createdAt, "$.createdAt");
  requireString(issues, manifest.owner, "$.owner");

  if (manifest.status !== "frozen") {
    addIssue(issues, "EXPERIMENT_NOT_FROZEN", "$.status", "Analysis requires status=frozen.");
  }
  if (hasPlaceholder(manifest)) {
    addIssue(issues, "EXPERIMENT_PLACEHOLDER", "$", "Frozen manifest contains a placeholder or TODO/TBD value.");
  }

  if (!Array.isArray(manifest.taskIds)) {
    addIssue(issues, "TASK_IDS_INVALID", "$.taskIds", "Expected an array of frozen task IDs.");
  } else {
    const unique = new Set(manifest.taskIds);
    if (unique.size !== manifest.taskIds.length) {
      addIssue(issues, "TASK_IDS_DUPLICATE", "$.taskIds", "Task IDs must be unique.");
    }
    manifest.taskIds.forEach((taskId, index) => requireString(issues, taskId, `$.taskIds[${index}]`));
  }

  requireNumber(issues, manifest.minimumValidTasks, "$.minimumValidTasks", { min: 1 });
  requireNumber(issues, manifest.targetValidTasks, "$.targetValidTasks", { min: 1 });
  requireNumber(issues, manifest.minimumOpportunityCases, "$.minimumOpportunityCases", { min: 0 });
  requireNumber(issues, manifest.selectorAgreementThreshold, "$.selectorAgreementThreshold", { min: 0, max: 1 });
  requireNumber(issues, manifest.maximumOrdinaryFalseRecommendations, "$.maximumOrdinaryFalseRecommendations", { min: 0 });
  requireNumber(issues, manifest.maximumProtectedRegressionRecommendations, "$.maximumProtectedRegressionRecommendations", { min: 0 });
  requireNumber(issues, manifest.maximumOrderConflictRate, "$.maximumOrderConflictRate", { min: 0, max: 1 });
  requireNumber(issues, manifest.minimumNetCorrectAdoptionsOverRetainCurrent, "$.minimumNetCorrectAdoptionsOverRetainCurrent", { min: 0 });

  if (
    typeof manifest.minimumValidTasks === "number" &&
    typeof manifest.targetValidTasks === "number" &&
    manifest.targetValidTasks < manifest.minimumValidTasks
  ) {
    addIssue(issues, "TARGET_BELOW_MINIMUM", "$.targetValidTasks", "targetValidTasks cannot be below minimumValidTasks.");
  }
  if (
    Array.isArray(manifest.taskIds) &&
    typeof manifest.minimumValidTasks === "number" &&
    manifest.taskIds.length < manifest.minimumValidTasks
  ) {
    addIssue(issues, "TASK_POOL_TOO_SMALL", "$.taskIds", "Frozen task pool cannot satisfy minimumValidTasks.");
  }

  if (!isRecord(manifest.evaluator)) {
    addIssue(issues, "EVALUATOR_INVALID", "$.evaluator", "Expected evaluator identity object.");
  } else {
    requireString(issues, manifest.evaluator.provider, "$.evaluator.provider");
    requireString(issues, manifest.evaluator.adapter, "$.evaluator.adapter");
    requireString(issues, manifest.evaluator.model, "$.evaluator.model");
    requireSha256(issues, manifest.evaluator.promptHash, "$.evaluator.promptHash");
  }

  if (!isRecord(manifest.captureEnvironment)) {
    addIssue(issues, "CAPTURE_ENVIRONMENT_INVALID", "$.captureEnvironment", "Expected capture environment object.");
  } else {
    for (const key of ["node", "playwright", "chromium", "locale", "timezone", "desktop", "mobile"]) {
      requireString(issues, manifest.captureEnvironment[key], `$.captureEnvironment.${key}`);
    }
  }

  return issues;
}

export function validateTaskResult(result, manifest) {
  const issues = [];
  if (!isRecord(result)) {
    return [{ code: "TASK_RESULT_NOT_OBJECT", path: "$", message: "Task result must be an object." }];
  }
  if (result.schema !== TASK_RESULT_SCHEMA) {
    addIssue(issues, "TASK_RESULT_SCHEMA_INVALID", "$.schema", `Expected ${TASK_RESULT_SCHEMA}.`);
  }
  if (result.schemaVersion !== "1.0.0") {
    addIssue(issues, "TASK_RESULT_VERSION_INVALID", "$.schemaVersion", "Expected schemaVersion 1.0.0.");
  }
  requireString(issues, result.taskId, "$.taskId");
  if (Array.isArray(manifest?.taskIds) && !manifest.taskIds.includes(result.taskId)) {
    addIssue(issues, "TASK_NOT_FROZEN", "$.taskId", "Task is not present in the frozen experiment taskIds.");
  }
  if (!new Set(["valid", "invalid"]).has(result.status)) {
    addIssue(issues, "TASK_STATUS_INVALID", "$.status", "Expected valid or invalid.");
  }
  requireString(issues, result.invalidReason ?? "not-applicable", "$.invalidReason");

  if (!HUMAN_VERDICTS.has(result.humanVerdict)) {
    addIssue(issues, "HUMAN_VERDICT_INVALID", "$.humanVerdict", "Unknown human verdict.");
  }
  if (!SELECTOR_OUTCOMES.has(result.selectorOutcome)) {
    addIssue(issues, "SELECTOR_OUTCOME_INVALID", "$.selectorOutcome", "Unknown selector outcome.");
  }
  for (const key of [
    "currentEligible",
    "contenderEligible",
    "modelEvaluated",
    "orderConflict",
    "protectedRegressionPresent",
    "protocolTrustworthy",
  ]) {
    if (typeof result[key] !== "boolean") {
      addIssue(issues, "BOOLEAN_REQUIRED", `$.${key}`, "Expected boolean.");
    }
  }

  requireTimestamp(issues, result.selectorCompletedAt, "$.selectorCompletedAt");
  requireTimestamp(issues, result.humanRatingCommittedAt, "$.humanRatingCommittedAt");
  requireTimestamp(issues, result.unblindedAt, "$.unblindedAt");
  const selectorAt = Date.parse(result.selectorCompletedAt);
  const ratingAt = Date.parse(result.humanRatingCommittedAt);
  const unblindAt = Date.parse(result.unblindedAt);
  if ([selectorAt, ratingAt, unblindAt].every(Number.isFinite)) {
    if (selectorAt > ratingAt) {
      addIssue(issues, "SELECTOR_AFTER_RATING", "$.selectorCompletedAt", "Selector result must be sealed before the human rating is committed.");
    }
    if (ratingAt > unblindAt) {
      addIssue(issues, "UNBLINDED_BEFORE_RATING", "$.unblindedAt", "Unblinding must occur after the human rating is committed.");
    }
  }

  if (result.status === "valid") {
    if (result.humanVerdict === "invalid_comparison") {
      addIssue(issues, "VALID_TASK_INVALID_VERDICT", "$.humanVerdict", "A valid task cannot have invalid_comparison verdict.");
    }
    if (!result.protocolTrustworthy) {
      addIssue(issues, "VALID_TASK_UNTRUSTWORTHY", "$.protocolTrustworthy", "A valid task must be protocol-trustworthy.");
    }
  }
  if (result.status === "invalid" && result.selectorOutcome !== "invalid_task") {
    addIssue(issues, "INVALID_TASK_SELECTOR_OUTCOME", "$.selectorOutcome", "Invalid task must use invalid_task selector outcome.");
  }
  if (!result.contenderEligible && result.selectorOutcome === "recommend_contender") {
    addIssue(issues, "INELIGIBLE_CONTENDER_RECOMMENDED", "$.selectorOutcome", "An ineligible Contender cannot be recommended.");
  }
  if (result.protectedRegressionPresent && result.selectorOutcome === "recommend_contender") {
    // This is permitted as recorded evidence of a failed selector, but it must remain visible to metrics.
  }
  if (result.modelEvaluated && (!result.currentEligible || !result.contenderEligible)) {
    addIssue(issues, "MODEL_EVALUATED_INELIGIBLE_PAIR", "$.modelEvaluated", "Model evaluation requires both implementations eligible.");
  }

  return issues;
}

function ratio(numerator, denominator) {
  return denominator === 0 ? null : numerator / denominator;
}

export function calculateMetrics(manifest, taskResults) {
  const manifestIssues = validateExperimentManifest(manifest);
  const resultIssues = [];
  const seen = new Set();
  for (const result of taskResults) {
    const issues = validateTaskResult(result, manifest);
    issues.forEach((issue) => resultIssues.push({ taskId: result?.taskId ?? null, ...issue }));
    if (seen.has(result?.taskId)) {
      resultIssues.push({ taskId: result?.taskId ?? null, code: "TASK_RESULT_DUPLICATE", path: "$.taskId", message: "Only one task-result.json is allowed per task." });
    }
    seen.add(result?.taskId);
  }

  const valid = taskResults.filter((item) => item.status === "valid" && validateTaskResult(item, manifest).length === 0);
  const invalid = taskResults.filter((item) => item.status !== "valid" || validateTaskResult(item, manifest).length > 0);
  const clear = valid.filter((item) =>
    item.humanVerdict === "current_materially_better" ||
    item.humanVerdict === "contender_materially_better"
  );
  const opportunities = valid.filter((item) => item.humanVerdict === "contender_materially_better");
  const selectorCorrect = clear.filter((item) =>
    (item.humanVerdict === "contender_materially_better" && item.selectorOutcome === "recommend_contender") ||
    (item.humanVerdict === "current_materially_better" && item.selectorOutcome === "retain_current")
  );
  const protectedFalse = valid.filter((item) =>
    item.selectorOutcome === "recommend_contender" && item.protectedRegressionPresent
  );
  const ordinaryFalse = valid.filter((item) =>
    item.selectorOutcome === "recommend_contender" &&
    item.humanVerdict === "current_materially_better" &&
    !item.protectedRegressionPresent
  );
  const correctContender = valid.filter((item) =>
    item.selectorOutcome === "recommend_contender" &&
    item.humanVerdict === "contender_materially_better" &&
    !item.protectedRegressionPresent
  );
  const missedContender = opportunities.filter((item) => item.selectorOutcome !== "recommend_contender");
  const modelEvaluated = valid.filter((item) => item.modelEvaluated);
  const orderConflicts = modelEvaluated.filter((item) => item.orderConflict);
  const protocolDefects = taskResults.filter((item) => !item.protocolTrustworthy && item.status === "valid");
  const falseRecommendations = ordinaryFalse.length + protectedFalse.length;
  const netCorrectAdoptions = correctContender.length - falseRecommendations;

  const metrics = {
    schema: "render-rivals/stage-0.5-metrics",
    schemaVersion: "1.0.0",
    experimentId: manifest?.experimentId ?? null,
    counts: {
      frozenTasks: Array.isArray(manifest?.taskIds) ? manifest.taskIds.length : 0,
      recordedTasks: taskResults.length,
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
      protocolDefects: protocolDefects.length,
      alwaysRetainCurrentClearPreferenceMatches: clear.filter((item) => item.humanVerdict === "current_materially_better").length,
    },
    rates: {
      opportunityRate: ratio(opportunities.length, valid.length),
      selectorAgreement: ratio(selectorCorrect.length, clear.length),
      orderConflictRate: ratio(orderConflicts.length, modelEvaluated.length),
      evidenceInvalidRate: ratio(invalid.length, taskResults.length),
    },
    utility: {
      formula: "correctContenderRecommendations - ordinaryFalseContenderRecommendations - protectedRegressionRecommendations",
      missedOpportunityPenalty: 0,
      netCorrectAdoptionsOverRetainCurrent: netCorrectAdoptions,
    },
    validation: {
      manifestIssues,
      taskResultIssues: resultIssues,
    },
  };

  const thresholdChecks = [
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
      passed: metrics.rates.selectorAgreement !== null && metrics.rates.selectorAgreement >= manifest.selectorAgreementThreshold,
      observed: metrics.rates.selectorAgreement,
      required: manifest.selectorAgreementThreshold,
    },
    {
      id: "ordinary_false_recommendations",
      passed: ordinaryFalse.length <= manifest.maximumOrdinaryFalseRecommendations,
      observed: ordinaryFalse.length,
      required: manifest.maximumOrdinaryFalseRecommendations,
    },
    {
      id: "protected_regression_recommendations",
      passed: protectedFalse.length <= manifest.maximumProtectedRegressionRecommendations,
      observed: protectedFalse.length,
      required: manifest.maximumProtectedRegressionRecommendations,
    },
    {
      id: "order_conflict_rate",
      passed: metrics.rates.orderConflictRate !== null && metrics.rates.orderConflictRate <= manifest.maximumOrderConflictRate,
      observed: metrics.rates.orderConflictRate,
      required: manifest.maximumOrderConflictRate,
    },
    {
      id: "net_correct_adoptions",
      passed: netCorrectAdoptions >= manifest.minimumNetCorrectAdoptionsOverRetainCurrent,
      observed: netCorrectAdoptions,
      required: manifest.minimumNetCorrectAdoptionsOverRetainCurrent,
    },
    {
      id: "protocol_trustworthy",
      passed: manifestIssues.length === 0 && resultIssues.length === 0 && protocolDefects.length === 0,
      observed: manifestIssues.length + resultIssues.length + protocolDefects.length,
      required: 0,
    },
  ];

  return {
    metrics,
    thresholdChecks,
    quantitativeGate: thresholdChecks.every((item) => item.passed)
      ? "eligible_for_owner_decision"
      : valid.length < manifest.minimumValidTasks
        ? "inconclusive"
        : "thresholds_not_met",
  };
}
