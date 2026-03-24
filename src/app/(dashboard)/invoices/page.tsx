"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, Column } from "@/components/tables/data-table";
import type { Invoice } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { fetchInvoicesByMatter } from "@/store/slices/invoices.slice";
import { fetchMatters } from "@/store/slices/matters.slice";
import { useThunkErrorToast } from "@/hooks/use-thunk-error-toast";

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-500/10 text-blue-700",
  PAID: "bg-green-500/10 text-green-700",
  OVERDUE: "bg-red-500/10 text-red-700",
  CANCELLED: "bg-muted text-muted-foreground",
};

const columns: Column<Invoice>[] = [
  { key: "clientName", header: "Client" },
  {
    key: "amount",
    header: "Amount",
    render: (i) => `$${i.amount.toLocaleString()}`,
  },
  {
    key: "status",
    header: "Status",
    render: (i) => <Badge className={statusColors[i.status] ?? "bg-muted"}>{i.status}</Badge>,
  },
  { key: "paymentReference", header: "Reference" },
];

export default function InvoicesPage() {
  const firmId = useCurrentFirmId();
  const dispatch = useAppDispatch();
  const matters = useAppSelector((s) => s.matters.list);
  const matterId = matters[0]?.id ?? null;
  const invoices = useAppSelector((s) =>
    matterId ? s.invoices.byMatter[matterId] ?? [] : []
  );
  const { isLoading, error } = useAppSelector((s) => s.invoices);

  useThunkErrorToast(error);
  useEffect(() => {
    if (firmId) dispatch(fetchMatters({ firmId }));
  }, [dispatch, firmId]);
  useEffect(() => {
    if (matterId) dispatch(fetchInvoicesByMatter(matterId));
  }, [dispatch, matterId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Time entries, invoices, and collections"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        }
      />
      <DataTable
        data={invoices}
        columns={columns}
        keyExtractor={(i) => i.id}
        emptyTitle="No invoices"
        emptyDescription="Track time and generate invoices for your clients."
        isLoading={isLoading && !!matterId}
      />
    </div>
  );
}
