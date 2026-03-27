"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LegacyAcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const target = token
      ? `/auth/accept-invite?token=${encodeURIComponent(token)}`
      : "/auth/accept-invite";
    router.replace(target);
  }, [router, searchParams]);

  return null;
}
