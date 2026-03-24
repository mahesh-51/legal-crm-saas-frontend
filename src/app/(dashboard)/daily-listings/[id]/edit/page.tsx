"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FormScreen } from "@/components/dashboard/form-screen";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { DailyListingForm } from "../../_components/daily-listing-form";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { fetchDailyListingById } from "@/store/slices/daily-listings.slice";

export default function EditDailyListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.dailyListings.selected);

  useEffect(() => {
    dispatch(fetchDailyListingById(id))
      .unwrap()
      .catch(() => {
        router.replace("/daily-listings");
      });
  }, [dispatch, id, router]);

  if (!selected || selected.id !== id) {
    return <LoadingSkeleton type="form" />;
  }

  return (
    <FormScreen
      backHref="/daily-listings"
      title="Edit daily listing"
      description="Update clients, parties, dates, synopsis, orders, and status."
      wide
    >
      <DailyListingForm mode="edit" listing={selected} />
    </FormScreen>
  );
}
