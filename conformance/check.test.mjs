import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { runConformance } from "./check-all.mjs";

const conformanceDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(conformanceDir, "..");
const fixturePath = path.join(
  conformanceDir,
  "fixtures",
  "documentation-drift-regression.json",
);

function toLf(value) {
  return value.replace(/\r\n/g, "\n");
}

// Mutation search strings are written with LF. A working tree checked out with
// CRLF (the Git for Windows default before `.gitattributes` pinned eol=lf)
// would otherwise fail the precondition assert for any multi-line search.
// Matching is newline-agnostic, while the file's original style is preserved so
// the checker itself stays exercised against CRLF input.
async function replaceInFile(root, relativePath, search, replacement) {
  const file = path.join(root, relativePath);
  const original = await readFile(file, "utf8");
  const usesCrlf = original.includes("\r\n");
  const text = toLf(original);
  const normalizedSearch = toLf(search);
  assert.ok(
    text.includes(normalizedSearch),
    `Mutation precondition missing in ${relativePath}: ${search}`,
  );
  const mutated = text.replace(normalizedSearch, toLf(replacement));
  await writeFile(file, usesCrlf ? mutated.replace(/\n/g, "\r\n") : mutated, "utf8");
}

async function mutate(caseId, root) {
  switch (caseId) {
    case "DOC-RUN-STATE-EXPORTING":
      await replaceInFile(
        root,
        "spec/10-run-and-candidate-state-machines.md",
        "- `promoting`;",
        "- `exporting`;",
      );
      break;
    case "DOC-INVENTORY-MISSING-NEW-FILES": {
      const file = path.join(root, "MANIFEST.json");
      const manifest = JSON.parse(await readFile(file, "utf8"));
      manifest.canonicalSpecifications = manifest.canonicalSpecifications.filter(
        (item) =>
          item !==
          "spec/24-secrets-authentication-state-and-network-egress-policy.md",
      );
      await writeFile(file, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
      break;
    }
    case "DOC-ARCHIVE-PHANTOM-FILES": {
      const file = path.join(root, "MANIFEST.json");
      const manifest = JSON.parse(await readFile(file, "utf8"));
      manifest.historicalArchive.push("archive/original-roadmap.md");
      await writeFile(file, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
      break;
    }
    case "DOC-ARCHIVE-FALSE-PRESERVATION-CLAIM":
      await replaceInFile(
        root,
        "archive/original-design-warden-part-01.md",
        "The full original Design Warden draft is not present in this repository and was never committed to its Git history. This short fragment is the only version preserved here. Missing parts must not be reconstructed from memory or treated as repository history.",
        "Original lines 1–440 preserved for history.",
      );
      break;
    case "DOC-API-INVENTORY-DRIFT":
      await replaceInFile(
        root,
        "spec/13-configuration-cli-and-local-api-contracts.md",
        "statusPath:",
        "statusUrl:",
      );
      break;
    case "DOC-OPERATION-STATE-TABLE-DRIFT":
      await replaceInFile(
        root,
        "spec/17-local-api-envelopes-operations-and-pagination.md",
        "| `reconciling` | required because an execution or external side effect was observed | null | null until proof permits canonical adoption | null |\n",
        "",
      );
      break;
    case "DOC-CLI-PROMOTE-OMITTED":
      await replaceInFile(
        root,
        "spec/08-stack-repository-and-sequence.md",
        "- `promote`;\n",
        "",
      );
      break;
    case "DOC-STALE-SPEC-RANGE":
      await replaceInFile(
        root,
        "docs/MVP-VERTICAL-SLICE.md",
        "The maintained canonical specification reading order in `README.md` and `DOCUMENT-MANIFEST.md`",
        "Specs 01–14",
      );
      break;
    case "DOC-WINDOWS-TARGET-DRIFT":
      await replaceInFile(
        root,
        "spec/03-process-containment.md",
        "Windows 11 reference MVP",
        "Windows 10/11 x64 reference MVP",
      );
      break;
    case "DOC-BRAND-BROKEN-LINK":
      await replaceInFile(
        root,
        "brand/README.md",
        "concepts/04-neon-creative-tech.webp",
        "concepts/04-neon-creative-technology.webp",
      );
      break;
    case "DOC-UI-PREAUTH-ROUTE-AMBIGUITY":
      await replaceInFile(
        root,
        "docs/PRODUCT-UI-SCENE-PLAN.md",
        "authenticated-only",
        "complete",
      );
      break;
    default:
      throw new Error(`No mutation handler for ${caseId}`);
  }
}

test("repaired repository passes documentation conformance", async () => {
  const issues = await runConformance({ root: repositoryRoot });
  assert.deepEqual(issues, []);
});

const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
for (const regressionCase of fixture.cases) {
  test(`detects ${regressionCase.id}`, { concurrency: false }, async () => {
    const parent = await mkdtemp(
      path.join(os.tmpdir(), "render-rivals-conformance-"),
    );
    const copyRoot = path.join(parent, "repo");
    try {
      await cp(repositoryRoot, copyRoot, {
        recursive: true,
        filter: (source) => {
          const relative = path.relative(repositoryRoot, source);
          const parts = relative.split(path.sep);
          return !parts.includes(".git") && !parts.includes("node_modules");
        },
      });
      await mutate(regressionCase.id, copyRoot);
      const issues = await runConformance({ root: copyRoot });
      assert.ok(
        issues.some((issue) => issue.caseId === regressionCase.id),
        `Expected ${regressionCase.id}; got ${JSON.stringify(issues, null, 2)}`,
      );
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  });
}
