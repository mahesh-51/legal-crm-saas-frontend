"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FormikInputField } from "@/formik";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, User, UserCircle } from "lucide-react";
import { FormSection } from "@/components/dashboard/form-section";

const profileSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function ProfilePage() {
  const { user } = useAuth();

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/20 p-6 shadow-sm ring-1 ring-border/40 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-primary/[0.04] blur-2xl" />
        <div className="relative space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Profile</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            Your account, role, and display name
          </p>
        </div>
      </div>

      <Card className="border-border/80 shadow-sm ring-1 ring-border/40">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-2 ring-border/60">
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="mt-1 text-sm capitalize text-muted-foreground">{user?.role}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Formik
        initialValues={{
          name: user?.name || "",
          email: user?.email || "",
        }}
        validationSchema={profileSchema}
        enableReinitialize
        onSubmit={() => {
          toast.success("Profile updated");
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <>
            <Form className="space-y-6">
              <FormSection
                icon={UserCircle}
                title="Account details"
                description="Name shown in the app. Email is read-only if managed by your firm."
              >
                <div className="min-w-0 md:col-span-12">
                  <FormikInputField name="name" label="Full name" icon={User} />
                </div>
                <div className="min-w-0 md:col-span-12">
                  <FormikInputField
                    name="email"
                    label="Email"
                    type="email"
                    disabled
                    icon={Mail}
                  />
                </div>
              </FormSection>
            </Form>
            <div className="flex flex-wrap justify-end gap-3 rounded-2xl border border-border/80 bg-muted/30 p-4 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
              <Button type="button" onClick={() => submitForm()} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </>
        )}
      </Formik>
    </div>
  );
}
