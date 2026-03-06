-- =============================================================================
-- NextAct Platform - Migration 00002: Training Schedule + Toughness Model Data
-- =============================================================================

-- Add phone number and training schedule to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS training_schedule JSONB DEFAULT '[]';

-- ---------------------------------------------------------------------------
-- toughness_model_data (structured living document per user)
-- ---------------------------------------------------------------------------
-- Replaces the score-based toughness_model table with structured JSONB fields
-- that map directly to each module's exercise answers.

CREATE TABLE IF NOT EXISTS public.toughness_model_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  -- Module 1: Kartläggning
  kartlaggning JSONB DEFAULT '{}',
  -- Module 2: Värderad riktning
  varderad_riktning JSONB DEFAULT '{}',
  -- Module 3: Hinder (Apan + kletiga tankar)
  hinder JSONB DEFAULT '{}',
  -- Module 4: Beteenden (läktaraktioner + nyckelaktioner)
  beteenden JSONB DEFAULT '{}',
  -- Module 5: Våga-lista
  vaga_lista JSONB DEFAULT '[]',
  -- Module 6: Fokusrutiner
  fokusrutiner JSONB DEFAULT '{}',
  -- Module 7: Gameplan (summary)
  gameplan JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- sms_queue (scheduled SMS messages)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.sms_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'module_complete',  -- Weekly task SMS after module completion
    'vaga_lista',       -- Module 5: Våga-lista sent immediately
    'gameplan'          -- Module 7: Gameplan sent immediately
  )),
  module_number INT,           -- Which module triggered this (1–7)
  scheduled_for TIMESTAMPTZ,   -- When to send (null = immediate)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_sms_queue_status_scheduled
  ON public.sms_queue(status, scheduled_for)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_sms_queue_user_id
  ON public.sms_queue(user_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE TRIGGER on_toughness_model_data_updated
  BEFORE UPDATE ON public.toughness_model_data
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.toughness_model_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_queue ENABLE ROW LEVEL SECURITY;

-- toughness_model_data policies
DROP POLICY IF EXISTS "toughness_model_data_select_own_or_admin" ON public.toughness_model_data;
CREATE POLICY "toughness_model_data_select_own_or_admin" ON public.toughness_model_data
  FOR SELECT USING (auth.uid() = user_id OR public.user_role() = 'admin');

DROP POLICY IF EXISTS "toughness_model_data_insert_own" ON public.toughness_model_data;
CREATE POLICY "toughness_model_data_insert_own" ON public.toughness_model_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "toughness_model_data_update_own" ON public.toughness_model_data;
CREATE POLICY "toughness_model_data_update_own" ON public.toughness_model_data
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- sms_queue policies (only service role / admin can insert; users can see their own)
DROP POLICY IF EXISTS "sms_queue_select_own_or_admin" ON public.sms_queue;
CREATE POLICY "sms_queue_select_own_or_admin" ON public.sms_queue
  FOR SELECT USING (auth.uid() = user_id OR public.user_role() = 'admin');

DROP POLICY IF EXISTS "sms_queue_insert_admin" ON public.sms_queue;
CREATE POLICY "sms_queue_insert_admin" ON public.sms_queue
  FOR INSERT WITH CHECK (public.user_role() = 'admin');

DROP POLICY IF EXISTS "sms_queue_update_admin" ON public.sms_queue;
CREATE POLICY "sms_queue_update_admin" ON public.sms_queue
  FOR UPDATE USING (public.user_role() = 'admin');
