"use client";

import { Text } from "@react-three/drei";
import type { Room } from "@/lib/manifest";

const WALL_H = 2.6;
const WALL_T = 0.1;
const FLOOR_T = 0.05;

// Fixed floor overrides for rooms where extracted timber flooring doesn't apply
const FLOOR_OVERRIDE: Partial<Record<Room["type"], string>> = {
  bathroom: "#D0CCC8", // tile grey
  laundry:  "#CCCAC6", // tile grey
  balcony:  "#C4BEB6", // concrete/paving
  closet:   "#E8E4DE", // light — closet floor matches body tone
};

// ── Shared primitives ──────────────────────────────────────────────────────

function Box({ pos, size, color, opacity = 1, roughness = 0.8, metalness = 0 }: {
  pos: [number,number,number]; size: [number,number,number];
  color: string; opacity?: number; roughness?: number; metalness?: number;
}) {
  return (
    <mesh castShadow receiveShadow position={pos}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness}
        opacity={opacity} transparent={opacity < 1} />
    </mesh>
  );
}

function Cylinder({ pos, rt, rb, h, segs = 16, color, roughness = 0.5, metalness = 0, opacity = 1 }: {
  pos: [number,number,number]; rt: number; rb: number; h: number; segs?: number;
  color: string; roughness?: number; metalness?: number; opacity?: number;
}) {
  return (
    <mesh castShadow position={pos}>
      <cylinderGeometry args={[rt, rb, h, segs]} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} opacity={opacity} transparent={opacity < 1} />
    </mesh>
  );
}

// Pendant light — thin black wire drop + black shade cylinder
function Pendant({ pos, furnitureDark }: { pos: [number,number,number]; furnitureDark: string }) {
  return (
    <group position={pos}>
      {/* Wire */}
      <Cylinder pos={[0, 0.2, 0]} rt={0.01} rb={0.01} h={0.5} segs={6} color={furnitureDark} />
      {/* Shade */}
      <Cylinder pos={[0, -0.06, 0]} rt={0.09} rb={0.13} h={0.14} segs={16} color={furnitureDark} metalness={0.3} />
    </group>
  );
}

// Floor plant — terracotta pot + green foliage mass
function FloorPlant({ pos }: { pos: [number,number,number] }) {
  return (
    <group position={pos}>
      {/* Pot */}
      <Cylinder pos={[0, 0.15, 0]} rt={0.14} rb={0.12} h={0.3} segs={12} color="#C07850" roughness={0.9} />
      {/* Foliage */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.32, 8, 6]} />
        <meshStandardMaterial color="#3A6B30" roughness={1} />
      </mesh>
      {/* Tall stalk suggestion */}
      <Cylinder pos={[0, 0.45, 0]} rt={0.03} rb={0.03} h={0.4} segs={6} color="#4A7A40" roughness={1} />
    </group>
  );
}

// ── Room furniture ────────────────────────────────────────────────────────

