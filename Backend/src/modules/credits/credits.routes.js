const express = require("express");
const { getCreditsForUser } = require("./credits.service");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const credits = await getCreditsForUser(req.user.id);
    res.json({
      plan: credits.plan,
      total_credits: credits.total_credits,
      used_credits: credits.used_credits,
      available: Math.max(credits.total_credits - credits.used_credits, 0),
      reset_at: credits.reset_at,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
