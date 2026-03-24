"use client";

import { useEffect, useState } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CreditCard,
  IdCard,
  Mail,
  Phone,
  ShieldCheck,
  Upload,
  User,
  UserCircle,
} from "lucide-react";
import { FormikInputField, FormikSelectField } from "@/formik";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FormSection } from "@/components/dashboard/form-section";
import { useAppDispatch } from "@/hooks/use-redux";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { createClient, updateClient, fetchClientById } from "@/store/slices/clients.slice";
import { clientsService, type KycKind } from "@/lib/api/services/clients.service";
import { getPublicApiFileUrl } from "@/lib/public-file-url";
import type { Client, ClientVerificationDocumentType, ClientVerificationStatus } from "@/types";
import { cn } from "@/lib/utils";

const VERIFICATION_STATUS_OPTIONS: { value: ClientVerificationStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "VERIFIED", label: "Verified" },
  { value: "REJECTED", label: "Rejected" },
];

/** Client picks one ID type for KYC — Aadhaar, PAN, or driving licence. */
const DOCUMENT_TYPE_OPTIONS: { value: "" | ClientVerificationDocumentType; label: string }[] = [
  { value: "", label: "Not selected" },
  { value: "aadhaar", label: "Aadhaar" },
  { value: "pan", label: "PAN" },
  { value: "driving", label: "Driving licence" },
];

const clientSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  phone: Yup.string().required("Phone is required"),
  email: Yup.string().email("Invalid email").optional(),
  verificationStatus: Yup.string()
    .oneOf(["PENDING", "VERIFIED", "REJECTED"])
    .optional(),
  verificationDocumentType: Yup.string()
    .oneOf(["", "aadhaar", "pan", "driving"])
    .optional(),
  aadhaarCard: Yup.string().optional(),
  panCard: Yup.string().optional(),
  drivingLicense: Yup.string().optional(),
});

type ClientFormValues = {
  name: string;
  phone: string;
  email: string;
  verificationStatus: ClientVerificationStatus;
  verificationDocumentType: "" | ClientVerificationDocumentType;
  aadhaarCard: string;
  panCard: string;
  drivingLicense: string;
};

type ClientFormProps =
  | { mode: "create"; client?: undefined }
  | { mode: "edit"; client: Client };

function statusBadgeClass(s: ClientVerificationStatus) {
  if (s === "VERIFIED") return "bg-emerald-500/15 text-emerald-800";
  if (s === "REJECTED") return "bg-destructive/15 text-destructive";
  return "bg-amber-500/15 text-amber-900";
}

function existingKycPathForKind(
  client: Client | undefined,
  kind: ClientVerificationDocumentType | ""
): string | null {
  if (!client || !kind) return null;
  if (kind === "aadhaar") return client.aadhaarDocumentUrl ?? null;
  if (kind === "pan") return client.panDocumentUrl ?? null;
  return client.drivingLicenseDocumentUrl ?? null;
}

function pathLooksLikeImage(pathOrName: string): boolean {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(pathOrName);
}

function pathLooksLikePdf(pathOrName: string): boolean {
  return /\.pdf$/i.test(pathOrName);
}

