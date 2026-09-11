import { SensorReading, AnomalyState, EnvironmentState, AnomalyContributingSensor } from '../../types/simulation';

export function evaluateAnomalyState(
  latestReading: SensorReading,
  env: EnvironmentState,
  prevState: AnomalyState
): AnomalyState {
  // Baseline baselines from environment
  const baselineTemp = env.surfaceBaseTempC;
  const baselineDO = env.surfaceBaseDOMgL;
  const baselineSal = env.surfaceBaseSalinityPsu;
  const baselinePh = env.surfaceBasePh;
  const baselineTurb = env.surfaceBaseTurbidityNtu;

  // Compute deviations
  const tempDev = Math.abs(latestReading.temperatureC - baselineTemp);
  const doDev = Math.max(0, baselineDO - latestReading.dissolvedOxygenMgL); // Hypoxia is drop in DO
  const salDev = Math.abs(latestReading.salinityPsu - baselineSal);
  const phDev = Math.abs(latestReading.ph - baselinePh);
  const turbDev = Math.max(0, latestReading.turbidityNtu - baselineTurb); // Turbidity spike

  // Normalized sigma deviations
  const tempZ = tempDev / 0.5; // 0.5C std
  const doZ = doDev / 0.8; // 0.8 mg/L std
  const salZ = salDev / 0.3; // 0.3 PSU std
  const phZ = phDev / 0.15; // 0.15 pH std
  const turbZ = turbDev / 1.5; // 1.5 NTU std

  // Contributing sensors breakdown
  const contributingSensors: AnomalyContributingSensor[] = [
    {
      name: 'Dissolved Oxygen (Hypoxia)',
      observed: latestReading.dissolvedOxygenMgL,
      baseline: baselineDO,
      deviationSigma: Number(doZ.toFixed(2)),
      weight: 0.35
    },
    {
      name: 'Sea Temperature Gradient',
      observed: latestReading.temperatureC,
      baseline: baselineTemp,
      deviationSigma: Number(tempZ.toFixed(2)),
      weight: 0.25
    },
    {
      name: 'Optical Turbidity Plume',
      observed: latestReading.turbidityNtu,
      baseline: baselineTurb,
      deviationSigma: Number(turbZ.toFixed(2)),
      weight: 0.20
    },
    {
      name: 'Conductivity / Halocline',
      observed: latestReading.salinityPsu,
      baseline: baselineSal,
      deviationSigma: Number(salZ.toFixed(2)),
      weight: 0.10
    },
    {
      name: 'Ocean pH Acidity',
      observed: latestReading.ph,
      baseline: baselinePh,
      deviationSigma: Number(phZ.toFixed(2)),
      weight: 0.10
    }
  ];

  // Weighted multi-variate score
  const weightedSum =
    (doZ * 0.35 + tempZ * 0.25 + turbZ * 0.20 + salZ * 0.10 + phZ * 0.10) / 3.0;
  const rawScore = Math.min(1.0, Math.max(0.05, weightedSum));

  // Exponential moving average for smooth transitions
  const alpha = 0.48;
  const smoothScore = Number((prevState.score * (1 - alpha) + rawScore * alpha).toFixed(3));

  // Determine stage
  let level: AnomalyState['level'] = 'NORMAL';
  let triggerReason = 'Surface measurements within nominal environmental baseline.';

  if (smoothScore >= 0.88) {
    level = 'CRITICAL';
    triggerReason = `Critical biogeochemical anomaly detected: DO depression Δ=${doDev.toFixed(1)}mg/L with thermal/turbidity gradient.`;
  } else if (smoothScore >= 0.68) {
    level = 'ANOMALY';
    triggerReason = `Multi-sensor environmental anomaly threshold (0.70) crossed (Score: ${smoothScore.toFixed(2)}).`;
  } else if (smoothScore >= 0.38) {
    level = 'WATCH';
    triggerReason = `Elevated variance observed above background baseline (Score: ${smoothScore.toFixed(2)}).`;
  }

  // Update persistence
  let persistenceCount = prevState.persistenceCount;
  if (smoothScore >= 0.68) {
    persistenceCount += 1;
  } else {
    persistenceCount = Math.max(0, persistenceCount - 1);
  }

  const highestScore = Math.max(prevState.highestScoreObserved || 0, smoothScore);

  return {
    active: smoothScore >= 0.68 && persistenceCount >= 2,
    score: smoothScore,
    level,
    triggerReason,
    contributingSensors,
    persistenceCount,
    persistenceThreshold: 2,
    highestScoreObserved: highestScore
  };
}
