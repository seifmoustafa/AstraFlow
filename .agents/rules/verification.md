# Verification and evidence

- Select checks based on the changed package and risk. A focused test project is useful feedback; it is not evidence that the entire solution or release matrix passed.
- For normal code changes, build the affected project and run its matching test project. Run broader solution checks when shared contracts, build settings, or multiple packages are affected.
- For package, framework, generator, analyzer, or public API changes, consider the relevant compatibility, package-install, upgrade-smoke, and sample-build scripts in `scripts/`.
- Read script help or source before invoking unfamiliar scripts. Do not publish, push, tag, or contact external services without explicit user authorization.
- Report each command actually run and whether it passed. If a check is skipped or blocked, say why and identify what remains unverified.
- Do not add a new test framework, dependency, or test suite solely to satisfy a generic checklist. Use existing project conventions and only add tests that cover the behavior being changed.

