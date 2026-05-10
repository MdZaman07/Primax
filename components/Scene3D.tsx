"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Grid } from "@react-three/drei";
import { Suspense } from "react";
import RoomMesh from "./RoomMesh";
import type { ProjectManifest } from "@/lib/manifest";

interface Scene3DProps {
  manifest: ProjectManifest;
}

function SceneContent({ manifest }: Scene3DProps) {
  const wallColor      = manifest.style.materials.walls.hex;
  const ceilingColor   = manifest.style.materials.ceiling.hex;
  const flooringHex    = manifest.style.materials.flooring.hex;
  const brandPrimary   = manifest.style.palette.find((p) => p.role === "brand-primary")?.hex   ?? "#410e2b";
  const brandSecondary = manifest.style.palette.find((p) => p.role === "brand-secondary")?.hex ?? "#ad95b7";
  const tones          = manifest.style.furniture.primaryTones;
  const furnitureBody  = tones[0] ?? "#EDEAE3";
  const furnitureDark  = tones[1] ?? "#1C1C1C";
  const furnitureWarm  = tones[2] ?? "#C8860A";

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
          ceilingColor={ceilingColor}
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
      {/* Sky/ground hemisphere — no external deps, simulates diffuse window light */}
      <hemisphereLight args={["#ddeeff", "#e8d8c0", 0.7]} />

      {/* Primary sun from upper-left */}
      <directionalLight
        position={[18, 28, 12]}
        intensity={1.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
        shadow-bias={-0.0002}
      />
      {/* Cool fill from opposite corner — sky bounce */}
      <directionalLight position={[-12, 18, -10]} intensity={0.18} color="#c8dcff" />

      {/* IBL environment — loads async, scene still lit without it */}
      <Suspense fallback={null}>
        <Environment preset="apartment" />
      </Suspense>

      {/* Ground plane — solid surface the rooms sit on */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#d8d2c8" roughness={0.98} metalness={0} />
      </mesh>

      {/* Grid overlay on the ground */}
      <Grid
        position={[0, -0.025, 0]}
        args={[300, 300]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#c0baae"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#a89e90"
        fadeDistance={60}
        fadeStrength={1.2}
        followCamera={false}
        infiniteGrid
      />

      {/* Soft contact shadows on the floor plane */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.32}
        scale={100}
        blur={2.8}
        far={4}
        color="#6b5a48"
      />

      <Suspense fallback={null}>
        <SceneContent manifest={manifest} />
      </Suspense>

      <OrbitControls
        makeDefault
        minDistance={4}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
