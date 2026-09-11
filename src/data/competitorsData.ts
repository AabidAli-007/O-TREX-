import { CompetitorSystem } from '../types/competitor';

export const COMPETITOR_SYSTEMS: CompetitorSystem[] = [
  {
    id: 'research-vessel',
    name: 'Crewed Oceanographic Research Vessel',
    classType: 'Manned Scientific Ship (e.g. NOAA Reuben Lasker class)',
    role: 'Traditional comprehensive oceanographic surveys, sediment cores, multi-beam sonar, and heavy CTD rosette profiling',
    operationalModel: 'Expeditionary cruise with 20–40 crew and scientists onboard for 2-4 week campaigns',
    dataCollected: 'Full-depth rosette CTD, biogeochemical water samples, acoustic Doppler current profiles, atmospheric physics',
    deploymentMethod: 'Harbor departure and continuous diesel-electric navigation across planned grid lines',
    endurance: '20 to 45 days limited by fuel, water, and crew provisions',
    crewRequired: 'Crewed (20-40 personnel)',
    costModel: {
      headlineCost: '$25,000 to $60,000+ / day operational rate',
      unitCostUsdRange: '$40M – $120M build cost per vessel',
      dailyOpCostUsdRange: '$25,000 – $59,426 / day (NOAA published reference rate)',
      source: 'NOAA Office of Marine and Aviation Operations (OMAO) & IOOS',
      sourceUrl: 'https://ioos.noaa.gov/project/internet-of-things-in-the-deep-automating-the-collection-of-oceanographic-data-with-smarter-fishing-vessels/',
      costTypeNote: 'Illustrative verified public historical rate. Actual vessel day rates depend on displacement, fuel costs, and scientific staffing.'
    },
    strengths: [
      'Unmatched laboratory equipment and heavy wet-lab analytical capability onboard',
      'Can deploy 24-bottle Niskin rosette CTD arrays down to full ocean depth (6,000m)',
      'Direct human decision-making and immediate sample processing'
    ],
    limitations: [
      'Extremely high operating costs ($25k–$60k/day) prevent continuous, persistent spatial monitoring',
      'High logistics burden: requires harbour bases, bunkering, and large crew shifts',
      'Inflexible response: cannot easily redirect a cruise track for sudden localized ephemeral anomalies',
      'Carbon-heavy diesel fuel emissions and high human safety risks in severe Southern Ocean storms'
    ],
    otrexDifferentiation:
      'O-TREX is designed not to replace heavy deep-sea laboratory ships, but to fill the persistent monitoring gap: offering autonomous, zero-emission, continuous surveillance with targeted vertical profiling at <1% of the daily operating footprint.',
    keyComparisonMetrics: {
      autonomy: 'None',
      crewRequirement: 'Crewed (20-40 personnel)',
      surfaceMonitoring: 'Continuous',
      verticalProfiling: 'Winch CTD (on demand)',
      adaptiveResponse: 'Manual decision',
      realTimeComms: 'Broadband Satellite',
      operationalCost: 'Very High ($25k–$60k/day)'
    },
    simCoords: [110, 0, -75]
  },
  {
    id: 'argo-float',
    name: 'Argo Autonomous Profiling Float',
    classType: 'Lagrangian Profiling Buoy (Standard & BGC-Argo)',
    role: 'Global climate monitoring of temperature, salinity, and biogeochemistry across the upper 2,000m of the world oceans',
    operationalModel: 'Drifts freely at 1,000m parking depth for 9 days, sinks to 2,000m, ascends measuring CTD, transmits via satellite at surface, and repeats',
    dataCollected: 'Vertical profiles of temperature, salinity, pressure (Core Argo); oxygen, nitrate, pH, chlorophyll (BGC-Argo)',
    deploymentMethod: 'Launched from research ships or commercial vessels of opportunity; non-recoverable expendable lifecycle',
    endurance: '4 to 5 years (approx. 150 to 200 profiling cycles)',
    crewRequired: 'Uncrewed (deployment crew required)',
    costModel: {
      headlineCost: '~$20,000 unit cost (doubles with ops & satellite tracking)',
      unitCostUsdRange: '$20,000 – $25,000 (Core CTD) / up to $80k–$100k+ for BGC-Argo',
      dailyOpCostUsdRange: '~$2,000 – $5,000 / year amortized operational & satellite costs',
      source: 'Official Argo Program FAQ (UCSD / Scripps / Euro-Argo)',
      sourceUrl: 'https://argo.ucsd.edu/faq/',
      costTypeNote: 'Verified public data. Official FAQ notes unit cost doubles after deployment logistics, satellite airtime, and data management.'
    },
    strengths: [
      'Magnificent global baseline coverage with >3,800 active floats worldwide',
      'Deep vertical profiles down to 2,000m (and Deep Argo to 6,000m)',
      'Completely autonomous multi-year lifespan once in the water'
    ],
    limitations: [
      'Passive Lagrangian drift: zero lateral propulsion or trajectory control',
      'Rigid 10-day cycle: cannot investigate localized anomalies or chase shifting blooms on demand',
      'Expendable architecture: high hardware replacement cost per cycle; recovery is generally uneconomic',
      'Minimal surface observation time: spends >98% of its lifecycle submerged at parking depth'
    ],
    otrexDifferentiation:
      'Unlike Argo floats that drift passively with currents, O-TREX combines active surface navigation with event-driven winch profiling. It navigates to targeted coordinates, detects dynamic surface signals in real time, and selectively lowers its pod without being lost at sea.',
    keyComparisonMetrics: {
      autonomy: 'Autonomous Drift',
      crewRequirement: 'Uncrewed (deployment crew required)',
      surfaceMonitoring: 'Periodic / Ascent only',
      verticalProfiling: 'Fixed float cycle (10-day standard)',
      adaptiveResponse: 'None (pre-programmed)',
      realTimeComms: 'Iridium burst on surface',
      operationalCost: 'Low ($2k-$5k/yr amortized)'
    },
    simCoords: [38, 0, 32]
  },
  {
    id: 'commercial-usv',
    name: 'Saildrone-Class Autonomous Surface Vehicle',
    classType: 'Long-Endurance Winged Surface Drone (Commercial USV)',
    role: 'Met-ocean data collection, fisheries surveys, carbon flux, and remote ocean observation',
    operationalModel: 'Wind-propelled wing for forward propulsion with solar-powered sensor payloads; operates as a managed data service',
    dataCollected: 'Surface meteorological parameters, wave spectra, acoustic fish biomass, ADCP currents, ocean color',
    deploymentMethod: 'Shore launch or mother vessel; autonomous planetary navigation',
    endurance: 'Up to 12 months continuous offshore presence',
    crewRequired: 'Uncrewed',
    costModel: {
      headlineCost: 'Commercial Data-as-a-Service model ($2,500 – $4,500/day mission rate)',
      unitCostUsdRange: 'Public unit hardware price not disclosed — commercial quote required',
      dailyOpCostUsdRange: 'Data-as-a-service mission contract model',
      source: 'Saildrone Inc. Platform & Service Model Specifications',
      sourceUrl: 'https://www.saildrone.com/platform/explorer',
      costTypeNote: 'Commercial quotes only. Hardware is typically operated and maintained as a managed service rather than standalone consumer off-the-shelf purchase.'
    },
    strengths: [
      'Exceptional multi-month ocean endurance using high-efficiency rigid wing propulsion',
      'Comprehensive met-ocean sensor payload and mature planetary satellite communications',
      'Proven performance in extreme Southern Ocean hurricane-force winds'
    ],
    limitations: [
      'Primarily focused on surface and towed acoustic instrumentation; limited deep on-demand winch vertical profiling',
      'Large 7m to 20m physical footprint requires specialized slipway or harbour handling',
      'Proprietary enterprise ecosystem with high-tier mission contracting costs'
    ],
    otrexDifferentiation:
      'O-TREX focuses on an open-architecture, low-cost modular design (<1.5m form factor) that uniquely integrates an autonomous subsurface profiling winch with edge AI anomaly triggers, making targeted multi-depth sampling accessible for research institutes and universities.',
    keyComparisonMetrics: {
      autonomy: 'Autonomous Sail',
      crewRequirement: 'Uncrewed',
      surfaceMonitoring: 'Continuous',
      verticalProfiling: 'Towed sensor (limited depth)',
      adaptiveResponse: 'Route-level waypoint',
      realTimeComms: 'Iridium / Satellite',
      operationalCost: 'Medium (commercial data-as-service)'
    },
    simCoords: [-48, 0, -28]
  },
  {
    id: 'fixed-mooring',
    name: 'Oceanographic Moored Buoy Observatory',
    classType: 'Fixed Oceanographic Station (e.g. TAO / RAMA / OceanSITES)',
    role: 'Continuous time-series measurements of climate, meteorological, and physical water column properties at a single fixed ocean point',
    operationalModel: 'Anchored to sea-floor via heavy mooring cable and anchor weight for 1-2 years between servicing',
    dataCollected: 'Meteorological surface data, string of CTD sensors clamped at discrete depths along mooring line, wave motion',
    deploymentMethod: 'Specialized heavy-lift oceanographic vessel deployment with winch crane and anchor release',
    endurance: '1 to 2 years before biofouling and battery replacement require ship intervention',
    crewRequired: 'Uncrewed (deployment crew required)',
    costModel: {
      headlineCost: 'High capital & servicing cost ($50k–$250k initial + ship maintenance)',
      unitCostUsdRange: '$50,000 – $250,000+ per installed mooring system',
      dailyOpCostUsdRange: 'Significant dedicated maintenance cruise costs ($50k+ per service trip)',
      source: 'NOAA PMEL Ocean Moored Buoy Program & OceanSITES',
      sourceUrl: 'https://www.pmel.noaa.gov/',
      costTypeNote: 'Site-, depth-, and sensor-dependent. Ship time for regular servicing represents majority of lifecycle expenditure.'
    },
    strengths: [
      'High temporal resolution: continuous unbroken time-series at one geographic coordinate',
      'Fixed sensor chains can sample simultaneously across multiple depths'
    ],
    limitations: [
      'Zero spatial mobility: completely incapable of tracking moving environmental features or blooms',
      'Vulnerable to mooring line breakages, ship collisions, and heavy marine biofouling',
      'Requires heavy ship expeditions every 12-24 months for anchor recovery and sensor recalibration'
    ],
    otrexDifferentiation:
      'O-TREX provides the spatial agility that fixed moorings lack. Instead of sitting statically while phenomena drift past, O-TREX patrols large ocean sectors and maneuvers directly into high-interest water masses.',
    keyComparisonMetrics: {
      autonomy: 'Autonomous Mission',
      crewRequirement: 'Uncrewed (deployment crew required)',
      surfaceMonitoring: 'Continuous',
      verticalProfiling: 'Mooring chain',
      adaptiveResponse: 'None (pre-programmed)',
      realTimeComms: 'Acoustic / Sat link',
      operationalCost: 'Moderate'
    },
    simCoords: [-25, 0, 55]
  }
];
