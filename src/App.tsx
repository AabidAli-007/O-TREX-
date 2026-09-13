import React, { useState, useEffect } from 'react';
import { Play, Waves, Sparkles, ArrowRight } from 'lucide-react';
import { CombinedViewport } from './components/layout/CombinedViewport';
import { TopNavBar } from './components/layout/TopNavBar';
import { BottomControlBar } from './components/layout/BottomControlBar';
import { MissionNavPanel } from './components/hud/MissionNavPanel';
import { LiveTelemetryPanel } from './components/hud/LiveTelemetryPanel';
import { KeyboardController } from './components/hud/KeyboardController';
import { SimLoopController } from './components/hud/SimLoopController';
import { HardwareExplorer } from './components/panels/HardwareExplorer';
import { SensorPodModal } from './components/panels/SensorPodModal';
import { OceanDataExplorer } from './components/panels/OceanDataExplorer';
import { CompetitorModal } from './components/panels/CompetitorModal';
import { BOMEstimator } from './components/panels/BOMEstimator';
import { AnalyticsPanel } from './components/panels/AnalyticsPanel';
import { FailureTester } from './components/panels/FailureTester';
import { JudgeDemoGuide } from './components/panels/JudgeDemoGuide';
import { SourcesEvidence } from './components/panels/SourcesEvidence';
import { GraphicsModal } from './components/panels/GraphicsModal';
import { PlatformSizeCharterModal } from './components/panels/PlatformSizeCharterModal';
import { useSimulationStore } from './store/useSimulationStore';

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const openModal = useSimulationStore((state) => state.openModal);
  const isDarkMode = useSimulationStore((state) => state.isDarkMode);

  // Apply dark/light class to <html> on mount and when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
  }, [isDarkMode]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-navy-950 font-sans flex flex-col select-none text-gray-200">
      {/* 0. INDEPENDENT SIMULATION TICK ENGINE (60 FPS) */}
      <SimLoopController />

      {/* 0. GLOBAL KEYBOARD CONTROLLER HOOK (WASD, Shift, Space, R, P, Esc) */}
      <KeyboardController />

      {/* 1. TOP MISSION NAVIGATION & STATUS HEADER */}
      <TopNavBar />

      {/* 2. MAIN 3D + 2D COMBINED MISSION CONTROL & GIS SIMULATION VIEWPORT */}
      <main className="relative flex-1 w-full h-full overflow-hidden flex">
        {/* Left Mission & Navigation Panel */}
        <MissionNavPanel />

        {/* Center Combined Viewport (3D + 2D Split / Combined / Inset) */}
        <CombinedViewport />

        {/* Right Live Telemetry & Systems Panel */}
        <LiveTelemetryPanel />
      </main>

      {/* 3. FIXED BOTTOM CONTROLS & TELEMETRY RIBBON */}
      <BottomControlBar />

      {/* 4. INTERACTIVE SUBSYSTEM MODALS & GUIDED TOURS */}
      <HardwareExplorer />
      <SensorPodModal />
      <OceanDataExplorer />
      <CompetitorModal />
      <PlatformSizeCharterModal />
      <BOMEstimator />
      <AnalyticsPanel />
      <FailureTester />
      <JudgeDemoGuide />
      <SourcesEvidence />
      <GraphicsModal />

      {/* 5. MINIMAL EDITORIAL HERO LANDING SCREEN */}
      {showSplash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden font-sans bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-xl mx-4 bg-navy-950/98 border border-navy-700/80 rounded-2xl shadow-2xl p-8 sm:p-10 text-gray-200 flex flex-col items-center text-center">
            {/* Minimal Brand Mark */}
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mb-5">
              <Waves className="w-6 h-6" />
            </div>

            {/* Confident Editorial Typography */}
            <div className="text-[11px] text-orange-400 font-bold uppercase tracking-widest mb-1.5">
              SIH26065 · POLAR OCEAN PLATFORM
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
              O-TREX
            </h1>

            <div className="text-sm font-semibold tracking-wide text-gray-300 uppercase mb-6">
              Autonomous Ocean Observation
            </div>

            {/* Three Pillar Philosophy */}
            <div className="max-w-md text-gray-400 text-sm leading-relaxed mb-8 space-y-1 font-normal">
              <p className="text-gray-200 font-medium">Observe continuously.</p>
              <p className="text-gray-200 font-medium">Profile selectively.</p>
              <p className="text-gray-200 font-medium">Operate efficiently.</p>
            </div>

            {/* Primary & Secondary Actions */}
            <div className="w-full flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={() => setShowSplash(false)}
                className="py-3 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-navy-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-98"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>ENTER MISSION</span>
              </button>

              <button
                onClick={() => {
                  setShowSplash(false);
                  openModal('OCEAN_DATA');
                }}
                className="py-3 px-6 rounded-xl bg-navy-900 hover:bg-navy-800 border border-navy-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Waves className="w-4 h-4 text-orange-400" />
                <span>EXPLORE OCEAN DATA</span>
              </button>
            </div>

            {/* Guided Tour Link */}
            <button
              onClick={() => {
                setShowSplash(false);
                openModal('JUDGE_TOUR');
              }}
              className="text-xs text-gray-400 hover:text-orange-400 flex items-center gap-1.5 transition-colors font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Start 60-Second Guided Judge Tour</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {/* Minimal Subtext */}
            <div className="mt-6 pt-4 border-t border-navy-800/80 w-full text-[10px] text-gray-500">
              WASD / SHIFT = MANUAL PILOT · SPACE = BRAKE · ESC = CLOSE PANELS
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
