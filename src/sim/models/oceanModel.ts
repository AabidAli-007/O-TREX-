import { EnvironmentState, SensorReading } from '../../types/simulation';

export function calculateOceanPointProperties(
  simX: number,
  simZ: number,
  depthM: number,
  env: EnvironmentState,
  sensorDrift = 0
): Omit<SensorReading, 'id' | 'timestamp'> {
  // Check if inside anomaly zone
  let inAnomaly = false;
  let anomalyFactor = 0;

  if (env.anomalyRegion.active) {
    const dx = simX - env.anomalyRegion.centerSimX;
    const dz = simZ - env.anomalyRegion.centerSimZ;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < env.anomalyRegion.radiusM) {
      inAnomaly = true;
      // Smooth bell curve falloff from center of anomaly
      anomalyFactor = Math.cos((dist / env.anomalyRegion.radiusM) * (Math.PI / 2));
    }
  }

  // 1. Temperature Calculation with Thermocline Model
  const surfaceT = env.surfaceBaseTempC + (inAnomaly ? env.anomalyRegion.tempDeltaC * anomalyFactor : 0);
  const deepT = env.scenarioId === 'POLAR_OCEAN' ? -1.8 : 4.0;
  const thermoclineDepth = env.thermoclineDepthM;
  const thermoclineWidth = 12.0;
  // Logistic thermocline transition
  const baseTempAtDepth =
    deepT + (surfaceT - deepT) / (1.0 + Math.exp((depthM - thermoclineDepth) / thermoclineWidth));
  const tempNoise = (Math.sin(simX * 0.5 + depthM) * 0.03 + Math.cos(simZ * 0.4 + depthM * 0.8) * 0.02);
  const temperatureC = Number((baseTempAtDepth + tempNoise + sensorDrift * 0.2).toFixed(3));

  // 2. Salinity & Conductivity Calculation (Halocline Model)
  const surfaceSal = env.surfaceBaseSalinityPsu + (inAnomaly ? env.anomalyRegion.condDeltaMsCm * 0.1 * anomalyFactor : 0);
  const deepSal = 34.8; // Standard deep ocean PSU
  const baseSal = surfaceSal + (deepSal - surfaceSal) * (1.0 - Math.exp(-depthM / 30.0));
  const salinityPsu = Number((baseSal + Math.sin(depthM * 0.2) * 0.05).toFixed(2));
  // Specific conductivity proxy based on temperature & salinity: ~ 1 mS/cm per 0.8 PSU at 15C
  const conductivityMsCm = Number(
    (salinityPsu * (1.0 + 0.02 * (temperatureC - 15.0)) * 1.35 + sensorDrift * 0.15).toFixed(2)
  );

  // 3. Dissolved Oxygen Calculation (Oxycline & Hypoxia Model)
  const surfaceDO = env.surfaceBaseDOMgL + (inAnomaly ? env.anomalyRegion.doDeltaMgL * anomalyFactor : 0);
  // Biological oxygen minimum zone near thermocline depth
  const omzDepression = Math.exp(-Math.pow((depthM - thermoclineDepth * 1.2) / 15.0, 2)) * 1.5;
  const deepDO = 6.2;
  const baseDO = Math.max(
    1.2,
    surfaceDO * Math.exp(-0.015 * depthM) - omzDepression + deepDO * (depthM / (depthM + 80.0))
  );
  const dissolvedOxygenMgL = Number(
    (baseDO + Math.cos(depthM * 0.3) * 0.08 + sensorDrift * -0.1).toFixed(2)
  );

  // 4. Hydrostatic Pressure & Depth
  // Hydrostatic formula: P = P_atm + (rho * g * h) / 10000 dbar (where 1m approx 1.005 dbar)
  const pressureDbar = Number((1.01325 + 0.1007 * depthM).toFixed(2));

  // 5. pH Calculation
  const surfacePH = env.surfaceBasePh + (inAnomaly ? env.anomalyRegion.phDelta * anomalyFactor : 0);
  const deepPH = 7.82;
  const basePH = surfacePH - (surfacePH - deepPH) * (depthM / (depthM + 50.0));
  const ph = Number((basePH + Math.sin(depthM * 0.1) * 0.02).toFixed(2));

  // 6. Turbidity (Nephelometry) Calculation (Surface & Benthic Plumes)
  const surfaceTurb = env.surfaceBaseTurbidityNtu + (inAnomaly ? env.anomalyRegion.turbidityDeltaNtu * anomalyFactor : 0);
  const depthTurbDecay = surfaceTurb * Math.exp(-depthM / 25.0) + 0.4;
  const turbidityNtu = Number(
    Math.max(0.1, depthTurbDecay + Math.sin(simX * 0.2 + depthM) * 0.05 + sensorDrift * 0.05).toFixed(2)
  );

  // Determine quality flags
  let qualityFlag: 'GOOD' | 'SUSPECT' | 'INVALID' | 'MISSING' = 'GOOD';
  let qualityScore = 98;
  if (Math.abs(sensorDrift) > 0.5) {
    qualityFlag = 'SUSPECT';
    qualityScore = 72;
  }
  if (Math.abs(sensorDrift) > 1.2) {
    qualityFlag = 'INVALID';
    qualityScore = 35;
  }

  return {
    depthM: Number(depthM.toFixed(1)),
    temperatureC,
    conductivityMsCm,
    salinityPsu,
    dissolvedOxygenMgL,
    pressureDbar,
    ph,
    turbidityNtu,
    qualityFlag,
    qualityScore,
    confidence: Number((qualityScore / 100).toFixed(2)),
    rawTemperatureC: Number((temperatureC + (Math.random() - 0.5) * 0.08).toFixed(3)),
    rawConductivityMsCm: Number((conductivityMsCm + (Math.random() - 0.5) * 0.1).toFixed(2)),
    rawDoMgL: Number((dissolvedOxygenMgL + (Math.random() - 0.5) * 0.05).toFixed(2)),
    rawPh: Number((ph + (Math.random() - 0.5) * 0.02).toFixed(2)),
    rawTurbidityNtu: Number((turbidityNtu + (Math.random() - 0.5) * 0.06).toFixed(2))
  };
}
