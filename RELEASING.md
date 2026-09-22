# Releasing jsonresume-theme-signal

Releases are **fully automated on merge to `main`** using conventional commits and **npm Trusted Publishing (OIDC)** without long-lived `NPM_TOKEN` secrets.

---

## How it works

Every merge to `main` triggers [`.github/workflows/publish.yml`](.github/workflows/publish.yml):

1. **Calculates Semantic Version**:
   `scripts/bump-version.sh` computes the next `vX.Y.Z` from conventional commits since the last release tag:
   - `BREAKING CHANGE` (body) or `feat!:` / `fix!:` $\rightarrow$ **major** (`2.0.0`)
   - `feat:` $\rightarrow$ **minor** (`1.1.0`)
   - `fix:` $\rightarrow$ **patch** (`1.0.1`)
   - `docs:`, `chore:`, `refactor:` $\rightarrow$ **no release** (skips silently)

2. **Creates Tag & Release**:
   Creates the git tag and publishes a GitHub Release with auto-generated release notes.

3. **Publishes to npm**:
   - Stamps the computed release version into `package.json` (`npm version ${VERSION#v} --no-git-tag-version`).
   - Runs full project validation (`just validate`).
   - Publishes to npm with SLSA provenance (`npm publish --access public --provenance`) authenticated via OIDC.

---

## One-Time Setup on npmjs.com

1. Go to [npmjs.com](https://www.npmjs.com) $\rightarrow$ **`jsonresume-theme-signal`** package.
2. Go to **Settings** $\rightarrow$ **Trusted Publisher** $\rightarrow$ **Add Trusted Publisher**.
3. Select **GitHub Actions**:
   - **Repository owner**: `menil`
   - **Repository name**: `jsonresume-theme-signal`
   - **Workflow filename**: `publish.yml`
   - **Environment**: *(leave blank)*
4. Click **Add Publisher** and check **Require trusted publishing only**.
