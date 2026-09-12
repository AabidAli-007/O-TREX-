import React, { useState } from 'react';
import {
  X,
  BarChart3,
  Download,
  FileSpreadsheet,
  Droplets,
  Thermometer
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useSimulationStore } from '../../store/useSimulationStore';

export const AnalyticsDrawer: React.FC = () => {
  const closeDrawer = useSimulationStore((state) => state.closeDrawer);
  const sensorHistory = useSimulationStore((state) => state.sensorHistory);
  const pod = useSimulationStore((state) => state.pod);
  const [activeTab, setActiveTab] = useState<'TIME_SERIES' | 'DEPTH_PROFILE'>('TIME_SERIES');

  // Prepare time-series dataset
  const timeData = sensorHistory.slice(-30).map((r, i) => ({
    time: `-${(30 - i) * 2}s`,
    temp: Number(r.temperatureC.toFixed(2)),
    do: Number(r.dissolvedOxygenMgL.toFixed(2)),
    turbidity: Number(r.turbidityNtu.toFixed(1)),
    salinity: Number(r.salinityPsu.toFixed(2))
  }));

  // Prepare vertical depth profile data
  const depthData = [...pod.verticalProfilePoints]
    .sort((a, b) => a.depthM - b.depthM)
    .map((p) => ({
      depth: Number(p.depthM.toFixed(1)),
      temp: Number(p.temperatureC.toFixed(2)),
      do: Number(p.dissolvedOxygenMgL.toFixed(2)),
      salinity: Number(p.salinityPsu.toFixed(2)),
      turbidity: Number(p.turbidityNtu.toFixed(1))
    }));

  const handleExportCSV = () => {
    const headers = 'Timestamp,Depth_m,Temperature_C,Salinity_PSU,DO_mgL,Turbidity_NTU\n';
    const rows = sensorHistory
      .map(
        (r) =>
          `${new Date(r.timestamp).toISOString()},${r.pressureDbar.toFixed(2)},${r.temperatureC.toFixed(
            3
          )},${r.salinityPsu.toFixed(3)},${r.dissolvedOxygenMgL.toFixed(3)},${r.turbidityNtu.toFixed(2)}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OTREX_CTD_Export_${Date.now()}.csv`;
    a.click();
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(sensorHistory, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OTREX_MissionData_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="w-105 bg-navy-950/95 backdrop-blur-lg border-l border-navy-800 h-full flex flex-col font-sans text-xs select-none shadow-2xl text-gray-200">
      {/* Header */}
      <div className="h-12 bg-navy-900 px-4 flex items-center justify-between border-b border-navy-800">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-orange-400" />
          <span className="font-extrabold text-white text-sm">OCEAN DATA CHARTS</span>
        </div>
        <button
          onClick={closeDrawer}
          className="p-1 hover:bg-navy-800 rounded text-gray-400 hover:text-white"
          title="Close Drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-navy-900 p-1 rounded-lg border border-navy-800">
          <button
            onClick={() => setActiveTab('TIME_SERIES')}
            className={`py-1.5 rounded text-[11px] font-bold transition-colors ${
              activeTab === 'TIME_SERIES'
                ? 'bg-orange-500 text-navy-950 font-extrabold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Surface Time Series
          </button>
          <button
            onClick={() => setActiveTab('DEPTH_PROFILE')}
            className={`py-1.5 rounded text-[11px] font-bold transition-colors ${
              activeTab === 'DEPTH_PROFILE'
                ? 'bg-orange-500 text-navy-950 font-extrabold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Depth Profile ({pod.verticalProfilePoints.length} pts)
          </button>
        </div>

        {/* Chart 1: Temperature & Dissolved Oxygen */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5" />
              <span>TEMP (°C) & DISSOLVED OXYGEN (mg/L)</span>
            </span>
            <span className="text-[9px] text-gray-400">Orange: Temp · White: DO</span>
          </div>

          <div className="h-44 w-full bg-navy-950 rounded p-1 border border-navy-800">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeTab === 'TIME_SERIES' ? timeData : depthData}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1E293B" />
                <XAxis
                  dataKey={activeTab === 'TIME_SERIES' ? 'time' : 'depth'}
                  stroke="#64748B"
                  fontSize={9}
                  tickLine={false}
                />
                <YAxis stroke="#64748B" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', fontSize: '10px' }}
                />
                <Line type="monotone" dataKey="temp" stroke="#FCA311" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="do" stroke="#FFFFFF" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Salinity & Turbidity */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white font-bold flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-orange-400" />
              <span>SALINITY (PSU) & TURBIDITY (NTU)</span>
            </span>
            <span className="text-[9px] text-gray-400">White: Salinity · Orange: Turbidity</span>
          </div>

          <div className="h-44 w-full bg-navy-950 rounded p-1 border border-navy-800">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeTab === 'TIME_SERIES' ? timeData : depthData}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1E293B" />
                <XAxis
                  dataKey={activeTab === 'TIME_SERIES' ? 'time' : 'depth'}
                  stroke="#64748B"
                  fontSize={9}
                  tickLine={false}
                />
                <YAxis stroke="#64748B" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', fontSize: '10px' }}
                />
                <Line type="monotone" dataKey="salinity" stroke="#FFFFFF" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="turbidity" stroke="#FCA311" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Export Buttons */}
        <div className="bg-navy-900 rounded-lg p-3 border border-navy-800 flex flex-col gap-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">SCIENTIFIC DATA EXPORT</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-navy-950 hover:bg-navy-800 text-orange-400 border border-orange-500/30 p-2 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>EXPORT CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="bg-navy-950 hover:bg-navy-800 text-white border border-navy-800 p-2 rounded text-[11px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" />
              <span>EXPORT JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
