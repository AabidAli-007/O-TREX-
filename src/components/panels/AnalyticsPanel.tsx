import React from 'react';
import { X, BarChart3, Download, FileJson, Clock } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { exportSensorHistoryToCSV, exportMissionSummaryJSON } from '../../utils/exportData';

export const AnalyticsPanel: React.FC = () => {
  const activeModal = useSimulationStore((state) => state.activeModal);
  const closeModal = useSimulationStore((state) => state.closeModal);
  const sensorHistory = useSimulationStore((state) => state.sensorHistory);
  const vehicle = useSimulationStore((state) => state.vehicle);
  const score = useSimulationStore((state) => state.score);
  const env = useSimulationStore((state) => state.env);
  const missionLogs = useSimulationStore((state) => state.missionLogs);

  if (activeModal !== 'ANALYTICS') return null;

  // Calculate stats for temperature, DO, turbidity
  const temps = sensorHistory.map((r) => r.temperatureC);
  const dos = sensorHistory.map((r) => r.dissolvedOxygenMgL);
  const turbs = sensorHistory.map((r) => r.turbidityNtu);

  const calcStats = (arr: number[]) => {
    if (arr.length === 0) return { mean: 0, min: 0, max: 0, std: 0 };
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const variance = arr.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / arr.length;
    return {
      mean: Number(mean.toFixed(2)),
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      std: Number(Math.sqrt(variance).toFixed(2))
    };
  };

  const tempStats = calcStats(temps);
  const doStats = calcStats(dos);
  const turbStats = calcStats(turbs);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-mono">
      <div className="w-full max-w-4xl bg-navy-900 border border-navy-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-200">
        {/* Header */}
        <div className="h-14 bg-navy-950 px-6 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-navy-900 text-orange-400 border border-navy-700">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                SCIENTIFIC DATA ANALYTICS & MISSION LOGS
              </h2>
              <p className="text-[11px] text-orange-400">
                Statistical Summary, QA/QC Distribution, Mission Timeline & Data Export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSensorHistoryToCSV(sensorHistory, env.name)}
              className="bg-navy-900 hover:bg-orange-500 hover:text-white text-orange-400 border border-orange-500/40 px-3 py-1 rounded text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => exportMissionSummaryJSON(vehicle, score, sensorHistory, env.name)}
              className="bg-navy-900 hover:bg-orange-500 hover:text-white text-orange-400 border border-orange-500/40 px-3 py-1 rounded text-xs flex items-center gap-1.5 transition-colors"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={closeModal}
              className="p-1.5 rounded hover:bg-navy-800 text-gray-400 hover:text-white ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 text-xs">
          {/* Mission Performance Metrics */}
          <div>
            <h3 className="font-bold text-white text-xs mb-2 uppercase tracking-wider">
              Mission Efficiency & Scoring Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                <span className="text-[10px] text-gray-400 block">TOTAL SCORE</span>
                <span className="text-xl font-bold text-orange-400">{score.totalScore}</span>
              </div>
              <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                <span className="text-[10px] text-gray-400 block">SCIENTIFIC VALUE</span>
                <span className="text-xl font-bold text-white">{score.scientificValuePct}%</span>
              </div>
              <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                <span className="text-[10px] text-gray-400 block">ENERGY EFFICIENCY</span>
                <span className="text-xl font-bold text-white">{score.energyEfficiencyPct}%</span>
              </div>
              <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
                <span className="text-[10px] text-gray-400 block">DATA QUALITY (QA/QC)</span>
                <span className="text-xl font-bold text-orange-400">{score.dataQualityPct}%</span>
              </div>
            </div>
          </div>

          {/* Statistical Distribution Table */}
          <div>
            <h3 className="font-bold text-white text-xs mb-2 uppercase tracking-wider">
              Oceanographic Sensor Statistical Distribution (N={sensorHistory.length})
            </h3>
            <div className="border border-navy-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-navy-950 text-gray-300 border-b border-navy-800">
                  <tr>
                    <th className="p-2.5">Parameter</th>
                    <th className="p-2.5">Unit</th>
                    <th className="p-2.5">Mean</th>
                    <th className="p-2.5">Min</th>
                    <th className="p-2.5">Max</th>
                    <th className="p-2.5">Std Dev (σ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 text-gray-300">
                  <tr className="hover:bg-navy-950/40">
                    <td className="p-2.5 font-bold text-white">Water Temperature</td>
                    <td className="p-2.5 text-gray-400">°C</td>
                    <td className="p-2.5 text-orange-400 font-bold">{tempStats.mean}</td>
                    <td className="p-2.5">{tempStats.min}</td>
                    <td className="p-2.5">{tempStats.max}</td>
                    <td className="p-2.5">{tempStats.std}</td>
                  </tr>
                  <tr className="hover:bg-navy-950/40">
                    <td className="p-2.5 font-bold text-white">Dissolved Oxygen</td>
                    <td className="p-2.5 text-gray-400">mg/L</td>
                    <td className="p-2.5 text-orange-400 font-bold">{doStats.mean}</td>
                    <td className="p-2.5">{doStats.min}</td>
                    <td className="p-2.5">{doStats.max}</td>
                    <td className="p-2.5">{doStats.std}</td>
                  </tr>
                  <tr className="hover:bg-navy-950/40">
                    <td className="p-2.5 font-bold text-white">Nephelometric Turbidity</td>
                    <td className="p-2.5 text-gray-400">NTU</td>
                    <td className="p-2.5 text-orange-400 font-bold">{turbStats.mean}</td>
                    <td className="p-2.5">{turbStats.min}</td>
                    <td className="p-2.5">{turbStats.max}</td>
                    <td className="p-2.5">{turbStats.std}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mission Event Logs Timeline */}
          <div>
            <h3 className="font-bold text-white text-xs mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>Event Audit Log & System State Transitions</span>
            </h3>
            <div className="bg-navy-950 p-3 rounded-lg border border-navy-800 max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px]">
              {missionLogs.slice(-15).reverse().map((log) => (
                <div key={log.id} className="flex items-start gap-2 border-b border-navy-900 pb-1">
                  <span className="text-gray-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={`px-1 rounded text-[9px] font-bold shrink-0 ${
                      log.type === 'ANOMALY'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : log.type === 'DECISION'
                        ? 'bg-navy-900 text-orange-400 border border-orange-500/40'
                        : 'bg-navy-900 text-gray-300 border border-navy-800'
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="text-gray-300">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
