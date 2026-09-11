import React from 'react';
import {
  Zap,
  Radio,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const MissionControls: React.FC = () => {
  const reset = useSimulationStore((state) => state.reset);
  const simSpeed = useSimulationStore((state) => state.simSpeed);
  const setSpeed = useSimulationStore((state) => state.setSpeed);
  const triggerAnomaly = useSimulationStore((state) => state.triggerAnomaly);
  const pod = useSimulationStore((state) => state.pod);
  const manualDeployPod = useSimulationStore((state) => state.manualDeployPod);
  const manualRetractPod = useSimulationStore((state) => state.manualRetractPod);

  return (
    <div className="bg-navy-900/95 backdrop-blur-md border border-navy-700 rounded-lg p-2.5 shadow-xl flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono select-none text-gray-200">
      {/* Simulation Speed Buttons */}
      <div className="flex items-center gap-1.5 bg-navy-950 p-1 rounded border border-navy-800">
        <span className="text-[10px] text-gray-400 px-1">SPEED:</span>
        {[0.5, 1.0, 2.0, 4.0].map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              simSpeed === s
                ? 'bg-orange-500 text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Main Interactive Mission Triggers */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Trigger Anomaly Button */}
        <button
          onClick={triggerAnomaly}
          className="bg-navy-950 hover:bg-orange-500 hover:text-white text-orange-400 border border-orange-500/40 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors active:scale-95 shadow-sm shadow-orange-500/10"
        >
          <Activity className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span>TRIGGER ANOMALY</span>
        </button>

        {/* Winch Pod Deployment Controls */}
        {pod.status === 'READY' || pod.status === 'RECOVERED' ? (
          <button
            onClick={() => manualDeployPod(50.0)}
            className="bg-navy-950 hover:bg-orange-500 hover:text-white text-orange-400 border border-orange-500/40 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors active:scale-95"
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-orange-400" />
            <span>DEPLOY POD (50m)</span>
          </button>
        ) : (
          <button
            onClick={manualRetractPod}
            className="bg-navy-950 hover:bg-orange-500 hover:text-white text-orange-400 border border-orange-500/40 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors active:scale-95"
          >
            <ArrowUpCircle className="w-3.5 h-3.5 text-orange-400" />
            <span>RETRACT POD</span>
          </button>
        )}

        {/* Fast Action: Demo Mission */}
        <button
          onClick={() => {
            reset();
            setTimeout(() => {
              triggerAnomaly();
            }, 1500);
          }}
          className="bg-navy-950 hover:bg-orange-500 hover:text-white text-orange-400 border border-orange-500/40 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors active:scale-95"
          title="Run complete 100-second autonomous mission sequence"
        >
          <Zap className="w-3.5 h-3.5 text-orange-400" />
          <span>RUN DEMO MISSION</span>
        </button>
      </div>

      {/* Quick Status Pill */}
      <div className="flex items-center gap-3 text-[11px] text-gray-400">
        <div className="flex items-center gap-1">
          <Radio className="w-3 h-3 text-orange-400" />
          <span>POD:</span>
          <span className="text-orange-400 font-bold">{pod.status} ({pod.depthCurrentM.toFixed(1)}m)</span>
        </div>
      </div>
    </div>
  );
};
