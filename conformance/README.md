# Documentation Conformance

This directory contains machine-readable fixtures for the first executable repository artifact: a documentation-conformance checker.

The initial negative fixture records real drift discovered in the repository before repair. The checker must detect equivalent synthetic failures for:

- retired canonical vocabulary;
- active files missing from inventories;
- manifest entries pointing to nonexistent files;
- false preservation claims;
- API, route, command, and envelope drift;
- fragile numeric authority ranges;
- platform-target disagreement;
- broken relative links;
- route-inventory scope ambiguity.

The fixture is historical test input, not a statement that `main` should remain broken. After repair, the repository itself must pass while mutations reproducing each fixture fail.

The checker should eventually run before any architecture-document commit is accepted and should verify post-write content rather than trusting a successful API response alone.