// Bedroom: upholstered bed + brand duvet + pendant + nightstand + chair
function BedroomFurniture({ w, h, brandPrimary, brandSecondary, furnitureBody, furnitureDark, furnitureWarm }: {
  w: number; h: number;
  brandPrimary: string; brandSecondary: string;
  furnitureBody: string; furnitureDark: string; furnitureWarm: string;
}) {
  const bedW = Math.min(w * 0.62, 1.65);
  const bedL = Math.min(h * 0.58, 2.1);
  const pendX = bedW / 2 - 0.2;
  return (
    <group>
      {/* Pendant light — black drop above bed */}
      <Pendant pos={[pendX, WALL_H - 0.3, -(bedL * 0.28)]} furnitureDark={furnitureDark} />

      {/* Bed base — body tone from renders */}
      <Box pos={[0, 0.22, 0]}               size={[bedW, 0.42, bedL]}           color={furnitureBody} roughness={0.9} />
      {/* Headboard */}
      <Box pos={[0, 0.62, -(bedL/2+0.04)]}  size={[bedW+0.06, 0.7, 0.1]}        color={furnitureBody} roughness={0.85} />
      {/* Duvet — brand primary (maroon) */}
      <Box pos={[0, 0.45, 0.08]}            size={[bedW-0.06, 0.07, bedL*0.62]} color={brandPrimary} roughness={0.95} />
      {/* Throw at foot — warm accent from renders */}
      <Box pos={[0, 0.46, bedL*0.36]}       size={[bedW*0.65, 0.05, 0.4]}       color={furnitureWarm} roughness={0.95} />
      {/* Pillows — body tone */}
      <Box pos={[-bedW*0.22, 0.5, -(bedL*0.3)]} size={[bedW*0.36, 0.11, 0.42]} color={furnitureBody} roughness={0.95} />
      <Box pos={[ bedW*0.22, 0.5, -(bedL*0.3)]} size={[bedW*0.36, 0.11, 0.42]} color={furnitureBody} roughness={0.95} />
      {/* Brand accent pillow — brand secondary */}
      <Box pos={[0, 0.57, -(bedL*0.27)]}    size={[bedW*0.26, 0.1, 0.34]}       color={brandSecondary} roughness={0.95} />

      {/* Nightstand — dark accent from renders */}
      <Box pos={[bedW/2+0.3, 0.28, -(bedL*0.28)]} size={[0.44, 0.52, 0.44]}    color={furnitureDark} roughness={0.45} />
      <Box pos={[bedW/2+0.3, 0.58, -(bedL*0.28)]} size={[0.18, 0.28, 0.18]}    color={furnitureBody} roughness={0.8} />

      {/* Reading chair — white body, brand secondary cushion, black legs */}
      {w > 2.5 && (
        <group position={[-w * 0.3, 0, h * 0.3]}>
          <Box pos={[0, 0.22, 0]}      size={[0.55, 0.4, 0.52]}  color={furnitureBody} roughness={0.85} />
          <Box pos={[0, 0.52, -0.2]}   size={[0.55, 0.46, 0.09]} color={furnitureBody} roughness={0.85} />
          <Box pos={[0, 0.28, -0.02]}  size={[0.48, 0.1, 0.44]}  color={brandSecondary} roughness={0.95} />
          <Cylinder pos={[-0.22, 0.07, -0.2]} rt={0.02} rb={0.02} h={0.16} segs={6} color={furnitureDark} />
          <Cylinder pos={[ 0.22, 0.07, -0.2]} rt={0.02} rb={0.02} h={0.16} segs={6} color={furnitureDark} />
          <Cylinder pos={[-0.22, 0.07,  0.2]} rt={0.02} rb={0.02} h={0.16} segs={6} color={furnitureDark} />
          <Cylinder pos={[ 0.22, 0.07,  0.2]} rt={0.02} rb={0.02} h={0.16} segs={6} color={furnitureDark} />
        </group>
      )}
    </group>
  );
}

