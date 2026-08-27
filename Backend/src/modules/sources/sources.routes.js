const express = require("express");
const { generateVerification, saveSourceVerification } = require("./sources.service");
const requireCredits = require("../../middleware/credits");
const { incrementUsedCredits } = require("../credits/credits.service");

const router = express.Router();

const MAX_CLAIM_LENGTH = 1000;

router.post("/", requireCredits, async (req, res, next) => {
  try {
    const { claim } = req.body;

    if (typeof claim !== "string" || claim.trim().length === 0) {
      return res.status(400).json({ error: "El campo 'claim' es requerido y debe ser texto." });
    }

    if (claim.length > MAX_CLAIM_LENGTH) {
      return res.status(400).json({ error: `El campo 'claim' no puede superar ${MAX_CLAIM_LENGTH} caracteres.` });
    }

    const result = await generateVerification(claim.trim());
    await incrementUsedCredits(req.credits);
    const saved = await saveSourceVerification({ userId: req.user.id, claim: claim.trim(), result });

    res.json({ ...result, id: saved.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
