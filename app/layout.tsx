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

import MatrixRain from "@/components/MatrixRain";

export const metadata: Metadata = {
  title: "CyberAware | AI Cybersecurity",
  description: "AI-Based Cybersecurity Awareness Solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative bg-neutral-950 text-neutral-50`}
      >
        <MatrixRain />
        {children}
      </body>
    </html>
  );
}
