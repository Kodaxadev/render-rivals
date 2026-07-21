import { readFile } from "node:fs/promises";
import path from "node:path";

function extractStringUnion(source, typeName) {
  const escaped = typeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`export\\s+type\\s+${escaped}\\s*=([\\s\\S]*?);`));
  if (!match) return [];
  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

function sorted(values) {
  return [...new Set(values)].sort();
}

function sameMembers(left, right) {
  return JSON.stringify(sorted(left)) === JSON.stringify(sorted(right));
}

function extractSection(markdown, heading, nextHeading) {
  const start = markdown.indexOf(heading);
  if (start < 0) return "";
  const end = markdown.indexOf(nextHeading, start + heading.length);
  return end < 0 ? markdown.slice(start) : markdown.slice(start, end);
}

export async function checkOperationStateTable(root) {
  const apiTypes = await readFile(path.join(root, "schemas/api-types.ts"), "utf8");
  const operationTypes = await readFile(
    path.join(root, "schemas/operation-types.ts"),
    "utf8",
  );
  const spec17 = await readFile(
    path.join(root, "spec/17-local-api-envelopes-operations-and-pagination.md"),
    "utf8",
  );

  const apiStates = extractStringUnion(apiTypes, "ApiOperationState");
  const ledgerStates = extractStringUnion(operationTypes, "OperationState");
  const section = extractSection(
    spec17,
    "## 8. Operation status route",
    "## 9. Query response envelope",
  );
  const tableStates = [...section.matchAll(/^\|\s*`([^`]+)`\s*\|/gm)].map(
    (match) => match[1],
  );

  const issues = [];
  if (!sameMembers(apiStates, ledgerStates) || !sameMembers(apiStates, tableStates)) {
    issues.push({
      caseId: "DOC-OPERATION-STATE-TABLE-DRIFT",
      code: "OPERATION_STATE_REGISTRY_DRIFT",
      file: "spec/17-local-api-envelopes-operations-and-pagination.md",
      line: null,
      message:
        "ApiOperationState, OperationState, and the spec/17 status table must contain the same closed state set.",
      details: {
        apiStates: sorted(apiStates),
        ledgerStates: sorted(ledgerStates),
        tableStates: sorted(tableStates),
      },
    });
  }

  for (const required of ["reconciling", "interrupted"]) {
    if (!tableStates.includes(required)) {
      issues.push({
        caseId: "DOC-OPERATION-STATE-TABLE-DRIFT",
        code: "OPERATION_RECOVERY_STATE_MISSING",
        file: "spec/17-local-api-envelopes-operations-and-pagination.md",
        line: null,
        message: `spec/17 operation table is missing ${required}.`,
        details: { required },
      });
    }
  }

  if (!/`interrupted`[\s\S]{0,240}nonterminal/i.test(section)) {
    issues.push({
      caseId: "DOC-OPERATION-STATE-TABLE-DRIFT",
      code: "OPERATION_INTERRUPTED_TERMINALITY_UNCLEAR",
      file: "spec/17-local-api-envelopes-operations-and-pagination.md",
      line: null,
      message:
        "spec/17 must state that interrupted is nonterminal and requires reconciliation or terminal classification.",
      details: null,
    });
  }

  return issues;
}
