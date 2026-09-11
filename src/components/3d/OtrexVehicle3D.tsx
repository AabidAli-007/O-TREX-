import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';
import { getCatamaranBuoyancy } from '../../sim/physics/oceanWaves';

export const OtrexVehicle3D: React.FC = () => {
  const vehicleGroup = useRef<THREE.Group>(null);
  const leftThrusterGroupRef = useRef<THREE.Group>(null);
  const rightThrusterGroupRef = useRef<THREE.Group>(null);
  const leftPropRef = useRef<THREE.Group>(null);
  const rightPropRef = useRef<THREE.Group>(null);
  const wakePortRef = useRef<THREE.Mesh>(null);
  const wakeStarboardRef = useRef<THREE.Mesh>(null);
  const roosterTailRef = useRef<THREE.Mesh>(null);
  const bowSprayPortRef = useRef<THREE.Group>(null);
  const bowSprayStbdRef = useRef<THREE.Group>(null);
  const anemometerRef = useRef<THREE.Group>(null);
  const strobeRef = useRef<THREE.MeshStandardMaterial>(null);

  const vehicle = useSimulationStore((state) => state.vehicle);
  const env = useSimulationStore((state) => state.env);
  const missionState = useSimulationStore((state) => state.missionState);
  const selectHardware = useSimulationStore((state) => state.selectHardware);
  const openModal = useSimulationStore((state) => state.openModal);

  useFrame(({ clock }) => {
    if (!vehicleGroup.current) return;
    const t = clock.getElapsedTime();

    // 1. Exact Analytical Ocean Surface Waterline & Wave Tilt
    const buoyancy = getCatamaranBuoyancy(
      vehicle.simX,
      vehicle.simZ,
      vehicle.headingDeg,
      t,
      env.waveHeightM
    );

    // Smooth horizontal position interpolation
    vehicleGroup.current.position.x = THREE.MathUtils.lerp(
      vehicleGroup.current.position.x,
      vehicle.simX,
      0.22
    );
    vehicleGroup.current.position.z = THREE.MathUtils.lerp(
      vehicleGroup.current.position.z,
      vehicle.simZ,
      0.22
    );

    // 2. Physical Waterline Placement (Zero Clipping)
    const targetY = buoyancy.waterlineY + 0.08;
    vehicleGroup.current.position.y = THREE.MathUtils.lerp(
      vehicleGroup.current.position.y,
      targetY,
      0.25
    );

    // 3. Dynamic Wave Slope + Rudder Lean + Acceleration Tilt
    vehicleGroup.current.rotation.y = (-vehicle.headingDeg * Math.PI) / 180;
    vehicleGroup.current.rotation.x = THREE.MathUtils.lerp(
      vehicleGroup.current.rotation.x,
      (vehicle.pitchDeg * Math.PI) / 180,
      0.2
    );
    vehicleGroup.current.rotation.z = THREE.MathUtils.lerp(
      vehicleGroup.current.rotation.z,
      (vehicle.rollDeg * Math.PI) / 180,
      0.2
    );

    // 4. Dynamic Azimuth Thruster Steering Articulation (Swiveling Nacelles)
    const targetSteerRad = (-vehicle.rudderPct / 100.0) * 0.40;
    if (leftThrusterGroupRef.current) {
      leftThrusterGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        leftThrusterGroupRef.current.rotation.y,
        targetSteerRad,
        0.18
      );
    }
    if (rightThrusterGroupRef.current) {
      rightThrusterGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        rightThrusterGroupRef.current.rotation.y,
        targetSteerRad,
        0.18
      );
    }

    // 5. 3-Bladed Propeller High-RPM Spin & Differential Drive
    const speedRatio = Math.max(0, Math.min(1.2, Math.abs(vehicle.speedKnots) / 3.5));
    const spinDirection = vehicle.speedKnots >= 0 ? 1 : -1;
    const propSpin = t * Math.max(1.5, Math.abs(vehicle.speedKnots)) * 28 * spinDirection;

    const diff = (vehicle.rudderPct / 100.0) * 0.25;
    if (leftPropRef.current) {
      leftPropRef.current.rotation.z = propSpin * (1 + diff);
    }
    if (rightPropRef.current) {
      rightPropRef.current.rotation.z = -propSpin * (1 - diff);
    }

    // 6. Dynamic Bow Wave-Piercing Spray Plumes
    const isMovingForward = vehicle.speedKnots > 0.4;
    const sprayScale = isMovingForward ? THREE.MathUtils.clamp(speedRatio * 1.4, 0.2, 1.6) : 0;

    if (bowSprayPortRef.current) {
      bowSprayPortRef.current.visible = isMovingForward;
      bowSprayPortRef.current.scale.set(sprayScale, sprayScale, sprayScale * (1 + Math.sin(t * 12) * 0.15));
      bowSprayPortRef.current.rotation.z = Math.sin(t * 8) * 0.1 - 0.2;
    }
    if (bowSprayStbdRef.current) {
      bowSprayStbdRef.current.visible = isMovingForward;
      bowSprayStbdRef.current.scale.set(sprayScale, sprayScale, sprayScale * (1 + Math.cos(t * 12) * 0.15));
      bowSprayStbdRef.current.rotation.z = Math.cos(t * 8) * 0.1 + 0.2;
    }

    // 7. Dynamic Hydrodynamic Stern Wake & Kelvin Wedge
    const wakeLength = 1.2 + speedRatio * 4.2;
    const wakeWidth = 0.35 + speedRatio * 0.55;
    const wakeOpacity = isMovingForward ? THREE.MathUtils.clamp(speedRatio * 0.7, 0, 0.65) : 0;

    if (wakePortRef.current) {
      wakePortRef.current.visible = isMovingForward;
      wakePortRef.current.scale.set(wakeWidth, wakeLength, 1);
      (wakePortRef.current.material as THREE.MeshBasicMaterial).opacity = wakeOpacity;
    }
    if (wakeStarboardRef.current) {
      wakeStarboardRef.current.visible = isMovingForward;
      wakeStarboardRef.current.scale.set(wakeWidth, wakeLength, 1);
      (wakeStarboardRef.current.material as THREE.MeshBasicMaterial).opacity = wakeOpacity;
    }

    if (roosterTailRef.current) {
      const showRooster = vehicle.speedKnots > 2.2;
      roosterTailRef.current.visible = showRooster;
      if (showRooster) {
        const rRatio = (vehicle.speedKnots - 2.2) / 2.0;
        roosterTailRef.current.scale.set(0.6 + rRatio * 0.5, 1.8 + rRatio * 2.2, 1);
        (roosterTailRef.current.material as THREE.MeshBasicMaterial).opacity = rRatio * 0.6;
      }
    }

    // 8. Spinning Meteorological 3-Cup Anemometer
    if (anemometerRef.current) {
      const windApparent = (env.windSpeedMs + Math.abs(vehicle.speedKnots) * 0.514);
      anemometerRef.current.rotation.y += windApparent * 0.05 + 0.04;
    }

    // 9. Pulsing Communication Beacon LED
    if (strobeRef.current) {
      const pulse = Math.sin(t * 5.0) > 0.4 ? 3.5 : 0.8;
      strobeRef.current.emissiveIntensity = pulse;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    selectHardware('pixhawk');
    openModal('HARDWARE');
  };

  return (
    <group ref={vehicleGroup} onClick={handleClick} position={[vehicle.simX, 0, vehicle.simZ]}>
      {/* Click Boundary Target */}
      <mesh visible={false}>
        <boxGeometry args={[3.8, 2.5, 3.8]} />
      </mesh>

      {/* PORT (LEFT) HULL & DYNAMIC AZIMUTH THRUSTER ASSEMBLY */}
      <group position={[-0.85, -0.05, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.36, 0.42, 2.2]} />
          <meshStandardMaterial color="#FCA311" roughness={0.25} metalness={0.25} />
        </mesh>

        <mesh position={[0, 0, 1.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.22, 0.65, 18]} />
          <meshStandardMaterial color="#E5E5E5" roughness={0.3} metalness={0.5} />
        </mesh>

        <group ref={bowSprayPortRef} position={[-0.1, -0.05, 1.35]}>
          <mesh rotation={[-Math.PI / 3, -0.3, 0]}>
            <coneGeometry args={[0.22, 0.65, 12]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
          </mesh>
          <mesh position={[-0.12, 0.05, -0.1]} rotation={[-Math.PI / 4, -0.5, 0]}>
            <planeGeometry args={[0.35, 0.55]} />
            <meshBasicMaterial color="#E0F2FE" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>

        <group ref={leftThrusterGroupRef} position={[0, -0.18, -1.1]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.18, 12]} />
            <meshStandardMaterial color="#14213D" metalness={0.9} roughness={0.2} />
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.085, 0.085, 0.36, 16]} />
            <meshStandardMaterial color="#14213D" metalness={0.85} roughness={0.25} />
          </mesh>

          <mesh position={[0, 0, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.14, 0.14, 16, 1, true]} />
            <meshStandardMaterial color="#0A1128" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>

          <group ref={leftPropRef} position={[0, 0, -0.18]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.04, 0.09, 12]} />
              <meshStandardMaterial color="#E5E5E5" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh rotation={[0, 0, 0]}>
              <boxGeometry args={[0.04, 0.22, 0.015]} />
              <meshStandardMaterial color="#D1D5DB" metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh rotation={[0, 0, 2.094]}>
              <boxGeometry args={[0.04, 0.22, 0.015]} />
              <meshStandardMaterial color="#D1D5DB" metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh rotation={[0, 0, 4.188]}>
              <boxGeometry args={[0.04, 0.22, 0.015]} />
              <meshStandardMaterial color="#D1D5DB" metalness={0.9} roughness={0.15} />
            </mesh>
          </group>

          <mesh position={[0, 0, -0.6]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.24, 0.8]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.45} />
          </mesh>
        </group>

        <mesh ref={wakePortRef} position={[-0.05, -0.1, -2.1]} rotation={[-Math.PI / 2, 0, -0.06]}>
          <planeGeometry args={[0.42, 2.2]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* STARBOARD (RIGHT) HULL & DYNAMIC AZIMUTH THRUSTER ASSEMBLY */}
      <group position={[0.85, -0.05, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.36, 0.42, 2.2]} />
          <meshStandardMaterial color="#FCA311" roughness={0.25} metalness={0.25} />
        </mesh>

        <mesh position={[0, 0, 1.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.22, 0.65, 18]} />
          <meshStandardMaterial color="#E5E5E5" roughness={0.3} metalness={0.5} />
        </mesh>

        <group ref={bowSprayStbdRef} position={[0.1, -0.05, 1.35]}>
          <mesh rotation={[-Math.PI / 3, 0.3, 0]}>
            <coneGeometry args={[0.22, 0.65, 12]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
          </mesh>
          <mesh position={[0.12, 0.05, -0.1]} rotation={[-Math.PI / 4, 0.5, 0]}>
            <planeGeometry args={[0.35, 0.55]} />
            <meshBasicMaterial color="#E0F2FE" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>

        <group ref={rightThrusterGroupRef} position={[0, -0.18, -1.1]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.18, 12]} />
            <meshStandardMaterial color="#14213D" metalness={0.9} roughness={0.2} />
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.085, 0.085, 0.36, 16]} />
            <meshStandardMaterial color="#14213D" metalness={0.85} roughness={0.25} />
          </mesh>

          <mesh position={[0, 0, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.14, 0.14, 16, 1, true]} />
            <meshStandardMaterial color="#0A1128" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>

          <group ref={rightPropRef} position={[0, 0, -0.18]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.04, 0.09, 12]} />
              <meshStandardMaterial color="#E5E5E5" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh rotation={[0, 0, 0]}>
              <boxGeometry args={[0.04, 0.22, 0.015]} />
              <meshStandardMaterial color="#D1D5DB" metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh rotation={[0, 0, 2.094]}>
              <boxGeometry args={[0.04, 0.22, 0.015]} />
              <meshStandardMaterial color="#D1D5DB" metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh rotation={[0, 0, 4.188]}>
              <boxGeometry args={[0.04, 0.22, 0.015]} />
              <meshStandardMaterial color="#D1D5DB" metalness={0.9} roughness={0.15} />
            </mesh>
          </group>

          <mesh position={[0, 0, -0.6]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.24, 0.8]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.45} />
          </mesh>
        </group>

        <mesh ref={wakeStarboardRef} position={[0.05, -0.1, -2.1]} rotation={[-Math.PI / 2, 0, 0.06]}>
          <planeGeometry args={[0.42, 2.2]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Central Inter-Hull Rooster Tail */}
      <mesh ref={roosterTailRef} position={[0, -0.08, -2.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 2.8]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.35} />
      </mesh>

      {/* CENTRAL CROSSBEAMS & DECK PLATFORM */}
      <mesh position={[0, 0.12, 0.65]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.9, 16]} />
        <meshStandardMaterial color="#14213D" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.12, -0.65]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.9, 16]} />
        <meshStandardMaterial color="#14213D" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.45, 0.08, 1.6]} />
        <meshStandardMaterial color="#14213D" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Solar Panel Array */}
      <group position={[0, 0.23, 0.15]}>
        <mesh position={[0, -0.005, 0]}>
          <boxGeometry args={[1.38, 0.02, 1.14]} />
          <meshStandardMaterial color="#FCA311" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh>
          <boxGeometry args={[1.34, 0.022, 1.1]} />
          <meshStandardMaterial color="#0A1128" metalness={0.92} roughness={0.08} />
        </mesh>
      </group>

      {/* Navigation Lights */}
      <mesh position={[-0.85, 0.22, 1.05]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={3.5} />
      </mesh>
      <mesh position={[0.85, 0.22, 1.05]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={3.5} />
      </mesh>
      <mesh position={[0, 0.32, -1.0]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={3.0} />
      </mesh>

      {/* Avionics Capsule */}
      <mesh position={[0, 0.35, -0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 1.1, 24]} />
        <meshStandardMaterial color="#E5E5E5" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Central Winch Spool */}
      <group position={[0, 0.32, -0.65]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.45, 20]} />
          <meshStandardMaterial color="#FCA311" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.38, 20]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
        </mesh>
      </group>

      {/* Mast with Rotating 3-Cup Anemometer & Antennas */}
      <group position={[0, 0.7, 0.55]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.03, 0.04, 0.95, 16]} />
          <meshStandardMaterial color="#14213D" roughness={0.3} metalness={0.8} />
        </mesh>

        <group ref={anemometerRef} position={[0, 0.58, 0]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.06, 12]} />
            <meshStandardMaterial color="#E5E5E5" metalness={0.8} />
          </mesh>
          <group rotation={[0, 0, 0]}>
            <mesh position={[0.07, 0, 0]}>
              <sphereGeometry args={[0.025, 8, 8, 0, Math.PI]} />
              <meshStandardMaterial color="#FCA311" roughness={0.3} />
            </mesh>
          </group>
          <group rotation={[0, 2.094, 0]}>
            <mesh position={[0.07, 0, 0]}>
              <sphereGeometry args={[0.025, 8, 8, 0, Math.PI]} />
              <meshStandardMaterial color="#FCA311" roughness={0.3} />
            </mesh>
          </group>
          <group rotation={[0, 4.188, 0]}>
            <mesh position={[0.07, 0, 0]}>
              <sphereGeometry args={[0.025, 8, 8, 0, Math.PI]} />
              <meshStandardMaterial color="#FCA311" roughness={0.3} />
            </mesh>
          </group>
        </group>

        <mesh position={[0, 0.50, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.1, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </mesh>
        <mesh position={[0.22, 0.35, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#FCA311" roughness={0.3} />
        </mesh>
        <mesh position={[-0.22, 0.45, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.45, 8]} />
          <meshStandardMaterial color="#E5E5E5" metalness={0.9} />
        </mesh>
      </group>

      {/* Strobe LED */}
      <mesh position={[0, 1.32, 0.55]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial
          ref={strobeRef}
          color={missionState.includes('ANOMALY') ? '#EF4444' : '#FCA311'}
          emissive={missionState.includes('ANOMALY') ? '#EF4444' : '#FCA311'}
          emissiveIntensity={2.5}
        />
      </mesh>

      <Text
        position={[0, 0.28, 0.7]}
        rotation={[-Math.PI / 4, 0, 0]}
        fontSize={0.16}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        O-TREX
      </Text>
    </group>
  );
};
