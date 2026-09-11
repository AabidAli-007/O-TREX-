import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';

export const Competitors3D: React.FC = () => {
  const shipRef = useRef<THREE.Group>(null);
  const argoRef = useRef<THREE.Group>(null);
  const saildroneRef = useRef<THREE.Group>(null);
  const buoyRef = useRef<THREE.Group>(null);

  const selectCompetitor = useSimulationStore((state) => state.selectCompetitor);
  const openModal = useSimulationStore((state) => state.openModal);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // 1. Research Vessel cruising in near visual range (110m, -75m)
    if (shipRef.current) {
      shipRef.current.position.x = 110 + Math.cos(t * 0.04) * 8;
      shipRef.current.position.z = -75 + Math.sin(t * 0.06) * 10;
      shipRef.current.rotation.y = Math.PI * 0.45;
      shipRef.current.position.y = Math.sin(t * 1.5) * 0.08;
    }

    // 2. Argo Float drifting and gently undulating vertically (38m, 32m)
    if (argoRef.current) {
      argoRef.current.position.x = 38 + Math.sin(t * 0.05) * 2;
      argoRef.current.position.z = 32 + Math.cos(t * 0.05) * 2;
      argoRef.current.position.y = -1.2 + Math.sin(t * 0.25) * 1.8;
    }

    // 3. Saildrone sailing across the wind (-48m, -28m)
    if (saildroneRef.current) {
      saildroneRef.current.position.x = -48 + Math.sin(t * 0.08) * 6;
      saildroneRef.current.position.z = -28 + Math.cos(t * 0.08) * 6;
      saildroneRef.current.rotation.y = t * 0.08 + Math.PI * 0.3;
      saildroneRef.current.position.y = Math.sin(t * 2.2) * 0.06;
    }

    // 4. Moored Buoy anchored with wave heave (-25m, 55m)
    if (buoyRef.current) {
      buoyRef.current.position.x = -25;
      buoyRef.current.position.z = 55;
      buoyRef.current.position.y = Math.sin(t * 2.5) * 0.12;
    }
  });

  const handleSelect = (id: string, e: any) => {
    e.stopPropagation();
    selectCompetitor(id);
    openModal('COMPETITORS');
  };

  return (
    <group>
      {/* 1. CREWED RESEARCH VESSEL */}
      <group
        ref={shipRef}
        position={[110, 0, -75]}
        onClick={(e) => handleSelect('research-vessel', e)}
      >
        <mesh visible={false}>
          <boxGeometry args={[18, 8, 12]} />
        </mesh>
        {/* Ship Hull */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[14, 2.2, 3.8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        {/* Bow Wedge */}
        <mesh position={[7.5, 0.9, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
          <boxGeometry args={[2.5, 1.8, 3.6]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Superstructure / Bridge */}
        <mesh position={[-1.5, 2.8, 0]} castShadow>
          <boxGeometry args={[5.5, 2.2, 3.2]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        {/* Radar Mast */}
        <mesh position={[-1.5, 4.4, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 1.8, 8]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        {/* Funnel / Exhaust */}
        <mesh position={[-3.5, 3.2, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 1.4, 12]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        {/* CTD A-Frame Crane at Stern */}
        <mesh position={[-6.2, 2.2, 0]} rotation={[0, 0, Math.PI / 12]}>
          <boxGeometry args={[0.2, 2.6, 2.4]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        {/* Name Label */}
        <Text
          position={[0, 4.8, 0]}
          fontSize={0.85}
          color="#38bdf8"
          anchorX="center"
          anchorY="bottom"
        >
          Research Vessel (Manned)
        </Text>
      </group>

      {/* 2. ARGO PROFILING FLOAT */}
      <group
        ref={argoRef}
        position={[38, -1.2, 32]}
        onClick={(e) => handleSelect('argo-float', e)}
      >
        <mesh visible={false}>
          <cylinderGeometry args={[1.5, 1.5, 4, 8]} />
        </mesh>
        {/* Float Cylindrical Body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.25, 0.25, 1.8, 16]} />
          <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* CTD Sensor Head */}
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.25, 16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Satellite Antenna Whip */}
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.6, 8]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        {/* Blinking Satellite LED */}
        <mesh position={[0, 1.7, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
        </mesh>
        <Text
          position={[0, 2.1, 0]}
          fontSize={0.65}
          color="#facc15"
          anchorX="center"
          anchorY="bottom"
        >
          Argo Float (Lagrangian)
        </Text>
      </group>

      {/* 3. COMMERCIAL SAILDRONE-CLASS USV */}
      <group
        ref={saildroneRef}
        position={[-48, 0, -28]}
        onClick={(e) => handleSelect('commercial-usv', e)}
      >
        <mesh visible={false}>
          <boxGeometry args={[4, 6, 4]} />
        </mesh>
        {/* Monohull */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.5, 0.4, 3.8]} />
          <meshStandardMaterial color="#f97316" roughness={0.3} />
        </mesh>
        {/* Tall Rigid Wing Sail */}
        <mesh position={[0, 2.2, -0.2]} rotation={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.08, 4.0, 1.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>
        {/* Wing Tail Tab */}
        <mesh position={[0, 3.8, -0.9]}>
          <boxGeometry args={[0.04, 0.8, 0.5]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>
        <Text
          position={[0, 4.6, 0]}
          fontSize={0.65}
          color="#fb923c"
          anchorX="center"
          anchorY="bottom"
        >
          Saildrone (Wing USV)
        </Text>
      </group>

      {/* 4. FIXED MOORED BUOY */}
      <group
        ref={buoyRef}
        position={[-25, 0, 55]}
        onClick={(e) => handleSelect('fixed-mooring', e)}
      >
        <mesh visible={false}>
          <cylinderGeometry args={[2, 2, 4, 8]} />
        </mesh>
        {/* Toroidal Float Collar */}
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[1.1, 0.4, 16, 24]} />
          <meshStandardMaterial color="#facc15" roughness={0.4} />
        </mesh>
        {/* Central Well & Tower */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.6, 2.2, 4]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        {/* Weather Sensors */}
        <mesh position={[0, 2.4, 0]}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Subsurface Anchor Chain */}
        <mesh position={[0, -5, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 10, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <Text
          position={[0, 2.8, 0]}
          fontSize={0.65}
          color="#fde047"
          anchorX="center"
          anchorY="bottom"
        >
          Moored Ocean Buoy
        </Text>
      </group>
    </group>
  );
};
