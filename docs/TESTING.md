# Testing Postman Collections

Run and validate Postman collections locally and in CI.

## Running locally

```bash
# Single collection
postman collection run path/to/collection.json

# With environment
postman collection run collection.json --environment env.json

# Specific folder
postman collection run collection.json --folder "Smoke Tests"

# Custom variables
postman collection run collection.json --env-var "baseUrl=http://localhost:3000"
```

## Linting

```bash
npm run lint:collections
```

Spectral checks structure, required fields, test scripts, and hardcoded credentials. See [SPECTRAL.md](./SPECTRAL.md).

## Testing layers

- **Pre-commit** — Lint collections when `postman/` files change (see [COMMIT_HOOKS.md](./COMMIT_HOOKS.md)).
- **CI on push/PR** — Run collections (e.g. smoke or full suite) after starting your API; use a health-check wait if needed.
- **Scheduled** — Run a monitoring collection on a cron for production health.

See [CI_CD.md](./CI_CD.md) and `.github/workflows/` for examples.

## Practices

1. **Assert in tests** — Use `pm.test()` and `pm.expect()`; avoid empty tests.
2. **Use variables** — `pm.environment.get("baseUrl")` and `{{variable}}` in URLs/headers; never hardcode secrets.
3. **Wait for API** — In CI, start the server then wait for a health endpoint before running collections.
4. **Clean up** — Delete or reset test data in test scripts where possible.

## Troubleshooting

| Problem                  | Fix                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| Pass locally, fail in CI | Same env (base URL, keys); add health-check wait; ensure server is up before run.         |
| Flaky tests              | Use dynamic data (e.g. `Date.now()`), add short delays or retries for async behavior.     |
| Need reports             | Use `--reporter cli,json --reporter-json-export results.json` and upload artifacts in CI. |

More: [Postman CLI](https://learning.postman.com/docs/postman-cli/postman-cli-overview/), [Writing tests](https://learning.postman.com/docs/writing-scripts/test-scripts/).
