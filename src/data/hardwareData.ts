import { HardwareSubsystem, PodSensorInfo, BOMItem } from '../types/hardware';

export const HARDWARE_SUBSYSTEMS: HardwareSubsystem[] = [
  {
    id: 'pixhawk',
    name: 'Pixhawk 6C Autopilot',
    category: 'AUTOPILOT',
    role: 'Primary Flight / Navigation Controller',
    specs: [
      'STM32H743 32-bit Arm Cortex-M7 @ 480 MHz',
      'Dual redundant IMUs (ICM-42688-P, ICM-20649)',
      'High-precision Barometer (BMP388)',
      'PX4 / ArduPilot Marine Autonomous Navigation firmware'
    ],
    interfaceBus: 'CAN bus, UART, I2C, SPI, PWM',
    powerRole: 'Power draw ~2.5 W @ 5V DC via isolated power module',
    whyOtrexUsesIt:
      'Provides high-reliability fail-safe waypoint navigation, attitude estimation, compass heading integration, and thruster vector control in marine environments.',
    estCostUsd: 165.99,
    estCostInr: 14100,
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    sourceTitle: 'Holybro Pixhawk 6C Official Store',
    sourceUrl: 'https://holybro.com/products/pixhawk-6c',
    realImageUrl: 'https://cdn.shopify.com/s/files/1/0609/8324/7099/products/Pixhawk6C_1024x1024.jpg?v=1661245051',
    hotspot3D: [0, 0.45, 0.2],
    notes: 'Holybro manufacturer retail listing. Excludes local customs duty & GST in India.'
  },
  {
    id: 'rpi4',
    name: 'Raspberry Pi 4 Companion Computer',
    category: 'COMPUTE',
    role: 'High-Level Ocean Compute, AI/ML & Winch Manager',
    specs: [
      'Broadcom BCM2711, Quad-core Cortex-A72 @ 1.5 GHz',
      '8 GB LPDDR4-3200 SDRAM',
      'Ubuntu Linux 22.04 LTS + ROS 2 Humble + Docker',
      'TensorFlow Lite anomaly detection pipeline & InfluxDB logging'
    ],
    interfaceBus: 'Gigabit Ethernet, USB 3.0, UART to Pixhawk (MAVLink), I2C to ADC',
    powerRole: 'Nominal draw 4.0 - 7.5 W @ 5V 3A DC',
    whyOtrexUsesIt:
      'Executes edge AI anomaly detection algorithms, coordinates winch motor microstepping, runs ROS 2 nodes, compresses telemetry packets, and manages multi-bearer comms.',
    estCostUsd: 75.0,
    estCostInr: 6375,
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    sourceTitle: 'Raspberry Pi Foundation Official 8GB Model',
    sourceUrl: 'https://www.raspberrypi.com/products/raspberry-pi-4-model-b/',
    realImageUrl: 'https://www.raspberrypi.com/app/uploads/2021/04/Raspberry-Pi-4-Hero-1-scaled.jpg',
    hotspot3D: [0, 0.45, -0.2],
    notes: 'Official MSRP baseline. Subject to component distributor availability.'
  },
  {
    id: 'gnss',
    name: 'u-blox ZED-F9P High-Precision GNSS',
    category: 'AUTOPILOT',
    role: 'Centimeter-Grade Satellite Positioning & Heading',
    specs: [
      'Multi-band RTK GNSS (GPS, GLONASS, Galileo, BeiDou)',
      'Sub-meter autonomous accuracy / RTK float capability',
      'Integrated active helix marine antenna'
    ],
    interfaceBus: 'UART / USB / I2C (UBX protocol)',
    powerRole: '0.35 W @ 3.3V DC',
    whyOtrexUsesIt:
      'Guarantees accurate geo-referenced sensor readings, polar drift tracking, and tight waypoint holding even under strong ocean currents.',
    estCostUsd: 220.0,
    estCostInr: 18700,
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    sourceTitle: 'u-blox F9P GNSS Receiver Reference',
    sourceUrl: 'https://www.u-blox.com/en/product/zed-f9p-module',
    realImageUrl: 'https://content.u-blox.com/sites/default/files/styles/product_detail_hero_desktop/public/2022-09/ZED-F9P_Top_0.png',
    hotspot3D: [0, 0.85, 0.5]
  },
  {
    id: 'solar',
    name: 'Marine-Grade Monocrystalline Solar Deck (120W)',
    category: 'POWER',
    role: 'Continuous Renewable Energy Harvesting',
    specs: [
      'ETFE semi-flexible saltwater-resistant encapsulation',
      'Peak Power: 120W (2x 60W integrated panels on catamaran bridge)',
      'Efficiency: 22.4% SunPower monocrystalline cells',
      'MPPT Solar Charge Controller (98.5% conversion efficiency)'
    ],
    interfaceBus: 'Direct PV DC to MPPT controller',
    powerRole: 'Generates up to 80-110W in open ocean solar conditions',
    whyOtrexUsesIt:
      'Enables perpetual/multi-week autonomous persistence in polar summer and temperate oceans by recharging main battery banks.',
    estCostUsd: 180.0,
    estCostInr: 15300,
    provenanceType: 'ENGINEERING_ESTIMATE',
    sourceTitle: 'Marine ETFE Solar Panel Array Specification',
    sourceUrl: 'https://www.victronenergy.com/solar-charge-controllers',
    realImageUrl: 'https://m.media-amazon.com/images/I/71RkPzL3JLL._AC_SL1500_.jpg',
    hotspot3D: [0, 0.55, 0]
  },
  {
    id: 'battery',
    name: 'Smart LiFePO4 / Li-ion Marine Battery Pack (48V 30Ah / 1440Wh)',
    category: 'POWER',
    role: 'Central Energy Storage & Buffer',
    specs: [
      '1440 Wh total capacity (48V nominal, 30Ah)',
      'Submersible waterproof IP68 aluminum battery canister in lower hull',
      'Operating temperature: -20°C to +50°C (internal thermal insulation)',
      'Over 2,500 cycle life at 80% DoD'
    ],
    interfaceBus: 'CAN bus / SMBus to Smart BMS telemetry',
    powerRole: 'Main power bus (48V), stepped down to 12V and 5V auxiliary buses',
    whyOtrexUsesIt:
      'Provides safe, high energy density power for day/night continuous monitoring, thruster sprints, and deep-profiling winch operations.',
    estCostUsd: 480.0,
    estCostInr: 40800,
    provenanceType: 'ENGINEERING_ESTIMATE',
    sourceTitle: 'Marine LiFePO4 Custom Battery Pack Estimate',
    sourceUrl: 'https://bluerobotics.com/store/power/lithium-battery-pack/',
    realImageUrl: 'https://bluerobotics.com/wp-content/uploads/2016/11/BATTERY-14.8V-18AH-R1-1-600x600.jpg',
    hotspot3D: [0.35, 0.1, 0]
  },
  {
    id: 'bms',
    name: 'Smart CAN-bus Battery Management System (BMS)',
    category: 'POWER',
    role: 'Cell Balancing, Thermal Guard & State-of-Charge Engine',
    specs: [
      '16S LiFePO4 active balancing @ 1.2A',
      'Over-current, under-voltage, over-temperature protection',
      'Real-time Coulomb-counter State of Charge (SOC) estimation',
      'Isolated CAN bus telemetry broadcast to Raspberry Pi'
    ],
    interfaceBus: 'CAN 2.0B / UART',
    powerRole: '<0.5 W parasitic power',
    whyOtrexUsesIt:
      'Feeds exact real-time energy margins to the Decision Engine to prevent battery exhaustion in remote seas.',
    estCostUsd: 95.0,
    estCostInr: 8075,
    provenanceType: 'ENGINEERING_ESTIMATE',
    sourceTitle: 'Smart BMS Telemetry Controller',
    sourceUrl: 'https://dalyelec.com/products/smart-bms',
    realImageUrl: 'https://m.media-amazon.com/images/I/61I2oH8x7mL._AC_SL1500_.jpg',
    hotspot3D: [-0.35, 0.1, 0]
  },
  {
    id: 'thrusters',
    name: 'Dual Brushless Marine Thrusters (Blue Robotics T200 Class)',
    category: 'MECHANICAL',
    role: 'Differential Propulsion & Heading Control',
    specs: [
      'Brushless DC (BLDC) outrunner motors with poly-carbonate propellers',
      'Forward bollard thrust: up to 5.25 kgf (51.5 N) per thruster',
      'Operating voltage: 12V - 24V DC',
      'Sealed resin encapsulation; ceramic shaft bearings for saltwater longevity'
    ],
    interfaceBus: 'PWM / DShot ESC control from Pixhawk',
    powerRole: '20W cruising / up to 350W peak burst per thruster',
    whyOtrexUsesIt:
      'Twin catamaran hull placement enables high maneuverability, station keeping against ocean currents, and agile turning without mechanical rudders.',
    estCostUsd: 398.0, // Pair
    estCostInr: 33830,
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    sourceTitle: 'Blue Robotics T200 Thruster Official Store',
    sourceUrl: 'https://bluerobotics.com/store/thrusters/t100-t200-thrusters/t200-thruster-r2-rp/',
    realImageUrl: 'https://bluerobotics.com/wp-content/uploads/2016/11/T200-THRUSTER-R2-RP-1-600x600.jpg',
    hotspot3D: [-0.55, -0.15, -0.7]
  },
  {
    id: 'winch',
    name: 'Autonomous Vertical Profiling Winch System',
    category: 'MECHANICAL',
    role: 'Precision Deployment & Recovery of Sensor Pod',
    specs: [
      'Brushless planetary gearmotor with magnetic absolute rotary encoder',
      'Waterproof spool with 100m Kevlar-reinforced 4-conductor micro-tether',
      'Active dynamic cable tension load-cell sensor (0-100 N)',
      'Descent speed: 0.2 to 0.5 m/s with auto-brake & slip-ring data transfer'
    ],
    interfaceBus: 'CAN bus / RS485 to companion computer',
    powerRole: '15W lowering / 45W reeling under full payload',
    whyOtrexUsesIt:
      'The signature core innovation: enables targeted on-demand vertical profile sampling from 0 to 50m+ whenever an anomaly is detected.',
    estCostUsd: 350.0,
    estCostInr: 29750,
    provenanceType: 'PROJECT_DESIGN_SPEC',
    sourceTitle: 'O-TREX Custom Winch Mechanism Design Specification',
    sourceUrl: 'https://bluerobotics.com/store/cables-connectors/cables/fathom-tether-slim/',
    realImageUrl: 'https://bluerobotics.com/wp-content/uploads/2016/11/FATHOM-SPOOL-1-600x600.jpg',
    hotspot3D: [0, 0.25, -0.45]
  },
  {
    id: 'sensorpod',
    name: 'Modular Hydrodynamic Underwater Sensor Pod',
    category: 'SENSORS',
    role: 'Multi-Parameter Water Column Profiling Package',
    specs: [
      'Streamlined weighted anodized aluminum / Delrin housing',
      'Depth rated to 100m (tested pressure tolerance)',
      'Integrated sensor manifold with flow-through conductivity cell',
      'Microcontroller payload node (STM32) streaming serialized telemetry via tether'
    ],
    interfaceBus: 'RS-485 / Differential UART over tether line',
    powerRole: '1.8 W total sensor cluster power draw',
    whyOtrexUsesIt:
      'Houses 6 oceanographic sensors in a compact, neutrally stable descent package with minimal drag and rapid thermal response.',
    estCostUsd: 280.0,
    estCostInr: 23800,
    provenanceType: 'PROJECT_DESIGN_SPEC',
    sourceTitle: 'O-TREX Modular Subsurface Pod Specification',
    sourceUrl: 'https://bluerobotics.com/store/watertight-enclosures/3-series/wte3-p-flange-clear-r1/',
    realImageUrl: 'https://bluerobotics.com/wp-content/uploads/2016/11/WTE3-P-FLANGE-CLEAR-R1-1-600x600.jpg',
    hotspot3D: [0, -0.8, -0.45]
  },
  {
    id: 'comms',
    name: 'Multi-Bearer Comms: LoRa 868/915 MHz + Iridium Satellite SBD',
    category: 'COMMUNICATION',
    role: 'Tiered Long-Range Telemetry & Priority Data Transmission',
    specs: [
      'LoRa SX1262 Transceiver: +22dBm output, up to 15km line-of-sight nearshore',
      'Iridium 9603N Short Burst Data (SBD) satellite transceiver for global polar ocean link',
      'Dual active ceramic patch antennas + marine fiberglass whip'
    ],
    interfaceBus: 'SPI / UART to Raspberry Pi',
    powerRole: '0.1W standby / 1.5W LoRa TX / 8W Sat burst TX',
    whyOtrexUsesIt:
      'Implements cost-aware communications: transmits free high-bandwidth LoRa when near shore/gateway, and prioritizes critical anomaly alerts via Satellite when remote.',
    estCostUsd: 260.0,
    estCostInr: 22100,
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    sourceTitle: 'RockBLOCK 9603 Iridium Satellite Transceiver Listing',
    sourceUrl: 'https://www.groundcontrol.com/product/rockblock-9603/',
    realImageUrl: 'https://m.media-amazon.com/images/I/61G4kF-yMhL._AC_SL1200_.jpg',
    hotspot3D: [0.15, 0.9, -0.3]
  },
  {
    id: 'enclosure',
    name: 'IP68 Marine Aluminium & Polycarbonate Electronics Enclosure',
    category: 'STRUCTURE',
    role: 'Central Watertight Equipment Bay with Thermal Dissipation',
    specs: [
      'O-ring dual silicone gasket seal (IP68 certified)',
      'Submersible bulkheads & Wetlink penetrators for all sensor cables',
      'Internal moisture & humidity sensor for early leak detection',
      'Passive aluminum hull heat-sink for companion computer & ESCs'
    ],
    interfaceBus: 'Mechanical / WetLink cable penetrators',
    powerRole: 'Passive protection',
    whyOtrexUsesIt:
      'Safeguards high-value compute, autopilot, and power distribution systems against salt spray, condensation, and rough wave wash.',
    estCostUsd: 145.0,
    estCostInr: 12325,
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    sourceTitle: 'Blue Robotics Watertight Enclosure Series',
    sourceUrl: 'https://bluerobotics.com/store/watertight-enclosures/4-series/',
    realImageUrl: 'https://bluerobotics.com/wp-content/uploads/2016/11/WTE4-P-SERIES-AL-R1-1-600x600.jpg',
    hotspot3D: [0, 0.35, 0]
  },
  {
    id: 'hull',
    name: 'Hydrodynamic Catamaran Twin Hull (Fiberglass / HDPE Composite)',
    category: 'STRUCTURE',
    role: 'Buoyancy, Wave Piercing Stability & Impact Resistance',
    specs: [
      'Length: 1.25 m | Beam: 0.65 m | Draft: 0.18 m',
      'Displacement: 22 kg fully loaded | Reserve Buoyancy: +18 kg',
      'Wave-piercing bow profiles for minimal resistance in Southern Ocean swells',
      'Modular bolt-together carbon-fiber crossbeams'
    ],
    interfaceBus: 'Mechanical structure',
    powerRole: 'Structural / Hydrodynamic',
    whyOtrexUsesIt:
      'Provides superior roll stability compared to monohulls, broad solar deck area, and smooth winching center-of-mass between twin hulls.',
    estCostUsd: 320.0,
    estCostInr: 27200,
    provenanceType: 'PROJECT_DESIGN_SPEC',
    sourceTitle: 'O-TREX Catamaran Platform Structural Fabrication Estimate',
    sourceUrl: 'https://github.com/code-zephyra/o-trex',
    realImageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    hotspot3D: [0, 0, 0]
  }
];

