"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";
import ActivityCard from "../../../components/history/ActivityCard";
import { listHistory } from "../../../services/history.service";

const FEATURES = [
  {
    href: "/transcription",
    emoji: "🎙️",
    title: "De entrevista a noticia",
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
  {
    href: "/documents",
    emoji: "📄",
    title: "Analizar documento",
    description: "Sube un PDF, Word o Excel y obtén hallazgos periodísticos clave",
  },
  {
    href: "/interview",
    emoji: "🎙️",
    title: "Preparar entrevista",
    description: "Recibe un kit completo de preguntas antes de tu próxima entrevista",
  },
  {
    href: "/tools",
    emoji: "🧭",
    title: "¿Qué herramienta necesito?",
    description: "Describe tu tarea y recibe una recomendación de flujo de trabajo",
  },
];

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listHistory()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const recentItems = items.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-text">Actividad reciente</h2>
          {!loading && recentItems.length > 0 && (
            <Link href="/history" className="text-sm font-medium text-brand-blue hover:underline">
              Ver todo →
            </Link>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Spinner />
          </div>
        )}

        {!loading && recentItems.length === 0 && (
          <Card>
            <p className="text-center text-sm text-brand-text/70">
              Aún no tienes actividad. ¡Empieza usando una función!
            </p>
          </Card>
        )}

        {!loading && recentItems.length > 0 && (
          <div className="flex flex-col gap-3">
            {recentItems.map((item) => (
              <ActivityCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
