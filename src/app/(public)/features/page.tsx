import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import {
  Users,
  Briefcase,
  FileText,
  Calendar,
  Receipt,
  BarChart3,
  Shield,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Client & Intake Management",
    description:
      "Track client intake, run conflict checks, and maintain detailed profiles. Communication history, matter assignments, and billing linked to each client.",
  },
  {
    icon: Briefcase,
    title: "Matter & Case Tracking",
    description:
      "Manage matters from intake through closing. Track case status, statute of limitations, court assignments, and associate workloads.",
  },
  {
    icon: Calendar,
    title: "Court Dates & Deadlines",
    description:
      "Court dates, filing deadlines, and discovery due dates in one calendar. Conflict checking, reminders, and calendar integration.",
  },
  {
    icon: FileText,
    title: "Document Management",
    description:
      "Organize pleadings, discovery, exhibits, and correspondence by matter. Version control, secure access, and matter-specific folders.",
  },
  {
    icon: Receipt,
    title: "Time Tracking & Billing",
    description:
      "Track billable and non-billable time by matter. Generate invoices, track payments, and monitor collections.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Practice metrics, matter profitability, and attorney utilization. Real-time dashboards for firm leaders.",
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description:
      "Built for legal ethics and confidentiality. Role-based access, audit trails, and secure storage.",
  },
  {
    icon: Clock,
    title: "Time & Deadline Management",
    description:
      "Never miss a deadline. Track billable hours, statute of limitations, and court-imposed deadlines.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="py-16 sm:py-24">
      <PageContainer>
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Product features
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
            Everything you need for{" "}
            <span className="text-gradient">legal practice</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg leading-7 text-muted-foreground">
            Built for how attorneys manage clients, matters, deadlines, and billing.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-20 grid gap-8 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group flex gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-lg hover:border-primary/20"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary transition-colors group-hover:from-primary/30">
                  <Icon className="h-8 w-8" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
          >
            Start free trial
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
