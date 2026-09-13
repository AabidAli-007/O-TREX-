import { create } from 'zustand';
import {
  MissionStateType,
  VehicleState,
  PodState,
  EnvironmentState,
  AnomalyState,
  DecisionState,
  CommunicationState,
  MissionScore,
  FailureFlags,
  Waypoint,
  SensorReading,
  KeyboardState,
  MapDataLayerType,
  MapSettings,
  MapPoint
} from '../types/simulation';
import { BOMItem } from '../types/hardware';
import { SCENARIO_PRESETS } from '../sim/scenarios/scenarioPresets';
import { DEFAULT_BOM_ITEMS } from '../data/hardwareData';
import { updateVesselPhysics } from '../sim/physics/vesselPhysics';
import { updatePodKinematics } from '../sim/physics/podPhysics';
import { calculateOceanPointProperties } from '../sim/models/oceanModel';
import { calculatePowerBudget, updateBatteryState } from '../sim/models/energyModel';
import { processCommunicationQueue, createInitialCommunicationState } from '../sim/models/commsModel';
import { evaluateAnomalyState } from '../sim/intelligence/anomalyDetector';
import { runDecisionEngine } from '../sim/intelligence/decisionEngine';
import { evaluateMissionStateMachine } from '../sim/stateMachine/missionStateMachine';

export type CameraViewMode = 'FOLLOW' | 'FREE' | 'TOP_DOWN' | 'UNDERWATER_POD' | 'HARDWARE' | 'SIDE';
export type DrawerType = 'MISSION' | 'VEHICLE' | 'OCEAN_DATA' | 'SENSORS' | 'POD' | 'MAP' | 'TELEMETRY' | 'ANALYTICS' | null;
export type ViewportMode = 'COMBINED' | '3D' | '2D';
export type ModalType =
  | 'HARDWARE'
  | 'SENSOR_POD'
  | 'OCEAN_DATA'
  | 'COMPETITORS'
  | 'BOM'
  | 'ANALYTICS'
  | 'FAILURES'
  | 'SOURCES'
  | 'JUDGE_TOUR'
  | 'GRAPHICS'
  | 'SIZE_CHARTER'
  | null;

