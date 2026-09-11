export type MissionStateType =
  | 'IDLE'
  | 'MISSION_INITIALIZATION'
  | 'AUTONOMOUS_NAVIGATION'
  | 'SURFACE_MONITORING'
  | 'ANOMALY_ANALYSIS'
  | 'DECISION_ENGINE'
  | 'VERTICAL_PROFILING'
  | 'DATA_PROCESSING'
  | 'DATA_PRIORITIZATION'
  | 'DATA_TRANSMISSION'
  | 'MISSION_CONTINUE'
  | 'MISSION_RETURN'
  | 'SAFE_MODE'
  | 'EMERGENCY_STOP'
  | 'MANUAL_PILOT';

export type QualityFlag = 'GOOD' | 'SUSPECT' | 'INVALID' | 'MISSING';

export type ProvenanceType =
  | 'VERIFIED_PUBLIC_PRICE'
  | 'ENGINEERING_ESTIMATE'
  | 'PROJECT_DESIGN_SPEC'
  | 'SIMULATION_VALUE'
  | 'QUOTE_REQUIRED';

export type PodStatusType =
  | 'READY'
  | 'DEPLOYING'
  | 'LOWERING'
  | 'PROFILING'
  | 'HOLDING_DEPTH'
  | 'RETRACTING'
  | 'RECOVERED'
  | 'FAULT';

export interface KeyboardState {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  shift: boolean;
  space: boolean;
  x: boolean;
}

export interface Waypoint {
  id: string;
  lat: number;
  lon: number;
  label: string;
  reached: boolean;
  type: 'START' | 'SURFACE_PATROL' | 'ANOMALY_INVESTIGATION' | 'PROFILING_STATION' | 'RETURN_BASE';
}

export interface VehicleState {
  simX: number; // 3D world X
  simZ: number; // 3D world Z
  lat: number;
  lon: number;
  headingDeg: number;
  targetHeadingDeg: number;
  speedKnots: number;
  targetSpeedKnots: number;
  pitchDeg: number;
  rollDeg: number;
  yawDeg: number;
  throttlePct: number; // -100% to +100%
  rudderPct: number; // -100% (Port) to +100% (Starboard)
  distanceTraveledM: number;
  batterySOC: number; // 0 - 100 %
  batteryVoltageV: number;
  currentDrawA: number;
  solarPowerW: number;
  motorPowerW: number;
  electronicsPowerW: number;
  winchPowerW: number;
  cpuTempC: number;
  internalTempC: number;
  leakDetected: boolean;
  uptimeSeconds: number;
  gnssLock: boolean;
  gnssSatellites: number;
  gnssHdop: number;
  currentWaypointIndex: number;
  controlMode: 'AUTONOMOUS' | 'MANUAL';
  emergencyStop: boolean;
}

export interface PodState {
  status: PodStatusType;
  depthCurrentM: number;
  depthTargetM: number;
  winchSpeedMps: number;
  cableTensionN: number;
  maxWinchDepthM: number;
  tetherLengthM: number;
  activeSampling: boolean;
  verticalProfilePoints: SensorReading[];
}

export interface SensorReading {
  id: string;
  timestamp: number;
  depthM: number;
  temperatureC: number;
  conductivityMsCm: number;
  salinityPsu: number;
  dissolvedOxygenMgL: number;
  ph: number;
  turbidityNtu: number;
  pressureDbar: number;
  qualityFlag: QualityFlag;
  qualityScore: number; // 0 - 100
  confidence: number;
  rawTemperatureC?: number;
  rawConductivityMsCm?: number;
  rawDoMgL?: number;
  rawPh?: number;
  rawTurbidityNtu?: number;
}

export interface AnomalyContributingSensor {
  name: string;
  observed: number;
  baseline: number;
  deviationSigma: number;
  weight: number;
}

export interface AnomalyState {
  active: boolean;
  score: number; // 0.00 to 1.00
  level: 'NORMAL' | 'WATCH' | 'ANOMALY' | 'CRITICAL';
  triggerReason: string;
  contributingSensors: AnomalyContributingSensor[];
  persistenceCount: number;
  persistenceThreshold: number;
  highestScoreObserved: number;
}

