import React, { useState } from 'react';
import { X, ExternalLink, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';
import { COMPETITOR_SYSTEMS } from '../../data/competitorsData';
import { useSimulationStore } from '../../store/useSimulationStore';

export const CompetitorModal: React.FC = () => {
  const activeModal = useSimulationStore((state) => state.activeModal);
  const closeModal = useSimulationStore((state) => state.closeModal);
  const selectedCompetitorId = useSimulationStore((state) => state.selectedCompetitorId);
  const selectCompetitor = useSimulationStore((state) => state.selectCompetitor);

  const [activeTab, setActiveTab] = useState<'CARDS' | 'MATRIX'>('CARDS');

  if (activeModal !== 'COMPETITORS') return null;

  const currentSystem =
    COMPETITOR_SYSTEMS.find((c) => c.id === selectedCompetitorId) || COMPETITOR_SYSTEMS[0];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-mono">
      <div className="w-full max-w-5xl bg-navy-900 border border-navy-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-200">
        {/* Header */}
        <div className="h-14 bg-navy-950 px-6 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-navy-900 text-orange-400 border border-navy-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                EXISTING OCEAN OBSERVATION PLATFORM COMPARISON
              </h2>
              <p className="text-[11px] text-orange-400">
                Evidence-Based Scientific Trade-offs, Operational Costs & Architectural Niche
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-navy-900 p-0.5 rounded border border-navy-800 text-xs">
              <button
                onClick={() => setActiveTab('CARDS')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'CARDS'
                    ? 'bg-orange-500 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Platform Profiles
              </button>
              <button
                onClick={() => setActiveTab('MATRIX')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'MATRIX'
                    ? 'bg-orange-500 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Comparison Matrix
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
        {activeTab === 'CARDS' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Platform List */}
            <div className="w-64 bg-navy-950 border-r border-navy-800 p-3 overflow-y-auto flex flex-col gap-1.5 text-xs">
              <div className="text-[10px] text-gray-400 font-bold px-2 mb-1">
                COMPETITOR SYSTEMS (4)
              </div>
              {COMPETITOR_SYSTEMS.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => selectCompetitor(comp.id)}
                  className={`text-left p-2.5 rounded transition-colors flex flex-col ${
                    comp.id === currentSystem.id
                      ? 'bg-orange-500 text-white font-bold'
                      : 'text-gray-300 hover:bg-navy-800'
                  }`}
                >
                  <span className="truncate">{comp.name}</span>
                  <span className="text-[10px] opacity-75">{comp.classType.split('(')[0]}</span>
                </button>
              ))}
            </div>

            {/* Platform Profile Detail */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 text-xs">
              <div className="flex items-start justify-between border-b border-navy-800 pb-3">
                <div>
                  <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                    {currentSystem.classType}
                  </span>
                  <h3 className="text-xl font-bold text-white">{currentSystem.name}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{currentSystem.role}</p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-gray-400">INDICATIVE OPERATIONAL / HARDWARE COST</div>
                  <div className="text-base font-bold text-orange-400">
                    {currentSystem.costModel.headlineCost}
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Source: {currentSystem.costModel.source}
                  </span>
                </div>
              </div>

              {/* Operations & Deployment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                  <span className="text-gray-400 block mb-1">Operational Model & Data Collected</span>
                  <p className="text-gray-200 mb-2">{currentSystem.operationalModel}</p>
                  <span className="text-gray-400 block mb-1">Data Types:</span>
                  <p className="text-gray-300">{currentSystem.dataCollected}</p>
                </div>

                <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                  <span className="text-gray-400 block mb-1">Deployment & Logistics Burden</span>
                  <p className="text-gray-200 mb-2">{currentSystem.deploymentMethod}</p>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Endurance: <strong>{currentSystem.endurance}</strong></span>
                    <span>Crew: <strong>{currentSystem.crewRequired}</strong></span>
                  </div>
                </div>
              </div>

              {/* Strengths & Limitations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="bg-navy-950 p-3 rounded-lg border border-orange-500/30">
                  <h4 className="font-bold text-orange-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>System Strengths</span>
                  </h4>
                  <ul className="space-y-1 text-gray-300">
                    {currentSystem.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                  <h4 className="font-bold text-gray-300 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                    <span>Known Limitations & Gaps</span>
                  </h4>
                  <ul className="space-y-1 text-gray-400">
                    {currentSystem.limitations.map((l, i) => (
                      <li key={i}>• {l}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* How O-TREX Fills the Gap */}
              <div className="bg-navy-950 p-3.5 rounded-lg border border-orange-500/40">
                <h4 className="font-bold text-orange-400 text-xs mb-1">
                  How O-TREX Architecture Fills This Specific Gap
                </h4>
                <p className="text-white text-xs leading-relaxed">
                  {currentSystem.otrexDifferentiation}
                </p>
              </div>

              {/* Citation & Source Link */}
              <div className="bg-navy-950 p-2.5 rounded border border-navy-800 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">
                  Note: {currentSystem.costModel.costTypeNote}
                </span>
                {currentSystem.costModel.sourceUrl && (
                  <a
                    href={currentSystem.costModel.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-navy-900 hover:bg-orange-500 hover:text-white text-orange-400 border border-orange-500/40 px-2.5 py-1 rounded flex items-center gap-1 shrink-0 ml-2"
                  >
                    <span>Source Doc</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Multi-Dimensional Comparison Matrix */
          <div className="flex-1 p-6 overflow-y-auto text-xs">
            <h3 className="text-base font-bold text-white mb-2">
              COMPREHENSIVE COMPARISON MATRIX: O-TREX vs EXISTING OBSERVATION PARADIGMS
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              Scientific positioning: O-TREX bridges the gap between passive deep-sea floats and multi-million dollar crewed research vessels.
            </p>

            <div className="overflow-x-auto border border-navy-800 rounded-lg">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-navy-950 text-gray-300 border-b border-navy-800 font-mono">
                  <tr>
                    <th className="p-2.5">Feature / Dimension</th>
                    <th className="p-2.5 text-orange-400 font-bold bg-orange-500/10">O-TREX (SIH26065)</th>
                    <th className="p-2.5">Research Vessel</th>
                    <th className="p-2.5">Argo Float</th>
                    <th className="p-2.5">Saildrone USV</th>
                    <th className="p-2.5">Moored Buoy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 text-gray-300 font-mono">
                  <tr className="hover:bg-navy-950/40">
                    <td className="p-2.5 font-bold text-white">Autonomy & Mobility</td>
                    <td className="p-2.5 text-orange-400 font-bold bg-orange-500/5">Autonomous Waypoints</td>
                    <td className="p-2.5">Manned Navigation</td>
                    <td className="p-2.5 text-gray-400">Lagrangian Drift Only</td>
                    <td className="p-2.5">Autonomous Wing Sail</td>
                    <td className="p-2.5 text-gray-400">Fixed Mooring</td>
                  </tr>
                  <tr className="hover:bg-navy-950/40">
                    <td className="p-2.5 font-bold text-white">Human Crew Burden</td>
                    <td className="p-2.5 text-orange-400 font-bold bg-orange-500/5">Zero (Uncrewed)</td>
                    <td className="p-2.5 text-red-400">20–40 Crew & Scientists</td>
                    <td className="p-2.5">Ship crew for deployment</td>
                    <td className="p-2.5">Zero (Uncrewed)</td>
                    <td className="p-2.5">Ship crew for servicing</td>
                  </tr>
                  <tr className="hover:bg-navy-950/40">
                    <td className="p-2.5 font-bold text-white">Continuous Surface Sense</td>
                    <td className="p-2.5 text-orange-400 font-bold bg-orange-500/5">Continuous 24/7</td>
                    <td className="p-2.5">Continuous during cruise</td>
                    <td className="p-2.5 text-gray-400">Periodic (&lt;2% of cycle)</td>
                    <td className="p-2.5 text-white">Continuous</td>
                    <td className="p-2.5">Continuous (fixed point)</td>
                  </tr>
                  <tr className="hover:bg-navy-950/40">
                    <td className="p-2.5 font-bold text-white">Vertical Profiling</td>
                    <td className="p-2.5 text-orange-400 font-bold bg-orange-500/5">Event-Triggered Winch</td>
                    <td className="p-2.5">Rosette CTD (Manual)</td>
                    <td className="p-2.5">Fixed 10-day buoyancy</td>
                    <td className="p-2.5 text-gray-400">Towed / Surface primarily</td>
                    <td className="p-2.5">Fixed depth chain</td>
                  </tr>
                  <tr className="hover:bg-navy-950/40">
                    <td className="p-2.5 font-bold text-white">Adaptive Anomaly AI</td>
                    <td className="p-2.5 text-orange-400 font-bold bg-orange-500/5">Onboard Edge TF-Lite</td>
                    <td className="p-2.5">Human scientist onboard</td>
                    <td className="p-2.5 text-gray-400">None (Fixed schedule)</td>
                    <td className="p-2.5">Route-level remote pilots</td>
                    <td className="p-2.5 text-gray-400">None</td>
                  </tr>
                  <tr className="hover:bg-navy-950/40">
                    <td className="p-2.5 font-bold text-white">Communications Model</td>
                    <td className="p-2.5 text-orange-400 font-bold bg-orange-500/5">LoRa + Sat Priority Queue</td>
                    <td className="p-2.5">High-speed Satellite</td>
                    <td className="p-2.5">Iridium burst at surface</td>
                    <td className="p-2.5">Iridium satellite link</td>
                    <td className="p-2.5">Satellite / Acoustic</td>
                  </tr>
                  <tr className="hover:bg-navy-950/40">
                    <td className="p-2.5 font-bold text-white">Operating Cost Scale</td>
                    <td className="p-2.5 text-orange-400 font-bold bg-orange-500/5">Very Low (Autonomous Solar)</td>
                    <td className="p-2.5 text-red-400">₹21L–₹51L / day</td>
                    <td className="p-2.5">Low (₹1.7L-₹4.2L/yr amortized)</td>
                    <td className="p-2.5">Medium (Managed service)</td>
                    <td className="p-2.5">High servicing cruises</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
