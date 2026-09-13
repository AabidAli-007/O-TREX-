import React, { useState } from 'react';
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
  Anchor,
  Navigation,
  Gauge,
  MapPin,
  Sliders,
  Ruler,
  Moon,
  Sun,
  Waves,
  ChevronDown
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { formatSeconds } from '../../utils/formatters';

const getMissionBadgeStyle = (st: string) => {
  if (st.includes('ANOMALY') || st === 'CRITICAL' || st === 'EMERGENCY_STOP') {
    return {
      bg: 'rgba(239,68,68,0.15)',
      border: 'rgba(239,68,68,0.5)',
      text: '#FCA5A5',
      dot: '#EF4444',
      pulse: true
    };
  }
  if (st.includes('DECISION') || st.includes('PROFILING') || st === 'MANUAL_PILOT') {
    return {
      bg: 'rgba(252,163,17,0.12)',
      border: 'rgba(252,163,17,0.45)',
      text: '#FDB642',
      dot: '#FCA311',
      pulse: false
    };
  }
  if (st.includes('AUTONOMOUS') || st.includes('NAVIGATION')) {
    return {
      bg: 'rgba(34,197,94,0.1)',
      border: 'rgba(34,197,94,0.35)',
      text: '#86EFAC',
      dot: '#22C55E',
      pulse: false
    };
  }
  return {
    bg: 'rgba(28,46,82,0.6)',
    border: 'rgba(28,46,82,0.9)',
    text: '#94A3B8',
    dot: '#475569',
    pulse: false
  };
};

