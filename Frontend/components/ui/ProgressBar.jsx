export default function ProgressBar({ step, totalSteps }) {
  const percent = (step / totalSteps) * 100;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-brand-text/70">
        Paso {step} de {totalSteps}
      </span>
      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-border">
        <div className="h-full rounded-full bg-brand-blue transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
