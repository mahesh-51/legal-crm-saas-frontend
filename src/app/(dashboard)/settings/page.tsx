"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useCurrentFirmId } from "@/hooks/use-current-firm";
import { fetchFirmById, updateFirm } from "@/store/slices/firms.slice";
import { updateMe } from "@/store/slices/auth.slice";
import { getErrorMessage } from "@/lib/api/error-handler";
import type { FirmProfileType, UserNotificationPreferences } from "@/types";
import { firmProfileTypeFromUser } from "@/lib/user-role";
import type { UpdateFirmDto } from "@/lib/api/services/firms.service";

const ACCOUNT_TYPE_LABEL: Record<FirmProfileType, string> = {
  FIRM: "Firm",
  INDIVIDUAL: "Individual",
  CLIENT: "Client",
};

const DEFAULT_NOTIFICATION_PREFS: UserNotificationPreferences = {
  dailyListingReminders: true,
  invoiceDueReminders: true,
  documentUploadNotifications: false,
};

function buildFirmPayload(
  profileType: FirmProfileType,
  values: {
    name: string;
    address: string;
    phone: string;
    contactEmail: string;
    registrationNumber: string;
    websiteUrl: string;
    barEnrollmentNumber: string;
    contactPersonName: string;
  }
): UpdateFirmDto {
  const base: UpdateFirmDto = {
    profileType,
    name: values.name.trim(),
    address: values.address.trim() || null,
    phone: values.phone.trim() || null,
    contactEmail: values.contactEmail.trim() || null,
  };
  if (profileType === "FIRM") {
    return {
      ...base,
      registrationNumber: values.registrationNumber.trim() || null,
      websiteUrl: values.websiteUrl.trim() || null,
      barEnrollmentNumber: null,
      contactPersonName: null,
    };
  }
  if (profileType === "INDIVIDUAL") {
    return {
      ...base,
      barEnrollmentNumber: values.barEnrollmentNumber.trim() || null,
      registrationNumber: null,
      websiteUrl: null,
      contactPersonName: null,
    };
  }
  return {
    ...base,
    contactPersonName: values.contactPersonName.trim() || null,
    registrationNumber: null,
    websiteUrl: null,
    barEnrollmentNumber: null,
  };
}

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const firmId = useCurrentFirmId();
  const firm = useAppSelector((s) => s.firms.selected);
  const firmsLoading = useAppSelector((s) => s.firms.isLoading);
  const user = useAppSelector((s) => s.auth.user);
  const authLoading = useAppSelector((s) => s.auth.isLoading);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [barEnrollmentNumber, setBarEnrollmentNumber] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");

  const [dailyListingReminders, setDailyListingReminders] = useState(
    DEFAULT_NOTIFICATION_PREFS.dailyListingReminders
  );
  const [invoiceDueReminders, setInvoiceDueReminders] = useState(
    DEFAULT_NOTIFICATION_PREFS.invoiceDueReminders
  );
  const [documentUploadNotifications, setDocumentUploadNotifications] =
    useState(DEFAULT_NOTIFICATION_PREFS.documentUploadNotifications);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    if (!firmId) return;
    dispatch(fetchFirmById(firmId));
  }, [dispatch, firmId]);

  useEffect(() => {
    if (firmId && firm) {
      setName(firm.name ?? "");
      setAddress(firm.address ?? "");
      setPhone(firm.phone ?? "");
      setContactEmail(firm.contactEmail ?? "");
      setRegistrationNumber(firm.registrationNumber ?? "");
      setWebsiteUrl(firm.websiteUrl ?? "");
      setBarEnrollmentNumber(firm.barEnrollmentNumber ?? "");
      setContactPersonName(firm.contactPersonName ?? "");
      return;
    }
    if (!firmId && user) {
      setName(user.name ?? "");
      setAddress(user.address ?? "");
      setPhone(user.phone ?? "");
      setContactEmail(user.contactEmail ?? "");
      setRegistrationNumber(user.registrationNumber ?? "");
      setWebsiteUrl(user.websiteUrl ?? "");
      setBarEnrollmentNumber(user.barEnrollmentNumber ?? "");
      setContactPersonName(user.contactPersonName ?? "");
    }
  }, [firmId, firm, user]);

  useEffect(() => {
    const p = user?.notificationPreferences;
    if (!p) return;
    setDailyListingReminders(p.dailyListingReminders);
    setInvoiceDueReminders(p.invoiceDueReminders);
    setDocumentUploadNotifications(p.documentUploadNotifications);
  }, [user?.notificationPreferences]);

  const profileLoading = firmId != null && firmsLoading && !firm;

  const profileType = useMemo(
    () => firmProfileTypeFromUser(user, firm?.profileType ?? null),
    [user, firm?.profileType]
  );

  /** Solo accounts store profile on the user (`PATCH /users/me`), not on a firm row. */
  const userLevelProfile =
    !firmId &&
    user != null &&
    (profileType === "INDIVIDUAL" || profileType === "CLIENT");

  /** Firm role without a `firmId` cannot edit profile here (must create/join a workspace). */
  const needsFirmWorkspace =
    !firmId && user != null && profileType === "FIRM";

  const primaryNameLabel = useMemo(() => {
    if (profileType === "FIRM") return "Firm name";
    if (profileType === "INDIVIDUAL") return "Full name";
    return "Organization name";
  }, [profileType]);

  const saveProfile = useCallback(async () => {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (needsFirmWorkspace) {
      toast.error(
        "No firm workspace is linked. Create or join a firm to edit this profile."
      );
      return;
    }
    setSavingProfile(true);
    try {
      if (firmId) {
        const payload = buildFirmPayload(profileType, {
          name,
          address,
          phone,
          contactEmail,
          registrationNumber,
          websiteUrl,
          barEnrollmentNumber,
          contactPersonName,
        });
        await dispatch(updateFirm({ firmId, payload })).unwrap();
      } else if (userLevelProfile) {
        if (profileType === "INDIVIDUAL") {
          await dispatch(
            updateMe({
              name: name.trim(),
              address: address.trim() || null,
              phone: phone.trim() || null,
              contactEmail: contactEmail.trim() || null,
              barEnrollmentNumber: barEnrollmentNumber.trim() || null,
              registrationNumber: null,
              websiteUrl: null,
              contactPersonName: null,
            })
          ).unwrap();
        } else {
          await dispatch(
            updateMe({
              name: name.trim(),
              address: address.trim() || null,
              phone: phone.trim() || null,
              contactEmail: contactEmail.trim() || null,
              contactPersonName: contactPersonName.trim() || null,
              registrationNumber: null,
              websiteUrl: null,
              barEnrollmentNumber: null,
            })
          ).unwrap();
        }
      } else {
        toast.error("Profile could not be saved.");
        return;
      }
      toast.success("Profile saved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  }, [
    firmId,
    name,
    address,
    phone,
    contactEmail,
    registrationNumber,
    websiteUrl,
    barEnrollmentNumber,
    contactPersonName,
    profileType,
    dispatch,
    needsFirmWorkspace,
    userLevelProfile,
  ]);

  const saveNotifications = useCallback(async () => {
    setSavingNotifications(true);
    try {
      const notificationPreferences: UserNotificationPreferences = {
        dailyListingReminders,
        invoiceDueReminders,
        documentUploadNotifications,
      };
      await dispatch(updateMe({ notificationPreferences })).unwrap();
      toast.success("Notification preferences saved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingNotifications(false);
    }
  }, [
    dispatch,
    dailyListingReminders,
    invoiceDueReminders,
    documentUploadNotifications,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Firm profile, billing, and notifications
        </p>
      </div>
      <div className="space-y-6">
        <Card className="border-border/80 bg-card shadow-sm">
          <CardHeader>
            <h3 className="font-semibold">
              {firmId ? "Firm profile" : "Profile"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {firmId
                ? "Name, address, and contact information (account type follows your login role)"
                : "Your name, address, and contact information (account type follows your login role)"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {authLoading && !user ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            ) : needsFirmWorkspace ? (
              <p className="text-sm text-muted-foreground">
                No firm workspace is associated with your account. Create or join
                a firm to manage firm-level profile details, or sign in as an
                individual / client to edit a personal profile.
              </p>
            ) : profileLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Account type
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {ACCOUNT_TYPE_LABEL[profileType]}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {profileType === "FIRM" &&
                      "Law firm or partnership workspace (firm admin or lawyer)."}
                    {profileType === "INDIVIDUAL" &&
                      "Solo practitioner workspace."}
                    {profileType === "CLIENT" &&
                      "Client portal workspace."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-name">{primaryNameLabel}</Label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      profileType === "FIRM"
                        ? "Smith & Martinez, LLP"
                        : profileType === "INDIVIDUAL"
                          ? "Jane Doe"
                          : "Acme Corp."
                    }
                  />
                </div>

                {profileType === "FIRM" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="registration-number">
                        Registration number{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="registration-number"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="Company / LLP registration ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website-url">
                        Website{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="website-url"
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://"
                      />
                    </div>
                  </>
                )}

                {profileType === "INDIVIDUAL" && (
                  <div className="space-y-2">
                    <Label htmlFor="bar-enrollment">
                      Bar enrollment number{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="bar-enrollment"
                      value={barEnrollmentNumber}
                      onChange={(e) => setBarEnrollmentNumber(e.target.value)}
                      placeholder="State bar / council ID"
                    />
                  </div>
                )}

                {profileType === "CLIENT" && (
                  <div className="space-y-2">
                    <Label htmlFor="contact-person">Contact person</Label>
                    <Input
                      id="contact-person"
                      value={contactPersonName}
                      onChange={(e) => setContactPersonName(e.target.value)}
                      placeholder="Primary contact name"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City, State"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 …"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="office@example.com"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  className="bg-[#002D72] hover:bg-[#002D72]/90"
                  disabled={savingProfile}
                  onClick={saveProfile}
                >
                  {savingProfile ? "Saving…" : "Save changes"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-sm">
          <CardHeader>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Court date reminders and deadline alerts
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={dailyListingReminders}
                onChange={(e) => setDailyListingReminders(e.target.checked)}
                className="size-4 rounded accent-[#002D72]"
              />
              <span className="text-sm">Daily listing reminders</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={invoiceDueReminders}
                onChange={(e) => setInvoiceDueReminders(e.target.checked)}
                className="size-4 rounded accent-[#002D72]"
              />
              <span className="text-sm">Invoice due reminders</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={documentUploadNotifications}
                onChange={(e) =>
                  setDocumentUploadNotifications(e.target.checked)
                }
                className="size-4 rounded accent-[#002D72]"
              />
              <span className="text-sm">Document upload notifications</span>
            </label>
            <Button
              type="button"
              variant="secondary"
              disabled={savingNotifications}
              onClick={saveNotifications}
            >
              {savingNotifications ? "Saving…" : "Save notification preferences"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
