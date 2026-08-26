const { supabaseAdmin, supabaseAuth } = require("../../config/supabase");
const env = require("../../config/env");
const { createUserProfile } = require("../users/users.service");
const { initializeFreeCredits } = require("../credits/credits.service");

async function register(email, password, full_name) {
  const { data, error } = await supabaseAuth.auth.signUp({ email, password });
  if (error) throw error;

  const user = data.user;

  try {
    await createUserProfile({ id: user.id, email: user.email, full_name });
    await initializeFreeCredits(user.id);
  } catch (profileError) {
    // El usuario ya existe en auth.users pero no tiene perfil: revertimos
    // para no dejar una cuenta huérfana sin fila en public.users/credits.
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    throw profileError;
  }

  return { user, session: data.session };
}

async function login(email, password) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { user: data.user, session: data.session };
}

async function logout(accessToken) {
  const { error } = await supabaseAdmin.auth.admin.signOut(accessToken, "global");
  if (error) throw error;
}

async function forgotPassword(email) {
  const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
    redirectTo: env.frontendUrl,
  });
  if (error) throw error;
}

async function resetPassword(accessToken, newPassword) {
  const { data: userData, error: getUserError } = await supabaseAuth.auth.getUser(accessToken);
  if (getUserError) throw getUserError;

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userData.user.id, {
    password: newPassword,
  });
  if (error) throw error;

  return data.user;
}

module.exports = { register, login, logout, forgotPassword, resetPassword };
