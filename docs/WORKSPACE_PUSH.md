# postman workspace push

## What it does

`postman workspace push` syncs your local `postman/` folder to the **Cloud View** of your Postman workspace — the handoff from git (Local View) to what consumers and the API Catalog see.

```
Local View (git)  →  postman workspace push  →  Cloud View (consumers)
```

Until you push, Cloud View does not change.

## The `-y` flag

In CI the CLI would otherwise prompt for confirmation. Use:

```bash
postman workspace push -y
```

Always use `-y` in CI so the job doesn’t hang.

## Authentication

```bash
postman login --with-api-key "$POSTMAN_API_KEY"
postman workspace push -y
```

Store `POSTMAN_API_KEY` in GitHub **Settings → Secrets and variables → Actions**. Never put it in the workflow file.

## When to run

**Only on merges to `main`, never on pull requests.**

```yaml
- name: Publish workspace to Postman Cloud
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  env:
    POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
  run: |
    postman login --with-api-key "$POSTMAN_API_KEY"
    postman workspace push -y
```

Typical flow: pre-commit (local) → CI lint + collection run (on PR) → merge → push to Cloud (on main).

## On failure

If the command fails, the job fails and Cloud View is not updated. Common causes: invalid/expired API key, workspace not connected to Native Git, or network/API issues. Fix and re-run.

## Verifying success

In Postman Desktop, switch to **Cloud View** and confirm collections/version look correct. Or call the Postman API with your key to check collection metadata.

## collection run vs workspace push

| Command                  | Purpose                                 | When                              |
| ------------------------ | --------------------------------------- | --------------------------------- |
| `postman collection run` | Run requests and tests against your API | Every PR/push (validation)        |
| `postman workspace push` | Publish workspace to Postman Cloud      | Merge to main only (distribution) |

Run collections to validate; push to distribute.
