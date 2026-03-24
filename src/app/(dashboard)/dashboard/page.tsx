"use client";

import { Users, Briefcase, Calendar, Receipt } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: "Active clients",
      value: 24,
      icon: Users,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Open matters",
      value: 18,
      icon: Briefcase,
      trend: { value: 5, isPositive: true },
    },
    {
      title: "Upcoming court dates",
      value: 7,
      icon: Calendar,
    },
    {
      title: "Invoices outstanding",
      value: 5,
      icon: Receipt,
      trend: { value: 2, isPositive: false },
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Welcome back, {user?.name?.split(" ")[0] || "Counsel"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your practice
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <DashboardCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={<stat.icon className="h-5 w-5" strokeWidth={1.75} />}
            trend={stat.trend}
          />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Recent activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Matter updates, filings, and deadlines
        </p>
        <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No recent activity. Add clients and matters to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
