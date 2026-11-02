"use client";

import { getRouteVisualIdentity } from "@/data/routeVisualIdentity";
import { useImmersiveStore } from "@/store/useImmersiveStore";
import { Route } from "@/store/useRouteStore";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ImmersiveQuality } from "./useImmersiveQuality";

interface VinylTransmissionRigProps {
  quality: ImmersiveQuality;
  route: Route;
}

const dummy = new THREE.Object3D();
const colorA = new THREE.Color();
const colorB = new THREE.Color();

function seeded(seed: number) {
  return Math.sin(seed * 928.21) * 43758.5453 % 1;
}

function lerpColor(source: string, target: string, alpha: number) {
  return new THREE.Color(source).lerp(new THREE.Color(target), alpha);
}

export default function VinylTransmissionRig({ quality, route }: VinylTransmissionRigProps) {
  const rigRef = useRef<THREE.Group>(null);
  const hoveredEntity = useImmersiveStore((state) => state.hoveredEntity);
  const previewPlaying = useImmersiveStore((state) => state.previewPlaying);
  const previewEnergy = useImmersiveStore((state) => state.previewEnergy);
  const routePulse = useImmersiveStore((state) => state.routePulse);

  useFrame(({ clock }) => {
    const rig = rigRef.current;
    if (!rig) return;
    const t = clock.getElapsedTime();
    const focus = hoveredEntity ? 1 : 0;
    rig.rotation.y = Math.sin(t * 0.09) * 0.045 + focus * 0.018;
    rig.rotation.x = 0.03 + Math.sin(t * 0.07 + routePulse) * 0.012;
    rig.position.y = -0.18 + Math.sin(t * 0.33) * 0.035 + (previewPlaying ? previewEnergy * 0.025 : 0);
  });

  return (
    <group ref={rigRef} position={[0, -0.25, 0]}>
      <StudioDust quality={quality} route={route} />
      <TransmissionRings quality={quality} route={route} />
      <RecordDeck quality={quality} route={route} />
      <SonicGrooveTerrain quality={quality} route={route} />
      <BeatSleeveField quality={quality} route={route} />
      <FocusSleeve route={route} />
    </group>
  );
}

