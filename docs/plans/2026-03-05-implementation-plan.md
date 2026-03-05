# Next Act Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a unified Next.js platform replacing WordPress + Moodle + Azure for Next Act's mental training product.

**Architecture:** Next.js App Router + Supabase (auth, db, storage, realtime) + Vercel hosting. AI coach via Claude API through Vercel AI SDK. Stripe for payments. Resend for email. Swedish-first, i18n-ready.

**Tech Stack:** Next.js 15, React 19, TypeScript strict, Tailwind CSS, Framer Motion, Supabase, Vercel AI SDK, Stripe, Resend, Zod, Vitest, Playwright

**Design Doc:** `/private/tmp/nextact-platform/docs/plans/2026-03-05-nextact-final-design.md`

---

## Phase 1: Foundation (Tasks 1-8)

### Task 1: Create GitHub Repository and Scaffold Project

**Files:**
- Create: entire project scaffold

**Step 1: Create GitHub repo**

```bash
gh repo create wkoutre/nextact-platform --public --description "Next Act - Mental training platform for athletes" --clone
cd nextact-platform
```

**Step 2: Scaffold Next.js project**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

**Step 3: Install core dependencies**

```bash
pnpm add @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js resend zod framer-motion next-intl ai @ai-sdk/anthropic @ai-sdk/react @vimeo/player
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @playwright/test supabase happy-dom
```

**Step 4: Configure TypeScript strict mode**

Ensure `tsconfig.json` has `strict: true`.

**Step 5: Set up project structure**

Create the full directory tree per the design doc:
```
src/
  app/
    (marketing)/
    (auth)/
    (platform)/
    (admin)/
    api/
    layout.tsx
  components/
    ui/
    features/
    layouts/
  lib/
    actions/
    services/
    supabase/
    validations/
  hooks/
  types/
  styles/
supabase/
  migrations/
tests/
  unit/
  integration/
  e2e/
```

**Step 6: Add design tokens to Tailwind config**

Configure brand colors, fonts, border-radius in `tailwind.config.ts`:
- Montserrat (headings), Source Sans Pro (body)
- Primary Blue #2670E6, Dark Navy #181827, Charcoal #3C3950, etc.

**Step 7: Create CLAUDE.md for the repo**

Document the project conventions, tech stack, and development workflow.

**Step 8: Create .github/workflows/zizmor.yml**

Pin to commit hashes per Nick's requirements.

**Step 9: Initial commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with full directory structure"
git push -u origin main
```

---

### Task 2: Supabase Project Setup and Database Schema

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/00001_initial_schema.sql`
- Create: `supabase/seed.sql`

**Step 1: Initialize Supabase locally**

```bash
supabase init
```

**Step 2: Write initial migration**

Create all tables from the design doc:
- profiles (extends auth.users)
- programs, modules, lessons (content)
- lesson_progress, module_progress, user_streaks (progress)
- ai_conversations, ai_messages, ai_usage (AI coach)
- notifications, notification_preferences (messaging)
- blog_posts (content)

Include:
- auth.role() helper function
- RLS policies for all tables
- Triggers (profile creation on auth signup, subscription sync)
- Indexes on user_id and common query columns

**Step 3: Write seed data**

Seed the 7 ACT modules with placeholder lessons.

**Step 4: Test migration locally**

```bash
supabase start
supabase db reset
```

**Step 5: Commit**

```bash
git add supabase/
git commit -m "feat: add initial database schema with RLS policies"
```

---

### Task 3: Supabase Client Configuration

**Files:**
- Create: `src/lib/supabase/client.ts` (browser client)
- Create: `src/lib/supabase/server.ts` (server client with cookies)
- Create: `src/lib/supabase/admin.ts` (service role client for webhooks)
- Create: `src/lib/supabase/types.ts` (generated database types)

**Step 1: Generate types from schema**

```bash
supabase gen types typescript --local > src/lib/supabase/types.ts
```

**Step 2: Create browser client**

Standard `createBrowserClient` from `@supabase/ssr`.

**Step 3: Create server client**

`createServerClient` using `cookies()` from `next/headers`. Read-only cookie access for Server Components. Uses `getUser()` never `getSession()`.

**Step 4: Create admin client**

Service role client for webhook handlers (bypasses RLS).

**Step 5: Commit**

---

