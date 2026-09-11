import {
  MissionStateType,
  VehicleState,
  AnomalyState,
  DecisionState,
  PodState,
  CommunicationState,
  DataPacket
} from '../../types/simulation';
import { generatePriorityPacket } from '../models/commsModel';

export interface StateMachineResult {
  nextMissionState: MissionStateType;
  vehicleCommand: { targetSpeedKnots: number };
  podCommand?: { action: 'STOW' | 'DEPLOY' | 'HOLD'; targetDepthM?: number };
  generatedPacket?: DataPacket;
  logMessage?: string;
}

export function evaluateMissionStateMachine(
  currentState: MissionStateType,
  vehicle: VehicleState,
  anomaly: AnomalyState,
  decision: DecisionState,
  pod: PodState,
  comms: CommunicationState,
  stateTimerSec: number
): StateMachineResult {
  // If in Emergency Stop
  if (vehicle.emergencyStop) {
    return {
      nextMissionState: 'EMERGENCY_STOP',
      vehicleCommand: { targetSpeedKnots: 0 },
      logMessage: 'EMERGENCY STOP ENGAGED: Propulsion cut. All thrusters offline.'
    };
  }

  // If in Manual Pilot Mode
  if (vehicle.controlMode === 'MANUAL') {
    return {
      nextMissionState: 'MANUAL_PILOT',
      vehicleCommand: { targetSpeedKnots: vehicle.speedKnots }
    };
  }

  switch (currentState) {
    case 'IDLE':
      return {
        nextMissionState: 'IDLE',
        vehicleCommand: { targetSpeedKnots: 0 }
      };

    case 'MISSION_INITIALIZATION':
      if (stateTimerSec >= 3.0) {
        return {
          nextMissionState: 'AUTONOMOUS_NAVIGATION',
          vehicleCommand: { targetSpeedKnots: 4.2 },
          logMessage: 'GNSS RTK Fix verified (18 sats). Pixhawk autopilot armed. Waypoint route engaged.'
        };
      }
      return {
        nextMissionState: 'MISSION_INITIALIZATION',
        vehicleCommand: { targetSpeedKnots: 0 }
      };

    case 'AUTONOMOUS_NAVIGATION':
      if (stateTimerSec >= 5.0) {
        return {
          nextMissionState: 'SURFACE_MONITORING',
          vehicleCommand: { targetSpeedKnots: 4.0 },
          logMessage: 'Entered primary observation transect. Surface multi-parameter sensor streaming active.'
        };
      }
      return {
        nextMissionState: 'AUTONOMOUS_NAVIGATION',
        vehicleCommand: { targetSpeedKnots: 4.2 }
      };

    case 'SURFACE_MONITORING':
      if (anomaly.score >= 0.68 && anomaly.persistenceCount >= 2) {
        return {
          nextMissionState: 'ANOMALY_ANALYSIS',
          vehicleCommand: { targetSpeedKnots: 1.8 },
          logMessage: `Edge AI Anomaly Detector triggered! Score: ${anomaly.score.toFixed(2)}. Transitioning to Anomaly Analysis.`
        };
      }
      return {
        nextMissionState: 'SURFACE_MONITORING',
        vehicleCommand: { targetSpeedKnots: 4.0 }
      };

    case 'ANOMALY_ANALYSIS':
      if (stateTimerSec >= 2.5) {
        return {
          nextMissionState: 'DECISION_ENGINE',
          vehicleCommand: { targetSpeedKnots: 0.8 },
          logMessage: 'Multi-parameter feature vector confirmed. Feeding scientific utility metrics to Decision Engine.'
        };
      }
      return {
        nextMissionState: 'ANOMALY_ANALYSIS',
        vehicleCommand: { targetSpeedKnots: 1.8 }
      };

    case 'DECISION_ENGINE':
      if (stateTimerSec >= 2.0) {
        if (decision.recommendation === 'DEPLOY_SENSOR_POD') {
          return {
            nextMissionState: 'VERTICAL_PROFILING',
            vehicleCommand: { targetSpeedKnots: 0.0 },
            podCommand: { action: 'DEPLOY', targetDepthM: 50.0 },
            logMessage: 'Decision Engine approved vertical profiling. Winch spooling out to 50m target depth.'
          };
        } else if (decision.recommendation === 'RETURN_TO_BASE') {
          return {
            nextMissionState: 'MISSION_RETURN',
            vehicleCommand: { targetSpeedKnots: 4.2 },
            logMessage: 'Decision Engine triggered Return-to-Base due to safety margin constraint.'
          };
        } else {
          return {
            nextMissionState: 'SURFACE_MONITORING',
            vehicleCommand: { targetSpeedKnots: 4.0 },
            logMessage: 'Decision Engine chose to maintain surface patrol.'
          };
        }
      }
      return {
        nextMissionState: 'DECISION_ENGINE',
        vehicleCommand: { targetSpeedKnots: 0.8 }
      };

    case 'VERTICAL_PROFILING':
      if (pod.status === 'PROFILING' && stateTimerSec >= 3.0) {
        return {
          nextMissionState: 'DATA_PROCESSING',
          vehicleCommand: { targetSpeedKnots: 0.0 },
          podCommand: { action: 'STOW' },
          logMessage: 'Vertical CTD/DO profile column sampled (0m-50m). Initiating winch recovery and onboard data processing.'
        };
      }
      return {
        nextMissionState: 'VERTICAL_PROFILING',
        vehicleCommand: { targetSpeedKnots: 0.0 }
      };

    case 'DATA_PROCESSING':
      if (stateTimerSec >= 2.0 && (pod.status === 'RECOVERED' || pod.status === 'READY' || pod.depthCurrentM <= 0.5)) {
        return {
          nextMissionState: 'DATA_PRIORITIZATION',
          vehicleCommand: { targetSpeedKnots: 1.5 },
          logMessage: 'Profile QA/QC passed. Anomaly layer verified at 18.5m depth. Assigning transmission priority.'
        };
      }
      return {
        nextMissionState: 'DATA_PROCESSING',
        vehicleCommand: { targetSpeedKnots: 0.0 }
      };

    case 'DATA_PRIORITIZATION':
      if (stateTimerSec >= 1.5) {
        const pkt = generatePriorityPacket(
          'P1_CRITICAL',
          'ANOMALY_PROFILE_CTD_DO',
          'Hypoxic subsurface layer detected (DO: 2.8mg/L @ 18.5m depth, ΔT=3.2°C)',
          512
        );
        return {
          nextMissionState: 'DATA_TRANSMISSION',
          vehicleCommand: { targetSpeedKnots: 2.5 },
          generatedPacket: pkt,
          logMessage: 'Generated P1 Critical Anomaly telemetry packet. Routing to active Satellite/LoRa transmitter.'
        };
      }
      return {
        nextMissionState: 'DATA_PRIORITIZATION',
        vehicleCommand: { targetSpeedKnots: 1.5 }
      };

    case 'DATA_TRANSMISSION':
      if (stateTimerSec >= 3.0 || comms.queuedPacketsCount === 0) {
        return {
          nextMissionState: 'MISSION_CONTINUE',
          vehicleCommand: { targetSpeedKnots: 4.0 },
          logMessage: 'Telemetry packet successfully uplinked to Satellite constellation. Resuming adaptive patrol.'
        };
      }
      return {
        nextMissionState: 'DATA_TRANSMISSION',
        vehicleCommand: { targetSpeedKnots: 2.5 }
      };

    case 'MISSION_CONTINUE':
      if (stateTimerSec >= 4.0) {
        return {
          nextMissionState: 'SURFACE_MONITORING',
          vehicleCommand: { targetSpeedKnots: 4.0 },
          logMessage: 'Transect leg complete. Continuing autonomous adaptive observation.'
        };
      }
      return {
        nextMissionState: 'MISSION_CONTINUE',
        vehicleCommand: { targetSpeedKnots: 4.0 }
      };

    case 'MISSION_RETURN':
      return {
        nextMissionState: 'MISSION_RETURN',
        vehicleCommand: { targetSpeedKnots: 4.2 }
      };

    default:
      return {
        nextMissionState: currentState,
        vehicleCommand: { targetSpeedKnots: 3.5 }
      };
  }
}
