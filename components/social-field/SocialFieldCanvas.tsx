"use client";

import { Line } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import type { SocialFieldMode } from "@/lib/experience-types";

const MODE_ROTATION: Record<SocialFieldMode, number> = {
  home: 0,
  world: 0.24,
  agent: -0.16,
  moments: 0.38,
  safety: -0.34,
  app: 0.12,
  about: -0.24,
};

const FIELD_POINTS: [number, number, number][] = [
  [-3.6, 1.85, -0.4], [-1.65, 2.2, 0.15], [0.25, 1.5, -0.2], [2.45, 2.05, 0.25],
  [-3.1, -0.2, 0.35], [-0.85, 0.05, -0.1], [1.4, -0.25, 0.22], [3.55, 0.35, -0.25],
  [-2.1, -2.0, -0.2], [0.1, -1.45, 0.28], [2.75, -1.8, -0.08],
];

function Field({ mode }: { mode: SocialFieldMode }) {
  const group = useRef<Group>(null);
  const links = useMemo(() => FIELD_POINTS.slice(0, -1).map((point, index) => [point, FIELD_POINTS[index + 1]] as const), []);

  useFrame(({ pointer }, delta) => {
    if (!group.current) return;
    group.current.rotation.x += ((pointer.y * 0.08) - group.current.rotation.x) * Math.min(1, delta * 3.2);
    group.current.rotation.y += ((pointer.x * 0.12 + MODE_ROTATION[mode]) - group.current.rotation.y) * Math.min(1, delta * 3.2);
  });

  return (
    <group ref={group}>
      {links.map(([start, end], index) => (
        <Line key={index} points={[start, end]} color={index > 6 ? "#f14db2" : index > 3 ? "#28f0c0" : "#08e4f2"} transparent opacity={0.32} lineWidth={0.75} />
      ))}
      {FIELD_POINTS.map((point, index) => (
        <mesh position={point} key={index}>
          <sphereGeometry args={[index % 3 === 0 ? 0.075 : 0.045, 12, 12]} />
          <meshBasicMaterial color={index % 4 === 0 ? "#f14db2" : index % 2 === 0 ? "#28f0c0" : "#08e4f2"} transparent opacity={0.82} />
        </mesh>
      ))}
    </group>
  );
}

export default function SocialFieldCanvas({ mode }: { mode: SocialFieldMode }) {
  return (
    <Canvas dpr={[1, 1.35]} camera={{ position: [0, 0, 7.6], fov: 48 }} gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}>
      <Field mode={mode} />
    </Canvas>
  );
}
