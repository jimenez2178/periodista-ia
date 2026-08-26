"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getGreeting, getInitials } from "../../utils/formatters";
import CreditsBadge from "../credits/CreditsBadge";

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();
  const firstName = (user?.full_name || user?.email || "").split(" ")[0];

  return (
    <header className="flex items-center justify-between border-b border-brand-border bg-white px-4 py-4 md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menú"
          className="flex h-11 w-11 items-center justify-center rounded-brand bg-brand-blue/5 text-brand-text hover:bg-brand-blue/10 md:hidden"
        >
          <Menu size={22} />
        </button>
        <h1 className="hidden text-lg font-semibold text-brand-text sm:block">
          {getGreeting()}, {firstName}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <CreditsBadge />
        {user?.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.full_name || user.email}
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white">
            {getInitials(user?.full_name || user?.email)}
          </span>
        )}
      </div>
    </header>
  );
}
