const express = require("express");
const { generateInvestigationPlan } = require("./ideas.service");
const requireCredits = require("../../middleware/credits");
const { incrementUsedCredits } = require("../credits/credits.service");

const router = express.Router();

const MAX_IDEA_LENGTH = 2000;

router.post("/", requireCredits, async (req, res, next) => {
  try {
    const { idea } = req.body;

    if (typeof idea !== "string" || idea.trim().length === 0) {
      return res.status(400).json({ error: "El campo 'idea' es requerido y debe ser texto." });
    }

    if (idea.length > MAX_IDEA_LENGTH) {
      return res.status(400).json({ error: `El campo 'idea' no puede superar ${MAX_IDEA_LENGTH} caracteres.` });
    }

    const plan = await generateInvestigationPlan(idea.trim());
    await incrementUsedCredits(req.credits);
    res.json(plan);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
