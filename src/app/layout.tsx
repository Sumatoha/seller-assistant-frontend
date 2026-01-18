import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "KSA - Kaspi Seller Assistant",
  description: "KSA - AI-powered assistant for Kaspi.kz marketplace sellers. Manage reviews, automate pricing, and track inventory.",
  keywords: ["ksa", "kaspi", "seller", "assistant", "marketplace", "ecommerce", "AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
