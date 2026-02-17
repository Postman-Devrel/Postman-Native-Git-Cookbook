# Postman Artifacts

This directory contains example Postman collections, environments, and other artifacts to demonstrate the cookbook workflows.

## ⚠️ Important Note

**These are EXAMPLE/TEMPLATE collections.** They reference the "Intergalactic Bank API" which was removed from this cookbook to keep it focused on workflow patterns.

## What's Included

### Collections

The collections in `collections/` demonstrate:
- ✅ Proper structure and organization
- ✅ Test scripts for API validation
- ✅ Environment variable usage (no hardcoded values)
- ✅ Request descriptions and documentation
- ✅ Pre-request scripts
- ✅ Response examples

**Use these as:**
- Reference examples when creating your own collections
- Templates to understand best practices
- Test subjects for Spectral linting rules

### Environments

`environments/` contains example environment files showing:
- Variable structure
- Naming conventions
- Separation of environment-specific values

### Globals

`globals/` contains workspace-level variables.

### SDKs

`sdks/` contains example SDK generated from Postman collections (for reference).

## How to Use These Examples

### Option 1: Replace with Your Collections

```bash
# Remove example collections
rm -rf postman/collections/*

# Add your own Postman collections
# (Export from Postman or sync via Native Git)
cp /path/to/your/collections/*.json postman/collections/
```

### Option 2: Keep as Reference

Keep these example collections to:
- Test your Spectral rules
- Validate your workflow setup
- Reference when creating new collections

### Option 3: Test Against Mock API

If you want to run these collections:
1. Create a simple mock API matching the endpoints
2. Update environment files with your API URL
3. Run: `postman collection run postman/collections/*.json`

## Collection Best Practices (Demonstrated Here)

### 1. Use Environment Variables

```json
{
  "url": "{{baseUrl}}/api/accounts",
  "header": [
    {
      "key": "x-api-key",
      "value": "{{apiKey}}"
    }
  ]
}
```

### 2. Include Test Scripts

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has expected structure", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
});
```

### 3. Organize in Folders

```
Collection
├── Authentication
│   └── Generate API Key
├── Accounts
│   ├── List Accounts
│   ├── Create Account
│   └── Get Account
└── Transactions
    ├── Create Transaction
    └── List Transactions
```

### 4. Document Everything

- Collection description
- Folder descriptions
- Request descriptions
- Response examples

## Linting These Collections

Test Spectral rules against these collections:

```bash
# Lint all collections
npm run lint:collections

# Or use Spectral directly
spectral lint postman/collections/*.postman_collection.json
```

Expected output: The example collections follow best practices and should pass all linting rules (except those requiring a running API).

## Environment Files

### Structure

```json
{
  "name": "Development",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "enabled": true
    },
    {
      "key": "apiKey",
      "value": "{{$randomUUID}}",
      "enabled": true
    }
  ]
}
```

### Usage

```bash
# Run collection with environment
postman collection run \
  postman/collections/your-api.json \
  --environment postman/environments/dev.json
```

## Next Steps

1. **Replace examples** with your actual collections
2. **Update environments** with your API details
3. **Test workflows** with your collections
4. **Customize Spectral rules** in `.spectral.yaml`

## Learn More

- [Main README](../README.md) - Cookbook overview
- [Setup Guide](../docs/SETUP.md) - Getting started
- [Spectral Guide](../docs/SPECTRAL.md) - Collection linting
- [CI/CD Guide](../docs/CI_CD.md) - Automation workflows
