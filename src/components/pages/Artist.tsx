"use client";

import { hardcodedAlbums } from "@/data/artistsData";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface SpotifyArtist {
  id: string;
  name: string;
  images?: { url: string }[];
  followers?: { total: number };
  genres?: string[];
  external_urls?: { spotify?: string };
}

interface SpotifyTrack {
  id: string;
  name: string;
  preview_url?: string | null;
  external_urls?: {
    spotify?: string;
    soundcloud?: string;
  };
  album: {
    id: string;
    name: string;
    images?: { url: string }[];
    release_date: string;
    external_urls?: { spotify?: string };
  };
  artists: { id?: string; name: string }[];
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images?: { url: string }[];
  release_date: string;
  external_urls?: { spotify?: string };
  tracks?: SpotifyTrack[];
}

interface SpotifyAlbumResponse {
  id: string;
  name: string;
  images?: { url: string }[];
  release_date: string;
  external_urls?: { spotify?: string };
  tracks?: {
    items?: SpotifyTrack[];
  };
}

interface TopTracksResponse {
  tracks: SpotifyTrack[];
}

interface DiscographyGroup {
  album: SpotifyAlbum;
  tracks: SpotifyTrack[];
}

type ArtistTab = "top-tracks" | "discography";

const xoJuneAlbum: SpotifyAlbum & { tracks: SpotifyTrack[] } = {
  id: "xo-june-bedroom-tapes-vol1",
  name: "Bedroom Tapes, Vol 1.",
  release_date: "2024",
  images: [
    {
      url: "https://i1.sndcdn.com/artworks-HO9ZhEvqdwTcFVk2-R8IuQQ-t1080x1080.jpg",
    },
  ],
  external_urls: { spotify: "https://soundcloud.com/xojune/real-foyf" },
  tracks: [
    {
      id: "xo-june-real-foyf",
      name: "Real (FOYF) Prod. XaeNeptune",
      preview_url: null,
      external_urls: {
        spotify: "https://soundcloud.com/xojune/real-foyf",
        soundcloud: "https://soundcloud.com/xojune/real-foyf",
      },
      album: {
        id: "xo-june-bedroom-tapes-vol1",
        name: "Bedroom Tapes, Vol 1.",
        images: [
          {
            url: "https://i1.sndcdn.com/artworks-HO9ZhEvqdwTcFVk2-R8IuQQ-t1080x1080.jpg",
          },
        ],
        release_date: "2024",
        external_urls: { spotify: "https://soundcloud.com/xojune/real-foyf" },
      },
      artists: [{ name: "XO June" }],
    },
  ],
};

function getArtistImageUrl(artist: SpotifyArtist | null): string {
  if (!artist || !artist.name) return "https://via.placeholder.com/300?text=No+Image";

  if (artist.images && artist.images.length > 0 && artist.images[0].url) {
    return artist.images[0].url;
  }

  const lowerName = artist.name.toLowerCase();
  if (lowerName === "iann tyler") {
    return "https://i1.sndcdn.com/avatars-8HyvIOZxOAq1iNja-dBVAMA-t500x500.jpg";
  }
  if (lowerName === "kyistt") {
    return "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/5a/12/bc/5a12bc69-7832-d7c2-83d8-7fb3412c4f41/pr_source.png/190x190cc.webp";
  }
  if (lowerName === "statik") {
    return "https://xaeneptune.s3.us-east-2.amazonaws.com/images/Artist/xaeneptune-no-profile.webp";
  }

  return "https://via.placeholder.com/300?text=No+Image";
}

async function fetchSpotifyAlbum(albumId: string): Promise<SpotifyAlbumResponse | null> {
  try {
    const response = await fetch(`/api/spotify/album?albumId=${albumId}`);
    if (!response.ok) return null;
    return (await response.json()) as SpotifyAlbumResponse;
  } catch {
    return null;
  }
}

