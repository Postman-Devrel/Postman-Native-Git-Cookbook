import { z } from 'zod';
import { BaseService } from '../base-service';
import { ContentType, HttpResponse, SdkConfig } from '../../http/types';
import { RequestBuilder } from '../../http/transport/request-builder';
import { SerializationStyle } from '../../http/serialization/base-serializer';
import { ThrowableError } from '../../http/errors/throwable-error';
import { Environment } from '../../http/environment';

/**
 * Service class for AuthenticationService operations.
 * Provides methods to interact with AuthenticationService-related API endpoints.
 * All methods return promises and handle request/response serialization automatically.
 */
export class AuthenticationService extends BaseService {
  protected generateApiKeyConfig?: Partial<SdkConfig>;

  /**
   * Sets method-level configuration for generateApiKey.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setGenerateApiKeyConfig(config: Partial<SdkConfig>): this {
    this.generateApiKeyConfig = config;
    return this;
  }

  /**
 * Generate a new API key for authentication.
The returned API key should be used in the `x-api-key` header for all authenticated requests.

 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<any>>} - OK
 */
  async generateApiKey(requestConfig?: Partial<SdkConfig>): Promise<HttpResponse<any>> {
    const resolvedConfig = this.getResolvedConfig(this.generateApiKeyConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('GET')
      .setPath('/api/v1/auth')
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
