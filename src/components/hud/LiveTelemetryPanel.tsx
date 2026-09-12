import React from 'react';
import {
  Activity,
  Gauge,
  BatteryCharging,
  Anchor,
  Radio,
  Wifi,
  WifiOff,
  ArrowDown,
  ArrowUp,
  PauseCircle,
  ChevronRight
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { formatLatLon } from '../../utils/formatters';

export const LiveTelemetryPanel: React.FC = () => {
  const isRightPanelOpen = useSimulationStore((state) => state.isRightPanelOpen);
  const toggleRightPanel = useSimulationStore((state) => state.toggleRightPanel);
  const vehicle = useSimulationStore((state) => state.vehicle);
  const pod = useSimulationStore((state) => state.pod);
  const comms = useSimulationStore((state) => state.comms);
  const sensorHistory = useSimulationStore((state) => state.sensorHistory);
  const failures = useSimulationStore((state) => state.failures);
  const toggleFailure = useSimulationStore((state) => state.toggleFailure);
  const manualDeployPod = useSimulationStore((state) => state.manualDeployPod);
  const holdPodDepth = useSimulationStore((state) => state.holdPodDepth);
  const manualRetractPod = useSimulationStore((state) => state.manualRetractPod);

  // Latest sensor reading
  const latestSensor = sensorHistory[sensorHistory.length - 1] || {
    temperatureC: 21.7,
    salinityPsu: 35.0,
    dissolvedOxygenMgL: 4.23,
    turbidityNtu: 3.6,
    pressureDbar: 1.01,
    ph: 7.9,
    qualityScore: 98,
    qualityFlag: 'GOOD'
  };

  const netPowerW = vehicle.solarPowerW - (vehicle.motorPowerW + vehicle.electronicsPowerW + vehicle.winchPowerW);

  if (!isRightPanelOpen) {
    return (
      <div
        className="h-full flex flex-col items-center py-4 px-1.5 z-20 select-none"
        style={{ background: 'rgba(6,11,22,0.97)', borderLeft: '1px solid rgba(28,46,82,0.7)' }}
      >
        <button
          onClick={toggleRightPanel}
          className="p-2.5 rounded-xl flex flex-col items-center gap-3 transition-all group"
          style={{
            background: 'rgba(28,46,82,0.4)',
            border: '1px solid rgba(28,46,82,0.8)',
            color: '#67E8F9'
          }}
          title="Expand Live Telemetry Panel"
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,211,238,0.4)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(28,46,82,0.8)'; }}
        >
          <Activity className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-bold [writing-mode:vertical-rl] rotate-180 uppercase tracking-widest text-gray-400 group-hover:text-white">
            TELEMETRY
          </span>
          <span className="text-[9px] font-bold mt-1" style={{ color: '#FDB642' }}>
            {vehicle.batterySOC.toFixed(0)}%
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside
      className="w-72 h-full overflow-y-auto flex flex-col gap-2.5 p-3 font-sans text-xs select-none"
      style={{
        background: 'rgba(6, 11, 22, 0.97)',
        borderLeft: '1px solid rgba(28, 46, 82, 0.7)',
        backdropFilter: 'blur(20px)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.4)',
        color: '#CBD5E1',
      }}
    >
      {/* 1. VEHICLE DYNAMICS & GNSS */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-3 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between border-b border-navy-800 pb-1.5">
          <span className="font-bold text-white text-xs flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-orange-400" />
            <span>VEHICLE TELEMETRY</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleRightPanel}
              className="p-1 hover:bg-navy-800 text-gray-400 hover:text-white rounded"
              title="Collapse Telemetry Panel"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[10px] bg-navy-950 text-green-400 px-2 py-0.5 rounded border border-green-500/30 font-bold">
            GNSS FIX (18 SAT)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">SPEED OVER GROUND</span>
            <span className="text-sm font-extrabold text-orange-400">
              {vehicle.speedKnots.toFixed(1)} <span className="text-[10px] text-gray-400">kt</span>
            </span>
          </div>

          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">COMPASS HEADING</span>
            <span className="text-sm font-extrabold text-white">
              {vehicle.headingDeg.toFixed(0).padStart(3, '0')}°
            </span>
          </div>

          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">PITCH / ROLL</span>
            <span className="text-xs font-bold text-white">
              {vehicle.pitchDeg > 0 ? '+' : ''}{vehicle.pitchDeg.toFixed(1)}° / {vehicle.rollDeg > 0 ? '+' : ''}{vehicle.rollDeg.toFixed(1)}°
            </span>
          </div>

          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">THROTTLE / RUDDER</span>
            <span className="text-xs font-bold text-white">
              {vehicle.throttlePct}% / {vehicle.rudderPct}%
            </span>
          </div>
        </div>

        <div className="bg-navy-950 p-1.5 rounded border border-navy-800 text-[10px] text-gray-300 flex items-center justify-between">
          <span className="text-gray-400 font-sans">GPS:</span>
          <span className="font-bold">{formatLatLon(vehicle.lat, vehicle.lon)}</span>
        </div>
      </div>

      {/* 2. POWER & ENERGY FLUX */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-3 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between border-b border-navy-800 pb-1.5">
          <span className="font-bold text-white text-xs flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-orange-400" />
            <span>ENERGY & POWER FLUX</span>
          </span>
          <span className={`text-[10px] font-bold ${netPowerW >= 0 ? 'text-green-400' : 'text-orange-400'}`}>
            NET: {netPowerW >= 0 ? '+' : ''}{netPowerW.toFixed(1)}W
          </span>
        </div>

        {/* Battery SOC Progress */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-gray-300">BATTERY SOC</span>
            <span className={vehicle.batterySOC < 20 ? 'text-red-400 animate-pulse' : 'text-white'}>
              {vehicle.batterySOC.toFixed(1)}% ({vehicle.batteryVoltageV.toFixed(1)}V)
            </span>
          </div>
          <div className="w-full h-2 bg-navy-950 rounded-full overflow-hidden border border-navy-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                vehicle.batterySOC < 20 ? 'bg-red-500' : vehicle.batterySOC < 40 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, vehicle.batterySOC)}%` }}
            />
          </div>
        </div>

        {/* Power Breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">SOLAR HARVEST</span>
            <span className="text-xs font-extrabold text-orange-400">
              +{vehicle.solarPowerW.toFixed(0)} W
            </span>
          </div>

          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">PROPULSION DRAW</span>
            <span className="text-xs font-bold text-white">
              -{vehicle.motorPowerW.toFixed(0)} W
            </span>
          </div>
        </div>
      </div>

      {/* 3. ENVIRONMENTAL SURFACE CTD SENSORS */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-3 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between border-b border-navy-800 pb-1.5">
          <span className="font-bold text-white text-xs flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-orange-400" />
            <span>SURFACE SENSOR TELEMETRY</span>
          </span>
          <span className="text-[10px] bg-navy-950 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">
            FLAG: {latestSensor.qualityFlag} ({latestSensor.qualityScore}%)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">WATER TEMP</span>
            <span className="text-sm font-extrabold text-white">
              {latestSensor.temperatureC.toFixed(2)} <span className="text-[10px] text-gray-400">°C</span>
            </span>
          </div>

          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">SALINITY</span>
            <span className="text-sm font-extrabold text-white">
              {latestSensor.salinityPsu.toFixed(2)} <span className="text-[10px] text-gray-400">PSU</span>
            </span>
          </div>

          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">DISSOLVED O₂</span>
            <span className={`text-sm font-extrabold ${latestSensor.dissolvedOxygenMgL < 4.0 ? 'text-red-400' : 'text-white'}`}>
              {latestSensor.dissolvedOxygenMgL.toFixed(2)} <span className="text-[10px] text-gray-400">mg/L</span>
            </span>
          </div>

          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">TURBIDITY</span>
            <span className={`text-sm font-extrabold ${latestSensor.turbidityNtu > 15 ? 'text-orange-400' : 'text-white'}`}>
              {latestSensor.turbidityNtu.toFixed(1)} <span className="text-[10px] text-gray-400">NTU</span>
            </span>
          </div>

          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">PRESSURE</span>
            <span className="text-xs font-bold text-white">
              {latestSensor.pressureDbar.toFixed(2)} <span className="text-[10px] text-gray-400">dbar</span>
            </span>
          </div>

          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">ACIDITY (pH)</span>
            <span className="text-xs font-bold text-white">
              {latestSensor.ph.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 4. SUBSURFACE SENSOR POD (0–100m) & DEPTH GRAPH */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-3 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between border-b border-navy-800 pb-1.5">
          <span className="font-bold text-white text-xs flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-orange-400" />
            <span>SENSOR POD (0–100m)</span>
          </span>
          <span className="text-[10px] text-orange-400 font-bold bg-navy-950 px-2 py-0.5 rounded border border-orange-500/30">
            [{pod.status}]
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">CURRENT DEPTH</span>
            <span className="text-sm font-extrabold text-cyan-400">
              {pod.depthCurrentM.toFixed(1)} <span className="text-[10px] text-gray-400">m</span>
            </span>
          </div>

          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">TARGET DEPTH</span>
            <span className="text-sm font-extrabold text-white">
              {pod.depthTargetM.toFixed(0)} <span className="text-[10px] text-gray-400">m</span>
            </span>
          </div>
        </div>

        {/* Winch Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() => manualDeployPod(50)}
            className="bg-navy-950 hover:bg-navy-800 border border-navy-700 text-orange-400 py-1.5 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <ArrowDown className="w-3 h-3" />
            <span>50m</span>
          </button>

          <button
            onClick={holdPodDepth}
            className="bg-navy-950 hover:bg-navy-800 border border-navy-700 text-white py-1.5 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <PauseCircle className="w-3 h-3" />
            <span>HOLD</span>
          </button>

          <button
            onClick={manualRetractPod}
            className="bg-navy-950 hover:bg-navy-800 border border-navy-700 text-gray-200 py-1.5 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <ArrowUp className="w-3 h-3" />
            <span>STOW</span>
          </button>
        </div>

        {/* Real-time Subsurface Vertical Profile Curve (SVG) */}
        <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>VERTICAL DEPTH PROFILE</span>
            <span className="text-orange-400 font-bold">{pod.verticalProfilePoints.length} SAMPLES</span>
          </div>

          <div className="h-20 w-full relative flex items-center justify-center border-b border-navy-800">
            {pod.verticalProfilePoints.length > 2 ? (
              <svg className="w-full h-full" viewBox="0 0 200 80">
                {/* Stratification lines */}
                <line x1="0" y1="20" x2="200" y2="20" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="40" x2="200" y2="40" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="60" x2="200" y2="60" stroke="rgba(255,255,255,0.05)" />

                {/* Plot collected points */}
                <polyline
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  points={pod.verticalProfilePoints
                    .map((pt, idx) => {
                      const x = (idx / (pod.verticalProfilePoints.length - 1)) * 190 + 5;
                      const y = (pt.depthM / 100) * 70 + 5;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              </svg>
            ) : (
              <span className="text-[10px] text-gray-500">
                DEPLOY POD TO RECORD 0–100m PROFILE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5. TIERED COMMUNICATIONS & STORE-AND-FORWARD */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-3 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between border-b border-navy-800 pb-1.5">
          <span className="font-bold text-white text-xs flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-orange-400" />
            <span>COMMUNICATIONS & STORE-FORWARD</span>
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${failures.commLoss ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-green-500/20 text-green-400 border-green-500/40'}`}>
            {failures.commLoss ? 'OFFLINE (STORE)' : comms.activeBearer}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">QUEUED PACKETS</span>
            <span className={`text-sm font-extrabold ${comms.queuedPacketsCount > 0 ? 'text-orange-400' : 'text-white'}`}>
              {comms.queuedPacketsCount} pkts
            </span>
          </div>

          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">TRANSMITTED DATA</span>
            <span className="text-sm font-bold text-white">
              {(comms.transmittedBytes / 1024).toFixed(1)} <span className="text-[10px] text-gray-400">KB</span>
            </span>
          </div>
        </div>

        {/* Simulate Comms Outage Button */}
        <button
          onClick={() => toggleFailure('commLoss')}
          className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            failures.commLoss
              ? 'bg-green-600 hover:bg-green-500 text-white shadow-md shadow-green-600/20'
              : 'bg-navy-950 hover:bg-navy-800 text-orange-400 border border-orange-500/40'
          }`}
        >
          {failures.commLoss ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{failures.commLoss ? 'RESTORE SATELLITE LINK' : 'SIMULATE COMMS OUTAGE'}</span>
        </button>
      </div>
    </aside>
  );
};
