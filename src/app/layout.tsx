import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SherlockIT 2.0 – Mystery Solving Event",
  description:
    "A mystery-solving event application where teams explore worlds, solve clues, and submit the final mystery solution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="mystery-bg" style={{ fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif" }}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
