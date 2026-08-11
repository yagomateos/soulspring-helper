-- PREMIUM TIER: subscription state on profiles + content/programs library
-- Adds the free/premium content system on top of the existing schema.
-- Nothing existing is altered except two additive ALTER TABLE statements
-- (profiles gains subscription columns, exercises gains ai_allowed).

-- ============================================================
-- SUBSCRIPTION FIELDS ON PROFILES
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN subscription_status text NOT NULL DEFAULT 'FREE' CHECK (subscription_status IN ('FREE','PREMIUM')),
  ADD COLUMN subscription_start timestamptz,
  ADD COLUMN subscription_end timestamptz;

-- The existing "own profile update" policy still lets a user UPDATE their own row
-- (full_name/selected_area/preferences must stay self-editable). RLS can't exclude
-- individual columns, so a trigger reverts subscription_* on any write that isn't
-- performed by the service_role client (future Stripe webhook, or the admin-only
-- server function in admin.usuarios.functions.ts).
CREATE OR REPLACE FUNCTION public.protect_subscription_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    NEW.subscription_status := OLD.subscription_status;
    NEW.subscription_start := OLD.subscription_start;
    NEW.subscription_end := OLD.subscription_end;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER profiles_protect_subscription
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_subscription_columns();

COMMENT ON COLUMN public.profiles.subscription_status IS
  'Set only via service_role (future Stripe webhook) or the admin-only server function in admin.usuarios.functions.ts. Client UPDATEs to this column are silently reverted by profiles_protect_subscription.';

-- Shared helper mirroring has_role(): lets any RLS policy check premium access
-- without repeating the profiles subquery everywhere.
CREATE OR REPLACE FUNCTION public.is_premium(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _user_id AND subscription_status = 'PREMIUM'
  );
$$;

-- ============================================================
-- SUBSCRIPTIONS (Stripe seam — empty until a webhook exists)
-- ============================================================
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL DEFAULT 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive','trialing','active','past_due','canceled')),
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins read subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- CONTENT CATEGORIES
-- ============================================================
CREATE TABLE public.content_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.content_categories TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.content_categories TO authenticated;
GRANT ALL ON public.content_categories TO service_role;
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories readable" ON public.content_categories FOR SELECT USING (true);
CREATE POLICY "admins manage categories" ON public.content_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.content_categories (slug, name, sort_order) VALUES
('ansiedad-estres', 'Ansiedad y estrés', 1),
('relaciones-pareja', 'Relaciones y pareja', 2),
('estado-animo', 'Estado de ánimo', 3),
('sueno', 'Sueño', 4),
('bienestar-emocional', 'Bienestar emocional', 5);

-- ============================================================
-- CONTENT (Recursos / Biblioteca)
-- ============================================================
-- `content` guarda solo metadatos/teaser (título, descripción, categoría, duración,
-- nivel de acceso): se puede leer siempre que esté activo, PREMIUM incluido, para
-- que un usuario FREE vea la tarjeta en la Biblioteca y sepa que existe. El texto
-- real vive aparte en `content_bodies`, que sí está bloqueado por RLS — así el
-- bloqueo Premium ocurre al abrir el contenido, no al listar la biblioteca.
CREATE TABLE public.content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category_id uuid REFERENCES public.content_categories(id) ON DELETE SET NULL,
  image_url text,
  duration_minutes integer,
  access_level text NOT NULL DEFAULT 'FREE' CHECK (access_level IN ('FREE','PREMIUM')),
  ai_allowed boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.content TO authenticated;
GRANT ALL ON public.content TO service_role;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "active content readable" ON public.content FOR SELECT
  USING (is_active);
CREATE POLICY "admins read inactive content" ON public.content FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage content" ON public.content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER content_updated_at BEFORE UPDATE ON public.content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CONTENT BODIES (el texto real; protegido por nivel de acceso del `content` padre)
CREATE TABLE public.content_bodies (
  content_id uuid PRIMARY KEY REFERENCES public.content(id) ON DELETE CASCADE,
  body text NOT NULL DEFAULT ''
);
GRANT SELECT ON public.content_bodies TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.content_bodies TO authenticated;
GRANT ALL ON public.content_bodies TO service_role;
ALTER TABLE public.content_bodies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "free content body readable" ON public.content_bodies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.content c
      WHERE c.id = content_bodies.content_id AND c.is_active AND c.access_level = 'FREE'
    )
  );
