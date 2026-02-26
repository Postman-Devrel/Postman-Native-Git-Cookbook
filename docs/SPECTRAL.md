# Spectral Linting (Collections)

Lint Postman collection JSON with Spectral using `.spectral.yaml`.

**Command:** `npm run lint:collections` — lints `postman/collections/*.postman_collection.json` and uses `.spectral/lint-with-names.js` for clearer output (request names, colors, grouped by file).

## Quick start

```bash
npm install --save-dev @stoplight/spectral-cli
npx spectral --version
```

Minimal `.spectral.yaml`:

```yaml
extends: []
rules:
  collection-name-required:
    description: Collection must have a name
    given: $.info
    severity: error
    then:
      field: name
      function: truthy
```

Run:

```bash
spectral lint postman/collections/*.postman_collection.json
# or
npm run lint:collections
```

## What the built-in rules cover

The repo’s `.spectral.yaml` includes rules for:

- **Structure** — Collection name, description; request names and descriptions.
- **Tests** — Requests should have test scripts; test events should have script content.
- **Security** — No hardcoded API keys, auth headers, or bearer tokens; use `{{variable}}` instead.

## Custom rules

Add rules to `.spectral.yaml`. Example — require `{{baseUrl}}` in URLs:

```yaml
base-url-uses-variable:
  description: URLs should use {{baseUrl}}
  given: $..item[?(@.request)].request.url.raw
  severity: warn
  then:
    function: pattern
    functionOptions:
      match: "^{{baseUrl}}"
```

Useful functions: `truthy`, `pattern`, `schema`, `casing`. [Spectral docs](https://stoplight.io/open-source/spectral).

## Secret detection

The built-in security rules fail on hardcoded credentials in headers or auth config. Use variables (e.g. `{{apiKey}}`) and store secrets in environments or CI secrets, not in collection JSON.

## Integration

**Pre-commit:** Run lint only when collections changed:

```bash
if git diff --cached --name-only | grep -qE "postman/collections/"; then
  npm run lint:collections
fi
```

**CI:** Add a step that runs `npm ci` and `npm run lint:collections` (see [CI_CD.md](./CI_CD.md) and [.github/workflows/lint-collections.yaml](../.github/workflows/lint-collections.yaml)).

## Troubleshooting

| Problem                       | Fix                                                            |
| ----------------------------- | -------------------------------------------------------------- |
| `spectral: command not found` | Use `npx @stoplight/spectral-cli lint ...` or install globally |
| Rule not firing               | Check the `given` JSONPath; test with a small collection JSON  |
| Too many warnings             | Lower severity in `.spectral.yaml` or set rule to `off`        |

- [Spectral](https://stoplight.io/open-source/spectral)
- [JSONPath](https://goessner.net/articles/JsonPath/)
