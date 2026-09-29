"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import Card from "../ui/Card";
import ConfirmModal from "../ui/ConfirmModal";
import Toast from "../ui/Toast";
import SessionCard from "../history/SessionCard";
import CreateProjectModal from "./CreateProjectModal";
import { deleteProject, removeItemFromProject, updateProject } from "../../services/projects.service";
import { getItemTypeMeta } from "../../utils/formatters";

// Tareas que se pueden empezar desde el proyecto: al guardar, el proyecto
// aparece preseleccionado (ver SaveToProjectModal).
const START_ACTIONS = [
  { href: "/idea", emoji: "💡", label: "Idea" },
  { href: "/verification", emoji: "🔍", label: "Verificar" },
  { href: "/documents", emoji: "📄", label: "Analizar documento" },
  { href: "/interview", emoji: "🗣️", label: "Preparar entrevista" },
  { href: "/transcription", emoji: "🎙️", label: "Transcribir entrevista" },
  { href: "/doc-to-note", emoji: "📝", label: "Documento a nota" },
];

function filterKey(item) {
  return item.type === "article" ? `article:${item.article_type || "news_article"}` : item.type;
}

export default function ProjectDetail({ project: initialProject }) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [items, setItems] = useState(initialProject.items);
  const [filter, setFilter] = useState("all");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const editValues = useMemo(
    () => ({ title: project.title, description: project.description }),
    [project.title, project.description]
  );

  // Un filtro por cada tipo presente en el proyecto, con su cantidad.
  const filters = useMemo(() => {
    const counts = new Map();
    for (const item of items) {
      const key = filterKey(item);
      const current = counts.get(key) || { key, count: 0, meta: getItemTypeMeta(item.type, item.article_type) };
      current.count += 1;
      counts.set(key, current);
    }
    return [...counts.values()];
  }, [items]);

  const visibleItems = filter === "all" ? items : items.filter((item) => filterKey(item) === filter);

  async function handleDelete() {
    await deleteProject(project.id);
    router.push("/projects");
  }

  async function handleEdit({ title, description }) {
    setSaving(true);
    try {
      const updated = await updateProject(project.id, { title, description });
      setProject((current) => ({ ...current, ...updated }));
      setShowEdit(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveItem() {
    const item = itemToRemove;
    await removeItemFromProject({ projectId: project.id, type: item.type, itemId: item.id });
    setItems((current) => current.filter((i) => !(i.type === item.type && i.id === item.id)));
    setItemToRemove(null);
    setToastMessage("Quitado del proyecto. Sigue disponible en tu historial.");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/projects" className="text-sm font-medium text-brand-blue hover:underline">
            ← Proyectos
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-brand-text">📁 {project.title}</h1>
          {project.description && <p className="mt-1 text-sm text-brand-text/70">{project.description}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-2 rounded-brand px-3 py-2 text-sm font-medium text-brand-blue hover:bg-brand-blue/10"
          >
            <Pencil size={16} />
            Editar
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 rounded-brand px-3 py-2 text-sm font-medium text-brand-error hover:bg-brand-error/10"
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      </div>

      <div className="rounded-brand bg-brand-blue/5 p-4">
        <h2 className="mb-3 text-sm font-semibold text-brand-text">➕ Seguir trabajando en este proyecto</h2>
        <div className="flex flex-wrap gap-2">
          {START_ACTIONS.map(({ href, emoji, label }) => (
            <Link
              key={href}
              href={`${href}?project=${project.id}`}
              className="rounded-full border border-brand-border bg-white px-3 py-1.5 text-sm text-brand-text transition-colors hover:border-brand-blue"
            >
              {emoji} {label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-brand-text">
          Elementos guardados <span className="text-sm font-normal text-brand-text/50">({items.length})</span>
        </h2>

        {filters.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo">
            {[{ key: "all", count: items.length, meta: { emoji: "", label: "Todo" } }, ...filters].map(
              ({ key, count, meta }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    filter === key
                      ? "bg-brand-blue text-white"
                      : "border border-brand-border bg-white text-brand-text/70 hover:border-brand-blue"
                  }`}
                >
                  {meta.emoji} {meta.label} · {count}
                </button>
              )
            )}
          </div>
        )}

        {items.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-brand-text/70">
              Aún no has guardado nada en este proyecto. Empieza una tarea desde los botones de arriba y guárdala
              aquí.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleItems.map((item) => (
              <SessionCard
                key={`${item.type}-${item.id}`}
                item={item}
                onRemove={setItemToRemove}
                showProjectLink={false}
              />
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onCreate={handleEdit}
        loading={saving}
        initialValues={editValues}
      />

      <ConfirmModal
        open={!!itemToRemove}
        onClose={() => setItemToRemove(null)}
        onConfirm={handleRemoveItem}
        confirmLabel="Quitar"
        title="Quitar del proyecto"
        description={`¿Quitar "${itemToRemove?.title || ""}" de este proyecto? No se borra: seguirá disponible en tu historial.`}
      />

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Eliminar proyecto"
        description={`¿Seguro que quieres eliminar "${project.title}"? Lo que guardaste en él no se borra: seguirá disponible en tu historial, solo sin proyecto.`}
      />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage("")} />}
    </div>
  );
}
