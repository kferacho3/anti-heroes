"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AHShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AHShell({ children, title, subtitle }: AHShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ah-black text-ah-white ah-grain">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_12%_10%,rgba(30,111,255,.18),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_88%_16%,rgba(208,25,42,.15),transparent_56%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/70" />
      </div>

      <div
        className="relative z-10"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 74px)" }}
      >
        {(title || subtitle) && (
          <header className="mx-auto w-full max-w-7xl px-4 pt-6 md:px-12 md:pt-10">
            {title && (
              <motion.h1
                className="font-[var(--font-display)] text-3xl font-black uppercase tracking-ah-tight sm:text-4xl md:text-6xl"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {title}
              </motion.h1>
            )}
            {subtitle && (
              <motion.p
                className="mt-3 max-w-2xl text-sm text-ah-soft md:text-base"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {subtitle}
              </motion.p>
            )}
          </header>
        )}

        <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 md:px-12 md:pb-20 md:pt-10">
          {children}
        </main>

        <div className="safe-bottom" />
      </div>
    </div>
  );
}