function KycDocumentPreview({
  pendingFile,
  existingRelativeUrl,
}: {
  pendingFile: File | null;
  existingRelativeUrl: string | null;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [imgLoadFailed, setImgLoadFailed] = useState(false);

  useEffect(() => {
    if (!pendingFile) {
      setBlobUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const absoluteFromExisting = getPublicApiFileUrl(existingRelativeUrl);
  const resolvedUrl = blobUrl ?? absoluteFromExisting;

  useEffect(() => {
    setImgLoadFailed(false);
  }, [resolvedUrl]);

  if (!resolvedUrl) return null;

  const displayName =
    pendingFile?.name ?? existingRelativeUrl?.split(/[/\\]/).pop() ?? "Document";
  const isPdf =
    pendingFile?.type === "application/pdf" || pathLooksLikePdf(displayName);
  const isImage =
    !isPdf &&
    (Boolean(pendingFile?.type?.startsWith("image/")) || pathLooksLikeImage(displayName));

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-border/80 bg-background p-3">
      <p className="text-xs font-medium text-muted-foreground">Preview</p>
      {isImage && !imgLoadFailed && (
        // eslint-disable-next-line @next/next/no-img-element -- blob URLs and API file URLs
        <img
          src={resolvedUrl}
          alt=""
          className="max-h-64 w-full max-w-md rounded-md border border-border/60 bg-muted/20 object-contain object-left-top"
          onError={() => setImgLoadFailed(true)}
        />
      )}
      {isImage && imgLoadFailed && (
        <p className="text-xs text-muted-foreground">
          Could not load image preview.
          {absoluteFromExisting ? (
            <>
              {" "}
              <a
                href={absoluteFromExisting}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-2"
              >
                Open file
              </a>
            </>
          ) : null}
        </p>
      )}
      {isPdf && (
        <div className="space-y-2">
          <iframe
            title={displayName}
            src={resolvedUrl}
            className="h-64 w-full max-w-md rounded-md border border-border bg-muted/30"
          />
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-xs text-primary underline underline-offset-2"
          >
            Open PDF in new tab
          </a>
        </div>
      )}
      {!isImage && !isPdf && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{displayName}</span>
        </p>
      )}
      {pendingFile && (
        <p className="text-xs text-muted-foreground">
          New file selected — uploads when you save changes.
        </p>
      )}
      {!pendingFile && existingRelativeUrl && (
        <p className="text-xs text-muted-foreground">Current file on record.</p>
      )}
    </div>
  );
}

function ClientFormFields({
  mode,
  client,
  pendingKycFile,
  setPendingKycFile,
}: {
  mode: "create" | "edit";
  client?: Client;
  pendingKycFile: File | null;
  setPendingKycFile: React.Dispatch<React.SetStateAction<File | null>>;
}) {
  const router = useRouter();
  const { values, submitForm, isSubmitting } = useFormikContext<ClientFormValues>();

  useEffect(() => {
    setPendingKycFile(null);
  }, [values.verificationDocumentType, setPendingKycFile]);

  return (
    <>
      <Form className="space-y-6">
              <FormSection
                icon={UserCircle}
                title="Contact"
                description="How your firm reaches this client."
              >
                <div className="min-w-0 md:col-span-12">
                  <FormikInputField
                    name="name"
                    label="Name"
                    placeholder="Client name"
                    icon={User}
                  />
                </div>
                <div className="min-w-0 md:col-span-6">
                  <FormikInputField
                    name="phone"
                    label="Phone"
                    placeholder="+91 98765 43210"
                    icon={Phone}
                  />
                </div>
                <div className="min-w-0 md:col-span-6">
                  <FormikInputField
                    name="email"
                    label="Email (optional)"
                    type="email"
                    placeholder="name@example.com"
                    icon={Mail}
                  />
                </div>
                <div className="min-w-0 md:col-span-12">
                  <FormikSelectField
                    name="verificationStatus"
                    label="Verification status"
                    icon={ShieldCheck}
                    placeholder="Select status"
                    options={VERIFICATION_STATUS_OPTIONS}
                  />
                </div>
              </FormSection>

              <FormSection
                icon={IdCard}
                title="KYC identifiers"
                description="Select a document type, then enter the reference for that ID only."
              >
                <div className="min-w-0 md:col-span-12">
                  <FormikSelectField
                    name="verificationDocumentType"
                    label="Verify client using"
                    icon={IdCard}
                    placeholder="Select"
                    options={DOCUMENT_TYPE_OPTIONS}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Only the fields for your selection are shown below.
                  </p>
                </div>
                {values.verificationDocumentType === "aadhaar" && (
                  <div className="min-w-0 md:col-span-12">
                    <FormikInputField
                      name="aadhaarCard"
                      label="Aadhaar (last digits or reference)"
                      placeholder="e.g. XXXX1212"
                      icon={CreditCard}
                    />
                  </div>
                )}
                {values.verificationDocumentType === "pan" && (
                  <div className="min-w-0 md:col-span-12">
                    <FormikInputField
                      name="panCard"
                      label="PAN"
                      placeholder="e.g. ABCDE1234F"
                      icon={IdCard}
                    />
                  </div>
                )}
                {values.verificationDocumentType === "driving" && (
                  <div className="min-w-0 md:col-span-12">
                    <FormikInputField
                      name="drivingLicense"
                      label="Driving licence"
                      placeholder="e.g. Licence number"
                      icon={CreditCard}
                    />
                  </div>
                )}
                {values.verificationDocumentType === "" && (
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground md:col-span-12">
                    Select Aadhaar, PAN, or driving licence above to enter the reference.
                  </div>
                )}
              </FormSection>
            </Form>

            {mode === "edit" && (
              <FormSection
                icon={Upload}
                title="Upload KYC document"
                description="Choose a file below; it is sent only when you click Save changes (after your client details are saved)."
              >
                <div className="min-w-0 md:col-span-12 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Overall status:</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs font-medium",
                        statusBadgeClass(values.verificationStatus as ClientVerificationStatus)
                      )}
                    >
                      {values.verificationStatus}
                    </Badge>
                    {values.verificationDocumentType ? (
                      <span className="text-muted-foreground">
                        · Upload for:{" "}
                        <span className="font-medium text-foreground">
                          {DOCUMENT_TYPE_OPTIONS.find((o) => o.value === values.verificationDocumentType)
                            ?.label ?? values.verificationDocumentType}
                        </span>
                      </span>
                    ) : null}
                  </div>

                  {values.verificationDocumentType === "aadhaar" && (
                    <div className="max-w-xl rounded-xl border border-border/80 bg-muted/20 p-4 ring-2 ring-primary/25">
                      <Label htmlFor="kyc-aadhaar" className="text-sm font-medium">
                        Aadhaar upload
                      </Label>
                      <input
                        id="kyc-aadhaar"
                        type="file"
                        className="mt-2 block w-full text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary"
                        accept=".pdf,image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setPendingKycFile(f);
                          e.target.value = "";
                        }}
                      />
                      <KycDocumentPreview
                        pendingFile={pendingKycFile}
                        existingRelativeUrl={existingKycPathForKind(client, "aadhaar")}
                      />
                      {!pendingKycFile && !existingKycPathForKind(client, "aadhaar") && (
                        <p className="mt-2 text-xs text-muted-foreground">No file uploaded yet.</p>
                      )}
                    </div>
                  )}
                  {values.verificationDocumentType === "pan" && (
                    <div className="max-w-xl rounded-xl border border-border/80 bg-muted/20 p-4 ring-2 ring-primary/25">
                      <Label htmlFor="kyc-pan" className="text-sm font-medium">
                        PAN upload
                      </Label>
                      <input
                        id="kyc-pan"
                        type="file"
                        className="mt-2 block w-full text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary"
                        accept=".pdf,image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setPendingKycFile(f);
                          e.target.value = "";
                        }}
                      />
                      <KycDocumentPreview
                        pendingFile={pendingKycFile}
                        existingRelativeUrl={existingKycPathForKind(client, "pan")}
                      />
                      {!pendingKycFile && !existingKycPathForKind(client, "pan") && (
                        <p className="mt-2 text-xs text-muted-foreground">No file uploaded yet.</p>
                      )}
                    </div>
                  )}
                  {values.verificationDocumentType === "driving" && (
                    <div className="max-w-xl rounded-xl border border-border/80 bg-muted/20 p-4 ring-2 ring-primary/25">
                      <Label htmlFor="kyc-driving" className="text-sm font-medium">
                        Driving licence upload
                      </Label>
                      <input
                        id="kyc-driving"
                        type="file"
                        className="mt-2 block w-full text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary"
                        accept=".pdf,image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setPendingKycFile(f);
                          e.target.value = "";
                        }}
                      />
                      <KycDocumentPreview
                        pendingFile={pendingKycFile}
                        existingRelativeUrl={existingKycPathForKind(client, "driving")}
                      />
                      {!pendingKycFile && !existingKycPathForKind(client, "driving") && (
                        <p className="mt-2 text-xs text-muted-foreground">No file uploaded yet.</p>
                      )}
                    </div>
                  )}
                  {values.verificationDocumentType === "" && (
                    <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground md:col-span-12">
                      Choose a verification document type above to enable upload.
                    </div>
                  )}
                </div>
              </FormSection>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-border/80 bg-muted/30 p-4 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
              <Button type="button" variant="outline" onClick={() => router.push("/clients")}>
                Cancel
              </Button>
              <Button type="button" onClick={() => submitForm()} disabled={isSubmitting}>
                {isSubmitting
                  ? mode === "create"
                    ? "Creating..."
                    : "Saving..."
                  : mode === "create"
                    ? "Create client"
                    : "Save changes"}
              </Button>
            </div>
    </>
  );
}

