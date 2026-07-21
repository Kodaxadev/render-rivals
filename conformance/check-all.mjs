import path from "node:path";

import { runConformance as runCoreConformance } from "./check-core.mjs";
import { checkOperationStateTable } from "./check-operation-states.mjs";
import { checkStage05ResearchInventory } from "./check-stage05-research.mjs";

export async function runConformance({ root = process.cwd() } = {}) {
  const absoluteRoot = path.resolve(root);
  const [coreIssues, operationStateIssues, stage05Issues] = await Promise.all([
    runCoreConformance({ root: absoluteRoot }),
    checkOperationStateTable(absoluteRoot),
    checkStage05ResearchInventory(absoluteRoot),
  ]);

  return [...coreIssues, ...operationStateIssues, ...stage05Issues].sort((left, right) =>
    `${left.file}:${left.line ?? 0}:${left.code}`.localeCompare(
      `${right.file}:${right.line ?? 0}:${right.code}`,
    ),
  );
}
