// Los créditos del plan Free se reinician a medianoche UTC.
function getNextDailyResetAt(from = new Date()) {
  const next = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + 1, 0, 0, 0, 0));
  return next.toISOString();
}

function addDays(days, from = new Date()) {
  const next = new Date(from);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}

module.exports = { getNextDailyResetAt, addDays };
