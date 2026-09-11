import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';
import { OceanSurface } from './OceanSurface';
import { OtrexVehicle3D } from './OtrexVehicle3D';
import { SensorPod3D } from './SensorPod3D';
import { MarineSnow3D } from './MarineSnow3D';
import { Competitors3D } from './Competitors3D';
import { CurrentVectors3D } from './CurrentVectors3D';
import { AnomalyZone3D } from './AnomalyZone3D';
import { UnderwaterEnvironment3D } from './UnderwaterEnvironment3D';
import { OceanClouds3D } from './OceanClouds3D';

const CameraController: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const vehicle = useSimulationStore((state) => state.vehicle);
  const pod = useSimulationStore((state) => state.pod);
  const cameraMode = useSimulationStore((state) => state.cameraMode);

  const isUnderwater = cameraMode === 'UNDERWATER_POD';
  const prevVehicleTarget = useRef<THREE.Vector3 | null>(null);
  const prevCameraMode = useRef<string>(cameraMode);
  const isInteracting = useRef<boolean>(false);
  const transitionProgress = useRef<number>(1.0);
  const startCamPos = useRef<THREE.Vector3>(new THREE.Vector3());

  // Listen for user interaction on OrbitControls to grant immediate 360-degree manual authority
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onStart = () => {
      isInteracting.current = true;
      transitionProgress.current = 1.0; // Stop automatic preset interpolation immediately
    };
    const onEnd = () => {
      setTimeout(() => {
        isInteracting.current = false;
      }, 350);
    };

    controls.addEventListener('start', onStart);
    controls.addEventListener('end', onEnd);
    return () => {
      controls.removeEventListener('start', onStart);
      controls.removeEventListener('end', onEnd);
    };
  }, []);

  // When cameraMode changes, trigger a smooth transition to that preset view
  useEffect(() => {
    if (prevCameraMode.current !== cameraMode) {
      prevCameraMode.current = cameraMode;
      transitionProgress.current = 0.0;
      startCamPos.current.copy(camera.position);
    }
  }, [cameraMode, camera]);

  useFrame((_, delta) => {
    const headingRad = (vehicle.headingDeg * Math.PI) / 180.0;

    // 1. Desired focus point (vehicle on surface, or pod when underwater)
    const currentTarget = isUnderwater
      ? new THREE.Vector3(vehicle.simX, -Math.max(0.6, pod.depthCurrentM) - 0.1, vehicle.simZ - 0.65)
      : new THREE.Vector3(vehicle.simX, 0.4, vehicle.simZ);

    if (!prevVehicleTarget.current) {
      prevVehicleTarget.current = currentTarget.clone();
      if (controlsRef.current) {
        controlsRef.current.target.copy(currentTarget);
      }
    }

    // 2. Translation offset as vessel/pod moves in the ocean
    const deltaTarget = currentTarget.clone().sub(prevVehicleTarget.current);
    prevVehicleTarget.current.copy(currentTarget);

    if (controlsRef.current) {
      // Translate both target and camera simultaneously by deltaTarget
      // This ensures the user's manual 360° mouse orbit angles and distance are 100% PRESERVED!
      controlsRef.current.target.add(deltaTarget);
      camera.position.add(deltaTarget);
    }

    // 3. Preset animation when switching camera view modes
    if (transitionProgress.current < 1.0 && !isInteracting.current) {
      transitionProgress.current = Math.min(1.0, transitionProgress.current + delta * 2.5);
      const ease = THREE.MathUtils.smoothstep(transitionProgress.current, 0, 1);

      let offset = new THREE.Vector3();
      if (cameraMode === 'FOLLOW') {
        offset.set(-Math.sin(headingRad) * 4.6, 1.8, -Math.cos(headingRad) * 4.6);
      } else if (cameraMode === 'UNDERWATER_POD') {
        offset.set(-Math.sin(headingRad) * 1.85, 0.52, -Math.cos(headingRad) * 1.85);
      } else if (cameraMode === 'HARDWARE') {
        offset.set(Math.sin(headingRad) * 0.85, 0.45, Math.cos(headingRad) * 0.85);
      } else if (cameraMode === 'TOP_DOWN') {
        offset.set(0, 38.0, 0.1);
      } else if (cameraMode === 'SIDE') {
        offset.set(Math.cos(headingRad) * 4.8, 0.95, -Math.sin(headingRad) * 4.8);
      } else {
        // FREE / ORBIT: maintain current relative position
        offset.copy(camera.position).sub(currentTarget);
      }

      const desiredPos = currentTarget.clone().add(offset);
      camera.position.lerpVectors(startCamPos.current, desiredPos, ease);
    }

    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      enableDamping={true}
      dampingFactor={0.08}
      rotateSpeed={0.9}
      zoomSpeed={1.0}
      panSpeed={0.8}
      maxPolarAngle={isUnderwater ? Math.PI - 0.05 : Math.PI * 0.495}
      minPolarAngle={0.05}
      minDistance={0.5}
      maxDistance={400}
    />
  );
};

