import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CurrentVectors3DProps {
  currentSpeedKnots: number;
  currentDirectionDeg: number;
  hasIceFloes?: boolean;
}

export const CurrentVectors3D: React.FC<CurrentVectors3DProps> = ({
  currentSpeedKnots,
  currentDirectionDeg,
  hasIceFloes
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate 800 floating particles (plankton / marine snow)
  const particleCount = 600;
  const positions = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 1] = -Math.random() * 35 - 0.5; // underwater down to -35m
      pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const pos = geom.attributes.position;
    const count = pos.count;

    const rad = (currentDirectionDeg * Math.PI) / 180.0;
    const speed = currentSpeedKnots * 0.8 * delta;
    const vx = Math.sin(rad) * speed;
    const vz = Math.cos(rad) * speed;

    for (let i = 0; i < count; i++) {
      let x = pos.getX(i) + vx;
      let y = pos.getY(i) + (Math.sin(i + x * 0.1) * 0.05) * delta;
      let z = pos.getZ(i) + vz;

      // Wrap around bounds
      if (x > 60) x = -60;
      if (x < -60) x = 60;
      if (z > 60) z = -60;
      if (z < -60) z = 60;
      if (y > -0.2) y = -35;
      if (y < -35) y = -0.2;

      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={hasIceFloes ? 0.35 : 0.22}
        color={hasIceFloes ? '#c5e0fd' : '#22d3ee'}
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
};
