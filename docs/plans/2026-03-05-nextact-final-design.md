# Next Act Platform -- Final Design Document

**Date:** 2026-03-05
**Status:** Final
**Authors:** Nick Koutrelakos, Claude
**Repository:** github.com/wkoutre/nextact-platform
**Domain:** nextact.se

---

## Executive Summary

Next Act is a Swedish mental training platform for athletes, built on ACT (Acceptance and Commitment Therapy) and the MAC (Mindfulness-Acceptance-Commitment) sport framework. The current stack -- WordPress (marketing) + Moodle (LMS) + Azure (auth) + Mailgun (email) -- is being replaced with a unified, owned platform.

**Vision:** An AI-personalized microlearning experience with a social-media-native UX (short-form, swipeable content inspired by TikTok/Instagram), deeply integrated ACT-informed AI coaching, and a unified user experience from first visit to course completion.

**Target audience:** Swedish athletes aged 15-25, primarily soccer. International expansion planned for future.

**Migration strategy:** No user migration. Existing ~100 Moodle users complete their program there. All new users go to the new platform. Moodle sunsets naturally.

---

## 1. Architecture Overview

### 1.1 Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js (App Router) | Full-stack web application |
| Hosting | Vercel Pro ($20/mo) | Deployment, CDN, serverless functions |
| Database | Supabase Pro ($25/mo) | PostgreSQL, RLS, Realtime, Storage |
| Auth | Supabase Auth | Social login, magic link, email+password |
| File Storage | Supabase Storage | Images, PDFs, exercise assets |
| Video | Vimeo (existing) | Video hosting and streaming |
| AI | Claude API (Anthropic) via Vercel AI SDK | AI coach, personalization |
| Payments | Stripe + Stripe Tax + @supabase/stripe-sync-engine | Subscriptions, VAT |
| Email | Resend | Transactional and marketing email |
| SMS | Twilio (sparingly) | Critical alerts only |
| Notifications | Supabase Realtime | Primary engagement channel |

### 1.2 Application Architecture

```
nextact.se (Vercel -- Next.js App Router)
+-- Marketing Pages (SSG)              -- Static, SEO-optimized
+-- LMS Application (SSR/CSR)          -- Dynamic, authenticated
+-- AI Coach (CSR + Streaming)          -- Real-time AI via Route Handler
+-- Admin Dashboard (SSR)              -- Content & user management
+-- API Layer (Route Handlers + Server Actions)
    +-- Supabase (auth, db, storage, realtime)
    +-- Claude API via Vercel AI SDK (AI coach streaming)
    +-- Vimeo API (video management)
    +-- Stripe (payments, webhooks)
    +-- Resend (email)
    +-- Twilio (SMS, critical alerts only)
```

### 1.3 URL Structure

```
nextact.se/                        -> Marketing home
nextact.se/om-programmet           -> About the program
nextact.se/priser                  -> Pricing
nextact.se/blogg                   -> Blog
nextact.se/blogg/[slug]            -> Blog post
nextact.se/skolor                  -> Schools landing page
nextact.se/klubbar                 -> Clubs landing page
nextact.se/kontakt                 -> Contact form
nextact.se/logga-in                -> Login
nextact.se/registrera              -> Registration
nextact.se/integritet              -> Privacy policy
nextact.se/villkor                 -> Terms of service
nextact.se/app/                    -> LMS dashboard (authenticated)
nextact.se/app/learn/[module-id]   -> Module overview
nextact.se/app/learn/[module-id]/[lesson-id] -> Microlearning content
nextact.se/app/coach               -> AI coach conversation
nextact.se/app/progress            -> Progress tracking & insights
nextact.se/app/profile             -> User profile & settings
nextact.se/admin/                  -> Admin dashboard
nextact.se/admin/content           -> Content management
nextact.se/admin/users             -> User management
nextact.se/admin/analytics         -> Analytics & reporting
```

### 1.4 User Roles

| Role | Access | Description |
|------|--------|-------------|
| `athlete` | `/app/*` | Learner -- consumes content, interacts with AI coach |
| `admin` | `/app/*`, `/admin/*` | Content management, user management, analytics |
| `psychologist` | `/app/*`, limited `/admin/*` | (Future) Views assigned athletes' progress for premium tier |

Roles are stored in `auth.users.raw_app_meta_data` as the authoritative source (used in JWT for RLS). The `profiles` table mirrors the role for convenience but is never used for authorization decisions.

### 1.5 Key Architectural Decisions

- **Single domain, single app** -- no subdomains or separate deployments
- **Server components by default** -- client components only where interactivity is needed
- **Server Actions for mutations, Route Handlers for streaming and webhooks** -- AI coach streaming uses a Route Handler (not Server Actions, which cannot stream long-lived responses). Stripe/Twilio webhooks use Route Handlers (no CSRF token requirement).
- **Swedish-first, i18n-ready** -- use `next-intl` from day one so international expansion does not require a rewrite
- **Defense-in-depth auth** -- three-layer verification model (see Section 2)

---

## 2. Auth & User Management

### 2.1 Auth Provider

**Supabase Auth** replaces Azure AD/OAuth entirely, using `@supabase/ssr` for cookie-based session management across Server Components, Server Actions, Route Handlers, and Middleware.

#### Auth Methods (Priority Order)

| Method | Priority | Rationale |
|--------|----------|-----------|
| **Google social login** | Primary | Near-universal among 15-25 demographic. One-tap on mobile. Lowest friction. |
| **Apple social login** | Primary | Required for future iOS App Store. High iPhone penetration in Sweden. |
| **Magic link (email)** | Secondary | Good fallback for users without social accounts. Passwordless = no forgotten passwords. Consider OTP (6-digit code) as alternative -- Supabase supports both. |
| **Email + password** | Tertiary | Available but not promoted. Younger users dislike managing passwords. |
| **Phone/SMS OTP** | Future | Good for re-engagement. Twilio integration already planned. |

**BankID:** Evaluated and deferred. Age restriction (typically 18+) excludes 15-17 segment, integration is complex and expensive, and it does not scale internationally. Reconsider if premium psychologist sessions require identity verification for 18+ users. Alternative: Freja+ (supports ages 13+).

#### Three-Layer Auth Verification Model

**Never rely solely on middleware for route protection.** The Next.js CVE-2025-29927 demonstrated middleware can be bypassed.

| Layer | Responsibility | Implementation |
|-------|---------------|----------------|
| **Middleware** | Token refresh + basic redirects | `supabase.auth.getUser()` in `src/middleware.ts`. Refreshes expired tokens (Server Components cannot write cookies). Composes with `next-intl` locale detection. |
| **Server Components / Actions** | Data access verification | Must call `getUser()` before accessing user-specific data. Never trust `getSession()` -- it reads from cookies which can be spoofed. |
| **RLS Policies** | Final enforcement at DB level | Database-level policies using JWT claims. Assumes all layers above may have been bypassed. |

