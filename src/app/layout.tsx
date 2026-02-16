// src/app/layout.tsx
import { VisualizerProvider } from "@/context/VisualizerContext";
import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import { ReactNode } from "react";
import "../../styles/globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "ANTI-HEROES",
  description: "Anti-Heroes official platform",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head />
      <body className="antialiased">
        <VisualizerProvider>{children}</VisualizerProvider>
      </body>
    </html>
  );
}
