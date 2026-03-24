"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, Column } from "@/components/tables/data-table";
import type { Matter } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { fetchMatters } from "@/store/slices/matters.slice";
import { useThunkErrorToast } from "@/hooks/use-thunk-error-toast";

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-500/10 text-blue-700",
  ACTIVE: "bg-green-500/10 text-green-700",
  ON_HOLD: "bg-yellow-500/10 text-yellow-700",
  CLOSED: "bg-muted text-muted-foreground",
};

const columns: Column<Matter>[] = [
  { key: "caseTitle", header: "Case" },
  { key: "caseType", header: "Type" },
  {
    key: "status",
    header: "Status",
    render: (m) => <Badge className={statusColors[m.status] ?? "bg-muted"}>{m.status}</Badge>,
  },
  { key: "createdAt", header: "Opened" },
];

export default function MyCasesPage() {
  const firmId = useCurrentFirmId();
  const dispatch = useAppDispatch();
  const matters = useAppSelector((s) => s.matters.list);
  const { isLoading, error } = useAppSelector((s) => s.matters);

  useThunkErrorToast(error);
  useEffect(() => {
    if (firmId) dispatch(fetchMatters({ firmId }));
  }, [dispatch, firmId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My matters"
        description="Matters where you are counsel of record"
      />
      <DataTable
        data={matters}
        columns={columns}
        keyExtractor={(m) => m.id}
        emptyTitle="No matters"
        emptyDescription="Your assigned matters will appear here."
        isLoading={isLoading}
      />
    </div>
  );
}
