"use client";

import { getRouteVisualIdentity } from "@/data/routeVisualIdentity";
import { useImmersiveStore } from "@/store/useImmersiveStore";
import { Route } from "@/store/useRouteStore";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ImmersiveQuality } from "./useImmersiveQuality";

interface BreathingDotAuraProps {
  quality: ImmersiveQuality;
  route: Route;
}

export default function BreathingDotAura({ quality, route }: BreathingDotAuraProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const identity = useMemo(() => getRouteVisualIdentity(route), [route]);
  const previewPlaying = useImmersiveStore((state) => state.previewPlaying);
  const count = quality === "high" ? 720 : 420;

  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 3.5 + Math.random() * 9;
      const angle = Math.random() * Math.PI * 2;
      array[i * 3] = Math.cos(angle) * radius;
      array[i * 3 + 1] = -0.8 + Math.random() * 6.8;
      array[i * 3 + 2] = -8 + Math.sin(angle) * radius * 0.8 - Math.random() * 8;
    }
    return array;
  }, [count]);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (!points) return;
    const t = clock.getElapsedTime();
    const pulse = previewPlaying ? 0.08 : 0.025;
    points.rotation.y = Math.sin(t * 0.12) * 0.06;
    points.rotation.z = Math.sin(t * 0.08) * 0.025;
    points.scale.setScalar(1 + Math.sin(t * 0.9) * pulse);
  });

  return (
    <points ref={pointsRef} position={[0, -1.3, -1.2]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={identity.accent}
        size={quality === "high" ? 0.026 : 0.032}
        sizeAttenuation
        transparent
        opacity={0.48}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
