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
import type { Client } from "@/types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { fetchClients, createClient } from "@/store/slices/clients.slice";

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-700",
  inactive: "bg-muted text-muted-foreground",
  lead: "bg-yellow-500/10 text-yellow-700",
};

const columns: Column<Client>[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  {
    key: "status",
    header: "Status",
    render: (client) => (
      <Badge className={statusColors[client.status ?? "active"]}>
        {client.status ?? "active"}
      </Badge>
    ),
  },
  { key: "createdAt", header: "Created" },
];

const clientSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  status: Yup.string().oneOf(["active", "inactive", "lead"]).optional(),
});

export default function ClientsPage() {
  const [open, setOpen] = useState(false);
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
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
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
      <ModalWrapper
        open={open}
        onOpenChange={setOpen}
        title="Add client"
        description="Add a new client from intake"
        size="lg"
      >
        <Formik
          initialValues={{
            name: "",
            email: "",
            phone: "",
            status: "lead" as const,
          }}
          validationSchema={clientSchema}
          onSubmit={async (values) => {
            if (!firmId) {
              toast.error("No firm selected");
              return;
            }
            const result = await dispatch(
              createClient({ firmId, payload: { name: values.name, email: values.email, phone: values.phone } })
            );
            if (createClient.fulfilled.match(result)) {
              toast.success("Client created");
              setOpen(false);
            } else {
              toast.error((result.payload as { message?: string })?.message ?? "Failed to create client");
            }
          }}
        >
          {({ submitForm, isSubmitting }) => (
            <>
              <Form className="space-y-4">
                <FormikInputField name="name" label="Name" placeholder="Client name" />
                <FormikInputField name="email" label="Email" type="email" />
                <FormikInputField name="phone" label="Phone" placeholder="+1 555-0100" />
                <FormikSelectField
                  name="status"
                  label="Status"
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                    { value: "lead", label: "Lead" },
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
