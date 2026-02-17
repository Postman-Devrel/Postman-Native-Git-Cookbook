import { z } from 'zod';

/**
 * Zod schema for the UpdateAccountRequest model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const updateAccountRequest = z.lazy(() => {
  return z.object({
    owner: z.string().optional(),
    accountType: z.string().optional(),
  });
});

/**
 *
 * @typedef  {UpdateAccountRequest} updateAccountRequest
 * @property {string}
 * @property {string}
 */
export type UpdateAccountRequest = z.infer<typeof updateAccountRequest>;

/**
 * Zod schema for mapping API responses to the UpdateAccountRequest application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const updateAccountRequestResponse = z.lazy(() => {
  return z
    .object({
      owner: z.string().optional(),
      accountType: z.string().optional(),
    })
    .transform((data) => ({
      owner: data['owner'],
      accountType: data['accountType'],
    }));
});

/**
 * Zod schema for mapping the UpdateAccountRequest application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const updateAccountRequestRequest = z.lazy(() => {
  return z
    .object({
      owner: z.string().optional(),
      accountType: z.string().optional(),
    })
    .transform((data) => ({
      owner: data['owner'],
      accountType: data['accountType'],
    }));
});