export interface DecisionInputs {
  scientificValue: number; // 0 - 100
  anomalySeverity: number; // 0 - 100
  batteryLevel: number; // 0 - 100
  solarAvailability: number; // 0 - 100
  commAvailability: number; // 0 - 100
  weatherRisk: number; // 0 - 100
}

export type RecommendedActionType =
  | 'CONTINUE_SURFACE_MONITORING'
  | 'DEPLOY_SENSOR_POD'
  | 'TRANSMIT_NOW'
  | 'STORE_LOCALLY'
  | 'CHANGE_WAYPOINT'
  | 'RETURN_TO_BASE';

export interface DecisionState {
  active: boolean;
  recommendation: RecommendedActionType;
  rationale: string;
  utilityScore: number;
  inputs: DecisionInputs;
  timestamp: number;
  explainedSteps: {
    rule: string;
    passed: boolean;
    detail: string;
  }[];
}

export interface DataPacket {
  id: string;
  priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_TELEMETRY' | 'P4_ROUTINE' | 'P5_LOGS';
  type: string;
  timestamp: number;
  sizeBytes: number;
  payloadSummary: string;
  status: 'QUEUED' | 'TRANSMITTING' | 'SENT' | 'STORED_LOCAL';
}

export interface CommunicationState {
  activeBearer: 'LORA' | 'SATELLITE' | 'CELLULAR_4G_5G' | 'OFFLINE';
  linkQualityPct: number;
  rssiDbm: number;
  bandwidthKbps: number;
  queuedPacketsCount: number;
  queuedBytes: number;
  transmittedBytes: number;
  packets: DataPacket[];
  satelliteAvailable: boolean;
  loraAvailable: boolean;
  cellularAvailable: boolean;
}

export interface EnvironmentState {
  scenarioId: 'BASELINE' | 'LOW_OXYGEN' | 'TURBIDITY_PLUME' | 'POLAR_OCEAN' | 'COMM_BLACKOUT';
  name: string;
  description: string;
  waveHeightM: number;
  wavePeriodS: number;
  currentSpeedKnots: number;
  currentDirectionDeg: number;
  windSpeedMs: number;
  windDirectionDeg: number;
  solarIrradianceWm2: number;
  ambientAirTempC: number;
  surfaceBaseTempC: number;
  surfaceBaseSalinityPsu: number;
  surfaceBaseDOMgL: number;
  surfaceBasePh: number;
  surfaceBaseTurbidityNtu: number;
  thermoclineDepthM: number;
  hasIceFloes: boolean;
  anomalyRegion: {
    active: boolean;
    centerSimX: number;
    centerSimZ: number;
    radiusM: number;
    tempDeltaC: number;
    doDeltaMgL: number;
    turbidityDeltaNtu: number;
    phDelta: number;
    condDeltaMsCm: number;
  };
}

export interface MissionScore {
  totalScore: number;
  scientificValuePct: number;
  energyEfficiencyPct: number;
  dataQualityPct: number;
  safetyPct: number;
  samplesCollected: number;
  profilesCompleted: number;
  anomaliesInvestigated: number;
  dataTransmittedKb: number;
}

export interface FailureFlags {
  gnssLoss: boolean;
  commLoss: boolean;
  lowBatteryForced: boolean;
  sensorDriftActive: boolean;
  turbiditySensorFail: boolean;
  winchMotorFail: boolean;
  thrusterDegraded: boolean;
  extremeWaves: boolean;
}

export type MapDataLayerType = 'NONE' | 'TEMPERATURE' | 'SALINITY' | 'DISSOLVED_OXYGEN' | 'TURBIDITY' | 'ANOMALY';

export interface MapSettings {
  showGrid: boolean;
  showWaypoints: boolean;
  showAnomalies: boolean;
  showExistingSystems: boolean;
  showSurveyTrail: boolean;
  showBathymetry: boolean;
  measureMode: boolean;
  autoFollow: boolean;
}

export interface MapPoint {
  x: number;
  z: number;
}

