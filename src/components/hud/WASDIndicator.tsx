import React from 'react';
import { ShieldAlert, RotateCcw, Anchor, Zap } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const WASDIndicator: React.FC = () => {
  const keyboardState = useSimulationStore((state) => state.keyboardState);
  const activeKeyCommand = useSimulationStore((state) => state.activeKeyCommand);
  const vehicle = useSimulationStore((state) => state.vehicle);
  const pod = useSimulationStore((state) => state.pod);
  const setKeyDown = useSimulationStore((state) => state.setKeyDown);
  const setKeyUp = useSimulationStore((state) => state.setKeyUp);
  const recenterVehicle = useSimulationStore((state) => state.recenterVehicle);
  const togglePod = useSimulationStore((state) => state.togglePod);
  const emergencyStop = useSimulationStore((state) => state.emergencyStop);
  const clearEmergencyStop = useSimulationStore((state) => state.clearEmergencyStop);
  const setControlMode = useSimulationStore((state) => state.setControlMode);

  const isManual = vehicle.controlMode === 'MANUAL';

  const getKeyStyle = (active: boolean) =>
    active
      ? 'bg-orange text-black font-extrabold shadow-md shadow-orange/40 border-orange scale-95'
      : 'bg-navy-900/90 text-white hover:bg-navy-700 border-lightgray/30 hover:border-orange/60';

  return (
    <div className="bg-navy/95 backdrop-blur-md border border-orange/40 rounded-xl p-3 shadow-2xl flex flex-col gap-2.5 text-xs font-sans select-none w-72">
      {/* Header: Mode & Focus Indicator */}
      <div className="flex items-center justify-between border-b border-lightgray/20 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange animate-ping-slow" />
          <span className="text-[11px] font-bold text-white tracking-wider">
            {isManual ? 'MANUAL WASD PILOT' : 'AUTONOMOUS ROUTE'}
          </span>
        </div>

        <button
          onClick={() => setControlMode(isManual ? 'AUTONOMOUS' : 'MANUAL')}
          className={`text-[10px] px-2 py-0.5 rounded border transition-colors font-bold ${
            isManual
              ? 'bg-orange text-black border-orange'
              : 'bg-navy-950 text-lightgray border-lightgray/40 hover:text-white'
          }`}
        >
          {isManual ? 'MANUAL ON' : 'SWITCH TO MANUAL'}
        </button>
      </div>

      {/* Active Key Command Feedback Banner */}
      <div className="bg-black/70 px-2.5 py-1.5 rounded border border-lightgray/20 flex items-center justify-between text-[11px]">
        <span className="text-lightgray/80 text-[10px]">COMMAND:</span>
        <span className="text-orange font-bold truncate max-w-[160px] text-right">
          {vehicle.emergencyStop ? 'EMERGENCY STOPPED' : activeKeyCommand}
        </span>
      </div>

      {/* Visual WASD Cluster */}
      <div className="flex flex-col items-center gap-1.5 py-1">
        {/* Forward [W] */}
        <button
          onMouseDown={() => setKeyDown('w')}
          onMouseUp={() => setKeyUp('w')}
          onTouchStart={() => setKeyDown('w')}
          onTouchEnd={() => setKeyUp('w')}
          className={`w-10 h-10 rounded-lg border flex flex-col items-center justify-center transition-all active:scale-95 ${getKeyStyle(
            keyboardState.w
          )}`}
          title="Hold W to accelerate forward"
        >
          <span className="text-xs font-bold leading-none">W</span>
          <span className="text-[8px] opacity-75 leading-none mt-0.5">FWD</span>
        </button>

        {/* Row: [A] [S] [D] */}
        <div className="flex items-center gap-1.5">
          <button
            onMouseDown={() => setKeyDown('a')}
            onMouseUp={() => setKeyUp('a')}
            onTouchStart={() => setKeyDown('a')}
            onTouchEnd={() => setKeyUp('a')}
            className={`w-10 h-10 rounded-lg border flex flex-col items-center justify-center transition-all active:scale-95 ${getKeyStyle(
              keyboardState.a
            )}`}
            title="Hold A to steer port (left)"
          >
            <span className="text-xs font-bold leading-none">A</span>
            <span className="text-[8px] opacity-75 leading-none mt-0.5">PORT</span>
          </button>

          <button
            onMouseDown={() => setKeyDown('s')}
            onMouseUp={() => setKeyUp('s')}
            onTouchStart={() => setKeyDown('s')}
            onTouchEnd={() => setKeyUp('s')}
            className={`w-10 h-10 rounded-lg border flex flex-col items-center justify-center transition-all active:scale-95 ${getKeyStyle(
              keyboardState.s
            )}`}
            title="Hold S to brake or reverse"
          >
            <span className="text-xs font-bold leading-none">S</span>
            <span className="text-[8px] opacity-75 leading-none mt-0.5">REV</span>
          </button>

          <button
            onMouseDown={() => setKeyDown('d')}
            onMouseUp={() => setKeyUp('d')}
            onTouchStart={() => setKeyDown('d')}
            onTouchEnd={() => setKeyUp('d')}
            className={`w-10 h-10 rounded-lg border flex flex-col items-center justify-center transition-all active:scale-95 ${getKeyStyle(
              keyboardState.d
            )}`}
            title="Hold D to steer starboard (right)"
          >
            <span className="text-xs font-bold leading-none">D</span>
            <span className="text-[8px] opacity-75 leading-none mt-0.5">STBD</span>
          </button>
        </div>
      </div>

      {/* Auxiliary Key Shortcuts Bar */}
      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
        {/* SHIFT Boost */}
        <button
          onMouseDown={() => setKeyDown('shift')}
          onMouseUp={() => setKeyUp('shift')}
          className={`py-1.5 px-2 rounded border flex items-center justify-center gap-1 transition-all ${
            keyboardState.shift ? 'bg-orange text-black font-bold' : 'bg-navy-950 text-white border-lightgray/20'
          }`}
          title="Hold Shift for speed boost"
        >
          <Zap className="w-3 h-3 text-orange" />
          <span>SHIFT: BOOST</span>
        </button>

        {/* P: Pod Deploy/Retract */}
        <button
          onClick={togglePod}
          className={`py-1.5 px-2 rounded border flex items-center justify-center gap-1 transition-all ${
            pod.status !== 'RECOVERED' && pod.status !== 'READY'
              ? 'bg-orange/20 text-orange border-orange/40 font-bold'
              : 'bg-navy-950 text-white border-lightgray/20'
          }`}
          title="Press P to deploy or retract sensor pod"
        >
          <Anchor className="w-3 h-3 text-orange" />
          <span>P: {pod.status === 'READY' || pod.status === 'RECOVERED' ? 'DEPLOY POD' : 'RETRACT POD'}</span>
        </button>

        {/* R: Recenter */}
        <button
          onClick={recenterVehicle}
          className="py-1.5 px-2 rounded bg-navy-950 text-white hover:bg-navy-800 border border-lightgray/20 flex items-center justify-center gap-1 transition-colors"
          title="Press R to reset position"
        >
          <RotateCcw className="w-3 h-3 text-lightgray" />
          <span>R: RECENTER</span>
        </button>

        {/* SPACE: E-STOP */}
        {vehicle.emergencyStop ? (
          <button
            onClick={clearEmergencyStop}
            className="py-1.5 px-2 rounded bg-orange text-black font-bold border border-orange flex items-center justify-center gap-1 animate-pulse"
            title="Click to clear Emergency Stop"
          >
            <ShieldAlert className="w-3 h-3" />
            <span>RESUME THRUST</span>
          </button>
        ) : (
          <button
            onClick={emergencyStop}
            className="py-1.5 px-2 rounded bg-black text-orange border border-orange/60 hover:bg-orange/20 flex items-center justify-center gap-1 transition-colors"
            title="Press Space for Emergency Stop"
          >
            <ShieldAlert className="w-3 h-3 text-orange" />
            <span>SPACE: E-STOP</span>
          </button>
        )}
      </div>

      <div className="text-[9px] text-lightgray/60 text-center">
        CONTROLS ACTIVE · KEYBOARD WASD READY
      </div>
    </div>
  );
};
