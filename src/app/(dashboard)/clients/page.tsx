"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, Column } from "@/components/tables/data-table";
import type { Client, ClientVerificationStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { fetchClients } from "@/store/slices/clients.slice";

const verificationColors: Record<ClientVerificationStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-800",
  VERIFIED: "bg-green-500/10 text-green-700",
  REJECTED: "bg-destructive/10 text-destructive",
};

const columns: Column<Client>[] = [
  { key: "name", header: "Name" },
  { key: "phone", header: "Phone" },
  { key: "email", header: "Email" },
  {
    key: "verificationStatus",
    header: "Verification",
    render: (client) => {
      const v = client.verificationStatus ?? "PENDING";
      return (
        <Badge className={verificationColors[v] ?? "bg-muted"}>{v}</Badge>
      );
    },
  },
  { key: "createdAt", header: "Created" },
  {
    key: "actions",
    header: "",
    render: (c) => (
      <Link
        href={`/clients/${c.id}/edit`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <Pencil className="mr-1 h-3.5 w-3.5" />
        Edit
      </Link>
    ),
  },
];

export default function ClientsPage() {
  const firmId = useCurrentFirmId();
  const dispatch = useAppDispatch();
  const { list: clients, isLoading, error } = useAppSelector((s) => s.clients);

  useEffect(() => {
    if (firmId) dispatch(fetchClients(firmId));
  }, [dispatch, firmId]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Client intake, profiles, and matter history"
        action={
          <Link
            href="/clients/new"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add client
          </Link>
        }
      />
      <DataTable
        data={clients}
        columns={columns}
        keyExtractor={(c) => c.id}
        emptyTitle="No clients"
        emptyDescription="Add a client from intake to start tracking matters and billing."
        isLoading={isLoading}
      />
    </div>
  );
}
