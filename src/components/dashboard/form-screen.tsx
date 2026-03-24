import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";

interface FormScreenProps {
  backHref: string;
  backLabel?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Wider layout for complex forms (matters, hearings) */
  wide?: boolean;
}

export function FormScreen({
  backHref,
  backLabel = "Back to list",
  title,
  description,
  children,
  wide,
}: FormScreenProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full space-y-8",
        wide ? "max-w-3xl" : "max-w-2xl"
      )}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/20 p-6 shadow-sm ring-1 ring-border/40 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-primary/[0.04] blur-2xl" />
        <div className="relative">
          <Link
            href={backHref}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary/30 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
            {backLabel}
          </Link>
          <PageHeader title={title} description={description} />
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