CREATE POLICY "premium content body readable" ON public.content_bodies FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.content c
      WHERE c.id = content_bodies.content_id AND c.is_active AND c.access_level = 'PREMIUM'
        AND (public.has_role(auth.uid(), 'admin') OR public.is_premium(auth.uid()))
    )
  );
CREATE POLICY "admins manage content bodies" ON public.content_bodies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CONTENT COMPLETIONS ("contenidos vistos" para Seguimiento)
CREATE TABLE public.content_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_id uuid NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.content_completions TO authenticated;
GRANT ALL ON public.content_completions TO service_role;
ALTER TABLE public.content_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own content completions" ON public.content_completions FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins read content completions" ON public.content_completions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- PROGRAMS
-- ============================================================
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category_id uuid REFERENCES public.content_categories(id) ON DELETE SET NULL,
  duration_label text,
  access_level text NOT NULL DEFAULT 'PREMIUM' CHECK (access_level IN ('FREE','PREMIUM')),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programs TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- La ficha del programa (título/descripción/duración) es visible siempre que esté
-- activo, sea FREE o PREMIUM, para que se pueda descubrir en /programas; lo que
-- de verdad se bloquea son las sesiones (program_sessions, más abajo).
CREATE POLICY "active programs readable" ON public.programs FOR SELECT
  USING (is_active);
CREATE POLICY "admins read inactive programs" ON public.programs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage programs" ON public.programs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PROGRAM SESSIONS (ordered, each pairs content + an exercise)
CREATE TABLE public.program_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  content_id uuid REFERENCES public.content(id) ON DELETE SET NULL,
  exercise_id uuid REFERENCES public.exercises(id) ON DELETE SET NULL,
  UNIQUE (program_id, sort_order)
);
GRANT SELECT ON public.program_sessions TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.program_sessions TO authenticated;
GRANT ALL ON public.program_sessions TO service_role;
ALTER TABLE public.program_sessions ENABLE ROW LEVEL SECURITY;

-- Readability mirrors the parent program's gate: a premium program's sessions
-- are premium too, a free program's sessions are free.
CREATE POLICY "sessions readable via program" ON public.program_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programs pr
      WHERE pr.id = program_sessions.program_id
        AND pr.is_active
        AND (
          pr.access_level = 'FREE'
          OR public.has_role(auth.uid(), 'admin')
          OR public.is_premium(auth.uid())
        )
    )
  );
CREATE POLICY "admins manage sessions" ON public.program_sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PROGRAM ENROLLMENTS ("programas iniciados")
CREATE TABLE public.program_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, program_id)
);
GRANT SELECT, INSERT, DELETE ON public.program_enrollments TO authenticated;
GRANT ALL ON public.program_enrollments TO service_role;
ALTER TABLE public.program_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own enrollments" ON public.program_enrollments FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins read enrollments" ON public.program_enrollments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- PROGRAM SESSION COMPLETIONS (per-user progress on a session)
CREATE TABLE public.program_session_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  program_session_id uuid NOT NULL REFERENCES public.program_sessions(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, program_session_id)
);
GRANT SELECT, INSERT, DELETE ON public.program_session_completions TO authenticated;
GRANT ALL ON public.program_session_completions TO service_role;
ALTER TABLE public.program_session_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own session completions" ON public.program_session_completions FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins read session completions" ON public.program_session_completions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- EXERCISES: IA-premium seam (reuses the existing table, no duplication)
-- ============================================================
ALTER TABLE public.exercises ADD COLUMN ai_allowed boolean NOT NULL DEFAULT false;

