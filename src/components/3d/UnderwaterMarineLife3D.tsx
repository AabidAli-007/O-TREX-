import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';

interface FishInstance {
  baseX: number;
  baseZ: number;
  depth: number;
  radiusX: number;
  radiusZ: number;
  speed: number;
  phase: number;
  scale: number;
  color: string;
}

export const UnderwaterMarineLife3D: React.FC = () => {
  const vehicle = useSimulationStore((state) => state.vehicle);
  const fishGroupRef = useRef<THREE.Group>(null);

  // Define 3 schools of low-poly tropical / marine fish (matching user reference image)
  const fishData: FishInstance[] = useMemo(() => {
    const list: FishInstance[] = [];

    // School 1: Orange/Golden reef fish orbiting the sunlit water column (depth 12m - 24m)
    for (let i = 0; i < 35; i++) {
      list.push({
        baseX: (Math.random() - 0.5) * 15,
        baseZ: (Math.random() - 0.5) * 15,
        depth: 10 + Math.random() * 16,
        radiusX: 8 + Math.random() * 12,
        radiusZ: 7 + Math.random() * 10,
        speed: 0.5 + Math.random() * 0.5,
        phase: (i / 35) * Math.PI * 2,
        scale: 0.28 + Math.random() * 0.14,
        color: i % 2 === 0 ? '#F97316' : '#F59E0B' // vibrant orange / gold
      });
    }

    // School 2: Grazing fish near the sea grass beds and seafloor rocks (depth 28m - 36m)
    for (let i = 0; i < 45; i++) {
      list.push({
        baseX: (Math.random() - 0.5) * 20,
        baseZ: (Math.random() - 0.5) * 20,
        depth: 26 + Math.random() * 10,
        radiusX: 10 + Math.random() * 12,
        radiusZ: 8 + Math.random() * 10,
        speed: 0.4 + Math.random() * 0.3,
        phase: (i / 45) * Math.PI * 2,
        scale: 0.32 + Math.random() * 0.16,
        color: i % 3 === 0 ? '#FB923C' : i % 3 === 1 ? '#FBBF24' : '#38BDF8'
      });
    }

    // School 3: Small curious school swimming around the sensor pod's descent path
    for (let i = 0; i < 20; i++) {
      list.push({
        baseX: (Math.random() - 0.5) * 4,
        baseZ: -0.65 + (Math.random() - 0.5) * 4,
        depth: 5 + Math.random() * 25,
        radiusX: 3 + Math.random() * 4,
        radiusZ: 3 + Math.random() * 4,
        speed: 0.8 + Math.random() * 0.4,
        phase: (i / 20) * Math.PI * 2,
        scale: 0.22 + Math.random() * 0.1,
        color: '#F97316'
      });
    }

    return list;
  }, []);

  useFrame(({ clock }) => {
    if (!fishGroupRef.current) return;
    const t = clock.getElapsedTime();

    fishGroupRef.current.children.forEach((fishMesh, idx) => {
      const data = fishData[idx];
      if (!data) return;

      // Schooling orbital trajectory centered around vessel/pod coordinates
      const angle = t * data.speed + data.phase;
      const targetX = vehicle.simX + data.baseX + Math.cos(angle) * data.radiusX;
      const targetZ = vehicle.simZ + data.baseZ + Math.sin(angle) * data.radiusZ;

      // Vertical undulating swim motion
      const undulateY = Math.sin(t * 1.8 + idx) * 0.55;
      const targetY = -(data.depth + undulateY);

      // Previous position for heading vector
      const prevAngle = (t - 0.05) * data.speed + data.phase;
      const prevX = vehicle.simX + data.baseX + Math.cos(prevAngle) * data.radiusX;
      const prevZ = vehicle.simZ + data.baseZ + Math.sin(prevAngle) * data.radiusZ;

      const heading = Math.atan2(targetX - prevX, targetZ - prevZ);

      fishMesh.position.set(targetX, targetY, targetZ);
      fishMesh.rotation.y = heading + Math.PI; // Face forward along velocity

      // Waggle tail fin and roll bank
      const tailMesh = (fishMesh as THREE.Group).getObjectByName('tailFin');
      if (tailMesh) {
        tailMesh.rotation.y = Math.sin(t * 9.0 + idx * 1.2) * 0.45;
      }
      fishMesh.rotation.z = Math.sin(angle) * 0.15; // Banking into turns
    });
  });

  return (
    <group ref={fishGroupRef}>
      {fishData.map((data, idx) => (
        <group key={idx} scale={[data.scale, data.scale, data.scale]}>
          {/* Low-Poly Faceted Fish Body */}
          <mesh castShadow>
            <coneGeometry args={[0.32, 1.1, 5]} />
            <meshStandardMaterial
              color={data.color}
              roughness={0.4}
              metalness={0.2}
              flatShading
            />
          </mesh>

          {/* White Belly Stripe */}
          <mesh position={[0, -0.06, 0.05]} scale={[0.85, 0.9, 0.6]}>
            <coneGeometry args={[0.26, 0.9, 4]} />
            <meshStandardMaterial
              color="#FFF7ED"
              roughness={0.5}
              metalness={0.1}
              flatShading
            />
          </mesh>

          {/* Wagging Tail Fin (Caudal) */}
          <group name="tailFin" position={[0, 0, -0.55]}>
            <mesh position={[0, 0, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.28, 0.45, 3]} />
              <meshStandardMaterial
                color={data.color}
                roughness={0.3}
                metalness={0.3}
                transparent
                opacity={0.9}
                flatShading
              />
            </mesh>
          </group>

          {/* Dorsal Fin */}
          <mesh position={[0, 0.28, -0.05]} rotation={[-0.3, 0, 0]}>
            <coneGeometry args={[0.1, 0.35, 3]} />
            <meshStandardMaterial
              color={data.color}
              roughness={0.4}
              flatShading
            />
          </mesh>

          {/* Pectoral Fins */}
          <mesh position={[0.2, -0.05, 0.1]} rotation={[0.4, 0.5, 0.6]}>
            <boxGeometry args={[0.02, 0.16, 0.2]} />
            <meshStandardMaterial color={data.color} flatShading />
          </mesh>
          <mesh position={[-0.2, -0.05, 0.1]} rotation={[0.4, -0.5, -0.6]}>
            <boxGeometry args={[0.02, 0.16, 0.2]} />
            <meshStandardMaterial color={data.color} flatShading />
          </mesh>

          {/* Eyes */}
          <mesh position={[0.14, 0.06, 0.32]}>
            <sphereGeometry args={[0.045, 6, 6]} />
            <meshBasicMaterial color="#0F172A" />
          </mesh>
          <mesh position={[-0.14, 0.06, 0.32]}>
            <sphereGeometry args={[0.045, 6, 6]} />
            <meshBasicMaterial color="#0F172A" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
