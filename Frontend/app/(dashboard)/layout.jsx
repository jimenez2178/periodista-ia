"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { CreditsProvider } from "../../context/CreditsContext";
import { NavigationGuardProvider } from "../../context/NavigationGuardContext";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import PageWrapper from "../../components/layout/PageWrapper";
import AssistantButton from "../../components/assistant/AssistantButton";
import InstallBanner from "../../components/pwa/InstallBanner";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
  }, [loading, user, router]);

  // Evita el doble-scroll (fondo + drawer) mientras el menú móvil está abierto.
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (loading || !user) return null;

  return (
    <CreditsProvider>
      <NavigationGuardProvider>
        <div className="flex h-screen bg-brand-bg">
          <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <InstallBanner />
            <TopBar onMenuClick={() => setMobileMenuOpen(true)} />
            <PageWrapper>{children}</PageWrapper>
          </div>
        </div>
        <AssistantButton />
      </NavigationGuardProvider>
    </CreditsProvider>
  );
}
