"use client";

import { useRouteStore } from "@/store/useRouteStore";
import { useImmersiveStore } from "@/store/useImmersiveStore";
import { beatsData } from "@/data/beatData";
import { visualizerDecorationAssets, xaeneptuneSecurityAsset } from "@/data/visualAssets";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SpotifyPlaylistTrack {
  id: string;
  name: string;
  artists?: { name: string }[];
  external_urls?: { spotify?: string };
  album?: {
    name: string;
    release_date?: string;
    images?: { url: string }[];
    external_urls?: { spotify?: string };
  };
}

interface PlaylistTrackItem {
  added_at?: string;
  track?: SpotifyPlaylistTrack | null;
}

interface PlaylistResponse {
  tracks?: { items?: PlaylistTrackItem[] };
  error?: string;
  detail?: string;
}

const XAENEPTUNE_PLAYLIST_ID = "1NL9L9zkZjkxlAVV3Qcqfh";
const XAENEPTUNE_PLAYLIST_URL =
  "https://open.spotify.com/playlist/1NL9L9zkZjkxlAVV3Qcqfh";

function safeYear(value: string | undefined): string {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return String(parsed.getFullYear());
}

const platformHighlights = [
  {
    id: "catalog",
    title: "Beat Vault",
    body: "A crate of Xae Neptune beats with BPM, key, producer, date, previews, visualizer handoff, and licensing inquiry paths.",
  },
  {
    id: "roster",
    title: "Artist Constellation",
    body: "Associated artists, featured tracks, fallback releases, and profile signals stay visible for collaborators and reviewers.",
  },
  {
    id: "archive",
    title: "Spotify Signal",
    body: "Spotify-linked albums, top tracks, playlist cuts, and project history become proof records instead of plain API output.",
  },
] as const;

const vaultSteps = [
  "Explore the catalogue",
  "Preview beats and releases",
  "Review artist profiles",
  "Send a licensing or collaboration inquiry",
  "Promote standout records responsibly",
] as const;

const artistReasons = [
  "Clear catalogue",
  "Roster visibility",
  "Release proof",
  "Professional inquiry flow",
  "Spotify-linked data",
  "Mobile-safe previews",
] as const;

const featuredArtistSpotlights = [
  {
    name: "Xae Neptune",
    role: "Producer / Anti-Heroes founder",
    note: "The production hub behind the beat catalogue, releases, and visual identity.",
    image: xaeneptuneSecurityAsset,
    label: "Featured Producer",
  },
  {
    name: "XO June",
    role: "Artist collaborator",
    note: "Connected through records and SoundCloud releases built around Xae Neptune production.",
    image: "https://i1.sndcdn.com/avatars-WTj6LWMHQK0o1lDw-Vz5D1A-t500x500.jpg",
    label: "Current Network",
  },
  {
    name: "Ahmad",
    role: "Artist collaborator",
    note: "Release context and fallback records preserved inside the Anti-Heroes archive.",
    image: "https://xaeneptune.s3.us-east-2.amazonaws.com/images/Artist/xaeneptune-no-profile.webp",
    label: "Release Archive",
  },
  {
    name: "iann tyler",
    role: "Artist collaborator",
    note: "Roster-linked profile with top tracks, discography context, and promotion pathways.",
    image: "https://i1.sndcdn.com/avatars-8HyvIOZxOAq1iNja-dBVAMA-t500x500.jpg",
    label: "Roster Profile",
  },
] as const;

