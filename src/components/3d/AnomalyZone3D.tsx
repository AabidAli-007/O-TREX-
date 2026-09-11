import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnvironmentState } from '../../types/simulation';

interface AnomalyZone3DProps {
  anomalyRegion: EnvironmentState['anomalyRegion'];
}

export const AnomalyZone3D: React.FC<AnomalyZone3DProps> = ({ anomalyRegion }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    // Subtle pulsating respiration of the anomaly boundary
    const pulse = 1.0 + Math.sin(t * 1.8) * 0.06;
    meshRef.current.scale.set(pulse, 1, pulse);
  });

  if (!anomalyRegion.active) return null;

  return (
    <group position={[anomalyRegion.centerSimX, -10, anomalyRegion.centerSimZ]}>
      {/* Subsurface Anomaly Cylinder / Volume Indicator */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[anomalyRegion.radiusM * 0.4, anomalyRegion.radiusM * 0.4, 20, 32]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          wireframe={false}
        />
      </mesh>

      {/* Pulsing Boundary Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 9.8, 0]}>
        <ringGeometry args={[anomalyRegion.radiusM * 0.38, anomalyRegion.radiusM * 0.4, 32]} />
        <meshBasicMaterial color="#f87171" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
