"use client";

import { useField } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormikInputFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FormikInputField({
  name,
  label,
  type = "text",
  placeholder,
  disabled,
  className,
}: FormikInputFieldProps) {
  const [field, meta] = useField(name);

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
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