function longestCommonSubstring(s1: string, s2: string): number {
  const matrix = Array.from({ length: s1.length + 1 }, () =>
    Array(s2.length + 1).fill(0),
  );
  let max = 0;
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
        if (matrix[i][j] > max) max = matrix[i][j];
      }
    }
  }
  return max;
}

function isSimilar(name1: string, name2: string): boolean {
  const first = name1.replace(/\s/g, "").toLowerCase();
  const second = name2.replace(/\s/g, "").toLowerCase();
  return longestCommonSubstring(first, second) >= 5;
}

function getAhmadFallbackTopTracks(): SpotifyTrack[] {
  const jordanyear = hardcodedAlbums["6PBCQ44h15c7VN35lAzu3M"];
  const social = hardcodedAlbums["55Xr7mE7Zya6ccCViy7yyh"];
  const track1 = jordanyear?.tracks.find((track) => track.id === "jt1");
  const track2 = social?.tracks.find((track) => track.id === "sn5");

  if (!track1 || !track2) return [];

  const track1WithAlbum: SpotifyTrack = {
    ...track1,
    album: {
      id: jordanyear.id,
      name: jordanyear.name,
      images: jordanyear.images,
      release_date: jordanyear.release_date,
      external_urls: jordanyear.external_urls,
    },
  };

  const track2WithAlbum: SpotifyTrack = {
    ...track2,
    album: {
      id: social.id,
      name: social.name,
      images: social.images,
      release_date: social.release_date,
      external_urls: social.external_urls,
    },
  };

  return [track1WithAlbum, track2WithAlbum];
}

async function extractTracksForArtist(artist: SpotifyArtist): Promise<DiscographyGroup[]> {
  let extractedTracks: SpotifyTrack[] = [];
  const artistName = artist.name;

  for (const albumId in hardcodedAlbums) {
    const album = hardcodedAlbums[albumId];
    const albumTracks = album.tracks || [];

    const filtered = albumTracks.filter((track) => {
      const hasArtist = track.artists.some((trackArtist) =>
        isSimilar(trackArtist.name, artistName),
      );
      const hasXae = track.artists.some(
        (trackArtist) => trackArtist.name.toLowerCase() === "xae neptune",
      );
      return hasArtist && hasXae;
    });

    const adaptedTracks: SpotifyTrack[] = filtered.map((track) => ({
      ...track,
      album: {
        id: album.id,
        name: album.name,
        images: album.images,
        release_date: album.release_date,
        external_urls: album.external_urls,
      },
    }));

    extractedTracks = [...extractedTracks, ...adaptedTracks];
  }

  if (artist.name.toLowerCase() === "xo june") {
    extractedTracks = [
      ...extractedTracks,
      ...xoJuneAlbum.tracks.map((track) => ({
        ...track,
        album: {
          id: xoJuneAlbum.id,
          name: xoJuneAlbum.name,
          images: xoJuneAlbum.images,
          release_date: xoJuneAlbum.release_date,
          external_urls: xoJuneAlbum.external_urls,
        },
      })),
    ];
  }

  if (artist.name.toLowerCase() === "ahmad") {
    extractedTracks = getAhmadFallbackTopTracks();
  }

  const uniqueMap = new Map<string, SpotifyTrack>();
  extractedTracks.forEach((track) => {
    if (!uniqueMap.has(track.id)) uniqueMap.set(track.id, track);
  });

  const grouped = new Map<string, DiscographyGroup>();
  Array.from(uniqueMap.values()).forEach((track) => {
    const albumId = track.album.id;
    if (grouped.has(albumId)) {
      grouped.get(albumId)!.tracks.push(track);
    } else {
      grouped.set(albumId, { album: track.album, tracks: [track] });
    }
  });

  for (const [albumId, group] of grouped.entries()) {
    const spotifyAlbum = await fetchSpotifyAlbum(albumId);
    if (!spotifyAlbum) continue;
    group.album = {
      ...group.album,
      ...spotifyAlbum,
      tracks: group.album.tracks,
    };
  }

  return Array.from(grouped.values());
}

