import { Environment } from './http/environment';
import { SdkConfig } from './http/types';
import { AccountsService } from './services/accounts';
import { AuthenticationService } from './services/authentication';
import { GeneralService } from './services/general';
import { TransactionsService } from './services/transactions';

export * from './services/accounts';
export * from './services/authentication';
export * from './services/general';
export * from './services/transactions';

export * from './http';
export { Environment } from './http/environment';

export class SdkGenerator {
  public readonly accounts: AccountsService;

  public readonly authentication: AuthenticationService;

  public readonly general: GeneralService;

  public readonly transactions: TransactionsService;

  constructor(public config: SdkConfig) {
    this.accounts = new AccountsService(this.config);

    this.authentication = new AuthenticationService(this.config);

    this.general = new GeneralService(this.config);

    this.transactions = new TransactionsService(this.config);
  }

  set baseUrl(baseUrl: string) {
    this.accounts.baseUrl = baseUrl;
    this.authentication.baseUrl = baseUrl;
    this.general.baseUrl = baseUrl;
    this.transactions.baseUrl = baseUrl;
  }

  set environment(environment: Environment) {
    this.accounts.baseUrl = environment;
    this.authentication.baseUrl = environment;
    this.general.baseUrl = environment;
    this.transactions.baseUrl = environment;
  }

  set timeoutMs(timeoutMs: number) {
    this.accounts.timeoutMs = timeoutMs;
    this.authentication.timeoutMs = timeoutMs;
    this.general.timeoutMs = timeoutMs;
    this.transactions.timeoutMs = timeoutMs;
  }

  set apiKey(apiKey: string) {
    this.accounts.apiKey = apiKey;
    this.authentication.apiKey = apiKey;
    this.general.apiKey = apiKey;
    this.transactions.apiKey = apiKey;
  }

  set apiKeyHeader(apiKeyHeader: string) {
    this.accounts.apiKeyHeader = apiKeyHeader;
    this.authentication.apiKeyHeader = apiKeyHeader;
    this.general.apiKeyHeader = apiKeyHeader;
    this.transactions.apiKeyHeader = apiKeyHeader;
  }
}

// c029837e0e474b76bc487506e8799df5e3335891efe4fb02bda7a1441840310c
