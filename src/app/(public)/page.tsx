import Link from "next/link";
import {
  Users,
  Briefcase,
  FileText,
  Calendar,
  Shield,
  Scale,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { HeroIllustration } from "@/components/illustrations/hero-illustration";
import { PageContainer } from "@/components/layout/page-container";

const features = [
  {
    icon: Users,
    title: "Client & Intake Management",
    description:
      "Manage client intake, conflicts checks, and detailed matter profiles. Keep communication history and billing organized by client.",
  },
  {
    icon: Briefcase,
    title: "Matter & Case Management",
    description:
      "Track case status, statute of limitations, court dates, and matter assignments. Built for litigation, corporate, and transactional work.",
  },
  {
    icon: Calendar,
    title: "Court Dates & Deadlines",
    description:
      "Never miss a hearing or filing deadline. Calendar sync, conflict checking, and automated reminders keep your practice on track.",
  },
  {
    icon: FileText,
    title: "Document & Evidence Management",
    description:
      "Organize pleadings, discovery, exhibits, and correspondence by matter. Version control and secure access for your team.",
  },
  {
    icon: Shield,
    title: "Ethics & Confidentiality First",
    description:
      "Built for legal ethics compliance. Role-based access, audit trails, and secure storage designed for attorney-client privilege.",
  },
  {
    icon: Scale,
    title: "Time & Billing",
    description:
      "Track billable hours by matter, generate invoices, and monitor collections. Trust accounting features for firms that hold client funds.",
  },
];

const trustItems = [
  "Solo practitioners",
  "Small law firms",
  "Corporate legal departments",
  "Legal aid organizations",
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl translate-x-1/2" />

        <PageContainer>
          <div className="relative grid min-h-[32rem] items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:py-32">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Practice management for attorneys
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-[3.5rem] leading-[1.1]">
                The lawyer CRM that{" "}
                <span className="text-gradient">understands your practice</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg sm:text-xl leading-relaxed text-muted-foreground">
                Client intake, matter tracking, court deadlines, documents, and billing—in one platform built for how lawyers actually work.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all sm:w-auto"
                >
                  Start free trial
                </Link>
                <Link
                  href="/features"
                  className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-border bg-background px-8 text-base font-semibold hover:bg-muted/50 hover:border-primary/30 transition-colors sm:w-auto"
                >
                  See features
                </Link>
              </div>
              <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
                  ✓
                </span>
                No credit card required
                <span className="text-border">·</span>
                <span className="text-primary font-medium">14-day free trial</span>
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md lg:max-w-lg">
                <HeroIllustration />
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-gradient-to-b from-card/30 to-background">
        <PageContainer>
          <div className="py-24 sm:py-32">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Built for legal professionals
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
                Every feature designed around{" "}
                <span className="text-primary">how attorneys work</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg leading-7 text-muted-foreground">
                Manage clients, matters, deadlines, and billing without the complexity.
              </p>
            </div>
            <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border border-border bg-card/80 p-8 shadow-sm transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary transition-colors group-hover:from-primary/30 group-hover:to-primary/10">
                      <Icon className="h-7 w-7" strokeWidth={1.75} />
                    </div>
                    <h3 className="mt-6 text-lg font-bold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Who uses */}
      <section className="border-t border-border">
        <PageContainer>
          <div className="py-24 sm:py-32">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Trusted by attorneys across{" "}
                <span className="text-primary">practice areas</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg leading-7 text-muted-foreground">
                From family law to corporate to litigation—LegalCRM adapts to your practice.
              </p>
              <div className="mt-12 flex flex-wrap justify-center gap-4">
                {trustItems.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-2.5 rounded-lg bg-primary/5 px-5 py-3 text-sm font-medium text-foreground"
                  >
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%234338ca\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <PageContainer>
          <div className="relative py-24 sm:py-32">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Spend less time on admin,{" "}
                <span className="text-gradient-warm">more on your clients</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg leading-7 text-muted-foreground">
                Join law firms who have streamlined their practice with LegalCRM.
              </p>
              <Link
                href="/signup"
                className="mt-10 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-10 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl transition-all"
              >
                Get started free
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
