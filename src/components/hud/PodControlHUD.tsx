import React from 'react';
import {
  Anchor,
  ArrowDownCircle,
  ArrowUpCircle,
  PauseCircle,
  PlayCircle,
  Sliders
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const PodControlHUD: React.FC = () => {
  const pod = useSimulationStore((state) => state.pod);
  const setTargetDepth = useSimulationStore((state) => state.setTargetDepth);
  const manualDeployPod = useSimulationStore((state) => state.manualDeployPod);
  const holdPodDepth = useSimulationStore((state) => state.holdPodDepth);
  const resumePodDescent = useSimulationStore((state) => state.resumePodDescent);
  const manualRetractPod = useSimulationStore((state) => state.manualRetractPod);

  const depthPresets = [10, 25, 35, 50, 75, 100];

  const getStatusColor = (st: string) => {
    if (st === 'PROFILING' || st === 'DEPLOYING' || st === 'LOWERING') return 'bg-orange text-black border-orange font-bold';
    if (st === 'HOLDING_DEPTH') return 'bg-orange/20 text-orange border-orange/40';
    if (st === 'RETRACTING') return 'bg-white/20 text-white border-white/40';
    return 'bg-navy-950 text-lightgray border-lightgray/30';
  };

  return (
    <div className="bg-navy/95 backdrop-blur-md border border-orange/40 rounded-xl p-3 shadow-2xl flex flex-col gap-2.5 text-xs font-sans select-none w-80">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-lightgray/20 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-navy-950 text-orange border border-orange/40">
            <Anchor className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white text-xs block">WINCH & SENSOR POD</span>
            <span className="text-[10px] text-lightgray/70 block -mt-0.5">Vertical Water Column Profiling</span>
          </div>
        </div>

        <span className={`text-[10px] px-2 py-0.5 rounded border ${getStatusColor(pod.status)}`}>
          {pod.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Real-Time Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center bg-black/60 p-2 rounded-lg border border-lightgray/20">
        <div>
          <span className="text-[9px] text-lightgray/70 block">CURRENT</span>
          <span className="text-sm font-bold text-orange">{pod.depthCurrentM.toFixed(1)} m</span>
        </div>
        <div>
          <span className="text-[9px] text-lightgray/70 block">TARGET</span>
          <span className="text-sm font-bold text-white">{pod.depthTargetM.toFixed(0)} m</span>
        </div>
        <div>
          <span className="text-[9px] text-lightgray/70 block">TENSION</span>
          <span className="text-sm font-bold text-white">{pod.cableTensionN.toFixed(1)} N</span>
        </div>
      </div>

      {/* Target Depth Selection & Presets */}
      <div>
        <div className="flex items-center justify-between text-[10px] text-lightgray/80 mb-1">
          <span className="flex items-center gap-1">
            <Sliders className="w-3 h-3 text-orange" />
            <span>SELECT TARGET DEPTH</span>
          </span>
          <span className="text-white font-bold">{pod.depthTargetM} m</span>
        </div>

        <div className="flex items-center gap-1 mb-2">
          {depthPresets.map((d) => (
            <button
              key={d}
              onClick={() => setTargetDepth(d)}
              className={`flex-1 py-1 rounded text-[10px] border transition-colors ${
                pod.depthTargetM === d
                  ? 'bg-orange text-black font-bold border-orange'
                  : 'bg-navy-950 text-lightgray border-lightgray/20 hover:text-white'
              }`}
            >
              {d}m
            </button>
          ))}
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={pod.depthTargetM}
          onChange={(e) => setTargetDepth(Number(e.target.value))}
          className="w-full accent-orange h-1.5 bg-navy-950 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Winch Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {pod.status === 'READY' || pod.status === 'RECOVERED' ? (
          <button
            onClick={() => manualDeployPod(pod.depthTargetM)}
            className="col-span-2 py-2 rounded-lg bg-orange hover:bg-orange-400 text-black font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-orange/30 transition-all active:scale-95 text-xs"
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>DEPLOY POD TO {pod.depthTargetM}m</span>
          </button>
        ) : (
          <>
            {pod.status === 'HOLDING_DEPTH' ? (
              <button
                onClick={resumePodDescent}
                className="py-1.5 rounded-lg bg-orange text-black font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>RESUME</span>
              </button>
            ) : (
              <button
                onClick={holdPodDepth}
                className="py-1.5 rounded-lg bg-navy-950 text-white hover:bg-navy-800 border border-lightgray/30 flex items-center justify-center gap-1 transition-all active:scale-95"
              >
                <PauseCircle className="w-3.5 h-3.5 text-orange" />
                <span>HOLD DEPTH</span>
              </button>
            )}

            <button
              onClick={manualRetractPod}
              className="py-1.5 rounded-lg bg-navy-950 text-white hover:bg-navy-800 border border-orange/40 flex items-center justify-center gap-1 transition-all active:scale-95"
            >
              <ArrowUpCircle className="w-3.5 h-3.5 text-orange" />
              <span>RETRACT POD</span>
            </button>
          </>
        )}
      </div>

      <div className="text-[9px] text-lightgray/60 flex items-center justify-between border-t border-lightgray/20 pt-1.5">
        <span>SPEED: {pod.winchSpeedMps > 0 ? `+${pod.winchSpeedMps.toFixed(1)} m/s` : pod.winchSpeedMps < 0 ? `${pod.winchSpeedMps.toFixed(1)} m/s` : 'STATION'}</span>
        <span>PROFILES: {pod.verticalProfilePoints.length} PTS</span>
      </div>
    </div>
  );
};
