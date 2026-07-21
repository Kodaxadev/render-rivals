import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateMetrics,
  validateExperimentManifest,
  validateTaskResult,
} from "./kit.mjs";

const HASH = `sha256:${"a".repeat(64)}`;

function manifest(count = 8) {
  return {
    schema: "render-rivals/stage-0.5-experiment",
    schemaVersion: "1.0.0",
    experimentId: "exp05_test",
    createdAt: "2026-07-21T06:00:00.000Z",
    owner: "test-owner",
    taskIds: Array.from({ length: count }, (_, index) => `task-${index + 1}`),
    minimumValidTasks: 8,
    targetValidTasks: 12,
    minimumOpportunityCases: 4,
    selectorAgreementThreshold: 0.75,
    maximumOrdinaryFalseRecommendations: 1,
    maximumProtectedRegressionRecommendations: 0,
    maximumOrderConflictRate: 0.25,
    minimumNetCorrectAdoptionsOverRetainCurrent: 2,
    evaluator: {
      provider: "test-provider",
      adapter: "test-adapter",
      model: "test-model-v1",
      promptHash: HASH,
    },
    captureEnvironment: {
      node: "24.0.0",
      playwright: "1.0.0-test",
      chromium: "test-revision",
      locale: "en-US",
      timezone: "America/Los_Angeles",
      desktop: "1440x900@1",
      mobile: "390x844@1",
    },
    status: "frozen",
  };
}

function result(taskId, overrides = {}) {
  return {
    schema: "render-rivals/stage-0.5-task-result",
    schemaVersion: "1.0.0",
    experimentId: "exp05_test",
    taskId,
    status: "valid",
    invalidReason: null,
    currentEligible: true,
    contenderEligible: true,
    modelEvaluated: true,
    orderConflict: false,
    protectedRegressionPresent: false,
    protocolTrustworthy: true,
    humanVerdict: "current_materially_better",
    selectorOutcome: "retain_current",
    selectorCompletedAt: "2026-07-21T07:00:00.000Z",
    humanRatingCommittedAt: "2026-07-21T07:05:00.000Z",
    unblindedAt: "2026-07-21T07:06:00.000Z",
    ...overrides,
  };
}

function passingResults() {
  return Array.from({ length: 8 }, (_, index) =>
    index < 4
      ? result(`task-${index + 1}`, {
          humanVerdict: "contender_materially_better",
          selectorOutcome: "recommend_contender",
        })
      : result(`task-${index + 1}`),
  );
}

test("rejects placeholders in a frozen manifest", () => {
  const value = manifest();
  value.evaluator.model = "<model/version>";
  assert.ok(validateExperimentManifest(value).some((issue) => issue.code === "EXPERIMENT_PLACEHOLDER"));
});

test("passing sample becomes eligible for owner decision but never auto-proceed", () => {
  const report = calculateMetrics(manifest(), passingResults());
  assert.equal(report.quantitativeGate, "eligible_for_owner_decision");
  assert.equal(report.metrics.counts.validTasks, 8);
  assert.equal(report.metrics.counts.recordedFrozenTasks, 8);
  assert.equal(report.metrics.counts.opportunityCases, 4);
  assert.equal(report.metrics.rates.selectorAgreement, 1);
  assert.equal(report.metrics.utility.netCorrectAdoptionsOverRetainCurrent, 4);
  assert.ok(report.thresholdChecks.every((item) => item.passed));
});

test("missing frozen task records makes the experiment inconclusive", () => {
  const report = calculateMetrics(manifest(), passingResults().slice(0, 7));
  assert.equal(report.quantitativeGate, "inconclusive");
  assert.equal(report.thresholdChecks.find((item) => item.id === "all_frozen_tasks_recorded").passed, false);
  assert.equal(report.thresholdChecks.find((item) => item.id === "minimum_valid_tasks").passed, false);
});

test("ordinary false Contender recommendations block the gate", () => {
  const results = passingResults();
  results[4] = result("task-5", { selectorOutcome: "recommend_contender" });
  results[5] = result("task-6", { selectorOutcome: "recommend_contender" });
  const report = calculateMetrics(manifest(), results);
  assert.equal(report.quantitativeGate, "thresholds_not_met");
  assert.equal(report.metrics.counts.ordinaryFalseContenderRecommendations, 2);
});

test("one protected-regression recommendation blocks the gate and is not counted as agreement", () => {
  const results = passingResults();
  results[0] = result("task-1", {
    humanVerdict: "contender_materially_better",
    selectorOutcome: "recommend_contender",
    protectedRegressionPresent: true,
  });
  const report = calculateMetrics(manifest(), results);
  assert.equal(report.quantitativeGate, "thresholds_not_met");
  assert.equal(report.metrics.counts.protectedRegressionRecommendations, 1);
  assert.equal(report.metrics.rates.selectorAgreement, 7 / 8);
});

test("order conflict above the frozen maximum blocks the gate", () => {
  const results = passingResults();
  results[0].orderConflict = true;
  results[1].orderConflict = true;
  results[2].orderConflict = true;
  const report = calculateMetrics(manifest(), results);
  assert.equal(report.metrics.rates.orderConflictRate, 3 / 8);
  assert.equal(report.quantitativeGate, "thresholds_not_met");
});

test("blinding chronology is enforced", () => {
  const bad = result("task-1", {
    humanRatingCommittedAt: "2026-07-21T07:10:00.000Z",
    unblindedAt: "2026-07-21T07:09:00.000Z",
  });
  assert.ok(validateTaskResult(bad, manifest()).some((issue) => issue.code === "UNBLINDED_BEFORE_RATING"));
});

test("task results are bound to the frozen experiment", () => {
  const bad = result("task-1", { experimentId: "exp05_other" });
  assert.ok(validateTaskResult(bad, manifest()).some((issue) => issue.code === "TASK_EXPERIMENT_MISMATCH"));
});

test("an ineligible Contender cannot be recommended", () => {
  const bad = result("task-1", {
    contenderEligible: false,
    modelEvaluated: false,
    selectorOutcome: "recommend_contender",
  });
  assert.ok(validateTaskResult(bad, manifest()).some((issue) => issue.code === "INELIGIBLE_CONTENDER_RECOMMENDED"));
});
