import React, { useState, useEffect } from 'react';
import { Play, Cpu, Layers, Sparkles, Anchor, Activity, Zap, Shield, Waves } from 'lucide-react';
import { CombinedViewport } from './components/layout/CombinedViewport';
import { TopNavBar } from './components/layout/TopNavBar';
import { BottomControlBar } from './components/layout/BottomControlBar';
import { MissionNavPanel } from './components/hud/MissionNavPanel';
import { LiveTelemetryPanel } from './components/hud/LiveTelemetryPanel';
import { KeyboardController } from './components/hud/KeyboardController';
import { SimLoopController } from './components/hud/SimLoopController';
import { HardwareExplorer } from './components/panels/HardwareExplorer';
import { SensorPodModal } from './components/panels/SensorPodModal';
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
      {/* 0. INDEPENDENT HIGH-PRECISION SIMULATION TICK ENGINE (60 FPS) */}
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
      <CompetitorModal />
      <PlatformSizeCharterModal />
      <BOMEstimator />
      <AnalyticsPanel />
      <FailureTester />
      <JudgeDemoGuide />
      <SourcesEvidence />
      <GraphicsModal />

      {/* 5. OPENING SPLASH / HACKATHON WELCOME SCREEN */}
      {showSplash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden font-sans">
          {/* Animated background */}
          <div className="absolute inset-0 bg-navy-950">
            {/* Radial gradient glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(252,163,17,0.12),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_50%,rgba(34,211,238,0.06),transparent)]" />
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `linear-gradient(rgba(252,163,17,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(252,163,17,0.6) 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
              }}
            />
            {/* Animated wave bars at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-around opacity-20">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-gradient-to-t from-cyan-500 to-orange-500 rounded-t"
                  style={{
                    height: `${20 + Math.sin(i * 0.5) * 40 + Math.sin(i * 0.3) * 20}px`,
                    animationDelay: `${i * 0.05}s`,
                    animation: `float ${2 + (i % 3) * 0.5}s ease-in-out infinite alternate`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Main Card */}
          <div className="relative w-full max-w-2xl mx-4 animate-fade-in-up">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: 'rgba(10, 18, 34, 0.96)',
                border: '1px solid rgba(252, 163, 17, 0.25)',
                boxShadow: '0 0 60px rgba(252,163,17,0.12), 0 0 120px rgba(34,211,238,0.06), 0 25px 50px rgba(0,0,0,0.7)'
              }}
            >
              {/* Top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-orange-500 to-cyan-500" />

              <div className="p-8">
                {/* Badge row */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="text-[10px] bg-orange-500/15 text-orange-400 px-3 py-1 rounded-full border border-orange-500/30 font-bold tracking-widest uppercase">
                    SIH 26065
                  </span>
                  <span className="text-[10px] text-gray-500 tracking-widest uppercase">
                    TEAM CODE ZEPHYRA · SMART INDIA HACKATHON 2026
                  </span>
                </div>

                {/* Logo & Title */}
                <div className="flex flex-col items-center mb-6">
                  {/* Logo mark */}
                  <div className="relative mb-4">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center font-extrabold text-navy-950 text-2xl"
                      style={{
                        background: 'linear-gradient(135deg, #FDB642, #FCA311)',
                        boxShadow: '0 0 30px rgba(252,163,17,0.5), 0 0 60px rgba(252,163,17,0.2)'
                      }}
                    >
                      <div className="flex flex-col items-center leading-none">
                        <Waves className="w-7 h-7 mb-0.5" />
                        <span className="text-xs font-black tracking-widest">OTREX</span>
                      </div>
                    </div>
                    {/* Pulse ring */}
                    <div
                      className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                      style={{ background: 'transparent', border: '2px solid #FCA311' }}
                    />
                  </div>

                  <h1 className="text-5xl font-black tracking-[0.12em] text-white mb-1">
                    O<span style={{ color: '#FCA311' }}>-</span>TREX
                  </h1>
                  <p className="text-sm font-semibold tracking-[0.25em] uppercase"
                    style={{ color: '#FCA311' }}>
                    Oceanic Tracking &amp; Responsive eXplorer
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm text-center max-w-lg mx-auto leading-relaxed mb-7">
                  Autonomous low-cost ocean observation platform for Polar &amp; Southern Oceans. Continuous solar-powered surface navigation with edge AI anomaly detection and on-demand vertical profiling (0–100m).
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-7">
                  {[
                    { icon: <Zap className="w-3 h-3" />, text: 'Edge AI Anomaly', color: 'orange' },
                    { icon: <Anchor className="w-3 h-3" />, text: 'CTD Profiling', color: 'cyan' },
                    { icon: <Activity className="w-3 h-3" />, text: 'Real-time Telemetry', color: 'green' },
                    { icon: <Shield className="w-3 h-3" />, text: 'Fault-Tolerant', color: 'purple' },
                  ].map(({ icon, text, color }) => (
                    <span
                      key={text}
                      className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border`}
                      style={{
                        background: color === 'orange' ? 'rgba(252,163,17,0.1)' : color === 'cyan' ? 'rgba(34,211,238,0.1)' : color === 'green' ? 'rgba(34,197,94,0.1)' : 'rgba(168,85,247,0.1)',
                        borderColor: color === 'orange' ? 'rgba(252,163,17,0.3)' : color === 'cyan' ? 'rgba(34,211,238,0.3)' : color === 'green' ? 'rgba(34,197,94,0.3)' : 'rgba(168,85,247,0.3)',
                        color: color === 'orange' ? '#FDB642' : color === 'cyan' ? '#67E8F9' : color === 'green' ? '#86EFAC' : '#C4B5FD',
                      }}
                    >
                      {icon} {text}
                    </span>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                  <button
                    onClick={() => {
                      setShowSplash(false);
                      openModal('JUDGE_TOUR');
                    }}
                    className="relative overflow-hidden flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-extrabold text-sm text-navy-950 active:scale-95 transition-transform"
                    style={{
                      background: 'linear-gradient(135deg, #FDB642, #FCA311)',
                      boxShadow: '0 4px 20px rgba(252,163,17,0.4)'
                    }}
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    START GUIDED JUDGE TOUR
                    <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity" />
                  </button>

                  <button
                    onClick={() => setShowSplash(false)}
                    className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-bold text-sm text-white border border-navy-700 hover:border-orange-500/40 hover:bg-navy-800 active:scale-95 transition-all"
                    style={{ background: 'rgba(20, 33, 61, 0.7)' }}
                  >
                    <Play className="w-4 h-4" />
                    ENTER INTERACTIVE SIMULATOR
                  </button>

                  <button
                    onClick={() => {
                      setShowSplash(false);
                      openModal('HARDWARE');
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-gray-300 border border-navy-700/80 hover:border-navy-600 hover:bg-navy-800/60 text-xs font-semibold transition-all active:scale-95"
                    style={{ background: 'rgba(10, 18, 34, 0.5)' }}
                  >
                    <Cpu className="w-3.5 h-3.5 text-orange-400" />
                    EXPLORE HARDWARE &amp; BOM
                  </button>

                  <button
                    onClick={() => {
                      setShowSplash(false);
                      openModal('COMPETITORS');
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-gray-300 border border-navy-700/80 hover:border-navy-600 hover:bg-navy-800/60 text-xs font-semibold transition-all active:scale-95"
                    style={{ background: 'rgba(10, 18, 34, 0.5)' }}
                  >
                    <Layers className="w-3.5 h-3.5 text-orange-400" />
                    COMPARE EXISTING PLATFORMS
                  </button>
                </div>

                {/* Footer */}
                <div className="text-center mt-5">
                  <p className="text-[10px] text-gray-600 tracking-wider">
                    WASD / SHIFT / SPACE / X / V · MOUSE DRAG = 360° ROTATE · SCROLL = ZOOM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
