import React from 'react';
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const JudgeDemoGuide: React.FC = () => {
  const activeModal = useSimulationStore((state) => state.activeModal);
  const closeModal = useSimulationStore((state) => state.closeModal);
  const judgeTourStep = useSimulationStore((state) => state.judgeTourStep);
  const setJudgeTourStep = useSimulationStore((state) => state.setJudgeTourStep);
  const triggerAnomaly = useSimulationStore((state) => state.triggerAnomaly);
  const manualDeployPod = useSimulationStore((state) => state.manualDeployPod);
  const setCameraMode = useSimulationStore((state) => state.setCameraMode);
  const openModal = useSimulationStore((state) => state.openModal);

  if (activeModal !== 'JUDGE_TOUR') return null;

  const TOUR_STEPS = [
    {
      title: '01. The Problem Statement (SIH26065)',
      subtitle: 'Autonomous Low-Cost Ocean Observation for Polar & Southern Oceans',
      content:
        'Traditional ocean observation faces a critical dilemma: crewed research vessels cost $25k–$60k/day and cannot maintain persistent multi-month presence, while Argo floats drift passively without surface mobility or adaptive targeting.',
      actionLabel: 'Next: O-TREX Architecture',
      onEnter: () => setCameraMode('FOLLOW')
    },
    {
      title: '02. O-TREX Core Architecture',
      subtitle: 'Catamaran USV with Autonomous Winch & Subsurface Sensor Pod',
      content:
        'O-TREX combines continuous solar-powered surface navigation with an autonomous vertical profiling winch. It senses broadly on the surface and only expends energy profiling deep water when an anomaly is verified.',
      actionLabel: 'Inspect Hardware Subsystems',
      onEnter: () => setCameraMode('HARDWARE')
    },
    {
      title: '03. Autonomous Navigation & Surface Sensing',
      subtitle: 'Pixhawk 6C + GNSS RTK Navigation with Multi-Parameter Transducers',
      content:
        'O-TREX follows planned transects while continuously logging surface temperature, conductivity/salinity, dissolved oxygen, pH, and optical turbidity into its onboard InfluxDB time-series database.',
      actionLabel: 'Trigger Environmental Anomaly',
      onEnter: () => setCameraMode('FOLLOW')
    },
    {
      title: '04. Edge AI Anomaly Detection',
      subtitle: 'TensorFlow Lite Multivariate Deviation Scoring (0.00 – 1.00)',
      content:
        'As the vehicle approaches a cold, hypoxic dead zone, the Edge AI pipeline flags normalized deviations across multiple sensors, elevating the Anomaly Score from 0.12 (Normal) to 0.88 (Critical).',
      actionLabel: 'Consult Decision Engine',
      onEnter: () => {
        triggerAnomaly();
        setCameraMode('FOLLOW');
      }
    },
    {
      title: '05. Explainable Decision Engine',
      subtitle: 'Multi-Criteria Utility Solver (Scientific Value + Energy + Comms)',
      content:
        'Instead of opaque black-box decisions, O-TREX evaluates battery margin (≥25%), sea state risk, and anomaly significance to recommend: DEPLOY SENSOR POD.',
      actionLabel: 'Deploy Sensor Pod',
      onEnter: () => setCameraMode('FOLLOW')
    },
    {
      title: '06. Targeted Vertical Column Profiling',
      subtitle: 'Subsurface Winch Profiling down to 35m Target Depth',
      content:
        'The winch lowers the 6-sensor pod through the water column, recording real-time thermocline and oxycline depth curves without losing the surface vehicle.',
      actionLabel: 'View Pod Underwater',
      onEnter: () => {
        manualDeployPod(35.0);
        setCameraMode('UNDERWATER_POD');
      }
    },
    {
      title: '07. Prioritized Satellite Transmission',
      subtitle: 'Tiered Priority Queue (P1 Critical Alert vs P4 Routine Data)',
      content:
        'High-value subsurface anomaly profiles are compressed into binary packets and assigned P1 Critical priority for immediate satellite uplink, while routine data is queued cost-effectively.',
      actionLabel: 'Compare Existing Systems',
      onEnter: () => setCameraMode('FOLLOW')
    },
    {
      title: '08. Competitor Comparison & Niche',
      subtitle: 'O-TREX vs Research Ships ($50k/day), Argo Floats & Saildrones',
      content:
        'O-TREX fills the targeted event-response niche: active surface navigation + on-demand vertical profiling at <1% of a research vessel operating footprint.',
      actionLabel: 'View Prototype BOM & Costs',
      onEnter: () => openModal('COMPETITORS')
    },
    {
      title: '09. Transparent Prototype BOM & Costs',
      subtitle: 'Component-Level Estimate: ~$3,150 Build Cost with Provenance',
      content:
        'Every single component (Pixhawk, RPi 4, Thrusters, Solar, Battery, Sensors) is backed by verified manufacturer catalog pricing and transparent engineering estimates.',
      actionLabel: 'Finish Guided Tour',
      onEnter: () => openModal('BOM')
    },
    {
      title: '10. Summary & Hackathon Impact',
      subtitle: 'Indigenous, Scalable Polar Ocean Observation for India',
      content:
        'O-TREX proves that targeted adaptive profiling delivers deeper oceanographic insights per unit of energy and cost than uniform sampling. Ready for lab testing and marine sea trials!',
      actionLabel: 'Explore Freely',
      onEnter: () => setCameraMode('FOLLOW')
    }
  ];

  const currentStep = TOUR_STEPS[judgeTourStep] || TOUR_STEPS[0];

  const handleNext = () => {
    if (judgeTourStep < TOUR_STEPS.length - 1) {
      const nextIdx = judgeTourStep + 1;
      setJudgeTourStep(nextIdx);
      TOUR_STEPS[nextIdx].onEnter();
    } else {
      closeModal();
    }
  };

  const handlePrev = () => {
    if (judgeTourStep > 0) {
      const prevIdx = judgeTourStep - 1;
      setJudgeTourStep(prevIdx);
      TOUR_STEPS[prevIdx].onEnter();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-2xl bg-navy-900 border border-orange-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col text-gray-200">
        {/* Header */}
        <div className="h-14 bg-navy-950 px-6 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-navy-900 text-orange-400 border border-navy-700">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                2-MINUTE JUDGE DEMO & GUIDED EVALUATION TOUR
              </h2>
              <p className="text-[11px] text-orange-400">
                Step {judgeTourStep + 1} of {TOUR_STEPS.length} — Interactive Proof of O-TREX
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

        {/* Tour Step Body */}
        <div className="p-6 flex flex-col gap-4 text-xs">
          <div>
            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
              {currentStep.subtitle}
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">{currentStep.title}</h3>
          </div>

          <p className="text-gray-200 text-sm leading-relaxed bg-navy-950 p-4 rounded-lg border border-navy-800">
            {currentStep.content}
          </p>

          {/* Step Progress Bar */}
          <div className="w-full bg-navy-950 h-1.5 rounded-full overflow-hidden border border-navy-800">
            <div
              className="bg-orange-500 h-full transition-all duration-300"
              style={{ width: `${((judgeTourStep + 1) / TOUR_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              disabled={judgeTourStep === 0}
              className="px-4 py-2 rounded text-xs text-gray-300 bg-navy-950 hover:bg-navy-800 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 border border-navy-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded font-bold text-xs bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1.5 shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
            >
              <span>{currentStep.actionLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
