import { Request } from '../transport/request';
import { ResponseDefinition } from '../transport/types';
import { ZodUndefined } from 'zod';
import { ContentType, HttpResponse, RequestHandler } from '../types';
import { ResponseMatcher } from '../utils/response-matcher';

/**
 * Request handler that validates and decodes HTTP response bodies.
 * Supports multiple content types including JSON, XML, binary, form data, and event streams.
 */
export class ResponseValidationHandler implements RequestHandler {
  /** Next handler in the chain */
  next?: RequestHandler;

  /**
   * Handles a standard HTTP request and validates its response.
   * @template T - The expected response data type
   * @param request - The HTTP request to process
   * @returns A promise that resolves to the validated HTTP response
   */
  async handle<T>(request: Request): Promise<HttpResponse<T>> {
    const response = await this.next!.handle<T>(request);

    return await this.decodeBodyFromFullResponse<T>(request, response);
  }

  /**
   * Handles a streaming HTTP request and validates response chunks.
   * @template T - The expected response data type for each chunk
   * @param request - The HTTP request to process
   * @returns An async generator that yields validated HTTP responses
   * @throws Error if response headers are enabled (streaming not supported with headers)
   */
  async *stream<T>(request: Request): AsyncGenerator<HttpResponse<T>> {
    throw new Error(
      'Streaming is not supported when responseHeaders is enabled. ' +
        'Disable responseHeaders in SDK generation config to use streaming.',
    );
  }

  private async decodeBodyFromFullResponse<T>(
    request: Request,
    response: HttpResponse<T>,
  ): Promise<HttpResponse<T>> {
    const responseMatcher = new ResponseMatcher(request.responses);
    const responseDefinition = responseMatcher.getResponseDefinition(response);

    if (!responseDefinition || !this.hasContent(responseDefinition, response)) {
      return response;
    }

    // Extract body for validation (client-specific, generated at build time)
    const bodyForValidation = await this.extractBodyForValidation(response.raw);

    // Decode based on content type
    const decodedData = this.decodeFromArrayBuffer<T>(
      request,
      responseDefinition,
      bodyForValidation,
    );

    // Return with validated data but original raw response
    return {
      ...response,
      data: decodedData,
    };
  }

  private async extractBodyForValidation(raw: Response): Promise<ArrayBuffer> {
    return await raw.clone().arrayBuffer();
  }

  private decodeFromArrayBuffer<T>(
    request: Request,
    responseDefinition: ResponseDefinition,
    arrayBuffer: ArrayBuffer,
  ): T {
    const contentType = responseDefinition.contentType;
    const contentTypeHandlers: {
      [key: string]: (req: Request, resDef: ResponseDefinition, ab: ArrayBuffer) => T;
    } = {
      [ContentType.Binary]: (req, resDef, ab) => this.validate<T>(req, resDef, ab),
      [ContentType.Image]: (req, resDef, ab) => this.validate<T>(req, resDef, ab),
      [ContentType.MultipartFormData]: (req, resDef, ab) =>
        this.validate<T>(req, resDef, this.fromFormData(ab)),
      [ContentType.Text]: (req, resDef, ab) =>
        this.validate<T>(req, resDef, new TextDecoder().decode(ab)),
      [ContentType.Xml]: (req, resDef, ab) =>
        this.validate<T>(req, resDef, new TextDecoder().decode(ab)),
      [ContentType.FormUrlEncoded]: (req, resDef, ab) =>
        this.validate<T>(req, resDef, this.fromUrlEncoded(new TextDecoder().decode(ab))),
      [ContentType.EventStream]: (req, resDef, ab) => {
        let decodedBody = new TextDecoder().decode(ab);
        if (decodedBody.startsWith('data: ')) {
          decodedBody = decodedBody.substring(6);
        }
        const json = JSON.parse(decodedBody);
        return this.validate<T>(req, resDef, json);
      },
    };

    if (contentTypeHandlers[contentType]) {
      return contentTypeHandlers[contentType](request, responseDefinition, arrayBuffer);
    }

    // Default to JSON
    const decodedBody = new TextDecoder().decode(arrayBuffer);
    const json = JSON.parse(decodedBody);
    return this.validate<T>(request, responseDefinition, json);
  }

  /**
   * Validates response data against the expected schema if validation is enabled.
   * @template T - The expected data type
   * @param request - The HTTP request containing validation settings
   * @param response - The response definition with schema
   * @param data - The data to validate
   * @returns The validated data (parsed if validation enabled, raw otherwise)
   */
  private validate<T>(request: Request, response: ResponseDefinition, data: any): T {
    if (request.config.validation?.responseValidation ?? true) {
      return response.schema.parse(data);
    }
    return data;
  }

  /**
   * Checks if a response should contain data based on its schema and status.
   * @template T - The response data type
   * @param responseDefinition - The response definition
   * @param response - The HTTP response
   * @returns True if the response should have content, false otherwise
   */
  private hasContent<T>(
    responseDefinition: ResponseDefinition,
    response: HttpResponse<T>,
  ): boolean {
    return (
      !!responseDefinition.schema &&
      !(responseDefinition.schema instanceof ZodUndefined) &&
      response.metadata.status !== 204
    );
  }

  /**
   * Parses URL-encoded data into an object.
   * @param urlEncodedData - The URL-encoded string
   * @returns An object with decoded key-value pairs
   */
  private fromUrlEncoded(urlEncodedData: string): object {
    const pairs = urlEncodedData.split('&');
    const result: Record<string, string> = {};

    pairs.forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key && value !== undefined) {
        result[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });

    return result;
  }

  /**
   * Parses multipart form data into an object.
   * @param arrayBuffer - The raw form data as ArrayBuffer
   * @returns An object with form field names and values
   */
  private fromFormData(arrayBuffer: ArrayBuffer): Record<string, string> {
    const decoder = new TextDecoder();
    const text = decoder.decode(arrayBuffer);

    const boundary = text.split('\r\n')[0];
    const parts = text.split(boundary).slice(1, -1);

    const formDataObj: Record<string, string> = {};

    parts.forEach((part) => {
      const [header, value] = part.split('\r\n\r\n');
      const nameMatch = header.match(/name="([^"]+)"/);
      if (nameMatch) {
        const name = nameMatch[1].trim();
        formDataObj[name] = value?.trim() || '';
      }
    });

    return formDataObj;
  }
}
