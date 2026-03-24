"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, Column } from "@/components/tables/data-table";
import { ModalWrapper } from "@/components/modals/modal-wrapper";
import { FormikInputField, FormikSelectField } from "@/formik";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import type { Matter } from "@/types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { fetchMatters, createMatter } from "@/store/slices/matters.slice";
import { fetchClients } from "@/store/slices/clients.slice";

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-500/10 text-blue-700",
  ACTIVE: "bg-green-500/10 text-green-700",
  ON_HOLD: "bg-yellow-500/10 text-yellow-700",
  CLOSED: "bg-muted text-muted-foreground",
};

const columns: Column<Matter>[] = [
  { key: "caseTitle", header: "Title" },
  { key: "clientName", header: "Client" },
  { key: "caseType", header: "Type" },
  {
    key: "status",
    header: "Status",
    render: (matter) => (
      <Badge className={statusColors[matter.status] ?? "bg-muted"}>{matter.status}</Badge>
    ),
  },
  { key: "createdAt", header: "Created" },
];

const matterSchema = Yup.object().shape({
  caseTitle: Yup.string().required("Title is required"),
  caseType: Yup.string().required("Type is required"),
  status: Yup.string().oneOf(["OPEN", "ACTIVE", "ON_HOLD", "CLOSED"]).required(),
  clientId: Yup.string().required("Client is required"),
});

export default function MattersPage() {
  const [open, setOpen] = useState(false);
  const firmId = useCurrentFirmId();
  const dispatch = useAppDispatch();
  const { list: matters, isLoading, error } = useAppSelector((s) => s.matters);
  const { list: clients } = useAppSelector((s) => s.clients);

  useEffect(() => {
    if (firmId) {
      dispatch(fetchMatters({ firmId }));
      dispatch(fetchClients(firmId));
    }
  }, [dispatch, firmId]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matters"
        description="Case tracking, deadlines, and assignments"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Matter
          </Button>
        }
      />
      <DataTable
        data={matters}
        columns={columns}
        keyExtractor={(m) => m.id}
        emptyTitle="No matters"
        emptyDescription="Create a matter to track case status, deadlines, and documents."
        isLoading={isLoading}
      />
      <ModalWrapper
        open={open}
        onOpenChange={setOpen}
        title="Add Matter"
        description="Create a new matter or case"
        size="lg"
      >
        <Formik
          initialValues={{
            caseTitle: "",
            caseType: "Civil",
            status: "OPEN" as const,
            clientId: "",
          }}
          validationSchema={matterSchema}
          onSubmit={async (values) => {
            if (!firmId) {
              toast.error("No firm selected");
              return;
            }
            const result = await dispatch(
              createMatter({
                firmId,
                payload: {
                  caseTitle: values.caseTitle,
                  caseType: values.caseType,
                  status: values.status,
                  clientId: values.clientId,
                },
              })
            );
            if (createMatter.fulfilled.match(result)) {
              toast.success("Matter created");
              setOpen(false);
            } else {
              toast.error((result.payload as { message?: string })?.message ?? "Failed to create matter");
            }
          }}
        >
          {({ submitForm, isSubmitting }) => (
            <>
              <Form className="space-y-4">
                <FormikInputField name="caseTitle" label="Title" placeholder="Matter title" />
                <FormikSelectField
                  name="clientId"
                  label="Client"
                  options={[
                    { value: "", label: "Select client" },
                    ...clients.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
                <FormikSelectField
                  name="caseType"
                  label="Type"
                  options={[
                    { value: "Civil", label: "Civil" },
                    { value: "Criminal", label: "Criminal" },
                    { value: "Family", label: "Family" },
                    { value: "Corporate", label: "Corporate" },
                  ]}
                />
                <FormikSelectField
                  name="status"
                  label="Status"
                  options={[
                    { value: "OPEN", label: "Open" },
                    { value: "ACTIVE", label: "Active" },
                    { value: "ON_HOLD", label: "On Hold" },
                    { value: "CLOSED", label: "Closed" },
                  ]}
                />
              </Form>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => submitForm()} disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </>
          )}
        </Formik>
      </ModalWrapper>
    </div>
  );
}
