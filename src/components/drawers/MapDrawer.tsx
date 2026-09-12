import React from 'react';
import {
  X,
  MapPin,
  Navigation,
  Wind,
  Waves,
  RotateCcw
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { COMPETITOR_SYSTEMS } from '../../data/competitorsData';
import { formatLatLon } from '../../utils/formatters';

export const MapDrawer: React.FC = () => {
  const closeDrawer = useSimulationStore((state) => state.closeDrawer);
  const vehicle = useSimulationStore((state) => state.vehicle);
  const env = useSimulationStore((state) => state.env);
  const recenterVehicle = useSimulationStore((state) => state.recenterVehicle);

  const mapSize = 340;
  const centerCoord = mapSize / 2;
  const scale = mapSize / 140; // 140m world diameter

  const vehicleMapX = Math.max(10, Math.min(mapSize - 10, centerCoord + vehicle.simX * scale));
  const vehicleMapY = Math.max(10, Math.min(mapSize - 10, centerCoord + vehicle.simZ * scale));

  const anomalyMapX = centerCoord + env.anomalyRegion.centerSimX * scale;
  const anomalyMapY = centerCoord + env.anomalyRegion.centerSimZ * scale;
  const anomalyRadius = env.anomalyRegion.radiusM * scale * 0.5;

  return (
    <div className="w-96 bg-navy-950/95 backdrop-blur-lg border-l border-navy-800 h-full flex flex-col font-sans text-xs select-none shadow-2xl text-gray-200">
      {/* Header */}
      <div className="h-12 bg-navy-900 px-4 flex items-center justify-between border-b border-navy-800">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-400" />
          <span className="font-extrabold text-white text-sm">TACTICAL RADAR & MAP</span>
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
        {/* Coordinates Banner */}
        <div className="bg-navy-900 rounded-lg p-2.5 border border-navy-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400">GNSS COORDINATES</div>
            <div className="text-xs font-extrabold text-white">
              {formatLatLon(vehicle.lat, vehicle.lon)}
            </div>
          </div>
          <button
            onClick={recenterVehicle}
            className="bg-navy-950 hover:bg-navy-800 text-orange-400 border border-orange-500/30 px-2 py-1 rounded text-[11px] flex items-center gap-1 font-bold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RECENTER</span>
          </button>
        </div>

        {/* 1. Tactical Radar View */}
        <div className="bg-navy-900 rounded-lg p-2.5 border border-navy-800 flex flex-col items-center">
          <div
            className="relative bg-navy-950 rounded border border-navy-800 overflow-hidden flex items-center justify-center shadow-inner"
            style={{ width: '100%', height: 320 }}
          >
            {/* Radar Range Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[85%] h-[85%] rounded-full border border-orange-500/10" />
              <div className="w-[60%] h-[60%] rounded-full border border-orange-500/20" />
              <div className="w-[30%] h-[30%] rounded-full border border-orange-500/15" />
              <div className="absolute w-full h-[1px] bg-orange-500/10" />
              <div className="absolute h-full w-[1px] bg-orange-500/10" />
            </div>

            {/* Anomaly Hotspot Region */}
            {env.anomalyRegion.active && (
              <div
                className="absolute rounded-full bg-red-500/20 border border-red-500/40 animate-pulse pointer-events-none flex items-center justify-center"
                style={{
                  left: `${anomalyMapX - anomalyRadius}px`,
                  top: `${anomalyMapY - anomalyRadius}px`,
                  width: `${anomalyRadius * 2}px`,
                  height: `${anomalyRadius * 2}px`
                }}
              >
                <span className="text-[8px] text-red-300 font-bold bg-navy-950/80 px-1 rounded">
                  ANOMALY ZONE
                </span>
              </div>
            )}

            {/* Competitor Markers */}
            {COMPETITOR_SYSTEMS.map((comp) => {
              const cx = centerCoord + comp.simCoords[0] * scale;
              const cy = centerCoord + comp.simCoords[2] * scale;
              return (
                <div
                  key={comp.id}
                  className="absolute w-2.5 h-2.5 rounded-full bg-gray-400 -translate-x-1/2 -translate-y-1/2 border border-gray-600"
                  style={{ left: `${cx}px`, top: `${cy}px` }}
                  title={comp.name}
                />
              );
            })}

            {/* O-TREX Vehicle Marker */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
              style={{ left: `${vehicleMapX}px`, top: `${vehicleMapY}px` }}
            >
              <div
                className="w-4 h-4 text-orange-400 drop-shadow-md flex items-center justify-center"
                style={{ transform: `rotate(${vehicle.headingDeg}deg)` }}
              >
                <Navigation className="w-4 h-4 fill-current" />
              </div>
            </div>

            {/* Compass & Current Vector Tag */}
            <div className="absolute top-2 left-2 text-[9px] text-gray-400 bg-navy-900/90 px-1.5 py-0.5 rounded border border-navy-800">
              N ↑ (RADAR 140m)
            </div>

            <div className="absolute bottom-2 right-2 text-[9px] text-orange-400 bg-navy-900/90 px-1.5 py-0.5 rounded border border-navy-800">
              CURRENT: {env.currentSpeedKnots.toFixed(1)}kt @ {env.currentDirectionDeg}°
            </div>
          </div>
        </div>

        {/* 2. Environmental Metocean Conditions */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">METOCEAN ENVIRONMENT</span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-navy-950 p-2 rounded border border-navy-800">
              <div className="text-[10px] text-gray-400 flex items-center gap-1">
                <Wind className="w-3 h-3 text-orange-400" />
                <span>WIND SPEED</span>
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                {(env.windSpeedMs * 1.94384).toFixed(1)} kts ({env.windDirectionDeg}°)
              </div>
            </div>

            <div className="bg-navy-950 p-2 rounded border border-navy-800">
              <div className="text-[10px] text-gray-400 flex items-center gap-1">
                <Waves className="w-3 h-3 text-orange-400" />
                <span>SIGNIFICANT WAVES</span>
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                {env.waveHeightM.toFixed(1)}m (Period: {env.wavePeriodS}s)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
