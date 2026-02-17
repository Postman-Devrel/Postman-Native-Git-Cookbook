import { z } from 'zod';
import { BaseService } from '../base-service';
import { ContentType, HttpResponse, SdkConfig } from '../../http/types';
import { RequestBuilder } from '../../http/transport/request-builder';
import { SerializationStyle } from '../../http/serialization/base-serializer';
import { ThrowableError } from '../../http/errors/throwable-error';
import { Environment } from '../../http/environment';
import {
  CreateTransactionRequest,
  createTransactionRequestRequest,
} from './models/create-transaction-request';

/**
 * Service class for TransactionsService operations.
 * Provides methods to interact with TransactionsService-related API endpoints.
 * All methods return promises and handle request/response serialization automatically.
 */
export class TransactionsService extends BaseService {
  protected createTransactionConfig?: Partial<SdkConfig>;

  protected getTransactionConfig?: Partial<SdkConfig>;

  protected listTransactionsConfig?: Partial<SdkConfig>;

  /**
   * Sets method-level configuration for createTransaction.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setCreateTransactionConfig(config: Partial<SdkConfig>): this {
    this.createTransactionConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for getTransaction.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setGetTransactionConfig(config: Partial<SdkConfig>): this {
    this.getTransactionConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for listTransactions.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setListTransactionsConfig(config: Partial<SdkConfig>): this {
    this.listTransactionsConfig = config;
    return this;
  }

  /**
 * Create a new transaction (transfer or deposit).
## Required Fields
- `fromAccountId`: Source account ID (use "0" for deposits from external source)
- `toAccountId`: Destination account ID
- `amount`: Transaction amount (positive number)
- `currency`: Must match the account currency (COSMIC_COINS, GALAXY_GOLD, or MOON_BUCKS)

## Validation Rules
- Source account must have sufficient funds (for transfers)
- Currency must match both source and destination accounts
- Amount must be a positive number

 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<any>>} - OK
 */
  async createTransaction(
    body: CreateTransactionRequest,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<HttpResponse<any>> {
    const resolvedConfig = this.getResolvedConfig(this.createTransactionConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('POST')
      .setPath('/api/v1/transactions')
      .setRequestSchema(createTransactionRequestRequest)
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
   * Get details of a specific transaction by ID.
   * @param {string} transactionId - The unique identifier of the transaction
   * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
   * @returns {Promise<HttpResponse<any>>} - OK
   */
  async getTransaction(
    transactionId: string,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<HttpResponse<any>> {
    const resolvedConfig = this.getResolvedConfig(this.getTransactionConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('GET')
      .setPath('/api/v1/transactions/{transactionId}')
      .setRequestSchema(z.any())
      .addApiKeyAuth(resolvedConfig?.apiKey, 'x-api-key')
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .addPathParam({
        key: 'transactionId',
        value: transactionId,
      })
      .build();
    return this.client.call<any>(request);
  }

  /**
 * List all transactions with optional filters.
## Query Parameters
- `fromAccountId` (optional): Filter by source account
- `toAccountId` (optional): Filter by destination account
- `createdAt` (optional): Filter by creation date

 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<any>>} - OK
 */
  async listTransactions(requestConfig?: Partial<SdkConfig>): Promise<HttpResponse<any>> {
    const resolvedConfig = this.getResolvedConfig(this.listTransactionsConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('GET')
      .setPath('/api/v1/transactions')
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
}
