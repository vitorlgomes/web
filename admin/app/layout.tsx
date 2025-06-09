import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Suspense } from "react";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const nohemi = localFont({
  src: [
    {
      path: "../assets/fonts/Nohemi-Regular.otf",
      weight: "400",
    },
    {
      path: "../assets/fonts/Nohemi-Medium.otf",
      weight: "500",
    },
  ],
  variable: "--font-nohemi",
});

export const metadata: Metadata = {
  title: "LIRIO - AdminUI",
  description: "AdminUI for LIRIO customers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nohemi.variable} ${inter.variable}`}>
        <Toaster richColors />
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
