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
  const wallColor = manifest.style.materials.walls.hex;

  const rooms = manifest.geometry.rooms;
  const allX = rooms.flatMap((r) => [r.bounds.x, r.bounds.x + r.bounds.w]);
  const allZ = rooms.flatMap((r) => [r.bounds.y, r.bounds.y + r.bounds.h]);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minZ = Math.min(...allZ);
  const maxZ = Math.max(...allZ);
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;

  return (
    <group position={[-centerX, 0, -centerZ]}>
      {rooms.map((room) => (
        <RoomMesh key={room.id} room={room} wallColor={wallColor} />
      ))}
    </group>
  );
}

export default function Scene3D({ manifest }: Scene3DProps) {
  const rooms = manifest.geometry.rooms;
  const allZ = rooms.flatMap((r) => [r.bounds.y, r.bounds.y + r.bounds.h]);
  const spanZ = Math.max(...allZ) - Math.min(...allZ);
  const camDist = Math.max(spanZ * 1.5, 20);

  return (
    <Canvas
      shadows
      camera={{ position: [camDist * 0.6, camDist * 0.8, camDist * 0.6], fov: 45 }}
      style={{ width: "100%", height: "100%", background: "#f0ece0" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[15, 25, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-10, 15, -10]} intensity={0.3} />

      <Suspense fallback={null}>
        <SceneContent manifest={manifest} />
      </Suspense>

      <Grid
        args={[50, 50]}
        position={[0, -0.06, 0]}
        cellColor="#d4cfc8"
        sectionColor="#b8b0a6"
        cellSize={1}
        sectionSize={5}
        fadeDistance={40}
        infiniteGrid
      />

      <OrbitControls
        makeDefault
        minDistance={5}
        maxDistance={80}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
