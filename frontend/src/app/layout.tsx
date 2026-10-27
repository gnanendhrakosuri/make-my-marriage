import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Make My Marriage — Bespoke Wedding Platform",
  description:
    "A private digital atelier for discerning couples, curated itineraries, bespoke stationery, and heartfelt guest experiences.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${plusJakarta.variable}`}>
      <body className="antialiased selection:bg-gold-champagne/30 selection:text-burgundy-velvet">
        {children}
      </body>
    </html>
  );
}
