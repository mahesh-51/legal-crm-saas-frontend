"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FormScreen } from "@/components/dashboard/form-screen";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { MatterForm } from "../../_components/matter-form";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchMatterById } from "@/store/slices/matters.slice";

export default function EditMatterPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.matters.selected);

  useEffect(() => {
    dispatch(fetchMatterById(id))
      .unwrap()
      .catch(() => {
        router.replace("/matters");
      });
  }, [dispatch, id, router]);

  if (!selected || selected.id !== id) {
    return <LoadingSkeleton type="form" />;
  }

  return (
    <FormScreen
      backHref="/matters"
      title="Edit matter"
      description="Adjust parties, court, references, and status — changes sync to your firm workspace."
      wide
    >
      <MatterForm mode="edit" matter={selected} />
    </FormScreen>
  );
}
