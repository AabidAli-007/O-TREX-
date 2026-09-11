# O-TREX — Oceanic Tracking & Responsive eXplorer

**Autonomous Low-Cost Ocean Observation Platform for Polar and Southern Oceans**  
**Smart India Hackathon 2026** | **Problem Statement ID:** SIH26065  
**Team:** CODE ZEPHYRA  

---

## 🌊 Executive Summary

**O-TREX** (*Oceanic Tracking & Responsive eXplorer*) is an autonomous marine robotics digital twin and mission simulation platform designed for persistent, low-cost oceanographic monitoring in extreme environments like the Polar and Southern Oceans.

Traditional ocean observation suffers from a severe trade-off:
1. **Crewed Oceanographic Research Vessels** provide comprehensive deep-sea sampling but incur prohibitive operating costs of **$25,000 to $60,000+ per day**, creating high carbon emissions and limited spatial persistence.
2. **Argo Profiling Floats** provide valuable global baseline profiles but drift passively with ocean currents without surface mobility or adaptive targeting.
3. **Commercial USVs (e.g. Saildrone)** offer high surface endurance but rely on enterprise managed-service contracts without accessible, open-architecture targeted vertical profiling.

**O-TREX bridges this gap** by combining:
- **Autonomous Solar-Powered Catamaran Surface Navigation**
- **Continuous 6-Channel Surface Ocean Telemetry**
- **Onboard Edge AI (TensorFlow Lite) Anomaly Detection**
- **Autonomous Micro-Winch Vertical Column Profiling (0–50m+)**
- **Tiered Multi-Bearer Priority Data Transmission (LoRa / Iridium Satellite)**
- **Explainable Multi-Criteria Decision Engine**

---

## 🚀 Key Features of the Interactive Simulator

- **Interactive 3D Ocean Scene (Three.js & R3F):** Procedural Gerstner waves, underwater light attenuation, plankton drift, ocean current vectors, and dynamic vessel physics (pitch, roll, yaw heave).
- **Physical 3D Models:**
  - **O-TREX Catamaran:** Twin yellow/navy wave-piercing hulls, solar array, avionics dome, dual BLDC thrusters, sensor mast, and winch spool.
  - **Subsurface Sensor Pod:** Active winch tether line, descent/retraction kinematics, and glowing sensor heads.
  - **Competitor Systems:** Manned Research Ship, Argo Float, Saildrone USV, and Moored Ocean Buoy.
- **Explainable Decision Engine HUD:** Multi-criteria utility evaluation ($\text{Utility} = f(\text{Science}, \text{Anomaly}, \text{Battery}, \text{Comms}, \text{Safety})$) with human-readable rationale.
- **Real-Time Scientific Charts (Recharts):** Live time-series streams (Temp, DO, Turbidity, Salinity, Battery) and vertical depth profile casts (Thermocline, Oxycline, Halocline).
- **Interactive Hardware Explorer:** Exploded 3D/2D breakdown of all 12 subsystems with verified public prices, datasheets, and bus interfaces.
- **Sensor Pod Deep-Dive:** Stacked assembly breakdown of all 6 transducers (Temp, Conductivity, Optical DO, Bar30 Depth, pH, Turbidity).
- **Provisional Prototype BOM Estimator:** Editable component-level costs, live USD/INR conversions, contingency slider, and CSV export.
- **2-Minute Guided Judge Tour:** 10-step automated hackathon grand jury evaluation sequence.
- **Fail-Safe Testing Mode:** Inject GNSS loss, comms blackout, sensor drift, low battery, and winch motor faults.
- **Data Analytics & Export:** Statistical summary (Mean, StdDev, Min, Max) with instant CSV/JSON mission log downloads.

---

## 🛠️ Hardware & Software Architecture

### Hardware BOM Baseline (~$3,150 Prototype Build Cost)
| Subsystem | Component / Specification | Role | Provenance |
|---|---|---|---|
| **Autopilot** | Holybro Pixhawk 6C (STM32H743) | Autonomous waypoint navigation & ESC control | Verified Public ($165.99) |
| **Compute** | Raspberry Pi 4 Model B (8GB RAM) | Edge AI, ROS 2 nodes & Winch coordinator | Verified Public ($85.00) |
| **GNSS** | u-blox ZED-F9P Multi-Band RTK | Centimeter positioning & heading | Verified Public ($220.00) |
| **Propulsion** | Blue Robotics T200 BLDC Thrusters (Pair) | Differential thrust & station keeping | Verified Public ($398.00) |
| **Solar Deck** | 120W Marine Monocrystalline ETFE Array | Continuous energy harvesting | Engineering Estimate ($180.00) |
| **Battery** | 48V 30Ah (1440Wh) LiFePO4 + Smart BMS | Central power buffer & energy telemetry | Engineering Estimate ($480.00) |
| **Winch** | BLDC Planetary Winch + 100m Micro-Tether | Vertical sensor pod deployment (0.4 m/s) | Project Design Spec ($350.00) |
| **Sensor Pod** | 6-Parameter Cluster (Temp, EC, DO, Bar30, pH, Turbidity) | Multi-depth water column profiling | Verified Public ($650.00) |
| **Comms** | LoRa SX1262 (15km) + Iridium 9603 SBD Satellite | Tiered local & global prioritized telemetry | Verified Public ($260.00) |
| **Structure** | Wave-Piercing Catamaran Hulls (1.25m) + IP68 Bay | High roll stability & waterproof sealing | Project Design Spec ($465.00) |

