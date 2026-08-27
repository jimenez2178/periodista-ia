import Card from "../ui/Card";
import SessionCard from "../history/SessionCard";

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
            {project.items.map((item) => (
              <SessionCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
