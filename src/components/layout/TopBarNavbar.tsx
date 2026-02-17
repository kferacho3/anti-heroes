"use client";

import { useVisualizer } from "@/context/VisualizerContext";
import { useRouteStore } from "@/store/useRouteStore";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  FaBars,
  FaInstagram,
  FaSoundcloud,
  FaSpotify,
  FaYoutube,
} from "react-icons/fa";

type TopBarNavbarProps = {
  onHamburgerClick?: () => void;
};

const navAnim = {
  hidden: { y: -26, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export default function TopBarNavbar({ onHamburgerClick }: TopBarNavbarProps) {
  const { activeRoute, setActiveRoute, setVisualizerMode } = useRouteStore();
  const { setIsBeatVisualizer } = useVisualizer();

  const handleBeats = () => {
    setVisualizerMode(false);
    setIsBeatVisualizer(false);
    setActiveRoute("beats");
  };

  const handleVisualizer = () => {
    setVisualizerMode(true);
    setIsBeatVisualizer(true);
    setActiveRoute("beats-visualizer");
  };

  return (
    <motion.header
      className="safe-top px-2 md:px-5"
      initial="hidden"
      animate="show"
      variants={navAnim}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-2xl border border-white/12 bg-black/65 px-3 py-2.5 backdrop-blur-xl md:px-4 md:py-3">
        <button
          onClick={() => setActiveRoute("home")}
          className="flex items-center gap-2 text-left"
          aria-label="Go to home"
        >
          <Image
            src="/AntiHeroLogo.png"
            alt="Anti-Heroes"
            width={28}
            height={28}
            priority
          />
          <div className="min-w-0">
            <p className="truncate font-[var(--font-display)] text-base uppercase tracking-wider text-white sm:text-xl">
              Anti-Heroes
            </p>
            <p className="hidden text-[10px] uppercase tracking-[0.18em] text-ah-soft sm:block">
              Independent Music Platform
            </p>
          </div>
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={handleBeats}
            className={`rounded-sm border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
              activeRoute === "beats"
                ? "border-ah-red/70 bg-ah-red/14 text-white shadow-ah-glow-red"
                : "border-white/16 text-white hover:border-ah-red/70 hover:text-ah-red"
            }`}
          >
            Beats
          </button>
          <button
            onClick={handleVisualizer}
            className={`rounded-sm px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition ${
              activeRoute === "beats-visualizer"
                ? "bg-ah-blue shadow-ah-glow-blue"
                : "border border-ah-blue/65 bg-ah-blue/12 hover:bg-ah-blue hover:shadow-ah-glow-blue"
            }`}
          >
            Visualizer
          </button>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="https://open.spotify.com/artist/7iysPipkcsfGFVEgUMDzHQ"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ah-soft transition hover:text-white"
            aria-label="Spotify"
          >
            <FaSpotify />
          </a>
          <a
            href="https://on.soundcloud.com/bFiGExpCeZr3tLHn9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ah-soft transition hover:text-white"
            aria-label="Soundcloud"
          >
            <FaSoundcloud />
          </a>
          <a
            href="https://www.instagram.com/xaeneptune/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ah-soft transition hover:text-white"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="https://youtube.com/@xaeneptune"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ah-soft transition hover:text-white"
            aria-label="Youtube"
          >
            <FaYoutube />
          </a>
        </div>

        <button
          onClick={onHamburgerClick}
          className="rounded-md border border-white/16 p-2 text-white transition hover:border-white/40 md:ml-3"
          aria-label="Open menu"
        >
          <FaBars size={18} />
        </button>
      </div>
    </motion.header>
  );
}
