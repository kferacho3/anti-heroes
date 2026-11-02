 /* --------------------------------------------------------------------------ng it 5x closer than you did before
   src/components/BeatAudioVisualizerScene.tsx
--------------------------------------------------------------------------- */
"use client";

import { beatsData } from "@/data/beatData";
import { visualizerDecorationAssets } from "@/data/visualAssets";
import { pauseAllAudio } from "@/utils/pauseAllAudio";
import { Html } from "@react-three/drei";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
/* ─────────────────────── 1. Imports ─────────────────────────────── */
import {
  FaMusic,
  FaPause,
  FaPlay,
  FaRandom,
  FaUpload,
} from "react-icons/fa";

/* ---------- Visualizer-One helpers ---------- */
import {
  getRandomPointMode,
  getRandomShape,
} from "@/components/visualizers/VisualizerOneHelpers/geometryHelpers";
import {
  ColorMode,
  PointMode,
  RenderingMode,
  ShapeMode,
} from "@/components/visualizers/VisualizerOneHelpers/types";

/* ---------- Controls panel ---------- */
import { BeatsVisualizerControls } from "./BeatsVisualizerControls";

/* ---------- lazy-loaded visualizers ---------- */
const VisualizerOne = dynamic(() => import("@/components/visualizers/VisualizerOne"), { ssr: false });

export interface BeatAudioVisualizerSceneProps {
  audioUrl: string;
  onGoBack: () => void;
  onShuffle: () => void;
}

/* ---------- deterministic cover helper ---------- */
const coverForAudioUrl = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i)) % 100;
  return `https://xaeneptune.s3.us-east-2.amazonaws.com/beats/Beat+Album+Covers/xaeneptuneBeats${
    hash + 1
  }.png`;
};
const randomBannerArt = () =>
  visualizerDecorationAssets[
    Math.floor(Math.random() * visualizerDecorationAssets.length)
  ];
const findBeatForAudioUrl = (url: string) =>
  beatsData.find((beat) => beat.audioFile === url);

