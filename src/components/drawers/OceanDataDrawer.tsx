import React, { useState } from 'react';
import {
  Waves,
  Maximize2,
  X,
  Sliders,
  ArrowDownRight,
  TrendingDown
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import {
  AVAILABLE_OCEAN_DATASETS,
  getObservationAtDepth
} from '../../data/oceanographicData';

export const OceanDataDrawer: React.FC = () => {
  const closeDrawer = () => useSimulationStore.getState().toggleDrawer(null);
  const openModal = useSimulationStore((state) => state.openModal);
  const pod = useSimulationStore((state) => state.pod);
  const setTargetDepth = useSimulationStore((state) => state.setTargetDepth);

  const [selectedDepth, setSelectedDepth] = useState<number | 'AUTO'>(50);
  const dataset = AVAILABLE_OCEAN_DATASETS[0];

  const activeDepth = selectedDepth === 'AUTO' ? pod.depthCurrentM : selectedDepth;
  const currentObs = getObservationAtDepth(dataset, activeDepth);

  const presets: (number | 'AUTO')[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 'AUTO'];

  return (
    <div className="w-88 sm:w-96 bg-navy-950/98 backdrop-blur-xl border-l border-navy-800 h-full flex flex-col font-sans text-xs select-none shadow-2xl text-gray-200">
      {/* Header */}
      <div className="h-12 bg-navy-900/90 px-4 flex items-center justify-between border-b border-navy-800 flex-shrink-0">
        <div className="flex items-center gap-2 font-bold text-white">
          <Waves className="w-4 h-4 text-orange-400" />
          <span className="tracking-wide">SCIENTIFIC OCEAN DATA</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openModal('OCEAN_DATA')}
            className="p-1 rounded hover:bg-navy-800 text-gray-400 hover:text-white transition-colors"
            title="Open Full Scientific Explorer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={closeDrawer}
            className="p-1 rounded hover:bg-navy-800 text-gray-400 hover:text-white transition-colors"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {/* Source attribution pill */}
        <div className="bg-navy-900/80 p-3 rounded-lg border border-navy-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              AUTHORITATIVE DATASET
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
              REAL DATASET
            </span>
          </div>
          <div className="text-white font-bold text-xs">{dataset.datasetName}</div>
          <div className="text-[10px] text-gray-400">{dataset.region}</div>
        </div>

        {/* Depth Horizon Selection */}
        <div className="bg-navy-900/80 p-3 rounded-lg border border-navy-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sliders className="w-3 h-3 text-orange-400" />
              <span>TARGET DEPTH LEVEL</span>
            </span>
            <span className="text-orange-400 font-bold text-xs">
              {selectedDepth === 'AUTO' ? ('AUTO (' + pod.depthCurrentM.toFixed(1) + 'm)') : (selectedDepth + 'm')}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {presets.map((p) => {
              const isSel = selectedDepth === p;
              return (
                <button
                  key={String(p)}
                  onClick={() => {
                    setSelectedDepth(p);
                    if (typeof p === 'number') {
                      setTargetDepth(p);
                    }
                  }}
                  className={'py-1.5 rounded text-[11px] font-bold transition-all text-center border ' + (isSel ? 'bg-orange-500 text-white border-orange-400' : 'bg-navy-950 border-navy-800 text-gray-300 hover:bg-navy-800')}
                >
                  {p === 'AUTO' ? 'AUTO' : (p + 'm')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Physical Oceanographic Parameters at Selected Depth */}
        <div className="bg-navy-900/80 p-3 rounded-lg border border-navy-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-navy-800/80 pb-1.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>CTD PROFILE AT {currentObs.depthM} m</span>
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">WOD/ARGO QC 1</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-navy-950 p-2 rounded border border-navy-800/80">
              <span className="text-[10px] text-gray-400 block">Temperature:</span>
              <strong className="text-white text-xs">{currentObs.temperatureC} °C</strong>
            </div>
            <div className="bg-navy-950 p-2 rounded border border-navy-800/80">
              <span className="text-[10px] text-gray-400 block">Salinity:</span>
              <strong className="text-white text-xs">{currentObs.salinityPsu} PSU</strong>
            </div>
            <div className="bg-navy-950 p-2 rounded border border-navy-800/80">
              <span className="text-[10px] text-gray-400 block">Dissolved O₂:</span>
              <strong className="text-white text-xs">{currentObs.dissolvedOxygenMgL} mg/L</strong>
            </div>
            <div className="bg-navy-950 p-2 rounded border border-navy-800/80">
              <span className="text-[10px] text-gray-400 block">Nitrate NO₃:</span>
              <strong className="text-white text-xs">{currentObs.nitrateUmolKg} µmol/kg</strong>
            </div>
            <div className="bg-navy-950 p-2 rounded border border-navy-800/80">
              <span className="text-[10px] text-gray-400 block">Pressure:</span>
              <strong className="text-white text-xs">{currentObs.pressureDbar} dbar</strong>
            </div>
            <div className="bg-navy-950 p-2 rounded border border-navy-800/80">
              <span className="text-[10px] text-gray-400 block">Density σθ:</span>
              <strong className="text-white text-xs">{currentObs.densitySigmaThetaKgM3} kg/m³</strong>
            </div>
          </div>
        </div>

        {/* Action Button: Launch Full Explorer */}
        <button
          onClick={() => openModal('OCEAN_DATA')}
          className="w-full py-2.5 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-navy-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-98"
        >
          <span>OPEN FULL SCIENTIFIC PLOTTER</span>
          <ArrowDownRight className="w-3.5 h-3.5" />
        </button>

        {/* Explainable Decision Context */}
        <div className="bg-navy-900/60 p-3 rounded-lg border border-navy-800/60 text-[11px] text-gray-400 leading-relaxed">
          <strong className="text-gray-300 block mb-1">Oceanographic Context:</strong>
          The Antarctic water column exhibits a summer cold-halocline layer (Winter Water) between 50–100m depth with oxygen saturation exceeding 85%. O-TREX adaptive winch deployment specifically samples these critical biogeochemical horizons.
        </div>
      </div>
    </div>
  );
};