**Critical rule:** `getSession()` is prohibited for authorization decisions anywhere in server-side code. Always use `getUser()` which makes a round-trip to the Supabase Auth server.

#### Auth Flow

```
User visits nextact.se
  -> Clicks "Kom igang" (Get started) or "Logga in"
  -> Registration: Google/Apple social login -OR- email + magic link -OR- email + password
  -> Profile completion: name + sport + age bracket
  -> Email verification (if email+password)
  -> Onboarding flow (ACT intro, preference setup, notification channel preference)
  -> Redirected to /app/ dashboard
```

### 2.2 User Profile Schema

```
profiles (extends auth.users via public.profiles)
+-- id (UUID, FK to auth.users)
+-- display_name (text)
+-- sport (text) -- e.g., "fotboll", "ishockey"
+-- age_bracket (text) -- "13-14" | "15-18" | "19-25" | "26+"
+-- subscription_tier (text) -- "free" | "standard" | "premium" (denormalized from Stripe)
+-- subscription_status (text) -- "active" | "trialing" | "past_due" | "canceled" | "expired"
+-- preferred_language (text) -- "sv" (default), "en"
+-- notification_preferences (jsonb) -- channel preferences, quiet hours, per-type opt-in/out
+-- onboarding_completed (boolean)
+-- created_at (timestamptz)
+-- updated_at (timestamptz)
```

**Note:** The `role` field lives in `auth.users.raw_app_meta_data`, not in `profiles`. A helper function extracts it from the JWT:

```sql
CREATE OR REPLACE FUNCTION auth.role()
RETURNS text AS $$
  SELECT coalesce(
    current_setting('request.jwt.claims', true)::json
      -> 'app_metadata' ->> 'role',
    'athlete'
  )
$$ LANGUAGE sql STABLE;
```

### 2.3 Subscription & Payment

#### Stripe Integration

**Integration approach:** `@supabase/stripe-sync-engine` (standalone npm library, released mid-2025).

- Listens to Stripe webhook events in a Route Handler at `/api/webhooks/stripe`
- Normalizes and stores events in a dedicated `stripe` schema (customers, subscriptions, invoices, prices, products)
- A database trigger updates `profiles.subscription_tier` and `profiles.subscription_status` from the synced `stripe.subscriptions` table
- The `profiles` fields are denormalized reads for fast RLS checks; `stripe.subscriptions` is the source of truth

**Webhook flow:**
```
Stripe Event
  -> POST /api/webhooks/stripe (Route Handler, NOT Server Action)
  -> Verify signature (stripe.webhooks.constructEvent)
  -> Pass to stripe-sync-engine for schema sync
  -> DB trigger updates profiles table
  -> RLS policies use profiles.subscription_tier for access control
```

#### Swedish VAT (Moms)

| Requirement | Detail |
|-------------|--------|
| Standard rate | 25% VAT on digital services (SaaS, online courses) |
| Registration threshold | SEK 120,000/year. Below this, VAT-exempt. |
| B2C sales | Must charge 25% Swedish VAT to Swedish consumers |
| B2B sales (EU) | Reverse charge mechanism applies |
| B2B sales (non-EU) | Generally no Swedish VAT |

**Decisions:**
- Enable **Stripe Tax** from day one. Marginal cost, avoids painful retrofit at scale.
- All consumer-facing prices are **inclusive of 25% moms** (Swedish convention).
- B2B invoicing (schools, clubs) uses Stripe Invoicing with VAT number handling.

#### Subscription Tiers

| Tier | Price (incl. moms) | Includes |
|------|-------------------:|----------|
| Free | 0 SEK | Intro modules + 10 AI coach messages/week |
| Standard | 799 SEK/year | Full program access + 50 AI coach messages/day |
| Premium | 2,499 SEK/year | Everything + psychologist sessions (future) + unlimited AI |

### 2.4 Row-Level Security (RLS)

All tables use RLS policies with the `auth.role()` helper for performance (JWT claim extraction is O(1) vs table join O(n)).

#### Policy Patterns by Table

**profiles:**
- `SELECT`: Own profile. Admins: all. Psychologists: assigned athletes.
- `UPDATE`: Own profile (except `role`, `subscription_tier`, `subscription_status`). Admins: any.
- `INSERT`: Only via trigger on auth.users creation.
- `DELETE`: Admins only (soft-delete preferred).

**lesson_progress:**
- `SELECT`: Own. Admins: all. Psychologists: assigned athletes.
- `INSERT/UPDATE`: Own only.

**Content tables (modules, lessons, content_blocks):**
- `SELECT`: All authenticated users (content gated by subscription at app layer, not RLS).
- `INSERT/UPDATE/DELETE`: Admins only.

**ai_conversations / ai_messages:**
- `SELECT/INSERT/UPDATE`: Own only. Admins: read all (for monitoring flagged conversations).
- Psychologists: NO access unless explicitly consented by athlete.

#### Performance Best Practices
- Use JWT claims via `auth.role()`, not table joins
- Pair UPDATE policies with matching SELECT policies
- Index all columns used in policy filters (especially `user_id`)
- Use `SECURITY DEFINER` functions for complex permission checks
- Always specify `TO authenticated` in policies

#### Psychologist Assignment (Future)

```
psychologist_assignments
  id (uuid)
  psychologist_id (uuid, FK to profiles)
  athlete_id (uuid, FK to profiles)
  status (text) -- 'active' | 'ended'
  created_at, ended_at
```

### 2.5 Age & GDPR Compliance

Sweden set the digital consent age at **13** (Article 8 GDPR). Since the target is 15-25, most users consent independently.

| Requirement | Implementation |
|-------------|----------------|
| Ages 13-14 | Trigger parental consent flow: email parent/guardian, account in "pending_consent" state until confirmed |
| Plain language | Privacy policy and terms must be understandable by teenagers, in Swedish |
| Data minimization | Collect age bracket, not exact birthdates |
| Right to erasure | Self-service account deletion from day one, including all AI conversation history |
| AI coaching data | Shorter retention for under-18 (90 days vs indefinite). Additional safety boundaries in system prompt. Escalation includes "talk to a parent/coach." |
| Consent for AI | Explicit consent during onboarding that messages are processed by a third-party AI provider (Anthropic) |

---

## 3. LMS / Microlearning Experience

### 3.1 Content Model

**Program structure:** 34 lessons across 7 modules, ~140 minutes total content.

