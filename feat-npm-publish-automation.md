# AI Decision Record: Automated Tokenless npm Publishing & TypeScript Declarations

## Context & Goal
- Enable external developers and automated tooling (such as \`resumed\` and \`resume-cli\`) to seamlessly consume \`jsonresume-theme-signal\`.
- Ensure robust type safety for programmatic TypeScript/Node users without build warnings or missing type definitions.
- Implement automated publishing to npm directly from GitHub Releases without requiring long-lived npm personal access tokens in CI.

## Architecture & Key Decisions
1. **Tokenless OIDC Trusted Publishing**:
   - Configured \`.github/workflows/publish.yml\` to authenticate using OpenID Connect (OIDC) between GitHub Actions and the npm registry (\`permissions: id-token: write\`).
   - Omitted \`registry-url\` from \`setup-node\` to avoid injecting an empty \`_authToken\` into \`~/.npmrc\`, which would otherwise suppress the OIDC exchange.
   - Pinned Node to version 24 (shipping with npm >= 11.5.1) to ensure full OIDC exchange support.
   - Published with \`--provenance\` to generate cryptographic build attestations linked to this repository.

2. **Dedicated TypeScript Declaration Generation**:
   - Implemented \`scripts/build-declarations.ts\` to output \`index.d.ts\` at the repository root during \`bun run build\` / \`prepack\` / \`prepublishOnly\`.
   - Explicitly exposed \`"types": "./index.d.ts"\` in \`exports["."]\` in \`package.json\` to support both modern bundler resolution and classic Node16/NodeNext resolution algorithms.

3. **Releasing Documentation**:
   - Added \`RELEASING.md\` detailing the one-time initial bootstrap publish and npm Trusted Publisher UI configuration.

## Alternatives Considered & Rejected
- **Classic NPM_TOKEN Secret**:
  - *Rejected*: Storing a long-lived secret in GitHub Actions secrets creates a persistent credential risk and requires secret rotation. OIDC trusted publishing is cryptographic, ephemeral, and verified at publish time by the npm registry.
- **\`tsc --declaration --emitDeclarationOnly\`**:
  - *Rejected*: The repository uses extension imports (\`./helpers.ts\`) and asset attributes (\`style.css\` / \`template.hbs\`) which standard \`tsc\` compiler passes reject under \`--noEmit: false\` without extensive compiler config fragmentation. A dedicated declaration generation script is clean, deterministic, and lightweight.
