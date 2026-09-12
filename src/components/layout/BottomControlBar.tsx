import React from 'react';
import {
  Compass,
  Anchor,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  PauseCircle,
  RotateCcw,
  CornerDownLeft,
  Zap,
  Eye,
  Waves
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const BottomControlBar: React.FC = () => {
  const vehicle = useSimulationStore((state) => state.vehicle);
  const pod = useSimulationStore((state) => state.pod);
  const cameraMode = useSimulationStore((state) => state.cameraMode);
  const setCameraMode = useSimulationStore((state) => state.setCameraMode);
  const keyboardState = useSimulationStore((state) => state.keyboardState);
  const manualDeployPod = useSimulationStore((state) => state.manualDeployPod);
  const holdPodDepth = useSimulationStore((state) => state.holdPodDepth);
  const manualRetractPod = useSimulationStore((state) => state.manualRetractPod);
  const emergencyStop = useSimulationStore((state) => state.emergencyStop);
  const clearEmergencyStop = useSimulationStore((state) => state.clearEmergencyStop);
  const recenterVehicle = useSimulationStore((state) => state.recenterVehicle);
  const returnHome = useSimulationStore((state) => state.returnHome);
  const setKeyDown = useSimulationStore((state) => state.setKeyDown);
  const setKeyUp = useSimulationStore((state) => state.setKeyUp);

  const speedPct = Math.min(100, (vehicle.speedKnots / 6.5) * 100);

  const WasdKey = ({
    keyName, children, className: cls = ''
  }: {
    keyName: string;
    children: React.ReactNode;
    className?: string;
  }) => {
    const pressed = keyboardState[keyName as keyof typeof keyboardState];
    return (
      <button
        onMouseDown={() => setKeyDown(keyName)}
        onMouseUp={() => setKeyUp(keyName)}
        className={`flex flex-col items-center justify-center rounded-lg font-bold text-xs transition-all duration-75 select-none ${cls}`}
        style={{
          background: pressed
            ? 'linear-gradient(180deg, #FDB642 0%, #FCA311 100%)'
            : 'linear-gradient(180deg, #1C2E52 0%, #14213D 100%)',
          border: pressed ? '1px solid rgba(252,163,17,0.5)' : '1px solid rgba(28,46,82,0.9)',
          borderBottom: pressed ? '2px solid rgba(180,90,0,0.6)' : '3px solid rgba(0,0,0,0.5)',
          color: pressed ? '#060B16' : '#CBD5E1',
          transform: pressed ? 'translateY(2px)' : 'translateY(0)',
          boxShadow: pressed
            ? '0 0 12px rgba(252,163,17,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {children}
      </button>
    );
  };

  return (
    <footer
      className="h-14 flex-shrink-0 relative z-30 select-none font-sans text-xs flex items-center justify-between px-4 shadow-2xl"
      style={{
        background: 'rgba(6, 11, 22, 0.98)',
        borderTop: '1px solid rgba(28, 46, 82, 0.8)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.3), transparent)' }}
      />

      {/* 1. WASD Controls */}
      <div className="flex items-center gap-2">
        {/* WASD Grid */}
        <div className="flex flex-col gap-1">
          {/* W */}
          <div className="flex justify-center">
            <WasdKey keyName="w" className="w-9 h-8">
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="text-[8px] leading-none mt-0.5">W</span>
            </WasdKey>
          </div>
          {/* A S D */}
          <div className="flex gap-1">
            <WasdKey keyName="a" className="w-9 h-8">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-[8px] leading-none mt-0.5">A</span>
            </WasdKey>
            <WasdKey keyName="s" className="w-9 h-8">
              <ArrowDown className="w-3.5 h-3.5" />
              <span className="text-[8px] leading-none mt-0.5">S</span>
            </WasdKey>
            <WasdKey keyName="d" className="w-9 h-8">
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="text-[8px] leading-none mt-0.5">D</span>
            </WasdKey>
          </div>
        </div>

        {/* Boost + Recenter */}
        <div className="flex flex-col gap-1">
          <button
            onMouseDown={() => setKeyDown('shift')}
            onMouseUp={() => setKeyUp('shift')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-[10px] border transition-all"
            style={{
              background: keyboardState.shift ? 'rgba(252,163,17,0.9)' : 'rgba(252,163,17,0.08)',
              color: keyboardState.shift ? '#060B16' : '#FDB642',
              border: keyboardState.shift ? '1px solid #FCA311' : '1px solid rgba(252,163,17,0.25)',
              boxShadow: keyboardState.shift ? '0 0 12px rgba(252,163,17,0.4)' : 'none',
            }}
            title="Boost Speed (Shift)"
          >
            <Zap className="w-3 h-3" />
            <span className="hidden sm:inline">BOOST</span>
          </button>
          <button
            onClick={recenterVehicle}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] border transition-all"
            title="Recenter (R)"
            style={{
              background: 'rgba(28,46,82,0.4)',
              color: '#94A3B8',
              border: '1px solid rgba(28,46,82,0.8)'
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(28,46,82,0.7)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(28,46,82,0.4)'; }}
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">RECENTER</span>
          </button>
        </div>
      </div>

      {/* 2. Central Live Telemetry */}
      <div
        className="hidden lg:flex items-center gap-5 px-5 py-2 rounded-xl"
        style={{ background: 'rgba(10, 18, 34, 0.8)', border: '1px solid rgba(28, 46, 82, 0.7)' }}
      >
        {/* SOG with mini bar */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[8px] text-gray-600 tracking-widest uppercase">SOG</span>
          <div className="flex items-baseline gap-1">
            <span className="font-black text-lg tabular-nums" style={{ color: '#FDB642' }}>
              {vehicle.speedKnots.toFixed(1)}
            </span>
            <span className="text-[9px] text-gray-500">kt</span>
          </div>
          {/* Mini speed bar */}
          <div className="w-14 h-1 rounded-full" style={{ background: 'rgba(28,46,82,0.8)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${speedPct}%`,
                background: speedPct > 80
                  ? 'linear-gradient(90deg, #FCA311, #EF4444)'
                  : 'linear-gradient(90deg, #22D3EE, #FCA311)'
              }}
            />
          </div>
        </div>

        <div className="w-px h-8 bg-navy-700" />

        {/* Heading */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[8px] text-gray-600 tracking-widest uppercase">HDG</span>
          <div className="flex items-baseline gap-1">
            <Compass className="w-3.5 h-3.5" style={{ color: '#FCA311' }} />
            <span className="font-black text-lg tabular-nums text-white">
              {vehicle.headingDeg.toFixed(0).padStart(3, '0')}
            </span>
            <span className="text-[9px] text-gray-500">°</span>
          </div>
        </div>

        <div className="w-px h-8 bg-navy-700" />

        {/* Distance */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[8px] text-gray-600 tracking-widest uppercase">DIST</span>
          <div className="flex items-baseline gap-1">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-base tabular-nums text-white">
              {(vehicle.distanceTraveledM / 1000).toFixed(2)}
            </span>
            <span className="text-[9px] text-gray-500">km</span>
          </div>
        </div>

        <div className="w-px h-8 bg-navy-700" />

        {/* Pod Depth */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[8px] text-gray-600 tracking-widest uppercase">POD</span>
          <div className="flex items-baseline gap-1">
            <Anchor className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-base tabular-nums" style={{ color: '#67E8F9' }}>
              {pod.depthCurrentM.toFixed(1)}
            </span>
            <span className="text-[9px] text-gray-500">m</span>
          </div>
        </div>
      </div>

      {/* 3. Pod & Safety Controls */}
      <div className="flex items-center gap-2">
        {/* Pod Deploy/Hold/Retract */}
        <div className="flex items-center gap-1.5">
          {pod.status === 'READY' || pod.status === 'RECOVERED' ? (
            <button
              onClick={() => manualDeployPod(50)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-[10px] transition-all border"
              title="Deploy sensor pod to 50m [X]"
              style={{
                background: 'rgba(34,211,238,0.08)',
                color: '#67E8F9',
                border: '1px solid rgba(34,211,238,0.25)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,211,238,0.15)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,211,238,0.08)'; }}
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DEPLOY POD [X]</span>
              <span className="sm:hidden">POD</span>
            </button>
          ) : pod.status === 'LOWERING' ? (
            <button
              onClick={holdPodDepth}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-extrabold text-[10px]"
              title="Hold pod at current depth"
              style={{
                background: 'linear-gradient(135deg, #FDB642, #FCA311)',
                color: '#060B16',
                boxShadow: '0 0 12px rgba(252,163,17,0.35)'
              }}
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>HOLD DEPTH</span>
            </button>
          ) : (
            <button
              onClick={manualRetractPod}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-[10px] border transition-all"
              title="Retract sensor pod"
              style={{
                background: 'rgba(28,46,82,0.4)',
                color: '#CBD5E1',
                border: '1px solid rgba(28,46,82,0.8)'
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(28,46,82,0.7)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(28,46,82,0.4)'; }}
            >
              <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>RETRACT</span>
            </button>
          )}

          {/* Pod Camera Toggle */}
          {pod.status !== 'READY' && pod.status !== 'RECOVERED' && (
            <button
              onClick={() => setCameraMode(cameraMode === 'UNDERWATER_POD' ? 'FOLLOW' : 'UNDERWATER_POD')}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg font-bold text-[10px] border transition-all"
              title="Toggle underwater pod camera"
              style={{
                background: cameraMode === 'UNDERWATER_POD'
                  ? 'rgba(34,211,238,0.2)'
                  : 'rgba(34,211,238,0.06)',
                color: cameraMode === 'UNDERWATER_POD' ? '#A5F3FC' : '#67E8F9',
                border: cameraMode === 'UNDERWATER_POD'
                  ? '1px solid rgba(34,211,238,0.5)'
                  : '1px solid rgba(34,211,238,0.2)',
                boxShadow: cameraMode === 'UNDERWATER_POD' ? '0 0 10px rgba(34,211,238,0.2)' : 'none',
              }}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{cameraMode === 'UNDERWATER_POD' ? 'SURFACE' : 'POD CAM'}</span>
            </button>
          )}
        </div>

        {/* Return Home */}
        <button
          onClick={returnHome}
          className="hidden sm:flex items-center gap-1 px-2.5 py-2 rounded-lg text-[10px] font-bold border transition-all"
          title="Return to Base [0,0]"
          style={{
            background: 'rgba(28,46,82,0.4)',
            color: '#94A3B8',
            border: '1px solid rgba(28,46,82,0.8)'
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(28,46,82,0.7)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(28,46,82,0.4)'; }}
        >
          <CornerDownLeft className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden md:inline">RETURN HOME</span>
        </button>

        {/* Emergency Stop */}
        <button
          onClick={vehicle.emergencyStop ? clearEmergencyStop : emergencyStop}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-[10px] border transition-all"
          title="Emergency Stop (Space)"
          style={{
            background: vehicle.emergencyStop
              ? 'rgba(239,68,68,0.85)'
              : 'rgba(239,68,68,0.08)',
            color: vehicle.emergencyStop ? '#FFFFFF' : '#FCA5A5',
            border: vehicle.emergencyStop
              ? '1px solid rgba(239,68,68,0.8)'
              : '1px solid rgba(239,68,68,0.25)',
            boxShadow: vehicle.emergencyStop
              ? '0 0 16px rgba(239,68,68,0.5)'
              : 'none',
            animation: vehicle.emergencyStop ? 'pulse 1s infinite' : 'none'
          }}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{vehicle.emergencyStop ? 'E-STOP ACTIVE' : 'E-STOP'}</span>
        </button>
      </div>
    </footer>
  );
};
