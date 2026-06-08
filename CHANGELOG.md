# Changelog

All notable changes to this project will be documented in this file.

---

## [1.0.0] - 2026-06-07

### Added
- Express web server initialization with JWT authentication.
- Request traceability middleware generating UUID trace IDs.
- Structured JSON logs outputting trace IDs, methods, paths, and status codes.
- Centralized error handler capturing Express runtime and Zod validation errors.
- Unified response wrapper (`successResponse` and `errorResponse`).
- Database schema and CommonJS database helper for Prisma and PostgreSQL.
- Meeting CRUD and paginated list endpoints.
- AI analysis service using Gemini API with native schema validation.
- Citations engine ensuring all AI summary elements are grounded to transcripts.
- Overdue action item detector API.
- Background hourly scheduler (`node-cron`) for outstanding action items.
- Discord Webhook integration for real-time notifications.
- Swagger API documentation page served at `/api-docs`.
- Health and Evaluation endpoints.
