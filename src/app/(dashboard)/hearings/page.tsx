"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, Column } from "@/components/tables/data-table";
import { ModalWrapper } from "@/components/modals/modal-wrapper";
import { FormikInputField, FormikDatePicker } from "@/formik";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import type { Hearing } from "@/types";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { fetchHearingsByMatter, createHearing } from "@/store/slices/hearings.slice";
import { fetchMatters } from "@/store/slices/matters.slice";
import { useThunkErrorToast } from "@/hooks/use-thunk-error-toast";

const columns: Column<Hearing>[] = [
  { key: "synopsis", header: "Title" },
  { key: "matterTitle", header: "Matter" },
  { key: "hearingDate", header: "Date" },
];

const hearingSchema = Yup.object().shape({
  hearingDate: Yup.string().required("Date is required"),
  synopsis: Yup.string().optional(),
  orders: Yup.string().optional(),
});

export default function HearingsPage() {
  const [open, setOpen] = useState(false);
  const firmId = useCurrentFirmId();
  const dispatch = useAppDispatch();
  const matters = useAppSelector((s) => s.matters.list);
  const matterId = matters[0]?.id ?? null;
  const hearings = useAppSelector((s) =>
    matterId ? s.hearings.byMatter[matterId] ?? [] : []
  );
  const { isLoading, error } = useAppSelector((s) => s.hearings);

  useThunkErrorToast(error);
  useEffect(() => {
    if (firmId) dispatch(fetchMatters({ firmId }));
  }, [dispatch, firmId]);
  useEffect(() => {
    if (matterId) dispatch(fetchHearingsByMatter(matterId));
  }, [dispatch, matterId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Court dates & hearings"
        description="Scheduled hearings, depositions, and deadlines"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Hearing
          </Button>
        }
      />
      <DataTable
        data={hearings}
        columns={columns}
        keyExtractor={(h) => h.id}
        emptyTitle="No court dates"
        emptyDescription="Add hearings, depositions, and filing deadlines."
        isLoading={isLoading && !!matterId}
      />
      <ModalWrapper
        open={open}
        onOpenChange={setOpen}
        title="Add Hearing"
        description="Schedule a new hearing or court date"
        size="lg"
      >
        <Formik
          initialValues={{
            hearingDate: "",
            synopsis: "",
            orders: "",
          }}
          validationSchema={hearingSchema}
          onSubmit={async (values) => {
            if (!matterId) {
              toast.error("No matter selected");
              return;
            }
            const result = await dispatch(
              createHearing({ matterId, hearingDate: values.hearingDate, synopsis: values.synopsis, orders: values.orders })
            );
            if (createHearing.fulfilled.match(result)) {
              toast.success("Hearing added");
              setOpen(false);
            } else {
              toast.error((result.payload as { message?: string })?.message ?? "Failed to add hearing");
            }
          }}
        >
          {({ submitForm, isSubmitting }) => (
            <>
              <Form className="space-y-4">
                <FormikDatePicker name="hearingDate" label="Date" />
                <FormikInputField name="synopsis" label="Synopsis" placeholder="e.g. Preliminary hearing" />
                <FormikInputField name="orders" label="Orders" placeholder="Next steps or court orders" />
              </Form>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => submitForm()} disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add"}
                </Button>
              </div>
            </>
          )}
        </Formik>
      </ModalWrapper>
    </div>
  );
}
