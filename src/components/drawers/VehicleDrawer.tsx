import React from 'react';
import {
  X,
  Gauge,
  Compass,
  BatteryCharging,
  Radio,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const VehicleDrawer: React.FC = () => {
  const closeDrawer = useSimulationStore((state) => state.closeDrawer);
  const vehicle = useSimulationStore((state) => state.vehicle);
  const setControlMode = useSimulationStore((state) => state.setControlMode);
  const emergencyStop = useSimulationStore((state) => state.emergencyStop);
  const clearEmergencyStop = useSimulationStore((state) => state.clearEmergencyStop);
  const recenterVehicle = useSimulationStore((state) => state.recenterVehicle);

  return (
    <div className="w-96 bg-navy-950/95 backdrop-blur-lg border-l border-navy-800 h-full flex flex-col font-mono text-xs select-none shadow-2xl text-gray-200">
      {/* Header */}
      <div className="h-12 bg-navy-900 px-4 flex items-center justify-between border-b border-navy-800">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-orange-400" />
          <span className="font-extrabold text-white text-sm">VEHICLE TELEMETRY & PILOT</span>
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
        {/* 1. Control Mode & Emergency Controls */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">PILOTING MODE</span>
            <span className="text-[10px] text-orange-400 font-bold">
              {vehicle.controlMode}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setControlMode('AUTONOMOUS')}
              className={`p-2 rounded text-xs font-bold border transition-colors ${
                vehicle.controlMode === 'AUTONOMOUS'
                  ? 'bg-orange-500 text-navy-950 border-orange-400'
                  : 'bg-navy-950 text-gray-400 border-navy-800 hover:text-white'
              }`}
            >
              AUTONOMOUS
            </button>
            <button
              onClick={() => setControlMode('MANUAL')}
              className={`p-2 rounded text-xs font-bold border transition-colors ${
                vehicle.controlMode === 'MANUAL'
                  ? 'bg-orange-500 text-navy-950 border-orange-400'
                  : 'bg-navy-950 text-gray-400 border-navy-800 hover:text-white'
              }`}
            >
              MANUAL (WASD)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={recenterVehicle}
              className="bg-navy-950 hover:bg-navy-800 text-gray-300 border border-navy-800 p-2 rounded text-[11px] flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
              <span>RECENTER GPS</span>
            </button>

            <button
              onClick={vehicle.emergencyStop ? clearEmergencyStop : emergencyStop}
              className={`p-2 rounded text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all ${
                vehicle.emergencyStop
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-navy-950 hover:bg-red-950 text-red-400 border-red-500/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{vehicle.emergencyStop ? 'RESUME SYSTEM' : 'E-STOP'}</span>
            </button>
          </div>
        </div>

        {/* 2. Kinematics & Hydrodynamics */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">HULL KINEMATICS</span>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-navy-950 p-2 rounded border border-navy-800">
              <div className="text-[10px] text-gray-400">SPEED OVER GROUND</div>
              <div className="text-sm font-extrabold text-orange-400">
                {vehicle.speedKnots.toFixed(1)} <span className="text-[10px] text-gray-300">kts</span>
              </div>
            </div>

            <div className="bg-navy-950 p-2 rounded border border-navy-800">
              <div className="text-[10px] text-gray-400">HEADING (COG)</div>
              <div className="text-sm font-bold text-white flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-orange-400" />
                <span>{vehicle.headingDeg.toFixed(0)}°</span>
              </div>
            </div>

            <div className="bg-navy-950 p-2 rounded border border-navy-800">
              <div className="text-[10px] text-gray-400">THROTTLE %</div>
              <div className="text-sm font-bold text-white">
                {vehicle.throttlePct.toFixed(0)}%
              </div>
            </div>

            <div className="bg-navy-950 p-2 rounded border border-navy-800">
              <div className="text-[10px] text-gray-400">RUDDER DEFLECTION</div>
              <div className="text-sm font-bold text-white">
                {vehicle.rudderPct.toFixed(0)}%
              </div>
            </div>

            <div className="bg-navy-950 p-2 rounded border border-navy-800">
              <div className="text-[10px] text-gray-400">PITCH LEAN</div>
              <div className="text-xs font-bold text-gray-300">
                {vehicle.pitchDeg.toFixed(1)}°
              </div>
            </div>

            <div className="bg-navy-950 p-2 rounded border border-navy-800">
              <div className="text-[10px] text-gray-400">ROLL / HEEL</div>
              <div className="text-xs font-bold text-gray-300">
                {vehicle.rollDeg.toFixed(1)}°
              </div>
            </div>
          </div>
        </div>

        {/* 3. Electrical Power Budget */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">ELECTRICAL POWER BUDGET</span>
            <span className="text-[10px] text-orange-400 font-bold">
              52V 48Ah LiFePO4
            </span>
          </div>

          <div className="bg-navy-950 p-2.5 rounded border border-navy-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BatteryCharging className="w-5 h-5 text-orange-400" />
              <div>
                <div className="text-sm font-extrabold text-white">
                  {vehicle.batterySOC.toFixed(1)}%
                </div>
                <div className="text-[10px] text-gray-400">
                  {vehicle.batteryVoltageV.toFixed(1)}V · {vehicle.currentDrawA.toFixed(1)}A
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-bold text-orange-400">
                +{vehicle.solarPowerW.toFixed(0)}W
              </div>
              <div className="text-[10px] text-gray-400">SOLAR DECK</div>
            </div>
          </div>

          {/* Subsystem Power Draw Breakdown */}
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <div className="bg-navy-950 p-1.5 rounded border border-navy-800 text-center">
              <div className="text-gray-400">MOTORS</div>
              <div className="font-bold text-white">{vehicle.motorPowerW.toFixed(0)}W</div>
            </div>
            <div className="bg-navy-950 p-1.5 rounded border border-navy-800 text-center">
              <div className="text-gray-400">AVIONICS</div>
              <div className="font-bold text-white">{vehicle.electronicsPowerW.toFixed(1)}W</div>
            </div>
            <div className="bg-navy-950 p-1.5 rounded border border-navy-800 text-center">
              <div className="text-gray-400">WINCH</div>
              <div className="font-bold text-white">{vehicle.winchPowerW.toFixed(0)}W</div>
            </div>
          </div>
        </div>

        {/* 4. Avionics & GNSS Health */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">AVIONICS & GNSS LOCK</span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-navy-950 p-2 rounded border border-navy-800">
              <div className="text-[10px] text-gray-400">GNSS SATELLITES</div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <Radio className="w-3 h-3 text-orange-400" />
                <span>{vehicle.gnssSatellites} (HDOP: {vehicle.gnssHdop})</span>
              </div>
            </div>

            <div className="bg-navy-950 p-2 rounded border border-navy-800">
              <div className="text-[10px] text-gray-400">EDGE CPU TEMP</div>
              <div className="text-xs font-bold text-white">
                {vehicle.cpuTempC.toFixed(1)}°C / {vehicle.internalTempC.toFixed(1)}°C
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
