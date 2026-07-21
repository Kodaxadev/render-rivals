#!/usr/bin/env node

import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const INVENTORY_KEYS = [
  "canonicalSpecifications",
  "canonicalSharedSources",
  "acceptedArchitectureDecisions",
  "implementationContracts",
  "productAndPublicPlanning",
  "schemaSurface",
  "conformance",
  "sourceVerification",
  "brand",
  "historicalArchive",
  "repositoryEntryDocuments",
];

const MANAGED_ROOTS = [
  "spec",
  "adr",
  "docs",
  "schemas",
  "sources",
  "archive",
  "brand",
  "conformance",
  "security",
];

const ROOT_DOCUMENTS = [
  "README.md",
  "DOCUMENT-MANIFEST.md",
  "MANIFEST.json",
  "LICENSE-TBD.md",
];

const EXPECTED_FIXTURE_CASES = new Set([
  "DOC-RUN-STATE-EXPORTING",
  "DOC-INVENTORY-MISSING-NEW-FILES",
  "DOC-ARCHIVE-PHANTOM-FILES",
  "DOC-ARCHIVE-FALSE-PRESERVATION-CLAIM",
  "DOC-API-INVENTORY-DRIFT",
  "DOC-CLI-PROMOTE-OMITTED",
  "DOC-STALE-SPEC-RANGE",
  "DOC-WINDOWS-TARGET-DRIFT",
  "DOC-BRAND-BROKEN-LINK",
  "DOC-UI-PREAUTH-ROUTE-AMBIGUITY",
]);

