import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { Scale, Shield, Zap, Heart } from "lucide-react";

const values = [
  {
    icon: Scale,
    title: "Built for practice",
    description: "Every feature designed around legal workflows—intake, matters, deadlines, billing.",
  },
  {
    icon: Shield,
    title: "Ethics first",
    description: "Security and confidentiality built in. Built with attorney-client privilege in mind.",
  },
  {
    icon: Zap,
    title: "Modern & simple",
    description: "Clean interface that works. No lengthy training or complex setup required.",
  },
  {
    icon: Heart,
    title: "Practice-focused",
    description: "We reduce administrative burden so you can focus on clients and the practice of law.",
  },
];

export default function AboutPage() {
  return (
    <div className="py-16 sm:py-24">
      <PageContainer>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            About us
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
            Practice management{" "}
            <span className="text-gradient">built by people who get it</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg leading-7 text-muted-foreground">
            LegalCRM is practice management software built by people who understand legal practice. We help lawyers and law firms manage clients, matters, court dates, documents, and billing—without the complexity of enterprise software or the limitations of spreadsheets.
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-card/50 p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <h2 className="mt-4 text-lg font-bold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-8">
            <h2 className="text-xl font-bold">Our mission</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              To give attorneys tools that reduce administrative work so they can focus on clients and practice law. Legal practice is demanding enough—your software shouldn&apos;t add to that.
            </p>
          </div>

          <div className="mt-12">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              Get started free
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
