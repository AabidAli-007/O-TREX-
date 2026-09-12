import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Compass,
  Layers,
  Ruler,
  Grid,
  Radio,
  ExternalLink,
  X,
  Info
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { COMPETITOR_SYSTEMS } from '../../data/competitorsData';
import { CompetitorSystem } from '../../types/competitor';
import { formatLatLon } from '../../utils/formatters';

export const OceanCanvas2D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Store bindings
  const vehicle = useSimulationStore((state) => state.vehicle);
  const pod = useSimulationStore((state) => state.pod);
  const env = useSimulationStore((state) => state.env);
  const waypoints = useSimulationStore((state) => state.waypoints);
  const activeDataLayer = useSimulationStore((state) => state.activeDataLayer);
  const mapSettings = useSimulationStore((state) => state.mapSettings);
  const surveyTrail = useSimulationStore((state) => state.surveyTrail);
  const measurePoints = useSimulationStore((state) => state.measurePoints);
  const toggleMapSetting = useSimulationStore((state) => state.toggleMapSetting);
  const setMeasurePoint = useSimulationStore((state) => state.setMeasurePoint);
  const clearMeasurement = useSimulationStore((state) => state.clearMeasurement);
  const addWaypoint = useSimulationStore((state) => state.addWaypoint);
  const openModal = useSimulationStore((state) => state.openModal);
  const selectCompetitor = useSimulationStore((state) => state.selectCompetitor);

  // Viewport camera transform (Center coordinates in meters & zoom level)
  // zoom: pixels per meter. At zoom = 0.1, 100m = 10px, 1km = 100px.
  const [viewCenter, setViewCenter] = useState<{ x: number; z: number }>({ x: 0, z: 0 });
  const [zoom, setZoom] = useState<number>(0.12); // ~8km visible
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mouseWorldPos, setMouseWorldPos] = useState<{ x: number; z: number }>({ x: 0, z: 0 });
  const [hoveredCompetitor, setHoveredCompetitor] = useState<CompetitorSystem | null>(null);
  const [selectedSystemCard, setSelectedSystemCard] = useState<CompetitorSystem | null>(null);

  // Smooth auto-follow vehicle when enabled
  useEffect(() => {
    if (mapSettings.autoFollow && !isDragging) {
      setViewCenter((prev) => {
        const dx = vehicle.simX - prev.x;
        const dz = vehicle.simZ - prev.z;
        // Damped interpolation
        return {
          x: prev.x + dx * 0.15,
          z: prev.z + dz * 0.15
        };
      });
    }
  }, [vehicle.simX, vehicle.simZ, mapSettings.autoFollow, isDragging]);

  // Screen to World Coordinate Conversion
  const screenToWorld = useCallback(
    (screenX: number, screenY: number, width: number, height: number) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const worldX = viewCenter.x + (screenX - centerX) / zoom;
      const worldZ = viewCenter.z + (screenY - centerY) / zoom;
      return { x: worldX, z: worldZ };
    },
    [viewCenter, zoom]
  );

  // World to Screen Coordinate Conversion
  const worldToScreen = useCallback(
    (worldX: number, worldZ: number, width: number, height: number) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const screenX = centerX + (worldX - viewCenter.x) * zoom;
      const screenY = centerY + (worldZ - viewCenter.z) * zoom;
      return { x: screenX, y: screenY };
    },
    [viewCenter, zoom]
  );

  // Zoom handling
  const handleZoom = (factor: number) => {
    setZoom((prev) => Math.max(0.015, Math.min(2.5, prev * factor)));
  };

  // Reset view to entire 10km x 10km mission sector
  const handleFitMission = () => {
    setViewCenter({ x: 2000, z: 1500 });
    setZoom(0.065);
  };

  // Center view on O-TREX vehicle
  const handleCenterVehicle = () => {
    setViewCenter({ x: vehicle.simX, z: vehicle.simZ });
    if (!mapSettings.autoFollow) {
      toggleMapSetting('autoFollow');
    }
  };

  // Canvas Mouse Interactions (Pan, Zoom, Measure, Waypoint click)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (mapSettings.measureMode) {
      const world = screenToWorld(clientX, clientY, rect.width, rect.height);
      setMeasurePoint(world);
      return;
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });

    // If user manually drags, turn off autoFollow temporarily
    if (mapSettings.autoFollow) {
      toggleMapSetting('autoFollow');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const world = screenToWorld(clientX, clientY, rect.width, rect.height);
    setMouseWorldPos(world);

    // Check hover over existing systems
    if (mapSettings.showExistingSystems) {
      let hovered: CompetitorSystem | null = null;
      for (const comp of COMPETITOR_SYSTEMS) {
        const screenPos = worldToScreen(comp.simCoords[0], comp.simCoords[2], rect.width, rect.height);
        const dist = Math.hypot(clientX - screenPos.x, clientY - screenPos.y);
        if (dist < 18) {
          hovered = comp;
          break;
        }
      }
      setHoveredCompetitor(hovered);
    }

    if (!isDragging) return;

    const dx = (e.clientX - dragStart.x) / zoom;
    const dy = (e.clientY - dragStart.y) / zoom;

    setViewCenter((prev) => ({
      x: prev.x - dx,
      z: prev.z - dy
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((prev) => Math.max(0.015, Math.min(2.5, prev * zoomFactor)));
  };

  const handleCanvasClick = () => {
    if (hoveredCompetitor) {
      setSelectedSystemCard(hoveredCompetitor);
      return;
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const world = screenToWorld(clientX, clientY, rect.width, rect.height);
    const latKm = Number((world.x / 1000).toFixed(2));
    const lonKm = Number((world.z / 1000).toFixed(2));
    addWaypoint(latKm, lonKm);
  };

  // MAIN 2D RENDER LOOP (High-Performance HTML5 Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let waveOffset = 0;

    const render = () => {
      waveOffset += 0.02;

      // Handle high-DPI retina display resolution
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Ocean Background Gradient (Deep Marine Bathymetry)
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.1,
        width / 2,
        height / 2,
        width * 0.8
      );
      bgGrad.addColorStop(0, '#0c1a2f'); // Deep ocean teal
      bgGrad.addColorStop(0.6, '#081222'); // Sub-polar navy
      bgGrad.addColorStop(1, '#040914'); // Abyss black-navy
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Animated Ambient Ocean Wave Ripples & Bathymetric Isobaths
      if (mapSettings.showBathymetry) {
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.035)';
        ctx.lineWidth = 1;
        const rippleCount = 8;
        for (let i = 0; i < rippleCount; i++) {
          const r = ((i * 180 + waveOffset * 40) % (width * 1.2)) + 50;
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Depth contour curves (Simulated Southern Ocean Ridge)
        ctx.strokeStyle = 'rgba(20, 184, 166, 0.07)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 6]);
        for (let offset = -4000; offset <= 4000; offset += 2000) {
          ctx.beginPath();
          for (let x = 0; x < width; x += 30) {
            const world = screenToWorld(x, 0, width, height);
            const contourZ = offset + Math.sin(world.x * 0.0008) * 800 + Math.cos(world.x * 0.0003) * 400;
            const screenPt = worldToScreen(world.x, contourZ, width, height);
            if (x === 0) ctx.moveTo(screenPt.x, screenPt.y);
            else ctx.lineTo(screenPt.x, screenPt.y);
          }
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      // 3. Geographic & Coordinate Grid
      if (mapSettings.showGrid) {
        // Grid spacing adaptively scales based on zoom level (e.g. 100m, 500m, 1km, 5km)
        let gridStepMeters = 1000;
        if (zoom > 0.4) gridStepMeters = 200;
        else if (zoom > 0.15) gridStepMeters = 500;
        else if (zoom < 0.04) gridStepMeters = 5000;

        const startWorld = screenToWorld(0, 0, width, height);
        const endWorld = screenToWorld(width, height, width, height);

        const firstGridX = Math.floor(startWorld.x / gridStepMeters) * gridStepMeters;
        const lastGridX = Math.ceil(endWorld.x / gridStepMeters) * gridStepMeters;
        const firstGridZ = Math.floor(startWorld.z / gridStepMeters) * gridStepMeters;
        const lastGridZ = Math.ceil(endWorld.z / gridStepMeters) * gridStepMeters;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'rgba(229, 229, 229, 0.35)';
        ctx.font = '9px monospace';

        // Vertical Grid Lines (X / Easting)
        for (let gx = firstGridX; gx <= lastGridX; gx += gridStepMeters) {
          const sx = worldToScreen(gx, 0, width, height).x;
          ctx.beginPath();
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx, height);
          ctx.stroke();

          // Coordinate label
          const labelText = `${gx >= 0 ? '+' : ''}${(gx / 1000).toFixed(1)}k`;
          ctx.fillText(labelText, sx + 4, height - 8);
        }

        // Horizontal Grid Lines (Z / Northing)
        for (let gz = firstGridZ; gz <= lastGridZ; gz += gridStepMeters) {
          const sy = worldToScreen(0, gz, width, height).y;
          ctx.beginPath();
          ctx.moveTo(0, sy);
          ctx.lineTo(width, sy);
          ctx.stroke();

          const labelText = `${gz >= 0 ? '+' : ''}${(gz / 1000).toFixed(1)}k`;
          ctx.fillText(labelText, 8, sy - 4);
        }
      }

      // 4. Mission Sector Boundary (10km x 10km Survey Bounding Box)
      const bMin = worldToScreen(-1500, -2500, width, height);
      const bMax = worldToScreen(6000, 5000, width, height);
      const bw = bMax.x - bMin.x;
      const bh = bMax.y - bMin.y;

      ctx.strokeStyle = 'rgba(252, 163, 17, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([10, 6]);
      ctx.strokeRect(bMin.x, bMin.y, bw, bh);
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(252, 163, 17, 0.5)';
      ctx.font = '10px monospace';
      ctx.fillText('SOUTHERN OCEAN SURVEY SECTOR [7.5 km × 7.5 km]', bMin.x + 8, bMin.y + 16);

      // 5. Scientific Heatmap Data Layers (When Active)
      if (activeDataLayer !== 'NONE') {
        const anomalyX = env.anomalyRegion.centerSimX;
        const anomalyZ = env.anomalyRegion.centerSimZ;
        const anomalyRadius = env.anomalyRegion.radiusM;
        const screenAnomaly = worldToScreen(anomalyX, anomalyZ, width, height);
        const screenR = anomalyRadius * zoom;

        const layerGrad = ctx.createRadialGradient(
          screenAnomaly.x,
          screenAnomaly.y,
          0,
          screenAnomaly.x,
          screenAnomaly.y,
          screenR * 1.4
        );

        if (activeDataLayer === 'DISSOLVED_OXYGEN') {
          layerGrad.addColorStop(0, 'rgba(239, 68, 68, 0.35)'); // Severe hypoxia (red)
          layerGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.22)');
          layerGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
        } else if (activeDataLayer === 'TEMPERATURE') {
          layerGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)'); // Thermal anomaly
          layerGrad.addColorStop(0.6, 'rgba(234, 88, 12, 0.2)');
          layerGrad.addColorStop(1, 'rgba(14, 165, 233, 0.0)');
        } else if (activeDataLayer === 'TURBIDITY') {
          layerGrad.addColorStop(0, 'rgba(217, 119, 6, 0.4)'); // Sediment plume
          layerGrad.addColorStop(0.6, 'rgba(180, 83, 9, 0.2)');
          layerGrad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
        } else {
          // General Anomaly Probability
          layerGrad.addColorStop(0, 'rgba(252, 163, 17, 0.4)');
          layerGrad.addColorStop(0.7, 'rgba(252, 163, 17, 0.15)');
          layerGrad.addColorStop(1, 'rgba(20, 33, 61, 0.0)');
        }

        ctx.fillStyle = layerGrad;
        ctx.beginPath();
        ctx.arc(screenAnomaly.x, screenAnomaly.y, screenR * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Anomaly Regions & Pulse Contours
      if (mapSettings.showAnomalies && env.anomalyRegion.active) {
        const screenAnomaly = worldToScreen(
          env.anomalyRegion.centerSimX,
          env.anomalyRegion.centerSimZ,
          width,
          height
        );
        const screenR = env.anomalyRegion.radiusM * zoom;

        // Concentric pulse waves
        const pulse = (waveOffset * 30) % screenR;
        ctx.strokeStyle = 'rgba(252, 163, 17, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(screenAnomaly.x, screenAnomaly.y, pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Main outer boundary
        ctx.strokeStyle = 'rgba(252, 163, 17, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(screenAnomaly.x, screenAnomaly.y, screenR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Anomaly Label Tag
        ctx.fillStyle = '#FCA311';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          `ANOMALY REGION [R: ${env.anomalyRegion.radiusM.toFixed(0)}m]`,
          screenAnomaly.x,
          screenAnomaly.y - screenR - 6
        );
        ctx.textAlign = 'left';
      }

      // 7. Survey Coverage Trail Swath (Real Track Recorded)
      if (mapSettings.showSurveyTrail && surveyTrail.length > 1) {
        // Draw sensor coverage swath (50m width)
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
        ctx.lineWidth = Math.max(4, 50 * zoom);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        surveyTrail.forEach((pt, idx) => {
          const s = worldToScreen(pt.x, pt.z, width, height);
          if (idx === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        });
        ctx.stroke();

        // High-precision centerline
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        surveyTrail.forEach((pt, idx) => {
          const s = worldToScreen(pt.x, pt.z, width, height);
          if (idx === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        });
        ctx.stroke();
      }

      // 8. Mission Route & Waypoints
      if (mapSettings.showWaypoints && waypoints.length > 0) {
        // Route Line
        ctx.strokeStyle = 'rgba(252, 163, 17, 0.6)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([8, 5]);
        ctx.beginPath();
        waypoints.forEach((wp, idx) => {
          const s = worldToScreen(wp.lat * 1000, wp.lon * 1000, width, height);
          if (idx === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Waypoint Markers
        waypoints.forEach((wp, idx) => {
          const s = worldToScreen(wp.lat * 1000, wp.lon * 1000, width, height);
          const isCurrent = vehicle.currentWaypointIndex === idx;

          // Pulse ring for current active target waypoint
          if (isCurrent) {
            const beaconR = 12 + Math.sin(waveOffset * 3) * 4;
            ctx.strokeStyle = 'rgba(252, 163, 17, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(s.x, s.y, beaconR, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Waypoint node circle
          ctx.fillStyle = wp.reached ? '#14213D' : isCurrent ? '#FCA311' : '#1e293b';
          ctx.strokeStyle = wp.reached ? '#22c55e' : '#FCA311';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Waypoint Label & Info
          ctx.fillStyle = isCurrent ? '#FFFFFF' : '#E5E5E5';
          ctx.font = isCurrent ? 'bold 10px monospace' : '9px monospace';
          const tag = `WP${idx.toString().padStart(2, '0')}`;
          ctx.fillText(tag, s.x + 9, s.y + 3);
        });
      }

      // 9. Existing Reference Systems Layer (Argo, Saildrone, Wave Glider, Moored Buoy)
      if (mapSettings.showExistingSystems) {
        COMPETITOR_SYSTEMS.forEach((comp) => {
          const s = worldToScreen(comp.simCoords[0], comp.simCoords[2], width, height);
          const isHovered = hoveredCompetitor?.id === comp.id;

          // Base halo
          ctx.fillStyle = isHovered ? 'rgba(252, 163, 17, 0.25)' : 'rgba(59, 130, 246, 0.12)';
          ctx.beginPath();
          ctx.arc(s.x, s.y, isHovered ? 14 : 9, 0, Math.PI * 2);
          ctx.fill();

          // Marker Symbol based on type
          ctx.strokeStyle = isHovered ? '#FCA311' : '#94a3b8';
          ctx.fillStyle = isHovered ? '#FCA311' : '#0f172a';
          ctx.lineWidth = 1.5;

          if (comp.id === 'argo-float') {
            // Hexagon for profiling float
            ctx.beginPath();
            for (let a = 0; a < 6; a++) {
              const angle = (a * Math.PI) / 3;
              const hx = s.x + Math.cos(angle) * 7;
              const hy = s.y + Math.sin(angle) * 7;
              if (a === 0) ctx.moveTo(hx, hy);
              else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else if (comp.id === 'commercial-usv') {
            // Diamond for Saildrone USV
            ctx.beginPath();
            ctx.moveTo(s.x, s.y - 8);
            ctx.lineTo(s.x + 6, s.y);
            ctx.lineTo(s.x, s.y + 8);
            ctx.lineTo(s.x - 6, s.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else {
            // Circle with anchor/cross for Moorings / Research Vessels
            ctx.beginPath();
            ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }

          // Label
          ctx.fillStyle = isHovered ? '#FFFFFF' : '#94a3b8';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`[REF] ${comp.name.split(' ')[0]}`, s.x + 10, s.y + 3);
        });
      }

      // 10. O-TREX Autonomous Marine Vessel Icon & Dynamics
      const sVehicle = worldToScreen(vehicle.simX, vehicle.simZ, width, height);
      const headingRad = ((vehicle.headingDeg - 90) * Math.PI) / 180;

      // Subsurface Pod Winch Profiling Sonar Rings
      if (pod.depthCurrentM > 0.5) {
        const podPingR = 20 + ((waveOffset * 25) % 35);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sVehicle.x, sVehicle.y, podPingR, 0, Math.PI * 2);
        ctx.stroke();

        // Vertical Profiling depth tag
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`PROFILING: -${pod.depthCurrentM.toFixed(1)}m [${pod.status}]`, sVehicle.x + 18, sVehicle.y - 12);
      }

      // Dual-Hull Hydrodynamic Foam Wake
      if (vehicle.speedKnots > 0.3) {
        const wakeLength = Math.min(60, vehicle.speedKnots * 14);
        const sternAngle = headingRad + Math.PI;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Port hull wake
        const pwx = sVehicle.x + Math.cos(sternAngle - 0.25) * 6;
        const pwy = sVehicle.y + Math.sin(sternAngle - 0.25) * 6;
        ctx.moveTo(pwx, pwy);
        ctx.lineTo(pwx + Math.cos(sternAngle - 0.15) * wakeLength, pwy + Math.sin(sternAngle - 0.15) * wakeLength);
        // Starboard hull wake
        const swx = sVehicle.x + Math.cos(sternAngle + 0.25) * 6;
        const swy = sVehicle.y + Math.sin(sternAngle + 0.25) * 6;
        ctx.moveTo(swx, swy);
        ctx.lineTo(swx + Math.cos(sternAngle + 0.15) * wakeLength, swy + Math.sin(sternAngle + 0.15) * wakeLength);
        ctx.stroke();
      }

      // Draw O-TREX Vessel Body (High-Res Vector Catamaran)
      ctx.save();
      ctx.translate(sVehicle.x, sVehicle.y);
      ctx.rotate(headingRad + Math.PI / 2);

      // Port & Starboard Twin Hulls
      ctx.fillStyle = '#14213D'; // Navy hull
      ctx.strokeStyle = '#FCA311'; // Orange outline
      ctx.lineWidth = 1.5;

      // Left hull
      ctx.beginPath();
      ctx.roundRect(-10, -16, 5, 32, 2);
      ctx.fill();
      ctx.stroke();

      // Right hull
      ctx.beginPath();
      ctx.roundRect(5, -16, 5, 32, 2);
      ctx.fill();
      ctx.stroke();

      // Central Solar Deck & Crossbeams
      ctx.fillStyle = '#FCA311'; // Solar array Orange
      ctx.fillRect(-6, -10, 12, 20);

      // Sensor Tower & Winch Spool
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      // Forward Bow Direction Vector Arrow
      ctx.strokeStyle = '#FCA311';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(0, -28);
      ctx.lineTo(-3, -24);
      ctx.moveTo(0, -28);
      ctx.lineTo(3, -24);
      ctx.stroke();

      ctx.restore();

      // Vehicle HUD Status Callout Tag
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`O-TREX [${vehicle.speedKnots.toFixed(1)} kt · ${vehicle.headingDeg.toFixed(0)}°]`, sVehicle.x + 16, sVehicle.y + 4);

      // 11. Interactive Distance Measurement Tool Overlay
      if (mapSettings.measureMode && measurePoints.length > 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);

        const p1 = worldToScreen(measurePoints[0].x, measurePoints[0].z, width, height);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 5, 0, Math.PI * 2);
        ctx.fill();

        if (measurePoints.length === 2) {
          const p2 = worldToScreen(measurePoints[1].x, measurePoints[1].z, width, height);
          ctx.beginPath();
          ctx.arc(p2.x, p2.y, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Calculate real Euclidean distance & bearing
          const dx = measurePoints[1].x - measurePoints[0].x;
          const dz = measurePoints[1].z - measurePoints[0].z;
          const distM = Math.hypot(dx, dz);
          const bearingDeg = (Math.atan2(dx, dz) * (180 / Math.PI) + 360) % 360;

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(
            `DIST: ${(distM / 1000).toFixed(2)} km  ·  BRG: ${bearingDeg.toFixed(0)}°`,
            midX + 8,
            midY - 8
          );
        }
        ctx.setLineDash([]);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    vehicle,
    pod,
    env,
    waypoints,
    activeDataLayer,
    mapSettings,
    surveyTrail,
    measurePoints,
    viewCenter,
    zoom,
    hoveredCompetitor,
    worldToScreen,
    screenToWorld
  ]);

  // Compute Dynamic Scale Bar text & pixel width
  const getScaleBar = () => {
    // We want a bar that is roughly 80 to 160 pixels wide
    const targetPx = 100;
    const targetMeters = targetPx / zoom;
    let roundedMeters = 1000;

    if (targetMeters > 15000) roundedMeters = 25000;
    else if (targetMeters > 7500) roundedMeters = 10000;
    else if (targetMeters > 3500) roundedMeters = 5000;
    else if (targetMeters > 1500) roundedMeters = 2000;
    else if (targetMeters > 750) roundedMeters = 1000;
    else if (targetMeters > 350) roundedMeters = 500;
    else roundedMeters = 100;

    const barPixelWidth = roundedMeters * zoom;
    const label = roundedMeters >= 1000 ? `${(roundedMeters / 1000).toFixed(0)} km` : `${roundedMeters} m`;
    return { width: barPixelWidth, label };
  };

  const scaleBar = getScaleBar();

  return (
    <div className="relative w-full h-full bg-navy-950 overflow-hidden select-none font-sans">
      {/* HTML5 Master 2D Simulation Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${mapSettings.measureMode ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        onContextMenu={handleContextMenu}
      />

      {/* 1. TOP-LEFT GIS INFORMATION BANNER */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
        <div className="bg-navy-950/90 backdrop-blur-md border border-navy-700 rounded-lg p-2.5 shadow-xl flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Radio className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>2D OPEN-OCEAN MISSION RADAR</span>
          </div>
          <span className="text-[10px] bg-navy-900 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">
            1:1 REAL COORDINATE SCALE
          </span>
          <span className="text-[10px] text-gray-400 hidden sm:inline">
            RIGHT-CLICK MAP TO ADD WAYPOINTS
          </span>
        </div>

        {/* Live Cursor Lat/Lon Telemetry */}
        <div className="bg-navy-950/80 backdrop-blur-md border border-navy-800 rounded px-2 py-1 text-[10px] text-gray-300 w-fit flex items-center gap-2">
          <span>CURSOR: [{(mouseWorldPos.x / 1000).toFixed(2)}k, {(mouseWorldPos.z / 1000).toFixed(2)}k]</span>
          <span>·</span>
          <span>GPS: {formatLatLon(-65.25 + mouseWorldPos.x * 0.0001, 120.4 + mouseWorldPos.z * 0.0001)}</span>
        </div>
      </div>

      {/* 2. TOP-RIGHT COMPASS & NORTH HEADING */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10 pointer-events-none">
        <div className="bg-navy-950/90 backdrop-blur-md border border-navy-700 rounded-lg p-2 shadow-xl flex items-center gap-2 text-xs">
          <div className="relative w-8 h-8 rounded-full border border-orange-500/40 flex items-center justify-center bg-navy-900">
            <span className="absolute top-0 text-[8px] font-bold text-orange-400">N</span>
            <Compass
              className="w-5 h-5 text-orange-400"
              style={{ transform: `rotate(${vehicle.headingDeg}deg)` }}
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-gray-400 font-sans">VESSEL HDG</span>
            <span className="font-extrabold text-white text-sm">
              {vehicle.headingDeg.toFixed(0).padStart(3, '0')}°
            </span>
          </div>
        </div>
      </div>

      {/* 3. FLOATING MAP NAVIGATION TOOLBAR */}
      <div className="absolute top-16 right-3 flex flex-col gap-1.5 z-10">
        <div className="bg-navy-900/95 backdrop-blur-md border border-navy-700 rounded-lg p-1 shadow-2xl flex flex-col gap-1 text-gray-300">
          <button
            onClick={() => handleZoom(1.3)}
            className="p-1.5 rounded hover:bg-navy-800 hover:text-white transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4 text-orange-400" />
          </button>
          <button
            onClick={() => handleZoom(0.75)}
            className="p-1.5 rounded hover:bg-navy-800 hover:text-white transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4 text-orange-400" />
          </button>
          <div className="w-full h-px bg-navy-700" />
          <button
            onClick={handleCenterVehicle}
            className={`p-1.5 rounded transition-colors ${mapSettings.autoFollow ? 'bg-orange-500 text-navy-950 font-bold' : 'hover:bg-navy-800 hover:text-white'}`}
            title="Center & Follow O-TREX"
          >
            <Navigation className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitMission}
            className="p-1.5 rounded hover:bg-navy-800 hover:text-white transition-colors"
            title="Fit Entire 10km Mission Sector"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-navy-700" />
          <button
            onClick={() => toggleMapSetting('showGrid')}
            className={`p-1.5 rounded transition-colors ${mapSettings.showGrid ? 'bg-navy-800 text-orange-400 font-bold' : 'hover:bg-navy-800 text-gray-500'}`}
            title="Toggle Nautical Coordinate Grid"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleMapSetting('showExistingSystems')}
            className={`p-1.5 rounded transition-colors ${mapSettings.showExistingSystems ? 'bg-navy-800 text-orange-400 font-bold' : 'hover:bg-navy-800 text-gray-500'}`}
            title="Toggle Reference Ocean Systems (Argo, Saildrone, Moorings)"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              toggleMapSetting('measureMode');
              if (mapSettings.measureMode) clearMeasurement();
            }}
            className={`p-1.5 rounded transition-colors ${mapSettings.measureMode ? 'bg-red-600 text-white font-bold' : 'hover:bg-navy-800 text-gray-300'}`}
            title="Distance Measurement Tool (Click 2 points)"
          >
            <Ruler className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. DYNAMIC SCALE BAR & METRIC RULER */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none flex flex-col gap-1">
        <div className="bg-navy-950/85 backdrop-blur-md border border-navy-700 rounded px-2 py-1 text-[10px] text-gray-300 w-fit flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-[9px] text-orange-400 font-bold">
            <span>0</span>
            <span>{scaleBar.label}</span>
          </div>
          <div
            className="h-1.5 bg-orange-400 rounded-sm border border-navy-900 shadow-sm"
            style={{ width: `${scaleBar.width}px`, minWidth: '40px' }}
          />
        </div>
      </div>

      {/* 5. INTERACTIVE EXISTING SYSTEM DETAIL CARD (When clicked on map) */}
      {selectedSystemCard && (
        <div className="absolute top-16 left-4 z-30 max-w-sm w-full bg-navy-900 border border-navy-700 rounded-xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between border-b border-navy-800 pb-2 mb-3">
            <div>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                EXISTING REFERENCE PLATFORM
              </span>
              <h3 className="text-sm font-extrabold text-white">{selectedSystemCard.name}</h3>
              <p className="text-[11px] text-gray-400">{selectedSystemCard.classType}</p>
            </div>
            <button
              onClick={() => setSelectedSystemCard(null)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs text-gray-300 mb-4">
            <div>
              <span className="text-gray-400 font-sans text-[10px]">OPERATIONAL ROLE:</span>
              <p className="text-gray-200 mt-0.5 text-[11px] leading-relaxed">
                {selectedSystemCard.role}
              </p>
            </div>
            <div>
              <span className="text-gray-400 font-sans text-[10px]">O-TREX DIFFERENTIATION:</span>
              <p className="text-orange-300/90 mt-0.5 text-[11px] leading-relaxed">
                {selectedSystemCard.otrexDifferentiation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-navy-800">
            <button
              onClick={() => {
                selectCompetitor(selectedSystemCard.id);
                openModal('COMPETITORS');
              }}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-navy-950 font-extrabold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>FULL COMPARISON</span>
            </button>
            <a
              href={selectedSystemCard.costModel.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-navy-950 hover:bg-navy-800 text-gray-300 border border-navy-700 py-1.5 px-2 rounded-lg text-xs flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>SOURCE</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
