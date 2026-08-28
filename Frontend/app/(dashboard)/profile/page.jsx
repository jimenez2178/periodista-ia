"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import Spinner from "../../../components/ui/Spinner";
import ProfileWizard from "../../../components/profile/ProfileWizard";
import ProfileSummary from "../../../components/profile/ProfileSummary";
import ProfileEditModal from "../../../components/profile/ProfileEditModal";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  // Se decide una sola vez, al cargar, si es la primera vez o no. Así, guardar
  // el wizard (que dispara refreshUser() y actualiza el user global) no hace
  // que esta página cambie de golpe a la vista resumen a mitad de la pantalla
  // de éxito del wizard.
  const [isFirstTime, setIsFirstTime] = useState(null);

  useEffect(() => {
    if (!loading && user && isFirstTime === null) {
      setIsFirstTime(!user.onboarding_completed_at);
    }
  }, [loading, user, isFirstTime]);

  if (loading || !user || isFirstTime === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isFirstTime) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Perfil</h1>
          <p className="mt-1 text-sm text-brand-text/70">Cuéntanos sobre ti para personalizar tu experiencia.</p>
        </div>
        <ProfileWizard initialUser={user} />
      </div>
    );
  }

  return (
    <>
      <ProfileSummary user={user} onEdit={() => setEditOpen(true)} />
      <ProfileEditModal open={editOpen} onClose={() => setEditOpen(false)} user={user} />
    </>
  );
}
