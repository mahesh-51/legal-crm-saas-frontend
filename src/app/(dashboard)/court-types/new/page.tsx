"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Layers } from "lucide-react";
import { FormikInputField } from "@/formik";
import { Button } from "@/components/ui/button";
import { FormScreen } from "@/components/dashboard/form-screen";
import { FormSection } from "@/components/dashboard/form-section";
import { courtTypesService } from "@/lib/api/services/court-types.service";
import { getCourtMutationErrorMessage } from "@/lib/court-permissions";

const schema = Yup.object({
  name: Yup.string().required("Name is required"),
});

export default function NewCourtTypePage() {
  const router = useRouter();

  return (
    <FormScreen
      backHref="/court-types"
      title="New court type"
      description="e.g. Civil, Criminal, Tax — must match how your firm classifies courts."
      wide
    >
      <Formik
        initialValues={{ name: "" }}
        validationSchema={schema}
        onSubmit={async (values) => {
          try {
            await courtTypesService.create({ name: values.name.trim() });
            toast.success("Court type created");
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
                description="A category used when linking court names and matters."
              >
                <div className="min-w-0 md:col-span-12">
                  <FormikInputField
                    name="name"
                    label="Name"
                    placeholder="e.g. Tax"
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
                {isSubmitting ? "Saving..." : "Create"}
              </Button>
            </div>
          </>
        )}
      </Formik>
    </FormScreen>
  );
}
