const { supabaseAdmin } = require("../../config/supabase");
const { getNextDailyResetAt, addDays } = require("../../utils/dateHelpers");
const { getUserProfile, updateUserProfile } = require("../users/users.service");

const FREE_PLAN_DAILY_CREDITS = 5;
// Margen despues de plan_expires_at antes de bajar a Gratis: un cobro de
// PayPal puede llegar con retraso o tras un reintento.
const PRO_EXPIRY_GRACE_DAYS = 3;

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

// Baja al usuario a Gratis en las dos tablas a la vez (users muestra el plan,
// credits es el que da o quita acceso), con los creditos diarios de siempre.
async function downgradeToFree(userId, { subscriptionStatus } = {}) {
  const profileFields = { plan: "free" };
  if (subscriptionStatus) profileFields.subscription_status = subscriptionStatus;
  await updateUserProfile(userId, profileFields);

  const { error } = await supabaseAdmin
    .from("credits")
    .update({
      plan: "free",
      total_credits: FREE_PLAN_DAILY_CREDITS,
      used_credits: 0,
      reset_at: getNextDailyResetAt(),
    })
    .eq("user_id", userId);

  if (error) throw error;
}

// Red de seguridad por si se pierde un aviso de PayPal: si un Pro lleva mas de
// PRO_EXPIRY_GRACE_DAYS vencido, pasa a Gratis. Solo mira users.plan === "pro"
// con fecha; cuentas sin fecha o con users.plan "free" no se tocan.
async function enforcePlanExpiry(userId) {
  try {
    const profile = await getUserProfile(userId);
    if (profile.plan !== "pro" || !profile.plan_expires_at) return;

    const deadline = new Date(addDays(PRO_EXPIRY_GRACE_DAYS, new Date(profile.plan_expires_at)));
    if (new Date() <= deadline) return;

    await downgradeToFree(userId, {
      subscriptionStatus: profile.paypal_subscription_id ? "expired" : undefined,
    });
    console.log(`[credits] Plan Pro vencido el ${profile.plan_expires_at}; usuario ${userId} pasa a Gratis.`);
  } catch (err) {
    // Si falla la revision no bloqueamos al usuario: se reintenta en el proximo uso.
    console.error("[credits] Error revisando el vencimiento del plan:", err);
  }
}

async function getCreditsForUser(userId) {
  await enforcePlanExpiry(userId);

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

async function upgradeCreditsToPro(userId) {
  const { data, error } = await supabaseAdmin
    .from("credits")
    .update({ plan: "pro", total_credits: 999, used_credits: 0 })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
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
  upgradeCreditsToPro,
  downgradeToFree,
  FREE_PLAN_DAILY_CREDITS,
};
