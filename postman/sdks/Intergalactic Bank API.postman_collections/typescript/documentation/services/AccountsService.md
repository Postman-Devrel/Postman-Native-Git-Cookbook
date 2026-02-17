# AccountsService

A list of all methods in the `AccountsService` service. Click on the method name to view detailed information about that method.

| Methods                         | Description                                                                                                                                                                                                                                                                                                                              |
| :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [createAccount](#createaccount) | Create a new bank account. ## Required Fields - `owner`: Account owner name (string) - `currency`: One of COSMIC_COINS, GALAXY_GOLD, MOON_BUCKS ## Optional Fields - `balance`: Initial balance (non-negative number, defaults to 0) - `accountType`: One of STANDARD, PREMIUM, BUSINESS (defaults to STANDARD)                          |
| [deleteAccount](#deleteaccount) | Delete an account (soft delete). Users can only delete their own accounts. Accounts with transactions are soft-deleted to preserve transaction history.                                                                                                                                                                                  |
| [getAccount](#getaccount)       | Get details of a specific account by ID. Users can only access their own accounts.                                                                                                                                                                                                                                                       |
| [listAccounts](#listaccounts)   | List all accounts owned by the authenticated user. ## Query Parameters - `owner` (optional): Filter by owner name - `createdAt` (optional): Filter by creation date                                                                                                                                                                      |
| [updateAccount](#updateaccount) | Update an existing account. Users can only update their own accounts. ## Updatable Fields - `owner`: Account owner name - `accountType`: One of STANDARD, PREMIUM, BUSINESS ## Non-Updatable Fields - `balance`: Cannot be updated directly (use transactions) - `accountId`: Immutable - `createdAt`: Immutable - `currency`: Immutable |

## createAccount

Create a new bank account. ## Required Fields - `owner`: Account owner name (string) - `currency`: One of COSMIC_COINS, GALAXY_GOLD, MOON_BUCKS ## Optional Fields - `balance`: Initial balance (non-negative number, defaults to 0) - `accountType`: One of STANDARD, PREMIUM, BUSINESS (defaults to STANDARD)

- HTTP Method: `POST`
- Endpoint: `/api/v1/accounts`

**Parameters**

| Name | Type                                                      | Required | Description       |
| :--- | :-------------------------------------------------------- | :------- | :---------------- |
| body | [CreateAccountRequest](../models/CreateAccountRequest.md) | ✅       | The request body. |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { CreateAccountRequest, SdkGenerator } from 'sdk-generator';

(async () => {
  const sdkGenerator = new SdkGenerator({});

  const createAccountRequest: CreateAccountRequest = {
    owner: 'John Doe',
    currency: 'COSMIC_COINS',
    balance: 1000,
    accountType: 'STANDARD',
  };

  const { data } = await sdkGenerator.accounts.createAccount(createAccountRequest);

  console.log(data);
})();
```

## deleteAccount

Delete an account (soft delete). Users can only delete their own accounts. Accounts with transactions are soft-deleted to preserve transaction history.

- HTTP Method: `DELETE`
- Endpoint: `/api/v1/accounts/{accountId}`

**Parameters**

| Name      | Type   | Required | Description                                    |
| :-------- | :----- | :------- | :--------------------------------------------- |
| accountId | string | ✅       | The unique identifier of the account to delete |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { SdkGenerator } from 'sdk-generator';

(async () => {
  const sdkGenerator = new SdkGenerator({});

  const { data } = await sdkGenerator.accounts.deleteAccount('{{accountId}}');

  console.log(data);
})();
```

## getAccount

Get details of a specific account by ID. Users can only access their own accounts.

- HTTP Method: `GET`
- Endpoint: `/api/v1/accounts/{accountId}`

**Parameters**

| Name      | Type   | Required | Description                          |
| :-------- | :----- | :------- | :----------------------------------- |
| accountId | string | ✅       | The unique identifier of the account |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { SdkGenerator } from 'sdk-generator';

(async () => {
  const sdkGenerator = new SdkGenerator({});

  const { data } = await sdkGenerator.accounts.getAccount('{{accountId}}');

  console.log(data);
})();
```

## listAccounts

List all accounts owned by the authenticated user. ## Query Parameters - `owner` (optional): Filter by owner name - `createdAt` (optional): Filter by creation date

- HTTP Method: `GET`
- Endpoint: `/api/v1/accounts`

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { SdkGenerator } from 'sdk-generator';

(async () => {
  const sdkGenerator = new SdkGenerator({});

  const { data } = await sdkGenerator.accounts.listAccounts();

  console.log(data);
})();
```

## updateAccount

Update an existing account. Users can only update their own accounts. ## Updatable Fields - `owner`: Account owner name - `accountType`: One of STANDARD, PREMIUM, BUSINESS ## Non-Updatable Fields - `balance`: Cannot be updated directly (use transactions) - `accountId`: Immutable - `createdAt`: Immutable - `currency`: Immutable

- HTTP Method: `PUT`
- Endpoint: `/api/v1/accounts/{accountId}`

**Parameters**

| Name      | Type                                                      | Required | Description                          |
| :-------- | :-------------------------------------------------------- | :------- | :----------------------------------- |
| body      | [UpdateAccountRequest](../models/UpdateAccountRequest.md) | ✅       | The request body.                    |
| accountId | string                                                    | ✅       | The unique identifier of the account |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { SdkGenerator, UpdateAccountRequest } from 'sdk-generator';

(async () => {
  const sdkGenerator = new SdkGenerator({});

  const updateAccountRequest: UpdateAccountRequest = {
    owner: 'Jane Doe',
    accountType: 'PREMIUM',
  };

  const { data } = await sdkGenerator.accounts.updateAccount('{{accountId}}', updateAccountRequest);

  console.log(data);
})();
```
