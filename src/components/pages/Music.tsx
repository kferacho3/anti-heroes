"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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
  tracks: SpotifyTrack[];
}

interface PlaylistResponse {
  tracks: {
    items: Array<{ track: SpotifyTrack }>;
  };
}

type Tab = "top-tracks" | "playlist";

export default function Music() {
  const [activeTab, setActiveTab] = useState<Tab>("top-tracks");
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [playlistTracks, setPlaylistTracks] = useState<SpotifyTrack[]>([]);
  const [loadingTopTracks, setLoadingTopTracks] = useState(true);
  const [loadingPlaylist, setLoadingPlaylist] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const artistId = "7iysPipkcsfGFVEgUMDzHQ";
  const playlistId = "1NL9L9zkZjkxlAVV3Qcqfh";

  useEffect(() => {
    const fetchTopTracks = async () => {
      setLoadingTopTracks(true);
      try {
        const response = await fetch(`/api/spotify/artist-top-tracks?artistId=${artistId}`);
        if (!response.ok) {
          console.error(`Error fetching top tracks: ${await response.text()}`);
          setTopTracks([]);
          return;
        }
        const data: TopTracksResponse = await response.json();
        setTopTracks(data.tracks || []);
      } catch (error) {
        console.error("Error fetching top tracks:", error);
        setTopTracks([]);
      } finally {
        setLoadingTopTracks(false);
      }
    };

    const fetchPlaylistTracks = async () => {
      setLoadingPlaylist(true);
      try {
        const response = await fetch(`/api/spotify/playlist?playlistId=${playlistId}`);
        if (!response.ok) {
          console.error(`Error fetching playlist tracks: ${await response.text()}`);
          setPlaylistTracks([]);
          return;
        }

        const data: PlaylistResponse = await response.json();
        const extractedTracks = data.tracks.items.map((item) => item.track).filter(Boolean);
        setPlaylistTracks(extractedTracks);
      } catch (error) {
        console.error("Error fetching playlist tracks:", error);
        setPlaylistTracks([]);
      } finally {
        setLoadingPlaylist(false);
      }
    };

    fetchTopTracks();
    fetchPlaylistTracks();
  }, [artistId, playlistId]);

  const tracks = useMemo(() => {
    if (activeTab === "top-tracks") return topTracks;
    return playlistTracks;
  }, [activeTab, playlistTracks, topTracks]);

  const loading = activeTab === "top-tracks" ? loadingTopTracks : loadingPlaylist;

  return (
    <section>
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.24em] text-ah-soft">Spotify Feed</p>
        <h2 className="mt-3 font-[var(--font-display)] text-4xl uppercase tracking-ah-tight md:text-5xl">
          Music
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ah-soft md:text-base">
          Live top tracks and playlist data, redesigned for Anti-Heroes.
        </p>
      </header>

      <nav className="mb-8 flex flex-wrap gap-2">
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

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
        >
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <motion.div
                className="h-12 w-12 rounded-full border-2 border-ah-blue border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : tracks.length === 0 ? (
            <p className="rounded-2xl border border-white/12 bg-white/[0.02] px-4 py-8 text-center text-ah-soft">
              No tracks found for this section.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tracks.map((track, index) => {
                const albumImage = track.album?.images?.[0]?.url;
                const spotifyUrl = track.external_urls?.spotify;

                return (
                  <motion.article
                    key={`${track.id}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group ah-card rounded-2xl p-4"
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

                    {track.preview_url && (
                      <audio
                        controls
                        src={track.preview_url}
                        className="mt-4 h-8 w-full"
                        onPlay={() => setCurrentlyPlaying(track.id)}
                        onPause={() => setCurrentlyPlaying(null)}
                        style={{
                          filter:
                            currentlyPlaying === track.id ? "saturate(1.3)" : "saturate(0.9)",
                        }}
                      />
                    )}
                  </motion.article>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function safeYear(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return String(parsed.getFullYear());
}
