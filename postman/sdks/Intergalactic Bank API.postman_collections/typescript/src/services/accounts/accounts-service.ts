import { z } from 'zod';
import { BaseService } from '../base-service';
import { ContentType, HttpResponse, SdkConfig } from '../../http/types';
import { RequestBuilder } from '../../http/transport/request-builder';
import { SerializationStyle } from '../../http/serialization/base-serializer';
import { ThrowableError } from '../../http/errors/throwable-error';
import { Environment } from '../../http/environment';
import { CreateAccountRequest, createAccountRequestRequest } from './models/create-account-request';
import { UpdateAccountRequest, updateAccountRequestRequest } from './models/update-account-request';

/**
 * Service class for AccountsService operations.
 * Provides methods to interact with AccountsService-related API endpoints.
 * All methods return promises and handle request/response serialization automatically.
 */
export class AccountsService extends BaseService {
  protected createAccountConfig?: Partial<SdkConfig>;

  protected deleteAccountConfig?: Partial<SdkConfig>;

  protected getAccountConfig?: Partial<SdkConfig>;

  protected listAccountsConfig?: Partial<SdkConfig>;

  protected updateAccountConfig?: Partial<SdkConfig>;

  /**
   * Sets method-level configuration for createAccount.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setCreateAccountConfig(config: Partial<SdkConfig>): this {
    this.createAccountConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for deleteAccount.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setDeleteAccountConfig(config: Partial<SdkConfig>): this {
    this.deleteAccountConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for getAccount.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setGetAccountConfig(config: Partial<SdkConfig>): this {
    this.getAccountConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for listAccounts.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setListAccountsConfig(config: Partial<SdkConfig>): this {
    this.listAccountsConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for updateAccount.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setUpdateAccountConfig(config: Partial<SdkConfig>): this {
    this.updateAccountConfig = config;
    return this;
  }

  /**
 * Create a new bank account.
## Required Fields
- `owner`: Account owner name (string)
- `currency`: One of COSMIC_COINS, GALAXY_GOLD, MOON_BUCKS

## Optional Fields
- `balance`: Initial balance (non-negative number, defaults to 0)
- `accountType`: One of STANDARD, PREMIUM, BUSINESS (defaults to STANDARD)

 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<any>>} - OK
 */
  async createAccount(
    body: CreateAccountRequest,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<HttpResponse<any>> {
    const resolvedConfig = this.getResolvedConfig(this.createAccountConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('POST')
      .setPath('/api/v1/accounts')
      .setRequestSchema(createAccountRequestRequest)
      .addApiKeyAuth(resolvedConfig?.apiKey, 'x-api-key')
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .addHeaderParam({ key: 'Content-Type', value: 'application/json' })
      .addBody(body)
      .build();
    return this.client.call<any>(request);
  }

  /**
 * Delete an account (soft delete).
Users can only delete their own accounts.
Accounts with transactions are soft-deleted to preserve transaction history.

 * @param {string} accountId - The unique identifier of the account to delete
 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<any>>} - OK
 */
  async deleteAccount(
    accountId: string,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<HttpResponse<any>> {
    const resolvedConfig = this.getResolvedConfig(this.deleteAccountConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('DELETE')
      .setPath('/api/v1/accounts/{accountId}')
      .setRequestSchema(z.any())
      .addApiKeyAuth(resolvedConfig?.apiKey, 'x-api-key')
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .addPathParam({
        key: 'accountId',
        value: accountId,
      })
      .build();
    return this.client.call<any>(request);
  }

  /**
 * Get details of a specific account by ID.
Users can only access their own accounts.

 * @param {string} accountId - The unique identifier of the account
 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<any>>} - OK
 */
  async getAccount(
    accountId: string,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<HttpResponse<any>> {
    const resolvedConfig = this.getResolvedConfig(this.getAccountConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('GET')
      .setPath('/api/v1/accounts/{accountId}')
      .setRequestSchema(z.any())
      .addApiKeyAuth(resolvedConfig?.apiKey, 'x-api-key')
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .addPathParam({
        key: 'accountId',
        value: accountId,
      })
      .build();
    return this.client.call<any>(request);
  }

  /**
 * List all accounts owned by the authenticated user.
## Query Parameters
- `owner` (optional): Filter by owner name
- `createdAt` (optional): Filter by creation date

 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<any>>} - OK
 */
  async listAccounts(requestConfig?: Partial<SdkConfig>): Promise<HttpResponse<any>> {
    const resolvedConfig = this.getResolvedConfig(this.listAccountsConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('GET')
      .setPath('/api/v1/accounts')
      .setRequestSchema(z.any())
      .addApiKeyAuth(resolvedConfig?.apiKey, 'x-api-key')
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .build();
    return this.client.call<any>(request);
  }

  /**
 * Update an existing account.
Users can only update their own accounts.

## Updatable Fields
- `owner`: Account owner name
- `accountType`: One of STANDARD, PREMIUM, BUSINESS

## Non-Updatable Fields
- `balance`: Cannot be updated directly (use transactions)
- `accountId`: Immutable
- `createdAt`: Immutable
- `currency`: Immutable

 * @param {string} accountId - The unique identifier of the account
 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<any>>} - OK
 */
  async updateAccount(
    accountId: string,
    body: UpdateAccountRequest,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<HttpResponse<any>> {
    const resolvedConfig = this.getResolvedConfig(this.updateAccountConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('PUT')
      .setPath('/api/v1/accounts/{accountId}')
      .setRequestSchema(updateAccountRequestRequest)
      .addApiKeyAuth(resolvedConfig?.apiKey, 'x-api-key')
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .addPathParam({
        key: 'accountId',
        value: accountId,
      })
      .addHeaderParam({ key: 'Content-Type', value: 'application/json' })
      .addBody(body)
      .build();
    return this.client.call<any>(request);
  }
}
