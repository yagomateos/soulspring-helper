# Mente Clara — Qué es y cómo funciona

Este documento explica la aplicación en lenguaje sencillo, pensado para que lo entiendas sin necesidad de conocimientos técnicos. Si quieres el detalle técnico (stack, instalación, base de datos), está en `README.md`.

## En una frase

Mente Clara es una web donde una persona responde un cuestionario breve sobre cómo se siente, recibe una primera orientación y recomendaciones, y —si lo necesita— puede pedir directamente una cita contigo. Todo el contenido que ve (preguntas, textos, ejercicios) está definido y puede ser editado por ti desde un panel, sin tocar código.

**No es una app de diagnóstico ni de terapia.** Es una puerta de entrada: ayuda a la persona a poner en palabras lo que le pasa, le da una primera orientación y la deriva a consulta cuando corresponde.

## El recorrido de una persona usuaria

1. **Llega a la página principal** y elige el área que mejor describe lo que le pasa: *ansiedad*, *estado de ánimo* o *relaciones y pareja*.
2. **Responde un cuestionario por pasos** (`/cuestionario/...`), breve y sin tecnicismos, sobre frecuencia, intensidad, duración e impacto de lo que siente.
3. **Recibe un resultado** (`/resultado`): un resumen en lenguaje cercano, una puntuación orientativa y los aspectos que más están pesando.
4. **Ve recomendaciones y ejercicios** ajustados a su situación: pautas prácticas (respiración, hábitos de sueño, actividad, comunicación...) y ejercicios guiados de la biblioteca.
5. **Puede hablar con el asistente de chat** (`/chat`) para explayarse un poco más antes o después del cuestionario.
6. **Puede solicitar una consulta contigo** (`/reserva`): elige tipo de sesión, día y hora, y deja una nota opcional para ti. Tú recibes la solicitud y confirmas por email.

En cualquier momento puede explorar la **Biblioteca** (`/biblioteca`) y los **Programas** (`/programas`), recorridos guiados de varias sesiones sobre un tema concreto.

## La barrera de seguridad (lo más importante)

El sistema está diseñado para **no sustituirte nunca** en una situación delicada:

- Si en el cuestionario aparecen respuestas de alarma (ideación suicida, autolesión, etc.), el sistema **detiene el cuestionario** y lleva a la persona directamente a una pantalla de **atención inmediata** (`/urgente`) con el teléfono **024** (atención a la conducta suicida, España), el **112** y la recomendación de avisar a alguien de confianza — antes de cualquier análisis o recomendación automática.
- Lo mismo ocurre en el chat: si el mensaje contiene señales de riesgo, la respuesta automática se sustituye siempre por el mismo mensaje de derivación a ayuda profesional inmediata, sin depender de que "la IA lo entienda bien" — es una comprobación fija, no una interpretación.
- El resultado del cuestionario clasifica el malestar en 4 niveles (**orientación general, seguimiento recomendado, valoración profesional recomendada, atención inmediata**) y, cuando el nivel es alto, la propia app anima a pedir cita contigo.

## El asistente de chat: qué es y qué no es

- Es un chat de acompañamiento, **no un terapeuta ni un chatbot médico**. Está pensado para ayudar a la persona a poner palabras a lo que siente antes de decidir si pide cita.
- Sigue reglas clínicas fijas que tú puedes revisar: no diagnostica, no nombra trastornos, no prescribe ni sugiere medicación, valida la emoción antes de orientar, solo recomienda ejercicios de tu biblioteca autorizada, y ante señales de riesgo corta y deriva a ayuda profesional.
- Toda respuesta va acompañada del recordatorio de que es orientación general, no un tratamiento.

## Tu panel de administración (sin tocar código)

Desde `/admin` (solo accesible para tu usuario con rol de administradora) puedes gestionar todo el contenido que ve la persona usuaria:

- **Contenidos** — biblioteca de artículos y guías, gratuitos o Premium.
- **Programas** — recorridos guiados de varias sesiones.
- **Ejercicios** — la biblioteca de prácticas que se recomiendan en resultados y chat.
- **Recomendaciones** — los textos que acompañan cada resultado.
- **Usuarios** — consultar cuentas registradas y su estado Premium.

Es decir: las preguntas del cuestionario, los textos de resultado, los ejercicios y las reglas del chat están pensados para que **tú los revises y ajustes**, no para que queden fijos en el código.

## Cuentas, privacidad y Premium

- La persona puede usar la evaluación y el chat sin registrarse; para guardar historial, seguimiento y contenido Premium necesita crear una cuenta (`/registro`).
- Cada persona solo ve sus propios datos (respuestas, resultados, conversaciones, citas) — la base de datos está configurada para que nadie pueda acceder a los datos de otra persona salvo tú como administradora.
- Existe un plan **Premium** (`/premium`) pensado para dar acceso a biblioteca completa, programas y seguimiento de progreso; la suscripción de pago todavía no está activa.

## Lo que la app deja claro en todo momento

En la portada, en el resultado y antes de reservar cita aparece siempre el mismo aviso:

> *"Esta aplicación ofrece orientación emocional, no diagnóstico ni tratamiento clínico. Ante una urgencia, contacta con los servicios de emergencia."*

## Resumen para ti

Piensa en Mente Clara como una **sala de espera inteligente**: recoge a la persona, la escucha, le da una primera orientación con tu criterio clínico incorporado en las reglas y los contenidos, filtra las urgencias hacia recursos de emergencia, y a todas las demás las acerca a pedir cita contigo — con el contexto de lo que ya han respondido, para que la primera sesión empiece un paso más adelantada.
