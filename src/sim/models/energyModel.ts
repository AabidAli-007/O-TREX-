import { PodState, CommunicationState } from '../../types/simulation';

export interface PowerBudget {
  solarPowerW: number;
  propulsionPowerW: number;
  computePowerW: number;
  winchPowerW: number;
  commsPowerW: number;
  sensorPowerW: number;
  netPowerW: number;
  totalConsumptionW: number;
}

export function calculatePowerBudget(
  speedKnots: number,
  solarIrradianceWm2: number,
  podStatus: PodState['status'],
  commMode: CommunicationState['activeBearer'],
  isTransmitting: boolean,
  hasIceFloes: boolean
): PowerBudget {
  // 1. Solar Generation: 120W rated array (~0.6 m^2 @ 22% efficiency)
  const effectiveArea = 0.58; // m^2
  const panelEfficiency = 0.21;
  const polarSunAngleFactor = hasIceFloes ? 0.65 : 0.88;
  const solarPowerW = Number(
    Math.max(0, solarIrradianceWm2 * effectiveArea * panelEfficiency * polarSunAngleFactor).toFixed(1)
  );

  // 2. Propulsion Power: Hydrodynamic cubic drag curve (P = c * v^3)
  // At 1.5 knots cruise: ~25-35W; At 3.0 knots sprint: ~160W
  const speedRatio = Math.max(0, speedKnots) / 2.0;
  const propulsionPowerW = Number((28.0 * Math.pow(speedRatio, 2.6)).toFixed(1));

  // 3. Compute & Avionics Power: Pixhawk (2.5W) + Raspberry Pi 4 (5.5W) + GNSS/IMU (0.8W)
  const computePowerW = 8.8;

  // 4. Winch Power: 0W stowed, 18W lowering, 42W retrieving
  let winchPowerW = 0;
  if (podStatus === 'DEPLOYING' || podStatus === 'LOWERING') winchPowerW = 16.5;
  if (podStatus === 'PROFILING' || podStatus === 'HOLDING_DEPTH') winchPowerW = 6.0; // Holding station / micro-adjust
  if (podStatus === 'RETRACTING') winchPowerW = 44.0;

  // 5. Sensor Pod & Surface Sensor Cluster: 2.2W
  const sensorPowerW = 2.2;

  // 6. Communications Power:
  let commsPowerW = 0.3; // Standby listening
  if (isTransmitting) {
    if (commMode === 'SATELLITE') commsPowerW = 8.5; // Iridium SBD RF burst
    else if (commMode === 'LORA') commsPowerW = 1.8;
    else if (commMode === 'CELLULAR_4G_5G') commsPowerW = 2.4;
  }

  const totalConsumptionW = Number(
    (propulsionPowerW + computePowerW + winchPowerW + commsPowerW + sensorPowerW).toFixed(1)
  );
  const netPowerW = Number((solarPowerW - totalConsumptionW).toFixed(1));

  return {
    solarPowerW,
    propulsionPowerW,
    computePowerW,
    winchPowerW,
    commsPowerW,
    sensorPowerW,
    netPowerW,
    totalConsumptionW
  };
}

export function updateBatteryState(
  currentSOC: number,
  netPowerW: number,
  deltaSec: number,
  batteryCapacityWh = 1440.0 // 48V 30Ah
): { batterySOC: number; batteryVoltageV: number; currentDrawA: number } {
  // Energy change in Watt-hours
  const deltaWh = (netPowerW * deltaSec) / 3600.0;
  let newSOC = currentSOC + (deltaWh / batteryCapacityWh) * 100.0;
  newSOC = Math.max(0.0, Math.min(100.0, newSOC));

  // Approximate LiFePO4 16S voltage curve
  // 100% = 54.4V, 50% = 51.2V, 10% = 48.0V, 0% = 44.0V
  const baseV = 46.0 + (newSOC / 100.0) * 8.4;
  const batteryVoltageV = Number(baseV.toFixed(2));

  // Current draw (A) = Power / Voltage
  const currentDrawA = Number((Math.abs(netPowerW) / Math.max(1.0, batteryVoltageV)).toFixed(2));

  return {
    batterySOC: Number(newSOC.toFixed(2)),
    batteryVoltageV,
    currentDrawA
  };
}
