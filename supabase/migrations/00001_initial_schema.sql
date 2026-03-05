-- =============================================================================
-- NextAct Platform - Initial Schema
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper Functions
-- ---------------------------------------------------------------------------

-- Extract role from JWT app_metadata (O(1) for RLS)
CREATE OR REPLACE FUNCTION auth.role()
RETURNS text AS $$
  SELECT coalesce(
    current_setting('request.jwt.claims', true)::json
      -> 'app_metadata' ->> 'role',
    'athlete'
  )
$$ LANGUAGE sql STABLE;

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  sport TEXT DEFAULT 'fotboll',
  age_bracket TEXT CHECK (age_bracket IN ('13-14', '15-18', '19-25', '26+')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'standard', 'premium')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'expired')),
  preferred_language TEXT DEFAULT 'sv',
  notification_preferences JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- programs
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  "order" INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- modules
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  act_process TEXT CHECK (act_process IN ('values', 'acceptance', 'defusion', 'present_moment', 'self_as_context', 'committed_action', 'integration')),
  icon TEXT,
  color_theme TEXT,
  "order" INT NOT NULL DEFAULT 0,
  estimated_duration_minutes INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- lessons
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  lesson_type TEXT CHECK (lesson_type IN ('video', 'text', 'exercise', 'reflection', 'quiz')),
  content JSONB DEFAULT '[]',
  vimeo_video_id TEXT,
  duration_seconds INT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'review', 'published')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- lesson_progress
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  responses JSONB DEFAULT '{}',
  ai_feedback JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- module_progress
CREATE TABLE public.module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  lessons_completed INT DEFAULT 0,
  lessons_total INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- user_streaks
CREATE TABLE public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  streak_freezes_used INT DEFAULT 0,
  streak_freezes_available INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- toughness_model
CREATE TABLE public.toughness_model (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  values_score DECIMAL DEFAULT 0,
  acceptance_score DECIMAL DEFAULT 0,
  defusion_score DECIMAL DEFAULT 0,
  present_moment_score DECIMAL DEFAULT 0,
  self_as_context_score DECIMAL DEFAULT 0,
  committed_action_score DECIMAL DEFAULT 0,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ai_conversations
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  context_type TEXT DEFAULT 'general' CHECK (context_type IN ('general', 'lesson', 'exercise', 'check_in')),
  context_id TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ai_messages
CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ai_usage
CREATE TABLE public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  messages_count INT DEFAULT 0,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  UNIQUE(user_id, date)
);

-- notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'in_app')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  content JSONB NOT NULL,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- notification_preferences
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_channels JSONB DEFAULT '["in_app", "email"]',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  per_type_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- blog_posts
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX idx_lessons_module_order ON public.lessons(module_id, "order");
CREATE INDEX idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);
CREATE INDEX idx_lesson_progress_user_status ON public.lesson_progress(user_id, status);
CREATE INDEX idx_ai_conversations_user_created ON public.ai_conversations(user_id, created_at DESC);
CREATE INDEX idx_ai_messages_conversation_created ON public.ai_messages(conversation_id, created_at);
CREATE INDEX idx_ai_usage_user_date ON public.ai_usage(user_id, date);
CREATE INDEX idx_notifications_user_status ON public.notifications(user_id, status);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status_published ON public.blog_posts(status, published_at DESC);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Auto-create profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on profiles
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-update updated_at on blog_posts
CREATE TRIGGER on_blog_posts_updated
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toughness_model ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----

CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR auth.role() = 'admin'
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND subscription_tier IS NOT DISTINCT FROM (SELECT subscription_tier FROM public.profiles WHERE id = auth.uid())
    AND subscription_status IS NOT DISTINCT FROM (SELECT subscription_status FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (auth.role() = 'admin');

-- ---- content tables (programs, modules, lessons) ----

CREATE POLICY "programs_select_authenticated" ON public.programs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "programs_insert_admin" ON public.programs
  FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "programs_update_admin" ON public.programs
  FOR UPDATE USING (auth.role() = 'admin');

CREATE POLICY "programs_delete_admin" ON public.programs
  FOR DELETE USING (auth.role() = 'admin');

CREATE POLICY "modules_select_authenticated" ON public.modules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "modules_insert_admin" ON public.modules
  FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "modules_update_admin" ON public.modules
  FOR UPDATE USING (auth.role() = 'admin');

CREATE POLICY "modules_delete_admin" ON public.modules
  FOR DELETE USING (auth.role() = 'admin');

CREATE POLICY "lessons_select_authenticated" ON public.lessons
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "lessons_insert_admin" ON public.lessons
  FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "lessons_update_admin" ON public.lessons
  FOR UPDATE USING (auth.role() = 'admin');

CREATE POLICY "lessons_delete_admin" ON public.lessons
  FOR DELETE USING (auth.role() = 'admin');

-- ---- lesson_progress ----

CREATE POLICY "lesson_progress_select_own_or_admin" ON public.lesson_progress
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'admin');

CREATE POLICY "lesson_progress_insert_own" ON public.lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lesson_progress_update_own" ON public.lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ---- module_progress ----

CREATE POLICY "module_progress_select_own_or_admin" ON public.module_progress
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'admin');

CREATE POLICY "module_progress_insert_own" ON public.module_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "module_progress_update_own" ON public.module_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ---- user_streaks ----

CREATE POLICY "user_streaks_select_own_or_admin" ON public.user_streaks
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'admin');

CREATE POLICY "user_streaks_insert_own" ON public.user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_streaks_update_own" ON public.user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- ---- toughness_model ----

CREATE POLICY "toughness_model_select_own_or_admin" ON public.toughness_model
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'admin');

CREATE POLICY "toughness_model_insert_own" ON public.toughness_model
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "toughness_model_update_own" ON public.toughness_model
  FOR UPDATE USING (auth.uid() = user_id);

-- ---- ai_conversations ----

CREATE POLICY "ai_conversations_select_own_or_admin" ON public.ai_conversations
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'admin');

CREATE POLICY "ai_conversations_insert_own" ON public.ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---- ai_messages ----

CREATE POLICY "ai_messages_select_own_or_admin" ON public.ai_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = conversation_id AND (c.user_id = auth.uid() OR auth.role() = 'admin')
    )
  );

CREATE POLICY "ai_messages_insert_own" ON public.ai_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

-- ---- ai_usage ----

CREATE POLICY "ai_usage_select_own_or_admin" ON public.ai_usage
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'admin');

CREATE POLICY "ai_usage_insert_own" ON public.ai_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_usage_update_own" ON public.ai_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- ---- notifications ----

CREATE POLICY "notifications_select_own_or_admin" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'admin');

CREATE POLICY "notifications_insert_admin" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "notifications_update_own_read" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (status = 'read');

CREATE POLICY "notifications_update_admin" ON public.notifications
  FOR UPDATE USING (auth.role() = 'admin');

-- ---- notification_preferences ----

CREATE POLICY "notification_preferences_select_own_or_admin" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'admin');

CREATE POLICY "notification_preferences_insert_own" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_preferences_update_own" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notification_preferences_update_admin" ON public.notification_preferences
  FOR UPDATE USING (auth.role() = 'admin');

-- ---- blog_posts ----

CREATE POLICY "blog_posts_select_published_or_admin" ON public.blog_posts
  FOR SELECT USING (
    status = 'published' OR auth.role() = 'admin'
  );

CREATE POLICY "blog_posts_insert_admin" ON public.blog_posts
  FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "blog_posts_update_admin" ON public.blog_posts
  FOR UPDATE USING (auth.role() = 'admin');

CREATE POLICY "blog_posts_delete_admin" ON public.blog_posts
  FOR DELETE USING (auth.role() = 'admin');
