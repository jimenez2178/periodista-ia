"use client";

import { useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";
import ProjectCard from "../../../components/projects/ProjectCard";
import CreateProjectModal from "../../../components/projects/CreateProjectModal";
import { listProjects, createProject } from "../../../services/projects.service";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  function loadProjects() {
    setLoading(true);
    setError("");
    listProjects()
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleCreate({ title, description }) {
    setCreating(true);
    try {
      const project = await createProject({ title, description });
      setProjects((prev) => [{ ...project, item_count: 0 }, ...prev]);
      setShowCreateModal(false);
    } finally {
      setCreating(false);
    }
  }

  function handleDeleted(projectId) {
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">📁 Proyectos</h1>
          <p className="mt-1 text-sm text-brand-text/70">Organiza tus notas, verificaciones e ideas por historia.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>+ Nuevo proyecto</Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">Cargando tus proyectos...</span>
        </div>
      )}

      {error && !loading && <p className="text-sm text-brand-error">{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <Card>
          <p className="text-center text-sm text-brand-text/70">
            Aún no tienes proyectos. Crea uno para empezar a organizar tu trabajo.
          </p>
        </Card>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onDeleted={handleDeleted} />
          ))}
        </div>
      )}

      <CreateProjectModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        loading={creating}
      />
    </div>
  );
}
