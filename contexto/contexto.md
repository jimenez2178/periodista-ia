# PeriodistaIA — Contexto General del Proyecto

## ¿Qué es?
Un copiloto editorial con IA para periodistas. No es un chatbot genérico
— es un asistente que entiende el flujo de trabajo periodístico completo.

**Slogan:** Tu copiloto editorial con IA

---

## Funciones del MVP (arranque)

1. Tengo una idea → plan de investigación completo
2. Verificación de fuentes
3. Audio → Transcripción → Nota periodística o Nota de prensa

---

## Decisiones clave del producto

- El sistema recuerda el historial del periodista entre sesiones
- Se pueden subir audios desde el dispositivo O pegar enlaces
  (WhatsApp, Google Drive, etc.)
- La nota generada se puede descargar (Word o PDF) y copiar
- El idioma de la nota sigue el idioma del audio
- El estilo editorial (variante de español) se configura una vez en el perfil

### Plan Free (gancho comercial)
- Solo permite transcribir archivos muy cortos (máximo ~2 páginas)
- El sistema le informa claramente al usuario el límite
- El gancho: prueba el valor, el límite te empuja a pagar

### Plan Pro (US$9–15/mes)
- Transcripción de audios y archivos largos
- Consultas ilimitadas
- Historial completo
- Proyectos guardados (notas finales + fuentes + transcripciones)
- Descarga en Word o PDF

### Plan Newsroom (precio personalizado)
- Múltiples periodistas bajo una organización
- Panel de administrador
- Políticas editoriales configurables
- Estadísticas de uso
- **Nota:** No activo en el MVP, pero la arquitectura lo contempla desde el inicio

---

## Flujo de la función estrella

Audio subido o enlace pegado
    ↓
Transcripción (Whisper / OpenAI)
    ↓
El periodista elige:
  → Nota periodística (formato y tono automático)
  → Nota de prensa (el sistema pregunta: ¿nombre de la organización?)
    ↓
Nota generada → visible en pantalla
    ↓
Opciones: Descargar (Word/PDF) | Copiar

---

## Arquitectura técnica

- Frontend: Vercel
- Backend/DB: Supabase (ID proyecto: lmxofqnucnudyazntyfg)
- Orquestación: n8n
- IA redacción/análisis: Claude API (Anthropic)
- IA transcripción: Whisper (OpenAI)
- Análisis de documentos: PDF.co o similar
- Pagos: PayPal (arranque) → Stripe o Lemon Squeezy (escala)

---

## Repositorio
https://github.com/jimenez2178/periodista-ia

## Landing page
https://periodista-ia.netlify.app

---

## Validación

- Post en LinkedIn: +107 impresiones en menos de 24 horas
- Primera beta tester: Mónica Redondo Domínguez (periodista, España)
- Formulario español: https://tinyurl.com/37wn44zf
- Formulario inglés: https://tinyurl.com/5t49wjfy

---

## Planes a futuro (post-MVP)

- Resto de las 10 funciones del copiloto
- Plan Newsroom activo
- Meta Ads con testimonios reales
- Expansión internacional
