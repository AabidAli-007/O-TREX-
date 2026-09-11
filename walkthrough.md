# O-TREX 2D Ocean Mission Control & GIS Simulation System

## Overview
Upgraded the **O-TREX** (*Oceanic Tracking & Responsive eXplorer*) application from an unreliable 3D viewport into a **high-precision, professional 2D Marine Robotics Mission Control & GIS Ocean Simulation Platform** specifically tailored for Smart India Hackathon 2026 (Problem Statement **SIH26065: Autonomous Low-Cost Ocean Observation Platform for Polar & Southern Oceans**).

---

## Key System Upgrades & Architecture

### 1. High-Performance 2D Ocean Simulation Canvas (`src/components/2d/OceanCanvas2D.tsx`)
- **Multi-Kilometer Coordinate Space**: Real 1:1 metric coordinate space supporting continuous travel across large $10\text{ km} \times 10\text{ km}+$ open-ocean sectors.
- **High-DPI Retina Rendering**: Automatic `window.devicePixelRatio` scaling ensuring crisp lines and text at 1080p, 1440p, and 4K resolutions.
- **Smooth Viewport Navigation**: Smooth mouse drag (pan), wheel zoom ($0.015\times$ to $2.5\times$ scaling from 500m up to 100km), and damped auto-follow tracking.
- **Marine Bathymetric Visuals**: Deep nautical blues (`#081222`, `#0c1a2f`), subtle animated wave ripples, bathymetric isobaths, and dynamic geographic coordinate grids (1km major / 250m minor).
- **O-TREX Vector Graphic & Stern Wake**: Dual-hull catamaran representation with solar array deck in Orange (`#FCA311`) & Navy (`#14213D`), rotating with heading degrees (`vehicle.headingDeg`), and dual-hull hydrodynamic foam wake scaling with speed.
- **Survey Coverage Area**: Accumulates and renders the continuous swath area ($50\text{m}$ width) swept by O-TREX's sensors during its voyage.
- **Subsurface Pod Profiling Indicator**: Animated sonar ping rings and real-time depth tag (`PROFILING: -35.0m / -50.0m [LOWERING]`) emitted when the winch is lowered.
- **Existing Systems Reference Layer**: Renders distinct marine GIS symbols for:
  - 🟣 **Argo Float (UCSD / Euro-Argo)** (Autonomous profiling float)
  - 🔵 **Saildrone Explorer** (Autonomous surface drone)
  - 🟢 **Wave Glider** (Wave-propelled USV)
  - 🟡 **Moored Ocean Buoy (OceanSITES)** (Fixed ocean observatory)
  - 🚢 **Research Vessel Track** (Crewed NOAA-class ship)
  - Interactive click-to-view detail card with role descriptions, O-TREX differentiators, and official reference links.
- **Interactive Measurement Tool**: Click any 2 points on the ocean to compute true Euclidean distance ($km$) and bearing ($^\circ$).
- **Dynamic Scale Bar & Compass Rose**: Self-recalculating metric scale bar ($100\text{m}$, $500\text{m}$, $1\text{ km}$, $2\text{ km}$, $5\text{ km}$, $10\text{ km}$, $25\text{ km}$) and compass rose.

---

### 2. Left Panel — Mission & Autonomous Navigation (`src/components/hud/MissionNavPanel.tsx`)
- **Mission Overview & Scenario Presets**: Quick switching between Polar Ocean (SIH26065), Hypoxia Dead Zone, Turbidity Plume, Baseline Transect, and Satellite Blackout.
- **Range & Travel Distance**: Live metrics for Distance Travelled ($km$), Sim Target Range ($25.0\text{ km}$), Distance to active waypoint, and Distance to Base Station ($0,0$).
- **Pilot Mode Switch**: Instant toggle between `AUTONOMOUS (Route Following)` and `MANUAL (WASD Control)`.
- **Waypoints Manager**: Add Waypoint, Delete Waypoint, Clear Route, Follow Route, and Return to Base ($0,0$).
- **Edge Anomaly Detection**: Anomaly score ($0.00 - 1.00$), severity indicator (`NORMAL`, `WATCH`, `ANOMALY`, `CRITICAL`), and `INJECT SYNTHETIC ANOMALY` trigger button.
- **Explainable Science Opportunity Engine**: Science Opportunity Score ($0.82$), actionable decision recommendations, and explainable multi-factor rationale.
- **Scientific Data Layer Switcher**: Toggleable heatmaps for Temperature, Salinity, Dissolved Oxygen (Hypoxia), Turbidity (NTU), and Anomaly Probability.

---

### 3. Right Panel — Live Oceanographic Telemetry & Systems (`src/components/hud/LiveTelemetryPanel.tsx`)
- **Vehicle Dynamics**: SOG ($kt$), Compass Heading ($^\circ$), Pitch & Roll tilt ($^\circ$), Throttle & Rudder percentages, GNSS Lock status, and GPS coordinates.
- **Power & Energy Flux**: Battery SOC (%) with color progress bar, Battery Voltage ($V$), Solar Harvest ($W$), Propulsion Draw ($W$), and Net Power Flux ($+42.4\text{W}$).
- **Surface CTD Sensors**: Water Temperature ($^\circ\text{C}$), Salinity ($PSU$), Dissolved Oxygen ($mg/L$), Turbidity ($NTU$), Pressure ($dbar$), $pH$, and data quality flag.
- **Subsurface Sensor Pod (0–100m)**: Live Depth, Target Depth, Status (`READY`, `DEPLOYING`, `PROFILING`, `HOLDING`, `RETRACTING`), and quick action buttons (`50m`, `HOLD`, `STOW`).
- **Real-Time Vertical Profile Depth Graph**: Real SVG depth curve plotting CTD data points as the pod descends from 0 to 100 meters.
- **Tiered Communications & Store-and-Forward**: Live bearer status (`SATELLITE`, `LORA`, `OFFLINE`), queued packet buffer, transmitted total ($KB$), and interactive `SIMULATE COMMS OUTAGE` button.

---

### 4. Bottom Control Bar (`src/components/layout/BottomControlBar.tsx`)
- Interactive on-screen WASD directional pad with live active key feedback.
- `BOOST (SHIFT)` and `RECENTER (R)` triggers.
- Essential central kinematics readouts (SOG, HDG, DIST, POD DEPTH).
- Quick Pod Winch triggers (`DEPLOY POD 50m`, `HOLD DEPTH`, `RETRACT POD`).
- Safety triggers: `RETURN HOME` and `E-STOP (SPACE)`.

---

### 5. Verification & Test Results
- `npm.cmd test -- --run`: **5/5 tests passed** (pure model functions verified).
- `npm.cmd run build`: **0 TypeScript errors, clean production bundle generated** (bundle size reduced from 1,743 kB to 798 kB, >54% lighter!).
- Vite dev server running at `http://localhost:5173/`.
