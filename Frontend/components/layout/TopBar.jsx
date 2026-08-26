"use client";

import Image from "next/image";
import { useAuth } from "../../hooks/useAuth";
import { getGreeting, getInitials } from "../../utils/formatters";
import CreditsBadge from "../credits/CreditsBadge";

export default function TopBar() {
  const { user } = useAuth();
  const firstName = (user?.full_name || user?.email || "").split(" ")[0];

  return (
    <header className="flex items-center justify-between border-b border-brand-border bg-white px-8 py-4">
      <h1 className="text-lg font-semibold text-brand-text">
        {getGreeting()}, {firstName}
      </h1>

      <div className="flex items-center gap-4">
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
