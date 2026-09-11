import { EnvironmentState } from '../../types/simulation';

export const SCENARIO_PRESETS: Record<EnvironmentState['scenarioId'], EnvironmentState> = {
  BASELINE: {
    scenarioId: 'BASELINE',
    name: 'Standard Open Ocean Baseline Patrol',
    description: 'Calm ocean surface conditions with uniform background thermocline and nominal biogeochemistry.',
    waveHeightM: 0.8,
    wavePeriodS: 6.0,
    currentSpeedKnots: 0.4,
    currentDirectionDeg: 45,
    windSpeedMs: 4.5,
    windDirectionDeg: 60,
    solarIrradianceWm2: 850,
    ambientAirTempC: 18.5,
    surfaceBaseTempC: 21.2,
    surfaceBaseSalinityPsu: 35.1,
    surfaceBaseDOMgL: 7.8,
    surfaceBasePh: 8.14,
    surfaceBaseTurbidityNtu: 0.8,
    thermoclineDepthM: 25.0,
    hasIceFloes: false,
    anomalyRegion: {
      active: false,
      centerSimX: 2400.0,
      centerSimZ: 3000.0,
      radiusM: 650.0,
      tempDeltaC: 0.0,
      doDeltaMgL: 0.0,
      turbidityDeltaNtu: 0.0,
      phDelta: 0.0,
      condDeltaMsCm: 0.0
    }
  },
  LOW_OXYGEN: {
    scenarioId: 'LOW_OXYGEN',
    name: 'Subsurface Hypoxia & Dead Zone Anomaly',
    description: 'A localized severe hypoxic water mass with dissolved oxygen dropping from 7.8 to 2.4 mg/L accompanied by a thermal front.',
    waveHeightM: 1.2,
    wavePeriodS: 5.5,
    currentSpeedKnots: 0.8,
    currentDirectionDeg: 120,
    windSpeedMs: 6.0,
    windDirectionDeg: 135,
    solarIrradianceWm2: 780,
    ambientAirTempC: 16.0,
    surfaceBaseTempC: 22.5,
    surfaceBaseSalinityPsu: 34.8,
    surfaceBaseDOMgL: 7.6,
    surfaceBasePh: 8.12,
    surfaceBaseTurbidityNtu: 1.1,
    thermoclineDepthM: 18.0,
    hasIceFloes: false,
    anomalyRegion: {
      active: true,
      centerSimX: 1800.0,
      centerSimZ: 2200.0,
      radiusM: 750.0,
      tempDeltaC: 3.4, // Elevated warm lens
      doDeltaMgL: -4.8, // Severe hypoxic drop
      turbidityDeltaNtu: 2.2,
      phDelta: -0.35, // Acidified hypoxic zone
      condDeltaMsCm: 1.8
    }
  },
  TURBIDITY_PLUME: {
    scenarioId: 'TURBIDITY_PLUME',
    name: 'Suspended Sediment & Turbidity Plume',
    description: 'High nephelometric turbidity spike (up to 45 NTU) associated with river discharge or benthic sediment resuspension.',
    waveHeightM: 1.5,
    wavePeriodS: 4.8,
    currentSpeedKnots: 1.2,
    currentDirectionDeg: 200,
    windSpeedMs: 8.0,
    windDirectionDeg: 210,
    solarIrradianceWm2: 600,
    ambientAirTempC: 14.0,
    surfaceBaseTempC: 17.8,
    surfaceBaseSalinityPsu: 32.5, // Freshwater dilution
    surfaceBaseDOMgL: 6.9,
    surfaceBasePh: 7.95,
    surfaceBaseTurbidityNtu: 1.2,
    thermoclineDepthM: 15.0,
    hasIceFloes: false,
    anomalyRegion: {
      active: true,
      centerSimX: 2600.0,
      centerSimZ: 1400.0,
      radiusM: 800.0,
      tempDeltaC: -1.8,
      doDeltaMgL: -1.5,
      turbidityDeltaNtu: 42.0, // Major sediment spike
      phDelta: -0.22,
      condDeltaMsCm: -4.5
    }
  },
  POLAR_OCEAN: {
    scenarioId: 'POLAR_OCEAN',
    name: 'Polar & Southern Ocean Extreme Environment (SIH26065)',
    description: 'Frigid polar waters (-1.5°C), heavy swells (2.8m), drifting sea ice, low solar elevation, and intense halocline stratification.',
    waveHeightM: 2.6,
    wavePeriodS: 7.5,
    currentSpeedKnots: 1.6,
    currentDirectionDeg: 280,
    windSpeedMs: 14.0,
    windDirectionDeg: 275,
    solarIrradianceWm2: 320, // Low polar sun
    ambientAirTempC: -8.0,
    surfaceBaseTempC: -0.5,
    surfaceBaseSalinityPsu: 33.9,
    surfaceBaseDOMgL: 11.2, // High cold water DO solubility
    surfaceBasePh: 8.20,
    surfaceBaseTurbidityNtu: 0.5,
    thermoclineDepthM: 35.0,
    hasIceFloes: true,
    anomalyRegion: {
      active: true,
      centerSimX: 1200.0,
      centerSimZ: 1800.0,
      radiusM: 700.0,
      tempDeltaC: 2.1, // Warm deep water upwelling
      doDeltaMgL: -2.8,
      turbidityDeltaNtu: 3.5,
      phDelta: -0.15,
      condDeltaMsCm: 1.2
    }
  },
  COMM_BLACKOUT: {
    scenarioId: 'COMM_BLACKOUT',
    name: 'Satellite Outage & Offline Store-and-Forward Test',
    description: 'Simulates severe ionospheric disturbance or satellite occlusion: tests onboard local non-volatile queuing and retransmission upon link recovery.',
    waveHeightM: 1.1,
    wavePeriodS: 5.2,
    currentSpeedKnots: 0.6,
    currentDirectionDeg: 90,
    windSpeedMs: 5.5,
    windDirectionDeg: 100,
    solarIrradianceWm2: 750,
    ambientAirTempC: 17.0,
    surfaceBaseTempC: 20.0,
    surfaceBaseSalinityPsu: 35.0,
    surfaceBaseDOMgL: 7.5,
    surfaceBasePh: 8.10,
    surfaceBaseTurbidityNtu: 0.9,
    thermoclineDepthM: 20.0,
    hasIceFloes: false,
    anomalyRegion: {
      active: true,
      centerSimX: 1500.0,
      centerSimZ: 1500.0,
      radiusM: 600.0,
      tempDeltaC: 2.5,
      doDeltaMgL: -3.0,
      turbidityDeltaNtu: 1.5,
      phDelta: -0.18,
      condDeltaMsCm: 1.0
    }
  }
};
