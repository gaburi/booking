import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import Link from "next/link"; // Ensure Link is imported if needed, though likely not for layout unless used directly. 
// Actually MobileNav is in components.
import MobileNav from "@/components/MobileNav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Session Booking Platform | Brilliance",
  description: "Agende suas sessões presenciais ou online de forma simples e rápida",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="pb-20 md:pb-0">
            {children}
          </div>
          <div className="md:hidden">
            <MobileNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
