import type { Metadata } from "next";
import { Inter, Kumbh_Sans } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";

export const metadata: Metadata = {
  title: "LIRIO",
  description: "The simplest PDV system for your business.",
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const nohemi = localFont({
  src: [
    {
      path: "../public/Nohemi-Light.otf",
      weight: "300",
    },
    {
      path: "../public/Nohemi-Regular.otf",
      weight: "400",
    },
    {
      path: "../public/Nohemi-Medium.otf",
      weight: "500",
    },
    {
      path: "../public/Nohemi-Bold.otf",
      weight: "700",
    },
  ],
  variable: "--font-nohemi",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="htmll" lang="en">
      <body className={`body ${nohemi.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
