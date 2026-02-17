# Setup Guide

Complete step-by-step instructions for setting up Postman Native Git workflows in your project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Postman CLI Setup](#postman-cli-setup)
- [Git Hooks Setup](#git-hooks-setup)
- [Spectral Setup](#spectral-setup)
- [CI/CD Setup](#cicd-setup)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

### Required

- **Node.js** (v16 or later)
  ```bash
  node --version  # Should be v16.x or higher
  ```

- **npm** or **yarn**
  ```bash
  npm --version   # or
  yarn --version
  ```

- **Git** (v2.x or later)
  ```bash
  git --version
  ```

- **Postman Account** (free or paid)
  - Sign up at [postman.com](https://www.postman.com/)

### Optional but Recommended

- **GitHub/GitLab Account** (for CI/CD integration)
- **Code Editor** (VS Code, Sublime, etc.)
- **Terminal** with bash or zsh

## Initial Setup

### Option 1: Using This Repository as a Template

```bash
# 1. Clone this repository
git clone https://github.com/your-org/postman-native-git-cookbook.git
cd postman-native-git-cookbook

# 2. Install dependencies
npm install
# or
yarn install

# 3. You're done! The hooks are automatically installed.
```

### Option 2: Adding to Your Existing Project

```bash
# 1. Navigate to your project
cd your-project

# 2. Install required dependencies
npm install --save-dev husky lint-staged @stoplight/spectral-cli postman-cli

# 3. Initialize Husky
npx husky install

# 4. Add prepare script to package.json
npm pkg set scripts.prepare="husky install"

# 5. Create .husky directory structure
mkdir -p .husky
```

## Postman CLI Setup

### 1. Install Postman CLI

**Option A: Global Installation (Recommended)**

```bash
npm install -g postman-cli
```

**Option B: Project-Local Installation**

```bash
npm install --save-dev postman-cli
```

**Option C: Standalone Installation (No Node.js)**

```bash
# macOS/Linux
curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh

# Windows (PowerShell)
iwr https://dl-cli.pstmn.io/install/windows64.ps1 -outfile install.ps1; .\install.ps1
```

### 2. Verify Installation

```bash
postman --version
```

### 3. Authenticate with Postman

**Option A: Interactive Login**

```bash
postman login
```

This opens a browser window for authentication.

**Option B: API Key Login (for CI/CD)**

```bash
# Get your API key from: https://web.postman.co/settings/me/api-keys
postman login --with-api-key YOUR_API_KEY
```

### 4. Verify Authentication

```bash
postman whoami
```

You should see your Postman username.

## Git Hooks Setup

### 1. Create Pre-Commit Hook

```bash
# Create the hook file
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running linter on staged files..."
npx lint-staged

echo "🧪 Running tests..."
npm test

# Run Spectral linting on Postman collections if they changed
if git diff --cached --name-only | grep -qE "postman/collections/"; then
  echo "📋 Linting Postman collections with Spectral..."
  npm run lint:collections
fi

# Run Postman tests only if Postman collection files changed
if git diff --cached --name-only | grep -qE "postman/"; then
  echo "📬 Postman collection changed - Running Postman tests..."
  npm run test:api
fi

echo "✅ All pre-commit checks passed!"
EOF

# Make it executable
chmod +x .husky/pre-commit
```

### 2. Configure lint-staged in package.json

Add this to your `package.json`:

```json
{
  "lint-staged": {
    "*.js": [
      "eslint --fix"
    ],
    "*.{json,md,yaml,yml}": [
      "prettier --write"
    ]
  }
}
```

### 3. Add NPM Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "prepare": "husky install",
    "test:api": "for file in postman/collections/*.postman_collection.json; do echo \"Running $file...\"; postman collection run \"$file\"; done",
    "lint:collections": "spectral lint postman/collections/*.postman_collection.json"
  }
}
```

## Spectral Setup

### 1. Create Spectral Configuration

Create `.spectral.yaml` in your project root:

```yaml
extends: []

rules:
  # Collection Structure
  collection-name-required:
    description: Collection must have a name
    given: $.info
    severity: error
    then:
      field: name
      function: truthy

  # Security - No Hardcoded Credentials
  no-hardcoded-apikey-header:
    description: API key headers must use variables, not plain text
    message: '🔒 SECURITY: Request "{{path}}" has a hardcoded API key. Use {{variable}} syntax instead.'
    given: $..header[?(@.key == 'x-api-key' || @.key == 'X-API-Key')]
    severity: error
    then:
      field: value
      function: pattern
      functionOptions:
        match: "^\\{\\{.*\\}\\}$"

  # Test Coverage
  request-tests-recommended:
    description: Request should include test scripts
    message: 'Request "{{path}}" is missing test scripts. Add tests to validate responses.'
    given: $..item[?(@.request)]
    severity: warn
    then:
      field: event
      function: truthy
```

See [SPECTRAL.md](./SPECTRAL.md) for more rule examples.

### 2. Test Spectral Configuration

```bash
# Lint your collections
spectral lint postman/collections/*.postman_collection.json

# Or use the npm script
npm run lint:collections
```

### 3. (Optional) Create Custom Linting Script

For better error messages with request names, create `.spectral/lint-with-names.js`:

```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const glob = require('glob');

const collectionFiles = glob.sync('postman/collections/*.postman_collection.json');

collectionFiles.forEach(file => {
  try {
    execSync(`spectral lint "${file}"`, { stdio: 'inherit' });
  } catch (error) {
    process.exit(1);
  }
});
```

Update your npm script:

```json
{
  "scripts": {
    "lint:collections": "node .spectral/lint-with-names.js"
  }
}
```

## CI/CD Setup

### GitHub Actions

#### 1. Create Workflow Directory

```bash
mkdir -p .github/workflows
```

#### 2. Create Workflow File

Create `.github/workflows/postman-tests.yaml`:

```yaml
name: API Tests

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

      - name: Lint Postman collections
        run: npm run lint:collections

      - name: Start API server
        run: npm start &

      - name: Wait for server
        run: sleep 5

      - name: Run Postman collections
        env:
          POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
        run: |
          postman login --with-api-key "$POSTMAN_API_KEY"
          npm run test:api
```

#### 3. Add Secrets to GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add `POSTMAN_API_KEY` with your Postman API key

Get your API key from: https://web.postman.co/settings/me/api-keys

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
image: node:20

stages:
  - test

test:
  stage: test
  before_script:
    - npm ci
    - curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh
    - export PATH="$PATH:$HOME/.postman"
  script:
    - npm test
    - npm run lint:collections
    - npm start &
    - sleep 5
    - postman login --with-api-key "$POSTMAN_API_KEY"
    - npm run test:api
  variables:
    POSTMAN_API_KEY: $POSTMAN_API_KEY
```

Add `POSTMAN_API_KEY` in GitLab:
**Settings** → **CI/CD** → **Variables**

### CircleCI

Create `.circleci/config.yml`:

```yaml
version: 2.1

jobs:
  test:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "package.json" }}
      - run: npm ci
      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package.json" }}
      - run:
          name: Install Postman CLI
          command: curl -o- "https://dl-cli.pstmn.io/install/unix.sh" | sh
      - run: npm test
      - run: npm run lint:collections
      - run:
          name: Start server
          command: npm start
          background: true
      - run: sleep 5
      - run:
          name: Run Postman collections
          command: |
            postman login --with-api-key "$POSTMAN_API_KEY"
            npm run test:api

workflows:
  test:
    jobs:
      - test
```

## Verification

### 1. Test Pre-Commit Hook

```bash
# Make a small change
echo "# Test" >> README.md

# Stage and commit
git add README.md
git commit -m "test: verify hooks"

# You should see:
# 🔍 Running linter on staged files...
# 🧪 Running tests...
# ⏭️  No Postman collection changes detected, skipping Postman tests
# ✅ All pre-commit checks passed!
```

### 2. Test Postman Collection Locally

```bash
# Run a specific collection
postman collection run postman/collections/your-collection.postman_collection.json

# Or run all collections
npm run test:api
```

### 3. Test Spectral Linting

```bash
# Lint collections
npm run lint:collections

# Expected output if no issues:
# ✨ No issues found in any collections!
```

### 4. Test CI/CD (if configured)

```bash
# Push to trigger CI
git push origin main

# Check the Actions/Pipelines tab in your repository
```

## Troubleshooting

### Hook Not Running

**Problem:** Pre-commit hook doesn't execute when committing.

**Solutions:**

```bash
# Reinstall hooks
npm run prepare

# Verify hook is executable
chmod +x .husky/pre-commit

# Check if husky is installed
ls -la .husky/_/husky.sh
```

### Postman CLI Not Found

**Problem:** `command not found: postman`

**Solutions:**

```bash
# If installed globally, check PATH
echo $PATH

# Reinstall globally
npm install -g postman-cli

# Or use npx
npx postman-cli --version
```

### Authentication Failed

**Problem:** `Error: Authentication failed`

**Solutions:**

```bash
# Re-login
postman login

# Verify authentication
postman whoami

# Use API key directly
postman login --with-api-key YOUR_API_KEY
```

### Spectral Not Linting

**Problem:** Spectral doesn't find any issues or errors out.

**Solutions:**

```bash
# Verify Spectral installation
npx @stoplight/spectral-cli --version

# Test configuration
spectral lint --help

# Validate .spectral.yaml syntax
cat .spectral.yaml
```

### Collection Tests Fail Locally

**Problem:** Collections fail when run locally but should pass.

**Solutions:**

```bash
# Ensure server is running
npm start &

# Wait for server to start
sleep 3

# Run collections
npm run test:api

# Check server logs
npm start  # In one terminal
# Run collections in another terminal
```

### CI/CD Fails

**Problem:** Tests pass locally but fail in CI.

**Common Issues:**

1. **Missing Secrets:**
   - Verify `POSTMAN_API_KEY` is set in CI secrets
   - Check secret name matches workflow file

2. **Server Not Ready:**
   - Add sleep/wait after starting server
   - Use health check endpoint

3. **Dependencies Not Installed:**
   - Use `npm ci` instead of `npm install` in CI
   - Check cache configuration

### Slow Pre-Commit Hook

**Problem:** Commits take too long.

**Solutions:**

1. **Use Conditional Execution:**
   ```bash
   # Only run Postman tests if Postman files changed
   if git diff --cached --name-only | grep -qE "postman/"; then
     npm run test:api
   fi
   ```

2. **Limit Test Scope:**
   - Run only smoke tests in pre-commit
   - Run full suite in CI

3. **Skip Hook Temporarily:**
   ```bash
   git commit --no-verify -m "message"
   ```

## Next Steps

Now that your setup is complete:

1. **Explore Workflows:**
   - [Git Commit Hooks](./COMMIT_HOOKS.md)
   - [CI/CD Integration](./CI_CD.md)
   - [Spectral Linting](./SPECTRAL.md)

2. **Customize:**
   - Add custom Spectral rules
   - Modify pre-commit hook behavior
   - Add more CI/CD workflows

3. **Learn More:**
   - [Quick Reference](./QUICK_REFERENCE.md)
   - [Testing Guide](./TESTING.md)
   - [Main README](../README.md)

## Getting Help

- **Postman Documentation**: https://learning.postman.com/
- **Postman CLI Docs**: https://learning.postman.com/docs/postman-cli/postman-cli-overview/
- **Spectral Documentation**: https://stoplight.io/open-source/spectral
- **Husky Documentation**: https://typicode.github.io/husky/
- **GitHub Issues**: Report problems in this repository

---

**Setup complete?** Head back to the [main README](../README.md) to explore the workflows!
