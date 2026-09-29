"use client";

import Modal from "./Modal";
import Button from "./Button";

export default function UnsavedWarningModal({ open, onClose, onSave, onDiscard }) {
  return (
    <Modal open={open} onClose={onClose} title="¿Guardar antes de salir?">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-brand-text/70">
          Tienes resultados que aún no guardaste en un proyecto. Guárdalos para poder volver a ellos cuando quieras
          sin repetir el trabajo.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button onClick={onSave} className="w-full sm:w-auto">
            💾 Guardar y continuar
          </Button>
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Quedarme aquí
          </Button>
          <Button variant="secondary" onClick={onDiscard} className="w-full sm:w-auto">
            Salir sin guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
