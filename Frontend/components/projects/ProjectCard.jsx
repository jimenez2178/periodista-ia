"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import Card from "../ui/Card";
import ConfirmModal from "../ui/ConfirmModal";
import { deleteProject } from "../../services/projects.service";

export default function ProjectCard({ project, onDeleted }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const createdAt = new Date(project.created_at).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  async function handleDelete() {
    await deleteProject(project.id);
    setShowConfirm(false);
    onDeleted?.(project.id);
  }

  return (
    <>
      <Link href={`/projects/${project.id}`} className="block h-full">
        <Card variant="elevated" className="relative flex h-full flex-col gap-2 transition-shadow hover:shadow-lg">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowConfirm(true);
            }}
            aria-label="Eliminar proyecto"
            className="absolute right-3 top-3 text-brand-text/40 hover:text-brand-error"
          >
            <Trash2 size={18} />
          </button>

          <h2 className="pr-6 text-lg font-bold text-brand-text">{project.title}</h2>
          {project.description && (
            <p className="line-clamp-2 flex-1 text-sm text-brand-text/70">{project.description}</p>
          )}
          <div className="mt-2 flex items-center justify-between text-xs text-brand-text/50">
            <span>{project.item_count === 1 ? "1 elemento" : `${project.item_count} elementos`}</span>
            <span>{createdAt}</span>
          </div>
        </Card>
      </Link>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Eliminar proyecto"
        description={`¿Seguro que quieres eliminar "${project.title}"? Las notas, verificaciones e ideas guardadas no se borrarán, solo quedarán sin proyecto.`}
      />
    </>
  );
}
