# Git Commit Hooks

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to run checks before each commit.

## What runs on commit

When you `git commit`, the hook typically:

1. **Lint** — lint-staged runs linters (e.g. ESLint, Prettier) on staged files only.
2. **Tests** — optional: unit/integration tests if you add them.
3. **Postman** — optional: lint collections and/or run API tests when `postman/` (or API code) changed.

Exact behavior is in `.husky/pre-commit` and `package.json` (`lint-staged`).

## Configuration

- **`.husky/pre-commit`** — Script that runs before every commit.
- **`package.json`** — `lint-staged` config (e.g. which files trigger which commands).

## Adding Postman to the hook

- **Examples:** See `.husky/pre-commit-examples.sh` for several patterns (always run, conditional run, etc.).
- **Recommended:** Run Postman only when API or collection files changed so commits stay fast.

```bash
# Example: lint collections when postman files changed
if git diff --cached --name-only | grep -qE "postman/"; then
  npm run lint:collections
fi
```

## Bypassing hooks

```bash
git commit --no-verify -m "message"
```

Use only when necessary; hooks are there to keep quality.

## Troubleshooting

| Problem | Fix |
|--------|-----|
| Hook not running | `npm run prepare`; ensure `.husky/pre-commit` is executable |
| Run checks manually | `npm run lint` / `npm test` / `npm run lint:collections` |
| Change behavior | Edit `.husky/pre-commit` |

New clones get hooks automatically after `npm install` (via the `prepare` script).
