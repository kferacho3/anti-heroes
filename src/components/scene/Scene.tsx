"use client";

import BeatAudioVisualizerScene from "@/components/scene/BeatAudioVisualizerScene";
import { Route, useRouteStore } from "@/store/useRouteStore";
import { OrbitControls } from "@react-three/drei";
import React from "react";

export type SceneProps = React.ComponentPropsWithoutRef<"group"> & {
  onLoaded?: () => void;
  isMobile?: boolean;
  onSelectRoute: (route: Route) => void;
  activeRoute: Route;
  onBeatGoBack?: () => void;
  onBeatShuffle?: () => void;
  hoveredRoute?: Route | null;
  environmentMode?: "day" | "night";
};

export default function Scene({
  onSelectRoute,
  activeRoute,
  onBeatGoBack,
  onBeatShuffle,
  isMobile = false,
  ...props
}: SceneProps) {
  const audioUrlForBeat = useRouteStore((state) => state.audioUrlForBeat);
  const showVisualizer = activeRoute === "beats-visualizer";

  const maxDistance = isMobile ? 180 : 100;
  const minDistance = isMobile ? 5 : 3;
  const zoomSpeed = 6;

  return (
    <group {...props}>
      {showVisualizer && (
        <BeatAudioVisualizerScene
          audioUrl={audioUrlForBeat}
          onGoBack={onBeatGoBack || (() => onSelectRoute("beats"))}
          onShuffle={onBeatShuffle || (() => console.log("Shuffle beat"))}
        />
      )}

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.15}
        zoomSpeed={zoomSpeed}
        maxDistance={maxDistance}
        minDistance={minDistance}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
    </group>
  );
}
