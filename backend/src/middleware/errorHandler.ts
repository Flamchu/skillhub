import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ValidationError } from "./validation";

// Custom application error class
export class AppError extends Error {
	public statusCode: number;
	public isOperational: boolean;

	constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
		super(message);
		this.name = "AppError";
		this.statusCode = statusCode;
		this.isOperational = isOperational;

		// Maintains proper stack trace
		Error.captureStackTrace(this, this.constructor);
	}
}

// Interface for error response
interface ErrorResponse {
	error: string;
	details?: any;
	timestamp: string;
	path: string;
	method: string;
}

/**
 * Formats validation error details for user-friendly response
 */
const formatValidationErrors = (issues: any[]) => {
	return issues.map((issue) => ({
		field: issue.path.join("."),
		message: issue.message,
		received: issue.received,
	}));
};

/**
 * Maps Prisma error codes to HTTP status codes and user-friendly messages
 */
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
	switch (error.code) {
		case "P2002":
			// Unique constraint violation
			const field = error.meta?.target as string[] | undefined;
			const fieldName = field ? field[0] : "field";
			return new AppError(`A record with this ${fieldName} already exists`, 409);

		case "P2025":
			// Record not found
			return new AppError("Record not found", 404);

		case "P2003":
			// Foreign key constraint violation
			return new AppError("Referenced record does not exist", 400);

		case "P2014":
			// Relation violation
			return new AppError("The change violates a required relation", 400);

		case "P2021":
			// Table does not exist
			return new AppError("Database table not found", 500);

		case "P2022":
			// Column does not exist
			return new AppError("Database column not found", 500);

		case "P2000":
			// Value too long for column
			return new AppError("Input value is too long", 400);

		case "P2001":
			// Record does not exist
			return new AppError("Record not found", 404);

		case "P2004":
			// Constraint failed
			return new AppError("A database constraint was violated", 400);

		case "P2015":
			// Related record not found
			return new AppError("Related record not found", 404);

		case "P2016":
			// Query interpretation error
			return new AppError("Query interpretation error", 400);

		case "P2017":
			// Records for relation not connected
			return new AppError("Records are not properly connected", 400);

		case "P2018":
			// Required connected records not found
			return new AppError("Required connected records not found", 400);

		case "P2019":
			// Input error
			return new AppError("Input error", 400);

		case "P2020":
			// Value out of range
			return new AppError("Value out of range", 400);

		case "P2023":
			// Inconsistent column data
			return new AppError("Inconsistent column data", 400);

		default:
			console.error("Unhandled Prisma error:", error.code, error.message);
			return new AppError("Database error occurred", 500);
	}
};

/**
 * Central error handling middleware
 * This should be the last middleware in the chain
 */
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
	let appError: AppError;

	// Handle different types of errors
	if (error instanceof AppError) {
		appError = error;
	} else if (error instanceof ValidationError) {
		const errorResponse: ErrorResponse = {
			error: "Validation failed",
			details: formatValidationErrors(error.issues),
			timestamp: new Date().toISOString(),
			path: req.path,
			method: req.method,
		};

		return res.status(400).json(errorResponse);
	} else if (error instanceof Prisma.PrismaClientKnownRequestError) {
		appError = handlePrismaError(error);
	} else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
		console.error("Unknown Prisma error:", error.message);
		appError = new AppError("Database error occurred", 500);
	} else if (error instanceof Prisma.PrismaClientRustPanicError) {
		console.error("Prisma engine panic:", error.message);
		appError = new AppError("Database connection error", 500);
	} else if (error instanceof Prisma.PrismaClientInitializationError) {
		console.error("Prisma initialization error:", error.message);
		appError = new AppError("Database initialization error", 500);
	} else if (error instanceof Prisma.PrismaClientValidationError) {
		console.error("Prisma validation error:", error.message);
		appError = new AppError("Invalid database query", 400);
	} else {
		// Handle other types of errors (syntax errors, etc.)
		console.error("Unexpected error:", error);
		appError = new AppError("Internal server error", 500, false);
	}

	// Create error response
	const errorResponse: ErrorResponse = {
		error: appError.message,
		timestamp: new Date().toISOString(),
		path: req.path,
		method: req.method,
	};

	// Add error details in development mode
	if (process.env.NODE_ENV === "development" && !appError.isOperational) {
		errorResponse.details = {
			stack: error.stack,
			name: error.name,
		};
	}

	// Log error for monitoring
	if (appError.statusCode >= 500) {
		console.error("Server Error:", {
			message: appError.message,
			stack: error.stack,
			path: req.path,
			method: req.method,
			timestamp: new Date().toISOString(),
		});
	}

	res.status(appError.statusCode).json(errorResponse);
};

/**
 * 404 handler for routes that don't exist
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
	const error = new AppError(`Route ${req.originalUrl} not found`, 404);
	next(error);
};

/**
 * Async wrapper to catch errors in async route handlers
 * Usage: router.get('/path', catchAsync(asyncHandler))
 */
export const catchAsync = (fn: Function) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};

// Export commonly used error constructors
export const createError = {
	badRequest: (message: string = "Bad request") => new AppError(message, 400),
	unauthorized: (message: string = "Unauthorized") => new AppError(message, 401),
	forbidden: (message: string = "Forbidden") => new AppError(message, 403),
	notFound: (message: string = "Not found") => new AppError(message, 404),
	conflict: (message: string = "Conflict") => new AppError(message, 409),
	unprocessableEntity: (message: string = "Unprocessable entity") => new AppError(message, 422),
	internalServerError: (message: string = "Internal server error") => new AppError(message, 500),
};
