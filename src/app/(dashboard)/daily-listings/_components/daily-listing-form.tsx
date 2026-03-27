"use client";

import { ErrorMessage, Formik, Form, useFormikContext } from "formik";
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
  Users,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { FormikInputField, FormikDatePicker, FormikSelectField } from "@/formik";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/dashboard/form-section";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { LinkedTasksMeetingsPanel } from "@/components/tasks-meetings/linked-tasks-meetings-panel";
import { createDailyListing, updateDailyListing } from "@/store/slices/daily-listings.slice";
import { fetchMatters } from "@/store/slices/matters.slice";
import { fetchClients } from "@/store/slices/clients.slice";
import type { DailyListing, DailyListingStatus, Matter } from "@/types";
import { cn } from "@/lib/utils";

function splitCommaList(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function joinCommaList(arr: string[] | null | undefined): string {
  return (arr ?? []).join(", ");
}

/** Local calendar date as YYYY-MM-DD (for “no past dates” on current date). */
function todayIsoString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type FormValues = {
  matterId: string;
  clientIds: string[];
  caseType: string;
  caseNo: string;
  currentDate: string;
  nextDate: string;
  synopsis: string;
  orders: string;
  complainants: string;
  defendants: string;
  status: DailyListingStatus;
};

const listingSchema = Yup.object().shape({
  matterId: Yup.string().required("Matter is required"),
  clientIds: Yup.array()
    .of(Yup.string().required())
    .min(1, "Select at least one client")
    .required(),
  caseType: Yup.string().optional(),
  caseNo: Yup.string().optional(),
  currentDate: Yup.string()
    .required("Current date is required")
    .test(
      "not-in-past",
      "Current date cannot be in the past",
      (val) => {
        const v = (val ?? "").trim();
        if (!v) return false;
        return v >= todayIsoString();
      }
    ),
  nextDate: Yup.string()
    .optional()
    .test(
      "on-or-after-current",
      "Next date must be on or after current date",
      function (nextVal) {
        const v = (nextVal ?? "").trim();
        if (!v) return true;
        const cur = (this.parent as FormValues).currentDate?.trim();
        if (!cur) return true;
        return v >= cur;
      }
    ),
  synopsis: Yup.string().optional(),
  orders: Yup.string().optional(),
  complainants: Yup.string().optional(),
  defendants: Yup.string().optional(),
  status: Yup.string()
    .oneOf(["SCHEDULED", "COMPLETED", "ADJOURNED", "CANCELLED"])
    .required(),
});

function MatterClientSync({
  mode,
  matters,
}: {
  mode: "create" | "edit";
  matters: Matter[];
}) {
  const { values, setFieldValue } = useFormikContext<FormValues>();
  const matterSyncRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (mode === "edit") return;
    const mid = values.matterId?.trim() ?? "";
    if (!mid) {
      matterSyncRef.current = undefined;
      setFieldValue("clientIds", []);
      return;
    }
    const matter = matters.find((m) => m.id === mid);
    if (!matter) return;
    if (matterSyncRef.current !== mid) {
      matterSyncRef.current = mid;
      setFieldValue("clientIds", [matter.clientId]);
    }
  }, [values.matterId, matters, mode, setFieldValue]);

  return null;
}

/** Clear next date when it becomes earlier than current date (e.g. current date moved forward). */
function NextDateClamp() {
  const { values, setFieldValue } = useFormikContext<FormValues>();

  useEffect(() => {
    const cur = values.currentDate?.trim();
    const next = values.nextDate?.trim();
    if (!cur || !next) return;
    if (next < cur) {
      setFieldValue("nextDate", "");
    }
  }, [values.currentDate, values.nextDate, setFieldValue]);

  return null;
}

function CurrentDateField() {
  return (
    <FormikDatePicker
      name="currentDate"
      label="Current date"
      minDate={todayIsoString()}
    />
  );
}

