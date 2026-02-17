# AuthenticationService

A list of all methods in the `AuthenticationService` service. Click on the method name to view detailed information about that method.

| Methods                           | Description                                                                                                                              |
| :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| [generateApiKey](#generateapikey) | Generate a new API key for authentication. The returned API key should be used in the `x-api-key` header for all authenticated requests. |

## generateApiKey

Generate a new API key for authentication. The returned API key should be used in the `x-api-key` header for all authenticated requests.

- HTTP Method: `GET`
- Endpoint: `/api/v1/auth`

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { SdkGenerator } from 'sdk-generator';

(async () => {
  const sdkGenerator = new SdkGenerator({});

  const { data } = await sdkGenerator.authentication.generateApiKey();

  console.log(data);
})();
```
