# CI/CD Integration Guide

Complete guide to integrating Postman collections into your CI/CD pipelines.

## Table of Contents

- [Overview](#overview)
- [Benefits](#benefits)
- [GitHub Actions](#github-actions)
- [GitLab CI](#gitlab-ci)
- [CircleCI](#circleci)
- [Common Patterns](#common-patterns)
- [Advanced Workflows](#advanced-workflows)
- [Troubleshooting](#troubleshooting)

## Overview

Integrating Postman collections into your CI/CD pipeline enables:

- **Automated Testing**: Run API tests on every code change
- **Quality Gates**: Block deployments if tests fail
- **Documentation**: Keep collections in sync with implementation
- **Regression Testing**: Catch breaking changes early
- **Contract Testing**: Ensure API contracts are maintained

## Benefits

### Why Run Collections in CI/CD?

1. **Continuous Validation**: Every push is tested automatically
2. **Early Bug Detection**: Find issues before production
3. **Team Confidence**: Know that changes don't break APIs
4. **Documentation as Code**: Collections stay up-to-date
5. **Compliance**: Audit trail of all test runs

### When to Run Collections

- **On Every Push**: Quick smoke tests
- **On Pull Requests**: Full test suite before merge
- **On Schedule**: Regular health checks (e.g., hourly)
- **Before Deployment**: Final validation gate
- **After Deployment**: Verify production endpoints

## GitHub Actions

### Basic Setup

#### 1. Create Workflow File

Create `.github/workflows/postman-tests.yaml`:

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
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Postman CLI
        run: curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh

      - name: Run tests
        run: npm test

      - name: Start API server
        run: |
          npm start &
          sleep 5

      - name: Run Postman collections
        env:
          POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
        run: |
          postman login --with-api-key "$POSTMAN_API_KEY"
          npm run test:api
```

#### 2. Add Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add:
   - Name: `POSTMAN_API_KEY`
   - Value: Your Postman API key from https://web.postman.co/settings/me/api-keys

#### 3. Verify

Push your changes and check the **Actions** tab to see the workflow run.

### Advanced GitHub Actions Workflows

#### Workflow 1: Lint and Test

```yaml
name: Lint and Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    name: Lint Postman Collections
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Spectral
        run: npm install -g @stoplight/spectral-cli

      - name: Lint collections
        run: spectral lint postman/collections/*.postman_collection.json

  test:
    name: Run API Tests
    runs-on: ubuntu-latest
    needs: lint  # Only run if linting passes
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Install Postman CLI
        run: curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh

      - name: Start server
        run: npm start &

      - name: Wait for server
        run: |
          timeout 30 bash -c 'until curl -s http://localhost:3000/health; do sleep 1; done'

      - name: Run collections
        env:
          POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
        run: |
          postman login --with-api-key "$POSTMAN_API_KEY"
          npm run test:api

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: postman-results
          path: postman-results.json
```

#### Workflow 2: Multi-Environment Testing

The cookbook includes a ready-to-use multi-environment workflow at `.github/workflows/multi-env.yaml`. It runs collections against `dev` and `staging` in parallel using a matrix strategy, then publishes to Postman Cloud only after all environments pass.

```yaml
name: Multi-Environment Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  run-collections:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false  # let all environments run even if one fails
      matrix:
        environment: [dev, staging]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Install Postman CLI
        run: curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh
      - name: Authenticate with Postman
        env:
          POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
        run: postman login --with-api-key "$POSTMAN_API_KEY"
      - name: Run collections against ${{ matrix.environment }}
        run: |
          for collection in postman/collections/*.postman_collection.json; do
            postman collection run "$collection" \
              --environment "postman/environments/${{ matrix.environment }}.postman_environment.json"
          done

  publish:
    needs: run-collections
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Postman CLI
        run: curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh
      - name: Publish workspace to Postman Cloud
        env:
          POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
        run: |
          postman login --with-api-key "$POSTMAN_API_KEY"
          postman workspace push -y
```

Copy the full template from `.github/workflows/multi-env.yaml`.

#### Workflow 3: Scheduled Health Checks

```yaml
name: Scheduled API Health Check

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Postman CLI
        run: curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh

      - name: Run health check collection
        env:
          POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
        run: |
          postman login --with-api-key "$POSTMAN_API_KEY"
          postman collection run postman/collections/health-check.postman_collection.json

      - name: Notify on failure
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'API Health Check Failed',
              body: 'The scheduled API health check failed. Please investigate.',
              labels: ['bug', 'api', 'health-check']
            })
```

#### Workflow 4: Publish to Postman Workspace

`postman workspace push` is the handoff from git to Postman Cloud — the moment a validated, merged state becomes visible to consumers. It only runs on merges to `main`, never on PRs.

See **[WORKSPACE_PUSH.md](./WORKSPACE_PUSH.md)** for the full reference: what the command does, failure handling, the `-y` flag, and how to verify the Cloud View updated.

```yaml
name: Publish to Postman

on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Postman CLI
        run: curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh

      - name: Publish workspace to Postman Cloud
        env:
          POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
        run: |
          postman login --with-api-key "$POSTMAN_API_KEY"
          postman workspace push -y
```

## GitLab CI

### Basic Setup

Create `.gitlab-ci.yml`:

```yaml
image: node:20

stages:
  - lint
  - test
  - deploy

variables:
  POSTMAN_API_KEY: $POSTMAN_API_KEY

before_script:
  - npm ci
  - curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh
  - export PATH="$PATH:$HOME/.postman"

lint-collections:
  stage: lint
  script:
    - npm install -g @stoplight/spectral-cli
    - spectral lint postman/collections/*.postman_collection.json

test-api:
  stage: test
  services:
    - name: postgres:14
      alias: db
  script:
    - npm start &
    - sleep 5
    - postman login --with-api-key "$POSTMAN_API_KEY"
    - npm run test:api
  artifacts:
    reports:
      junit: postman-results.xml
    paths:
      - postman-results.json
    expire_in: 1 week

publish-to-postman:
  stage: deploy
  only:
    - main
  script:
    - postman login --with-api-key "$POSTMAN_API_KEY"
    - postman workspace push -y
```

### Advanced GitLab CI

#### Multi-Environment Pipeline

```yaml
.test-template: &test-template
  stage: test
  script:
    - npm start &
    - sleep 5
    - postman login --with-api-key "$POSTMAN_API_KEY"
    - |
      postman collection run \
        postman/collections/*.postman_collection.json \
        --environment postman/environments/$ENVIRONMENT.postman_environment.json

test-dev:
  <<: *test-template
  variables:
    ENVIRONMENT: development
  only:
    - develop

test-staging:
  <<: *test-template
  variables:
    ENVIRONMENT: staging
  only:
    - staging

test-prod:
  <<: *test-template
  variables:
    ENVIRONMENT: production
  only:
    - main
  when: manual
```

## CircleCI

### Basic Setup

Create `.circleci/config.yml`:

```yaml
version: 2.1

executors:
  node-executor:
    docker:
      - image: cimg/node:20.0

jobs:
  lint:
    executor: node-executor
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "package.json" }}
      - run:
          name: Install dependencies
          command: npm ci
      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package.json" }}
      - run:
          name: Lint collections
          command: |
            npm install -g @stoplight/spectral-cli
            spectral lint postman/collections/*.postman_collection.json

  test:
    executor: node-executor
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "package.json" }}
      - run: npm ci
      - run:
          name: Install Postman CLI
          command: curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh
      - run:
          name: Start server
          command: npm start
          background: true
      - run:
          name: Wait for server
          command: sleep 5
      - run:
          name: Run Postman collections
          command: |
            export PATH="$PATH:$HOME/.postman"
            postman login --with-api-key "$POSTMAN_API_KEY"
            npm run test:api
      - store_test_results:
          path: postman-results
      - store_artifacts:
          path: postman-results.json

workflows:
  version: 2
  test-and-deploy:
    jobs:
      - lint
      - test:
          requires:
            - lint
```

### Advanced CircleCI

#### Parallel Execution

```yaml
version: 2.1

jobs:
  test-collections:
    executor: node-executor
    parallelism: 4
    steps:
      - checkout
      - run: npm ci
      - run: curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh
      - run: npm start &
      - run: sleep 5
      - run:
          name: Run collections in parallel
          command: |
            export PATH="$PATH:$HOME/.postman"
            postman login --with-api-key "$POSTMAN_API_KEY"

            # Get list of collections
            COLLECTIONS=(postman/collections/*.postman_collection.json)

            # Split collections across parallel nodes
            for collection in $(echo "${COLLECTIONS[@]}" | circleci tests split); do
              echo "Running $collection"
              postman collection run "$collection"
            done
```

## Common Patterns

### Pattern 1: Conditional Execution

Only run collections when relevant files change:

```yaml
# GitHub Actions
- name: Check for API changes
  id: api-changes
  run: |
    if git diff --name-only ${{ github.event.before }} ${{ github.sha }} | grep -qE "src/|postman/"; then
      echo "run_tests=true" >> $GITHUB_OUTPUT
    fi

- name: Run collections
  if: steps.api-changes.outputs.run_tests == 'true'
  run: npm run test:api
```

### Pattern 2: Health Check with Retry

Wait for server to be ready:

```yaml
- name: Wait for server
  run: |
    timeout 60 bash -c '
      until curl -f -s http://localhost:3000/health > /dev/null; do
        echo "Waiting for server..."
        sleep 2
      done
    '
```

### Pattern 3: Test Report Generation

```yaml
- name: Run collections with JUnit report
  run: |
    postman collection run \
      postman/collections/*.json \
      --reporter junit \
      --reporter-junit-export results.xml

- name: Publish test results
  uses: EnricoMi/publish-unit-test-result-action@v2
  if: always()
  with:
    files: results.xml
```

### Pattern 4: Dynamic Environment Selection

```yaml
- name: Select environment
  id: env
  run: |
    if [ "${{ github.ref }}" == "refs/heads/main" ]; then
      echo "env_file=production" >> $GITHUB_OUTPUT
    elif [ "${{ github.ref }}" == "refs/heads/staging" ]; then
      echo "env_file=staging" >> $GITHUB_OUTPUT
    else
      echo "env_file=development" >> $GITHUB_OUTPUT
    fi

- name: Run collections
  run: |
    postman collection run \
      postman/collections/*.json \
      --environment postman/environments/${{ steps.env.outputs.env_file }}.postman_environment.json
```

### Pattern 5: Artifacts and Reporting

```yaml
- name: Run collections
  run: |
    postman collection run \
      postman/collections/*.json \
      --reporter cli,json \
      --reporter-json-export postman-results.json

- name: Upload results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: postman-test-results
    path: |
      postman-results.json
      newman-report.html
```

## Advanced Workflows

### Workflow 1: Contract Testing

Validate API implementation against OpenAPI spec:

```yaml
name: Contract Testing

on: [pull_request]

jobs:
  contract-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate OpenAPI spec
        run: |
          npm install -g @stoplight/spectral-cli
          spectral lint openapi/openapi.yaml

      - name: Run contract tests
        env:
          POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
        run: |
          # Generate collection from OpenAPI spec
          postman login --with-api-key "$POSTMAN_API_KEY"

          # Run collections as contract tests
          npm start &
          sleep 5
          npm run test:api
```

### Workflow 2: Performance Testing

Run performance tests with monitoring:

```yaml
name: Performance Tests

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run performance collection
        env:
          POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
        run: |
          postman login --with-api-key "$POSTMAN_API_KEY"
          postman collection run \
            postman/collections/performance-tests.postman_collection.json \
            --iteration-count 1000 \
            --delay-request 100

      - name: Analyze results
        run: |
          # Parse results and check performance thresholds
          node scripts/analyze-performance.js postman-results.json
```

### Workflow 3: Security Scanning

Scan for exposed secrets:

```yaml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Scan collections for secrets
        run: |
          npm install -g @stoplight/spectral-cli
          spectral lint \
            postman/collections/*.json \
            --fail-severity error

      - name: Check for hardcoded URLs
        run: |
          if grep -r "http://localhost" postman/collections/; then
            echo "Error: Hardcoded localhost URLs found"
            exit 1
          fi
```

## Troubleshooting

### Common Issues

#### Issue 1: Postman CLI Not Found

**Error:** `postman: command not found`

**Solution:**

```yaml
# Add to PATH after installation
- name: Install Postman CLI
  run: curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh

- name: Add to PATH
  run: echo "$HOME/.postman" >> $GITHUB_PATH
```

#### Issue 2: Authentication Failures

**Error:** `Error: Authentication failed`

**Solutions:**

1. **Verify Secret is Set:**
   - Check GitHub Secrets settings
   - Ensure secret name matches workflow

2. **Use API Key Login:**
   ```yaml
   - run: postman login --with-api-key "$POSTMAN_API_KEY"
   ```

3. **Check API Key Scope:**
   - Ensure API key has necessary permissions
   - Generate new key if needed

#### Issue 3: Server Not Ready

**Error:** Collections fail because server isn't responding

**Solution:**

```yaml
- name: Start server and wait
  run: |
    npm start &
    timeout 60 bash -c '
      until curl -f http://localhost:3000/health; do
        echo "Waiting for server..."
        sleep 2
      done
    '
    echo "Server is ready!"
```

#### Issue 4: Tests Pass Locally But Fail in CI

**Common Causes:**

1. **Environment Variables Not Set:**
   ```yaml
   - name: Run collections
     env:
       API_KEY: ${{ secrets.API_KEY }}
       BASE_URL: https://api.example.com
   ```

2. **Database Not Available:**
   ```yaml
   services:
     postgres:
       image: postgres:14
       env:
         POSTGRES_PASSWORD: password
   ```

3. **Port Conflicts:**
   ```yaml
   - run: PORT=3001 npm start &
   ```

#### Issue 5: Slow CI Builds

**Optimizations:**

1. **Cache Dependencies:**
   ```yaml
   - uses: actions/cache@v3
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
   ```

2. **Conditional Execution:**
   Only run when necessary files change

3. **Parallel Execution:**
   Run multiple collections in parallel

4. **Skip Long-Running Tests:**
   ```bash
   postman collection run \
     --folder "Smoke Tests" \
     collection.json
   ```

### Debug Mode

Enable verbose output:

```yaml
- name: Run collections (debug)
  run: |
    postman collection run \
      --verbose \
      collection.json
```

## Best Practices

1. **Use Secrets Management**: Never commit API keys
2. **Cache Dependencies**: Speed up builds
3. **Fail Fast**: Exit on first failure
4. **Report Results**: Upload artifacts for debugging
5. **Monitor Performance**: Track test execution time
6. **Version Pin**: Use specific CLI versions for reproducibility
7. **Test Isolation**: Each test should be independent
8. **Cleanup**: Stop servers and clean up resources

## Additional Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **GitLab CI Docs**: https://docs.gitlab.com/ee/ci/
- **CircleCI Docs**: https://circleci.com/docs/
- **Postman CLI Docs**: https://learning.postman.com/docs/postman-cli/postman-cli-overview/

---

**Ready to set up CI/CD?** Check out the [Setup Guide](./SETUP.md) or return to the [main README](../README.md)!
