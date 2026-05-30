# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**EduPrep** — A MERN stack coaching institute platform. Students generate timed worksheets from past year question papers, practice MCQ/structured questions, get auto-graded, view markschemes, and track progress. Admins upload PDFs (AI-extracted via OpenAI), manage questions, and view student analytics.

**GitHub:** https://github.com/krishnakantk5-gitai/Eduprep  
**Local frontend:** http://localhost:3000  
**Local backend:** http://localhost:5000

---

## Running the Project

```bash
# Terminal 1 — Backend (from coaching-institute/backend)
npm run dev          # starts nodemon on port 5000

# Terminal 2 — Frontend (from coaching-institute/frontend)
npm start            # starts React dev server on port 3000

# Seed database with 88 JEE Maths questions + admin account
node src/seed.js     # run from backend/

# Re-run scraper to download JEE Advanced PDFs
node scraper.js      # run from scraper/
```

MongoDB runs as a **Windows service** — starts automatically, no manual action needed.

---

## Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb+srv://krishnakantk5_db_user:jEeOfzoT0F8GHfHf@eduprep.hvk9mdh.mongodb.net/coaching_institute?retryWrites=true&w=majority&appName=Eduprep
JWT_SECRET=eduprep_super_secret_jwt_key_2024
JWT_EXPIRE=7d
OPENAI_API_KEY=<required only for PDF upload feature>
NODE_ENV=development
FRONTEND_URL=*
```

**Admin credentials (seeded):** `admin@eduprep.com` / `Admin@123`

---

## Architecture

### Backend (`backend/src/`)

**Request flow:** `server.js` → `routes/` → `middleware/auth.js` → `controllers/` → `models/`

- `middleware/auth.js` — two exports: `protect` (JWT verify) and `adminOnly` (role check). All routes except `/api/auth/login` and `/api/auth/register` require `protect`.
- `services/pdfParser.js` — calls OpenAI GPT-4o-mini with extracted PDF text, returns structured question JSON. Questions saved with `verified: false` until admin approves.
- `seed.js` — standalone script, uses inline schemas to avoid circular imports. Safe to re-run (clears previous seed data first).

**Key business logic:**
- Worksheet generation uses MongoDB `$sample` aggregation for random question selection. Filter supports: `board`, `subject`, `topic` (regex), `difficulty`, `examType` (IIT_JEE only), `years` array.
- Auto-grading in `attemptController.js` only grades MCQ (compares `selectedOption` vs `correctAnswer`). Structured questions are not auto-graded — markscheme shown for self-assessment.
- `correctAnswer` and `markscheme` fields are excluded from all student-facing queries using `.select('-correctAnswer -markscheme')`. They are only included in `getAttemptResult` after submission.
- Progress tracking groups attempts by `board_subject_topic` key, calculates `avgPercentage`. Weak topics = avgPercentage < 50.

### Frontend (`frontend/src/`)

**Auth flow:** `AuthContext.js` stores user in state, token in `localStorage`. `api.js` (Axios instance) auto-attaches Bearer token. On 401, clears token and redirects to `/login`.

**Route structure:** All authenticated routes are nested under `<Layout />` which renders the sidebar. `PrivateRoute` component handles auth + admin-only guards.

**IIT JEE specific UI (WorksheetGenerator.js):**
- `examType` toggle (MAIN / ADVANCED / BOTH) — only shown when board === `IIT_JEE`
- Year grid (2007–2026) with quick-range buttons — only shown when board === `IIT_JEE`
- `FALLBACK_TOPICS.IIT_JEE_Maths` — hardcoded topic list shown when DB has no questions yet; replaced by API topics once questions exist

---

## Data Models

### Question (most important model)
```
board: IGCSE | AS_A_LEVEL | IBDP | IIT_JEE
subject: Maths | CS
examType: MAIN | ADVANCED | ''   ← only for IIT_JEE
type: MCQ | STRUCTURED
topic, subtopic, difficulty: Easy|Medium|Hard
year, paperNumber, source
questionText, imageUrl
options: [{label, text, imageUrl}]   ← MCQ only
correctAnswer                         ← MCQ only, hidden from students
marks, markscheme, markschemeImageUrl ← STRUCTURED
verified: Boolean   ← false until admin approves
```

### Worksheet
Generated per student session. Stores `questions[]` (ObjectId refs), `board`, `subject`, `topic`, `timeLimit` (minutes).

### Attempt
One per worksheet submission. Stores `answers[]` with `isCorrect` + `marksAwarded` per question. `percentage` pre-calculated on submit.

---

## Boards & Subjects Matrix

| Board | Maths | CS |
|-------|-------|----|
| IGCSE | ✅ | ✅ |
| AS_A_LEVEL | ✅ | ✅ |
| IBDP | ✅ | ✅ |
| IIT_JEE | ✅ | ❌ |

IIT_JEE Maths has additional `examType` field (MAIN/ADVANCED). Other boards do not use `examType`.

---

## Scraper (`scraper/`)

Downloads JEE Advanced past papers from `https://jeeadv.ac.in`.  
- 2007–2018: `past_qps/YEAR_PAPER.pdf`  
- 2019–2026: `past_qps/YEAR_PAPER_English.pdf`  
- 2026 current year: `documents/p1_english.pdf`, `documents/p2_english.pdf`  
- Downloads saved to `scraper/downloads/YEAR/` with a `manifest.json`

---

## Deployment

| Service | Purpose | Status |
|---------|---------|--------|
| GitHub | Code: `krishnakantk5-gitai/Eduprep` | ✅ Pushed |
| MongoDB Atlas | Cloud DB: `eduprep.hvk9mdh.mongodb.net` | ✅ Ready |
| Render.com | Backend hosting (pending) | ⏳ Not deployed yet |
| Vercel | Frontend hosting (pending) | ⏳ Not deployed yet |

To push changes to GitHub:
```bash
cd coaching-institute
git add .
git commit -m "your message"
git push
```

---

## Important Patterns

- **Never return `correctAnswer` or `markscheme` to students** except in `getAttemptResult` (post-submission). Always use `.select('-correctAnswer -markscheme')` on student queries.
- **`verified: true`** is required for a question to appear in worksheets or topic lists. New PDF uploads set `verified: false` by default.
- **`examType` filter** is only applied when `board === 'IIT_JEE'` and `examType !== 'BOTH'`. For BOTH, no filter is applied (returns all IIT_JEE questions).
- **`years` filter** takes an array. Empty array means all years (no filter applied).
- Each CSS file lives next to its component (e.g. `WorksheetGenerator.css` beside `WorksheetGenerator.js`).
- Global styles and CSS variables (colors, shadows, border-radius) are in `frontend/src/index.css`. Use `var(--primary)`, `var(--border)` etc. — do not hardcode colors in component CSS.
