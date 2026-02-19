import type { Metadata } from "next";
import { Inter, Cinzel, Orbitron, Montserrat, Rajdhani } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
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
    <html lang="en" className={`${inter.variable} ${cinzel.variable} ${orbitron.variable} ${montserrat.variable} ${rajdhani.variable}`}>
      <body className="mystery-bg" style={{ fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif" }}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
