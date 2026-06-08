# Meeting Intelligence Service

An AI-powered Meeting Intelligence Service designed to capture, store, and analyze meeting transcripts, extract grounded action items with transcript citations, and send automated notifications through a Discord Webhook integration.

---

## Features
* **Authentication:** Stateless JWT Token-based protection.
* **Meeting Management:** Store and retrieve meetings with paginated lists.
* **AI Analysis:** Grounded transcript summaries, decisions, follow-ups, and action items using Gemini API.
* **Grounding & Citations:** Direct timestamp citation mapping for all generated points.
* **Reminder Scheduler:** Cron scheduler running every hour, alerting assignees on overdue tasks.
* **External Integration:** Discord Webhook channel notifications.
* **Unified Responses:** Structured successes and error formats with trace ID tracking.
* **API Documentation:** Interactive Swagger UI documentation.

---

## Tech Stack
* **Runtime:** Node.js (v18+)
* **Framework:** Express.js
* **ORM:** Prisma
* **Database:** PostgreSQL (Supabase)
* **LLM Provider:** Google Gemini API (`gemini-1.5-flash`)
* **Validation:** Zod

---

## Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your_jwt_signing_secret_here"
GEMINI_API_KEY="your_google_gemini_api_key_here"
DISCORD_WEBHOOK_URL="your_discord_channel_webhook_url_here"

---



