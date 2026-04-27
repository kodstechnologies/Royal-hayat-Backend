# Royale Hayat Backend API Standards and Architecture Rules

This document defines the coding standards, architecture rules, and API conventions for the Royale Hayat Hospital backend. All developers must strictly adhere to these rules when creating new modules, APIs, or adding features to ensure consistency, security, and scalability across the platform.

## 1. Module-Based Architecture Rules

- **Single Database:** The application uses a single MongoDB database with different collections for each module.
-

- **Generic Shared Utilities:** Shared utilities must remain strictly generic and framework-agnostic where possible.

## 2. Shared Layer Rules

The `src/utils/` directory is strictly for generic middleware and utility classes.

- It **MUST ONLY** contain the following utility files:
  - `ApiError.js` 
  - `ApiResponse.js` 
  - `asyncHandler.js`
  - `cloudinary.js`
  - `validation.js`
- It **MUST NOT** contain:
  - Database connection code or Mongoose schemas.
  - Service-specific logic.
  - Business logic.

## 3. API Route Design Standards

Routes must follow strict RESTful conventions. The resource identifier (`:id`) must always appear at the end of the route path.

**Correct Examples:**
```http
GET    /api/v1/doctors
GET    /api/v1/doctors/:id
POST   /api/v1/doctors
PATCH  /api/v1/doctors/:id
DELETE /api/v1/doctors/:id
GET    /api/v1/departments/:id/doctors
```

**Wrong Examples:**
```http
PATCH  /api/v1/doctors/:id/status
```

## 4. API Response Standards

All API responses must be formatted uniformly.

**Create / Update / Delete**
The response must **not** return the full object.
```json
{
  "success": true,
  "message": "Doctor created successfully",
  "data": null
}
```

**Get One**
```json
{
  "success": true,
  "message": "Doctor fetched successfully",
  "data": { ... }
}
```

**List APIs (Pagination Required)**
```json
{
  "success": true,
  "message": "Doctors fetched successfully",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalRecords": 100,
    "totalPages": 10
  }
}
```

## 5. Error Handling Standards

All errors must be thrown using the `ApiError` utility class.

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```
*Note: Stack traces must never be returned in production environments.*

## 6. Validation Standards

Validation must be implemented uniformly using **Joi**.

**Rules:**
- Use `abortEarly: false` to ensure all validation errors are collected and returned at once.
- Join validation errors into a single readable string (e.g., `error.details.map(d => d.message).join(", ")`).
- **Controllers** handle validation execution.
- **Services** handle business logic (never validation schemas).

## 7. Controller Responsibilities

Controllers act merely as orchestrators between the HTTP request and the Service layer.

**Controllers MUST ONLY:**
- Validate the input payload.
- Extract the authenticated user from the request (when applicable).
- Call the corresponding Service layer function.
- Return the standardized API response.

**Controllers MUST NOT:**
- Contain any business logic.
- Access the database directly (no Mongoose queries).

## 8. Service Layer Responsibilities

The Service layer is the core of the application's rules.

**Services MUST:**
- Contain all business logic.
- Enforce status transitions.
- Enforce ownership checks.
- Call repository functions for database operations.

**Services MUST NOT:**
- Access the database directly.
- Handle HTTP concerns (validation, responses).

## 9. Repository Responsibilities

The Repository layer is the only layer allowed to talk to the database.

**Repositories MUST:**
- Only contain database operations (e.g., `findOne`, `create`, `findByIdAndUpdate`).
- Contain **no business logic**.
- Return Mongoose documents or null.

## 10. File Upload Rules

For handling file uploads:
1. Use **Multer** for parsing `multipart/form-data`.
2. Files must be stored temporarily in `/tmp/uploads`.
3. Upload the temporary files to **Cloudinary**.
4. Remove the temporary files from `/tmp/uploads` immediately after a successful upload to Cloudinary.

## 11. Module Structure

Each module must follow this structure:
```
src/modules/{moduleName}/
  models/           # Mongoose schemas
  controllers/      # HTTP request handlers
  services/         # Business logic
  repositories/     # Database operations
  routes/           # API routes
  validators/       # Joi validation schemas
```

## 12. Naming Conventions

- **Files:** kebab-case (e.g., `doctor.controller.js`)
- **Functions:** camelCase (e.g., `getAllDoctors`)
- **Variables:** camelCase (e.g., `doctorData`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Collections:** plural (e.g., `doctors`, `departments`)

## 13. Environment Variables

All environment variables must be documented in `.env.example`:
```
# Database
MONGODB_URI=mongodb+srv://...
DB_NAME=royal-hayat

# Server
PORT=8000
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 14. Security Rules

- Never commit sensitive data (API keys, passwords)
- Use environment variables for all configuration
- Implement proper input validation
- Sanitize all user inputs
- Use HTTPS in production
- Implement rate limiting for public APIs
