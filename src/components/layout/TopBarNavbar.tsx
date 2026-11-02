"use client";

import { useVisualizer } from "@/context/VisualizerContext";
import { useImmersiveStore } from "@/store/useImmersiveStore";
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
  const { activeRoute, setActiveRoute, setVisualizerMode, setHoveredRoute } = useRouteStore();
  const pulseRoute = useImmersiveStore((state) => state.pulseRoute);
  const { setIsBeatVisualizer } = useVisualizer();

  const handleBeats = () => {
    setVisualizerMode(false);
    setIsBeatVisualizer(false);
    pulseRoute();
    setActiveRoute("beats");
  };

  const handleVisualizer = () => {
    setVisualizerMode(true);
    setIsBeatVisualizer(true);
    pulseRoute();
    setActiveRoute("beats-visualizer");
  };

  return (
    <motion.header
      className="safe-top px-2 sm:px-3 md:px-5"
      initial="hidden"
      animate="show"
      variants={navAnim}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 rounded-lg border border-white/14 bg-black/70 px-3 py-2.5 shadow-[0_18px_70px_rgba(0,0,0,.34)] backdrop-blur-xl md:px-4 md:py-3">
        <button
          onClick={() => {
            pulseRoute();
            setActiveRoute("home");
          }}
          onMouseEnter={() => setHoveredRoute("home")}
          onMouseLeave={() => setHoveredRoute(undefined)}
          className="flex min-w-0 items-center gap-2 text-left"
          aria-label="Go to home"
        >
          <Image
            src="/AntiHeroLogo.png"
            alt="Anti-Heroes"
            width={28}
            height={28}
            priority
          />
          <div className="min-w-0 max-w-[45vw] sm:max-w-none">
            <p className="truncate font-[var(--font-display)] text-[0.95rem] uppercase tracking-[0.08em] text-white sm:text-xl sm:tracking-wider">
              Anti-Heroes
            </p>
            <p className="hidden text-[10px] uppercase tracking-[0.18em] text-ah-electric md:block">
              Vinyl Transmission System
            </p>
          </div>
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={handleBeats}
            onMouseEnter={() => setHoveredRoute("beats")}
            onMouseLeave={() => setHoveredRoute(undefined)}
            className={`rounded-sm border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
              activeRoute === "beats"
                ? "border-ah-ember/70 bg-ah-ember/14 text-ah-ember"
                : "border-white/16 bg-black/25 text-white hover:border-ah-ember/70 hover:text-ah-ember"
            }`}
          >
            Beat Vault
          </button>
          <button
            onClick={handleVisualizer}
            onMouseEnter={() => setHoveredRoute("beats-visualizer")}
            onMouseLeave={() => setHoveredRoute(undefined)}
            className={`rounded-sm px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition ${
              activeRoute === "beats-visualizer"
                ? "bg-ah-electric text-black shadow-ah-glow-cyan"
                : "border border-ah-electric/55 bg-ah-electric/10 text-ah-electric hover:bg-ah-electric hover:text-black hover:shadow-ah-glow-cyan"
            }`}
          >
            Vinyl Stage
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
          className="rounded-md border border-white/16 bg-white/[0.02] p-2.5 text-white transition hover:border-ah-magenta/55 hover:text-ah-magenta md:ml-3"
          aria-label="Open menu"
        >
          <FaBars size={18} />
        </button>
      </div>
    </motion.header>
  );
}
