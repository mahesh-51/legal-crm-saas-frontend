"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, Column } from "@/components/tables/data-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/hooks/use-redux";
import {
  courtTypesService,
  type CourtType,
} from "@/lib/api/services/court-types.service";
import { getErrorMessage } from "@/lib/api/error-handler";
import {
  canMutateCourtRow,
  courtScopeLabel,
  getCourtMutationErrorMessage,
} from "@/lib/court-permissions";

const columns = (
  onRequestDelete: (id: string) => void,
  canMutateRow: (row: CourtType) => boolean
): Column<CourtType>[] => [
  { key: "name", header: "Name" },
  {
    key: "scope",
    header: "Scope",
    render: (row) => (
      <Badge
        variant={courtScopeLabel(row) === "Built-in" ? "secondary" : "outline"}
      >
        {courtScopeLabel(row)}
      </Badge>
    ),
  },
  { key: "createdAt", header: "Created" },
  {
    key: "actions",
    header: "",
    render: (row) =>
      canMutateRow(row) ? (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/court-types/${row.id}/edit`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Edit
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onRequestDelete(row.id)}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">Built-in — view only</span>
      ),
  },
];

export default function CourtTypesPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [list, setList] = useState<CourtType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const canMutateRow = useCallback(
    (row: CourtType) => canMutateCourtRow(user, row),
    [user]
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await courtTypesService.list();
      setList(data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Court types"
        description="Categories such as Civil, Criminal, Family — used when creating matters."
        action={
          <Link
            href="/court-types/new"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add court type
          </Link>
        }
      />
      <DataTable
        data={list}
        columns={columns((id) => setDeleteId(id), canMutateRow)}
        keyExtractor={(r) => r.id}
        emptyTitle="No court types"
        emptyDescription="Add a court type or wait for the API to seed defaults."
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete court type?"
        description="Matters or court names that reference this type may be affected. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await courtTypesService.delete(deleteId);
            toast.success("Court type deleted");
            void load();
          } catch (e) {
            toast.error(getCourtMutationErrorMessage(e));
            throw e;
          }
        }}
      />
    </div>
  );
}
