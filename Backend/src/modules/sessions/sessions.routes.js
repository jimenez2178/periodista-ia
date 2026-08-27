const express = require("express");
const { createIdeaSession } = require("./sessions.service");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { idea, plan, project_id } = req.body;

    if (typeof idea !== "string" || !idea.trim()) {
      return res.status(400).json({ error: "Falta 'idea'." });
    }
    if (!plan || typeof plan !== "object") {
      return res.status(400).json({ error: "Falta 'plan'." });
    }

    const session = await createIdeaSession({
      userId: req.user.id,
      projectId: project_id || null,
      idea: idea.trim(),
      plan,
    });

    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
