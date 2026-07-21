import path from "node:path";

import { runConformance as runCoreConformance } from "./check-core.mjs";
import { checkOperationStateTable } from "./check-operation-states.mjs";

export async function runConformance({ root = process.cwd() } = {}) {
  const absoluteRoot = path.resolve(root);
  const [coreIssues, operationStateIssues] = await Promise.all([
    runCoreConformance({ root: absoluteRoot }),
    checkOperationStateTable(absoluteRoot),
  ]);

  return [...coreIssues, ...operationStateIssues].sort((left, right) =>
    `${left.file}:${left.line ?? 0}:${left.code}`.localeCompare(
      `${right.file}:${right.line ?? 0}:${right.code}`,
    ),
  );
}
