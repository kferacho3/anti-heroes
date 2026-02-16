"use client";

import { useRouteStore } from "@/store/useRouteStore";
import { visualizerDecorationAssets } from "@/data/visualAssets";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const dropPreview = [
  {
    name: "HELLBOUND",
    meta: "140 BPM • Trap / Dark",
    artwork: visualizerDecorationAssets[0],
  },
  {
    name: "NIGHTFALL",
    meta: "154 BPM • Drill / Ambient",
    artwork: visualizerDecorationAssets[1],
  },
  {
    name: "RITUAL",
    meta: "132 BPM • Alt / Experimental",
    artwork: visualizerDecorationAssets[2],
  },
  {
    name: "ATOMIC",
    meta: "148 BPM • Rage / Hybrid",
    artwork: visualizerDecorationAssets[3],
  },
];

export default function LandingAntiHeroes() {
  const { setActiveRoute } = useRouteStore();
  const reduceMotion = useReducedMotion();
  const [heroArtIndex, setHeroArtIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = setInterval(() => {
      setHeroArtIndex((prev) => (prev + 1) % visualizerDecorationAssets.length);
    }, 4800);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  const heroArt = visualizerDecorationAssets[heroArtIndex];
  const sideArts = useMemo(
    () =>
      Array.from({ length: 3 }, (_, offset) =>
        visualizerDecorationAssets[
          (heroArtIndex + offset + 1) % visualizerDecorationAssets.length
        ],
      ),
    [heroArtIndex],
  );

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
              className="font-[var(--font-display)] text-5xl font-black uppercase leading-[0.92] tracking-ah-tight sm:text-6xl md:text-8xl"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0.2 : 0.6 }}
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
            className="relative mx-auto h-[300px] w-[300px] sm:h-[410px] sm:w-[410px] md:mx-0 md:ml-auto md:h-[540px] md:w-[540px]"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/15 shadow-[0_20px_100px_rgba(0,0,0,.5)]">
              <Image
                src={heroArt}
                alt="Audio visualizer artwork"
                fill
                priority
                sizes="(max-width: 768px) 300px, (max-width: 1024px) 410px, 540px"
                className="object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-ah-blue/20 via-black/35 to-ah-red/30" />
              <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_18%_14%,rgba(255,255,255,.2),transparent_58%)]" />
              <div className="absolute inset-0 p-10 sm:p-12 md:p-16">
                <div className="relative h-full w-full">
                  <Image
                    src="/AntiHeroLogo.png"
                    alt="Anti-Heroes Logo"
                    fill
                    className="object-contain drop-shadow-[0_18px_70px_rgba(0,0,0,.7)]"
                  />
                </div>
              </div>
            </div>

            <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
              {sideArts.map((src, idx) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="relative h-24 w-16 overflow-hidden rounded-xl border border-white/20 bg-black/35 shadow-xl"
                >
                  <Image
                    src={src}
                    alt="Visualizer detail"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                </motion.div>
              ))}
            </div>
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
                className="group ah-card rounded-2xl p-4 transition hover:-translate-y-1 hover:border-ah-red/45"
              >
                <div className="relative mb-4 aspect-square overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={drop.artwork}
                    alt={`${drop.name} visualizer artwork`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                </div>
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