/* ---------------------------------------------------------------- */
export default function BeatAudioVisualizerScene({
  audioUrl: propAudioUrl,
  onGoBack,
}: BeatAudioVisualizerSceneProps) {
  /* ---------- local state ---------- */
  const [visKey, setVisKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [uiHidden, setUiHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [bannerCollapsed, setBannerCollapsed] = useState(false);

  const randomBeatUrl = () =>
    beatsData[Math.floor(Math.random() * beatsData.length)].audioFile;
  const [audioUrl, setAudioUrl] = useState(
    () => propAudioUrl || randomBeatUrl()
  );

  /* now-playing info */
  const [title, setTitle] = useState<string>("Unknown Title");
  const [artist, setArtist] = useState<string>("Xaeneptune");
  const [cover, setCover] = useState<string>(() => coverForAudioUrl(audioUrl));
  const [bannerArt, setBannerArt] = useState<string>(randomBannerArt());

  /* ---------- Visualizer-One controls ---------- */
  const [renderingMode, setRenderingMode] = useState<RenderingMode>("wireframe");
  const [colorMode, setColorMode] = useState<ColorMode>("default");
  const [shapeMode, setShapeMode] = useState<ShapeMode>(getRandomShape());
  const [pointMode, setPointMode] = useState<PointMode>(getRandomPointMode());

  /* ---------- mobile detection ---------- */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* ---------- beat shuffle helper ---------- */
  function shuffleBeat() {
    loadNewAudio(randomBeatUrl());
  }

  /* ---------- lifecycle ---------- */
  useEffect(() => {
    if (!propAudioUrl) return undefined;
    pauseAllAudio();
    setPaused(false);
    setAudioUrl(propAudioUrl);
    setVisKey((k) => k + 1);
    const beat = findBeatForAudioUrl(propAudioUrl);
    const file = propAudioUrl.split("/").pop() ?? "unknown";
    setTitle(beat?.beatName || prettify(decodeURIComponent(file)));
    setArtist(beat?.beatProducer || "Xaeneptune");
    setCover(coverForAudioUrl(propAudioUrl));
    setBannerArt(randomBannerArt());
    return pauseAllAudio;
  }, [propAudioUrl]);

  /* ---------- helpers ---------- */
  const prettify = (name: string) =>
    name.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, "");

  function loadNewAudio(url: string) {
    pauseAllAudio();
    setPaused(false);
    setAudioUrl(url);
    setVisKey((k) => k + 1);
    const beat = findBeatForAudioUrl(url);
    const filename = url.split("/").pop() || "";
    setTitle(beat?.beatName || prettify(filename));
    setArtist(beat?.beatProducer || "Xaeneptune");
    setCover(coverForAudioUrl(url));
    setBannerArt(randomBannerArt());
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadNewAudio(URL.createObjectURL(file));
  }

  function handleGoBack() {
    pauseAllAudio();
    requestAnimationFrame(onGoBack);
  }

  /* ---------------------------------------------------------------- render */
  return (
    <>
      <VisualizerOne
        key={visKey}
        audioUrl={audioUrl}
        isPaused={paused}
        renderingMode={renderingMode}
        colorMode={colorMode}
        shapeMode={shapeMode}
        pointMode={pointMode}
      />

      {/* ------------------------------------------------------------------ */}
      {/*  Overlay (controls, now-playing card, buttons, hide/show toggle)  */}
      {/* ------------------------------------------------------------------ */}
      <Html fullscreen style={{ pointerEvents: "none", zIndex: 9998 }}>
        <style jsx>{`
          @keyframes scrollLeft {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          
          @keyframes smoothCollapse {
            0% { 
              transform: scaleY(1) scaleX(1) translateY(0);
              opacity: 1;
            }
            50% { 
              transform: scaleY(0.1) scaleX(1) translateY(0);
              opacity: 0.8;
            }
            100% { 
              transform: scaleY(0.1) scaleX(0.1) translateY(-60px);
              opacity: 0;
            }
          }
          
          @keyframes smoothExpand {
            0% { 
              transform: scaleY(0.1) scaleX(0.1) translateY(-60px);
              opacity: 0;
            }
            50% { 
              transform: scaleY(0.1) scaleX(1) translateY(0);
              opacity: 0.8;
            }
            100% { 
              transform: scaleY(1) scaleX(1) translateY(0);
              opacity: 1;
            }
          }
          
          .banner-collapsing {
            animation: smoothCollapse 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          
          .banner-expanding {
            animation: smoothExpand 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          
          .text-scroll {
            animation: scrollLeft 15s linear infinite;
          }
          
          .text-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
        {isMobile ? (
          // Mobile Layout (unchanged)
          <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 select-none" style={{ pointerEvents: "auto" }}>
            {/* ──────────── Now-playing card ──────────── */}
            {!uiHidden && (
              <div className="ah-transmission-panel flex w-full items-center gap-2 px-3 py-2 font-mono">
                <Image
                  src={cover}
                  alt="Album cover"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-md object-cover shadow-md shadow-black/40"
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[9px] uppercase tracking-[0.16em] text-ah-ember">
                    Vinyl Stage
                  </span>
                  <span className="text-xs font-extrabold text-ah-electric tracking-wider leading-tight truncate">
                    {decodeURIComponent(title)
                      .replace(/(\+|%20)/g, " ")
                      .replace(/%/g, "")
                      .replace(/\s{2,}/g, " ")
                      .trim()}
                  </span>
                  <span className="text-xs text-ah-magenta truncate">
                    {decodeURIComponent(artist)
                      .replace(/(\+|%20)/g, " ")
                      .replace(/%/g, "")
                      .trim()}
                  </span>
                </div>
              </div>
            )}

            {/* ──────────── main UI cluster ──────────── */}
            {!uiHidden && (
              <div className="flex flex-col gap-2 font-mono">
                {/* row 1 – action buttons */}
                <div className="mx-auto flex min-h-[32px] max-w-fit items-center justify-center gap-3 rounded-md border border-ah-electric/25 bg-black/70 px-3 py-1 shadow-md shadow-ah-electric/15 backdrop-blur-lg">
                  
                  {/* Settings button - only on mobile, positioned to the left */}
                  <div className="flex items-center gap-1">
                    <BeatsVisualizerControls
                      uiHidden={uiHidden}
                      isMobile={isMobile}
                      renderingMode={renderingMode} setRenderingMode={setRenderingMode}
                      colorMode={colorMode} setColorMode={setColorMode}
                      shapeMode={shapeMode} setShapeMode={setShapeMode}
                      pointMode={pointMode} setPointMode={setPointMode}
                    />
                    {/* Vertical separator line */}
                    <div className="h-4 w-px bg-ah-electric/30"></div>
                  </div>

                  <button
                    onClick={handleGoBack}
                    className="btn-main flex items-center gap-1 rounded-md p-2 text-ah-electric transition-colors duration-200 hover:bg-ah-electric/20 hover:text-white active:scale-95"
                    title="Back to Beat Vault">
                    <FaMusic className="w-4 h-4" />
                  </button>

                  <button
                    onClick={shuffleBeat}
                    className="btn-main flex items-center gap-1 rounded-md p-2 text-ah-electric transition-colors duration-200 hover:bg-ah-electric/20 hover:text-white active:scale-95"
                    title="Crate Shuffle">
                    <FaRandom className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setPaused((p) => !p)}
                    className="btn-main flex items-center gap-1 rounded-md p-2 text-ah-electric transition-colors duration-200 hover:bg-ah-electric/20 hover:text-white active:scale-95"
                    title={paused ? "Resume" : "Pause"}>
                    {paused ? (
                      <FaPlay className="w-4 h-4" />
                    ) : (
                      <FaPause className="w-4 h-4" />
                    )}
                  </button>

                  <label
                    className="btn-main flex cursor-pointer items-center gap-1 rounded-md p-2 text-ah-electric transition-colors duration-200 hover:bg-ah-electric/20 hover:text-white active:scale-95"
                    title="Upload">
                    <FaUpload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* ──────────── hide / show toggle ──────────── */}
            <button
              onClick={() => setUiHidden((h) => !h)}
              className="self-center rounded-full border border-ah-electric/25 bg-black/70 p-2 text-ah-electric shadow-md shadow-ah-electric/15 backdrop-blur-lg transition-all hover:scale-105 hover:bg-ah-electric hover:text-black">
              {uiHidden ? (
                <HiOutlineEye className="w-4 h-4" />
              ) : (
                <HiOutlineEyeSlash className="w-4 h-4" />
              )}
            </button>
          </div>
        ) : (
          // Desktop Layout (redesigned)
          <div className="absolute inset-0 flex flex-col select-none" style={{ pointerEvents: "auto" }}>
            {/* ──────────── Top Banner (Song Info) - Below Navbar ──────────── */}
            {!uiHidden && (
              <>
                {/* Main Banner */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-[99998]">
                  <div className={`ah-transmission-panel relative overflow-hidden font-mono transition-all duration-800 ease-out ${bannerCollapsed ? 'banner-collapsing' : 'banner-expanding'}`}>
                    <Image
                      src={bannerArt}
                      alt="Visualizer decorative banner"
                      fill
                      sizes="(max-width: 1024px) 100vw, 960px"
                      className="pointer-events-none absolute inset-0 object-cover opacity-28"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/92 via-black/72 to-ah-magenta/20" />
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-ah-electric/20 to-transparent" />

                    <div className="relative z-10 flex items-center justify-between gap-4 px-4 py-2 backdrop-blur-lg">
                      {/* Collapse Toggle Button - Far Left */}
                      <button
                        onClick={() => setBannerCollapsed(!bannerCollapsed)}
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-ah-electric transition-all duration-300 hover:bg-ah-electric/20 hover:text-white hover:shadow-lg hover:shadow-ah-electric/30 active:scale-95"
                        title={bannerCollapsed ? "Expand Banner" : "Collapse Banner"}>
                        <span className={`text-xs transition-transform duration-500 ${bannerCollapsed ? 'rotate-180' : ''}`}>
                          ▲
                        </span>
                      </button>

                      {!bannerCollapsed && (
                        <>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Image
                              src={cover}
                              alt="Album cover"
                              width={32}
                              height={32}
                              className="h-8 w-8 flex-shrink-0 rounded object-cover shadow-md shadow-black/40"
                            />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="mb-0.5 text-[9px] uppercase tracking-[0.18em] text-ah-ember">
                                Vinyl Stage / Needle Locked
                              </span>
                              {/* Animated Song Title */}
                              <div className="relative overflow-hidden h-4">
                                <span
                                  className="block whitespace-nowrap text-sm font-extrabold leading-tight tracking-wider text-ah-electric text-scroll"
                                  style={{
                                    animationDuration: '15s',
                                    animationIterationCount: 'infinite',
                                    animationTimingFunction: 'linear'
                                  }}>
                                  {decodeURIComponent(title)
                                    .replace(/(\+|%20)/g, " ")
                                    .replace(/%/g, "")
                                    .replace(/\s{2,}/g, " ")
                                    .trim()}
                                </span>
                              </div>
                              <span className="truncate text-xs text-ah-magenta">
                                {decodeURIComponent(artist)
                                  .replace(/(\+|%20)/g, " ")
                                  .replace(/%/g, "")
                                  .trim()}
                              </span>
                            </div>
                          </div>

                          {/* Compact Action Buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={handleGoBack}
                              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-ah-electric transition-colors duration-200 hover:bg-ah-electric/20 hover:text-white active:scale-95"
                              title="Back to Beat Vault">
                              <FaMusic className="w-3 h-3" />
                              <span>Beat Vault</span>
                            </button>

                            <button
                              onClick={shuffleBeat}
                              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-ah-electric transition-colors duration-200 hover:bg-ah-electric/20 hover:text-white active:scale-95"
                              title="Crate Shuffle">
                              <FaRandom className="w-3 h-3" />
                              <span>Shuffle</span>
                            </button>

                            <button
                              onClick={() => setPaused((p) => !p)}
                              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-ah-electric transition-colors duration-200 hover:bg-ah-electric/20 hover:text-white active:scale-95"
                              title={paused ? "Resume" : "Pause"}>
                              {paused ? (
                                <FaPlay className="w-3 h-3" />
                              ) : (
                                <FaPause className="w-3 h-3" />
                              )}
                              <span>{paused ? "Resume" : "Pause"}</span>
                            </button>

                            <label
                              className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs text-ah-electric transition-colors duration-200 hover:bg-ah-electric/20 hover:text-white active:scale-95"
                              title="Upload">
                              <FaUpload className="w-3 h-3" />
                              <span>Upload</span>
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={handleUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsed State Toggle Button - Center of Navbar */}
                {bannerCollapsed && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[99999]">
                    <button
                      onClick={() => setBannerCollapsed(!bannerCollapsed)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-ah-electric/40 bg-black/80 text-ah-electric backdrop-blur-lg transition-all duration-300 hover:bg-ah-electric/20 hover:text-white hover:shadow-lg hover:shadow-ah-electric/30 active:scale-95"
                      title="Expand Banner">
                      <span className="text-sm transition-transform duration-500 rotate-180">
                        ▲
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ──────────── Bottom Controls ──────────── */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-[99998]">
              {/* Visualizer Controls */}
              <BeatsVisualizerControls
                uiHidden={uiHidden}
                isMobile={isMobile}
                renderingMode={renderingMode} setRenderingMode={setRenderingMode}
                colorMode={colorMode} setColorMode={setColorMode}
                shapeMode={shapeMode} setShapeMode={setShapeMode}
                pointMode={pointMode} setPointMode={setPointMode}
              />

              {/* Hide/Show Toggle */}
              <button
                onClick={() => setUiHidden((h) => !h)}
                className="rounded-full border border-ah-electric/25 bg-black/70 p-1.5 text-ah-electric shadow-md shadow-ah-electric/15 backdrop-blur-lg transition-all hover:scale-105 hover:bg-ah-electric hover:text-black">
                {uiHidden ? (
                  <HiOutlineEye className="w-5 h-5" />
                ) : (
                  <HiOutlineEyeSlash className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}
      </Html>
    </>
  );
}
