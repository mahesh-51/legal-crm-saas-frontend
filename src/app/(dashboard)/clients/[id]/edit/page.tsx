"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FormScreen } from "@/components/dashboard/form-screen";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ClientForm } from "../../_components/client-form";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchClientById } from "@/store/slices/clients.slice";

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.clients.selected);

  useEffect(() => {
    dispatch(fetchClientById(id))
      .unwrap()
      .catch(() => {
        router.replace("/clients");
      });
  }, [dispatch, id, router]);

  if (!selected || selected.id !== id) {
    return <LoadingSkeleton type="form" />;
  }

  return (
    <FormScreen
      backHref="/clients"
      title="Edit client"
      description="Update profile, verification status, identifiers, or upload KYC files."
      wide
    >
      <ClientForm mode="edit" client={selected} />
    </FormScreen>
  );
}
