import { SensorReading, MissionScore, VehicleState } from '../types/simulation';

export function exportSensorHistoryToCSV(history: SensorReading[], scenarioName: string) {
  const headers = [
    'Timestamp_ISO',
    'Timestamp_Unix',
    'Depth_m',
    'Temperature_C',
    'Conductivity_mS_cm',
    'Salinity_PSU',
    'Dissolved_Oxygen_mg_L',
    'Pressure_dbar',
    'pH',
    'Turbidity_NTU',
    'Quality_Flag',
    'Quality_Score_Pct',
    'Confidence'
  ];

  const rows = history.map((r) => [
    new Date(r.timestamp).toISOString(),
    r.timestamp,
    r.depthM,
    r.temperatureC,
    r.conductivityMsCm,
    r.salinityPsu,
    r.dissolvedOxygenMgL,
    r.pressureDbar,
    r.ph,
    r.turbidityNtu,
    r.qualityFlag,
    r.qualityScore,
    r.confidence
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `OTREX_Sensor_Data_${scenarioName.replace(/\s+/g, '_')}_${Date.now()}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportMissionSummaryJSON(
  vehicle: VehicleState,
  score: MissionScore,
  history: SensorReading[],
  scenarioName: string
) {
  const data = {
    platform: 'O-TREX (Oceanic Tracking & Responsive eXplorer)',
    team: 'CODE ZEPHYRA',
    hackathon: 'Smart India Hackathon 2026',
    problemStatement: 'SIH26065',
    exportTimestamp: new Date().toISOString(),
    scenario: scenarioName,
    missionSummary: {
      uptimeSeconds: vehicle.uptimeSeconds,
      distanceTraveledM: vehicle.distanceTraveledM,
      finalBatterySOC: vehicle.batterySOC,
      finalGPS: { lat: vehicle.lat, lon: vehicle.lon },
      totalScore: score.totalScore,
      scientificValuePct: score.scientificValuePct,
      energyEfficiencyPct: score.energyEfficiencyPct,
      dataQualityPct: score.dataQualityPct,
      safetyPct: score.safetyPct,
      samplesCollected: score.samplesCollected,
      profilesCompleted: score.profilesCompleted,
      anomaliesInvestigated: score.anomaliesInvestigated,
      dataTransmittedKb: score.dataTransmittedKb
    },
    observationsCount: history.length,
    observationsSample: history.slice(-50)
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `OTREX_Mission_Log_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
