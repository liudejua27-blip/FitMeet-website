"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Group, MathUtils, Quaternion, Vector3 } from "three";
import type { WorldModuleId } from "@/lib/world-atlas-content";
import type { WorldCompassMotionState } from "./WorldSocialCompass";

type Triple = [number, number, number];

type CanvasProps = {
  motionState: MutableRefObject<WorldCompassMotionState>;
  activeId: WorldModuleId;
  onSelect: (id: WorldModuleId) => void;
  onInvalidateReady: (invalidate: () => void) => void;
  onFatalError: () => void;
};

const MODULE_ORDER: WorldModuleId[] = ["life", "sport", "social", "help"];

const MODULE_ANGLES: Record<WorldModuleId, number> = {
  life: Math.PI * 0.76,
  sport: Math.PI * 0.24,
  social: -Math.PI * 0.24,
  help: -Math.PI * 0.76,
};

const MODULE_COLORS: Record<WorldModuleId, string> = {
  life: "#e0b779",
  sport: "#77e9c5",
  social: "#d896e6",
  help: "#72cfe6",
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function modulePosition(id: WorldModuleId, radius = 3.28): Triple {
  const angle = MODULE_ANGLES[id];
  return [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.78, 0.24];
}

function MechanicalArm({ id, active }: { id: WorldModuleId; active: boolean }) {
  const end = useMemo(() => new Vector3(...modulePosition(id, 2.78)), [id]);
  const start = useMemo(() => {
    const direction = end.clone().normalize();
    return direction.multiplyScalar(1.92);
  }, [end]);
  const geometry = useMemo(() => {
    const direction = end.clone().sub(start);
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const quaternion = new Quaternion().setFromUnitVectors(
      new Vector3(0, 1, 0),
      direction.clone().normalize(),
    );
    return { midpoint, quaternion, length: direction.length() };
  }, [end, start]);

  return (
    <group position={geometry.midpoint} quaternion={geometry.quaternion}>
      <mesh>
        <cylinderGeometry args={[0.07, 0.09, geometry.length, 12]} />
        <meshStandardMaterial
          color={active ? MODULE_COLORS[id] : "#61594d"}
          metalness={0.92}
          roughness={0.28}
        />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.018, 0.018, geometry.length * 0.86, 8]} />
        <meshBasicMaterial color={active ? "#fff2cf" : "#9d8a70"} />
      </mesh>
    </group>
  );
}

function ModulePlate({
  id,
  active,
  onSelect,
}: {
  id: WorldModuleId;
  active: boolean;
  onSelect: (id: WorldModuleId) => void;
}) {
  const position = useMemo(() => modulePosition(id), [id]);
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(id);
  };

  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]} scale={active ? 1.08 : 0.94}>
      <mesh onClick={handleClick}>
        <cylinderGeometry args={[0.47, 0.47, 0.15, 48]} />
        <meshPhysicalMaterial
          color="#17191a"
          metalness={0.94}
          roughness={active ? 0.16 : 0.24}
          clearcoat={1}
          clearcoatRoughness={0.12}
          emissive={active ? MODULE_COLORS[id] : "#000000"}
          emissiveIntensity={active ? 0.08 : 0}
        />
      </mesh>
      <mesh position={[0, 0.084, 0]}>
        <cylinderGeometry args={[0.365, 0.365, 0.026, 48]} />
        <meshStandardMaterial
          color={active ? MODULE_COLORS[id] : "#242321"}
          metalness={0.9}
          roughness={0.3}
          emissive={active ? MODULE_COLORS[id] : "#000000"}
          emissiveIntensity={active ? 0.12 : 0}
        />
      </mesh>
      <mesh position={[0, 0.083, 0]}>
        <torusGeometry args={[0.4, active ? 0.025 : 0.014, 10, 64]} />
        <meshBasicMaterial color={active ? "#fff0c8" : "#81735f"} transparent opacity={active ? 0.92 : 0.48} />
      </mesh>
      <mesh position={[0, -0.09, 0]}>
        <cylinderGeometry args={[0.13, 0.16, 0.13, 24]} />
        <meshStandardMaterial color="#2c2823" metalness={0.95} roughness={0.24} />
      </mesh>
    </group>
  );
}

