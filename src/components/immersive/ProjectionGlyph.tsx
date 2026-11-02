"use client";

import { getRouteVisualIdentity } from "@/data/routeVisualIdentity";
import { useImmersiveStore } from "@/store/useImmersiveStore";
import { Route } from "@/store/useRouteStore";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ImmersiveQuality } from "./useImmersiveQuality";

interface ProjectionGlyphProps {
  quality: ImmersiveQuality;
  route: Route;
}

const glyphRows = [
  "001110001001",
  "010001001001",
  "100001001001",
  "111111111111",
  "100001001001",
  "100001001001",
  "100001001001",
];

const dummy = new THREE.Object3D();

export default function ProjectionGlyph({ quality, route }: ProjectionGlyphProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const identity = useMemo(() => getRouteVisualIdentity(route), [route]);
  const hoveredEntity = useImmersiveStore((state) => state.hoveredEntity);
  const cells = useMemo(() => {
    const out: Array<{ x: number; y: number; seed: number }> = [];
    glyphRows.forEach((row, rowIndex) => {
      row.split("").forEach((value, colIndex) => {
        if (value !== "1") return;
        out.push({
          x: (colIndex - row.length / 2) * 0.23,
          y: (glyphRows.length / 2 - rowIndex) * 0.23,
          seed: Math.sin(rowIndex * 8.91 + colIndex * 3.17),
        });
      });
    });
    return out;
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const color = new THREE.Color(identity.primary);
    cells.forEach((_, index) => mesh.setColorAt(index, color));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [cells, identity]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    const group = groupRef.current;
    if (!mesh || !group) return;

    const t = clock.getElapsedTime();
    const focus = hoveredEntity ? 1 : 0;
    group.position.x = quality === "low" ? 0 : 3.35;
    group.position.y = 1.75 + Math.sin(t * 0.6) * 0.08;
    group.position.z = -5.6;
    group.rotation.y = -0.35 + Math.sin(t * 0.22) * 0.12;
    group.rotation.z = Math.sin(t * 0.18) * 0.04;
    group.scale.setScalar(quality === "low" ? 0.9 : 1.2 + focus * 0.12);

    cells.forEach((cell, index) => {
      const ripple = Math.sin(t * 1.2 + cell.seed * 8) * 0.045;
      dummy.position.set(cell.x, cell.y, ripple + focus * Math.sin(index + t * 3) * 0.05);
      dummy.scale.setScalar(0.085 + Math.max(0, Math.sin(t + cell.seed * 3)) * 0.022);
      dummy.rotation.set(t * 0.08 + cell.seed, t * 0.11, t * 0.04);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, cells.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          vertexColors
          roughness={0.38}
          metalness={0.35}
          emissive={identity.secondary}
          emissiveIntensity={0.55}
        />
      </instancedMesh>
    </group>
  );
}
