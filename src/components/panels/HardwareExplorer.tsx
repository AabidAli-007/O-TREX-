import React, { useState } from 'react';
import { X, ExternalLink, Cpu, CheckCircle2 } from 'lucide-react';
import { HARDWARE_SUBSYSTEMS } from '../../data/hardwareData';
import { useSimulationStore } from '../../store/useSimulationStore';
import { formatCurrency } from '../../utils/formatters';

export const HardwareExplorer: React.FC = () => {
  const activeModal = useSimulationStore((state) => state.activeModal);
  const closeModal = useSimulationStore((state) => state.closeModal);
  const selectedHardwareId = useSimulationStore((state) => state.selectedHardwareId);
  const selectHardware = useSimulationStore((state) => state.selectHardware);

  const [activeTab, setActiveTab] = useState<'SUBSYSTEMS' | 'DATA_FLOW'>('SUBSYSTEMS');

  if (activeModal !== 'HARDWARE') return null;

  const currentItem =
    HARDWARE_SUBSYSTEMS.find((item) => item.id === selectedHardwareId) || HARDWARE_SUBSYSTEMS[0];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-mono">
      <div className="w-full max-w-5xl bg-navy-900 border border-navy-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-200">
        {/* Modal Header */}
        <div className="h-14 bg-navy-950 px-6 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-navy-900 text-orange-400 border border-navy-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                O-TREX HARDWARE ARCHITECTURE & SUBSYSTEM EXPLORER
              </h2>
              <p className="text-[11px] text-orange-400">
                Interactive Component Breakdown, Interfaces, Power Roles & Verified BOM Sources
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-navy-900 p-0.5 rounded border border-navy-800 text-xs">
              <button
                onClick={() => setActiveTab('SUBSYSTEMS')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'SUBSYSTEMS'
                    ? 'bg-orange-500 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Subsystems & Components
              </button>
              <button
                onClick={() => setActiveTab('DATA_FLOW')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'DATA_FLOW'
                    ? 'bg-orange-500 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sensor Data Pathway
              </button>
            </div>

            <button
              onClick={closeModal}
              className="p-1.5 rounded hover:bg-navy-800 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {activeTab === 'SUBSYSTEMS' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Subsystem List */}
            <div className="w-64 bg-navy-950 border-r border-navy-800 p-3 overflow-y-auto flex flex-col gap-1.5">
              <div className="text-[10px] text-gray-400 font-bold px-2 mb-1">
                SELECT SUBSYSTEM (12)
              </div>
              {HARDWARE_SUBSYSTEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => selectHardware(item.id)}
                  className={`text-left p-2 rounded text-xs transition-colors flex items-center justify-between ${
                    item.id === currentItem.id
                      ? 'bg-orange-500 text-white font-bold'
                      : 'text-gray-300 hover:bg-navy-800'
                  }`}
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-[10px] opacity-75">{item.category.slice(0, 4)}</span>
                </button>
              ))}
            </div>

            {/* Main Subsystem Detail View */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 text-xs">
              <div className="flex items-start justify-between border-b border-navy-800 pb-3">
                <div>
                  <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                    {currentItem.category} SUBSYSTEM
                  </span>
                  <h3 className="text-xl font-bold text-white">{currentItem.name}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{currentItem.role}</p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-gray-400">ESTIMATED PROTOTYPE UNIT COST</div>
                  <div className="text-lg font-bold text-white">
                    {formatCurrency(currentItem.estCostInr, 'INR')}
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-navy-950 text-orange-400 border border-orange-500/40 font-mono">
                    {currentItem.provenanceType.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Subsystem Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Technical Specifications */}
                <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                  <h4 className="font-bold text-white text-xs mb-2">Technical Specifications</h4>
                  <ul className="space-y-1.5 text-gray-300 text-[11px]">
                    {currentItem.specs.map((spec, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Interfaces & Power */}
                <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 flex flex-col gap-2.5">
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">Hardware Interface Bus</h4>
                    <p className="text-gray-400 text-[11px]">{currentItem.interfaceBus}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">Power Consumption Role</h4>
                    <p className="text-gray-400 text-[11px]">{currentItem.powerRole}</p>
                  </div>
                </div>
              </div>

              {/* Why O-TREX Uses It */}
              <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                <h4 className="font-bold text-orange-400 text-xs mb-1">Why O-TREX Architecture Uses It</h4>
                <p className="text-gray-200 text-xs leading-relaxed">{currentItem.whyOtrexUsesIt}</p>
              </div>

              {/* Source Verification & References */}
              <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-gray-400 block">Source & Reference Listing:</span>
                  <span className="text-white font-semibold">{currentItem.sourceTitle}</span>
                  {currentItem.notes && (
                    <span className="text-[10px] text-gray-400 block mt-0.5">{currentItem.notes}</span>
                  )}
                </div>
                {currentItem.sourceUrl && (
                  <a
                    href={currentItem.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-navy-900 hover:bg-orange-500 hover:text-white text-orange-400 border border-orange-500/40 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
                  >
                    <span>Manufacturer Reference</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Sensor Data Pathway Visualization */
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 text-xs">
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                END-TO-END SENSOR DATA FLOW & DECISION PIPELINE
              </h3>
              <p className="text-gray-400 text-xs">
                How analog and digital ocean measurements flow from transducers through edge AI to satellite constellation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                {
                  step: '01. ACQUISITION',
                  title: 'Ocean Sensors & Pod',
                  desc: 'CTD, DO, pH & Turbidity probes sample at 1-5 Hz. Microcontroller serializes packets over RS-485 micro-tether.'
                },
                {
                  step: '02. EDGE AI ANALYSIS',
                  title: 'Raspberry Pi 4 / TF-Lite',
                  desc: 'Executes multivariate deviation scoring, outlier filtering, and z-score anomaly calculation in real time.'
                },
                {
                  step: '03. DECISION ENGINE',
                  title: 'Adaptive Mission Planner',
                  desc: 'Multi-criteria utility solver evaluates scientific value vs battery margin to command winch profiling.'
                },
                {
                  step: '04. TIERED TRANSMISSION',
                  title: 'LoRa / Iridium Satellite',
                  desc: 'P1-P5 prioritized queue buffers data locally if offline, bursting compressed anomaly profiles upon link lock.'
                }
              ].map((flow, i) => (
                <div
                  key={i}
                  className="bg-navy-950 p-4 rounded-lg border border-navy-800 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] text-orange-400 font-bold block mb-1">{flow.step}</span>
                    <h4 className="font-bold text-white text-sm mb-1">{flow.title}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{flow.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-navy-950 p-4 rounded-lg border border-navy-800 text-[11px] text-gray-300">
              <strong className="text-orange-400">Edge Software Stack: </strong>
              Linux Ubuntu 22.04 LTS · ROS 2 Humble · Docker Containerization · Python 3.10 · TensorFlow Lite Edge Model · InfluxDB Time-Series Telemetry · MQTT / MAVLink Protocol.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
