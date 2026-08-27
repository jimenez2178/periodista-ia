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

async function getUserByEmail(email) {
  const { data, error } = await supabaseAdmin.from("users").select("*").eq("email", email).maybeSingle();
  if (error) throw error;
  return data;
}

async function updateUserProfile(id, fields) {
  const { data, error } = await supabaseAdmin.from("users").update(fields).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

async function uploadAvatar(userId, buffer, mimeType) {
  const extension = mimeType.split("/")[1] || "jpg";
  const path = `${userId}.${extension}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("avatars")
    .upload(path, buffer, { contentType: mimeType, upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabaseAdmin.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

module.exports = { createUserProfile, getUserProfile, getUserByEmail, updateUserProfile, uploadAvatar };
