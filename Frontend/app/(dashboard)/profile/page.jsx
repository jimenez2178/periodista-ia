"use client";

import { useRef, useState } from "react";
import { Pencil } from "lucide-react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Checkbox from "../../../components/ui/Checkbox";
import RadioGroup from "../../../components/ui/RadioGroup";
import ProgressBar from "../../../components/ui/ProgressBar";
import Spinner from "../../../components/ui/Spinner";
import { useAuth } from "../../../hooks/useAuth";
import { updateProfile } from "../../../services/users.service";
import { getInitials } from "../../../utils/formatters";
import {
  COUNTRIES,
  PROFESSION_ROLE_OPTIONS,
  MEDIA_TYPE_OPTIONS,
  COVERAGE_AREA_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  AI_FAMILIARITY_OPTIONS,
  AI_TOOLS_OPTIONS,
  HELP_PREFERENCE_OPTIONS,
} from "../../../utils/constants";

const TOTAL_STEPS = 3;

function toggleValue(array, value) {
  return array.includes(value) ? array.filter((v) => v !== value) : [...array, value];
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.avatar_url || null);

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [country, setCountry] = useState(user?.country || "");
  const [city, setCity] = useState(user?.city || "");

  const [professionRole, setProfessionRole] = useState(user?.profession_role || "");
  const [isFreelance, setIsFreelance] = useState(user?.workplace === "Freelance");
  const [workplace, setWorkplace] = useState(user?.workplace === "Freelance" ? "" : user?.workplace || "");
  const [mediaType, setMediaType] = useState(user?.media_type || []);
  const [coverageAreas, setCoverageAreas] = useState(user?.coverage_areas || []);
  const [contentTypes, setContentTypes] = useState(user?.content_types || []);

  const [aiFamiliarity, setAiFamiliarity] = useState(user?.ai_familiarity || "");
  const [aiTools, setAiTools] = useState(user?.ai_tools || []);
  const [timeConsumingTask, setTimeConsumingTask] = useState(user?.time_consuming_task || "");
  const [periodistaiaWishes, setPeriodistaiaWishes] = useState(user?.periodistaia_wishes || "");
  const [helpPreference, setHelpPreference] = useState(user?.help_preference || "");

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("country", country);
      formData.append("city", city);
      formData.append("profession_role", professionRole);
      formData.append("workplace", isFreelance ? "Freelance" : workplace);
      formData.append("media_type", JSON.stringify(mediaType));
      formData.append("coverage_areas", JSON.stringify(coverageAreas));
      formData.append("content_types", JSON.stringify(contentTypes));
      formData.append("ai_familiarity", aiFamiliarity);
      formData.append("ai_tools", JSON.stringify(aiTools));
      formData.append("time_consuming_task", timeConsumingTask);
      formData.append("periodistaia_wishes", periodistaiaWishes);
      formData.append("help_preference", helpPreference);
      if (photoFile) formData.append("photo", photoFile);

      await updateProfile(formData);
      await refreshUser();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-brand-text">
          ¡Listo, {fullName || "periodista"}! Tu PeriodistaIA está configurado.
        </h1>
        <p className="text-brand-text/60">Ya puedes volver al Dashboard y empezar a usar las funciones.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">Perfil</h1>
        <p className="mt-1 text-sm text-brand-text/70">Cuéntanos sobre ti para personalizar tu experiencia.</p>
      </div>

      <ProgressBar step={step} totalSteps={TOTAL_STEPS} />

      <Card className="flex flex-col gap-5">
        {step === 1 && (
          <>
            <h2 className="text-lg font-bold text-brand-text">Sobre ti</h2>

            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto de perfil" className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-blue text-xl font-bold text-white">
                    {getInitials(fullName)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Cambiar foto de perfil"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-yellow text-brand-blue shadow"
                >
                  <Pencil size={14} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
              <p className="text-sm text-brand-text/60">Sube una foto de perfil (opcional).</p>
            </div>

            <Input id="full_name" label="Nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />

            <div className="flex flex-col gap-1">
              <label htmlFor="country" className="text-sm font-medium text-brand-text">
                País
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded-brand border border-brand-border px-3 py-2.5 text-brand-text outline-none focus:border-brand-blue"
              >
                <option value="">Selecciona tu país</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input id="city" label="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} />
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-bold text-brand-text">Tu trabajo</h2>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-brand-text">¿Cuál es tu rol?</span>
              <RadioGroup
                name="profession_role"
                options={PROFESSION_ROLE_OPTIONS}
                value={professionRole}
                onChange={setProfessionRole}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Input
                id="workplace"
                label="¿Dónde trabajas?"
                value={workplace}
                disabled={isFreelance}
                onChange={(e) => setWorkplace(e.target.value)}
              />
              <label className="flex items-center gap-2 text-sm text-brand-text">
                <input
                  type="checkbox"
                  checked={isFreelance}
                  onChange={(e) => setIsFreelance(e.target.checked)}
                  className="h-4 w-4 accent-brand-blue"
                />
                Soy freelance
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-brand-text">Tipo de medio</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {MEDIA_TYPE_OPTIONS.map((option) => (
                  <Checkbox
                    key={option}
                    id={`media_type-${option}`}
                    label={option}
                    checked={mediaType.includes(option)}
                    onChange={() => setMediaType((prev) => toggleValue(prev, option))}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-brand-text">¿En qué áreas trabajas?</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {COVERAGE_AREA_OPTIONS.map((option) => (
                  <Checkbox
                    key={option}
                    id={`coverage_areas-${option}`}
                    label={option}
                    checked={coverageAreas.includes(option)}
                    onChange={() => setCoverageAreas((prev) => toggleValue(prev, option))}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-brand-text">¿Qué tipo de contenido produces?</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {CONTENT_TYPE_OPTIONS.map((option) => (
                  <Checkbox
                    key={option}
                    id={`content_types-${option}`}
                    label={option}
                    checked={contentTypes.includes(option)}
                    onChange={() => setContentTypes((prev) => toggleValue(prev, option))}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-lg font-bold text-brand-text">Tu relación con la IA</h2>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-brand-text">
                ¿Qué tan familiarizado estás con herramientas de IA?
              </span>
              <RadioGroup
                name="ai_familiarity"
                options={AI_FAMILIARITY_OPTIONS}
                value={aiFamiliarity}
                onChange={setAiFamiliarity}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-brand-text">¿Qué herramientas utilizas actualmente?</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {AI_TOOLS_OPTIONS.map((option) => (
                  <Checkbox
                    key={option}
                    id={`ai_tools-${option}`}
                    label={option}
                    checked={aiTools.includes(option)}
                    onChange={() => setAiTools((prev) => toggleValue(prev, option))}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="time_consuming_task" className="text-sm font-medium text-brand-text">
                ¿Qué parte de tu trabajo te consume más tiempo?
              </label>
              <textarea
                id="time_consuming_task"
                rows={3}
                value={timeConsumingTask}
                onChange={(e) => setTimeConsumingTask(e.target.value)}
                className="rounded-brand border border-brand-border px-3 py-2.5 text-brand-text outline-none focus:border-brand-blue"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="periodistaia_wishes" className="text-sm font-medium text-brand-text">
                ¿Qué te gustaría que PeriodistaIA pudiera hacer por ti?
              </label>
              <textarea
                id="periodistaia_wishes"
                rows={3}
                value={periodistaiaWishes}
                onChange={(e) => setPeriodistaiaWishes(e.target.value)}
                className="rounded-brand border border-brand-border px-3 py-2.5 text-brand-text outline-none focus:border-brand-blue"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-brand-text">¿Cómo prefieres que PeriodistaIA te ayude?</span>
              <RadioGroup
                name="help_preference"
                options={HELP_PREFERENCE_OPTIONS}
                value={helpPreference}
                onChange={setHelpPreference}
              />
            </div>
          </>
        )}

        {error && <p className="text-sm text-brand-error">{error}</p>}

        <div className="flex items-center justify-between border-t border-brand-border pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || saving}
          >
            ← Anterior
          </Button>

          {step < TOTAL_STEPS ? (
            <Button type="button" onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}>
              Siguiente →
            </Button>
          ) : (
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Guardando...
                </span>
              ) : (
                "Guardar perfil"
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
