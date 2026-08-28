"use client";

const MAX_WIDTH_BY_SIZE = {
  md: "max-w-md",
  lg: "max-w-2xl",
};

export default function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className={`flex max-h-[90vh] w-full ${MAX_WIDTH_BY_SIZE[size] || MAX_WIDTH_BY_SIZE.md} flex-col rounded-brand bg-white p-6 shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-text">{title}</h2>
          <button onClick={onClose} className="text-brand-text/50 hover:text-brand-text" aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="mt-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
