import { PodState, SensorReading, EnvironmentState } from '../../types/simulation';
import { calculateOceanPointProperties } from '../models/oceanModel';

export function updatePodKinematics(
  pod: PodState,
  vehicleSimX: number,
  vehicleSimZ: number,
  env: EnvironmentState,
  deltaSec: number,
  sensorDrift = 0
): { nextPodState: PodState; newReading: SensorReading | null } {
  let depth = pod.depthCurrentM;
  let status = pod.status;
  let winchSpeed = pod.winchSpeedMps;
  let newReading: SensorReading | null = null;
  const targetDepth = Math.min(pod.maxWinchDepthM, Math.max(0, pod.depthTargetM));

  if (status === 'DEPLOYING' || status === 'LOWERING') {
    winchSpeed = 2.4; // m/s descent
    depth += winchSpeed * deltaSec;

    // Collect profile reading progressively every ~2.0m during descent
    const lastSampledDepth = pod.verticalProfilePoints.length > 0
      ? pod.verticalProfilePoints[pod.verticalProfilePoints.length - 1].depthM
      : -10;

    if (depth - lastSampledDepth >= 2.0 || depth >= targetDepth) {
      const props = calculateOceanPointProperties(
        vehicleSimX,
        vehicleSimZ,
        depth,
        env,
        sensorDrift
      );
      newReading = {
        id: `prof-${Date.now()}-${Math.floor(depth * 10)}`,
        timestamp: Date.now(),
        ...props
      };
    }

    if (depth >= targetDepth) {
      depth = targetDepth;
      status = 'PROFILING';
      winchSpeed = 0;
    }
  } else if (status === 'HOLDING_DEPTH') {
    winchSpeed = 0;
  } else if (status === 'PROFILING') {
    winchSpeed = 0;
    // Station sampling at target depth
    if (Math.random() < 0.15) {
      const props = calculateOceanPointProperties(
        vehicleSimX,
        vehicleSimZ,
        depth,
        env,
        sensorDrift
      );
      newReading = {
        id: `prof-${Date.now()}-${Math.floor(depth * 10)}`,
        timestamp: Date.now(),
        ...props
      };
    }
  } else if (status === 'RETRACTING') {
    winchSpeed = -3.5; // m/s retrieval
    depth += winchSpeed * deltaSec;

    if (depth <= 0.2) {
      depth = 0;
      status = 'RECOVERED';
      winchSpeed = 0;
    }
  } else if (status === 'RECOVERED') {
    depth = 0;
    winchSpeed = 0;
  }

  // Calculate Cable Tension (N): Pod submerged weight (~14.5N) + Hydrodynamic Drag + Tether weight (0.04 N/m)
  const tetherWeight = depth * 0.04;
  const podInWaterWeight = 14.5; // N
  const dragForce = 0.5 * 1025 * 0.015 * 0.8 * Math.pow(Math.abs(winchSpeed) + 0.1, 2);
  const cableTensionN = Number(
    (status === 'RECOVERED' || status === 'READY'
      ? 0.0
      : podInWaterWeight + tetherWeight + dragForce).toFixed(1)
  );

  const updatedProfilePoints = newReading
    ? [...pod.verticalProfilePoints, newReading].slice(-60)
    : pod.verticalProfilePoints;

  return {
    nextPodState: {
      ...pod,
      depthCurrentM: Number(depth.toFixed(2)),
      status,
      winchSpeedMps: winchSpeed,
      cableTensionN,
      tetherLengthM: Number(depth.toFixed(1)),
      activeSampling: status === 'PROFILING' || status === 'DEPLOYING' || status === 'LOWERING' || status === 'HOLDING_DEPTH',
      verticalProfilePoints: updatedProfilePoints
    },
    newReading
  };
}
