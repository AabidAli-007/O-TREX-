import React, { useState } from 'react';
import { Eye, RefreshCw, Radio, Tv } from 'lucide-react';
import { OceanCanvas } from '../3d/OceanCanvas';
import { OceanCanvas2D } from '../2d/OceanCanvas2D';
import { DecisionBanner } from '../hud/DecisionBanner';
import { PodDeploymentOverlay } from '../hud/PodDeploymentOverlay';
import { SubsurfaceFeedHUD } from '../hud/SubsurfaceFeedHUD';
import { KeyMappingHUD } from '../hud/KeyMappingHUD';
import { TacticalMiniMap } from '../hud/TacticalMiniMap';
import { SideDrawerContainer } from '../drawers/SideDrawerContainer';
import { useSimulationStore } from '../../store/useSimulationStore';

export const CombinedViewport: React.FC = () => {
  const viewportMode = useSimulationStore((state) => state.viewportMode);
  const setViewportMode = useSimulationStore((state) => state.setViewportMode);
  const cameraMode = useSimulationStore((state) => state.cameraMode);
  const [swapped, setSwapped] = useState(false);
  const [splitRatio, setSplitRatio] = useState<'50-50' | '60-40' | '40-60'>('50-50');
  const [showRadarPiP, setShowRadarPiP] = useState(false);

  const PrimaryView = swapped ? OceanCanvas2D : OceanCanvas;
  const SecondaryView = swapped ? OceanCanvas : OceanCanvas2D;

  const primaryLabel = swapped ? '2D GIS OCEAN RADAR' : '3D PHOTOREALISTIC OCEAN';
  const secondaryLabel = swapped ? '3D PHOTOREALISTIC OCEAN' : '2D GIS OCEAN RADAR';

  const ModeBtn = ({
    mode, icon: Icon, label
  }: {
    mode: typeof viewportMode;
    icon: React.ElementType;
    label: string;
  }) => {
    const active = viewportMode === mode;
    return (
      <button
        onClick={() => setViewportMode(mode)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
        title={label}
        style={{
          background: active ? 'rgba(252,163,17,0.18)' : 'transparent',
          color: active ? '#FDB642' : '#64748B',
          boxShadow: active ? '0 0 0 1px rgba(252,163,17,0.3) inset' : 'none',
        }}
        onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
        onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col select-none font-sans min-w-0">
      {/* Viewport Mode Switcher Toolbar */}
      <div
        className="h-9 flex-shrink-0 flex items-center justify-between px-3 z-20"
        style={{
          background: 'rgba(6, 11, 22, 0.9)',
          borderBottom: '1px solid rgba(28, 46, 82, 0.6)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-gray-700 tracking-widest uppercase mr-1">VIEW</span>
          <div
            className="flex items-center p-0.5 rounded-xl gap-0.5"
            style={{ background: 'rgba(10, 18, 34, 0.8)', border: '1px solid rgba(28, 46, 82, 0.6)' }}
          >
            <ModeBtn mode="COMBINED" icon={Tv} label="3D+2D" />
            <ModeBtn mode="3D" icon={Eye} label="3D SIM" />
            <ModeBtn mode="2D" icon={Radio} label="2D MAP" />
          </div>
        </div>

        {/* Secondary controls */}
        <div className="flex items-center gap-2 text-[10px]">
          {viewportMode === 'COMBINED' && (
            <>
              <button
                onClick={() => setSwapped(!swapped)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg font-bold border transition-all"
                title="Swap Left/Right Views"
                style={{
                  background: 'rgba(10,18,34,0.7)',
                  color: '#FDB642',
                  border: '1px solid rgba(252,163,17,0.2)'
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(252,163,17,0.1)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(10,18,34,0.7)'; }}
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">SWAP</span>
              </button>

              <button
                onClick={() =>
                  setSplitRatio((prev) =>
                    prev === '50-50' ? '60-40' : prev === '60-40' ? '40-60' : '50-50'
                  )
                }
                className="px-2 py-1 rounded-lg font-bold border transition-all"
                title="Change Split Ratio"
                style={{
                  background: 'rgba(10,18,34,0.7)',
                  color: '#94A3B8',
                  border: '1px solid rgba(28,46,82,0.6)'
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(28,46,82,0.5)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(10,18,34,0.7)'; }}
              >
                {splitRatio}
              </button>
            </>
          )}

          {viewportMode === '3D' && cameraMode !== 'UNDERWATER_POD' && (
            <button
              onClick={() => setShowRadarPiP(!showRadarPiP)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg font-bold border transition-all"
              title="Toggle 2D Radar Picture-in-Picture"
              style={{
                background: showRadarPiP ? 'rgba(252,163,17,0.15)' : 'rgba(10,18,34,0.7)',
                color: showRadarPiP ? '#FDB642' : '#94A3B8',
                border: showRadarPiP ? '1px solid rgba(252,163,17,0.3)' : '1px solid rgba(28,46,82,0.6)',
              }}
            >
              <Radio className="w-3 h-3" />
              <span className="hidden sm:inline">{showRadarPiP ? 'HIDE RADAR' : 'RADAR PIP'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport Content Area */}
      {/* IMPORTANT: This div does NOT have pointer-events-none so the canvas receives mouse events */}
      <div className="relative flex-1 w-full overflow-hidden flex">

        {/* MODE 1: COMBINED (SPLIT 3D + 2D) */}
        {viewportMode === 'COMBINED' && (
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* Primary */}
            <div
              className={`relative h-full overflow-hidden transition-all duration-200 ${
                splitRatio === '50-50' ? 'md:w-1/2'
                : splitRatio === '60-40' ? 'md:w-3/5'
                : 'md:w-2/5'
              }`}
              style={{ borderRight: '1px solid rgba(28,46,82,0.7)' }}
            >
              <PrimaryView />
              <div
                className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-bold pointer-events-none"
                style={{
                  background: 'rgba(6,11,22,0.85)',
                  border: '1px solid rgba(252,163,17,0.2)',
                  color: '#FDB642',
                  backdropFilter: 'blur(8px)'
                }}
              >
                {primaryLabel}
              </div>
            </div>

            {/* Secondary */}
            <div
              className={`relative h-full overflow-hidden transition-all duration-200 ${
                splitRatio === '50-50' ? 'md:w-1/2'
                : splitRatio === '60-40' ? 'md:w-2/5'
                : 'md:w-3/5'
              }`}
            >
              <SecondaryView />
              <div
                className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-bold pointer-events-none"
                style={{
                  background: 'rgba(6,11,22,0.85)',
                  border: '1px solid rgba(34,211,238,0.2)',
                  color: '#67E8F9',
                  backdropFilter: 'blur(8px)'
                }}
              >
                {secondaryLabel}
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: FULL 3D */}
        {viewportMode === '3D' && (
          <div className="relative w-full h-full">
            <OceanCanvas />
            {/* PiP Radar */}
            {showRadarPiP && cameraMode !== 'UNDERWATER_POD' && (
              <div
                className="absolute bottom-20 left-4 w-56 h-40 rounded-xl overflow-hidden z-20 pointer-events-none"
                style={{
                  background: 'rgba(6,11,22,0.95)',
                  border: '1px solid rgba(28,46,82,0.8)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                }}
              >
                <OceanCanvas2D />
                <div
                  className="absolute top-1.5 left-2 text-[9px] font-bold"
                  style={{ color: '#FDB642', background: 'rgba(6,11,22,0.85)', padding: '1px 4px', borderRadius: '3px' }}
                >
                  2D TACTICAL RADAR
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 3: FULL 2D GIS MAP */}
        {viewportMode === '2D' && (
          <div className="relative w-full h-full">
            <OceanCanvas2D />
            {/* PiP 3D inset */}
            <div
              className="absolute bottom-20 left-4 w-56 h-40 rounded-xl overflow-hidden z-20 pointer-events-none"
              style={{
                background: 'rgba(6,11,22,0.95)',
                border: '1px solid rgba(28,46,82,0.8)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
              }}
            >
              <OceanCanvas />
              <div
                className="absolute top-1.5 left-2 text-[9px] font-bold"
                style={{ color: '#67E8F9', background: 'rgba(6,11,22,0.85)', padding: '1px 4px', borderRadius: '3px' }}
              >
                LIVE 3D VESSEL CAM
              </div>
            </div>
          </div>
        )}

        {/* ── OVERLAYS (pointer-events-none so canvas gets mouse events) ── */}

        {/* Subsurface Feed HUD — pointer-events handled inside component */}
        <SubsurfaceFeedHUD />

        {/* Edge AI Decision Banner */}
        {/* pointer-events-none on the wrapper — the banner itself handles its own clicks */}
        <div className="absolute inset-0 pointer-events-none z-30">
          <div className="pointer-events-auto">
            <DecisionBanner />
          </div>
        </div>

        {/* Pod Deployment Overlay */}
        <div className="absolute inset-0 pointer-events-none z-25">
          <div className="pointer-events-auto">
            <PodDeploymentOverlay />
          </div>
        </div>

        {/* Key Mapping HUD — absolutely positioned, handles its own pointer events */}
        <KeyMappingHUD />

        {/* Tactical Mini Map */}
        {viewportMode !== '2D' && <TacticalMiniMap />}

        {/* Side Drawers */}
        <SideDrawerContainer />
      </div>
    </div>
  );
};
