"use client";

import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import RadioGroup from "../ui/RadioGroup";

const TYPE_OPTIONS = ["📰 Nota periodística", "📋 Comunicado de prensa"];
const TYPE_TO_SLUG = {
  "📰 Nota periodística": "news_article",
  "📋 Comunicado de prensa": "press_release",
};

export default function IdeaToNoteModal({ open, onClose, onSubmit, loading }) {
  const [type, setType] = useState(TYPE_OPTIONS[0]);
  const [organizationName, setOrganizationName] = useState("");

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      type: TYPE_TO_SLUG[type],
      organizationName: type === TYPE_OPTIONS[1] ? organizationName : undefined,
    });
  }

  const canSubmit = type === TYPE_OPTIONS[0] || organizationName.trim();

  return (
    <Modal open={open} onClose={onClose} title="Generar nota basada en esta investigación">
      <div className="flex flex-col gap-4">
        <RadioGroup name="idea_note_type" options={TYPE_OPTIONS} value={type} onChange={setType} />

        {type === TYPE_OPTIONS[1] && (
          <Input
            id="idea_note_organization"
            label="Nombre de la organización"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
          />
        )}

        <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
          {loading ? "Generando..." : "Generar nota"}
        </Button>
      </div>
    </Modal>
  );
}
