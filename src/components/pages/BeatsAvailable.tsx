"use client";

import { useVisualizer } from "@/context/VisualizerContext";
import { useRouteStore } from "@/store/useRouteStore";
import React, { useState } from "react";
import BeatsList from "./BeatsList";

export default function BeatsAvailable(): React.ReactElement {
  const { setActiveRoute, setAudioUrlForBeat, setVisualizerMode } = useRouteStore();
  const { isBeatVisualizer, setIsBeatVisualizer } = useVisualizer();
  const [selectedBeat, setSelectedBeat] = useState<{ audioUrl: string } | null>(
    null,
  );

  const handleBeatSelect = (audioUrl: string) => {
    setSelectedBeat({ audioUrl });
    setAudioUrlForBeat(audioUrl);
    setVisualizerMode(true);
    setIsBeatVisualizer(true);
    setActiveRoute("beats-visualizer");
  };

  const handleTabChange = (tab: "beats" | "visualizer") => {
    if (tab === "visualizer") {
      setVisualizerMode(true);
      setIsBeatVisualizer(true);
      if (!selectedBeat) {
        const defaultBeat = "/audio/sample-beat.mp3";
        setSelectedBeat({ audioUrl: defaultBeat });
        setAudioUrlForBeat(defaultBeat);
      }
      setActiveRoute("beats-visualizer");
      return;
    }

    setVisualizerMode(false);
    setIsBeatVisualizer(false);
    setActiveRoute("beats");
  };

  return (
    <div className="min-h-screen">
      <BeatsList
        onBeatSelect={handleBeatSelect}
        isBeatVisualizer={isBeatVisualizer}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
