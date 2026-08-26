"use client";

import { useEffect } from "react";

export default function Toast({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-6 right-6 rounded-brand bg-brand-blue px-4 py-3 text-sm font-medium text-white shadow-lg">
      {message}
    </div>
  );
}
