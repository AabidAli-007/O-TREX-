import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Compass,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  EyeOff,
  Eye
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { COMPETITOR_SYSTEMS } from '../../data/competitorsData';

export const TacticalMiniMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Store bindings
  const vehicle = useSimulationStore((state) => state.vehicle);
  const waypoints = useSimulationStore((state) => state.waypoints);
  const addWaypoint = useSimulationStore((state) => state.addWaypoint);

  // UI state: 'MIN' | 'COMPACT' | 'EXPANDED'
  const [viewState, setViewState] = useState<'MIN' | 'COMPACT' | 'EXPANDED'>('COMPACT');
  const [zoomMeters, setZoomMeters] = useState<number>(3000); // meters across half-width
  const [autoCenter, setAutoCenter] = useState<boolean>(true);
  const [mapCenter, setMapCenter] = useState<{ x: number; z: number }>({ x: 0, z: 0 });
  const [clickNotice, setClickNotice] = useState<string | null>(null);

  // Auto-center tracking on vehicle
  useEffect(() => {
    if (autoCenter) {
      setMapCenter({ x: vehicle.simX, z: vehicle.simZ });
    }
  }, [vehicle.simX, vehicle.simZ, autoCenter]);

  // Dimensions based on mode
  const width = viewState === 'EXPANDED' ? 380 : 250;
  const height = viewState === 'EXPANDED' ? 310 : 210;

  const screenToWorld = useCallback(
    (sx: number, sy: number, w: number, h: number) => {
      const cx = w / 2;
      const cy = h / 2;
      const scale = (w / 2) / zoomMeters;
      const wx = mapCenter.x + (sx - cx) / scale;
      const wz = mapCenter.z + (sy - cy) / scale;
      return { x: wx, z: wz };
    },
    [mapCenter, zoomMeters]
  );

  // Handle click on canvas to navigate
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const { x: worldX, z: worldZ } = screenToWorld(sx, sy, rect.width, rect.height);
    const latKm = worldX / 1000.0;
    const lonKm = worldZ / 1000.0;

    // Add waypoint and direct autopilot to clicked point
    addWaypoint(latKm, lonKm, `TACTICAL [${latKm.toFixed(1)}k, ${lonKm.toFixed(1)}k]`);
    
    // Set auto navigation directly to this new waypoint
    const store = useSimulationStore.getState();
    const newIdx = store.waypoints.length - 1;
    store.vehicle.currentWaypointIndex = Math.max(0, newIdx);
    store.vehicle.controlMode = 'AUTONOMOUS';

    setClickNotice(`TARGET SET: [${(worldX / 1000).toFixed(2)}k, ${(worldZ / 1000).toFixed(2)}k]`);
    setTimeout(() => setClickNotice(null), 2500);
  };

  // Canvas radar rendering loop
  useEffect(() => {
    let animId: number;
    let sweepAngle = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get latest state directly from store to avoid stale closures in loop
      const store = useSimulationStore.getState();
      const currentVehicle = store.vehicle;
      const currentEnv = store.env;
      const currentSurveyTrail = store.surveyTrail;
      const currentWaypoints = store.waypoints;

      // Current map center based on state
      const currentMapCenterX = autoCenter ? currentVehicle.simX : mapCenter.x;
      const currentMapCenterZ = autoCenter ? currentVehicle.simZ : mapCenter.z;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Inline worldToScreen to use latest map center
      const worldToScreenLocal = (wx: number, wz: number, cw: number, ch: number) => {
        const mcx = cw / 2;
        const mcy = ch / 2;
        const scale = (cw / 2) / zoomMeters;
        const sx = mcx + (wx - currentMapCenterX) * scale;
        const sy = mcy + (wz - currentMapCenterZ) * scale;
        return { x: sx, y: sy };
      };

      // 1. Dark ocean tactical background
      ctx.fillStyle = '#050D1A';
      ctx.fillRect(0, 0, w, h);

      // 2. Concentric Radar Range Rings & Crosshairs
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
      ctx.lineWidth = 1;

      // Range rings: 500m, 1000m, 2000m, 3000m
      const rings = [500, 1000, 2000, 3000];
      rings.forEach((rMeters) => {
        const ringPx = (rMeters / zoomMeters) * (w / 2);
        if (ringPx < w * 0.9) {
          ctx.beginPath();
          ctx.arc(cx, cy, ringPx, 0, Math.PI * 2);
          ctx.stroke();

          // Range annotation
          ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
          ctx.font = '8px monospace';
          ctx.fillText(`${rMeters >= 1000 ? rMeters / 1000 + 'km' : rMeters + 'm'}`, cx + ringPx - 24, cy - 2);
        }
      });

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();

      // 3. Rotating Radar Sweep Line
      sweepAngle += 0.035;
      const sweepLen = Math.max(w, h);
      const sweepX = cx + Math.cos(sweepAngle) * sweepLen;
      const sweepY = cy + Math.sin(sweepAngle) * sweepLen;

      const grad = ctx.createLinearGradient(cx, cy, sweepX, sweepY);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();

      // 4. Anomaly Zone
      if (currentEnv.anomalyRegion.active) {
        const as = worldToScreenLocal(
          currentEnv.anomalyRegion.centerSimX,
          currentEnv.anomalyRegion.centerSimZ,
          w,
          h
        );
        const aRadPx = (currentEnv.anomalyRegion.radiusM / zoomMeters) * (w / 2);

        // Anomaly fill and border
        ctx.fillStyle = 'rgba(249, 115, 22, 0.12)';
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(as.x, as.y, aRadPx, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F97316';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('ANOMALY ZONE', as.x - 28, as.y - aRadPx - 3);
      }

      // 5. Survey Breadcrumb Trail
      if (currentSurveyTrail.length > 1) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        currentSurveyTrail.forEach((pt, i) => {
          const s = worldToScreenLocal(pt.x, pt.z, w, h);
          if (i === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        });
        ctx.stroke();
      }

      // 6. Waypoint Route Line & Waypoint Markers
      if (currentWaypoints.length > 0) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        currentWaypoints.forEach((wp, i) => {
          const s = worldToScreenLocal(wp.lat * 1000, wp.lon * 1000, w, h);
          if (i === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Waypoints icons
        currentWaypoints.forEach((wp, idx) => {
          const s = worldToScreenLocal(wp.lat * 1000, wp.lon * 1000, w, h);
          const isTarget = currentVehicle.currentWaypointIndex === idx;

          // Target pulse halo
          if (isTarget) {
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.fillStyle = wp.reached ? '#22C55E' : isTarget ? '#F59E0B' : '#64748B';
          ctx.beginPath();
          ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = isTarget ? '#FFFFFF' : '#94A3B8';
          ctx.font = '8px monospace';
          ctx.fillText(`WP${idx.toString().padStart(2, '0')}`, s.x + 6, s.y + 3);
        });
      }

      // 7. Other Existing Ocean Observation Solutions (Nearby O-TREX)
      COMPETITOR_SYSTEMS.forEach((comp) => {
        const cs = worldToScreenLocal(comp.simCoords[0], comp.simCoords[2], w, h);
        const distFromOtrex = Math.round(
          Math.hypot(comp.simCoords[0] - currentVehicle.simX, comp.simCoords[2] - currentVehicle.simZ)
        );

        let markerColor = '#FACC15'; // default yellow
        let shortTag = 'ARGO';
        if (comp.id === 'argo-float') {
          markerColor = '#FACC15';
          shortTag = 'ARGO';
        } else if (comp.id === 'commercial-usv') {
          markerColor = '#FB923C';
          shortTag = 'SAILDRONE';
        } else if (comp.id === 'fixed-mooring') {
          markerColor = '#FDE047';
          shortTag = 'BUOY';
        } else if (comp.id === 'research-vessel') {
          markerColor = '#38BDF8';
          shortTag = 'SHIP';
        }

        // Pulse halo for competitor systems
        ctx.strokeStyle = markerColor;
        ctx.fillStyle = markerColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cs.x, cs.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cs.x, cs.y, 7, 0, Math.PI * 2);
        ctx.stroke();

        // High-contrast label with distance to O-TREX
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(cs.x + 8, cs.y - 6, 68, 11);
        ctx.strokeStyle = markerColor;
        ctx.strokeRect(cs.x + 8, cs.y - 6, 68, 11);

        ctx.fillStyle = markerColor;
        ctx.font = 'bold 7.5px monospace';
        ctx.fillText(`${shortTag} [${distFromOtrex}m]`, cs.x + 10, cs.y + 2.5);
      });

      // 8. O-TREX Vehicle Vessel Marker (Directional Chevron / Vessel Hull)
      const vs = worldToScreenLocal(currentVehicle.simX, currentVehicle.simZ, w, h);
      const headingRad = (currentVehicle.headingDeg * Math.PI) / 180.0;

      // Projected Heading Vector Line (100m projected)
      const fwdLen = 22;
      const fwdX = vs.x + Math.sin(headingRad) * fwdLen;
      const fwdY = vs.y + Math.cos(headingRad) * fwdLen;

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(vs.x, vs.y);
      ctx.lineTo(fwdX, fwdY);
      ctx.stroke();

      // Vessel Triangle Hull
      ctx.save();
      ctx.translate(vs.x, vs.y);
      ctx.rotate(-headingRad + Math.PI); // Coordinate inversion for canvas Y

      ctx.fillStyle = '#0284C7';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(6, 7);
      ctx.lineTo(0, 4);
      ctx.lineTo(-6, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Central core dot
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Label
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('O-TREX', vs.x + 8, vs.y - 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [zoomMeters, mapCenter, autoCenter]);

  // If minimized, render compact bar
  if (viewState === 'MIN') {
    return (
      <div className="absolute bottom-14 left-3 z-30 flex items-center gap-1.5 bg-navy-950/90 backdrop-blur-md border border-navy-700/90 px-2.5 py-1.5 rounded-lg text-xs font-mono shadow-2xl select-none">
        <Compass className="w-3.5 h-3.5 text-orange-400 animate-spin" style={{ animationDuration: '8s' }} />
        <span className="text-gray-200 font-bold text-[10px]">RADAR MAP</span>
        <button
          onClick={() => setViewState('COMPACT')}
          className="ml-1 text-cyan-400 hover:text-white p-0.5 rounded bg-navy-800 border border-navy-700 text-[10px] flex items-center gap-1 px-1.5"
          title="Expand Tactical Radar Map"
        >
          <Eye className="w-3 h-3" />
          <span>OPEN</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`absolute bottom-14 left-3 z-30 bg-navy-950/95 backdrop-blur-md border border-navy-700/90 rounded-xl shadow-2xl flex flex-col overflow-hidden select-none font-mono transition-all duration-200`}
      style={{ width: `${width}px` }}
    >
      {/* Header Bar */}
      <div className="h-7 bg-navy-900/90 border-b border-navy-800 px-2 flex items-center justify-between text-[10px] text-gray-300">
        <div className="flex items-center gap-1.5 font-bold">
          <Compass className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-white tracking-wide">TACTICAL RADAR</span>
          <span className="text-[9px] text-cyan-400 bg-cyan-950/70 border border-cyan-800/80 px-1 py-0.2 rounded">
            {vehicle.controlMode}
          </span>
        </div>

        {/* Map Header Controls */}
        <div className="flex items-center gap-1 text-gray-400">
          <button
            onClick={() => setZoomMeters((prev) => Math.max(800, prev * 0.75))}
            className="p-1 hover:text-white hover:bg-navy-800 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoomMeters((prev) => Math.min(8000, prev * 1.35))}
            className="p-1 hover:text-white hover:bg-navy-800 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={() => setAutoCenter(!autoCenter)}
            className={`p-1 rounded transition-colors ${
              autoCenter ? 'text-cyan-400 bg-cyan-950/70 border border-cyan-800/60' : 'hover:text-white hover:bg-navy-800'
            }`}
            title="Auto-Center on O-TREX"
          >
            <Crosshair className="w-3 h-3" />
          </button>
          <button
            onClick={() => setViewState(viewState === 'EXPANDED' ? 'COMPACT' : 'EXPANDED')}
            className="p-1 hover:text-white hover:bg-navy-800 rounded transition-colors"
            title={viewState === 'EXPANDED' ? 'Shrink' : 'Expand'}
          >
            {viewState === 'EXPANDED' ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setViewState('MIN')}
            className="p-1 hover:text-white hover:bg-navy-800 rounded transition-colors"
            title="Minimize Map"
          >
            <EyeOff className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Radar Map Canvas */}
      <div className="relative w-full cursor-crosshair" style={{ height: `${height}px` }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={handleCanvasClick}
          className="w-full h-full block"
          title="Click anywhere on the map to command O-TREX to navigate there!"
        />

        {/* Temporary Click Feedback Notice */}
        {clickNotice && (
          <div className="absolute top-2 left-2 bg-orange-500/90 text-navy-950 font-bold text-[9px] px-2 py-0.5 rounded shadow-lg animate-bounce pointer-events-none">
            {clickNotice}
          </div>
        )}

        {/* Range scale overlay indicator in corner */}
        <div className="absolute bottom-1 right-1 text-[8px] text-cyan-400/80 bg-navy-950/80 px-1 py-0.5 rounded border border-navy-800 pointer-events-none">
          SPAN: {(zoomMeters * 2 / 1000).toFixed(1)}km
        </div>

        {/* Click-to-steer Hint */}
        <div className="absolute top-1 right-1 text-[8px] text-gray-400/70 bg-navy-950/60 px-1 py-0.5 rounded pointer-events-none">
          CLICK = NAVIGATE
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="h-6 bg-navy-900/95 border-t border-navy-800 px-2 flex items-center justify-between text-[9px] text-gray-400">
        <div className="flex items-center gap-2">
          <span>
            SPD: <strong className="text-white">{vehicle.speedKnots.toFixed(1)}kt</strong>
          </span>
          <span>
            HDG: <strong className="text-white">{vehicle.headingDeg.toFixed(0)}°</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-orange-400">
            WP: {vehicle.currentWaypointIndex + 1}/{waypoints.length}
          </span>
          <span className="text-gray-300 font-mono">
            {vehicle.lat.toFixed(3)}, {vehicle.lon.toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
};
