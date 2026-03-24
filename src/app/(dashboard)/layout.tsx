"use client";

import { useEffect, useState } from "react";
import {
  Sidebar,
  readSidebarCollapsed,
  writeSidebarCollapsed,
} from "@/components/layout/sidebar";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { ProtectedRoute } from "@/components/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(readSidebarCollapsed());
  }, []);

  useEffect(() => {
    if (mobileSidebarOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileSidebarOpen]);

  return (
    <ProtectedRoute>
      <div className="flex h-svh min-h-0 overflow-hidden bg-background">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onCollapsedChange={(next) => {
            setSidebarCollapsed(next);
            writeSidebarCollapsed(next);
          }}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <DashboardNavbar
            onMenuClick={() => setMobileSidebarOpen(true)}
            mobileSidebarOpen={mobileSidebarOpen}
          />
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-muted/20">
            <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
