# AI Decision Record: Automated Release and Publish on Merge

## Context & Goal
- Automate the end-to-end release pipeline so that merging pull requests into `main` automatically computes the next semantic version, cuts a GitHub Release, and publishes to npm via OIDC without manual intervention.
- Prevent unnecessary release churn for non-user-facing commits (`docs:`, `chore:`, `refactor:`).

## Architecture & Key Decisions
1. **Conventional Commit Semver Computation**:
   - Implemented `scripts/bump-version.sh` to parse git history since the latest `v*` tag (or fallback to `package.json`).
   - Mapped conventional commits according to SemVer standards:
     - `BREAKING CHANGE:` or `feat!:` -> major (`v2.0.0`)
     - `feat:` -> minor (`v1.1.0`)
     - `fix:` -> patch (`v1.0.1`)
     - `docs:`, `chore:` -> no release (exits 0 with empty stdout).

2. **Automated GitHub Actions Pipeline (`publish.yml`)**:
   - Runs on `push` to `main` with `concurrency: group: auto-release-main, cancel-in-progress: false` to ensure sequential, ordered releases.
   - Stage 1 (`release`): Computes the next version and creates the git tag & GitHub Release with auto-generated release notes.
   - Stage 2 (`publish-npm`): Checks out the release tag, stamps `package.json` version, validates, and publishes to npm with `--provenance` via OIDC.

3. **Automated Testing**:
   - Added `tests/bump-version.test.ts` to verify version increment rules against temporary git repositories across patch, minor, major, and no-op commit sequences.

## Alternatives Considered & Rejected
- **Release-Please Bot**:
  - *Rejected*: Requires an extra manual merge step on an automated PR. The direct auto-release on merge pattern provides a seamless, zero-overhead developer experience while strictly honoring conventional commit semantics.
