const express = require("express");
const { listProjectsForUser, createProject, getProjectWithItems, attachItemToProject } = require("./projects.service");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const projects = await listProjectsForUser(req.user.id);
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "El campo 'title' es requerido." });
    }

    const project = await createProject({ userId: req.user.id, title: title.trim(), description });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const project = await getProjectWithItems({ projectId: req.params.id, userId: req.user.id });
    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado." });
    }
    res.json(project);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/items", async (req, res, next) => {
  try {
    const { type, item_id } = req.body;

    if (typeof type !== "string" || typeof item_id !== "string" || !item_id) {
      return res.status(400).json({ error: "Faltan 'type' e 'item_id'." });
    }

    const item = await attachItemToProject({
      userId: req.user.id,
      projectId: req.params.id,
      type,
      itemId: item_id,
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