function RecordDeck({ quality, route }: VinylTransmissionRigProps) {
  const identity = useMemo(() => getRouteVisualIdentity(route), [route]);
  const platterRef = useRef<THREE.Group>(null);
  const tonearmRef = useRef<THREE.Group>(null);
  const needleRef = useRef<THREE.Mesh>(null);
  const hoveredEntity = useImmersiveStore((state) => state.hoveredEntity);
  const previewPlaying = useImmersiveStore((state) => state.previewPlaying);
  const previewEnergy = useImmersiveStore((state) => state.previewEnergy);
  const routePulse = useImmersiveStore((state) => state.routePulse);
  const grooveCount = quality === "high" ? 22 : quality === "medium" ? 16 : 9;
  const carbonLines = quality === "high" ? 9 : 5;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const intent = hoveredEntity ? 1 : previewPlaying ? 0.74 : 0;
    const speed = 0.34 + (previewPlaying ? previewEnergy * 0.86 : 0) + intent * 0.12;

    if (platterRef.current) {
      platterRef.current.rotation.y = t * speed + routePulse * 0.08;
    }

    if (tonearmRef.current) {
      tonearmRef.current.rotation.y = -0.38 - intent * 0.3 + Math.sin(t * 0.7) * 0.02;
      tonearmRef.current.rotation.z = -0.22 - intent * 0.055;
      tonearmRef.current.position.y = 0.52 - intent * 0.03;
    }

    if (needleRef.current) {
      const material = needleRef.current.material as THREE.MeshStandardMaterial;
      material.emissive.set(identity.accent);
      material.emissiveIntensity = 1.4 + intent * 2.2 + (previewPlaying ? previewEnergy * 1.6 : 0);
    }
  });

  return (
    <group position={[0, -0.48, 0.15]} rotation={[0.08, -0.24, 0]}>
      <mesh receiveShadow castShadow position={[0, -0.12, 0]} scale={[1, 1, 1]}>
        <boxGeometry args={[6.85, 0.34, 4.78]} />
        <meshPhysicalMaterial
          color="#050507"
          roughness={0.28}
          metalness={0.82}
          clearcoat={0.9}
          clearcoatRoughness={0.18}
          emissive="#08080d"
          emissiveIntensity={0.35}
        />
      </mesh>

      <mesh position={[0, 0.08, 0]} scale={[1, 1, 1]}>
        <boxGeometry args={[6.45, 0.035, 4.34]} />
        <meshPhysicalMaterial
          color="#101018"
          roughness={0.18}
          metalness={0.68}
          clearcoat={1}
          transparent
          opacity={0.86}
        />
      </mesh>

      {Array.from({ length: carbonLines }, (_, index) => {
        const x = -2.85 + index * (5.7 / Math.max(1, carbonLines - 1));
        return (
          <mesh key={`carbon-${index}`} position={[x, 0.105, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.014, 0.012, 4.22]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? "#1c1c25" : "#08080d"}
              roughness={0.4}
              metalness={0.45}
            />
          </mesh>
        );
      })}

      <group ref={platterRef} position={[-1.12, 0.18, 0.04]}>
        <mesh receiveShadow castShadow position={[0, -0.06, 0]}>
          <cylinderGeometry args={[1.72, 1.78, 0.16, 96]} />
          <meshPhysicalMaterial
            color="#07070a"
            roughness={0.2}
            metalness={0.96}
            clearcoat={0.72}
            emissive={identity.primary}
            emissiveIntensity={0.05}
          />
        </mesh>

        <mesh receiveShadow castShadow position={[0, 0.045, 0]}>
          <cylinderGeometry args={[1.58, 1.58, 0.08, 128]} />
          <meshStandardMaterial
            color="#020204"
            roughness={0.46}
            metalness={0.42}
            emissive="#050507"
            emissiveIntensity={0.7}
          />
        </mesh>

        {Array.from({ length: grooveCount }, (_, index) => (
          <mesh
            key={`groove-${index}`}
            position={[0, 0.096 + index * 0.0008, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.32 + index * 0.064, 0.0035, 6, 96]} />
            <meshBasicMaterial
              color={index % 3 === 0 ? identity.secondary : "#363640"}
              transparent
              opacity={index % 3 === 0 ? 0.36 : 0.18}
            />
          </mesh>
        ))}

        <mesh position={[0, 0.128, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.035, 64]} />
          <meshStandardMaterial
            color={identity.primary}
            roughness={0.36}
            metalness={0.42}
            emissive={identity.primary}
            emissiveIntensity={0.58}
          />
        </mesh>

        <mesh position={[0, 0.151, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.76, 0.012, 8, 128]} />
          <meshBasicMaterial color={identity.accent} transparent opacity={0.32} />
        </mesh>
      </group>

      <group ref={tonearmRef} position={[2.38, 0.52, -1.48]} rotation={[0, -0.38, -0.22]}>
        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.24, 0.32, 0.28, 32]} />
          <meshPhysicalMaterial color="#101016" metalness={0.9} roughness={0.18} clearcoat={0.8} />
        </mesh>
        <mesh position={[-1.26, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.042, 0.052, 2.58, 24]} />
          <meshPhysicalMaterial color="#d9e2ea" metalness={1} roughness={0.13} clearcoat={1} />
        </mesh>
        <mesh position={[-2.58, -0.045, 0.02]} rotation={[0.05, 0, -0.05]}>
          <boxGeometry args={[0.42, 0.15, 0.28]} />
          <meshPhysicalMaterial color="#111116" roughness={0.24} metalness={0.75} clearcoat={0.7} />
        </mesh>
        <mesh
          ref={needleRef}
          position={[-2.82, -0.16, 0.055]}
          rotation={[0, 0, Math.PI]}
        >
          <coneGeometry args={[0.055, 0.28, 18]} />
          <meshStandardMaterial color="#f6fbff" roughness={0.18} metalness={0.65} />
        </mesh>
        <pointLight
          position={[-2.84, -0.18, 0.05]}
          color={identity.accent}
          intensity={quality === "low" ? 2.6 : 4.8}
          distance={3.2}
        />
      </group>

      <mesh position={[2.78, 0.12, 1.52]}>
        <cylinderGeometry args={[0.24, 0.24, 0.035, 40]} />
        <meshStandardMaterial
          color={identity.secondary}
          roughness={0.42}
          metalness={0.55}
          emissive={identity.secondary}
          emissiveIntensity={0.36}
        />
      </mesh>
      <mesh position={[2.78, 0.16, 1.52]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.008, 6, 64]} />
        <meshBasicMaterial color={identity.secondary} transparent opacity={0.42} />
      </mesh>
    </group>
  );
}

