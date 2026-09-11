import { VehicleState, Waypoint, EnvironmentState, KeyboardState } from '../../types/simulation';
import { getCatamaranBuoyancy } from './oceanWaves';

export function updateVesselPhysics(
  vehicle: VehicleState,
  waypoints: Waypoint[],
  env: EnvironmentState,
  deltaSec: number,
  simulationTime: number,
  keys: KeyboardState
): VehicleState {
  let targetHeading = vehicle.targetHeadingDeg;
  let targetSpeed = vehicle.targetSpeedKnots;
  let throttlePct = 0;
  let rudderPct = 0;

  const isManual = vehicle.controlMode === 'MANUAL' || keys.w || keys.s || keys.a || keys.d || keys.space;

  // 1. Emergency Stop Check
  if (vehicle.emergencyStop || keys.space) {
    targetSpeed = 0;
    const brakedSpeed = Math.max(0, vehicle.speedKnots - 4.5 * deltaSec);
    return {
      ...vehicle,
      speedKnots: Number(brakedSpeed.toFixed(2)),
      targetSpeedKnots: 0,
      throttlePct: 0,
      rudderPct: 0,
      motorPowerW: 0,
      emergencyStop: true
    };
  }

  if (isManual) {
    // MANUAL WASD CONTROL LOGIC
    // Base max speed: 4.2 knots, Boost: 6.5 knots
    const maxForward = keys.shift ? 6.5 : 4.2;
    const maxReverse = -2.0;

    if (keys.w) {
      throttlePct = keys.shift ? 100 : 75;
      targetSpeed = maxForward;
    } else if (keys.s) {
      throttlePct = -60;
      targetSpeed = maxReverse;
    } else {
      // Natural water friction drag when no throttle applied
      throttlePct = 0;
      targetSpeed = 0;
    }

    if (keys.a) {
      rudderPct = -100; // Port turn
      const turnRate = keys.shift ? 45.0 : 55.0; // deg/sec
      targetHeading = (vehicle.headingDeg - turnRate * deltaSec + 360) % 360;
    } else if (keys.d) {
      rudderPct = 100; // Starboard turn
      const turnRate = keys.shift ? 45.0 : 55.0; // deg/sec
      targetHeading = (vehicle.headingDeg + turnRate * deltaSec + 360) % 360;
    } else {
      rudderPct = 0;
    }
  } else if (waypoints.length > 0) {
    // AUTONOMOUS WAYPOINT TRACKING & PERPETUAL PATROL
    const currentWP = waypoints[vehicle.currentWaypointIndex] || waypoints[0];
    const targetX = currentWP.lat * 1000;
    const targetZ = currentWP.lon * 1000;
    const dx = targetX - vehicle.simX;
    const dz = targetZ - vehicle.simZ;
    const distanceToWP = Math.sqrt(dx * dx + dz * dz);

    if (distanceToWP < 45.0) {
      currentWP.reached = true;
      const nextIdx = (vehicle.currentWaypointIndex + 1) % waypoints.length;
      if (nextIdx === 0) {
        // Continuous perpetual patrol loop: unmark all waypoints so O-TREX repeats patrol
        waypoints.forEach((wp, idx) => {
          if (idx > 0) wp.reached = false;
        });
      }
      vehicle.currentWaypointIndex = nextIdx;
    }

    targetHeading = (Math.atan2(dx, dz) * (180 / Math.PI) + 360) % 360;
    targetSpeed = Math.min(4.5, Math.max(2.2, distanceToWP * 0.05));
    throttlePct = 80;
  }

  // 2. Smooth Heading Interpolation & Autonomous Steering Angle
  let headingDiff = targetHeading - vehicle.headingDeg;
  while (headingDiff > 180) headingDiff -= 360;
  while (headingDiff < -180) headingDiff += 360;

  // In autonomous mode, thruster rudder angle swivels dynamically towards target
  if (!isManual) {
    const rawRudder = Math.round((headingDiff / 30.0) * 100);
    rudderPct = Math.max(-100, Math.min(100, rawRudder));
  }

  const turnRateMax = isManual ? 55.0 : 48.0; // deg/s
  const headingStep = Math.sign(headingDiff) * Math.min(Math.abs(headingDiff), turnRateMax * deltaSec);
  const newHeading = (vehicle.headingDeg + headingStep + 360) % 360;

  // 3. Realistic Acceleration & Hydrodynamic Water Drag (P = F * v)
  const accelRate = isManual ? (keys.shift ? 3.0 : 2.2) : 2.5; // knots/s
  const decelRate = keys.s ? 3.5 : 1.2; // water drag deceleration
  const speedDiff = targetSpeed - vehicle.speedKnots;

  let newSpeedKnots = vehicle.speedKnots;
  if (speedDiff > 0) {
    newSpeedKnots = Math.min(targetSpeed, vehicle.speedKnots + accelRate * deltaSec);
  } else if (speedDiff < 0) {
    newSpeedKnots = Math.max(targetSpeed, vehicle.speedKnots - decelRate * deltaSec);
  }

  // Convert knots to sim units/sec (1 knot ≈ 0.514 m/s)
  const speedMps = newSpeedKnots * 0.514;
  const headingRad = (newHeading * Math.PI) / 180.0;

  // 4. Forward Velocity & Ocean Current Vector Addition
  let vx = Math.sin(headingRad) * speedMps;
  let vz = Math.cos(headingRad) * speedMps;

  const currentMps = env.currentSpeedKnots * 0.514 * 0.25;
  const currentRad = (env.currentDirectionDeg * Math.PI) / 180.0;
  vx += Math.sin(currentRad) * currentMps;
  vz += Math.cos(currentRad) * currentMps;

  // Integrate Coordinates
  const newSimX = vehicle.simX + vx * deltaSec;
  const newSimZ = vehicle.simZ + vz * deltaSec;
  const distDelta = Math.sqrt(vx * vx + vz * vz) * deltaSec;

  // GPS lat/lon projection
  const baseLat = -65.2500;
  const baseLon = 120.4000;
  const newLat = Number((baseLat + newSimX * 0.0001).toFixed(6));
  const newLon = Number((baseLon + newSimZ * 0.0001).toFixed(6));

  // 5. Analytical Ocean Surface Wave Buoyancy & Orientation
  const buoyancy = getCatamaranBuoyancy(
    newSimX,
    newSimZ,
    newHeading,
    simulationTime,
    env.waveHeightM
  );

  // Acceleration bow tilt: +accel -> bow rises (+pitch), braking -> bow dips (-pitch)
  const accelTilt = (newSpeedKnots - vehicle.speedKnots) * 1.5;
  const pitchDeg = Number((buoyancy.pitchDeg + accelTilt).toFixed(2));

  // Turning hydrodynamic roll lean: turning right rolls left, turning left rolls right
  const turnRoll = -(headingStep / Math.max(0.01, deltaSec)) * (newSpeedKnots / 3.5) * 0.28;
  const rollDeg = Number((buoyancy.rollDeg + turnRoll).toFixed(2));

  const yawDeg = 0;

  return {
    ...vehicle,
    simX: newSimX,
    simZ: newSimZ,
    lat: newLat,
    lon: newLon,
    headingDeg: Number(newHeading.toFixed(1)),
    targetHeadingDeg: Number(targetHeading.toFixed(1)),
    speedKnots: Number(newSpeedKnots.toFixed(2)),
    targetSpeedKnots: Number(targetSpeed.toFixed(2)),
    throttlePct: Math.round(throttlePct),
    rudderPct: Math.round(rudderPct),
    pitchDeg,
    rollDeg,
    yawDeg,
    distanceTraveledM: Number((vehicle.distanceTraveledM + distDelta).toFixed(1)),
    uptimeSeconds: vehicle.uptimeSeconds + deltaSec,
    controlMode: isManual ? 'MANUAL' : 'AUTONOMOUS'
  };
}
