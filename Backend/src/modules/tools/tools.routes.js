const express = require("express");
const { recommendWorkflow } = require("./tools.service");

const router = express.Router();

const MAX_TASK_LENGTH = 2000;

router.post("/", async (req, res, next) => {
  try {
    const { task } = req.body;

    if (typeof task !== "string" || task.trim().length === 0) {
      return res.status(400).json({ error: "El campo 'task' es requerido y debe ser texto." });
    }

    if (task.length > MAX_TASK_LENGTH) {
      return res.status(400).json({ error: `El campo 'task' no puede superar ${MAX_TASK_LENGTH} caracteres.` });
    }

    const recommendation = await recommendWorkflow({ task: task.trim() });
    res.json({ recommendation });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
