import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';
import { UnderwaterMarineLife3D } from './UnderwaterMarineLife3D';

export const UnderwaterEnvironment3D: React.FC = () => {
  const seabedRef = useRef<THREE.Mesh>(null);
  const sunRaysGroupRef = useRef<THREE.Group>(null);
  const grassGroupRef = useRef<THREE.Group>(null);
  const krillPointsRef = useRef<THREE.Points>(null);

  const vehicle = useSimulationStore((state) => state.vehicle);
  const env = useSimulationStore((state) => state.env);

  const seabedDepth = -38.0; // 38m depth so sensor pod descent to 30-50m brings the seabed in full glorious view

  // 1. Sea Grass & Kelp fronds data (clusters of swaying blades)
  const grassFronds = useMemo(() => {
    const fronds = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      // Position around the perimeter of the central clearing (radius 6m to 24m)
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist = 7.0 + Math.random() * 18.0;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const height = 1.8 + Math.random() * 2.4;
      const width = 0.18 + Math.random() * 0.12;
      const color = i % 3 === 0 ? '#10B981' : i % 3 === 1 ? '#059669' : '#06B6D4'; // Green / Emerald / Turquoise
      const phase = Math.random() * Math.PI * 2;
      fronds.push({ x, z, height, width, color, phase });
    }
    return fronds;
  }, []);

  // 2. Low-poly rocky crags and boulders (matching user reference image)
  const rockClusters = useMemo(() => {
    return [
      { x: -14, z: -8, scale: [3.8, 4.8, 3.2], rotY: 0.4 },
      { x: -11, z: 12, scale: [4.2, 5.5, 3.8], rotY: 1.2 },
      { x: 13, z: 9, scale: [3.5, 4.2, 3.6], rotY: -0.8 },
      { x: 15, z: -12, scale: [4.5, 6.0, 4.0], rotY: 2.1 },
      { x: -6, z: -16, scale: [2.8, 3.2, 2.5], rotY: 0.6 },
      { x: 7, z: 16, scale: [3.2, 3.8, 2.8], rotY: -1.4 }
    ];
  }, []);

  // 3. Turquoise branching coral formations
  const coralFormations = useMemo(() => {
    return [
      { x: -9.5, z: 7.5, scale: 1.4, color: '#22D3EE' },
      { x: 10.5, z: 6.0, scale: 1.6, color: '#38BDF8' },
      { x: -11.0, z: -5.5, scale: 1.3, color: '#06B6D4' },
      { x: 11.5, z: -8.0, scale: 1.5, color: '#22D3EE' }
    ];
  }, []);

  // 4. Antarctic Krill Swarm / Bioluminescent Organisms
  const krillCount = 280;
  const [krillPositions, krillVelocities] = useMemo(() => {
    const pos = new Float32Array(krillCount * 3);
    const vel = new Float32Array(krillCount * 3);

    for (let i = 0; i < krillCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = -4 - Math.random() * 30; // 4m to 34m depth
      pos[i * 3 + 2] = (Math.random() - 0.5) * 35;

      vel[i * 3] = (Math.random() - 0.5) * 0.4;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      vel[i * 3 + 2] = 0.5 + Math.random() * 0.8;
    }
    return [pos, vel];
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // 1. Shimmering Sunlight Shafts Opacity & Rotation
    if (sunRaysGroupRef.current) {
      sunRaysGroupRef.current.position.x = vehicle.simX;
      sunRaysGroupRef.current.position.z = vehicle.simZ;
      sunRaysGroupRef.current.rotation.y = t * 0.03;

      sunRaysGroupRef.current.children.forEach((child, idx) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          (mesh.material as THREE.MeshBasicMaterial).opacity =
            0.12 + Math.sin(t * 1.8 + idx * 1.4) * 0.05;
        }
      });
    }

    // 2. Dynamic Swaying of Sea Grass fronds in ocean current
    if (grassGroupRef.current) {
      grassGroupRef.current.children.forEach((group, idx) => {
        const frond = grassFronds[idx];
        if (frond) {
          group.rotation.z = Math.sin(t * 1.6 + frond.phase) * 0.22;
          group.rotation.x = Math.cos(t * 1.2 + frond.phase) * 0.14;
        }
      });
    }

    // 3. Seabed Center Snapping around vehicle
    if (seabedRef.current) {
      const snapGrid = 10.0;
      seabedRef.current.position.x = Math.floor(vehicle.simX / snapGrid) * snapGrid;
      seabedRef.current.position.z = Math.floor(vehicle.simZ / snapGrid) * snapGrid;
    }

    // 4. Swimming Krill Swarm Dynamics
    if (krillPointsRef.current) {
      const posAttr = krillPointsRef.current.geometry.attributes.position;
      for (let i = 0; i < krillCount; i++) {
        const idx = i * 3;
        let px = posAttr.getX(i);
        let py = posAttr.getY(i);
        let pz = posAttr.getZ(i);

        // Forward swimming motion with undulating wave
        pz += (krillVelocities[idx + 2] * 0.025);
        px += Math.sin(t * 1.2 + i) * 0.018;
        py += Math.cos(t * 0.8 + i) * 0.012;

        // Wrap around vehicle boundary
        if (pz - vehicle.simZ > 22) pz = vehicle.simZ - 22;
        if (px - vehicle.simX > 22) px = vehicle.simX - 22;
        if (px - vehicle.simX < -22) px = vehicle.simX + 22;

        posAttr.setXYZ(i, px, py, pz);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* ========================================================
          1. SCHOOLING 3D FISH (MATCHING USER REFERENCE IMAGE)
          ======================================================== */}
      <UnderwaterMarineLife3D />

      {/* ========================================================
          2. VOLUMETRIC SUNLIGHT SHAFTS / CONICAL GOD RAYS
          ======================================================== */}
      <group ref={sunRaysGroupRef} position={[0, -0.1, 0]}>
        {[
          { rotZ: 0.08, rotX: -0.06, scaleTop: 3, scaleBottom: 22, height: 38 },
          { rotZ: -0.12, rotX: 0.1, scaleTop: 2.5, scaleBottom: 26, height: 38 },
          { rotZ: 0.05, rotX: 0.14, scaleTop: 4, scaleBottom: 20, height: 38 },
          { rotZ: -0.09, rotX: -0.12, scaleTop: 3.2, scaleBottom: 24, height: 38 }
        ].map((ray, idx) => (
          <mesh
            key={idx}
            position={[0, -19, 0]}
            rotation={[ray.rotX, (idx * Math.PI) / 2, ray.rotZ]}
          >
            <cylinderGeometry args={[ray.scaleTop, ray.scaleBottom, ray.height, 16, 1, true]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={0.14}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      {/* ========================================================
          3. UNDULATING BATHYMETRIC SEABED & SAND BED
          ======================================================== */}
      <mesh
        ref={seabedRef}
        position={[0, seabedDepth, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[500, 500, 60, 60]} />
        <meshStandardMaterial
          color={env.hasIceFloes ? '#0B253A' : '#0E334D'}
          roughness={0.92}
          metalness={0.1}
        />
      </mesh>

      {/* Central Sunlit Golden Caustic Sand Clearing */}
      <mesh
        position={[vehicle.simX, seabedDepth + 0.05, vehicle.simZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[14, 32]} />
        <meshStandardMaterial
          color="#FDE68A"
          roughness={0.7}
          metalness={0.15}
        />
      </mesh>

      {/* Inner Caustic Highlight Disc */}
      <mesh
        position={[vehicle.simX, seabedDepth + 0.08, vehicle.simZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[8, 24]} />
        <meshBasicMaterial
          color="#FEF08A"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ========================================================
          4. SWAYING SEA GRASS BEDS & KELP FRONDS
          ======================================================== */}
      <group ref={grassGroupRef} position={[vehicle.simX, seabedDepth, vehicle.simZ]}>
        {grassFronds.map((frond, idx) => (
          <group key={idx} position={[frond.x, 0, frond.z]}>
            {/* Multiple blades per cluster */}
            {[
              { offX: 0, offZ: 0, rotY: 0, scaleY: 1.0 },
              { offX: 0.12, offZ: 0.1, rotY: 0.8, scaleY: 0.85 },
              { offX: -0.1, offZ: 0.08, rotY: -0.6, scaleY: 0.9 }
            ].map((blade, bIdx) => (
              <mesh
                key={bIdx}
                position={[blade.offX, (frond.height * blade.scaleY) / 2, blade.offZ]}
                rotation={[0, blade.rotY, 0]}
                castShadow
              >
                <coneGeometry args={[frond.width, frond.height * blade.scaleY, 4]} />
                <meshStandardMaterial
                  color={frond.color}
                  roughness={0.6}
                  metalness={0.1}
                  flatShading
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* ========================================================
          5. LOW-POLY FACETED ROCK CRAGS & BOULDERS
          ======================================================== */}
      <group position={[vehicle.simX, seabedDepth, vehicle.simZ]}>
        {rockClusters.map((rock, idx) => (
          <mesh
            key={idx}
            position={[rock.x, rock.scale[1] * 0.45, rock.z]}
            rotation={[0, rock.rotY, 0]}
            scale={rock.scale as [number, number, number]}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color="#0F172A"
              roughness={0.9}
              metalness={0.2}
              flatShading
            />
          </mesh>
        ))}
      </group>

      {/* ========================================================
          6. TURQUOISE BRANCHING CORAL FORMATIONS
          ======================================================== */}
      <group position={[vehicle.simX, seabedDepth, vehicle.simZ]}>
        {coralFormations.map((coral, idx) => (
          <group key={idx} position={[coral.x, 0, coral.z]} scale={[coral.scale, coral.scale, coral.scale]}>
            {/* Central coral stalk */}
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.18, 0.28, 1.6, 6]} />
              <meshStandardMaterial color={coral.color} roughness={0.5} flatShading />
            </mesh>
            {/* Branch 1 */}
            <mesh position={[0.35, 1.2, 0]} rotation={[0, 0, -0.6]}>
              <cylinderGeometry args={[0.12, 0.16, 1.1, 5]} />
              <meshStandardMaterial color={coral.color} roughness={0.5} flatShading />
            </mesh>
            {/* Branch 2 */}
            <mesh position={[-0.32, 1.1, 0.15]} rotation={[0.4, 0, 0.7]}>
              <cylinderGeometry args={[0.1, 0.15, 0.95, 5]} />
              <meshStandardMaterial color={coral.color} roughness={0.5} flatShading />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================
          7. SUNKEN SHIPWRECK SILHOUETTE (IN BACKGROUND ON SEABED)
          ======================================================== */}
      <group
        position={[vehicle.simX + 16, seabedDepth + 1.8, vehicle.simZ - 20]}
        rotation={[0.12, Math.PI * 0.35, -0.18]} // Tilted hull resting on sandy floor
      >
        {/* Main derelict hull */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[13, 3.2, 4.2]} />
          <meshStandardMaterial color="#0A1626" roughness={0.95} metalness={0.3} flatShading />
        </mesh>
        {/* Broken Bow Section */}
        <mesh position={[7.5, 0.4, 0]} rotation={[0, 0, -Math.PI / 8]}>
          <coneGeometry args={[2.2, 3.5, 5]} />
          <meshStandardMaterial color="#071220" roughness={0.95} flatShading />
        </mesh>
        {/* Main Mast */}
        <mesh position={[-1.2, 5.5, 0]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.14, 0.22, 8.5, 6]} />
          <meshStandardMaterial color="#0A1626" roughness={0.9} flatShading />
        </mesh>
        {/* Mast Cross-Spar / Yardarm */}
        <mesh position={[-1.2, 7.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 4.2, 5]} />
          <meshStandardMaterial color="#0A1626" roughness={0.9} flatShading />
        </mesh>
        {/* Fore Mast */}
        <mesh position={[3.8, 4.5, 0]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.12, 0.18, 6.5, 6]} />
          <meshStandardMaterial color="#0A1626" roughness={0.9} flatShading />
        </mesh>
      </group>

      {/* ========================================================
          8. SWIMMING ANTARCTIC KRILL / BIOLUMINESCENT PARTICLES
          ======================================================== */}
      <points ref={krillPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[krillPositions, 3]}
            count={krillCount}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.25}
          color="#38BDF8"
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
