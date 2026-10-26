import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "My AI Portfolio — Automated Investing",
  description: "Simple automated wealth portfolio with risk limits and autonomous AI rebalancing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.className}>
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900 font-sans">
        {children}
      </body>
    </html>
  );
}
