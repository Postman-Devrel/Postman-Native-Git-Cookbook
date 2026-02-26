# postman workspace push

## What It Does

`postman workspace push` syncs the current state of your local `postman/` folder to the Cloud View of your Postman Workspace. This is the handoff point between the development phase (git) and the distribution phase (Postman Cloud).

Until this command runs, your consumers see nothing. Changes committed to git stay in the Local View — the editable, git-backed state visible only to contributors with repo access. The Cloud View — what the API Catalog, monitors, and consumers depend on — only updates when you explicitly push.

```
Local View (git)  →  postman workspace push  →  Cloud View (consumers)
```

## The `-y` Flag

In CI environments, the CLI prompts for confirmation before pushing. The `-y` flag skips that prompt:

```bash
postman workspace push -y
```

Always use `-y` in CI. Without it, the workflow will hang waiting for input that never comes.

## Authentication

The push requires a Postman API key. In CI:

```bash
postman login --with-api-key "$POSTMAN_API_KEY"
postman workspace push -y
```

Store `POSTMAN_API_KEY` in GitHub → *Settings → Secrets and variables → Actions*. Never put it in the workflow file.

## When to Run It

**Only on merges to `main`. Never on pull requests.**

```yaml
- name: Publish workspace to Postman Cloud
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  env:
    POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
  run: |
    postman login --with-api-key "$POSTMAN_API_KEY"
    postman workspace push -y
```

Running on PRs would push unreviewed, potentially broken changes to the Cloud View your consumers depend on. The Cloud View should always reflect a validated, reviewed, merged state.

The full gate sequence before a push should reach Cloud:

```
pre-commit hook (local) → CI lint + collection run (on PR) → merge → CI push (on main)
```

## What Happens on Failure

If `postman workspace push` fails, the CI job fails and the Cloud View is not updated. Your consumers continue to see the last successfully pushed state — no partial update, no broken state published.

Common causes of failure:
- **Invalid or expired `POSTMAN_API_KEY`** — rotate the secret in GitHub and Postman
- **Workspace not connected to a local path** — the workspace must be connected to Native Git before push will work; verify in Postman Desktop under Local View settings
- **Network or Postman API outage** — re-run the workflow once the issue clears

## Verifying the Push Succeeded

After the CI workflow completes:

1. Open Postman Desktop
2. Switch to **Cloud View** in the footer bar
3. Confirm the collection version, endpoint list, or changelog reflects your merged changes

You can also check the Postman API directly:

```bash
curl -s "https://api.getpostman.com/collections" \
  -H "X-Api-Key: $POSTMAN_API_KEY" | jq '.collections[] | {name, updatedAt}'
```

## Relationship to `postman workspace push` vs. `postman collection run`

These are separate commands with different purposes:

| Command | What it does | When it runs |
|---|---|---|
| `postman collection run` | Executes requests and tests against your API | On every PR and push (validation) |
| `postman workspace push` | Publishes the workspace state to Postman Cloud | On merge to `main` only (distribution) |

Run collections to validate. Push to distribute. Never conflate the two.
