# Testing Postman Collections

Guide to testing and validating your Postman collections in different environments.

## Overview

This guide covers:
- Running collections locally
- Testing in CI/CD pipelines
- Validating collection structure with Spectral
- Best practices for collection testing

## Running Collections Locally

### Prerequisites

```bash
# Install Postman CLI
npm install -g postman-cli

# Authenticate
postman login
```

### Basic Collection Execution

```bash
# Run a single collection
postman collection run path/to/collection.json

# Run with environment
postman collection run \
  path/to/collection.json \
  --environment path/to/environment.json

# Run specific folder
postman collection run \
  path/to/collection.json \
  --folder "Smoke Tests"
```

### Advanced Options

```bash
# Run with custom variables
postman collection run collection.json \
  --env-var "baseUrl=http://localhost:3000" \
  --env-var "apiKey=test-key"

# Run with iteration data
postman collection run collection.json \
  --iteration-data test-data.json \
  --iteration-count 10

# Silent mode (less output)
postman collection run collection.json --silent

# Generate reports
postman collection run collection.json \
  --reporter cli,json \
  --reporter-json-export results.json
```

## Linting and Validation

### Spectral Linting

```bash
# Lint all collections
npm run lint:collections

# Or use Spectral directly
spectral lint postman/collections/*.json

# Check for specific issues
spectral lint postman/collections/*.json --fail-severity error
```

### What Spectral Checks

- ✅ Collection structure and completeness
- ✅ Required fields (names, descriptions)
- ✅ Test script presence
- ✅ Hardcoded credentials (security)
- ✅ Variable usage patterns
- ✅ Authentication configuration

See [SPECTRAL.md](./SPECTRAL.md) for detailed linting guide.

## Testing Strategies

### Layer 1: Lint Before Commit

**Pre-commit hook** (`/.husky/pre-commit`):

```bash
if git diff --cached --name-only | grep -qE "postman/"; then
  echo "📋 Linting collections..."
  npm run lint:collections
fi
```

**What it catches:**
- Hardcoded secrets
- Missing descriptions
- Malformed JSON
- Collection structure issues

### Layer 2: Smoke Tests in CI

**Quick validation on every push:**

```yaml
# .github/workflows/smoke-test.yaml
- name: Run smoke tests
  run: |
    postman collection run \
      postman/collections/*.json \
      --folder "Smoke Tests" \
      --bail  # Stop on first failure
```

**What it tests:**
- API availability
- Authentication
- Critical endpoints
- Basic functionality

### Layer 3: Full Test Suite

**Comprehensive testing before deployment:**

```yaml
# .github/workflows/full-test.yaml
- name: Run full test suite
  run: |
    for env in dev staging prod; do
      postman collection run \
        postman/collections/*.json \
        --environment "postman/environments/$env.json"
    done
```

**What it tests:**
- All endpoints
- All test scenarios
- Multiple environments
- Integration workflows

### Layer 4: Scheduled Monitoring

**Production health checks:**

```yaml
# .github/workflows/monitor.yaml
on:
  schedule:
    - cron: '0 */6 * * *'

- name: Monitor production
  run: |
    postman collection run \
      postman/collections/monitoring.json \
      --environment postman/environments/prod.json
```

**What it monitors:**
- Production endpoint health
- Response times
- Data integrity
- SLA compliance

## Testing Patterns

### Pattern 1: Test Pyramid

```
                    /\
                   /  \  E2E Tests (Few, Slow)
                  /----\
                 /      \  Integration Tests (Some, Medium)
                /--------\
               /          \  Unit Tests (Many, Fast)
              /-----------\
             /   Linting    \  (Always, Instant)
            /_______________\
```

Apply to Postman collections:
- **Linting**: Every commit (Spectral)
- **Smoke**: Every push (critical paths)
- **Integration**: Before deployment (full suite)
- **E2E**: Scheduled (production monitoring)

### Pattern 2: Environment Progression

```bash
# Local Development
postman collection run collection.json \
  --environment env/local.json

# CI/CD Staging
postman collection run collection.json \
  --environment env/staging.json

# Production (manual approval)
postman collection run collection.json \
  --environment env/production.json
```

### Pattern 3: Data-Driven Testing

```bash
# Create test data file
cat > test-data.json << EOF
[
  {"username": "user1", "email": "user1@example.com"},
  {"username": "user2", "email": "user2@example.com"}
]
EOF

# Run with iterations
postman collection run collection.json \
  --iteration-data test-data.json
```

