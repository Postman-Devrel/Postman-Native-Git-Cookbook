import { SdkGenerator } from 'sdk-generator';

(async () => {
  const sdkGenerator = new SdkGenerator({});

  const { data } = await sdkGenerator.accounts.listAccounts();

  console.log(data);
})();
