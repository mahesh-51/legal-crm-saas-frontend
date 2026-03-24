import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Receipt,
  Calendar,
} from "lucide-react";

const screens = [
  {
    title: "Dashboard",
    description: "Practice overview at a glance—active matters, upcoming deadlines, and key metrics.",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    description: "Client profiles, contact details, matter history, and billing by client.",
    icon: Users,
  },
  {
    title: "Matters",
    description: "Case tracking, status, deadlines, and team assignments by matter.",
    icon: Briefcase,
  },
  {
    title: "Documents",
    description: "Matter-organized document storage with version control and secure access.",
    icon: FileText,
  },
  {
    title: "Invoices",
    description: "Time tracking, invoice generation, and payment tracking.",
    icon: Receipt,
  },
  {
    title: "Calendar",
    description: "Court dates, filing deadlines, and hearings in one view.",
    icon: Calendar,
  },
];

export default function ScreensPage() {
  return (
    <div className="py-16 sm:py-24">
      <PageContainer>
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Product
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
            See how LegalCRM{" "}
            <span className="text-gradient">organizes your practice</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg leading-7 text-muted-foreground">
            Clients, matters, documents, and billing—all in one place.
          </p>
        </div>

        {/* Dashboard preview illustration */}
        <div className="mt-16 max-w-4xl mx-auto rounded-2xl border border-border bg-card p-4 shadow-lg overflow-hidden">
          <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 p-8 sm:p-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/hero-dashboard.svg"
              alt="Dashboard preview - legal practice management"
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {screens.map((screen) => {
            const Icon = screen.icon;
            return (
              <Card key={screen.title} className="overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-24 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <Icon className="h-12 w-12 text-primary" strokeWidth={1.25} />
                </div>
                <CardContent className="pt-5">
                  <h3 className="font-bold text-foreground">{screen.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {screen.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
          >
            Try it free
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
