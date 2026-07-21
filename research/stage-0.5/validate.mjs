#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { validateExperimentManifest, validateTaskResult } from "./kit-core.mjs";

function parseArgs(argv) {
  const options = { experiment: null, json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--experiment") {
      index += 1;
      options.experiment = argv[index] ?? null;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`Stage 0.5 validation\n\nUsage:\n  node research/stage-0.5/validate.mjs --experiment <directory> [--json]`);
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

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = path.resolve(options.experiment);
  const manifest = await readJson(path.join(root, "experiment.json"));
  const issues = validateExperimentManifest(manifest).map((issue) => ({ file: "experiment.json", ...issue }));

  for (const taskId of manifest.taskIds ?? []) {
    const relative = path.join("tasks", taskId, "task-result.json");
    try {
      const result = await readJson(path.join(root, relative));
      validateTaskResult(result, manifest).forEach((issue) => issues.push({ file: relative, ...issue }));
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
  }

  if (options.json) {
    console.log(JSON.stringify({ ok: issues.length === 0, issueCount: issues.length, issues }, null, 2));
  } else if (issues.length === 0) {
    console.log("Stage 0.5 records are structurally valid.");
  } else {
    console.error(`Stage 0.5 validation failed with ${issues.length} issue(s):`);
    for (const issue of issues) {
      console.error(`- [${issue.code}] ${issue.file}${issue.path}: ${issue.message}`);
    }
  }
  process.exitCode = issues.length === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 2;
});
