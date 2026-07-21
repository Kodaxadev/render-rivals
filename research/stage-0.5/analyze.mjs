#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { calculateMetrics } from "./kit-core.mjs";

function parseArgs(argv) {
  const options = { experiment: null, write: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--experiment") {
      index += 1;
      options.experiment = argv[index] ?? null;
    } else if (arg === "--write") {
      options.write = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`Stage 0.5 analysis\n\nUsage:\n  node research/stage-0.5/analyze.mjs --experiment <directory> [--write]`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!options.experiment) throw new Error("--experiment is required");
  return options;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function loadTaskResults(root, manifest) {
  const results = [];
  for (const taskId of manifest.taskIds ?? []) {
    const file = path.join(root, "tasks", taskId, "task-result.json");
    try {
      results.push(await readJson(file));
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return results;
}

function renderMarkdown(report) {
  const { metrics, thresholdChecks, quantitativeGate } = report;
  const lines = [
    "# Stage 0.5 Metrics",
    "",
    `**Experiment:** ${metrics.experimentId ?? "unknown"}`,
    `**Quantitative gate:** ${quantitativeGate}`,
    "",
    "## Counts",
    "",
    "| Metric | Value |",
    "|---|---:|",
    ...Object.entries(metrics.counts).map(([key, value]) => `| ${key} | ${value} |`),
    "",
    "## Rates",
    "",
    "| Metric | Value |",
    "|---|---:|",
    ...Object.entries(metrics.rates).map(([key, value]) => `| ${key} | ${value === null ? "n/a" : value.toFixed(4)} |`),
    "",
    "## Thresholds",
    "",
    "| Threshold | Pass | Observed | Required |",
    "|---|---|---:|---:|",
    ...thresholdChecks.map((item) => `| ${item.id} | ${item.passed ? "yes" : "no"} | ${item.observed ?? "n/a"} | ${item.required} |`),
    "",
    "## Decision boundary",
    "",
    "This report never emits `proceed`. `eligible_for_owner_decision` means only that the frozen quantitative checks passed. The owner must still record value judgment, limitations, and the final decision required by ADR-0013.",
    "",
  ];
  return `${lines.join("\n")}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = path.resolve(options.experiment);
  const manifest = await readJson(path.join(root, "experiment.json"));
  const results = await loadTaskResults(root, manifest);
  const report = calculateMetrics(manifest, results);
  const json = `${JSON.stringify(report, null, 2)}\n`;

  if (options.write) {
    const analysis = path.join(root, "analysis");
    await mkdir(analysis, { recursive: true });
    await writeFile(path.join(analysis, "metrics.json"), json, "utf8");
    await writeFile(path.join(analysis, "metrics.md"), renderMarkdown(report), "utf8");
  }

  process.stdout.write(json);
  process.exitCode = report.metrics.validation.manifestIssues.length === 0 &&
    report.metrics.validation.taskResultIssues.length === 0
    ? 0
    : 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 2;
});