function CompassRings({ motionState }: { motionState: MutableRefObject<WorldCompassMotionState> }) {
  const mainRef = useRef<Group>(null);
  const orbitARef = useRef<Group>(null);
  const orbitBRef = useRef<Group>(null);
  const orbitCRef = useRef<Group>(null);

  useFrame(() => {
    const { progress } = motionState.current;
    const normalized = clamp((progress - 0.08) / 0.82);
    const rotation = normalized * Math.PI * 1.5;
    if (mainRef.current) mainRef.current.rotation.z = -rotation;
    const orbitShift = Math.sin(rotation) * 0.18;
    if (orbitARef.current) orbitARef.current.rotation.z = 0.08 + orbitShift;
    if (orbitBRef.current) orbitBRef.current.rotation.z = 0.34 - orbitShift * 0.72;
    if (orbitCRef.current) orbitCRef.current.rotation.z = -0.2 + orbitShift * 0.58;
  });

  return (
    <group>
      <group ref={mainRef}>
        <mesh position={[0, 0, -0.09]}>
          <torusGeometry args={[1.69, 0.43, 22, 128]} />
          <meshPhysicalMaterial color="#0e1011" metalness={0.96} roughness={0.22} clearcoat={1} clearcoatRoughness={0.16} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.68, 0.31, 20, 128]} />
          <meshPhysicalMaterial color="#17191a" metalness={0.96} roughness={0.16} clearcoat={1} clearcoatRoughness={0.11} />
        </mesh>
        <mesh position={[0, 0, 0.07]}>
          <torusGeometry args={[1.49, 0.18, 16, 128]} />
          <meshPhysicalMaterial color="#252525" metalness={0.97} roughness={0.14} clearcoat={1} clearcoatRoughness={0.09} />
        </mesh>
        <mesh position={[0, 0, 0.12]}>
          <torusGeometry args={[1.68, 0.075, 12, 128]} />
          <meshStandardMaterial color="#a88456" metalness={1} roughness={0.19} />
        </mesh>
        <mesh position={[0, 0, 0.17]}>
          <torusGeometry args={[1.27, 0.09, 12, 128]} />
          <meshStandardMaterial color="#d4b379" metalness={0.96} roughness={0.17} />
        </mesh>
        <mesh position={[0, 0, 0.19]}>
          <torusGeometry args={[1.08, 0.055, 10, 96]} />
          <meshBasicMaterial color="#f1d8a7" transparent opacity={0.82} />
        </mesh>
        {Array.from({ length: 12 }, (_, index) => {
          const angle = (index / 12) * Math.PI * 2;
          return (
            <mesh key={index} position={[Math.cos(angle) * 1.67, Math.sin(angle) * 1.67, 0.34]}>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshStandardMaterial color="#d0a96f" metalness={1} roughness={0.18} />
            </mesh>
          );
        })}
        {Array.from({ length: 24 }, (_, index) => {
          const angle = (index / 24) * Math.PI * 2;
          return (
            <mesh
              key={`tooth-${index}`}
              position={[Math.cos(angle) * 1.98, Math.sin(angle) * 1.98, -0.02]}
              rotation={[0, 0, angle]}
            >
              <boxGeometry args={[0.075, 0.24, 0.16]} />
              <meshStandardMaterial color={index % 3 === 0 ? "#8e734f" : "#252321"} metalness={0.98} roughness={0.24} />
            </mesh>
          );
        })}
        {Array.from({ length: 4 }, (_, index) => {
          const angle = (index / 4) * Math.PI * 2 + Math.PI / 4;
          return (
            <group key={`joint-${index}`} position={[Math.cos(angle) * 1.9, Math.sin(angle) * 1.9, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[0.13, 0.16, 0.16, 20]} />
                <meshStandardMaterial color="#4c4032" metalness={1} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.1, 0]}>
                <sphereGeometry args={[0.055, 12, 12]} />
                <meshStandardMaterial color="#d4b379" metalness={1} roughness={0.16} />
              </mesh>
            </group>
          );
        })}
      </group>

      <group ref={orbitARef} rotation={[0.62, 0.12, 0.08]} scale={[1.52, 1, 1]}>
        <mesh>
          <torusGeometry args={[2.43, 0.022, 8, 144]} />
          <meshStandardMaterial color="#ad8b5c" metalness={0.95} roughness={0.22} />
        </mesh>
      </group>
      <group ref={orbitBRef} rotation={[-0.38, 0.58, 0.34]} scale={[1.45, 1, 1]}>
        <mesh>
          <torusGeometry args={[2.5, 0.017, 8, 144]} />
          <meshStandardMaterial color="#7d715f" metalness={0.94} roughness={0.3} />
        </mesh>
      </group>
      <group ref={orbitCRef} rotation={[0.16, -0.68, -0.2]} scale={[1.38, 1, 1]}>
        <mesh>
          <torusGeometry args={[2.58, 0.014, 8, 144]} />
          <meshStandardMaterial color="#c5a06b" metalness={0.96} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

