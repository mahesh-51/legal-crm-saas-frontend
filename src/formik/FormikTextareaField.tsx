"use client";

import { useField } from "formik";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FormikTextareaFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

export function FormikTextareaField({
  name,
  label,
  placeholder,
  rows = 4,
  disabled,
  className,
}: FormikTextareaFieldProps) {
  const [field, meta] = useField(name);

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Textarea
        id={name}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={className}
        {...field}
        aria-invalid={meta.touched && !!meta.error}
      />
      {meta.touched && meta.error && (
        <p className="text-sm text-destructive">{meta.error}</p>
      )}
    </div>
  );
}
