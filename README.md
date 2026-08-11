# Mente Clara (MindGuide AI)

Aplicación web de orientación emocional: cuestionario guiado, recomendaciones basadas en evidencia, ejercicios prácticos y derivación a consulta con una psicóloga colegiada. **No sustituye un diagnóstico ni tratamiento profesional.**

## Stack técnico

- [TanStack Start](https://tanstack.com/start) (React 19, file-based routing con TanStack Router)
- [Vite](https://vite.dev/) + [Nitro](https://nitro.build/) para build/SSR
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- [Supabase](https://supabase.com/) (Postgres + Auth + Row Level Security)
- [TanStack Query](https://tanstack.com/query) para data fetching
- TypeScript, ESLint, Prettier

## Requisitos previos

- Node.js 18+
- Un proyecto de Supabase (o el proyecto Lovable Cloud ya vinculado a este repo)

## Puesta en marcha

```bash
npm install
npm run dev
```

La app arranca en modo desarrollo con recarga en caliente (ver el puerto que imprime Vite en consola).

## Variables de entorno

Copia `.env` (o créalo) con las siguientes claves, obtenidas desde el panel de tu proyecto Supabase:

```
SUPABASE_PROJECT_ID=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Las variables `VITE_*` se exponen al cliente (build-time); las que no llevan prefijo se usan solo en el servidor (SSR, server functions). Nunca añadas la `service_role key` con prefijo `VITE_`.

## Scripts

| Comando             | Descripción                                            |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Servidor de desarrollo con hot reload                  |
| `npm run build`     | Build de producción                                    |
| `npm run build:dev` | Build en modo desarrollo (útil para depurar el bundle) |
| `npm run preview`   | Sirve el build de producción localmente                |
| `npm run lint`      | ESLint sobre todo el repo                              |
| `npm run format`    | Formatea el repo con Prettier                          |

## Estructura del proyecto

```
src/
  routes/              Páginas (file-based routing de TanStack Router)
  components/
    mc/                Componentes propios del producto (header, footer, cards, disclaimer...)
    ui/                 Componentes shadcn/ui (Radix primitives)
  lib/
    mc/                 Dominio de la app: tipos, preguntas, ejercicios, triage, store de estado
  integrations/supabase/ Clientes Supabase (browser, server, admin) y middleware de auth
supabase/
  migrations/           Migraciones SQL versionadas del esquema de base de datos
```

## Base de datos y seguridad

El esquema vive en `supabase/migrations/`. Tablas principales: `profiles`, `questions`/`question_options`, `questionnaire_sessions`/`questionnaire_answers`, `assessment_results`, `exercises`/`exercise_completions`, `recommendations`, `risk_rules`, `ai_rules`, `conversations`/`messages`, `consultation_requests`, `user_roles`.

Todas las tablas tienen **Row Level Security (RLS)** habilitada: cada usuario solo accede a sus propios datos; el rol `admin` (tabla `user_roles`) puede leer y gestionar contenido editorial (preguntas, ejercicios, recomendaciones, reglas). El cliente `service_role` (`client.server.ts`) solo debe usarse en código de servidor de confianza, nunca en rutas ni código que llegue al bundle del cliente.

## Aviso

Esta aplicación ofrece orientación emocional, no diagnóstico ni tratamiento clínico. Ante una urgencia, consulta los recursos de la pantalla `/urgente` o contacta con los servicios de emergencia.
