import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { checkStage05ResearchInventory } from "./check-stage05-research.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Stage 0.5 research inventory matches the repository", async () => {
  assert.deepEqual(await checkStage05ResearchInventory(repositoryRoot), []);
});

test("unlisted Stage 0.5 files are detected", async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), "render-rivals-stage05-inventory-"));
  const copyRoot = path.join(parent, "repo");
  try {
    await cp(repositoryRoot, copyRoot, {
      recursive: true,
      filter: (source) => !path.relative(repositoryRoot, source).split(path.sep).includes(".git"),
    });
    await writeFile(path.join(copyRoot, "research", "stage-0.5", "unlisted.mjs"), "export {};\n", "utf8");
    const issues = await checkStage05ResearchInventory(copyRoot);
    assert.ok(issues.some((item) => item.code === "STAGE05_PATH_UNLISTED"));
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test("phantom Stage 0.5 manifest entries are detected", async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), "render-rivals-stage05-inventory-"));
  const copyRoot = path.join(parent, "repo");
  try {
    await cp(repositoryRoot, copyRoot, {
      recursive: true,
      filter: (source) => !path.relative(repositoryRoot, source).split(path.sep).includes(".git"),
    });
    const manifestPath = path.join(copyRoot, "MANIFEST.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.stage05Research.push("research/stage-0.5/missing.mjs");
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    const issues = await checkStage05ResearchInventory(copyRoot);
    assert.ok(issues.some((item) => item.code === "STAGE05_PATH_MISSING"));
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});
