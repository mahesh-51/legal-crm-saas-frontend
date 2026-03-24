"use client";

import type { LucideIcon } from "lucide-react";
import { useField } from "formik";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormikTextareaFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
  icon?: LucideIcon;
}

export function FormikTextareaField({
  name,
  label,
  placeholder,
  rows = 4,
  disabled,
  className,
  icon: Icon,
}: FormikTextareaFieldProps) {
  const [field, meta] = useField(name);

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <div className={cn("relative", Icon && "group")}>
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-3 top-3 z-[1] h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary"
            aria-hidden
            strokeWidth={1.75}
          />
        ) : null}
        <Textarea
          id={name}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={cn(Icon && "min-h-24 pl-10 pt-3", className)}
          {...field}
          aria-invalid={meta.touched && !!meta.error}
        />
      </div>
      {meta.touched && meta.error && (
        <p className="text-sm text-destructive">{meta.error}</p>
      )}
    </div>
  );
}
