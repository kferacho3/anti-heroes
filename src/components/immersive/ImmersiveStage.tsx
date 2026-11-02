"use client";

import { getRouteVisualIdentity } from "@/data/routeVisualIdentity";
import { useRouteStore } from "@/store/useRouteStore";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import type { CSSProperties } from "react";
import { useImmersiveQuality } from "./useImmersiveQuality";

const ImmersiveCanvas = dynamic(() => import("./ImmersiveCanvas"), {
  ssr: false,
});

export default function ImmersiveStage() {
  const activeRoute = useRouteStore((state) => state.activeRoute);
  const hoveredRoute = useRouteStore((state) => state.hoveredRoute);
  const route = hoveredRoute || activeRoute;
  const identity = getRouteVisualIdentity(route);
  const { quality, reduceMotion } = useImmersiveQuality();

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const root = document.documentElement;
      root.style.setProperty("--ah-pointer-x", `${event.clientX}px`);
      root.style.setProperty("--ah-pointer-y", `${event.clientY}px`);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050507]"
      style={
        {
          "--ah-stage-primary": identity.primary,
          "--ah-stage-secondary": identity.secondary,
          "--ah-stage-accent": identity.accent,
          "--ah-stage-ember": identity.ember,
          "--ah-stage-wash": identity.wash,
        } as CSSProperties
      }
    >
      <div className="absolute inset-0 bg-[radial-gradient(920px_circle_at_var(--ah-pointer-x,18%)_var(--ah-pointer-y,18%),color-mix(in_srgb,var(--ah-stage-secondary)_14%,transparent),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_12%_12%,color-mix(in_srgb,var(--ah-stage-primary)_14%,transparent),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_86%_18%,color-mix(in_srgb,var(--ah-stage-accent)_10%,transparent),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,7,.34),rgba(5,5,7,.58)_48%,rgba(5,5,7,.86))]" />
      {!reduceMotion && <ImmersiveCanvas quality={quality} />}
      <div className="ah-stage-grid absolute inset-0 opacity-[0.105]" />
      <div className="ah-stage-scan absolute inset-0 opacity-[0.07]" />
      <div key={route} className="ah-route-wash absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_105%,transparent_0,rgba(0,0,0,.82)_72%)]" />
    </div>
  );
}
