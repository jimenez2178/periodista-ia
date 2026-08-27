"use client";

import { useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

export default function CreateProjectModal({ open, onClose, onCreate, loading }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

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

  return (
    <Modal open={open} onClose={handleClose} title="Nuevo proyecto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="project_title"
          label="Nombre del proyecto"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
            rows={3}
            placeholder="¿De qué se trata este proyecto?"
            className="rounded-brand border border-brand-border px-3 py-2.5 text-brand-text outline-none focus:border-brand-blue"
          />
        </div>

        {error && <p className="text-sm text-brand-error">{error}</p>}

        <Button type="submit" disabled={!title.trim() || loading}>
          {loading ? "Creando..." : "Crear proyecto"}
        </Button>
      </form>
    </Modal>
  );
}
