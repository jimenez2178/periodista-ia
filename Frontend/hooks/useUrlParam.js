"use client";

import { useEffect, useState } from "react";

// Lee un parámetro de la URL al montar (ej. /documents?id=... para reabrir un
// análisis). Se lee de window.location en vez de useSearchParams para no exigir
// un <Suspense> alrededor de cada página.
export function useUrlParam(name) {
  const [value, setValue] = useState(null);

  useEffect(() => {
    setValue(new URLSearchParams(window.location.search).get(name));
  }, [name]);

  return value;
}

// Quita el parámetro de la URL sin recargar (ej. al empezar un análisis nuevo,
// para que recargar la página no vuelva a abrir el anterior).
export function clearUrlParam(name) {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(name)) return;
  url.searchParams.delete(name);
  window.history.replaceState(window.history.state, "", url);
}
