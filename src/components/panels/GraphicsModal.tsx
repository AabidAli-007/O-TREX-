import React from 'react';
import { X, Sliders, Monitor, CheckCircle2 } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const GraphicsModal: React.FC = () => {
  const activeModal = useSimulationStore((state) => state.activeModal);
  const closeModal = useSimulationStore((state) => state.closeModal);
  const graphicsQuality = useSimulationStore((state) => state.graphicsQuality);
  const setGraphicsQuality = useSimulationStore((state) => state.setGraphicsQuality);

  if (activeModal !== 'GRAPHICS') return null;

  const presets = [
    {
      id: 'LOW',
      label: 'Low Performance',
      desc: 'Optimized for mobile/low-end laptops. 64x64 ocean grid, standard shadows.',
      subdiv: '64x64',
      shadows: '1024x1024',
      particles: '400',
      dpr: '1.0'
    },
    {
      id: 'MEDIUM',
      label: 'Medium Balanced',
      desc: 'Balanced fidelity and high framerate. 96x96 ocean grid, PCF shadows.',
      subdiv: '96x96',
      shadows: '1024x1024',
      particles: '800',
      dpr: '1.25'
    },
    {
      id: 'HIGH',
      label: 'High (Recommended)',
      desc: 'Full Gerstner wave spectrum, 128x128 ocean mesh, ACES Filmic tone mapping.',
      subdiv: '128x128',
      shadows: '2048x2048',
      particles: '1,200',
      dpr: '1.5'
    },
    {
      id: 'ULTRA',
      label: 'Ultra Cinematic',
      desc: 'Maximum ocean fidelity, 192x192 mesh, high particle density, full horizon fog.',
      subdiv: '192x192',
      shadows: '4096x4096',
      particles: '2,500',
      dpr: '2.0'
    }
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-mono">
      <div className="w-full max-w-2xl bg-navy-900 border border-navy-700 rounded-xl shadow-2xl overflow-hidden flex flex-col text-gray-200">
        {/* Header */}
        <div className="h-14 bg-navy-950 px-6 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-navy-900 text-orange-400 border border-navy-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                GRAPHICS & WEBGL SIMULATION SETTINGS
              </h2>
              <p className="text-[11px] text-orange-400">
                Ocean Mesh Subdivisions, Shadow Map Resolution & Render Distance
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quality Presets Grid */}
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map((preset) => {
              const isSelected = graphicsQuality === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setGraphicsQuality(preset.id)}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-orange-500/15 border-orange-500 shadow-lg shadow-orange-500/10 scale-[1.02]'
                      : 'bg-navy-950 border-navy-800 hover:border-navy-700 hover:bg-navy-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-white flex items-center gap-1.5">
                      <Monitor className="w-4 h-4 text-orange-400" />
                      <span>{preset.label}</span>
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                  </div>

                  <p className="text-[11px] text-gray-400 mb-3 leading-snug">
                    {preset.desc}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-gray-300 bg-navy-900/80 p-2 rounded border border-navy-800">
                    <div>Mesh: <span className="text-white font-bold">{preset.subdiv}</span></div>
                    <div>Shadow: <span className="text-white font-bold">{preset.shadows}</span></div>
                    <div>Particles: <span className="text-white font-bold">{preset.particles}</span></div>
                    <div>DPR: <span className="text-white font-bold">{preset.dpr}</span></div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-gray-400 bg-navy-950 p-3 rounded-lg border border-navy-800 flex items-center justify-between">
            <span>High-DPI rendering and ACESFilmic color calibration active.</span>
            <span className="text-orange-400 font-bold">Target: 60 FPS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
