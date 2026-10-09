"use client";

import { useEffect, useState } from "react";
import { Share, MoreVertical, PlusSquare, Download } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useInstallApp, closeInstallGuide, promptInstall } from "../../hooks/useInstallApp";

const TABS = [
  { id: "android", label: "Android" },
  { id: "ios", label: "iPhone / iPad" },
];

const STEPS = {
  android: [
    { icon: MoreVertical, text: "Abre PeriodistaIA en Chrome y toca los tres puntos (⋮) arriba a la derecha." },
    { icon: Download, text: "Toca «Agregar a pantalla principal» o «Instalar app»." },
    { icon: PlusSquare, text: "Confirma con «Instalar». El ícono aparecerá junto a tus otras apps." },
  ],
  ios: [
    { icon: Share, text: "Abre PeriodistaIA en Safari y toca el botón Compartir (el cuadro con la flecha hacia arriba)." },
    { icon: PlusSquare, text: "Desliza hacia abajo y toca «Agregar a inicio»." },
    { icon: Download, text: "Toca «Agregar» arriba a la derecha. El ícono aparecerá en tu pantalla de inicio." },
  ],
};

export default function InstallGuideModal() {
  const { platform, canPrompt, guideOpen } = useInstallApp();
  const [tab, setTab] = useState("android");

  // Al abrir, muestra primero las instrucciones del dispositivo detectado.
  useEffect(() => {
    if (guideOpen) setTab(platform === "ios" ? "ios" : "android");
  }, [guideOpen, platform]);

  return (
    <Modal open={guideOpen} onClose={closeInstallGuide} title="Instala PeriodistaIA en tu celular">
      <p className="text-sm text-brand-text/70">
        Tendrás la app en tu pantalla de inicio y abrirá a pantalla completa, sin buscarla en el navegador.
      </p>

      <div className="mt-4 flex gap-2">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`min-h-[44px] flex-1 rounded-brand px-3 text-sm font-medium transition-colors ${
              tab === id ? "bg-brand-blue text-white" : "bg-brand-blue/5 text-brand-text hover:bg-brand-blue/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "android" && canPrompt && (
        <Button variant="secondary" className="mt-4 w-full gap-2 font-bold" onClick={promptInstall}>
          <Download size={18} />
          Instalar ahora
        </Button>
      )}

      <ol className="mt-4 flex flex-col gap-3">
        {STEPS[tab].map(({ icon: Icon, text }, index) => (
          <li key={text} className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-blue">
              {index + 1}
            </span>
            <span className="flex-1 text-sm text-brand-text">{text}</span>
            <Icon size={20} className="mt-0.5 shrink-0 text-brand-blue" />
          </li>
        ))}
      </ol>

      {tab === "ios" && (
        <p className="mt-4 rounded-brand bg-brand-blue/5 p-3 text-xs text-brand-text/70">
          Si no ves «Agregar a inicio», abre esta página en Safari: en otros navegadores puede no aparecer.
        </p>
      )}
    </Modal>
  );
}