// Living: large L-shaped/sectional sofa + round coffee table + rug + plants
function LivingFurniture({ w, h, brandPrimary, brandSecondary, furnitureBody, furnitureDark }: {
  w: number; h: number;
  brandPrimary: string; brandSecondary: string;
  furnitureBody: string; furnitureDark: string;
}) {
  const sofaW = Math.min(w * 0.62, 2.9);
  const sofaD = 0.88;
  return (
    <group>
      {/* White area rug */}
      <Box pos={[0, 0.01, 0]}              size={[Math.min(w*0.72,2.6), 0.02, Math.min(h*0.55,2.0)]} color="#F0EDE8" roughness={1} />

      {/* Main sofa — body tone */}
      <Box pos={[0, 0.26, h*0.15]}         size={[sofaW, 0.5, sofaD]}           color={furnitureBody} roughness={0.85} />
      {/* Sofa back */}
      <Box pos={[0, 0.6, h*0.15+sofaD/2]}  size={[sofaW, 0.52, 0.1]}            color={furnitureBody} roughness={0.85} />
      {/* L-arm (chaise extension) */}
      {w > 4.0 && (
        <Box pos={[-sofaW/2-0.44, 0.26, h*0.15+0.16]} size={[0.9, 0.5, sofaD-0.32]} color={furnitureBody} roughness={0.85} />
      )}
      {/* Cushions: brand primary + secondary from brand guide */}
      <Box pos={[-sofaW*0.28, 0.54, h*0.15-sofaD/2+0.1]} size={[0.44,0.15,0.44]} color={brandPrimary}   roughness={0.95} />
      <Box pos={[ sofaW*0.28, 0.54, h*0.15-sofaD/2+0.1]} size={[0.44,0.15,0.44]} color={brandSecondary} roughness={0.95} />
      <Box pos={[0,           0.54, h*0.15-sofaD/2+0.1]} size={[0.36,0.12,0.36]} color={furnitureBody}  roughness={0.95} />

      {/* Round coffee table — white/body tone with dark legs (matches target: white round table) */}
      <Cylinder pos={[0, 0.36, h*0.15-1.1]} rt={0.5} rb={0.5} h={0.05} segs={24} color={furnitureBody} roughness={0.25} metalness={0.05} />
      <Cylinder pos={[0, 0.18, h*0.15-1.1]} rt={0.05} rb={0.06} h={0.34} segs={8} color={furnitureDark} roughness={0.4} />

      {/* Accent armchair — body tone, brand secondary cushion */}
      {w > 3.5 && (
        <group position={[-w*0.34, 0, -h*0.26]}>
          <Box pos={[0, 0.24, 0]}     size={[0.62, 0.46, 0.6]}  color={furnitureBody} roughness={0.85} />
          <Box pos={[0, 0.56, -0.24]} size={[0.62, 0.48, 0.1]}  color={furnitureBody} roughness={0.85} />
          <Box pos={[0, 0.3, -0.04]}  size={[0.52, 0.12, 0.5]}  color={brandSecondary} roughness={0.95} />
        </group>
      )}

      {/* TV unit — dark accent, low profile */}
      <Box pos={[0, 0.13, -h*0.4]} size={[Math.min(w*0.52,2.0), 0.24, 0.4]} color={furnitureDark} roughness={0.35} />
      {/* TV screen */}
      <Box pos={[0, 0.72, -h*0.4-0.18]} size={[Math.min(w*0.44,1.6), 0.72, 0.05]} color="#1A1A1A" roughness={0.1} metalness={0.5} />

      {/* Floor plants in corners */}
      <FloorPlant pos={[-w*0.44, 0, -h*0.36]} />
      {w > 3.5 && <FloorPlant pos={[w*0.4, 0, h*0.3]} />}
    </group>
  );
}

// Dining: large round WHITE table + white chairs with black legs (matches target)
function DiningFurniture({ w, h, brandSecondary, furnitureBody, furnitureDark }: {
  w: number; h: number;
  brandSecondary: string; furnitureBody: string; furnitureDark: string;
}) {
  const r = Math.min(w * 0.26, 0.72);
  const chairCount = r > 0.55 ? 6 : 4;
  const angles = Array.from({ length: chairCount }, (_, i) => (i / chairCount) * Math.PI * 2);
  return (
    <group>
      {/* Table top — body tone (white/cream) */}
      <Cylinder pos={[0, 0.74, 0]} rt={r} rb={r} h={0.05} segs={32} color={furnitureBody} roughness={0.2} metalness={0.05} />
      {/* Pedestal — dark accent */}
      <Cylinder pos={[0, 0.38, 0]} rt={0.07} rb={0.09} h={0.72} segs={10} color={furnitureDark} roughness={0.4} />

      {/* White chairs with dark legs */}
      {angles.map((angle, i) => {
        const cx = Math.sin(angle) * (r + 0.52);
        const cz = Math.cos(angle) * (r + 0.52);
        return (
          <group key={i} position={[cx, 0, cz]} rotation={[0, -angle, 0]}>
            <Box pos={[0, 0.44, 0]}     size={[0.42, 0.05, 0.42]}  color={furnitureBody} roughness={0.6} />
            <Box pos={[0, 0.72, 0.18]}  size={[0.42, 0.52, 0.05]}  color={furnitureBody} roughness={0.6} />
            <Cylinder pos={[-0.17, 0.22, -0.17]} rt={0.02} rb={0.02} h={0.44} segs={6} color={furnitureDark} />
            <Cylinder pos={[ 0.17, 0.22, -0.17]} rt={0.02} rb={0.02} h={0.44} segs={6} color={furnitureDark} />
            <Cylinder pos={[-0.17, 0.22,  0.17]} rt={0.02} rb={0.02} h={0.44} segs={6} color={furnitureDark} />
            <Cylinder pos={[ 0.17, 0.22,  0.17]} rt={0.02} rb={0.02} h={0.44} segs={6} color={furnitureDark} />
          </group>
        );
      })}

      {/* Centrepiece — small plant */}
      <Cylinder pos={[0, 0.8, 0]} rt={0.08} rb={0.07} h={0.18} segs={8} color="#C07850" roughness={0.9} />
      <mesh castShadow position={[0, 1.02, 0]}>
        <sphereGeometry args={[0.14, 8, 6]} />
        <meshStandardMaterial color="#3A6B30" roughness={1} />
      </mesh>

      {/* Brand accent — small mauve decorative object beside table */}
      <Cylinder pos={[r+0.3, 0.02, 0]} rt={0.18} rb={0.18} h={0.04} segs={16} color={brandSecondary} roughness={0.9} opacity={0.7} />
    </group>
  );
}

