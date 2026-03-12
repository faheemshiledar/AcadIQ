# AcadIQ — Academic & Career Intelligence Platform

> An AI-powered web platform built for engineering colleges that transforms how students understand their academic standing and career readiness — and how admins monitor, support, and manage student data.

---

## What is AcadIQ?

AcadIQ is a full-stack application that combines AI analysis, a real-time chatbot, a personal AI mentor, a document-based study planner, a database-backed admin dashboard, and a college resource library — all in one platform. Students log in with Google, submit their data, and receive structured AI-generated reports. Admins get a dedicated portal to view every report submitted, manage resources, and run their own analyses.

The platform has 7 navigable sections with role-based access controlled automatically by email address.

---

## Who Uses It

| Role | How Access is Granted | What They Can Access |
|---|---|---|
| **Student** | Any Google account | Academic, Career, Study Planner, AI Mentor, Resources, AI Chat |
| **Admin** | Email must be in `admin_users` table in Supabase | Academic, Career, Resources, AI Chat, Admin Portal |

Role assignment is fully automatic — no manual switching, no passwords. When a user logs in, their email is checked against the database. Admin if matched, student if not.

---

## The 7 Sections

### 1. 📚 Academic & Campus Intelligence

Analyze a student's academic performance and generate actionable, personalized recommendations.

**Student fills in:** Name, semester, CGPA, attendance, active backlogs, marks for up to 5 subjects, clubs joined, events attended, learning style, daily study hours, challenges.

**AI generates:**
- Academic Risk Level — Low / Medium / High with a specific reason
- Subject Analysis — visual progress bars per subject, priority tags, issue diagnosis
- Study Strategies — specific strategies each with a measurable goal and timeframe
- Campus Engagement — suggested clubs, events, and skill-building activities
- Weekly Study Plan — recommended hours per day, focus areas, review schedule
- Key Insights — specific observations about the student's situation

**Admin view generates:** Risk flag with performance trend (Improving / Stable / Declining), intervention suggestions with urgency levels (Immediate / Soon / Routine), full advisory report for records, parent communication requirement flag.

---

### 2. 🚀 Career & Placement Intelligence

Give students a realistic picture of their placement readiness and a concrete plan to improve.

**Student fills in:** Branch, CGPA, skills, tech stack, GitHub summary, LeetCode stats, projects, internships, certifications, open source, hackathons, target role and company type.

**AI generates across 7 steps:**

**Job Readiness Score (0–100)** broken into 7 weighted dimensions:
- DSA Strength (20 pts), Development Skills (20 pts), Project Depth (15 pts), Practical Exposure (15 pts), Academic Strength (10 pts), Extracurricular Impact (5 pts), Market Competitiveness (15 pts)

**Salary Band** (India only, realistic): Current CTC range, 12-month projection, 24-month projection.

**Competitive Positioning:** Below Average / Tier 3 Average / Above Average / Placement Ready / Product-Company Ready / Elite Level — with written reasoning.

**Top 5 Skill Gaps** — each with why it matters, risk if ignored, and a concrete improvement action. Resources from the college library are automatically matched and displayed under each gap.

**6-Month Roadmap** across 3 phases — skill targets, measurable goals, project upgrades, interview prep per phase.

**12–24 Month Career Projection:** Role progression, skill maturity, salary trajectory.

**Placement Intelligence:** Eligibility probability, suitable company type, target roles, readiness gap summary.

**Admin view generates:** Readiness score, placement probability, key strengths, major risk areas, action plan with owner (Student / College / Both), placement outlook.

---

### 3. 📖 AI Study Planner *(Students only)*

Upload a document and receive a complete AI-generated study plan based on its content.

**Supported formats:** PDF, TXT

**Document limits enforced before any AI call:**
- Maximum 8 pages
- Maximum 20,000 characters
- If exceeded: shows exact page count, character count, and rejection reason
- "Analyze First 8 Pages Only" option — truncates and retries without exceeding limits

**Accepted document types:** Chapter notes, Previous year papers (PYQs), Study material, Lecture slides, Assignments.

**AI generates:**
- Document type detection and title
- All topics extracted with High / Medium / Low priority
- Key concepts per topic
- Estimated study hours per topic
- Study tips and likely exam questions per topic
- Day-by-day study schedule
- Overall strategy
- Quick revision points
- Warning areas to watch

---

