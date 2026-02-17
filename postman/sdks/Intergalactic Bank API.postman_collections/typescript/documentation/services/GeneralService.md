# GeneralService

A list of all methods in the `GeneralService` service. Click on the method name to view detailed information about that method.

| Methods                     | Description                               |
| :-------------------------- | :---------------------------------------- |
| [healthCheck](#healthcheck) | Check the health status of the API server |
| [welcome](#welcome)         | Get welcome message and API information   |

## healthCheck

Check the health status of the API server

- HTTP Method: `GET`
- Endpoint: `/health`

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { SdkGenerator } from 'sdk-generator';

(async () => {
  const sdkGenerator = new SdkGenerator({});

  const { data } = await sdkGenerator.general.healthCheck();

  console.log(data);
})();
```

## welcome

Get welcome message and API information

- HTTP Method: `GET`
- Endpoint: `/`

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { SdkGenerator } from 'sdk-generator';

(async () => {
  const sdkGenerator = new SdkGenerator({});

  const { data } = await sdkGenerator.general.welcome();

  console.log(data);
})();
```
