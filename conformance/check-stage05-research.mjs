import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

function normalize(value) {
  return value.split(path.sep).join("/");
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function walk(root, relative = "research/stage-0.5") {
  const absolute = path.join(root, relative);
  if (!(await exists(absolute))) return [];
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "runs" || entry.name === "node_modules" || entry.name === ".git") continue;
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(root, child)));
    else if (entry.isFile()) files.push(normalize(child));
  }
  return files.sort();
}

function issue(code, message, details = null) {
  return {
    caseId: "DOC-STAGE05-RESEARCH-INVENTORY",
    code,
    file: "MANIFEST.json",
    line: null,
    message,
    details,
  };
}

export async function checkStage05ResearchInventory(root) {
  const manifest = JSON.parse(await readFile(path.join(root, "MANIFEST.json"), "utf8"));
  const listed = manifest.stage05Research;
  const issues = [];
  if (!Array.isArray(listed)) {
    return [issue("STAGE05_SECTION_MISSING", "MANIFEST.json must contain a stage05Research array.")];
  }

  const normalized = listed.map(normalize);
  const duplicates = [...new Set(normalized.filter((item, index) => normalized.indexOf(item) !== index))];
  for (const duplicate of duplicates) {
    issues.push(issue("STAGE05_PATH_DUPLICATE", `Stage 0.5 path is listed more than once: ${duplicate}`, { path: duplicate }));
  }

  const actual = await walk(root);
  const listedSet = new Set(normalized);
  const actualSet = new Set(actual);
  for (const item of listedSet) {
    if (!actualSet.has(item)) {
      issues.push(issue("STAGE05_PATH_MISSING", `Stage 0.5 inventory points to a missing file: ${item}`, { path: item }));
    }
  }
  for (const item of actualSet) {
    if (!listedSet.has(item)) {
      issues.push(issue("STAGE05_PATH_UNLISTED", `Stage 0.5 file is absent from MANIFEST.json: ${item}`, { path: item }));
    }
  }
  return issues;
}
