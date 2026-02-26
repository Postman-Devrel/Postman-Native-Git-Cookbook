# Quick Reference - Pre-Commit Hooks & Postman CLI

## 🎯 What's Set Up

✅ **ESLint** - Code linting  
✅ **Jest** - Unit & integration tests  
✅ **Husky** - Git hooks manager  
✅ **lint-staged** - Run linter on staged files only  
✅ **Postman CLI** - API testing tool (ready to activate)

## Quick Commands

```bash
# Lint Postman collections (uses .spectral.yaml)
npm run lint:collections

# Lint OpenAPI specs in postman/specs/ (uses .spectral-openapi.yaml)
npm run lint:specs

# Install git hooks
npm run prepare

# Git operations
git commit -m "message"   # Runs pre-commit hook automatically
git commit --no-verify    # Skip hooks (emergency only)

# Publish to Postman Cloud (only run on main, not manually)
postman workspace push -y
```

## 📬 Activate Postman CLI in Pre-Commit

### Option 1: Always Run (Thorough)
```bash
# Edit .husky/pre-commit, add at the end:
echo "📬 Running Postman API tests..."
postman collection run
```

### Option 2: Conditional Run (Fast - Recommended)
```bash
# Edit .husky/pre-commit, add at the end:
if git diff --cached --name-only | grep -qE "src/routes|src/middleware"; then
  echo "📬 Running Postman tests..."
  postman collection run
fi
```

### Option 3: Use Ready-Made Examples
```bash
# Copy from 10 pre-made examples:
cat .husky/pre-commit-examples.sh

# Pick one and copy to .husky/pre-commit
```

## Documentation Files

| File | Purpose |
|------|---------|
| `SETUP.md` | Initial setup from scratch |
| `COMMIT_HOOKS.md` | Git hooks setup and patterns |
| `CI_CD.md` | GitHub Actions, GitLab CI, CircleCI templates |
| `SPECTRAL.md` | Spectral linting for collections and OpenAPI specs |
| `WORKSPACE_PUSH.md` | `postman workspace push` reference |
| `TESTING.md` | Testing patterns and strategies |
| `.husky/pre-commit-examples.sh` | 10 ready-to-use hook patterns |
| `QUICK_REFERENCE.md` | This file |

## 🔧 First Time Postman Setup

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Login to Postman
postman login

# 3. Test Postman CLI manually
postman collection run

# 4. Add to pre-commit hook (choose option above)
nano .husky/pre-commit  # or use your editor

# 5. Test it!
git add .
git commit -m "test: postman integration"
```

## 🎨 Customization Examples

### Run Postman with environment
```bash
postman collection run <collection-id> -e <environment-id>
```

### Run with custom variables
```bash
postman collection run \
  --env-var "baseUrl=http://localhost:3000" \
  --env-var "apiKey=test-key"
```

### Run local collection file
```bash
postman collection run ".postman/collections/[Blueprint] Intergalactic Bank API Reference Documentation.postman_collection.json"
```

### Silent mode (less output)
```bash
postman collection run --silent
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Hook not running | `npm run prepare` |
| Postman not authenticated | `postman login` |
| Tests too slow | Use conditional execution (Option 2) |
| Server not available | Add server start/stop to hook |
| Want to skip once | `git commit --no-verify` |

## 📖 Learn More

- **Postman CLI**: See `POSTMAN_CLI_GUIDE.md`
- **Git Hooks**: See `COMMIT_HOOKS.md`
- **Husky Docs**: https://typicode.github.io/husky/

## 🎯 Recommended Setup

For the best balance of speed and coverage:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running linter on staged files..."
npx lint-staged

echo "🧪 Running Jest tests..."
npm test

# Only run Postman if API files changed
if git diff --cached --name-only | grep -qE "src/routes|src/middleware"; then
  echo "📬 API changed - Running Postman tests..."
  postman collection run
else
  echo "⏭️  No API changes, skipping Postman tests"
fi

echo "✅ All checks passed!"
```

**Why this is recommended:**
- ✅ Fast: Postman only runs when needed
- ✅ Thorough: Covers all API changes
- ✅ Efficient: Doesn't slow down non-API commits

---

**Need help?** Check the documentation files listed above! 📚

