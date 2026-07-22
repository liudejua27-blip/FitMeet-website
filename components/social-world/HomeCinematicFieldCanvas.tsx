"use client";

import { Line, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { CatmullRomCurve3, MathUtils, Vector3, type Group, type Mesh, type Texture } from "three";

type PointerState = { x: number; y: number };

const TEXTURE_PATHS = [
  "/images/social-world/textures-v2/01-travel.jpg",
  "/images/social-world/textures-v2/02-sport.jpg",
  "/images/social-world/textures-v2/03-outdoor.jpg",
  "/images/social-world/textures-v2/04-city.jpg",
  "/images/social-world/textures-v2/05-photo.jpg",
  "/images/social-world/textures-v2/06-run.jpg",
  "/images/social-world/textures-v2/07-public.jpg",
  "/images/social-world/textures-v2/08-picnic.jpg",
  "/images/social-world/textures-v2/09-music.jpg",
] as const;

const START_POSITIONS: [number, number, number][] = [
  [-3.65, 2.12, -.55], [-1.02, 2.48, -1.35], [2.72, 2.04, -.38],
  [-3.98, .42, .16], [3.86, .36, -.68], [-3.7, -1.62, -.72],
  [-1.36, -2.18, .12], [2.34, -2.05, -.34], [4.0, -1.66, -1.08],
];

const ROUTE_POINTS = [
  new Vector3(-4.4, -1.85, -.25), new Vector3(-3.1, -1.05, .2), new Vector3(-2.15, .12, .72),
  new Vector3(-.8, .72, 1.05), new Vector3(.55, .42, .9), new Vector3(1.7, -.18, .58),
  new Vector3(2.72, -.92, .18), new Vector3(4.35, -1.35, -.2),
];

const PORTAL_INDEX = 3;
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const range = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
const smooth = (value: number) => value * value * (3 - 2 * value);

function useDemandInvalidation() {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const refresh = () => invalidate();
    window.addEventListener("fitmeet:cinematic-progress", refresh);
    return () => window.removeEventListener("fitmeet:cinematic-progress", refresh);
  }, [invalidate]);
}

function CinematicScene({
  progress,
  pointer,
  onReady,
}: {
  progress: MutableRefObject<number>;
  pointer: MutableRefObject<PointerState>;
  onReady: (ready: boolean) => void;
}) {
  const group = useRef<Group>(null);
  const planes = useRef<Array<Mesh | null>>([]);
  const textures = useTexture([...TEXTURE_PATHS]) as Texture[];
  const camera = useThree((state) => state.camera);
  useDemandInvalidation();

  const curve = useMemo(() => new CatmullRomCurve3(ROUTE_POINTS, false, "catmullrom", .42), []);
  const curvePoints = useMemo(() => curve.getPoints(88).map((point) => [point.x, point.y, point.z] as [number, number, number]), [curve]);
  const targetPositions = useMemo(() => START_POSITIONS.map((_, index) => curve.getPoint(index / (START_POSITIONS.length - 1))), [curve]);

  useEffect(() => {
    textures.forEach((texture) => {
      texture.anisotropy = 2;
      texture.needsUpdate = true;
    });
    onReady(true);
    return () => onReady(false);
  }, [onReady, textures]);

  useFrame(() => {
    const p = progress.current;
    const gather = smooth(range(p, .36, .69));
    const passage = smooth(range(p, .68, .9));
    const pointerWeight = 1 - smooth(range(p, .5, .8));
    const px = pointer.current.x * pointerWeight;
    const py = pointer.current.y * pointerWeight;

    if (group.current) {
      group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, px * .075 - gather * .018, .14);
      group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, -py * .052, .14);
      group.current.position.x = MathUtils.lerp(0, -.16, gather);
      group.current.position.z = MathUtils.lerp(0, .48, passage);
    }

    planes.current.forEach((plane, index) => {
      if (!plane) return;
      const start = START_POSITIONS[index];
      const target = targetPositions[index];
      const isPortal = index === PORTAL_INDEX;
      const portalExit = smooth(range(p, .77, .86));

      plane.position.set(
        MathUtils.lerp(start[0], target.x, gather),
        MathUtils.lerp(start[1], target.y, gather),
        MathUtils.lerp(start[2], target.z, gather),
      );
      plane.position.x += px * (.1 + index * .014);
      plane.position.y += py * (.065 + (8 - index) * .009);

      if (isPortal) {
        plane.position.x = MathUtils.lerp(plane.position.x, .65, passage);
        plane.position.y = MathUtils.lerp(plane.position.y, 0, passage);
        plane.position.z = MathUtils.lerp(plane.position.z, 2.72, passage);
      } else {
        plane.position.z -= passage * (.65 + index * .1);
      }

      plane.rotation.z = MathUtils.lerp((index - 4) * .008, isPortal ? 0 : (index % 2 ? -1 : 1) * .05, gather);
      const baseScale = index % 3 === 0 ? 1.08 : index % 3 === 1 ? .86 : .96;
      const scale = isPortal
        ? MathUtils.lerp(MathUtils.lerp(baseScale, .78, gather), 1.52, passage)
        : MathUtils.lerp(MathUtils.lerp(baseScale, .72, gather), .48, passage);
      plane.scale.setScalar(scale);

      const material = plane.material as { opacity: number };
      const depthFade = 1 - Math.abs(start[2]) * .12;
      material.opacity = isPortal
        ? MathUtils.lerp(MathUtils.lerp(.9, .42, passage), 0, portalExit)
        : MathUtils.lerp(.88 * depthFade, .04, passage);
    });

    camera.position.x = MathUtils.lerp(camera.position.x, px * .34 + gather * .12, .12);
    camera.position.y = MathUtils.lerp(camera.position.y, -py * .24 + passage * .08, .12);
    camera.position.z = MathUtils.lerp(7.8, 6.55, passage);
    camera.lookAt(0, 0, 0);
    camera.rotation.z = MathUtils.lerp(camera.rotation.z, px * .042 * (1 - passage), .12);
  });

  return (
    <group ref={group}>
      <Line points={curvePoints} color="#22d8c2" transparent opacity={.54} lineWidth={1.05} />
      {curvePoints.filter((_, index) => index % 14 === 0).map((point, index) => (
        <mesh position={point} key={index}>
          <sphereGeometry args={[index % 2 === 0 ? .052 : .034, 10, 10]} />
          <meshBasicMaterial color={index > 3 ? "#e263c2" : "#28f0c0"} transparent opacity={.8} />
        </mesh>
      ))}
      {START_POSITIONS.map((position, index) => (
        <mesh
          ref={(node) => { planes.current[index] = node; }}
          position={position}
          key={TEXTURE_PATHS[index]}
          renderOrder={2}
        >
          <planeGeometry args={[1.18, .77]} />
          <meshBasicMaterial map={textures[index]} transparent opacity={.86} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export default function HomeCinematicFieldCanvas(props: {
  progress: MutableRefObject<number>;
  pointer: MutableRefObject<PointerState>;
  onReady: (ready: boolean) => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.8], fov: 47 }}
      dpr={[1, 1.25]}
      frameloop="demand"
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          props.onReady(false);
        }, { once: true });
      }}
    >
      <fog attach="fog" args={["#f1eee8", 7.1, 12]} />
      <Suspense fallback={null}>
        <CinematicScene {...props} />
      </Suspense>
    </Canvas>
  );
}
