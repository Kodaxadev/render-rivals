# Render Rivals Planning Scope Status

**Status:** Implementation-scope clarification  
**Purpose:** Prevent full-product planning documents from being mistaken for the first-release implementation contract.

## Authority

Implementation order is:

1. accepted ADRs;
2. canonical specifications;
3. `docs/MVP-VERTICAL-SLICE.md` for first-release scope;
4. `docs/FAILURE-RECOVERY-MATRIX.md` for product failure behavior;
5. route and scene planning documents for surfaces included by the MVP;
6. post-MVP sections of planning documents only after the vertical slice passes.

## Deferred features shown in the complete product plans

The following may appear in the full UI or route plans but are not included in the MVP:

- generation of contenders inside Render Rivals;
- combined generated and imported contender runs;
- more than one contender per run;
- tournament rounds;
- parallel candidate execution;
- historical run comparison;
- annotation authoring;
- CI and pull-request workflows;
- hosted or team collaboration;
- automatic merging or source replacement.

Any UI control for these features must be omitted from the MVP build or visibly marked `Post-MVP — unavailable` in prototypes. It must not be implemented as an enabled but incomplete action.

## New-run wizard rule

For the MVP, the run-intent step exposes one enabled mode:

- **Compare current implementation with one existing contender**.

The complete product plan may retain future intent modes for information architecture, but they must carry explicit `Post-MVP` status.

## Route inventory rule

`docs/ROUTE-LEVEL-WIREFRAME-SPEC.md` is the implementation route authority for routes included in the MVP. The scene plan describes product scenes and navigation groups; it is not required to repeat every wizard subroute or execution-phase route.

The following wireframe routes are therefore intentional implementation decompositions rather than contradictory product features:

- `/projects/:projectId/runs/new/*`;
- `/runs/:runId/preparation`;
- `/runs/:runId/capture`.

Future updates to the scene plan should include an appendix linking these subroutes to their parent scenes.

## Scaffold rule

Do not scaffold a feature solely because it appears in a complete-product planning document. A feature must also be present in the locked MVP contract or be introduced by a later accepted milestone/ADR.