// Kitchen: white island bench + pale timber upper cabinets + appliances
function KitchenFurniture({ w, h }: { w: number; h: number }) {
  const islandW = Math.min(w * 0.44, 1.3);
  return (
    <group>
      {/* Island bench — white stone top + white ribbed base */}
      <Box pos={[0, 0.46, 0]}        size={[islandW, 0.06, Math.min(h*0.34,0.9)]} color="#F2EFEB" roughness={0.2} metalness={0.05} />
      <Box pos={[0, 0.24, 0]}        size={[islandW, 0.42, Math.min(h*0.34,0.9)]} color="#ECEAE4" roughness={0.75} />
      {/* Back counter — stone top + cabinetry */}
      <Box pos={[0, 0.46, -h*0.37]}  size={[w*0.74, 0.05, 0.58]} color="#F2EFEB" roughness={0.2} metalness={0.05} />
      <Box pos={[0, 0.24, -h*0.37]}  size={[w*0.74, 0.42, 0.58]} color="#E8E4DC" roughness={0.75} />
      {/* Upper cabinets — pale timber */}
      <Box pos={[0, 1.72, -h*0.39]}  size={[w*0.66, 0.6, 0.36]}  color="#E0D8C4" roughness={0.7} />
      {/* Splashback */}
      <Box pos={[0, 1.1, -h*0.39]}   size={[w*0.66, 0.52, 0.06]} color="#DDDAD4" roughness={0.4} />
      {/* Rangehood suggestion */}
      <Box pos={[w*0.1, 1.55, -h*0.39]} size={[0.6, 0.1, 0.32]} color="#BCBCBC" roughness={0.3} metalness={0.3} />
    </group>
  );
}

// Terrace: green hedge borders + dark round table + white chairs + brand cushions
function TerraceFurniture({ w, h, brandPrimary, brandSecondary, furnitureBody, furnitureDark }: {
  w: number; h: number;
  brandPrimary: string; brandSecondary: string; furnitureBody: string; furnitureDark: string;
}) {
  void brandPrimary; // available if needed for terrace accents
  return (
    <group>
      {/* Green hedge borders — three sides */}
      <Box pos={[0, 0.15, -h/2+0.2]}    size={[w-0.3, 0.28, 0.3]}  color="#4A7A40" roughness={1} />
      <Box pos={[-w/2+0.2, 0.15, 0]}    size={[0.3, 0.28, h-0.3]}  color="#4A7A40" roughness={1} />
      <Box pos={[ w/2-0.2, 0.15, 0]}    size={[0.3, 0.28, h-0.3]}  color="#4A7A40" roughness={1} />

      {/* Small round table + chairs — only if terrace is large enough */}
      {w > 1.8 && h > 1.8 && (
        <group position={[0, 0, h * 0.1]}>
          {/* Table — dark accent */}
          <Cylinder pos={[0, 0.33, 0]} rt={0.3} rb={0.3} h={0.05} segs={20} color={furnitureDark} roughness={0.4} />
          <Cylinder pos={[0, 0.16, 0]} rt={0.04} rb={0.05} h={0.3} segs={8} color={furnitureDark} roughness={0.5} />

          {/* Chairs — white body + brand secondary cushion */}
          {[[-0.58, 0], [0.58, 0], [0, 0.58]].slice(0, w > 2.5 ? 3 : 2).map(([cx, cz], i) => (
            <group key={i} position={[cx, 0, cz]}>
              <Box pos={[0, 0.24, 0]}     size={[0.38, 0.4, 0.38]}  color={furnitureBody} roughness={0.85} />
              <Box pos={[0, 0.5, 0.16]}   size={[0.38, 0.4, 0.07]}  color={furnitureBody} roughness={0.85} />
              <Box pos={[0, 0.28, -0.04]} size={[0.32, 0.09, 0.32]} color={brandSecondary} roughness={0.95} />
            </group>
          ))}
        </group>
      )}

      {/* Small floor plant on terrace */}
      {w > 2.0 && <FloorPlant pos={[w*0.33, 0, -h*0.3]} />}
    </group>
  );
}

