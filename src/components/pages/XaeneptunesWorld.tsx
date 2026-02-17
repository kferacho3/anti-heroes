"use client";

import { xaeneptunePlanetAssets, xaeneptuneSecurityAsset } from "@/data/visualAssets";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FaGlobeAmericas, FaInstagram, FaLinkedin, FaSoundcloud, FaSpotify, FaYoutube } from "react-icons/fa";

export default function XaeneptunesWorld() {
  const reduceMotion = useReducedMotion();
  const [autoRotate, setAutoRotate] = useState(true);
  const [activePlanetIndex, setActivePlanetIndex] = useState(() =>
    Math.floor(Math.random() * xaeneptunePlanetAssets.length),
  );
  const activePlanet = xaeneptunePlanetAssets[activePlanetIndex];
  const planetRail = useMemo(
    () => [...xaeneptunePlanetAssets, ...xaeneptunePlanetAssets],
    [],
  );

  useEffect(() => {
    if (reduceMotion || !autoRotate) return undefined;
    const timer = window.setInterval(() => {
      setActivePlanetIndex((current) => (current + 1) % xaeneptunePlanetAssets.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [autoRotate, reduceMotion]);

  return (
    <section>
      <header className="mb-10 flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-ah-soft">Profile</p>
          <h2 className="mt-3 font-[var(--font-display)] text-4xl uppercase tracking-ah-tight md:text-5xl">
            Xae Neptune&apos;s World
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ah-soft md:text-base">
            Producer, composer, and creative technologist shaping a catalog built on
            experimentation and consistency.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/14 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ah-soft">
              Planets: {xaeneptunePlanetAssets.length}
            </span>
            <span className="rounded-full border border-white/14 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ah-soft">
              Featured: SECURITY
            </span>
            <span className="rounded-full border border-white/14 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ah-soft">
              Orbit: {autoRotate ? "Auto" : "Manual"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() =>
              setActivePlanetIndex(
                Math.floor(Math.random() * xaeneptunePlanetAssets.length),
              )
            }
            className="rounded-sm border border-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-ah-red/60 hover:text-ah-red"
          >
            Shuffle Planet
          </button>
          <button
            onClick={() => setAutoRotate((current) => !current)}
            className="rounded-sm border border-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-ah-blue/45 hover:text-ah-blue"
          >
            {autoRotate ? "Pause Orbit" : "Resume Orbit"}
          </button>
          <a
            href={xaeneptuneSecurityAsset}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-ah-blue/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ah-blue transition hover:bg-ah-blue/15 hover:text-white"
          >
            Open SECURITY Art
          </a>
          <a
            href="https://open.spotify.com/artist/7iysPipkcsfGFVEgUMDzHQ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm border border-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-ah-red/55 hover:text-ah-red"
          >
            <FaSpotify />
            Open Spotify
          </a>
        </div>
      </header>

      <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-black/35">
        <div className="relative px-4 py-3">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_0%_0%,rgba(30,111,255,.18),transparent_60%)]" />
          <motion.div
            className="flex w-max gap-3"
            animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
            transition={reduceMotion ? undefined : { duration: 32, repeat: Infinity, ease: "linear" }}
          >
            {planetRail.map((planet, idx) => (
              <div
                key={`${planet}-${idx}`}
                className="relative h-12 w-12 rounded-full border border-white/20 bg-black/55"
              >
                <Image
                  src={planet}
                  alt="Xaeneptune planet decoration"
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="mb-12 grid gap-6 xl:grid-cols-[1.45fr_.95fr]">
        <article className="relative overflow-hidden rounded-3xl border border-white/12 bg-black/45 p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_circle_at_8%_8%,rgba(30,111,255,.2),transparent_58%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_92%_22%,rgba(208,25,42,.18),transparent_56%)]" />

          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.18em] text-ah-soft">Planet Atlas</p>
            <h3 className="mt-2 font-[var(--font-display)] text-3xl uppercase tracking-ah-tight text-white md:text-4xl">
              Xaeneptune Orbit
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-white/75">
              Curated orbit studies from the Xaeneptune world set. Select any
              planet to spotlight its identity.
            </p>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_230px]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/15 bg-black/65">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePlanet}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0.15, scale: 0.94 }}
                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0.12, scale: 1.06 }}
                    transition={{ duration: reduceMotion ? 0.18 : 0.38 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={activePlanet}
                      alt={`Xaeneptune planet ${activePlanetIndex + 1}`}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 720px"
                      className="object-contain p-4 drop-shadow-[0_20px_55px_rgba(30,111,255,.35)]"
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_circle_at_50%_50%,transparent_42%,rgba(0,0,0,.6))]" />
              </div>

              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 lg:grid-cols-4">
                {xaeneptunePlanetAssets.map((planet, index) => (
                  <button
                    key={planet}
                    onClick={() => setActivePlanetIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-xl border transition ${
                      index === activePlanetIndex
                        ? "border-ah-blue bg-ah-blue/10"
                        : "border-white/15 bg-black/45 hover:border-ah-red/45"
                    }`}
                    title={`Planet ${index + 1}`}
                  >
                    <Image
                      src={planet}
                      alt={`Planet ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="ah-card rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-ah-soft">Featured Project</p>
          <h3 className="mt-2 font-[var(--font-display)] text-3xl uppercase tracking-wide text-white">
            SECURITY
          </h3>
          <p className="mt-2 text-sm text-white/75">
            A visual and sonic chapter built around pressure, vulnerability,
            and self-definition.
          </p>
          <div className="relative mt-4 aspect-[3/4] overflow-hidden rounded-2xl border border-white/12">
            <Image
              src={xaeneptuneSecurityAsset}
              alt="Xaeneptune SECURITY artwork"
              fill
              sizes="(max-width: 1280px) 100vw, 420px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          </div>
          <a
            href={xaeneptuneSecurityAsset}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-sm border border-ah-red/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ah-red transition hover:bg-ah-red/20 hover:text-white"
          >
            View Full Artwork
          </a>
        </article>
      </div>

      <div className="mb-12 space-y-4">
        {sections.map((section) => (
          <article key={section.id} className="ah-card rounded-2xl p-5">
            <h3 className="font-[var(--font-display)] text-2xl uppercase tracking-wide text-white">
              {section.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{section.body}</p>
          </article>
        ))}
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {social.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="ah-card flex items-center justify-between rounded-2xl px-4 py-4 transition hover:border-ah-blue/45 hover:bg-ah-blue/10"
          >
            <div>
              <p className="font-[var(--font-display)] text-xl uppercase tracking-wide text-white">
                {item.label}
              </p>
              <p className="text-xs uppercase tracking-[0.16em] text-ah-soft">{item.handle}</p>
            </div>
            <item.Icon className="text-ah-soft" />
          </a>
        ))}
      </section>
    </section>
  );
}

const sections = [
  {
    id: "craft",
    title: "Learning the Craft",
    body: "YouTube tutorials remain foundational for style development. Daily learning and adaptation are key to building a durable sound.",
  },
  {
    id: "context",
    title: "Background & Context",
    body: "Producing since 2021, Xae Neptune has released 20+ songs, executive-produced multiple projects, and built a catalog of 100+ beats.",
  },
  {
    id: "project",
    title: "Current Project",
    body: "The debut solo EP SECURITY explores imposter syndrome, creative pressure, and self-definition with a raw and intentional approach.",
  },
  {
    id: "mission",
    title: "Mission",
    body: "Keep creation meaningful, keep execution consistent, and build a sustainable life through music and independent ownership.",
  },
] as const;

const social = [
  {
    id: "site",
    label: "Website",
    handle: "antiheroes.co",
    href: "https://antiheroes.co",
    Icon: FaGlobeAmericas,
  },
  {
    id: "ig",
    label: "Instagram",
    handle: "@xaeneptune",
    href: "https://www.instagram.com/xaeneptune",
    Icon: FaInstagram,
  },
  {
    id: "yt",
    label: "YouTube",
    handle: "@xaeneptune",
    href: "https://youtube.com/@xaeneptune",
    Icon: FaYoutube,
  },
  {
    id: "sc",
    label: "SoundCloud",
    handle: "xaeneptune",
    href: "https://on.soundcloud.com/bFiGExpCeZr3tLHn9",
    Icon: FaSoundcloud,
  },
  {
    id: "li",
    label: "LinkedIn",
    handle: "xavier-lewis",
    href: "https://www.linkedin.com/in/xavier-lewis",
    Icon: FaLinkedin,
  },
] as const;
