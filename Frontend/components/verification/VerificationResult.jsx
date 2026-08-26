import Card from "../ui/Card";

const VERDICT_CONFIG = {
  verified: { icon: "✅", label: "VERIFICADO", colorClass: "text-brand-success" },
  false: { icon: "❌", label: "FALSO", colorClass: "text-brand-error" },
  unverified: { icon: "⚠️", label: "NO VERIFICADO", colorClass: "text-amber-600" },
  inconclusive: { icon: "⚠️", label: "INCONCLUSO", colorClass: "text-amber-600" },
};

const CONFIDENCE_LABELS = { high: "Alta", medium: "Media", low: "Baja" };

export default function VerificationResult({ result }) {
  const config = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.inconclusive;

  return (
    <Card className="flex flex-col items-center gap-3 text-center">
      <span className="text-5xl">{config.icon}</span>
      <h2 className={`text-2xl font-bold ${config.colorClass}`}>{config.label}</h2>
      <p className="text-sm font-medium text-brand-text/70">
        Confianza: {CONFIDENCE_LABELS[result.confidence_level] || result.confidence_level}
      </p>
      <p className="text-left text-sm text-brand-text/80">{result.explanation}</p>

      <div className="w-full text-left">
        <h3 className="mb-2 font-semibold text-brand-text">Fuentes consultadas</h3>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-brand-text/80">
          {result.sources_used.map((source, index) => (
            <li key={index}>{source}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
