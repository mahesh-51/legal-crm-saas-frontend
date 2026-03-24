"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FormScreen } from "@/components/dashboard/form-screen";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { HearingForm } from "../../_components/hearing-form";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchHearingById } from "@/store/slices/hearings.slice";

export default function EditHearingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.hearings.selected);

  useEffect(() => {
    dispatch(fetchHearingById(id))
      .unwrap()
      .catch(() => {
        router.replace("/hearings");
      });
  }, [dispatch, id, router]);

  if (!selected || selected.id !== id) {
    return <LoadingSkeleton type="form" />;
  }

  return (
    <FormScreen
      backHref="/hearings"
      title="Edit hearing"
      description="Update dates, parties, synopsis, orders, and status."
      wide
    >
      <HearingForm mode="edit" hearing={selected} />
    </FormScreen>
  );
}
