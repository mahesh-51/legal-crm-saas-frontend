"use client";

import type { LucideIcon } from "lucide-react";
import { useField } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormikInputFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Leading icon inside the field (modern stacked layout) */
  icon?: LucideIcon;
}

export function FormikInputField({
  name,
  label,
  type = "text",
  placeholder,
  disabled,
  className,
  icon: Icon,
}: FormikInputFieldProps) {
  const [field, meta] = useField(name);

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <div className={cn("relative", Icon && "group")}>
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
            aria-hidden
            strokeWidth={1.75}
          />
        ) : null}
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(Icon && "h-10 pl-10", className)}
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