// Closet/Wardrobe: floor-to-ceiling white cabinetry with hanging rail
function ClosetFurniture({ w, h, furnitureBody, furnitureDark }: {
  w: number; h: number; furnitureBody: string; furnitureDark: string;
}) {
  return (
    <group>
      {/* Back wardrobe bank — full width, floor to near-ceiling */}
      <Box pos={[0, WALL_H*0.5, -h/2+0.32]} size={[w-0.24, WALL_H*0.96, 0.6]} color={furnitureBody} roughness={0.6} />
      {/* Door panel lines — suggest sliding doors */}
      <Box pos={[-w*0.22, WALL_H*0.5, -h/2+0.02]} size={[0.02, WALL_H*0.9, 0.04]} color={furnitureDark} roughness={0.3} />
      <Box pos={[ w*0.22, WALL_H*0.5, -h/2+0.02]} size={[0.02, WALL_H*0.9, 0.04]} color={furnitureDark} roughness={0.3} />
      {/* Handle rail */}
      <Box pos={[0, WALL_H*0.5, -h/2+0.02]} size={[w*0.7, 0.02, 0.03]} color={furnitureDark} roughness={0.25} metalness={0.4} />
      {/* Hanging rail — horizontal rod along X axis */}
      <mesh castShadow position={[0, WALL_H*0.72, -h/2+0.15]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.015, 0.015, Math.max(0.1, w*0.72), 6]} />
        <meshStandardMaterial color={furnitureDark} metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Clothes hanging — colour blocks suggesting garments */}
      {Array.from({ length: Math.floor(w * 2.2) }, (_, i) => {
        const gx = -w*0.34 + i * (w*0.68 / Math.max(1, Math.floor(w*2.2)-1));
        const gColor = i % 3 === 0 ? "#E8E4DC" : i % 3 === 1 ? "#D0D4D8" : furnitureBody;
        return <Box key={i} pos={[gx, WALL_H*0.6, -h/2+0.15]} size={[0.2, 0.48, 0.18]} color={gColor} roughness={0.9} />;
      })}
    </group>
  );
}

// Bathroom: white fixtures (vanity, bath/shower tray, toilet)
function BathroomFurniture({ w, h, furnitureBody }: { w: number; h: number; furnitureBody: string }) {
  return (
    <group>
      {/* Vanity bench */}
      <Box pos={[w*0.2, 0.46, -h/2+0.28]} size={[Math.min(w*0.48, 1.0), 0.05, 0.52]} color={furnitureBody} roughness={0.25} metalness={0.05} />
      <Box pos={[w*0.2, 0.24, -h/2+0.28]} size={[Math.min(w*0.48, 1.0), 0.42, 0.52]} color={furnitureBody} roughness={0.65} />
      {/* Mirror */}
      <Box pos={[w*0.2, 1.3, -h/2+0.04]}  size={[Math.min(w*0.44, 0.85), 0.7, 0.04]}  color="#C8E4F8" roughness={0.05} metalness={0.3} opacity={0.5} />
      {/* Shower tray — slightly recessed */}
      <Box pos={[-w*0.24, 0.02, h*0.12]}   size={[Math.min(w*0.38, 0.9), 0.04, Math.min(h*0.44, 0.9)]} color="#E4E2DE" roughness={0.4} />
      {/* Toilet — white */}
      <Box pos={[-w*0.3, 0.24, -h/2+0.22]} size={[0.38, 0.44, 0.48]} color={furnitureBody} roughness={0.5} />
    </group>
  );
}

// ── Main RoomMesh ──────────────────────────────────────────────────────────

interface RoomMeshProps {
  room: Room;
  wallColor: string;
  flooringHex: string;
  brandPrimary: string;
  brandSecondary: string;
  furnitureBody: string;
  furnitureDark: string;
  furnitureWarm: string;
}

