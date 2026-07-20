# Render Rivals Schemas

**Status:** Pre-scaffold placeholder  
**Canonical contract:** [`spec/11-artifact-event-and-schema-contracts.md`](../spec/11-artifact-event-and-schema-contracts.md)

This directory is intentionally present before implementation so the repository does not imply that the schema registry already exists when it does not.

## Required implementation contents

Before the first scaffold milestone is accepted, this directory or the implementation package referenced by `spec/11` must contain:

- versioned Zod schemas for every canonical entity and stream record;
- generated JSON Schema documents;
- valid fixtures;
- invalid fixtures;
- migration functions and migration metadata;
- compatibility tests;
- canonical JSON and hashing tests;
- schema-version support declarations.

## Initial schema registry

The first implementation must cover at least:

- installation;
- project;
- source snapshot;
- run;
- run configuration;
- candidate and candidate attempt;
- workspace;
- process record;
- capture plan;
- capture epoch;
- capture;
- gate result;
- comparison;
- evaluation;
- evidence record;
- recommendation;
- user decision;
- promotion/export;
- artifact record;
- event;
- event head;
- integrity report;
- recovery report;
- cleanup result.

## Current state

No executable schema implementation exists yet. This directory is not evidence that `spec/11` has been implemented. It marks a required scaffold deliverable and prevents the prerequisite from remaining invisible.
