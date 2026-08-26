const { getCreditsForUser } = require("../modules/credits/credits.service");

async function requireCredits(req, res, next) {
  try {
    const credits = await getCreditsForUser(req.user.id);
    const available = credits.total_credits - credits.used_credits;

    if (available <= 0) {
      return res.status(402).json({
        error: "No te quedan créditos disponibles hoy. Actualiza tu plan para seguir usando PeriodistaIA.",
        code: "NO_CREDITS",
      });
    }

    req.credits = credits;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requireCredits;
