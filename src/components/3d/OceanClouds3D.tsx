import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';

export const OceanClouds3D: React.FC = () => {
  const cloudsGroupRef = useRef<THREE.Group>(null);
  const env = useSimulationStore((state) => state.env);
  const cameraMode = useSimulationStore((state) => state.cameraMode);

  // Generate randomized cloud puff clusters
  const cloudPuffs = useMemo(() => {
    const puffs = [];
    const clusterCount = 18;

    for (let c = 0; c < clusterCount; c++) {
      const clusterCenterX = (Math.random() - 0.5) * 2200;
      const clusterCenterZ = (Math.random() - 0.5) * 2200;
      const altitude = 140 + Math.random() * 60;
      const puffsInCluster = 5 + Math.floor(Math.random() * 6);

      for (let p = 0; p < puffsInCluster; p++) {
        const ox = (Math.random() - 0.5) * 90;
        const oz = (Math.random() - 0.5) * 90;
        const oy = (Math.random() - 0.5) * 16;
        const scaleX = 45 + Math.random() * 55;
        const scaleY = 18 + Math.random() * 22;
        const scaleZ = 45 + Math.random() * 55;
        const opacity = 0.45 + Math.random() * 0.35;

        puffs.push({
          x: clusterCenterX + ox,
          y: altitude + oy,
          z: clusterCenterZ + oz,
          scale: [scaleX, scaleY, scaleZ] as [number, number, number],
          opacity
        });
      }
    }
    return puffs;
  }, []);

  useFrame((_, delta) => {
    if (!cloudsGroupRef.current) return;

    // Visible, atmospheric cloud drift according to wind speed and wind direction
    const windRad = (env.windDirectionDeg * Math.PI) / 180.0;
    const driftSpeed = Math.max(3.5, env.windSpeedMs * 0.9);
    const dx = Math.sin(windRad) * driftSpeed * delta * 18.0;
    const dz = Math.cos(windRad) * driftSpeed * delta * 18.0;

    cloudsGroupRef.current.children.forEach((child) => {
      child.position.x += dx;
      child.position.z += dz;

      // Wrap clouds smoothly within 2000m sky boundary
      if (child.position.x > 1200) child.position.x = -1200;
      if (child.position.x < -1200) child.position.x = 1200;
      if (child.position.z > 1200) child.position.z = -1200;
      if (child.position.z < -1200) child.position.z = 1200;
    });
  });

  // If viewing underwater sensor pod, do not render sky clouds
  if (cameraMode === 'UNDERWATER_POD') return null;

  const isPolar = env.scenarioId === 'POLAR_OCEAN';
  const cloudColor = isPolar ? '#D9E8F5' : '#F1F5F9';

  return (
    <group ref={cloudsGroupRef}>
      {cloudPuffs.map((puff, idx) => (
        <mesh key={idx} position={[puff.x, puff.y, puff.z]} scale={puff.scale}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial
            color={cloudColor}
            transparent
            opacity={puff.opacity}
            roughness={0.9}
            metalness={0.05}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};
