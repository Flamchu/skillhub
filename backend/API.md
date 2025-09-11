# SkillHub API Documentation

Base URL: `http://localhost:4000/api`

## Authentication

All protected routes require: `Authorization: Bearer <JWT_TOKEN>`

---

## Health Check

### GET /health

- **Description**: Server health check
- **Auth**: None
- **Response**: `{ "status": "ok" }`

---

## Authentication Routes

### POST /auth/register

- **Description**: Register new user
- **Auth**: None
- **Body**:
  ```json
  {
  	"email": "string (required)",
  	"password": "string (required, min 8 chars, 1 upper, 1 lower, 1 number, 1 special)",
  	"name": "string (optional)"
  }
  ```

### POST /auth/login

- **Description**: User login
- **Auth**: None
- **Body**:
  ```json
  {
  	"email": "string (required)",
  	"password": "string (required)"
  }
  ```

### PATCH /auth/change-password

- **Description**: Change user password
- **Auth**: Required
- **Body**:
  ```json
  {
  	"currentPassword": "string (required)",
  	"newPassword": "string (required)"
  }
  ```

---

## User Routes

### GET /users/:id

- **Description**: Get user public profile
- **Auth**: None

### GET /users/:id/profile

- **Description**: Get user full profile (own profile or admin)
- **Auth**: Required

### PATCH /users/:id

- **Description**: Update user profile (own profile or admin)
- **Auth**: Required
- **Body**:
  ```json
  {
  	"name": "string (optional)",
  	"headline": "string (optional)",
  	"bio": "string (optional)",
  	"regionId": "string (optional)"
  }
  ```

### DELETE /users/:id

- **Description**: Delete user account (own account or admin)
- **Auth**: Required

### GET /users/:id/stats

- **Description**: Get user statistics (own stats or admin)
- **Auth**: Required

### GET /users

- **Description**: Get users list (admin only)
- **Auth**: Required (Admin)
- **Query params**:
  - `page`: number (default: 1)
  - `limit`: number (default: 20)
  - `search`: string
  - `role`: USER|INSTRUCTOR|ADMIN
  - `regionId`: string
  - `sortBy`: string (default: createdAt)
  - `sortOrder`: asc|desc (default: desc)

---

## User Skills Routes

### GET /users/:userId/skills

- **Description**: Get user's skills
- **Auth**: None
- **Query params**:
  - `includeProgress`: boolean (default: false)
  - `skillId`: string

### POST /users/:userId/skills

- **Description**: Add skill to user profile
- **Auth**: Required (Own profile or admin)
- **Body**:
  ```json
  {
  	"skillId": "string (required)",
  	"proficiency": "NONE|BASIC|INTERMEDIATE|ADVANCED|EXPERT (default: BASIC)",
  	"targetLevel": "NONE|BASIC|INTERMEDIATE|ADVANCED|EXPERT (optional)",
  	"progress": "number 0-100 (default: 0)"
  }
  ```

### PATCH /users/:userId/skills/:skillId

- **Description**: Update user skill
- **Auth**: Required (Own profile or admin)
- **Body**:
  ```json
  {
  	"proficiency": "NONE|BASIC|INTERMEDIATE|ADVANCED|EXPERT (optional)",
  	"targetLevel": "NONE|BASIC|INTERMEDIATE|ADVANCED|EXPERT (optional)",
  	"progress": "number 0-100 (optional)",
  	"lastPracticed": "ISO date string (optional)"
  }
  ```

### DELETE /users/:userId/skills/:skillId

- **Description**: Remove skill from user profile
- **Auth**: Required (Own profile or admin)

### GET /users/:userId/skills/:skillId/progression

- **Description**: Get skill progression recommendations
- **Auth**: Required (Own profile or admin)

### PATCH /users/:userId/skills

- **Description**: Bulk update multiple user skills
- **Auth**: Required (Own profile or admin)
- **Body**:
  ```json
  {
  	"skills": [
  		{
  			"skillId": "string (required)",
  			"proficiency": "NONE|BASIC|INTERMEDIATE|ADVANCED|EXPERT (optional)",
  			"targetLevel": "NONE|BASIC|INTERMEDIATE|ADVANCED|EXPERT (optional)",
  			"progress": "number 0-100 (optional)",
  			"lastPracticed": "ISO date string (optional)"
  		}
  	]
  }
  ```

---

## Skills Routes

### GET /skills

- **Description**: Get all skills with filtering
- **Auth**: None
- **Query params**:
  - `includeChildren`: boolean (default: false)
  - `parentId`: string|null
  - `search`: string
  - `sortBy`: string (default: name)
  - `sortOrder`: asc|desc (default: asc)

### GET /skills/:id

- **Description**: Get skill by ID with details
- **Auth**: None
- **Query params**:
  - `includeStats`: boolean (default: false)

### GET /skills/hierarchy/tree

- **Description**: Get skills hierarchy tree
- **Auth**: None

### GET /skills/search/advanced

- **Description**: Advanced skill search
- **Auth**: None
- **Query params**:
  - `q`: string (search query)
  - `minUsers`: number (default: 0)
  - `maxUsers`: number
  - `hasCourses`: boolean (default: false)
  - `hasTests`: boolean (default: false)
  - `level`: number (hierarchy level)
  - `limit`: number (default: 20)
  - `offset`: number (default: 0)

### POST /skills

- **Description**: Create skill (admin only)
- **Auth**: Required (Admin)
- **Body**:
  ```json
  {
  	"name": "string (required)",
  	"slug": "string (required, alphanumeric + hyphens)",
  	"description": "string (optional)",
  	"parentId": "string (optional)"
  }
  ```

### PATCH /skills/:id

- **Description**: Update skill (admin only)
- **Auth**: Required (Admin)
- **Body**:
  ```json
  {
  	"name": "string (optional)",
  	"slug": "string (optional, alphanumeric + hyphens)",
  	"description": "string (optional)",
  	"parentId": "string (optional)"
  }
  ```

### DELETE /skills/:id

- **Description**: Delete skill (admin only)
- **Auth**: Required (Admin)

---

## Regions Routes

### GET /regions

- **Description**: Get all regions
- **Auth**: None

### GET /regions/:id

- **Description**: Get region by ID with details
- **Auth**: None

### GET /regions/:id/competition

- **Description**: Get competition stats for region and skill
- **Auth**: None
- **Query params**:
  - `skillId`: string (required)

### GET /regions/:id/ranking/:userId

- **Description**: Get user's ranking in region for a skill
- **Auth**: Required (Own ranking or admin)
- **Query params**:
  - `skillId`: string (required)

### POST /regions

- **Description**: Create region (admin only)
- **Auth**: Required (Admin)
- **Body**:
  ```json
  {
  	"name": "string (required)",
  	"code": "string (required, min 2 chars)"
  }
  ```

### PATCH /regions/:id

- **Description**: Update region (admin only)
- **Auth**: Required (Admin)
- **Body**:
  ```json
  {
  	"name": "string (optional)",
  	"code": "string (optional, min 2 chars)"
  }
  ```

### DELETE /regions/:id

- **Description**: Delete region (admin only)
- **Auth**: Required (Admin)

---

## Response Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## Error Response Format

```json
{
	"error": "Error message description"
}
```

## Success Response Format

Most endpoints return data in this format:

```json
{
	"message": "Success message (for mutations)",
	"data_field": "Actual data"
}
```
