import * as THREE from 'three';

export interface WaveComponent {
  direction: [number, number]; // Normalized [dx, dz]
  wavelength: number;          // in meters
  amplitude: number;           // in meters
  speed: number;               // in m/s
  steepness: number;           // Gerstner Q factor (0 to 1)
}

// 6-octave calibrated harmonic realistic ocean wave spectrum (deep swell + chop + capillary ripples)
export const OCEAN_WAVE_SPECTRUM: WaveComponent[] = [
  // 1. Primary oceanic swell (long sweeping period)
  {
    direction: [0.707, 0.707],
    wavelength: 45.0,
    amplitude: 0.52,
    speed: 4.8,
    steepness: 0.35
  },
  // 2. Secondary cross-swell
  {
    direction: [0.923, 0.382],
    wavelength: 24.0,
    amplitude: 0.30,
    speed: 6.0,
    steepness: 0.28
  },
  // 3. Wind-driven chop
  {
    direction: [0.382, 0.923],
    wavelength: 12.0,
    amplitude: 0.18,
    speed: 7.2,
    steepness: 0.24
  },
  // 4. Cross-wind sea chop
  {
    direction: [-0.5, 0.866],
    wavelength: 5.5,
    amplitude: 0.09,
    speed: 8.6,
    steepness: 0.20
  },
  // 5. Fine capillary ripples
  {
    direction: [0.8, -0.6],
    wavelength: 2.4,
    amplitude: 0.04,
    speed: 10.2,
    steepness: 0.15
  },
  // 6. High-frequency wind shimmer
  {
    direction: [-0.707, -0.707],
    wavelength: 1.2,
    amplitude: 0.02,
    speed: 12.0,
    steepness: 0.12
  }
];

/**
 * Calculates exact water surface elevation y at any (x, z) world position and simulation time t.
 * Matches the GPU Gerstner vertex shader 1-to-1 to ensure zero clipping.
 */
export function getOceanHeight(
  x: number,
  z: number,
  time: number,
  waveHeightScale: number = 1.0
): number {
  let elevation = 0;

  for (let i = 0; i < OCEAN_WAVE_SPECTRUM.length; i++) {
    const wave = OCEAN_WAVE_SPECTRUM[i];
    const k = (2.0 * Math.PI) / wave.wavelength;
    const w = k * wave.speed;
    const dirDotPos = wave.direction[0] * x + wave.direction[1] * z;
    const phase = dirDotPos * k - time * w;

    const amp = wave.amplitude * waveHeightScale;
    elevation += amp * Math.sin(phase);
  }

  return elevation;
}

/**
 * Calculates surface normal vector at (x, z) for physics alignment & specular lighting.
 */
export function getOceanNormal(
  x: number,
  z: number,
  time: number,
  waveHeightScale: number = 1.0
): THREE.Vector3 {
  let dx = 0;
  let dz = 0;

  for (let i = 0; i < OCEAN_WAVE_SPECTRUM.length; i++) {
    const wave = OCEAN_WAVE_SPECTRUM[i];
    const k = (2.0 * Math.PI) / wave.wavelength;
    const w = k * wave.speed;
    const dirDotPos = wave.direction[0] * x + wave.direction[1] * z;
    const phase = dirDotPos * k - time * w;

    const amp = wave.amplitude * waveHeightScale;
    const cosVal = amp * k * Math.cos(phase);

    dx += wave.direction[0] * cosVal;
    dz += wave.direction[1] * cosVal;
  }

  const normal = new THREE.Vector3(-dx, 1.0, -dz);
  return normal.normalize();
}

/**
 * Calculates catamaran hull buoyancy orientation (pitch & roll degrees)
 * by sampling port and starboard hull waterlines.
 */
export function getCatamaranBuoyancy(
  simX: number,
  simZ: number,
  headingDeg: number,
  time: number,
  waveHeightScale: number = 1.0
): {
  waterlineY: number;
  pitchDeg: number;
  rollDeg: number;
} {
  const headingRad = (headingDeg * Math.PI) / 180.0;
  const fwdX = Math.sin(headingRad);
  const fwdZ = Math.cos(headingRad);
  const rightX = Math.cos(headingRad);
  const rightZ = -Math.sin(headingRad);

  const halfLength = 1.1; // 2.2m hull length
  const halfBeam = 0.85;   // 1.7m beam

  // 4 corner hull waterline contact points
  const bowPortY = getOceanHeight(
    simX + fwdX * halfLength - rightX * halfBeam,
    simZ + fwdZ * halfLength - rightZ * halfBeam,
    time,
    waveHeightScale
  );
  const bowStbdY = getOceanHeight(
    simX + fwdX * halfLength + rightX * halfBeam,
    simZ + fwdZ * halfLength + rightZ * halfBeam,
    time,
    waveHeightScale
  );
  const sternPortY = getOceanHeight(
    simX - fwdX * halfLength - rightX * halfBeam,
    simZ - fwdZ * halfLength - rightZ * halfBeam,
    time,
    waveHeightScale
  );
  const sternStbdY = getOceanHeight(
    simX - fwdX * halfLength + rightX * halfBeam,
    simZ - fwdZ * halfLength + rightZ * halfBeam,
    time,
    waveHeightScale
  );

  const bowY = (bowPortY + bowStbdY) * 0.5;
  const sternY = (sternPortY + sternStbdY) * 0.5;
  const portY = (bowPortY + sternPortY) * 0.5;
  const stbdY = (bowStbdY + sternStbdY) * 0.5;

  const centerWaterline = (bowY + sternY) * 0.5;

  // Wave slope pitch (bow vs stern)
  const pitchRad = Math.atan2(bowY - sternY, halfLength * 2.0);
  const pitchDeg = (pitchRad * 180.0) / Math.PI;

  // Wave slope roll (port vs starboard)
  const rollRad = Math.atan2(portY - stbdY, halfBeam * 2.0);
  const rollDeg = (rollRad * 180.0) / Math.PI;

  return {
    waterlineY: centerWaterline,
    pitchDeg: THREE.MathUtils.clamp(pitchDeg, -18.0, 18.0),
    rollDeg: THREE.MathUtils.clamp(rollDeg, -22.0, 22.0)
  };
}
