import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Telegram Комбайн - Маркетинг Автоматизация",
  description: "Профессиональный инструмент автоматизации Telegram маркетинга. Парсинг, инвайты, массовые рассылки и аналитика.",
  keywords: ["Telegram", "автоматизация", "маркетинг", "парсинг", "инвайты", "рассылки", "аналитика"],
  authors: [{ name: "Telegram Combo Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Telegram Комбайн",
    description: "Профессиональный инструмент автоматизации Telegram маркетинга",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
