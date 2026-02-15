
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

// --- Icons ---
const DocumentTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const CurrencyRupeeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>;
const FactoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 013.375-3.375h9.75a3.375 3.375 0 013.375 3.375v1.875" /></svg>;
const ArrowTrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

// --- Components ---

const SidebarItem: React.FC<{
    id: string;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: (id: string) => void;
}> = ({ id, label, icon, isActive, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors border-l-4 ${isActive
            ? 'bg-blue-50 border-[#003A8F] text-[#003A8F]'
            : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
    >
        <span>{icon}</span>
        <span>{label}</span>
    </button>
);

const KPIStatCard: React.FC<{ title: string; value: string; subtitle?: string; color: string }> = ({ title, value, subtitle, color }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
);

// --- Module 1: Financial Reports ---
const FinancialReports = () => {
    const costData = [
        { name: 'Road', Planned: 150, Actual: 165 },
        { name: 'Rail (BTAP)', Planned: 90, Actual: 92 },
        { name: 'Rail (BCFC)', Planned: 110, Actual: 108 },
        { name: 'Multimodal', Planned: 40, Actual: 45 },
    ];

    const logisticsSummary = [
        { mode: 'Road', cost: '₹1.65 Cr', perTon: '₹2,500', variance: '+10%' },
        { mode: 'Rail (BTAP)', cost: '₹0.92 Cr', perTon: '₹1,780', variance: '+2%' },
        { mode: 'Rail (BCFC)', cost: '₹1.08 Cr', perTon: '₹2,100', variance: '-1.8%' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPIStatCard title="Total Logistics Spend" value="₹3.65 Cr" subtitle="Month to Date" color="text-[#0B1F3B]" />
                <KPIStatCard title="Avg Cost / Ton" value="₹2,150" subtitle="Across all modes" color="text-[#003A8F]" />
                <KPIStatCard title="Realized Savings" value="₹18.5 L" subtitle="vs Baseline Budget" color="text-[#2E7D32]" />
                <KPIStatCard title="Cost Variance" value="+4.2%" subtitle="Due to fuel surcharge" color="text-[#C62828]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-80">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Planned vs Actual Cost (₹ Lakhs)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={costData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Legend />
                            <Bar dataKey="Planned" fill="#9CA3AF" />
                            <Bar dataKey="Actual" fill="#003A8F" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 overflow-y-auto h-80">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Logistics Cost Summary</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th className="p-2">Mode</th>
                                <th className="p-2 text-right">Total Cost</th>
                                <th className="p-2 text-right">Per Ton</th>
                                <th className="p-2 text-right">Var %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logisticsSummary.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="p-2 font-medium">{row.mode}</td>
                                    <td className="p-2 text-right">{row.cost}</td>
                                    <td className="p-2 text-right">{row.perTon}</td>
                                    <td className={`p-2 text-right font-bold ${row.variance.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>{row.variance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- Module 2: Operational Performance ---
const OperationalReports = () => {
    const delayData = [
        { name: 'Loading Delay', value: 35, color: '#F9A825' },
        { name: 'Transit Congestion', value: 25, color: '#C62828' },
        { name: 'Unloading Delay', value: 20, color: '#003A8F' },
        { name: 'No Operator', value: 20, color: '#9CA3AF' },
    ];

    const exceptions = [
        { id: 'EX-001', type: 'Delayed Shipment', detail: 'Raipur to Mumbai (Truck)', impact: '4h Delay' },
        { id: 'EX-002', type: 'Missed Optimization', detail: 'Plant selected Road over Rail', impact: '₹12k Loss' },
        { id: 'EX-003', type: 'Demurrage', detail: 'Kalamboli Hub (Wagon)', impact: '₹5k Penalty' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPIStatCard title="On-Time Delivery" value="92%" subtitle="Target: 95%" color="text-[#003A8F]" />
                <KPIStatCard title="Avg Turnaround Time" value="18 hrs" subtitle="Plant to Unloading" color="text-[#F9A825]" />
                <KPIStatCard title="Asset Utilization" value="84%" subtitle="Wagon availability" color="text-[#2E7D32]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-80">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Delay Root Cause Analysis</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={delayData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {delayData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 overflow-y-auto h-80">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Operational Exceptions (Last 7 Days)</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th className="p-2">Type</th>
                                <th className="p-2">Detail</th>
                                <th className="p-2 text-right">Impact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {exceptions.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="p-2 font-bold text-gray-800">{row.type}</td>
                                    <td className="p-2 text-gray-600">{row.detail}</td>
                                    <td className="p-2 text-right font-medium text-red-600">{row.impact}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- Module 3: Plant-wise Analysis ---
const PlantReports = () => {
    const plantData = [
        { name: 'Raipur', CostPerTon: 1850, Savings: 12 },
        { name: 'Bokaro', CostPerTon: 2100, Savings: 8 },
        { name: 'Satna', CostPerTon: 1950, Savings: 10 },
        { name: 'Chanderia', CostPerTon: 1780, Savings: 15 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <KPIStatCard title="Most Efficient Plant" value="Chanderia" subtitle="₹1,780 / ton" color="text-[#2E7D32]" />
                <KPIStatCard title="Highest Logistics Cost" value="Bokaro" subtitle="₹2,100 / ton" color="text-[#C62828]" />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-96">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Plant Cost Benchmarking (₹/Ton)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={plantData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <Legend />
                        <Bar dataKey="CostPerTon" fill="#003A8F" name="Cost per Ton (₹)" barSize={20} />
                        <Bar dataKey="Savings" fill="#2E7D32" name="Savings %" barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// --- Module 4: Transport Mode Analysis ---
const TransportReports = () => {
    const mixData = [
        { name: 'Rail (BTAP)', value: 45, color: '#003A8F' },
        { name: 'Rail (BCFC)', value: 25, color: '#F9A825' },
        { name: 'Road', value: 20, color: '#C62828' },
        { name: 'Multimodal', value: 10, color: '#2E7D32' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-80">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Transport Mode Mix (Volume)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={mixData} cx="50%" cy="50%" innerRadius={0} outerRadius={80} dataKey="value" label>
                                {mixData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-80 flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Wagon Type Performance</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-100 rounded">
                            <div>
                                <p className="text-sm font-bold text-[#003A8F]">BTAP (Pneumatic)</p>
                                <p className="text-xs text-gray-600">Avg Cost: ₹1.75/t-km</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-[#2E7D32]">Optimal</p>
                                <p className="text-xs text-gray-600">45% Share</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-100 rounded">
                            <div>
                                <p className="text-sm font-bold text-yellow-800">BCFC (Manual)</p>
                                <p className="text-xs text-gray-600">Avg Cost: ₹2.10/t-km</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-yellow-600">Standard</p>
                                <p className="text-xs text-gray-600">25% Share</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Module 5: Historical Trends ---
const TrendReports = () => {
    const trendData = [
        { month: 'Jan', Cost: 120, Savings: 10 },
        { month: 'Feb', Cost: 115, Savings: 15 },
        { month: 'Mar', Cost: 118, Savings: 12 },
        { month: 'Apr', Cost: 110, Savings: 20 },
        { month: 'May', Cost: 105, Savings: 25 },
        { month: 'Jun', Cost: 100, Savings: 30 },
    ];

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-96">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Cost vs Savings Trend (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                    <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#003A8F" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#003A8F" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="Cost" stroke="#003A8F" fillOpacity={1} fill="url(#colorCost)" />
                    <Area type="monotone" dataKey="Savings" stroke="#2E7D32" fillOpacity={1} fill="url(#colorSavings)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

const ReportsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'financial' | 'operational' | 'plant' | 'transport' | 'trends'>('financial');

    const handleExport = (type: 'Excel' | 'PDF') => {
        alert(`Exporting ${activeTab.toUpperCase()} report as ${type}...`);
    };

    return (
        <div className="flex flex-col h-full w-full min-w-0 bg-transparent">
            {/* Header / Nav */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm z-10 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0B1F3B] flex items-center gap-2">
                        <DocumentTextIcon /> Performance Reports
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Historical analysis, financial audit, and operational review.</p>
                </div>

                {/* Global Filters & Actions */}
                <div className="flex flex-wrap items-center gap-3">
                    <select className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-700">
                        <option>Last 30 Days</option>
                        <option>This Quarter</option>
                        <option>YTD</option>
                    </select>
                    <select className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white text-gray-700">
                        <option>All Plants</option>
                        <option>Raipur</option>
                        <option>Bokaro</option>
                    </select>
                    <div className="h-6 w-px bg-gray-300 mx-1"></div>
                    <button onClick={() => handleExport('Excel')} className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded hover:bg-green-100 transition-colors text-sm font-semibold">
                        <DownloadIcon /> Excel
                    </button>
                    <button onClick={() => handleExport('PDF')} className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded hover:bg-red-100 transition-colors text-sm font-semibold">
                        <DownloadIcon /> PDF
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200 flex flex-col py-4">
                    <div className="space-y-1 px-2">
                        <SidebarItem id="financial" label="Financial Reports" icon={<CurrencyRupeeIcon />} isActive={activeTab === 'financial'} onClick={() => setActiveTab('financial')} />
                        <SidebarItem id="operational" label="Operational Perf." icon={<ChartBarIcon />} isActive={activeTab === 'operational'} onClick={() => setActiveTab('operational')} />
                        <SidebarItem id="plant" label="Plant Analysis" icon={<FactoryIcon />} isActive={activeTab === 'plant'} onClick={() => setActiveTab('plant')} />
                        <SidebarItem id="transport" label="Transport Mode" icon={<TruckIcon />} isActive={activeTab === 'transport'} onClick={() => setActiveTab('transport')} />
                        <SidebarItem id="trends" label="Historical Trends" icon={<ArrowTrendingUpIcon />} isActive={activeTab === 'trends'} onClick={() => setActiveTab('trends')} />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 overflow-y-auto p-6">
                    {activeTab === 'financial' && <FinancialReports />}
                    {activeTab === 'operational' && <OperationalReports />}
                    {activeTab === 'plant' && <PlantReports />}
                    {activeTab === 'transport' && <TransportReports />}
                    {activeTab === 'trends' && <TrendReports />}
                </main>
            </div>
        </div>
    );
};

export default ReportsPage;
