import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BTCShield - Institutional BTC Backstop Protection Platform",
  description:
    "Professional-grade Bitcoin backstop protection platform with BTCShield liquidation mitigation, real-time oracle feeds, and institutional risk analytics",
  keywords: [
    "Mezo",
    "Bitcoin",
    "BTC",
    "lending",
    "MUSD",
    "DeFi",
    "BTCShield",
    "liquidation",
    "risk management",
    "institutional",
    "oracle",
    "Pyth",
    "Stork",
  ],
  authors: [{ name: "BTCShield Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-mezo-dark-950 via-mezo-dark-900 to-mezo-dark-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
