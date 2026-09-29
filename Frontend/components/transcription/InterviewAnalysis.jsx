import Card from "../ui/Card";

export default function InterviewAnalysis({ analysis, selectedQuotes, onToggleQuote, disabled }) {
  const { participants, top_quotes: topQuotes, main_topics: mainTopics } = analysis;

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
          <>
            <p className="mt-3 text-xs text-brand-text/60">
              Marca las citas que quieres en tu nota. Si no marcas ninguna, la IA elige las más relevantes.
            </p>
            <div className="mt-3 flex flex-col gap-3">
              {topQuotes.map((item, index) => (
                <label
                  key={index}
                  htmlFor={`quote-${index}`}
                  className="flex cursor-pointer gap-3 rounded-brand border border-brand-border p-3 transition-colors hover:border-brand-blue has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue/5"
                >
                  <input
                    id={`quote-${index}`}
                    type="checkbox"
                    checked={selectedQuotes.includes(index)}
                    onChange={() => onToggleQuote(index)}
                    disabled={disabled}
                    className="mt-1 h-4 w-4 shrink-0 accent-brand-blue"
                  />
                  <div>
                    <p className="text-sm italic text-brand-text">"{item.quote}"</p>
                    <p className="mt-1 text-xs font-medium text-brand-text/60">— {item.speaker}</p>
                    <p className="mt-1 text-sm text-brand-text/70">{item.why_newsworthy}</p>
                  </div>
                </label>
              ))}
            </div>
          </>
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

      <p className="text-xs text-brand-text/50">
        Los nombres y roles se infieren del texto de la transcripción y pueden no ser exactos. Corrígelos en el
        contexto de la nota, más abajo.
      </p>
    </Card>
  );
}
