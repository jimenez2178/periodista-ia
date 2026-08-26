export default function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <label
          key={option}
          htmlFor={`${name}-${option}`}
          className="flex cursor-pointer items-center gap-2 rounded-brand border border-brand-border px-3 py-2 text-sm text-brand-text transition-colors hover:border-brand-blue has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue/5"
        >
          <input
            id={`${name}-${option}`}
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            className="h-4 w-4 accent-brand-blue"
          />
          {option}
        </label>
      ))}
    </div>
  );
}
