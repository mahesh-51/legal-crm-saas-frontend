"use client";

import { FormScreen } from "@/components/dashboard/form-screen";
import { ClientForm } from "../_components/client-form";

export default function NewClientPage() {
  return (
    <FormScreen
      backHref="/clients"
      title="Add client"
      description="Capture contact details, verification, and optional KYC references."
      wide
    >
      <ClientForm mode="create" />
    </FormScreen>
  );
}
