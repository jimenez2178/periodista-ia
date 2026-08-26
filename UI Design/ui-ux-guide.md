# PeriodistaIA — Guía de UI/UX

Cómo se ve y se siente PeriodistaIA. Detalle suficiente para recrear cada pantalla en una herramienta de diseño.

## Identidad visual base

```
Color principal:     Azul oscuro    #1B2B4B
Color acento:        Amarillo       #F5C518
Color de fondo:      Gris muy claro #F8F9FA
Color de texto:      Gris oscuro    #1A1A2E
Color de éxito:      Verde          #22C55E
Color de error:      Rojo           #EF4444
Color de borde:      Gris claro     #E2E8F0

Fuente títulos:      Inter Bold
Fuente cuerpo:       Inter Regular
Border radius:       12px (esquinas suaves, no tan redondas)
Sombras:             Suaves, tipo tarjeta flotante
```

## Pantalla 1 — Login / Registro

**Qué ve el periodista:**

Pantalla dividida en dos mitades. La izquierda tiene el logo de PeriodistaIA, el slogan "Tu copiloto editorial con IA" y una frase breve que resume el valor del producto. La derecha tiene el formulario de login con email y contraseña, un botón azul oscuro que dice "Entrar", un enlace que dice "¿No tienes cuenta? Regístrate" y otro que dice "Olvidé mi contraseña".

**Detalles importantes:**

- Fondo izquierdo: azul oscuro con el logo en blanco y amarillo
- El formulario de registro pregunta: nombre completo, email, contraseña, país (selector desplegable)
- Después del registro, aparece un modal de bienvenida que explica brevemente las 3 funciones del MVP

## Pantalla 2 — Dashboard / Inicio

**Qué ve el periodista:**

Barra lateral izquierda fija con el logo arriba, los íconos de navegación y el nombre del usuario abajo. En la parte superior derecha, un badge que muestra los créditos disponibles (ej: "5 créditos restantes hoy"). El área central tiene un saludo ("Buenos días, Jesús") y debajo tres tarjetas grandes, una por función del MVP.

**Las tres tarjetas:**

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  🎙️                 │  │  💡                 │  │  🔍                 │
│  Audio a Nota       │  │  Tengo una idea     │  │  Verificar          │
│                     │  │                     │  │  fuentes            │
│  Transcribe tu      │  │  Convierte una      │  │                     │
│  entrevista y       │  │  observación en     │  │  Confirma si una    │
│  genera tu nota     │  │  un plan de         │  │  afirmación tiene   │
│  en segundos        │  │  investigación      │  │  respaldo real      │
│                     │  │  completo           │  │                     │
│  [Empezar →]        │  │  [Empezar →]        │  │  [Empezar →]        │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

Debajo de las tarjetas, una sección "Actividad reciente" con las últimas 3 sesiones del periodista.

## Pantalla 3 — Audio a Nota (función estrella)

Es un flujo de 4 pasos en la misma pantalla, sin salir de ella:

**Paso 1 — Subir audio**

Área central con dos opciones:

- Un recuadro punteado grande con ícono de micrófono que dice "Arrastra tu audio aquí o haz clic para subir" (acepta MP3, MP4, WAV, M4A)
- Debajo, un campo de texto que dice "O pega un enlace de WhatsApp, Google Drive o similar"
- En la esquina, un aviso suave para usuarios Free: "Plan gratuito: máximo 2 minutos de audio. Actualiza para audios ilimitados →"

**Paso 2 — Transcripción en proceso**

El recuadro del audio se reemplaza por una animación de ondas de sonido con el texto "Transcribiendo tu audio..." y una barra de progreso. El periodista no puede hacer nada aquí excepto esperar.

**Paso 3 — Resultado de la transcripción**

Aparece el texto completo transcrito en un recuadro con scroll. Arriba del recuadro, el idioma detectado (ej: "Español detectado"). Debajo del texto, dos botones grandes:

```
[📰 Generar nota periodística]    [📋 Generar nota de prensa]
```

Si elige nota de prensa, aparece un modal pequeño que pregunta:
"¿Cuál es el nombre de la organización que emite esta nota?"
Con un campo de texto y un botón "Continuar".

**Paso 4 — La nota generada**

