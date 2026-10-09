"use client";

import { useSyncExternalStore } from "react";

// Estado a nivel de módulo: el navegador dispara "beforeinstallprompt" una sola
// vez, así que se captura aquí para que no se pierda al cambiar de pantalla.
let deferredPrompt = null;
let installed = false;
let guideOpen = false;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installed = true;
    guideOpen = false;
    emit();
  });
}

function getPlatform() {
  const ua = navigator.userAgent;
  // iPadOS se identifica como Mac; se distingue por la pantalla táctil.
  if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    return "ios";
  }
  if (/android/i.test(ua)) return "android";
  return "other";
}

function isStandalone() {
  return (
    installed ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export function openInstallGuide() {
  guideOpen = true;
  emit();
}

export function closeInstallGuide() {
  guideOpen = false;
  emit();
}

// Abre el diálogo nativo de instalación (solo Android/Chrome lo ofrece).
export async function promptInstall() {
  if (!deferredPrompt) return;
  const prompt = deferredPrompt;
  deferredPrompt = null;
  emit();
  prompt.prompt();
  await prompt.userChoice;
}

export function useInstallApp() {
  // En el servidor se asume "ya instalada" para no pintar nada hasta hidratar.
  const standalone = useSyncExternalStore(subscribe, isStandalone, () => true);
  const platform = useSyncExternalStore(subscribe, getPlatform, () => "other");
  const canPrompt = useSyncExternalStore(subscribe, () => deferredPrompt !== null, () => false);
  const open = useSyncExternalStore(subscribe, () => guideOpen, () => false);

  return { standalone, platform, canPrompt, guideOpen: open };
}