export default function RoomMesh({
  room, wallColor, flooringHex,
  brandPrimary, brandSecondary,
  furnitureBody, furnitureDark, furnitureWarm,
}: RoomMeshProps) {
  const { x, y, w, h } = room.bounds;
  const cx = x + w / 2;
  const cz = y + h / 2;
  const floorColor = FLOOR_OVERRIDE[room.type] ?? flooringHex;
  const isOutdoor = room.type === "balcony";
  const isCloset  = room.type === "closet";

  return (
    <group position={[cx, 0, cz]}>
      {/* Floor slab */}
      <mesh receiveShadow position={[0, -FLOOR_T / 2, 0]}>
        <boxGeometry args={[w, FLOOR_T, h]} />
        <meshStandardMaterial color={floorColor} roughness={0.65} />
      </mesh>

      {/* 4 thin walls */}
      {(["n","s","w","e"] as const).map((side) => {
        const isNS = side === "n" || side === "s";
        const posMap: Record<string, [number,number,number]> = {
          n: [0, WALL_H/2, -h/2],
          s: [0, WALL_H/2,  h/2],
          w: [-w/2, WALL_H/2, 0],
          e: [ w/2, WALL_H/2, 0],
        };
        const pos = posMap[side];
        const size: [number,number,number] = isNS
          ? [w + WALL_T, WALL_H, WALL_T]
          : [WALL_T, WALL_H, h];
        return (
          <mesh key={side} castShadow position={pos}>
            <boxGeometry args={size} />
            <meshStandardMaterial color={isCloset ? furnitureBody : wallColor} roughness={0.85} />
          </mesh>
        );
      })}

      {/* Furniture by room type */}
      {room.type === "bedroom" && (
        <BedroomFurniture
          w={w} h={h}
          brandPrimary={brandPrimary} brandSecondary={brandSecondary}
          furnitureBody={furnitureBody} furnitureDark={furnitureDark} furnitureWarm={furnitureWarm}
        />
      )}
      {room.type === "living" && (
        <LivingFurniture
          w={w} h={h}
          brandPrimary={brandPrimary} brandSecondary={brandSecondary}
          furnitureBody={furnitureBody} furnitureDark={furnitureDark}
        />
      )}
      {room.type === "dining" && (
        <DiningFurniture
          w={w} h={h}
          brandSecondary={brandSecondary}
          furnitureBody={furnitureBody} furnitureDark={furnitureDark}
        />
      )}
      {room.type === "kitchen" && (
        <KitchenFurniture w={w} h={h} />
      )}
      {room.type === "balcony" && (
        <TerraceFurniture
          w={w} h={h}
          brandPrimary={brandPrimary} brandSecondary={brandSecondary}
          furnitureBody={furnitureBody} furnitureDark={furnitureDark}
        />
      )}
      {room.type === "closet" && (
        <ClosetFurniture w={w} h={h} furnitureBody={furnitureBody} furnitureDark={furnitureDark} />
      )}
      {(room.type === "bathroom" || room.type === "laundry") && (
        <BathroomFurniture w={w} h={h} furnitureBody={furnitureBody} />
      )}

      {/* Window glass highlights */}
      {room.windows.map((win, i) => {
        const ns = win.wall === "n" || win.wall === "s";
        const wp: [number,number,number] = ns
          ? [-w/2 + win.position*w + win.width/2, WALL_H*0.55, win.wall === "n" ? -h/2 : h/2]
          : [win.wall === "w" ? -w/2 : w/2, WALL_H*0.55, -h/2 + win.position*h + win.width/2];
        return (
          <mesh key={i} position={wp}>
            <boxGeometry args={ns
              ? [win.width, WALL_H*0.42, WALL_T+0.02]
              : [WALL_T+0.02, WALL_H*0.42, win.width]}
            />
            <meshStandardMaterial color="#B8D8F0" opacity={0.4} transparent roughness={0.05} metalness={0.3} />
          </mesh>
        );
      })}

      {/* Room label */}
      <Text
        position={[0, WALL_H + 0.25, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={Math.max(Math.min(w, h) * 0.16, 0.22)}
        color={isOutdoor ? "#3a5a34" : isCloset ? "#5a4a3a" : "#410e2b"}
        anchorX="center"
        anchorY="middle"
        maxWidth={w * 0.88}
      >
        {room.label}
      </Text>
    </group>
  );
}
