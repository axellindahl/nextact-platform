-- =============================================================================
-- NextAct Platform - Seed Data
-- =============================================================================

-- Default program
INSERT INTO public.programs (id, title, description, "order") VALUES
  ('00000000-0000-0000-0000-000000000001',
   'Mental Traning for Idrottare',
   'Ett evidensbaserat program byggt pa ACT och MAC for att utveckla mental styrka.',
   1);

-- ---------------------------------------------------------------------------
-- Module 1: Varderingar (Values)
-- ---------------------------------------------------------------------------
INSERT INTO public.modules (id, program_id, title, description, act_process, icon, color_theme, "order", estimated_duration_minutes) VALUES
  ('00000000-0000-0000-0001-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'Varderingar',
   'Utforska och definiera dina karnvarderingar som idrottare och manniska.',
   'values', 'heart', 'rose', 1, 45);

INSERT INTO public.lessons (id, module_id, title, "order", lesson_type, content, status) VALUES
  ('00000000-0000-0000-0001-000000000101', '00000000-0000-0000-0001-000000000001', 'Vad ar varderingar?', 1, 'video', '[]', 'published'),
  ('00000000-0000-0000-0001-000000000102', '00000000-0000-0000-0001-000000000001', 'Dina karnvarderingar', 2, 'exercise', '[]', 'published'),
  ('00000000-0000-0000-0001-000000000103', '00000000-0000-0000-0001-000000000001', 'Varderingar vs mal', 3, 'text', '[]', 'published'),
  ('00000000-0000-0000-0001-000000000104', '00000000-0000-0000-0001-000000000001', 'Varderingskompassen', 4, 'exercise', '[]', 'published'),
  ('00000000-0000-0000-0001-000000000105', '00000000-0000-0000-0001-000000000001', 'Reflektion: Leva enligt dina varderingar', 5, 'reflection', '[]', 'published');

-- ---------------------------------------------------------------------------
-- Module 2: Acceptans
-- ---------------------------------------------------------------------------
INSERT INTO public.modules (id, program_id, title, description, act_process, icon, color_theme, "order", estimated_duration_minutes) VALUES
  ('00000000-0000-0000-0001-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'Acceptans',
   'Lar dig att hantera svarigheter genom att oppna upp for dem istallet for att undvika.',
   'acceptance', 'shield', 'sky', 2, 50);

INSERT INTO public.lessons (id, module_id, title, "order", lesson_type, content, status) VALUES
  ('00000000-0000-0000-0002-000000000101', '00000000-0000-0000-0001-000000000002', 'Vad ar acceptans?', 1, 'video', '[]', 'published'),
  ('00000000-0000-0000-0002-000000000102', '00000000-0000-0000-0001-000000000002', 'Kontrollstrategier som inte fungerar', 2, 'text', '[]', 'published'),
  ('00000000-0000-0000-0002-000000000103', '00000000-0000-0000-0001-000000000002', 'Villighetsovning', 3, 'exercise', '[]', 'published'),
  ('00000000-0000-0000-0002-000000000104', '00000000-0000-0000-0001-000000000002', 'Acceptans i idrott', 4, 'text', '[]', 'published'),
  ('00000000-0000-0000-0002-000000000105', '00000000-0000-0000-0001-000000000002', 'Kroppsscanning', 5, 'exercise', '[]', 'published'),
  ('00000000-0000-0000-0002-000000000106', '00000000-0000-0000-0001-000000000002', 'Reflektion: Oppna upp', 6, 'reflection', '[]', 'published');

-- ---------------------------------------------------------------------------
-- Module 3: Defusion
-- ---------------------------------------------------------------------------
INSERT INTO public.modules (id, program_id, title, description, act_process, icon, color_theme, "order", estimated_duration_minutes) VALUES
  ('00000000-0000-0000-0001-000000000003',
   '00000000-0000-0000-0000-000000000001',
   'Defusion',
   'Lar dig att ta avstand fran hjalplosamma tankar utan att kampa mot dem.',
   'defusion', 'brain', 'violet', 3, 40);

INSERT INTO public.lessons (id, module_id, title, "order", lesson_type, content, status) VALUES
  ('00000000-0000-0000-0003-000000000101', '00000000-0000-0000-0001-000000000003', 'Vad ar kognitiv defusion?', 1, 'video', '[]', 'published'),
  ('00000000-0000-0000-0003-000000000102', '00000000-0000-0000-0001-000000000003', 'Tankefallor i idrott', 2, 'text', '[]', 'published'),
  ('00000000-0000-0000-0003-000000000103', '00000000-0000-0000-0001-000000000003', 'Defusionstekniker', 3, 'exercise', '[]', 'published'),
  ('00000000-0000-0000-0003-000000000104', '00000000-0000-0000-0001-000000000003', 'Tankar ar bara tankar', 4, 'exercise', '[]', 'published'),
  ('00000000-0000-0000-0003-000000000105', '00000000-0000-0000-0001-000000000003', 'Reflektion: Forhallandet till tankar', 5, 'reflection', '[]', 'published');

-- ---------------------------------------------------------------------------
-- Module 4: Narvarande Ogonblick (Present Moment)
-- ---------------------------------------------------------------------------
INSERT INTO public.modules (id, program_id, title, description, act_process, icon, color_theme, "order", estimated_duration_minutes) VALUES
  ('00000000-0000-0000-0001-000000000004',
   '00000000-0000-0000-0000-000000000001',
   'Narvarande Ogonblick',
   'Utveckla formagan att vara fullt narvarande i stunden - nyckeln till topprestationer.',
   'present_moment', 'eye', 'amber', 4, 45);

