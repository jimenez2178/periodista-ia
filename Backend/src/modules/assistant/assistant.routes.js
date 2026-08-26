const express = require("express");
const { getAssistantReply } = require("./assistant.service");

const router = express.Router();

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 20;

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(
      (item) =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => ({ role: item.role, content: item.content }));
}

router.post("/", async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "El campo 'message' es requerido y debe ser texto." });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `El mensaje no puede superar ${MAX_MESSAGE_LENGTH} caracteres.` });
    }

    const reply = await getAssistantReply(message.trim(), sanitizeHistory(history));
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
