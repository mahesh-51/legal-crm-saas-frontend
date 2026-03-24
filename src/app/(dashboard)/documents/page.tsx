"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, Column } from "@/components/tables/data-table";
import type { Document } from "@/types";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { useThunkErrorToast } from "@/hooks/use-thunk-error-toast";
import { fetchDocumentsByMatter } from "@/store/slices/documents.slice";
import { fetchMatters } from "@/store/slices/matters.slice";

const columns: Column<Document>[] = [
  { key: "originalName", header: "Name" },
  { key: "matterTitle", header: "Matter" },
  {
    key: "size",
    header: "Size",
    render: (d) => `${(d.size / 1024).toFixed(1)} KB`,
  },
  { key: "uploadedAt", header: "Uploaded" },
];

export default function DocumentsPage() {
  const firmId = useCurrentFirmId();
  const dispatch = useAppDispatch();
  const matters = useAppSelector((s) => s.matters.list);
  const matterId = matters[0]?.id ?? null;
  const documents = useAppSelector((s) =>
    matterId ? s.documents.byMatter[matterId] ?? [] : []
  );
  const { isLoading, error } = useAppSelector((s) => s.documents);

  useThunkErrorToast(error);
  useEffect(() => {
    if (firmId) dispatch(fetchMatters({ firmId }));
  }, [dispatch, firmId]);
  useEffect(() => {
    if (matterId) dispatch(fetchDocumentsByMatter(matterId));
  }, [dispatch, matterId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Pleadings, discovery, exhibits by matter"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        }
      />
      <DataTable
        data={documents}
        columns={columns}
        keyExtractor={(d) => d.id}
        emptyTitle="No documents"
        emptyDescription="Upload pleadings, discovery, and exhibits to organize by matter."
        isLoading={isLoading && !!matterId}
      />
    </div>
  );
}
