import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { X, Waves, Info, Sliders, ShieldCheck } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import {
  AVAILABLE_OCEAN_DATASETS,
  DepthObservation,
  getObservationAtDepth
} from '../../data/oceanographicData';

export const OceanDataExplorer: React.FC = () => {
  const activeModal = useSimulationStore((state) => state.activeModal);
  const closeModal = useSimulationStore((state) => state.closeModal);
  const pod = useSimulationStore((state) => state.pod);
  const setTargetDepth = useSimulationStore((state) => state.setTargetDepth);

  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(AVAILABLE_OCEAN_DATASETS[0].id);
  const [selectedDepth, setSelectedDepth] = useState<number | 'AUTO'>(50);
  const [selectedVariable, setSelectedVariable] = useState<'TEMP' | 'SALINITY' | 'DO' | 'NUTRIENTS'>('TEMP');
  const [compareDepths, setCompareDepths] = useState<number[]>([10, 50, 100]);
  const [viewMode, setViewMode] = useState<'PROFILE' | 'COMPARISON' | 'METADATA'>('PROFILE');

  if (activeModal !== 'OCEAN_DATA') return null;

  const currentDataset = AVAILABLE_OCEAN_DATASETS.find((d) => d.id === selectedDatasetId) || AVAILABLE_OCEAN_DATASETS[0];

  const profileChartData = currentDataset.depths.map((d) => ({
    depth: d.depthM,
    temp: d.temperatureC,
    salinity: d.salinityPsu,
    do: d.dissolvedOxygenMgL,
    nitrate: d.nitrateUmolKg,
    phosphate: d.phosphateUmolKg,
    silicate: d.silicateUmolKg,
    pressure: d.pressureDbar,
    density: d.densitySigmaThetaKgM3
  }));

  const activeDepthNumber = selectedDepth === 'AUTO' ? pod.depthCurrentM : selectedDepth;
  const currentObs: DepthObservation = getObservationAtDepth(currentDataset, activeDepthNumber);

  const comparisonData = compareDepths.map((depthVal) => ({
    depth: depthVal,
    obs: getObservationAtDepth(currentDataset, depthVal)
  }));

  const depthPresets: (number | 'AUTO')[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 'AUTO'];

  const toggleCompareDepth = (d: number) => {
    if (compareDepths.includes(d)) {
      if (compareDepths.length > 1) {
        setCompareDepths(compareDepths.filter((x) => x !== d));
      }
    } else {
      setCompareDepths([...compareDepths, d].sort((a, b) => a - b));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-5xl bg-navy-900 border border-navy-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-gray-200">
        {/* Header */}
        <div className="h-14 bg-navy-950 px-6 flex items-center justify-between border-b border-navy-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-base tracking-wide">
                  SCIENTIFIC OCEANOGRAPHIC DATA EXPLORER
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {currentDataset.dataType}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                NOAA World Ocean Atlas 2023 &amp; Calibrated Argo GDAC Climatological Profiles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-navy-900 p-0.5 rounded-lg border border-navy-800 text-xs">
              <button
                onClick={() => setViewMode('PROFILE')}
                className={'px-3 py-1 rounded transition-colors font-medium ' + (viewMode === 'PROFILE' ? 'bg-orange-500 text-white font-bold' : 'text-gray-400 hover:text-white')}
              >
                Depth Profile Plot
              </button>
              <button
                onClick={() => setViewMode('COMPARISON')}
                className={'px-3 py-1 rounded transition-colors font-medium ' + (viewMode === 'COMPARISON' ? 'bg-orange-500 text-white font-bold' : 'text-gray-400 hover:text-white')}
              >
                Multi-Depth Comparison
              </button>
              <button
                onClick={() => setViewMode('METADATA')}
                className={'px-3 py-1 rounded transition-colors font-medium ' + (viewMode === 'METADATA' ? 'bg-orange-500 text-white font-bold' : 'text-gray-400 hover:text-white')}
              >
                Dataset Attribution
              </button>
            </div>

            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg hover:bg-navy-800 text-gray-400 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dataset Sub-header */}
        <div className="bg-navy-950/80 px-6 py-2.5 border-b border-navy-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-semibold">PRIMARY DATASET:</span>
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="bg-navy-900 text-white border border-navy-700 px-3 py-1 rounded text-xs font-semibold focus:outline-none focus:border-orange-500"
            >
              {AVAILABLE_OCEAN_DATASETS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.datasetName} · {d.region}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span>COORD: <strong className="text-gray-200">{currentDataset.coordinates.lat}, {currentDataset.coordinates.lon}</strong></span>
            <span>PERIOD: <strong className="text-gray-200">{currentDataset.climatologyPeriod}</strong></span>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-5">
          {viewMode === 'PROFILE' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-navy-950 p-4 rounded-xl border border-navy-800">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-orange-400" />
                    <span>VARIABLE SELECTION</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedVariable('TEMP')}
                      className={'p-2 rounded-lg text-left border transition-all text-xs ' + (selectedVariable === 'TEMP' ? 'bg-orange-500/15 border-orange-500 text-orange-400 font-bold' : 'border-navy-800 hover:border-navy-700 text-gray-300')}
                    >
                      <div className="font-bold text-[11px]">Temperature</div>
                      <div className="text-[10px] text-gray-400">In-situ (°C)</div>
                    </button>
                    <button
                      onClick={() => setSelectedVariable('SALINITY')}
                      className={'p-2 rounded-lg text-left border transition-all text-xs ' + (selectedVariable === 'SALINITY' ? 'bg-orange-500/15 border-orange-500 text-orange-400 font-bold' : 'border-navy-800 hover:border-navy-700 text-gray-300')}
                    >
                      <div className="font-bold text-[11px]">Salinity</div>
                      <div className="text-[10px] text-gray-400">Practical (PSU)</div>
                    </button>
                    <button
                      onClick={() => setSelectedVariable('DO')}
                      className={'p-2 rounded-lg text-left border transition-all text-xs ' + (selectedVariable === 'DO' ? 'bg-orange-500/15 border-orange-500 text-orange-400 font-bold' : 'border-navy-800 hover:border-navy-700 text-gray-300')}
                    >
                      <div className="font-bold text-[11px]">Dissolved O₂</div>
                      <div className="text-[10px] text-gray-400">Oxygen (mg/L)</div>
                    </button>
                    <button
                      onClick={() => setSelectedVariable('NUTRIENTS')}
                      className={'p-2 rounded-lg text-left border transition-all text-xs ' + (selectedVariable === 'NUTRIENTS' ? 'bg-orange-500/15 border-orange-500 text-orange-400 font-bold' : 'border-navy-800 hover:border-navy-700 text-gray-300')}
                    >
                      <div className="font-bold text-[11px]">Nitrate (NO₃)</div>
                      <div className="text-[10px] text-gray-400">Nutrient (µmol/kg)</div>
                    </button>
                  </div>
                </div>

                <div className="bg-navy-950 p-4 rounded-xl border border-navy-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      TARGET DEPTH SELECTION
                    </span>
                    <span className="text-[11px] font-bold text-orange-400">
                      {selectedDepth === 'AUTO' ? ('AUTO (Pod: ' + pod.depthCurrentM.toFixed(1) + 'm)') : (selectedDepth + 'm')}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {depthPresets.map((preset) => {
                      const isSel = selectedDepth === preset;
                      return (
                        <button
                          key={String(preset)}
                          onClick={() => {
                            setSelectedDepth(preset);
                            if (typeof preset === 'number') {
                              setTargetDepth(preset);
                            }
                          }}
                          className={'py-1.5 rounded text-xs font-bold transition-all text-center border ' + (isSel ? 'bg-orange-500 text-white border-orange-400' : 'bg-navy-900 border-navy-800 text-gray-300 hover:bg-navy-800')}
                        >
                          {preset === 'AUTO' ? 'AUTO' : (preset + 'm')}
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-[10px] text-gray-400 leading-relaxed">
                    Selecting a depth commands the CTD profiling winch and extracts the corresponding NOAA/Argo physical observations.
                  </div>
                </div>

                <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-navy-800 pb-2">
                    <span className="text-xs font-bold text-white">
                      OBSERVATION AT {currentObs.depthM} m
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-navy-900 text-emerald-400 border border-emerald-500/30 font-semibold">
                      {currentObs.qualityFlag} QC
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Temperature:</span>
                      <strong className="text-white font-bold">{currentObs.temperatureC} °C</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Salinity:</span>
                      <strong className="text-white font-bold">{currentObs.salinityPsu} PSU</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Dissolved Oxygen:</span>
                      <strong className="text-white font-bold">{currentObs.dissolvedOxygenMgL} mg/L</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Nitrate (NO₃):</span>
                      <strong className="text-white font-bold">{currentObs.nitrateUmolKg} µmol/kg</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Pressure:</span>
                      <strong className="text-white font-bold">{currentObs.pressureDbar} dbar</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Sound Velocity:</span>
                      <strong className="text-white font-bold">{currentObs.soundVelocityMs} m/s</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 bg-navy-950 p-4 rounded-xl border border-navy-800 flex flex-col min-h-[380px]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      VERTICAL DEPTH PROFILE — {selectedVariable === 'TEMP' ? 'TEMPERATURE (°C)' : selectedVariable === 'SALINITY' ? 'SALINITY (PSU)' : selectedVariable === 'DO' ? 'DISSOLVED OXYGEN (mg/L)' : 'NITRATE (µmol/kg)'}
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Standard Oceanographic Plot: Depth on Y-axis (0m Surface down to 100m) vs Parameter on X-axis
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
                    <span>{currentDataset.datasetName}</span>
                  </div>
                </div>

                <div className="flex-1 w-full h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={profileChartData}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1C2E52" opacity={0.6} />
                      <XAxis
                        type="number"
                        dataKey={
                          selectedVariable === 'TEMP'
                            ? 'temp'
                            : selectedVariable === 'SALINITY'
                            ? 'salinity'
                            : selectedVariable === 'DO'
                            ? 'do'
                            : 'nitrate'
                        }
                        stroke="#E5E5E5"
                        fontSize={10}
                        tickLine={false}
                        domain={['auto', 'auto']}
                        label={{
                          value:
                            selectedVariable === 'TEMP'
                              ? 'Temperature (°C)'
                              : selectedVariable === 'SALINITY'
                              ? 'Practical Salinity (PSU)'
                              : selectedVariable === 'DO'
                              ? 'Dissolved Oxygen (mg/L)'
                              : 'Nitrate NO₃ (µmol/kg)',
                          position: 'insideBottom',
                          offset: -12,
                          fill: '#94A3B8',
                          fontSize: 10
                        }}
                      />
                      <YAxis
                        type="number"
                        dataKey="depth"
                        reversed
                        stroke="#E5E5E5"
                        fontSize={10}
                        tickLine={false}
                        domain={[0, 100]}
                        label={{
                          value: 'Depth (meters)',
                          angle: -90,
                          position: 'insideLeft',
                          fill: '#94A3B8',
                          fontSize: 10
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#060B16',
                          borderColor: '#FCA311',
                          color: '#FFFFFF',
                          fontSize: 11,
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                        }}
                        formatter={(val) => [
                          val + ' ' + (selectedVariable === 'TEMP' ? '°C' : selectedVariable === 'SALINITY' ? 'PSU' : selectedVariable === 'DO' ? 'mg/L' : 'µmol/kg'),
                          selectedVariable === 'TEMP' ? 'Temperature' : selectedVariable === 'SALINITY' ? 'Salinity' : selectedVariable === 'DO' ? 'Dissolved O₂' : 'Nitrate'
                        ]}
                        labelFormatter={(depth) => 'Depth: ' + depth + ' m'}
                      />
                      <Line
                        type="monotone"
                        dataKey={
                          selectedVariable === 'TEMP'
                            ? 'temp'
                            : selectedVariable === 'SALINITY'
                            ? 'salinity'
                            : selectedVariable === 'DO'
                            ? 'do'
                            : 'nitrate'
                        }
                        stroke="#FCA311"
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: '#FCA311', stroke: '#060B16', strokeWidth: 1.5 }}
                        activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#FCA311', strokeWidth: 2 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'COMPARISON' && (
            <div className="flex flex-col gap-5">
              <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">MULTI-DEPTH CLIMATOLOGICAL COMPARISON</h3>
                  <p className="text-[11px] text-gray-400">
                    Toggle standard depth horizons to compare physical and chemical gradients across the Antarctic water column.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleCompareDepth(d)}
                      className={'px-2.5 py-1 rounded text-xs font-bold transition-all border ' + (compareDepths.includes(d) ? 'bg-orange-500 text-white border-orange-400' : 'bg-navy-900 border-navy-800 text-gray-400 hover:text-white')}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-navy-950 rounded-xl border border-navy-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-navy-900 text-gray-300 border-b border-navy-800">
                    <tr>
                      <th className="p-3 font-bold text-orange-400">Depth Horizon</th>
                      <th className="p-3 font-bold">Temperature (°C)</th>
                      <th className="p-3 font-bold">Salinity (PSU)</th>
                      <th className="p-3 font-bold">Dissolved O₂ (mg/L)</th>
                      <th className="p-3 font-bold">Nitrate NO₃ (µmol/kg)</th>
                      <th className="p-3 font-bold">Hydrostatic Pressure (dbar)</th>
                      <th className="p-3 font-bold">Water Mass Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800/60 text-gray-200">
                    {comparisonData.map(({ depth, obs }) => {
                      let waterMass = 'Antarctic Surface Water (AASW)';
                      if (depth >= 50 && depth <= 100) waterMass = 'Winter Water (WW) Layer';
                      if (depth > 100) waterMass = 'Upper Circumpolar Deep Water (UCDW)';
                      return (
                        <tr key={depth} className="hover:bg-navy-900/40 transition-colors">
                          <td className="p-3 font-bold text-white">{depth} m</td>
                          <td className="p-3">{obs.temperatureC} °C</td>
                          <td className="p-3">{obs.salinityPsu} PSU</td>
                          <td className="p-3">{obs.dissolvedOxygenMgL} mg/L</td>
                          <td className="p-3">{obs.nitrateUmolKg} µmol/kg</td>
                          <td className="p-3">{obs.pressureDbar} dbar</td>
                          <td className="p-3 text-[11px] text-gray-400">{waterMass}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {viewMode === 'METADATA' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-navy-950 p-5 rounded-xl border border-navy-800 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>DATASET PROVENANCE &amp; CREDENTIALS</span>
                </div>
                <h3 className="text-base font-bold text-white">{currentDataset.datasetName}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{currentDataset.description}</p>

                <div className="space-y-2 text-xs pt-2 border-t border-navy-800">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Authoritative Source:</span>
                    <span className="text-white font-semibold text-right">{currentDataset.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Spatial Grid Resolution:</span>
                    <span className="text-white font-semibold">0.25° Objectively Analysed Decadal Field</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Survey Geographic Region:</span>
                    <span className="text-white font-semibold text-right">{currentDataset.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Representative Coordinates:</span>
                    <span className="text-white font-semibold">{currentDataset.coordinates.lat}, {currentDataset.coordinates.lon}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Climatology Period:</span>
                    <span className="text-white font-semibold">{currentDataset.climatologyPeriod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quality Control Standard:</span>
                    <span className="text-emerald-400 font-semibold">WOD/Argo Standard Flag 1 (Good Data)</span>
                  </div>
                </div>
              </div>

              <div className="bg-navy-950 p-5 rounded-xl border border-navy-800 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
                  <Info className="w-4 h-4" />
                  <span>HOW O-TREX LEVERAGES OCEANOGRAPHIC DATA</span>
                </div>
                <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
                  <p>
                    <strong className="text-white">1. Dynamic Baseline Profiling:</strong> O-TREX carries preloaded NOAA WOA23 regional climatology fields on its companion computer (Raspberry Pi 4). Real-time CTD sensor streams are continuously evaluated against this historical baseline.
                  </p>
                  <p>
                    <strong className="text-white">2. Multivariate Anomaly Detection:</strong> When the edge AI detects sustained multi-parameter deviations (&gt;3σ from climatology) in surface water masses, it automatically triggers an adaptive winch profile.
                  </p>
                  <p>
                    <strong className="text-white">3. Transparent Quality Flagging:</strong> All data transmitted via satellite or LoRa includes standard IOC/IODE quality flags (Good, Suspect, Invalid) to preserve scientific credibility.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-10 bg-navy-950 px-6 border-t border-navy-800 flex items-center justify-between text-[11px] text-gray-400 flex-shrink-0">
          <span>
            DATA MODE: <strong className="text-emerald-400">{currentDataset.dataType}</strong> · {currentDataset.source}
          </span>
          <span className="text-gray-500">
            NOAA World Ocean Atlas 2023 · Objectively Analysed Climatology
          </span>
        </div>
      </div>
    </div>
  );
};