### 4. 🧑‍🏫 Personal AI Mentor *(Students only)*

An AI mentor that reviews all a student's past reports and provides personalized weekly guidance.

**How it works:** Enter roll number or name → fetches all previous Academic and Career reports from Supabase → AI analyzes progress across reports → returns personalized advice.

**AI generates:**
- Weekly focus — what to prioritize this specific week
- Priority skills — top 3–5 skills to build right now, based on actual gaps
- Mentor message — 2–3 paragraphs referencing actual scores, subjects, and skill gaps
- Progress summary — academic trend, career trend, latest risk level, latest career score
- This week's tasks — concrete actionable items
- Encouragement — a personalized closing note

Requires at least one Academic or Career analysis to have been run first.

---

### 5. 💬 AI Chat Assistant

A conversational assistant for academic, career, and campus questions.

**Covers:**
- Academic doubts — concepts, exam prep, study approaches across CS/IT/Engineering
- Career and placement — DSA prep, resume, interviews, company-specific tips, Indian job market
- Campus life — time management, backlogs, attendance strategies, clubs, faculty communication

Supports markdown rendering including bold, inline code, code blocks, and bullet lists. Maintains full conversation history within the session. Enter to send, Shift+Enter for new line. Uses Llama 3.3 70B via Groq.

---

### 6. 🛡️ Admin Portal *(Admins only)*

A complete dashboard showing all student-submitted analyses.

Anyone without admin role sees an "Access Denied" screen when attempting to access this section.

**Features:**
- Summary stats — total reports, academic count, career count, high-risk count
- Filter by module (All / Academic / Career)
- Search by student name
- Expandable rows — click any entry to see full input data and complete AI-generated report
- Delete reports with confirmation
- Refresh

Every analysis is auto-saved on submission — admins see everything without any manual data entry.

---

### 7. 📂 Resource Library

A central place for colleges to share study materials.

**Categories:** Syllabus, PYQs, Notes, Timetable, Brochure, Events, Other.

**Admins:** Add resources by pasting an external link (Google Drive or any URL) with a title, category, semester, subject, and description. Delete resources.

**Students:** Browse all resources, filter by category, search by title, open any resource in a new tab.

Resources use external links only — no file storage required. Admins upload to Google Drive and paste the link.

**Resource matching:** Career analysis results automatically search the resource library by skill gap name and display matched resources directly under each gap.

---

## Authentication Flow

```
User visits AcadIQ → not logged in → Login page shown
        ↓
Clicks "Continue with Google"
        ↓
Redirected to Google OAuth
        ↓
Google redirects back to /auth/callback (client page)
        ↓
Supabase JS reads code from URL, PKCE exchange completes
Session saved to localStorage
        ↓
POST /api/check-role with user's email
        ↓
Email in admin_users table? → role: admin
Not in table?               → role: student
        ↓
App renders — nav and features shown based on role
```

Sessions persist across page refreshes. Supabase handles token refresh automatically.

---

## Database Structure

Three tables in Supabase PostgreSQL:

### `reports`
Every AI analysis auto-saved on submission.
```
id              uuid (primary key)
created_at      timestamptz
student_name    text
roll_number     text
module          text  — 'academic' or 'career'
input_data      jsonb — everything submitted in the form
result_data     jsonb — full AI-generated response
risk_level      text  — 'Low', 'Medium', 'High'
readiness_score integer — 0–100 career score
```

### `resources`
All college study materials.
```
id            uuid (primary key)
created_at    timestamptz
title         text
category      text  — syllabus | pyq | notes | timetable | brochure | event | other
description   text
external_link text  — Google Drive or any URL
semester      text
subject       text
uploaded_by   text
```

### `admin_users`
Controls who gets admin access. Add an email here → that Google account becomes an admin on next login.
```
id         uuid (primary key)
email      text (unique)
created_at timestamptz
```

---

## API Routes

All routes are server-side — API keys never reach the browser.

