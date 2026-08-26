import Link from "next/link";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

const FEATURES = [
  {
    href: "/transcription",
    emoji: "🎙️",
    title: "Audio a Nota",
    description: "Transcribe tu entrevista y genera tu nota en segundos",
  },
  {
    href: "/idea",
    emoji: "💡",
    title: "Tengo una idea",
    description: "Convierte una observación en un plan de investigación completo",
  },
  {
    href: "/verification",
    emoji: "🔍",
    title: "Verificar fuentes",
    description: "Confirma si una afirmación tiene respaldo real",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.href} variant="elevated" className="flex flex-col gap-3">
            <span className="text-3xl">{feature.emoji}</span>
            <h2 className="text-lg font-bold text-brand-text">{feature.title}</h2>
            <p className="flex-1 text-sm text-brand-text/70">{feature.description}</p>
            <Link href={feature.href}>
              <Button className="w-full">Empezar →</Button>
            </Link>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-brand-text">Actividad reciente</h2>
        <Card>
          <p className="text-center text-sm text-brand-text/70">
            Aún no tienes actividad. ¡Empieza usando una función!
          </p>
        </Card>
      </div>
    </div>
  );
}
