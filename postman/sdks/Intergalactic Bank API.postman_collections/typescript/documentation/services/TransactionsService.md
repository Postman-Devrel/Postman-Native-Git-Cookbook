# TransactionsService

A list of all methods in the `TransactionsService` service. Click on the method name to view detailed information about that method.

| Methods                                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [createTransaction](#createtransaction) | Create a new transaction (transfer or deposit). ## Required Fields - `fromAccountId`: Source account ID (use "0" for deposits from external source) - `toAccountId`: Destination account ID - `amount`: Transaction amount (positive number) - `currency`: Must match the account currency (COSMIC_COINS, GALAXY_GOLD, or MOON_BUCKS) ## Validation Rules - Source account must have sufficient funds (for transfers) - Currency must match both source and destination accounts - Amount must be a positive number |
| [getTransaction](#gettransaction)       | Get details of a specific transaction by ID.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [listTransactions](#listtransactions)   | List all transactions with optional filters. ## Query Parameters - `fromAccountId` (optional): Filter by source account - `toAccountId` (optional): Filter by destination account - `createdAt` (optional): Filter by creation date                                                                                                                                                                                                                                                                                 |

## createTransaction

Create a new transaction (transfer or deposit). ## Required Fields - `fromAccountId`: Source account ID (use "0" for deposits from external source) - `toAccountId`: Destination account ID - `amount`: Transaction amount (positive number) - `currency`: Must match the account currency (COSMIC_COINS, GALAXY_GOLD, or MOON_BUCKS) ## Validation Rules - Source account must have sufficient funds (for transfers) - Currency must match both source and destination accounts - Amount must be a positive number

- HTTP Method: `POST`
- Endpoint: `/api/v1/transactions`

**Parameters**

| Name | Type                                                              | Required | Description       |
| :--- | :---------------------------------------------------------------- | :------- | :---------------- |
| body | [CreateTransactionRequest](../models/CreateTransactionRequest.md) | ✅       | The request body. |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { CreateTransactionRequest, SdkGenerator } from 'sdk-generator';

(async () => {
  const sdkGenerator = new SdkGenerator({});

  const createTransactionRequest: CreateTransactionRequest = {
    fromAccountId: '0',
    toAccountId: '{{accountId}}',
    amount: 500,
    currency: 'COSMIC_COINS',
  };

  const { data } = await sdkGenerator.transactions.createTransaction(createTransactionRequest);

  console.log(data);
})();
```

## getTransaction

Get details of a specific transaction by ID.

- HTTP Method: `GET`
- Endpoint: `/api/v1/transactions/{transactionId}`

**Parameters**

| Name          | Type   | Required | Description                              |
| :------------ | :----- | :------- | :--------------------------------------- |
| transactionId | string | ✅       | The unique identifier of the transaction |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { SdkGenerator } from 'sdk-generator';

(async () => {
  const sdkGenerator = new SdkGenerator({});

  const { data } = await sdkGenerator.transactions.getTransaction('{{transactionId}}');

  console.log(data);
})();
```

## listTransactions

List all transactions with optional filters. ## Query Parameters - `fromAccountId` (optional): Filter by source account - `toAccountId` (optional): Filter by destination account - `createdAt` (optional): Filter by creation date

- HTTP Method: `GET`
- Endpoint: `/api/v1/transactions`

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { SdkGenerator } from 'sdk-generator';

(async () => {
  const sdkGenerator = new SdkGenerator({});

  const { data } = await sdkGenerator.transactions.listTransactions();

  console.log(data);
})();
```
