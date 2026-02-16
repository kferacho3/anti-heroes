"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import { FaGlobeAmericas, FaInstagram, FaLinkedin, FaSoundcloud, FaYoutube } from "react-icons/fa";

export default function XaeneptunesWorld() {
  const [imageIndex, setImageIndex] = useState(() => Math.floor(Math.random() * 16) + 1);
  const imageSrc = useMemo(
    () =>
      `https://xaeneptune.s3.us-east-2.amazonaws.com/images/Xaeneptune/Xaeneptune${imageIndex}.webp`,
    [imageIndex],
  );

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
        </div>

        <button
          onClick={() => setImageIndex((prev) => (prev % 16) + 1)}
          className="rounded-sm border border-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-ah-red/60 hover:text-ah-red"
        >
          Shuffle Portrait
        </button>
      </header>

      <div className="mb-12 grid gap-6 lg:grid-cols-[380px_1fr]">
        <article className="ah-card rounded-2xl p-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-white/12">
            <AnimatePresence mode="wait">
              <motion.div
                key={imageIndex}
                initial={{ opacity: 0.2, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.2, scale: 1.04 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0"
              >
                <Image
                  src={imageSrc}
                  alt="Xae Neptune portrait"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 380px"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-ah-soft">
            Click shuffle to rotate portraits
          </p>
        </article>

        <div className="space-y-4">
          {sections.map((section) => (
            <article key={section.id} className="ah-card rounded-2xl p-5">
              <h3 className="font-[var(--font-display)] text-2xl uppercase tracking-wide text-white">
                {section.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{section.body}</p>
            </article>
          ))}
        </div>
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
