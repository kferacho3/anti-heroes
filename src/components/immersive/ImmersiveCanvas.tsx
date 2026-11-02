"use client";

import { getRouteVisualIdentity } from "@/data/routeVisualIdentity";
import { useRouteStore } from "@/store/useRouteStore";
import { Bloom, EffectComposer, SMAA, Vignette } from "@react-three/postprocessing";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import * as THREE from "three";
import { ImmersiveQuality } from "./useImmersiveQuality";
import VinylTransmissionRig from "./VinylTransmissionRig";

interface ImmersiveCanvasProps {
  quality: ImmersiveQuality;
}

export default function ImmersiveCanvas({ quality }: ImmersiveCanvasProps) {
  const activeRoute = useRouteStore((state) => state.activeRoute);
  const hoveredRoute = useRouteStore((state) => state.hoveredRoute);
  const route = hoveredRoute || activeRoute;
  const identity = useMemo(() => getRouteVisualIdentity(route), [route]);
  const dpr = quality === "high" ? [1, 1.65] : quality === "medium" ? [1, 1.35] : [0.75, 1];

  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 4.8, 10.6], fov: 52, near: 0.1, far: 70 }}
      dpr={dpr as [number, number]}
      frameloop="always"
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
    >
      <Suspense fallback={null}>
        <color attach="background" args={["#050507"]} />
        <fog attach="fog" args={["#050507", 9, 30]} />
        <ambientLight intensity={0.48} />
        <directionalLight position={[-4, 7, 5]} intensity={1.15} color="#ffffff" />
        <spotLight
          position={[-2.2, 5.8, 3.6]}
          angle={0.42}
          penumbra={0.86}
          intensity={8}
          color={identity.primary}
          distance={18}
        />
        <pointLight position={[4, 3, 2]} intensity={7} color={identity.secondary} distance={16} />
        <pointLight position={[-3.2, 1.2, 2.7]} intensity={4.8} color={identity.accent} distance={12} />
        <VinylTransmissionRig quality={quality} route={route} />
        {quality !== "low" && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur luminanceThreshold={0.18} intensity={0.34} radius={0.48} />
            <Vignette eskil={false} offset={0.22} darkness={0.58} />
            <SMAA />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
