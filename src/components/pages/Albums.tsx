"use client";

import { hardcodedAlbums } from "@/data/artistsData";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  artists: { name: string }[];
  external_urls?: { spotify?: string };
  album?: {
    id: string;
    name: string;
    images: { url: string }[];
    release_date: string;
    external_urls?: { spotify?: string };
  };
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images: { url: string }[];
  release_date: string;
  external_urls?: { spotify?: string };
  tracks?: SpotifyTrack[];
}

interface ArtistAlbumsResponse {
  items: SpotifyAlbum[];
  error?: string;
  detail?: string;
}

type Tab = "associated" | "personal" | "executive";

const personalAlbumIds = ["6PBCQ44h15c7VN35lAzu3M", "55Xr7mE7Zya6ccCViy7yyh"];
const executiveAlbumIds = [
  "0djUyeQEWuCWhz1VWRLkFe",
  "257teVy7xAOfpN9OzY85Lo",
  "0QBZSqSw8BumuSzFWqjXYR",
  "343aezvXQOm8UTT9lNB64h",
  "3yejH64Ofken9zTwLQ9c7X",
];

function safeYear(date: string | undefined) {
  if (!date) return "Unknown";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return String(d.getFullYear());
}

function getAlbumCoverUrl(album: SpotifyAlbum) {
  const url = album.images?.[0]?.url || "";
  if (!url.includes("open.spotify.com/album")) return url;

  const fallback: Record<string, string> = {
    "257teVy7xAOfpN9OzY85Lo":
      "https://i.scdn.co/image/ab67616d0000b273prerolls2cover",
    "0djUyeQEWuCWhz1VWRLkFe":
      "https://i.scdn.co/image/ab67616d0000b273wherethesidewalkendscover",
  };

  return fallback[album.id] || "/fallback-album.png";
}

