import { z } from 'zod';

/**
 * Zod schema for the CreateAccountRequest model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const createAccountRequest = z.lazy(() => {
  return z.object({
    owner: z.string().optional(),
    currency: z.string().optional(),
    balance: z.number().optional(),
    accountType: z.string().optional(),
  });
});

/**
 *
 * @typedef  {CreateAccountRequest} createAccountRequest
 * @property {string}
 * @property {string}
 * @property {number}
 * @property {string}
 */
export type CreateAccountRequest = z.infer<typeof createAccountRequest>;

/**
 * Zod schema for mapping API responses to the CreateAccountRequest application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const createAccountRequestResponse = z.lazy(() => {
  return z
    .object({
      owner: z.string().optional(),
      currency: z.string().optional(),
      balance: z.number().optional(),
      accountType: z.string().optional(),
    })
    .transform((data) => ({
      owner: data['owner'],
      currency: data['currency'],
      balance: data['balance'],
      accountType: data['accountType'],
    }));
});

/**
 * Zod schema for mapping the CreateAccountRequest application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const createAccountRequestRequest = z.lazy(() => {
  return z
    .object({
      owner: z.string().optional(),
      currency: z.string().optional(),
      balance: z.number().optional(),
      accountType: z.string().optional(),
    })
    .transform((data) => ({
      owner: data['owner'],
      currency: data['currency'],
      balance: data['balance'],
      accountType: data['accountType'],
    }));
});
