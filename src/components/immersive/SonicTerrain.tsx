"use client";

import { getRouteVisualIdentity } from "@/data/routeVisualIdentity";
import { useImmersiveStore } from "@/store/useImmersiveStore";
import { Route } from "@/store/useRouteStore";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ImmersiveQuality } from "./useImmersiveQuality";

interface SonicTerrainProps {
  quality: ImmersiveQuality;
  route: Route;
}

const dummy = new THREE.Object3D();
const instanceColor = new THREE.Color();
const tempColor = new THREE.Color();

export default function SonicTerrain({ quality, route }: SonicTerrainProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const pointerRef = useRef({ x: 0, z: 0 });
  const identity = useMemo(() => getRouteVisualIdentity(route), [route]);
  const hoveredEntity = useImmersiveStore((state) => state.hoveredEntity);
  const previewPlaying = useImmersiveStore((state) => state.previewPlaying);
  const previewEnergy = useImmersiveStore((state) => state.previewEnergy);
  const routePulse = useImmersiveStore((state) => state.routePulse);
  const grid = quality === "high" ? 17 : quality === "medium" ? 13 : 9;
  const spacing = quality === "high" ? 0.62 : 0.76;

  const cells = useMemo(() => {
    const next: Array<{ x: number; z: number; seed: number; ring: number }> = [];
    const half = (grid - 1) / 2;

    for (let row = 0; row < grid; row += 1) {
      for (let col = 0; col < grid; col += 1) {
        const x = (col - half + (row % 2) * 0.5) * spacing;
        const z = (row - half) * spacing * 0.86;
        const ring = Math.sqrt(x * x + z * z);
        next.push({ x, z, ring, seed: Math.sin((row + 1) * 12.989 + (col + 1) * 78.233) });
      }
    }

    return next;
  }, [grid, spacing]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      pointerRef.current.x = nx * 8;
      pointerRef.current.z = ny * 6;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const colors = identity.terrain.map((color) => new THREE.Color(color));
    cells.forEach((cell, index) => {
      const pick = colors[index % colors.length].clone();
      pick.lerp(new THREE.Color("#111118"), Math.min(cell.ring / 10, 0.72));
      mesh.setColorAt(index, pick);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [cells, identity]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const elapsed = clock.getElapsedTime();
    const pointer = pointerRef.current;
    const hoverBoost = hoveredEntity ? 0.6 : 0;
    const previewBoost = previewPlaying ? previewEnergy : 0;
    const pulse = Math.sin(elapsed * 4.8 + routePulse) * 0.14;
    const routeColors = identity.terrain.map((color) => new THREE.Color(color));

    cells.forEach((cell, index) => {
      const distance = Math.hypot(cell.x - pointer.x, cell.z - pointer.z);
      const pointerLift = Math.max(0, 1.2 - distance) * 0.76;
      const wave = Math.sin(elapsed * 1.1 + cell.ring * 1.35 + cell.seed * 2.4);
      const scan = Math.sin(elapsed * 0.7 - cell.z * 0.9);
      const height =
        0.12 +
        Math.max(0, wave) * 0.55 +
        Math.max(0, scan) * 0.18 +
        pointerLift +
        hoverBoost * Math.max(0, 1.8 - cell.ring) * 0.16 +
        previewBoost * (0.28 + Math.sin(elapsed * 8 + index) * 0.11) +
        pulse;

      dummy.position.set(cell.x, -2.35 + height * 0.5, cell.z - 1.35);
      dummy.scale.set(1, Math.max(0.08, height), 1);
      dummy.rotation.y = Math.PI / 6 + Math.sin(elapsed * 0.4 + cell.seed) * 0.08;
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);

      const paletteColor = routeColors[index % routeColors.length];
      tempColor.copy(paletteColor).lerp(instanceColor.set("#050507"), Math.min(cell.ring / 8.5, 0.72));
      tempColor.offsetHSL(0, 0.04, pointerLift * 0.045 + previewBoost * 0.03);
      mesh.setColorAt(index, tempColor);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <group rotation={[0.1, 0, 0]} position={[0, 0, 0]}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, cells.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.2, 0.24, 1, 6, 1, false]} />
        <meshStandardMaterial
          vertexColors
          roughness={0.58}
          metalness={0.62}
          emissive="#111118"
          emissiveIntensity={1.05}
        />
      </instancedMesh>
    </group>
  );
}
