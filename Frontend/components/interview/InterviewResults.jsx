"use client";

import { useState } from "react";
import Button from "../ui/Button";
import { downloadAsPdf, downloadAsWord } from "../../services/downloads.service";

const QUESTION_SECTIONS = [
  { key: "basic_questions", icon: "🎯", title: "Preguntas básicas" },
  { key: "hard_questions", icon: "🔥", title: "Preguntas incómodas" },
  { key: "follow_up_questions", icon: "🔄", title: "Repreguntas si evade" },
];

const PREP_SECTIONS = [
  { key: "topics_to_avoid", icon: "🙊", title: "Temas que probablemente evitará" },
  { key: "facts_to_verify", icon: "📋", title: "Datos que deberías verificar antes" },
];

// Guion listo para llevar a la entrevista: antecedentes, preguntas numeradas y pendientes.
function buildScript({ interviewee, topic, results }) {
  const lines = [`Tema: ${topic}`, ""];

  if (results.background?.length) {
    lines.push("ANTECEDENTES", ...results.background.map((item) => `- ${item}`), "");
  }

  let number = 1;
  for (const { key, title } of QUESTION_SECTIONS) {
    const items = results[key] || [];
    if (items.length === 0) continue;
    lines.push(title.toUpperCase(), ...items.map((item) => `${number++}. ${item}`), "");
  }

  for (const { key, title } of PREP_SECTIONS) {
    const items = results[key] || [];
    if (items.length === 0) continue;
    lines.push(title.toUpperCase(), ...items.map((item) => `- ${item}`), "");
  }

  if (results.sources?.length) {
    lines.push(
      "FUENTES CONSULTADAS",
      ...results.sources.map((source) => `- ${source.name}${source.url ? `: ${source.url}` : ""}`)
    );
  }

  return { title: `Entrevista a ${interviewee}`, body: lines.join("\n").trim() };
}

function Section({ icon, title, children }) {
  return (
    <details open className="rounded-brand border border-brand-border bg-white p-4">
      <summary className="cursor-pointer text-base font-semibold text-brand-text">
        {icon} {title}
      </summary>
      {children}
    </details>
  );
}

export default function InterviewResults({ interviewee, topic, results, onVerifyFact }) {
  const [copied, setCopied] = useState(false);
  const script = buildScript({ interviewee, topic, results });

  async function handleCopy() {
    await navigator.clipboard.writeText(`${script.title}\n\n${script.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      {results.background?.length > 0 && (
        <Section icon="🌐" title="Antecedentes públicos">
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-brand-text/80">
            {results.background.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {QUESTION_SECTIONS.map(({ key, icon, title }) => (
        <Section key={key} icon={icon} title={title}>
          <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-brand-text/80">
            {(results[key] || []).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </Section>
      ))}

      {PREP_SECTIONS.map(({ key, icon, title }) => (
        <Section key={key} icon={icon} title={title}>
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-brand-text/80">
            {(results[key] || []).map((item, index) => (
              <li key={index}>
                {item}
                {key === "facts_to_verify" && onVerifyFact && (
                  <button
                    type="button"
                    onClick={() => onVerifyFact(item)}
                    className="ml-2 whitespace-nowrap text-xs font-medium text-brand-blue hover:underline"
                  >
                    🔍 Verificar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Section>
      ))}

      {results.sources?.length > 0 && (
        <Section icon="🔗" title="Fuentes consultadas">
          <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm text-brand-text/80">
            {results.sources.map((source, index) => (
              <li key={index}>
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-blue hover:underline"
                  >
                    {source.name}
                  </a>
                ) : (
                  <span className="font-medium">{source.name}</span>
                )}
                {source.description && <p className="text-brand-text/70">{source.description}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => downloadAsPdf(script)}>⬇️ Descargar guion PDF</Button>
        <Button onClick={() => downloadAsWord(script)}>⬇️ Descargar guion Word</Button>
        <Button variant="secondary" onClick={handleCopy}>
          📋 {copied ? "¡Copiado!" : "Copiar guion"}
        </Button>
      </div>
    </div>
  );
}
