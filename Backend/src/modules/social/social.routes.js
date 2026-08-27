const express = require("express");
const { generateSocialCopy } = require("./social.service");

const router = express.Router();

const VALID_PLATFORMS = ["instagram", "twitter", "linkedin"];
const VALID_CONTENT_TYPES = ["article", "document_analysis"];

router.post("/", async (req, res, next) => {
  try {
    const { content, platform, content_type } = req.body;

    if (typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "El campo 'content' es requerido y debe ser texto." });
    }

    if (typeof platform !== "string" || !VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({ error: "El campo 'platform' debe ser 'instagram', 'twitter' o 'linkedin'." });
    }

    if (typeof content_type !== "string" || !VALID_CONTENT_TYPES.includes(content_type)) {
      return res.status(400).json({ error: "El campo 'content_type' debe ser 'article' o 'document_analysis'." });
    }

    const copy = await generateSocialCopy({ content: content.trim(), platform, contentType: content_type });
    res.json({ copy });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
