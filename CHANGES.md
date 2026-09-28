# Applied fixes

## Backend

- Added stateless JWT authentication filter and role-based endpoint protection.
- Moved the JWT signing secret and instructor registration code to environment variables.
- Added request/response DTOs so JPA entities and password hashes are not exposed by the API.
- Added validation for usernames, passwords, assignment fields, URLs, grades and feedback.
- Restricted students to their own submissions and instructors to the full submission list.
- Prevented duplicate submissions and client-supplied grades/status values.
- Standardized roles and submission statuses with enums.
- Standardized grades as integers from 0 to 100.
- Replaced field injection and Lombok entity `@Data` usage.
- Added centralized JSON error responses.
- Added an H2 test profile.

## Frontend

- Added protected and role-specific routes.
- Added stable authentication state and username storage.
- Updated registration and submission payloads to the new DTO API.
- Standardized `EVALUATED` status handling and numeric grades.
- Added useful backend error messages and loading/submitting states.
- Changed API configuration to `/api` with a Vite development proxy.
- Added nginx SPA fallback and `/api` reverse proxy.
- Fixed ESLint errors.

## Docker

- Backend now compiles automatically in a multi-stage Docker build.
- Frontend uses `npm ci` and a dedicated nginx configuration.
- Added PostgreSQL health checks and service dependencies.
- Moved credentials and secrets to `.env`.
- Added `.dockerignore` files and removed generated folders from the archive.