### Pattern 4: Parallel Execution

```bash
# Run multiple collections in parallel
for collection in postman/collections/*.json; do
  postman collection run "$collection" &
done
wait  # Wait for all to complete
```

## Best Practices

### 1. Write Assertions in Tests

```javascript
// Good: Specific assertions
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("Response time is acceptable", () => {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

pm.test("User has correct structure", () => {
    const user = pm.response.json();
    pm.expect(user).to.have.property('id');
    pm.expect(user).to.have.property('email');
});

// Bad: No assertions
pm.test("Request completed", () => {
    // Empty test
});
```

### 2. Use Environment Variables

```javascript
// Good: Environment variables
pm.sendRequest({
    url: pm.environment.get("baseUrl") + "/users",
    method: 'GET',
    header: {
        'x-api-key': pm.environment.get("apiKey")
    }
});

// Bad: Hardcoded values
pm.sendRequest({
    url: "http://localhost:3000/users",
    method: 'GET',
    header: {
        'x-api-key': "sk_test_123456"  // Security risk!
    }
});
```

### 3. Clean Up Test Data

```javascript
// Pre-request script: Create test data
pm.sendRequest({
    url: pm.environment.get("baseUrl") + "/test-users",
    method: 'POST',
    body: { /* test user */ }
}, (err, res) => {
    pm.environment.set("testUserId", res.json().id);
});

// Test script: Clean up
pm.test("Cleanup", () => {
    pm.sendRequest({
        url: pm.environment.get("baseUrl") + "/test-users/" +
             pm.environment.get("testUserId"),
        method: 'DELETE'
    });
});
```

### 4. Handle Async Operations

```javascript
// Wait for async operation
pm.test("Async job completes", function() {
    const maxAttempts = 10;
    let attempts = 0;

    function checkStatus() {
        attempts++;
        pm.sendRequest(statusUrl, (err, res) => {
            if (res.json().status === 'completed') {
                pm.expect(res.json().status).to.equal('completed');
            } else if (attempts < maxAttempts) {
                setTimeout(checkStatus, 1000);
            } else {
                throw new Error('Job did not complete');
            }
        });
    }

    checkStatus();
});
```

### 5. Document Test Coverage

```javascript
// Collection-level pre-request script
pm.collectionVariables.set('testsRun', 0);
pm.collectionVariables.set('testsPassed', 0);

// Test script
pm.test("My test", () => {
    const run = pm.collectionVariables.get('testsRun') + 1;
    pm.collectionVariables.set('testsRun', run);

    // Your assertion
    pm.expect(true).to.be.true;

    const passed = pm.collectionVariables.get('testsPassed') + 1;
    pm.collectionVariables.set('testsPassed', passed);
});
```

## Troubleshooting

### Collections Fail in CI But Pass Locally

**Common causes:**

1. **Environment differences**
   ```bash
   # Verify environment is correct
   postman collection run collection.json \
     --environment ci-environment.json \
     --verbose
   ```

2. **Timing issues**
   ```javascript
   // Add delays if needed
   setTimeout(() => {
       // Make request
   }, 1000);
   ```

3. **API not ready**
   ```bash
   # Wait for API before running tests
   timeout 60 bash -c 'until curl -f http://api/health; do sleep 2; done'
   ```

### Test Data Issues

```javascript
// Use dynamic data generators
pm.variables.set('uniqueEmail',
    'test+' + Date.now() + '@example.com'
);

pm.variables.set('randomId',
    pm.variables.replaceIn('{{$randomUUID}}')
);
```

### Flaky Tests

```javascript
// Add retries for flaky endpoints
pm.test("API responds (with retry)", function() {
    const maxRetries = 3;

    function tryRequest(retries) {
        pm.sendRequest(url, (err, res) => {
            if (err && retries > 0) {
                setTimeout(() => tryRequest(retries - 1), 1000);
            } else {
                pm.expect(err).to.be.null;
            }
        });
    }

    tryRequest(maxRetries);
});
```

## Additional Resources

- [Postman CLI Documentation](https://learning.postman.com/docs/postman-cli/postman-cli-overview/)
- [Writing Tests in Postman](https://learning.postman.com/docs/writing-scripts/test-scripts/)
- [CI/CD Guide](./CI_CD.md) - Automation workflows
- [Spectral Guide](./SPECTRAL.md) - Collection linting

---

**Ready to test your collections?** Check out the [CI/CD Guide](./CI_CD.md) for automation examples!
