"use client";

import { Route } from "@/store/useRouteStore";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import { FaApple, FaInstagram, FaSoundcloud, FaSpotify, FaTimes, FaYoutube } from "react-icons/fa";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  activeRoute: Route;
  setActiveRoute: (route: Route) => void;
};

const links: Array<{ label: string; route: Route }> = [
  { label: "Home", route: "home" },
  { label: "Music", route: "music" },
  { label: "Artist", route: "artist" },
  { label: "Beats", route: "beats" },
  { label: "Albums", route: "albums" },
  { label: "Xae Neptune", route: "xaeneptune" },
  { label: "Connect", route: "connect" },
];

export default function Sidebar({ isOpen, onClose, activeRoute, setActiveRoute }: SidebarProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            aria-label="Close menu overlay"
            className="fixed inset-0 z-[11000] bg-black/72 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.16 : 0.24 }}
          />

          <motion.aside
            className="fixed inset-y-0 right-0 z-[11001] flex h-[100dvh] w-full max-w-[92vw] flex-col border-l border-white/12 bg-ah-black/95 px-6 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] pt-[calc(env(safe-area-inset-top,0px)+20px)] shadow-[0_0_0_1px_rgba(255,255,255,.06),0_28px_90px_rgba(0,0,0,.6)] sm:max-w-sm"
            initial={reduceMotion ? { opacity: 0 } : { x: "100%", opacity: 0.6 }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "100%", opacity: 0.6 }}
            transition={
              reduceMotion
                ? { duration: 0.18 }
                : { type: "spring", stiffness: 280, damping: 34, mass: 0.8 }
            }
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/AntiHeroLogo.png"
                  alt="Anti-Heroes"
                  width={36}
                  height={36}
                />
                <div>
                  <p className="font-[var(--font-display)] text-2xl uppercase leading-none tracking-wide">
                    Anti-Heroes
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ah-soft">
                    Navigation
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md border border-white/20 p-2 text-white transition hover:border-white/40"
                aria-label="Close menu"
              >
                <FaTimes />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto">
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.route}>
                    <button
                      aria-current={activeRoute === link.route ? "page" : undefined}
                      onClick={() => {
                        setActiveRoute(link.route);
                        onClose();
                      }}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.2em] transition ${
                        activeRoute === link.route
                          ? "border-ah-red/55 bg-ah-red/14 text-white shadow-ah-glow-red"
                          : "border-white/10 bg-white/[0.02] text-white hover:border-ah-red/50 hover:bg-ah-red/10"
                      }`}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-7 rounded-2xl border border-white/12 bg-white/[0.02] p-4">
              <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-ah-soft">
                External Platforms
              </p>
              <div className="flex items-center justify-between text-ah-soft">
                <a
                  href="https://music.apple.com/us/artist/xae-neptune/1636578727"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                  aria-label="Apple Music"
                >
                  <FaApple />
                </a>
                <a
                  href="https://open.spotify.com/artist/7iysPipkcsfGFVEgUMDzHQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                  aria-label="Spotify"
                >
                  <FaSpotify />
                </a>
                <a
                  href="https://on.soundcloud.com/bFiGExpCeZr3tLHn9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                  aria-label="SoundCloud"
                >
                  <FaSoundcloud />
                </a>
                <a
                  href="https://www.instagram.com/xaeneptune/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://youtube.com/@xaeneptune"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                  aria-label="YouTube"
                >
                  <FaYoutube />
                </a>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
