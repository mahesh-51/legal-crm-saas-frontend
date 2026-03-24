"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormikContext } from "formik";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  CircleDot,
  FileText,
  Gavel,
  Hash,
  Landmark,
  Scale,
  UserCircle,
  UserX,
  Users,
} from "lucide-react";
import { FormikInputField, FormikSelectField } from "@/formik";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/dashboard/form-section";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { createMatter, updateMatter } from "@/store/slices/matters.slice";
import { fetchClients } from "@/store/slices/clients.slice";
import {
  courtTypesService,
  type CourtType,
} from "@/lib/api/services/court-types.service";
import { courtNamesService, type CourtName } from "@/lib/api/services/court-names.service";
import type { Matter } from "@/types";
import type { CreateMatterDto } from "@/lib/api/services/matters.service";

function splitCommaList(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function joinCommaList(arr: string[] | undefined): string {
  return (arr ?? []).join(", ");
}

function MatterCourtSelects({
  courtTypes,
  matter,
}: {
  courtTypes: CourtType[];
  /** When editing, provides fallback labels if ids are not yet in loaded lists */
  matter?: Matter;
}) {
  const { values, setFieldValue } = useFormikContext<{
    courtTypeId: string;
    courtNameId: string;
  }>();
  const prevCourtTypeRef = useRef<string | undefined>(undefined);
  const [courtNames, setCourtNames] = useState<CourtName[]>([]);

  useEffect(() => {
    const prev = prevCourtTypeRef.current;
    if (prev !== undefined && prev !== values.courtTypeId) {
      setFieldValue("courtNameId", "");
    }
    prevCourtTypeRef.current = values.courtTypeId;
  }, [values.courtTypeId, setFieldValue]);

  useEffect(() => {
    if (!values.courtTypeId) {
      setCourtNames([]);
      return;
    }
    let cancelled = false;
    courtNamesService.list(values.courtTypeId).then(({ data }) => {
      if (!cancelled) setCourtNames(data);
    });
    return () => {
      cancelled = true;
    };
  }, [values.courtTypeId]);

  const courtTypeOptions = useMemo(() => {
    const base: { value: string; label: string }[] = [
      { value: "", label: "None" },
      ...courtTypes.map((t) => ({ value: t.id, label: t.name })),
    ];
    const id = values.courtTypeId;
    if (
      id &&
      !base.some((o) => o.value === id) &&
      matter?.courtTypeId &&
      matter.courtTypeId === id
    ) {
      base.push({
        value: id,
        label: matter.courtTypeName?.trim() || "Court type",
      });
    }
    return base;
  }, [courtTypes, values.courtTypeId, matter]);

  const courtNameOptions = useMemo(() => {
    const base: { value: string; label: string }[] = [
      {
        value: "",
        label: values.courtTypeId ? "Select court" : "Select court type first",
      },
      ...courtNames.map((n) => ({ value: n.id, label: n.name })),
    ];
    const id = values.courtNameId;
    if (
      id &&
      !base.some((o) => o.value === id) &&
      matter?.courtNameId &&
      matter.courtNameId === id
    ) {
      base.push({
        value: id,
        label: matter.courtName?.trim() || "Court",
      });
    }
    return base;
  }, [courtNames, values.courtTypeId, values.courtNameId, matter]);

  return (
    <>
      <FormikSelectField
        name="courtTypeId"
        label="Court type (optional)"
        icon={Gavel}
        placeholder="None"
        options={courtTypeOptions}
      />
      <FormikSelectField
        name="courtNameId"
        label="Court"
        icon={Landmark}
        placeholder={values.courtTypeId ? "Select court" : "Select court type first"}
        options={courtNameOptions}
        disabled={!values.courtTypeId}
      />
      <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        Manage lists:{" "}
        <Link
          href="/court-types"
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Court types
        </Link>
        {" · "}
        <Link
          href="/court-names"
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Court names
        </Link>
      </p>
    </>
  );
}

const matterSchema = Yup.object().shape({
  matterName: Yup.string().required("Title is required"),
  complainants: Yup.string().optional(),
  defendants: Yup.string().optional(),
  caseType: Yup.string().optional(),
  cnr: Yup.string().optional(),
  status: Yup.string().oneOf(["OPEN", "ACTIVE", "ON_HOLD", "CLOSED"]).required(),
  clientId: Yup.string().required("Client is required"),
});

type MatterFormProps =
  | { mode: "create"; matter?: undefined }
  | { mode: "edit"; matter: Matter };

export function MatterForm(props: MatterFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const firmId = useCurrentFirmId();
  const { list: clients } = useAppSelector((s) => s.clients);
  const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);

  useEffect(() => {
    if (firmId) dispatch(fetchClients(firmId));
  }, [dispatch, firmId]);

  useEffect(() => {
    courtTypesService
      .list()
      .then(({ data }) => setCourtTypes(data))
      .catch(() => {});
  }, []);

  const initialValues =
    props.mode === "edit"
      ? {
          matterName: props.matter.matterName ?? props.matter.caseTitle ?? "",
          complainants: joinCommaList(props.matter.complainants),
          defendants: joinCommaList(props.matter.defendants),
          caseType: props.matter.caseType ?? "",
          cnr: props.matter.cnr ?? "",
          courtTypeId: props.matter.courtTypeId ?? "",
          courtNameId: props.matter.courtNameId ?? "",
          status: props.matter.status,
          clientId: props.matter.clientId,
        }
      : {
          matterName: "",
          complainants: "",
          defendants: "",
          caseType: "",
          cnr: "",
          courtTypeId: "",
          courtNameId: "",
          status: "OPEN" as const,
          clientId: "",
        };

  async function submitPayload(values: typeof initialValues) {
    const payload: CreateMatterDto = {
      matterName: values.matterName,
      complainants: splitCommaList(values.complainants),
      defendants: splitCommaList(values.defendants),
      caseType: values.caseType.trim() ? values.caseType.trim() : null,
      courtTypeId: values.courtTypeId || null,
      courtNameId: values.courtNameId || null,
      status: values.status,
      clientId: values.clientId,
      cnr: values.cnr.trim() || undefined,
    };

    if (props.mode === "create") {
      if (!firmId) {
        toast.error("No firm selected");
        return;
      }
      const result = await dispatch(createMatter({ firmId, payload }));
      if (createMatter.fulfilled.match(result)) {
        toast.success("Matter created");
        router.push("/matters");
      } else {
        toast.error(
          (result.payload as { message?: string })?.message ??
            "Failed to create matter"
        );
      }
      return;
    }

    const result = await dispatch(
      updateMatter({
        matterId: props.matter.id,
        payload: {
          matterName: payload.matterName,
          complainants: payload.complainants,
          defendants: payload.defendants,
          caseType: payload.caseType,
          courtTypeId: payload.courtTypeId,
          courtNameId: payload.courtNameId,
          status: payload.status,
          cnr: payload.cnr,
        },
      })
    );
    if (updateMatter.fulfilled.match(result)) {
      toast.success("Matter updated");
      router.push("/matters");
    } else {
      toast.error(
        (result.payload as { message?: string })?.message ??
          "Failed to update matter"
      );
    }
  }

  return (
    <div className="space-y-6">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={matterSchema}
        onSubmit={async (values) => {
          await submitPayload(values);
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <>
            <Form className="space-y-6">
              <FormSection
                icon={FileText}
                title="Matter details"
                description="Title and how this matter is categorized in your firm."
              >
                <div className="min-w-0 md:col-span-12">
                  <FormikInputField
                    name="matterName"
                    label="Matter title"
                    placeholder="e.g. Smith v. Acme Corp"
                    icon={FileText}
                  />
                </div>
                <div className="min-w-0 md:col-span-6">
                  <FormikInputField
                    name="caseType"
                    label="Case type (optional)"
                    placeholder="e.g. Civil — Title suit"
                    icon={Scale}
                  />
                </div>
                <div className="min-w-0 md:col-span-6">
                  <FormikInputField
                    name="cnr"
                    label="CNR (optional)"
                    placeholder="Case number reference"
                    icon={Hash}
                  />
                </div>
              </FormSection>

              <FormSection
                icon={Users}
                title="Parties"
                description="List everyone on the record; separate multiple names with commas."
              >
                <div className="min-w-0 md:col-span-12">
                  <FormikInputField
                    name="complainants"
                    label="Complainants"
                    placeholder="e.g. Kumar, Kumar HUF"
                    icon={UserCircle}
                  />
                </div>
                <div className="min-w-0 md:col-span-12">
                  <FormikInputField
                    name="defendants"
                    label="Defendants"
                    placeholder="e.g. State of TN, Revenue Dept"
                    icon={UserX}
                  />
                </div>
              </FormSection>

              <FormSection
                icon={UserCircle}
                title="Client"
                description="The client this matter belongs to."
              >
                <div className="min-w-0 md:col-span-12">
                  <FormikSelectField
                    name="clientId"
                    label="Client"
                    icon={UserCircle}
                    placeholder="Select client"
                    options={[
                      { value: "", label: "Select client" },
                      ...clients.map((c) => ({ value: c.id, label: c.name })),
                    ]}
                    disabled={props.mode === "edit"}
                    selectedDisplayLabel={
                      props.mode === "edit" ? props.matter.clientName : undefined
                    }
                  />
                </div>
              </FormSection>

              <FormSection
                icon={Building2}
                title="Court & jurisdiction"
                description="Optional — choices are loaded from your available court types and names (including built-in defaults). Pick a type first, then a court for that type."
              >
                <div className="min-w-0 space-y-5 md:col-span-12">
                  <MatterCourtSelects
                    courtTypes={courtTypes}
                    matter={props.mode === "edit" ? props.matter : undefined}
                  />
                </div>
              </FormSection>

              <FormSection
                icon={CircleDot}
                title="Status"
                description="Where this matter sits in your workflow."
              >
                <div className="min-w-0 md:col-span-12">
                  <FormikSelectField
                    name="status"
                    label="Status"
                    icon={CircleDot}
                    placeholder="Select status"
                    options={[
                      { value: "OPEN", label: "Open" },
                      { value: "ACTIVE", label: "Active" },
                      { value: "ON_HOLD", label: "On Hold" },
                      { value: "CLOSED", label: "Closed" },
                    ]}
                  />
                </div>
              </FormSection>
            </Form>

            <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-border/80 bg-muted/30 p-4 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
              <Button type="button" variant="outline" onClick={() => router.push("/matters")}>
                Cancel
              </Button>
              <Button type="button" onClick={() => submitForm()} disabled={isSubmitting}>
                {isSubmitting
                  ? props.mode === "create"
                    ? "Creating..."
                    : "Saving..."
                  : props.mode === "create"
                    ? "Create matter"
                    : "Save changes"}
              </Button>
            </div>
          </>
        )}
      </Formik>
    </div>
  );
}
