# PeriodistaIA — Diseño de Base de Datos

## Las tablas y por qué existen

### 1. `users` — Los periodistas registrados

Esta es la tabla madre. Todo parte de aquí.

```
users
├── id                    UUID, clave primaria
├── email                 TEXT, único, requerido
├── full_name             TEXT
├── country               TEXT (ej: "DO", "ES", "MX")
├── language_variant      TEXT (ej: "es-DO", "es-ES")
├── avatar_url            TEXT (foto de perfil, opcional)
├── plan                  TEXT (free | pro | newsroom)
├── plan_started_at       TIMESTAMP
├── plan_expires_at       TIMESTAMP
├── newsroom_id           UUID, clave foránea → newsrooms (null si no aplica)
├── role                  TEXT (journalist | newsroom_admin | superadmin)
├── created_at            TIMESTAMP
└── updated_at            TIMESTAMP
```

Por qué existe: Guarda todo lo que sabemos del periodista: quién es, qué plan tiene, a qué sala de redacción pertenece si aplica, y su variante de español para personalizar los textos.

### 2. `newsrooms` — Las salas de redacción (Plan Newsroom)

No está activa en el MVP, pero la arquitectura la contempla desde ahora.

```
newsrooms
├── id                    UUID, clave primaria
├── name                  TEXT (nombre del medio u organización)
├── slug                  TEXT, único (ej: "el-informativo")
├── logo_url              TEXT
├── country               TEXT
├── editorial_policy      TEXT (instrucciones editoriales configurables)
├── max_users             INTEGER (límite de periodistas incluidos)
├── plan_expires_at       TIMESTAMP
├── created_at            TIMESTAMP
└── updated_at            TIMESTAMP
```

Por qué existe: Cuando un medio compra el plan Newsroom, todos sus periodistas quedan agrupados aquí. El administrador puede definir políticas editoriales que el copiloto respeta al generar notas.

### 3. `credits` — El contador de uso por usuario

```
credits
├── id                    UUID, clave primaria
├── user_id               UUID, clave foránea → users
├── plan                  TEXT (free | pro | newsroom)
├── total_credits         INTEGER
├── used_credits          INTEGER
├── reset_at              TIMESTAMP (cuándo se reinician los créditos diarios)
├── created_at            TIMESTAMP
└── updated_at            TIMESTAMP
```

Por qué existe: Controla cuánto ha usado cada periodista. En el plan Free, los créditos se reinician cada día. En Pro, no hay límite real pero igual llevamos el conteo para estadísticas.

### 4. `projects` — Las carpetas de trabajo del periodista

```
projects
├── id                    UUID, clave primaria
├── user_id               UUID, clave foránea → users
├── newsroom_id           UUID, clave foránea → newsrooms (null si es personal)
├── title                 TEXT (nombre del proyecto/historia)
├── description           TEXT (opcional)
├── status                TEXT (active | archived)
├── created_at            TIMESTAMP
└── updated_at            TIMESTAMP
```

Por qué existe: Agrupa todo lo relacionado a una historia: el audio, la transcripción, la nota, las fuentes. Como una carpeta digital por reportaje.

### 5. `sessions` — El historial de conversaciones

```
sessions
├── id                    UUID, clave primaria
├── user_id               UUID, clave foránea → users
├── project_id            UUID, clave foránea → projects (opcional)
├── function_used         TEXT (transcription | idea | verification | etc.)
├── title                 TEXT (resumen corto generado automáticamente)
├── created_at            TIMESTAMP
└── updated_at            TIMESTAMP
```

Por qué existe: Cada vez que el periodista usa una función, se crea una sesión. Así puede volver a ver qué hizo la semana pasada.

### 6. `messages` — Los mensajes dentro de cada sesión

```
messages
├── id                    UUID, clave primaria
├── session_id            UUID, clave foránea → sessions
├── role                  TEXT (user | assistant)
├── content               TEXT (el mensaje en sí)
├── created_at            TIMESTAMP
```

Por qué existe: Como WhatsApp — guarda cada mensaje de ida y vuelta dentro de una conversación. Esto es lo que permite mostrar el historial completo.

### 7. `transcriptions` — Los audios transcritos

```
transcriptions
├── id                    UUID, clave primaria
├── user_id               UUID, clave foránea → users
├── session_id            UUID, clave foránea → sessions
├── project_id            UUID, clave foránea → projects (opcional)
├── audio_source          TEXT (upload | url)
├── audio_url             TEXT (enlace del archivo o URL pegada)
├── audio_duration_secs   INTEGER (duración en segundos)
├── file_size_bytes       INTEGER
├── transcript_text       TEXT (el texto completo transcrito)
├── language_detected     TEXT (ej: "es", "en")
├── status                TEXT (pending | processing | done | error)
├── created_at            TIMESTAMP
└── updated_at            TIMESTAMP
```

