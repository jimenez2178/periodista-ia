"use client";

import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import { listProjects, createProject } from "../../services/projects.service";

export default function SaveToProjectModal({ open, onClose, onConfirm }) {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setError("");
    setLoadingProjects(true);
    listProjects()
      .then((data) => {
        setProjects(data);
        setCreatingNew(data.length === 0);
        setSelectedId(data[0]?.id || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingProjects(false));
  }, [open]);

  function handleClose() {
    setNewTitle("");
    setCreatingNew(false);
    setError("");
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      let projectId = selectedId;

      if (creatingNew) {
        if (!newTitle.trim()) throw new Error("Escribe un nombre para el proyecto.");
        const project = await createProject({ title: newTitle.trim() });
        projectId = project.id;
      }

      if (!projectId) throw new Error("Selecciona o crea un proyecto.");

      await onConfirm(projectId);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Guardar en proyecto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {loadingProjects ? (
          <div className="flex items-center justify-center gap-3 py-4">
            <Spinner />
            <span className="text-sm text-brand-text/70">Cargando tus proyectos...</span>
          </div>
        ) : (
          <>
            {projects.length > 0 && !creatingNew && (
              <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
                {projects.map((project) => (
                  <label
                    key={project.id}
                    className="flex cursor-pointer items-center gap-3 rounded-brand border border-brand-border px-3 py-2.5 has-[:checked]:border-brand-blue"
                  >
                    <input
                      type="radio"
                      name="project"
                      value={project.id}
                      checked={selectedId === project.id}
                      onChange={() => setSelectedId(project.id)}
                    />
                    <span className="text-sm font-medium text-brand-text">{project.title}</span>
                  </label>
                ))}
              </div>
            )}

            {projects.length > 0 && !creatingNew && (
              <button
                type="button"
                onClick={() => setCreatingNew(true)}
                className="text-left text-sm font-medium text-brand-blue hover:underline"
              >
                + Crear un proyecto nuevo
              </button>
            )}

            {creatingNew && (
              <>
                <Input
                  id="new_project_title"
                  label="Nombre del proyecto"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Investigación sobre transporte público"
                  autoFocus
                />
                {projects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCreatingNew(false)}
                    className="text-left text-sm font-medium text-brand-blue hover:underline"
                  >
                    ← Elegir un proyecto existente
                  </button>
                )}
              </>
            )}
          </>
        )}

        {error && <p className="text-sm text-brand-error">{error}</p>}

        <Button type="submit" disabled={saving || loadingProjects}>
          {saving ? "Guardando..." : "Guardar →"}
        </Button>
      </form>
    </Modal>
  );
}
