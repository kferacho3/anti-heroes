// /src/app/api/spotify/album/route.ts
import { NextResponse } from "next/server";
import { getSpotifyToken } from "../_getToken";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get("albumId");
  if (!albumId) {
    return NextResponse.json({ error: "albumId is required" }, { status: 400 });
  }
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error fetching album data for ID ${albumId}: ${response.status} ${errorText}`,
      );
      return NextResponse.json(
        { error: "Failed to fetch album data", detail: errorText },
        { status: response.status },
      );
    }
    const albumData = await response.json();
    return NextResponse.json(albumData);
  } catch (error) {
    console.error("Error in /api/spotify/album:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch album data";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
