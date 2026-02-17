"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaExternalLinkAlt, FaSearch } from "react-icons/fa";

interface SpotifyArtist {
  name: string;
  external_urls?: { spotify?: string };
}

interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  artists: SpotifyArtist[];
  album?: {
    id: string;
    name: string;
    release_date: string;
    images: { url: string }[];
  };
  external_urls?: { spotify?: string };
}

interface TopTracksResponse {
  tracks?: SpotifyTrack[];
  error?: string;
  detail?: string;
}

interface PlaylistResponse {
  tracks?: {
    items?: Array<{ track?: SpotifyTrack | null }>;
  };
  error?: string;
  detail?: string;
}

type Tab = "top-tracks" | "playlist";

function safeYear(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return String(parsed.getFullYear());
}

function dedupeTracks(tracks: SpotifyTrack[]): SpotifyTrack[] {
  const seen = new Set<string>();
  return tracks.filter((track) => {
    if (!track?.id || seen.has(track.id)) return false;
    seen.add(track.id);
    return true;
  });
}

function normalizeApiError(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "Unable to load Spotify data.";
  const data = payload as { error?: string; detail?: string };
  if (data.detail) return `${data.error || "Spotify API error"} (${data.detail})`;
  return data.error || "Unable to load Spotify data.";
}

