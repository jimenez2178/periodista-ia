const express = require("express");
const requireAuth = require("../../middleware/auth");
const authService = require("./auth.service");
const { getUserProfile } = require("../users/users.service");

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_REGEX.test(email);
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;
}

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, full_name, country } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Email inválido." });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` });
    }

    const result = await authService.register(email, password, full_name, country);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || typeof password !== "string" || password.length === 0) {
      return res.status(400).json({ error: "Email y contraseña son requeridos." });
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/logout", requireAuth, async (req, res, next) => {
  try {
    await authService.logout(req.token);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Email inválido." });
    }

    await authService.forgotPassword(email);
    res.json({ message: "Si el email existe, se envió un enlace de recuperación." });
  } catch (err) {
    next(err);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const { access_token, new_password } = req.body;

    if (typeof access_token !== "string" || !access_token) {
      return res.status(400).json({ error: "Falta el token de recuperación." });
    }
    if (!isValidPassword(new_password)) {
      return res.status(400).json({ error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` });
    }

    const user = await authService.resetPassword(access_token, new_password);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const profile = await getUserProfile(req.user.id);
    res.json({ user: { ...req.user, ...profile } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
