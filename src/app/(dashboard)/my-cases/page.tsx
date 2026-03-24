"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, Column } from "@/components/tables/data-table";
import type { Matter } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { fetchMatters } from "@/store/slices/matters.slice";

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-500/10 text-blue-700",
  ACTIVE: "bg-green-500/10 text-green-700",
  ON_HOLD: "bg-yellow-500/10 text-yellow-700",
  CLOSED: "bg-muted text-muted-foreground",
};

const columns: Column<Matter>[] = [
  {
    key: "matterName",
    header: "Case",
    render: (m) => m.matterName ?? m.caseTitle ?? "—",
  },
  {
    key: "status",
    header: "Status",
    render: (matter) => (
      <Badge className={statusColors[matter.status] ?? "bg-muted"}>{matter.status}</Badge>
    ),
  },
  { key: "createdAt", header: "Created" },
];

export default function MyCasesPage() {
  const firmId = useCurrentFirmId();
  const dispatch = useAppDispatch();
  const { list: matters, isLoading } = useAppSelector((s) => s.matters);

  useEffect(() => {
    if (firmId) dispatch(fetchMatters({ firmId }));
  }, [dispatch, firmId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My cases"
        description="Matters assigned to you"
      />
      <DataTable
        data={matters}
        columns={columns}
        keyExtractor={(m) => m.id}
        emptyTitle="No cases"
        emptyDescription="You have no matters assigned yet."
        isLoading={isLoading}
      />
    </div>
  );
}