export default function LandingAntiHeroes() {
  const { setActiveRoute } = useRouteStore();
  const setHoveredEntity = useImmersiveStore((state) => state.setHoveredEntity);
  const clearHoveredEntity = useImmersiveStore((state) => state.clearHoveredEntity);
  const pulseRoute = useImmersiveStore((state) => state.pulseRoute);
  const reduceMotion = useReducedMotion();
  const [heroArtIndex, setHeroArtIndex] = useState(0);
  const [latestDrops, setLatestDrops] = useState<PlaylistTrackItem[]>([]);
  const [loadingDrops, setLoadingDrops] = useState(true);
  const [dropsError, setDropsError] = useState<string | null>(null);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = setInterval(() => {
      setHeroArtIndex((prev) => (prev + 1) % visualizerDecorationAssets.length);
    }, 4800);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLatestDrops = async () => {
      setLoadingDrops(true);
      setDropsError(null);
      try {
        const response = await fetch(
          `/api/spotify/playlist?playlistId=${XAENEPTUNE_PLAYLIST_ID}`,
          { signal: controller.signal, cache: "no-store" },
        );

        const data: PlaylistResponse = await response.json();
        if (!response.ok) {
          const detail = data.detail ? ` (${data.detail})` : "";
          throw new Error(`${data.error || "Failed to fetch latest drops"}${detail}`);
        }

        const items = (data.tracks?.items || []).filter(
          (item): item is PlaylistTrackItem => Boolean(item?.track?.id && item.track?.name),
        );
        setLatestDrops(items.slice(-9).reverse());
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setLatestDrops([]);
        setDropsError((error as Error).message || "Unable to load live drops right now.");
      } finally {
        if (!controller.signal.aborted) setLoadingDrops(false);
      }
    };

    fetchLatestDrops();
    return () => controller.abort();
  }, []);

  const heroArt = visualizerDecorationAssets[heroArtIndex];

  return (
    <section className="relative min-h-screen min-h-[100svh] overflow-hidden bg-transparent text-ah-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_12%_14%,rgba(244,182,74,.1),transparent_56%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_85%_12%,rgba(30,111,255,.08),transparent_54%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/34 to-black/86" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-36 pt-24 sm:px-6 md:px-12 md:pb-24 md:pt-28">
        <div className="flex min-h-[calc(100svh-130px)] flex-col justify-center gap-8">
          <div className="max-w-5xl">
            <motion.p
              className="mb-4 text-[10px] uppercase tracking-[0.2em] text-ah-electric sm:text-xs sm:tracking-[0.28em]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Private Studio Interface / Global Beat Vault
            </motion.p>

            <motion.h1
              className="max-w-5xl font-[var(--font-display)] text-4xl font-black uppercase leading-[0.92] tracking-ah-tight text-white drop-shadow-[0_24px_70px_rgba(0,0,0,.85)] sm:text-6xl md:text-8xl"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0.2 : 0.6 }}
            >
              Anti-Heroes: Vinyl Transmission System
            </motion.h1>

            <motion.p
              className="mt-6 max-w-3xl text-sm leading-relaxed text-white/76 md:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
            >
              A record-player-inspired beat catalogue and artist-exposure platform
              for Xae Neptune. Artists, curators, reviewers, scouts, supervisors,
              and creators can drop the needle, inspect the catalogue, open the
              visualizer, review Spotify-connected proof, and send careful licensing
              or collaboration inquiries.
            </motion.p>

            <motion.div
              className="mt-5 flex flex-wrap items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.24 }}
            >
              <span className="rounded-full border border-ah-ember/45 bg-ah-ember/12 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-ah-ember sm:tracking-[0.2em]">
                Beat Vault
              </span>
              <span className="rounded-full border border-ah-magenta/32 bg-ah-magenta/10 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-ah-magenta sm:tracking-[0.2em]">
                Artist Constellation
              </span>
              <span className="rounded-full border border-ah-electric/32 bg-ah-electric/10 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-ah-electric sm:tracking-[0.2em]">
                Spotify Signal
              </span>
              <span className="rounded-full border border-white/14 bg-white/[0.02] px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-ah-soft sm:tracking-[0.2em]">
                Live Releases: {latestDrops.length}
              </span>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
            >
              <button
                onMouseEnter={() =>
                  setHoveredEntity({ type: "cta", id: "browse-catalogue", title: "Open Beat Vault" })
                }
                onMouseLeave={clearHoveredEntity}
                onClick={() => {
                  pulseRoute();
                  setActiveRoute("beats");
                }}
                className="w-full rounded-sm bg-ah-ember px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:shadow-[0_14px_44px_rgba(244,182,74,.24)] sm:w-auto sm:tracking-[0.22em]"
              >
                Open Beat Vault
              </button>
              <button
                onMouseEnter={() =>
                  setHoveredEntity({ type: "cta", id: "view-roster", title: "Artist Constellation" })
                }
                onMouseLeave={clearHoveredEntity}
                onClick={() => {
                  pulseRoute();
                  setActiveRoute("artist");
                }}
                className="w-full rounded-sm border border-ah-magenta/35 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-ah-magenta transition hover:bg-ah-magenta/12 hover:text-white sm:w-auto sm:tracking-[0.22em]"
              >
                Artist Constellation
              </button>
              <button
                onMouseEnter={() =>
                  setHoveredEntity({ type: "cta", id: "stream-releases", title: "Stream Releases" })
                }
                onMouseLeave={clearHoveredEntity}
                onClick={() => {
                  pulseRoute();
                  setActiveRoute("music");
                }}
                className="hidden rounded-sm border border-ah-electric/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-ah-electric transition hover:bg-ah-electric/12 hover:text-white sm:inline-flex sm:w-auto sm:tracking-[0.22em]"
              >
                Spotify Signal
              </button>
            </motion.div>

          </div>

          <motion.div
            className="relative h-[190px] w-full overflow-hidden md:h-[230px]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="ah-transmission-panel ah-scan-frame absolute inset-0 shadow-[0_20px_80px_rgba(0,0,0,.42)]">
              <Image
                src={heroArt}
                alt="Anti-Heroes label showcase artwork"
                fill
                priority
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 450px, 540px"
                className="scale-105 object-cover opacity-46"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/86 via-black/62 to-ah-magenta/12" />
              <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_18%_14%,rgba(49,247,255,.16),transparent_58%)]" />

              <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-7 md:p-8">
                <div className="flex items-center justify-between gap-3 border-b border-white/12 pb-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ah-electric">
                    Live Transmission
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/58">
                    Xae Neptune Catalogue
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    [`${beatsData.length}`, "Beat Sleeves"],
                    ["Signal", "Spotify Proof"],
                    ["Portal", "Licensing"],
                  ].map(([value, label]) => (
                    <div key={label} className="border border-white/12 bg-black/42 px-3 py-3">
                      <p className="font-[var(--font-display)] text-xl uppercase tracking-wide text-white">
                        {value}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-ah-soft">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.section
          className="mt-14 md:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="mb-9 grid gap-4 md:grid-cols-3">
            {platformHighlights.map((highlight) => (
              <article key={highlight.id} className="ah-sleeve-card p-5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-ah-soft sm:tracking-[0.2em]">
                  {highlight.id}
                </p>
                <h3 className="mt-2 font-[var(--font-display)] text-xl uppercase tracking-wide text-white sm:text-2xl">
                  {highlight.title}
                </h3>
                <p className="mt-2 text-sm text-ah-soft">{highlight.body}</p>
              </article>
            ))}
          </div>

          <div className="mb-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="ah-transmission-panel p-5 md:p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-ah-electric">Transmission Path</p>
              <h2 className="mt-3 font-[var(--font-display)] text-2xl font-black uppercase tracking-ah-tight md:text-4xl">
                Needle drop to next steps.
              </h2>
              <div className="mt-6 space-y-3">
                {vaultSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-ah-ember/40 bg-ah-ember/12 text-xs font-bold text-ah-ember">
                      {index + 1}
                    </span>
                    <p className="text-sm text-white/76">{step}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="ah-sleeve-card p-5 md:p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-ah-magenta">Exposure Ecosystem</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {artistReasons.map((reason) => (
                  <div
                    key={reason}
                    className="rounded-sm border border-white/10 bg-white/[0.03] px-3 py-3 text-xs uppercase tracking-[0.16em] text-white/78"
                  >
                    {reason}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-relaxed text-white/68">
                The experience is built to make discovery easier: clear beat
                browsing, public release context, and a professional path for
                licensing, collaboration, submissions, and potential shared exposure for selected work.
              </p>
            </article>
          </div>

          <div className="mb-10">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-ah-ember">
                  Current Artist Network
                </p>
                <h2 className="mt-2 font-[var(--font-display)] text-2xl font-black uppercase tracking-ah-tight md:text-3xl">
                  Artists & collaborators we&apos;re building around
                </h2>
              </div>
              <button
                onClick={() => {
                  pulseRoute();
                  setActiveRoute("artist");
                }}
                className="w-full rounded-sm border border-white/16 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-ah-ember/55 hover:bg-ah-ember/10 sm:w-auto sm:tracking-[0.2em]"
              >
                View Full Roster
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {featuredArtistSpotlights.map((artist) => (
                <button
                  key={artist.name}
                  onMouseEnter={() =>
                    setHoveredEntity({
                      type: "artist",
                      id: artist.name,
                      title: artist.name,
                      image: artist.image,
                      color: "#F4B64A",
                    })
                  }
                  onMouseLeave={clearHoveredEntity}
                  onClick={() => {
                    pulseRoute();
                    setActiveRoute("artist");
                  }}
                  className="group ah-sleeve-card text-left transition hover:-translate-y-0.5 hover:border-ah-magenta/45"
                >
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-white/10 bg-black/45">
                    <Image
                      src={artist.image}
                      alt={`${artist.name} profile artwork`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/12 to-transparent" />
                    <span className="absolute left-3 top-3 border border-white/14 bg-black/55 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-ah-ember">
                      {artist.label}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-[var(--font-display)] text-2xl uppercase tracking-wide text-white">
                      {artist.name}
                    </h3>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-ah-soft">
                      {artist.role}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white/68">
                      {artist.note}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-[var(--font-display)] text-2xl font-black uppercase tracking-ah-tight md:text-3xl">
              Latest Releases
            </h2>
            <a
              href={XAENEPTUNE_PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.18em] text-ah-soft transition hover:text-ah-white sm:text-[11px] sm:tracking-[0.22em]"
            >
              View Full Playlist
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loadingDrops &&
              Array.from({ length: 9 }, (_, index) => (
                <article key={`loading-${index}`} className="ah-sleeve-card p-4">
                  <div className="mb-4 aspect-square animate-pulse rounded-md border border-white/10 bg-white/5" />
                  <div className="h-5 w-4/5 animate-pulse rounded bg-white/10" />
                  <div className="mt-2 h-3 w-2/5 animate-pulse rounded bg-white/10" />
                  <div className="mt-4 h-9 animate-pulse rounded-sm bg-white/10" />
                </article>
              ))}

            {!loadingDrops &&
              latestDrops.map((item, index) => {
                const track = item.track;
                if (!track) return null;
                const albumArt = track.album?.images?.[0]?.url;
                const spotifyUrl =
                  track.external_urls?.spotify ||
                  track.album?.external_urls?.spotify ||
                  XAENEPTUNE_PLAYLIST_URL;
                const artists = track.artists?.map((artist) => artist.name).join(", ") || "Unknown Artist";
                const releaseYear = safeYear(track.album?.release_date);

                return (
                <article
                  key={`${track.id}-${index}`}
                  onMouseEnter={() =>
                    setHoveredEntity({
                      type: "track",
                      id: track.id,
                      title: track.name,
                      image: albumArt,
                    })
                  }
                  onMouseLeave={clearHoveredEntity}
                  className="group ah-sleeve-card p-4 transition md:hover:-translate-y-1 md:hover:border-ah-magenta/45"
                >
                  <div className="ah-scan-frame relative mb-4 aspect-square overflow-hidden rounded-md border border-white/10 bg-black/40">
                    {albumArt ? (
                      <Image
                        src={albumArt}
                        alt={`${track.name} cover`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-semibold uppercase text-ah-soft">
                        {track.name}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                  </div>

                  <h3 className="line-clamp-2 break-words font-[var(--font-display)] text-lg tracking-wide">
                    {track.name}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ah-soft sm:tracking-[0.18em]">
                    {artists}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ah-soft sm:tracking-[0.18em]">
                    {releaseYear} • {track.album?.name || "Playlist Single"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveRoute("music")}
                      className="flex-1 rounded-sm border border-white/15 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-white transition hover:border-ah-blue/70 hover:bg-ah-blue/10 sm:tracking-[0.18em]"
                    >
                      Open Signal
                    </button>
                    {spotifyUrl && (
                      <a
                        href={spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-sm border border-ah-blue/45 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-ah-blue transition hover:bg-ah-blue/15 hover:text-white sm:tracking-[0.18em]"
                      >
                        Spotify
                      </a>
                    )}
                  </div>
                </article>
                );
              })}
          </div>

          {!loadingDrops && dropsError && (
            <p className="mt-5 rounded-md border border-ah-red/30 bg-ah-red/10 px-4 py-3 text-sm text-ah-soft">
              Spotify sync issue: {dropsError}
            </p>
          )}
        </motion.section>
      </div>
    </section>
  );
}
