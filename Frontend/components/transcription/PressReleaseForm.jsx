"use client";

import { useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

export default function PressReleaseForm({ open, onClose, onSubmit }) {
  const [organizationName, setOrganizationName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!organizationName.trim()) return;
    onSubmit(organizationName.trim());
    setOrganizationName("");
  }

  return (
    <Modal open={open} onClose={onClose} title="¿Cuál es el nombre de la organización?">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="organization_name"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          placeholder="Nombre de la organización"
          autoFocus
        />
        <Button type="submit" disabled={!organizationName.trim()}>
          Continuar
        </Button>
      </form>
    </Modal>
  );
}
