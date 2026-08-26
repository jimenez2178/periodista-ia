const { supabaseAdmin } = require("../../config/supabase");
const { getNextDailyResetAt } = require("../../utils/dateHelpers");

const FREE_PLAN_DAILY_CREDITS = 5;

async function initializeFreeCredits(userId) {
  const { data, error } = await supabaseAdmin
    .from("credits")
    .insert({
      user_id: userId,
      plan: "free",
      total_credits: FREE_PLAN_DAILY_CREDITS,
      used_credits: 0,
      reset_at: getNextDailyResetAt(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getCreditsForUser(userId) {
  const { data, error } = await supabaseAdmin
    .from("credits")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;

  // Reset perezoso: todavía no hay un cron que reinicie los créditos
  // diarios, así que lo hacemos al leer si ya venció reset_at.
  if (new Date(data.reset_at) <= new Date()) {
    const { data: reset, error: resetError } = await supabaseAdmin
      .from("credits")
      .update({ used_credits: 0, reset_at: getNextDailyResetAt() })
      .eq("id", data.id)
      .select()
      .single();

    if (resetError) throw resetError;
    return reset;
  }

  return data;
}

async function incrementUsedCredits(creditsRow) {
  const { data, error } = await supabaseAdmin
    .from("credits")
    .update({ used_credits: creditsRow.used_credits + 1 })
    .eq("id", creditsRow.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  initializeFreeCredits,
  getCreditsForUser,
  incrementUsedCredits,
  FREE_PLAN_DAILY_CREDITS,
};
