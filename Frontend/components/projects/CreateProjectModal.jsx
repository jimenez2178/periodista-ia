"use client";

import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

// Sirve para crear un proyecto y, con `initialValues`, para editar uno existente.
export default function CreateProjectModal({ open, onClose, onCreate, loading, initialValues }) {
  const isEditing = !!initialValues;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(initialValues?.title || "");
    setDescription(initialValues?.description || "");
    setError("");
  }, [open, initialValues]);

  function handleClose() {
    setTitle("");
    setDescription("");
    setError("");
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setError("");
      await onCreate({ title: title.trim(), description: description.trim() });
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    }
  }

  const submitLabel = isEditing ? "Guardar cambios" : "Crear proyecto";

  return (
    <Modal open={open} onClose={handleClose} title={isEditing ? "Editar proyecto" : "Nuevo proyecto"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="project_title"
          label="Nombre del proyecto"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
          placeholder="Ej: Investigación sobre transporte público"
          autoFocus
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="project_description" className="text-sm font-medium text-brand-text">
            Descripción (opcional)
          </label>
          <textarea
            id="project_description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="¿De qué se trata este proyecto?"
            className="rounded-brand border border-brand-border px-3 py-2.5 text-brand-text outline-none focus:border-brand-blue"
          />
        </div>

        {error && <p className="text-sm text-brand-error">{error}</p>}

        <Button type="submit" disabled={!title.trim() || loading}>
          {loading ? "Guardando..." : submitLabel}
        </Button>
      </form>
    </Modal>
  );
}
