export default function Card({ children, className = "" }) {
  return (
    <div className={`rounded-brand border border-brand-border bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
