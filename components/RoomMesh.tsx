"use client";

import { Text } from "@react-three/drei";
import type { Room } from "@/lib/manifest";

const WALL_HEIGHT = 2.8;
const WALL_THICKNESS = 0.12;
const FLOOR_DEPTH = 0.05;

const FLOOR_COLOR: Record<Room["type"], string> = {
  living:   "#C49A6C",
  dining:   "#C49A6C",
  kitchen:  "#C49A6C",
  bedroom:  "#C49A6C",
  bathroom: "#E0DDD8",
  laundry:  "#E0DDD8",
  balcony:  "#C8BFB4",
  hall:     "#C8BFB4",
  study:    "#C49A6C",
};

const ROOM_LABEL_COLOR: Record<Room["type"], string> = {
  living:   "#410e2b",
  dining:   "#410e2b",
  kitchen:  "#410e2b",
  bedroom:  "#410e2b",
  bathroom: "#555555",
  laundry:  "#555555",
  balcony:  "#666666",
  hall:     "#666666",
  study:    "#410e2b",
};

interface RoomMeshProps {
  room: Room;
  wallColor: string;
}

export default function RoomMesh({ room, wallColor }: RoomMeshProps) {
  const { x, y, w, h } = room.bounds;

  const cx = x + w / 2;
  const cz = y + h / 2;

  const floorColor = FLOOR_COLOR[room.type];
  const labelColor = ROOM_LABEL_COLOR[room.type];

  return (
    <group position={[cx, 0, cz]}>
      {/* Floor */}
      <mesh receiveShadow position={[0, -FLOOR_DEPTH / 2, 0]}>
        <boxGeometry args={[w, FLOOR_DEPTH, h]} />
        <meshStandardMaterial color={floorColor} roughness={0.6} metalness={0} />
      </mesh>

      {/* North wall */}
      <mesh castShadow position={[0, WALL_HEIGHT / 2, -h / 2]}>
        <boxGeometry args={[w, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>

      {/* South wall */}
      <mesh castShadow position={[0, WALL_HEIGHT / 2, h / 2]}>
        <boxGeometry args={[w, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>

      {/* West wall */}
      <mesh castShadow position={[-w / 2, WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, h]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>

      {/* East wall */}
      <mesh castShadow position={[w / 2, WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, h]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>

      {/* Room label */}
      <Text
        position={[0, WALL_HEIGHT + 0.3, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.35}
        color={labelColor}
        anchorX="center"
        anchorY="middle"
      >
        {room.label}
      </Text>

      {/* Window highlights */}
      {room.windows.map((win, i) => {
        const isNS = win.wall === "n" || win.wall === "s";
        const halfW = w / 2;
        const halfH = h / 2;
        const winPos: [number, number, number] = isNS
          ? [
              -halfW + win.position * w + win.width / 2,
              WALL_HEIGHT * 0.55,
              win.wall === "n" ? -halfH : halfH,
            ]
          : [
              win.wall === "w" ? -halfW : halfW,
              WALL_HEIGHT * 0.55,
              -halfH + win.position * h + win.width / 2,
            ];

        return (
          <mesh key={i} position={winPos}>
            <boxGeometry
              args={
                isNS
                  ? [win.width, WALL_HEIGHT * 0.45, WALL_THICKNESS + 0.02]
                  : [WALL_THICKNESS + 0.02, WALL_HEIGHT * 0.45, win.width]
              }
            />
            <meshStandardMaterial color="#B8D4E8" opacity={0.5} transparent roughness={0.1} metalness={0.1} />
          </mesh>
        );
      })}
    </group>
  );
}
