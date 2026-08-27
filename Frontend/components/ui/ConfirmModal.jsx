"use client";

import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmModal({ open, onClose, onConfirm, title, description, confirmLabel = "Eliminar" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        {description && <p className="text-sm text-brand-text/70">{description}</p>}
        {error && <p className="text-sm text-brand-error">{error}</p>}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={loading} className="w-full sm:w-auto">
            {loading ? "Eliminando..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