function normalizePath(value) {
  return value.split(path.sep).join("/").replace(/^\.\//, "");
}

function lineNumber(text, index) {
  return text.slice(0, index).split("\n").length;
}

function makeIssue(caseId, code, file, message, details = null, line = null) {
  return { caseId, code, file, line, message, details };
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(root, relative = "") {
  const absolute = path.join(root, relative);
  if (!(await exists(absolute))) return [];
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const child = relative ? path.join(relative, entry.name) : entry.name;
    if (entry.isDirectory()) files.push(...(await walkFiles(root, child)));
    else if (entry.isFile()) files.push(normalizePath(child));
  }
  return files;
}

async function listManagedFiles(root) {
  const files = [];
  for (const managedRoot of MANAGED_ROOTS) {
    files.push(...(await walkFiles(root, managedRoot)));
  }
  for (const document of ROOT_DOCUMENTS) {
    if (await exists(path.join(root, document))) files.push(document);
  }
  return [...new Set(files)].sort();
}

async function readText(root, relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

function extractSection(markdown, heading) {
  const start = markdown.indexOf(heading);
  if (start < 0) return "";
  const searchStart = start + heading.length;
  const remainder = markdown.slice(searchStart);
  const next = remainder.search(/\n##\s+/);
  return next < 0 ? markdown.slice(start) : markdown.slice(start, searchStart + next);
}

function extractSubsection(markdown, heading) {
  const start = markdown.indexOf(heading);
  if (start < 0) return "";
  const searchStart = start + heading.length;
  const remainder = markdown.slice(searchStart);
  const next = remainder.search(/\n###\s+/);
  return next < 0 ? markdown.slice(start) : markdown.slice(start, searchStart + next);
}

function extractStringUnion(source, typeName) {
  const escaped = typeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`export\\s+type\\s+${escaped}\\s*=([\\s\\S]*?);`));
  if (!match) return [];
  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

function extractBacktickBullets(source) {
  return [...source.matchAll(/^\s*-\s+`([^`]+)`;?\s*$/gm)].map((item) => item[1]);
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function sameMembers(a, b) {
  return JSON.stringify(sortedUnique(a)) === JSON.stringify(sortedUnique(b));
}

function stripFencedCode(markdown) {
  return markdown.replace(/```[\s\S]*?```/g, (block) => block.replace(/[^\n]/g, " "));
}

function parseLinkTarget(rawTarget) {
  let target = rawTarget.trim();
  if (target.startsWith("<")) {
    const end = target.indexOf(">");
    if (end >= 0) target = target.slice(1, end);
  } else {
    const title = target.match(/^(\S+)(?:\s+["'(].*)?$/);
    if (title) target = title[1];
  }
  return target;
}

function isExternalLink(target) {
  return (
    target.startsWith("#") ||
    target.startsWith("/") ||
    /^[a-z][a-z0-9+.-]*:/i.test(target)
  );
}

async function checkManifest(root) {
  const issues = [];
  const manifestText = await readText(root, "MANIFEST.json");
  let manifest;
  try {
    manifest = JSON.parse(manifestText);
  } catch (error) {
    return [
      makeIssue(
        "DOC-INVENTORY-MISSING-NEW-FILES",
        "MANIFEST_JSON_INVALID",
        "MANIFEST.json",
        `MANIFEST.json is not valid JSON: ${error.message}`,
      ),
    ];
  }

  const listed = [];
  for (const key of INVENTORY_KEYS) {
    const value = manifest[key];
    if (!Array.isArray(value)) {
      issues.push(
        makeIssue(
          "DOC-INVENTORY-MISSING-NEW-FILES",
          "MANIFEST_SECTION_MISSING",
          "MANIFEST.json",
          `Inventory section ${key} is missing or not an array.`,
        ),
      );
      continue;
    }
    for (const item of value) {
      if (typeof item === "string") listed.push(normalizePath(item));
    }
  }

  const duplicates = listed.filter((value, index) => listed.indexOf(value) !== index);
  for (const duplicate of sortedUnique(duplicates)) {
    issues.push(
      makeIssue(
        "DOC-INVENTORY-MISSING-NEW-FILES",
        "MANIFEST_DUPLICATE_PATH",
        "MANIFEST.json",
        `Path is listed more than once: ${duplicate}`,
        { path: duplicate },
      ),
    );
  }

  const listedSet = new Set(listed);
  const managedFiles = await listManagedFiles(root);
  const managedSet = new Set(managedFiles);

  for (const listedPath of listedSet) {
    if (!managedSet.has(listedPath)) {
      issues.push(
        makeIssue(
          "DOC-ARCHIVE-PHANTOM-FILES",
          "MANIFEST_PATH_MISSING",
          "MANIFEST.json",
          `Manifest points to a missing or unmanaged path: ${listedPath}`,
          { path: listedPath },
        ),
      );
    }
  }

  for (const managedPath of managedSet) {
    if (!listedSet.has(managedPath)) {
      issues.push(
        makeIssue(
          "DOC-INVENTORY-MISSING-NEW-FILES",
          "MANIFEST_PATH_UNLISTED",
          "MANIFEST.json",
          `Managed repository file is absent from MANIFEST.json: ${managedPath}`,
          { path: managedPath },
        ),
      );
    }
  }

  return issues;
}

async function checkMarkdownLinks(root) {
  const issues = [];
  const files = (await listManagedFiles(root)).filter((file) => file.endsWith(".md"));
  const inlinePattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
  const referencePattern = /^\s*\[[^\]]+\]:\s*(\S+)/gm;

  for (const file of files) {
    const original = await readText(root, file);
    const text = stripFencedCode(original);
    const matches = [
      ...[...text.matchAll(inlinePattern)].map((match) => ({
        raw: match[1],
        index: match.index ?? 0,
      })),
      ...[...text.matchAll(referencePattern)].map((match) => ({
        raw: match[1],
        index: match.index ?? 0,
      })),
    ];

    for (const match of matches) {
      const target = parseLinkTarget(match.raw);
      if (!target || isExternalLink(target)) continue;
      const withoutFragment = target.split("#", 1)[0].split("?", 1)[0];
      if (!withoutFragment) continue;
      let decoded;
      try {
        decoded = decodeURIComponent(withoutFragment);
      } catch {
        decoded = withoutFragment;
      }
      const resolved = path.resolve(root, path.dirname(file), decoded);
      const relative = normalizePath(path.relative(root, resolved));
      if (relative.startsWith("../") || path.isAbsolute(relative)) {
        issues.push(
          makeIssue(
            "DOC-BRAND-BROKEN-LINK",
            "MARKDOWN_LINK_ESCAPES_REPOSITORY",
            file,
            `Relative link escapes the repository: ${target}`,
            { target },
            lineNumber(text, match.index),
          ),
        );
        continue;
      }
      if (!(await exists(resolved))) {
        const caseId =
          file === "brand/README.md"
            ? "DOC-BRAND-BROKEN-LINK"
            : "DOC-MARKDOWN-LINK-BROKEN";
        issues.push(
          makeIssue(
            caseId,
            "MARKDOWN_LINK_MISSING",
            file,
            `Relative link target does not exist: ${target}`,
            { target, resolved: relative },
            lineNumber(text, match.index),
          ),
        );
      }
    }
  }
  return issues;
}

async function checkRunState(root) {
  const issues = [];
  const domain = await readText(root, "schemas/domain-types.ts");
  const spec = await readText(root, "spec/10-run-and-candidate-state-machines.md");
  const canonical = extractStringUnion(domain, "RunState");
  const section = extractSection(spec, "## 5. Run state machine");
  const specStates = extractBacktickBullets(section.slice(section.indexOf("`RunState`:")));

  if (!sameMembers(canonical, specStates)) {
    issues.push(
      makeIssue(
        "DOC-RUN-STATE-EXPORTING",
        "RUN_STATE_REGISTRY_DRIFT",
        "spec/10-run-and-candidate-state-machines.md",
        "RunState values in spec/10 do not match schemas/domain-types.ts.",
        { canonical, specStates },
      ),
    );
  }
  if (canonical.includes("exporting") || /`exporting`/.test(section)) {
    issues.push(
      makeIssue(
        "DOC-RUN-STATE-EXPORTING",
        "RETIRED_RUN_STATE",
        "spec/10-run-and-candidate-state-machines.md",
        "Run lifecycle still contains retired state exporting; only Promotion/Export Operation internal statuses may use it.",
      ),
    );
  }
  if (!canonical.includes("promoting") || !/`promoting`/.test(section)) {
    issues.push(
      makeIssue(
        "DOC-RUN-STATE-EXPORTING",
        "RUN_PROMOTING_STATE_MISSING",
        "spec/10-run-and-candidate-state-machines.md",
        "Run lifecycle must contain promoting.",
      ),
    );
  }
  return issues;
}

async function checkArchiveClaim(root) {
  const file = "archive/original-design-warden-part-01.md";
  const text = await readText(root, file);
  const issues = [];
  if (/lines\s+1[–-]440\s+preserved/i.test(text)) {
    issues.push(
      makeIssue(
        "DOC-ARCHIVE-FALSE-PRESERVATION-CLAIM",
        "ARCHIVE_FALSE_PRESERVATION_CLAIM",
        file,
        "Archive fragment claims unavailable lines were preserved.",
      ),
    );
  }
  if (!/full original[\s\S]{0,120}(?:not present|never committed)/i.test(text)) {
    issues.push(
      makeIssue(
        "DOC-ARCHIVE-FALSE-PRESERVATION-CLAIM",
        "ARCHIVE_PARTIAL_STATUS_MISSING",
        file,
        "Archive fragment must state that the full original draft was never preserved in this repository.",
      ),
    );
  }
  return issues;
}

function parseSpec17CommandRegistry(text) {
  const section = extractSection(text, "## 4. Command registry");
  const rows = [
    ...section.matchAll(/^\|\s*`([^`]+)`\s*\|\s*`(POST\s+[^`]+)`\s*\|/gm),
  ];
  return rows.map((row) => ({ command: row[1], route: row[2] }));
}

function parseSpec13PostRoutes(text) {
  return sortedUnique(
    [...text.matchAll(/^POST\s+(\/api\/v1\/\S+)\s*$/gm)].map(
      (match) => `POST ${match[1]}`,
    ),
  );
}

async function checkApiContracts(root) {
  const issues = [];
  const apiTypes = await readText(root, "schemas/api-types.ts");
  const spec13 = await readText(root, "spec/13-configuration-cli-and-local-api-contracts.md");
  const spec17 = await readText(root, "spec/17-local-api-envelopes-operations-and-pagination.md");

  const typeCommands = extractStringUnion(apiTypes, "ApiCommandName");
  const registry = parseSpec17CommandRegistry(spec17);
  const registryCommands = registry.map((row) => row.command);
  if (!sameMembers(typeCommands, registryCommands)) {
    issues.push(
      makeIssue(
        "DOC-API-INVENTORY-DRIFT",
        "API_COMMAND_REGISTRY_DRIFT",
        "spec/17-local-api-envelopes-operations-and-pagination.md",
        "spec/17 command registry does not match ApiCommandName.",
        { typeCommands, registryCommands },
      ),
    );
  }

  const spec13Routes = parseSpec13PostRoutes(spec13);
  const commandRoutes = registry.map((row) => row.route);
  const expectedSpec13Routes = sortedUnique([
    "POST /api/v1/session/pair",
    ...commandRoutes,
  ]);
  if (!sameMembers(spec13Routes, expectedSpec13Routes)) {
    issues.push(
      makeIssue(
        "DOC-API-INVENTORY-DRIFT",
        "API_POST_ROUTE_DRIFT",
        "spec/13-configuration-cli-and-local-api-contracts.md",
        "spec/13 POST routes do not equal the command registry plus the non-command pairing ceremony.",
        { expected: expectedSpec13Routes, actual: sortedUnique(spec13Routes) },
      ),
    );
  }

  if (/statusUrl/.test(spec13) || !/statusPath/.test(spec13)) {
    issues.push(
      makeIssue(
        "DOC-API-INVENTORY-DRIFT",
        "API_ACCEPTED_ENVELOPE_DRIFT",
        "spec/13-configuration-cli-and-local-api-contracts.md",
        "spec/13 must use statusPath from schemas/api-types.ts and must not define statusUrl.",
      ),
    );
  }
  for (const requiredRoute of [
    "POST /api/v1/session/pair",
    "POST /api/v1/session/logout",
    "GET /api/v1/operations/:operationId",
  ]) {
    if (!spec13.includes(requiredRoute)) {
      issues.push(
        makeIssue(
          "DOC-API-INVENTORY-DRIFT",
          "API_REQUIRED_ROUTE_MISSING",
          "spec/13-configuration-cli-and-local-api-contracts.md",
          `Required API route is missing: ${requiredRoute}`,
          { route: requiredRoute },
        ),
      );
    }
  }

  return issues;
}

async function checkCliInventory(root) {
  const spec13 = await readText(root, "spec/13-configuration-cli-and-local-api-contracts.md");
  const spec08 = await readText(root, "spec/08-stack-repository-and-sequence.md");
  const section13 = extractSection(spec13, "## 8. CLI commands");
  const commands13 = [...section13.matchAll(/^###\s+`([^`]+)`\s*$/gm)].map(
    (match) => match[1],
  );
  const section08 = extractSubsection(spec08, "### `apps/cli`");
  const commands08 = extractBacktickBullets(section08);
  const issues = [];
  if (!sameMembers(commands13, commands08)) {
    issues.push(
      makeIssue(
        "DOC-CLI-PROMOTE-OMITTED",
        "CLI_COMMAND_INVENTORY_DRIFT",
        "spec/08-stack-repository-and-sequence.md",
        "spec/08 CLI inventory does not match spec/13.",
        { spec13: commands13, spec08: commands08 },
      ),
    );
  }
  if (!commands08.includes("promote")) {
    issues.push(
      makeIssue(
        "DOC-CLI-PROMOTE-OMITTED",
        "CLI_PROMOTE_MISSING",
        "spec/08-stack-repository-and-sequence.md",
        "CLI inventory omits promote.",
      ),
    );
  }
  return issues;
}

async function checkFragileSpecRanges(root) {
  const issues = [];
  const files = (await listManagedFiles(root)).filter(
    (file) =>
      file.endsWith(".md") &&
      !file.startsWith("archive/") &&
      !file.startsWith("conformance/fixtures/"),
  );
  const pattern = /\bSpecs?\s+0?1\s*(?:-|–|—|through|to)\s*\d+\b/gi;
  for (const file of files) {
    const text = stripFencedCode(await readText(root, file));
    for (const match of text.matchAll(pattern)) {
      issues.push(
        makeIssue(
          "DOC-STALE-SPEC-RANGE",
          "FRAGILE_NUMERIC_SPEC_RANGE",
          file,
          `Fragile numeric authority range: ${match[0]}`,
          { value: match[0] },
          lineNumber(text, match.index ?? 0),
        ),
      );
    }
  }
  return issues;
}

async function checkWindowsReference(root) {
  const files = (await listManagedFiles(root)).filter(
    (file) =>
      file.endsWith(".md") &&
      !file.startsWith("archive/") &&
      !file.startsWith("conformance/fixtures/"),
  );
  const observed = new Map();
  const pattern = /Windows\s+(?:10\/11|11)\s+x64/gi;
  for (const file of files) {
    const text = stripFencedCode(await readText(root, file));
    for (const match of text.matchAll(pattern)) {
      const value = match[0].replace(/\s+/g, " ");
      if (!observed.has(value)) observed.set(value, []);
      observed.get(value).push({ file, line: lineNumber(text, match.index ?? 0) });
    }
  }
  const values = [...observed.keys()];
  if (values.length === 0) {
    return [
      makeIssue(
        "DOC-WINDOWS-TARGET-DRIFT",
        "WINDOWS_REFERENCE_TARGET_MISSING",
        "README.md",
        "No active reference-platform statement matching Windows 11 x64 was found.",
      ),
    ];
  }
  if (values.length !== 1 || values[0].toLowerCase() !== "windows 11 x64") {
    return [
      makeIssue(
        "DOC-WINDOWS-TARGET-DRIFT",
        "WINDOWS_REFERENCE_TARGET_DRIFT",
        "README.md",
        "Active implementation documents disagree on the Windows reference platform.",
        { observed: Object.fromEntries(observed) },
      ),
    ];
  }
  return [];
}

async function checkUiPairingScope(root) {
  const file = "docs/PRODUCT-UI-SCENE-PLAN.md";
  const text = await readText(root, file);
  const routeSection = extractSection(text, "## 17. Authenticated MVP route inventory");
  const issues = [];
  if (
    !/authenticated-only/i.test(text) ||
    !/\/session\/pair/.test(text) ||
    !/pre-authentication/i.test(text)
  ) {
    issues.push(
      makeIssue(
        "DOC-UI-PREAUTH-ROUTE-AMBIGUITY",
        "UI_ROUTE_SCOPE_AMBIGUOUS",
        file,
        "UI plan must state that its route inventory is authenticated-only and that /session/pair is governed separately.",
      ),
    );
  }
  if (/^\/session\/pair\s*$/m.test(routeSection)) {
    issues.push(
      makeIssue(
        "DOC-UI-PREAUTH-ROUTE-AMBIGUITY",
        "UI_PAIRING_ROUTE_IN_AUTH_INVENTORY",
        file,
        "/session/pair must not appear inside the authenticated route inventory.",
      ),
    );
  }
  return issues;
}

async function checkFixtureDefinition(root) {
  const file = "conformance/fixtures/documentation-drift-regression.json";
  const text = await readText(root, file);
  let fixture;
  try {
    fixture = JSON.parse(text);
  } catch (error) {
    return [
      makeIssue(
        "DOC-CONFORMANCE-FIXTURE-INVALID",
        "CONFORMANCE_FIXTURE_JSON_INVALID",
        file,
        error.message,
      ),
    ];
  }
  const issues = [];
  const ids = new Set((fixture.cases ?? []).map((item) => item.id));
  for (const expected of EXPECTED_FIXTURE_CASES) {
    if (!ids.has(expected)) {
      issues.push(
        makeIssue(
          "DOC-CONFORMANCE-FIXTURE-INVALID",
          "CONFORMANCE_FIXTURE_CASE_MISSING",
          file,
          `Regression fixture is missing ${expected}.`,
          { caseId: expected },
        ),
      );
    }
  }
  const windowsCase = (fixture.cases ?? []).find(
    (item) => item.id === "DOC-WINDOWS-TARGET-DRIFT",
  );
  if (windowsCase) {
    if (!Array.isArray(windowsCase.observedValues) || windowsCase.observedValues.length < 2) {
      issues.push(
        makeIssue(
          "DOC-WINDOWS-TARGET-DRIFT",
          "WINDOWS_FIXTURE_OBSERVED_VALUES_MISSING",
          file,
          "Windows target fixture must use observedValues to describe the historical disagreement.",
        ),
      );
    }
    if ("brokenValues" in windowsCase) {
      issues.push(
        makeIssue(
          "DOC-WINDOWS-TARGET-DRIFT",
          "WINDOWS_FIXTURE_FORBIDDEN_TOKEN_MODEL",
          file,
          "Windows target fixture must not classify the repaired value as a forbidden broken token.",
        ),
      );
    }
    if (
      !windowsCase.rule ||
      !Array.isArray(windowsCase.sourcePaths) ||
      windowsCase.sourcePaths.length === 0
    ) {
      issues.push(
        makeIssue(
          "DOC-WINDOWS-TARGET-DRIFT",
          "WINDOWS_FIXTURE_RULE_SCOPE_MISSING",
          file,
          "Windows target fixture needs an explicit uniqueness rule and source scope.",
        ),
      );
    }
  }
  return issues;
}

export async function runConformance({ root = process.cwd() } = {}) {
  const absoluteRoot = path.resolve(root);
  const checks = [
    checkFixtureDefinition,
    checkManifest,
    checkMarkdownLinks,
    checkRunState,
    checkArchiveClaim,
    checkApiContracts,
    checkCliInventory,
    checkFragileSpecRanges,
    checkWindowsReference,
    checkUiPairingScope,
  ];
  const results = await Promise.all(checks.map((check) => check(absoluteRoot)));
  return results
    .flat()
    .sort((a, b) =>
      `${a.file}:${a.line ?? 0}:${a.code}`.localeCompare(
        `${b.file}:${b.line ?? 0}:${b.code}`,
      ),
    );
}

function parseArgs(argv) {
  const options = { root: process.cwd(), json: false };
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

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
const modulePath = fileURLToPath(import.meta.url);
if (invokedPath === modulePath) {
  await main();
}
