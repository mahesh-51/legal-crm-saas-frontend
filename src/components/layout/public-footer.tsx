import Link from "next/link";
import { PageContainer } from "./page-container";

const footerLinks = {
  Product: [
    { href: "/features", label: "Features" },
    { href: "/screens", label: "Product" },
  ],
  Company: [
    { href: "/about", label: "About" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-muted/20">
      <PageContainer>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-2">
              <Link
                href="/"
                className="text-lg font-bold tracking-tight"
              >
                <span className="text-primary">Legal</span>
                <span className="text-foreground">CRM</span>
              </Link>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Practice management software for lawyers. Client intake, matter tracking, court dates, documents, and billing—all in one place.
              </p>
            </div>
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-sm font-medium text-foreground">{title}</h4>
                <ul className="mt-4 space-y-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} LegalCRM. Practice management for attorneys.
            </p>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