### Task 4: Auth System (Middleware + Login + Registration)

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/(auth)/logga-in/page.tsx`
- Create: `src/app/(auth)/registrera/page.tsx`
- Create: `src/app/(auth)/auth/callback/route.ts`
- Create: `src/components/features/auth/login-form.tsx`
- Create: `src/components/features/auth/register-form.tsx`
- Create: `src/lib/actions/auth.ts`
- Create: `src/lib/validations/auth.ts`

**Step 1: Create middleware**

Three-layer auth: token refresh, route protection (/app/* requires auth, /admin/* requires admin role), compose with next-intl.

**Step 2: Create auth callback route handler**

Handles OAuth redirects and magic link callbacks.

**Step 3: Create Zod validation schemas**

Login and registration form validation.

**Step 4: Create server actions**

Login (email+password, magic link), register, logout. Social login handled client-side via Supabase Auth UI.

**Step 5: Build login page**

Google/Apple social login buttons (primary), magic link input (secondary), email+password (tertiary). Swedish UI text. Clean, modern design using brand tokens.

**Step 6: Build registration page**

Social signup + profile completion (name, sport, age bracket). Onboarding flow after registration.

**Step 7: Commit**

---

### Task 5: Root Layout, Marketing Layout, and Core UI Components

**Files:**
- Create: `src/app/layout.tsx` (root layout)
- Create: `src/app/(marketing)/layout.tsx`
- Create: `src/components/layouts/marketing-header.tsx`
- Create: `src/components/layouts/marketing-footer.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/styles/globals.css`
- Create: `src/styles/fonts.ts`

**Step 1: Set up fonts**

Load Montserrat and Source Sans Pro via next/font/google.

**Step 2: Set up global styles**

Tailwind base with design tokens, CSS custom properties for brand colors.

**Step 3: Build core UI primitives**

Button (primary, secondary, ghost variants), Input, Card. Custom components, NOT a component library. Clean, distinctive design.

**Step 4: Build marketing header**

Logo, nav links (Om Programmet, Priser, Blogg), Login/Registrera CTA buttons. Responsive with mobile hamburger.

**Step 5: Build marketing footer**

Contact info, social links (Instagram, Facebook), legal links.

**Step 6: Set up root layout**

HTML lang="sv", metadata, font loading.

**Step 7: Commit**

---

### Task 6: Marketing Home Page

**Files:**
- Create: `src/app/(marketing)/page.tsx`
- Create: `src/components/features/marketing/hero-section.tsx`
- Create: `src/components/features/marketing/program-overview.tsx`
- Create: `src/components/features/marketing/testimonials.tsx`
- Create: `src/components/features/marketing/cta-section.tsx`

**Step 1: Build hero section**

Compelling headline, subtitle, CTA button. Background imagery/gradient. Swedish text. Must NOT look AI-generated.

**Step 2: Build program overview**

Visual representation of the 7 modules / ACT hexaflex. Interactive module map.

**Step 3: Build testimonials section**

Athlete testimonials (reuse content from existing site).

**Step 4: Build CTA section**

Pricing preview, "Kom igang" button.

**Step 5: Assemble home page**

SSG (static generation) for SEO. Proper meta tags, Open Graph.

**Step 6: Commit**

---

### Task 7: Pricing Page with Stripe Integration

**Files:**
- Create: `src/app/(marketing)/priser/page.tsx`
- Create: `src/components/features/marketing/pricing-table.tsx`
- Create: `src/lib/services/stripe/index.ts`
- Create: `src/app/api/webhooks/stripe/route.ts`
- Create: `src/lib/actions/stripe.ts`

**Step 1: Create Stripe service**

Initialize Stripe client. Create checkout session. Handle portal redirects.

**Step 2: Build pricing page**

Three-tier comparison table (Free / Standard 799 SEK / Premium 2,499 SEK). VAT-inclusive. Swedish text. Checkout buttons that create Stripe sessions.

**Step 3: Create Stripe webhook handler**

Route Handler at /api/webhooks/stripe. Verify signature. Integrate with @supabase/stripe-sync-engine. Trigger profile subscription updates.

**Step 4: Create server actions for subscription management**

Create checkout session, create portal session, check subscription status.

**Step 5: Commit**

---

### Task 8: CI/CD Pipeline

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/production.yml`
- Create: `.github/workflows/zizmor.yml`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`

**Step 1: Configure Vitest**

Set up with happy-dom, path aliases, coverage.

**Step 2: Configure Playwright**

Basic E2E config for future tests.

**Step 3: Create CI workflow**

On PR: checkout, pnpm install, type-check, lint, test, migration validation.

**Step 4: Create production workflow**

On merge to main: apply Supabase migrations.

**Step 5: Create zizmor workflow**

Per Nick's repo setup requirements. Pin to commit hashes.

**Step 6: Commit**

---

## Phase 2: Core LMS (Tasks 9-14)

### Task 9: Platform Layout (Authenticated App Shell)

Build the authenticated app shell at `(platform)/layout.tsx` with sidebar navigation, user avatar, module progress indicator.

### Task 10: Dashboard Page

Build `/app/` dashboard showing current module progress, streak counter, "Dagens Ovning" recommendation, recent AI coach conversations.

### Task 11: Microlearning Feed - Content Cards

Build the CSS scroll-snap lesson feed with card components for each content block type (video, text, exercise, callout, quiz, AI prompt). IntersectionObserver for active card detection.

### Task 12: Vimeo Video Player Component

Custom `<VimeoPlayer>` wrapper with chromeless controls, autoplay on scroll-into-view, progress tracking (90% = watched), Swedish captions default, dnt: true.

### Task 13: Exercise System

Interactive exercise components: free-text reflection, multiple choice, drag-to-sort (Framer Motion). Server actions to save responses. AI feedback integration point.

### Task 14: Progress Tracking

Lesson progress tracking, module completion, streak system, hexaflex radar chart visualization.

---

## Phase 3: AI Coach (Tasks 15-19)

### Task 15: AI Coach Route Handler

Vercel AI SDK streaming endpoint at `/api/ai/chat`. Auth verification, pre-LLM crisis detection, streamText with anthropic provider, Node.js runtime.

### Task 16: AI Coach System Prompt

Swedish 5-layer system prompt: identity, ACT/MAC framework, coaching stance, safety protocol, dynamic user context assembly.

### Task 17: AI Coach Chat UI

Chat interface using `useChat` hook. Message bubbles, streaming display, conversation history. Permanent safety disclaimer. Available from any lesson or standalone at `/app/coach`.

### Task 18: Exercise Feedback Integration

When athletes submit reflections, route to AI for personalized ACT-informed feedback. Display feedback as a card in the lesson flow.

### Task 19: Conversation Management

Store conversations in Supabase. Progressive summarization via Haiku. Rate limiting per subscription tier.

---

## Phase 4: Payments & Messaging (Tasks 20-23)

### Task 20: Stripe Checkout Flow

End-to-end subscription: pricing page -> checkout -> webhook -> profile update -> access gates.

### Task 21: Email System (Resend)

React Email templates for: welcome, magic link, module unlocked, payment receipt, streak reminder.

### Task 22: In-App Notifications

Supabase Realtime subscriptions for notifications. Notification center in platform layout. Server actions for preferences.

### Task 23: SMS Integration (Twilio)

Twilio setup for critical alerts (password reset, payment failure). Not for engagement.

---

## Phase 5: Admin & Polish (Tasks 24-28)

### Task 24: Admin Dashboard Layout

Admin route group with navigation, auth guard (admin role only).

### Task 25: Content Editor (BlockNote)

BlockNote-based content editor with custom block types (video, exercise, quiz, AI prompt, callout). Draft/publish workflow.

### Task 26: User Management

Admin user list, subscription status, progress overview, role management.

### Task 27: Remaining Marketing Pages

About, Schools, Clubs, Blog, Contact, Privacy, Terms pages.

### Task 28: Mobile Web Polish

Responsive audit, touch targets, scroll performance, PWA manifest.

---

## Phase 6: Launch Prep (Tasks 29-32)

### Task 29: Content Migration

Recreate existing 7 modules as microlearning content using the admin editor.

### Task 30: E2E Testing

Playwright tests for critical flows: registration, login, lesson completion, AI coach conversation, subscription.

### Task 31: Performance & Accessibility

Lighthouse audit (target 95+), a11y audit, SEO audit on marketing pages.

### Task 32: Deployment & DNS

Vercel production deployment, Supabase production project, DNS cutover for nextact.se, monitoring setup.
