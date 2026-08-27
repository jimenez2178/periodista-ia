import Card from "../ui/Card";
import { getItemTypeMeta } from "../../utils/formatters";

export default function ProjectDetail({ project }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">{project.title}</h1>
        {project.description && <p className="mt-1 text-sm text-brand-text/70">{project.description}</p>}
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
            {project.items.map((item) => {
              const meta = getItemTypeMeta(item.type);
              return (
                <Card key={`${item.type}-${item.id}`} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span>{meta.emoji}</span>
                    <span className="text-xs font-medium uppercase tracking-wide text-brand-text/50">
                      {meta.label}
                    </span>
                    <span className="ml-auto text-xs text-brand-text/50">
                      {new Date(item.created_at).toLocaleDateString("es", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="font-medium text-brand-text">{item.title}</h3>
                  {item.subtitle && <p className="text-sm text-brand-text/70">{item.subtitle}</p>}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
