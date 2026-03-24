"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FormikInputField } from "@/formik";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const profileSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function ProfilePage() {
  const { user } = useAuth();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account and contact information
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-sm capitalize mt-1">{user?.role}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              name: user?.name || "",
              email: user?.email || "",
            }}
            validationSchema={profileSchema}
            onSubmit={(values) => {
              toast.success("Profile updated");
            }}
          >
            {({ submitForm, isSubmitting }) => (
              <Form className="space-y-4 max-w-md">
                <FormikInputField name="name" label="Full name" />
                <FormikInputField name="email" label="Email" type="email" disabled />
                <Button onClick={() => submitForm()} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save changes"}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}
