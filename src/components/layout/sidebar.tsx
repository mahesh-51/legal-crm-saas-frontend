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
        "flex min-w-0 items-center font-semibold tracking-tight",
        opts.compact ? "justify-center" : "gap-0 text-base"
      )}
    >
      {opts.compact ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
          L
        </span>
      ) : (
        <>
          <span className="text-primary">Legal</span>
          <span className="text-foreground">CRM</span>
        </>
      )}
    </Link>
  );

  const desktopAside = (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col border-r border-border bg-card/50 transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-[4.25rem]" : "w-60"
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-border",
          collapsed ? "justify-center px-2" : "px-4"
        )}
      >
        {brand({ compact: collapsed })}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-4">
        <SidebarNav role={role} collapsed={collapsed} />
      </div>
      <div className="flex shrink-0 justify-center border-t border-border p-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => onCollapsedChange(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
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
            "absolute inset-y-0 left-0 flex w-[min(18rem,100vw-2rem)] max-w-[100vw] flex-col border-r border-border bg-card shadow-lg transition-transform duration-200 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
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
            <SidebarNav role={role} onNavigate={onMobileClose} />
          </div>
        </aside>
      </div>
    </>
  );
}