export const OceanCanvas: React.FC = () => {
  const env = useSimulationStore((state) => state.env);
  const cameraMode = useSimulationStore((state) => state.cameraMode);
  const setCameraMode = useSimulationStore((state) => state.setCameraMode);

  const isUnderwater = cameraMode === 'UNDERWATER_POD';

  return (
    <div className="w-full h-full relative bg-dark-900 overflow-hidden">
      {/* Floating 360-degree Mouse Control Badge */}
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-navy-950/85 backdrop-blur-md border border-navy-700/80 px-2.5 py-1 rounded-lg text-[9.5px] font-mono text-cyan-300 shadow-xl pointer-events-none select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        <span className="font-bold">🖱️ DRAG = 360° ROTATE</span>
        <span className="text-gray-400">| SCROLL = ZOOM</span>
      </div>

      {/* Floating 3D Camera Mode HUD */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-navy-950/85 backdrop-blur-md border border-navy-700/80 p-1 rounded-lg text-[10px] font-mono shadow-xl select-none">
        <span className="text-gray-400 px-1 font-sans text-[9px]">CAM:</span>
        <button
          onClick={() => setCameraMode('FOLLOW')}
          className={`px-2 py-1 rounded font-bold transition-colors ${
            cameraMode === 'FOLLOW'
              ? 'bg-orange-500 text-navy-950 shadow-sm'
              : 'text-gray-300 hover:text-white hover:bg-navy-800'
          }`}
          title="3rd-person Chase Hero View"
        >
          CHASE
        </button>
        <button
          onClick={() => setCameraMode('HARDWARE')}
          className={`px-2 py-1 rounded font-bold transition-colors ${
            cameraMode === 'HARDWARE'
              ? 'bg-orange-500 text-navy-950 shadow-sm'
              : 'text-gray-300 hover:text-white hover:bg-navy-800'
          }`}
          title="Forward Bow Deck View"
        >
          DECK
        </button>
        <button
          onClick={() => setCameraMode('UNDERWATER_POD')}
          className={`px-2 py-1 rounded font-bold transition-colors flex items-center gap-1 ${
            cameraMode === 'UNDERWATER_POD'
              ? 'bg-cyan-500 text-navy-950 shadow-sm'
              : 'text-cyan-300 hover:text-white hover:bg-navy-800'
          }`}
          title="Underwater Sensor Pod Tracking View"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>POD CAM</span>
        </button>
        <button
          onClick={() => setCameraMode('FREE')}
          className={`px-2 py-1 rounded font-bold transition-colors ${
            cameraMode === 'FREE'
              ? 'bg-orange-500 text-navy-950 shadow-sm'
              : 'text-gray-300 hover:text-white hover:bg-navy-800'
          }`}
          title="Free 360 Orbit View (Drag with mouse)"
        >
          ORBIT
        </button>
        <button
          onClick={() => setCameraMode('TOP_DOWN')}
          className={`px-2 py-1 rounded font-bold transition-colors ${
            cameraMode === 'TOP_DOWN'
              ? 'bg-orange-500 text-navy-950 shadow-sm'
              : 'text-gray-300 hover:text-white hover:bg-navy-800'
          }`}
          title="High Altitude Satellite View"
        >
          TOP
        </button>
      </div>

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 4.0, -8.5], fov: 50, near: 0.1, far: 4500 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isUnderwater ? 1.4 : 1.15
        }}
      >
        <CameraController />

        {/* Dynamic Atmosphere & Sky Dome / Underwater Volumetric Fog */}
        {isUnderwater ? (
          <>
            {/* Deep Ocean Volumetric Fog and Background */}
            <color attach="background" args={[env.hasIceFloes ? '#021020' : '#031728']} />
            <fog attach="fog" args={[env.hasIceFloes ? '#021020' : '#031728', 0.5, 38.0]} />
            {/* Downward Penetrating Sun Rays into Deep Water */}
            <directionalLight position={[0, 45, 0]} intensity={1.8} color="#38BDF8" />
            <ambientLight intensity={0.9} color="#0E3854" />
          </>
        ) : env.scenarioId === 'POLAR_OCEAN' ? (
          <>
            <color attach="background" args={['#08101E']} />
            <fog attach="fog" args={['#08101E', 30, 2400]} />
            <Sky
              distance={450000}
              sunPosition={[80, 22, 120]}
              inclination={0.15}
              azimuth={0.25}
              mieCoefficient={0.005}
              rayleigh={2.2}
              turbidity={6}
            />
            <Stars radius={300} depth={80} count={3500} factor={4} saturation={0} fade speed={1} />
            <ambientLight intensity={0.65} color="#E5E5E5" />
            <directionalLight
              position={[60, 80, 60]}
              intensity={1.65}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-near={0.5}
              shadow-camera-far={300}
              shadow-camera-left={-50}
              shadow-camera-right={50}
              shadow-camera-top={50}
              shadow-camera-bottom={-50}
              color="#FFF8E7"
            />
            <directionalLight position={[-30, -50, -30]} intensity={0.65} color="#0E3854" />
          </>
        ) : (
          <>
            <color attach="background" args={['#0E1726']} />
            <fog attach="fog" args={['#0E1726', 45, 2600]} />
            <Sky
              distance={450000}
              sunPosition={[120, 60, 100]}
              inclination={0.55}
              azimuth={0.1}
              mieCoefficient={0.003}
              rayleigh={1.2}
              turbidity={4}
            />
            <ambientLight intensity={0.65} color="#E5E5E5" />
            <directionalLight
              position={[60, 80, 60]}
              intensity={1.65}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-near={0.5}
              shadow-camera-far={300}
              shadow-camera-left={-50}
              shadow-camera-right={50}
              shadow-camera-top={50}
              shadow-camera-bottom={-50}
              color="#FFF8E7"
            />
            <directionalLight position={[-30, -50, -30]} intensity={0.65} color="#0E3854" />
          </>
        )}

        {/* 3D Open-World Simulation Elements */}
        <OceanClouds3D />
        <UnderwaterEnvironment3D />
        <OceanSurface waveHeight={env.waveHeightM} hasIceFloes={env.hasIceFloes} />
        <CurrentVectors3D
          currentSpeedKnots={env.currentSpeedKnots}
          currentDirectionDeg={env.currentDirectionDeg}
          hasIceFloes={env.hasIceFloes}
        />
        <AnomalyZone3D anomalyRegion={env.anomalyRegion} />
        <MarineSnow3D />
        <OtrexVehicle3D />
        <SensorPod3D />
        <Competitors3D />
      </Canvas>
    </div>
  );
};
