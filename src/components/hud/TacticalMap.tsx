import React, { useState } from 'react';
import { Compass, Maximize2, Minimize2, Navigation } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { COMPETITOR_SYSTEMS } from '../../data/competitorsData';

export const TacticalMap: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const vehicle = useSimulationStore((state) => state.vehicle);
  const env = useSimulationStore((state) => state.env);

  // Map coordinate conversion scale
  const mapSize = isExpanded ? 340 : 160;
  const centerCoord = mapSize / 2;
  const scale = mapSize / 120; // 120m world diameter

  const vehicleMapX = centerCoord + vehicle.simX * scale;
  const vehicleMapY = centerCoord + vehicle.simZ * scale;

  const anomalyMapX = centerCoord + env.anomalyRegion.centerSimX * scale;
  const anomalyMapY = centerCoord + env.anomalyRegion.centerSimZ * scale;
  const anomalyRadius = env.anomalyRegion.radiusM * scale * 0.5;

  return (
    <div
      className={`absolute bottom-16 left-4 bg-navy-900/95 backdrop-blur-md border border-navy-700 rounded-lg p-2 shadow-2xl transition-all duration-300 select-none z-20 font-mono text-gray-200 ${
        isExpanded ? 'w-88 h-92' : 'w-44 h-48'
      }`}
    >
      <div className="flex items-center justify-between text-[10px] text-white mb-1 border-b border-navy-800 pb-1">
        <span className="flex items-center gap-1 font-bold">
          <Compass className="w-3 h-3 text-orange-400" />
          <span>TACTICAL MAP</span>
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white"
        >
          {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
        </button>
      </div>

      <div
        className="relative bg-navy-950 rounded border border-navy-800 overflow-hidden flex items-center justify-center"
        style={{ width: '100%', height: isExpanded ? 300 : 135 }}
      >
        {/* Radar Range Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-3/4 rounded-full border border-orange-500/10" />
          <div className="w-1/2 h-1/2 rounded-full border border-orange-500/20" />
          <div className="w-1/4 h-1/4 rounded-full border border-orange-500/15" />
          <div className="absolute w-full h-[1px] bg-orange-500/10" />
          <div className="absolute h-full w-[1px] bg-orange-500/10" />
        </div>

        {/* Anomaly Hotspot Region */}
        {env.anomalyRegion.active && (
          <div
            className="absolute rounded-full bg-red-500/20 border border-red-500/40 animate-pulse pointer-events-none"
            style={{
              left: `${anomalyMapX - anomalyRadius}px`,
              top: `${anomalyMapY - anomalyRadius}px`,
              width: `${anomalyRadius * 2}px`,
              height: `${anomalyRadius * 2}px`
            }}
          />
        )}

        {/* Competitor Markers on Map */}
        {COMPETITOR_SYSTEMS.map((comp) => {
          const cx = centerCoord + comp.simCoords[0] * scale;
          const cy = centerCoord + comp.simCoords[2] * scale;
          return (
            <div
              key={comp.id}
              className="absolute w-2 h-2 rounded-full bg-gray-400 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${cx}px`, top: `${cy}px` }}
              title={comp.name}
            />
          );
        })}

        {/* O-TREX Vehicle Marker with Heading Vector */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
          style={{ left: `${vehicleMapX}px`, top: `${vehicleMapY}px` }}
        >
          <div
            className="w-3.5 h-3.5 text-orange-400 drop-shadow-md flex items-center justify-center"
            style={{ transform: `rotate(${vehicle.headingDeg}deg)` }}
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>

        {/* Current Drift Vector Indicator */}
        <div className="absolute bottom-1 right-1 text-[8px] text-orange-400 bg-navy-900/90 px-1 py-0.5 rounded border border-navy-700">
          CUR: {env.currentSpeedKnots.toFixed(1)}kts @ {env.currentDirectionDeg}°
        </div>
      </div>
    </div>
  );
};
