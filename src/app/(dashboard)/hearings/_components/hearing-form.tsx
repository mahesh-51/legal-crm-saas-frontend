"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Briefcase,
  CircleDot,
  FileText,
  Gavel,
  Hash,
  ListOrdered,
  ScrollText,
  UserCircle,
  UserX,
} from "lucide-react";
import { FormikInputField, FormikDatePicker, FormikSelectField } from "@/formik";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/dashboard/form-section";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { createHearing, updateHearing } from "@/store/slices/hearings.slice";
import { fetchMatters } from "@/store/slices/matters.slice";
import type { Hearing, HearingStatus } from "@/types";
import { useEffect } from "react";

function splitCommaList(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function joinCommaList(arr: string[] | undefined): string {
  return (arr ?? []).join(", ");
}

const hearingSchema = Yup.object().shape({
  matterId: Yup.string().required("Matter is required"),
  caseType: Yup.string().optional(),
  caseNo: Yup.string().optional(),
  currentDate: Yup.string().required("Current date is required"),
  nextDate: Yup.string().optional(),
  synopsis: Yup.string().optional(),
  orders: Yup.string().optional(),
  complainants: Yup.string().optional(),
  defendants: Yup.string().optional(),
  status: Yup.string()
    .oneOf(["SCHEDULED", "COMPLETED", "ADJOURNED", "CANCELLED"])
    .required(),
});

type HearingFormProps =
  | { mode: "create"; defaultMatterId?: string }
  | { mode: "edit"; hearing: Hearing };

export function HearingForm(props: HearingFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const firmId = useCurrentFirmId();
  const matters = useAppSelector((s) => s.matters.list);

  useEffect(() => {
    if (firmId) dispatch(fetchMatters({ firmId }));
  }, [dispatch, firmId]);

  const initialValues =
    props.mode === "edit"
      ? {
          matterId: props.hearing.matterId,
          caseType: props.hearing.caseType ?? "",
          caseNo: props.hearing.caseNo ?? "",
          currentDate: props.hearing.currentDate ?? props.hearing.hearingDate ?? "",
          nextDate: props.hearing.nextDate ?? "",
          synopsis: props.hearing.synopsis ?? "",
          orders: props.hearing.orders ?? "",
          complainants: joinCommaList(props.hearing.complainants),
          defendants: joinCommaList(props.hearing.defendants),
          status: props.hearing.status,
        }
      : {
          matterId: props.defaultMatterId ?? "",
          caseType: "",
          caseNo: "",
          currentDate: "",
          nextDate: "",
          synopsis: "",
          orders: "",
          complainants: "",
          defendants: "",
          status: "SCHEDULED" as HearingStatus,
        };

  const matterOptions = matters.map((m) => ({
    value: m.id,
    label: m.matterName ?? m.caseTitle ?? m.id,
  }));

  return (
    <div className="space-y-6">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={hearingSchema}
        onSubmit={async (values) => {
          const matter = matters.find((m) => m.id === values.matterId);
          if (!matter) {
            toast.error("Matter not found");
            return;
          }

          if (props.mode === "create") {
            const result = await dispatch(
              createHearing({
                matterId: matter.id,
                clientId: matter.clientId,
                caseType: values.caseType.trim() || undefined,
                caseNo: values.caseNo.trim() || undefined,
                complainants: splitCommaList(values.complainants),
                defendants: splitCommaList(values.defendants),
                status: values.status as HearingStatus,
                currentDate: values.currentDate,
                nextDate: values.nextDate || undefined,
                synopsis: values.synopsis || undefined,
                orders: values.orders || undefined,
              })
            );
            if (createHearing.fulfilled.match(result)) {
              toast.success("Hearing created");
              router.push(`/hearings?matterId=${encodeURIComponent(matter.id)}`);
            } else {
              toast.error(
                (result.payload as { message?: string })?.message ?? "Failed to create hearing"
              );
            }
            return;
          }

          const result = await dispatch(
            updateHearing({
              hearingId: props.hearing.id,
              payload: {
                caseType: values.caseType.trim() || undefined,
                caseNo: values.caseNo.trim() || undefined,
                complainants: splitCommaList(values.complainants),
                defendants: splitCommaList(values.defendants),
                status: values.status as HearingStatus,
                currentDate: values.currentDate,
                nextDate: values.nextDate || undefined,
                synopsis: values.synopsis || undefined,
                orders: values.orders || undefined,
              },
            })
          );
          if (updateHearing.fulfilled.match(result)) {
            toast.success("Hearing updated");
            router.push(`/hearings?matterId=${encodeURIComponent(props.hearing.matterId)}`);
          } else {
            toast.error(
              (result.payload as { message?: string })?.message ?? "Failed to update hearing"
            );
          }
        }}
      >
        {({ submitForm, isSubmitting, values }) => (
          <>
            <Form className="space-y-6">
              <FormSection
                icon={Briefcase}
                title="Matter"
                description="Which case this hearing belongs to."
              >
                {props.mode === "edit" ? (
                  <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border/80 bg-muted/30 px-4 py-3 md:col-span-12">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Briefcase className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Linked matter
                      </p>
                      <p className="truncate font-medium text-foreground">
                        {matters.find((m) => m.id === values.matterId)
                          ? matterOptions.find((o) => o.value === values.matterId)?.label
                          : values.matterId}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="min-w-0 md:col-span-12">
                    <FormikSelectField
                      name="matterId"
                      label="Matter"
                      icon={Briefcase}
                      placeholder="Select matter"
                      options={
                        matterOptions.length
                          ? matterOptions
                          : [{ value: "", label: "No matters — create one first" }]
                      }
                      disabled={!matterOptions.length}
                    />
                  </div>
                )}
              </FormSection>

              <FormSection
                icon={FileText}
                title="Case reference"
                description="Optional labels for docket or case type on this hearing."
              >
                <div className="min-w-0 md:col-span-6">
                  <FormikInputField
                    name="caseType"
                    label="Case type (optional)"
                    placeholder="e.g. Civil"
                    icon={Gavel}
                  />
                </div>
                <div className="min-w-0 md:col-span-6">
                  <FormikInputField
                    name="caseNo"
                    label="Case number (optional)"
                    placeholder="Docket or filing no."
                    icon={Hash}
                  />
                </div>
              </FormSection>

              <FormSection
                icon={CircleDot}
                title="Status & dates"
                description="Hearing workflow and scheduling."
              >
                <div className="min-w-0 md:col-span-12">
                  <FormikSelectField
                    name="status"
                    label="Status"
                    icon={CircleDot}
                    placeholder="Select status"
                    options={[
                      { value: "SCHEDULED", label: "Scheduled" },
                      { value: "COMPLETED", label: "Completed" },
                      { value: "ADJOURNED", label: "Adjourned" },
                      { value: "CANCELLED", label: "Cancelled" },
                    ]}
                  />
                </div>
                <div className="min-w-0 md:col-span-6">
                  <FormikDatePicker name="currentDate" label="Current date" />
                </div>
                <div className="min-w-0 md:col-span-6">
                  <FormikDatePicker name="nextDate" label="Next date (optional)" />
                </div>
              </FormSection>

              <FormSection
                icon={UserCircle}
                title="Parties"
                description="Optional overrides for this hearing; use commas between names."
              >
                <div className="min-w-0 md:col-span-12">
                  <FormikInputField
                    name="complainants"
                    label="Complainants"
                    placeholder="Comma-separated"
                    icon={UserCircle}
                  />
                </div>
                <div className="min-w-0 md:col-span-12">
                  <FormikInputField
                    name="defendants"
                    label="Defendants"
                    placeholder="Comma-separated"
                    icon={UserX}
                  />
                </div>
              </FormSection>

              <FormSection
                icon={ScrollText}
                title="Record"
                description="Synopsis and court orders or next steps."
              >
                <div className="min-w-0 md:col-span-12">
                  <FormikInputField
                    name="synopsis"
                    label="Synopsis"
                    placeholder="What happened in court"
                    icon={ScrollText}
                  />
                </div>
                <div className="min-w-0 md:col-span-12">
                  <FormikInputField
                    name="orders"
                    label="Orders"
                    placeholder="Directions, next date notes, etc."
                    icon={ListOrdered}
                  />
                </div>
              </FormSection>
            </Form>

            <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-border/80 bg-muted/30 p-4 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
              <Button type="button" variant="outline" onClick={() => router.push("/hearings")}>
                Cancel
              </Button>
              <Button type="button" onClick={() => submitForm()} disabled={isSubmitting}>
                {isSubmitting
                  ? props.mode === "create"
                    ? "Creating..."
                    : "Saving..."
                  : props.mode === "create"
                    ? "Create hearing"
                    : "Save changes"}
              </Button>
            </div>
          </>
        )}
      </Formik>
    </div>
  );
}
