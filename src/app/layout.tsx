import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { SessionProvider } from "@/components/auth/session-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LegalCRM - Legal Practice Management",
  description: "Streamline your legal practice with our comprehensive CRM platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SessionProvider>
          <ReduxProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ReduxProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
