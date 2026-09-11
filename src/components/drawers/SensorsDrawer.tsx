import React from 'react';
import {
  X,
  Activity,
  Droplets,
  Thermometer,
  Eye,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const SensorsDrawer: React.FC = () => {
  const closeDrawer = useSimulationStore((state) => state.closeDrawer);
  const sensorHistory = useSimulationStore((state) => state.sensorHistory);
  const pod = useSimulationStore((state) => state.pod);

  const latest = sensorHistory[sensorHistory.length - 1] || {
    temperatureC: 1.4,
    conductivityMsCm: 32.8,
    salinityPsu: 34.2,
    dissolvedOxygenMgL: 8.4,
    ph: 8.08,
    turbidityNtu: 1.2,
    pressureDbar: 1.05,
    qualityFlag: 'GOOD',
    qualityScore: 98
  };

  return (
    <div className="w-96 bg-navy-950/95 backdrop-blur-lg border-l border-navy-800 h-full flex flex-col font-mono text-xs select-none shadow-2xl text-gray-200">
      {/* Header */}
      <div className="h-12 bg-navy-900 px-4 flex items-center justify-between border-b border-navy-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-400" />
          <span className="font-extrabold text-white text-sm">OCEANOGRAPHIC SENSORS</span>
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
        {/* Quality Control Badge */}
        <div className="bg-navy-900 rounded-lg p-2.5 border border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <span className="text-[10px] text-gray-300">DATA QUALITY (QC)</span>
          </div>
          <span className="text-[10px] bg-navy-950 text-orange-400 px-2 py-0.5 rounded border border-orange-500/40 font-bold">
            FLAG: {latest.qualityFlag} (Score: {latest.qualityScore}%)
          </span>
        </div>

        {/* 1. Core Primary Oceanographic Metrics */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {/* Water Temperature */}
          <div className="bg-navy-900 p-2.5 rounded-lg border border-navy-800">
            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-orange-400" />
              <span>WATER TEMP</span>
            </div>
            <div className="text-base font-extrabold text-white mt-1">
              {latest.temperatureC.toFixed(2)} <span className="text-xs text-gray-400">°C</span>
            </div>
            <div className="text-[9px] text-gray-400 mt-0.5">±0.002°C NIST Calibrated</div>
          </div>

          {/* Salinity */}
          <div className="bg-navy-900 p-2.5 rounded-lg border border-navy-800">
            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-orange-400" />
              <span>SALINITY</span>
            </div>
            <div className="text-base font-extrabold text-orange-400 mt-1">
              {latest.salinityPsu.toFixed(2)} <span className="text-xs text-gray-300">PSU</span>
            </div>
            <div className="text-[9px] text-gray-400 mt-0.5">Inductive 7-Electrode Cell</div>
          </div>

          {/* Dissolved Oxygen */}
          <div className="bg-navy-900 p-2.5 rounded-lg border border-navy-800">
            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-orange-400" />
              <span>DISSOLVED O₂</span>
            </div>
            <div className="text-base font-extrabold text-white mt-1">
              {latest.dissolvedOxygenMgL.toFixed(2)} <span className="text-xs text-gray-400">mg/L</span>
            </div>
            <div className="text-[9px] text-gray-400 mt-0.5">Optical Luminescence Optode</div>
          </div>

          {/* Turbidity */}
          <div className="bg-navy-900 p-2.5 rounded-lg border border-navy-800">
            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              <Eye className="w-3 h-3 text-orange-400" />
              <span>TURBIDITY</span>
            </div>
            <div className="text-base font-extrabold text-white mt-1">
              {latest.turbidityNtu.toFixed(1)} <span className="text-xs text-gray-400">NTU</span>
            </div>
            <div className="text-[9px] text-gray-400 mt-0.5">Nephelometric 850nm LED</div>
          </div>

          {/* pH */}
          <div className="bg-navy-900 p-2.5 rounded-lg border border-navy-800">
            <div className="text-[10px] text-gray-400">SEAWATER pH</div>
            <div className="text-base font-extrabold text-white mt-1">
              {latest.ph.toFixed(2)}
            </div>
            <div className="text-[9px] text-gray-400 mt-0.5">Solid-State ISFET Probe</div>
          </div>

          {/* Conductivity */}
          <div className="bg-navy-900 p-2.5 rounded-lg border border-navy-800">
            <div className="text-[10px] text-gray-400">CONDUCTIVITY</div>
            <div className="text-base font-extrabold text-white mt-1">
              {latest.conductivityMsCm.toFixed(1)} <span className="text-xs text-gray-400">mS/cm</span>
            </div>
            <div className="text-[9px] text-gray-400 mt-0.5">Seawater Ion Conductance</div>
          </div>
        </div>

        {/* 2. Subsurface Profile Stratification Breakdown */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-orange-400" />
              <span>STRATIFICATION STRATA</span>
            </span>
            <span className="text-[10px] text-orange-400 font-bold">
              DEPTH: {pod.depthCurrentM.toFixed(1)}m
            </span>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <div className="bg-navy-950 p-2 rounded border border-navy-800 flex items-center justify-between">
              <span className="text-gray-400">Epipelagic (0 - 20m):</span>
              <span className="text-white font-bold">Mixed Layer / High Dissolved O₂</span>
            </div>
            <div className="bg-navy-950 p-2 rounded border border-navy-800 flex items-center justify-between">
              <span className="text-gray-400">Thermocline (20 - 60m):</span>
              <span className="text-orange-400 font-bold">Rapid Pycnocline Density Gradient</span>
            </div>
            <div className="bg-navy-950 p-2 rounded border border-navy-800 flex items-center justify-between">
              <span className="text-gray-400">Mesopelagic (60 - 100m):</span>
              <span className="text-white font-bold">Cold Polar Deep Water / High Salinity</span>
            </div>
          </div>
        </div>

        {/* 3. Sensor Log Stream */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">LATEST READINGS STREAM</span>
          <div className="flex flex-col gap-1 max-h-36 overflow-y-auto text-[10px]">
            {sensorHistory.slice(-5).reverse().map((r, i) => (
              <div key={i} className="bg-navy-950 p-1.5 rounded border border-navy-800 flex justify-between">
                <span className="text-gray-400">Depth: {r.pressureDbar.toFixed(1)}m</span>
                <span className="text-white font-bold">{r.temperatureC.toFixed(2)}°C</span>
                <span className="text-orange-400">{r.salinityPsu.toFixed(1)} PSU</span>
                <span className="text-gray-300">{r.dissolvedOxygenMgL.toFixed(1)} mg/L</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
