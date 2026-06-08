# Architectural & Design Decisions

This document details the key technical decisions I made during the design and implementation of the Meeting Intelligence Service.

---

## 1. Database Choice: PostgreSQL (via Supabase) with Prisma ORM
* **Decision:** I used **PostgreSQL** hosted on **Supabase** combined with **Prisma ORM** for database access.
* **Alternatives Considered:** MongoDB (NoSQL) or SQLite.
* **Rationale:**
  * **Relational Integrity:** Meeting summaries, action items, and reminder logs have clear, relational bounds (one-to-many relationships). A relational database enforces schemas and cascades deletes correctly (e.g., deleting a meeting deletes its analysis and action items).
  * **Prisma Developer Experience:** Prisma provides auto-generated types, type safety, and direct migrations. It also allows schema declarations via the `schema.prisma` file, which is highly readable.
  * **Supabase Compatibility:** Supabase PostgreSQL works natively with Prisma PG pooling adapters, preventing connection exhaustion.

---

## 2. Authentication Strategy: JWT (JSON Web Tokens)
* **Decision:** Statless, token-based authentication via **JWT**.
* **Alternatives Considered:** Session-based (cookie/redis store).
* **Rationale:**
  * **Statelessness:** Decouples session management from the backend, making it easily hostable on serverless or load-balanced environments (Render, Railway).
  * **Standardization:** Highly supported in REST clients and easily integrated via custom middleware. A token endpoint `/api/auth/token` allows quick access generation.

---

## 3. External Integration: Discord Webhook API
* **Decision:** We integrated with **Discord Webhooks** for action item reminders.
* **Alternatives Considered:** Slack Webhooks, Telegram Bot API, Resend Email API.
* **Rationale:**
  * **Ease of Deployment & Testing:** Discord webhooks do not require setting up Slack apps, Telegram bot registration, or domain records (which Resend requires). Anyone can create a private Discord channel and obtain a Webhook URL in 10 seconds.
  * **Rich Markdown Formatting:** Discord supports Discord-flavored markdown, allowing us to post structured alerts with bold styling and formatted lists.

---

## 4. Project Structure: Separation of Concerns
* **Decision:** Organized the codebase into the following directories:
  * `lib/`: Standard utilities (Prisma database wrapper, unified API response handlers).
  * `middleware/`: Cross-cutting concerns (authentication, request tracing, structured logging, global error handling).
  * `routes/`: Express route definitions.
  * `controllers/`: Request controllers doing validation (via Zod) and calling services.
  * `services/`: Business services (Gemini AI analysis, reminder processing, cron scheduler).
  * `docs/`: OpenAPI documentation files.
* **Rationale:** Decoupled codebase is easier to test, maintain, and expand. Express middleware handle generic concerns before reaching route logic.
