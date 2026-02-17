// /src/app/api/spotify/artist-albums/route.ts
import { NextResponse } from "next/server";
import { getSpotifyToken } from "../_getToken";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("artistId") || "7iysPipkcsfGFVEgUMDzHQ";
  const includeGroups = searchParams.get("include_groups") || "album,single";
  const market = searchParams.get("market") || "US";
  const limit = searchParams.get("limit") || "50";
  const offset = searchParams.get("offset") || "0";

  try {
    const token = await getSpotifyToken();
    const query = new URLSearchParams({
      include_groups: includeGroups,
      market,
      limit,
      offset,
    });
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?${query.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error fetching artist albums for ID ${artistId}: ${response.status} ${errorText}`,
      );
      return NextResponse.json(
        { error: "Failed to fetch albums data", detail: errorText },
        { status: response.status },
      );
    }
    const albumsData = await response.json();
    return NextResponse.json(albumsData);
  } catch (error) {
    console.error("Error in /api/spotify/artist-albums:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch albums data";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
