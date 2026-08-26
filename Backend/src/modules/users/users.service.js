const { supabaseAdmin } = require("../../config/supabase");

async function createUserProfile({ id, email, full_name }) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({ id, email, full_name: full_name || null })
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = { createUserProfile };