| Route | Method | Purpose |
|---|---|---|
| `/api/analyze` | POST | Run AI analysis via Groq, auto-save to Supabase |
| `/api/chat` | POST | Groq chatbot — returns AI reply |
| `/api/check-role` | POST | Check if email is in admin_users, return role |
| `/api/study-planner` | POST | Parse uploaded PDF/TXT, validate size, generate study plan |
| `/api/mentor` | POST | Fetch student reports by roll/name, return weekly mentorship |
| `/api/reports` | GET | Fetch reports (filter by module, search by name) |
| `/api/reports` | DELETE | Delete report by ID |
| `/api/resources` | GET | Fetch resources (filter by category, search by title) |
| `/api/resources` | POST | Add new resource |
| `/api/resources` | DELETE | Delete resource by ID |

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack — frontend + API routes in one |
| Language | TypeScript | End-to-end type safety |
| UI | React 18, Pure CSS | No UI library — full control, minimal bundle |
| Fonts | Plus Jakarta Sans + Fira Code | UI text + mono numbers/code |
| AI | Groq API — Llama 3.3 70B | Fast inference, free tier |
| PDF Parsing | pdf-parse | Server-side PDF text extraction |
| Auth | Supabase Auth + Google OAuth (PKCE) | Session in localStorage, auto-refresh |
| Database | Supabase PostgreSQL | Free tier, 3 tables |
| Deployment | Vercel | Native Next.js, free tier |

**npm dependencies:** `next`, `react`, `react-dom`, `@supabase/supabase-js`, `pdf-parse`. No UI libraries, no Redux, no unnecessary packages.

---

## File Structure

```
acadiq-v2/
├── app/
│   ├── layout.tsx                    # Root layout — wraps app in AuthProvider
│   ├── page.tsx                      # Main shell — all routing, nav, forms
│   ├── globals.css                   # Full design system (CSS variables, components)
│   ├── auth/
│   │   └── callback/page.tsx         # Client page — handles PKCE OAuth exchange
│   └── api/
│       ├── analyze/route.ts          # Groq analysis + auto-save to Supabase
│       ├── chat/route.ts             # Groq chatbot
│       ├── check-role/route.ts       # Admin role verification
│       ├── study-planner/route.ts    # PDF/TXT parsing + study plan generation
│       ├── mentor/route.ts           # Fetch student reports + weekly mentorship
│       ├── reports/route.ts          # Reports CRUD
│       └── resources/route.ts        # Resources CRUD
│
├── components/
│   ├── forms/
│   │   ├── AcademicStudentForm.tsx
│   │   ├── AcademicAdminForm.tsx
│   │   ├── CareerStudentForm.tsx
│   │   └── CareerAdminForm.tsx
│   ├── results/
│   │   ├── AcademicStudentResults.tsx
│   │   ├── AcademicAdminResults.tsx
│   │   ├── CareerStudentResults.tsx  # Includes resource matching per skill gap
│   │   └── CareerAdminResults.tsx
│   └── ui/
│       ├── LoginPage.tsx             # Google sign-in screen
│       ├── ChatPage.tsx              # Full chatbot interface
│       ├── StudyPlannerPage.tsx      # PDF upload + study plan UI
│       ├── MentorPage.tsx            # Personal AI mentor UI
│       ├── AdminPortal.tsx           # Reports dashboard (admin only)
│       └── ResourcesPortal.tsx       # Resource library
│
├── lib/
│   ├── supabase.ts                   # Browser client + service role client
│   ├── auth-context.tsx              # Auth state — user, session, role, helpers
│   ├── groq.ts                       # Groq API helper
│   └── prompts.ts                    # All AI system prompts
│
├── supabase-schema.sql               # Run once in Supabase SQL Editor
├── next.config.js                    # Webpack config for pdf-parse
└── .env.example                      # Environment variable template
```

---

## Design System

**Theme:** Dark — layered near-black backgrounds (`#07080f` → `#0d0e1a` → `#12131f` → `#181926`)

**Accent:** Indigo `#5b6af0` with lighter `#8b98ff` variant

**Status colors:**
- 🟢 Green `#1fc87a` — low risk, good status, success
- 🟡 Yellow `#f0b429` — medium risk, warning
- 🔴 Red `#f05b5b` — high risk, error

**Typography:** Plus Jakarta Sans for all UI, Fira Code for numbers, scores, metadata, and code.

**Responsive:** Sidebar collapses on mobile, bottom tab bar appears. All forms and grids reflow to single column.

---

## Environment Variables

Four variables required — all from free-tier services.

```
GROQ_API_KEY                    # console.groq.com
NEXT_PUBLIC_SUPABASE_URL        # Supabase → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase → Settings → API → anon public
SUPABASE_SERVICE_ROLE_KEY       # Supabase → Settings → API → service_role (secret)
```
