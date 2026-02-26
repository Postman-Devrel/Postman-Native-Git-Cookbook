# Spectral Linting

A guide to using Spectral to lint Postman collections and OpenAPI specs in the Native Git workflow.

This cookbook ships two separate Spectral configurations:

| Config | Targets | Command |
|---|---|---|
| `.spectral.yaml` | `postman/collections/` only | `npm run lint:collections` |
| `.spectral-openapi.yaml` | `postman/specs/` only | `npm run lint:specs` |

Keep them separate. Collection rules use Postman-specific JSONPath selectors that are meaningless against OpenAPI files, and vice versa.

## Table of Contents

- [What is Spectral?](#what-is-spectral)
- [Why Use Spectral with Postman?](#why-use-spectral-with-postman)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Built-in Rules](#built-in-rules)
- [Linting OpenAPI Specs](#linting-openapi-specs)
- [Custom Rules](#custom-rules)
- [Secret Detection](#secret-detection)
- [Running Spectral](#running-spectral)
- [Integration](#integration)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## What is Spectral?

[Spectral](https://stoplight.io/open-source/spectral) is an open-source JSON/YAML linter with built-in support for OpenAPI, AsyncAPI, and custom JSON schemas. It allows you to enforce quality, consistency, and security standards across your API artifacts.

While originally designed for API specifications, Spectral works perfectly with Postman collection JSON files!

## Why Use Spectral with Postman?

### Benefits

1. **Enforce Standards**: Ensure all collections follow your team's conventions
2. **Catch Errors Early**: Find issues before they reach production
3. **Security**: Detect hardcoded credentials and sensitive data
4. **Quality Assurance**: Verify test coverage and documentation completeness
5. **Automation**: Integrate with git hooks and CI/CD pipelines
6. **Customizable**: Create rules specific to your organization

### Use Cases

- **API Governance**: Enforce naming conventions and structure
- **Security Audits**: Scan for exposed secrets and credentials
- **Documentation Quality**: Ensure requests have descriptions and examples
- **Test Coverage**: Verify all requests include test scripts
- **Consistency**: Maintain uniform collection structure across teams

## Quick Start

### Installation

```bash
# Install Spectral CLI
npm install --save-dev @stoplight/spectral-cli

# Verify installation
npx spectral --version
```

### Create Configuration

Create `.spectral.yaml` in your project root:

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

### Run Linting

```bash
# Lint a specific collection
spectral lint postman/collections/my-collection.postman_collection.json

# Lint all collections
spectral lint postman/collections/*.postman_collection.json

# Output as JSON
spectral lint postman/collections/*.json --format json
```

## Configuration

### Basic Structure

The `.spectral.yaml` file defines your linting rules:

```yaml
extends: []  # Base rulesets to extend (optional)

rules:
  rule-name:
    description: Human-readable description
    message: Custom error message (optional)
    given: JSONPath expression targeting elements
    severity: error | warn | info | hint | off
    then:
      field: Property to check (optional)
      function: Built-in or custom function
      functionOptions: Parameters for the function
```

### Severity Levels

- **error** (0): Fails linting, blocks commits/CI
- **warn** (1): Warning message, doesn't fail
- **info** (2): Informational message
- **hint** (3): Suggestion
- **off**: Disables the rule

### JSONPath Expressions

Spectral uses JSONPath to target elements in your collection:

```yaml
# Target collection info
given: $.info

# Target all items (requests/folders)
given: $.item[*]

# Target all requests recursively
given: $..item[?(@.request)]

# Target all headers
given: $..header[*]

# Target specific headers
given: $..header[?(@.key == 'x-api-key')]
```

## Built-in Rules

This repository includes a comprehensive set of rules in `.spectral.yaml`:

### Collection Structure Rules

#### Collection Name Required

```yaml
collection-name-required:
  description: Collection must have a name
  given: $.info
  severity: error
  then:
    field: name
    function: truthy
```

**What it checks:** Every collection has a name in the `info` section.

#### Collection Description

```yaml
collection-description-required:
  description: Collection should have a description
  given: $.info
  severity: warn
  then:
    field: description
    function: truthy
```

**What it checks:** Collections include a description explaining their purpose.

### Request Rules

#### Request Name Required

```yaml
request-name-required:
  description: All requests must have a name
  given: $..item[*]
  severity: error
  then:
    field: name
    function: truthy
```

**What it checks:** Every request and folder has a name.

#### Request Description

```yaml
request-description-recommended:
  description: Request should have a description
  message: 'Request "{{path}}" is missing a description.'
  given: $..item[?(@.request)]
  severity: warn
  then:
    field: request.description
    function: truthy
```

**What it checks:** Requests include descriptions documenting their purpose.

### Test Coverage Rules

#### Request Tests Recommended

```yaml
request-tests-recommended:
  description: Request should include test scripts
  message: 'Request "{{path}}" is missing test scripts.'
  given: $..item[?(@.request)]
  severity: warn
  then:
    field: event
    function: truthy
```

**What it checks:** Requests include test scripts.

#### Test Scripts Have Content

```yaml
request-tests-have-scripts:
  description: Test events should have executable scripts
  given: $..item[?(@.request)].event[?(@.listen == 'test')]
  severity: info
  then:
    field: script.exec
    function: truthy
```

**What it checks:** Test events contain actual script code.

### Security Rules

See [Secret Detection](#secret-detection) section for detailed security rules.

## Linting OpenAPI Specs

Use `.spectral-openapi.yaml` to lint OpenAPI specs stored in `postman/specs/`. This config extends Spectral's built-in `spectral:oas` ruleset and targets OpenAPI files only — it does not run against collections or environments.

```bash
npm run lint:specs
```

**What it enforces:**

| Rule | Severity | What it checks |
|---|---|---|
| `info-description` | error | Spec must have a top-level description |
| `info-contact` | warn | Spec should include contact info |
| `operation-summary` | error | Every operation must have a summary |
| `operation-tags` | error | Every operation must have at least one tag |
| `operation-tag-defined` | error | Tags used must be defined at the top level |
| `operation-operationId` | error | Every operation must have a unique ID |
| `operation-operationId-valid-in-url` | error | Operation IDs must be URL-safe |
| `operation-success-response` | error | Every operation must define at least one success response |
| `operation-parameters` | warn | Parameters should have descriptions |
| `no-$ref-siblings` | error | No properties alongside a `$ref` |
| `path-not-include-query` | error | Query params belong in `parameters`, not the path |

**Customizing:**

Edit `.spectral-openapi.yaml` to adjust severities or disable rules:

```yaml
rules:
  info-contact: off          # disable if not needed
  operation-description: error  # promote from warn to error
```

---

## Custom Rules

### Creating Custom Rules

Add your own rules to `.spectral.yaml`:

#### Example: Enforce Naming Convention

```yaml
request-naming-convention:
  description: Request names should start with HTTP method
  message: 'Request "{{value}}" should start with HTTP method (GET, POST, etc.)'
  given: $..item[?(@.request)].name
  severity: warn
  then:
    function: pattern
    functionOptions:
      match: "^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS) "
```

#### Example: Require Base URL Variable

```yaml
base-url-uses-variable:
  description: URLs should use {{baseUrl}} variable
  message: 'Request "{{path}}" should use {{baseUrl}} instead of hardcoded URL'
  given: $..item[?(@.request)].request.url.raw
  severity: warn
  then:
    function: pattern
    functionOptions:
      match: "^{{baseUrl}}"
```

#### Example: Folder Structure

```yaml
folders-required:
  description: Collection should organize requests in folders
  message: 'Collection should use folders to organize requests'
  given: $.item
  severity: info
  then:
    function: schema
    functionOptions:
      schema:
        type: array
        contains:
          type: object
          properties:
            item:
              type: array
```

### Available Functions

Spectral provides many built-in functions:

- **truthy**: Value must be present and non-empty
- **falsy**: Value must be absent or empty
- **pattern**: Match regex pattern
- **notMatch**: Must NOT match regex pattern
- **schema**: Validate against JSON Schema
- **length**: Check array/string length
- **enumeration**: Value must be in allowed list
- **casing**: Enforce naming conventions (camelCase, snake_case, etc.)

Example using casing:

```yaml
variable-names-snake-case:
  description: Variable names should use snake_case
  given: $.variable[*].key
  severity: warn
  then:
    function: casing
    functionOptions:
      type: snake
```

## Secret Detection

### Overview

One of the most critical uses of Spectral is preventing hardcoded credentials from being committed to your repository.

### Built-in Security Rules

#### No Hardcoded API Keys in Headers

```yaml
no-hardcoded-apikey-header:
  description: API key headers must use variables, not plain text
  message: '🔒 SECURITY: Request "{{path}}" has a hardcoded API key. Use {{variable}} syntax instead.'
  given: $..header[?(@.key == 'x-api-key' || @.key == 'X-API-Key' || @.key == 'api-key' || @.key == 'apikey')]
  severity: error
  then:
    field: value
    function: pattern
    functionOptions:
      match: "^\\{\\{.*\\}\\}$"
```

**What it does:** Ensures API key headers use `{{variable}}` syntax instead of plain text values.

#### No Hardcoded Authorization Headers

```yaml
no-hardcoded-auth-header:
  description: Authorization headers must use variables
  message: '🔒 SECURITY: Request "{{path}}" has a hardcoded Authorization header.'
  given: $..header[?(@.key == 'Authorization' || @.key == 'authorization')]
  severity: error
  then:
    field: value
    function: pattern
    functionOptions:
      match: "^\\{\\{.*\\}\\}$"
```

#### No Hardcoded Bearer Tokens

```yaml
no-hardcoded-bearer-token:
  description: Bearer tokens must use variables
  given: $..header[?(@.key == 'Authorization' || @.key == 'authorization')]
  severity: error
  then:
    field: value
    function: pattern
    functionOptions:
      notMatch: "^Bearer\\s+[A-Za-z0-9\\-._~+/]+=*$"
```

**What it does:** Prevents commits containing actual Bearer tokens.

#### No Credentials in Auth Configuration

```yaml
no-credentials-in-auth-apikey:
  description: API key auth values must use variables
  message: '🔒 SECURITY: Authentication contains hardcoded API key.'
  given: $..auth.apikey[0].value
  severity: error
  then:
    function: pattern
    functionOptions:
      match: "^\\{\\{.*\\}\\}$"

no-credentials-in-auth-bearer:
  description: Bearer token auth must use variables
  given: $..auth.bearer[0].value
  severity: error
  then:
    function: pattern
    functionOptions:
      match: "^\\{\\{.*\\}\\}$"

no-credentials-in-auth-basic-username:
  description: Basic auth username must use variables
  given: $..auth.basic[0].value
  severity: error
  then:
    function: pattern
    functionOptions:
      match: "^\\{\\{.*\\}\\}$"

no-credentials-in-auth-basic-password:
  description: Basic auth password must use variables
  given: $..auth.basic[1].value
  severity: error
  then:
    function: pattern
    functionOptions:
      match: "^\\{\\{.*\\}\\}$"
```

### Example Secret Detection

When you run linting on a collection with hardcoded credentials:

```bash
$ npm run lint:collections

postman/collections/example.postman_collection.json
  45:12    error    no-hardcoded-apikey-header        🔒 SECURITY: Request "Get User Profile" has a hardcoded API key. Use {{variable}} syntax instead.
  67:15    error    no-hardcoded-bearer-token         Request "Login User" has a hardcoded Bearer token. Use {{variable}} syntax instead.
  89:20    error    no-credentials-in-auth-basic      🔒 SECURITY: Authentication contains hardcoded password. Use {{variable}} syntax instead.

✖ 3 problems (3 errors, 0 warnings, 0 infos, 0 hints)
```

### Best Practices for Secrets

1. **Always Use Variables**: Use `{{apiKey}}` instead of plain text
2. **Use Environments**: Store secrets in environment files
3. **Exclude from Git**: Add environment files to `.gitignore`
4. **Vault Integration**: Use Postman Vault for team credentials
5. **CI/CD Secrets**: Use GitHub Secrets, GitLab Variables, etc.

Example - Correct Usage:

```json
{
  "header": [
    {
      "key": "x-api-key",
      "value": "{{apiKey}}",
      "type": "text"
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{bearerToken}}",
        "type": "string"
      }
    ]
  }
}
```

## Running Spectral

### Command Line

#### Basic Usage

```bash
# Lint a single file
spectral lint postman/collections/my-api.postman_collection.json

# Lint multiple files
spectral lint postman/collections/*.postman_collection.json

# Lint with specific ruleset
spectral lint --ruleset .spectral.yaml postman/collections/*.json
```

#### Output Formats

```bash
# Default (stylish)
spectral lint postman/collections/*.json

# JSON output
spectral lint postman/collections/*.json --format json

# JUnit XML (for CI)
spectral lint postman/collections/*.json --format junit

# HTML output
spectral lint postman/collections/*.json --format html > report.html
```

#### Filtering Results

```bash
# Only show errors
spectral lint postman/collections/*.json --fail-severity error

# Only show errors and warnings
spectral lint postman/collections/*.json --fail-severity warn
```

### NPM Scripts

```bash
# Lint collections (uses .spectral.yaml via lint-with-names.js)
npm run lint:collections

# Lint OpenAPI specs in postman/specs/ (uses .spectral-openapi.yaml)
npm run lint:specs
```

### Enhanced Custom Script

For better error messages with request names, use the custom script at `.spectral/lint-with-names.js`:

```bash
# Run the enhanced linter
npm run lint:collections

# Or directly
node .spectral/lint-with-names.js
```

**Benefits:**
- Shows request names instead of JSON paths
- Colored output for better readability
- Groups results by collection file
- Handles edge cases better

## Integration

### Pre-Commit Hooks

Add to `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run Spectral only if collection files changed
if git diff --cached --name-only | grep -qE "postman/collections/"; then
  echo "📋 Linting Postman collections with Spectral..."
  npm run lint:collections

  if [ $? -ne 0 ]; then
    echo "❌ Spectral linting failed"
    exit 1
  fi
fi
```

### CI/CD Integration

#### GitHub Actions

```yaml
- name: Lint Postman Collections
  run: |
    npm install -g @stoplight/spectral-cli
    spectral lint postman/collections/*.postman_collection.json --fail-severity error
```

#### GitLab CI

```yaml
lint-collections:
  stage: lint
  script:
    - npm install -g @stoplight/spectral-cli
    - spectral lint postman/collections/*.json
```

#### CircleCI

```yaml
- run:
    name: Lint Collections
    command: |
      npm install -g @stoplight/spectral-cli
      spectral lint postman/collections/*.json
```

### VS Code Integration

Install the [Spectral VS Code extension](https://marketplace.visualstudio.com/items?itemName=stoplight.spectral):

```bash
code --install-extension stoplight.spectral
```

Collections will be linted automatically as you edit them!

## Examples

### Example 1: Quality Gates

Enforce minimum quality standards:

```yaml
# All requests must have descriptions
request-description-required:
  description: Request must have a description
  given: $..item[?(@.request)]
  severity: error
  then:
    field: request.description
    function: truthy

# All requests must have test scripts
request-tests-required:
  description: Request must include tests
  given: $..item[?(@.request)]
  severity: error
  then:
    field: event
    function: truthy

# Collections must have version info
collection-version-required:
  description: Collection must specify version
  given: $.info
  severity: warn
  then:
    field: version
    function: truthy
```

### Example 2: Team Conventions

Enforce team-specific conventions:

```yaml
# Requests must be organized in folders
no-top-level-requests:
  description: Requests should be inside folders
  message: 'Top-level requests are not allowed. Organize in folders.'
  given: $.item[?(@.request)]
  severity: error
  then:
    function: falsy

# Variable naming convention
variable-names-uppercase:
  description: Environment variables should be UPPERCASE
  given: $.variable[*].key
  severity: warn
  then:
    function: pattern
    functionOptions:
      match: "^[A-Z][A-Z0-9_]*$"

# Collection name must include version
collection-name-versioned:
  description: Collection name should include version
  given: $.info.name
  severity: warn
  then:
    function: pattern
    functionOptions:
      match: "v\\d+"
```

### Example 3: Documentation Standards

Ensure comprehensive documentation:

```yaml
# All folders must have descriptions
folder-description-required:
  description: Folders should have descriptions
  given: $.item[?(@.item)]
  severity: warn
  then:
    field: description
    function: truthy

# Requests should have examples
response-examples-required:
  description: Request should include response examples
  given: $..item[?(@.request)]
  severity: info
  then:
    field: response
    function: truthy

# Collections should have contact info
collection-contact-required:
  description: Collection should include contact information
  given: $.info
  severity: info
  then:
    field: contact
    function: truthy
```

## Troubleshooting

### Common Issues

#### Rule Not Triggering

**Problem:** Your custom rule isn't catching violations.

**Solution:** Test your JSONPath expression:

```bash
# Use a JSONPath tester online or:
npm install -g jsonpath

# Test your expression
echo '{"info": {"name": "Test"}}' | jsonpath '$.info.name'
```

#### Spectral Not Found

**Problem:** `spectral: command not found`

**Solutions:**

```bash
# Install globally
npm install -g @stoplight/spectral-cli

# Or use npx
npx @stoplight/spectral-cli lint ...

# Or use local installation
./node_modules/.bin/spectral lint ...
```

#### Invalid Configuration

**Problem:** `.spectral.yaml` syntax errors.

**Solution:** Validate YAML syntax:

```bash
# Use a YAML validator or:
npm install -g js-yaml

# Validate file
js-yaml .spectral.yaml
```

#### False Positives

**Problem:** Rule triggers on valid cases.

**Solutions:**

1. **Adjust Severity:**
   ```yaml
   severity: warn  # Instead of error
   ```

2. **Refine JSONPath:**
   ```yaml
   # More specific targeting
   given: $..header[?(@.key == 'x-api-key' && @.disabled != true)]
   ```

3. **Add Exceptions:**
   ```yaml
   # Use custom function with conditionals
   ```

### Performance Issues

If linting is slow:

1. **Lint Only Changed Files:**
   ```bash
   git diff --name-only | grep "\.json$" | xargs spectral lint
   ```

2. **Use Specific Paths:**
   ```bash
   # Instead of **/*.json
   spectral lint postman/collections/*.json
   ```

3. **Disable Heavy Rules:**
   ```yaml
   expensive-rule:
     severity: off
   ```

## Additional Resources

- **Spectral Documentation**: https://stoplight.io/open-source/spectral
- **JSONPath Documentation**: https://goessner.net/articles/JsonPath/
- **Custom Functions**: https://meta.stoplight.io/docs/spectral/docs/guides/4-custom-functions.md
- **Spectral Rulesets**: https://github.com/stoplightio/spectral-rulesets

---

**Ready to lint your collections?** Check out the [Setup Guide](./SETUP.md) or return to the [main README](../README.md)!
