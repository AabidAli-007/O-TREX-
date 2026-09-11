export interface CompetitorSystem {
  id: string;
  name: string;
  classType: string;
  role: string;
  operationalModel: string;
  dataCollected: string;
  deploymentMethod: string;
  endurance: string;
  crewRequired: string;
  costModel: {
    headlineCost: string;
    unitCostUsdRange: string;
    dailyOpCostUsdRange: string;
    source: string;
    sourceUrl: string;
    costTypeNote: string;
  };
  strengths: string[];
  limitations: string[];
  otrexDifferentiation: string;
  keyComparisonMetrics: {
    autonomy: 'None' | 'Autonomous Mission' | 'Autonomous Drift' | 'Autonomous Sail';
    crewRequirement: 'Crewed (20-40 personnel)' | 'Uncrewed' | 'Uncrewed (deployment crew required)';
    surfaceMonitoring: 'Continuous' | 'Periodic / Ascent only' | 'Continuous';
    verticalProfiling: 'Winch CTD (on demand)' | 'Fixed float cycle (10-day standard)' | 'Towed sensor (limited depth)' | 'Mooring chain' | 'Adaptive Event-Triggered Winch';
    adaptiveResponse: 'Manual decision' | 'None (pre-programmed)' | 'Route-level waypoint' | 'Autonomous Event-Triggered';
    realTimeComms: 'Broadband Satellite' | 'Iridium burst on surface' | 'Iridium / Satellite' | 'Acoustic / Sat link' | 'LoRa + Sat Tiered Priority';
    operationalCost: 'Very High ($25k–$60k/day)' | 'Low ($2k-$5k/yr amortized)' | 'Medium (commercial data-as-service)' | 'Moderate' | 'Very Low (autonomous solar)';
  };
  simCoords: [number, number, number];
}