export function ClientForm(props: ClientFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const firmId = useCurrentFirmId();
  const [pendingKycFile, setPendingKycFile] = useState<File | null>(null);

  const initialValues: ClientFormValues =
    props.mode === "edit"
      ? {
          name: props.client.name,
          phone: props.client.phone ?? "",
          email: props.client.email ?? "",
          verificationStatus: (props.client.verificationStatus ?? "PENDING") as ClientVerificationStatus,
          verificationDocumentType: (props.client.verificationDocumentType ?? "") as
            | ""
            | ClientVerificationDocumentType,
          aadhaarCard: props.client.aadhaarCard ?? "",
          panCard: props.client.panCard ?? "",
          drivingLicense: props.client.drivingLicense ?? "",
        }
      : {
          name: "",
          phone: "",
          email: "",
          verificationStatus: "PENDING" as ClientVerificationStatus,
          verificationDocumentType: "" as "" | ClientVerificationDocumentType,
          aadhaarCard: "",
          panCard: "",
          drivingLicense: "",
        };

  return (
    <div className="space-y-6">
      <Formik<ClientFormValues>
        enableReinitialize
        initialValues={initialValues}
        validationSchema={clientSchema}
        onSubmit={async (values) => {
          const kycPayload = {
            verificationStatus: values.verificationStatus,
            verificationDocumentType:
              values.verificationDocumentType === ""
                ? null
                : (values.verificationDocumentType as ClientVerificationDocumentType),
            aadhaarCard: values.aadhaarCard.trim() || undefined,
            panCard: values.panCard.trim() || undefined,
            drivingLicense: values.drivingLicense.trim() || undefined,
          };

          if (props.mode === "create") {
            if (!firmId) {
              toast.error("No firm selected");
              return;
            }
            const result = await dispatch(
              createClient({
                firmId,
                payload: {
                  name: values.name,
                  phone: values.phone,
                  email: values.email || undefined,
                  ...kycPayload,
                },
              })
            );
            if (createClient.fulfilled.match(result)) {
              toast.success("Client created");
              router.push("/clients");
            } else {
              toast.error(
                (result.payload as { message?: string })?.message ?? "Failed to create client"
              );
            }
            return;
          }

          const result = await dispatch(
            updateClient({
              clientId: props.client.id,
              payload: {
                name: values.name,
                phone: values.phone,
                email: values.email || undefined,
                ...kycPayload,
              },
            })
          );
          if (!updateClient.fulfilled.match(result)) {
            toast.error(
              (result.payload as { message?: string })?.message ?? "Failed to update client"
            );
            return;
          }

          const kind = values.verificationDocumentType;
          if (pendingKycFile && kind !== "") {
            try {
              await clientsService.uploadKycDocument(props.client.id, kind as KycKind, pendingKycFile);
            } catch {
              toast.error("Client saved, but document upload failed");
              setPendingKycFile(null);
              await dispatch(fetchClientById(props.client.id)).unwrap();
              router.push("/clients");
              return;
            }
          }

          setPendingKycFile(null);
          await dispatch(fetchClientById(props.client.id)).unwrap();
          toast.success("Client updated");
          router.push("/clients");
        }}
      >
        <ClientFormFields
          mode={props.mode}
          client={props.mode === "edit" ? props.client : undefined}
          pendingKycFile={pendingKycFile}
          setPendingKycFile={setPendingKycFile}
        />
      </Formik>
    </div>
  );
}