export default function Music() {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<Tab>("top-tracks");
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [playlistTracks, setPlaylistTracks] = useState<SpotifyTrack[]>([]);
  const [loadingTopTracks, setLoadingTopTracks] = useState(true);
  const [loadingPlaylist, setLoadingPlaylist] = useState(true);
  const [topTracksError, setTopTracksError] = useState<string | null>(null);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [reloadKey, setReloadKey] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const artistId = "7iysPipkcsfGFVEgUMDzHQ";
  const playlistId = "1NL9L9zkZjkxlAVV3Qcqfh";

  useEffect(() => {
    const fetchTopTracks = async () => {
      setLoadingTopTracks(true);
      setTopTracksError(null);

      try {
        const response = await fetch(`/api/spotify/artist-top-tracks?artistId=${artistId}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as TopTracksResponse;

        if (!response.ok) {
          setTopTracks([]);
          setTopTracksError(normalizeApiError(payload));
          return;
        }

        setTopTracks(dedupeTracks(payload.tracks || []));
      } catch (error) {
        console.error("Error fetching top tracks:", error);
        setTopTracks([]);
        setTopTracksError("Unable to load top tracks right now.");
      } finally {
        setLoadingTopTracks(false);
      }
    };

    const fetchPlaylistTracks = async () => {
      setLoadingPlaylist(true);
      setPlaylistError(null);

      try {
        const response = await fetch(`/api/spotify/playlist?playlistId=${playlistId}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as PlaylistResponse;

        if (!response.ok) {
          setPlaylistTracks([]);
          setPlaylistError(normalizeApiError(payload));
          return;
        }

        const extracted = (payload.tracks?.items || [])
          .map((item) => item.track)
          .filter((track): track is SpotifyTrack => Boolean(track?.id));

        setPlaylistTracks(dedupeTracks(extracted));
      } catch (error) {
        console.error("Error fetching playlist tracks:", error);
        setPlaylistTracks([]);
        setPlaylistError("Unable to load playlist tracks right now.");
      } finally {
        setLoadingPlaylist(false);
      }
    };

    let mounted = true;
    const load = async () => {
      await Promise.all([fetchTopTracks(), fetchPlaylistTracks()]);
      if (mounted) setLastSyncedAt(new Date().toISOString());
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [artistId, playlistId, reloadKey]);

  const tracks = useMemo(() => {
    if (activeTab === "top-tracks") return topTracks;
    return playlistTracks;
  }, [activeTab, playlistTracks, topTracks]);

  const filteredTracks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tracks;

    return tracks.filter((track) => {
      const artistNames = track.artists.map((artist) => artist.name).join(" ").toLowerCase();
      return (
        track.name.toLowerCase().includes(term) ||
        artistNames.includes(term) ||
        track.album?.name?.toLowerCase().includes(term)
      );
    });
  }, [tracks, search]);

  const loading = activeTab === "top-tracks" ? loadingTopTracks : loadingPlaylist;
  const activeError = activeTab === "top-tracks" ? topTracksError : playlistError;
  const visibleTracks = useMemo(
    () => filteredTracks.slice(0, visibleCount),
    [filteredTracks, visibleCount],
  );

  useEffect(() => {
    setVisibleCount(12);
  }, [activeTab, search]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (isTyping) return;
      if (event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key.toLowerCase() === "r" && event.shiftKey) {
        event.preventDefault();
        setReloadKey((current) => current + 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <section>
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.24em] text-ah-soft">Spotify Feed</p>
        <h2 className="mt-3 font-[var(--font-display)] text-4xl uppercase tracking-ah-tight md:text-5xl">
          Music
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ah-soft md:text-base">
          Live top tracks and playlist data, curated around Xae Neptune.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/14 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ah-soft">
            Top Tracks: {topTracks.length}
          </span>
          <span className="rounded-full border border-white/14 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ah-soft">
            Playlist: {playlistTracks.length}
          </span>
          {lastSyncedAt && (
            <span className="rounded-full border border-white/14 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ah-soft">
              Synced: {new Date(lastSyncedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      </header>

      {(topTracksError || playlistError) && (
        <div className="mb-6 space-y-2">
          {topTracksError && (
            <p className="rounded-xl border border-ah-red/35 bg-ah-red/10 px-4 py-3 text-sm text-ah-soft">
              Top Tracks: {topTracksError}
            </p>
          )}
          {playlistError && (
            <p className="rounded-xl border border-ah-red/35 bg-ah-red/10 px-4 py-3 text-sm text-ah-soft">
              Playlist: {playlistError}
            </p>
          )}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav className="flex flex-wrap gap-2">
          {[
            { key: "top-tracks", label: "Top Tracks" },
            { key: "playlist", label: "Playlist" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={`rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                activeTab === tab.key
                  ? "bg-ah-blue text-white shadow-ah-glow-blue"
                  : "border border-white/14 bg-white/[0.02] text-ah-soft hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <label className="relative block w-full md:max-w-xs">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ah-soft" />
          <input
            ref={searchInputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tracks, artists, albums"
            className="w-full rounded-xl border border-white/14 bg-black/45 py-2 pl-10 pr-3 text-sm text-white placeholder:text-ah-soft/70 focus:border-ah-blue/45 focus:outline-none"
          />
        </label>

        <button
          onClick={() => setReloadKey((current) => current + 1)}
          disabled={loadingTopTracks || loadingPlaylist}
          className="rounded-sm border border-white/14 bg-white/[0.02] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ah-soft transition hover:border-ah-blue/45 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingTopTracks || loadingPlaylist ? "Refreshing..." : "Refresh Feed"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.3 }}
        >
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <motion.div
                className="h-12 w-12 rounded-full border-2 border-ah-blue border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : filteredTracks.length === 0 ? (
            <p className="rounded-2xl border border-white/12 bg-white/[0.02] px-4 py-8 text-center text-ah-soft">
              {activeError
                ? "Spotify data is unavailable for this section right now."
                : "No tracks found for your current search."}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleTracks.map((track, index) => {
                const albumImage = track.album?.images?.[0]?.url;
                const spotifyUrl = track.external_urls?.spotify;

                return (
                  <motion.article
                    key={track.id}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : Math.min(index, 10) * 0.02 }}
                    className="group ah-card content-auto rounded-2xl p-4"
                  >
                    <button
                      onClick={() => {
                        if (spotifyUrl) window.open(spotifyUrl, "_blank");
                      }}
                      className="w-full text-left"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                        {albumImage ? (
                          <Image
                            src={albumImage}
                            alt={`${track.album?.name || track.name} cover`}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="h-full w-full bg-ah-gray" />
                        )}
                      </div>
                      <h3 className="mt-4 line-clamp-2 font-[var(--font-display)] text-xl uppercase tracking-wide text-white">
                        {track.name}
                      </h3>
                      <p className="mt-1 line-clamp-1 text-xs uppercase tracking-[0.16em] text-ah-soft">
                        {track.artists.map((artist) => artist.name).join(", ")}
                      </p>
                      {track.album?.name && (
                        <p className="mt-1 line-clamp-1 text-xs text-white/70">
                          {track.album.name}
                          {track.album.release_date
                            ? ` • ${safeYear(track.album.release_date)}`
                            : ""}
                        </p>
                      )}
                    </button>

                    <div className="mt-4 flex items-center gap-2">
                      {track.preview_url ? (
                        <audio
                          controls
                          src={track.preview_url}
                          className="h-8 w-full"
                          onPlay={() => setCurrentlyPlaying(track.id)}
                          onPause={() => setCurrentlyPlaying(null)}
                          style={{
                            filter:
                              currentlyPlaying === track.id ? "saturate(1.3)" : "saturate(0.9)",
                          }}
                        />
                      ) : (
                        <span className="text-xs uppercase tracking-[0.16em] text-ah-soft">
                          No preview
                        </span>
                      )}

                      {spotifyUrl && (
                        <a
                          href={spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center justify-center rounded-sm border border-ah-blue/45 px-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-ah-blue transition hover:bg-ah-blue/15 hover:text-white"
                        >
                          <FaExternalLinkAlt />
                        </a>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {!loading && filteredTracks.length > visibleCount && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() =>
              setVisibleCount((current) => Math.min(current + 12, filteredTracks.length))
            }
            className="rounded-sm border border-white/16 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-ah-blue/55 hover:bg-ah-blue/10"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
