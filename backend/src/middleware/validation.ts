import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodSchema } from "zod";

// Interface for validation schema
interface ValidationSchema {
	params?: ZodSchema<any>;
	query?: ZodSchema<any>;
	body?: ZodSchema<any>;
}

// Custom error class for validation errors
export class ValidationError extends Error {
	public statusCode: number = 400;
	public issues: z.ZodIssue[];

	constructor(issues: z.ZodIssue[]) {
		super("Validation failed");
		this.name = "ValidationError";
		this.issues = issues;
	}
}

/**
 * Middleware factory that validates request parameters, query, and body using Zod schemas
 * @param schema Object containing optional params, query, and body schemas
 * @returns Express middleware function
 */
export const validate = (schema: ValidationSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			// Validate params if schema provided
			if (schema.params) {
				const result = schema.params.safeParse(req.params);
				if (!result.success) {
					throw new ValidationError(result.error.issues);
				}
				req.params = result.data;
			}

			// Validate query if schema provided
			if (schema.query) {
				const result = schema.query.safeParse(req.query);
				if (!result.success) {
					throw new ValidationError(result.error.issues);
				}
				req.query = result.data;
			}

			// Validate body if schema provided
			if (schema.body) {
				const result = schema.body.safeParse(req.body);
				if (!result.success) {
					throw new ValidationError(result.error.issues);
				}
				req.body = result.data;
			}

			next();
		} catch (error) {
			next(error);
		}
	};
};

/**
 * Helper function to extract specific parts of a validation schema
 * @param fullSchema The complete validation schema
 * @returns Object with individual schemas
 */
export const extractSchemas = (fullSchema: z.ZodObject<any>) => {
	const shape = fullSchema.shape;
	return {
		params: shape.params || undefined,
		query: shape.query || undefined,
		body: shape.body || undefined,
	};
};

/**
 * Convenience function to validate just the request body
 * @param bodySchema Zod schema for request body
 * @returns Express middleware function
 */
export const validateBody = (bodySchema: ZodSchema<any>) => {
	return validate({ body: bodySchema });
};

/**
 * Convenience function to validate just the query parameters
 * @param querySchema Zod schema for query parameters
 * @returns Express middleware function
 */
export const validateQuery = (querySchema: ZodSchema<any>) => {
	return validate({ query: querySchema });
};

/**
 * Convenience function to validate just the route parameters
 * @param paramsSchema Zod schema for route parameters
 * @returns Express middleware function
 */
export const validateParams = (paramsSchema: ZodSchema<any>) => {
	return validate({ params: paramsSchema });
};
