
import React, { useMemo } from 'react';
import type { Scenario, Site, Route } from '../types';
import { SiteType } from '../types';
import type { View } from '../App';

interface HomePageProps {
    scenario: Scenario;
    scenarios: Scenario[];
    setActiveScenarioId: React.Dispatch<React.SetStateAction<string | null>>;
    setActiveView: (view: View) => void;
    sites: Site[];
    routes: Route[];
}

// Formatting helper for Indian Number System with precision
const formatIndianNumber = (valStr: string) => {
    // Expected input format from SystemDataPage: "123456.78 Unit"
    const parts = valStr.trim().split(' ');
    const unit = parts.length > 1 ? ` ${parts[1]}` : '';
    const rawVal = parseFloat(parts[0]);

    if (isNaN(rawVal)) return valStr;

    // Determine precision based on unit
    const isIntegerUnit = unit.trim().toLowerCase() === 'tons';

    const formatter = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: isIntegerUnit ? 0 : 2,
        maximumFractionDigits: isIntegerUnit ? 0 : 2
    });

    return formatter.format(rawVal) + unit;
};

// Icons
const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 0 1 3.375-3.375h9.75a3.375 3.375 0 0 1 3.375 3.375v1.875" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 14.25c0-1.02.56-1.92 1.359-2.404M20.625 14.25c0-1.02-.56-1.92-1.359-2.404" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 11.844v2.404" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 14.25V9.375c0-.621.504-1.125 1.125-1.125h15c.621 0 1.125.504 1.125 1.125v4.875" /></svg>;
const CubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>;
const CurrencyRupeeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const ExclamationTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;
const CloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const ArrowTrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" /></svg>;