La nota aparece en un recuadro de texto editable (el periodista puede hacer ajustes menores antes de descargar). Arriba de la nota, el título generado automáticamente. Abajo, tres botones:

```
[⬇️ Descargar PDF]   [⬇️ Descargar Word]   [📋 Copiar texto]
```

Y un botón secundario: "Guardar en proyecto →" que abre un modal para elegir o crear un proyecto.

## Pantalla 4 — Tengo una idea

Flujo de 2 pasos:

**Paso 1 — La idea**

Campo de texto grande en el centro con el placeholder: "Cuéntame tu idea con tus palabras. Puede ser una observación, una sospecha, algo que viste en la calle o una punta de un contacto..."

Botón azul debajo: "Generar plan de investigación"

**Paso 2 — El plan**

Aparece debajo del campo (sin recargar la página) un panel estructurado con secciones colapsables:

- 📌 Resumen de la historia
- 🎯 Ángulos posibles
- 📞 Fuentes sugeridas
- ❓ Preguntas clave para investigar
- 📋 Próximos pasos concretos

Botón al final: "Guardar en proyecto →"

## Pantalla 5 — Verificar fuentes

Flujo de 2 pasos:

**Paso 1 — La afirmación**

Campo de texto con placeholder: "Escribe la afirmación que quieres verificar. Ej: 'El presidente firmó el decreto 45-2026 el pasado lunes'"

Botón: "Verificar"

**Paso 2 — El veredicto**

Aparece una tarjeta con:

- Un ícono grande de color según el veredicto (verde = verificado, rojo = falso, amarillo = inconcluso)
- El veredicto en texto grande: "VERIFICADO", "NO VERIFICADO", "INCONCLUSO"
- Una barra de confianza (Alta / Media / Baja)
- La explicación completa del copiloto
- Las fuentes consultadas como lista con enlaces
- Botón: "Guardar en proyecto →"

## Pantalla 6 — Proyectos

**Lista de proyectos:**

Cuadrícula de tarjetas. Cada tarjeta muestra:

- Título del proyecto
- Fecha de creación
- Número de elementos guardados (ej: "2 notas · 1 transcripción · 3 fuentes")
- Estado: Activo o Archivado
- Botón "Ver proyecto →"

Botón flotante en la esquina inferior derecha: "+ Nuevo proyecto" (abre modal).

**Vista de un proyecto:**

Panel dividido en pestañas:

- 📰 Notas generadas
- 🎙️ Transcripciones
- 🔍 Fuentes verificadas

Cada pestaña muestra sus elementos con fecha y opciones de descarga.

## Pantalla 7 — Perfil

Formulario sencillo con:

- Foto de perfil (subir imagen)
- Nombre completo
- País (selector)
- Variante de español (selector: es-DO, es-ES, es-MX, es-AR, etc.)
- Plan actual con badge (Free / Pro / Newsroom)
- Botón "Ver planes y mejorar →"
- Zona peligrosa al final (separada por línea roja): botón "Eliminar mi cuenta" que abre un modal de confirmación con el texto "Esta acción es irreversible. Escribe ELIMINAR para confirmar."

## El asistente interno

Botón circular flotante en la esquina inferior derecha de todas las pantallas del dashboard. Ícono de burbuja de chat en color amarillo sobre fondo azul oscuro.

Al hacer clic, abre un modal con una interfaz de chat simple:

- Título: "Asistente PeriodistaIA"
- Subtítulo: "Pregúntame cómo usar cualquier función"
- Campo de texto abajo: "¿En qué te ayudo?"

El asistente responde dudas sobre cómo usar la app, no hace trabajo periodístico.

## Herramienta recomendada para diseñar

UX Pilot (uxpilot.ai).

**Cómo usarla para este proyecto:**

1. Entra a uxpilot.ai
2. Crea un nuevo proyecto llamado "PeriodistaIA"
3. En el prompt de cada pantalla, pega la descripción correspondiente de este documento
4. Especifica siempre: "Colores: azul oscuro `#1B2B4B` y amarillo `#F5C518`. Estilo: moderno, limpio, profesional. Para periodistas."
5. Genera, ajusta y exporta cada pantalla
6. Guarda los exportados en esta misma subcarpeta "UI Design"

También se puede usar Google Stitch para las pantallas principales si se quiere algo más rápido.
