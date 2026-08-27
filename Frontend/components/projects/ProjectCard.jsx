import Link from "next/link";
import Card from "../ui/Card";

export default function ProjectCard({ project }) {
  const createdAt = new Date(project.created_at).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link href={`/projects/${project.id}`}>
      <Card variant="elevated" className="flex h-full flex-col gap-2 transition-shadow hover:shadow-lg">
        <h2 className="text-lg font-bold text-brand-text">{project.title}</h2>
        {project.description && (
          <p className="line-clamp-2 flex-1 text-sm text-brand-text/70">{project.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between text-xs text-brand-text/50">
          <span>{project.item_count === 1 ? "1 elemento" : `${project.item_count} elementos`}</span>
          <span>{createdAt}</span>
        </div>
      </Card>
    </Link>
  );
}
