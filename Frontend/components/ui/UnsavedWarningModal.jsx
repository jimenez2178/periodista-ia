"use client";

import Modal from "./Modal";
import Button from "./Button";

export default function UnsavedWarningModal({ open, onClose, onSave, onDiscard }) {
  return (
    <Modal open={open} onClose={onClose} title="¿Salir sin guardar?">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-brand-text/70">
          Tienes resultados sin guardar. Si sales ahora perderás esta información.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" onClick={onDiscard} className="w-full sm:w-auto">
            Salir sin guardar
          </Button>
          <Button onClick={onSave} className="w-full sm:w-auto">
            Guardar en proyecto
          </Button>
        </div>
      </div>
    </Modal>
  );
}
