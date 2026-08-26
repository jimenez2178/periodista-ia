const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const errorHandler = require("./middleware/errorHandler");
const ideasRoutes = require("./modules/ideas/ideas.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/ideas", ideasRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`PeriodistaIA backend escuchando en el puerto ${env.port}`);
});
