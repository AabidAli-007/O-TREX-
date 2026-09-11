import { describe, it, expect } from 'vitest';
import { calculateOceanPointProperties } from '../models/oceanModel';
import { calculatePowerBudget, updateBatteryState } from '../models/energyModel';
import { evaluateAnomalyState } from '../intelligence/anomalyDetector';
import { runDecisionEngine } from '../intelligence/decisionEngine';
import { generatePriorityPacket, processCommunicationQueue, createInitialCommunicationState } from '../models/commsModel';
import { SCENARIO_PRESETS } from '../scenarios/scenarioPresets';

describe('O-TREX Deterministic Ocean Simulation Engine Tests', () => {
  const baselineEnv = SCENARIO_PRESETS.BASELINE;

  it('1. Ocean Model: Stratified Thermocline & Oxycline Depth Profile', () => {
    const surface = calculateOceanPointProperties(0, 0, 0, baselineEnv);
    const deep = calculateOceanPointProperties(0, 0, 50, baselineEnv);

    // Surface temperature should be warmer than deep water
    expect(surface.temperatureC).toBeGreaterThan(deep.temperatureC);
    // Pressure must increase monotonically with depth (P = P_atm + 0.1 * z)
    expect(deep.pressureDbar).toBeGreaterThan(surface.pressureDbar);
    expect(deep.pressureDbar).toBeCloseTo(6.04, 1);
  });

  it('2. Edge AI Anomaly Detector: Triggers on Hypoxic Multi-Parameter Deviation', () => {
    const normalReading = {
      id: 'norm-1',
      timestamp: Date.now(),
      depthM: 0,
      temperatureC: 21.2,
      conductivityMsCm: 48.0,
      salinityPsu: 35.1,
      dissolvedOxygenMgL: 7.8,
      ph: 8.14,
      turbidityNtu: 0.8,
      pressureDbar: 1.01,
      qualityFlag: 'GOOD' as const,
      qualityScore: 98,
      confidence: 0.98
    };

    const initialAnomaly = {
      active: false,
      score: 0.1,
      level: 'NORMAL' as const,
      triggerReason: '',
      contributingSensors: [],
      persistenceCount: 0,
      persistenceThreshold: 2,
      highestScoreObserved: 0.1
    };

    const normalResult = evaluateAnomalyState(normalReading, baselineEnv, initialAnomaly);
    expect(normalResult.score).toBeLessThan(0.4);
    expect(normalResult.level).toBe('NORMAL');

    // Severe hypoxic anomaly reading (DO dropped to 2.4 mg/L, Temp spike)
    const anomalyReading = {
      ...normalReading,
      dissolvedOxygenMgL: 2.4,
      temperatureC: 25.5,
      turbidityNtu: 4.5
    };

    const anomalyStep1 = evaluateAnomalyState(anomalyReading, baselineEnv, normalResult);
    const anomalyStep2 = evaluateAnomalyState(anomalyReading, baselineEnv, anomalyStep1);
    const anomalyStep3 = evaluateAnomalyState(anomalyReading, baselineEnv, anomalyStep2);

    expect(anomalyStep3.score).toBeGreaterThan(0.68);
    expect(anomalyStep3.active).toBe(true);
  });

  it('3. Explainable Decision Engine: Recommends DEPLOY_SENSOR_POD for verified anomaly', () => {
    const activeAnomaly = {
      active: true,
      score: 0.82,
      level: 'CRITICAL' as const,
      triggerReason: 'Severe Hypoxia',
      contributingSensors: [],
      persistenceCount: 3,
      persistenceThreshold: 2,
      highestScoreObserved: 0.82
    };

    const healthyVehicle = {
      simX: 0,
      simZ: 0,
      lat: -65.25,
      lon: 120.4,
      headingDeg: 45,
      targetHeadingDeg: 45,
      speedKnots: 1.8,
      targetSpeedKnots: 1.8,
      pitchDeg: 0,
      rollDeg: 0,
      yawDeg: 0,
      distanceTraveledM: 500,
      batterySOC: 85.0,
      batteryVoltageV: 53.0,
      currentDrawA: 2.0,
      solarPowerW: 90.0,
      motorPowerW: 30.0,
      electronicsPowerW: 8.8,
      winchPowerW: 0,
      cpuTempC: 38.0,
      internalTempC: 22.0,
      leakDetected: false,
      uptimeSeconds: 600,
      gnssLock: true,
      gnssSatellites: 18,
      gnssHdop: 0.8,
      currentWaypointIndex: 1,
      throttlePct: 60,
      rudderPct: 0,
      controlMode: 'AUTONOMOUS' as const,
      emergencyStop: false
    };

    const comms = createInitialCommunicationState();
    const stowedPod = {
      status: 'READY' as const,
      depthCurrentM: 0,
      depthTargetM: 35.0,
      winchSpeedMps: 0,
      cableTensionN: 0,
      maxWinchDepthM: 100.0,
      tetherLengthM: 0,
      activeSampling: false,
      verticalProfilePoints: []
    };

    const decision = runDecisionEngine(activeAnomaly, healthyVehicle, comms, stowedPod, baselineEnv);
    expect(decision.recommendation).toBe('DEPLOY_SENSOR_POD');
    expect(decision.explainedSteps.some((s) => s.rule.includes('Battery Margin Check') && s.passed)).toBe(true);
  });

  it('4. Energy Model: Solar generation & Battery SOC integration', () => {
    const power = calculatePowerBudget(1.5, 900, 'READY', 'SATELLITE', false, false);
    expect(power.solarPowerW).toBeGreaterThan(50);
    expect(power.propulsionPowerW).toBeGreaterThan(10);

    const { batterySOC } = updateBatteryState(80.0, power.netPowerW, 10.0, 1440.0);
    expect(batterySOC).toBeGreaterThan(79.0);
    expect(batterySOC).toBeLessThanOrEqual(100.0);
  });

  it('5. Communications Model: Priority Packet Queuing & Transmission', () => {
    const initialState = createInitialCommunicationState();
    const p1Pkt = generatePriorityPacket('P1_CRITICAL', 'ANOMALY_ALERT', 'Test Alert', 256);
    const stateWithPkt = {
      ...initialState,
      packets: [p1Pkt],
      queuedPacketsCount: 1,
      queuedBytes: 256
    };

    const { nextState, transmittedPackets } = processCommunicationQueue(stateWithPkt, 2.0, false);
    expect(transmittedPackets.length).toBe(1);
    expect(nextState.transmittedBytes).toBeGreaterThan(initialState.transmittedBytes);
  });
});