Por qué existe: Guarda cada audio que el periodista sube o enlaza, junto con su transcripción completa. También guarda el tamaño y duración para aplicar el límite del plan Free.

### 8. `articles` — Las notas generadas

```
articles
├── id                    UUID, clave primaria
├── user_id               UUID, clave foránea → users
├── session_id            UUID, clave foránea → sessions
├── project_id            UUID, clave foránea → projects (opcional)
├── transcription_id      UUID, clave foránea → transcriptions (opcional)
├── type                  TEXT (news_article | press_release)
├── organization_name     TEXT (solo si type = press_release)
├── title                 TEXT
├── body                  TEXT (el contenido completo de la nota)
├── language              TEXT (ej: "es-DO")
├── word_count            INTEGER
├── status                TEXT (draft | final)
├── created_at            TIMESTAMP
└── updated_at            TIMESTAMP
```

Por qué existe: Guarda cada nota periodística o de prensa que el sistema genera. Sabe si viene de una transcripción, a qué proyecto pertenece, y si es borrador o final.

### 9. `downloads` — Registro de descargas

```
downloads
├── id                    UUID, clave primaria
├── user_id               UUID, clave foránea → users
├── article_id            UUID, clave foránea → articles
├── format                TEXT (pdf | docx)
├── created_at            TIMESTAMP
```

Por qué existe: Cada vez que un periodista descarga una nota, queda registrado. Útil para estadísticas y para el plan Newsroom donde el admin querrá ver métricas.

### 10. `sources` — Las fuentes verificadas

```
sources
├── id                    UUID, clave primaria
├── user_id               UUID, clave foránea → users
├── session_id            UUID, clave foránea → sessions
├── project_id            UUID, clave foránea → projects (opcional)
├── claim                 TEXT (la afirmación que se verificó)
├── verdict               TEXT (verified | unverified | false | inconclusive)
├── confidence_level      TEXT (high | medium | low)
├── explanation           TEXT (por qué llegó a ese veredicto)
├── sources_used          TEXT (referencias usadas, en formato JSON)
├── created_at            TIMESTAMP
```

Por qué existe: Guarda cada verificación de fuente que hace el copiloto. El periodista puede consultar después qué afirmaciones verificó en cada proyecto.

### 11. `interviews` — Los kits de preparación de entrevistas

```
interviews
├── id                    UUID, clave primaria
├── user_id               UUID, clave foránea → users
├── session_id            UUID, clave foránea → sessions (opcional)
├── project_id            UUID, clave foránea → projects (opcional)
├── interviewee           TEXT (nombre, cargo o contexto de la persona a entrevistar)
├── topic                 TEXT (tema de la entrevista)
├── results               JSONB (preguntas básicas, incómodas, de seguimiento,
│                          temas a evitar y datos a verificar)
└── created_at            TIMESTAMP
```

Por qué existe: Guarda cada kit de preguntas que el copiloto prepara antes de una entrevista, para que el periodista pueda consultarlo de nuevo o guardarlo en un proyecto.

### 12. `payments` — El historial de pagos

```
payments
├── id                    UUID, clave primaria
├── user_id               UUID, clave foránea → users
├── amount                DECIMAL
├── currency              TEXT (ej: "USD")
├── plan                  TEXT (pro | newsroom)
├── payment_method        TEXT (paypal | stripe | lemonsqueezy)
├── external_payment_id   TEXT, único (el txn_id que da PayPal/Stripe)
├── status                TEXT (pending | completed | failed | refunded)
├── created_at            TIMESTAMP
```

Por qué existe: Registra cada pago recibido. Cuando el webhook de PayPal (`POST /api/payments/webhook`) confirma un pago completado, inserta aquí primero y luego activa el plan Pro del periodista (`users.plan`, `credits`). El `unique` en `external_payment_id` no es solo para no duplicar el registro contable: es lo que hace idempotente al webhook — si PayPal reenvía el mismo IPN (algo que hace si no recibe el 200 a tiempo), el insert falla por duplicado y el resto del proceso (email de bienvenida, notificación de Telegram) se salta en vez de repetirse.

## Relaciones entre tablas (resumen visual)

```
newsrooms ←────────────────── users
                                │
               ┌────────────────┼─────────────────┐
               │                │                  │
           projects          credits            payments
               │
     ┌─────────┼──────────┐
     │         │          │
 sessions   articles    sources
     │         │
  messages  downloads
     │
transcriptions
```

## Herramienta para diagramar

dbdiagram.io — gratis, en el navegador, no requiere instalación.
