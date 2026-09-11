import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OceanSurfaceProps {
  waveHeight: number;
  hasIceFloes?: boolean;
}

const OceanShader = {
  vertexShader: `
    uniform float uTime;
    uniform float uWaveHeight;

    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying float vWaveCrest;

    // 6-octave Gerstner wave displacement (synchronized 1:1 with CPU oceanWaves.ts)
    vec3 gerstnerWave(vec2 dir, float wavelength, float amp, float speed, float steepness, vec2 pos, inout vec3 tangent, inout vec3 binormal) {
      float k = 6.28318530718 / wavelength;
      float w = k * speed;
      float phase = dot(dir, pos) * k - uTime * w;
      float sinP = sin(phase);
      float cosP = cos(phase);

      float q = steepness / (k * amp * 6.0 + 0.0001);

      tangent += vec3(
        -dir.x * dir.x * (q * amp * sinP),
        dir.x * (amp * cosP),
        -dir.x * dir.y * (q * amp * sinP)
      );

      binormal += vec3(
        -dir.x * dir.y * (q * amp * sinP),
        dir.y * (amp * cosP),
        -dir.y * dir.y * (q * amp * sinP)
      );

      return vec3(
        q * amp * dir.x * cosP,
        amp * sinP,
        q * amp * dir.y * cosP
      );
    }

    void main() {
      // Local position rotated to XZ world space
      vec4 worldPos4 = modelMatrix * vec4(position, 1.0);
      vec3 worldPos = worldPos4.xyz;

      vec3 tangent = vec3(1.0, 0.0, 0.0);
      vec3 binormal = vec3(0.0, 0.0, 1.0);
      vec3 displacement = vec3(0.0);

      // 6-octave harmonic spectrum
      displacement += gerstnerWave(normalize(vec2(0.707, 0.707)), 45.0, 0.52 * uWaveHeight, 4.8, 0.35, worldPos.xz, tangent, binormal);
      displacement += gerstnerWave(normalize(vec2(0.923, 0.382)), 24.0, 0.30 * uWaveHeight, 6.0, 0.28, worldPos.xz, tangent, binormal);
      displacement += gerstnerWave(normalize(vec2(0.382, 0.923)), 12.0, 0.18 * uWaveHeight, 7.2, 0.24, worldPos.xz, tangent, binormal);
      displacement += gerstnerWave(normalize(vec2(-0.5, 0.866)), 5.5, 0.09 * uWaveHeight, 8.6, 0.20, worldPos.xz, tangent, binormal);
      displacement += gerstnerWave(normalize(vec2(0.8, -0.6)), 2.4, 0.04 * uWaveHeight, 10.2, 0.15, worldPos.xz, tangent, binormal);
      displacement += gerstnerWave(normalize(vec2(-0.707, -0.707)), 1.2, 0.02 * uWaveHeight, 12.0, 0.12, worldPos.xz, tangent, binormal);

      vec3 finalWorldPos = worldPos + displacement;
      vec3 normal = normalize(cross(binormal, tangent));

      vWorldPosition = finalWorldPos;
      vNormal = normal;
      vWaveCrest = displacement.y;

      gl_Position = projectionMatrix * viewMatrix * vec4(finalWorldPos, 1.0);
    }
  `,

  fragmentShader: `
    uniform float uTime;
    uniform vec3 uDeepColor;
    uniform vec3 uShallowColor;
    uniform vec3 uSunColor;
    uniform vec3 uSunPosition;
    uniform vec3 uFogColor;
    uniform float uFogNear;
    uniform float uFogFar;

    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying float vWaveCrest;

    // Procedural pseudo-noise for whitecap foam
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    void main() {
      // Check if camera is underwater
      bool isUnderwater = cameraPosition.y < 0.0 || !gl_FrontFacing;

      // 1. World-space vectors
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 baseNormal = normalize(vNormal);
      if (isUnderwater && baseNormal.y > 0.0) {
        baseNormal = -baseNormal;
      }
      vec3 sunDir = normalize(uSunPosition);

      // 2. High-Frequency Micro-Ripple Normal Perturbation (Sparkling glints)
      vec2 ripCoord1 = vWorldPosition.xz * 1.6 + vec2(uTime * 0.35, uTime * 0.22);
      vec2 ripCoord2 = vWorldPosition.zx * 2.8 - vec2(uTime * 0.28, uTime * 0.42);
      vec2 rippleNoise = vec2(
        sin(ripCoord1.x) * cos(ripCoord1.y) + 0.5 * sin(ripCoord2.x),
        cos(ripCoord1.x) * sin(ripCoord1.y) + 0.5 * cos(ripCoord2.y)
      ) * 0.065;

      vec3 normal = normalize(baseNormal + vec3(rippleNoise.x, 0.0, rippleNoise.y));

      // 3. Fresnel Reflection (Schlick approximation)
      float cosTheta = clamp(dot(viewDir, normal), 0.0, 1.0);
      float fresnel = 0.04 + 0.96 * pow(1.0 - cosTheta, 5.0);

      // 4. Subsurface Scattering (Translucent emerald/cyan highlights on sun-facing wave faces)
      float sss = pow(clamp(dot(viewDir, -sunDir), 0.0, 1.0), 3.0) * clamp((vWaveCrest + 0.6) * 0.7, 0.0, 1.0);
      vec3 sssColor = vec3(0.05, 0.65, 0.72) * sss * 1.4;

      // 5. Multi-Color Depth Gradient
      float depthFactor = clamp((vWaveCrest + 1.2) * 0.45, 0.0, 1.0);
      vec3 waterColor = mix(uDeepColor, uShallowColor, depthFactor) + sssColor;

      // 6. Dual-Lobe Sun Specular Highlights & Glint
      vec3 halfVector = normalize(sunDir + viewDir);
      float specAngle = clamp(dot(normal, halfVector), 0.0, 1.0);
      float sharpSpecular = pow(specAngle, 160.0) * 2.8;
      float broadGlint = pow(specAngle, 22.0) * 0.45;
      vec3 sunSpecular = (sharpSpecular + broadGlint) * uSunColor;

      // 7. Dynamic Wave Crest Whitecaps / Foam with procedural noise
      float foamThreshold = smoothstep(0.40, 0.95, vWaveCrest);
      float foamPattern = noise(vWorldPosition.xz * 3.5 + vec2(uTime * 0.2, uTime * 0.15));
      float foamFactor = clamp(foamThreshold * (foamPattern * 0.7 + 0.5), 0.0, 1.0);
      vec3 foamColor = vec3(0.96, 0.98, 1.0);

      // 8. Composite Surface Color
      vec3 skyReflection = mix(vec3(0.12, 0.25, 0.45), uSunColor * 0.75, pow(1.0 - cosTheta, 3.0));
      vec3 finalColor = mix(waterColor, skyReflection, fresnel * 0.85);
      finalColor += sunSpecular;
      finalColor = mix(finalColor, foamColor, foamFactor * 0.75);

      // 9. Underwater View from Beneath Surface (Snell's Window & God Rays)
      if (isUnderwater) {
        // Snell's critical angle ~ 48.6 degrees -> cosTheta ~ 0.66
        float snellWindow = smoothstep(0.45, 0.85, cosTheta);
        vec3 undersideSky = mix(vec3(0.04, 0.22, 0.38), vec3(0.4, 0.8, 1.0), snellWindow);
        float underSun = pow(clamp(dot(viewDir, sunDir), 0.0, 1.0), 32.0) * 2.0;
        undersideSky += uSunColor * underSun;
        finalColor = mix(vec3(0.02, 0.10, 0.20), undersideSky, snellWindow * 0.9);
      }

      // 10. Distance Fog Blend towards Horizon
      float dist = length(vWorldPosition - cameraPosition);
      float fogFactor = clamp((dist - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
      fogFactor = pow(fogFactor, 1.3);
      finalColor = mix(finalColor, uFogColor, fogFactor);

      // Controlled Translucency
      float alpha = isUnderwater ? 0.92 : mix(0.90, 1.0, clamp(dist / 100.0, 0.0, 1.0));
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

export const OceanSurface: React.FC<OceanSurfaceProps> = ({ waveHeight, hasIceFloes }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerSkirtRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const skirtMaterialRef = useRef<THREE.ShaderMaterial>(null);

  // Deep oceanic color palette based on scenario
  const deepColor = useMemo(
    () => (hasIceFloes ? new THREE.Color('#0A2239') : new THREE.Color('#0D2A4A')),
    [hasIceFloes]
  );
  const shallowColor = useMemo(
    () => (hasIceFloes ? new THREE.Color('#1B5E86') : new THREE.Color('#20739E')),
    [hasIceFloes]
  );
  const fogColor = useMemo(
    () => (hasIceFloes ? new THREE.Color('#08101E') : new THREE.Color('#0E1726')),
    [hasIceFloes]
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWaveHeight: { value: waveHeight },
      uDeepColor: { value: deepColor },
      uShallowColor: { value: shallowColor },
      uSunColor: { value: new THREE.Color('#FFF5DB') },
      uSunPosition: { value: new THREE.Vector3(60, 80, 60) },
      uFogColor: { value: fogColor },
      uFogNear: { value: 40.0 },
      uFogFar: { value: 2400.0 }
    }),
    [waveHeight, deepColor, shallowColor, fogColor]
  );

  useFrame(({ clock, camera }) => {
    const time = clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uWaveHeight.value = waveHeight;
    }
    if (skirtMaterialRef.current) {
      skirtMaterialRef.current.uniforms.uTime.value = time;
      skirtMaterialRef.current.uniforms.uWaveHeight.value = waveHeight;
    }

    // Grid snapping: Center the infinite ocean grid around camera without vertex shimmering
    const gridSize = 2.0; // 2m grid resolution
    const snapX = Math.floor(camera.position.x / gridSize) * gridSize;
    const snapZ = Math.floor(camera.position.z / gridSize) * gridSize;

    if (meshRef.current) {
      meshRef.current.position.set(snapX, 0, snapZ);
      meshRef.current.rotation.set(-Math.PI / 2, 0, 0);
    }
    if (outerSkirtRef.current) {
      outerSkirtRef.current.position.set(snapX, -0.05, snapZ);
      outerSkirtRef.current.rotation.set(-Math.PI / 2, 0, 0);
    }
  });

  return (
    <group>
      {/* 1. High-Detail Inner Ocean Mesh (240m x 240m, 160x160 vertices) */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[240, 240, 160, 160]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={OceanShader.vertexShader}
          fragmentShader={OceanShader.fragmentShader}
          uniforms={uniforms}
          side={THREE.DoubleSide}
          transparent={true}
          depthWrite={true}
        />
      </mesh>

      {/* 2. Vast Outer Horizon Skirt (Extends smoothly to 4000m horizon) */}
      <mesh ref={outerSkirtRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[115, 4000, 64, 16]} />
        <shaderMaterial
          ref={skirtMaterialRef}
          vertexShader={OceanShader.vertexShader}
          fragmentShader={OceanShader.fragmentShader}
          uniforms={uniforms}
          side={THREE.DoubleSide}
          transparent={true}
          depthWrite={true}
        />
      </mesh>

      {/* 3. Deep Ocean Abyss Bed */}
      <mesh position={[0, -250, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6000, 6000]} />
        <meshBasicMaterial color="#02060D" />
      </mesh>
    </group>
  );
};
