import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import localFont from "next/font/local";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const nohemi = localFont({
  src: [
    {
      path: "../assets/Nohemi-Regular.otf",
      weight: "400",
    },
    {
      path: "../assets/Nohemi-Medium.otf",
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
        {children}
      </body>
    </html>
  );
}