export const POD_SENSORS: PodSensorInfo[] = [
  {
    id: 'temp',
    name: 'Platinum RTD High-Precision Temperature Sensor (PT1000)',
    measures: 'Water Column Temperature',
    unit: '°C',
    range: '-5.0°C to +40.0°C',
    accuracy: '±0.05°C (time constant <0.2s)',
    envMeaning:
      'Detects thermal stratification, thermocline depth, upwelling zones, and thermal fronts critical for climate and polar melt modeling.',
    physicalPrinciple: 'Temperature-dependent electrical resistance of platinum RTD thin film in marine titanium housing.',
    approxCostUsd: 45.0,
    approxCostInr: 3825,
    source: 'Atlas Scientific PT-1000 Class Sensor',
    sourceUrl: 'https://atlas-scientific.com/probes/pt-1000-temperature-probe/',
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    realImageUrl: 'https://atlas-scientific.com/wp-content/uploads/2019/08/pt-1000-temperature-probe.jpg'
  },
  {
    id: 'conductivity',
    name: 'Toroidal / 4-Electrode Electrical Conductivity & Salinity Sensor',
    measures: 'Specific Conductivity & Practical Salinity (PSU)',
    unit: 'mS/cm (derived PSU)',
    range: '0.07 to 70.0 mS/cm (2 to 42 PSU)',
    accuracy: '±1.0% of reading',
    envMeaning:
      'Identifies haloclines, freshwater glacial runoff lenses, river discharge plumes, and water mass boundaries.',
    physicalPrinciple: 'Alternating AC voltage excitation across 4 graphite electrodes measuring ion mobility without polarisation.',
    approxCostUsd: 145.0,
    approxCostInr: 12325,
    source: 'Atlas Scientific EZO-EC Marine Kit',
    sourceUrl: 'https://atlas-scientific.com/probes/conductivity-probe-k-1-0/',
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    realImageUrl: 'https://atlas-scientific.com/wp-content/uploads/2019/08/conductivity-probe-k-1-0.jpg'
  },
  {
    id: 'do',
    name: 'Optical Luminescence Dissolved Oxygen (DO) Sensor',
    measures: 'Dissolved Oxygen Concentration & Saturation %',
    unit: 'mg/L / % Saturation',
    range: '0 to 20.0 mg/L (0 to 200%)',
    accuracy: '±0.2 mg/L',
    envMeaning:
      'Crucial for detecting ocean hypoxia, dead zones, algal bloom respiration, and biological productivity in marine ecosystems.',
    physicalPrinciple: 'Luminescence lifetime quenching of ruthenium complex by oxygen molecules; zero electrolyte consumption.',
    approxCostUsd: 195.0,
    approxCostInr: 16575,
    source: 'Atlas Scientific EZO-DO Optical Probe Kit',
    sourceUrl: 'https://atlas-scientific.com/probes/dissolved-oxygen-probe/',
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    realImageUrl: 'https://atlas-scientific.com/wp-content/uploads/2019/08/dissolved-oxygen-probe.jpg'
  },
  {
    id: 'pressure',
    name: 'Piezoresistive Hydrostatic Pressure & Depth Sensor (Bar30)',
    measures: 'Hydrostatic Pressure & Calculated Depth',
    unit: 'dbar / m',
    range: '0 to 30 bar (0 to 300 m depth)',
    accuracy: '±0.2 dbar (depth resolution ~2 mm)',
    envMeaning:
      'Provides vertical coordinate calibration for CTD profiles, wave height measurement, and pod descent rate feedback.',
    physicalPrinciple: 'High-precision MEMS silicon piezoresistive diaphragm gel-encapsulated in saltwater-proof 316L stainless steel.',
    approxCostUsd: 85.0,
    approxCostInr: 7225,
    source: 'Blue Robotics Bar30 High-Resolution Depth Sensor',
    sourceUrl: 'https://bluerobotics.com/store/sensors-cameras/sensors/bar-depth-pressure-sensor/',
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    realImageUrl: 'https://bluerobotics.com/wp-content/uploads/2016/11/BAR30-SENSOR-R1-1-600x600.jpg'
  },
  {
    id: 'ph',
    name: 'Combination Sealed Glass / Polymer pH Sensor',
    measures: 'Water Column Hydrogen Ion Activity (pH)',
    unit: 'pH units',
    range: '0.00 to 14.00 pH',
    accuracy: '±0.05 pH',
    envMeaning:
      'Detects ocean acidification, biogeochemical carbon absorption shifts, and benthic gas seep anomalies.',
    physicalPrinciple: 'Nernstian potential difference between reference Ag/AgCl half-cell and hydrogen-sensitive glass membrane.',
    approxCostUsd: 85.0,
    approxCostInr: 7225,
    source: 'Atlas Scientific Consumer Marine pH Probe',
    sourceUrl: 'https://atlas-scientific.com/probes/ph-probe/',
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    realImageUrl: 'https://atlas-scientific.com/wp-content/uploads/2019/08/ph-probe.jpg'
  },
  {
    id: 'turbidity',
    name: 'Nephelometric Optical Turbidity & Suspended Solids Sensor',
    measures: 'Water Clarity & Suspended Sediment Density',
    unit: 'NTU (Nephelometric Turbidity Units)',
    range: '0 to 1000 NTU',
    accuracy: '±2% of reading',
    envMeaning:
      'Identifies sediment transport, sediment resuspension, glacial flour runoff, and optical scattering anomalies.',
    physicalPrinciple: '90-degree scattered infrared light (850 nm) detection via matched silicon photodiode array.',
    approxCostUsd: 95.0,
    approxCostInr: 8075,
    source: 'Optical Nephelometric Turbidity Module Specification',
    sourceUrl: 'https://wiki.dfrobot.com/Turbidity_sensor_SKU__SEN0189',
    provenanceType: 'ENGINEERING_ESTIMATE',
    realImageUrl: 'https://dfimg.dfrobot.com/nobody/500x500/0173db45bc49352e850e046633b499cb.jpg'
  }
];

