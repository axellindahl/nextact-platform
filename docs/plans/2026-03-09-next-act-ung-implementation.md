# Next Act Ung — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the technical foundation for Next Act Ung — a character-driven, ACT-based mental training program for 12-15-year-olds — including AI-led character onboarding, template variable substitution in lesson content, and a placeholder content skeleton that Anders & Henrik can fill in.

**Architecture:** Three new pieces: (1) a `character_profiles` DB table that stores each user's personalized character data, (2) an AI onboarding chat that collects this data conversationally, and (3) a server-side template substitution system that injects `{character_name}`, `{valued_direction}` etc. into lesson content at render time. The program content itself uses the existing lesson-feed infrastructure unchanged.

**Tech Stack:** Next.js 15 App Router, Supabase (postgres + RLS), Vercel AI SDK (`streamText`, `generateObject`), Anthropic Claude, TypeScript strict, Tailwind CSS v4, Zod

---

## Context for the Implementer

Read the design doc first: `docs/plans/2026-03-09-next-act-ung-design.md`

Key existing files to understand:
- `src/app/api/ai/chat/route.ts` — existing AI chat route pattern to copy
- `src/lib/services/ai/system-prompt.ts` — existing prompt structure
- `src/components/features/coach/chat-interface.tsx` — existing chat UI to reuse
- `src/app/(platform)/learn/[moduleId]/[lessonId]/page.tsx` — lesson rendering (lines 27-174), where template substitution plugs in
- `src/components/features/lms/lesson-feed.tsx` — content block types

The existing `character_profiles` table does NOT exist yet — we create it in Task 1.

The program "Next Act Ung" does NOT exist in the DB yet — we create it in Task 7.

---

## Task 1: DB Migration — character_profiles table

**Files:**
- Create: `supabase/migrations/00004_character_profiles.sql`

**Step 1: Write the migration**

```sql
-- character_profiles: stores user's personalized character for Next Act Ung
CREATE TABLE public.character_profiles (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_name     TEXT   NOT NULL,
  valued_direction   TEXT   NOT NULL,
  main_obstacle      TEXT   NOT NULL,
  current_behavior   TEXT,
  context            TEXT   NOT NULL DEFAULT 'general'
                              CHECK (context IN ('sport','school','social','music','other','general')),
  context_detail     TEXT,
  profile_summary    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.character_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own character profile"
  ON public.character_profiles FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER handle_character_profiles_updated_at
  BEFORE UPDATE ON public.character_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

**Step 2: Apply the migration via Supabase MCP**

Use the `apply_migration` MCP tool (NOT execute_sql) with project_id `jdpqgfwzzxypjfhrtcsc` and the SQL above.

**Step 3: Verify**

Run this SQL query to confirm the table and policy exist:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'character_profiles';
```

**Step 4: Commit**
```bash
git add supabase/migrations/00004_character_profiles.sql
git commit -m "feat: add character_profiles table for Next Act Ung"
```

---

## Task 2: Onboarding System Prompt

**Files:**
- Create: `src/lib/services/ai/onboarding-prompt.ts`

**Step 1: Write the file**

```typescript
// System prompt for the Next Act Ung character creation onboarding chat.
// This is a structured interview — NOT a general coaching session.
// The AI collects the four tuffhetsmodell inputs conversationally.

export const ONBOARDING_SYSTEM_PROMPT = `Du hjälper unga att skapa sin karaktär i ett program om mental styrka. Du pratar ALLTID svenska. Tonen är varm, nyfiken och avslappnad — som en äldre kompis, inte en psykolog.

DITT UPPDRAG:
Du för ett samtal för att lära känna personen och förstå:
1. Vad som är viktigt för dem — vad de brinner för, vad de vill bli bättre på
2. Vad som stoppar dem — situationer, tankar eller känslor som är jobbiga
3. Vad de brukar göra när det är svårt — hur de reagerar nu
4. I vilket sammanhang — idrott, skola, socialt, musik, eller annat

REGLER FÖR SAMTALET:
- Ställ EN fråga i taget. Vänta på svaret.
- Ställ alltid en följdfråga om svaret är kort eller ytligt. Exempel: Om de svarar "fotboll" — fråga "Vad är det med fotbollen som är viktigt för dig?"
- Använd deras egna ord när du sammanfattar och ställer nästa fråga.
- Använd ALDRIG: ACT, värderad riktning, defusion, acceptans, eller andra psykologiska termer.
- Börja med något lättsamt och bygg upp mot det svårare.
- Sträva efter 8-12 utbyten innan du sammanfattar.
- Håll svaren korta — max 3-4 meningar per svar.

SÄKERHET:
- Om personen berättar om allvarligt mående, svara med empati och säg: "Det låter tungt. Prata gärna med en vuxen du litar på — en lärare, förälder eller skolkurator. Du behöver inte bära det själv." Avsluta inte samtalet abrupt.

NÄR DU HAR SAMLAT IN TILLRÄCKLIGT (alla 4 punkter ovan):
Avsluta med en varm sammanfattning. Börja sammanfattningen med exakt dessa ord på en ny rad:
PROFIL_KLAR:
Sedan en mänsklig sammanfattning på 3-5 meningar som beskriver karaktären.

