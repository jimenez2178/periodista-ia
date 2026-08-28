"use client";

import Modal from "../ui/Modal";
import ProfileWizard from "./ProfileWizard";

export default function ProfileEditModal({ open, onClose, user }) {
  return (
    <Modal open={open} onClose={onClose} title="Editar perfil" size="lg">
      <ProfileWizard initialUser={user} showSuccessScreen={false} onSaved={onClose} />
    </Modal>
  );
}
