import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Cpu,
  Layers,
  Calculator,
  BarChart3,
  AlertTriangle,
  BookOpen,
  Eye,
  Anchor,
  Compass
} from 'lucide-react';
import { useSimulationStore, CameraViewMode } from '../../store/useSimulationStore';
import { formatSeconds } from '../../utils/formatters';

export const TopHeader: React.FC = () => {
  const isRunning = useSimulationStore((state) => state.isRunning);
  const start = useSimulationStore((state) => state.start);
  const pause = useSimulationStore((state) => state.pause);
  const reset = useSimulationStore((state) => state.reset);
  const simTime = useSimulationStore((state) => state.simTime);
  const missionState = useSimulationStore((state) => state.missionState);
  const env = useSimulationStore((state) => state.env);
  const setScenario = useSimulationStore((state) => state.setScenario);
  const cameraMode = useSimulationStore((state) => state.cameraMode);
  const setCameraMode = useSimulationStore((state) => state.setCameraMode);
  const openModal = useSimulationStore((state) => state.openModal);
  const activeModal = useSimulationStore((state) => state.activeModal);

  const getMissionStateBadge = (st: string) => {
    if (st.includes('ANOMALY') || st === 'CRITICAL' || st === 'EMERGENCY_STOP')
      return 'bg-orange text-black font-extrabold border-orange animate-pulse';
    if (st.includes('DECISION') || st.includes('PROFILING') || st === 'MANUAL_PILOT')
      return 'bg-navy-950 text-orange border-orange/60';
    if (st === 'IDLE') return 'bg-navy-950 text-lightgray border-lightgray/40';
    return 'bg-navy-950 text-white border-lightgray/30';
  };

  return (
    <header className="h-14 bg-navy border-b border-lightgray/20 px-4 flex items-center justify-between select-none z-30 relative font-sans text-xs">
      {/* Brand & Project Identification */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange flex items-center justify-center font-extrabold text-black text-sm shadow-md shadow-orange/30">
            OT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white tracking-wider text-sm">
                O-TREX
              </span>
              <span className="text-[10px] bg-black text-orange px-1.5 py-0.5 rounded border border-orange/40 font-bold">
                SIH26065
              </span>
              <span className="text-[10px] text-lightgray/80 hidden sm:inline">
                CODE ZEPHYRA
              </span>
            </div>
            <div className="text-[10px] text-lightgray/60 -mt-0.5 hidden md:block">
              Oceanic Tracking & Responsive eXplorer
            </div>
          </div>
        </div>

        {/* Autonomous / Pilot State Badge */}
        <div
          className={`px-2.5 py-1 rounded text-xs font-bold border flex items-center gap-1.5 ${getMissionStateBadge(
            missionState
          )}`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-ping-slow" />
          <span>{missionState.replace(/_/g, ' ')}</span>
        </div>
      </div>

      {/* Center: Environment Preset & Camera Mode Controls */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Environment Preset Dropdown */}
        <div className="flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-lg border border-lightgray/20 text-xs">
          <Anchor className="w-3.5 h-3.5 text-orange" />
          <span className="text-lightgray/70 text-[10px]">ENV:</span>
          <select
            value={env.scenarioId}
            onChange={(e) => setScenario(e.target.value as any)}
            className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
          >
            <option value="LOW_OXYGEN" className="bg-navy text-white">
              Hypoxia / Low O₂ Anomaly
            </option>
            <option value="POLAR_OCEAN" className="bg-navy text-white">
              Polar / Southern Ocean (SIH)
            </option>
            <option value="TURBIDITY_PLUME" className="bg-navy text-white">
              Suspended Sediment Plume
            </option>
            <option value="BASELINE" className="bg-navy text-white">
              Standard Baseline Transect
            </option>
            <option value="COMM_BLACKOUT" className="bg-navy text-white">
              Satellite Outage / Store & Fwd
            </option>
          </select>
        </div>

        {/* 6 Camera Views Selector */}
        <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-lightgray/20 text-xs">
          {(
            [
              { id: 'FOLLOW', label: 'Follow', icon: Eye },
              { id: 'FREE', label: 'Orbit', icon: Compass },
              { id: 'TOP_DOWN', label: 'Top', icon: Compass },
              { id: 'UNDERWATER_POD', label: 'Pod', icon: Anchor },
              { id: 'HARDWARE', label: 'Deck', icon: Cpu },
              { id: 'SIDE', label: 'Side', icon: Eye }
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setCameraMode(item.id as CameraViewMode)}
              className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 transition-colors ${
                cameraMode === item.id
                  ? 'bg-orange text-black font-extrabold shadow-sm'
                  : 'text-lightgray hover:text-white'
              }`}
            >
              <item.icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Modals & Actions */}
      <div className="flex items-center gap-2">
        {/* Judge Tour Button */}
        <button
          onClick={() => openModal('JUDGE_TOUR')}
          className="bg-orange hover:bg-orange-400 text-black font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-orange/20 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>JUDGE TOUR</span>
        </button>

        {/* Modal Panels Launcher Bar */}
        <div className="hidden xl:flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-lightgray/20">
          <button
            onClick={() => openModal('HARDWARE')}
            className={`p-1.5 rounded hover:bg-navy-700 text-xs flex items-center gap-1 text-lightgray hover:text-white ${
              activeModal === 'HARDWARE' ? 'bg-orange text-black font-bold' : ''
            }`}
            title="Inspect 3D Hardware Subsystems"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="text-[11px]">Hardware</span>
          </button>
          <button
            onClick={() => openModal('COMPETITORS')}
            className={`p-1.5 rounded hover:bg-navy-700 text-xs flex items-center gap-1 text-lightgray hover:text-white ${
              activeModal === 'COMPETITORS' ? 'bg-orange text-black font-bold' : ''
            }`}
            title="Compare Existing Systems (Ship, Argo, Saildrone, Buoy)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[11px]">Compare</span>
          </button>
          <button
            onClick={() => openModal('BOM')}
            className={`p-1.5 rounded hover:bg-navy-700 text-xs flex items-center gap-1 text-lightgray hover:text-white ${
              activeModal === 'BOM' ? 'bg-orange text-black font-bold' : ''
            }`}
            title="Prototype Cost Analysis & BOM"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="text-[11px]">BOM</span>
          </button>
          <button
            onClick={() => openModal('ANALYTICS')}
            className={`p-1.5 rounded hover:bg-navy-700 text-xs flex items-center gap-1 text-lightgray hover:text-white ${
              activeModal === 'ANALYTICS' ? 'bg-orange text-black font-bold' : ''
            }`}
            title="Scientific Data Analytics & Export"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Analytics</span>
          </button>
          <button
            onClick={() => openModal('FAILURES')}
            className={`p-1.5 rounded hover:bg-navy-700 text-xs flex items-center gap-1 text-lightgray hover:text-white ${
              activeModal === 'FAILURES' ? 'bg-orange text-black font-bold' : ''
            }`}
            title="Inject Failures & Test Fault Tolerance"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[11px]">Faults</span>
          </button>
          <button
            onClick={() => openModal('SOURCES')}
            className={`p-1.5 rounded hover:bg-navy-700 text-xs flex items-center gap-1 text-lightgray hover:text-white ${
              activeModal === 'SOURCES' ? 'bg-orange text-black font-bold' : ''
            }`}
            title="Literature, NOAA/Argo Sources & Evidence"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-[11px]">Sources</span>
          </button>
        </div>

        {/* Global Play / Pause / Reset */}
        <div className="flex items-center gap-1 bg-black/80 p-1 rounded-lg border border-lightgray/20">
          <button
            onClick={isRunning ? pause : start}
            className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
              isRunning
                ? 'bg-orange/20 text-orange border border-orange/40 hover:bg-orange/30'
                : 'bg-orange text-black font-bold hover:bg-orange-400'
            }`}
            title={isRunning ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={reset}
            className="p-1.5 rounded hover:bg-navy-700 text-lightgray hover:text-white"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="px-1.5 text-[11px] font-bold text-white hidden sm:block">
            {formatSeconds(simTime)}
          </div>
        </div>
      </div>
    </header>
  );
};