Exempel på avslut:
"Jag tror jag har fått en riktigt bra bild av dig nu!

PROFIL_KLAR:
Din karaktär verkar vara någon som verkligen brinner för fotboll och vill bli tryggare under press. Det jobbigaste verkar vara nervositeten inför viktiga matcher — den känslan i magen som gör att du spelar på halv maskin. Och just nu brukar du försöka inte tänka på det, men det funkar inte alltid. Det finns massor att jobba med här — och det är precis det det här programmet handlar om."

ÖPPNINGSFRÅGA (använd denna exakt för att starta samtalet):
"Hej! Kul att du är här. Jag ska hjälpa dig att skapa din egen karaktär — den som du kommer att följa och hjälpa genom det här programmet. Först vill jag lära känna dig lite. Vad är du bra på, eller vad gillar du att hålla på med?"`;

export const ONBOARDING_INITIAL_MESSAGE = "Hej! Kul att du är här. Jag ska hjälpa dig att skapa din egen karaktär — den som du kommer att följa och hjälpa genom det här programmet. Först vill jag lära känna dig lite. Vad är du bra på, eller vad gillar du att hålla på med?";
```

**Step 2: Typecheck**
```bash
pnpm typecheck
```
Expected: no errors in this file.

**Step 3: Commit**
```bash
git add src/lib/services/ai/onboarding-prompt.ts
git commit -m "feat: add Next Act Ung onboarding system prompt"
```

---

## Task 3: Onboarding API Routes

**Files:**
- Create: `src/app/api/ai/onboarding/route.ts`
- Create: `src/app/api/ai/onboarding/finalize/route.ts`

### 3a: Chat route

```typescript
// src/app/api/ai/onboarding/route.ts
import { NextResponse } from "next/server";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import { ONBOARDING_SYSTEM_PROMPT } from "@/lib/services/ai/onboarding-prompt";
import { detectCrisis, CRISIS_RESPONSE_SV } from "@/lib/services/ai/crisis-detection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const messages: Array<{ role: string; content: string }> = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  // Crisis detection
  const latestUserMessage = messages.findLast((m) => m.role === "user");
  if (latestUserMessage && detectCrisis(latestUserMessage.content)) {
    return NextResponse.json({ role: "assistant", content: CRISIS_RESPONSE_SV });
  }

  const model = anthropic(process.env.AI_MODEL ?? "claude-haiku-4-5-20251001");
  const result = streamText({
    model,
    system: ONBOARDING_SYSTEM_PROMPT,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  return result.toTextStreamResponse();
}
```

### 3b: Finalize route

This route takes the full conversation, uses `generateObject` to extract structured profile data, and saves it to the DB.

```typescript
// src/app/api/ai/onboarding/finalize/route.ts
import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const profileSchema = z.object({
  character_name: z.string().describe("The name the user gave their character"),
  valued_direction: z.string().describe("What is most important to the user — their goal or dream, in their own words"),
  main_obstacle: z.string().describe("The main thing that stops them — a situation, feeling, or thought pattern"),
  current_behavior: z.string().optional().describe("What they currently do when they hit the obstacle"),
  context: z.enum(["sport", "school", "social", "music", "other", "general"]).describe("The primary area of life this relates to"),
  context_detail: z.string().optional().describe("Specific detail, e.g. 'fotboll', 'matte', 'kompisar'"),
  profile_summary: z.string().describe("A warm 3-5 sentence summary of the character in Swedish, written in second person (du-form)"),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const messages: Array<{ role: string; content: string }> = body.messages;
  const characterName: string | undefined = body.characterName;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  const model = anthropic(process.env.AI_MODEL ?? "claude-haiku-4-5-20251001");

  const { object: profile } = await generateObject({
    model,
    schema: profileSchema,
    system: `Du är en expert på att extrahera strukturerad information från ett samtal.
Analysera detta samtal och extrahera karaktärsprofilen.
Om character_name inte nämndes i samtalet, använd det angivna namnet eller "Min karaktär".`,
    messages: [
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      {
        role: "user" as const,
        content: `Extrahera nu karaktärsprofilen från samtalet ovan.${characterName ? ` Karaktärens namn är "${characterName}".` : ""}`,
      },
    ],
  });

  // Save to DB (upsert so re-doing onboarding overwrites)
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("character_profiles")
    .upsert({
      user_id: user.id,
      ...profile,
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
```

**Step: Typecheck**
```bash
pnpm typecheck
```

**Step: Commit**
```bash
git add src/app/api/ai/onboarding/route.ts src/app/api/ai/onboarding/finalize/route.ts
git commit -m "feat: add onboarding chat and finalize API routes"
```

---

## Task 4: Onboarding UI

**Files:**
- Create: `src/app/(platform)/onboarding/page.tsx`
- Create: `src/app/(platform)/onboarding/onboarding-client.tsx`

### 4a: Page (server component)

```typescript
// src/app/(platform)/onboarding/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { OnboardingClient } from "./onboarding-client";

export const metadata: Metadata = { title: "Skapa din karaktär — Next Act" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // If profile already exists, go straight to learn
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("character_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) redirect("/learn");

  return <OnboardingClient />;
}
```

