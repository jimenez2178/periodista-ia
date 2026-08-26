const { supabaseAdmin } = require("../../config/supabase");

async function createUserProfile({ id, email, full_name, country }) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({ id, email, full_name: full_name || null, country: country || null })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getUserProfile(id) {
  const { data, error } = await supabaseAdmin.from("users").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

module.exports = { createUserProfile, getUserProfile };
