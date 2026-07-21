# Documentation Conformance

This directory contains the first executable Render Rivals repository artifact: a dependency-free Node documentation-conformance checker and regression suite.

## Run it

```text
node conformance/check.mjs
node conformance/check.mjs --json
node --test conformance/check.test.mjs
```

Node 24 LTS is the reference runtime. The checker uses only Node built-ins.

Exit codes:

- `0`: repository conforms;
- `1`: conformance defects found;
- `2`: checker usage or execution failure.

## Structure

- `check.mjs` — stable CLI and import-safe entry point;
- `check-all.mjs` — aggregates class-specific handlers;
- `check-core.mjs` — inventory, links, Run state, archive, API/CLI, platform and route-scope checks;
- `check-operation-states.mjs` — compares both shared Operation unions with the spec/17 status table;
- `check.test.mjs` — clean-tree and mutation tests.

## What it verifies

The checker uses class-specific handlers rather than treating every fixture as a forbidden-token grep. It verifies:

- bidirectional `MANIFEST.json` coverage of the maintained documentation surface;
- listed paths exist and managed paths are inventoried once;
- relative Markdown links resolve;
- the canonical `RunState` union agrees with spec/10 and uses `promoting` rather than retired Run state `exporting`;
- archive history claims are honest;
- `ApiCommandName`, spec/17's command registry, and spec/13's POST route surface agree;
- `statusPath`, pairing, logout, and Operation-status routes remain present;
- `ApiOperationState`, `OperationState`, and the spec/17 table contain the same seven states, including nonterminal `interrupted` and `reconciling`;
- spec/08 and spec/13 expose the same CLI commands, including `promote`;
- fragile `Specs 01–N` authority ranges do not return;
- active implementation documents use one Windows 11 x64 reference target;
- the Product UI route inventory is explicitly authenticated-only and excludes `/session/pair`.

## Regression fixture

`fixtures/documentation-drift-regression.json` records eleven defects that existed before repair. The tests copy the repository to an owned temporary directory, reproduce each defect through a case-specific mutation, and assert that the corresponding checker case fails.

The Windows target case is a cross-file uniqueness assertion. `Windows 11 x64` is the repaired value, not a forbidden token. API, CLI, Run-state, and Operation-state cases compare closed registries and semantic tables rather than scanning for one string.

## Maintenance rule

Any new checker class requires:

1. a stable case or issue code;
2. an explicit source scope and authority;
3. a clean-tree assertion;
4. at least one negative mutation test;
5. manifest and README updates.

The checker must run before architecture-document changes are accepted. Repository writes still require post-push re-reading; the checker supplements observation but does not turn an API success response into proof of canonical content.
