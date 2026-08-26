export default function Checkbox({ id, label, checked, onChange }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2 rounded-brand border border-brand-border px-3 py-3 text-sm text-brand-text transition-colors hover:border-brand-blue has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue/5 md:py-2"
    >
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-brand-blue" />
      {label}
    </label>
  );
}
