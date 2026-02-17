import { z } from 'zod';

/**
 * Zod schema for the CreateTransactionRequest model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const createTransactionRequest = z.lazy(() => {
  return z.object({
    fromAccountId: z.string().optional(),
    toAccountId: z.string().optional(),
    amount: z.number().optional(),
    currency: z.string().optional(),
  });
});

/**
 *
 * @typedef  {CreateTransactionRequest} createTransactionRequest
 * @property {string}
 * @property {string}
 * @property {number}
 * @property {string}
 */
export type CreateTransactionRequest = z.infer<typeof createTransactionRequest>;

/**
 * Zod schema for mapping API responses to the CreateTransactionRequest application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const createTransactionRequestResponse = z.lazy(() => {
  return z
    .object({
      fromAccountId: z.string().optional(),
      toAccountId: z.string().optional(),
      amount: z.number().optional(),
      currency: z.string().optional(),
    })
    .transform((data) => ({
      fromAccountId: data['fromAccountId'],
      toAccountId: data['toAccountId'],
      amount: data['amount'],
      currency: data['currency'],
    }));
});

/**
 * Zod schema for mapping the CreateTransactionRequest application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const createTransactionRequestRequest = z.lazy(() => {
  return z
    .object({
      fromAccountId: z.string().optional(),
      toAccountId: z.string().optional(),
      amount: z.number().optional(),
      currency: z.string().optional(),
    })
    .transform((data) => ({
      fromAccountId: data['fromAccountId'],
      toAccountId: data['toAccountId'],
      amount: data['amount'],
      currency: data['currency'],
    }));
});
