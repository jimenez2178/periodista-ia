export default function Input({ label, error, id, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-brand-text">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-brand border px-3 py-2.5 text-brand-text outline-none focus:border-brand-blue ${
          error ? "border-brand-error" : "border-brand-border"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-brand-error">{error}</span>}
    </div>
  );
}
