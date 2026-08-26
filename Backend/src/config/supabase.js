const { createClient } = require("@supabase/supabase-js");
const env = require("./env");

const clientOptions = {
  auth: { autoRefreshToken: false, persistSession: false },
};

// service_role: bypassa RLS. Solo para operaciones admin del backend
// (crear/borrar perfiles, revocar tokens, resetear contraseñas por ID).
const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, clientOptions);

// anon: respeta RLS. Para las operaciones de Auth que Supabase espera
// del lado del usuario (signUp, signIn, validar tokens, reset de password).
const supabaseAuth = createClient(env.supabaseUrl, env.supabaseAnonKey, clientOptions);

module.exports = { supabaseAdmin, supabaseAuth };
