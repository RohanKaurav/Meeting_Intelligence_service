# Testing and Verification Plan

This document details the scenarios, edge cases, and methods used to test the Meeting Intelligence Service.

---

## 1. Test Scenarios Executed

### Authentication Flow
* **Verify:** `POST /api/auth/token` with valid username generates a valid JWT token.
* **Verify:** Requests without a bearer token to protected endpoints (`/api/meetings`, `/api/action-items`) return `401 Unauthorized` in the unified format.
* **Verify:** Expired/invalid tokens return `403 Forbidden` in the unified format.

### Meeting Management
* **Verify:** Create meeting validation checks for empty values or incorrect email formats.
* **Verify:** Meeting details retrieve including its associated action items and analysis record.
* **Verify:** Paginated meeting list returns page, limit, total, and totalPages.

### AI analysis & Citations
* **Verify:** Analyzing a transcript successfully retrieves summary, decisions, followUps, and actionItems.
* **Verify:** All insights contain transcript timestamps in the citations array.
* **Verify:** Extracted action items are populated into the `ActionItem` table and set with a default due date of 7 days from the meeting date.

### Reminder Scheduler
* **Verify:** Reminder scheduler finds action items with past due dates.
* **Verify:** Discord webhook successfully posts formatted notifications.
* **Verify:** Database log entries are written into the `ReminderLog` table (detailing success/failure).
* **Verify:** Subsequent runs skip already-notified action items to prevent message spam.

---

## 2. Edge Cases Considered
* **Empty Transcripts:** Blocked via Zod validations before API hit.
* **Unassigned Tasks:** Defaulted to "Unassigned" instead of hallucinating participants.
* **Database Connection Loss:** Handled gracefully by the centralized error handler without server crashes.
