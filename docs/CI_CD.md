# CI/CD Integration Guide

Run Postman collections in CI/CD for automated API testing and quality gates. This guide uses **GitHub Actions**; you can adapt the same steps in GitLab CI, CircleCI, or other runners.

## Quick start

1. **Workflow** — Create `.github/workflows/postman-tests.yaml`:

```yaml
name: Postman API Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - name: Install Postman CLI
        run: curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh
      - name: Run Postman collections
        env:
          POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
        run: |
          postman login --with-api-key "$POSTMAN_API_KEY"
          for c in postman/collections/*.postman_collection.json; do postman collection run "$c"; done
```

2. **Secret** — In the repo: **Settings** → **Secrets and variables** → **Actions** → add `POSTMAN_API_KEY` (from [Postman API keys](https://web.postman.co/settings/me/api-keys)).

3. **Verify** — Push and check the **Actions** tab.

## Workflows in this repo

| Purpose                         | File                                                                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Lint collections (Spectral)     | [`.github/workflows/lint-collections.yaml`](../.github/workflows/lint-collections.yaml)                                          |
| Run collections (template)      | [`.github/workflows/run-collections.yaml`](../.github/workflows/run-collections.yaml)                                            |
| Multi-environment (dev/staging) | [`.github/workflows/multi-env.yaml`](../.github/workflows/multi-env.yaml)                                                        |
| Scheduled health check          | [`.github/workflows/scheduled-health-check.yaml`](../.github/workflows/scheduled-health-check.yaml)                              |
| Publish to Postman Cloud        | [`.github/workflows/postman.yaml`](../.github/workflows/postman.yaml) — see [WORKSPACE_PUSH.md](./WORKSPACE_PUSH.md) for details |

Use or copy these as needed.

## Useful patterns

**Wait for server before running collections:**

```yaml
- name: Wait for server
  run: |
    timeout 60 bash -c 'until curl -fs http://localhost:3000/health; do sleep 2; done'
```

**Run only when relevant:** use a path filter on the job or a step that detects changes in `postman/` or API code, then run collections conditionally.

## Troubleshooting

| Problem                      | Fix                                                                                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `postman: command not found` | After installing CLI, add to PATH: `echo "$HOME/.postman" >> $GITHUB_PATH` (or use the install step from the workflow above; it’s in PATH for that job). |
| Authentication failed        | Confirm `POSTMAN_API_KEY` is set in repo Secrets and the secret name matches the workflow. Create a new key if needed.                                   |
| Server not ready             | Start the server in the background, then use the “Wait for server” snippet above before running collections.                                             |

## Resources

- [GitHub Actions](https://docs.github.com/en/actions)
- [Postman CLI](https://learning.postman.com/docs/postman-cli/postman-cli-overview/)

See [SETUP.md](./SETUP.md) for local setup or the [README](../README.md) for the full cookbook.
