import { Route } from "@/store/useRouteStore";

export interface RouteVisualIdentity {
  label: string;
  glyph: string;
  primary: string;
  secondary: string;
  accent: string;
  ember: string;
  terrain: [string, string, string];
  wash: string;
}

export const routeVisualIdentity: Record<Route, RouteVisualIdentity> = {
  home: {
    label: "Sonic Vault Portal",
    glyph: "SV",
    primary: "#FF2BD6",
    secondary: "#31F7FF",
    accent: "#8A3FFC",
    ember: "#F4B64A",
    terrain: ["#FF2BD6", "#31F7FF", "#8A3FFC"],
    wash: "rgba(255,43,214,0.14)",
  },
  music: {
    label: "Spotify Signal Feed",
    glyph: "SS",
    primary: "#31F7FF",
    secondary: "#1E6FFF",
    accent: "#FF2BD6",
    ember: "#F4B64A",
    terrain: ["#31F7FF", "#1E6FFF", "#FF2BD6"],
    wash: "rgba(49,247,255,0.14)",
  },
  artist: {
    label: "Artist Constellation",
    glyph: "AC",
    primary: "#8A3FFC",
    secondary: "#FF2BD6",
    accent: "#31F7FF",
    ember: "#F4B64A",
    terrain: ["#8A3FFC", "#FF2BD6", "#31F7FF"],
    wash: "rgba(138,63,252,0.13)",
  },
  beats: {
    label: "Beat Vault",
    glyph: "BV",
    primary: "#F4B64A",
    secondary: "#FF2BD6",
    accent: "#31F7FF",
    ember: "#F4B64A",
    terrain: ["#F4B64A", "#FF2BD6", "#31F7FF"],
    wash: "rgba(244,182,74,0.13)",
  },
  "beats-visualizer": {
    label: "Vinyl Stage",
    glyph: "VS",
    primary: "#22F0D0",
    secondary: "#31F7FF",
    accent: "#FF2BD6",
    ember: "#F4B64A",
    terrain: ["#22F0D0", "#31F7FF", "#FF2BD6"],
    wash: "rgba(34,240,208,0.15)",
  },
  albums: {
    label: "Release Archive",
    glyph: "RA",
    primary: "#C084FC",
    secondary: "#31F7FF",
    accent: "#FF2BD6",
    ember: "#F4B64A",
    terrain: ["#C084FC", "#31F7FF", "#FF2BD6"],
    wash: "rgba(192,132,252,0.13)",
  },
  xaeneptune: {
    label: "Producer Dossier",
    glyph: "PD",
    primary: "#1E6FFF",
    secondary: "#31F7FF",
    accent: "#F4B64A",
    ember: "#F4B64A",
    terrain: ["#1E6FFF", "#31F7FF", "#F4B64A"],
    wash: "rgba(30,111,255,0.12)",
  },
  connect: {
    label: "Collab & Licensing Portal",
    glyph: "CL",
    primary: "#FF2BD6",
    secondary: "#F4B64A",
    accent: "#31F7FF",
    ember: "#F4B64A",
    terrain: ["#FF2BD6", "#F4B64A", "#31F7FF"],
    wash: "rgba(255,43,214,0.14)",
  },
};

export function getRouteVisualIdentity(route: Route): RouteVisualIdentity {
  return routeVisualIdentity[route] || routeVisualIdentity.home;
}
