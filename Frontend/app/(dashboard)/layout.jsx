"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { CreditsProvider } from "../../context/CreditsContext";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import PageWrapper from "../../components/layout/PageWrapper";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <CreditsProvider>
      <div className="flex h-screen bg-brand-bg">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <PageWrapper>{children}</PageWrapper>
        </div>
      </div>
    </CreditsProvider>
  );
}