const KPICard: React.FC<{ title: string; value: string; trend?: string; trendUp?: boolean; icon: React.ReactNode; colorClass: string }> = ({ title, value, trend, trendUp, icon, colorClass }) => (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-5 flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-sm font-medium text-[#6B7280] mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-[#0B1F3B]">{value}</h3>
            {trend && (
                <p className={`text-xs font-medium mt-2 flex items-center ${trendUp ? 'text-[#2E7D32]' : 'text-[#C62828]'}`}>
                    <span className="mr-1">{trendUp ? '↑' : '↓'}</span> {trend}
                </p>
            )}
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>
            {icon}
        </div>
    </div>
);

const ShipmentRow: React.FC<{
    id: string;
    origin: string;
    dest: string;
    mode: string;
    status: string;
    eta: string;
    riskScore: 'High' | 'Medium' | 'Low';
}> = ({ id, origin, dest, mode, status, eta, riskScore }) => {
    const riskColor = riskScore === 'High' ? 'bg-[#C62828]/10 text-[#C62828]' : riskScore === 'Medium' ? 'bg-[#F9A825]/10 text-[#F9A825]' : 'bg-[#2E7D32]/10 text-[#2E7D32]';
    const statusColor = status === 'Delayed' ? 'text-[#C62828] font-semibold' : 'text-[#6B7280]';

    return (
        <tr className="border-b border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors">
            <td className="py-3 px-4 text-sm font-medium text-[#003A8F]">{id}</td>
            <td className="py-3 px-4 text-sm text-[#1A1A1A]">
                <div className="flex flex-col">
                    <span>{origin}</span>
                    <span className="text-xs text-[#6B7280]">➜ {dest}</span>
                </div>
            </td>
            <td className="py-3 px-4 text-sm text-[#6B7280]">{mode}</td>
            <td className={`py-3 px-4 text-sm ${statusColor}`}>{status}</td>
            <td className="py-3 px-4 text-sm text-[#1A1A1A]">
                {eta}
                <span className="block text-[10px] text-[#00AEEF] font-medium">Predictive</span>
            </td>
            <td className="py-3 px-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${riskColor}`}>
                    {riskScore} Risk
                </span>
            </td>
        </tr>
    );
}

const AlertCard: React.FC<{ type: 'Demurrage' | 'Cost' | 'Delay'; title: string; desc: string; severity: 'Critical' | 'Warning' | 'Info' }> = ({ type, title, desc, severity }) => {
    const borderClass = severity === 'Critical' ? 'border-l-4 border-[#C62828]' : severity === 'Warning' ? 'border-l-4 border-[#F9A825]' : 'border-l-4 border-[#003A8F]';
    const bgClass = severity === 'Critical' ? 'bg-red-50' : severity === 'Warning' ? 'bg-amber-50' : 'bg-blue-50';
    const icon = type === 'Demurrage' ? <ClockIcon /> : type === 'Cost' ? <CurrencyRupeeIcon /> : <ExclamationTriangleIcon />;
    const iconColor = severity === 'Critical' ? 'text-[#C62828]' : severity === 'Warning' ? 'text-[#F9A825]' : 'text-[#003A8F]';
    const titleColor = severity === 'Critical' ? 'text-[#C62828]' : severity === 'Warning' ? 'text-amber-800' : 'text-[#003A8F]';

    return (
        <div className={`p-4 rounded-r-lg ${bgClass} ${borderClass} mb-3 flex items-start gap-3`}>
            <div className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`}>
                {icon}
            </div>
            <div>
                <h4 className={`text-sm font-bold ${titleColor}`}>{title}</h4>
                <p className="text-xs text-gray-600 mt-1">{desc}</p>
            </div>
        </div>
    )
}

const HomePage: React.FC<HomePageProps> = ({ scenario, scenarios, setActiveScenarioId, setActiveView, sites }) => {
    const seed = scenario.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Custom parsing/formatting for Homepage KPIs
    const volume = scenario.homepageKpis?.totalVolume ? formatIndianNumber(scenario.homepageKpis.totalVolume) : `${(10000 + (seed % 20) * 100).toLocaleString('en-IN')} Tons`;
    const spend = scenario.homepageKpis?.projectedSpend ? `₹${formatIndianNumber(scenario.homepageKpis.projectedSpend)}` : `₹${(scenario.comparisonData.btap.totalCost / 10000000).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Cr`;
    const savings = scenario.homepageKpis?.potentialSavings ? `₹${formatIndianNumber(scenario.homepageKpis.potentialSavings)}` : `₹${(scenario.costSavings / 100000).toLocaleString('en-IN', { minimumFractionDigits: 2 })} L`;
    const co2 = scenario.homepageKpis?.co2Emissions ? formatIndianNumber(scenario.homepageKpis.co2Emissions) : `${scenario.comparisonData.btap.totalCO2.toLocaleString('en-IN')} Tons`;

    const risk = scenario.homepageKpis?.riskLevel || (seed % 3 === 0 ? 'High' : seed % 3 === 1 ? 'Medium' : 'Low');
    const riskDesc = scenario.homepageKpis?.riskDesc || (risk === 'High' ? '3 critical delays' : risk === 'Medium' ? '1 potential delay' : 'Operations normal');

    const riskColor = risk === 'High' ? 'bg-[#C62828]/10 text-[#C62828]' : risk === 'Medium' ? 'bg-[#F9A825]/10 text-[#F9A825]' : 'bg-[#2E7D32]/10 text-[#2E7D32]';

    // Shipments and alerts prioritized from scenario data
    const shipments = scenario.activeShipments || [];
    const demurrageRisks = scenario.demurrageRisks || [];
    const anomalies = scenario.exceptionsAndAnomalies || [];

    return (
        <div className="flex-1 bg-transparent p-6 overflow-y-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white drop-shadow-md">Logistics Control Tower</h1>
                    <div className="flex items-center gap-2 mt-6">
                        <p className="text-sm text-white">Live visibility for:</p>
                        <div className="relative">
                            <select
                                value={scenario.id}
                                onChange={(e) => setActiveScenarioId(e.target.value)}
                                className="appearance-none bg-transparent font-semibold text-white border-b-2 border-blue-100/50 hover:border-blue-100 focus:outline-none focus:border-white pr-6 cursor-pointer text-sm transition-colors"
                            >
                                {scenarios.map(s => (
                                    <option key={s.id} value={s.id} className="text-[#1A1A1A]">{s.title}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-0 text-white">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Live KPI Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <KPICard title="Total Volume" value={volume} trend="Target met" trendUp={true} icon={<CubeIcon />} colorClass="bg-[#003A8F]/10 text-[#003A8F]" />
                <KPICard title="Projected Spend" value={spend} trend="Optimized" trendUp={false} icon={<CurrencyRupeeIcon />} colorClass="bg-[#F9A825]/10 text-[#F9A825]" />
                <KPICard title="Potential Savings" value={savings} trend="vs BCFC" trendUp={true} icon={<ArrowTrendingUpIcon />} colorClass="bg-[#2E7D32]/10 text-[#2E7D32]" />
                <KPICard title="Risk Level" value={risk} trend={riskDesc} trendUp={false} icon={<ExclamationTriangleIcon />} colorClass={riskColor} />
                <KPICard title="CO₂ Emissions" value={co2} trend="Low Carbon" trendUp={true} icon={<CloudIcon />} colorClass="bg-[#00AEEF]/10 text-[#00AEEF]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Real-time Inbound Shipment Tracking */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#E5E7EB] flex flex-col">
                    <div className="p-5 border-b border-[#E5E7EB] flex justify-between items-center">
                        <h2 className="text-lg font-bold text-[#0B1F3B] flex items-center gap-2">
                            <TruckIcon /> Active Shipments
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-50 text-[#003A8F] text-xs font-semibold">{shipments.length} Active</span>
                        </h2>
                        <button className="text-sm text-[#003A8F] font-medium hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#F4F6F8] text-[#6B7280] text-xs uppercase">
                                <tr>
                                    <th className="py-3 px-4 font-semibold">ID</th>
                                    <th className="py-3 px-4 font-semibold">Route</th>
                                    <th className="py-3 px-4 font-semibold">Mode</th>
                                    <th className="py-3 px-4 font-semibold">Status</th>
                                    <th className="py-3 px-4 font-semibold">ETA</th>
                                    <th className="py-3 px-4 font-semibold">Risk</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB]">
                                {shipments.map(shipment => (
                                    <ShipmentRow
                                        key={shipment.id}
                                        id={shipment.id}
                                        origin={shipment.origin}
                                        dest={shipment.dest}
                                        mode={shipment.mode}
                                        status={shipment.status}
                                        eta={shipment.eta}
                                        riskScore={shipment.riskScore}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Alerts & Anomalies */}
                <div className="flex flex-col gap-6">
                    {/* Demurrage Risks */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-5">
                        <h2 className="text-lg font-bold text-[#0B1F3B] mb-4 flex items-center gap-2">
                            <ClockIcon /> Demurrage Risks
                        </h2>
                        {demurrageRisks.map((alert, i) => (
                            <AlertCard key={i} type="Demurrage" severity={alert.severity} title={alert.title} desc={alert.desc} />
                        ))}
                        {demurrageRisks.length === 0 && <p className="text-sm text-gray-400 italic">No risks identified.</p>}
                    </div>

                    {/* Exceptions & Anomalies */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-5 flex-1">
                        <h2 className="text-lg font-bold text-[#0B1F3B] mb-4 flex items-center gap-2">
                            <ExclamationTriangleIcon /> Exceptions & Anomalies
                        </h2>
                        {anomalies.map((alert, i) => (
                            <AlertCard key={i} type="Delay" severity={alert.severity} title={alert.title} desc={alert.desc} />
                        ))}
                        {anomalies.length === 0 && <p className="text-sm text-gray-400 italic">No anomalies detected.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
