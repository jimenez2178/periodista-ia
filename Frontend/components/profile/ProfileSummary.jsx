"use client";

import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { getInitials } from "../../utils/formatters";
import { COUNTRIES } from "../../utils/constants";

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-brand-text/60">{label}</span>
      <p className="text-brand-text">{value || "—"}</p>
    </div>
  );
}

function BadgeField({ label, values }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-brand-text/60">{label}</span>
      {values && values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <Badge key={value}>{value}</Badge>
          ))}
        </div>
      ) : (
        <p className="text-brand-text">—</p>
      )}
    </div>
  );
}

export default function ProfileSummary({ user, onEdit }) {
  const countryName = COUNTRIES.find((c) => c.code === user.country)?.name || user.country;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">Perfil</h1>
        <p className="mt-1 text-sm text-brand-text/70">Así es como PeriodistaIA te conoce.</p>
      </div>

      <Card className="flex flex-col gap-5">
        <h2 className="text-lg font-bold text-brand-text">👤 Datos básicos</h2>
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="Foto de perfil" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-blue text-xl font-bold text-white">
              {getInitials(user.full_name)}
            </span>
          )}
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold text-brand-text">{user.full_name || "—"}</p>
            <p className="text-sm text-brand-text/60">
              {[countryName, user.city].filter(Boolean).join(", ") || "—"}
            </p>
          </div>
        </div>
        <Field label="Email" value={user.email} />
      </Card>

      <Card className="flex flex-col gap-5">
        <h2 className="text-lg font-bold text-brand-text">📰 Tu trabajo</h2>
        <Field label="Rol profesional" value={user.profession_role} />
        <Field label="Dónde trabaja" value={user.workplace} />
        <BadgeField label="Tipo de medio" values={user.media_type} />
        <BadgeField label="Áreas de cobertura" values={user.coverage_areas} />
        <BadgeField label="Tipo de contenido" values={user.content_types} />
      </Card>

      <Card className="flex flex-col gap-5">
        <h2 className="text-lg font-bold text-brand-text">🤖 Tu relación con la IA</h2>
        <Field label="Nivel de familiaridad" value={user.ai_familiarity} />
        <BadgeField label="Herramientas que usa" values={user.ai_tools} />
        <Field label="Qué le consume más tiempo" value={user.time_consuming_task} />
        <Field label="Qué quiere que haga PeriodistaIA" value={user.periodistaia_wishes} />
        <Field label="Preferencia de ayuda" value={user.help_preference} />
      </Card>

      <div className="flex justify-end">
        <Button type="button" onClick={onEdit}>
          ✏️ Editar perfil
        </Button>
      </div>
    </div>
  );
}
