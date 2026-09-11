import React from 'react';
import { X, AlertTriangle, Radio, BatteryLow, Wind, Cpu } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const FailureTester: React.FC = () => {
  const activeModal = useSimulationStore((state) => state.activeModal);
  const closeModal = useSimulationStore((state) => state.closeModal);
  const failures = useSimulationStore((state) => state.failures);
  const toggleFailure = useSimulationStore((state) => state.toggleFailure);

  if (activeModal !== 'FAILURES') return null;

  const failureScenarios = [
    {
      key: 'gnssLoss' as const,
      name: 'GNSS / Satellite Fix Loss',
      desc: 'Simulates complete RTK satellite lock loss. Autopilot switches to inertial dead-reckoning navigation with degraded positioning.',
      icon: Radio
    },
    {
      key: 'commLoss' as const,
      name: 'Iridium / LoRa Communication Blackout',
      desc: 'Simulates severe RF attenuation or satellite occlusion. System buffers all priority telemetry into local non-volatile storage.',
      icon: Radio
    },
    {
      key: 'lowBatteryForced' as const,
      name: 'Critical Low Battery (SOC < 15%)',
      desc: 'Simulates severe battery depletion. Decision Engine immediately aborts optional profiling, halts winch, and engages Return-to-Base.',
      icon: BatteryLow
    },
    {
      key: 'sensorDriftActive' as const,
      name: 'Sensor Calibration Drift (Temp/DO)',
      desc: 'Introduces uncalibrated sensor drift (+1.4 sigma). Data QA/QC engine flags readings as SUSPECT / INVALID.',
      icon: Cpu
    },
    {
      key: 'turbiditySensorFail' as const,
      name: 'Turbidity Sensor Saturation / Hard Fault',
      desc: 'Simulates optical sensor failure (999 NTU output). Quality flag marks sensor as INVALID and alerts mission control.',
      icon: AlertTriangle
    },
    {
      key: 'extremeWaves' as const,
      name: 'Extreme Southern Ocean Swells (3.8m Waves)',
      desc: 'Tests catamaran roll/pitch stability and auto-heave damping under harsh polar weather conditions.',
      icon: Wind
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-mono">
      <div className="w-full max-w-3xl bg-navy-900 border border-navy-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-200">
        {/* Header */}
        <div className="h-14 bg-navy-950 px-6 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-navy-900 text-orange-400 border border-navy-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                SYSTEM FAULT INJECTION & FAIL-SAFE TESTER
              </h2>
              <p className="text-[11px] text-orange-400">
                Simulate Hardware Subsystem Failures & Validate Autonomous Safe Fallbacks
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 rounded hover:bg-navy-800 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Failure Toggles Grid */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {failureScenarios.map((item) => {
            const isActive = failures[item.key];
            return (
              <div
                key={item.key}
                className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-navy-950 border-orange-500 shadow-md shadow-orange-500/10'
                    : 'bg-navy-950 border-navy-800 hover:border-navy-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <item.icon
                        className={`w-4 h-4 ${isActive ? 'text-orange-400 animate-pulse' : 'text-gray-400'}`}
                      />
                      <span>{item.name}</span>
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        isActive
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                          : 'bg-navy-900 text-gray-400 border-navy-700'
                      }`}
                    >
                      {isActive ? 'INJECTED' : 'NORMAL'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] leading-relaxed mb-3">{item.desc}</p>
                </div>

                <button
                  onClick={() => toggleFailure(item.key)}
                  className={`w-full py-1.5 rounded font-bold transition-colors text-xs ${
                    isActive
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-navy-900 hover:bg-navy-800 text-gray-300 border border-navy-700'
                  }`}
                >
                  {isActive ? 'Clear Injected Fault' : 'Inject Fault Simulation'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