### 4b: Client component

This is the most complex component. It:
1. Shows the AI chat with the onboarding prompt
2. Detects "PROFIL_KLAR:" in the AI's message
3. When detected, shows a character name input + confirm button
4. On confirm, calls `/api/ai/onboarding/finalize` and redirects to `/learn`

```typescript
// src/app/(platform)/onboarding/onboarding-client.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_INITIAL_MESSAGE } from "@/lib/services/ai/onboarding-prompt";

type Message = { role: "user" | "assistant"; content: string };

export function OnboardingClient() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: ONBOARDING_INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [characterName, setCharacterName] = useState("");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }

      if (assistantText.includes("PROFIL_KLAR:")) {
        setProfileReady(true);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Något gick fel. Försök igen." },
        ]);
      }
    } finally {
      setIsStreaming(false);
    }
  }

  async function handleFinalize() {
    if (!characterName.trim()) return;
    setIsFinalizing(true);

    const res = await fetch("/api/ai/onboarding/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, characterName: characterName.trim() }),
    });

    if (res.ok) {
      router.push("/learn");
    } else {
      setIsFinalizing(false);
      alert("Något gick fel. Försök igen.");
    }
  }

  // Strip "PROFIL_KLAR:" from display
  function displayContent(content: string) {
    return content.replace("PROFIL_KLAR:", "").trim();
  }

  return (
    <div className="flex min-h-screen flex-col bg-off-white">
      {/* Header */}
      <div className="border-b border-navy/10 bg-white px-4 py-4 text-center">
        <h1 className="font-heading text-lg font-bold text-navy">Skapa din karaktär</h1>
        <p className="mt-0.5 text-sm text-charcoal">Svara på frågorna så skapar vi ditt personliga program</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-white rounded-br-md"
                : "bg-white text-charcoal shadow-sm rounded-bl-md"
            }`}>
              {displayContent(msg.content)}
            </div>
          </div>
        ))}
        {isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
              <div className="flex space-x-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-charcoal/30 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-charcoal/30 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-charcoal/30" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile ready confirmation */}
      {profileReady && (
        <div className="border-t border-navy/10 bg-white px-4 py-5 max-w-2xl mx-auto w-full">
          <p className="text-sm font-medium text-navy mb-3">Vad ska din karaktär heta?</p>
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="T.ex. Alex, Kim, eller ett smeknamn..."
            className="w-full rounded-xl border border-navy/15 bg-off-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => { if (e.key === "Enter") handleFinalize(); }}
          />
          <button
            onClick={handleFinalize}
            disabled={!characterName.trim() || isFinalizing}
            className="mt-3 w-full rounded-full bg-primary py-3 font-heading text-sm font-bold text-white transition-all hover:bg-primary-hover disabled:opacity-50"
          >
            {isFinalizing ? "Skapar ditt program..." : "Starta mitt program →"}
          </button>
        </div>
      )}

      {/* Input */}
      {!profileReady && (
        <div className="border-t border-navy/10 bg-white px-4 py-3 max-w-2xl mx-auto w-full">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Skriv ditt svar..."
              disabled={isStreaming}
              className="flex-1 rounded-full border border-navy/15 bg-off-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="rounded-full bg-primary px-5 py-2.5 font-heading text-sm font-bold text-white transition-all hover:bg-primary-hover disabled:opacity-50"
            >
              Skicka
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
```

**Step: Typecheck**
```bash
pnpm typecheck
```

**Step: Test manually**
Start dev server (`pnpm dev`), navigate to `/onboarding`, verify:
- Initial message appears
- You can type and send messages
- AI responds in streaming fashion
- After ~10 exchanges, "PROFIL_KLAR:" is detected and name input appears

**Step: Commit**
```bash
git add src/app/(platform)/onboarding/
git commit -m "feat: add Next Act Ung onboarding chat UI"
```

---

## Task 5: Onboarding Entry Point on Dashboard

Rather than middleware (too broad), add a banner on the `/learn` page prompting users who have no character profile to do onboarding.

**Files:**
- Modify: `src/app/(platform)/learn/page.tsx`

**Step 1: Read the current file** (already familiar — `src/app/(platform)/learn/page.tsx`)

**Step 2: Add profile check and banner**

At the top of `ModuleListPage`, after fetching the user, add:
```typescript
// Check if user has completed onboarding (character profile)
const { data: characterProfile } = await supabase
  .from("character_profiles")
  .select("character_name, valued_direction")
  .eq("user_id", userId)
  .maybeSingle();
```

Then in the JSX, before the module list, add a banner if `!characterProfile`:
```tsx
{!characterProfile && (
  <div className="rounded-2xl bg-primary/5 border border-primary/20 px-5 py-4 flex items-start gap-4">
    <div className="flex-1">
      <p className="font-heading font-semibold text-navy text-sm">Skapa din karaktär</p>
      <p className="mt-1 text-sm text-charcoal">
        Personalisera ditt program — svara på några frågor så anpassar vi innehållet till dig.
      </p>
    </div>
    <Link
      href="/onboarding"
      className="shrink-0 rounded-full bg-primary px-4 py-2 font-heading text-xs font-bold text-white hover:bg-primary-hover"
    >
      Kom igång →
    </Link>
  </div>
)}
```

**Step: Typecheck + commit**
```bash
pnpm typecheck
git add src/app/(platform)/learn/page.tsx
git commit -m "feat: add character profile onboarding prompt on learn page"
```

---

## Task 6: Template Variable Substitution in Lessons

**Files:**
- Create: `src/lib/services/lms/template-vars.ts`
- Modify: `src/app/(platform)/learn/[moduleId]/[lessonId]/page.tsx`

### 6a: Template substitution utility

```typescript
// src/lib/services/lms/template-vars.ts

export type TemplateVars = {
  character_name?: string;
  valued_direction?: string;
  main_obstacle?: string;
  current_behavior?: string;
  context?: string;
  context_detail?: string;
};

/**
 * Replaces {variable_name} placeholders in a string with values from vars.
 * Unknown placeholders are left as-is.
 */
export function substituteTemplateVars(text: string, vars: TemplateVars): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = vars[key as keyof TemplateVars];
    return value ?? match;
  });
}
```

### 6b: Integrate into lesson page

Read `src/app/(platform)/learn/[moduleId]/[lessonId]/page.tsx` first.

After the existing parallel queries (around line 181), add a fourth query for the character profile:

```typescript
const [lessonResult, moduleResult, siblingsResult, characterResult] = await Promise.all([
  // ... existing three queries ...
  supabase
    .from("character_profiles")
    .select("character_name, valued_direction, main_obstacle, current_behavior, context, context_detail")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .maybeSingle(),
]);
```

Wait — `getUser()` is already called implicitly via server cookies. Check the page — it doesn't currently call `getUser()`. Add it:

```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
```

Then pass the profile to `parseContentBlocks`. Modify the function signature:

```typescript
function parseContentBlocks(
  content: Json,
  lessonId: string,
  lessonTitle: string,
  moduleId: string,
  nextLessonId: string | null,
  templateVars?: TemplateVars  // NEW
): ContentBlock[]
```

Inside the function, after building each text-containing block, wrap string fields with `substituteTemplateVars`. For example for the `text` case:

```typescript
case "text":
  blocks.push({
    type: "text",
    title: b.title ? substituteTemplateVars(String(b.title), templateVars ?? {}) : undefined,
    content: substituteTemplateVars(String(b.content ?? ""), templateVars ?? {}),
  });
  break;
