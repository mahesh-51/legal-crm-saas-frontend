"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { ProtectedRoute } from "@/components/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <DashboardNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