export default function Albums() {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<Tab>("associated");
  const [discographyAlbums, setDiscographyAlbums] = useState<SpotifyAlbum[]>([]);
  const [loadingDiscography, setLoadingDiscography] = useState(true);
  const [discographyError, setDiscographyError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<"latest" | "oldest" | "name">("latest");
  const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbum | null>(null);
  const [albumTracks, setAlbumTracks] = useState<SpotifyTrack[]>([]);
  const [loadingAlbumTracks, setLoadingAlbumTracks] = useState(false);

  useEffect(() => {
    const fetchDiscographyAlbums = async () => {
      setLoadingDiscography(true);
      setDiscographyError(null);
      try {
        const albumsRes = await fetch(
          "/api/spotify/artist-albums?artistId=7iysPipkcsfGFVEgUMDzHQ&include_groups=album,single&limit=50",
        );
        const albumsData: ArtistAlbumsResponse = await albumsRes.json();

        if (!albumsRes.ok) {
          const detail = albumsData.detail ? ` (${albumsData.detail})` : "";
          console.error(`Error fetching artist albums: ${albumsData.error || "Unknown error"}`);
          setDiscographyError(
            `${albumsData.error || "Failed to fetch artist albums"}${detail}`,
          );
          setDiscographyAlbums([]);
          return;
        }

        const fetchedAlbums = albumsData.items || [];
        const fetchedIds = new Set(fetchedAlbums.map((album) => album.id));

        const merged = fetchedAlbums.map((album) => {
          if (!hardcodedAlbums[album.id]) return album;
          return { ...album, tracks: hardcodedAlbums[album.id].tracks };
        });

        const fallbackOnly = Object.values(hardcodedAlbums).filter(
          (album) => !fetchedIds.has(album.id),
        );

        const updatedFallback = await Promise.all(
          fallbackOnly.map(async (album) => {
            try {
              const fallbackRes = await fetch(`/api/spotify/album?albumId=${album.id}`);
              if (!fallbackRes.ok) return album;
              const realData = await fallbackRes.json();
              return { ...realData, tracks: album.tracks };
            } catch {
              return album;
            }
          }),
        );

        const finalAlbums = [...merged, ...updatedFallback];
        finalAlbums.sort((a, b) => {
          const aTime = new Date(a.release_date || 0).getTime() || 0;
          const bTime = new Date(b.release_date || 0).getTime() || 0;
          return bTime - aTime;
        });

        setDiscographyAlbums(finalAlbums);
      } catch (error) {
        console.error("Error fetching discography albums:", error);
        setDiscographyAlbums([]);
        setDiscographyError("Unable to load discography from Spotify.");
      } finally {
        setLoadingDiscography(false);
      }
    };

    fetchDiscographyAlbums();
  }, []);

  const filteredAlbums = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (activeTab === "personal") {
      return discographyAlbums.filter(
        (album) =>
          personalAlbumIds.includes(album.id) &&
          album.name.toLowerCase().includes(normalizedSearch),
      );
    }

    if (activeTab === "executive") {
      return discographyAlbums.filter(
        (album) =>
          executiveAlbumIds.includes(album.id) &&
          album.name.toLowerCase().includes(normalizedSearch),
      );
    }

    return discographyAlbums.filter((album) =>
      album.name.toLowerCase().includes(normalizedSearch),
    );
  }, [activeTab, discographyAlbums, search]);

  const visibleAlbums = useMemo(() => {
    const cloned = [...filteredAlbums];
    if (sortMode === "name") {
      return cloned.sort((a, b) => a.name.localeCompare(b.name));
    }

    return cloned.sort((a, b) => {
      const aTime = new Date(a.release_date || 0).getTime() || 0;
      const bTime = new Date(b.release_date || 0).getTime() || 0;
      return sortMode === "latest" ? bTime - aTime : aTime - bTime;
    });
  }, [filteredAlbums, sortMode]);

  const handleAlbumClick = async (album: SpotifyAlbum) => {
    setSelectedAlbum(album);

    if (album.tracks && album.tracks.length > 0) {
      setAlbumTracks(album.tracks);
      setLoadingAlbumTracks(false);
      return;
    }

    setLoadingAlbumTracks(true);
    try {
      const res = await fetch(`/api/spotify/album?albumId=${album.id}`);
      if (!res.ok) {
        console.error(`Error fetching tracks for album ${album.id}: ${await res.text()}`);
        setAlbumTracks([]);
        setLoadingAlbumTracks(false);
        return;
      }

      const data = await res.json();
      const fetchedTracks = (data?.tracks?.items || []) as SpotifyTrack[];
      const adapted = fetchedTracks.map((track) => ({
        ...track,
        album: {
          id: data.id || album.id,
          name: data.name || album.name,
          images: data.images || album.images || [],
          release_date: data.release_date || album.release_date,
          external_urls: data.external_urls || album.external_urls,
        },
      }));

      setAlbumTracks(adapted);
    } catch (error) {
      console.error(`Error fetching tracks for album ${album.id}:`, error);
      setAlbumTracks([]);
    } finally {
      setLoadingAlbumTracks(false);
    }
  };

  return (
    <section>
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.24em] text-ah-soft">Discography</p>
        <h2 className="mt-3 font-[var(--font-display)] text-4xl uppercase tracking-ah-tight md:text-5xl">
          Albums
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ah-soft md:text-base">
          Personal releases, associated projects, and executive-produced records.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/14 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.17em] text-ah-soft">
            Releases: {discographyAlbums.length}
          </span>
          <span className="rounded-full border border-white/14 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.17em] text-ah-soft">
            Showing: {visibleAlbums.length}
          </span>
        </div>
      </header>

      {!selectedAlbum && (
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "associated", label: "All Albums" },
              { key: "personal", label: "Personal" },
              { key: "executive", label: "Executive" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as Tab)}
                className={`rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  activeTab === tab.key
                    ? "bg-ah-red text-white shadow-ah-glow-red"
                    : "border border-white/14 bg-white/[0.02] text-ah-soft hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search releases"
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm text-white placeholder:text-ah-soft/70 focus:border-ah-blue/45 focus:outline-none md:max-w-xs"
          />
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as typeof sortMode)}
            className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm text-white focus:border-ah-blue/45 focus:outline-none md:max-w-[180px]"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
          </select>
          <button
            onClick={() => {
              setSearch("");
              setSortMode("latest");
            }}
            className="rounded-sm border border-white/14 bg-white/[0.02] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ah-soft transition hover:border-white/35 hover:text-white"
          >
            Reset
          </button>
        </div>
      )}

      {!selectedAlbum && (
        <p className="mb-6 text-[11px] uppercase tracking-[0.18em] text-ah-soft">
          Filter by category, search by title, then sort by release order.
        </p>
      )}

      {!selectedAlbum && discographyError && (
        <p className="mb-6 rounded-xl border border-ah-red/35 bg-ah-red/10 px-4 py-3 text-sm text-ah-soft">
          Spotify sync issue: {discographyError}
        </p>
      )}

      {loadingDiscography ? (
        <div className="flex h-64 items-center justify-center">
          <motion.div
            className="h-12 w-12 rounded-full border-2 border-ah-red border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {selectedAlbum ? (
            <motion.div
              key={selectedAlbum.id}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
              className="grid gap-8 lg:grid-cols-[340px_1fr]"
            >
              <aside className="ah-card h-fit rounded-2xl p-5 lg:sticky lg:top-24">
                <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={getAlbumCoverUrl(selectedAlbum)}
                    alt={`${selectedAlbum.name} cover`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 340px"
                    priority
                  />
                </div>

                <h3 className="mt-4 font-[var(--font-display)] text-2xl uppercase tracking-wide">
                  {selectedAlbum.name}
                </h3>
                <p className="mt-1 text-sm text-ah-soft">
                  {safeYear(selectedAlbum.release_date)} • {albumTracks.length} track
                  {albumTracks.length === 1 ? "" : "s"}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedAlbum(null);
                      setAlbumTracks([]);
                    }}
                    className="rounded-sm border border-white/14 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/35"
                  >
                    Back
                  </button>
                  {selectedAlbum.external_urls?.spotify && (
                    <a
                      href={selectedAlbum.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-sm bg-ah-blue px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-ah-glow-blue"
                    >
                      Open Spotify
                    </a>
                  )}
                </div>
              </aside>

              <div className="space-y-3">
                {loadingAlbumTracks ? (
                  <div className="flex h-40 items-center justify-center">
                    <motion.div
                      className="h-10 w-10 rounded-full border-2 border-ah-blue border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                ) : albumTracks.length > 0 ? (
                  albumTracks.map((track, index) => {
                    const trackUrl =
                      track.external_urls?.spotify || track.album?.external_urls?.spotify;

                    return (
                      <article
                        key={`${track.id}-${index}`}
                        className="ah-card content-auto rounded-2xl px-4 py-3"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="w-5 text-center text-xs text-ah-soft">
                            {index + 1}
                          </div>
                          <div className="relative h-10 w-10 overflow-hidden rounded border border-white/12">
                            <Image
                              src={getAlbumCoverUrl(selectedAlbum)}
                              alt={selectedAlbum.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">
                              {track.name}
                            </p>
                            <p className="truncate text-xs uppercase tracking-[0.14em] text-ah-soft">
                              {track.artists.map((artist) => artist.name).join(", ")}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            {track.preview_url && (
                              <audio
                                controls
                                src={track.preview_url}
                                className="h-8 w-full min-w-[180px] sm:w-32"
                                onClick={(event) => event.stopPropagation()}
                              />
                            )}
                            {trackUrl && (
                              <button
                                onClick={() => window.open(trackUrl, "_blank")}
                                className="rounded-sm border border-ah-blue/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ah-blue transition hover:bg-ah-blue/10"
                              >
                                Open
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-8 text-center text-ah-soft">
                    No tracks available for this release.
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="albums-grid"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            >
              {visibleAlbums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => handleAlbumClick(album)}
                  className="group ah-card content-auto rounded-2xl p-3 text-left transition hover:-translate-y-1 hover:border-ah-red/40"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                    <Image
                      src={getAlbumCoverUrl(album)}
                      alt={`${album.name} cover`}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                  </div>
                  <h3 className="mt-3 line-clamp-2 font-[var(--font-display)] text-lg uppercase leading-tight tracking-wide text-white">
                    {album.name}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ah-soft">
                    {safeYear(album.release_date)}
                  </p>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </section>
  );
}
