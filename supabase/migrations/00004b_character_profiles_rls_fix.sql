-- Fix character_profiles RLS: split into per-operation policies
-- matching project convention and adding admin read access.

DROP POLICY IF EXISTS "Users manage own character profile" ON public.character_profiles;

-- Athletes read/admins read
CREATE POLICY "Users read own character profile"
  ON public.character_profiles FOR SELECT
  USING (auth.uid() = user_id OR public.user_role() = 'admin');

-- Only the owner can insert their profile
CREATE POLICY "Users insert own character profile"
  ON public.character_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can update their profile
CREATE POLICY "Users update own character profile"
  ON public.character_profiles FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can delete their profile
CREATE POLICY "Users delete own character profile"
  ON public.character_profiles FOR DELETE
  USING (auth.uid() = user_id);
