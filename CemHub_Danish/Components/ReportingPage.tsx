
import React, { useState, useCallback } from 'react';
import type { Scenario } from '../types';
import ComparisonChart from './ComparisonChart';
import { generateReportSummary } from '../services/geminiService';

const ReportingPage: React.FC<{ scenario: Scenario }> = ({ scenario }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateSummary = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setSummary('');
    try {
      const result = await generateReportSummary(scenario);
      setSummary(result);
    } catch (err) {
      setError('Failed to generate summary. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [scenario]);

  const { comparisonData, costSavings, co2Savings, costBreakdown } = scenario;

  return (
    <div className="flex-1 p-6 bg-gray-100 overflow-y-auto text-gray-700">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Reporting View: {scenario.title}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Key Metrics & AI Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-green-700">Key Savings (BTAP vs BCFC)</h3>
            <div className="space-y-2">
              <p className="text-lg"><span className="font-semibold text-green-600">Cost Savings:</span> ₹{costSavings.toLocaleString('en-IN')}</p>
              <p className="text-lg"><span className="font-semibold text-green-600">CO₂ Reduction:</span> {co2Savings.toFixed(1)} tons</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-green-700">Landed Cost Analysis</h3>
            <div className="space-y-1 text-sm">
                <p><strong>Raw Material:</strong> ₹{costBreakdown.rawMaterialLanded.costPerKg.toFixed(2)} /kg</p>
                <p><strong>Cement at Hub (BTAP):</strong> ₹{((comparisonData.btap.costPerTonKm * 1100)/1000).toFixed(2)} /kg</p>
                <p><strong>Hub to RMC:</strong> ₹{costBreakdown.hubToRmcDispatch.costPerKg.toFixed(2)} /kg</p>
                <p className="border-t border-gray-200 mt-1 pt-1 font-bold"><strong>Total (BTAP):</strong> ₹{costBreakdown.totalLandedCost.costPerKg.toFixed(2)} /kg</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-green-700">AI-Generated Executive Summary</h3>
              <button onClick={handleGenerateSummary} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-md text-sm disabled:bg-gray-400">
                {isLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            {isLoading && (
              <div className="flex items-center justify-center space-x-1 p-4">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
              </div>
            )}
            {summary && <p className="text-sm whitespace-pre-wrap">{summary}</p>}
            {!summary && !isLoading && <p className="text-sm text-gray-500">Click "Generate" to get an AI-powered summary of this report.</p>}
          </div>
        </div>

        {/* Right Column: Charts & Data Table */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                 <h3 className="text-lg font-semibold mb-4 text-green-700">Wagon Comparison: Cost & CO₂</h3>
                 <ComparisonChart data={comparisonData} />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                 <h3 className="text-lg font-semibold mb-4 text-green-700">Detailed Wagon Metrics</h3>
                 <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="px-2 py-2">Metric</th>
                            <th className="px-2 py-2 text-green-600">BTAP</th>
                            <th className="px-2 py-2 text-orange-500">BCFC</th>
                            <th className="px-2 py-2 text-gray-400">Others</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {[
                            { metric: 'Cost / ton-km', btap: `₹${comparisonData.btap.costPerTonKm}`, bcfc: `₹${comparisonData.bcfc.costPerTonKm}`, others: `₹${comparisonData.others.costPerTonKm}` },
                            { metric: 'Turnaround Time', btap: comparisonData.btap.turnaroundTime, bcfc: comparisonData.bcfc.turnaroundTime, others: comparisonData.others.turnaroundTime },
                            { metric: 'Unloading Cost', btap: comparisonData.btap.unloadingCost, bcfc: comparisonData.bcfc.unloadingCost, others: comparisonData.others.unloadingCost },
                            { metric: 'ESG Score (of 10)', btap: comparisonData.btap.esgScore, bcfc: comparisonData.bcfc.esgScore, others: comparisonData.others.esgScore },
                            { metric: 'CO₂ Emissions/ton', btap: `${comparisonData.btap.co2PerTon} kg`, bcfc: `${comparisonData.bcfc.co2PerTon} kg`, others: `${comparisonData.others.co2PerTon} kg` },
                        ].map(row => (
                            <tr key={row.metric}>
                                <td className="px-2 py-2.5 font-medium">{row.metric}</td>
                                <td className="px-2 py-2.5 font-semibold text-gray-800">{row.btap}</td>
                                <td className="px-2 py-2.5 font-semibold text-gray-800">{row.bcfc}</td>
                                <td className="px-2 py-2.5 font-semibold text-gray-800">{row.others}</td>
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

export default ReportingPage;
