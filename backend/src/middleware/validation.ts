import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

// extend Request interface to include validated data
export interface ValidatedRequest<T = any, U = any, V = any> extends Request {
	validatedParams?: T;
	validatedQuery?: U;
	validatedBody?: V;
}

// interface for validation schema
interface ValidationSchema {
	params?: ZodSchema<any>;
	query?: ZodSchema<any>;
	body?: ZodSchema<any>;
}

// custom error class for validation errors
export class ValidationError extends Error {
	public statusCode: number = 400;
	public issues: z.ZodIssue[];

	constructor(issues: z.ZodIssue[]) {
		super("Validation failed");
		this.name = "ValidationError";
		this.issues = issues;
	}
}

// middleware factory that validates request parameters, query, and body using zod schemas
export const validate = (schema: ValidationSchema) => {
	return (req: ValidatedRequest, res: Response, next: NextFunction) => {
		try {
			// validate params if schema provided
			if (schema.params) {
				const result = schema.params.safeParse(req.params);
				if (!result.success) {
					throw new ValidationError(result.error.issues);
				}
				req.validatedParams = result.data;
			}

			// validate query if schema provided
			if (schema.query) {
				const result = schema.query.safeParse(req.query);
				if (!result.success) {
					throw new ValidationError(result.error.issues);
				}
				req.validatedQuery = result.data;
			}

			// validate body if schema provided
			if (schema.body) {
				const result = schema.body.safeParse(req.body);
				if (!result.success) {
					throw new ValidationError(result.error.issues);
				}
				req.validatedBody = result.data;
			}

			next();
		} catch (error) {
			next(error);
		}
	};
};

// helper function to extract specific parts of a validation schema
export const extractSchemas = (fullSchema: z.ZodObject<any>) => {
	const shape = fullSchema.shape;
	return {
		params: shape.params || undefined,
		query: shape.query || undefined,
		body: shape.body || undefined,
	};
};

// convenience function to validate just the request body
export const validateBody = (bodySchema: ZodSchema<any>) => {
	return validate({ body: bodySchema });
};

// convenience function to validate just the query parameters
export const validateQuery = (querySchema: ZodSchema<any>) => {
	return validate({ query: querySchema });
};

// convenience function to validate just the route parameters
export const validateParams = (paramsSchema: ZodSchema<any>) => {
	return validate({ params: paramsSchema });
};
