# PeriodistaIA — Estructura del Frontend

## Principio clave de esta estructura

La presentación y la lógica van separadas. Esto significa:

- Lo que se ve (botones, pantallas, colores) vive en `components/`
- Lo que hace cosas (llamar al backend, manejar datos) vive en `services/` y `hooks/`

Si mañana quieres cambiar cómo se ve un botón, no tienes que tocar la lógica. Y si cambias la lógica, no rompes el diseño.

## Árbol completo de carpetas

```
periodista-ia-frontend/
│
├── app/                              # Páginas de la aplicación (Next.js App Router)
│   │
│   ├── (auth)/                       # Páginas públicas (sin login)
│   │   ├── login/
│   │   │   └── page.jsx              # Pantalla de inicio de sesión
│   │   ├── register/
│   │   │   └── page.jsx              # Pantalla de registro
│   │   └── layout.jsx                # Diseño base para páginas públicas
│   │
│   ├── (dashboard)/                  # Páginas privadas (requieren login)
│   │   │
│   │   ├── layout.jsx                # Diseño base con barra lateral
│   │   │
│   │   ├── home/
│   │   │   └── page.jsx              # Pantalla principal: las 3 funciones del MVP
│   │   │
│   │   ├── transcription/
│   │   │   └── page.jsx              # Subir audio → transcribir → generar nota
│   │   │
│   │   ├── idea/
│   │   │   └── page.jsx              # Tengo una idea → plan de investigación
│   │   │
│   │   ├── verification/
│   │   │   └── page.jsx              # Verificar fuentes
│   │   │
│   │   ├── projects/
│   │   │   ├── page.jsx              # Lista de proyectos guardados
│   │   │   └── [id]/
│   │   │       └── page.jsx          # Detalle de un proyecto específico
│   │   │
│   │   ├── history/
│   │   │   └── page.jsx              # Historial de sesiones anteriores
│   │   │
│   │   ├── profile/
│   │   │   └── page.jsx              # Perfil: país, variante de español, plan
│   │   │
│   │   └── billing/
│   │       └── page.jsx              # Planes y pagos
│   │
│   ├── api/                          # Rutas internas de Next.js (puente al backend)
│   │   └── proxy/
│   │       └── [...path]/
│   │           └── route.js          # Proxy seguro hacia el backend en el VPS
│   │
│   ├── layout.jsx                    # Layout raíz (fuentes, meta tags globales)
│   └── page.jsx                      # Redirige al login o al dashboard
│
├── components/                       # Todo lo visual, separado por responsabilidad
│   │
│   ├── ui/                           # Piezas básicas reutilizables
│   │   ├── Button.jsx                # Botón estándar del sistema
│   │   ├── Input.jsx                 # Campo de texto
│   │   ├── Textarea.jsx              # Campo de texto largo
│   │   ├── Badge.jsx                 # Etiqueta (ej: "Pro", "Free")
│   │   ├── Spinner.jsx               # Indicador de carga
│   │   ├── Modal.jsx                 # Modal reutilizable (no saca de la pantalla)
│   │   ├── Toast.jsx                 # Notificación temporal (éxito/error)
│   │   └── Card.jsx                  # Tarjeta contenedora
│   │
│   ├── layout/                       # Estructura visual de la app
│   │   ├── Sidebar.jsx               # Barra lateral de navegación
│   │   ├── TopBar.jsx                # Barra superior con usuario y créditos
│   │   └── PageWrapper.jsx           # Envuelve cada página con padding y scroll
│   │
│   ├── transcription/                # Componentes de la función estrella
│   │   ├── AudioUploader.jsx         # Subir archivo o pegar URL
│   │   ├── TranscriptionResult.jsx   # Muestra el texto transcrito
│   │   ├── ArticleTypeSelector.jsx   # Elige: nota periodística o de prensa
│   │   ├── PressReleaseForm.jsx      # Pregunta el nombre de la organización
│   │   └── ArticleResult.jsx         # Muestra la nota generada con opciones
│   │
│   ├── idea/                         # Componentes de "Tengo una idea"
│   │   ├── IdeaInput.jsx             # Campo donde escribe la idea
│   │   └── InvestigationPlan.jsx     # Muestra el plan generado
│   │
│   ├── verification/                 # Componentes de verificación de fuentes
│   │   ├── ClaimInput.jsx            # Campo donde escribe la afirmación
│   │   └── VerificationResult.jsx    # Muestra el veredicto y explicación
│   │
│   ├── projects/                     # Componentes de proyectos
│   │   ├── ProjectCard.jsx           # Tarjeta de un proyecto en la lista
│   │   ├── ProjectDetail.jsx         # Vista completa de un proyecto
│   │   └── CreateProjectModal.jsx    # Modal para crear proyecto nuevo
│   │
│   ├── history/                      # Componentes del historial
│   │   ├── SessionCard.jsx           # Tarjeta de una sesión anterior
│   │   └── MessageThread.jsx         # Hilo de mensajes de una sesión
│   │
│   ├── credits/                      # Componentes de créditos
│   │   ├── CreditsBadge.jsx          # Muestra créditos disponibles en la TopBar
│   │   └── UpgradePrompt.jsx         # Banner que aparece cuando se acaban los créditos
│   │
│   └── assistant/                    # Asistente interno de la app
│       ├── AssistantButton.jsx       # Botón flotante para abrir el asistente
│       └── AssistantModal.jsx        # Modal del asistente (responde dudas del usuario)
│
├── services/                         # Lógica de comunicación con el backend
│   ├── auth.service.js               # Login, registro, logout, sesión activa
│   ├── transcriptions.service.js     # Subir audio, obtener transcripción
│   ├── articles.service.js           # Generar nota, obtener nota guardada
│   ├── projects.service.js           # Crear, listar, ver proyectos
│   ├── sessions.service.js           # Historial de sesiones y mensajes
│   ├── sources.service.js            # Verificar fuentes
│   ├── ideas.service.js              # Enviar idea, recibir plan
│   ├── credits.service.js            # Ver créditos disponibles
│   ├── payments.service.js           # Ver planes, iniciar pago
│   └── downloads.service.js          # Descargar nota en PDF o Word
│
├── hooks/                            # Lógica reutilizable para los componentes
│   ├── useAuth.js                    # Saber si el usuario está logueado
│   ├── useCredits.js                 # Ver y actualizar créditos en tiempo real
│   ├── usePlan.js                    # Saber qué plan tiene el usuario
│   ├── useTranscription.js           # Manejar el estado de una transcripción
│   └── useAssistant.js               # Manejar el estado del asistente interno
│
├── utils/                            # Funciones de ayuda sin lógica de negocio
│   ├── formatters.js                 # Formatear fechas, números, duración de audio
│   ├── validators.js                 # Validar archivos antes de subir
│   ├── planLimits.js                 # Límites del plan Free en el frontend
│   └── constants.js                  # Valores fijos: tipos de nota, idiomas, etc.
│
├── context/                          # Estado global compartido entre pantallas
│   ├── AuthContext.jsx               # Quién está logueado
│   └── CreditsContext.jsx            # Créditos disponibles (actualiza en tiempo real)
│
├── public/                           # Archivos estáticos
│   ├── logo.png                      # Logo de PeriodistaIA
│   └── favicon.ico                   # Ícono del navegador
│
├── styles/
│   └── globals.css                   # Estilos globales + variables de Tailwind
│
├── .env.local                        # Variables de entorno del frontend
├── .env.example                      # Plantilla sin valores reales
├── next.config.js                    # Configuración de Next.js
├── tailwind.config.js                # Configuración de Tailwind CSS
├── .gitignore                        # Archivos que Git no debe subir
└── package.json                      # Dependencias del proyecto
```