export const TopNavBar: React.FC = () => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isRunning = useSimulationStore((state) => state.isRunning);
  const start = useSimulationStore((state) => state.start);
  const pause = useSimulationStore((state) => state.pause);
  const reset = useSimulationStore((state) => state.reset);
  const simTime = useSimulationStore((state) => state.simTime);
  const missionState = useSimulationStore((state) => state.missionState);
  const openModal = useSimulationStore((state) => state.openModal);
  const activeModal = useSimulationStore((state) => state.activeModal);
  const activeDrawer = useSimulationStore((state) => state.activeDrawer);
  const toggleDrawer = useSimulationStore((state) => state.toggleDrawer);
  const isDarkMode = useSimulationStore((state) => state.isDarkMode);
  const toggleDarkMode = useSimulationStore((state) => state.toggleDarkMode);

  const badge = getMissionBadgeStyle(missionState);

  const NavBtn = ({
    id,
    icon: Icon,
    label,
    isModal = false,
    modalId
  }: {
    id?: Parameters<typeof toggleDrawer>[0];
    icon: React.ElementType;
    label: string;
    isModal?: boolean;
    modalId?: Parameters<typeof openModal>[0];
  }) => {
    const active = isModal ? activeModal === modalId : activeDrawer === id;
    return (
      <button
        onClick={() => {
          if (isModal && modalId) {
            openModal(modalId);
          } else if (id) {
            toggleDrawer(id);
          }
        }}
        title={label}
        className="relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150"
        style={{
          background: active ? 'rgba(252,163,17,0.15)' : 'transparent',
          color: active ? '#FDB642' : '#94A3B8',
          boxShadow: active ? '0 0 0 1px rgba(252,163,17,0.3) inset' : 'none',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
            (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#94A3B8';
          }
        }}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="hidden md:inline">{label}</span>
        {active && (
          <span
            className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
            style={{ background: '#FCA311' }}
          />
        )}
      </button>
    );
  };

  return (
    <header
      className="h-13 flex-shrink-0 relative z-30 select-none font-sans text-xs flex items-center justify-between px-3 shadow-lg"
      style={{
        background: 'rgba(6, 11, 22, 0.98)',
        borderBottom: '1px solid rgba(28, 46, 82, 0.8)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(252,163,17,0.4), rgba(34,211,238,0.3), transparent)' }}
      />

      {/* 1. Brand + Mission State */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-navy-950 text-[11px] tracking-wider flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #FDB642, #FCA311)',
              boxShadow: '0 0 12px rgba(252,163,17,0.4)'
            }}
          >
            OT
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white tracking-widest text-sm">O-TREX</span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wide"
                style={{ background: 'rgba(252,163,17,0.12)', color: '#FDB642', border: '1px solid rgba(252,163,17,0.25)' }}
              >
                SIH26065
              </span>
            </div>
            <span className="text-[8px] text-gray-500 -mt-0.5 hidden xl:block tracking-widest uppercase">Autonomous Ocean Observer</span>
          </div>
        </div>

        {/* Mission Status Badge */}
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
          style={{
            background: badge.bg,
            border: '1px solid ' + badge.border,
            color: badge.text
          }}
        >
          <span
            className={'w-1.5 h-1.5 rounded-full ' + (badge.pulse ? 'animate-ping' : '')}
            style={{ background: badge.dot, minWidth: '6px' }}
          />
          <span className="hidden sm:inline">{missionState.replace(/_/g, ' ')}</span>
        </div>
      </div>

      {/* 2. Primary Navigation: O-TREX · MISSION · VEHICLE · OCEAN DATA · POD · MAP · HARDWARE · ANALYTICS */}
      <nav
        className="flex items-center gap-0.5 rounded-xl p-1"
        style={{ background: 'rgba(10, 18, 34, 0.8)', border: '1px solid rgba(28, 46, 82, 0.6)' }}
      >
        <NavBtn id="MISSION" icon={Navigation} label="MISSION" />
        <NavBtn id="VEHICLE" icon={Gauge} label="VEHICLE" />
        <NavBtn id="OCEAN_DATA" icon={Waves} label="OCEAN DATA" />
        <NavBtn id="POD" icon={Anchor} label="POD" />
        <NavBtn id="MAP" icon={MapPin} label="MAP" />
        <NavBtn isModal modalId="HARDWARE" icon={Cpu} label="HARDWARE" />
        <NavBtn id="ANALYTICS" icon={BarChart3} label="ANALYTICS" />

        {/* Secondary Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            title="Additional Subsystems & Tools"
          >
            <span>MORE</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showMoreMenu && (
            <div
              className="absolute top-full mt-1 right-0 w-48 bg-navy-950/98 backdrop-blur-xl border border-navy-700 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1"
              onMouseLeave={() => setShowMoreMenu(false)}
            >
              <button
                onClick={() => { openModal('COMPETITORS'); setShowMoreMenu(false); }}
                className="flex items-center gap-2 p-2 rounded-lg text-left text-xs text-gray-300 hover:text-white hover:bg-navy-900 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-orange-400" />
                <span>Existing Systems Compare</span>
              </button>
              <button
                onClick={() => { openModal('BOM'); setShowMoreMenu(false); }}
                className="flex items-center gap-2 p-2 rounded-lg text-left text-xs text-gray-300 hover:text-white hover:bg-navy-900 transition-colors"
              >
                <Calculator className="w-3.5 h-3.5 text-orange-400" />
                <span>BOM Cost Estimator</span>
              </button>
              <button
                onClick={() => { openModal('SIZE_CHARTER'); setShowMoreMenu(false); }}
                className="flex items-center gap-2 p-2 rounded-lg text-left text-xs text-gray-300 hover:text-white hover:bg-navy-900 transition-colors"
              >
                <Ruler className="w-3.5 h-3.5 text-orange-400" />
                <span>Hull Sizing Charter</span>
              </button>
              <button
                onClick={() => { openModal('FAILURES'); setShowMoreMenu(false); }}
                className="flex items-center gap-2 p-2 rounded-lg text-left text-xs text-gray-300 hover:text-white hover:bg-navy-900 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                <span>Fault Injection Lab</span>
              </button>
              <button
                onClick={() => { openModal('SOURCES'); setShowMoreMenu(false); }}
                className="flex items-center gap-2 p-2 rounded-lg text-left text-xs text-gray-300 hover:text-white hover:bg-navy-900 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                <span>Academic Sources</span>
              </button>
              <button
                onClick={() => { openModal('GRAPHICS'); setShowMoreMenu(false); }}
                className="flex items-center gap-2 p-2 rounded-lg text-left text-xs text-gray-300 hover:text-white hover:bg-navy-900 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-orange-400" />
                <span>3D Ocean Graphics</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* 3. Right Controls */}
      <div className="flex items-center gap-2">
        {/* Speed */}
        <div
          className="hidden lg:flex items-center p-0.5 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(10, 18, 34, 0.8)', border: '1px solid rgba(28, 46, 82, 0.6)' }}
        >
          {([1, 2, 4, 8] as const).map((speed) => {
            const active = useSimulationStore.getState().simSpeed === speed;
            return (
              <button
                key={speed}
                onClick={() => useSimulationStore.getState().setSpeed(speed)}
                className="px-2 py-1 rounded text-[10px] transition-all"
                style={{
                  background: active ? 'rgba(252,163,17,0.2)' : 'transparent',
                  color: active ? '#FDB642' : '#64748B',
                  fontWeight: active ? 800 : 600,
                  boxShadow: active ? '0 0 6px rgba(252,163,17,0.2) inset' : 'none'
                }}
              >
                {speed}x
              </button>
            );
          })}
        </div>

        {/* Dark Mode */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg transition-all border text-gray-400 hover:text-white"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'rgba(10, 18, 34, 0.8)',
            border: '1px solid rgba(28, 46, 82, 0.6)'
          }}
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Judge Tour */}
        <button
          onClick={() => openModal('JUDGE_TOUR')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold text-navy-950 active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #FDB642, #FCA311)',
            boxShadow: '0 0 12px rgba(252,163,17,0.35)'
          }}
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">JUDGE TOUR</span>
        </button>

        {/* Play / Pause / Reset */}
        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{ background: 'rgba(10, 18, 34, 0.8)', border: '1px solid rgba(28, 46, 82, 0.6)' }}
        >
          <button
            onClick={isRunning ? pause : start}
            className="p-1.5 rounded-md transition-all"
            title={isRunning ? 'Pause Simulation' : 'Resume Simulation'}
            style={{
              background: isRunning ? 'rgba(252,163,17,0.15)' : 'rgba(252,163,17,0.9)',
              color: isRunning ? '#FDB642' : '#060B16',
              border: isRunning ? '1px solid rgba(252,163,17,0.4)' : 'none',
            }}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={reset}
            className="p-1.5 rounded-md transition-all text-gray-500 hover:text-white"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div
            className="px-2 text-[11px] font-bold hidden sm:block tabular-nums text-gray-200"
          >
            {formatSeconds(simTime)}
          </div>
        </div>
      </div>
    </header>
  );
};
