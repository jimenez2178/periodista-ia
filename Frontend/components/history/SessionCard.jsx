"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "../ui/Card";
import ItemDetail from "./ItemDetail";
import { getItemTypeMeta } from "../../utils/formatters";

export default function SessionCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const meta = getItemTypeMeta(item.type);
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

      <div className="mt-1 flex items-center gap-4">
        {item.detail && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-sm font-medium text-brand-blue hover:underline"
          >
            {expanded ? "Ver menos" : "Ver todo →"}
          </button>
        )}
        {item.project_id && (
          <Link href={`/projects/${item.project_id}`} className="text-sm font-medium text-brand-blue hover:underline">
            Ver proyecto →
          </Link>
        )}
      </div>
    </Card>
  );
}
