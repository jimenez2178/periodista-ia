const { supabaseAuth } = require("../config/supabase");

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Falta el token de autenticación." });
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }

  req.user = data.user;
  req.token = token;
  next();
}

module.exports = requireAuth;
