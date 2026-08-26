const VARIANTS = {
  primary: "bg-brand-blue text-white hover:bg-brand-blue/90",
  secondary: "bg-brand-yellow text-brand-blue hover:bg-brand-yellow/90",
};

export default function Button({ children, variant = "primary", className = "", ...props }) {
  const variantClasses = VARIANTS[variant] || VARIANTS.primary;

  return (
    <button
      className={`inline-flex items-center justify-center rounded-brand px-4 py-2.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
