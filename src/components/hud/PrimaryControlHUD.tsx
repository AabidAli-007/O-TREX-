import React from 'react';
import {
  Compass,
  BatteryCharging,
  Sun,
  Radio,
  Anchor
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { formatLatLon } from '../../utils/formatters';

export const PrimaryControlHUD: React.FC = () => {
  const vehicle = useSimulationStore((state) => state.vehicle);
  const pod = useSimulationStore((state) => state.pod);
  const comms = useSimulationStore((state) => state.comms);
  const missionState = useSimulationStore((state) => state.missionState);

  const getVehicleStatus = () => {
    if (vehicle.emergencyStop) return { label: 'EMERGENCY STOP', color: 'bg-orange text-black font-bold' };
    if (vehicle.controlMode === 'MANUAL') return { label: 'MANUAL PILOT', color: 'bg-orange/20 text-orange border-orange/40' };
    if (missionState === 'MISSION_RETURN') return { label: 'RETURNING', color: 'bg-white/20 text-white' };
    if (vehicle.speedKnots > 0.1) return { label: 'ACTIVE CRUISING', color: 'bg-orange/20 text-orange border-orange/40' };
    return { label: 'STATION KEEPING', color: 'bg-navy-950 text-lightgray border-lightgray/30' };
  };

  const vStatus = getVehicleStatus();

  return (
    <div className="bg-navy/95 backdrop-blur-md border border-lightgray/20 rounded-xl px-4 py-2 shadow-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-sans select-none">
      {/* 1. Vehicle & Mission Status */}
      <div className="flex items-center gap-3">
        <div>
          <span className="text-[9px] text-lightgray/70 block uppercase tracking-wider">VEHICLE STATUS</span>
          <span className={`text-[10px] px-2 py-0.5 rounded border inline-block ${vStatus.color}`}>
            {vStatus.label}
          </span>
        </div>

        <div>
          <span className="text-[9px] text-lightgray/70 block uppercase tracking-wider">MISSION STAGE</span>
          <span className="text-white font-bold text-xs">{missionState.replace(/_/g, ' ')}</span>
        </div>
      </div>

      {/* 2. Speed & Heading */}
      <div className="flex items-center gap-4 border-l border-lightgray/20 pl-3">
        <div>
          <span className="text-[9px] text-lightgray/70 block">SPEED</span>
          <span className="text-sm font-extrabold text-orange">
            {vehicle.speedKnots.toFixed(1)} <span className="text-[10px] text-white">kts</span>
          </span>
        </div>

        <div>
          <span className="text-[9px] text-lightgray/70 block">HEADING</span>
          <span className="text-sm font-extrabold text-white flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-orange" />
            <span>{vehicle.headingDeg.toFixed(0)}°</span>
          </span>
        </div>
      </div>

      {/* 3. Battery & Solar */}
      <div className="flex items-center gap-4 border-l border-lightgray/20 pl-3">
        <div>
          <span className="text-[9px] text-lightgray/70 block">BATTERY</span>
          <span className={`text-sm font-bold flex items-center gap-1 ${vehicle.batterySOC < 20 ? 'text-orange' : 'text-white'}`}>
            <BatteryCharging className="w-3.5 h-3.5 text-orange" />
            <span>{vehicle.batterySOC.toFixed(0)}%</span>
            <span className="text-[10px] text-lightgray/70">({vehicle.batteryVoltageV.toFixed(1)}V)</span>
          </span>
        </div>

        <div>
          <span className="text-[9px] text-lightgray/70 block">SOLAR DECK</span>
          <span className="text-sm font-bold text-orange flex items-center gap-1">
            <Sun className="w-3.5 h-3.5" />
            <span>+{vehicle.solarPowerW.toFixed(0)}W</span>
          </span>
        </div>
      </div>

      {/* 4. Pod Depth & State */}
      <div className="flex items-center gap-3 border-l border-lightgray/20 pl-3">
        <div>
          <span className="text-[9px] text-lightgray/70 block">SENSOR POD</span>
          <span className="text-sm font-extrabold text-orange flex items-center gap-1">
            <Anchor className="w-3.5 h-3.5" />
            <span>{pod.depthCurrentM.toFixed(1)}m</span>
            <span className="text-[10px] text-lightgray/70">/ {pod.depthTargetM}m</span>
          </span>
        </div>
      </div>

      {/* 5. Comms & Position */}
      <div className="flex items-center gap-4 border-l border-lightgray/20 pl-3">
        <div>
          <span className="text-[9px] text-lightgray/70 block">COMMUNICATION</span>
          <span className="text-xs font-bold text-white flex items-center gap-1">
            <Radio className="w-3 h-3 text-orange" />
            <span>{comms.activeBearer} ({comms.linkQualityPct}%)</span>
          </span>
        </div>

        <div className="hidden xl:block">
          <span className="text-[9px] text-lightgray/70 block">GPS POSITION</span>
          <span className="text-[10px] font-bold text-white">
            {formatLatLon(vehicle.lat, vehicle.lon)}
          </span>
        </div>
      </div>
    </div>
  );
};
