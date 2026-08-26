const VARIANTS = {
  default: "border-brand-border shadow-sm",
  elevated: "border-gray-100 shadow-md",
};

export default function Card({ children, className = "", variant = "default" }) {
  return (
    <div className={`rounded-brand border bg-white p-6 ${VARIANTS[variant]} ${className}`}>
      {children}
    </div>
  );
}
