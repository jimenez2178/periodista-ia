const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const errorHandler = require("./middleware/errorHandler");
const requireAuth = require("./middleware/auth");
const authRoutes = require("./modules/auth/auth.routes");
const ideasRoutes = require("./modules/ideas/ideas.routes");
const creditsRoutes = require("./modules/credits/credits.routes");
const sourcesRoutes = require("./modules/sources/sources.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ideas", requireAuth, ideasRoutes);
app.use("/api/credits", requireAuth, creditsRoutes);
app.use("/api/sources", requireAuth, sourcesRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`PeriodistaIA backend escuchando en el puerto ${env.port}`);
});
