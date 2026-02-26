# Setup Guide

Get Postman Native Git workflows running in your project.

## Prerequisites

- **Node.js** v16+
- **Git** v2.x+
- **Postman account** — [postman.com](https://www.postman.com/)

## Initial setup

**Option A — Use this repo as a template**

```bash
git clone https://github.com/your-org/postman-native-git-cookbook.git
cd postman-native-git-cookbook
npm install
```

**Option B — Add to an existing project**

```bash
cd your-project
npm install --save-dev husky lint-staged @stoplight/spectral-cli postman-cli
npx husky install
npm pkg set scripts.prepare="husky install"
mkdir -p .husky
```

## Postman CLI

```bash
# Install (global or project)
npm install -g postman-cli
# or: npm install --save-dev postman-cli

# Verify
postman --version

# Log in (interactive or API key for CI)
postman login
# or: postman login --with-api-key YOUR_API_KEY

# Check
postman whoami
```

Get an API key: [Postman API keys](https://web.postman.co/settings/me/api-keys)

## Git hooks

Husky runs checks before each commit. Configure in `.husky/pre-commit` and `package.json` (`lint-staged`). See [COMMIT_HOOKS.md](./COMMIT_HOOKS.md) and `.husky/pre-commit-examples.sh` for patterns.

Minimal pre-commit idea: run `npx lint-staged`, then if `postman/` files are staged, run `npm run lint:collections` (and optionally `npm run test:api`).

## Spectral

- **Collections:** `npm run lint:collections` (uses `.spectral.yaml` and `.spectral/lint-with-names.js`)
- **OpenAPI specs:** `npm run lint:specs` (uses `.spectral-openapi.yaml`)

See [SPECTRAL.md](./SPECTRAL.md) for rule details and custom rules.

## CI/CD

Use the workflows under [.github/workflows/](../.github/workflows/) and follow [CI_CD.md](./CI_CD.md). Add `POSTMAN_API_KEY` to GitHub **Settings → Secrets and variables → Actions**.

## Verification

```bash
npm run prepare          # Install hooks
npm run lint:collections # Lint collections
postman collection run postman/collections/your-collection.postman_collection.json  # Run a collection
```

Push to trigger CI and check the Actions tab.

## Troubleshooting

| Problem                      | Fix                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Pre-commit not running       | `npm run prepare`; `chmod +x .husky/pre-commit`                                    |
| `postman: command not found` | Use `npx postman-cli` or ensure install path is in `PATH`                          |
| Authentication failed        | `postman login` or `postman login --with-api-key KEY`; check key at postman.com    |
| Spectral errors              | Ensure `.spectral.yaml` exists; run `npx @stoplight/spectral-cli --version`        |
| CI fails, local passes       | Check `POSTMAN_API_KEY` secret; add a wait/health check before running collections |

## Next steps

- [COMMIT_HOOKS.md](./COMMIT_HOOKS.md) — Hook behavior and examples
- [CI_CD.md](./CI_CD.md) — GitHub Actions
- [SPECTRAL.md](./SPECTRAL.md) — Linting
- [README](../README.md) — Full cookbook