## Qué hace cada carpeta en lenguaje simple

**`app/`** — Las páginas que el periodista visita. Separadas en dos zonas: las públicas (login, registro) y las privadas (el dashboard completo).

**`components/`** — Las piezas visuales. Cada carpeta dentro agrupa componentes por función. `ui/` tiene las piezas más básicas que se reusan en toda la app. El resto son específicos de cada función.

**`services/`** — Los mensajeros. Se encargan de hablar con el backend. Un componente nunca llama al backend directamente — siempre lo hace a través de un servicio.

**`hooks/`** — La memoria inteligente de los componentes. Por ejemplo, `useCredits.js` sabe cuántos créditos tiene el usuario y actualiza el número automáticamente sin recargar la página.

**`context/`** — El pizarrón compartido. Información que necesitan muchas pantallas al mismo tiempo, como quién está logueado o cuántos créditos quedan.

**`utils/`** — La caja de herramientas. Funciones simples que no pertenecen a ningún módulo específico.

## Tres decisiones de diseño importantes ya contempladas

✅ **Modales en lugar de navegación** — Acciones como crear un proyecto o ver el asistente abren un modal, no te sacan de la pantalla donde estás.

✅ **Eliminar cuenta** — Va en `profile/page.jsx`. Al confirmar, cierra la sesión y lleva al login. Solo se puede recuperar volviendo a loguearse.

✅ **Asistente interno** — El botón flotante `AssistantButton.jsx` está disponible en todas las pantallas del dashboard gracias al `layout.jsx`.
