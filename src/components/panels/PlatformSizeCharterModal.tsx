import React, { useState } from 'react';
import { X, Ruler, Layers, DollarSign } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

export const PlatformSizeCharterModal: React.FC = () => {
  const activeModal = useSimulationStore((state) => state.activeModal);
  const closeModal = useSimulationStore((state) => state.closeModal);
  const [activeTab, setActiveTab] = useState<'SIZE' | 'CHARTER' | 'COST'>('SIZE');

  if (activeModal !== 'SIZE_CHARTER') return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-mono text-gray-200">
      <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-navy-800 flex items-center justify-between bg-navy-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-wide">
                  O-TREX vs. EXISTING OBSERVATION PLATFORMS
                </h2>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/40 font-bold">
                  SIZE & CHARTER MATRIX
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Physical Scale, Operational Charter, and Cost Differentiation (SIH26065)
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg hover:bg-navy-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-navy-800 bg-navy-950/40 text-xs">
          <button
            onClick={() => setActiveTab('SIZE')}
            className={`px-4 py-2 rounded-t-lg font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'SIZE'
                ? 'border-orange-500 text-orange-400 bg-navy-900'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>PHYSICAL DIMENSIONS & SCALE</span>
          </button>

          <button
            onClick={() => setActiveTab('CHARTER')}
            className={`px-4 py-2 rounded-t-lg font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'CHARTER'
                ? 'border-orange-500 text-orange-400 bg-navy-900'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>OPERATIONAL CHARTER & MANDATE</span>
          </button>

          <button
            onClick={() => setActiveTab('COST')}
            className={`px-4 py-2 rounded-t-lg font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'COST'
                ? 'border-orange-500 text-orange-400 bg-navy-900'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>COST & LOGISTICS FOOTPRINT</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: PHYSICAL DIMENSIONS & SCALE */}
          {activeTab === 'SIZE' && (
            <div className="space-y-4">
              <div className="bg-navy-950/80 border border-navy-800 rounded-xl p-4">
                <h3 className="text-xs font-extrabold text-orange-400 uppercase tracking-wider mb-2">
                  1:1 Physical Scale & Form Factor Comparison
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  O-TREX is designed around a lightweight, portable catamaran form factor (&lt;1.5m, 18 kg) that two operators can deploy by hand without requiring crane-ships or dedicated slipways.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* O-TREX */}
                <div className="bg-navy-950 border-2 border-orange-500/70 rounded-xl p-4 flex flex-col gap-2 shadow-lg shadow-orange-500/10">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm">O-TREX (OUR PROPOSAL)</span>
                    <span className="text-[10px] bg-orange-500 text-navy-950 px-1.5 py-0.5 rounded font-bold">
                      PROPOSAL
                    </span>
                  </div>
                  <div className="text-[11px] text-orange-300 font-bold">Autonomous Profiling USV</div>
                  <ul className="space-y-1 text-gray-300 text-[11px] border-t border-navy-800 pt-2">
                    <li><strong>Length:</strong> 1.40 m</li>
                    <li><strong>Beam (Width):</strong> 0.85 m</li>
                    <li><strong>Draft (Waterline):</strong> 0.18 m (Hulls) / 0.40 m (Rudder)</li>
                    <li><strong>Displacement (Weight):</strong> 18.0 kg</li>
                    <li><strong>Form Factor:</strong> Dual fiberglass catamaran + solar deck</li>
                    <li><strong>Profiling Bay:</strong> 0–100m motorized Kevlar winch</li>
                    <li><strong>Propulsion:</strong> Twin azimuth brushless thrusters</li>
                  </ul>
                </div>

                {/* Argo Float */}
                <div className="bg-navy-950 border border-navy-800 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm">ARGO PROFILING FLOAT</span>
                    <span className="text-[10px] bg-navy-800 text-gray-300 px-1.5 py-0.5 rounded">
                      GLOBAL REF
                    </span>
                  </div>
                  <div className="text-[11px] text-purple-300 font-bold">Lagrangian Profiling Buoy</div>
                  <ul className="space-y-1 text-gray-300 text-[11px] border-t border-navy-800 pt-2">
                    <li><strong>Length (Height):</strong> 1.50 m (plus 0.5m antenna)</li>
                    <li><strong>Diameter:</strong> 0.20 m cylinder</li>
                    <li><strong>Displacement (Weight):</strong> 25.0 kg</li>
                    <li><strong>Form Factor:</strong> Aluminum pressure hull + oil bladder</li>
                    <li><strong>Profiling Range:</strong> 0–2,000 m (10-day cycle)</li>
                    <li><strong>Propulsion:</strong> None (Passive deep ocean drift)</li>
                  </ul>
                </div>

                {/* Saildrone */}
                <div className="bg-navy-950 border border-navy-800 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm">SAILDRONE EXPLORER</span>
                    <span className="text-[10px] bg-navy-800 text-gray-300 px-1.5 py-0.5 rounded">
                      COMMERCIAL USV
                    </span>
                  </div>
                  <div className="text-[11px] text-cyan-300 font-bold">Wing-Propelled Surface Drone</div>
                  <ul className="space-y-1 text-gray-300 text-[11px] border-t border-navy-800 pt-2">
                    <li><strong>Length:</strong> 7.00 m (Explorer) to 20.0 m (Surveyor)</li>
                    <li><strong>Wing Height:</strong> 4.50 m (Explorer)</li>
                    <li><strong>Draft:</strong> 1.80 m (Lead keel)</li>
                    <li><strong>Displacement (Weight):</strong> ~750 kg</li>
                    <li><strong>Form Factor:</strong> Large composite monohull with rigid wing</li>
                    <li><strong>Profiling:</strong> Surface & towed acoustic instruments</li>
                    <li><strong>Propulsion:</strong> Wind-propelled rigid wing sail</li>
                  </ul>
                </div>

                {/* Wave Glider */}
                <div className="bg-navy-950 border border-navy-800 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm">WAVE GLIDER (SV3)</span>
                    <span className="text-[10px] bg-navy-800 text-gray-300 px-1.5 py-0.5 rounded">
                      WAVE USV
                    </span>
                  </div>
                  <div className="text-[11px] text-green-300 font-bold">Wave-Propelled Dual-Body</div>
                  <ul className="space-y-1 text-gray-300 text-[11px] border-t border-navy-800 pt-2">
                    <li><strong>Float Length:</strong> 3.05 m</li>
                    <li><strong>Sub Length:</strong> 2.13 m (Wingspan 1.4m)</li>
                    <li><strong>Umbilical Tether:</strong> 7.0 m fixed depth</li>
                    <li><strong>Displacement (Weight):</strong> ~155 kg</li>
                    <li><strong>Form Factor:</strong> Surface float coupled to sub wings</li>
                    <li><strong>Profiling:</strong> Limited winch or fixed sub CTD</li>
                    <li><strong>Propulsion:</strong> Ocean wave mechanical conversion</li>
                  </ul>
                </div>

                {/* Ocean Mooring Buoy */}
                <div className="bg-navy-950 border border-navy-800 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm">MOORED BUOY OBSERVATORY</span>
                    <span className="text-[10px] bg-navy-800 text-gray-300 px-1.5 py-0.5 rounded">
                      FIXED STATION
                    </span>
                  </div>
                  <div className="text-[11px] text-yellow-300 font-bold">Anchored Station (TAO/RAMA)</div>
                  <ul className="space-y-1 text-gray-300 text-[11px] border-t border-navy-800 pt-2">
                    <li><strong>Diameter:</strong> 2.80 m to 3.00 m toroid hull</li>
                    <li><strong>Mooring Line:</strong> 1,500 m to 4,000 m steel cable</li>
                    <li><strong>Anchor Weight:</strong> ~1,500 kg to 2,500 kg concrete/railroad</li>
                    <li><strong>Total System Mass:</strong> &gt;3,000 kg</li>
                    <li><strong>Profiling:</strong> Fixed sensor chain clamped at depths</li>
                    <li><strong>Propulsion:</strong> None (Anchored to seabed)</li>
                  </ul>
                </div>

                {/* Research Ship */}
                <div className="bg-navy-950 border border-navy-800 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm">NOAA RESEARCH SHIP</span>
                    <span className="text-[10px] bg-navy-800 text-gray-300 px-1.5 py-0.5 rounded">
                      CREWED VESSEL
                    </span>
                  </div>
                  <div className="text-[11px] text-red-300 font-bold">Manned Expedition Ship</div>
                  <ul className="space-y-1 text-gray-300 text-[11px] border-t border-navy-800 pt-2">
                    <li><strong>Length:</strong> 63.6 m (Reuben Lasker class)</li>
                    <li><strong>Beam:</strong> 15.0 m</li>
                    <li><strong>Draft:</strong> 5.5 m</li>
                    <li><strong>Displacement:</strong> 2,082 metric tons</li>
                    <li><strong>Crew:</strong> 24–40 personnel</li>
                    <li><strong>Profiling:</strong> Full-depth 24-bottle Niskin rosette (6,000m)</li>
                    <li><strong>Propulsion:</strong> Diesel-electric marine drive</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPERATIONAL CHARTER & MANDATE */}
          {activeTab === 'CHARTER' && (
            <div className="space-y-3">
              <div className="bg-navy-950 border border-navy-800 rounded-xl p-4">
                <h3 className="text-xs font-extrabold text-orange-400 uppercase tracking-wider mb-2">
                  Operational Charter Comparison
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Each platform serves a unique maritime mandate. O-TREX is chartered specifically to fill the persistent adaptive monitoring gap in the Polar and Southern Oceans.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-navy-950 text-gray-400 border-b border-navy-800">
                      <th className="p-2.5 font-bold">PLATFORM</th>
                      <th className="p-2.5 font-bold">OPERATIONAL CHARTER</th>
                      <th className="p-2.5 font-bold">MOBILITY & CONTROL</th>
                      <th className="p-2.5 font-bold">VERTICAL PROFILING</th>
                      <th className="p-2.5 font-bold">ADAPTIVE LOGIC</th>
                      <th className="p-2.5 font-bold">POLAR COMPATIBILITY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800 text-gray-300">
                    <tr className="bg-orange-500/10 font-bold text-white">
                      <td className="p-2.5 text-orange-400">O-TREX (Proposed)</td>
                      <td className="p-2.5">Persistent polar observation + targeted event profiling</td>
                      <td className="p-2.5 text-green-400">Autonomous Active (WASD/Waypoints)</td>
                      <td className="p-2.5 text-orange-400">On-demand winch (0–100m)</td>
                      <td className="p-2.5 text-green-400">Edge AI Decision Engine</td>
                      <td className="p-2.5 text-green-400">High (Shallow draft, ice avoidance)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-purple-300">Argo Float</td>
                      <td className="p-2.5">Global climate baseline deep-ocean profiling</td>
                      <td className="p-2.5 text-red-400">Passive Drift (No lateral control)</td>
                      <td className="p-2.5">Fixed 10-day cycle (0–2,000m)</td>
                      <td className="p-2.5 text-gray-500">None (Fixed state cycle)</td>
                      <td className="p-2.5 text-yellow-400">Limited (Under-ice floats exist)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-cyan-300">Saildrone</td>
                      <td className="p-2.5">Global surface met-ocean & fisheries surveys</td>
                      <td className="p-2.5 text-green-400">Autonomous Sail (Planetary)</td>
                      <td className="p-2.5 text-gray-500">Surface only (Towed acoustic)</td>
                      <td className="p-2.5">Route-level remote piloting</td>
                      <td className="p-2.5 text-yellow-400">High winds (Fragile in pack ice)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-green-300">Wave Glider</td>
                      <td className="p-2.5">Long-duration acoustic & surface gateway</td>
                      <td className="p-2.5 text-green-400">Autonomous Wave (0.5–2 kt)</td>
                      <td className="p-2.5 text-gray-500">Fixed sub depth (~7m)</td>
                      <td className="p-2.5">Waypoint tracking</td>
                      <td className="p-2.5 text-yellow-400">Requires continuous wave action</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-yellow-300">Moored Buoy</td>
                      <td className="p-2.5">Stationary time-series at fixed coordinates</td>
                      <td className="p-2.5 text-red-400">Stationary (Anchored)</td>
                      <td className="p-2.5">Fixed discrete sensor clamps</td>
                      <td className="p-2.5 text-gray-500">None (Fixed mooring)</td>
                      <td className="p-2.5 text-red-400">Icebergs snap mooring cables</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-red-300">Research Ship</td>
                      <td className="p-2.5">Full wet-lab expeditionary campaigns</td>
                      <td className="p-2.5 text-green-400">Crewed navigation</td>
                      <td className="p-2.5 text-green-400">Full depth CTD Rosette (6,000m)</td>
                      <td className="p-2.5 text-green-400">Human scientist in-the-loop</td>
                      <td className="p-2.5 text-green-400">Ice-strengthened hull required</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: COST & LOGISTICS FOOTPRINT */}
          {activeTab === 'COST' && (
            <div className="space-y-3">
              <div className="bg-navy-950 border border-navy-800 rounded-xl p-4">
                <h3 className="text-xs font-extrabold text-orange-400 uppercase tracking-wider mb-2">
                  Verified Public Cost Data & Economic Comparison
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Based on published NOAA OMAO rates, Scripps Argo FAQ, and commercial platform specifications.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* O-TREX Cost Model */}
                <div className="bg-navy-950 border border-orange-500/50 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-orange-400 text-sm">O-TREX CAPITAL & OPERATING COST</span>
                    <span className="text-[10px] bg-orange-500 text-navy-950 px-1.5 py-0.5 rounded font-bold">
                      LOW-COST INDIGENOUS
                    </span>
                  </div>
                  <div className="space-y-1.5 text-gray-300 text-[11px] border-t border-navy-800 pt-2">
                    <p><strong>Prototype Build BOM:</strong> ~$3,500 USD (₹2.97 Lakh INR)</p>
                    <p><strong>Daily Operational Footprint:</strong> &lt;$10 USD / day (Solar powered + Iridium SBD packets)</p>
                    <p><strong>Deployment Logistics:</strong> 2-person shore launch or small inflatable boat</p>
                    <p><strong>Recovery:</strong> Fully recoverable, reusable multi-mission platform</p>
                  </div>
                </div>

                {/* Research Ship Cost Model */}
                <div className="bg-navy-950 border border-navy-800 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm">NOAA RESEARCH SHIP DAY RATE</span>
                    <span className="text-[10px] bg-navy-800 text-gray-300 px-1.5 py-0.5 rounded">
                      NOAA PUBLISHED RATE
                    </span>
                  </div>
                  <div className="space-y-1.5 text-gray-300 text-[11px] border-t border-navy-800 pt-2">
                    <p><strong>Daily Operating Rate:</strong> $25,000 – $59,426 / day</p>
                    <p><strong>30-Day Campaign Total:</strong> ~$750,000 to $1.78M USD per voyage</p>
                    <p><strong>Vessel Build Cost:</strong> $40M to $120M+ per ship</p>
                    <p><strong>Carbon Footprint:</strong> ~12 to 20 metric tons diesel / day</p>
                  </div>
                </div>

                {/* Argo Cost Model */}
                <div className="bg-navy-950 border border-navy-800 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm">ARGO FLOAT LIFECYCLE COST</span>
                    <span className="text-[10px] bg-navy-800 text-gray-300 px-1.5 py-0.5 rounded">
                      SCRIPPS FAQ
                    </span>
                  </div>
                  <div className="space-y-1.5 text-gray-300 text-[11px] border-t border-navy-800 pt-2">
                    <p><strong>Core Float Unit Cost:</strong> ~$20,000 – $25,000 USD</p>
                    <p><strong>BGC-Argo Unit Cost:</strong> Up to $80,000 – $100,000+ USD</p>
                    <p><strong>Lifecycle Rule:</strong> Official FAQ notes unit cost doubles after deployment logistics and satellite airtime.</p>
                    <p><strong>Expendable Nature:</strong> Rarely recovered at end of life.</p>
                  </div>
                </div>

                {/* Saildrone Cost Model */}
                <div className="bg-navy-950 border border-navy-800 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-sm">SAILDRONE SERVICE MODEL</span>
                    <span className="text-[10px] bg-navy-800 text-gray-300 px-1.5 py-0.5 rounded">
                      COMMERCIAL QUOTE
                    </span>
                  </div>
                  <div className="space-y-1.5 text-gray-300 text-[11px] border-t border-navy-800 pt-2">
                    <p><strong>Operating Model:</strong> Data-as-a-Service mission contracting</p>
                    <p><strong>Estimated Mission Rate:</strong> $2,500 – $4,500 / day</p>
                    <p><strong>Hardware Sales:</strong> Proprietary enterprise ecosystem; quotes required</p>
                    <p><strong>Logistics:</strong> Requires harbour or specialized boat ramp handling</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-navy-800 bg-navy-950/80 flex items-center justify-between text-xs">
          <span className="text-gray-400">
            Source Data: NOAA OMAO, UCSD/Scripps Argo Program FAQ, Saildrone Inc., Liquid Robotics SV3.
          </span>
          <button
            onClick={closeModal}
            className="bg-navy-800 hover:bg-navy-700 text-white font-bold py-1.5 px-4 rounded-lg transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
