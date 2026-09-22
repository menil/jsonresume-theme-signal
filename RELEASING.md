# Releasing jsonresume-theme-signal

Releases can be published automatically to npm using **npm Trusted Publishing (OIDC)** without long-lived `NPM_TOKEN` secrets.

---

## How it works

The workflow [`.github/workflows/publish.yml`](.github/workflows/publish.yml) runs whenever a GitHub Release is published (`release: [published]`) or when triggered manually via `workflow_dispatch`.

1. Validates the codebase using `just validate` (checks `.agentignore` sync, linting, formatting, typechecking, tests, and build bundle generation).
2. Generates the root `index.d.ts` declaration file via `scripts/build-declarations.ts`.
3. Node 24 (with npm $\ge$ 11.5.1) performs OIDC token exchange directly with the npm registry via `id-token: write`.
4. Publishes to npm with SLSA provenance (`npm publish --access public --provenance`).

---

## One-Time Setup on npmjs.com

npm requires a package to exist before a Trusted Publisher can be configured on the web UI.

### Step 1: Bootstrap Publish

Publish version `1.0.0` once manually from your local development environment:

```bash
# Enter development environment
nix-shell

# Authenticate with npm and publish initial release
npm login
npm publish --access public
```

### Step 2: Configure Trusted Publisher on npmjs.com

1. Go to [npmjs.com](https://www.npmjs.com) and navigate to the **`jsonresume-theme-signal`** package page.
2. Go to **Settings** → **Trusted Publisher** → **Add Trusted Publisher**.
3. Select **GitHub Actions**:
   - **Repository owner**: `menil`
   - **Repository name**: `jsonresume-theme-signal`
   - **Workflow filename**: `publish.yml`
   - **Environment**: *(leave blank)*
4. Click **Add Publisher**.
5. *(Optional but recommended)*: Check **Require trusted publishing only** to ensure stolen tokens cannot publish to this package.

---

## Subsequent Releases

Once the Trusted Publisher is configured, every future release is automatic:
1. Update version in `package.json` if bumping (e.g. `1.0.1`, `1.1.0`).
2. Create and publish a Release on GitHub (or tag `vX.Y.Z`).
3. GitHub Actions will build, validate, and publish directly to npm with zero tokens.
