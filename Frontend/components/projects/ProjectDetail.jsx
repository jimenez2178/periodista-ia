"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Card from "../ui/Card";
import ConfirmModal from "../ui/ConfirmModal";
import SessionCard from "../history/SessionCard";
import { deleteProject } from "../../services/projects.service";

export default function ProjectDetail({ project }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    await deleteProject(project.id);
    router.push("/projects");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">{project.title}</h1>
          {project.description && <p className="mt-1 text-sm text-brand-text/70">{project.description}</p>}
        </div>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="flex shrink-0 items-center gap-2 rounded-brand px-3 py-2 text-sm font-medium text-brand-error hover:bg-brand-error/10"
        >
          <Trash2 size={16} />
          Eliminar proyecto
        </button>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-brand-text">Elementos guardados</h2>

        {project.items.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-brand-text/70">
              Aún no has guardado nada en este proyecto. Genera una nota, verifica una fuente o crea un plan de
              investigación y guárdalo aquí.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {project.items.map((item) => (
              <SessionCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Eliminar proyecto"
        description={`¿Seguro que quieres eliminar "${project.title}"? Las notas, verificaciones e ideas guardadas no se borrarán, solo quedarán sin proyecto.`}
      />
    </div>
  );
}
