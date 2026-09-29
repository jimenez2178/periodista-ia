const express = require("express");
const {
  listProjectsForUser,
  createProject,
  getProjectWithItems,
  updateProject,
  attachItemToProject,
  detachItemFromProject,
  deleteProject,
} = require("./projects.service");

const router = express.Router();

const MAX_TITLE_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 1000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

router.patch("/:id", async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (typeof title !== "string" || !title.trim() || title.length > MAX_TITLE_LENGTH) {
      return res.status(400).json({ error: `El nombre es requerido (máximo ${MAX_TITLE_LENGTH} caracteres).` });
    }
    if (description != null && (typeof description !== "string" || description.length > MAX_DESCRIPTION_LENGTH)) {
      return res.status(400).json({ error: `La descripción no puede superar ${MAX_DESCRIPTION_LENGTH} caracteres.` });
    }
    if (!UUID_PATTERN.test(req.params.id)) {
      return res.status(404).json({ error: "Proyecto no encontrado." });
    }

    const project = await updateProject({
      userId: req.user.id,
      projectId: req.params.id,
      title: title.trim(),
      description: (description || "").trim(),
    });
    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado." });
    }
    res.json(project);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/items", async (req, res, next) => {
  try {
    const { type, item_id: itemId } = req.body;

    if (typeof type !== "string" || typeof itemId !== "string" || !UUID_PATTERN.test(itemId)) {
      return res.status(400).json({ error: "Faltan 'type' e 'item_id'." });
    }
    if (!UUID_PATTERN.test(req.params.id)) {
      return res.status(404).json({ error: "Proyecto no encontrado." });
    }

    const detached = await detachItemFromProject({
      userId: req.user.id,
      projectId: req.params.id,
      type,
      itemId,
    });
    if (!detached) {
      return res.status(404).json({ error: "Ese elemento no está en este proyecto." });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await deleteProject({ userId: req.user.id, projectId: req.params.id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
