const express = require("express");
const { generateInterviewKit, saveInterview } = require("./interviews.service");
const requireCredits = require("../../middleware/credits");
const { incrementUsedCredits } = require("../credits/credits.service");

const router = express.Router();

const MAX_TOPIC_LENGTH = 500;

router.post("/", requireCredits, async (req, res, next) => {
  try {
    const { interviewee, topic } = req.body;

    if (typeof interviewee !== "string" || interviewee.trim().length === 0) {
      return res.status(400).json({ error: "El campo 'interviewee' es requerido y debe ser texto." });
    }

    if (typeof topic !== "string" || topic.trim().length === 0) {
      return res.status(400).json({ error: "El campo 'topic' es requerido y debe ser texto." });
    }

    if (topic.length > MAX_TOPIC_LENGTH) {
      return res.status(400).json({ error: `El campo 'topic' no puede superar ${MAX_TOPIC_LENGTH} caracteres.` });
    }

    const results = await generateInterviewKit({ interviewee: interviewee.trim(), topic: topic.trim() });
    await incrementUsedCredits(req.credits);

    const interview = await saveInterview({
      userId: req.user.id,
      interviewee: interviewee.trim(),
      topic: topic.trim(),
      results,
    });

    res.json(interview);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
