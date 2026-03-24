"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/use-redux";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Layers } from "lucide-react";
import { FormikInputField } from "@/formik";
import { Button } from "@/components/ui/button";
import { FormScreen } from "@/components/dashboard/form-screen";
import { FormSection } from "@/components/dashboard/form-section";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { courtTypesService, type CourtType } from "@/lib/api/services/court-types.service";
import {
  canMutateCourtRow,
  COURT_MUTATION_FORBIDDEN_MESSAGE,
  getCourtMutationErrorMessage,
} from "@/lib/court-permissions";

const schema = Yup.object({
  name: Yup.string().required("Name is required"),
});

export default function EditCourtTypePage() {
  const params = useParams();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const id = params.id as string;
  const [row, setRow] = useState<CourtType | null>(null);

  useEffect(() => {
    let cancelled = false;
    courtTypesService
      .getById(id)
      .then(({ data }) => {
        if (!cancelled) setRow(data);
      })
      .catch(() => {
        toast.error("Could not load court type");
        router.replace("/court-types");
      });
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  useEffect(() => {
    if (!row || !user) return;
    if (!canMutateCourtRow(user, row)) {
      toast.error(COURT_MUTATION_FORBIDDEN_MESSAGE);
      router.replace("/court-types");
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
      backHref="/court-types"
      title="Edit court type"
      description="Update the display name used when linking matters and court names."
      wide
    >
      <Formik
        enableReinitialize
        initialValues={{ name: row.name }}
        validationSchema={schema}
        onSubmit={async (values) => {
          try {
            await courtTypesService.update(id, { name: values.name.trim() });
            toast.success("Court type updated");
            router.push("/court-types");
          } catch (e) {
            toast.error(getCourtMutationErrorMessage(e));
          }
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <>
            <Form className="space-y-6">
              <FormSection
                icon={Layers}
                title="Court type"
                description="This label appears wherever court types are chosen in the app."
              >
                <div className="min-w-0 md:col-span-12">
                  <FormikInputField
                    name="name"
                    label="Name"
                    placeholder="e.g. Tax & Customs"
                    icon={Layers}
                  />
                </div>
              </FormSection>
            </Form>
            <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-border/80 bg-muted/30 p-4 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
              <Button type="button" variant="outline" onClick={() => router.push("/court-types")}>
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
