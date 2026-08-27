import Link from "next/link";
import Card from "../ui/Card";
import { getItemTypeMeta } from "../../utils/formatters";

export default function SessionCard({ item }) {
  const meta = getItemTypeMeta(item.type);
  const createdAt = new Date(item.created_at).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span>{meta.emoji}</span>
        <span className="text-xs font-medium uppercase tracking-wide text-brand-text/50">{meta.label}</span>
        <span className="ml-auto text-xs text-brand-text/50">{createdAt}</span>
      </div>
      <h3 className="font-medium text-brand-text">{item.title}</h3>
      {item.subtitle && <p className="text-sm text-brand-text/70">{item.subtitle}</p>}
      {item.project_id && (
        <Link
          href={`/projects/${item.project_id}`}
          className="mt-1 w-fit rounded-brand bg-brand-yellow/20 px-2 py-1 text-xs font-medium text-brand-blue hover:bg-brand-yellow/30"
        >
          Ver proyecto →
        </Link>
      )}
    </Card>
  );
}
