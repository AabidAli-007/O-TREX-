import React from 'react';
import { X, Calculator, Download, ExternalLink } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { formatCurrency } from '../../utils/formatters';

export const BOMEstimator: React.FC = () => {
  const activeModal = useSimulationStore((state) => state.activeModal);
  const closeModal = useSimulationStore((state) => state.closeModal);
  const bomItems = useSimulationStore((state) => state.bomItems);
  const updateBOMItem = useSimulationStore((state) => state.updateBOMItem);
  const contingencyPct = useSimulationStore((state) => state.contingencyPct);
  const setContingencyPct = useSimulationStore((state) => state.setContingencyPct);

  if (activeModal !== 'BOM') return null;

  // Calculate Subtotal & Totals
  const subtotalInr = bomItems.reduce(
    (sum, item) => sum + item.unitCostInr * item.quantity,
    0
  );
  const contingencyInr = (subtotalInr * contingencyPct) / 100;
  const totalInr = subtotalInr + contingencyInr;

  const handleExportCSV = () => {
    const headers = ['Category', 'Item_Name', 'Part_Reference', 'Qty', 'Unit_Cost_INR', 'Total_INR', 'Provenance', 'Source_Note'];
    const rows = bomItems.map((item) => [
      item.category,
      item.name,
      item.partNumberOrRef,
      item.quantity,
      item.unitCostInr,
      item.unitCostInr * item.quantity,
      item.provenanceType,
      item.sourceNote
    ]);
    rows.push(['TOTALS', 'Subtotal', '', '', '', subtotalInr, '', '']);
    rows.push(['TOTALS', `Contingency (${contingencyPct}%)`, '', '', '', contingencyInr, '', '']);
    rows.push(['TOTALS', 'GRAND TOTAL', '', '', '', totalInr, '', `INR: ₹${totalInr.toFixed(0)}`]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OTREX_Prototype_BOM_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-5xl bg-navy-900 border border-navy-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-200">
        {/* Header */}
        <div className="h-14 bg-navy-950 px-6 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-navy-900 text-orange-400 border border-navy-700">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                O-TREX PROVISIONAL PROTOTYPE BILL OF MATERIALS (BOM)
              </h2>
              <p className="text-[11px] text-orange-400">
                Transparent Line-Item Cost Estimator with Live Recalculation & Source Provenance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="bg-navy-900 hover:bg-orange-500 hover:text-white text-orange-400 border border-orange-500/40 px-3 py-1 rounded text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={closeModal}
              className="p-1.5 rounded hover:bg-navy-800 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Controls & Summary Banner */}
        <div className="bg-navy-950 border-b border-navy-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Contingency:</span>
              <input
                type="number"
                min="0"
                max="50"
                value={contingencyPct}
                onChange={(e) => setContingencyPct(Number(e.target.value))}
                className="w-16 bg-navy-900 border border-navy-700 px-2 py-0.5 rounded text-orange-400 text-xs font-bold"
              />
              <span className="text-gray-400">%</span>
            </div>
          </div>

          {/* Grand Total Callout */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block">SUBTOTAL</span>
              <span className="text-white font-bold">{formatCurrency(subtotalInr, 'INR')}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block">EST. PROTOTYPE BUILD COST</span>
              <span className="text-lg font-extrabold text-orange-400">
                {formatCurrency(totalInr, 'INR')}
              </span>
            </div>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="bg-navy-950 border-b border-navy-800 px-6 py-1.5 text-[10px] text-gray-400">
          PROVISIONAL PROTOTYPE BOM — NOT A FINAL PROCUREMENT QUOTE. Excludes Indian import duties, GST, freight shipping & reseller margins.
        </div>

        {/* Editable Table */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="border border-navy-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950 text-gray-300 border-b border-navy-800">
                <tr>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Component / Specification</th>
                  <th className="p-2.5 w-16 text-center">Qty</th>
                  <th className="p-2.5 w-32 text-right">Unit (₹)</th>
                  <th className="p-2.5 w-32 text-right">Subtotal (₹)</th>
                  <th className="p-2.5">Cost Provenance & Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 text-gray-300">
                {bomItems.map((item) => (
                  <tr key={item.id} className="hover:bg-navy-950/40">
                    <td className="p-2.5 text-[11px] text-orange-400 font-semibold">{item.category}</td>
                    <td className="p-2.5 text-[11px]">
                      <span className="font-bold text-white block">{item.name}</span>
                      <span className="text-[10px] text-gray-400">{item.partNumberOrRef}</span>
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={item.quantity}
                        onChange={(e) =>
                          updateBOMItem(item.id, { quantity: Math.max(1, Number(e.target.value)) })
                        }
                        className="w-12 bg-navy-950 border border-navy-700 px-1 py-0.5 rounded text-center text-white text-xs"
                      />
                    </td>
                    <td className="p-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={item.unitCostInr}
                        onChange={(e) =>
                          updateBOMItem(item.id, { unitCostInr: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-24 bg-navy-950 border border-navy-700 px-1 py-0.5 rounded text-right text-orange-400 font-bold text-xs"
                      />
                    </td>
                    <td className="p-2.5 text-right font-bold text-white">
                      ₹{(item.unitCostInr * item.quantity).toFixed(0)}
                    </td>
                    <td className="p-2.5 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-navy-950 border border-navy-800 text-gray-400 text-[9px]">
                          {item.provenanceType.replace(/_/g, ' ')}
                        </span>
                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-400 hover:text-white"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <span className="text-gray-400 block mt-0.5">{item.sourceNote}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
