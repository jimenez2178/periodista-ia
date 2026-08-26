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
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-brand-yellow shadow-lg transition-colors hover:bg-brand-blue/90"
      >
        <MessageCircle size={26} />
      </button>
      <AssistantModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
