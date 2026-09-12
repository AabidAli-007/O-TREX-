import React from 'react';
import {
  X,
  Anchor,
  ArrowDown,
  ArrowUp,
  PauseCircle,
  PlayCircle,
  Sliders,
  Database
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const PodDrawer: React.FC = () => {
  const closeDrawer = useSimulationStore((state) => state.closeDrawer);
  const pod = useSimulationStore((state) => state.pod);
  const setTargetDepth = useSimulationStore((state) => state.setTargetDepth);
  const manualDeployPod = useSimulationStore((state) => state.manualDeployPod);
  const holdPodDepth = useSimulationStore((state) => state.holdPodDepth);
  const resumePodDescent = useSimulationStore((state) => state.resumePodDescent);
  const manualRetractPod = useSimulationStore((state) => state.manualRetractPod);
  const stowPod = useSimulationStore((state) => state.stowPod);

  return (
    <div className="w-96 bg-navy-950/95 backdrop-blur-lg border-l border-navy-800 h-full flex flex-col font-sans text-xs select-none shadow-2xl text-gray-200">
      {/* Header */}
      <div className="h-12 bg-navy-900 px-4 flex items-center justify-between border-b border-navy-800">
        <div className="flex items-center gap-2">
          <Anchor className="w-4 h-4 text-orange-400" />
          <span className="font-extrabold text-white text-sm">WINCH & SENSOR POD</span>
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
        {/* 1. Winch Kinematics Status */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">WINCH MECHANISM</span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                pod.status === 'HOLDING_DEPTH' || pod.status === 'PROFILING'
                  ? 'bg-orange-500 text-navy-950 border-orange-400'
                  : pod.status === 'LOWERING' || pod.status === 'RETRACTING' || pod.status === 'DEPLOYING'
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 animate-pulse'
                  : 'bg-navy-950 text-gray-300 border-navy-800'
              }`}
            >
              {pod.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-navy-950 p-2 rounded border border-navy-800">
              <div className="text-[10px] text-gray-400">CURRENT DEPTH</div>
              <div className="text-base font-extrabold text-white">
                {pod.depthCurrentM.toFixed(1)} <span className="text-xs text-gray-400">m</span>
              </div>
            </div>

            <div className="bg-navy-950 p-2 rounded border border-navy-800">
              <div className="text-[10px] text-gray-400">TARGET DEPTH</div>
              <div className="text-base font-extrabold text-orange-400">
                {pod.depthTargetM.toFixed(0)} <span className="text-xs text-gray-300">m</span>
              </div>
            </div>

            <div className="bg-navy-950 p-2 rounded border border-navy-800">
              <div className="text-[10px] text-gray-400">CABLE TENSION</div>
              <div className="text-xs font-bold text-white">
                {pod.cableTensionN.toFixed(1)} N (Safe)
              </div>
            </div>

            <div className="bg-navy-950 p-2 rounded border border-navy-800">
              <div className="text-[10px] text-gray-400">WINCH SPEED</div>
              <div className="text-xs font-bold text-white">
                {pod.winchSpeedMps.toFixed(2)} m/s
              </div>
            </div>
          </div>
        </div>

        {/* 2. Target Depth Slider & Control Steppers */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-orange-400" />
              <span>TARGET DEPTH CONTROLLER</span>
            </span>
            <span className="text-[11px] font-bold text-white">{pod.depthTargetM}m</span>
          </div>

          <input
            type="range"
            min={5}
            max={pod.maxWinchDepthM || 100}
            step={5}
            value={pod.depthTargetM}
            onChange={(e) => setTargetDepth(Number(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer"
          />

          <div className="flex justify-between text-[9px] text-gray-400">
            <span>Surface (0m)</span>
            <span>Thermocline (50m)</span>
            <span>Max (100m)</span>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => manualDeployPod(pod.depthTargetM)}
              className="bg-orange-500 hover:bg-orange-400 text-navy-950 font-extrabold p-2 rounded text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>DEPLOY WINCH</span>
            </button>

            {pod.status === 'LOWERING' ? (
              <button
                onClick={holdPodDepth}
                className="bg-navy-950 hover:bg-navy-800 text-orange-400 border border-orange-500/40 p-2 rounded text-xs flex items-center justify-center gap-1.5 font-bold"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>HOLD DEPTH</span>
              </button>
            ) : pod.status === 'HOLDING_DEPTH' ? (
              <button
                onClick={resumePodDescent}
                className="bg-navy-950 hover:bg-navy-800 text-orange-400 border border-orange-500/40 p-2 rounded text-xs flex items-center justify-center gap-1.5 font-bold"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>RESUME DESCENT</span>
              </button>
            ) : (
              <button
                onClick={manualRetractPod}
                className="bg-navy-950 hover:bg-navy-800 text-white border border-navy-800 p-2 rounded text-xs flex items-center justify-center gap-1.5"
              >
                <ArrowUp className="w-3.5 h-3.5 text-orange-400" />
                <span>RETRACT WINCH</span>
              </button>
            )}
          </div>

          <button
            onClick={stowPod}
            className="w-full bg-navy-950 hover:bg-navy-800 text-gray-300 border border-navy-800 p-1.5 rounded text-[11px] flex items-center justify-center gap-1"
          >
            <span>LOCK & STOW POD IN HULL CRADLE</span>
          </button>
        </div>

        {/* 3. Vertical CTD Profile Cast Points */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-orange-400" />
              <span>CAPTURED VERTICAL CASTS</span>
            </span>
            <span className="text-[10px] text-orange-400 font-bold">
              {pod.verticalProfilePoints.length} SAMPLES
            </span>
          </div>

          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto text-[10px]">
            {pod.verticalProfilePoints.length === 0 ? (
              <div className="text-gray-400 italic text-center py-2">
                Deploy winch to start vertical CTD profile sampling...
              </div>
            ) : (
              pod.verticalProfilePoints.slice(-6).reverse().map((pt, i) => (
                <div key={i} className="bg-navy-950 p-1.5 rounded border border-navy-800 flex justify-between">
                  <span className="text-orange-400 font-bold">{pt.depthM.toFixed(1)}m</span>
                  <span className="text-white">{pt.temperatureC.toFixed(2)}°C</span>
                  <span className="text-gray-300">{pt.salinityPsu.toFixed(1)} PSU</span>
                  <span className="text-gray-400">{pt.dissolvedOxygenMgL.toFixed(1)} mg/L</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
