"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { Suspense } from "react";
import RoomMesh from "./RoomMesh";
import type { ProjectManifest } from "@/lib/manifest";

interface Scene3DProps {
  manifest: ProjectManifest;
}

function SceneContent({ manifest }: Scene3DProps) {
  const wallColor      = manifest.style.materials.walls.hex;
  const flooringHex    = manifest.style.materials.flooring.hex;
  const brandPrimary   = manifest.style.palette.find((p) => p.role === "brand-primary")?.hex   ?? "#410e2b";
  const brandSecondary = manifest.style.palette.find((p) => p.role === "brand-secondary")?.hex ?? "#ad95b7";
  const tones          = manifest.style.furniture.primaryTones;
  const furnitureBody  = tones[0] ?? "#EDEAE3";   // neutral/cream body from renders
  const furnitureDark  = tones[1] ?? "#1C1C1C";   // dark accent (coffee table, chairs) from renders
  const furnitureWarm  = tones[2] ?? "#C8860A";   // warm throw/accent from renders

  const rooms = manifest.geometry.rooms;
  const allX = rooms.flatMap((r) => [r.bounds.x, r.bounds.x + r.bounds.w]);
  const allZ = rooms.flatMap((r) => [r.bounds.y, r.bounds.y + r.bounds.h]);
  const centerX = (Math.min(...allX) + Math.max(...allX)) / 2;
  const centerZ = (Math.min(...allZ) + Math.max(...allZ)) / 2;

  return (
    <group position={[-centerX, 0, -centerZ]}>
      {rooms.map((room) => (
        <RoomMesh
          key={room.id}
          room={room}
          wallColor={wallColor}
          flooringHex={flooringHex}
          brandPrimary={brandPrimary}
          brandSecondary={brandSecondary}
          furnitureBody={furnitureBody}
          furnitureDark={furnitureDark}
          furnitureWarm={furnitureWarm}
        />
      ))}
    </group>
  );
}

export default function Scene3D({ manifest }: Scene3DProps) {
  const rooms = manifest.geometry.rooms;
  const allX = rooms.flatMap((r) => [r.bounds.x, r.bounds.x + r.bounds.w]);
  const allZ = rooms.flatMap((r) => [r.bounds.y, r.bounds.y + r.bounds.h]);
  const spanX = Math.max(...allX) - Math.min(...allX);
  const spanZ = Math.max(...allZ) - Math.min(...allZ);
  const camDist = Math.max(spanX, spanZ) * 1.4 + 8;

  return (
    <Canvas
      shadows
      camera={{ position: [camDist * 0.7, camDist * 0.9, camDist * 0.7], fov: 42 }}
      style={{ width: "100%", height: "100%", background: "#f0ece0" }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[20, 30, 15]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <directionalLight position={[-10, 20, -10]} intensity={0.25} />

      <Suspense fallback={null}>
        <SceneContent manifest={manifest} />
      </Suspense>

      <Grid
        args={[80, 80]}
        position={[0, -0.06, 0]}
        cellColor="#ddd8d0"
        sectionColor="#c8c0b6"
        cellSize={1}
        sectionSize={5}
        fadeDistance={50}
        infiniteGrid
      />

      <OrbitControls
        makeDefault
        minDistance={4}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
