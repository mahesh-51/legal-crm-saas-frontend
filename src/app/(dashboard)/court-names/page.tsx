"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, Column } from "@/components/tables/data-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/hooks/use-redux";
import {
  courtNamesService,
  type CourtName,
} from "@/lib/api/services/court-names.service";
import { courtTypesService, type CourtType } from "@/lib/api/services/court-types.service";
import { getErrorMessage } from "@/lib/api/error-handler";
import {
  canMutateCourtRow,
  courtScopeLabel,
  getCourtMutationErrorMessage,
} from "@/lib/court-permissions";

type Row = CourtName & { courtTypeLabel?: string };

const columns = (
  onRequestDelete: (id: string) => void,
  canMutateRow: (row: Row) => boolean
): Column<Row>[] => [
  { key: "name", header: "Court name" },
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
  {
    key: "courtTypeLabel",
    header: "Court type",
    render: (r) => r.courtTypeLabel ?? (r.courtTypeId ? "—" : "Any / unset"),
  },
  { key: "createdAt", header: "Created" },
  {
    key: "actions",
    header: "",
    render: (row) =>
      canMutateRow(row) ? (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/court-names/${row.id}/edit`}
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

export default function CourtNamesPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);
  const [filterTypeId, setFilterTypeId] = useState<string>("");
  const [list, setList] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const canMutateRow = useCallback(
    (row: Row) => canMutateCourtRow(user, row),
    [user]
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [typesRes, namesRes] = await Promise.all([
        courtTypesService.list(),
        courtNamesService.list(filterTypeId || undefined),
      ]);
      setCourtTypes(typesRes.data);
      const typeMap = new Map(typesRes.data.map((t) => [t.id, t.name]));
      setList(
        namesRes.data.map((n) => ({
          ...n,
          courtTypeLabel: n.courtTypeId
            ? typeMap.get(n.courtTypeId) ?? n.courtTypeId
            : undefined,
        }))
      );
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, [filterTypeId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Court names"
        description="Specific courts (e.g. Delhi High Court). Optionally link each to a court type."
        action={
          <Link
            href="/court-names/new"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add court name
          </Link>
        }
      />
      <div className="max-w-md space-y-2">
        <Label htmlFor="court-type-filter">Filter by court type</Label>
        <select
          id="court-type-filter"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={filterTypeId}
          onChange={(e) => setFilterTypeId(e.target.value)}
        >
          <option value="">All</option>
          {courtTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        data={list}
        columns={columns((id) => setDeleteId(id), canMutateRow)}
        keyExtractor={(r) => r.id}
        emptyTitle="No court names"
        emptyDescription="Add a court or use API-seeded defaults."
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete court name?"
        description="Matters that reference this court may need to be updated. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await courtNamesService.delete(deleteId);
            toast.success("Court name deleted");
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
