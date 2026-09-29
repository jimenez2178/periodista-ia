"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "../ui/Card";
import ItemDetail from "./ItemDetail";
import { getItemTypeMeta, getReopenHref } from "../../utils/formatters";

// `onRemove`: solo dentro de un proyecto, para quitar el elemento de él.
// `showProjectLink`: en el historial, enlace al proyecto donde está guardado.
export default function SessionCard({ item, onRemove, showProjectLink = true }) {
  const [expanded, setExpanded] = useState(false);
  const meta = getItemTypeMeta(item.type, item.article_type);
  const reopenHref = getReopenHref(item);
  const createdAt = new Date(item.created_at).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span>{meta.emoji}</span>
        <span className="text-xs font-medium uppercase tracking-wide text-brand-text/50">{meta.label}</span>
        <span className="ml-auto text-xs text-brand-text/50">{createdAt}</span>
      </div>

      <h3 className="font-medium text-brand-text">{item.title}</h3>
      {!expanded && item.subtitle && <p className="text-sm text-brand-text/70">{item.subtitle}</p>}

      {expanded && (
        <div className="mt-1">
          <ItemDetail item={item} />
        </div>
      )}

      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
        {reopenHref && (
          <Link href={reopenHref} className="text-sm font-semibold text-brand-blue hover:underline">
            Abrir y continuar →
          </Link>
        )}
        {item.detail && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-sm font-medium text-brand-blue hover:underline"
          >
            {expanded ? "Ver menos" : item.type === "article" ? "Ver y editar" : "Ver todo"}
          </button>
        )}
        {showProjectLink && item.project_id && (
          <Link href={`/projects/${item.project_id}`} className="text-sm font-medium text-brand-blue hover:underline">
            Ver proyecto →
          </Link>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="ml-auto text-sm font-medium text-brand-text/50 hover:text-brand-error"
          >
            Quitar del proyecto
          </button>
        )}
      </div>
    </Card>
  );
}
