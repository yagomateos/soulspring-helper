# Mindful Path AI

Quiero crear una aplicación web moderna llamada MindGuide AI (nombre provisional).

La aplicación ayudará a las personas con problemas comunes de salud mental mediante inteligencia artificial, siempre dejando claro que no sustituye la atención de un psicólogo.

Objetivo

Ayudar al usuario a entender mejor cómo se siente mediante un cuestionario inicial y ofrecer recomendaciones personalizadas basadas en psicología basada en evidencia.

La aplicación finalizará invitando al usuario a reservar una consulta con una psicóloga.

Público objetivo

Adultos.

Funcionalidades del MVP

Página de inicio

Debe incluir:

 Hero moderno

 Explicación de cómo funciona

 Beneficios

 CTA para comenzar la evaluación

Registro

Permitir:

 Email

 Google Login

Cuestionario

Crear un cuestionario dividido en varios pasos.

Debe preguntar sobre:

 Ansiedad

 Estado de ánimo

 Estrés

 Sueño

 Relaciones

 Autoestima

 Trabajo

 Objetivos personales

Usar:

 Barras de progreso

 Botones grandes

 Diseño minimalista

Resultado

Al finalizar el cuestionario mostrar:

 Resumen emocional

 Nivel estimado de ansiedad

 Nivel de estrés

 Autoestima

 Hábitos de sueño

Mostrar un mensaje indicando que es una orientación y no un diagnóstico.

Recomendaciones

Mostrar recomendaciones personalizadas como:

 Respiración

 Mindfulness

 Escribir un diario

 Paseos

 Organización del día

 Higiene del sueño

Cada recomendación debe tener:

 Icono

 Explicación

 Tiempo estimado

Chat IA

Crear una pantalla de chat.

La IA debe responder con empatía y hacer preguntas antes de dar recomendaciones.

Añadir mensajes de ejemplo.

El diseño debe parecer un chat moderno.

Reserva de consulta

Pantalla donde el usuario pueda reservar una sesión online con una psicóloga.

Incluir:

 Calendario

 Duración

 Precio

 Botón "Reservar"

Perfil

Mostrar:

 Progreso

 Cuestionarios realizados

 Recomendaciones guardadas

 Próximas citas

Diseño

Quiero un diseño premium.

Inspirarse en:

 Headspace

 Calm

 Apple Health

Colores:

 Blanco

 Azul claro

 Verde suave

Mucho espacio en blanco.

Bordes redondeados.

Animaciones suaves.

Totalmente responsive.

Tecnologías

Usar:

 React

 TypeScript

 TailwindCSS

 Componentes reutilizables

 Arquitectura limpia

 Preparado para conectar posteriormente con Supabase y OpenAI API

No usar datos reales; crear datos simulados para el MVP.

Después de que Lovable genere esta primera versión, el siguiente paso sería conectar la IA de OpenAI y hacer que las respuestas se personalicen según el cuestionario del usuario. Ahí es donde el producto empieza a diferenciarse de un simple chatbot.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://soulspring-helper.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a8b8c844-6b8c-4a7d-be0d-85348765c1e9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