INSERT INTO public.lessons (id, module_id, title, "order", lesson_type, content, status) VALUES
  ('00000000-0000-0000-0004-000000000101', '00000000-0000-0000-0001-000000000004', 'Kraften i narvaro', 1, 'video', '[]', 'published'),
  ('00000000-0000-0000-0004-000000000102', '00000000-0000-0000-0001-000000000004', 'Mindfulness for idrottare', 2, 'text', '[]', 'published'),
  ('00000000-0000-0000-0004-000000000103', '00000000-0000-0000-0001-000000000004', 'Andningsovning', 3, 'exercise', '[]', 'published'),
  ('00000000-0000-0000-0004-000000000104', '00000000-0000-0000-0001-000000000004', 'Fokusovningar', 4, 'exercise', '[]', 'published'),
  ('00000000-0000-0000-0004-000000000105', '00000000-0000-0000-0001-000000000004', 'Reflektion: Att vara har och nu', 5, 'reflection', '[]', 'published');

-- ---------------------------------------------------------------------------
-- Module 5: Sjalvet som Kontext (Self-as-Context)
-- ---------------------------------------------------------------------------
INSERT INTO public.modules (id, program_id, title, description, act_process, icon, color_theme, "order", estimated_duration_minutes) VALUES
  ('00000000-0000-0000-0001-000000000005',
   '00000000-0000-0000-0000-000000000001',
   'Sjalvet som Kontext',
   'Upptack det observerande sjalvet - den del av dig som ar storre an dina tankar och kanslor.',
   'self_as_context', 'user', 'teal', 5, 35);

INSERT INTO public.lessons (id, module_id, title, "order", lesson_type, content, status) VALUES
  ('00000000-0000-0000-0005-000000000101', '00000000-0000-0000-0001-000000000005', 'Vem ar du bortom prestationen?', 1, 'video', '[]', 'published'),
  ('00000000-0000-0000-0005-000000000102', '00000000-0000-0000-0001-000000000005', 'Det observerande sjalvet', 2, 'text', '[]', 'published'),
  ('00000000-0000-0000-0005-000000000103', '00000000-0000-0000-0001-000000000005', 'Perspektivtagning', 3, 'exercise', '[]', 'published'),
  ('00000000-0000-0000-0005-000000000104', '00000000-0000-0000-0001-000000000005', 'Reflektion: Sjalvet som sammanhang', 4, 'reflection', '[]', 'published');

-- ---------------------------------------------------------------------------
-- Module 6: Engagerat Handlande (Committed Action)
-- ---------------------------------------------------------------------------
INSERT INTO public.modules (id, program_id, title, description, act_process, icon, color_theme, "order", estimated_duration_minutes) VALUES
  ('00000000-0000-0000-0001-000000000006',
   '00000000-0000-0000-0000-000000000001',
   'Engagerat Handlande',
   'Oversatt dina varderingar till konkreta handlingar - aven nar det ar svart.',
   'committed_action', 'target', 'emerald', 6, 45);

INSERT INTO public.lessons (id, module_id, title, "order", lesson_type, content, status) VALUES
  ('00000000-0000-0000-0006-000000000101', '00000000-0000-0000-0001-000000000006', 'Fran varderingar till handling', 1, 'video', '[]', 'published'),
  ('00000000-0000-0000-0006-000000000102', '00000000-0000-0000-0001-000000000006', 'SMART-mal med varderingsgrund', 2, 'text', '[]', 'published'),
  ('00000000-0000-0000-0006-000000000103', '00000000-0000-0000-0001-000000000006', 'Handlingsplan', 3, 'exercise', '[]', 'published'),
  ('00000000-0000-0000-0006-000000000104', '00000000-0000-0000-0001-000000000006', 'Hantera motstand', 4, 'text', '[]', 'published'),
  ('00000000-0000-0000-0006-000000000105', '00000000-0000-0000-0001-000000000006', 'Reflektion: Ditt engagemang', 5, 'reflection', '[]', 'published');

-- ---------------------------------------------------------------------------
-- Module 7: Integration
-- ---------------------------------------------------------------------------
INSERT INTO public.modules (id, program_id, title, description, act_process, icon, color_theme, "order", estimated_duration_minutes) VALUES
  ('00000000-0000-0000-0001-000000000007',
   '00000000-0000-0000-0000-000000000001',
   'Integration',
   'Sammanfor alla delar till en helhet och skapa din personliga mentala traningsplan.',
   'integration', 'puzzle', 'gold', 7, 40);

INSERT INTO public.lessons (id, module_id, title, "order", lesson_type, content, status) VALUES
  ('00000000-0000-0000-0007-000000000101', '00000000-0000-0000-0001-000000000007', 'Den psykologiska flexibilitetsmodellen', 1, 'video', '[]', 'published'),
  ('00000000-0000-0000-0007-000000000102', '00000000-0000-0000-0001-000000000007', 'Din personliga verktygslada', 2, 'exercise', '[]', 'published'),
  ('00000000-0000-0000-0007-000000000103', '00000000-0000-0000-0001-000000000007', 'Skapa din traningsplan', 3, 'exercise', '[]', 'published'),
  ('00000000-0000-0000-0007-000000000104', '00000000-0000-0000-0001-000000000007', 'Reflektion: Vagen framat', 4, 'reflection', '[]', 'published');
