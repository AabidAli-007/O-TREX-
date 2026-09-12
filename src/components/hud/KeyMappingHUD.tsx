import React, { useState } from 'react';
import {
  Keyboard,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Zap,
  ShieldAlert,
  RotateCcw,
  Anchor,
  Ruler,
  Eye,
  ChevronDown,
  ChevronUp,
  Bot,
  User
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const KeyMappingHUD: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const keyboardState = useSimulationStore((state) => state.keyboardState);
  const activeKeyCommand = useSimulationStore((state) => state.activeKeyCommand);
  const vehicle = useSimulationStore((state) => state.vehicle);
  const pod = useSimulationStore((state) => state.pod);
  const cameraMode = useSimulationStore((state) => state.cameraMode);
  const setKeyDown = useSimulationStore((state) => state.setKeyDown);
  const setKeyUp = useSimulationStore((state) => state.setKeyUp);
  const recenterVehicle = useSimulationStore((state) => state.recenterVehicle);
  const togglePod = useSimulationStore((state) => state.togglePod);
  const toggleModal = useSimulationStore((state) => state.toggleModal);
  const cycleCameraMode = useSimulationStore((state) => state.cycleCameraMode);
  const toggleControlMode = useSimulationStore((state) => state.toggleControlMode);
  const emergencyStop = useSimulationStore((state) => state.emergencyStop);
  const clearEmergencyStop = useSimulationStore((state) => state.clearEmergencyStop);

  const isManual = vehicle.controlMode === 'MANUAL';

  const KeyCap = ({
    keyName, children, wide = false, action
  }: {
    keyName?: string;
    children: React.ReactNode;
    wide?: boolean;
    action?: () => void;
  }) => {
    const pressed = keyName ? !!keyboardState[keyName as keyof typeof keyboardState] : false;

    return (
      <button
        onMouseDown={() => keyName && setKeyDown(keyName)}
        onMouseUp={() => keyName && setKeyUp(keyName)}
        onClick={action}
        className={`flex flex-col items-center justify-center rounded-lg font-bold select-none transition-all duration-75 ${wide ? 'px-3 py-2' : 'w-11 h-10'}`}
        style={{
          background: pressed
            ? 'linear-gradient(180deg, #FDB642 0%, #FCA311 100%)'
            : 'linear-gradient(180deg, #1C2E52 0%, #14213D 100%)',
          border: pressed ? '1px solid rgba(252,163,17,0.5)' : '1px solid rgba(255,255,255,0.06)',
          borderBottom: pressed ? '2px solid rgba(180,90,0,0.6)' : '3px solid rgba(0,0,0,0.6)',
          color: pressed ? '#060B16' : '#CBD5E1',
          transform: pressed ? 'translateY(2px)' : 'translateY(0)',
          boxShadow: pressed
            ? '0 0 16px rgba(252,163,17,0.5)'
            : '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {children}
      </button>
    );
  };

  const ActionKey = ({
    label, sublabel, icon: Icon, color = 'default', action, active = false
  }: {
    label: string;
    sublabel?: string;
    icon: React.ElementType;
    color?: 'default' | 'orange' | 'cyan' | 'red' | 'amber' | 'green';
    action?: () => void;
    active?: boolean;
  }) => {
    const colorMap = {
      default: { bg: 'rgba(28,46,82,0.5)', border: 'rgba(28,46,82,0.9)', text: '#94A3B8', iconColor: '#94A3B8' },
      orange: { bg: 'rgba(252,163,17,0.08)', border: 'rgba(252,163,17,0.25)', text: '#FDB642', iconColor: '#FCA311' },
      cyan: { bg: active ? 'rgba(34,211,238,0.18)' : 'rgba(34,211,238,0.07)', border: active ? 'rgba(34,211,238,0.45)' : 'rgba(34,211,238,0.22)', text: '#67E8F9', iconColor: '#22D3EE' },
      red: { bg: active ? 'rgba(239,68,68,0.8)' : 'rgba(239,68,68,0.08)', border: active ? 'rgba(239,68,68,0.9)' : 'rgba(239,68,68,0.25)', text: active ? '#FFFFFF' : '#FCA5A5', iconColor: active ? '#FFFFFF' : '#EF4444' },
      amber: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', text: '#FCD34D', iconColor: '#F59E0B' },
      green: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', text: '#86EFAC', iconColor: '#22C55E' },
    };
    const c = colorMap[color];

    return (
      <button
        onClick={action}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg font-bold text-[10px] border transition-all"
        style={{
          background: c.bg,
          border: `1px solid ${c.border}`,
          color: c.text,
          boxShadow: active ? `0 0 10px ${c.border}` : 'none',
        }}
      >
        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: c.iconColor }} />
        <div className="flex flex-col items-start leading-none">
          <span className="font-bold">{label}</span>
          {sublabel && <span className="text-[8px] opacity-60 font-normal">{sublabel}</span>}
        </div>
      </button>
    );
  };

  return (
    <div
      className="absolute bottom-4 right-4 z-20 font-sans select-none pointer-events-auto"
      style={{ maxWidth: '240px' }}
    >
      <div
        className="rounded-2xl flex flex-col gap-2.5 p-3"
        style={{
          background: 'rgba(6, 11, 22, 0.94)',
          border: '1px solid rgba(28, 46, 82, 0.8)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between pb-2"
          style={{ borderBottom: '1px solid rgba(28,46,82,0.7)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(252,163,17,0.15)', border: '1px solid rgba(252,163,17,0.3)' }}
            >
              <Keyboard className="w-3 h-3" style={{ color: '#FDB642' }} />
            </div>
            <span className="font-black text-white text-[11px] tracking-wider">PILOT CONTROLS</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mode toggle badge */}
            <button
              onClick={toggleControlMode}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold border transition-all"
              title="Toggle Manual/Autonomous [M]"
              style={{
                background: isManual ? 'rgba(252,163,17,0.15)' : 'rgba(34,197,94,0.12)',
                color: isManual ? '#FDB642' : '#86EFAC',
                border: isManual ? '1px solid rgba(252,163,17,0.35)' : '1px solid rgba(34,197,94,0.3)',
              }}
            >
              {isManual
                ? <User className="w-2.5 h-2.5" />
                : <Bot className="w-2.5 h-2.5" />
              }
              {isManual ? 'MANUAL' : 'AUTO'}
            </button>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-lg transition-all"
              style={{ color: '#64748B' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#CBD5E1'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#64748B'; }}
            >
              {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {!collapsed && (
          <>
            {/* WASD Cluster */}
            <div className="flex flex-col items-center gap-1">
              <KeyCap keyName="w">
                <ArrowUp className="w-3.5 h-3.5 mb-0.5" />
                <span className="text-[8px]">W</span>
              </KeyCap>
              <div className="flex gap-1">
                <KeyCap keyName="a">
                  <ArrowLeft className="w-3.5 h-3.5 mb-0.5" />
                  <span className="text-[8px]">A</span>
                </KeyCap>
                <KeyCap keyName="s">
                  <ArrowDown className="w-3.5 h-3.5 mb-0.5" />
                  <span className="text-[8px]">S</span>
                </KeyCap>
                <KeyCap keyName="d">
                  <ArrowRight className="w-3.5 h-3.5 mb-0.5" />
                  <span className="text-[8px]">D</span>
                </KeyCap>
              </div>
            </div>

            {/* Section label */}
            <div className="text-[8px] text-gray-700 tracking-widest uppercase text-center">SPECIAL ACTIONS</div>

            {/* Special action keys */}
            <div className="flex flex-col gap-1">
              <div className="grid grid-cols-2 gap-1">
                {/* Shift Boost */}
                <ActionKey
                  label="SHIFT · BOOST"
                  icon={Zap}
                  color="orange"
                  active={keyboardState.shift}
                  action={() => {}}
                />

                {/* Space E-Stop */}
                <ActionKey
                  label={vehicle.emergencyStop ? 'E-STOP ON' : 'SPACE · STOP'}
                  icon={ShieldAlert}
                  color="red"
                  active={vehicle.emergencyStop}
                  action={vehicle.emergencyStop ? clearEmergencyStop : emergencyStop}
                />

                {/* X Pod */}
                <ActionKey
                  label="X · POD CAM"
                  sublabel={pod.depthCurrentM > 0.2 ? `${pod.depthCurrentM.toFixed(0)}m deep` : 'ready'}
                  icon={Anchor}
                  color="cyan"
                  active={pod.depthCurrentM > 0.2}
                  action={togglePod}
                />

                {/* C Size/Charter */}
                <ActionKey
                  label="C · SIZE"
                  sublabel="vs. existing"
                  icon={Ruler}
                  color="amber"
                  action={() => toggleModal('SIZE_CHARTER')}
                />

                {/* V Camera */}
                <ActionKey
                  label="V · CAMERA"
                  sublabel={cameraMode.slice(0, 8)}
                  icon={Eye}
                  color="default"
                  action={cycleCameraMode}
                />

                {/* R Recenter */}
                <ActionKey
                  label="R · CENTER"
                  sublabel="origin [0,0]"
                  icon={RotateCcw}
                  color="default"
                  action={recenterVehicle}
                />
              </div>
            </div>

            {/* Live command strip */}
            <div
              className="px-2.5 py-1.5 rounded-lg flex items-center justify-between text-[9px]"
              style={{
                background: 'rgba(10, 18, 34, 0.7)',
                border: '1px solid rgba(28,46,82,0.6)'
              }}
            >
              <span style={{ color: '#475569' }}>CMD</span>
              <span className="font-bold truncate max-w-[140px]" style={{ color: '#FDB642' }}>
                {activeKeyCommand}
              </span>
            </div>

            {/* Mouse hint */}
            <div
              className="text-[8px] text-center tracking-wider"
              style={{ color: '#334155' }}
            >
              🖱 DRAG 360° · SCROLL ZOOM
            </div>
          </>
        )}
      </div>
    </div>
  );
};
