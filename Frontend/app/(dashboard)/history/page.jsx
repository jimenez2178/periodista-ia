"use client";

import { useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Spinner from "../../../components/ui/Spinner";
import SessionCard from "../../../components/history/SessionCard";
import { listHistory } from "../../../services/history.service";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listHistory()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">🕘 Historial</h1>
        <p className="mt-1 text-sm text-brand-text/70">Todo lo que has generado con PeriodistaIA.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">Cargando tu historial...</span>
        </div>
      )}

      {error && !loading && <p className="text-sm text-brand-error">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <Card>
          <p className="text-center text-sm text-brand-text/70">
            Aún no tienes actividad. ¡Empieza usando una función!
          </p>
        </Card>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <SessionCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
