
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// --- Icons ---
const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const CurrencyRupeeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const TableCellsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25v1.5c0 .621.504 1.125 1.125 1.125m17.25-2.625h-7.5c-.621 0-1.125.504-1.125 1.125m8.625 0v1.5c0 .621-.504 1.125-1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v1.5m0 0c0 .621-.504 1.125-1.125 1.125M12 16.125c0 .621.504 1.125 1.125 1.125" /></svg>;
const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 013.375-3.375h9.75a3.375 3.375 0 013.375 3.375v1.875" /></svg>;
const LeafIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>;
const ScaleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v17.25m0 0c-1.48 0-2.75-1.27-2.75-2.75 0-1.48 1.27-2.75 2.75-2.75s2.75 1.27 2.75 2.75c0 1.48-1.27 2.75-2.75 2.75zm0-17.25a2.75 2.75 0 012.75 2.75c0 1.48-1.27 2.75-2.75 2.75a2.75 2.75 0 01-2.75-2.75C9.25 4.27 10.52 3 12 3z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

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

// --- Module 1: Savings Dashboard ---
const SavingsDashboard = () => {
    const data = [
        { name: 'Jan', Savings: 120, Target: 100 },
        { name: 'Feb', Savings: 140, Target: 110 },
        { name: 'Mar', Savings: 135, Target: 115 },
        { name: 'Apr', Savings: 160, Target: 120 },
        { name: 'May', Savings: 180, Target: 125 },
        { name: 'Jun', Savings: 210, Target: 130 },
    ];

    const pieData = [
        { name: 'Rail Shift', value: 55, color: '#003A8F' },
        { name: 'Backhaul', value: 25, color: '#2E7D32' },
        { name: 'Route Opt', value: 20, color: '#F9A825' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPIStatCard title="YTD Savings" value="₹8.45 Cr" subtitle="14% above target" color="text-[#003A8F]" />
                <KPIStatCard title="Avg Cost Reduction" value="12.5%" subtitle="Per ton-km" color="text-[#2E7D32]" />
                <KPIStatCard title="CO₂ Avoided" value="4,250 T" subtitle="Equivalent to 12k trees" color="text-[#00AEEF]" />
                <KPIStatCard title="Savings At Risk" value="₹45 L" subtitle="Pending approvals" color="text-[#C62828]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-80">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Monthly Savings Trend (₹ Lakhs)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#003A8F" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#003A8F" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="Savings" stroke="#003A8F" fillOpacity={1} fill="url(#colorSavings)" />
                            <Area type="monotone" dataKey="Target" stroke="#9CA3AF" fill="transparent" strokeDasharray="5 5" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-80">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Savings by Source</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// --- Module 2: Optimization Audit Trail ---
interface OptimizationRecord {
    id: string;
    date: string;
    type: string;
    refId: string;
    baselineCost: number;
    optCost: number;
    savings: number;
    status: 'Approved' | 'Pending' | 'Rejected';
    approver: string;
    aiReason: string;
}

const AuditTrail = () => {
    const records: OptimizationRecord[] = [
        { id: 'OPT-1024', date: '2024-06-15', type: 'Mode Shift', refId: 'SHP-8821', baselineCost: 125000, optCost: 98000, savings: 27000, status: 'Approved', approver: 'Auto-Rule', aiReason: 'Shifted to BTAP Rail based on volume > 2000T and available rake.' },
        { id: 'OPT-1025', date: '2024-06-16', type: 'Route Opt', refId: 'SHP-8825', baselineCost: 45000, optCost: 41500, savings: 3500, status: 'Approved', approver: 'John Doe', aiReason: 'Avoided congested NH-44, utilized alternative state highway.' },
        { id: 'OPT-1026', date: '2024-06-16', type: 'Backhaul', refId: 'SHP-8830', baselineCost: 80000, optCost: 30000, savings: 50000, status: 'Pending', approver: '-', aiReason: 'Identified empty return leg from Nagpur Hub.' },
        { id: 'OPT-1027', date: '2024-06-17', type: 'Source Sel', refId: 'PLAN-005', baselineCost: 500000, optCost: 480000, savings: 20000, status: 'Rejected', approver: 'Plant Mgr', aiReason: 'Suggested Fly Ash source closer to plant. Rejected due to quality constraints.' },
    ];

    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                    <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Type</th>
                        <th className="p-3 text-right">Baseline (₹)</th>
                        <th className="p-3 text-right">Optimized (₹)</th>
                        <th className="p-3 text-right">Savings (₹)</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Approver</th>
                        <th className="p-3"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {records.map(rec => (
                        <React.Fragment key={rec.id}>
                            <tr
                                className={`hover:bg-blue-50 cursor-pointer transition-colors ${expandedRow === rec.id ? 'bg-blue-50' : ''}`}
                                onClick={() => setExpandedRow(expandedRow === rec.id ? null : rec.id)}
                            >
                                <td className="p-3 font-mono text-[#003A8F]">{rec.id}</td>
                                <td className="p-3 text-gray-600">{rec.date}</td>
                                <td className="p-3 font-medium">{rec.type}</td>
                                <td className="p-3 text-right text-gray-500">{rec.baselineCost.toLocaleString()}</td>
                                <td className="p-3 text-right font-bold text-[#003A8F]">{rec.optCost.toLocaleString()}</td>
                                <td className="p-3 text-right font-bold text-[#2E7D32]">+{rec.savings.toLocaleString()}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${rec.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                        rec.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>{rec.status}</span>
                                </td>
                                <td className="p-3 text-gray-600">{rec.approver}</td>
                                <td className="p-3 text-gray-400 text-xs">▼</td>
                            </tr>
                            {expandedRow === rec.id && (
                                <tr className="bg-blue-50/50">
                                    <td colSpan={9} className="p-4 border-b border-blue-100">
                                        <div className="flex gap-4">
                                            <div className="w-1/3">
                                                <p className="text-xs font-bold text-gray-500 uppercase">Optimization Logic</p>
                                                <p className="text-sm text-gray-800 mt-1">{rec.aiReason}</p>
                                            </div>
                                            <div className="w-1/3">
                                                <p className="text-xs font-bold text-gray-500 uppercase">Impact Analysis</p>
                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                    <div><span className="text-xs text-gray-500">Cost Savings:</span> <span className="text-sm font-bold text-green-600">{(rec.savings / rec.baselineCost * 100).toFixed(1)}%</span></div>
                                                    <div><span className="text-xs text-gray-500">Reference:</span> <span className="text-sm font-mono text-blue-600">{rec.refId}</span></div>
                                                </div>
                                            </div>
                                            <div className="w-1/3 flex justify-end items-center gap-2">
                                                <button className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">View Evidence</button>
                                                <button className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">Export Log</button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Module 3: Shipment Level Savings ---
const ShipmentSavings = () => {
    // Mock shipment data
    const shipments = [
        { id: 'SHP-8821', origin: 'Raipur', dest: 'Kalamboli', mode: 'Rail (BTAP)', base: 125000, act: 98000, status: 'Completed' },
        { id: 'SHP-8822', origin: 'Odisha', dest: 'Raipur', mode: 'Road', base: 45000, act: 45000, status: 'In-Transit' },
        { id: 'SHP-8823', origin: 'Raipur', dest: 'Nagpur', mode: 'Rail (BCFC)', base: 60000, act: 52000, status: 'Completed' },
        { id: 'SHP-8824', origin: 'Bokaro', dest: 'Thane', mode: 'Rail (BTAP)', base: 180000, act: 145000, status: 'Planned' },
        { id: 'SHP-8825', origin: 'Raipur', dest: 'Pune', mode: 'Road', base: 75000, act: 71000, status: 'Completed' },
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 flex gap-4">
                <input type="text" placeholder="Filter by Shipment ID, Plant..." className="border rounded px-3 py-1.5 text-sm w-64" />
                <select className="border rounded px-3 py-1.5 text-sm bg-white"><option>All Modes</option><option>Rail</option><option>Road</option></select>
                <select className="border rounded px-3 py-1.5 text-sm bg-white"><option>All Status</option><option>Completed</option><option>In-Transit</option></select>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                        <th className="p-3">Shipment ID</th>
                        <th className="p-3">Route</th>
                        <th className="p-3">Mode</th>
                        <th className="p-3 text-right">Baseline Cost</th>
                        <th className="p-3 text-right">Optimized Cost</th>
                        <th className="p-3 text-right">Net Savings</th>
                        <th className="p-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {shipments.map(shp => (
                        <tr key={shp.id} className="hover:bg-gray-50">
                            <td className="p-3 font-mono text-[#003A8F]">{shp.id}</td>
                            <td className="p-3">{shp.origin} ➜ {shp.dest}</td>
                            <td className="p-3"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{shp.mode}</span></td>
                            <td className="p-3 text-right text-gray-500">₹{shp.base.toLocaleString()}</td>
                            <td className="p-3 text-right font-medium">₹{shp.act.toLocaleString()}</td>
                            <td className={`p-3 text-right font-bold ${shp.base - shp.act > 0 ? 'text-[#2E7D32]' : 'text-gray-400'}`}>
                                {shp.base - shp.act > 0 ? `+₹${(shp.base - shp.act).toLocaleString()}` : '-'}
                            </td>
                            <td className="p-3">
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${shp.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    shp.status === 'In-Transit' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}>{shp.status}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Module 4: ESG & Emission Savings ---
const EsgCompliance = () => {
    const chartData = [
        { name: 'Raipur', Baseline: 4000, Actual: 2800 },
        { name: 'Bokaro', Baseline: 3000, Actual: 2500 },
        { name: 'Satna', Baseline: 2000, Actual: 1900 },
        { name: 'Chanderia', Baseline: 2780, Actual: 2100 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPIStatCard title="CO₂ Avoided" value="1,480 T" subtitle="Total YTD Reduction" color="text-[#2E7D32]" />
                <KPIStatCard title="Diesel Saved" value="450 kL" subtitle="Approx 15,000 Truck Trips" color="text-[#003A8F]" />
                <KPIStatCard title="Rail Shift" value="18%" subtitle="Increase in Rail Share" color="text-[#F9A825]" />
                <KPIStatCard title="Carbon Credits" value="₹22 L" subtitle="Eligible Value" color="text-[#00AEEF]" />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Emission Reduction by Plant (Tons CO₂)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Legend />
                            <Bar dataKey="Baseline" fill="#9CA3AF" name="Baseline Emissions" />
                            <Bar dataKey="Actual" fill="#2E7D32" name="Optimized Emissions" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// --- Module 5: Governance History ---
const GovernanceHistory = () => {
    const logs = [
        { id: 'LOG-001', optId: 'OPT-1027', user: 'Plant Mgr (Amit S.)', role: 'Approver', action: 'Rejected', reason: 'Quality constraints on Fly Ash source.', impact: '-₹20,000', time: '2024-06-17 14:30' },
        { id: 'LOG-002', optId: 'OPT-1025', user: 'John Doe', role: 'Logistics Lead', action: 'Approved', reason: 'Route verified safe.', impact: '+₹3,500', time: '2024-06-16 09:15' },
        { id: 'LOG-003', optId: 'OPT-1024', user: 'System (Auto)', role: 'AI Agent', action: 'Approved', reason: 'Standard business rule met.', impact: '+₹27,000', time: '2024-06-15 08:00' },
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                        <th className="p-3">Log ID</th>
                        <th className="p-3">Optimization ID</th>
                        <th className="p-3">User</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Reason</th>
                        <th className="p-3 text-right">Fin. Impact</th>
                        <th className="p-3 text-right">Timestamp</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {logs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                            <td className="p-3 text-gray-500">{log.id}</td>
                            <td className="p-3 font-mono text-[#003A8F]">{log.optId}</td>
                            <td className="p-3">
                                <span className="font-medium text-gray-800">{log.user}</span>
                                <span className="text-xs text-gray-500 block">{log.role}</span>
                            </td>
                            <td className="p-3">
                                <span className={`flex items-center gap-1 font-bold ${log.action === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>
                                    {log.action === 'Approved' ? <CheckCircleIcon /> : <XCircleIcon />}
                                    {log.action}
                                </span>
                            </td>
                            <td className="p-3 text-gray-600 italic">"{log.reason}"</td>
                            <td className={`p-3 text-right font-medium ${log.impact.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{log.impact}</td>
                            <td className="p-3 text-right text-gray-500 text-xs font-mono">{log.time}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AuditCompliancePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'audit' | 'shipments' | 'esg' | 'governance'>('dashboard');

    const handleExport = () => {
        alert("Exporting Audit Report (PDF/Excel)...");
    };

    return (
        <div className="flex flex-col h-full w-full min-w-0 bg-transparent">
            {/* Header / Nav */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm z-10">
                <div>
                    <h1 className="text-2xl font-bold text-[#0B1F3B] flex items-center gap-2">
                        <ShieldCheckIcon /> Audit & Compliance
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Value realization, tracking, and governance log.</p>
                </div>
                <button onClick={handleExport} className="mt-3 md:mt-0 flex items-center gap-2 bg-white border border-[#003A8F] text-[#003A8F] px-4 py-2 rounded hover:bg-blue-50 transition-colors text-sm font-semibold">
                    <DownloadIcon /> Export Reports
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200 flex flex-col py-4">
                    <div className="space-y-1 px-2">
                        <SidebarItem id="dashboard" label="Savings Dashboard" icon={<CurrencyRupeeIcon />} isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                        <SidebarItem id="audit" label="Optimization Audit Trail" icon={<TableCellsIcon />} isActive={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
                        <SidebarItem id="shipments" label="Shipment-Level Savings" icon={<TruckIcon />} isActive={activeTab === 'shipments'} onClick={() => setActiveTab('shipments')} />
                        <SidebarItem id="esg" label="ESG & Emission Savings" icon={<LeafIcon />} isActive={activeTab === 'esg'} onClick={() => setActiveTab('esg')} />
                        <SidebarItem id="governance" label="Approval History" icon={<ScaleIcon />} isActive={activeTab === 'governance'} onClick={() => setActiveTab('governance')} />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 overflow-y-auto p-6">
                    {activeTab === 'dashboard' && <SavingsDashboard />}
                    {activeTab === 'audit' && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-700">Optimization Audit Log</h2>
                            <AuditTrail />
                        </div>
                    )}
                    {activeTab === 'shipments' && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-700">Shipment Execution & Savings</h2>
                            <ShipmentSavings />
                        </div>
                    )}
                    {activeTab === 'esg' && <EsgCompliance />}
                    {activeTab === 'governance' && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-700">Governance & Override Log</h2>
                            <GovernanceHistory />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AuditCompliancePage;
