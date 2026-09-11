import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';

export const MarineSnow3D: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const vehicle = useSimulationStore((state) => state.vehicle);

  const pod = useSimulationStore((state) => state.pod);
  const cameraMode = useSimulationStore((state) => state.cameraMode);

  const particleCount = 1500;

  const [positions, initialPositions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const initial = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 25; // 25m local depth envelope
      const z = (Math.random() - 0.5) * 40;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      initial[i * 3] = x;
      initial[i * 3 + 1] = y;
      initial[i * 3 + 2] = z;
    }

    return [pos, initial];
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position;

    const centerY = cameraMode === 'UNDERWATER_POD'
      ? -Math.max(0.5, pod.depthCurrentM)
      : (pod.depthCurrentM > 0.5 ? -pod.depthCurrentM : -12.0);

    // Snow gently drifting down and undulating with fluid currents
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      // Gentle downward drift + micro-turbulence
      let py = initialPositions[idx + 1] - (t * 0.35) % 25;
      if (py < -12.5) py += 25;

      const px = initialPositions[idx] + vehicle.simX + Math.sin(t * 0.8 + initialPositions[idx + 1]) * 0.3;
      const pz = initialPositions[idx + 2] + vehicle.simZ + Math.cos(t * 0.6 + initialPositions[idx]) * 0.3;

      posAttr.setXYZ(i, px, centerY + py, pz);
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={particleCount}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        color="#7DD3FC"
        transparent
        opacity={cameraMode === 'UNDERWATER_POD' ? 0.85 : 0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
