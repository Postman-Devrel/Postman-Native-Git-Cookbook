# Quick Reference

## Commands

```bash
npm run lint:collections   # Lint collections (Spectral)
npm run lint:specs         # Lint OpenAPI specs
npm run prepare            # Install git hooks

git commit -m "msg"        # Runs pre-commit hook
git commit --no-verify     # Skip hooks (emergency only)

postman workspace push -y  # Publish to Postman Cloud (use only on main in CI)
```

## First-time Postman setup

```bash
npm install
postman login
postman collection run postman/collections/your-collection.postman_collection.json  # Test
```

Then add Postman to `.husky/pre-commit` if desired — see [COMMIT_HOOKS.md](./COMMIT_HOOKS.md) and `.husky/pre-commit-examples.sh`.

## Postman CLI options

```bash
# With environment
postman collection run collection.json --environment env.json

# Custom variables
postman collection run collection.json --env-var "baseUrl=http://localhost:3000"

# Less output
postman collection run collection.json --silent
```

## Docs

| File                                     | Purpose                  |
| ---------------------------------------- | ------------------------ |
| [SETUP.md](./SETUP.md)                   | Initial setup            |
| [COMMIT_HOOKS.md](./COMMIT_HOOKS.md)     | Git hooks                |
| [CI_CD.md](./CI_CD.md)                   | GitHub Actions           |
| [SPECTRAL.md](./SPECTRAL.md)             | Linting                  |
| [WORKSPACE_PUSH.md](./WORKSPACE_PUSH.md) | `postman workspace push` |
| [TESTING.md](./TESTING.md)               | Testing patterns         |
| `.husky/pre-commit-examples.sh`          | Hook examples            |

## Troubleshooting

| Problem           | Solution                                     |
| ----------------- | -------------------------------------------- |
| Hook not running  | `npm run prepare`                            |
| Not authenticated | `postman login`                              |
| Tests too slow    | Run Postman only when API/collections change |
| Skip hook once    | `git commit --no-verify`                     |
