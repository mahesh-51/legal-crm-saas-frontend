"use client";

import { FormScreen } from "@/components/dashboard/form-screen";
import { MatterForm } from "../_components/matter-form";

export default function NewMatterPage() {
  return (
    <FormScreen
      backHref="/matters"
      title="New matter"
      description="Capture parties, court, case type, and workflow status in guided sections."
      wide
    >
      <MatterForm mode="create" />
    </FormScreen>
  );
}
