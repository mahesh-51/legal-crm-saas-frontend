import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Consistent max-width and padding for all page content.
 * Use this to align navbar, hero, features, and footer.
 */
export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
