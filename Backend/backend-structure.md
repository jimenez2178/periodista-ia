# PeriodistaIA — Estructura del Backend

## Cómo está organizado y por qué

El backend de PeriodistaIA es el "motor" que nadie ve pero que hace que todo funcione. Vive en el VPS (Easypanel + PM2), igual que otros bots. Está construido en Node.js con Express.

## Árbol completo de carpetas

```
periodista-ia-backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── supabase.js          # Conexión a Supabase (admin + auth)
│   │   ├── anthropic.js         # Conexión a Claude API
│   │   ├── openai.js            # Conexión a Whisper (transcripción)
│   │   └── env.js               # Validación de variables de entorno
│   │
│   ├── middleware/
│   │   ├── auth.js              # Verifica que el usuario esté logueado
│   │   ├── plan.js              # Verifica qué plan tiene el usuario
│   │   ├── credits.js           # Verifica y descuenta créditos
│   │   └── errorHandler.js      # Captura errores y los responde limpio
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.routes.js   # Rutas: registro, login, logout
│   │   │   └── auth.service.js  # Lógica: crear usuario, verificar sesión
│   │   │
│   │   ├── users/
│   │   │   ├── users.routes.js  # Rutas: ver perfil, editar perfil
│   │   │   └── users.service.js # Lógica: actualizar país, variante de español
│   │   │
│   │   ├── transcriptions/
│   │   │   ├── transcriptions.routes.js    # Rutas: subir audio, pegar URL
│   │   │   ├── transcriptions.service.js   # Lógica: enviar a Whisper, guardar resultado
│   │   │   └── transcriptions.validator.js # Valida tamaño/duración según plan
│   │   │
│   │   ├── articles/
│   │   │   ├── articles.routes.js   # Rutas: generar nota, ver nota, descargar
│   │   │   ├── articles.service.js  # Lógica: llamar a Claude, formatear nota
│   │   │   └── articles.prompts.js  # Los prompts para nota periodística y de prensa
│   │   │
│   │   ├── projects/
│   │   │   ├── projects.routes.js   # Rutas: crear, ver, archivar proyectos
│   │   │   └── projects.service.js  # Lógica: agrupar sesiones, notas, fuentes
│   │   │
│   │   ├── sessions/
│   │   │   ├── sessions.routes.js   # Rutas: crear sesión, ver historial
│   │   │   └── sessions.service.js  # Lógica: guardar mensajes, recuperar historial
│   │   │
│   │   ├── sources/
│   │   │   ├── sources.routes.js    # Rutas: verificar fuente, ver verificaciones
│   │   │   └── sources.service.js   # Lógica: llamar a Claude, guardar veredicto
│   │   │
│   │   ├── ideas/
│   │   │   ├── ideas.routes.js      # Rutas: enviar idea, recibir plan
│   │   │   └── ideas.service.js     # Lógica: llamar a Claude, estructurar plan
│   │   │
│   │   ├── credits/
│   │   │   ├── credits.routes.js    # Rutas: ver créditos disponibles
│   │   │   └── credits.service.js   # Lógica: sumar, restar, reiniciar créditos
│   │   │
│   │   ├── payments/
│   │   │   ├── payments.routes.js   # Rutas: webhook de PayPal, ver pagos
│   │   │   └── payments.service.js  # Lógica: confirmar pago, activar plan Pro
│   │   │
│   │   ├── downloads/
│   │   │   ├── downloads.routes.js  # Rutas: descargar nota en PDF o Word
│   │   │   └── downloads.service.js # Lógica: generar archivo, registrar descarga
│   │   │
│   │   └── newsrooms/
│   │       ├── newsrooms.routes.js  # Rutas: crear sala, gestionar periodistas
│   │       └── newsrooms.service.js # Lógica: admin de newsroom (post-MVP)
│   │
│   ├── utils/
│   │   ├── audioProcessor.js    # Descarga audios de URLs externas (Drive, WhatsApp)
│   │   ├── fileValidator.js     # Valida formato y peso de archivos subidos
│   │   ├── planLimits.js        # Define los límites de cada plan (Free/Pro/Newsroom)
│   │   ├── promptBuilder.js     # Construye prompts dinámicos según contexto
│   │   └── dateHelpers.js       # Funciones de fechas (ej: cuándo vencen créditos)
│   │
│   └── app.js                   # Punto de entrada: configura Express y rutas
│
├── .env                         # Variables secretas (API keys, URLs)
├── .env.example                 # Plantilla de variables (sin valores reales)
├── .gitignore                   # Le dice a Git qué ignorar (.env, node_modules)
├── package.json                 # Lista de dependencias del proyecto
├── ecosystem.config.js          # Configuración de PM2 para el VPS
└── README.md                    # Instrucciones básicas del proyecto
```

## Qué hace cada carpeta en lenguaje simple

**`config/`** — Las llaves del proyecto. Aquí van todas las conexiones a servicios externos: Supabase, Claude, Whisper. Si cambias de servicio, solo tocas este archivo.

**`middleware/`** — Los guardias de seguridad. Antes de que cualquier petición llegue a su destino, pasa por aquí. Verifican: ¿estás logueado? ¿tienes créditos? ¿tu plan permite esto?

**`modules/`** — El corazón del backend. Cada función del producto tiene su propia carpeta. Dentro de cada una hay dos archivos: las rutas (la puerta de entrada) y el servicio (la lógica real). Esta separación hace que el código sea fácil de mantener.

**`utils/`** — Las herramientas compartidas. Funciones que usan varios módulos. Por ejemplo, `audioProcessor.js` lo usan tanto `transcriptions` como `downloads`.

**`app.js`** — El director de orquesta. Arranca el servidor y conecta todo.

**`ecosystem.config.js`** — La ficha técnica para PM2. Le dice al VPS cómo mantener el backend vivo aunque se reinicie el servidor.

---

**Nota:** Este documento es solo diseño/planificación. No se ha tocado código todavía — eso es trabajo de Claude Code.