function BeatSleeveField({ quality, route }: VinylTransmissionRigProps) {
  const identity = useMemo(() => getRouteVisualIdentity(route), [route]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const hoveredEntity = useImmersiveStore((state) => state.hoveredEntity);
  const previewPlaying = useImmersiveStore((state) => state.previewPlaying);
  const count = quality === "high" ? 54 : quality === "medium" ? 36 : 18;

  const sleeves = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const band = index % 3;
        const side = index % 2 === 0 ? -1 : 1;
        const row = Math.floor(index / 2);
        const jitter = seeded(index + 2.4);
        return {
          x: side * (3.9 + (row % 8) * 0.35 + Math.abs(jitter) * 0.22),
          y: -0.1 + band * 0.55 + Math.abs(seeded(index + 4.1)) * 0.25,
          z: -2.85 - (row % 11) * 0.27 - band * 0.34,
          rotationY: side * (-0.62 - band * 0.12) + seeded(index + 9.2) * 0.16,
          rotationZ: seeded(index + 1.1) * 0.18,
          scale: 0.72 + Math.abs(seeded(index + 0.7)) * 0.22,
        };
      }),
    [count],
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    sleeves.forEach((_, index) => {
      const source = identity.terrain[index % identity.terrain.length];
      mesh.setColorAt(index, lerpColor(source, "#07070a", 0.32 + (index % 4) * 0.1));
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [identity, sleeves]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const t = clock.getElapsedTime();
    const focus = hoveredEntity ? 1 : 0;
    const spin = previewPlaying ? 0.16 : 0.055;

    sleeves.forEach((sleeve, index) => {
      const wave = Math.sin(t * (0.45 + spin) + index * 0.8);
      const hoverWave = focus * Math.sin(t * 1.8 + index) * 0.12;
      dummy.position.set(
        sleeve.x + hoverWave,
        sleeve.y + wave * 0.045 + focus * 0.07,
        sleeve.z + focus * 0.16,
      );
      dummy.rotation.set(0.06 + wave * 0.025, sleeve.rotationY + hoverWave * 0.18, sleeve.rotationZ);
      dummy.scale.set(sleeve.scale, sleeve.scale, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);

      const activeColor = hoveredEntity?.color || identity.primary;
      colorA.set(identity.terrain[index % identity.terrain.length]);
      colorB.set(activeColor);
      colorA.lerp(colorB, focus * (index % 5 === 0 ? 0.72 : 0.26));
      mesh.setColorAt(index, colorA);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, sleeves.length]} frustumCulled={false}>
      <boxGeometry args={[0.76, 1.02, 0.045]} />
      <meshStandardMaterial
        vertexColors
        roughness={0.42}
        metalness={0.35}
        emissive="#09090d"
        emissiveIntensity={0.22}
      />
    </instancedMesh>
  );
}

function FocusSleeve({ route }: { route: Route }) {
  const identity = useMemo(() => getRouteVisualIdentity(route), [route]);
  const groupRef = useRef<THREE.Group>(null);
  const hoveredEntity = useImmersiveStore((state) => state.hoveredEntity);
  const previewPlaying = useImmersiveStore((state) => state.previewPlaying);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const t = clock.getElapsedTime();
    const active = hoveredEntity || previewPlaying ? 1 : 0;
    group.visible = active > 0;
    group.position.y = 1.1 + Math.sin(t * 0.62) * 0.05;
    group.rotation.y = -0.55 + Math.sin(t * 0.24) * 0.08;
    group.rotation.z = 0.04 + Math.sin(t * 0.31) * 0.03;
    group.scale.setScalar(0.82 + active * 0.08);
  });

  return (
    <group ref={groupRef} position={[2.88, 1.1, 0.72]} rotation={[0.04, -0.55, 0.04]}>
      <mesh>
        <boxGeometry args={[1.08, 1.38, 0.06]} />
        <meshPhysicalMaterial
          color="#09090d"
          roughness={0.26}
          metalness={0.72}
          clearcoat={0.85}
          emissive={hoveredEntity?.color || identity.primary}
          emissiveIntensity={0.18}
        />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[0.86, 1.06]} />
        <meshBasicMaterial
          color={hoveredEntity?.color || identity.secondary}
          transparent
          opacity={0.2}
        />
      </mesh>
      <mesh position={[0, -0.43, 0.08]}>
        <boxGeometry args={[0.64, 0.08, 0.04]} />
        <meshBasicMaterial color={identity.primary} transparent opacity={0.76} />
      </mesh>
      <mesh position={[0.42, 0.46, -0.015]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.018, 8, 48]} />
        <meshBasicMaterial color="#050507" />
      </mesh>
      <pointLight
        position={[0, 0, 0.42]}
        color={hoveredEntity?.color || identity.secondary}
        intensity={2.8}
        distance={2.2}
      />
    </group>
  );
}

