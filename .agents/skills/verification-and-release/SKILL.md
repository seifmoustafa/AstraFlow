---
name: verification-and-release
description: Use when choosing evidence for AstraFlow changes, validating packages or consumers, or assessing release readiness without publishing.
---

# AstraFlow verification and release preparation

1. Read `AGENTS.md` and `.agents/rules/verification.md`. For a release assessment, also read `docs/release-checklist.md`, `docs/strategy/evidence-and-gates.md`, and `docs/strategy/validation-matrix.md`.
2. Map each changed source, project, package asset, public contract, and doc to its owner and existing verification project. Start focused; broaden for shared contracts, build settings, multiple packages, target-framework coverage, generators/analyzers, security, or compatibility impact.
3. Match claims to the evidence ladder in `docs/strategy/evidence-and-gates.md`: source implementation, passing relevant tests, packaged clean consumer, publication, runtime/AOT/security, benchmark, and adoption evidence are separate levels. A test result or draft evidence document proves only its recorded SHA, commands, environment, and scope.
4. For code work, choose relevant build/test commands. For package readiness, inspect `scripts/verify-api-compatibility.ps1`, `verify-package-install.ps1`, `verify-sample-builds.ps1`, `verify-upgrade-smoke.ps1`, and pack scripts as applicable. Read parameters/source first and preserve intended output locations.
5. Distinguish local package validation from a published release. Check release metadata and independent publication/tag evidence when release status matters; stale changelog sections, source version, and successful local pack do not prove publication.
6. Do not publish, tag, push, or contact external release services unless explicitly requested. Prepare a concise evidence report with exact commands/results, skipped gates and why, residual risk, and claims the evidence does not support.

