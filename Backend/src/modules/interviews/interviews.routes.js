const express = require("express");
const { generateInterviewKit, saveInterview, INTERVIEW_TYPE_SLUGS } = require("./interviews.service");
const requireCredits = require("../../middleware/credits");
const { incrementUsedCredits } = require("../credits/credits.service");
const { getUserProfile } = require("../users/users.service");

const router = express.Router();

const MAX_INTERVIEWEE_LENGTH = 300;
const MAX_TOPIC_LENGTH = 500;
const MAX_GOAL_LENGTH = 1000;
const DEFAULT_INTERVIEW_TYPE = "a_fondo";

router.post("/", requireCredits, async (req, res, next) => {
  try {
    const { interviewee, topic, goal, interview_type: interviewType, research } = req.body;

    if (typeof interviewee !== "string" || interviewee.trim().length === 0) {
      return res.status(400).json({ error: "El campo 'interviewee' es requerido y debe ser texto." });
    }

    if (interviewee.length > MAX_INTERVIEWEE_LENGTH) {
      return res.status(400).json({ error: `El campo 'interviewee' no puede superar ${MAX_INTERVIEWEE_LENGTH} caracteres.` });
    }

    if (typeof topic !== "string" || topic.trim().length === 0) {
      return res.status(400).json({ error: "El campo 'topic' es requerido y debe ser texto." });
    }

    if (topic.length > MAX_TOPIC_LENGTH) {
      return res.status(400).json({ error: `El campo 'topic' no puede superar ${MAX_TOPIC_LENGTH} caracteres.` });
    }

    if (goal != null && (typeof goal !== "string" || goal.length > MAX_GOAL_LENGTH)) {
      return res.status(400).json({ error: `El objetivo debe ser texto de hasta ${MAX_GOAL_LENGTH} caracteres.` });
    }

    if (interviewType != null && !INTERVIEW_TYPE_SLUGS.includes(interviewType)) {
      return res.status(400).json({ error: "Tipo de entrevista no válido." });
    }

    const profile = research ? await getUserProfile(req.user.id) : null;
    const results = await generateInterviewKit({
      interviewee: interviewee.trim(),
      topic: topic.trim(),
      goal: (goal || "").trim(),
      interviewType: interviewType || DEFAULT_INTERVIEW_TYPE,
      research: research === true,
      country: profile?.country,
    });
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