function SonicGrooveTerrain({ quality, route }: VinylTransmissionRigProps) {
  const identity = useMemo(() => getRouteVisualIdentity(route), [route]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const hoveredEntity = useImmersiveStore((state) => state.hoveredEntity);
  const previewPlaying = useImmersiveStore((state) => state.previewPlaying);
  const previewEnergy = useImmersiveStore((state) => state.previewEnergy);
  const rings = quality === "high" ? 13 : quality === "medium" ? 10 : 7;
  const segments = quality === "high" ? 18 : quality === "medium" ? 14 : 9;

  const cells = useMemo(() => {
    const next: Array<{ x: number; z: number; ring: number; angle: number; seed: number }> = [];
    for (let ring = 0; ring < rings; ring += 1) {
      const radius = 1.4 + ring * 0.21;
      for (let segment = 0; segment < segments; segment += 1) {
        const angle = -Math.PI * 0.82 + (segment / Math.max(1, segments - 1)) * Math.PI * 0.72;
        next.push({
          x: Math.cos(angle) * radius - 0.8,
          z: Math.sin(angle) * radius + 1.88,
          ring,
          angle,
          seed: Math.sin(ring * 12.32 + segment * 4.88),
        });
      }
    }
    return next;
  }, [rings, segments]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    cells.forEach((cell, index) => {
      mesh.setColorAt(
        index,
        lerpColor(identity.terrain[cell.ring % identity.terrain.length], "#050507", cell.ring * 0.035),
      );
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [cells, identity]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    const intent = hoveredEntity ? 0.52 : 0;
    const energy = previewPlaying ? previewEnergy : 0;

    cells.forEach((cell, index) => {
      const ripple = Math.sin(t * 1.6 + cell.ring * 0.9 + cell.seed * 4) * 0.09;
      const bass = Math.max(0, Math.sin(t * 6.5 + index * 0.17)) * energy * 0.3;
      const hoverLift = intent * Math.max(0, 1 - cell.ring / rings) * 0.34;
      dummy.position.set(cell.x, -1.18 + ripple + bass + hoverLift, cell.z);
      dummy.rotation.set(0, -cell.angle, 0);
      dummy.scale.set(1, 0.34 + bass + hoverLift * 0.7, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, cells.length]} frustumCulled={false}>
      <boxGeometry args={[0.085, 0.14, 0.028]} />
      <meshStandardMaterial
        vertexColors
        roughness={0.34}
        metalness={0.58}
        emissive={identity.secondary}
        emissiveIntensity={0.18}
      />
    </instancedMesh>
  );
}

function TransmissionRings({ quality, route }: VinylTransmissionRigProps) {
  const identity = useMemo(() => getRouteVisualIdentity(route), [route]);
  const groupRef = useRef<THREE.Group>(null);
  const previewPlaying = useImmersiveStore((state) => state.previewPlaying);
  const count = quality === "low" ? 3 : 5;

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const t = clock.getElapsedTime();
    group.children.forEach((child, index) => {
      child.rotation.z = t * (0.05 + index * 0.015);
      child.rotation.y = -0.2 + Math.sin(t * 0.12 + index) * 0.1;
      child.scale.setScalar(1 + Math.sin(t * 0.8 + index) * (previewPlaying ? 0.045 : 0.018));
    });
  });

  return (
    <group ref={groupRef} position={[0.45, 1.1, -3.1]} rotation={[Math.PI / 2.45, 0, 0]}>
      {Array.from({ length: count }, (_, index) => (
        <mesh key={`signal-ring-${index}`} position={[0, 0, -index * 0.02]}>
          <torusGeometry args={[1.3 + index * 0.58, 0.006 + index * 0.0015, 8, 96]} />
          <meshBasicMaterial
            color={index % 2 === 0 ? identity.secondary : identity.primary}
            transparent
            opacity={0.16 - index * 0.018}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function StudioDust({ quality, route }: VinylTransmissionRigProps) {
  const identity = useMemo(() => getRouteVisualIdentity(route), [route]);
  const pointsRef = useRef<THREE.Points>(null);
  const hoveredEntity = useImmersiveStore((state) => state.hoveredEntity);
  const count = quality === "high" ? 560 : quality === "medium" ? 320 : 130;

  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.8 + Math.random() * 7.2;
      array[index * 3] = Math.cos(angle) * radius;
      array[index * 3 + 1] = -0.8 + Math.random() * 4.6;
      array[index * 3 + 2] = -3.8 + Math.sin(angle) * radius * 0.75;
    }
    return array;
  }, [count]);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (!points) return;
    const t = clock.getElapsedTime();
    const focus = hoveredEntity ? 1 : 0;
    points.rotation.y = t * 0.025;
    points.rotation.z = Math.sin(t * 0.08) * 0.018;
    points.scale.setScalar(1 + focus * 0.045 + Math.sin(t * 0.7) * 0.012);
  });

  return (
    <points ref={pointsRef} position={[0, 0.1, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={identity.accent}
        size={quality === "high" ? 0.018 : 0.026}
        sizeAttenuation
        transparent
        opacity={0.42}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