export interface SimulationStore {
  // Graphics & Performance
  graphicsQuality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';
  setGraphicsQuality: (quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA') => void;

  // Time & Control
  isRunning: boolean;
  simSpeed: number;
  simTime: number;
  missionState: MissionStateType;
  missionStateTimer: number;

  // Keyboard & Manual Pilot
  keyboardState: KeyboardState;
  activeKeyCommand: string;
  controlsActive: boolean;
  showWASDOverlay: boolean;

  // 2D GIS Map & Ocean Layers
  activeDataLayer: MapDataLayerType;
  mapSettings: MapSettings;
  surveyTrail: MapPoint[];
  measurePoints: MapPoint[];

  // Domain States
  vehicle: VehicleState;
  pod: PodState;
  env: EnvironmentState;
  anomaly: AnomalyState;
  decision: DecisionState;
  comms: CommunicationState;
  score: MissionScore;
  failures: FailureFlags;
  waypoints: Waypoint[];
  sensorHistory: SensorReading[];
  missionLogs: { id: string; timestamp: number; text: string; type: 'INFO' | 'ANOMALY' | 'DECISION' | 'COMM' }[];

  // UI / Interaction
  isDarkMode: boolean;
  viewportMode: ViewportMode;
  cameraMode: CameraViewMode;
  activeModal: ModalType;
  activeDrawer: DrawerType;
  selectedHardwareId: string | null;
  selectedCompetitorId: string | null;
  judgeTourStep: number;
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  isDecisionBannerDismissed: boolean;
  showPodOverlay: boolean;

  // BOM Estimator
  bomItems: BOMItem[];
  inrExchangeRate: number;
  contingencyPct: number;

  // Actions
  start: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setScenario: (scenarioId: EnvironmentState['scenarioId']) => void;
  setViewportMode: (mode: ViewportMode) => void;
  setCameraMode: (mode: CameraViewMode) => void;
  toggleDarkMode: () => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setDecisionBannerDismissed: (dismissed: boolean) => void;
  setShowPodOverlay: (show: boolean) => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  toggleModal: (modal: ModalType) => void;
  cycleCameraMode: () => void;
  toggleControlMode: () => void;
  openDrawer: (drawer: DrawerType) => void;
  closeDrawer: () => void;
  toggleDrawer: (drawer: DrawerType) => void;
  toggleWASDOverlay: () => void;
  selectHardware: (id: string | null) => void;
  selectCompetitor: (id: string | null) => void;
  setJudgeTourStep: (step: number) => void;
  triggerAnomaly: () => void;

  // 2D Map Actions
  setActiveDataLayer: (layer: MapDataLayerType) => void;
  toggleMapSetting: (key: keyof MapSettings) => void;
  setMeasurePoint: (pt: MapPoint) => void;
  clearMeasurement: () => void;
  addWaypoint: (latKm: number, lonKm: number, label?: string) => void;
  removeWaypoint: (id: string) => void;
  clearRoute: () => void;
  returnHome: () => void;
  
  // Direct Pod Actions
  setTargetDepth: (depth: number) => void;
  manualDeployPod: (targetDepth?: number) => void;
  lowerPod: () => void;
  holdPodDepth: () => void;
  resumePodDescent: () => void;
  manualRetractPod: () => void;
  stowPod: () => void;
  togglePod: () => void;

  // Manual Vehicle Actions
  setKeyDown: (key: string) => void;
  setKeyUp: (key: string) => void;
  setControlMode: (mode: 'AUTONOMOUS' | 'MANUAL') => void;
  emergencyStop: () => void;
  clearEmergencyStop: () => void;
  recenterVehicle: () => void;

  // Subsystems & Failure Injection
  toggleFailure: (key: keyof FailureFlags) => void;
  updateBOMItem: (id: string, updates: Partial<BOMItem>) => void;
  setInrExchangeRate: (rate: number) => void;
  setContingencyPct: (pct: number) => void;
  tick: (deltaSeconds: number) => void;
}

const INITIAL_WAYPOINTS: Waypoint[] = [
  { id: 'wp-start', lat: 0, lon: 0, label: 'BASE / START (0,0)', reached: true, type: 'START' },
  { id: 'wp-1', lat: 1.8, lon: 1.5, label: 'WP01 — TRANSECT ALPHA', reached: false, type: 'SURFACE_PATROL' },
  { id: 'wp-2', lat: 2.6, lon: 3.2, label: 'WP02 — ANOMALY SCAN', reached: false, type: 'ANOMALY_INVESTIGATION' },
  { id: 'wp-3', lat: 4.5, lon: 2.0, label: 'WP03 — PROFILING STATION', reached: false, type: 'PROFILING_STATION' },
  { id: 'wp-4', lat: 3.2, lon: -1.8, label: 'WP04 — SOUTHERN BOUNDARY', reached: false, type: 'SURFACE_PATROL' },
  { id: 'wp-5', lat: 0, lon: 0, label: 'WP05 — BASE RECOVERY', reached: false, type: 'RETURN_BASE' }
];

const INITIAL_VEHICLE: VehicleState = {
  simX: 0,
  simZ: 0,
  lat: -65.2500,
  lon: 120.4000,
  headingDeg: 45,
  targetHeadingDeg: 45,
  speedKnots: 0,
  targetSpeedKnots: 0,
  pitchDeg: 0,
  rollDeg: 0,
  yawDeg: 0,
  throttlePct: 0,
  rudderPct: 0,
  distanceTraveledM: 0,
  batterySOC: 96.5,
  batteryVoltageV: 53.8,
  currentDrawA: 1.2,
  solarPowerW: 88.5,
  motorPowerW: 0,
  electronicsPowerW: 8.8,
  winchPowerW: 0,
  cpuTempC: 38.2,
  internalTempC: 22.4,
  leakDetected: false,
  uptimeSeconds: 0,
  gnssLock: true,
  gnssSatellites: 18,
  gnssHdop: 0.8,
  currentWaypointIndex: 1,
  controlMode: 'AUTONOMOUS',
  emergencyStop: false
};

const INITIAL_POD: PodState = {
  status: 'READY',
  depthCurrentM: 0,
  depthTargetM: 50.0,
  winchSpeedMps: 0,
  cableTensionN: 0,
  maxWinchDepthM: 100.0,
  tetherLengthM: 0,
  activeSampling: false,
  verticalProfilePoints: []
};

const INITIAL_ANOMALY: AnomalyState = {
  active: false,
  score: 0.12,
  level: 'NORMAL',
  triggerReason: 'Surface multi-sensor baseline nominal.',
  contributingSensors: [],
  persistenceCount: 0,
  persistenceThreshold: 2,
  highestScoreObserved: 0.12
};

const INITIAL_DECISION: DecisionState = {
  active: true,
  recommendation: 'CONTINUE_SURFACE_MONITORING',
  rationale: 'Nominal surface baseline monitoring.',
  utilityScore: 55,
  inputs: {
    scientificValue: 15,
    anomalySeverity: 12,
    batteryLevel: 96,
    solarAvailability: 85,
    commAvailability: 88,
    weatherRisk: 18
  },
  timestamp: Date.now(),
  explainedSteps: []
};

const INITIAL_SCORE: MissionScore = {
  totalScore: 7850,
  scientificValuePct: 88,
  energyEfficiencyPct: 94,
  dataQualityPct: 98,
  safetyPct: 100,
  samplesCollected: 0,
  profilesCompleted: 0,
  anomaliesInvestigated: 0,
  dataTransmittedKb: 12.4
};

const INITIAL_FAILURES: FailureFlags = {
  gnssLoss: false,
  commLoss: false,
  lowBatteryForced: false,
  sensorDriftActive: false,
  turbiditySensorFail: false,
  winchMotorFail: false,
  thrusterDegraded: false,
  extremeWaves: false
};

const INITIAL_KEYBOARD: KeyboardState = {
  w: false,
  a: false,
  s: false,
  d: false,
  shift: false,
  space: false,
  x: false
};

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  isRunning: true,
  simSpeed: 1.0,
  simTime: 0,
  missionState: 'AUTONOMOUS_NAVIGATION',
  missionStateTimer: 0,

