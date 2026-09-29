const express = require("express");
const {
  DRAFT_KINDS,
  DRAFT_KIND_SLUGS,
  generateInvestigationPlan,
  refineInvestigationPlan,
  generateIdeaDraft,
} = require("./ideas.service");
const { createIdeaSession, getIdeaSession, updateIdeaPlan } = require("../sessions/sessions.service");
const { saveArticle } = require("../articles/articles.service");
const { getUserProfile } = require("../users/users.service");
const requireCredits = require("../../middleware/credits");
const { incrementUsedCredits } = require("../credits/credits.service");

const router = express.Router();

const MAX_IDEA_LENGTH = 2000;
const MAX_INSTRUCTION_LENGTH = 1000;
const MAX_ANGLE_LENGTH = 500;
const MAX_REPORTING_LENGTH = 15000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function optionalText(value, maxLength) {
  if (value == null) return { value: "" };
  if (typeof value !== "string" || value.length > maxLength) return { error: true };
  return { value: value.trim() };
}

async function loadSession(req, res) {
  if (!UUID_PATTERN.test(req.params.id)) {
    res.status(404).json({ error: "No se encontró la idea." });
    return null;
  }
  const session = await getIdeaSession({ userId: req.user.id, sessionId: req.params.id });
  if (!session) {
    res.status(404).json({ error: "No se encontró la idea." });
    return null;
  }
  return session;
}

// Genera el plan y guarda la idea de inmediato: queda en el historial aunque el
// periodista no la guarde en un proyecto.
router.post("/", requireCredits, async (req, res, next) => {
  try {
    const { idea } = req.body;

    if (typeof idea !== "string" || idea.trim().length === 0) {
      return res.status(400).json({ error: "El campo 'idea' es requerido y debe ser texto." });
    }

    if (idea.length > MAX_IDEA_LENGTH) {
      return res.status(400).json({ error: `El campo 'idea' no puede superar ${MAX_IDEA_LENGTH} caracteres.` });
    }

    const profile = await getUserProfile(req.user.id);
    const plan = await generateInvestigationPlan({ idea: idea.trim(), profile });
    await incrementUsedCredits(req.credits);

    const session = await createIdeaSession({ userId: req.user.id, idea: idea.trim(), plan });
    res.json({ session_id: session.id, plan });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/refine", requireCredits, async (req, res, next) => {
  try {
    const instruction = optionalText(req.body.instruction, MAX_INSTRUCTION_LENGTH);
    const angle = optionalText(req.body.angle, MAX_ANGLE_LENGTH);
    if (instruction.error || angle.error) {
      return res.status(400).json({ error: "El ajuste o el ángulo no son válidos." });
    }
    if (!instruction.value && !angle.value) {
      return res.status(400).json({ error: "Elige un ángulo o escribe qué quieres ajustar." });
    }

    const session = await loadSession(req, res);
    if (!session) return;

    const profile = await getUserProfile(req.user.id);
    const plan = await refineInvestigationPlan({
      idea: session.idea,
      plan: session.plan,
      instruction: instruction.value,
      angle: angle.value,
      profile,
    });
    await incrementUsedCredits(req.credits);

    await updateIdeaPlan({ sessionId: session.id, planMessageId: session.planMessageId, plan });
    res.json({ session_id: session.id, plan });
  } catch (err) {
    next(err);
  }
});

// Marcar pasos como hechos: no usa IA ni créditos.
router.patch("/:id/progress", async (req, res, next) => {
  try {
    const { completed_steps: completedSteps } = req.body;

    if (!Array.isArray(completedSteps) || !completedSteps.every((i) => Number.isInteger(i) && i >= 0 && i < 100)) {
      return res.status(400).json({ error: "'completed_steps' debe ser una lista de índices." });
    }

    const session = await loadSession(req, res);
    if (!session) return;

    const plan = { ...session.plan, completed_steps: [...new Set(completedSteps)].sort((a, b) => a - b) };
    await updateIdeaPlan({ sessionId: session.id, planMessageId: session.planMessageId, plan });
    res.json({ session_id: session.id, plan });
  } catch (err) {
    next(err);
  }
});

// Pitch al editor, esqueleto de nota o nota con los hallazgos del reporteo.
router.post("/:id/draft", requireCredits, async (req, res, next) => {
  try {
    const { kind } = req.body;
    if (!DRAFT_KIND_SLUGS.includes(kind)) {
      return res.status(400).json({ error: "Tipo de texto no válido." });
    }

    const angle = optionalText(req.body.angle, MAX_ANGLE_LENGTH);
    const reporting = optionalText(req.body.reporting, MAX_REPORTING_LENGTH);
    if (angle.error || reporting.error) {
      return res.status(400).json({ error: `El ángulo o los hallazgos no son válidos (máximo ${MAX_REPORTING_LENGTH} caracteres).` });
    }
    if (kind === "reported" && !reporting.value) {
      return res.status(400).json({ error: "Pega los hallazgos de tu reporteo para redactar la nota." });
    }

    const session = await loadSession(req, res);
    if (!session) return;

    const profile = await getUserProfile(req.user.id);
    const draft = await generateIdeaDraft({
      kind,
      idea: session.idea,
      plan: session.plan,
      angle: angle.value,
      reporting: reporting.value,
      profile,
    });
    await incrementUsedCredits(req.credits);

    const saved = await saveArticle({
      userId: req.user.id,
      sessionId: session.id,
      type: DRAFT_KINDS[kind].articleType,
      article: draft,
      language: null,
    });
    res.json(saved);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
