const express = require("express");
const multer = require("multer");
const { getUserProfile, updateUserProfile, uploadAvatar } = require("./users.service");

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_AVATAR_BYTES } });
const router = express.Router();

const TEXT_FIELDS = [
  "full_name",
  "country",
  "city",
  "profession_role",
  "workplace",
  "ai_familiarity",
  "time_consuming_task",
  "periodistaia_wishes",
  "help_preference",
];

const ARRAY_FIELDS = ["media_type", "coverage_areas", "content_types", "ai_tools"];

function parseArrayField(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

router.patch("/profile", upload.single("photo"), async (req, res, next) => {
  try {
    const existing = await getUserProfile(req.user.id);
    const fields = {};

    for (const key of TEXT_FIELDS) {
      if (req.body[key] !== undefined) fields[key] = req.body[key] || null;
    }
    for (const key of ARRAY_FIELDS) {
      if (req.body[key] !== undefined) fields[key] = parseArrayField(req.body[key]);
    }

    if (req.file) {
      fields.avatar_url = await uploadAvatar(req.user.id, req.file.buffer, req.file.mimetype);
    }

    if (!existing.onboarding_completed_at) {
      fields.onboarding_completed_at = new Date().toISOString();
    }

    const updated = await updateUserProfile(req.user.id, fields);
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
