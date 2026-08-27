const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const errorHandler = require("./middleware/errorHandler");
const requireAuth = require("./middleware/auth");
const authRoutes = require("./modules/auth/auth.routes");
const ideasRoutes = require("./modules/ideas/ideas.routes");
const creditsRoutes = require("./modules/credits/credits.routes");
const sourcesRoutes = require("./modules/sources/sources.routes");
const transcriptionsRoutes = require("./modules/transcriptions/transcriptions.routes");
const articlesRoutes = require("./modules/articles/articles.routes");
const usersRoutes = require("./modules/users/users.routes");
const assistantRoutes = require("./modules/assistant/assistant.routes");
const projectsRoutes = require("./modules/projects/projects.routes");
const sessionsRoutes = require("./modules/sessions/sessions.routes");
const historyRoutes = require("./modules/history/history.routes");
const documentsRoutes = require("./modules/documents/documents.routes");
const interviewsRoutes = require("./modules/interviews/interviews.routes");
const toolsRoutes = require("./modules/tools/tools.routes");
const socialRoutes = require("./modules/social/social.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ideas", requireAuth, ideasRoutes);
app.use("/api/credits", requireAuth, creditsRoutes);
app.use("/api/sources", requireAuth, sourcesRoutes);
app.use("/api/transcriptions", requireAuth, transcriptionsRoutes);
app.use("/api/articles", requireAuth, articlesRoutes);
app.use("/api/users", requireAuth, usersRoutes);
app.use("/api/assistant", requireAuth, assistantRoutes);
app.use("/api/projects", requireAuth, projectsRoutes);
app.use("/api/sessions", requireAuth, sessionsRoutes);
app.use("/api/history", requireAuth, historyRoutes);
app.use("/api/documents", requireAuth, documentsRoutes);
app.use("/api/interviews", requireAuth, interviewsRoutes);
app.use("/api/tools", requireAuth, toolsRoutes);
app.use("/api/social", requireAuth, socialRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`PeriodistaIA backend escuchando en el puerto ${env.port}`);
});
