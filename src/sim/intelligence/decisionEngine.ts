import {
  DecisionState,
  DecisionInputs,
  RecommendedActionType,
  AnomalyState,
  VehicleState,
  CommunicationState,
  PodState,
  EnvironmentState
} from '../../types/simulation';

export function runDecisionEngine(
  anomaly: AnomalyState,
  vehicle: VehicleState,
  comms: CommunicationState,
  pod: PodState,
  env: EnvironmentState
): DecisionState {
  const anomalySeverity = Math.min(100, Math.round(anomaly.score * 100));
  const scientificValue = Math.min(
    100,
    Math.round(anomaly.score * 75 + (anomaly.persistenceCount > 2 ? 25 : 10))
  );
  const batteryLevel = Math.round(vehicle.batterySOC);
  const solarAvailability = Math.min(100, Math.round((vehicle.solarPowerW / 120.0) * 100));
  const commAvailability = Math.round(comms.linkQualityPct);
  const weatherRisk = Math.min(100, Math.round((env.waveHeightM / 3.5) * 60 + (env.windSpeedMs / 20.0) * 40));

  const inputs: DecisionInputs = {
    scientificValue,
    anomalySeverity,
    batteryLevel,
    solarAvailability,
    commAvailability,
    weatherRisk
  };

  const steps: DecisionState['explainedSteps'] = [];

  // Step 1: Safety Check - Battery
  const batterySufficientForProfiling = batteryLevel >= 25;
  steps.push({
    rule: 'Battery Margin Check (SOC ≥ 25%)',
    passed: batterySufficientForProfiling,
    detail: `Current SOC: ${batteryLevel}% | Winch energy reserve budget requires min 25% for 50m descent & retrieval.`
  });

  // Step 2: Weather & Sea State Check
  const weatherAcceptable = weatherRisk < 75;
  steps.push({
    rule: 'Sea State Safety Margin (Risk < 75%)',
    passed: weatherAcceptable,
    detail: `Wave height: ${env.waveHeightM.toFixed(1)}m, Wind: ${env.windSpeedMs.toFixed(1)}m/s (Risk index: ${weatherRisk}%).`
  });

  // Step 3: Anomaly Significance Threshold
  const anomalyWarrantsInvestigation = anomalySeverity >= 68 && anomaly.persistenceCount >= 2;
  steps.push({
    rule: 'Scientific Priority Trigger (Severity ≥ 68 & Persistence ≥ 2)',
    passed: anomalyWarrantsInvestigation,
    detail: `Anomaly Score: ${(anomaly.score).toFixed(2)} | Persistence count: ${anomaly.persistenceCount} consecutive samples.`
  });

  // Step 4: Communication Bearer Check
  const commLinkOk = comms.linkQualityPct > 20;
  steps.push({
    rule: 'Real-Time Communication Uplink Status',
    passed: commLinkOk,
    detail: commLinkOk
      ? `Bearer: ${comms.activeBearer} (${comms.linkQualityPct}% quality). Real-time transmission active.`
      : 'Link degraded/offline. Store-and-forward local non-volatile buffer activated.'
  });

  // Evaluate Multi-Criteria Recommendation
  let recommendation: RecommendedActionType = 'CONTINUE_SURFACE_MONITORING';
  let rationale = 'Nominal surface patrol: environmental readings within baseline parameters.';
  let utilityScore = 55;

  if (batteryLevel < 18 || weatherRisk > 85) {
    recommendation = 'RETURN_TO_BASE';
    rationale = `Critical safety threshold triggered: Battery (${batteryLevel}%) or Sea State (${weatherRisk}%) exceeds autonomous operating limits.`;
    utilityScore = 20;
  } else if (pod.status === 'PROFILING' || pod.status === 'DEPLOYING') {
    recommendation = 'DEPLOY_SENSOR_POD';
    rationale = `Executing active vertical profiling down to target ${pod.depthTargetM}m to resolve depth stratification.`;
    utilityScore = 95;
  } else if (anomalyWarrantsInvestigation && batterySufficientForProfiling && weatherAcceptable) {
    recommendation = 'DEPLOY_SENSOR_POD';
    rationale = `High-value environmental anomaly verified (Severity: ${anomalySeverity}%) + adequate energy margin (${batteryLevel}%) → Trigger autonomous vertical profiling winch.`;
    utilityScore = 92;
  } else if (anomalySeverity >= 45 && anomalySeverity < 68) {
    recommendation = 'CHANGE_WAYPOINT';
    rationale = `Moderate environmental gradient observed (Score: ${(anomaly.score).toFixed(2)}) → Adjusting trajectory to cross anomaly centroid.`;
    utilityScore = 74;
  } else if (comms.queuedPacketsCount > 0 && commLinkOk) {
    recommendation = 'TRANSMIT_NOW';
    rationale = `Telemetry buffer contains ${comms.queuedPacketsCount} packets → Transmitting prioritized data burst over ${comms.activeBearer}.`;
    utilityScore = 80;
  }

  return {
    active: true,
    recommendation,
    rationale,
    utilityScore,
    inputs,
    timestamp: Date.now(),
    explainedSteps: steps
  };
}
