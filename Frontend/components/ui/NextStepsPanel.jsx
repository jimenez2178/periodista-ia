import Button from "./Button";

export default function NextStepsPanel({ actions }) {
  return (
    <div className="rounded-brand bg-brand-blue/5 p-4">
      <h3 className="mb-3 text-sm font-semibold text-brand-text">¿Qué quieres hacer ahora?</h3>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, index) => (
          <Button key={index} variant="secondary" onClick={action.onClick}>
            {action.emoji} {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