export const DEFAULT_BOM_ITEMS: BOMItem[] = [
  {
    id: 'bom-1',
    category: 'Autopilot & Navigation',
    name: 'Pixhawk 6C Flight Controller with M8N/F9P interface',
    partNumberOrRef: 'Holybro Pixhawk 6C',
    quantity: 1,
    unitCostUsd: 165.99,
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    sourceNote: 'Holybro Official store retail price',
    sourceUrl: 'https://holybro.com/products/pixhawk-6c',
    editable: true
  },
  {
    id: 'bom-2',
    category: 'Compute & Edge AI',
    name: 'Raspberry Pi 4 Model B (8GB RAM) + Passive Aluminium Heatsink Case',
    partNumberOrRef: 'RPi4-8GB-MOD',
    quantity: 1,
    unitCostUsd: 85.0,
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    sourceNote: 'MSRP price + enclosure',
    sourceUrl: 'https://www.raspberrypi.com/products/raspberry-pi-4-model-b/',
    editable: true
  },
  {
    id: 'bom-3',
    category: 'GNSS Satellite Nav',
    name: 'u-blox ZED-F9P Multi-Band High Precision GNSS Receiver',
    partNumberOrRef: 'u-blox F9P-RTK',
    quantity: 1,
    unitCostUsd: 220.0,
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    sourceNote: 'OEM module evaluation board pricing',
    sourceUrl: 'https://www.u-blox.com/en/product/zed-f9p-module',
    editable: true
  },
  {
    id: 'bom-4',
    category: 'Propulsion',
    name: 'Blue Robotics T200 Brushless Marine Thrusters + Basic ESCs (Pair)',
    partNumberOrRef: 'BR-T200-PAIR',
    quantity: 2,
    unitCostUsd: 199.0,
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    sourceNote: 'Blue Robotics public catalog ($199/ea)',
    sourceUrl: 'https://bluerobotics.com/store/thrusters/t100-t200-thrusters/t200-thruster-r2-rp/',
    editable: true
  },
  {
    id: 'bom-5',
    category: 'Power & Solar',
    name: '120W Marine ETFE Monocrystalline Solar Panels (2x 60W)',
    partNumberOrRef: 'SOLAR-ETFE-120W',
    quantity: 1,
    unitCostUsd: 180.0,
    provenanceType: 'ENGINEERING_ESTIMATE',
    sourceNote: 'Commercial marine solar vendor baseline',
    sourceUrl: 'https://www.victronenergy.com',
    editable: true
  },
  {
    id: 'bom-6',
    category: 'Power Storage',
    name: 'Custom 48V 30Ah (1440Wh) Marine Submersible LiFePO4 Battery + Smart BMS',
    partNumberOrRef: 'BAT-LIFEPO4-48V30',
    quantity: 1,
    unitCostUsd: 480.0,
    provenanceType: 'ENGINEERING_ESTIMATE',
    sourceNote: 'Component cells + packaging estimate',
    sourceUrl: 'https://bluerobotics.com',
    editable: true
  },
  {
    id: 'bom-7',
    category: 'Vertical Profiling',
    name: 'Autonomous Winch Mechanism + 100m Kevlar-Reinforced 4-Conductor Micro-Tether',
    partNumberOrRef: 'OTREX-WINCH-100M',
    quantity: 1,
    unitCostUsd: 350.0,
    provenanceType: 'PROJECT_DESIGN_SPEC',
    sourceNote: 'Custom machined spool, BLDC motor & tether BOM',
    sourceUrl: 'https://bluerobotics.com/store/cables-connectors/cables/fathom-tether-slim/',
    editable: true
  },
  {
    id: 'bom-8',
    category: 'Sensor Pod Suite',
    name: 'Oceanographic Sensor Cluster (Temp, Salinity/EC, DO, Depth/Pressure, pH, Turbidity)',
    partNumberOrRef: 'SENSOR-SUITE-6CH',
    quantity: 1,
    unitCostUsd: 650.0,
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    sourceNote: 'Sum of OEM sensors (Atlas Scientific & Blue Robotics list prices)',
    sourceUrl: 'https://atlas-scientific.com',
    editable: true
  },
  {
    id: 'bom-9',
    category: 'Communication',
    name: 'LoRa SX1262 Telemetry + Iridium 9603 SBD Satellite Transceiver Kit',
    partNumberOrRef: 'COMMS-LORA-SAT',
    quantity: 1,
    unitCostUsd: 260.0,
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    sourceNote: 'RockBLOCK 9603 retail price ($210) + LoRa ($50)',
    sourceUrl: 'https://www.groundcontrol.com/product/rockblock-9603/',
    editable: true
  },
  {
    id: 'bom-10',
    category: 'Structure & Hull',
    name: 'Catamaran Wave-Piercing Twin Hulls (Rotomolded HDPE/Fiberglass)',
    partNumberOrRef: 'HULL-CAT-1250',
    quantity: 1,
    unitCostUsd: 320.0,
    provenanceType: 'PROJECT_DESIGN_SPEC',
    sourceNote: 'Fabrication & tooling cost estimate',
    sourceUrl: 'https://github.com/code-zephyra/o-trex',
    editable: true
  },
  {
    id: 'bom-11',
    category: 'Enclosures & Seals',
    name: 'IP68 Watertight Aluminum Central Enclosures & WetLink Marine Bulkhead Penetrators',
    partNumberOrRef: 'WTE-AL-ENCL-KIT',
    quantity: 1,
    unitCostUsd: 145.0,
    provenanceType: 'VERIFIED_PUBLIC_PRICE',
    sourceNote: 'Blue Robotics 4-inch series enclosure catalog',
    sourceUrl: 'https://bluerobotics.com/store/watertight-enclosures/4-series/',
    editable: true
  },
  {
    id: 'bom-12',
    category: 'Assembly & Wiring',
    name: 'Marine-Grade 316 Stainless Fasteners, Silicone Wiring, relays & PCB Power Board',
    partNumberOrRef: 'MISC-ELEC-MECH',
    quantity: 1,
    unitCostUsd: 110.0,
    provenanceType: 'ENGINEERING_ESTIMATE',
    sourceNote: 'Wiring harnesses and marine connectors allowance',
    sourceUrl: 'https://github.com/code-zephyra/o-trex',
    editable: true
  }
];
