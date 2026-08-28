"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, FolderKanban, History, FileText, User, X, LogOut, Mic, Compass, FileEdit } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getInitials } from "../../utils/formatters";

const NAV_ITEMS = [
  { href: "/home", label: "Inicio", icon: Home },
  { href: "/documents", label: "Documentos", icon: FileText },
  { href: "/doc-to-note", label: "De documento a nota", icon: FileEdit },
  { href: "/interview", label: "Preparar entrevista", icon: Mic },
  { href: "/tools", label: "¿Qué herramienta necesito?", icon: Compass },
  { href: "/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/history", label: "Historial", icon: History },
  { href: "/profile", label: "Perfil", icon: User },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col bg-brand-blue text-white transition-transform duration-200 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="PeriodistaIA" width={32} height={32} className="rounded-brand" />
            <span className="text-lg font-bold">PeriodistaIA</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex h-9 w-9 items-center justify-center text-white/80 hover:text-white md:hidden"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-brand px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-brand-yellow text-brand-blue" : "text-white/80 hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col border-t border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.full_name || user.email}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-blue">
                {getInitials(user?.full_name || user?.email)}
              </span>
            )}
            <span className="truncate text-sm font-medium">{user?.full_name || user?.email}</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex items-center gap-3 rounded-brand px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