### Software Stack
- **Operating System:** Ubuntu Linux 22.04 LTS + Docker Containerization
- **Robotics Middleware:** ROS 2 Humble (rclpy & MAVLink telemetry bridge)
- **Edge AI / ML:** TensorFlow Lite anomaly detector (multivariate z-score model)
- **Database & Telemetry:** InfluxDB time-series engine + Grafana dashboards
- **Ground Control:** QGroundControl mission planner

---

## 📐 Mathematical & Simulation Models

### 1. Ocean Depth Stratification (Thermocline & Oxycline)
$$T(z) = T_{\text{deep}} + \frac{T_{\text{surf}} - T_{\text{deep}}}{1 + \exp\left(\frac{z - z_{\text{therm}}}{w_t}\right)}$$
$$P(z) = 1.01325 + 0.1007 \cdot z \quad (\text{dbar})$$

### 2. Multi-Variate Anomaly Scoring (TF-Lite Edge Simulator)
$$\text{Anomaly Score} = \min\left(1.0, \sum_{i=1}^N w_i \cdot \frac{|x_i - \mu_i|}{\sigma_i}\right)$$
- $0.00 - 0.39$: **NORMAL**
- $0.40 - 0.69$: **WATCH**
- $0.70 - 0.89$: **ANOMALY** (Trigger Alert)
- $0.90 - 1.00$: **CRITICAL** (Mandatory Profiling Investigation)

### 3. Dynamic Power Budget & Battery SOC Integration
$$P_{\text{net}} = P_{\text{solar}} - (P_{\text{propulsion}} + P_{\text{compute}} + P_{\text{winch}} + P_{\text{comms}} + P_{\text{sensors}})$$
$$\Delta \text{SOC} = \frac{P_{\text{net}} \cdot \Delta t}{E_{\text{capacity}}} \times 100\%$$

---

## 🏃 How to Run the Simulator

### Prerequisites
- Node.js 18+ (Tested on v24.18.0)
- npm 9+

### Commands
```bash
# 1. Install dependencies
npm.cmd install

# 2. Run automated unit tests
npm.cmd test

# 3. Start local interactive development server
npm.cmd run dev

# 4. Build optimized production bundle
npm.cmd run build
```

---

## 🎯 90-Second "WOW" Demo Script for Evaluators

1. **Launch:** Open the simulator and click **"START GUIDED JUDGE TOUR (2-MIN)"** or **"RUN DEMO MISSION"**.
2. **Observe Surface Patrol:** Watch O-TREX navigate along waypoint transects with live wave response and streaming surface charts.
3. **Trigger Anomaly:** Click **"TRIGGER ANOMALY"** to inject a localized hypoxia/temperature front.
4. **Inspect AI & Decision:** Watch the Edge AI Anomaly Score rise to **0.88** and the Decision Banner pop up with explainable reasoning (*"Scientific value: HIGH + Battery: 88% → DEPLOY SENSOR POD"*).
5. **Watch Vertical Profiling:** See the winch deploy the sensor pod down to **35m**, live depth profile charts populating in real time.
6. **Prioritized Comms:** See the P1 Critical anomaly packet uplinked via simulated Satellite link.
7. **Inspect Hardware & Competitors:** Click O-TREX to view the 12-subsystem exploded hardware view, click the Competitor platforms to inspect NOAA ship day rates ($59k/day) and Argo float comparisons, and open the editable BOM calculator.

---

## 📜 Scientific Provenance & References
- **NOAA IOOS & OMAO:** Research vessel historical operational rates ($25k–$59k/day)
- **Argo International Program (UCSD / Scripps):** Float lifecycle economics & profiling cycle
- **Holybro & PX4:** Pixhawk 6C flight controller specifications & MSRP ($165.99)
- **Blue Robotics:** T200 thrusters & Bar30 depth sensor catalog
- **Atlas Scientific:** OEM environmental sensor kits (DO, EC, pH, Temp)
- **SIH26065 Brief:** Ministry of Earth Sciences / NIOT polar ocean observation benchmark

---
*Built with passion by **TEAM CODE ZEPHYRA** for **Smart India Hackathon 2026**.*
