"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "legalcrm-sidebar-collapsed";

export function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
}

export function writeSidebarCollapsed(collapsed: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({
  mobileOpen,
  onMobileClose,
  collapsed,
  onCollapsedChange,
}: SidebarProps) {
  const { user } = useAuth();
  const role = user?.role ?? "lawyer";

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onMobileClose]);

  const brand = (opts: { compact: boolean }) => (
    <Link
      href="/dashboard"
      className={cn(
        "flex min-w-0 items-center tracking-tight",
        opts.compact ? "justify-center" : "gap-0 text-base"
      )}
    >
      {opts.compact ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2563eb]/10 text-sm font-bold text-[#2563eb]">
          L
        </span>
      ) : (
        <>
          <span className="font-semibold text-[#2563eb]">Legal</span>
          <span className="font-bold text-neutral-900 dark:text-neutral-100">CRM</span>
        </>
      )}
    </Link>
  );

  const userInitial =
    user?.name?.trim()?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    "?";

  const desktopAside = (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col border-r border-neutral-200 bg-white transition-[width] duration-200 ease-out dark:border-border dark:bg-sidebar lg:flex",
        collapsed ? "w-[4.25rem]" : "w-60"
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-neutral-200 dark:border-border",
          collapsed ? "justify-center px-2" : "px-4"
        )}
      >
        {brand({ compact: collapsed })}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-4">
        <SidebarNav role={role} user={user} collapsed={collapsed} />
      </div>
      <div className="relative shrink-0 border-t border-neutral-200 dark:border-border">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1 py-3">
            <Link
              href="/settings"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-600 text-sm font-medium text-white hover:bg-neutral-700"
              aria-label="Settings"
            >
              {userInitial}
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500"
              aria-label="Expand sidebar"
              onClick={() => onCollapsedChange(false)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="relative flex h-14 items-center px-3">
            <Link
              href="/settings"
              className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-600 text-sm font-medium text-white hover:bg-neutral-700"
              aria-label="Settings"
            >
              {userInitial}
            </Link>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="pointer-events-auto h-8 w-8 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500"
                aria-label="Collapse sidebar"
                onClick={() => onCollapsedChange(true)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {desktopAside}

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={onMobileClose}
          aria-label="Close menu"
        />
        <aside
          id="mobile-sidebar-nav"
          aria-hidden={!mobileOpen}
          inert={!mobileOpen ? true : undefined}
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(18rem,100vw-2rem)] max-w-[100vw] flex-col border-r border-neutral-200 bg-white shadow-lg transition-transform duration-200 ease-out dark:border-border dark:bg-sidebar",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-neutral-200 px-4 dark:border-border">
            {brand({ compact: false })}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label="Close menu"
              onClick={onMobileClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto py-4">
            <SidebarNav role={role} user={user} onNavigate={onMobileClose} />
          </div>
          <div className="relative flex h-14 shrink-0 items-center border-t border-neutral-200 px-3 dark:border-border">
            <Link
              href="/settings"
              onClick={onMobileClose}
              className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-600 text-sm font-medium text-white hover:bg-neutral-700"
              aria-label="Settings"
            >
              {userInitial}
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
