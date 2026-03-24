"use client";

import { useField } from "formik";
import { useRef } from "react";
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

interface FormikFileUploadProps {
  name: string;
  label?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormikFileUpload({
  name,
  label,
  accept,
  multiple = false,
  disabled,
  className,
}: FormikFileUploadProps) {
  const [field, meta, helpers] = useField(name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      helpers.setValue(multiple ? Array.from(files) : files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div
        onClick={() => inputRef.current?.click()}
        className={`flex items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 cursor-pointer hover:bg-muted/50 transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {field.value ? "File selected" : "Click to upload"}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={handleChange}
          onBlur={field.onBlur}
        />
      </div>
      {meta.touched && meta.error && (
        <p className="text-sm text-destructive">{meta.error}</p>
      )}
    </div>
  );
}