```
programs
+-- id, title, description, order

modules (7 modules)
+-- id, program_id, title, description, order
+-- act_process (text) -- values | acceptance | defusion | present_moment |
    self_as_context | committed_action | integration
+-- icon, color_theme
+-- estimated_duration_minutes

lessons (micro-units within modules)
+-- id, module_id, title, order
+-- lesson_type (text) -- "video" | "text" | "exercise" | "reflection" | "quiz"
+-- content (jsonb) -- structured content blocks (BlockNote JSON format)
+-- vimeo_video_id (text, nullable)
+-- duration_seconds (int) -- target: 2-5 minutes per lesson
+-- metadata (jsonb) -- tags, difficulty, prerequisites

lesson_progress
+-- id, user_id, lesson_id
+-- status (text) -- "not_started" | "in_progress" | "completed"
+-- started_at, completed_at
+-- responses (jsonb) -- exercise answers, reflections, quiz results
+-- ai_feedback (jsonb) -- personalized AI responses to exercises
```

#### Module Structure

| # | Module | ACT Process | Lessons | Duration |
|---|--------|------------|---------|----------|
| 1 | Varderingar | Values | 5 | ~20 min |
| 2 | Acceptans | Acceptance | 6 | ~25 min |
| 3 | Defusion | Cognitive Defusion | 5 | ~20 min |
| 4 | Narvarande Ogonblick | Present Moment | 5 | ~18 min |
| 5 | Sjalvet som Kontext | Self-as-Context | 4 | ~15 min |
| 6 | Engagerat Handlande | Committed Action | 5 | ~22 min |
| 7 | Integration | Hexaflex in Practice | 4 | ~18 min |

**Pedagogical note:** The order is intentional (Values first -- they motivate everything; Committed Action last -- integrates all processes into behavior). The AI coach can reference any process at any time. Self-as-Context is the most abstract process and intentionally shortest; lean heavily on metaphor-based video content.

### 3.2 Microlearning UX

#### Navigation: CSS Scroll Snap (Primary) + Framer Motion (Within-Card)

**Primary navigation** between lesson cards uses native CSS `scroll-snap-type: y mandatory`. This provides GPU-composited 60fps scrolling on all devices with zero JavaScript on the scroll path. Browser support: 96%+.

```css
.lesson-feed {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100dvh;
}

.lesson-card {
  scroll-snap-align: start;
  height: 100dvh;
  scroll-snap-stop: always; /* prevents skipping cards */
}
```

**Within-card animations** use Framer Motion for interactive exercises (drag-to-sort), celebration screens, and content fade-ins.

**Active card detection:** IntersectionObserver with threshold 0.5. When a card becomes >50% visible, it becomes "active" -- triggering video autoplay, progress tracking, and analytics events.

**Desktop:** Cards max-width 720px centered. Keyboard navigation (arrow keys) for accessibility. Click-to-advance button as scrolling alternative.

**Do NOT use** carousel/slider libraries (react-spring, swiper, keen-slider). They fight browser scroll behavior.

#### Lesson Flow

```
[Card 1: Video] -> [Card 2: Key Insight] -> [Card 3: Reflection Prompt] ->
[Card 4: AI Feedback] -> [Card 5: Takeaway] -> [Completion Screen]

Each card:
- Full-screen or near-full-screen on mobile
- Swipe up / tap "Continue" to advance
- Progress dots visible throughout
- 30-90 seconds per card
- Total lesson: 2-5 minutes (4-8 cards)
```

