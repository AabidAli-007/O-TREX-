import React from 'react';
import {
  Anchor,
  ArrowDown,
  ArrowUp,
  PauseCircle,
  Eye,
  X,
  Gauge,
  Activity,
  Droplets,
  Thermometer
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const PodDeploymentOverlay: React.FC = () => {
  const pod = useSimulationStore((state) => state.pod);
  const showPodOverlay = useSimulationStore((state) => state.showPodOverlay);
  const setShowPodOverlay = useSimulationStore((state) => state.setShowPodOverlay);
  const cameraMode = useSimulationStore((state) => state.cameraMode);
  const setCameraMode = useSimulationStore((state) => state.setCameraMode);
  const manualDeployPod = useSimulationStore((state) => state.manualDeployPod);
  const holdPodDepth = useSimulationStore((state) => state.holdPodDepth);
  const manualRetractPod = useSimulationStore((state) => state.manualRetractPod);

  // Show if explicitly toggled or actively deploying/lowered
  const isSubmerged = pod.depthCurrentM > 0.2;
  const isMoving = pod.status === 'DEPLOYING' || pod.status === 'LOWERING' || pod.status === 'RETRACTING';

  if (!showPodOverlay && !isSubmerged && !isMoving) {
    return null;
  }

  // Get the latest profile sensor reading at current depth if available
  const latestReading = pod.verticalProfilePoints.length > 0
    ? pod.verticalProfilePoints[pod.verticalProfilePoints.length - 1]
    : null;

  const depthPct = Math.min(100, Math.max(0, (pod.depthCurrentM / pod.maxWinchDepthM) * 100));

  return (
    <div className="absolute top-12 left-4 w-80 bg-navy-950/90 backdrop-blur-xl border border-orange-500/40 rounded-xl p-3 text-xs font-mono select-none z-20 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-300 text-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-navy-800 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/40">
            <Anchor className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-white text-xs block">
              CTD WINCH PROFILER
            </span>
            <span className="text-[10px] text-gray-400 block -mt-0.5">
              0–100m Micro-Winch Kinematics
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              pod.status === 'LOWERING' || pod.status === 'DEPLOYING'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 animate-pulse'
                : pod.status === 'RETRACTING'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse'
                : pod.status === 'HOLDING_DEPTH'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-navy-800 text-gray-300'
            }`}
          >
            {pod.status}
          </span>
          <button
            onClick={() => setShowPodOverlay(false)}
            className="p-1 hover:bg-navy-800 text-gray-400 hover:text-white rounded"
            title="Close Winch HUD"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Winch Telemetry & Graphical Depth Column */}
      <div className="flex gap-3 mb-3 bg-navy-900/80 p-2.5 rounded-lg border border-navy-800">
        {/* Graphical Vertical Depth Column */}
        <div className="w-8 flex flex-col items-center bg-navy-950 rounded border border-navy-800 p-1 relative h-36">
          <span className="text-[8px] text-gray-400">0m</span>
          <div className="relative flex-1 w-2 bg-navy-800 rounded-full overflow-hidden my-1">
            {/* Target Depth Line */}
            <div
              className="absolute w-full h-0.5 bg-gray-400 z-10"
              style={{ top: `${(pod.depthTargetM / pod.maxWinchDepthM) * 100}%` }}
              title={`Target: ${pod.depthTargetM}m`}
            />
            {/* Active Depth Fill */}
            <div
              className="w-full bg-gradient-to-b from-orange-500 to-cyan-400 transition-all duration-150"
              style={{ height: `${depthPct}%` }}
            />
          </div>
          <span className="text-[8px] text-gray-400">100m</span>

          {/* Moving Indicator Dot */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-orange-400 border-2 border-navy-950 shadow-md shadow-orange-500/50 flex items-center justify-center transition-all duration-150"
            style={{ top: `calc(${depthPct}% * 0.72 + 18px)` }}
          >
            <div className="w-1 h-1 rounded-full bg-white" />
          </div>
        </div>

        {/* Readout Values */}
        <div className="flex-1 flex flex-col justify-between text-xs">
          <div>
            <span className="text-[10px] text-gray-400 block font-sans">CURRENT DEPTH</span>
            <div className="text-2xl font-extrabold text-orange-400 flex items-baseline gap-1">
              {pod.depthCurrentM.toFixed(1)}
              <span className="text-xs text-gray-400 font-normal">meters</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] bg-navy-950/80 p-1.5 rounded border border-navy-800/80">
            <div>
              <span className="text-gray-400 block">TARGET</span>
              <span className="font-bold text-white">{pod.depthTargetM.toFixed(0)} m</span>
            </div>
            <div>
              <span className="text-gray-400 block">SPEED</span>
              <span className="font-bold text-cyan-300">
                {pod.winchSpeedMps > 0
                  ? `+${pod.winchSpeedMps.toFixed(1)} m/s`
                  : `${pod.winchSpeedMps.toFixed(1)} m/s`}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">TENSION</span>
              <span className="font-bold text-white">{pod.cableTensionN.toFixed(1)} N</span>
            </div>
            <div>
              <span className="text-gray-400 block">SAFETY</span>
              <span className="font-bold text-emerald-400">NOMINAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subsurface CTD Sensor Readings */}
      {latestReading && (
        <div className="grid grid-cols-2 gap-1.5 text-[10px] mb-2.5 bg-navy-900/60 p-2 rounded-lg border border-navy-800">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div>
              <span className="text-gray-400 block">DISSOLVED O₂</span>
              <span className="font-bold text-white">{latestReading.dissolvedOxygenMgL.toFixed(2)} mg/L</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <div>
              <span className="text-gray-400 block">WATER TEMP</span>
              <span className="font-bold text-white">{latestReading.temperatureC.toFixed(2)} °C</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-gray-400 block">SALINITY</span>
              <span className="font-bold text-white">{latestReading.salinityPsu.toFixed(2)} PSU</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div>
              <span className="text-gray-400 block">TURBIDITY</span>
              <span className="font-bold text-white">{latestReading.turbidityNtu.toFixed(2)} NTU</span>
            </div>
          </div>
        </div>
      )}

      {/* DATA TAKEN / PROFILER SAMPLES LOG */}
      <div className="mb-2.5 bg-navy-900/80 p-2 rounded-lg border border-navy-800">
        <div className="flex items-center justify-between pb-1 border-b border-navy-800 text-[10px]">
          <span className="font-bold text-orange-400 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>DATA TAKEN ({pod.verticalProfilePoints.length} SAMPLES)</span>
          </span>
          <span className="text-[9px] text-emerald-400 font-bold">LOGGING 1Hz</span>
        </div>

        {pod.verticalProfilePoints.length === 0 ? (
          <div className="text-[10px] text-gray-400 py-2 text-center">
            {pod.status === 'DEPLOYING' || pod.status === 'LOWERING'
              ? 'Collecting vertical profile samples during descent...'
              : 'Press X to deploy pod and record ocean CTD data'}
          </div>
        ) : (
          <div className="max-h-20 overflow-y-auto mt-1 space-y-0.5 text-[9px] scrollbar-thin scrollbar-thumb-navy-700">
            <div className="grid grid-cols-5 text-gray-400 font-bold px-1 pb-0.5">
              <span>DEPTH</span>
              <span>DO</span>
              <span>TEMP</span>
              <span>SAL</span>
              <span>FLAG</span>
            </div>
            {pod.verticalProfilePoints.slice(-5).reverse().map((pt, idx) => (
              <div
                key={idx}
                className="grid grid-cols-5 px-1 py-0.5 rounded bg-navy-950/80 text-gray-200 border border-navy-800/40"
              >
                <span className="text-orange-400 font-bold">{pt.depthM.toFixed(1)}m</span>
                <span className="text-cyan-300">{pt.dissolvedOxygenMgL.toFixed(1)}</span>
                <span className="text-gray-300">{pt.temperatureC.toFixed(1)}°</span>
                <span className="text-gray-300">{pt.salinityPsu.toFixed(1)}</span>
                <span className={pt.qualityFlag !== 'GOOD' ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                  {pt.qualityFlag !== 'GOOD' ? 'WARN' : 'NOM'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Camera & Winch Controls */}
      <div className="flex flex-col gap-1.5">
        {/* 1-Click Underwater Camera Switch */}
        <button
          onClick={() => setCameraMode(cameraMode === 'UNDERWATER_POD' ? 'FOLLOW' : 'UNDERWATER_POD')}
          className={`w-full py-1.5 px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
            cameraMode === 'UNDERWATER_POD'
              ? 'bg-cyan-500 text-navy-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
              : 'bg-navy-900 hover:bg-navy-800 text-cyan-300 border-cyan-500/40'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{cameraMode === 'UNDERWATER_POD' ? 'RETURN TO SURFACE CAM' : 'VIEW UNDERWATER POD CAM'}</span>
        </button>

        {/* Winch Action Buttons */}
        <div className="grid grid-cols-3 gap-1 text-[10px]">
          <button
            onClick={() => manualDeployPod(50)}
            className="bg-navy-900 hover:bg-navy-800 text-orange-400 border border-orange-500/30 py-1 rounded flex items-center justify-center gap-1 font-bold"
            title="Deploy to 50m (Hotkey: X)"
          >
            <ArrowDown className="w-3 h-3" />
            <span>50m [X]</span>
          </button>

          <button
            onClick={holdPodDepth}
            className="bg-navy-900 hover:bg-navy-800 text-amber-300 border border-amber-500/30 py-1 rounded flex items-center justify-center gap-1 font-bold"
            title="Hold at current depth"
          >
            <PauseCircle className="w-3 h-3" />
            <span>HOLD</span>
          </button>

          <button
            onClick={manualRetractPod}
            className="bg-navy-900 hover:bg-navy-800 text-white border border-navy-700 py-1 rounded flex items-center justify-center gap-1 font-bold"
            title="Retract to surface (Hotkey: X)"
          >
            <ArrowUp className="w-3 h-3 text-cyan-400" />
            <span>STOW [X]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
