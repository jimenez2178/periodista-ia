import Card from "../ui/Card";

export default function InterviewAnalysis({ analysis }) {
  const { participants, top_quotes: topQuotes, main_topics: mainTopics, suggested_angle: suggestedAngle } = analysis;

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-brand-text">Análisis de tu entrevista</h2>

      <details open className="rounded-brand border border-brand-border bg-white p-4">
        <summary className="cursor-pointer text-base font-semibold text-brand-text">👥 Participantes</summary>
        {participants.length === 0 ? (
          <p className="mt-3 text-sm text-brand-text/70">No se identificaron participantes.</p>
        ) : (
          <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-sm text-brand-text/80">
            {participants.map((person, index) => (
              <li key={index}>
                {person.name} — {person.role}
              </li>
            ))}
          </ul>
        )}
      </details>

      <details open className="rounded-brand border border-brand-border bg-white p-4">
        <summary className="cursor-pointer text-base font-semibold text-brand-text">
          💬 Citas más noticiosas
        </summary>
        {topQuotes.length === 0 ? (
          <p className="mt-3 text-sm text-brand-text/70">No se encontraron citas destacables.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {topQuotes.map((item, index) => (
              <div key={index} className="border-l-2 border-brand-blue/30 pl-3">
                <p className="text-sm italic text-brand-text">"{item.quote}"</p>
                <p className="mt-1 text-xs font-medium text-brand-text/60">— {item.speaker}</p>
                <p className="mt-1 text-sm text-brand-text/70">{item.why_newsworthy}</p>
              </div>
            ))}
          </div>
        )}
      </details>

      <details open className="rounded-brand border border-brand-border bg-white p-4">
        <summary className="cursor-pointer text-base font-semibold text-brand-text">🧠 Temas principales</summary>
        {mainTopics.length === 0 ? (
          <p className="mt-3 text-sm text-brand-text/70">No se identificaron temas.</p>
        ) : (
          <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-sm text-brand-text/80">
            {mainTopics.map((topic, index) => (
              <li key={index}>{topic}</li>
            ))}
          </ul>
        )}
      </details>

      <div className="rounded-brand border border-brand-yellow bg-brand-yellow/10 p-4">
        <h3 className="mb-2 font-semibold text-brand-text">🎯 Ángulo sugerido</h3>
        <p className="text-sm text-brand-text/80">{suggestedAngle}</p>
      </div>

      <p className="text-xs text-brand-text/50">
        Los nombres y roles se infieren del texto de la transcripción y pueden no ser exactos.
      </p>
    </Card>
  );
}