-- ============================================================
-- Contenido y programa de ejemplo (claramente marcados como muestra;
-- Marina reemplazará esto desde el panel de administración)
-- ============================================================
INSERT INTO public.content (slug, title, description, category_id, duration_minutes, access_level, sort_order) VALUES
('ejemplo-respiracion-consciente', 'Ejemplo — Respiración consciente (contenido de muestra)', 'Una guía breve para calmar el sistema nervioso con la respiración.', (SELECT id FROM public.content_categories WHERE slug = 'ansiedad-estres'), 6, 'FREE', 1),
('ejemplo-higiene-del-sueno', 'Ejemplo — Higiene del sueño (contenido de muestra)', 'Pautas generales para mejorar la calidad del descanso.', (SELECT id FROM public.content_categories WHERE slug = 'sueno'), 8, 'FREE', 2),
('ejemplo-comunicacion-en-pareja', 'Ejemplo — Comunicación en pareja (contenido de muestra)', 'Herramientas para expresar necesidades sin herir al otro.', (SELECT id FROM public.content_categories WHERE slug = 'relaciones-pareja'), 10, 'FREE', 3),
('ejemplo-programa-regulacion-emocional', 'Ejemplo — Guía de regulación emocional (contenido de muestra)', 'Un recorrido más profundo por técnicas de regulación emocional.', (SELECT id FROM public.content_categories WHERE slug = 'bienestar-emocional'), 15, 'PREMIUM', 4),
('ejemplo-rutina-antiansiedad', 'Ejemplo — Rutina anti-ansiedad de 7 días (contenido de muestra)', 'Una rutina diaria breve para reducir la activación ansiosa.', (SELECT id FROM public.content_categories WHERE slug = 'ansiedad-estres'), 12, 'PREMIUM', 5);

INSERT INTO public.content_bodies (content_id, body) VALUES
((SELECT id FROM public.content WHERE slug = 'ejemplo-respiracion-consciente'), 'Contenido de muestra: aquí iría el texto completo de la guía.'),
((SELECT id FROM public.content WHERE slug = 'ejemplo-higiene-del-sueno'), 'Contenido de muestra: aquí iría el texto completo de la guía.'),
((SELECT id FROM public.content WHERE slug = 'ejemplo-comunicacion-en-pareja'), 'Contenido de muestra: aquí iría el texto completo de la guía.'),
((SELECT id FROM public.content WHERE slug = 'ejemplo-programa-regulacion-emocional'), 'Contenido de muestra Premium: aquí iría el texto completo de la guía.'),
((SELECT id FROM public.content WHERE slug = 'ejemplo-rutina-antiansiedad'), 'Contenido de muestra Premium: aquí iría el texto completo de la guía.');

INSERT INTO public.programs (slug, title, description, category_id, duration_label, access_level, sort_order) VALUES
('ejemplo-programa-calma', 'Ejemplo — Programa Calma (programa de muestra)', 'Un recorrido guiado de varias sesiones para trabajar la ansiedad paso a paso.', (SELECT id FROM public.content_categories WHERE slug = 'ansiedad-estres'), '3 sesiones', 'PREMIUM', 1);

INSERT INTO public.program_sessions (program_id, sort_order, title, content_id, exercise_id) VALUES
((SELECT id FROM public.programs WHERE slug = 'ejemplo-programa-calma'), 1, 'Sesión 1 — Entender la ansiedad', (SELECT id FROM public.content WHERE slug = 'ejemplo-respiracion-consciente'), (SELECT id FROM public.exercises WHERE slug = 'resp-478')),
((SELECT id FROM public.programs WHERE slug = 'ejemplo-programa-calma'), 2, 'Sesión 2 — Regular el cuerpo', (SELECT id FROM public.content WHERE slug = 'ejemplo-rutina-antiansiedad'), NULL),
((SELECT id FROM public.programs WHERE slug = 'ejemplo-programa-calma'), 3, 'Sesión 3 — Sostener el cambio', (SELECT id FROM public.content WHERE slug = 'ejemplo-programa-regulacion-emocional'), NULL);

-- ============================================================
-- Lock down the new SECURITY DEFINER / trigger functions the same way
-- has_role()/set_updated_at() were locked down in the follow-up migration.
-- ============================================================
REVOKE ALL ON FUNCTION public.protect_subscription_columns() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_premium(uuid) FROM PUBLIC, anon;
