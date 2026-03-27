"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { useField } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  /** Show eye toggle for password fields */
  showPasswordToggle?: boolean;
}

export function FormikInputField({
  name,
  label,
  type = "text",
  placeholder,
  disabled,
  className,
  icon: Icon,
  showPasswordToggle = false,
}: FormikInputFieldProps) {
  const [field, meta] = useField(name);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === "password";
  const effectiveType =
    isPasswordField && showPasswordToggle ? (isPasswordVisible ? "text" : "password") : type;

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
          type={effectiveType}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(Icon && "h-10 pl-10", showPasswordToggle && isPasswordField && "pr-10", className)}
          {...field}
          aria-invalid={meta.touched && !!meta.error}
        />
        {showPasswordToggle && isPasswordField ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            disabled={disabled}
          >
            {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        ) : null}
      </div>
      {meta.touched && meta.error && (
        <p className="text-sm text-destructive">{meta.error}</p>
      )}
    </div>
  );
}
