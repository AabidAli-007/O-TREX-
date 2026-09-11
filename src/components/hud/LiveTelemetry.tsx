import React from 'react';
import {
  Droplets,
  BatteryCharging,
  Radio,
  Cpu,
  Anchor
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { formatLatLon } from '../../utils/formatters';

export const LiveTelemetry: React.FC = () => {
  const vehicle = useSimulationStore((state) => state.vehicle);
  const pod = useSimulationStore((state) => state.pod);
  const anomaly = useSimulationStore((state) => state.anomaly);
  const comms = useSimulationStore((state) => state.comms);
  const sensorHistory = useSimulationStore((state) => state.sensorHistory);

  const latestReading = sensorHistory[sensorHistory.length - 1] || {
    temperatureC: 21.4,
    conductivityMsCm: 48.2,
    salinityPsu: 35.1,
    dissolvedOxygenMgL: 7.8,
    ph: 8.14,
    turbidityNtu: 0.8,
    pressureDbar: 1.01,
    qualityFlag: 'GOOD',
    qualityScore: 98
  };

  return (
    <aside className="w-80 bg-navy-900/95 backdrop-blur-md border-l border-navy-700 p-3 flex flex-col gap-3 overflow-y-auto text-xs font-mono select-none z-20 text-gray-200">
      {/* 1. EDGE AI ANOMALY DETECTION ENGINE */}
      <div className="bg-navy-950 rounded-lg p-2.5 border border-navy-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-orange-400" />
            <span>AI ANOMALY DETECTOR</span>
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              anomaly.level === 'CRITICAL'
                ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                : anomaly.level === 'ANOMALY'
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                : anomaly.level === 'WATCH'
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                : 'bg-navy-800 text-gray-300 border-navy-700'
            }`}
          >
            {anomaly.level} ({(anomaly.score).toFixed(2)})
          </span>
        </div>

        {/* Score Progress Bar */}
        <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden mb-1.5 border border-navy-800">
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

        <div className="text-[10px] text-gray-400 leading-tight">
          {anomaly.triggerReason}
        </div>
      </div>

      {/* 2. REAL-TIME OCEANOGRAPHIC SURFACE SENSORS */}
      <div className="bg-navy-950 rounded-lg p-2.5 border border-navy-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-white border-b border-navy-800 pb-1">
          <span className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-orange-400" />
            <span>OCEAN SURFACE TELEMETRY</span>
          </span>
          <span
            className={`text-[9px] px-1 rounded font-bold ${
              latestReading.qualityFlag === 'GOOD'
                ? 'text-orange-400 bg-navy-900 border border-orange-500/30'
                : 'text-red-400 bg-navy-900 border border-red-500/30'
            }`}
          >
            QC: {latestReading.qualityFlag}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {/* Temperature */}
          <div className="bg-navy-900 p-1.5 rounded border border-navy-800">
            <div className="text-[10px] text-gray-400">WATER TEMP</div>
            <div className="text-sm font-bold text-white flex items-baseline gap-1">
              <span>{latestReading.temperatureC.toFixed(2)}</span>
              <span className="text-[10px] text-gray-400">°C</span>
            </div>
          </div>

          {/* Dissolved Oxygen */}
          <div
            className={`p-1.5 rounded border ${
              latestReading.dissolvedOxygenMgL < 4.0
                ? 'bg-red-950/40 border-red-500/40 text-red-300'
                : 'bg-navy-900 border-navy-800'
            }`}
          >
            <div className="text-[10px] text-gray-400">DISSOLVED O₂</div>
            <div className="text-sm font-bold text-white flex items-baseline gap-1">
              <span>{latestReading.dissolvedOxygenMgL.toFixed(2)}</span>
              <span className="text-[10px] text-gray-400">mg/L</span>
            </div>
          </div>

          {/* Salinity / Conductivity */}
          <div className="bg-navy-900 p-1.5 rounded border border-navy-800">
            <div className="text-[10px] text-gray-400">SALINITY / EC</div>
            <div className="text-sm font-bold text-white flex items-baseline gap-1">
              <span>{latestReading.salinityPsu.toFixed(1)}</span>
              <span className="text-[10px] text-gray-400">PSU</span>
            </div>
          </div>

          {/* Turbidity */}
          <div className="bg-navy-900 p-1.5 rounded border border-navy-800">
            <div className="text-[10px] text-gray-400">TURBIDITY</div>
            <div className="text-sm font-bold text-orange-400 flex items-baseline gap-1">
              <span>{latestReading.turbidityNtu.toFixed(1)}</span>
              <span className="text-[10px] text-gray-400">NTU</span>
            </div>
          </div>

          {/* pH */}
          <div className="bg-navy-900 p-1.5 rounded border border-navy-800">
            <div className="text-[10px] text-gray-400">pH LEVEL</div>
            <div className="text-sm font-bold text-white">
              {latestReading.ph.toFixed(2)}
            </div>
          </div>

          {/* Surface Pressure */}
          <div className="bg-navy-900 p-1.5 rounded border border-navy-800">
            <div className="text-[10px] text-gray-400">PRESSURE</div>
            <div className="text-sm font-bold text-white flex items-baseline gap-1">
              <span>{latestReading.pressureDbar.toFixed(2)}</span>
              <span className="text-[10px] text-gray-400">dbar</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. VERTICAL PROFILING WINCH & SENSOR POD */}
      <div className="bg-navy-950 rounded-lg p-2.5 border border-navy-800 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-white border-b border-navy-800 pb-1">
          <span className="flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-orange-400" />
            <span>SUBSURFACE POD & WINCH</span>
          </span>
          <span className="text-[10px] text-orange-400 font-bold">{pod.status}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] mt-1">
          <div>
            <span className="text-[10px] text-gray-400 block">CURRENT DEPTH</span>
            <span className="text-base font-bold text-orange-400">
              {pod.depthCurrentM.toFixed(1)} m
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">TARGET DEPTH</span>
            <span className="text-base font-bold text-white">
              {pod.depthTargetM.toFixed(1)} m
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">CABLE TENSION</span>
            <span className="text-xs font-bold text-gray-200">
              {pod.cableTensionN.toFixed(1)} N
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">PROFILES TAKEN</span>
            <span className="text-xs font-bold text-white">
              {pod.verticalProfilePoints.length} pts
            </span>
          </div>
        </div>
      </div>

      {/* 4. VEHICLE AVIONICS & POWER HEALTH */}
      <div className="bg-navy-950 rounded-lg p-2.5 border border-navy-800 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-white border-b border-navy-800 pb-1">
          <span className="flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-orange-400" />
            <span>POWER & NAVIGATION</span>
          </span>
          <span className="text-[10px] text-gray-400">
            {vehicle.gnssLock ? `${vehicle.gnssSatellites} Sats (RTK)` : 'NO GNSS FIX'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] mt-1">
          <div>
            <span className="text-[10px] text-gray-400 block">BATTERY SOC</span>
            <span
              className={`text-sm font-bold ${
                vehicle.batterySOC < 20 ? 'text-red-400' : 'text-white'
              }`}
            >
              {vehicle.batterySOC.toFixed(1)}% ({vehicle.batteryVoltageV.toFixed(1)}V)
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">SOLAR HARVEST</span>
            <span className="text-sm font-bold text-orange-400">
              +{vehicle.solarPowerW.toFixed(1)} W
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">SPEED / HEADING</span>
            <span className="text-xs font-bold text-gray-200">
              {vehicle.speedKnots.toFixed(1)} kts @ {vehicle.headingDeg.toFixed(0)}°
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">GPS POSITION</span>
            <span className="text-[10px] font-bold text-gray-300">
              {formatLatLon(vehicle.lat, vehicle.lon)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. COMMUNICATIONS & PRIORITY DATA QUEUE */}
      <div className="bg-navy-950 rounded-lg p-2.5 border border-navy-800 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-white border-b border-navy-800 pb-1">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-orange-400" />
            <span>COMMUNICATIONS</span>
          </span>
          <span className="text-[10px] text-orange-400 font-bold">
            {comms.activeBearer} ({comms.linkQualityPct}%)
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
          <span>Queued Packets: <strong className="text-white">{comms.queuedPacketsCount}</strong></span>
          <span>Uplinked: <strong className="text-orange-400">{(comms.transmittedBytes / 1024).toFixed(1)} KB</strong></span>
        </div>
      </div>
    </aside>
  );
};
