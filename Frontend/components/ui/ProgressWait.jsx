"use client";

import { useEffect, useState } from "react";
import Spinner from "./Spinner";

// Espera larga (20-60 s) con mensajes que avanzan y el tiempo transcurrido, para
// que el periodista vea que la app está trabajando y no crea que se colgó.
// `steps`: mensajes que se muestran en orden; `expectedSeconds`: duración típica.
export default function ProgressWait({ steps, expectedSeconds }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const stepDuration = Math.max(1, expectedSeconds / steps.length);
  const stepIndex = Math.min(steps.length - 1, Math.floor(elapsed / stepDuration));
  const overTime = elapsed > expectedSeconds + 10;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <Spinner />
        <span className="font-medium text-brand-text/80">{steps[stepIndex]}</span>
      </div>
      <span className="text-xs text-brand-text/50">
        {elapsed} s ·{" "}
        {overTime
          ? "Está tardando más de lo normal, pero sigue trabajando."
          : `Suele tardar unos ${expectedSeconds} segundos.`}
      </span>
    </div>
  );
}
