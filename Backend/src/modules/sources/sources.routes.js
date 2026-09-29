const express = require("express");
const { generateVerification, saveSourceVerification } = require("./sources.service");
const requireCredits = require("../../middleware/credits");
const { incrementUsedCredits } = require("../credits/credits.service");
const { getUserProfile } = require("../users/users.service");

const router = express.Router();

const MAX_CLAIM_LENGTH = 1000;
const MAX_CONTEXT_LENGTH = 1000;

router.post("/", requireCredits, async (req, res, next) => {
  try {
    const { claim, context } = req.body;

    if (typeof claim !== "string" || claim.trim().length === 0) {
      return res.status(400).json({ error: "El campo 'claim' es requerido y debe ser texto." });
    }

    if (claim.length > MAX_CLAIM_LENGTH) {
      return res.status(400).json({ error: `El campo 'claim' no puede superar ${MAX_CLAIM_LENGTH} caracteres.` });
    }

    if (context != null && typeof context !== "string") {
      return res.status(400).json({ error: "El campo 'context' debe ser texto." });
    }
    if (context && context.length > MAX_CONTEXT_LENGTH) {
      return res.status(400).json({ error: `El contexto no puede superar ${MAX_CONTEXT_LENGTH} caracteres.` });
    }

    const profile = await getUserProfile(req.user.id);
    const result = await generateVerification({
      claim: claim.trim(),
      context: (context || "").trim(),
      country: profile.country,
      languageVariant: profile.language_variant,
    });
    await incrementUsedCredits(req.credits);
    const saved = await saveSourceVerification({ userId: req.user.id, claim: claim.trim(), result });

    res.json({ ...result, id: saved.id, claim: saved.claim });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
