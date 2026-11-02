"use client";

import { getRouteVisualIdentity } from "@/data/routeVisualIdentity";
import { Route } from "@/store/useRouteStore";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface RefractionShardsProps {
  route: Route;
}

const shardPositions = [
  [-4.8, 2.2, -5.5],
  [-3.6, 0.6, -7.2],
  [4.8, 1.1, -6.5],
  [3.4, 3.1, -8.4],
  [0.2, 3.6, -9],
] as const;

export default function RefractionShards({ route }: RefractionShardsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const identity = useMemo(() => getRouteVisualIdentity(route), [route]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const t = clock.getElapsedTime();
    group.children.forEach((child, index) => {
      child.rotation.x = t * (0.08 + index * 0.01);
      child.rotation.y = -t * (0.06 + index * 0.012);
      child.position.y = shardPositions[index][1] + Math.sin(t * 0.45 + index) * 0.12;
    });
  });

  return (
    <group ref={groupRef}>
      {shardPositions.map((position, index) => (
        <mesh key={`${position[0]}-${index}`} position={position} scale={[0.45, 0.95, 0.45]}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color={index % 2 === 0 ? identity.secondary : identity.primary}
            transparent
            opacity={0.18}
            roughness={0.04}
            metalness={0.1}
            transmission={0.4}
            thickness={0.8}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
