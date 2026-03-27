"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageContainer } from "@/components/layout/page-container";
import { authService, invitesService } from "@/lib/api/services";
import { getAccessToken, getErrorMessage, setAccessToken } from "@/lib/api/error-handler";
import type { InviteInfo } from "@/types";
import { cn } from "@/lib/utils";

type JoinMode = "new" | "existing";

const newUserSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const existingUserSchema = Yup.object({
  password: Yup.string().required("Password is required"),
});

export function AcceptInviteFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviteAlreadyAccepted, setIsInviteAlreadyAccepted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const [mode, setMode] = useState<JoinMode>("new");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showExistingPassword, setShowExistingPassword] = useState(false);

  const modeFromInvite = useMemo<JoinMode | null>(() => {
    if (inviteInfo?.isEmailRegistered === true) return "existing";
    if (inviteInfo?.isEmailRegistered === false) return "new";
    return null;
  }, [inviteInfo]);

  const loadInvite = async () => {
    if (!token) {
      setInviteError("Missing invite token.");
      setIsLoadingInvite(false);
      return;
    }

    setIsLoadingInvite(true);
    setInviteError(null);
    setIsInviteAlreadyAccepted(false);
    try {
      const { data } = await invitesService.getByToken(token);
      setInviteInfo(data);
      if (typeof data.isEmailRegistered === "boolean") {
        setMode(data.isEmailRegistered ? "existing" : "new");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; statusCode?: number }>;
      const statusCode = axiosError.response?.status ?? axiosError.response?.data?.statusCode;
      const backendMessage = axiosError.response?.data?.message;
      if (statusCode === 409 && backendMessage) {
        setIsInviteAlreadyAccepted(true);
        setInviteError(backendMessage);
      } else {
        setInviteError(getErrorMessage(error));
      }
    } finally {
      setIsLoadingInvite(false);
    }
  };

  useEffect(() => {
    void loadInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleAccepted = () => {
    setIsAccepted(true);
    setTimeout(() => router.push("/dashboard"), 1200);
  };

  const ensureLoggedInSilently = async (email: string, password: string) => {
    // If a session token already exists, do not force another login.
    if (getAccessToken()) {
      return;
    }

    const loginRes = await authService.login({ email, password });
    const loginToken = loginRes.data.accessToken ?? loginRes.data.token;
    if (loginToken) {
      setAccessToken(loginToken);
    }
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl py-14">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex text-xl font-bold tracking-tight">
            <span className="text-primary">Legal</span>
            <span className="text-foreground">CRM</span>
          </Link>
        </div>

        <div className="space-y-6 rounded-2xl border bg-card p-7 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Accept Team Invite</h1>
            <p className="text-[15px] text-muted-foreground">
              Choose how you want to continue and we will connect you to your firm instantly.
            </p>
          </div>

          {isLoadingInvite ? (
            <p className="text-sm text-muted-foreground">Checking invite link...</p>
          ) : null}

          {!isLoadingInvite && inviteError ? (
            isInviteAlreadyAccepted ? (
              <div className="space-y-3 rounded-md border border-amber-500/40 bg-amber-50 p-4 text-amber-900">
                <p className="text-sm font-semibold">{inviteError}</p>
                <p className="text-sm">
                  This invite link has already been used. You can sign in to continue.
                </p>
                <Button type="button" onClick={() => router.push("/login")}>
                  Go to Login
                </Button>
              </div>
            ) : (
              <div className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3">
                <p className="text-sm text-destructive">Failed to load invite: {inviteError}</p>
                <Button type="button" variant="outline" onClick={() => void loadInvite()}>
                  Retry
                </Button>
              </div>
            )
          ) : null}

          {!isLoadingInvite && !inviteError && inviteInfo ? (
            <>
              {isAccepted ? (
                <div className="space-y-2 rounded-md border border-green-600/30 bg-green-50 p-3 text-green-800">
                  <p className="text-sm font-medium">Invite accepted. You are now part of the team.</p>
                  <p className="text-sm">Redirecting to dashboard...</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-2 rounded-xl border bg-muted/10 p-2 sm:grid-cols-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setMode("new")}
                      className={cn(
                        "h-10 justify-start rounded-lg",
                        mode === "new" && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      Create a new account
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setMode("existing")}
                      className={cn(
                        "h-10 justify-start rounded-lg",
                        mode === "existing" &&
                          "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      Sign in to existing account
                    </Button>
                  </div>
                  {modeFromInvite ? (
                    <p className="text-xs text-muted-foreground">
                      Recommended:{" "}
                      <span className="font-medium text-foreground">
                        {modeFromInvite === "new"
                          ? "Create a new account"
                          : "Sign in to existing account"}
                      </span>
                    </p>
                  ) : null}

                  {mode === "new" ? (
                    <Formik<{ name: string; password: string }>
                      initialValues={{ name: "", password: "" }}
                      validationSchema={newUserSchema}
                      onSubmit={async (values, helpers) => {
                        setSubmitError(null);
                        try {
                          const { data } = await invitesService.acceptFirmInvite({
                            token,
                            name: values.name,
                            password: values.password,
                          });
                          const receivedToken = data.accessToken ?? data.token;
                          if (receivedToken) {
                            setAccessToken(receivedToken);
                          } else {
                            await ensureLoggedInSilently(inviteInfo.email, values.password);
                          }
                          handleAccepted();
                        } catch (error) {
                          setSubmitError(getErrorMessage(error));
                        } finally {
                          helpers.setSubmitting(false);
                        }
                      }}
                    >
                      {({ isSubmitting, values, errors, touched, handleChange, handleBlur }) => (
                        <Form className="space-y-4 rounded-xl border p-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="name">Full name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={values.name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              disabled={isSubmitting}
                              aria-invalid={touched.name && !!errors.name}
                              placeholder="Your full name"
                              className="h-10"
                            />
                            {touched.name && errors.name ? (
                              <p className="text-sm text-destructive">{errors.name}</p>
                            ) : null}
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="password">Create password</Label>
                            <div className="relative">
                              <Input
                                id="password"
                                name="password"
                                type={showNewPassword ? "text" : "password"}
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={isSubmitting}
                                aria-invalid={touched.password && !!errors.password}
                                placeholder="Minimum 8 characters"
                                className="h-10 pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="absolute right-1 top-1/2 -translate-y-1/2"
                                onClick={() => setShowNewPassword((prev) => !prev)}
                                aria-label={showNewPassword ? "Hide password" : "Show password"}
                                disabled={isSubmitting}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            {touched.password && errors.password ? (
                              <p className="text-sm text-destructive">{errors.password}</p>
                            ) : null}
                          </div>

                          {submitError ? (
                            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                              {submitError}
                            </p>
                          ) : null}

                          <Button type="submit" disabled={isSubmitting} className="h-10 px-4 font-semibold">
                            {isSubmitting ? "Creating account..." : "Create Account & Join Team"}
                          </Button>
                        </Form>
                      )}
                    </Formik>
                  ) : (
                    <Formik<{ password: string }>
                      initialValues={{ password: "" }}
                      validationSchema={existingUserSchema}
                      onSubmit={async (values, helpers) => {
                        setSubmitError(null);
                        try {
                          await ensureLoggedInSilently(inviteInfo.email, values.password);

                          await invitesService.acceptExistingFirmInvite({ token });
                          handleAccepted();
                        } catch (error) {
                          setSubmitError(getErrorMessage(error));
                        } finally {
                          helpers.setSubmitting(false);
                        }
                      }}
                    >
                      {({ isSubmitting, values, errors, touched, handleChange, handleBlur }) => (
                        <Form className="space-y-4 rounded-xl border p-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="existing-email">Email</Label>
                            <Input id="existing-email" value={inviteInfo.email} disabled className="h-10" />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="existing-password">Password</Label>
                            <div className="relative">
                              <Input
                                id="existing-password"
                                name="password"
                                type={showExistingPassword ? "text" : "password"}
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={isSubmitting}
                                aria-invalid={touched.password && !!errors.password}
                                placeholder="Enter your account password"
                                className="h-10 pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="absolute right-1 top-1/2 -translate-y-1/2"
                                onClick={() => setShowExistingPassword((prev) => !prev)}
                                aria-label={showExistingPassword ? "Hide password" : "Show password"}
                                disabled={isSubmitting}
                              >
                                {showExistingPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            {touched.password && errors.password ? (
                              <p className="text-sm text-destructive">{errors.password}</p>
                            ) : null}
                          </div>

                          {submitError ? (
                            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                              {submitError}
                            </p>
                          ) : null}

                          <Button type="submit" disabled={isSubmitting} className="h-10 px-4 font-semibold">
                            {isSubmitting ? "Signing in..." : "Sign In & Join Team"}
                          </Button>
                        </Form>
                      )}
                    </Formik>
                  )}
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
