"use client";

import Link from "next/link";
import { SidebarNav } from "./sidebar-nav";
import { useAuth } from "@/hooks/use-auth";

export function Sidebar() {
  const { user } = useAuth();
  const role = user?.role ?? "lawyer";

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-card/50">
      <div className="flex h-14 items-center border-b border-border px-5">
        <Link
          href="/dashboard"
          className="text-base font-semibold tracking-tight"
        >
          <span className="text-primary">Legal</span>
          <span className="text-foreground">CRM</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <SidebarNav role={role} />
      </div>
    </aside>
  );
}
