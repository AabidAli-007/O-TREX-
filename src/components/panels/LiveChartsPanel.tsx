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
import { BarChart3, ChevronUp, ChevronDown } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const LiveChartsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'TIME_SERIES' | 'DEPTH_PROFILE'>('TIME_SERIES');

  const sensorHistory = useSimulationStore((state) => state.sensorHistory);
  const pod = useSimulationStore((state) => state.pod);

  // Prepare time-series dataset (sample every 2nd point for chart smoothness)
  const timeData = sensorHistory.slice(-40).map((r, i) => ({
    time: `-${(40 - i) * 2}s`,
    temp: r.temperatureC,
    do: r.dissolvedOxygenMgL,
    turbidity: r.turbidityNtu,
    salinity: r.salinityPsu
  }));

  // Prepare vertical depth profile data (sort by depth)
  const depthData = [...pod.verticalProfilePoints]
    .sort((a, b) => a.depthM - b.depthM)
    .map((p) => ({
      depth: p.depthM,
      temp: p.temperatureC,
      do: p.dissolvedOxygenMgL,
      salinity: p.salinityPsu,
      turbidity: p.turbidityNtu
    }));

  return (
    <div
      className={`absolute bottom-0 left-0 right-80 bg-navy-900/95 backdrop-blur-md border-t border-navy-700 z-10 transition-all duration-300 font-mono select-none text-gray-200 ${
        isOpen ? 'h-56' : 'h-8'
      }`}
    >
      {/* Header / Collapse Bar */}
      <div className="h-8 bg-navy-950 px-4 flex items-center justify-between border-b border-navy-800 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 font-bold text-white hover:text-orange-400 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-orange-400" />
            <span>REAL-TIME OCEANOGRAPHIC CHARTS</span>
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {isOpen && (
            <div className="flex items-center gap-1 ml-4 bg-navy-900 p-0.5 rounded border border-navy-800 text-[10px]">
              <button
                onClick={() => setActiveTab('TIME_SERIES')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeTab === 'TIME_SERIES'
                    ? 'bg-orange-500 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Time Series (Surface)
              </button>
              <button
                onClick={() => setActiveTab('DEPTH_PROFILE')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeTab === 'DEPTH_PROFILE'
                    ? 'bg-orange-500 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Vertical Depth Profile ({pod.verticalProfilePoints.length} pts)
              </button>
            </div>
          )}
        </div>

        <div className="text-[10px] text-gray-400 hidden md:block">
          SIMULATION DATA — NOT LIVE OCEAN OBSERVATIONS
        </div>
      </div>

      {/* Chart Canvas Body */}
      {isOpen && (
        <div className="h-48 p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {activeTab === 'TIME_SERIES' ? (
            <>
              {/* Chart 1: Temperature & Dissolved Oxygen */}
              <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
                <div className="flex items-center justify-between text-[10px] text-white mb-1">
                  <span className="text-orange-400 font-bold">Temperature (°C) & DO (mg/L)</span>
                  <span className="text-gray-400">Surface Stream</span>
                </div>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#14213D" />
                      <XAxis dataKey="time" stroke="#E5E5E5" fontSize={9} tickLine={false} />
                      <YAxis stroke="#E5E5E5" fontSize={9} domain={['auto', 'auto']} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#14213D', borderColor: '#FCA311', color: '#FFFFFF', fontSize: 10 }} />
                      <Line type="monotone" dataKey="temp" stroke="#FCA311" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="do" stroke="#FFFFFF" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Turbidity Plume (NTU) */}
              <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
                <div className="flex items-center justify-between text-[10px] text-white mb-1">
                  <span className="text-orange-400 font-bold">Nephelometric Turbidity (NTU)</span>
                  <span className="text-gray-400">Optical Scatter</span>
                </div>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#14213D" />
                      <XAxis dataKey="time" stroke="#E5E5E5" fontSize={9} tickLine={false} />
                      <YAxis stroke="#E5E5E5" fontSize={9} domain={[0, 'auto']} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#14213D', borderColor: '#FCA311', color: '#FFFFFF', fontSize: 10 }} />
                      <Line type="monotone" dataKey="turbidity" stroke="#FCA311" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Salinity / Practical Salinity Units */}
              <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col hidden lg:flex">
                <div className="flex items-center justify-between text-[10px] text-white mb-1">
                  <span className="text-orange-400 font-bold">Salinity (PSU)</span>
                  <span className="text-gray-400">Conductivity Derived</span>
                </div>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#14213D" />
                      <XAxis dataKey="time" stroke="#E5E5E5" fontSize={9} tickLine={false} />
                      <YAxis stroke="#E5E5E5" fontSize={9} domain={['auto', 'auto']} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#14213D', borderColor: '#FCA311', color: '#FFFFFF', fontSize: 10 }} />
                      <Line type="monotone" dataKey="salinity" stroke="#E5E5E5" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Depth Profile: Temperature vs Depth (Thermocline) */}
              <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
                <div className="flex items-center justify-between text-[10px] text-white mb-1">
                  <span className="text-orange-400 font-bold">Temperature vs Depth (°C)</span>
                  <span className="text-gray-400">Thermocline Cast</span>
                </div>
                <div className="flex-1 w-full min-h-0">
                  {depthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={depthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#14213D" />
                        <XAxis dataKey="temp" stroke="#E5E5E5" fontSize={9} tickLine={false} label={{ value: '°C', position: 'insideBottom', offset: -2 }} />
                        <YAxis dataKey="depth" reversed stroke="#E5E5E5" fontSize={9} tickLine={false} label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#14213D', borderColor: '#FCA311', color: '#FFFFFF', fontSize: 10 }} />
                        <Line type="monotone" dataKey="temp" stroke="#FCA311" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                      Deploy pod to record vertical CTD profile.
                    </div>
                  )}
                </div>
              </div>

              {/* Depth Profile: Dissolved Oxygen vs Depth (Oxycline) */}
              <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col">
                <div className="flex items-center justify-between text-[10px] text-white mb-1">
                  <span className="text-orange-400 font-bold">Dissolved Oxygen vs Depth (mg/L)</span>
                  <span className="text-gray-400">Oxycline Cast</span>
                </div>
                <div className="flex-1 w-full min-h-0">
                  {depthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={depthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#14213D" />
                        <XAxis dataKey="do" stroke="#E5E5E5" fontSize={9} tickLine={false} label={{ value: 'mg/L', position: 'insideBottom', offset: -2 }} />
                        <YAxis dataKey="depth" reversed stroke="#E5E5E5" fontSize={9} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#14213D', borderColor: '#FCA311', color: '#FFFFFF', fontSize: 10 }} />
                        <Line type="monotone" dataKey="do" stroke="#FFFFFF" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                      Deploy pod to record vertical DO profile.
                    </div>
                  )}
                </div>
              </div>

              {/* Depth Profile: Salinity vs Depth (Halocline) */}
              <div className="bg-navy-950 p-2 rounded border border-navy-800 flex flex-col hidden lg:flex">
                <div className="flex items-center justify-between text-[10px] text-white mb-1">
                  <span className="text-orange-400 font-bold">Salinity vs Depth (PSU)</span>
                  <span className="text-gray-400">Halocline Cast</span>
                </div>
                <div className="flex-1 w-full min-h-0">
                  {depthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={depthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#14213D" />
                        <XAxis dataKey="salinity" stroke="#E5E5E5" fontSize={9} tickLine={false} label={{ value: 'PSU', position: 'insideBottom', offset: -2 }} />
                        <YAxis dataKey="depth" reversed stroke="#E5E5E5" fontSize={9} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#14213D', borderColor: '#FCA311', color: '#FFFFFF', fontSize: 10 }} />
                        <Line type="monotone" dataKey="salinity" stroke="#E5E5E5" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                      Deploy pod to record vertical halocline.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
