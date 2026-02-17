import { NextResponse } from "next/server";
import { getSpotifyToken } from "../_getToken";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playlistId = searchParams.get("playlistId");
  const market = searchParams.get("market") || "US";
  if (!playlistId) {
    return NextResponse.json(
      { error: "playlistId is required" },
      { status: 400 },
    );
  }

  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}?market=${market}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error fetching playlist data for ID ${playlistId}: ${response.status} ${errorText}`,
      );
      return NextResponse.json(
        { error: "Failed to fetch playlist data", detail: errorText },
        { status: response.status },
      );
    }
    const playlistData = await response.json();
    return NextResponse.json(playlistData);
  } catch (error) {
    console.error("Error in /api/spotify/playlist:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch playlist data";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
