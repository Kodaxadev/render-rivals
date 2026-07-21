#!/usr/bin/env node

import process from "node:process";

import { runConformance } from "./check-core.mjs";

export { runConformance };

function parseArgs(argv) {
  const options = { root: process.cwd(), json: false, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") options.json = true;
    else if (arg === "--root") {
      index += 1;
      if (!argv[index]) throw new Error("--root requires a path");
      options.root = argv[index];
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function printHelp() {
  console.log(`Render Rivals documentation conformance

Usage:
  node conformance/check.mjs [--root <path>] [--json]

Exit codes:
  0  repository conforms
  1  conformance issues found
  2  checker usage or execution failure`);
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }

    const issues = await runConformance({ root: options.root });
    if (options.json) {
      console.log(
        JSON.stringify(
          { ok: issues.length === 0, issueCount: issues.length, issues },
          null,
          2,
        ),
      );
    } else if (issues.length === 0) {
      console.log("Documentation conformance passed.");
    } else {
      console.error(`Documentation conformance failed with ${issues.length} issue(s):`);
      for (const item of issues) {
        const location = `${item.file}${item.line ? `:${item.line}` : ""}`;
        console.error(`- [${item.code}] ${location}: ${item.message}`);
      }
    }

    process.exitCode = issues.length === 0 ? 0 : 1;
  } catch (error) {
    console.error(
      `Conformance checker failed: ${
        error instanceof Error ? error.stack ?? error.message : String(error)
      }`,
    );
    process.exitCode = 2;
  }
}

await main();