function NextDateField() {
  const { values } = useFormikContext<FormValues>();
  const cur = values.currentDate?.trim();
  const today = todayIsoString();
  const min = !cur ? today : cur >= today ? cur : today;
  return (
    <FormikDatePicker
      name="nextDate"
      label="Next date (optional)"
      minDate={min}
    />
  );
}

type DailyListingFormProps =
  | { mode: "create"; defaultMatterId?: string }
  | { mode: "edit"; listing: DailyListing };

export function DailyListingForm(props: DailyListingFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const firmId = useCurrentFirmId();
  const matters = useAppSelector((s) => s.matters.list);
  const clients = useAppSelector((s) => s.clients.list);

  useEffect(() => {
    if (firmId) {
      dispatch(fetchMatters({ firmId }));
      dispatch(fetchClients(firmId));
    }
  }, [dispatch, firmId]);

  const defaultMatterForCreate =
    props.mode === "create"
      ? matters.find((m) => m.id === (props.defaultMatterId ?? ""))
      : undefined;

  const initialValues: FormValues =
    props.mode === "edit"
      ? {
          matterId: props.listing.matterId,
          clientIds:
            (props.listing.clients ?? []).length > 0
              ? (props.listing.clients ?? []).map((c) => c.id)
              : (
                  [
                    matters.find((m) => m.id === props.listing.matterId)?.clientId,
                  ].filter(Boolean) as string[]
                ),
          caseType: props.listing.caseType ?? "",
          caseNo: props.listing.caseNo ?? "",
          currentDate: props.listing.currentDate ?? "",
          nextDate: props.listing.nextDate ?? "",
          synopsis: props.listing.synopsis ?? "",
          orders: props.listing.orders ?? "",
          complainants: joinCommaList(props.listing.complainants ?? undefined),
          defendants: joinCommaList(props.listing.defendants ?? undefined),
          status: props.listing.status,
        }
      : {
          matterId: props.defaultMatterId ?? "",
          clientIds: defaultMatterForCreate ? [defaultMatterForCreate.clientId] : [],
          caseType: "",
          caseNo: "",
          currentDate: "",
          nextDate: "",
          synopsis: "",
          orders: "",
          complainants: "",
          defendants: "",
          status: "SCHEDULED",
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
        validationSchema={listingSchema}
        validate={(values) => {
          const matter = matters.find((m) => m.id === values.matterId);
          if (!matter) return {};
          if (!values.clientIds.includes(matter.clientId)) {
            return {
              clientIds: "The matter’s primary client must be included.",
            };
          }
          return {};
        }}
        onSubmit={async (values) => {
          const matter = matters.find((m) => m.id === values.matterId);
          if (!matter) {
            toast.error("Matter not found");
            return;
          }
          if (!values.clientIds.includes(matter.clientId)) {
            toast.error("The matter’s primary client must be selected.");
            return;
          }

          const complainants = splitCommaList(values.complainants);
          const defendants = splitCommaList(values.defendants);

          if (props.mode === "create") {
            const result = await dispatch(
              createDailyListing({
                matterId: matter.id,
                clientIds: values.clientIds,
                caseType: values.caseType.trim() || undefined,
                caseNo: values.caseNo.trim() || undefined,
                complainants: complainants.length ? complainants : undefined,
                defendants: defendants.length ? defendants : undefined,
                status: values.status,
                currentDate: values.currentDate,
                nextDate: values.nextDate || undefined,
                synopsis: values.synopsis || undefined,
                orders: values.orders || undefined,
              })
            );
            if (createDailyListing.fulfilled.match(result)) {
              toast.success("Daily listing created");
              router.push("/daily-listings");
            } else {
              toast.error(
                (result.payload as { message?: string })?.message ??
                  "Failed to create daily listing"
              );
            }
            return;
          }

          const result = await dispatch(
            updateDailyListing({
              id: props.listing.id,
              payload: {
                clientIds: values.clientIds,
                caseType: values.caseType.trim() || undefined,
                caseNo: values.caseNo.trim() || undefined,
                complainants: complainants.length ? complainants : undefined,
                defendants: defendants.length ? defendants : undefined,
                status: values.status,
                currentDate: values.currentDate,
                nextDate: values.nextDate || undefined,
                synopsis: values.synopsis || undefined,
                orders: values.orders || undefined,
              },
            })
          );
          if (updateDailyListing.fulfilled.match(result)) {
            toast.success("Daily listing updated");
            router.push("/daily-listings");
          } else {
            toast.error(
              (result.payload as { message?: string })?.message ??
                "Failed to update daily listing"
            );
          }
        }}
      >
        {({ submitForm, isSubmitting, values, setFieldValue }) => {
          const matter = matters.find((m) => m.id === values.matterId);
          const primaryClientId = matter?.clientId;

          return (
            <>
              <MatterClientSync
                mode={props.mode}
                matters={matters}
              />
              <NextDateClamp />
              <Form className="space-y-6">
                <FormSection
                  icon={Briefcase}
                  title="Matter"
                  description="Which case this daily listing belongs to."
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

                {(props.mode === "edit" || Boolean(values.matterId?.trim())) && (
                  <FormSection
                    icon={Users}
                    title="Clients"
                    description="Include the matter’s primary client (required). Add co-parties as needed."
                  >
                    <div className="space-y-3 md:col-span-12">
                      {clients.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No clients loaded for this firm yet.
                        </p>
                      ) : (
                        <ul className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border/80 bg-muted/20 p-3">
                          {clients.map((c) => {
                            const checked = values.clientIds.includes(c.id);
                            const isPrimary = primaryClientId === c.id;
                            return (
                              <li key={c.id}>
                                <label
                                  className={cn(
                                    "flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/50",
                                    isPrimary && "bg-primary/5"
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-input"
                                    checked={checked}
                                    disabled={isPrimary}
                                    onChange={() => {
                                      if (isPrimary) return;
                                      if (checked) {
                                        setFieldValue(
                                          "clientIds",
                                          values.clientIds.filter((id) => id !== c.id)
                                        );
                                      } else {
                                        setFieldValue("clientIds", [...values.clientIds, c.id]);
                                      }
                                    }}
                                  />
                                  <span className="min-w-0 flex-1">
                                    {c.name}
                                    {isPrimary ? (
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        (primary for matter)
                                      </span>
                                    ) : null}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      <ErrorMessage
                        name="clientIds"
                        component="p"
                        className="text-sm text-destructive"
                      />
                    </div>
                  </FormSection>
                )}

                <FormSection
                  icon={FileText}
                  title="Case reference"
                  description="Optional court or filing labels for this listing."
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
                  description="Listing workflow and scheduling."
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
                    <CurrentDateField />
                  </div>
                  <div className="min-w-0 md:col-span-6">
                    <NextDateField />
                  </div>
                </FormSection>

                <FormSection
                  icon={UserCircle}
                  title="Parties"
                  description="Complainants and defendants — comma-separated names or labels."
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
                      placeholder="Short notes"
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/daily-listings")}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={() => submitForm()} disabled={isSubmitting}>
                  {isSubmitting
                    ? props.mode === "create"
                      ? "Creating..."
                      : "Saving..."
                    : props.mode === "create"
                      ? "Create daily listing"
                      : "Save changes"}
                </Button>
              </div>
            </>
          );
        }}
      </Formik>
      {props.mode === "edit" && (
        <LinkedTasksMeetingsPanel
          firmId={firmId}
          matterId={props.listing.matterId}
          dailyListingId={props.listing.id}
          clientId={
            matters.find((m) => m.id === props.listing.matterId)?.clientId ??
            props.listing.clients?.[0]?.id
          }
          readOnly={user?.role === "client"}
        />
      )}
    </div>
  );
}
