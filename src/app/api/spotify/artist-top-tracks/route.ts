// /src/app/api/spotify/artist-top-tracks/route.ts
import { NextResponse } from "next/server";
import { getSpotifyToken } from "../_getToken";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("artistId") || "7iysPipkcsfGFVEgUMDzHQ";
  const market = searchParams.get("market") || "US";
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error fetching top tracks for ID ${artistId}: ${response.status} ${errorText}`,
      );
      return NextResponse.json(
        { error: "Failed to fetch top tracks", detail: errorText },
        { status: response.status },
      );
    }
    const topTracks = await response.json();
    return NextResponse.json(topTracks);
  } catch (error) {
    console.error("Error in /api/spotify/artist-top-tracks:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch top tracks";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
