import Card from "../ui/Card";

const VERDICT_CONFIG = {
  verified: { icon: "✅", label: "VERIFICADO", colorClass: "text-brand-success" },
  false: { icon: "❌", label: "FALSO", colorClass: "text-brand-error" },
  unverified: { icon: "⚠️", label: "NO VERIFICADO", colorClass: "text-amber-600" },
  inconclusive: { icon: "⚠️", label: "INCONCLUSO", colorClass: "text-amber-600" },
};

const CONFIDENCE_LABELS = { high: "Alta", medium: "Media", low: "Baja" };

const CONFIDENCE_BAR = {
  high: { width: "w-full", colorClass: "bg-brand-success" },
  medium: { width: "w-2/3", colorClass: "bg-amber-500" },
  low: { width: "w-1/3", colorClass: "bg-brand-error" },
};

export default function VerificationResult({ result }) {
  const config = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.inconclusive;
  const bar = CONFIDENCE_BAR[result.confidence_level] || CONFIDENCE_BAR.low;
  const evidenceFound = result.evidence_found || [];
  const whatToVerify = result.what_to_verify || [];

  return (
    <Card className="flex flex-col items-center gap-4 text-center">
      <span className="text-5xl">{config.icon}</span>
      <h2 className={`text-2xl font-bold ${config.colorClass}`}>{result.verdict_label || config.label}</h2>

      <div className="w-full max-w-xs">
        <p className="mb-1 text-sm font-medium text-brand-text/70">
          Confianza: {CONFIDENCE_LABELS[result.confidence_level] || result.confidence_level}
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div className={`h-full rounded-full ${bar.width} ${bar.colorClass}`} />
        </div>
      </div>

      <div className="w-full text-left">
        <h3 className="mb-2 font-semibold text-brand-text">¿Qué encontramos?</h3>
        <p className="text-sm text-brand-text/80">{result.explanation}</p>
      </div>

      {evidenceFound.length > 0 && (
        <div className="w-full text-left">
          <h3 className="mb-2 font-semibold text-brand-text">Evidencia encontrada</h3>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-brand-text/80">
            {evidenceFound.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="w-full text-left">
        <h3 className="mb-2 font-semibold text-brand-text">Fuentes consultadas</h3>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-brand-text/80">
          {result.sources_used.map((source, index) => {
            if (typeof source === "string") {
              return <li key={index}>{source}</li>;
            }
            return (
              <li key={index}>
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-blue hover:underline"
                  >
                    {source.name}
                  </a>
                ) : (
                  <span className="font-medium">{source.name}</span>
                )}
                {source.description && <p className="text-brand-text/70">{source.description}</p>}
              </li>
            );
          })}
        </ul>
      </div>

      {whatToVerify.length > 0 && (
        <div className="w-full rounded-brand border border-brand-yellow bg-brand-yellow/10 p-4 text-left">
          <h3 className="mb-2 font-semibold text-brand-text">⚠️ Qué deberías verificar tú</h3>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-brand-text/80">
            {whatToVerify.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
