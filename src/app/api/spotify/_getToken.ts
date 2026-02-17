// /src/app/api/spotify/_getToken.ts
export async function getSpotifyToken(): Promise<string> {
  const clientId =
    process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret =
    process.env.SPOTIFY_CLIENT_SECRET ||
    process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
  const tokenUrl = "https://accounts.spotify.com/api/token";

  if (!clientId || !clientSecret) {
    const missing = [
      !clientId ? "SPOTIFY_CLIENT_ID" : null,
      !clientSecret ? "SPOTIFY_CLIENT_SECRET" : null,
    ]
      .filter(Boolean)
      .join(", ");

    throw new Error(
      `Missing Spotify credentials (${missing}). Set env vars and restart the server.`,
    );
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error fetching Spotify token: ${response.status} ${errorText}`);
    throw new Error("Failed to fetch Spotify token");
  }

  const data = await response.json();
  return data.access_token;
}