  keyboardState: INITIAL_KEYBOARD,
  activeKeyCommand: 'CONTROLS READY',
  controlsActive: true,

  activeDataLayer: 'NONE',
  mapSettings: {
    showGrid: true,
    showWaypoints: true,
    showAnomalies: true,
    showExistingSystems: true,
    showSurveyTrail: true,
    showBathymetry: true,
    measureMode: false,
    autoFollow: true
  },
  surveyTrail: [{ x: 0, z: 0 }],
  measurePoints: [],

  vehicle: INITIAL_VEHICLE,
  pod: INITIAL_POD,
  env: SCENARIO_PRESETS.LOW_OXYGEN,
  anomaly: INITIAL_ANOMALY,
  decision: INITIAL_DECISION,
  comms: createInitialCommunicationState(),
  score: INITIAL_SCORE,
  failures: INITIAL_FAILURES,
  waypoints: INITIAL_WAYPOINTS,
  sensorHistory: [],
  missionLogs: [
    {
      id: 'log-1',
      timestamp: Date.now(),
      text: 'O-TREX Mission Initialized. Autopilot armed. Keyboard controls active (WASD/Shift/Space/R/P).',
      type: 'INFO'
    }
  ],

  graphicsQuality: 'HIGH',
  setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),

  isDarkMode: true,
  viewportMode: '3D',
  cameraMode: 'FOLLOW',
  activeModal: null,
  activeDrawer: null,
  showWASDOverlay: false,
  selectedHardwareId: null,
  selectedCompetitorId: null,
  judgeTourStep: 0,
  isLeftPanelOpen: false,
  isRightPanelOpen: false,
  isDecisionBannerDismissed: false,
  showPodOverlay: false,

  bomItems: DEFAULT_BOM_ITEMS,
  inrExchangeRate: 85.0,
  contingencyPct: 15,

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  reset: () =>
    set({
      simTime: 0,
      missionState: 'MISSION_INITIALIZATION',
      missionStateTimer: 0,
      vehicle: { ...INITIAL_VEHICLE },
      pod: { ...INITIAL_POD, verticalProfilePoints: [] },
      anomaly: { ...INITIAL_ANOMALY },
      decision: { ...INITIAL_DECISION },
      comms: createInitialCommunicationState(),
      score: { ...INITIAL_SCORE },
      failures: { ...INITIAL_FAILURES },
      keyboardState: { ...INITIAL_KEYBOARD },
      surveyTrail: [{ x: 0, z: 0 }],
      measurePoints: [],
      sensorHistory: [],
      isDecisionBannerDismissed: false,
      showPodOverlay: false,
      missionLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          text: 'Simulation reset to Initial State. Ready for autonomous or manual deployment.',
          type: 'INFO'
        }
      ]
    }),

  setSpeed: (speed) => set({ simSpeed: speed }),
  setViewportMode: (mode) => set({ viewportMode: mode }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  toggleDarkMode: () => {
    const next = !get().isDarkMode;
    set({ isDarkMode: next });
    const root = document.documentElement;
    if (next) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
  },
  toggleLeftPanel: () => set((s) => ({ isLeftPanelOpen: !s.isLeftPanelOpen })),
  setScenario: (scenarioId) => {
    const nextEnv = SCENARIO_PRESETS[scenarioId] || SCENARIO_PRESETS.BASELINE;
    set({
      env: nextEnv,
      missionLogs: [
        ...get().missionLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          text: `Scenario switched to: ${nextEnv.name}`,
          type: 'INFO'
        }
      ]
    });
  },

  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),
  setLeftPanelOpen: (open) => set({ isLeftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ isRightPanelOpen: open }),
  setDecisionBannerDismissed: (dismissed) => set({ isDecisionBannerDismissed: dismissed }),
  setShowPodOverlay: (show) => set({ showPodOverlay: show }),
  openModal: (modal) => set({ activeModal: modal, activeDrawer: null }),
  closeModal: () => set({ activeModal: null }),
  toggleModal: (modal) =>
    set((state) => ({
      activeModal: state.activeModal === modal ? null : modal,
      activeDrawer: null
    })),
  cycleCameraMode: () => {
    const modes: CameraViewMode[] = [
      'FOLLOW',
      'HARDWARE',
      'UNDERWATER_POD',
      'SIDE',
      'TOP_DOWN',
      'FREE'
    ];
    const currentIdx = modes.indexOf(get().cameraMode);
    const nextIdx = (currentIdx + 1) % modes.length;
    set({ cameraMode: modes[nextIdx] });
  },
  toggleControlMode: () => {
    const current = get().vehicle.controlMode;
    const next = current === 'MANUAL' ? 'AUTONOMOUS' : 'MANUAL';
    get().setControlMode(next);
  },
  openDrawer: (drawer) => set({ activeDrawer: drawer, activeModal: null }),
  closeDrawer: () => set({ activeDrawer: null }),
  toggleDrawer: (drawer) =>
    set((state) => ({
      activeDrawer: state.activeDrawer === drawer ? null : drawer,
      activeModal: null
    })),
  toggleWASDOverlay: () => set((state) => ({ showWASDOverlay: !state.showWASDOverlay })),
  selectHardware: (id) => set({ selectedHardwareId: id, activeModal: id ? 'HARDWARE' : get().activeModal }),
  selectCompetitor: (id) => set({ selectedCompetitorId: id, activeModal: id ? 'COMPETITORS' : get().activeModal }),
  setJudgeTourStep: (step) => set({ judgeTourStep: step }),

  // 2D Map Actions
  setActiveDataLayer: (layer) => set({ activeDataLayer: layer }),
  toggleMapSetting: (key) =>
    set((state) => ({
      mapSettings: {
        ...state.mapSettings,
        [key]: !state.mapSettings[key]
      }
    })),
  setMeasurePoint: (pt) =>
    set((state) => ({
      measurePoints: state.measurePoints.length >= 2 ? [pt] : [...state.measurePoints, pt]
    })),
  clearMeasurement: () => set({ measurePoints: [] }),

  addWaypoint: (latKm, lonKm, label) => {
    const currentWPs = get().waypoints;
    const newIdx = currentWPs.length + 1;
    const newWP: Waypoint = {
      id: `wp-${Date.now()}`,
      lat: latKm,
      lon: lonKm,
      label: label || `WP${newIdx.toString().padStart(2, '0')} (${latKm.toFixed(1)}k, ${lonKm.toFixed(1)}k)`,
      reached: false,
      type: 'SURFACE_PATROL'
    };
    set({
      waypoints: [...currentWPs, newWP],
      missionLogs: [
        ...get().missionLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          text: `Waypoint added: ${newWP.label}`,
          type: 'INFO'
        }
      ]
    });
  },

  removeWaypoint: (id) => {
    set({
      waypoints: get().waypoints.filter((w) => w.id !== id)
    });
  },

  clearRoute: () => {
    set({
      waypoints: [],
      missionLogs: [
        ...get().missionLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          text: 'Mission route cleared. Ready for custom waypoint planning.',
          type: 'INFO'
        }
      ]
    });
  },

  returnHome: () => {
    const homeWP: Waypoint = {
      id: `wp-home-${Date.now()}`,
      lat: 0,
      lon: 0,
      label: 'RETURN TO BASE [0,0]',
      reached: false,
      type: 'RETURN_BASE'
    };
    set({
      waypoints: [homeWP],
      vehicle: {
        ...get().vehicle,
        currentWaypointIndex: 0,
        controlMode: 'AUTONOMOUS'
      },
      missionState: 'MISSION_RETURN',
      missionLogs: [
        ...get().missionLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          text: 'SAFETY OVERRIDE: Returning directly to Base coordinates [0, 0].',
          type: 'DECISION'
        }
      ]
    });
  },

  triggerAnomaly: () => {
    const { env, vehicle } = get();
    const updatedEnv: EnvironmentState = {
      ...env,
      anomalyRegion: {
        ...env.anomalyRegion,
        active: true,
        centerSimX: vehicle.simX,
        centerSimZ: vehicle.simZ,
        radiusM: 700.0,
        tempDeltaC: 3.5,
        doDeltaMgL: -5.2,
        turbidityDeltaNtu: 3.8
      }
    };
    set({
      env: updatedEnv,
      missionLogs: [
        ...get().missionLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          text: 'MANUAL TRIGGER: Synthetic marine anomaly injected at vehicle coordinates.',
          type: 'ANOMALY'
        }
      ]
    });
  },

  // Direct Sensor Pod Control Actions
  setTargetDepth: (depth) => {
    const safeDepth = Math.max(1, Math.min(100, depth));
    set({
      pod: {
        ...get().pod,
        depthTargetM: safeDepth
      }
    });
  },

  manualDeployPod: (targetDepth = 50.0) => {
    const { pod } = get();
    set({
      pod: {
        ...pod,
        status: 'DEPLOYING',
        depthTargetM: targetDepth
      },
      cameraMode: 'UNDERWATER_POD',
      showPodOverlay: true,
      missionLogs: [
        ...get().missionLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          text: `Pod Deployment initiated to target depth ${targetDepth}m. Camera transitioned to subsurface tracking.`,
          type: 'DECISION'
        }
      ]
    });
  },

  lowerPod: () => {
    const { pod } = get();
    set({
      pod: {
        ...pod,
        status: 'LOWERING'
      }
    });
  },

  holdPodDepth: () => {
    const { pod } = get();
    set({
      pod: {
        ...pod,
        status: 'HOLDING_DEPTH',
        winchSpeedMps: 0
      },
      missionLogs: [
        ...get().missionLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          text: `Pod winch paused: holding station at depth ${pod.depthCurrentM.toFixed(1)}m.`,
          type: 'INFO'
        }
      ]
    });
  },

  resumePodDescent: () => {
    const { pod } = get();
    set({
      pod: {
        ...pod,
        status: 'LOWERING'
      }
    });
  },

  manualRetractPod: () => {
    const { pod } = get();
    set({
      pod: {
        ...pod,
        status: 'RETRACTING'
      },
      missionLogs: [
        ...get().missionLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          text: 'Pod winch retraction initiated.',
          type: 'DECISION'
        }
      ]
    });
  },

  stowPod: () => {
    const { pod } = get();
    set({
      pod: {
        ...pod,
        status: 'RETRACTING'
      }
    });
  },

  togglePod: () => {
    const { pod, manualDeployPod, manualRetractPod } = get();
    if (pod.status === 'READY' || pod.status === 'RECOVERED') {
      manualDeployPod(pod.depthTargetM || 50.0);
      set({ cameraMode: 'UNDERWATER_POD', showPodOverlay: true });
    } else {
      manualRetractPod();
      set({ cameraMode: 'FOLLOW' });
    }
  },

  // Manual Keyboard / Pilot Controls
  setKeyDown: (key) => {
    const k = key.toLowerCase();
    const currentKeys = { ...get().keyboardState };
    let commandLabel = get().activeKeyCommand;

    if (k === 'w') {
      currentKeys.w = true;
      commandLabel = currentKeys.shift ? 'W + SHIFT — BOOST FORWARD' : 'W — FORWARD';
    } else if (k === 's') {
      currentKeys.s = true;
      commandLabel = 'S — REVERSE / BRAKE';
    } else if (k === 'a') {
      currentKeys.a = true;
      commandLabel = 'A — STEER PORT (LEFT)';
    } else if (k === 'd') {
      currentKeys.d = true;
      commandLabel = 'D — STEER STARBOARD (RIGHT)';
    } else if (k === 'shift') {
      currentKeys.shift = true;
      commandLabel = currentKeys.w ? 'W + SHIFT — BOOST FORWARD' : 'SHIFT — BOOST READY';
    } else if (k === ' ') {
      currentKeys.space = true;
      commandLabel = 'SPACE — EMERGENCY STOP';
      get().emergencyStop();
    } else if (k === 'x' || k === 'p') {
      currentKeys.x = true;
      commandLabel = 'X — DEPLOY SENSOR POD (CAM)';
      get().togglePod();
    }

    set({
      keyboardState: currentKeys,
      activeKeyCommand: commandLabel,
      vehicle: {
        ...get().vehicle,
        controlMode: 'MANUAL',
        emergencyStop: k === ' ' ? true : get().vehicle.emergencyStop
      }
    });
  },

  setKeyUp: (key) => {
    const k = key.toLowerCase();
    const currentKeys = { ...get().keyboardState };

    if (k === 'w') currentKeys.w = false;
    else if (k === 's') currentKeys.s = false;
    else if (k === 'a') currentKeys.a = false;
    else if (k === 'd') currentKeys.d = false;
    else if (k === 'shift') currentKeys.shift = false;
    else if (k === ' ') currentKeys.space = false;
    else if (k === 'x' || k === 'p') currentKeys.x = false;

    let commandLabel = 'CONTROLS READY';
    if (currentKeys.w) commandLabel = currentKeys.shift ? 'W + SHIFT — BOOST FORWARD' : 'W — FORWARD';
    else if (currentKeys.s) commandLabel = 'S — REVERSE / BRAKE';
    else if (currentKeys.a) commandLabel = 'A — STEER PORT';
    else if (currentKeys.d) commandLabel = 'D — STEER STARBOARD';

    set({
      keyboardState: currentKeys,
      activeKeyCommand: commandLabel
    });
  },

  setControlMode: (mode) => {
    set({
      vehicle: {
        ...get().vehicle,
        controlMode: mode,
        emergencyStop: false
      },
      missionLogs: [
        ...get().missionLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          text: `Control Mode switched to: ${mode}`,
          type: 'INFO'
        }
      ]
    });
  },

  emergencyStop: () => {
    set({
      vehicle: {
        ...get().vehicle,
        speedKnots: 0,
        targetSpeedKnots: 0,
        throttlePct: 0,
        rudderPct: 0,
        emergencyStop: true
      },
      missionState: 'EMERGENCY_STOP',
      activeKeyCommand: 'EMERGENCY STOP ENGAGED',
      missionLogs: [
        ...get().missionLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          text: 'EMERGENCY STOP TRIGGERED: Propulsion immediately cut.',
          type: 'ANOMALY'
        }
      ]
    });
  },

  clearEmergencyStop: () => {
    set({
      vehicle: {
        ...get().vehicle,
        emergencyStop: false
      },
      missionState: 'AUTONOMOUS_NAVIGATION',
      activeKeyCommand: 'CONTROLS READY'
    });
  },

  recenterVehicle: () => {
    set({
      vehicle: {
        ...get().vehicle,
        simX: 0,
        simZ: 0,
        headingDeg: 45,
        targetHeadingDeg: 45,
        speedKnots: 0,
        targetSpeedKnots: 0,
        pitchDeg: 0,
        rollDeg: 0,
        yawDeg: 0,
        emergencyStop: false
      },
      activeKeyCommand: 'R — VEHICLE RECENTERED',
      missionLogs: [
        ...get().missionLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          text: 'Vehicle recentered to origin coordinates [0, 0] @ 45° heading.',
          type: 'INFO'
        }
      ]
    });
  },

  toggleFailure: (key) => {
    const { failures } = get();
    const nextVal = !failures[key];
    set({
      failures: { ...failures, [key]: nextVal },
      missionLogs: [
        ...get().missionLogs,
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          text: `SYSTEM FAULT INJECTION: ${String(key)} set to ${nextVal ? 'ACTIVE' : 'CLEARED'}.`,
          type: nextVal ? 'ANOMALY' : 'INFO'
        }
      ]
    });
  },

  updateBOMItem: (id, updates) => {
    set({
      bomItems: get().bomItems.map((item) => (item.id === id ? { ...item, ...updates } : item))
    });
  },

  setInrExchangeRate: (rate) => set({ inrExchangeRate: rate }),
  setContingencyPct: (pct) => set({ contingencyPct: pct }),

  tick: (dt) => {
    const state = get();
    if (!state.isRunning) return;

    const scaledDt = dt * state.simSpeed;
    const newSimTime = state.simTime + scaledDt;
    const newStateTimer = state.missionStateTimer + scaledDt;

    // Apply Failures modifications
    const effectiveEnv = state.failures.extremeWaves
      ? { ...state.env, waveHeightM: 3.8, windSpeedMs: 18.0 }
      : state.env;

    const sensorDrift = state.failures.sensorDriftActive ? 1.4 : 0.0;

    // 1. Update Vessel Physics (Autonomous or Manual WASD)
    const nextVehicle = updateVesselPhysics(
      state.vehicle,
      state.waypoints,
      effectiveEnv,
      scaledDt,
      newSimTime,
      state.keyboardState
    );

    if (state.failures.gnssLoss) {
      nextVehicle.gnssLock = false;
      nextVehicle.gnssSatellites = 3;
    }
    if (state.failures.lowBatteryForced) {
      nextVehicle.batterySOC = Math.max(5.0, nextVehicle.batterySOC - scaledDt * 2.5);
    }

    // 2. Surface Sensor Readings
    const surfaceReadingProps = calculateOceanPointProperties(
      nextVehicle.simX,
      nextVehicle.simZ,
      0, // surface
      effectiveEnv,
      sensorDrift
    );
    const surfaceReading: SensorReading = {
      id: `srf-${Date.now()}`,
      timestamp: Date.now(),
      ...surfaceReadingProps
    };

    if (state.failures.turbiditySensorFail) {
      surfaceReading.turbidityNtu = 999.0;
      surfaceReading.qualityFlag = 'INVALID';
      surfaceReading.qualityScore = 10;
    }

    // Append to history (keep max 120 readings)
    const updatedHistory = [...state.sensorHistory, surfaceReading].slice(-120);

    // 3. Update Pod Kinematics
    const { nextPodState, newReading: podDepthReading } = updatePodKinematics(
      state.pod,
      nextVehicle.simX,
      nextVehicle.simZ,
      effectiveEnv,
      scaledDt,
      sensorDrift
    );

    // 4. Anomaly Detection (TF-Lite Edge Simulator)
    const nextAnomaly = evaluateAnomalyState(
      podDepthReading || surfaceReading,
      effectiveEnv,
      state.anomaly
    );

    // 5. Decision Engine
    const nextDecision = runDecisionEngine(
      nextAnomaly,
      nextVehicle,
      state.comms,
      nextPodState,
      effectiveEnv
    );

    // 6. Mission State Machine Evaluation
    const smResult = evaluateMissionStateMachine(
      state.missionState,
      nextVehicle,
      nextAnomaly,
      nextDecision,
      nextPodState,
      state.comms,
      newStateTimer
    );

    let finalMissionState = smResult.nextMissionState;
    let finalStateTimer =
      finalMissionState !== state.missionState ? 0.0 : newStateTimer;

    // Apply state machine commands if not manual
    if (nextVehicle.controlMode !== 'MANUAL') {
      if (smResult.vehicleCommand) {
        nextVehicle.targetSpeedKnots = smResult.vehicleCommand.targetSpeedKnots;
      }
      if (smResult.podCommand) {
        if (smResult.podCommand.action === 'DEPLOY') {
          nextPodState.status = 'DEPLOYING';
          nextPodState.depthTargetM = smResult.podCommand.targetDepthM || 50.0;
        } else if (smResult.podCommand.action === 'STOW') {
          nextPodState.status = 'RETRACTING';
        }
      }
    }

    // Log messages
    let updatedLogs = state.missionLogs;
    if (smResult.logMessage) {
      updatedLogs = [
        ...state.missionLogs,
        {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          text: smResult.logMessage,
          type: (finalMissionState.includes('ANOMALY')
            ? 'ANOMALY'
            : finalMissionState.includes('DECISION')
            ? 'DECISION'
            : 'INFO') as 'ANOMALY' | 'INFO' | 'DECISION' | 'COMM'
        }
      ].slice(-50);
    }

    // 7. Communications Queue Processing
    let commsState = state.comms;
    if (smResult.generatedPacket) {
      commsState = {
        ...commsState,
        packets: [...commsState.packets, smResult.generatedPacket],
        queuedPacketsCount: commsState.queuedPacketsCount + 1,
        queuedBytes: commsState.queuedBytes + smResult.generatedPacket.sizeBytes
      };
    }

    const { nextState: nextComms, isTransmitting } = processCommunicationQueue(
      commsState,
      scaledDt,
      state.failures.commLoss
    );

    // 8. Energy & Battery Power Integration
    const powerBudget = calculatePowerBudget(
      nextVehicle.speedKnots,
      effectiveEnv.solarIrradianceWm2,
      nextPodState.status,
      nextComms.activeBearer,
      isTransmitting,
      effectiveEnv.hasIceFloes
    );

    const { batterySOC, batteryVoltageV, currentDrawA } = updateBatteryState(
      nextVehicle.batterySOC,
      powerBudget.netPowerW,
      scaledDt
    );

    nextVehicle.solarPowerW = powerBudget.solarPowerW;
    nextVehicle.motorPowerW = powerBudget.propulsionPowerW;
    nextVehicle.electronicsPowerW = powerBudget.computePowerW;
    nextVehicle.winchPowerW = powerBudget.winchPowerW;
    nextVehicle.batterySOC = batterySOC;
    nextVehicle.batteryVoltageV = batteryVoltageV;
    nextVehicle.currentDrawA = currentDrawA;

    // 9. Mission Scoring Update
    const sampleGain = 1;
    const profileGain = nextPodState.status === 'PROFILING' ? 1 : 0;
    const anomalyGain = nextAnomaly.active ? 1 : 0;
    const totalScoreDelta =
      sampleGain * 2 + profileGain * 25 + anomalyGain * 15 - (nextVehicle.batterySOC < 20 ? 10 : 0);

    const nextScore: MissionScore = {
      totalScore: state.score.totalScore + totalScoreDelta,
      scientificValuePct: Math.min(100, Math.round(nextAnomaly.highestScoreObserved * 100)),
      energyEfficiencyPct: Math.max(70, Math.min(99, Math.round(98 - (100 - nextVehicle.batterySOC) * 0.2))),
      dataQualityPct: Math.round(surfaceReading.qualityScore),
      safetyPct: nextVehicle.batterySOC < 15 || nextVehicle.leakDetected ? 45 : 100,
      samplesCollected: state.score.samplesCollected + sampleGain,
      profilesCompleted: state.score.profilesCompleted + (nextPodState.verticalProfilePoints.length > 0 ? 1 : 0),
      anomaliesInvestigated: state.score.anomaliesInvestigated + (nextAnomaly.active ? 1 : 0),
      dataTransmittedKb: Number((nextComms.transmittedBytes / 1024).toFixed(1))
    };

    // 10. Update Survey Trail
    let updatedSurveyTrail = state.surveyTrail;
    const lastTrailPt = updatedSurveyTrail[updatedSurveyTrail.length - 1];
    if (
      !lastTrailPt ||
      Math.hypot(nextVehicle.simX - lastTrailPt.x, nextVehicle.simZ - lastTrailPt.z) > 15.0
    ) {
      updatedSurveyTrail = [...updatedSurveyTrail, { x: nextVehicle.simX, z: nextVehicle.simZ }].slice(-2000);
    }

    set({
      simTime: newSimTime,
      missionState: finalMissionState,
      missionStateTimer: finalStateTimer,
      vehicle: nextVehicle,
      pod: nextPodState,
      anomaly: nextAnomaly,
      decision: nextDecision,
      comms: nextComms,
      score: nextScore,
      surveyTrail: updatedSurveyTrail,
      sensorHistory: updatedHistory,
      missionLogs: updatedLogs
    });
  }
}));
