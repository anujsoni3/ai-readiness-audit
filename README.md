# AI Readiness Audit Tool

A simple full-stack web app that simulates how "AI-ready" a website is for LLM retrieval and reuse.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: None
- External AI/web scraping APIs: None

## What It Does

- Accepts a website URL
- Applies deterministic heuristic rules (no randomness)
- Returns:
  - `score` out of 100
  - `issues` array (always 4-5 specific, actionable findings)

## Deterministic Scoring Rules

Starting score is `100`, then penalties are applied:

- No `blog/docs/learn` signal in URL: `-15`
- No `faq/help/support` signal in URL: `-20`
- URL path too shallow: `-10`
- No structured section signal (`products/solutions/features/...`): `-15`
- No developer signal (`api/developer/sdk/reference/...`): `-10`

Score is clamped to `0-100`.

To ensure consistent UX, the backend always returns 4-5 issues by adding deterministic advisory issues when fewer than 4 primary failures are found.

## Project Structure

- `frontend/` React + Tailwind app
- `backend/` Express API

## Run Locally

### 1) Start backend

```bash
cd backend
npm install
npm run start
```

Backend runs on `http://localhost:5000`.

### 2) Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on Vite dev server and proxies `/analyze` to backend.

## API

### `POST /analyze`

Request:

```json
{
  "url": "https://example.com"
}
```

Response:

```json
{
  "score": 30,
  "issues": [
    "No long-form content signal detected in the URL (blog/docs/learn). Add a docs or insights section to improve semantic depth for LLM retrieval.",
    "No FAQ/help/support signal detected. Publish structured Q&A pages so AI systems can map common user intents and direct answers.",
    "URL structure appears too shallow. Introduce clear content paths (for example /learn/, /docs/, /use-cases/) so knowledge can be segmented and retrieved reliably.",
    "No structured section signal detected (products/solutions/features). Add explicit content hubs to improve chunking and topic routing for AI systems.",
    "No developer-focused content signal detected. Add API/reference/changelog pages to improve machine-usable context and technical grounding."
  ]
}
```
