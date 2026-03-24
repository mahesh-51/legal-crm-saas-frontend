import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, icon: Icon, children, className }: FormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm ring-1 ring-border/40 backdrop-blur-sm",
        className
      )}
    >
      <div className="mb-6 flex items-start gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner ring-1 ring-primary/15"
          aria-hidden
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
          {description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {/* 12-col grid: full-width fields span 12; paired fields use 6+6 so edges line up with single column */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-12">{children}</div>
    </section>
  );
}
