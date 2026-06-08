# AI Grounding and Analysis Approach

This document explains our implementation of the AI Meeting Analysis feature, highlighting prompt design, hallucination prevention, and structured JSON validation.

---

## 1. LLM Model Selection
* **Model:** Google `gemini-2.5-flash`
* **Reasoning:** Fast response time, high accuracy on text extraction, supports structured JSON schema generation config natively, and has generous free-tier access.

---

## 2. Structured JSON Generation & Schema Enforcement
To guarantee the LLM returns structured JSON matching our database schema without parse errors, we configured the Gemini API's `generationConfig.responseSchema`:
* **Enforced Schema:**
  * `summary`: Array of objects (`text` and `citations: [{ timestamp: string }]`)
  * `decisions`: Array of objects (`text` and `citations: [{ timestamp: string }]`)
  * `followUps`: Array of objects (`text` and `citations: [{ timestamp: string }]`)
  * `actionItems`: Array of objects (`task`, `assignee`, and `citations: [{ timestamp: string }]`)
* **Benefit:** Eliminates JSON parsing errors and guarantees the output structure matches the database schema 100% of the time.

---

## 3. Hallucination Prevention & Grounding
To prevent hallucinations (inventing tasks, attendees, outcomes), we applied the following strategies:
* **System Prompt Constraints:**
  * Explicit instructions: *"Do not invent attendees, action items, decisions, or outcomes not explicitly present in the transcript."*
  * *"Every single extracted point MUST include at least one citation with the exact timestamp from the transcript where it was mentioned."*
* **Fallback Values:** If an assignee is not explicitly mentioned, the LLM falls back to assigning it to `"Unassigned"`.

---

## 4. Citation Strategy
* Citations are parsed from the timestamps in the meeting transcript.
* Each extracted summary, decision, follow-up, and action item is tied back to one or more timestamps (e.g. `"00:20"`), ensuring auditable records and grounding.