```

Apply `substituteTemplateVars` to: `text.content`, `text.title`, `story.content`, `callout.content`, `exercise_text.prompt`, `exercise_choice.question`.

Add the import at the top:
```typescript
import { substituteTemplateVars, type TemplateVars } from "@/lib/services/lms/template-vars";
```

**Step: Typecheck**
```bash
pnpm typecheck
```

**Step: Commit**
```bash
git add src/lib/services/lms/template-vars.ts src/app/(platform)/learn/[moduleId]/[lessonId]/page.tsx
git commit -m "feat: template variable substitution in lesson content"
```

---

## Task 7: Next Act Ung Program Seed Content

**Files:**
- Create: `supabase/migrations/00005_next_act_ung_program.sql`

This migration creates the program skeleton with placeholder content that Anders Ekstand & Henrik Gustafsson will refine.

Key conventions:
- Template vars `{character_name}`, `{valued_direction}`, `{main_obstacle}` are used throughout story and exercise blocks
- Video blocks have `"videoId": null` — they render as a gray placeholder
- A `callout` block with `variant: "tip"` immediately after each null-video block explains what the video should cover (for content authors)
- Language is simple, direct, for 12-15 year olds — short sentences

```sql
DO $$
DECLARE
  prog_id UUID;
  mod0 UUID; mod1 UUID; mod2 UUID; mod3 UUID; mod4 UUID; mod5 UUID;
BEGIN

-- ── Program ────────────────────────────────────────────────────────────────
INSERT INTO programs (title, description, "order")
VALUES (
  'Next Act Ung',
  'Mental styrka för unga — ett program som hjälper dig att bli starkare i det som är viktigt för dig.',
  1
)
RETURNING id INTO prog_id;

-- ── Modul 0: Välkommen ─────────────────────────────────────────────────────
INSERT INTO modules (program_id, title, description, "order", estimated_duration_minutes)
VALUES (prog_id, 'Välkommen', 'En introduktion till programmet och din karaktär.', 0, 20)
RETURNING id INTO mod0;

