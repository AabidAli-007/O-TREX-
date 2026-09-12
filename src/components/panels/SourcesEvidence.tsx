import React from 'react';
import { X, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { SOURCES_AND_REFERENCES } from '../../data/sourcesData';
import { useSimulationStore } from '../../store/useSimulationStore';

export const SourcesEvidence: React.FC = () => {
  const activeModal = useSimulationStore((state) => state.activeModal);
  const closeModal = useSimulationStore((state) => state.closeModal);

  if (activeModal !== 'SOURCES') return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-4xl bg-navy-900 border border-navy-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-200">
        {/* Header */}
        <div className="h-14 bg-navy-950 px-6 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-navy-900 text-orange-400 border border-navy-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                SCIENTIFIC HONESTY, EVIDENCE & CITATIONS
              </h2>
              <p className="text-[11px] text-orange-400">
                Authoritative Government, Academic & OEM Hardware Catalog References
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

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 text-xs">
          {/* Scientific Honesty Notice */}
          <div className="bg-navy-950 border border-orange-500/40 p-4 rounded-lg text-gray-200 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-orange-400 text-sm mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Scientific Data Provenance Protocol</span>
            </div>
            <p className="text-[11px] text-gray-300">
              Every numerical metric, hardware price, and operational day-rate in this simulator is strictly categorized as either <strong>VERIFIED PUBLIC DATA</strong> (from official government/academic sources), <strong>PROJECT DESIGN SPEC</strong> (from Team CODE ZEPHYRA SIH deck), <strong>ENGINEERING ESTIMATE</strong>, or <strong>SIMULATION PARAMETER</strong>. Synthetic ocean telemetry is generated using deterministic hydrodynamic and biogeochemical models.
            </p>
          </div>

          {/* Sourced Reference Cards */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Primary Academic & Institutional Sources
            </h3>
            {SOURCES_AND_REFERENCES.map((src) => (
              <div
                key={src.id}
                className="bg-navy-950 p-3.5 rounded-lg border border-navy-800 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-xs">{src.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-navy-900 border border-navy-700 text-orange-400">
                      {src.provenanceType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-gray-400 text-[11px] block">{src.organization}</span>
                  <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                    {src.keyClaimOrData}
                  </p>
                </div>

                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-navy-900 hover:bg-orange-500 hover:text-white text-orange-400 border border-orange-500/40 px-3 py-1.5 rounded flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <span>View Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
