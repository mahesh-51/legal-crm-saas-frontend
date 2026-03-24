"use client";

import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Gavel, Landmark } from "lucide-react";
import { FormikInputField, FormikSelectField } from "@/formik";
import { Button } from "@/components/ui/button";
import { FormScreen } from "@/components/dashboard/form-screen";
import { FormSection } from "@/components/dashboard/form-section";
import { courtNamesService } from "@/lib/api/services/court-names.service";
import { courtTypesService, type CourtType } from "@/lib/api/services/court-types.service";
import { getCourtMutationErrorMessage } from "@/lib/court-permissions";

const schema = Yup.object({
  name: Yup.string().required("Name is required"),
  courtTypeId: Yup.string().optional(),
});

export default function NewCourtNamePage() {
  const router = useRouter();
  const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);

  useEffect(() => {
    courtTypesService
      .list()
      .then(({ data }) => setCourtTypes(data))
      .catch(() => {});
  }, []);

  return (
    <FormScreen
      backHref="/court-names"
      title="New court name"
      description="A specific court. You can leave type unset or tie it to a court type."
      wide
    >
      <Formik
        initialValues={{ name: "", courtTypeId: "" }}
        validationSchema={schema}
        onSubmit={async (values) => {
          try {
            await courtNamesService.create({
              name: values.name.trim(),
              courtTypeId: values.courtTypeId || null,
            });
            toast.success("Court name created");
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
                    placeholder="e.g. Supreme Court of India"
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
                {isSubmitting ? "Saving..." : "Create"}
              </Button>
            </div>
          </>
        )}
      </Formik>
    </FormScreen>
  );
}