function PeopleNodes({ motionState }: { motionState: MutableRefObject<WorldCompassMotionState> }) {
  const firstRef = useRef<Group>(null);
  const secondRef = useRef<Group>(null);

  useFrame(() => {
    const phase = clamp((motionState.current.progress - 0.46) / 0.4);
    const firstAngle = MathUtils.lerp(-2.55, -0.2, phase);
    const secondAngle = MathUtils.lerp(0.9, 0.22, phase);
    if (firstRef.current) firstRef.current.position.set(Math.cos(firstAngle) * 0.86, Math.sin(firstAngle) * 0.86, 0.5);
    if (secondRef.current) secondRef.current.position.set(Math.cos(secondAngle) * 0.86, Math.sin(secondAngle) * 0.86, 0.5);
  });

  return (
    <group>
      <group ref={firstRef}>
        <mesh>
          <sphereGeometry args={[0.13, 20, 20]} />
          <meshStandardMaterial color="#72cfe6" emissive="#72cfe6" emissiveIntensity={0.36} metalness={0.42} roughness={0.2} />
        </mesh>
      </group>
      <group ref={secondRef}>
        <mesh>
          <sphereGeometry args={[0.13, 20, 20]} />
          <meshStandardMaterial color="#d896e6" emissive="#d896e6" emissiveIntensity={0.34} metalness={0.4} roughness={0.22} />
        </mesh>
      </group>
    </group>
  );
}

function MechanicalCompass({
  motionState,
  activeId,
  onSelect,
  onInvalidateReady,
}: Omit<CanvasProps, "onFatalError">) {
  const rootRef = useRef<Group>(null);
  const { invalidate, viewport } = useThree();

  useEffect(() => {
    onInvalidateReady(invalidate);
    invalidate();
  }, [activeId, invalidate, onInvalidateReady]);

  useFrame(() => {
    const root = rootRef.current;
    if (!root) return;
    const { progress, pointerX, pointerY } = motionState.current;
    const reveal = clamp(progress / 0.1);
    const release = clamp((progress - 0.9) / 0.1);
    const compactScale = viewport.width < 8 ? 0.86 : 1;
    root.scale.setScalar((0.72 + reveal * 0.06 - release * 0.08) * compactScale);
    root.rotation.x = -0.5 + pointerY * (Math.PI / 90);
    root.rotation.y = 0.12 + pointerX * (Math.PI / 90);
    root.rotation.z = 0.025;
    root.position.x = viewport.width < 8 ? 1.02 : 1.18;
    root.position.y = -0.18 - release * 0.04;
  });

  return (
    <group ref={rootRef}>
      <CompassRings motionState={motionState} />
      {MODULE_ORDER.map((id) => (
        <MechanicalArm key={`arm-${id}`} id={id} active={activeId === id} />
      ))}
      {MODULE_ORDER.map((id) => (
        <ModulePlate key={id} id={id} active={activeId === id} onSelect={onSelect} />
      ))}
      <PeopleNodes motionState={motionState} />
    </group>
  );
}

function ContextGuard({ onFatalError }: { onFatalError: () => void }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleLost = (event: Event) => {
      event.preventDefault();
      onFatalError();
    };
    canvas.addEventListener("webglcontextlost", handleLost, { passive: false });
    return () => canvas.removeEventListener("webglcontextlost", handleLost);
  }, [gl, onFatalError]);

  return null;
}

export default function WorldSocialCompassCanvas(props: CanvasProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.25]}
      camera={{ position: [0, 0, 10], fov: 30, near: 0.1, far: 100 }}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: process.env.NODE_ENV !== "production",
      }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.52} />
      <directionalLight position={[2.8, 4.2, 6]} intensity={3.1} color="#f5dfb9" />
      <pointLight position={[-3.5, -1.5, 4.5]} intensity={24} distance={10} color="#72cfe6" />
      <pointLight position={[4.2, 1.2, 3.5]} intensity={19} distance={9} color="#d896e6" />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={4.2} color="#ffe2ad" position={[0, 5, -2]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 1.2, 1]} />
        <Lightformer form="rect" intensity={2.4} color="#72cfe6" position={[-5, 0, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 1, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#d896e6" position={[5, 0, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[5, 1, 1]} />
      </Environment>
      <ContextGuard onFatalError={props.onFatalError} />
      <MechanicalCompass
        motionState={props.motionState}
        activeId={props.activeId}
        onSelect={props.onSelect}
        onInvalidateReady={props.onInvalidateReady}
      />
    </Canvas>
  );
}
