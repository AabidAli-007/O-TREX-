import React from 'react';
import {
  X,
  Navigation,
  Cpu,
  Zap
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { formatSeconds } from '../../utils/formatters';

export const MissionDrawer: React.FC = () => {
  const closeDrawer = useSimulationStore((state) => state.closeDrawer);
  const missionState = useSimulationStore((state) => state.missionState);
  const missionStateTimer = useSimulationStore((state) => state.missionStateTimer);
  const anomaly = useSimulationStore((state) => state.anomaly);
  const decision = useSimulationStore((state) => state.decision);
  const waypoints = useSimulationStore((state) => state.waypoints);
  const vehicle = useSimulationStore((state) => state.vehicle);
  const missionLogs = useSimulationStore((state) => state.missionLogs);
  const triggerAnomaly = useSimulationStore((state) => state.triggerAnomaly);

  return (
    <div className="w-96 bg-navy-950/95 backdrop-blur-lg border-l border-navy-800 h-full flex flex-col font-sans text-xs select-none shadow-2xl text-gray-200">
      {/* Header */}
      <div className="h-12 bg-navy-900 px-4 flex items-center justify-between border-b border-navy-800">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-orange-400" />
          <span className="font-extrabold text-white text-sm">MISSION & DECISION</span>
        </div>
        <button
          onClick={closeDrawer}
          className="p-1 hover:bg-navy-800 rounded text-gray-400 hover:text-white"
          title="Close Drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* 1. Autonomous State Machine Card */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">STATE MACHINE</span>
            <span className="text-[10px] text-orange-400 font-bold">
              T+{formatSeconds(missionStateTimer)}
            </span>
          </div>

          <div className="bg-navy-950 p-2.5 rounded border border-navy-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-400">ACTIVE STATE</div>
              <div className="font-extrabold text-white text-xs">
                {missionState.replace(/_/g, ' ')}
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />
          </div>

          <div className="text-[10px] text-gray-300">
            {missionState === 'AUTONOMOUS_NAVIGATION' && 'Cruising along transect waypoints, monitoring multi-sensor baseline.'}
            {missionState === 'SURFACE_MONITORING' && 'High-frequency surface oceanographic sampling active.'}
            {missionState === 'ANOMALY_ANALYSIS' && 'Multi-sensor anomaly detected. Edge AI evaluating persistence and profile urgency.'}
            {missionState === 'VERTICAL_PROFILING' && 'Winch active: profiling water column down to target thermocline depth.'}
            {missionState === 'DATA_TRANSMISSION' && 'Tiered RF transmission: LoRa / Iridium transmitting compressed profile packet.'}
            {missionState === 'MANUAL_PILOT' && 'Direct human-in-the-loop keyboard/WASD override active.'}
          </div>
        </div>

        {/* 2. Edge AI Anomaly Detector */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-orange-400" />
              <span>EDGE AI ANOMALY DETECTOR</span>
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                anomaly.level === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                  : anomaly.level === 'ANOMALY'
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                  : 'bg-navy-950 text-gray-400 border-navy-800'
              }`}
            >
              {anomaly.level} ({(anomaly.score).toFixed(2)})
            </span>
          </div>

          {/* Anomaly Progress Bar */}
          <div className="w-full bg-navy-950 h-2 rounded-full overflow-hidden border border-navy-800">
            <div
              className={`h-full transition-all duration-300 ${
                anomaly.score > 0.7
                  ? 'bg-red-500'
                  : anomaly.score > 0.4
                  ? 'bg-orange-500'
                  : 'bg-orange-400'
              }`}
              style={{ width: `${Math.min(100, Math.round(anomaly.score * 100))}%` }}
            />
          </div>

          <div className="bg-navy-950 p-2 rounded text-[10px] text-gray-300 leading-tight">
            {anomaly.triggerReason}
          </div>

          {/* Manual Anomaly Trigger for Demos */}
          <button
            onClick={triggerAnomaly}
            className="w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/40 p-1.5 rounded flex items-center justify-center gap-1.5 font-bold transition-all text-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>TRIGGER DEMO ANOMALY INJECTION</span>
          </button>
        </div>

        {/* 3. Edge Decision Engine Rule Evaluation */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">EDGE DECISION ENGINE</span>
            <span className="text-[10px] text-orange-400 font-bold">
              UTILITY: {(decision.utilityScore).toFixed(0)}/100
            </span>
          </div>

          <div className="bg-navy-950 p-2 rounded text-[10px] text-white flex items-center justify-between">
            <span className="text-gray-400">RECOMMENDATION:</span>
            <span className="font-extrabold text-orange-400">{decision.recommendation.replace(/_/g, ' ')}</span>
          </div>

          <div className="text-[10px] text-gray-300 bg-navy-950/60 p-2 rounded border border-navy-800/80">
            {decision.rationale}
          </div>
        </div>

        {/* 4. Transect Waypoints */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">WAYPOINT TRANSECT</span>
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
            {waypoints.map((wp, idx) => (
              <div
                key={wp.id}
                className={`p-1.5 rounded text-[10px] flex items-center justify-between border ${
                  vehicle.currentWaypointIndex === idx
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 font-bold'
                    : wp.reached
                    ? 'bg-navy-950/80 text-gray-400 border-navy-800 line-through'
                    : 'bg-navy-950 text-gray-300 border-navy-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-500">#{idx + 1}</span>
                  <span>{wp.label}</span>
                </div>
                {vehicle.currentWaypointIndex === idx && (
                  <span className="text-[9px] bg-orange-500 text-navy-950 px-1 rounded font-extrabold">
                    TARGET
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 5. Live Mission Logs */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">EVENT LOGS</span>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto text-[10px]">
            {missionLogs.slice(-6).reverse().map((log) => (
              <div key={log.id} className="text-gray-300 bg-navy-950 p-1.5 rounded border border-navy-800">
                <span className="text-orange-400 mr-1">[{log.type}]</span>
                <span>{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
