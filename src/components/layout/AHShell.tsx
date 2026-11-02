"use client";

import { getRouteVisualIdentity } from "@/data/routeVisualIdentity";
import { useRouteStore } from "@/store/useRouteStore";
import { motion } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

interface AHShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AHShell({ children, title, subtitle }: AHShellProps) {
  const activeRoute = useRouteStore((state) => state.activeRoute);
  const identity = getRouteVisualIdentity(activeRoute);

  return (
    <div
      className="ah-grain relative min-h-screen min-h-[100svh] overflow-hidden bg-transparent text-ah-white"
      style={
        {
          "--ah-shell-primary": identity.primary,
          "--ah-shell-secondary": identity.secondary,
          "--ah-shell-accent": identity.accent,
        } as CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_12%_10%,color-mix(in_srgb,var(--ah-shell-primary)_12%,transparent),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_88%_16%,color-mix(in_srgb,var(--ah-shell-secondary)_10%,transparent),transparent_58%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black/88" />
      </div>

      <div
        className="relative z-10"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 104px)" }}
      >
        {(title || subtitle) && (
          <header className="mx-auto w-full max-w-7xl px-4 pt-6 md:px-12 md:pt-10">
            <div className="ah-transmission-panel grid gap-5 p-4 sm:p-5 md:grid-cols-[1fr_180px] md:p-6">
              <div className="relative z-10">
                <motion.p
                  className="text-[10px] uppercase tracking-[0.22em] text-ah-chrome/75 sm:tracking-[0.28em]"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Anti-Heroes / Vinyl Transmission System
                </motion.p>
                {title && (
                  <motion.h1
                    className="mt-3 font-[var(--font-display)] text-3xl font-black uppercase tracking-ah-tight text-white drop-shadow-[0_18px_60px_rgba(0,0,0,.75)] sm:text-4xl md:text-6xl"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {title}
                  </motion.h1>
                )}
                {subtitle && (
                  <motion.p
                    className="mt-3 max-w-3xl text-sm leading-relaxed text-white/72 md:text-base"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>

              <motion.div
                className="relative z-10 hidden min-h-[138px] items-center justify-center md:flex"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.12 }}
              >
                <div className="ah-vinyl-disc h-32 w-32" />
                <div className="absolute right-2 top-1/2 h-[1px] w-24 origin-right -translate-y-1/2 rotate-[-28deg] bg-gradient-to-l from-ah-chrome via-ah-chrome/70 to-transparent" />
                <div
                  className="absolute right-24 top-[56%] h-2 w-2 rounded-full"
                  style={{ background: identity.accent, boxShadow: `0 0 24px ${identity.accent}` }}
                />
              </motion.div>
            </div>
          </header>
        )}

        <main className="mx-auto w-full max-w-7xl px-4 pb-32 pt-6 md:px-12 md:pb-24 md:pt-10">
          {children}
        </main>

        <div className="safe-bottom" />
      </div>
    </div>
  );
}
