"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/use-redux";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Gavel, Landmark } from "lucide-react";
import { FormikInputField, FormikSelectField } from "@/formik";
import { Button } from "@/components/ui/button";
import { FormScreen } from "@/components/dashboard/form-screen";
import { FormSection } from "@/components/dashboard/form-section";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { courtNamesService, type CourtName } from "@/lib/api/services/court-names.service";
import { courtTypesService, type CourtType } from "@/lib/api/services/court-types.service";
import {
  canMutateCourtRow,
  COURT_MUTATION_FORBIDDEN_MESSAGE,
  getCourtMutationErrorMessage,
} from "@/lib/court-permissions";

const schema = Yup.object({
  name: Yup.string().required("Name is required"),
  courtTypeId: Yup.string().optional(),
});

export default function EditCourtNamePage() {
  const params = useParams();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const id = params.id as string;
  const [row, setRow] = useState<CourtName | null>(null);
  const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);

  useEffect(() => {
    courtTypesService
      .list()
      .then(({ data }) => setCourtTypes(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    courtNamesService
      .getById(id)
      .then(({ data }) => {
        if (!cancelled) setRow(data);
      })
      .catch(() => {
        toast.error("Could not load court name");
        router.replace("/court-names");
      });
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  useEffect(() => {
    if (!row || !user) return;
    if (!canMutateCourtRow(user, row)) {
      toast.error(COURT_MUTATION_FORBIDDEN_MESSAGE);
      router.replace("/court-names");
    }
  }, [row, user, router]);

  if (!row) {
    return <LoadingSkeleton type="form" />;
  }
  if (!user) {
    return <LoadingSkeleton type="form" />;
  }
  if (!canMutateCourtRow(user, row)) {
    return <LoadingSkeleton type="form" />;
  }

  return (
    <FormScreen
      backHref="/court-names"
      title="Edit court name"
      description="Update the label or change which court type it belongs to."
      wide
    >
      <Formik
        enableReinitialize
        initialValues={{
          name: row.name,
          courtTypeId: row.courtTypeId ?? "",
        }}
        validationSchema={schema}
        onSubmit={async (values) => {
          try {
            await courtNamesService.update(id, {
              name: values.name.trim(),
              courtTypeId: values.courtTypeId || null,
            });
            toast.success("Court name updated");
            router.push("/court-names");
          } catch (e) {
            toast.error(getCourtMutationErrorMessage(e));
          }
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <>
            <Form className="space-y-6">
              <FormSection
                icon={Landmark}
                title="Court"
                description="Official name and optional classification."
              >
                <div className="min-w-0 md:col-span-12">
                  <FormikInputField
                    name="name"
                    label="Court name"
                    placeholder="e.g. High Court of Delhi"
                    icon={Landmark}
                  />
                </div>
                <div className="min-w-0 md:col-span-12">
                  <FormikSelectField
                    name="courtTypeId"
                    label="Court type (optional)"
                    icon={Gavel}
                    placeholder="None"
                    options={[
                      { value: "", label: "None" },
                      ...courtTypes.map((t) => ({ value: t.id, label: t.name })),
                    ]}
                  />
                </div>
              </FormSection>
            </Form>
            <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-border/80 bg-muted/30 p-4 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
              <Button type="button" variant="outline" onClick={() => router.push("/court-names")}>
                Cancel
              </Button>
              <Button type="button" onClick={() => submitForm()} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </>
        )}
      </Formik>
    </FormScreen>
  );
}
