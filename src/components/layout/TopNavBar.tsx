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
  Anchor,
  Navigation,
  Activity,
  Gauge,
  MapPin,
  Sliders,
  Ruler,
  Moon,
  Sun
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

  const DrawerBtn = ({
    id, icon: Icon, label
  }: {
    id: Parameters<typeof toggleDrawer>[0];
    icon: React.ElementType;
    label: string;
  }) => {
    const active = activeDrawer === id;
    return (
      <button
        onClick={() => toggleDrawer(id)}
        title={label}
        className="relative px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150"
        style={{
          background: active ? 'rgba(252,163,17,0.15)' : 'transparent',
          color: active ? '#FDB642' : '#94A3B8',
          boxShadow: active ? '0 0 0 1px rgba(252,163,17,0.3) inset' : 'none',
        }}
        onMouseEnter={(e) => {
          if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
        }}
        onMouseLeave={(e) => {
          if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
        }}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{label}</span>
        {active && (
          <span
            className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
            style={{ background: '#FCA311' }}
          />
        )}
      </button>
    );
  };

  const ModalBtn = ({
    id, icon: Icon, label, className: cls = ''
  }: {
    id: Parameters<typeof openModal>[0];
    icon: React.ElementType;
    label: string;
    className?: string;
  }) => {
    const active = activeModal === id;
    return (
      <button
        onClick={() => openModal(id)}
        title={label}
        className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 ${cls}`}
        style={{
          background: active ? 'rgba(252,163,17,0.15)' : 'transparent',
          color: active ? '#FDB642' : '#64748B',
          boxShadow: active ? '0 0 0 1px rgba(252,163,17,0.3) inset' : 'none',
        }}
        onMouseEnter={(e) => {
          if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
          if (!active) (e.currentTarget as HTMLElement).style.color = '#CBD5E1';
        }}
        onMouseLeave={(e) => {
          if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
          if (!active) (e.currentTarget as HTMLElement).style.color = '#64748B';
        }}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
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
      {/* Subtle top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(252,163,17,0.4), rgba(34,211,238,0.3), transparent)' }}
      />

      {/* 1. Brand + Mission State */}
      <div className="flex items-center gap-3">
        {/* Logo */}
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
              <span className="text-[9px] text-gray-600 hidden xl:inline tracking-widest">CODE ZEPHYRA</span>
            </div>
            <span className="text-[8px] text-gray-600 -mt-0.5 hidden 2xl:block tracking-widest">POLAR OCEAN PLATFORM</span>
          </div>
        </div>

        {/* Mission Status Badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold"
          style={{
            background: badge.bg,
            border: `1px solid ${badge.border}`,
            color: badge.text
          }}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${badge.pulse ? 'animate-ping' : ''}`}
            style={{ background: badge.dot, minWidth: '6px' }}
          />
          <span className="hidden md:inline">{missionState.replace(/_/g, ' ')}</span>
        </div>
      </div>

      {/* 2. Primary Navigation */}
      <nav
        className="flex items-center gap-0.5 rounded-xl p-1"
        style={{ background: 'rgba(10, 18, 34, 0.8)', border: '1px solid rgba(28, 46, 82, 0.6)' }}
      >
        <DrawerBtn id="MISSION" icon={Navigation} label="MISSION" />
        <DrawerBtn id="VEHICLE" icon={Gauge} label="VEHICLE" />
        <DrawerBtn id="SENSORS" icon={Activity} label="SENSORS" />
        <DrawerBtn id="POD" icon={Anchor} label="POD" />
        <DrawerBtn id="MAP" icon={MapPin} label="MAP" />
        <DrawerBtn id="ANALYTICS" icon={BarChart3} label="CHARTS" />

        {/* Divider */}
        <div className="w-px h-4 bg-navy-700 mx-1 hidden lg:block" />

        {/* Modal launchers */}
        <ModalBtn id="HARDWARE" icon={Cpu} label="HARDWARE" className="hidden lg:flex" />
        <ModalBtn id="SIZE_CHARTER" icon={Ruler} label="SIZE" className="hidden lg:flex" />
        <ModalBtn id="COMPETITORS" icon={Layers} label="COMPARE" className="hidden xl:flex" />
        <ModalBtn id="BOM" icon={Calculator} label="BOM" className="hidden xl:flex" />
        <ModalBtn id="FAILURES" icon={AlertTriangle} label="FAULTS" className="hidden 2xl:flex" />
        <ModalBtn id="SOURCES" icon={BookOpen} label="SOURCES" className="hidden 2xl:flex" />
        <ModalBtn id="GRAPHICS" icon={Sliders} label="GFX" />

        {/* Full viewport toggle */}
        <button
          onClick={() => {
            const state = useSimulationStore.getState();
            if (state.isLeftPanelOpen || state.isRightPanelOpen) {
              state.setLeftPanelOpen(false);
              state.setRightPanelOpen(false);
            } else {
              state.setLeftPanelOpen(true);
              state.setRightPanelOpen(true);
            }
          }}
          className="px-2 py-1.5 rounded-lg text-xs font-bold border transition-all ml-0.5"
          style={{
            background: !useSimulationStore((s) => s.isLeftPanelOpen) && !useSimulationStore((s) => s.isRightPanelOpen)
              ? 'rgba(34,197,94,0.12)'
              : 'rgba(28,46,82,0.4)',
            color: !useSimulationStore((s) => s.isLeftPanelOpen) && !useSimulationStore((s) => s.isRightPanelOpen)
              ? '#86EFAC'
              : '#94A3B8',
            borderColor: !useSimulationStore((s) => s.isLeftPanelOpen) && !useSimulationStore((s) => s.isRightPanelOpen)
              ? 'rgba(34,197,94,0.3)'
              : 'rgba(28,46,82,0.8)',
          }}
          title="Toggle Full Viewport (Zen Mode)"
        >
          {!useSimulationStore((s) => s.isLeftPanelOpen) && !useSimulationStore((s) => s.isRightPanelOpen) ? 'FULL' : 'PANELS'}
        </button>
      </nav>

      {/* 3. Right Controls */}
      <div className="flex items-center gap-2">
        {/* Sim Speed */}
        <div
          className="hidden sm:flex items-center p-0.5 rounded-lg text-xs font-bold"
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

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg transition-all border"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'rgba(10, 18, 34, 0.8)',
            border: '1px solid rgba(28, 46, 82, 0.6)',
            color: '#94A3B8'
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#FDB642'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#94A3B8'; }}
        >
          {isDarkMode
            ? <Sun className="w-3.5 h-3.5" />
            : <Moon className="w-3.5 h-3.5" />
          }
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

        {/* Play/Pause/Reset */}
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
            className="p-1.5 rounded-md transition-all"
            title="Reset Simulation"
            style={{ color: '#64748B' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#CBD5E1'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#64748B'; }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div
            className="px-2 text-[11px] font-bold hidden sm:block tabular-nums"
            style={{ color: '#E2E8F0' }}
          >
            {formatSeconds(simTime)}
          </div>
        </div>
      </div>
    </header>
  );
};
