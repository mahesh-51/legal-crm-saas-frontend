"use client";

import Link from "next/link";
import { PageContainer } from "./page-container";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/screens", label: "Product" },
  { href: "/about", label: "About" },
];

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
      <PageContainer>
        <div className="flex h-16 items-center justify-between gap-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span className="text-primary">Legal</span>
            <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-200 dark:to-slate-400">
              CRM
            </span>
          </Link>
          <nav className="hidden flex-1 justify-center md:flex">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
          <div className="flex shrink-0 items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </PageContainer>
    </header>
  );
}
