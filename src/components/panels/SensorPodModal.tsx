import React, { useState } from 'react';
import { X, ExternalLink, Anchor } from 'lucide-react';
import { POD_SENSORS } from '../../data/hardwareData';
import { useSimulationStore } from '../../store/useSimulationStore';
import { formatCurrency } from '../../utils/formatters';

export const SensorPodModal: React.FC = () => {
  const activeModal = useSimulationStore((state) => state.activeModal);
  const closeModal = useSimulationStore((state) => state.closeModal);
  const [selectedSensorId, setSelectedSensorId] = useState<string>('temp');

  if (activeModal !== 'SENSOR_POD') return null;

  const currentSensor = POD_SENSORS.find((s) => s.id === selectedSensorId) || POD_SENSORS[0];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-4xl bg-navy-900 border border-navy-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-200">
        {/* Header */}
        <div className="h-14 bg-navy-950 px-6 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-navy-900 text-orange-400 border border-navy-700">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                MODULAR UNDERWATER SENSOR POD ASSEMBLY
              </h2>
              <p className="text-[11px] text-orange-400">
                Water Column Multi-Parameter Physical & Biogeochemical Transducers
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

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sensor Select List */}
          <div className="w-60 bg-navy-950 border-r border-navy-800 p-3 overflow-y-auto flex flex-col gap-1.5 text-xs">
            <div className="text-[10px] text-gray-400 font-bold px-2 mb-1">
              POD SENSORS (6)
            </div>
            {POD_SENSORS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSensorId(s.id)}
                className={`text-left p-2 rounded transition-colors flex items-center justify-between ${
                  s.id === currentSensor.id
                    ? 'bg-orange-500 text-white font-bold'
                    : 'text-gray-300 hover:bg-navy-800'
                }`}
              >
                <span className="truncate">{s.name.split(' ')[0]} {s.name.split(' ')[1]}</span>
                <span className="text-[10px] opacity-75">{s.unit.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Sensor Detail Content */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 text-xs">
            <div className="flex items-start justify-between border-b border-navy-800 pb-3">
              <div>
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                  MEASURES: {currentSensor.measures}
                </span>
                <h3 className="text-xl font-bold text-white">{currentSensor.name}</h3>
                <span className="text-xs text-gray-400">Unit: {currentSensor.unit}</span>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-gray-400">APPROXIMATE OEM COST</div>
                <div className="text-lg font-bold text-white">
                  {formatCurrency(currentSensor.approxCostInr, 'INR')}
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-navy-950 text-orange-400 border border-orange-500/40 font-sans">
                  {currentSensor.provenanceType.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                <h4 className="font-bold text-white text-xs mb-1">Operational Range & Accuracy</h4>
                <div className="space-y-1 text-[11px] text-gray-300">
                  <div>Range: <strong className="text-orange-400">{currentSensor.range}</strong></div>
                  <div>Accuracy: <strong className="text-white">{currentSensor.accuracy}</strong></div>
                </div>
              </div>

              <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                <h4 className="font-bold text-white text-xs mb-1">Physical Measurement Principle</h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  {currentSensor.physicalPrinciple}
                </p>
              </div>
            </div>

            <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
              <h4 className="font-bold text-orange-400 text-xs mb-1">Oceanographic & Environmental Significance</h4>
              <p className="text-gray-200 text-xs leading-relaxed">
                {currentSensor.envMeaning}
              </p>
            </div>

            <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-gray-400 block">Typical Reference OEM Sensor:</span>
                <span className="text-white font-semibold">{currentSensor.source}</span>
              </div>
              {currentSensor.sourceUrl && (
                <a
                  href={currentSensor.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-navy-900 hover:bg-orange-500 hover:text-white text-orange-400 border border-orange-500/40 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
                >
                  <span>OEM Reference Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
