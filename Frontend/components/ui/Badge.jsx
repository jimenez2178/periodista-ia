export default function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-medium text-brand-blue">
      {children}
    </span>
  );
}