-- Lektion 0.1: Introduktion
INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod0, 'Välkommen till Next Act', 'video', 0, 'published', '[
  {
    "type": "video",
    "title": "Introduktion till Next Act Ung",
    "videoId": null
  },
  {
    "type": "callout",
    "variant": "tip",
    "content": "VIDEO: Animerad coach hälsar välkommen. Förklarar att deltagaren precis har skapat sin karaktär {character_name} och att programmet handlar om att hjälpa hen att bli mentalt starkare. Kort om programmets sex moduler. Ton: energisk, varm, enkel. Längd: ca 90 sekunder."
  },
  {
    "type": "text",
    "title": "Ditt program är personligt",
    "content": "Du har just skapat {character_name} — din karaktär. Under det här programmet kommer du följa {character_name} genom utmaningar som liknar dina egna.\n\nNär {character_name} stöter på svårigheter är det du som hjälper hen vidare. Du lär dig mentala verktyg — och tränar dem på riktigt."
  },
  {
    "type": "text",
    "title": "Sex moduler. En resa.",
    "content": "Programmet är uppdelat i sex delar. I varje del lär {character_name} sig ett nytt verktyg för att hantera det som är svårt.\n\nDu behöver inte göra allt på en gång. Ta en lektion i taget."
  }
]'::jsonb);

-- ── Modul 1: Vad driver dig? ───────────────────────────────────────────────
INSERT INTO modules (program_id, title, description, "order", estimated_duration_minutes)
VALUES (prog_id, 'Vad driver dig?', 'Hitta det som är viktigt för dig — din värderade riktning.', 1, 40)
RETURNING id INTO mod1;

-- Lektion 1.1: Introduktion
INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod1, 'Det som är viktigt', 'video', 0, 'published', '[
  {
    "type": "video",
    "title": "Vad är viktigt för dig?",
    "videoId": null
  },
  {
    "type": "callout",
    "variant": "tip",
    "content": "VIDEO: Animerad coach introducerar begreppet ''värderad riktning'' utan att använda termen. Förklarar skillnaden mellan mål (''jag vill vinna'') och drivkraft (''jag älskar det här''). Använder ett exempel med en ung idrottare/musiker/elev. Längd: ca 2 minuter."
  },
  {
    "type": "text",
    "title": "Varför gör du det du gör?",
    "content": "Det finns en skillnad mellan vad du vill uppnå och vad som faktiskt driver dig.\n\nMål är saker du kan nå — en vinst, ett betyg, en plats i laget. Drivkrafter är djupare. Det är varför det spelar roll att du lyckas."
  },
  {
    "type": "story",
    "content": "{character_name} är på väg till träningen. Alla andra verkar ha kul, men {character_name} känner sig trött och tänker: ''Varför håller jag på med det här?'' Det är den frågan vi ska utforska."
  }
]'::jsonb);

-- Lektion 1.2: Övning — hitta drivkraften
INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod1, 'Hitta din drivkraft', 'exercise', 1, 'published', '[
  {
    "type": "text",
    "title": "Hjälp {character_name} att förstå varför",
    "content": "{character_name} har berättat att det viktigaste är {valued_direction}. Men varför är det viktigt? Vi ska gräva lite djupare."
  },
  {
    "type": "exercise_text",
    "prompt": "Tänk på {character_name}. Varför tror du att {valued_direction} är viktigt för hen? Vad händer inuti när det går bra?",
    "placeholder": "Skriv ditt svar här..."
  },
  {
    "type": "exercise_choice",
    "question": "Vad tror du driver {character_name} mest?",
    "options": [
      {"id": "a", "label": "Känslan av att förbättras"},
      {"id": "b", "label": "Att vara med och tillhöra något"},
      {"id": "c", "label": "Att bevisa något för sig själv"},
      {"id": "d", "label": "Glädjen i själva aktiviteten"}
    ],
    "allowMultiple": true
  },
  {
    "type": "callout",
    "variant": "insight",
    "content": "Det som driver oss kallas för vår värderade riktning. Det är som en kompassnål — den pekar alltid åt rätt håll, även när vi tappar motivationen."
  }
]'::jsonb);

-- Lektion 1.3: Sammanfatta
INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod1, 'Din kompassnål', 'text', 2, 'published', '[
  {
    "type": "story",
    "content": "{character_name} sitter och funderar efter träningen. ''Jag gör det här för att {valued_direction},'' tänker hen. Det känns rätt. Som att ha hittat något viktigt att hålla fast vid."
  },
  {
    "type": "text",
    "title": "Det du precis har gjort",
    "content": "Du har hjälpt {character_name} att hitta sin kompassnål — det som pekar ut riktningen även när det är tungt.\n\nI nästa modul tar vi itu med det som ibland stoppar {character_name} från att röra sig dit."
  },
  {
    "type": "callout",
    "variant": "tip",
    "content": "Veckans uppgift: Tänk på ett tillfälle den här veckan när du kände dig verkligt engagerad i något. Vad var det som drev dig?"
  }
]'::jsonb);

-- ── Modul 2: Vad stoppar dig? ──────────────────────────────────────────────
INSERT INTO modules (program_id, title, description, "order", estimated_duration_minutes)
VALUES (prog_id, 'Vad stoppar dig?', 'Förstå hindren — tankarna och känslorna som bromsar.', 2, 45)
RETURNING id INTO mod2;

INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod2, 'Möt hindret', 'video', 0, 'published', '[
  {
    "type": "video",
    "title": "Hjärnan och apan",
    "videoId": null
  },
  {
    "type": "callout",
    "variant": "tip",
    "content": "VIDEO: Animerad coach förklarar hur hjärnan reagerar på press och motgång (fight-or-flight). Använder metaforen ''apan i hjärnan'' — den del som larmar och skapar jobbiga tankar och känslor. Visar att det är normalt och inte fel på en. Längd: 2-3 minuter. OBS: detta är den viktigaste förklaringsfilmen i programmet — kan med fördel spelas in på riktigt (jfr Anders-filmen om hjärnan i vuxenprogrammet)."
  },
  {
    "type": "text",
    "title": "Apan är inte din fiende",
    "content": "Alla har en apa i hjärnan. Den försöker skydda dig.\n\nProblemet är att apan inte alltid vet skillnaden på riktlig fara och en fotbollsmatch. Den larmar lika högt i båda fallen.\n\nNär {character_name} möter {main_obstacle} — det är apan som vaknar."
  }
]'::jsonb);

INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod2, 'Hitta {character_name}s apa', 'exercise', 1, 'published', '[
  {
    "type": "text",
    "title": "Hur ser {character_name}s apa ut?",
    "content": "Vi vet att {character_name}s stora utmaning är {main_obstacle}. Nu ska vi ta reda på hur det tar sig uttryck — vad apan brukar säga och göra."
  },
  {
    "type": "exercise_choice",
    "question": "Vad tror du att {character_name} känner i kroppen när {main_obstacle} dyker upp?",
    "options": [
      {"id": "a", "label": "Hjärtat slår fortare"},
      {"id": "b", "label": "Magen spänner sig"},
      {"id": "c", "label": "Svårt att koncentrera sig"},
      {"id": "d", "label": "Vill dra sig undan"},
      {"id": "e", "label": "Huvudet snurrar av tankar"}
    ],
    "allowMultiple": true
  },
  {
    "type": "exercise_text",
    "prompt": "Vad tror du att apan säger till {character_name} i de jobbiga situationerna? Skriv ner ett par typiska tankar som brukar dyka upp.",
    "placeholder": "T.ex. ''Du klarar inte det här'', ''Alla tittar på dig''..."
  },
  {
    "type": "callout",
    "variant": "insight",
    "content": "De tankar du just beskrev kallas ibland för ''kletiga tankar'' — de fastnar och är svåra att skaka av sig. Du är inte ensam om dem. Nästan alla som gör något viktigt känner igen dem."
  }
]'::jsonb);

INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod2, 'Apan är normal', 'text', 2, 'published', '[
  {
    "type": "story",
    "content": "{character_name} är glad. Hen förstår nu att apan inte är ett bevis på att något är fel. Det är hjärnans sätt att bry sig.\n\n''Om jag inte brydde mig om {valued_direction},'' tänker {character_name}, ''skulle apan inte vakna.''"
  },
  {
    "type": "text",
    "title": "Det du precis gjort",
    "content": "Du har identifierat {character_name}s apa — de typiska tankarna och känslorna som dyker upp när det är svårt.\n\nI nästa modul tittar vi på vad {character_name} brukar göra när apan vaknar — och om det faktiskt hjälper."
  }
]'::jsonb);

-- ── Modul 3: Vad gör du nu? ────────────────────────────────────────────────
INSERT INTO modules (program_id, title, description, "order", estimated_duration_minutes)
VALUES (prog_id, 'Vad gör du nu?', 'Förstå dina nuvarande beteenden — vad du gör när det är svårt.', 3, 40)
RETURNING id INTO mod3;

INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod3, 'Vad händer när apan vaknar?', 'video', 0, 'published', '[
  {
    "type": "video",
    "title": "Läktaraktioner och nyckelaktioner",
    "videoId": null
  },
  {
    "type": "callout",
    "variant": "tip",
    "content": "VIDEO: Animerad coach förklarar skillnaden mellan beteenden som tar dig bort från din riktning (''läktaraktioner'' — att undvika, ge upp, gömma sig) och beteenden som för dig framåt (''nyckelaktioner''). Använder ett konkret exempel. Längd: ca 2 minuter."
  },
  {
    "type": "text",
    "title": "Vad vi gör spelar roll",
    "content": "När apan vaknar gör vi saker. Ibland hjälper det. Ibland för det oss längre bort från det vi vill.\n\nDet handlar inte om att vara stark eller svag. Det handlar om att förstå vad som faktiskt funkar."
  }
]'::jsonb);

INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod3, 'Vad gör {character_name}?', 'exercise', 1, 'published', '[
  {
    "type": "text",
    "title": "Vi vet att {character_name} kämpar med {main_obstacle}",
    "content": "Nu ska vi titta på vad {character_name} brukar göra i de situationerna. Du känner {character_name} bäst — du skapade hen."
  },
  {
    "type": "exercise_text",
    "prompt": "Beskriv vad {character_name} brukar göra när {main_obstacle} dyker upp. Vad händer direkt, och vad händer efteråt?",
    "placeholder": "Skriv fritt om {character_name}s reaktioner..."
  },
  {
    "type": "exercise_choice",
    "question": "Tar de beteendena {character_name} närmare eller längre bort från {valued_direction}?",
    "options": [
      {"id": "a", "label": "Ofta närmre — de hjälper faktiskt"},
      {"id": "b", "label": "Blandat — ibland det ena, ibland det andra"},
      {"id": "c", "label": "Ofta längre bort — de stoppar {character_name}"}
    ]
  }
]'::jsonb);

INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod3, 'Läktaraktioner vs nyckelaktioner', 'text', 2, 'published', '[
  {
    "type": "callout",
    "variant": "insight",
    "content": "Läktaraktioner är beteenden som tar oss bort från det vi värdesätter — undvikande, fly, ge upp. Nyckelaktioner är beteenden som för oss framåt — trots att apan skriker."
  },
  {
    "type": "story",
    "content": "{character_name} tittar på listan. Hen ser att en del beteenden faktiskt hålls tillbaka av apan. ''Om jag gör tvärtom mot vad apan vill,'' tänker {character_name}, ''kanske jag kommer närmre {valued_direction}.'' Enkelt att förstå. Svårt att göra. Men möjligt."
  },
  {
    "type": "text",
    "title": "Nästa steg",
    "content": "I nästa modul lär vi {character_name} konkreta verktyg — nyckelaktioner — för att ta sig förbi apan."
  }
]'::jsonb);

-- ── Modul 4: Nya verktyg ───────────────────────────────────────────────────
INSERT INTO modules (program_id, title, description, "order", estimated_duration_minutes)
VALUES (prog_id, 'Nya verktyg', 'Lär dig nyckelaktionerna — verktygen som hjälper dig framåt.', 4, 50)
RETURNING id INTO mod4;

INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod4, 'Verktygen', 'video', 0, 'published', '[
  {
    "type": "video",
    "title": "Tre verktyg mot apan",
    "videoId": null
  },
  {
    "type": "callout",
    "variant": "tip",
    "content": "VIDEO: Animerad coach presenterar tre konkreta verktyg: (1) Andningsankaret — 5 sekunder in, 5 sekunder ut, fokusera på känslan, (2) Namnge apan — säg till dig själv ''apan är aktiv nu'' vilket skapar distans, (3) En nyckelhandling — välj EN liten sak att göra nu som för dig framåt. Visa varje verktyg visuellt med animation. Längd: 3-4 minuter."
  },
  {
    "type": "text",
    "title": "Enkla men effektiva",
    "content": "Mental träning handlar inte om att trycka ner jobbiga tankar. Det handlar om att ta dem med sig — och ändå göra det du vill göra.\n\nDe tre verktygen hjälper {character_name} att göra precis det."
  }
]'::jsonb);

INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod4, 'Träna verktygen', 'exercise', 1, 'published', '[
  {
    "type": "text",
    "title": "Hjälp {character_name} att använda verktygen",
    "content": "{character_name} är i en situation där {main_obstacle} dyker upp. Apan skriker. Nu ska du hjälpa {character_name} att använda ett av verktygen."
  },
  {
    "type": "exercise_choice",
    "question": "Vilket verktyg tror du passar {character_name} bäst i den här situationen?",
    "options": [
      {"id": "a", "label": "Andningsankaret — andas lugnt och återta fokus"},
      {"id": "b", "label": "Namnge apan — ''apan är aktiv nu'' och fortsätt ändå"},
      {"id": "c", "label": "En nyckelhandling — välj EN liten sak att göra nu"}
    ]
  },
  {
    "type": "exercise_text",
    "prompt": "Beskriv hur {character_name} skulle använda det verktyget konkret. Vad gör hen, steg för steg?",
    "placeholder": "Skriv stegen..."
  },
  {
    "type": "callout",
    "variant": "insight",
    "content": "Verktyg tränas precis som fysisk träning. Ju fler gånger {character_name} tränar dem, desto enklare blir det att använda dem när det verkligen gäller."
  }
]'::jsonb);

INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod4, 'Våga-listan', 'exercise', 2, 'published', '[
  {
    "type": "text",
    "title": "Att öva på riktigt",
    "content": "Det bästa sättet att träna mental styrka är att faktiskt utsätta sig för det som är svårt — med verktygen på plats.\n\nDet kallas exponering. Du väljer situationer som är lite obehagliga, och tränar dig att klara dem med hjälp av verktygen."
  },
  {
    "type": "exercise_text",
    "prompt": "Skriv tre situationer där {character_name} kan öva sig på att möta {main_obstacle} med ett av verktygen. Börja med det lättaste.",
    "placeholder": "1. En lättare situation...\n2. En medelsvår situation...\n3. Den svårare situationen..."
  },
  {
    "type": "callout",
    "variant": "tip",
    "content": "Veckans uppdrag: Välj en situation från {character_name}s lista och försök att faktiskt göra det den här veckan. Rapportera tillbaka i nästa modul."
  }
]'::jsonb);

-- ── Modul 5: Håll kursen ───────────────────────────────────────────────────
INSERT INTO modules (program_id, title, description, "order", estimated_duration_minutes)
VALUES (prog_id, 'Håll kursen', 'Bygg momentum — fortsätt röra dig mot det som är viktigt.', 5, 40)
RETURNING id INTO mod5;

INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod5, 'Hur gick det?', 'exercise', 0, 'published', '[
  {
    "type": "text",
    "title": "Rapport från verkligheten",
    "content": "I förra modulen fick {character_name} ett uppdrag — att öva sig på att möta {main_obstacle} med ett av verktygen.\n\nDags att utvärdera."
  },
  {
    "type": "exercise_choice",
    "question": "Hur gick uppdraget?",
    "options": [
      {"id": "a", "label": "Det gick bra — jag använde ett verktyg och det hjälpte"},
      {"id": "b", "label": "Det var svårt men jag försökte"},
      {"id": "c", "label": "Jag glömde eller hann inte"},
      {"id": "d", "label": "Situationen dök inte upp den här veckan"}
    ]
  },
  {
    "type": "exercise_text",
    "prompt": "Berätta vad som hände. Vad fungerade? Vad var svårt?",
    "placeholder": "Skriv om upplevelsen..."
  }
]'::jsonb);

INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod5, 'Din gameplan', 'exercise', 1, 'published', '[
  {
    "type": "text",
    "title": "{character_name}s personliga gameplan",
    "content": "Nu ska {character_name} sätta ihop allt. En enkel, personlig plan att ta med sig efter programmet."
  },
  {
    "type": "exercise_text",
    "prompt": "Det som är viktigt för {character_name}: {valued_direction}\n\nSkriv med egna ord varför det är viktigt för {character_name}.",
    "placeholder": "..."
  },
  {
    "type": "exercise_text",
    "prompt": "Det som ibland stoppar {character_name}: {main_obstacle}\n\nVad gör apan i de stunderna?",
    "placeholder": "..."
  },
  {
    "type": "exercise_text",
    "prompt": "Verktyget {character_name} väljer att träna på:",
    "placeholder": "Beskriv vilket verktyg och hur {character_name} ska använda det..."
  },
  {
    "type": "callout",
    "variant": "insight",
    "content": "Du har precis hjälpt {character_name} att bygga sin tuffhetsmodell. Kompassnålen, apan, och verktygen är på plats. Nu gäller det att träna dem — precis som allt annat."
  }
]'::jsonb);

INSERT INTO lessons (module_id, title, lesson_type, "order", status, content)
VALUES (mod5, 'Avslutning', 'text', 2, 'published', '[
  {
    "type": "story",
    "content": "{character_name} ser tillbaka på resan. Apan skriker fortfarande ibland. Men nu vet {character_name} vad apan är — och har verktyg för att ta sig framåt ändå.\n\n{valued_direction} är fortfarande målet. Kompassnålen pekar dit."
  },
  {
    "type": "text",
    "title": "Tack för att du deltog",
    "content": "Du har gått igenom hela Next Act-programmet och hjälpt {character_name} att bygga mental styrka.\n\nDe verktyg du lärt dig — att hitta din riktning, förstå dina hinder och välja rätt beteenden — är verktyg för hela livet. Inte bara i {context}."
  },
  {
    "type": "callout",
    "variant": "insight",
    "content": "Mental styrka är som muskler. Träna dem regelbundet, och de växer."
  }
]'::jsonb);

END $$;
```

**Step: Apply via Supabase MCP** using `execute_sql` (or `apply_migration` if the SQL fits).

Note: If the SQL is too large for a single `execute_sql` call, split into two calls — one for the program/modules, one for the lessons.

**Step: Verify**
```sql
SELECT m.title, COUNT(l.id) as lessons
FROM modules m
JOIN programs p ON p.id = m.program_id
LEFT JOIN lessons l ON l.module_id = m.id
WHERE p.title = 'Next Act Ung'
GROUP BY m.title, m."order"
ORDER BY m."order";
```
Expected: 6 rows with lesson counts [1, 3, 3, 3, 3, 3]

**Step: Commit**
```bash
git add supabase/migrations/00005_next_act_ung_program.sql
git commit -m "feat: Next Act Ung program seed content (6 modules, placeholder content)"
git push origin main
```

---

## Final Verification

After all tasks are complete:

1. Start dev server: `pnpm dev`
2. Register a new test user or clear an existing one's character profile
3. Navigate to `/learn` — verify the onboarding banner appears
4. Click "Kom igång →" — verify you land on `/onboarding`
5. Chat with the AI for 8-12 messages
6. Verify "PROFIL_KLAR:" is detected and name input appears
7. Enter a character name and click "Starta mitt program →"
8. Verify redirect to `/learn`
9. Click into a lesson — verify `{character_name}` is replaced with your actual character name in lesson text
10. Run `pnpm typecheck` — expect zero errors

---

## Notes for Content Authors (Anders & Henrik)

The program content lives in `supabase/migrations/00005_next_act_ung_program.sql` as JSON arrays. You can also edit content directly via Supabase Studio (Table Editor → lessons → edit the `content` column).

**Template variables available in all text fields:**
- `{character_name}` — the user's character name
- `{valued_direction}` — what the user said is most important to them
- `{main_obstacle}` — the main thing that stops them
- `{current_behavior}` — what they do when they hit the obstacle
- `{context}` — sport / school / social / music / other
- `{context_detail}` — specific detail (e.g. "fotboll")

**Video placeholder convention:** Leave `"videoId": null`. The callout block immediately after describes what the video should contain. When you have Vimeo IDs, update the `videoId` field and remove the tip callout.
