import {
  HUMAN_VERDICTS,
  SELECTOR_OUTCOMES,
  validateExperimentManifest as validateBaseExperiment,
  validateTaskResult as validateBaseTaskResult,
} from "./kit-core.mjs";

export { HUMAN_VERDICTS, SELECTOR_OUTCOMES };

// Frozen defaults from docs/STAGE-0.5-HYPOTHESIS-EXPERIMENT.md.
//
// ADR-0013 lets an experiment be stricter than the contract but never weaker.
// Freezing a manifest is not by itself a protection: a frozen manifest holding
// trivially passable thresholds still clears the quantitative gate on a sample
// that demonstrates nothing, and the person most able to relax a threshold is
// the sole owner running the experiment.
export const STAGE05_DEFAULT_THRESHOLDS = Object.freeze({
  minimumValidTasks: 8,
  targetValidTasks: 12,
  minimumOpportunityCases: 4,
  selectorAgreementThreshold: 0.75,
  maximumOrdinaryFalseRecommendations: 1,
  maximumProtectedRegressionRecommendations: 0,
  maximumOrderConflictRate: 0.25,
  minimumNetCorrectAdoptionsOverRetainCurrent: 2,
});

// Fields where a larger value is stricter; the rest are ceilings where a
// smaller value is stricter.
const FLOOR_FIELDS = new Set([
  "minimumValidTasks",
  "targetValidTasks",
  "minimumOpportunityCases",
  "selectorAgreementThreshold",
  "minimumNetCorrectAdoptionsOverRetainCurrent",
]);

export const DECISION_VALUES = new Set(["proceed", "pivot", "stop", "inconclusive"]);

function issue(code, path, message) {
  return { code, path, message };
}

function instant(value) {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function validateExperimentManifest(manifest) {
  const issues = [...validateBaseExperiment(manifest)];
  for (const [field, fallback] of Object.entries(STAGE05_DEFAULT_THRESHOLDS)) {
    const value = manifest?.[field];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    const weaker = FLOOR_FIELDS.has(field) ? value < fallback : value > fallback;
    if (weaker) {
      issues.push(
        issue(
          "THRESHOLD_WEAKER_THAN_DEFAULT",
          `$.${field}`,
          `${field} is ${value}, weaker than the contract default ${fallback}. An experiment may be stricter than docs/STAGE-0.5-HYPOTHESIS-EXPERIMENT.md but never weaker.`,
        ),
      );
    }
  }
  return issues;
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

  // ADR-0013: thresholds may not be relaxed after results are known. A manifest
  // written once outcomes were visible defeats every frozen threshold, and the
  // records already carry enough timestamps to detect it.
  const frozenAt = instant(manifest?.createdAt);
  const observations = [];
  for (const result of taskResults) {
    for (const field of ["selectorCompletedAt", "humanRatingCommittedAt", "unblindedAt"]) {
      const at = instant(result?.[field]);
      if (at !== null) observations.push({ taskId: result?.taskId ?? null, field, at });
    }
  }
  const earliest = observations.reduce(
    (lowest, item) => (lowest === null || item.at < lowest.at ? item : lowest),
    null,
  );
  if (frozenAt !== null && earliest !== null && earliest.at < frozenAt) {
    resultIssues.push({
      taskId: earliest.taskId,
      code: "EXPERIMENT_FROZEN_AFTER_OBSERVATION",
      path: "$.createdAt",
      message: `Experiment createdAt ${manifest.createdAt} is later than the earliest observation (${earliest.field}). Thresholds must be frozen before any evaluator result or human rating is observed.`,
    });
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

// ADR-0013 makes a valid `proceed` record the gate that opens production
// Stage 1, so the decision record is validated like any other canonical
// artifact. The analyzer deliberately never writes this file; the owner does.
export function validateDecision(decision, manifest, report) {
  const issues = [];

  if (decision?.schema !== "render-rivals/stage-0.5-decision") {
    issues.push(issue("DECISION_SCHEMA_INVALID", "$.schema", "Decision must use the render-rivals/stage-0.5-decision schema."));
  }
  if (typeof decision?.experimentId !== "string" || decision.experimentId.trim() === "") {
    issues.push(issue("DECISION_EXPERIMENT_ID_REQUIRED", "$.experimentId", "Decision must identify its experiment."));
  } else if (manifest?.experimentId && decision.experimentId !== manifest.experimentId) {
    issues.push(issue("DECISION_EXPERIMENT_MISMATCH", "$.experimentId", "Decision belongs to another experiment."));
  }
  if (!DECISION_VALUES.has(decision?.decision)) {
    issues.push(
      issue(
        "DECISION_VALUE_INVALID",
        "$.decision",
        `Decision must be one of ${[...DECISION_VALUES].join(", ")}.`,
      ),
    );
  }

  const decidedAt = instant(decision?.decidedAt);
  if (decidedAt === null) {
    issues.push(issue("DECISION_TIMESTAMP_INVALID", "$.decidedAt", "Decision requires a valid UTC timestamp."));
  }
  for (const field of ["decidedBy", "ownerValueJudgment", "rationale"]) {
    const value = decision?.[field];
    if (typeof value !== "string" || value.trim() === "") {
      issues.push(issue("DECISION_FIELD_REQUIRED", `$.${field}`, `${field} must be a non-empty explicit statement.`));
    } else if (/^<.*>$/.test(value.trim())) {
      issues.push(issue("DECISION_PLACEHOLDER", `$.${field}`, `${field} still contains a template placeholder.`));
    }
  }

  // The owner may always decide more conservatively than the metrics. Only
  // `proceed` is constrained, because only `proceed` opens Stage 1.
  if (decision?.decision === "proceed") {
    if (!report) {
      issues.push(issue("DECISION_REPORT_REQUIRED", "$.decision", "A proceed decision requires the computed metric report."));
    } else if (report.quantitativeGate !== "eligible_for_owner_decision") {
      issues.push(
        issue(
          "DECISION_PROCEED_WITHOUT_GATE",
          "$.decision",
          `Quantitative gate is ${report.quantitativeGate}; proceed requires eligible_for_owner_decision. Overriding this requires a new accepted ADR that overturns ADR-0013.`,
        ),
      );
    }
  }

  return issues;
}
