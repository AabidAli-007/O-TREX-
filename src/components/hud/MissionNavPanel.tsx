import React from 'react';
import {
  Navigation,
  Compass,
  MapPin,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  AlertTriangle,
  Layers,
  Cpu,
  CornerDownLeft,
  Zap,
  ChevronLeft
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { MapDataLayerType } from '../../types/simulation';
import { formatSeconds } from '../../utils/formatters';

export const MissionNavPanel: React.FC = () => {
  const isLeftPanelOpen = useSimulationStore((state) => state.isLeftPanelOpen);
  const toggleLeftPanel = useSimulationStore((state) => state.toggleLeftPanel);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const start = useSimulationStore((state) => state.start);
  const pause = useSimulationStore((state) => state.pause);
  const reset = useSimulationStore((state) => state.reset);
  const simTime = useSimulationStore((state) => state.simTime);
  const missionState = useSimulationStore((state) => state.missionState);
  const vehicle = useSimulationStore((state) => state.vehicle);
  const anomaly = useSimulationStore((state) => state.anomaly);
  const decision = useSimulationStore((state) => state.decision);
  const env = useSimulationStore((state) => state.env);
  const waypoints = useSimulationStore((state) => state.waypoints);
  const activeDataLayer = useSimulationStore((state) => state.activeDataLayer);
  const setActiveDataLayer = useSimulationStore((state) => state.setActiveDataLayer);
  const setScenario = useSimulationStore((state) => state.setScenario);
  const setControlMode = useSimulationStore((state) => state.setControlMode);
  const addWaypoint = useSimulationStore((state) => state.addWaypoint);
  const removeWaypoint = useSimulationStore((state) => state.removeWaypoint);
  const clearRoute = useSimulationStore((state) => state.clearRoute);
  const returnHome = useSimulationStore((state) => state.returnHome);
  const triggerAnomaly = useSimulationStore((state) => state.triggerAnomaly);

  // Active waypoint calculations
  const currentWP = waypoints[vehicle.currentWaypointIndex] || waypoints[0];
  const distanceToCurrentWpM = currentWP
    ? Math.hypot(currentWP.lat * 1000 - vehicle.simX, currentWP.lon * 1000 - vehicle.simZ)
    : 0;
  const distanceToBaseM = Math.hypot(vehicle.simX, vehicle.simZ);
  const totalTravelKm = (vehicle.distanceTraveledM / 1000).toFixed(2);
  const maxRangeKm = 25.0; // Configured simulation mission target range

  const getBadgeStyle = (st: string) => {
    if (st.includes('ANOMALY') || st === 'EMERGENCY_STOP') {
      return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
    }
    if (st.includes('DECISION') || st.includes('PROFILING')) {
      return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    }
    return 'bg-navy-800 text-gray-200 border-navy-700';
  };

  if (!isLeftPanelOpen) {
    return (
      <div
        className="h-full flex flex-col items-center py-4 px-1.5 z-20 select-none"
        style={{ background: 'rgba(6,11,22,0.97)', borderRight: '1px solid rgba(28,46,82,0.7)' }}
      >
        <button
          onClick={toggleLeftPanel}
          className="p-2.5 rounded-xl flex flex-col items-center gap-3 transition-all group"
          style={{
            background: 'rgba(28,46,82,0.4)',
            border: '1px solid rgba(28,46,82,0.8)',
            color: '#FDB642'
          }}
          title="Expand Mission & Navigation Panel"
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(252,163,17,0.4)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(28,46,82,0.8)'; }}
        >
          <Navigation className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-bold [writing-mode:vertical-rl] rotate-180 uppercase tracking-widest text-gray-400 group-hover:text-white">
            MISSION & NAV
          </span>
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse mt-1" />
        </button>
      </div>
    );
  }

  return (
    <aside
      className="w-72 h-full overflow-y-auto flex flex-col gap-2.5 p-3 font-mono text-xs select-none"
      style={{
        background: 'rgba(6, 11, 22, 0.97)',
        borderRight: '1px solid rgba(28, 46, 82, 0.7)',
        backdropFilter: 'blur(20px)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
        color: '#CBD5E1',
      }}
    >
      {/* 1. MISSION SCENARIO & STATE HEADER */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-3 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-extrabold text-white text-xs">
            <Navigation className="w-4 h-4 text-orange-400" />
            <span>MISSION & NAVIGATION</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={isRunning ? pause : start}
              className={`p-1 rounded text-[10px] font-bold ${
                isRunning
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  : 'bg-orange-500 text-navy-950'
              }`}
              title={isRunning ? 'Pause' : 'Resume'}
            >
              {isRunning ? 'PAUSE' : 'PLAY'}
            </button>
            <button
              onClick={reset}
              className="p-1 hover:bg-navy-800 text-gray-400 hover:text-white rounded"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleLeftPanel}
              className="p-1 hover:bg-navy-800 text-gray-400 hover:text-white rounded ml-1"
              title="Collapse Mission Panel"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mission Scenario Preset Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-gray-400 font-sans">OCEAN SCENARIO PRESET:</label>
          <select
            value={env.scenarioId}
            onChange={(e) => setScenario(e.target.value as any)}
            className="bg-navy-950 text-white font-bold border border-navy-700 rounded px-2 py-1 outline-none text-[11px] cursor-pointer"
          >
            <option value="POLAR_OCEAN">Polar & Southern Ocean (SIH26065)</option>
            <option value="LOW_OXYGEN">Hypoxia / Low O₂ Dead Zone</option>
            <option value="TURBIDITY_PLUME">Suspended Sediment Plume</option>
            <option value="BASELINE">Open Ocean Baseline Transect</option>
            <option value="COMM_BLACKOUT">Satellite Outage & Store-Forward</option>
          </select>
        </div>

        {/* State Machine Status Pill */}
        <div className="flex items-center justify-between pt-1 border-t border-navy-800 text-[11px]">
          <span className="text-gray-400 font-sans">STATE:</span>
          <span className={`px-2 py-0.5 rounded font-bold border ${getBadgeStyle(missionState)}`}>
            {missionState.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* 2. MISSION RANGE, DISTANCE & WAYPOINT TELEMETRY */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-3 flex flex-col gap-2 shadow-lg">
        <div className="text-[11px] font-bold text-white flex items-center justify-between border-b border-navy-800 pb-1.5">
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-orange-400" />
            <span>MISSION RANGE & TRAVEL</span>
          </span>
          <span className="text-[10px] text-orange-400">
            SIM TIME: {formatSeconds(simTime)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">DISTANCE TRAVELLED</span>
            <span className="text-sm font-extrabold text-white">
              {totalTravelKm} <span className="text-[10px] text-gray-400">km</span>
            </span>
          </div>

          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">SIM TARGET RANGE</span>
            <span className="text-sm font-extrabold text-orange-400">
              {maxRangeKm.toFixed(1)} <span className="text-[10px] text-gray-400">km</span>
            </span>
          </div>

          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">TO ACTIVE WP</span>
            <span className="text-sm font-bold text-white">
              {(distanceToCurrentWpM / 1000).toFixed(2)} <span className="text-[10px] text-gray-400">km</span>
            </span>
          </div>

          <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-sans">DISTANCE TO BASE</span>
            <span className="text-sm font-bold text-white">
              {(distanceToBaseM / 1000).toFixed(2)} <span className="text-[10px] text-gray-400">km</span>
            </span>
          </div>
        </div>

        {/* Mission Range Progress Bar */}
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Mission Progress</span>
            <span>{Math.min(100, Math.round((vehicle.distanceTraveledM / (maxRangeKm * 1000)) * 100))}%</span>
          </div>
          <div className="w-full h-1.5 bg-navy-950 rounded-full overflow-hidden border border-navy-800">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (vehicle.distanceTraveledM / (maxRangeKm * 1000)) * 100)}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. AUTONOMOUS / MANUAL MODE SWITCH */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-3 flex items-center justify-between shadow-lg">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-sans">PILOT CONTROL MODE:</span>
          <span className="font-extrabold text-white text-xs">
            {vehicle.controlMode === 'AUTONOMOUS' ? 'AUTONOMOUS NAV' : 'MANUAL (WASD)'}
          </span>
        </div>

        <button
          onClick={() =>
            setControlMode(vehicle.controlMode === 'AUTONOMOUS' ? 'MANUAL' : 'AUTONOMOUS')
          }
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-sm ${
            vehicle.controlMode === 'AUTONOMOUS'
              ? 'bg-orange-500 hover:bg-orange-600 text-navy-950 font-extrabold'
              : 'bg-navy-800 text-orange-400 border border-orange-500/40 hover:bg-navy-700'
          }`}
        >
          {vehicle.controlMode === 'AUTONOMOUS' ? 'SWITCH TO MANUAL' : 'ARM AUTOPILOT'}
        </button>
      </div>

      {/* 4. WAYPOINT ROUTE MANAGER */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-3 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between border-b border-navy-800 pb-1.5">
          <span className="font-bold text-white text-xs flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span>ROUTE WAYPOINTS ({waypoints.length})</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => addWaypoint((vehicle.simX + 1000) / 1000, (vehicle.simZ + 1000) / 1000)}
              className="p-1 hover:bg-navy-800 text-orange-400 rounded"
              title="Add Waypoint Ahead"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={clearRoute}
              className="p-1 hover:bg-navy-800 text-red-400 rounded"
              title="Clear Route"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Waypoints List */}
        <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-navy-700">
          {waypoints.map((wp, idx) => {
            const isCurrent = vehicle.currentWaypointIndex === idx;
            return (
              <div
                key={wp.id}
                className={`p-2 rounded border flex items-center justify-between text-[11px] ${
                  isCurrent
                    ? 'bg-orange-500/15 border-orange-500/50 text-white font-bold'
                    : wp.reached
                    ? 'bg-navy-950/60 border-navy-800 text-gray-400'
                    : 'bg-navy-950 border-navy-800 text-gray-200'
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      wp.reached ? 'bg-green-500' : isCurrent ? 'bg-orange-400 animate-pulse' : 'bg-gray-500'
                    }`}
                  />
                  <span className="truncate">{wp.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">
                    [{wp.lat.toFixed(1)}k, {wp.lon.toFixed(1)}k]
                  </span>
                  <button
                    onClick={() => removeWaypoint(wp.id)}
                    className="text-gray-500 hover:text-red-400"
                    title="Remove Waypoint"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Route Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-navy-800">
          <button
            onClick={returnHome}
            className="bg-navy-950 hover:bg-navy-800 border border-navy-700 text-gray-200 hover:text-white py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 font-bold transition-colors"
          >
            <CornerDownLeft className="w-3.5 h-3.5 text-orange-400" />
            <span>RETURN HOME</span>
          </button>

          <button
            onClick={() => setControlMode('AUTONOMOUS')}
            className="bg-navy-950 hover:bg-navy-800 border border-navy-700 text-gray-200 hover:text-white py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 font-bold transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-green-400" />
            <span>FOLLOW ROUTE</span>
          </button>
        </div>
      </div>

      {/* 5. ANOMALY DETECTION & EDGE AI STATUS */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-3 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between border-b border-navy-800 pb-1.5">
          <span className="font-bold text-white text-xs flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            <span>EDGE ANOMALY DETECTION</span>
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              anomaly.active ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-navy-950 text-gray-400'
            }`}
          >
            {anomaly.level}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs bg-navy-950 p-2 rounded border border-navy-800">
          <span className="text-gray-400 font-sans text-[10px]">ANOMALY PROBABILITY:</span>
          <span className="font-extrabold text-orange-400 text-sm">
            {(anomaly.score * 100).toFixed(0)}%
          </span>
        </div>

        <p className="text-[10px] text-gray-300 leading-relaxed bg-navy-950/60 p-1.5 rounded border border-navy-800">
          {anomaly.triggerReason || 'Surface multi-sensor baseline nominal.'}
        </p>

        <button
          onClick={triggerAnomaly}
          className="w-full bg-orange-500 hover:bg-orange-600 text-navy-950 font-extrabold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>INJECT SYNTHETIC ANOMALY</span>
        </button>
      </div>

      {/* 6. EXPLAINABLE SCIENCE OPPORTUNITY SCORE & DECISION */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-3 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between border-b border-navy-800 pb-1.5">
          <span className="font-bold text-white text-xs flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-orange-400" />
            <span>SCIENCE OPPORTUNITY ENGINE</span>
          </span>
          <span className="text-[10px] text-gray-400">EXPLAINABLE AI</span>
        </div>

        <div className="flex items-center justify-between bg-navy-950 p-2 rounded border border-navy-800">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-400 font-sans">RECOMMENDATION</span>
            <span className="font-extrabold text-white text-[11px]">
              {decision.recommendation.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-gray-400 font-sans">SCORE</span>
            <span className="font-extrabold text-orange-400 text-sm">
              {(decision.utilityScore / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Explainability Multi-Factor Rationale */}
        <p className="text-[10px] text-orange-300/90 leading-relaxed bg-navy-950/60 p-1.5 rounded border border-navy-800">
          {decision.rationale}
        </p>
      </div>

      {/* 7. SCIENTIFIC DATA LAYERS SWITCHER */}
      <div className="bg-navy-900 border border-navy-700 rounded-xl p-3 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between border-b border-navy-800 pb-1.5">
          <span className="font-bold text-white text-xs flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            <span>SCIENTIFIC DATA LAYERS</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              { id: 'NONE', label: 'Default Ocean' },
              { id: 'TEMPERATURE', label: 'Temperature' },
              { id: 'SALINITY', label: 'Salinity (PSU)' },
              { id: 'DISSOLVED_OXYGEN', label: 'DO (Hypoxia)' },
              { id: 'TURBIDITY', label: 'Turbidity (NTU)' },
              { id: 'ANOMALY', label: 'Anomaly Heatmap' }
            ] as const
          ).map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveDataLayer(layer.id as MapDataLayerType)}
              className={`p-1.5 rounded text-[10px] font-bold transition-colors ${
                activeDataLayer === layer.id
                  ? 'bg-orange-500 text-navy-950'
                  : 'bg-navy-950 text-gray-300 hover:bg-navy-800 border border-navy-800'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
