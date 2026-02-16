"use client";

import GoBackButton from "@/components/layout/GoBackButton";
import NavigationOverlay from "@/components/layout/NavigationOverlay";
import AHShell from "@/components/layout/AHShell";
import Sidebar from "@/components/layout/Sidebar";
import TopBarNavbar from "@/components/layout/TopBarNavbar";
import Albums from "@/components/pages/Albums";
import Artist from "@/components/pages/Artist";
import BeatsAvailable from "@/components/pages/BeatsAvailable";
import Connect from "@/components/pages/Connect";
import LandingAntiHeroes from "@/components/pages/LandingAntiHeroes";
import Music from "@/components/pages/Music";
import XaeneptunesWorld from "@/components/pages/XaeneptunesWorld";
import Scene from "@/components/scene/Scene";
import { Route, useRouteStore } from "@/store/useRouteStore";
import { pauseAllAudio } from "@/utils/pauseAllAudio";
import { PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, SMAA, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import * as THREE from "three";

export default function HomePage() {
  const { activeRoute, setActiveRoute, hoveredRoute } = useRouteStore();
  const route: Route = activeRoute;

  const [mobile, setMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [environmentMode, setEnvironmentMode] = useState<"day" | "night">("night");
  const [dpr, setDpr] = useState(1);
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    const resize = () => setMobile(window.innerWidth < 768);
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    setDpr(Math.min(window.devicePixelRatio || 1, 2));
  }, [route]);

  const changeRoute = (nextRoute: Route) => {
    if (nextRoute === "connect") {
      setShowConnectModal(true);
      return;
    }
    if (nextRoute === route) return;
    if (route === "beats-visualizer") pauseAllAudio();
    setActiveRoute(nextRoute);
  };

  const renderHtmlContent = () => {
    switch (route) {
      case "home":
        return <LandingAntiHeroes />;
      case "music":
        return (
          <AHShell
            title="Music"
            subtitle="Live Spotify tracks and playlists with a cleaner Anti-Heroes presentation."
          >
            <Music />
          </AHShell>
        );
      case "artist":
        return (
          <AHShell
            title="Artist"
            subtitle="Collaborators, featured tracks, and curated discography links."
          >
            <Artist />
          </AHShell>
        );
      case "beats":
        return (
          <AHShell
            title="Beats"
            subtitle="Preview, filter, and launch any beat in the 3D visualizer when ready."
          >
            <BeatsAvailable />
          </AHShell>
        );
      case "albums":
        return (
          <AHShell
            title="Albums"
            subtitle="All catalog releases, personal projects, and executive produced records."
          >
            <Albums />
          </AHShell>
        );
      case "xaeneptune":
        return (
          <AHShell
            title="Xae Neptune"
            subtitle="Producer, composer, and creative technologist profile."
          >
            <XaeneptunesWorld />
          </AHShell>
        );
      default:
        return null;
    }
  };

  const isVisualizerRoute = route === "beats-visualizer";

  return (
    <>
      <div className="fixed left-0 top-0 z-[1000] w-full">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          setActiveRoute={(nextRoute: Route) => {
            if (nextRoute === "connect") {
              setShowConnectModal(true);
              setSidebarOpen(false);
              return;
            }
            setActiveRoute(nextRoute);
            setSidebarOpen(false);
          }}
        />
      </div>

      {!isVisualizerRoute && (
        <div className="fixed left-0 top-0 z-[9999] w-full">
          <TopBarNavbar onHamburgerClick={() => setSidebarOpen((open) => !open)} />
        </div>
      )}

      {isVisualizerRoute ? (
        <div className="visualizer-canvas-wrapper fixed inset-0 z-[1100] bg-black">
          <Canvas
            shadows
            className="absolute inset-0"
            camera={{ position: [0, 75, 200], fov: 75 }}
            dpr={dpr}
            gl={{
              alpha: true,
              powerPreference: "high-performance",
              antialias: false,
              stencil: false,
              depth: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.1,
            }}
          >
            <Suspense fallback={null}>
              <EffectComposer multisampling={0}>
                <Vignette />
                <Bloom
                  mipmapBlur
                  radius={0.7}
                  luminanceThreshold={0.1}
                  intensity={1}
                  levels={1.5}
                />
                <SMAA />
              </EffectComposer>

              <Scene
                isMobile={mobile}
                onSelectRoute={changeRoute}
                activeRoute={route}
                onBeatGoBack={() => changeRoute("beats")}
                hoveredRoute={hoveredRoute}
                environmentMode={environmentMode}
              />
            </Suspense>

            <PerformanceMonitor
              onIncline={() => setDpr((previous) => Math.min(previous + 0.25, 2))}
              onDecline={() => setDpr((previous) => Math.max(previous - 0.25, 0.6))}
            />
          </Canvas>
        </div>
      ) : (
        <div className="relative min-h-screen">{renderHtmlContent()}</div>
      )}

      {route !== "home" && route !== "beats-visualizer" && (
        <div className="fixed left-3 z-[9998]" style={{ bottom: "calc(env(safe-area-inset-bottom,0px) + 12px)" }}>
          <GoBackButton onClick={() => changeRoute("home")} />
        </div>
      )}

      {route === "home" && (
        <NavigationOverlay
          handleRouteChange={changeRoute}
          environmentMode={environmentMode}
          toggleEnvironment={() =>
            setEnvironmentMode((previous) => (previous === "night" ? "day" : "night"))
          }
        />
      )}

      {showConnectModal && (
        <div className="fixed inset-0 z-[100000]">
          <Connect />
          <button
            onClick={() => setShowConnectModal(false)}
            className="fixed right-5 z-[100001] rounded-full border border-white/20 bg-black/70 p-3 text-white backdrop-blur-md transition hover:border-white/45"
            style={{ top: "calc(env(safe-area-inset-top,0px) + 14px)" }}
            aria-label="Close connect modal"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </>
  );
}
