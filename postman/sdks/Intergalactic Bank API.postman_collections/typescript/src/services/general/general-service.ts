import { z } from 'zod';
import { BaseService } from '../base-service';
import { ContentType, HttpResponse, SdkConfig } from '../../http/types';
import { RequestBuilder } from '../../http/transport/request-builder';
import { SerializationStyle } from '../../http/serialization/base-serializer';
import { ThrowableError } from '../../http/errors/throwable-error';
import { Environment } from '../../http/environment';

/**
 * Service class for GeneralService operations.
 * Provides methods to interact with GeneralService-related API endpoints.
 * All methods return promises and handle request/response serialization automatically.
 */
export class GeneralService extends BaseService {
  protected healthCheckConfig?: Partial<SdkConfig>;

  protected welcomeConfig?: Partial<SdkConfig>;

  /**
   * Sets method-level configuration for healthCheck.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setHealthCheckConfig(config: Partial<SdkConfig>): this {
    this.healthCheckConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for welcome.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setWelcomeConfig(config: Partial<SdkConfig>): this {
    this.welcomeConfig = config;
    return this;
  }

  /**
   * Check the health status of the API server
   * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
   * @returns {Promise<HttpResponse<any>>} - OK
   */
  async healthCheck(requestConfig?: Partial<SdkConfig>): Promise<HttpResponse<any>> {
    const resolvedConfig = this.getResolvedConfig(this.healthCheckConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('GET')
      .setPath('/health')
      .setRequestSchema(z.any())
      .addApiKeyAuth(resolvedConfig?.apiKey)
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
   * Get welcome message and API information
   * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
   * @returns {Promise<HttpResponse<any>>} - OK
   */
  async welcome(requestConfig?: Partial<SdkConfig>): Promise<HttpResponse<any>> {
    const resolvedConfig = this.getResolvedConfig(this.welcomeConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('GET')
      .setPath('/')
      .setRequestSchema(z.any())
      .addApiKeyAuth(resolvedConfig?.apiKey)
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
