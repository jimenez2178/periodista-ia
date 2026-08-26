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

module.exports = { initializeFreeCredits, FREE_PLAN_DAILY_CREDITS };