function safeYear(date: string | undefined): string {
  if (!date) return "Unknown";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return String(parsed.getFullYear());
}

export default function Artist() {
  const [mainArtist, setMainArtist] = useState<SpotifyArtist | null>(null);
  const [associatedArtists, setAssociatedArtists] = useState<SpotifyArtist[]>([]);
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingAssociated, setLoadingAssociated] = useState(true);

  const [selectedArtist, setSelectedArtist] = useState<SpotifyArtist | null>(null);
  const [activeArtistTab, setActiveArtistTab] = useState<ArtistTab>("top-tracks");

  const [artistTopTracks, setArtistTopTracks] = useState<SpotifyTrack[]>([]);
  const [loadingTopTracks, setLoadingTopTracks] = useState(false);
  const [artistDiscography, setArtistDiscography] = useState<DiscographyGroup[]>([]);
  const [loadingDiscography, setLoadingDiscography] = useState(false);

  const [selectedDiscographyAlbum, setSelectedDiscographyAlbum] = useState<SpotifyAlbum | null>(
    null,
  );
  const [discographyTracks, setDiscographyTracks] = useState<SpotifyTrack[]>([]);
  const [loadingAlbumTracks, setLoadingAlbumTracks] = useState(false);

  const mainArtistId = "7iysPipkcsfGFVEgUMDzHQ";

  const associatedArtistIds = useMemo(
    () => [
      "4ihlULofncvxd3Cz7ewTNV",
      "3uwUJ78bwdDBLo3O04xlnL",
      "4nRgpdGBG8DPYMHikqUp3w",
      "6mFKPMFGbulPhOnj3UvzAF",
      "0z3M3HSEsrgi5YmwY5e9fB",
      "2pZnyv4zLqnSDktBqXQlZz",
      "0zRLHcRfGiz3GCHk852mIL",
      "6cPZNDrHphEZ3ok4t8K7ZT",
      "5bNFzNn84AoUqClYZJKan5",
      "1IwJ9sVzmn5hBSe02HsLnM",
      "5pVOuKzA3hhsdScwg2k4o",
      "3k8lBDenIm90lWaSpAYQeH",
      "4O0urd9sL16UmRnmdHienf",
      "05eq9g0p6jze8k6Wva5BUz",
      "2pZnyv4zLqnSDktBqXQlZz",
      "0z3M3HSEsrgi5YmwY5e9fB",
      "4wtNgDt8QcZCPfx64NiBGi",
      "6E9lvijZw6hhoNiEaZ765i",
    ],
    [],
  );

  const xoJuneArtist = useMemo<SpotifyArtist>(
    () => ({
      id: "xo-june",
      name: "XO June",
      images: [
        {
          url: "https://i1.sndcdn.com/avatars-WTj6LWMHQK0o1lDw-Vz5D1A-t500x500.jpg",
        },
      ],
      followers: { total: 0 },
      genres: [],
      external_urls: { spotify: "https://soundcloud.com/xojune" },
    }),
    [],
  );

  useEffect(() => {
    const fetchMainArtist = async () => {
      try {
        const response = await fetch(`/api/spotify/artist?artistId=${mainArtistId}`);
        const data: SpotifyArtist = await response.json();
        setMainArtist(data);
      } catch (error) {
        console.error("Error fetching main artist:", error);
      } finally {
        setLoadingMain(false);
      }
    };

    fetchMainArtist();
  }, [mainArtistId]);

  useEffect(() => {
    const fetchAssociatedArtists = async () => {
      try {
        const responses = await Promise.all(
          associatedArtistIds.map((id) =>
            fetch(`/api/spotify/artist?artistId=${id}`).then((response) => response.json()),
          ),
        );
        setAssociatedArtists([...responses, xoJuneArtist]);
      } catch (error) {
        console.error("Error fetching associated artists:", error);
        setAssociatedArtists([xoJuneArtist]);
      } finally {
        setLoadingAssociated(false);
      }
    };

    fetchAssociatedArtists();
  }, [associatedArtistIds, xoJuneArtist]);

  useEffect(() => {
    if (!selectedArtist) return;

    const fetchSelectedArtistData = async () => {
      setLoadingTopTracks(true);
      setLoadingDiscography(true);
      setSelectedDiscographyAlbum(null);
      setDiscographyTracks([]);

      try {
        if (selectedArtist.name.toLowerCase() === "ahmad") {
          setArtistTopTracks(getAhmadFallbackTopTracks());
        } else {
          const response = await fetch(
            `/api/spotify/artist-top-tracks?artistId=${selectedArtist.id}`,
          );
          const data: TopTracksResponse = await response.json();
          setArtistTopTracks((data.tracks || []).slice(0, 10));
        }
      } catch (error) {
        console.error("Error fetching artist top tracks:", error);
        setArtistTopTracks([]);
      } finally {
        setLoadingTopTracks(false);
      }

      try {
        const groups = await extractTracksForArtist(selectedArtist);
        setArtistDiscography(groups);
      } catch (error) {
        console.error("Error building artist discography:", error);
        setArtistDiscography([]);
      } finally {
        setLoadingDiscography(false);
      }
    };

    fetchSelectedArtistData();
  }, [selectedArtist]);

  const openDiscographyAlbum = async (album: SpotifyAlbum) => {
    setSelectedDiscographyAlbum(album);
    setLoadingAlbumTracks(true);

    try {
      const spotifyAlbum = await fetchSpotifyAlbum(album.id);
      const albumWithBestData: SpotifyAlbum = {
        id: spotifyAlbum?.id ?? album.id,
        name: spotifyAlbum?.name ?? album.name,
        images: spotifyAlbum?.images ?? album.images,
        release_date: spotifyAlbum?.release_date ?? album.release_date,
        external_urls: spotifyAlbum?.external_urls ?? album.external_urls,
        tracks: album.tracks,
      };

      const fallbackTracks = album.tracks || [];
      const spotifyTracks = spotifyAlbum?.tracks?.items;

      const tracksToUse = fallbackTracks.length > 0 ? fallbackTracks : spotifyTracks || [];
      const adaptedTracks: SpotifyTrack[] = tracksToUse.map((track) => ({
        ...track,
        album: {
          id: albumWithBestData.id,
          name: albumWithBestData.name,
          images: albumWithBestData.images || [],
          release_date: albumWithBestData.release_date || album.release_date,
          external_urls: albumWithBestData.external_urls || album.external_urls,
        },
      }));

      setDiscographyTracks(adaptedTracks);
      setSelectedDiscographyAlbum(albumWithBestData);
    } catch (error) {
      console.error("Error opening discography album:", error);
      setDiscographyTracks([]);
    } finally {
      setLoadingAlbumTracks(false);
    }
  };

  if (loadingMain) {
    return (
      <div className="flex h-64 items-center justify-center">
        <motion.div
          className="h-12 w-12 rounded-full border-2 border-ah-red border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!selectedArtist) {
    return (
      <section>
        <header className="mb-9">
          <p className="text-xs uppercase tracking-[0.24em] text-ah-soft">Roster</p>
          <h2 className="mt-3 font-[var(--font-display)] text-4xl uppercase tracking-ah-tight md:text-5xl">
            Artist Network
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ah-soft md:text-base">
            Select an artist to view top tracks and collaboration discography.
          </p>
        </header>

        {mainArtist && (
          <article className="ah-card mb-8 flex flex-col items-start gap-4 rounded-2xl p-5 md:flex-row md:items-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/20">
              <Image
                src={getArtistImageUrl(mainArtist)}
                alt={mainArtist.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div>
              <h3 className="font-[var(--font-display)] text-3xl uppercase tracking-wide text-white">
                {mainArtist.name}
              </h3>
              <p className="text-xs uppercase tracking-[0.16em] text-ah-soft">
                {mainArtist.followers?.total?.toLocaleString() || "0"} Followers
              </p>
              {mainArtist.genres && mainArtist.genres.length > 0 && (
                <p className="mt-2 text-xs text-white/75">
                  {mainArtist.genres.slice(0, 3).join(" • ")}
                </p>
              )}
            </div>
          </article>
        )}

        {loadingAssociated ? (
          <div className="flex h-56 items-center justify-center">
            <motion.div
              className="h-10 w-10 rounded-full border-2 border-ah-blue border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {associatedArtists.map((artist) => (
              <button
                key={artist.id}
                onClick={() => {
                  setSelectedArtist(artist);
                  setActiveArtistTab("top-tracks");
                }}
                className="group ah-card rounded-2xl p-4 text-left transition hover:-translate-y-1 hover:border-ah-red/45"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={getArtistImageUrl(artist)}
                    alt={artist.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                </div>
                <h3 className="mt-3 line-clamp-1 font-[var(--font-display)] text-2xl uppercase tracking-wide text-white">
                  {artist.name}
                </h3>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ah-soft">
                  {artist.followers?.total?.toLocaleString() || "0"} Followers
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section>
      <header className="mb-8">
        <button
          onClick={() => {
            setSelectedArtist(null);
            setArtistTopTracks([]);
            setArtistDiscography([]);
            setSelectedDiscographyAlbum(null);
            setDiscographyTracks([]);
          }}
          className="mb-3 rounded-sm border border-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/35"
        >
          Back to Artists
        </button>

        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/20">
            <Image
              src={getArtistImageUrl(selectedArtist)}
              alt={selectedArtist.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-ah-soft">Selected Artist</p>
            <h2 className="mt-2 font-[var(--font-display)] text-4xl uppercase tracking-ah-tight md:text-5xl">
              {selectedArtist.name}
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ah-soft">
              {selectedArtist.followers?.total?.toLocaleString() || "0"} Followers
            </p>
          </div>
        </div>
      </header>

      <nav className="mb-8 flex gap-2">
        <button
          onClick={() => setActiveArtistTab("top-tracks")}
          className={`rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
            activeArtistTab === "top-tracks"
              ? "bg-ah-red text-white shadow-ah-glow-red"
              : "border border-white/14 bg-white/[0.02] text-ah-soft hover:text-white"
          }`}
        >
          Top Tracks
        </button>
        <button
          onClick={() => setActiveArtistTab("discography")}
          className={`rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
            activeArtistTab === "discography"
              ? "bg-ah-blue text-white shadow-ah-glow-blue"
              : "border border-white/14 bg-white/[0.02] text-ah-soft hover:text-white"
          }`}
        >
          Discography
        </button>
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeArtistTab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.3 }}
        >
          {activeArtistTab === "top-tracks" ? (
            loadingTopTracks ? (
              <div className="flex h-64 items-center justify-center">
                <motion.div
                  className="h-11 w-11 rounded-full border-2 border-ah-red border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : artistTopTracks.length === 0 ? (
              <p className="rounded-2xl border border-white/12 bg-white/[0.02] px-4 py-8 text-center text-ah-soft">
                No top tracks found for this artist.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {artistTopTracks.map((track, index) => {
                  const spotifyUrl =
                    track.external_urls?.spotify || track.album?.external_urls?.spotify;
                  const albumImage = track.album.images?.[0]?.url;

                  return (
                    <article key={`${track.id}-${index}`} className="group ah-card rounded-2xl p-4">
                      <button
                        className="w-full text-left"
                        onClick={() => {
                          if (spotifyUrl) window.open(spotifyUrl, "_blank");
                        }}
                      >
                        <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                          {albumImage ? (
                            <Image
                              src={albumImage}
                              alt={`${track.album.name} cover`}
                              fill
                              className="object-cover transition duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="h-full w-full bg-ah-gray" />
                          )}
                        </div>
                        <h3 className="mt-3 line-clamp-2 font-[var(--font-display)] text-xl uppercase tracking-wide text-white">
                          {track.name}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-xs uppercase tracking-[0.16em] text-ah-soft">
                          {track.artists.map((artist) => artist.name).join(", ")}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-white/75">
                          {track.album.name} • {safeYear(track.album.release_date)}
                        </p>
                      </button>
                      {track.preview_url && (
                        <audio
                          controls
                          src={track.preview_url}
                          className="mt-4 h-8 w-full"
                          onClick={(event) => event.stopPropagation()}
                        />
                      )}
                    </article>
                  );
                })}
              </div>
            )
          ) : loadingDiscography ? (
            <div className="flex h-64 items-center justify-center">
              <motion.div
                className="h-11 w-11 rounded-full border-2 border-ah-blue border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : selectedDiscographyAlbum ? (
            <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
              <aside className="ah-card h-fit rounded-2xl p-5 lg:sticky lg:top-24">
                <button
                  onClick={() => {
                    setSelectedDiscographyAlbum(null);
                    setDiscographyTracks([]);
                  }}
                  className="mb-4 rounded-sm border border-white/14 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white/35"
                >
                  Back to Albums
                </button>

                <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                  {selectedDiscographyAlbum.images?.[0]?.url ? (
                    <Image
                      src={selectedDiscographyAlbum.images[0].url}
                      alt={selectedDiscographyAlbum.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 320px"
                    />
                  ) : (
                    <div className="h-full w-full bg-ah-gray" />
                  )}
                </div>

                <h3 className="mt-4 font-[var(--font-display)] text-2xl uppercase tracking-wide">
                  {selectedDiscographyAlbum.name}
                </h3>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ah-soft">
                  {safeYear(selectedDiscographyAlbum.release_date)} • {discographyTracks.length} track
                  {discographyTracks.length === 1 ? "" : "s"}
                </p>
              </aside>

              <div className="space-y-3">
                {loadingAlbumTracks ? (
                  <div className="flex h-40 items-center justify-center">
                    <motion.div
                      className="h-9 w-9 rounded-full border-2 border-ah-blue border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                ) : discographyTracks.length > 0 ? (
                  discographyTracks.map((track, index) => {
                    const url =
                      track.external_urls?.spotify || track.album.external_urls?.spotify;

                    return (
                      <article key={`${track.id}-${index}`} className="ah-card rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-4">
                          <div className="w-5 text-center text-xs text-ah-soft">{index + 1}</div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">{track.name}</p>
                            <p className="truncate text-xs uppercase tracking-[0.14em] text-ah-soft">
                              {track.artists.map((artist) => artist.name).join(", ")}
                            </p>
                          </div>
                          {url && (
                            <button
                              onClick={() => window.open(url, "_blank")}
                              className="rounded-sm border border-ah-blue/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ah-blue transition hover:bg-ah-blue/10"
                            >
                              Open
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <p className="rounded-2xl border border-white/12 bg-white/[0.02] px-4 py-8 text-center text-ah-soft">
                    No tracks found for this release.
                  </p>
                )}
              </div>
            </div>
          ) : artistDiscography.length === 0 ? (
            <p className="rounded-2xl border border-white/12 bg-white/[0.02] px-4 py-8 text-center text-ah-soft">
              No discography found for this artist.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {artistDiscography.map((group) => (
                <button
                  key={group.album.id}
                  onClick={() => openDiscographyAlbum(group.album)}
                  className="group ah-card rounded-2xl p-3 text-left transition hover:-translate-y-1 hover:border-ah-blue/50"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                    {group.album.images?.[0]?.url ? (
                      <Image
                        src={group.album.images[0].url}
                        alt={group.album.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="h-full w-full bg-ah-gray" />
                    )}
                  </div>
                  <h3 className="mt-3 line-clamp-2 font-[var(--font-display)] text-lg uppercase leading-tight tracking-wide text-white">
                    {group.album.name}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ah-soft">
                    {safeYear(group.album.release_date)} • {group.tracks.length} track
                    {group.tracks.length === 1 ? "" : "s"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
