// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolphi.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ToolPhi — Focused Web Tools for Makers",
    template: "%s | ToolPhi",
  },
  description:
    "ToolPhi is a focused web tools hub for solo developers, small business owners and online sellers.",
  openGraph: {
    type: "website",
    siteName: "ToolPhi",
    title: "ToolPhi — Web Tools for Profit, Pricing and KPIs",
    description:
      "Calculate profit, margin, pricing and key metrics with fast, focused web tools.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolPhi — Web Tools Hub",
    description:
      "A growing collection of profit, pricing and business calculators for makers and small businesses.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
