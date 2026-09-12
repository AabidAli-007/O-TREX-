import React, { useState } from 'react';
import { Cpu, CheckCircle2, XCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const DecisionBanner: React.FC = () => {
  const decision = useSimulationStore((state) => state.decision);
  const anomaly = useSimulationStore((state) => state.anomaly);
  const missionState = useSimulationStore((state) => state.missionState);
  const isDismissed = useSimulationStore((state) => state.isDecisionBannerDismissed);
  const setDismissed = useSimulationStore((state) => state.setDecisionBannerDismissed);
  const [expanded, setExpanded] = useState(false);

  // If dismissed or inactive baseline, don't show
  if (isDismissed) return null;
  if (!anomaly.active && anomaly.score < 0.35 && missionState === 'SURFACE_MONITORING') {
    return null;
  }

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-full max-w-xl px-2 z-20 font-sans select-none pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="bg-navy-950/90 backdrop-blur-xl border border-orange-500/50 rounded-xl p-2.5 shadow-2xl text-xs text-gray-200">
        {/* Compact Bar Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 shrink-0">
              <Cpu className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-[11px] tracking-wide">
                  AI DECISION:
                </span>
                <span className="px-1.5 py-0.2 rounded font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] truncate">
                  {decision.recommendation.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-[10px] text-gray-300 truncate mt-0.5">
                {decision.rationale}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-1.5 py-1 rounded bg-navy-900 hover:bg-navy-800 border border-navy-700 text-gray-300 hover:text-white flex items-center gap-0.5 text-[10px] transition-colors"
              title={expanded ? 'Collapse Details' : 'Expand Explained Matrix'}
            >
              <span>{expanded ? 'LESS' : 'STEPS'}</span>
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded bg-navy-900 hover:bg-navy-800 border border-navy-700 text-gray-400 hover:text-white transition-colors"
              title="Dismiss Decision Banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable Multi-Criteria Decision Steps */}
        {expanded && decision.explainedSteps.length > 0 && (
          <div className="mt-2 pt-2 border-t border-navy-800/80 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] animate-in fade-in duration-150">
            {decision.explainedSteps.slice(0, 4).map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-1 bg-navy-900/80 p-1.5 rounded border border-navy-800"
              >
                {step.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <span className="font-bold text-white block truncate">{step.rule}</span>
                  <span className="text-gray-400 block truncate">{step.detail}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
