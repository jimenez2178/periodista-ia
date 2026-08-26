"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, FolderKanban, History, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getInitials } from "../../utils/formatters";

const NAV_ITEMS = [
  { href: "/home", label: "Inicio", icon: Home },
  { href: "/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/history", label: "Historial", icon: History },
  { href: "/profile", label: "Perfil", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-col bg-brand-blue text-white">
      <div className="flex items-center gap-2 px-6 py-6">
        <Image src="/logo.png" alt="PeriodistaIA" width={32} height={32} className="rounded-brand" />
        <span className="text-lg font-bold">PeriodistaIA</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
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

      <div className="flex items-center gap-3 border-t border-white/10 px-6 py-4">
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
    </aside>
  );
}
