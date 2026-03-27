"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { FormikInputField } from "@/formik";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid credentials. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center py-16">
        <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold">
            <span className="text-primary">Legal</span>
            <span className="text-foreground">CRM</span>
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
              Sign in to your <span className="text-primary">practice</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Access your practice management dashboard
            </p>
          </div>
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            <Form className="space-y-5">
              <GoogleSignInButton variant="login" />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>
              <FormikInputField
                name="email"
                label="Email"
                type="email"
                placeholder="attorney@lawfirm.com"
              />
              <FormikInputField
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                showPasswordToggle
              />
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </Form>
          </Formik>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Start free trial
            </Link>
          </p>
        </div>
        </div>
      </div>
    </PageContainer>
  );
}
