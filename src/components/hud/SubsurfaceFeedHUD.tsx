import React from 'react';
import {
  Activity,
  Droplets,
  Thermometer,
  Gauge,
  Eye,
  Radio,
  Wind,
  Cpu
} from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const SubsurfaceFeedHUD: React.FC = () => {
  const cameraMode = useSimulationStore((state) => state.cameraMode);
  const setCameraMode = useSimulationStore((state) => state.setCameraMode);
  const pod = useSimulationStore((state) => state.pod);
  const sensorHistory = useSimulationStore((state) => state.sensorHistory);

  if (cameraMode !== 'UNDERWATER_POD') return null;

  const latestReading = pod.verticalProfilePoints.length > 0
    ? pod.verticalProfilePoints[pod.verticalProfilePoints.length - 1]
    : null;

  const latestSurface = sensorHistory[sensorHistory.length - 1] || null;

  const depthPct = Math.min(100, (pod.depthCurrentM / Math.max(1, pod.depthTargetM)) * 100);

  return (
    <div className="absolute inset-0 pointer-events-none z-15 font-mono select-none flex flex-col justify-between p-4">

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)',
          zIndex: 0
        }}
      />

      {/* 1. Header Banner */}
      <div className="relative z-10 flex items-center justify-between pointer-events-auto">
        <div
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl"
          style={{
            background: 'rgba(6, 11, 22, 0.90)',
            border: '1px solid rgba(34, 211, 238, 0.4)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(34,211,238,0.08)'
          }}
        >
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute inset-0" />
          </div>
          <span className="font-black text-xs tracking-widest" style={{ color: '#A5F3FC' }}>
            SUBSEA OPTICAL FEED
          </span>
          <div
            className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide"
            style={{
              background: 'rgba(34,211,238,0.15)',
              color: '#67E8F9',
              border: '1px solid rgba(34,211,238,0.3)'
            }}
          >
            1080p60 · ACOUSTIC TETHER
          </div>
        </div>

        {/* Return to Surface button */}
        <button
          onClick={() => setCameraMode('FOLLOW')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs transition-all pointer-events-auto"
          style={{
            background: 'rgba(6,11,22,0.90)',
            color: '#FDB642',
            border: '1px solid rgba(252,163,17,0.35)',
            backdropFilter: 'blur(16px)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'rgba(252,163,17,0.9)';
            el.style.color = '#060B16';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'rgba(6,11,22,0.90)';
            el.style.color = '#FDB642';
          }}
          title="Return to surface view [X]"
        >
          <Eye className="w-3.5 h-3.5" />
          SURFACE CAM [X]
        </button>
      </div>

      {/* 2. Center reticle + depth scale */}
      <div className="relative z-10 flex-1 flex items-center justify-between px-8">
        {/* Left — profiler depth scale */}
        <div
          className="flex flex-col items-center gap-2 p-3 rounded-xl"
          style={{
            background: 'rgba(6,11,22,0.85)',
            border: '1px solid rgba(34,211,238,0.2)',
            backdropFilter: 'blur(12px)',
            minWidth: '80px'
          }}
        >
          <span className="text-[8px] text-gray-600 tracking-widest uppercase">DEPTH</span>

          {/* Vertical progress bar */}
          <div
            className="w-3 h-32 rounded-full relative overflow-hidden"
            style={{ background: 'rgba(28,46,82,0.8)' }}
          >
            <div
              className="absolute bottom-0 w-full rounded-full transition-all duration-500"
              style={{
                height: `${depthPct}%`,
                background: 'linear-gradient(0deg, #22D3EE, rgba(34,211,238,0.4))',
                boxShadow: '0 0 8px rgba(34,211,238,0.5)'
              }}
            />
          </div>

          <span className="text-xl font-black tabular-nums" style={{ color: '#67E8F9' }}>
            {pod.depthCurrentM.toFixed(0)}
          </span>
          <span className="text-[9px] text-gray-600">m</span>

          <div
            className="text-[9px] font-bold px-2 py-0.5 rounded"
            style={{
              background: 'rgba(252,163,17,0.1)',
              color: '#FDB642',
              border: '1px solid rgba(252,163,17,0.2)'
            }}
          >
            {pod.status}
          </div>
        </div>

        {/* Center reticle */}
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Outer sonar ring */}
            <div
              className="w-52 h-52 rounded-full border-2 flex items-center justify-center animate-pulse"
              style={{ borderColor: 'rgba(34,211,238,0.2)' }}
            >
              {/* Mid ring */}
              <div
                className="w-36 h-36 rounded-full border flex items-center justify-center"
                style={{ borderColor: 'rgba(34,211,238,0.12)' }}
              >
                {/* Inner target box */}
                <div
                  className="w-16 h-16 rounded-lg border flex items-center justify-center relative"
                  style={{ borderColor: 'rgba(34,211,238,0.5)' }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#FCA311', boxShadow: '0 0 8px rgba(252,163,17,0.7)' }}
                  />
                  <span
                    className="absolute -top-5 text-[8px] font-bold tracking-widest"
                    style={{ color: '#67E8F9' }}
                  >
                    POD LOCK
                  </span>
                </div>
              </div>
            </div>

            {/* Crosshairs */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-full h-px" style={{ background: 'rgba(34,211,238,0.1)' }} />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="h-full w-px" style={{ background: 'rgba(34,211,238,0.1)' }} />
            </div>

            {/* Corner brackets */}
            {[
              'top-0 left-0 border-t-2 border-l-2',
              'top-0 right-0 border-t-2 border-r-2',
              'bottom-0 left-0 border-b-2 border-l-2',
              'bottom-0 right-0 border-b-2 border-r-2',
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute w-4 h-4 ${cls}`}
                style={{ borderColor: '#22D3EE' }}
              />
            ))}
          </div>
        </div>

        {/* Right — live CTD readings */}
        <div
          className="flex flex-col gap-2 p-3 rounded-xl"
          style={{
            background: 'rgba(6,11,22,0.85)',
            border: '1px solid rgba(28,46,82,0.6)',
            backdropFilter: 'blur(12px)',
            minWidth: '140px'
          }}
        >
          <span className="text-[8px] text-gray-600 tracking-widest uppercase mb-1">LIVE CTD DATA</span>

          {[
            { icon: Thermometer, label: 'TEMP', value: latestReading ? `${latestReading.temperatureC.toFixed(2)}°C` : (latestSurface ? `${latestSurface.temperatureC.toFixed(2)}°C` : '-1.40°C'), color: '#FDB642' },
            { icon: Droplets, label: 'DO', value: latestReading ? `${latestReading.dissolvedOxygenMgL.toFixed(2)} mg/L` : (latestSurface ? `${latestSurface.dissolvedOxygenMgL.toFixed(2)} mg/L` : '7.85 mg/L'), color: '#67E8F9' },
            { icon: Gauge, label: 'SAL', value: latestReading ? `${latestReading.salinityPsu.toFixed(2)} PSU` : (latestSurface ? `${latestSurface.salinityPsu.toFixed(2)} PSU` : '34.20 PSU'), color: '#86EFAC' },
            { icon: Activity, label: 'TURB', value: latestReading ? `${latestReading.turbidityNtu.toFixed(2)} NTU` : (latestSurface ? `${latestSurface.turbidityNtu.toFixed(2)} NTU` : '0.45 NTU'), color: '#FCD34D' },
            { icon: Wind, label: 'PRES', value: latestReading ? `${(latestReading.temperatureC * 0.1 + pod.depthCurrentM * 0.1).toFixed(1)} dbar` : `${pod.depthCurrentM.toFixed(1)} dbar`, color: '#C4B5FD' },
            { icon: Cpu, label: 'pH', value: latestReading ? `${(7.8 + Math.random() * 0.2).toFixed(2)}` : '7.92', color: '#F9A8D4' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-3 h-3 flex-shrink-0" style={{ color }} />
              <div className="flex flex-col leading-none">
                <span className="text-[7px] text-gray-700 tracking-widest">{label}</span>
                <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Footer telemetry strip */}
      <div className="relative z-10 flex items-center justify-between pointer-events-auto">
        {/* Acoustic ping */}
        <div
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl"
          style={{
            background: 'rgba(6, 11, 22, 0.90)',
            border: '1px solid rgba(28,46,82,0.6)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" style={{ color: '#22D3EE' }} />
          <span className="text-[10px] text-gray-500">USBL ACOUSTIC PING:</span>
          <span className="text-[10px] font-bold" style={{ color: '#67E8F9' }}>38.4 kHz NOMINAL</span>
        </div>

        {/* Target depth indicator */}
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-xl"
          style={{
            background: 'rgba(6, 11, 22, 0.90)',
            border: '1px solid rgba(28,46,82,0.6)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-gray-600 tracking-widest uppercase">TARGET</span>
            <span className="text-sm font-black tabular-nums" style={{ color: '#FDB642' }}>
              {pod.depthTargetM.toFixed(0)}m
            </span>
          </div>
          <div
            className="w-px h-8"
            style={{ background: 'rgba(28,46,82,0.8)' }}
          />
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-gray-600 tracking-widest uppercase">CURRENT</span>
            <span className="text-sm font-black tabular-nums" style={{ color: '#67E8F9' }}>
              {pod.depthCurrentM.toFixed(1)}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
