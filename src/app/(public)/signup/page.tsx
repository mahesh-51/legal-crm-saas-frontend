"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { FormikInputField } from "@/formik";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Building2, User, FileCheck } from "lucide-react";

const signupSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  role: Yup.string()
    .oneOf(["firm", "lawyer", "client"])
    .required("Please select your role"),
});

const roleOptions = [
  {
    value: "firm",
    label: "Law Firm",
    hint: "Firm admins, managing partners",
    icon: Building2,
  },
  {
    value: "lawyer",
    label: "Individual Attorney",
    hint: "Solo practitioners, associates",
    icon: User,
  },
  {
    value: "client",
    label: "Client",
    hint: "Represented by a lawyer",
    icon: FileCheck,
  },
] as const;

function RoleTabs() {
  const { values, setFieldValue } = useFormikContext<{
    role: "firm" | "lawyer" | "client";
  }>();
  const selectedRole = values.role;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        How will you use LegalCRM?
      </label>
      <div className="grid grid-cols-3 gap-2">
        {roleOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedRole === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFieldValue("role", option.value)}
              title={option.hint}
              className={`
                flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3
                text-center transition-all duration-200
                ${isSelected
                  ? "border-primary border-2 bg-primary/5 shadow-sm"
                  : "border-border bg-white hover:border-primary/30 hover:bg-primary/[0.02]"
                }
              `}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={1.75}
              />
              <span className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                {option.label}
              </span>
              <span className={`text-[10px] leading-tight ${isSelected ? "text-primary/80" : "text-muted-foreground"}`}>
                {option.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: {
    name: string;
    email: string;
    password: string;
    role: "firm" | "lawyer" | "client";
  }) => {
    setIsLoading(true);
    try {
      await signup(values);
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Signup failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center bg-slate-50/50 py-16">
        <div className="w-full max-w-lg px-4">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex text-xl font-bold tracking-tight">
              <span className="text-primary">Legal</span>
              <span className="text-foreground">CRM</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-white p-10 shadow-xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Start your{" "}
                <span className="text-primary">free trial</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose your account type and get started in minutes
              </p>
            </div>

            <Formik
              initialValues={{
                name: "",
                email: "",
                password: "",
                role: "lawyer" as "firm" | "lawyer" | "client",
              }}
              validationSchema={signupSchema}
              onSubmit={handleSubmit}
            >
              <Form className="space-y-6">
                <RoleTabs />
                <GoogleSignInButton variant="signup" />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or sign up with email</span>
                  </div>
                </div>
                <FormikInputField
                  name="name"
                  label="Full name"
                  placeholder="Jane Smith"
                  className="h-10 rounded-lg border-border bg-white"
                />
                <FormikInputField
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="jane@lawfirm.com"
                  className="h-10 rounded-lg border-border bg-white"
                />
                <FormikInputField
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  className="h-10 rounded-lg border-border bg-white"
                />

                <Button
                  type="submit"
                  className="h-12 w-full rounded-lg bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </Form>
            </Formik>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
