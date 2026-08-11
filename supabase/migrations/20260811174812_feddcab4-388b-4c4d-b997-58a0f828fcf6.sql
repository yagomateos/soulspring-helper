-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  email text,
  selected_area text CHECK (selected_area IN ('ansiedad','animo','relaciones')),
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "admins read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- QUESTIONS
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  area text NOT NULL CHECK (area IN ('ansiedad','animo','relaciones')),
  step integer NOT NULL DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0,
  factor text NOT NULL,
  title text NOT NULL,
  help text,
  answer_type text NOT NULL DEFAULT 'single' CHECK (answer_type IN ('single','multi')),
  alarm_at integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.questions TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "active questions readable" ON public.questions FOR SELECT USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage questions" ON public.questions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  label text NOT NULL,
  value integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.question_options TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.question_options TO authenticated;
GRANT ALL ON public.question_options TO service_role;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "options readable" ON public.question_options FOR SELECT USING (true);
CREATE POLICY "admins manage options" ON public.question_options FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SESSIONS + ANSWERS
CREATE TABLE public.questionnaire_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  area text NOT NULL CHECK (area IN ('ansiedad','animo','relaciones')),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed')),
  current_step integer NOT NULL DEFAULT 1,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questionnaire_sessions TO authenticated;
GRANT ALL ON public.questionnaire_sessions TO service_role;
ALTER TABLE public.questionnaire_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions" ON public.questionnaire_sessions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins read sessions" ON public.questionnaire_sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON public.questionnaire_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.questionnaire_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.questionnaire_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  question_slug text NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, question_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questionnaire_answers TO authenticated;
GRANT ALL ON public.questionnaire_answers TO service_role;
ALTER TABLE public.questionnaire_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own answers" ON public.questionnaire_answers FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins read answers" ON public.questionnaire_answers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RESULTS
CREATE TABLE public.assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.questionnaire_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  area text NOT NULL,
  intensity integer NOT NULL DEFAULT 0,
  triage text NOT NULL CHECK (triage IN ('LOW','MEDIUM','HIGH','URGENT')),
  factors jsonb NOT NULL DEFAULT '[]'::jsonb,
  aspects jsonb NOT NULL DEFAULT '[]'::jsonb,
  related jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  exercise_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.assessment_results TO authenticated;
GRANT ALL ON public.assessment_results TO service_role;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own results" ON public.assessment_results FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own results insert" ON public.assessment_results FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins read results" ON public.assessment_results FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RISK RULES
CREATE TABLE public.risk_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  triage text NOT NULL CHECK (triage IN ('LOW','MEDIUM','HIGH','URGENT')),
  min_intensity integer,
  max_intensity integer,
  requires_alarm boolean NOT NULL DEFAULT false,
  guidance text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.risk_rules TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.risk_rules TO authenticated;
GRANT ALL ON public.risk_rules TO service_role;
ALTER TABLE public.risk_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rules readable" ON public.risk_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage rules" ON public.risk_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER rules_updated_at BEFORE UPDATE ON public.risk_rules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- EXERCISES
CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  minutes integer NOT NULL DEFAULT 5,
  description text NOT NULL DEFAULT '',
  instructions jsonb NOT NULL DEFAULT '[]'::jsonb,
  areas jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.exercises TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.exercises TO authenticated;
GRANT ALL ON public.exercises TO service_role;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "active exercises readable" ON public.exercises FOR SELECT USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage exercises" ON public.exercises FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER exercises_updated_at BEFORE UPDATE ON public.exercises FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.exercise_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_slug text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.exercise_completions TO authenticated;
GRANT ALL ON public.exercise_completions TO service_role;
ALTER TABLE public.exercise_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own completions" ON public.exercise_completions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins read completions" ON public.exercise_completions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RECOMMENDATIONS
CREATE TABLE public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area text NOT NULL CHECK (area IN ('ansiedad','animo','relaciones')),
  triage text CHECK (triage IN ('LOW','MEDIUM','HIGH','URGENT')),
  text text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.recommendations TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.recommendations TO authenticated;
GRANT ALL ON public.recommendations TO service_role;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "active recommendations readable" ON public.recommendations FOR SELECT USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage recommendations" ON public.recommendations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER recommendations_updated_at BEFORE UPDATE ON public.recommendations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- AI RULES
CREATE TABLE public.ai_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_rules TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ai_rules TO authenticated;
GRANT ALL ON public.ai_rules TO service_role;
ALTER TABLE public.ai_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai rules readable" ON public.ai_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage ai rules" ON public.ai_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CONVERSATIONS
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Conversación',
  area text CHECK (area IN ('ansiedad','animo','relaciones')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own conversations" ON public.conversations FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own messages" ON public.messages FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- CONSULTATION REQUESTS
CREATE TABLE public.consultation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  area text,
  triage text,
  message text,
  contact text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','contacted','closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.consultation_requests TO authenticated;
GRANT UPDATE ON public.consultation_requests TO authenticated;
GRANT ALL ON public.consultation_requests TO service_role;
ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own requests" ON public.consultation_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own requests insert" ON public.consultation_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins read requests" ON public.consultation_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update requests" ON public.consultation_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Reglas de derivación iniciales
INSERT INTO public.risk_rules (name, description, triage, min_intensity, max_intensity, requires_alarm, guidance, sort_order) VALUES
('Señal de alarma activa', 'Se activa cuando la persona indica pensamientos de hacerse daño.', 'URGENT', NULL, NULL, true, 'Mostrar pantalla de atención inmediata y no continuar con ejercicios.', 1),
('Malestar alto', 'Intensidad elevada e impacto claro en la vida diaria.', 'HIGH', 65, 100, false, 'Recomendar claramente consulta profesional.', 2),
('Malestar moderado', 'Malestar presente con impacto parcial.', 'MEDIUM', 40, 64, false, 'Continuar con orientación y sugerir valorar consulta.', 3),
('Malestar bajo', 'Molestias puntuales y manejables.', 'LOW', 0, 39, false, 'Continuar con orientación y ejercicios.', 4);