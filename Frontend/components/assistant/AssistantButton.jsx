"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import AssistantModal from "./AssistantModal";

export default function AssistantButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir asistente"
        className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-1 rounded-2xl bg-brand-blue px-3 py-2 text-brand-yellow shadow-lg transition-colors hover:bg-brand-blue/90"
      >
        <MessageCircle size={26} />
        <span className="text-xs font-medium">Asistente</span>
      </button>
      <AssistantModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
