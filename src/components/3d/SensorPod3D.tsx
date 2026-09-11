import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';
import { getOceanHeight } from '../../sim/physics/oceanWaves';

export const SensorPod3D: React.FC = () => {
  const podGroup = useRef<THREE.Group>(null);
  const cableMesh = useRef<THREE.Mesh>(null);
  const bubblesGroup = useRef<THREE.Group>(null);
  const doLightRef = useRef<THREE.PointLight>(null);
  const leftHeadlightTarget = useRef<THREE.Object3D>(new THREE.Object3D());
  const rightHeadlightTarget = useRef<THREE.Object3D>(new THREE.Object3D());

  const vehicle = useSimulationStore((state) => state.vehicle);
  const pod = useSimulationStore((state) => state.pod);
  const env = useSimulationStore((state) => state.env);
  const openModal = useSimulationStore((state) => state.openModal);

  // Micro-bubbles pool for descent and sampling animation
  const bubbleCount = 14;
  const bubbleOffsets = useMemo(() => {
    return Array.from({ length: bubbleCount }, () => ({
      x: (Math.random() - 0.5) * 0.18,
      z: (Math.random() - 0.5) * 0.18,
      speed: 0.8 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      size: 0.015 + Math.random() * 0.02
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!podGroup.current) return;
    const t = clock.getElapsedTime();

    // 1. Calculate Water Surface at Winch Spool
    const waterY = getOceanHeight(vehicle.simX, vehicle.simZ - 0.65, t, env.waveHeightM);

    // 2. True Physical Depth (1 unit = 1 meter)
    const actualDepth = Math.max(0, pod.depthCurrentM);
    // When stowed, rests in cradle at waterY + 0.22m; when deployed, descends down to waterY - actualDepth
    const targetSimY = actualDepth === 0 ? waterY + 0.22 : waterY - actualDepth;

    // Hydrodynamic Drag Offset when Moving
    const speedRatio = vehicle.speedKnots / 3.5;
    const headingRad = (vehicle.headingDeg * Math.PI) / 180.0;
    const dragDistance = actualDepth > 0 ? Math.min(5.0, (actualDepth * 0.06) * speedRatio) : 0;
    const dragX = -Math.sin(headingRad) * dragDistance;
    const dragZ = -Math.cos(headingRad) * dragDistance;

    // Organic underwater fluid micro-sway
    const swayX = actualDepth > 0 ? Math.sin(t * 1.8 + actualDepth * 0.2) * 0.04 : 0;
    const swayZ = actualDepth > 0 ? Math.cos(t * 1.4 + actualDepth * 0.2) * 0.04 : 0;

    const targetPodX = vehicle.simX + dragX + swayX;
    const targetPodZ = vehicle.simZ - 0.65 + dragZ + swayZ;

    // Smooth horizontal and vertical interpolation
    podGroup.current.position.x = THREE.MathUtils.lerp(podGroup.current.position.x, targetPodX, 0.22);
    podGroup.current.position.z = THREE.MathUtils.lerp(podGroup.current.position.z, targetPodZ, 0.22);
    podGroup.current.position.y = THREE.MathUtils.lerp(podGroup.current.position.y, targetSimY, 0.20);

    // Hydrodynamic pitch & yaw stabilization
    if (vehicle.speedKnots > 0.1 && actualDepth > 0) {
      podGroup.current.rotation.x = THREE.MathUtils.lerp(
        podGroup.current.rotation.x,
        0.22 * (vehicle.speedKnots / 3.0),
        0.12
      );
      podGroup.current.rotation.y = THREE.MathUtils.lerp(
        podGroup.current.rotation.y,
        (-vehicle.headingDeg * Math.PI) / 180,
        0.1
      );
    } else {
      podGroup.current.rotation.x = THREE.MathUtils.lerp(podGroup.current.rotation.x, Math.sin(t * 1.2) * 0.03, 0.1);
      podGroup.current.rotation.z = THREE.MathUtils.lerp(podGroup.current.rotation.z, Math.cos(t * 1.0) * 0.03, 0.1);
    }

    // 3. Dynamic Winch Tether Line Rendering
    if (cableMesh.current) {
      const winchTop = new THREE.Vector3(vehicle.simX, waterY + 0.35, vehicle.simZ - 0.65);
      const podTop = podGroup.current.position.clone().add(new THREE.Vector3(0, 0.42, 0));
      const tetherVec = podTop.clone().sub(winchTop);
      const tetherLength = tetherVec.length();

      if (tetherLength > 0.05 && actualDepth > 0.05) {
        cableMesh.current.visible = true;
        cableMesh.current.scale.set(1, tetherLength, 1);
        cableMesh.current.position.copy(winchTop.clone().add(tetherVec.clone().multiplyScalar(0.5)));
        
        const axis = new THREE.Vector3(0, 1, 0);
        cableMesh.current.quaternion.setFromUnitVectors(axis, tetherVec.clone().normalize());
      } else {
        cableMesh.current.visible = false;
      }
    }

    // 4. Rising Micro-Bubbles Animation (Active when descending or sampling)
    if (bubblesGroup.current) {
      const isBubbling = actualDepth > 0.2 && (pod.status === 'LOWERING' || pod.activeSampling);
      bubblesGroup.current.visible = isBubbling;

      if (isBubbling) {
        bubblesGroup.current.children.forEach((child, i) => {
          const cfg = bubbleOffsets[i];
          const mesh = child as THREE.Mesh;
          const cycleTime = (t * cfg.speed + cfg.phase) % 1.8;
          mesh.position.y = cycleTime * 0.9;
          mesh.position.x = cfg.x + Math.sin(cycleTime * 4.0) * 0.02;
          mesh.position.z = cfg.z + Math.cos(cycleTime * 4.0) * 0.02;
          (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.7 - cycleTime * 0.35);
        });
      }
    }

    // 5. Pulsing DO Sensor Luminescence
    if (doLightRef.current) {
      doLightRef.current.intensity = pod.activeSampling ? 2.5 + Math.sin(t * 8.0) * 1.5 : 0.8;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    openModal('SENSOR_POD');
  };

  const isSubmerged = pod.depthCurrentM > 0.2;

  return (
    <>
      {/* High-Vis Kevlar Winch Tether with Reinforced Core */}
      <mesh ref={cableMesh}>
        <cylinderGeometry args={[0.016, 0.016, 1, 8]} />
        <meshStandardMaterial
          color="#FCA311"
          emissive="#FCA311"
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Sensor Pod Submersible Cluster */}
      <group
        ref={podGroup}
        onClick={handleClick}
        position={[vehicle.simX, 0.22, vehicle.simZ - 0.65]}
      >
        {/* Click Target Helper */}
        <mesh visible={false}>
          <cylinderGeometry args={[0.7, 0.7, 1.3, 8]} />
        </mesh>

        {/* Subsea Illumination: Twin High-CRI White/Cyan Headlights */}
        {isSubmerged && (
          <>
            <primitive object={leftHeadlightTarget.current} position={[-0.15, -1.8, 0.6]} />
            <primitive object={rightHeadlightTarget.current} position={[0.15, -1.8, 0.6]} />
            <spotLight
              position={[-0.14, -0.05, 0.12]}
              target={leftHeadlightTarget.current}
              angle={0.65}
              penumbra={0.5}
              intensity={pod.activeSampling ? 9.0 : 6.0}
              distance={24}
              color="#E0F2FE"
              castShadow
            />
            <spotLight
              position={[0.14, -0.05, 0.12]}
              target={rightHeadlightTarget.current}
              angle={0.65}
              penumbra={0.5}
              intensity={pod.activeSampling ? 9.0 : 6.0}
              distance={24}
              color="#38BDF8"
            />
            {/* Ambient Subsurface Glow */}
            <pointLight
              color="#FCA311"
              intensity={pod.activeSampling ? 5.0 : 2.5}
              distance={14}
              decay={2.0}
            />
          </>
        )}

        {/* --- MECHANICAL CTD HOUSING & CAGE --- */}
        {/* Main Titanium Pressure Hull (Grade 5 Titanium) */}
        <mesh castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.65, 24]} />
          <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Heavy Ballast Lead Shoe / Hydrodynamic Nose Cone */}
        <mesh position={[0, -0.38, 0]}>
          <coneGeometry args={[0.14, 0.18, 20]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.95} roughness={0.15} />
        </mesh>

        {/* Top Winch Bridle & Shackle Eyelet */}
        <group position={[0, 0.38, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.045, 0.012, 12, 16]} />
            <meshStandardMaterial color="#FCA311" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* Stainless Steel Tubular Protective Cage (4 Corner Rods) */}
        <group>
          {/* Top Guard Ring */}
          <mesh position={[0, 0.30, 0]}>
            <torusGeometry args={[0.19, 0.015, 12, 24]} />
            <meshStandardMaterial color="#FCA311" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Middle Guard Ring */}
          <mesh position={[0, -0.05, 0]}>
            <torusGeometry args={[0.19, 0.015, 12, 24]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Bottom Guard Ring */}
          <mesh position={[0, -0.32, 0]}>
            <torusGeometry args={[0.19, 0.018, 12, 24]} />
            <meshStandardMaterial color="#FCA311" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* 4 Vertical Cage Rods */}
          <mesh position={[0.18, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.68, 8]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[-0.18, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.68, 8]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.18]}>
            <cylinderGeometry args={[0.012, 0.012, 0.68, 8]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, -0.18]}>
            <cylinderGeometry args={[0.012, 0.012, 0.68, 8]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>

        {/* Hydrodynamic Stabilizer Tail Fins */}
        <group position={[0, 0.18, -0.15]}>
          <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[0.012, 0.22, 0.16]} />
            <meshStandardMaterial color="#FCA311" roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.012, 0.32, 0.16]} />
            <meshStandardMaterial color="#FCA311" roughness={0.3} metalness={0.6} />
          </mesh>
        </group>

        {/* --- CTD SCIENTIFIC SENSOR NODES --- */}
        {/* 1. Dissolved Oxygen Optical Sensor Cap with Amber Luminescence */}
        <group position={[0.13, -0.12, 0.06]} rotation={[0, 0, -Math.PI / 3]}>
          <mesh>
            <cylinderGeometry args={[0.035, 0.035, 0.08, 16]} />
            <meshStandardMaterial
              color="#FCA311"
              emissive="#FCA311"
              emissiveIntensity={pod.activeSampling ? 3.5 : 1.2}
            />
          </mesh>
          <pointLight
            ref={doLightRef}
            color="#FCA311"
            intensity={1.5}
            distance={1.5}
          />
        </group>

        {/* 2. Turbidity Optical Backscatter Flasher */}
        <mesh position={[-0.13, -0.12, 0.06]} rotation={[0, 0, Math.PI / 3]}>
          <cylinderGeometry args={[0.035, 0.035, 0.08, 16]} />
          <meshStandardMaterial
            color="#38BDF8"
            emissive="#38BDF8"
            emissiveIntensity={pod.activeSampling ? 3.2 : 0.9}
          />
        </mesh>

        {/* 3. Central CTD Flow-Through Conductivity Duct & Needle Thermistor */}
        <group position={[0, -0.22, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
          {/* Outer Duct */}
          <mesh>
            <cylinderGeometry args={[0.038, 0.038, 0.12, 16, 1, true]} />
            <meshStandardMaterial color="#0F172A" metalness={0.9} side={THREE.DoubleSide} />
          </mesh>
          {/* Inner Needle Probe */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.008, 0.004, 0.10, 8]} />
            <meshStandardMaterial color="#E11D48" metalness={0.9} emissive="#E11D48" emissiveIntensity={0.6} />
          </mesh>
        </group>

        {/* 4. Bar30 Pressure Transducer Port */}
        <mesh position={[0, 0.12, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 12]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} />
        </mesh>

        {/* --- DYNAMIC RISING MICRO-BUBBLES POOL --- */}
        <group ref={bubblesGroup} position={[0, 0.1, 0]}>
          {bubbleOffsets.map((cfg, i) => (
            <mesh key={i} position={[cfg.x, 0, cfg.z]}>
              <sphereGeometry args={[cfg.size, 8, 8]} />
              <meshBasicMaterial color="#E0F2FE" transparent opacity={0.6} />
            </mesh>
          ))}
        </group>

        {/* Subsurface 3D Telemetry Billboard */}
        {isSubmerged && (
          <group position={[0.38, 0.05, 0]}>
            <Text
              fontSize={0.22}
              color="#FCA311"
              anchorX="left"
              anchorY="middle"
              outlineWidth={0.022}
              outlineColor="#020617"
            >
              {`▼ ${pod.depthCurrentM.toFixed(1)}m | ${pod.status}`}
            </Text>
          </group>
        )}
      </group>
    </>
  );
};
