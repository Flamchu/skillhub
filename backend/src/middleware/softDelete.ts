/**
 * helper functions for soft delete functionality
 * automatically excludes soft-deleted users from queries
 */

/**
 * get default where clause for user queries
 * filters out soft-deleted users
 */
export function activeUserWhere<T extends Record<string, any>>(where?: T): T & { deletedAt: null } {
	return {
		...where,
		deletedAt: null,
	} as T & { deletedAt: null };
}

/**
 * check if user is soft-deleted
 */
export function isUserDeleted(user: { deletedAt: Date | null }): boolean {
	return user.deletedAt !== null;
}
