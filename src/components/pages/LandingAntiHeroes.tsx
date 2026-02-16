"use client";

import { useRouteStore } from "@/store/useRouteStore";
import { motion } from "framer-motion";
import Image from "next/image";

const dropPreview = [
  { name: "HELLBOUND", meta: "140 BPM • Trap / Dark" },
  { name: "NIGHTFALL", meta: "154 BPM • Drill / Ambient" },
  { name: "RITUAL", meta: "132 BPM • Alt / Experimental" },
  { name: "ATOMIC", meta: "148 BPM • Rage / Hybrid" },
];

export default function LandingAntiHeroes() {
  const { setActiveRoute } = useRouteStore();

  return (
    <section className="relative min-h-screen overflow-hidden bg-ah-black text-ah-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_12%_14%,rgba(30,111,255,.2),transparent_54%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_85%_12%,rgba(208,25,42,.22),transparent_52%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/70" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-24 md:px-12 md:pt-28">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <motion.p
              className="mb-4 text-xs uppercase tracking-[0.28em] text-ah-soft"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Atlanta Underground Collective
            </motion.p>

            <motion.h1
              className="font-[var(--font-display)] text-6xl font-black uppercase leading-[0.92] tracking-ah-tight md:text-8xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Anti-Heroes
            </motion.h1>

            <motion.p
              className="mt-6 max-w-xl text-sm text-ah-soft md:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
            >
              Dark luxury and controlled rebellion. Built for artists who own
              their catalog, shape their sound, and move without permission.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
            >
              <button
                onClick={() => setActiveRoute("beats")}
                className="rounded-sm bg-ah-red px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:shadow-ah-glow-red"
              >
                Explore Beats
              </button>
              <button
                onClick={() => setActiveRoute("music")}
                className="rounded-sm border border-ah-blue px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-ah-blue transition hover:bg-ah-blue hover:text-white hover:shadow-ah-glow-blue"
              >
                Stream Music
              </button>
              <button
                onClick={() => setActiveRoute("artist")}
                className="rounded-sm border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:border-white/40"
              >
                Meet The Artists
              </button>
            </motion.div>

            <div className="mt-8 inline-flex items-center gap-3 border border-ah-red/35 bg-ah-red/10 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-white/90">
              Independent
              <span className="inline-block h-1 w-1 rounded-full bg-ah-soft" />
              Unfiltered
              <span className="inline-block h-1 w-1 rounded-full bg-ah-soft" />
              Anti-Heroes
            </div>
          </div>

          <motion.div
            className="relative mx-auto h-[280px] w-[280px] sm:h-[380px] sm:w-[380px] md:mx-0 md:ml-auto md:h-[520px] md:w-[520px]"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/AntiHeroLogo.png"
              alt="Anti-Heroes Logo"
              fill
              priority
              className="object-contain drop-shadow-[0_22px_90px_rgba(0,0,0,.7)]"
            />
          </motion.div>
        </div>

        <motion.section
          className="mt-16 md:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-[var(--font-display)] text-2xl font-black uppercase tracking-ah-tight md:text-3xl">
              Latest Drops
            </h2>
            <button
              onClick={() => setActiveRoute("albums")}
              className="text-[11px] uppercase tracking-[0.22em] text-ah-soft transition hover:text-ah-white"
            >
              View Full Discography
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dropPreview.map((drop) => (
              <article
                key={drop.name}
                className="ah-card rounded-2xl p-4 transition hover:-translate-y-1 hover:border-ah-red/45"
              >
                <div className="mb-4 aspect-square rounded-xl border border-white/10 bg-black/50" />
                <h3 className="font-[var(--font-display)] text-lg tracking-wide">
                  {drop.name}
                </h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ah-soft">
                  {drop.meta}
                </p>
                <button
                  onClick={() => setActiveRoute("beats")}
                  className="mt-4 w-full rounded-sm border border-white/15 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-white transition hover:border-ah-blue/70 hover:bg-ah-blue/10"
                >
                  Play Preview
                </button>
              </article>
            ))}
          </div>
        </motion.section>
      </div>
    </section>
  );
}
