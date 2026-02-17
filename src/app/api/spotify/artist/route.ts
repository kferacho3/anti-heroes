// /src/app/api/spotify/artist/route.ts
import { NextResponse } from "next/server";
import { getSpotifyToken } from "../_getToken";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("artistId") || "7iysPipkcsfGFVEgUMDzHQ";
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error fetching artist data for ID ${artistId}: ${response.status} ${errorText}`,
      );
      return NextResponse.json(
        { error: "Failed to fetch artist data", detail: errorText },
        { status: response.status },
      );
    }
    const artistData = await response.json();
    return NextResponse.json(artistData);
  } catch (error) {
    console.error("Error in /api/spotify/artist:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch artist data";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