#### Key UX Principles
- **2-5 minute lessons** -- each card completable in one sitting
- **Vertical scroll / swipe** -- natural mobile gesture, works on desktop
- **Progress is visible** -- dots, streaks, completion percentage
- **AI feedback on exercises** -- submit a reflection, get personalized ACT-informed response
- **No dead ends** -- always a next action (next lesson, talk to coach, review progress)
- **"Dagens Ovning" (Today's Exercise)** -- one recommended exercise per day drawn from current module progress, providing a low-friction reason to return daily

### 3.3 Content Block Types

Content within lessons is stored as structured JSON blocks (BlockNote format):

| Block Type | Description |
|-----------|-------------|
| `text` | Rich text content (markdown) |
| `video` | Vimeo embed (short-form, 1-3 min) |
| `image` | Illustration or diagram |
| `exercise_text` | Free-text reflection prompt |
| `exercise_choice` | Multiple choice / scale rating |
| `exercise_sorting` | Drag-and-drop ordering (e.g., value prioritization) |
| `quiz` | Knowledge check with feedback |
| `callout` | Highlighted insight or key takeaway |
| `ai_prompt` | Triggers AI coach with context from the lesson |

### 3.4 Progress & Gamification

**Five intrinsic-motivation patterns. Zero competition.**

Traditional gamification (leaderboards, XP, rankings) directly conflicts with ACT principles. Self-worth is not contingent on performance relative to others. Social comparison is itself a cognitive fusion trap.

#### Pattern 1: Consistency Streaks
- Track consecutive days with at least one completed lesson card
- Warm, encouraging language: "7 dagar i rad -- du bygger en vana"
- Streak freezes: 1/week (Standard), 2/week (Premium)
- When a streak breaks, ACT framing: "Streaks break. What matters is showing up again. That's committed action."

#### Pattern 2: Personal Hexaflex Visualization
- Six ACT processes as a radar chart that evolves based on completed lessons and exercise depth
- Score derived from: lessons completed (40%), exercise quality/depth (30%), AI coach interactions (30%)
- Framed as "your psychological flexibility profile," not a score to maximize
- Historical snapshots: "Here's your hexaflex 4 weeks ago vs. today"

#### Pattern 3: Training Time & Reflection Time
- "Traningstid" -- total minutes in microlearning content
- "Reflektionstid" -- total minutes on exercises and AI coach
- Milestones: "Du har lagt 60 minuter pa mental traning"
- Connected to committed action: time spent is evidence of living your values

#### Pattern 4: Personal Insight Cards
- After completing a module, AI generates a personalized summary of key reflections, patterns noticed, values connections, and one concrete recommendation
- Accumulates in a "My Insights" section -- a personal journal of growth
- Differentiator: no existing app does this well

#### Pattern 5: Private Achievement Badges
- Categories: Consistency ("7-Day Streak"), Depth ("First Reflection Submitted"), Process Milestones ("Values Explorer"), Integration ("Hexaflex Complete")
- Private, not shareable, not competitive
- Never use ranking language (Bronze/Silver/Gold) or imply levels

#### Anti-Patterns (Never Implement)

| Anti-Pattern | Reason |
|-------------|--------|
| Leaderboards | Social comparison, extrinsic motivation |
| XP / Points systems | Reduces intrinsic motivation, gamifies reflection |
| "Share your achievement" | Social comparison, performance pressure |
| Punishing streak breaks | Creates anxiety, opposite of acceptance |
| Timed challenges | Rushes reflection, undermines present-moment contact |
| Completion % as primary metric | Quantity over quality, "checklist mentality" |

---

## 4. AI Coach Integration

### 4.1 Architecture

**Vercel AI SDK + Route Handler** for streaming. Not Server Actions (cannot stream long-lived responses).

```
Client (useChat hook from @ai-sdk/react)
  -> POST /api/ai/chat (Next.js Route Handler, Node.js runtime)
  -> Auth verification: getUser()
  -> Pre-LLM crisis keyword detection (server-side)
  -> Vercel AI SDK streamText() with @ai-sdk/anthropic provider
  -> Server-Sent Events streamed back to client
  -> Client renders tokens incrementally
  -> Response stored in conversation history
```

**Runtime:** Node.js (not Edge). Edge has a 25s execution limit on Vercel Pro; coaching responses may take longer. Node supports up to 300s.

**Model:** Haiku 4.5 or Sonnet 4.6, selected based on cost/quality tradeoff as usage data emerges. The content domain is small and well-defined (7 modules of ACT/MAC material), no RAG is needed, and microlearning interactions are brief -- making this a cost-efficient AI use case. Model routing (Haiku for exercise feedback and quick responses, Sonnet for deeper coaching) can be introduced if quality differentiation warrants it. Haiku 4.5 for background tasks (summarization, classification, content tagging).

### 4.2 AI Coach Capabilities

| Capability | Description |
|-----------|-------------|
| **Exercise feedback** | Personalized ACT-informed responses to reflections and exercises |
| **Guided exploration** | Helps athletes explore values, identify obstacles, develop committed actions |
| **Lesson companion** | Available during any lesson to clarify concepts, go deeper |
| **Check-ins** | Proactive prompts based on progress |
| **Psychoeducation** | Explains ACT concepts in accessible, sport-relevant Swedish |
| **Safety boundaries** | Recognizes when to recommend professional support (not a therapist) |

### 4.3 System Prompt Design

**Written in Swedish.** A Swedish system prompt produces consistent Swedish output, aligns with established Swedish ACT terminology, and encodes the right cultural coaching tone.

**Layered architecture:**

| Layer | Content | Caching |
|-------|---------|---------|
| **1. Identity & Boundaries** | Role definition, what the coach IS and IS NOT, escalation triggers | Static, cached |
| **2. ACT/MAC Framework** | Six core processes with definitions, coaching questions, athlete scenarios, all in Swedish sport language | Static, cached |
| **3. Coaching Stance** | Curious, non-judgmental, Socratic. Sport metaphors. Match athlete's emotional tone. | Static, cached |
| **4. Safety Protocol** | Crisis keywords, escalation language, declined topics, response templates | Static, cached |
| **5. User Context** | Profile, module/lesson context, exercise responses, toughness model, conversation history | Dynamic, per-request |

#### ACT Process Encoding

| ACT Process | Swedish Term | Coaching Instruction Pattern |
|-------------|-------------|------------------------------|
| Values | Varderingar | "Help articulate specific values. Ask: 'What kind of athlete do you want to be?' not 'What do you want to achieve?'" |
| Acceptance | Acceptans | "Normalize difficult feelings. Do NOT try to eliminate them. Ask: 'What if that feeling could be there AND you could still perform?'" |
| Cognitive Defusion | Kognitiv defusion | "Help notice thoughts as thoughts, not facts. Use: 'Notice that your mind is telling you...'" |
| Present Moment | Narvarande ogonblick | "Guide attention to present-moment experience. Connect to what they can control RIGHT NOW." |
| Self-as-Context | Sjalvet som kontext | "Help see themselves as the observer of thoughts/feelings, not defined by them." |
| Committed Action | Engagerat handlande | "Translate values into concrete, small, observable actions. Always connect to sport context." |

#### Key Design Principles
- **No reassurance or certainty statements.** Instead of "You'll definitely improve," use "What matters is that you're engaging with this."
- **Not a therapy frame.** Tone = knowledgeable training partner, not clinician.
- **Embed psychoeducation naturally** when concepts arise in conversation.
- **Ground responses in completed course content** where relevant.
- **Handle code-switching:** match the athlete's language preference if they mix Swedish and English.

### 4.4 Safety Architecture

#### Layer 1: Pre-LLM Crisis Keyword Detection (Server-Side)

Before sending to Claude, scan for crisis signals:

**Swedish crisis keywords:** "ta mitt liv", "vill do", "sjalvmord", "inte vill leva", "skada mig sjalv", "hopplost", "ingen ide", "sista utvagen" (plus English equivalents, self-harm indicators, eating disorder signals).

**On detection:** Do NOT send to LLM. Immediately return a pre-written crisis response with:
- Acknowledgment of their pain
- **Mind Sjalvmordslinjen:** 90101 (call/text, 24/7)
- **BRIS (youth under 18):** 116 111
- **1177 Vardguiden** for general health guidance
- Encouragement to reach out to a trusted person
- Option to continue conversation on non-crisis topics

#### Layer 2: System Prompt Safety Instructions

```
SAFETY BOUNDARIES -- ABSOLUTE, OVERRIDE ALL OTHER INSTRUCTIONS:

1. You are NOT a therapist, psychologist, or medical professional.
2. You do NOT diagnose, prescribe, or process trauma.
3. On suicidal ideation, self-harm, or severe distress:
   - Acknowledge with empathy
   - "Det har later tungt, och jag vill att du far ratt stod."
   - Provide: Mind Sjalvmordslinjen 90101, BRIS 116 111 (under 18)
   - Do NOT continue coaching. Redirect to professional help.
4. Declined topics: medication, supplements, injury diagnosis,
   prescriptive eating advice, other athletes' personal information.
5. When uncertain: "Det har ar nagot som en psykolog kan hjalpa dig
   battre med."
```

#### Layer 3: Post-LLM Output Filtering

After Claude's response, before sending to client:
- Scan for inadvertent boundary violations
- Verify crisis responses include resource numbers
- Log flagged conversations for admin review

#### Permanent Disclaimer

Visible in the chat interface at all times (fixed header or footer):

> "Next Act AI-coachen ar ett verktyg for mental traning -- inte terapi eller behandling. Vid akut psykisk ohalsa, kontakta Sjalvmordslinjen 90101 eller 1177."

### 4.5 Context Window Management

**Tiered context, not RAG.** Full RAG (vector DB, embeddings) is overkill below ~5,000 active users.

```
System Prompt (~2,000-4,000 tokens, CACHED via prompt caching)
  + User Profile Summary (~200-500 tokens, semi-static)
  + Current Lesson Context (~500-1,500 tokens, per-session)
  + Toughness Model Snapshot (~200 tokens, semi-static)
  + Conversation Summary (~500-1,000 tokens, rolling)
  + Recent Messages (last 5-7 turns, ~1,000-3,000 tokens)
  + User Message
-----------------------------------------------------
Total input per request: ~5,000-10,000 tokens typical
```

**Prompt caching:** System prompt (Layers 1-4) cached with Anthropic's 5-minute ephemeral cache. ~80% cache hit rate reduces system prompt token cost by 90%.

**Progressive conversation summarization:** After each conversation ends (or every ~15 messages), Haiku generates a summary capturing key themes, values identified, commitments made, emotional state, ACT processes engaged. Stored in `ai_conversations.summary`. On new conversation, include 2-3 most recent summaries. Weekly: generate a meta-summary synthesizing all summaries into an athlete profile narrative.

**When to add RAG:** User base exceeds ~5,000 active users with long-running conversations, or when adding a sport psychology knowledge base. Supabase has built-in `pgvector` support.

### 4.6 Conversation Storage

```
ai_conversations
+-- id, user_id
+-- context_type (text) -- "general" | "lesson" | "exercise" | "check_in"
+-- context_id (text, nullable) -- lesson_id or exercise_id
+-- summary (text, nullable) -- AI-generated conversation summary
+-- created_at

ai_messages
+-- id, conversation_id
+-- role (text) -- "user" | "assistant"
+-- content (text)
+-- metadata (jsonb) -- token usage, model version, flagged status
+-- created_at
```

### 4.7 Rate Limiting & Cost Management

| Tier | AI Coach Limit |
|------|---------------|
| Free | 10 messages/week |
| Standard | 50 messages/day |
| Premium | Unlimited |

Token usage tracked per user in `ai_usage` table for cost monitoring.

### 4.8 EU AI Act Compliance

The EU AI Act becomes fully applicable **August 2, 2026**. The AI coach is classified as **limited-risk** (not high-risk: no medical decisions, no education assessment).

**Obligations:**
1. **Transparency (Article 52):** Interface clearly states this is an AI, not a human.
2. **No exploitation of vulnerabilities:** Athletes under 18 are a potentially vulnerable group. Coaching must not manipulate or exploit.
3. **GDPR:** Conversation data is personal data. Clear consent for AI processing. Right to deletion. Privacy policy discloses data sent to Anthropic (US-based).
4. **Not a medical device:** Does not diagnose or treat, so MDR does not apply. Do not drift into health claims.

### 4.9 Multilingual Considerations

- Swedish tokens are ~10-15% more expensive per concept than English (compound words, morphology). Factored into cost estimates.
- Maintain separate system prompts per language (not "respond in the user's language"). Separate prompts allow culturally appropriate framing.
- Instruct Claude to use "idiomatiskt sprak som en infodd svensk talare."

---

## 5. Marketing Pages & Content

### 5.1 Pages

All marketing pages are statically generated (SSG) for performance and SEO.

| Page | Route | Content Type |
|------|-------|-------------|
| Home | `/` | Hero, program overview, testimonials, CTA |
| About Program | `/om-programmet` | Detailed program description, module map |
| Schools | `/skolor` | B2B landing page for school partnerships |
| Clubs | `/klubbar` | B2B landing page for sports clubs |
| Pricing | `/priser` | Tier comparison, Stripe checkout integration |
| Blog | `/blogg` | Article listing |
| Blog Post | `/blogg/[slug]` | Individual articles |
| Contact | `/kontakt` | Contact form |
| Login | `/logga-in` | Auth page |
| Register | `/registrera` | Signup + onboarding |
| Privacy | `/integritet` | Privacy policy |
| Terms | `/villkor` | Terms of service |

### 5.2 Blog / Content Management

- **MDX files in the repo** for initial blog content -- simple, version-controlled, no CMS dependency
- Admin can create/edit posts through the admin dashboard (writes to database)
- No headless CMS needed at this scale

### 5.3 SEO

- SSG for all marketing pages
- Proper meta tags, Open Graph, structured data
- Swedish language `<html lang="sv">`
- Sitemap generation
- Performance target: Lighthouse 95+ on all marketing pages

---

## 6. Messaging & Notifications

### 6.1 Channel Strategy

**In-app notifications are the primary engagement channel.** They are free (Supabase Realtime) and most appropriate for the young athlete demographic. SMS is used sparingly -- critical alerts only (payment failures, password resets). WhatsApp is deferred until user demand is validated.

### 6.2 Notification Types

| Event | Channel | Description |
|-------|---------|-------------|
| Welcome / Onboarding | Email | Account creation confirmation |
| Module unlocked | In-app | New content available |
| Streak reminder | In-app | "Keep your streak going!" |
| AI coach check-in | In-app | Proactive coaching prompt |
| Exercise feedback ready | In-app | AI responded to a reflection |
| Subscription renewal | Email | Payment reminders |
| Payment failure | Email + SMS | Critical -- subscription at risk |
| Password reset | Email | Transactional |
| New blog post | Email (opt-in) | Content marketing |
| Psychologist session reminder | Email + SMS | Premium tier (future) |

### 6.3 User Preferences

Users control notifications in profile settings:
- Preferred channels (in-app, email)
- Quiet hours (e.g., no notifications after 22:00)
- Per-type opt-in/opt-out
- Onboarding includes "Preferred notification channel" selection to validate future WhatsApp demand

### 6.4 Implementation

- **Resend** for transactional email. React Email for templates (JSX/TSX). Custom sender domain: `noreply@nextact.se`.
- **Twilio** for SMS -- Alphanumeric Sender ID (free number, one-way). Critical alerts only.
- **Supabase Realtime** for in-app notifications (subscribe to notification channel per user).
- **WhatsApp:** Deferred. If >50% of users select WhatsApp as preferred channel during onboarding, prioritize. When ready, evaluate Meta Cloud API direct before Twilio (saves $0.005/message BSP fee). Sinch (Swedish company) worth evaluating for unified SMS + WhatsApp.

### 6.5 Notification Schema

```
notifications
+-- id, user_id
+-- type (text) -- event type
+-- channel (text) -- "email" | "sms" | "in_app"
+-- status (text) -- "pending" | "sent" | "failed" | "read"
+-- content (jsonb) -- message content
+-- scheduled_for (timestamptz, nullable)
+-- sent_at (timestamptz, nullable)
+-- created_at
```

---

## 7. Admin Dashboard & Content Management

### 7.1 Admin Capabilities

| Feature | Description |
|---------|-------------|
| **Content Editor** | Create/edit modules, lessons, content blocks (BlockNote visual editor) |
| **User Management** | View users, subscription status, progress overview |
| **Analytics** | Engagement metrics, completion rates, popular content |
| **AI Coach Monitor** | Review flagged conversations, usage stats, safety protocol triggers |
| **Notification Manager** | Send announcements, manage templates |
| **Blog Editor** | Create/edit blog posts |

### 7.2 Content Editor: BlockNote

**`@blocknote/react` v0.47.x** -- Notion-style block editor, optimized for non-technical admins.

Why BlockNote: Provides Notion-style editing experience out of the box (slash menu, drag-to-reorder, floating toolbar). Custom block types via `createReactBlockSpec` API. Native block-based JSON output maps directly to `content (jsonb)` column. No collaboration overhead (single admin). If deeper customization is needed, Tiptap (BlockNote's foundation) is the migration path.

**Custom blocks:**

| Block Type | Editor UI | Stored As |
|-----------|-----------|-----------|
| `video` | Vimeo URL input + thumbnail preview | `{ type: "video", vimeoId: "..." }` |
| `exercise_text` | Prompt text + placeholder preview | `{ type: "exercise_text", prompt: "...", placeholder: "..." }` |
| `exercise_choice` | Options editor (add/remove/reorder) | `{ type: "exercise_choice", options: [...], allowMultiple: bool }` |
| `exercise_sorting` | Sortable items editor | `{ type: "exercise_sorting", items: [...] }` |
| `callout` | Styled callout with icon picker | `{ type: "callout", style: "insight" | "warning" | "tip", text: "..." }` |
| `ai_prompt` | AI prompt template editor | `{ type: "ai_prompt", systemContext: "...", triggerLabel: "..." }` |
| `quiz` | Question + answers + correct marker | `{ type: "quiz", question: "...", answers: [...], correctIndex: n }` |

**Draft/Publish workflow:** Content goes through draft -> review -> published states.

**Warning:** BlockNote is pre-1.0. Pin to specific minor version (`"@blocknote/react": "~0.47.1"`) in package.json.

### 7.3 Analytics Dashboard

- **Engagement:** DAU/WAU/MAU, session duration, streak distribution
- **Content:** Module/lesson completion rates, drop-off points
- **AI Coach:** Messages per user, common topics, safety protocol triggers, satisfaction signals
- **Revenue:** Subscription metrics, tier distribution, churn rate (via Stripe)
- **Built with:** Server-side data aggregation + Recharts (or similar)

---

## 8. Video Hosting

### 8.1 Vimeo Integration

**Custom wrapper over `@vimeo/player` v2.30.x.** Do not use `@u-wave/react-vimeo` (unnecessary community wrapper).

**Embed configuration:**
```
{
  id: vimeoVideoId,
  muted: true,             // Required for autoplay
  controls: false,         // Chromeless -- custom React controls
  responsive: true,
  dnt: true,               // Do Not Track (GDPR)
  title: false,
  byline: false,
  portrait: false,
  speed: false,
  loop: false,
  autopause: true,
}
```

**Key behaviors:**
- Autoplay on scroll-into-view (muted, via IntersectionObserver threshold 0.7)
- Custom player controls matching Next Act design language
- Progress tracking: mark video as watched at 90%+ completion
- `ended` event triggers auto-advance to next card
- Default Swedish captions enabled (`player.enableTextTrack('sv')`)
- Videos set to "Hide from Vimeo" -- embeddable on nextact.se only

### 8.2 Video Format
- Short-form: 1-3 minutes target, 5 min max
- Videos start muted with visible captions, clear unmute button
- Captions: Swedish default, English for future expansion

---

## 9. Brand Design Tokens

### 9.1 Typography

| Role | Font | Weight |
|------|------|--------|
| Headings | Montserrat | 600-700 |
| Body | Source Sans Pro | 400-600 |

### 9.2 Colors

| Token | Value | Usage |
|-------|-------|-------|
| Primary Blue | `#2670E6` | Primary actions, links, active states |
| Hover Blue | `#4582E4` | Hover states on primary elements |
| Dark Navy | `#181827` | Primary text, dark backgrounds |
| Charcoal | `#3C3950` | Secondary text, borders |
| Light Gray | `#B7C6C9` | Disabled states, dividers |
| Off-White 1 | `#F9F9F9` | Page backgrounds |
| Off-White 2 | `#F0F3F2` | Card backgrounds, alternating sections |
| Success Green | `#4AD48C` | Completion, streaks, positive feedback |
| Cyan Accent | `rgba(29, 189, 212, 1)` | Highlights, notifications, accent |

### 9.3 Border Radius

| Element | Radius |
|---------|--------|
| Inputs | `0.5rem` |
| Cards | `1rem` |
| Pill buttons | `3rem` |
| Large buttons | `4rem` |

### 9.4 Design Principles

- Use the existing brand as foundation but improve UX across all touchpoints
- Design must NOT look AI-generated -- clean, polished, modern, distinctive
- Calm aesthetic inspired by Headspace (not aggressive gamification)
- Mobile-first, but equally polished on desktop

---

## 10. Technical Foundation

### 10.1 Project Structure

```
nextact-platform/
src/
  app/                            # Next.js App Router
    (marketing)/                  # Route group: SSG pages
      page.tsx                    # Home
      om-programmet/
      priser/
      blogg/
      kontakt/
      integritet/
      villkor/
      layout.tsx                  # Marketing layout (header, footer)
    (auth)/                       # Route group: auth pages
      logga-in/
      registrera/
      layout.tsx                  # Minimal auth layout
    (platform)/                   # Route group: authenticated LMS
      layout.tsx                  # App shell (nav, bottom bar, auth guard)
      dashboard/
        page.tsx
      learn/
        [module-id]/
          page.tsx
          [lesson-id]/
            page.tsx
      coach/
        page.tsx
      progress/
        page.tsx
      profile/
        page.tsx
    (admin)/                      # Route group: admin area
      admin/                      # Keeps /admin in URL
        layout.tsx
        content/
        users/
        analytics/
    api/                          # Route Handlers
      webhooks/
        stripe/
        twilio/
      ai/
        chat/                     # AI coach streaming endpoint
    layout.tsx                    # Root layout
    not-found.tsx
    error.tsx
    loading.tsx
  components/
    ui/                           # Primitives (Button, Input, Card, Modal)
    features/                     # Domain-aware components
      auth/                       # Login form, signup wizard
      lms/                        # Lesson card, module list, progress bar
      coach/                      # Chat interface, message bubble
      admin/                      # Content editor, user table
    layouts/                      # Shared layout components
      marketing-header.tsx
      app-sidebar.tsx
      admin-nav.tsx
  lib/
    actions/                      # Server Actions (thin wrappers)
      auth.ts                     # "use server" - login, signup, logout
      lessons.ts                  # "use server" - mark complete, submit response
      coach.ts                    # "use server" - create conversation
      notifications.ts            # "use server" - update preferences, mark read
      admin.ts                    # "use server" - CRUD content, manage users
    services/                     # Pure business logic (testable, no Next.js context)
      ai/                         # Prompt builders, context assembly, safety screening
      messaging/                  # Resend + Twilio integration
      stripe/                     # Payment logic
      vimeo/                      # Video metadata
    supabase/
      client.ts                   # Browser client
      server.ts                   # Server client (cookies-based, getUser())
      admin.ts                    # Service role client (for webhooks)
      types.ts                    # Generated database types
    validations/                  # Zod schemas
      auth.ts
      lessons.ts
      notifications.ts
  hooks/
  types/
  styles/                         # Global styles, design tokens, Tailwind config
supabase/
  migrations/
  seed.sql
  config.toml
tests/
  unit/                           # Vitest unit tests
  integration/                    # API/service integration tests
  e2e/                            # Playwright E2E tests
public/                           # Static assets
docs/                             # Documentation
.github/
  workflows/
    ci.yml
    production.yml
    zizmor.yml
```

**Key structural decisions:**
- `(platform)` route group replaces `app/app/` to avoid confusing double-app path
- `lib/actions/` contains thin Server Action wrappers (form data handling, calling services, revalidation). If an action exceeds ~20 lines, extract logic to `lib/services/`.
- `lib/services/` contains pure business logic, testable without Next.js context.
- `lib/validations/` centralizes Zod schemas.

### 10.2 Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` | Framework |
| `react`, `react-dom` | UI |
| `@supabase/supabase-js` | Database, auth, storage, realtime |
| `@supabase/ssr` | Server-side auth (replaces deprecated @supabase/auth-helpers-nextjs) |
| `@supabase/stripe-sync-engine` | Stripe <-> Supabase sync |
| `ai`, `@ai-sdk/react`, `@ai-sdk/anthropic` | Vercel AI SDK for streaming |
| `@stripe/stripe-js`, `stripe` | Payment processing (client + server) |
| `resend` | Transactional email |
| `twilio` | SMS (critical alerts) |
| `@vimeo/player` | Video player embedding |
| `next-intl` | Internationalization |
| `tailwindcss` | Utility-first CSS (custom design tokens) |
| `framer-motion` | Animations (within-card, exercises, transitions) |
| `zod` | Runtime validation |
| `@blocknote/core`, `@blocknote/react` | Admin content editor |

### 10.3 Database Schema Summary

```sql
-- Core
profiles              -- Extended user data (linked to auth.users)

-- Stripe (managed by stripe-sync-engine)
stripe.customers      -- Stripe customer data
stripe.subscriptions  -- Source of truth for subscriptions
stripe.invoices       -- Invoice history
stripe.prices         -- Product pricing
stripe.products       -- Product definitions

-- Content
programs              -- Top-level program container
modules               -- 7 modules per program
lessons               -- Micro-lessons within modules
content_blocks        -- Ordered blocks within lessons (BlockNote JSON)

-- Progress
lesson_progress       -- Per-user, per-lesson completion + responses
module_progress       -- Aggregated module progress
user_streaks          -- Engagement streak tracking
toughness_model       -- Personal ACT hexaflex scores

-- AI Coach
ai_conversations      -- Conversation threads + summaries
ai_messages           -- Individual messages
ai_usage              -- Token usage tracking per user

-- Notifications
notifications         -- Multi-channel notification queue
notification_preferences -- Per-user channel preferences

-- Blog
blog_posts            -- Blog content (admin-managed)

-- Future
psychologist_assignments -- Psychologist <-> athlete mapping
```

### 10.4 Middleware

Single middleware file at `src/middleware.ts`. Handles:
1. Supabase session refresh (required -- Server Components cannot write cookies)
2. Route protection (`/app/*` requires auth, `/admin/*` requires admin role)
3. Locale detection (for `next-intl`)
4. Redirect logic (unauthenticated -> `/logga-in`)

Composes Supabase session refresh with `next-intl` locale detection (documented pattern).

**Keep middleware lean.** Heavy logic belongs in layouts or server actions.

### 10.5 Environment & Tooling

- **TypeScript** strict mode
- **ESLint** + **Prettier** for code quality
- **Vitest** for unit/integration tests
- **Playwright** for E2E tests
- **GitHub Actions** for CI/CD (three workflows)
- **Supabase CLI** for local development and migrations
- **pnpm** for package management

### 10.6 CI/CD

#### Three Workflow Architecture

```
Pull Request -> ci.yml (lint, typecheck, test, migration check, zizmor)
                  |
                  +-> Vercel Preview Deployment (automatic via GitHub integration)

Merge to main -> production.yml (Supabase migration push)
                    |
                    +-> Vercel Production Deployment (automatic)

All PRs + pushes -> zizmor.yml (GitHub Actions security analysis)
```

**ci.yml (all PRs):**
1. Checkout, setup Node.js + pnpm
2. Install dependencies
3. TypeScript type checking (`tsc --noEmit`)
4. ESLint
5. Vitest (unit + integration)
6. Supabase CLI migration validation
7. zizmor for Actions security

**production.yml (merge to main):**
1. Checkout, setup Supabase CLI
2. Link to production project
3. `supabase db push` to apply pending migrations
4. Vercel handles Next.js deployment automatically

**zizmor.yml:** Standard zizmor workflow per repository setup guidelines, pinned to commit hash.

**Preview deployments:** Vercel preview URLs + staging Supabase project (all previews share one staging DB). CI tests run against local Supabase in Docker. Supabase Auth wildcard redirect: `https://*-nextact.vercel.app/auth/callback`.

**Required GitHub Secrets:** `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID`, `STAGING_PROJECT_ID`, `STAGING_DB_PASSWORD`.

---

## 11. Cost Projections

### 11.1 Monthly Infrastructure Costs

The content domain is small and well-defined (7 modules, ~140 min of ACT/MAC material). No RAG is needed. Microlearning interactions are brief. This makes AI costs very manageable -- the earlier research overestimated by assuming high message volumes and large context windows.

#### At 100 Users

| Service | Tier | Monthly Cost |
|---------|------|------------:|
| Vercel | Pro (1 seat) | $20 |
| Supabase | Pro | $25 |
| Resend | Free (3,000/mo) | $0 |
| Twilio SMS | Pay-as-you-go (~50 msgs) | $5 |
| Claude API | Haiku/Sonnet, light usage | $15-40 |
| Stripe | 1.5% + 1.80 SEK/txn | ~$10 |
| Vimeo | Existing plan | Existing |
| **Total** | | **~$75-100/mo** |

#### At 1,000 Users

| Service | Tier | Monthly Cost |
|---------|------|------------:|
| Vercel | Pro (1-2 seats) | $25-40 |
| Supabase | Pro | $30-50 |
| Resend | Free or Pro | $0-20 |
| Twilio SMS | Pay-as-you-go (~500 msgs) | $35 |
| Claude API | Haiku primary, Sonnet for deep coaching | $200-800 |
| Stripe | Per-transaction | ~$100 |
| Vimeo | Existing/upgraded plan | ~$20 |
| **Total** | | **~$410-1,065/mo** |

#### At 5,000 Users

| Service | Tier | Monthly Cost |
|---------|------|------------:|
| Vercel | Pro (2-3 seats) | $50-70 |
| Supabase | Pro | $50-100 |
| Resend | Pro | $20 |
| Twilio SMS | Pay-as-you-go (~2,500 msgs) | $155 |
| Claude API | Model routing (Haiku primary + Sonnet) | $800-2,500 |
| Stripe | Per-transaction | ~$500 |
| Vimeo | Pro plan | ~$30 |
| **Total** | | **~$1,600-3,375/mo** |

### 11.2 AI Cost Analysis

AI costs are modest for this use case because:

1. **Small, well-defined content domain** -- 7 modules of ACT/MAC material, no external knowledge needed
2. **No RAG** -- all context fits within the prompt, no embedding/vector costs
3. **Brief interactions** -- microlearning reflections are short, AI responses are focused
4. **Effective prompt caching** -- the system prompt (ACT framework, safety rules) is stable and benefits from Anthropic's 5-min ephemeral cache, reducing input costs by ~90% on cache hits

**Key assumptions:**
- Average 3-5 AI interactions/user/day (realistic for an educational platform)
- ~3,000-5,000 input tokens per request (small system prompt + user context + recent messages)
- ~200-300 output tokens per response (focused coaching feedback)
- ~80% prompt cache hit rate
- Model: Haiku 4.5 ($1/$5 per MTok) as primary, Sonnet 4.6 ($3/$15) for complex coaching

**Estimated per-message cost:**
- Haiku 4.5: ~$0.002-0.004/message
- Sonnet 4.6: ~$0.008-0.015/message
- Blended (70% Haiku / 30% Sonnet): ~$0.004-0.007/message

**Per-user AI cost:** ~$0.50-1.50/month or ~$6-18/year

At 799 SEK/year (~$75 USD), AI costs represent only ~8-24% of revenue -- comfortable margin at all tiers. This is not a cost concern at current or projected scale.

**Cost optimization levers (if ever needed):**

| Optimization | Savings | Complexity |
|--------------|---------|------------|
| Prompt caching (already factored in) | 90% on system prompt | Low |
| Increase Haiku % (if quality holds) | 20-40% | Low |
| Rate limiting free tier (already planned) | Volume reduction | Low |
| Batch API for async exercise feedback | 50% on those requests | Medium |

### 11.3 Revenue vs. Cost Analysis

| Users | Monthly Revenue (est.) | Monthly Infra Cost | Margin |
|-------|----------------------:|-------------------:|-------:|
| 100 | ~$625 | ~$90 | ~86% |
| 1,000 | ~$6,250 | ~$650 | ~90% |
| 5,000 | ~$31,250 | ~$2,200 | ~93% |

Revenue assumes 100% Standard tier at 799 SEK/year. Actual mix will include Free (lower) and Premium (higher) tiers. Margins are healthy at all scales. The primary cost driver is messaging (SMS/WhatsApp) if used at volume, not AI.

---

## 12. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

- Project scaffolding (Next.js, Supabase, Vercel, GitHub repo with CI/CD)
- Three CI/CD workflows: ci.yml, production.yml, zizmor.yml
- Auth system: Google + Apple social login, magic link, email+password
- Three-layer auth verification (middleware + getUser() + RLS)
- Database schema + migrations (profiles, content tables, progress tables)
- Basic marketing pages (home, pricing, about) with design tokens
- Supabase RLS policies with `auth.role()` helper

### Phase 2: Core LMS (Weeks 3-5)

- Content data model + admin content editor (BlockNote)
- Microlearning feed UX (CSS scroll-snap, lesson cards)
- Video integration (custom Vimeo player wrapper with autoplay/tracking)
- Exercise system (text reflections, multiple choice, sorting via Framer Motion)
- Progress tracking (lesson/module completion, streaks)
- "Dagens Ovning" daily exercise feature

### Phase 3: AI Coach (Weeks 5-7)

- Vercel AI SDK integration with Route Handler streaming
- System prompt design (Swedish, layered ACT/MAC framework)
- Pre-LLM crisis keyword detection + hardcoded crisis responses
- Exercise feedback (AI responses to reflections)
- Standalone coach conversation UI with permanent disclaimer
- Context management (tiered context, prompt caching)
- Progressive conversation summarization (Haiku)
- Token usage tracking per user

### Phase 4: Payments & Messaging (Weeks 7-8)

- Stripe integration (@supabase/stripe-sync-engine, webhooks, Stripe Tax)
- Subscription tiers with VAT-inclusive pricing
- Resend email integration (React Email templates, custom sender domain)
- In-app notification system (Supabase Realtime)
- Twilio SMS for critical alerts only
- User notification preferences

### Phase 5: Admin, Gamification & Polish (Weeks 8-10)

- Admin dashboard (content management, user overview, AI coach monitor)
- Analytics dashboard (engagement, content, revenue metrics)
- Gamification: hexaflex visualization, insight cards, badges
- Content creation (34 lessons across 7 modules as microlearning content)
- Blog system
- Remaining marketing pages (schools, clubs, blog, contact, legal)
- Performance optimization, accessibility audit
- Mobile web UX polish

### Phase 6: Launch (Week 10+)

- Beta testing with select users
- Content review with domain experts (ACT/MAC accuracy)
- EU AI Act compliance review
- GDPR documentation, privacy impact assessment
- DNS cutover (nextact.se -> Vercel)
- Monitoring and observability setup
- Moodle sunset communicated to existing users

---

## 13. Questions for Product Owner

These are business/domain decisions that require input before or during implementation:

1. **Content reuse:** How much of the existing Moodle content (videos, text, exercises) can be reused vs. needs to be recreated for the microlearning card format? The 34-lesson / 7-module structure is a recommendation -- does it align with the existing content inventory?

2. **Pricing confirmation:** Are the prices (Free / 799 SEK/yr / 2,499 SEK/yr, all inclusive of 25% moms) confirmed? AI costs are well within margin at these price points.

3. **AI coach language at launch:** Swedish only, or Swedish + English from day one? Separate system prompts are required per language, so this affects development scope.

4. **Under-15 users:** The platform targets 15-25, but will 13-14 year olds be allowed? If so, the parental consent flow is needed for Phase 1. If not, registration can reject that age bracket.

5. **Module unlock sequencing:** Must modules be completed in order (linear path), or can athletes access any module? Linear is pedagogically stronger for ACT; open access reduces friction.

6. **Psychologist sessions (Premium):** Is this feature planned for initial launch or deferred? It affects Premium tier value proposition and whether to build the psychologist role/assignment system.

7. **B2B pricing for schools/clubs:** What is the pricing model for the `/skolor` and `/klubbar` landing pages? Per-seat? Bulk discount? This affects Stripe configuration and invoicing setup.

8. **Trial period:** Should new users get a trial of the Standard tier (e.g., 7 or 14 days) before defaulting to Free? This is a common SaaS pattern that improves conversion.

9. **Streak freeze limits:** The design proposes 1/week (Standard) and 2/week (Premium). Are these acceptable, or should free users also get occasional freezes?

10. **Domain expansion:** Plans for `nextact.com` or staying exclusively with `nextact.se`? This affects email sender domains and marketing.