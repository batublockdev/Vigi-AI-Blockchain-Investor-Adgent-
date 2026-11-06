import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Adgent Protocol — Turning Crisis Into Opportunity",
  description: "Autonomous AI-driven DeFi investment system with zero-trust security on Celo. Stop-loss protection, take-profit harvesting, and AI-managed portfolios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.className} ${inter.className}`}>
      <body className="min-h-screen bg-[#F5F5F4] text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
