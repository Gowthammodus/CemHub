
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Scenario, Route, Site } from '../types';
import { SiteType, TransportMode } from '../types';
import { LAYERS_CONFIG, PREDEFINED_SCENARIOS_LIST as PREDEFINED_SCENARIOS, btapData, bcfcData, othersData } from '../constants';
import MapView from './MapView';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { generateScenarioRecommendations, type ScenarioRecommendation, type TableRow } from '../services/geminiService';


// --- Helper Icons & Components ---
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);
const DocumentDuplicateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.75 11.375c.621 0 1.125-.504 1.125-1.125v-9.25a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H9.75c-.621 0-1.125.504-1.125 1.125v1.5a1.125 1.125 0 0 1-1.125-1.125h-1.5a3.375 3.375 0 0 0-3.375 3.375v9.25c0 .621.504 1.125 1.125 1.125h3.375" />
    </svg>
);

const ExpandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
);

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
);

const ChartBarSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
);

const siteTypeEmojis: Record<SiteType, string> = {
    [SiteType.RAW_MATERIAL]: '⛏️',
    [SiteType.CEMENT_PLANT]: '🏭',
    [SiteType.DISTRIBUTION_HUB]: '📦',
    [SiteType.RMC_PLANT]: '🏗️',
};

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-bold text-blue-900">{value}</p>
    </div>
);

// --- Interfaces & Constants ---
interface Leg {
    id: number;
    fromId: string | null;
    toId: string | null;
    mode: 'Road' | 'Rail' | 'Sea';
    submode: 'Truck' | 'BTAP' | 'BCFC' | 'Barge' | 'Others';
    distance: number;
    qty: number;
    rate: number;
    fixedCosts: number;
    incentive: boolean;
    co2Factor: number;
    customStartTime?: string; // New field for flexible scheduling
}
const co2Factors = { 'Truck': 0.055, 'BTAP': 0.0061, 'BCFC': 0.0078, 'Barge': 0.004, 'Others': 0.00927 }; // kg/ton-km
const INCENTIVE_PERCENT = 0.10; // 10%
const LEG_COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c'];

const COMPARISON_MODES = [
    { mode: 'Rail', submode: 'BTAP', label: 'Rail (BTAP)' },
    { mode: 'Rail', submode: 'BCFC', label: 'Rail (BCFC)' },
    { mode: 'Rail', submode: 'Others', label: 'Rail (Others)' },
    { mode: 'Road', submode: 'Truck', label: 'Road' },
    { mode: 'Sea', submode: 'Barge', label: 'Sea' },
];

interface ScenarioAnalysisPageProps {
    scenario: Scenario;
    onSaveScenario: (scenario: Scenario) => void;
}

// --- Reusable Legs Table Component ---
interface LegsTableProps {
    legs: Leg[];
    onLegChange: (id: number, field: keyof Leg, value: any) => void;
    onDuplicate: (id: number) => void;
    onDelete: (id: number) => void;
    setHighlightedLegId: React.Dispatch<React.SetStateAction<number | null>>;
    allSitesOptions: React.ReactNode;
    onTransportModeChange: (id: number, value: string) => void;
    isExpanded?: boolean;
}
const LegsTable: React.FC<LegsTableProps> = ({ legs, onLegChange, onDuplicate, onDelete, setHighlightedLegId, allSitesOptions, onTransportModeChange, isExpanded = false }) => {
    const textSize = isExpanded ? 'text-sm' : 'text-xs';
    const inputPadding = isExpanded ? 'p-2' : 'p-1';

    const headers = [
        { name: 'From', className: 'min-w-[150px]' },
        { name: 'To', className: 'min-w-[150px]' },
        { name: 'Transport Mode', className: 'min-w-[140px]' },
        { name: 'Dist (km)', className: 'min-w-[80px]' },
        { name: 'Qty (t)', className: 'min-w-[80px]' },
        { name: 'Rate', className: 'min-w-[70px]' },
        { name: 'Fixed (₹)', className: 'min-w-[90px]' },
        { name: 'Incentive (₹)', className: 'min-w-[100px]' },
        { name: 'Actions', className: 'min-w-[80px]' },
    ];

    return (
        <div className="overflow-x-auto">
            <table className={`w-full min-w-max ${textSize}`}>
                <thead className="bg-gray-100 text-gray-500 uppercase">
                    <tr>
                        {headers.map(h => <th key={h.name} className={`px-2 py-2 text-left font-medium ${h.className}`}>{h.name}</th>)}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {legs.map((leg) => {
                        const legCost = (leg.distance * leg.qty * leg.rate) + leg.fixedCosts;
                        const legIncentive = leg.incentive ? legCost * INCENTIVE_PERCENT : 0;
                        const displayMode = leg.mode === 'Rail' ? `Rail (${leg.submode})` : leg.mode === 'Sea' ? 'Sea' : 'Road';

                        return (
                            <tr key={leg.id} onMouseEnter={() => setHighlightedLegId(leg.id)} onMouseLeave={() => setHighlightedLegId(null)} className="hover:bg-gray-50">
                                <td className={inputPadding}><select value={leg.fromId || ''} onChange={e => onLegChange(leg.id, 'fromId', e.target.value)} className={`w-full bg-white border-gray-300 rounded ${inputPadding}`}><option value="">From...</option>{allSitesOptions}</select></td>
                                <td className={inputPadding}><select value={leg.toId || ''} onChange={e => onLegChange(leg.id, 'toId', e.target.value)} className={`w-full bg-white border-gray-300 rounded ${inputPadding}`}><option value="">To...</option>{allSitesOptions}</select></td>
                                <td className={inputPadding}>
                                    <select
                                        value={displayMode}
                                        onChange={e => onTransportModeChange(leg.id, e.target.value)}
                                        className={`w-full bg-white border-gray-300 rounded ${inputPadding}`}
                                    >
                                        <option value="Road">Road</option>
                                        <option value="Rail (BTAP)">Rail (BTAP)</option>
                                        <option value="Rail (BCFC)">Rail (BCFC)</option>
                                        <option value="Rail (Others)">Rail (Others)</option>
                                        <option value="Sea">Sea</option>
                                    </select>
                                </td>
                                <td className={inputPadding}><input type="number" value={leg.distance.toFixed(0)} onChange={e => onLegChange(leg.id, 'distance', Number(e.target.value))} className={`w-full bg-white border-gray-300 rounded ${inputPadding}`} /></td>
                                <td className={inputPadding}><input type="number" value={leg.qty} onChange={e => onLegChange(leg.id, 'qty', Number(e.target.value))} className={`w-full bg-white border-gray-300 rounded ${inputPadding}`} /></td>
                                <td className={inputPadding}><input type="number" value={leg.rate} step="0.01" onChange={e => onLegChange(leg.id, 'rate', Number(e.target.value))} className={`w-full bg-white border-gray-300 rounded ${inputPadding}`} /></td>
                                <td className={inputPadding}><input type="number" value={leg.fixedCosts} onChange={e => onLegChange(leg.id, 'fixedCosts', Number(e.target.value))} className={`w-full bg-white border-gray-300 rounded ${inputPadding}`} /></td>
                                <td className={`${inputPadding} whitespace-nowrap`}><label className="flex items-center space-x-1"><input type="checkbox" checked={leg.incentive} onChange={(e) => onLegChange(leg.id, 'incentive', e.target.checked)} className="h-3 w-3 rounded" /><span>{legIncentive.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></label></td>
                                <td className={inputPadding}><div className="flex items-center space-x-1"><button onClick={() => onDuplicate(leg.id)} className="p-1 text-gray-500 hover:text-blue-600" title="Duplicate"><DocumentDuplicateIcon className="w-4 h-4" /></button><button onClick={() => onDelete(leg.id)} className="p-1 text-gray-500 hover:text-red-600" title="Delete"><TrashIcon className="w-4 h-4" /></button></div></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
}

// --- Detail Modal Component ---
const getSubmodeDefaults = (submode: Leg['submode']) => {
    switch (submode) {
        case 'BTAP': return { rate: 1.75, co2Factor: co2Factors.BTAP, fixedCosts: 0, incentive: true };
        case 'BCFC': return { rate: 2.10, co2Factor: co2Factors.BCFC, fixedCosts: 0, incentive: false };
        case 'Barge': return { rate: 1.20, co2Factor: co2Factors.Barge, fixedCosts: 10000, incentive: false };
        case 'Others': return { rate: 2.50, co2Factor: co2Factors.Others, fixedCosts: 0, incentive: false };
        case 'Truck': default: return { rate: 2.5, co2Factor: co2Factors.Truck, fixedCosts: 5000, incentive: false };
    }
};

// Helper function to find least cost mode
const getBestMode = (dist: number, qty: number): { mode: Leg['mode'], submode: Leg['submode'], rate: number, fixedCosts: number, incentive: boolean } => {
    // 1. Road (Truck)
    const roadCost = (dist * qty * 2.5) + 5000;

    // 2. Rail (BCFC) - Common for general raw materials
    const bcfcCost = (dist * qty * 2.10); // Assuming 0 fixed for rake indents for simplicity in comparison

    // 3. Rail (BTAP) - Specialized for Cement/FlyAsh
    const btapCost = (dist * qty * 1.75) * 0.90; // Includes 10% incentive approximation

    // 4. Sea (Barge) - Only if distance implies coastal (simplified logic: if very long distance, check sea)
    let seaCost = Infinity;
    if (dist > 800) {
        seaCost = (dist * qty * 1.20) + 10000;
    }

    let best = { mode: 'Road' as Leg['mode'], submode: 'Truck' as Leg['submode'], rate: 2.5, fixedCosts: 5000, incentive: false };
    let minCost = roadCost;

    if (bcfcCost < minCost) {
        minCost = bcfcCost;
        best = { mode: 'Rail', submode: 'BCFC', rate: 2.10, fixedCosts: 0, incentive: false };
    }
    // BTAP usually preferred for finished goods or fly ash, but strictly cost wise:
    if (btapCost < minCost) {
        minCost = btapCost;
        best = { mode: 'Rail', submode: 'BTAP', rate: 1.75, fixedCosts: 0, incentive: true };
    }
    if (seaCost < minCost) {
        best = { mode: 'Sea', submode: 'Barge', rate: 1.20, fixedCosts: 10000, incentive: false };
    }

    return best;
};

// --- Recommendation Table Component ---
const RecommendationTable: React.FC<{ data: TableRow[] }> = ({ data }) => {
    const getPriorityBadge = (priority: string) => {
        const p = priority.toLowerCase();
        if (p.includes('high')) return 'bg-red-100 text-red-800 border-red-200';
        if (p.includes('medium')) return 'bg-orange-100 text-orange-800 border-orange-200';
        return 'bg-green-100 text-green-800 border-green-200';
    };

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Impact</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-800 font-medium">{row.action}</td>
                            <td className="px-4 py-3 text-gray-600">{row.impact}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityBadge(row.priority)}`}>
                                    {row.priority}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- AI Recommendations Modal ---
const AiRecommendationModal: React.FC<{ isOpen: boolean, onClose: () => void, data: ScenarioRecommendation | null, isLoading: boolean }> = ({ isOpen, onClose, data, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-purple-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-full"><SparklesIcon className="w-6 h-6 text-purple-600" /></div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">AI Strategic Recommendations</h2>
                            <p className="text-sm text-gray-500">Optimized insights for Demand, Sources & Logistics</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><CloseIcon className="w-6 h-6" /></button>
                </div>

                <div className="flex-grow p-6 overflow-y-auto bg-gray-50/50">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            <p className="text-gray-500 font-medium">Analyzing Scenario Data...</p>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* Demand Forecasting */}
                            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
                                    <span className="bg-blue-100 p-1.5 rounded text-blue-600 text-sm">1</span> Demand Forecasting
                                </h3>
                                <p className="text-gray-700 mb-4 font-medium">{data.demandForecasting.summary}</p>
                                <RecommendationTable data={data.demandForecasting.tableData} />
                            </div>

                            {/* Source Selection */}
                            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
                                    <span className="bg-orange-100 p-1.5 rounded text-orange-600 text-sm">2</span> Source Selection
                                </h3>
                                <p className="text-gray-700 mb-4 font-medium">{data.sourceSelection.summary}</p>
                                <RecommendationTable data={data.sourceSelection.tableData} />
                            </div>

                            {/* Vehicle & Route Optimization */}
                            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
                                    <span className="bg-green-100 p-1.5 rounded text-green-600 text-sm">3</span> Vehicle & Route Optimization
                                </h3>
                                <p className="text-gray-700 mb-4 font-medium">{data.routeOptimization.summary}</p>
                                <RecommendationTable data={data.routeOptimization.tableData} />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 mt-10">No recommendations generated.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ScenarioDetailModal: React.FC<{
    isOpen: boolean; onClose: () => void; onSave: (newLegs: Leg[]) => void;
    initialLegs: Leg[]; title: string; sitesById: Map<string, Site>; getLegETA: (leg: Leg) => number;
}> = ({ isOpen, onClose, onSave, initialLegs, title, sitesById, getLegETA }) => {
    const [editableLegs, setEditableLegs] = useState<Leg[]>([]);
    const [dispatchDateTime, setDispatchDateTime] = useState(() => {
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
    });
    const [manufacturingDuration, setManufacturingDuration] = useState(24);

    // AI Recommendation States
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiRecommendations, setAiRecommendations] = useState<ScenarioRecommendation | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    // Cumulative View State
    const [isCumulativeView, setIsCumulativeView] = useState(false);

    useEffect(() => { setEditableLegs(JSON.parse(JSON.stringify(initialLegs))); }, [initialLegs]);

    const handleLegStartTimeChange = (legId: number, value: string) => {
        setEditableLegs(prev => prev.map(leg =>
            leg.id === legId ? { ...leg, customStartTime: value } : leg
        ));
    };

    const handleGetAiRecommendations = async () => {
        setIsAiLoading(true);
        setIsAiModalOpen(true); // Open modal immediately to show loading state
        try {
            // Construct a mini scenario object for the context
            const contextData = { title: title };
            const recommendations = await generateScenarioRecommendations(contextData, editableLegs);
            setAiRecommendations(recommendations);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAiLoading(false);
        }
    };

    const timelineCalculations = useMemo(() => {
        if (!dispatchDateTime) return { legTimes: new Map(), milestones: [], finalETA: null, totalTransitHours: 0 };

        const legTimes = new Map<number, { startTime: Date, arrivalTime: Date }>();
        const milestones: { label: string, time: Date, type: 'dispatch' | 'arrival' | 'manufacturing' }[] = [];
        const globalDispatchTime = new Date(dispatchDateTime);

        milestones.push({ label: 'Global Dispatch', time: globalDispatchTime, type: 'dispatch' });

        let maxRawMaterialArrival: Date = new Date(0); // Epoch 0
        const rawMaterialLegs: Leg[] = [];
        const otherLegs: Leg[] = [];

        // 1. Separate Legs
        for (const leg of editableLegs) {
            const toSite = sitesById.get(leg.toId || '');
            if (toSite && toSite.type === SiteType.CEMENT_PLANT) {
                rawMaterialLegs.push(leg);
            } else {
                otherLegs.push(leg);
            }
        }

        // 2. Process Raw Materials (Parallel Execution)
        for (const leg of rawMaterialLegs) {
            // Use custom start time if set, otherwise default to global dispatch (Requirement: start time same for all raw materials)
            const startTime = leg.customStartTime ? new Date(leg.customStartTime) : new Date(globalDispatchTime);

            const durationHours = getLegETA(leg);
            const arrivalTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

            legTimes.set(leg.id, { startTime, arrivalTime });

            if (arrivalTime.getTime() > maxRawMaterialArrival.getTime()) {
                maxRawMaterialArrival = arrivalTime;
            }
        }

        // 3. Process Manufacturing & Distribution
        // "only the cement plant to distribution hub start time should depend on the completion of all raw materials"
        let manufacturingCompleteTime = new Date(globalDispatchTime); // Default if no raw materials
        if (rawMaterialLegs.length > 0) {
            manufacturingCompleteTime = new Date(maxRawMaterialArrival.getTime() + manufacturingDuration * 60 * 60 * 1000);
            milestones.push({ label: 'Raw Materials Arrived', time: maxRawMaterialArrival, type: 'arrival' });
            milestones.push({ label: 'Manufacturing Complete', time: manufacturingCompleteTime, type: 'manufacturing' });
        }

        // Sort remaining legs to process sequentially or logical chain
        // Assuming sequence: Plant -> Hub -> RMC based on 'fromId' matching previous 'toId'
        // But for this specific scenario structure, we look for legs starting from the Plant

        let currentChainTime = new Date(manufacturingCompleteTime);

        // Sort other legs to ensure correct chain order (Plant->Hub, Hub->RMC)
        // Simplistic sort: Legs starting from Plant, then Legs starting from Hub
        const sortedOtherLegs = [...otherLegs].sort((a, b) => {
            const fromA = sitesById.get(a.fromId || '');
            const fromB = sitesById.get(b.fromId || '');
            if (fromA?.type === SiteType.CEMENT_PLANT) return -1;
            if (fromB?.type === SiteType.CEMENT_PLANT) return 1;
            return 0;
        });

        for (const leg of sortedOtherLegs) {
            const fromSite = sitesById.get(leg.fromId || '');

            // Determine Start Time
            let startTime = new Date(currentChainTime);

            // If user explicitly set a start time, use it
            if (leg.customStartTime) {
                startTime = new Date(leg.customStartTime);
            }
            // Automatic Logic: 
            // If it starts from Cement Plant, it waits for Manufacturing (Requirement 3)
            // If it starts from Hub, it waits for the previous leg (Arrival at Hub)
            else if (fromSite && fromSite.type === SiteType.DISTRIBUTION_HUB) {
                // Find arrival time of leg leading to this hub
                const inboundLeg = editableLegs.find(l => l.toId === leg.fromId);
                if (inboundLeg) {
                    const inboundTime = legTimes.get(inboundLeg.id);
                    if (inboundTime) startTime = inboundTime.arrivalTime;
                }
            }

            const durationHours = getLegETA(leg);
            const arrivalTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

            legTimes.set(leg.id, { startTime, arrivalTime });

            // Update chain time for next sequential leg
            currentChainTime = arrivalTime;

            const toSite = sitesById.get(leg.toId || '');
            if (toSite) {
                if (toSite.type === SiteType.DISTRIBUTION_HUB) milestones.push({ label: 'Hub Arrival', time: arrivalTime, type: 'arrival' });
                if (toSite.type === SiteType.RMC_PLANT) milestones.push({ label: 'RMC Arrival', time: arrivalTime, type: 'arrival' });
            }
        }

        milestones.sort((a, b) => a.time.getTime() - b.time.getTime());

        // Final ETA is the max of all arrival times
        let maxArrival = new Date(globalDispatchTime);
        legTimes.forEach(t => {
            if (t.arrivalTime.getTime() > maxArrival.getTime()) maxArrival = t.arrivalTime;
        });

        const totalTransitHours = (maxArrival.getTime() - globalDispatchTime.getTime()) / (1000 * 60 * 60);

        return { legTimes, milestones, finalETA: maxArrival, totalTransitHours };
    }, [dispatchDateTime, manufacturingDuration, editableLegs, getLegETA, sitesById]);

    const modalSummary = useMemo(() => {
        const summary: Record<string, { cost: number; qty: number; co2: number; time: number }> = {};
        const total = { cost: 0, qty: 0, co2: 0, time: 0 };

        editableLegs.forEach(leg => {
            const mode = leg.mode === 'Rail' ? `Rail (${leg.submode})` : leg.mode;
            if (!summary[mode]) {
                summary[mode] = { cost: 0, qty: 0, co2: 0, time: 0 };
            }

            const cost = ((leg.distance * leg.qty * leg.rate) + leg.fixedCosts) * (leg.incentive ? (1 - INCENTIVE_PERCENT) : 1);
            const co2 = (leg.distance * leg.qty * leg.co2Factor) / 1000;
            const time = getLegETA(leg);

            summary[mode].cost += cost;
            summary[mode].qty += leg.qty;
            summary[mode].co2 += co2;
            summary[mode].time += time;

            total.cost += cost;
            total.qty += leg.qty;
            total.co2 += co2;
            total.time += time;
        });

        return { summary, total };
    }, [editableLegs, getLegETA]);

    const formatDateTime = (date: Date | null) => {
        if (!date) return 'N/A';
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '');
    };

    if (!isOpen) return null;

    const handleModalTransportModeChange = (legId: number, value: string) => {
        setEditableLegs(currentLegs => currentLegs.map(leg => {
            if (leg.id !== legId) return leg;
            let mode: Leg['mode'] = 'Road';
            let submode: Leg['submode'] = 'Truck';

            if (value.startsWith('Rail')) {
                mode = 'Rail';
                const match = value.match(/\((.*?)\)/);
                if (match) submode = match[1] as Leg['submode'];
            } else if (value === 'Sea') {
                mode = 'Sea';
                submode = 'Barge';
            }

            const defaults = getSubmodeDefaults(submode);
            return { ...leg, mode, submode, ...defaults };
        }));
    };

    const calculateComparisonMetrics = (leg: Leg, modeType: string, submodeType: string) => {
        const defaults = getSubmodeDefaults(submodeType as any);
        const dist = leg.distance;
        const q = leg.qty;

        // Recalculate cost
        const cost = ((dist * q * defaults.rate) + defaults.fixedCosts) * (defaults.incentive ? (1 - INCENTIVE_PERCENT) : 1);
        const co2 = (dist * q * defaults.co2Factor) / 1000;

        let speed = 50, unloading = 2;
        if (modeType === 'Rail') { speed = 70; unloading = submodeType === 'BTAP' ? 2.5 : 5; }
        else if (modeType === 'Sea') { speed = 25; unloading = 10; }
        const time = (dist / speed) + unloading;

        return { cost, co2, time };
    };

    const totals = editableLegs.reduce((acc, leg) => {
        const cost = ((leg.distance * leg.qty * leg.rate) + leg.fixedCosts) * (leg.incentive ? (1 - INCENTIVE_PERCENT) : 1);
        const co2 = (leg.distance * leg.qty * leg.co2Factor) / 1000;
        const time = getLegETA(leg);
        return { cost: acc.cost + cost, co2: acc.co2 + co2, time: acc.time + time };
    }, { cost: 0, co2: 0, time: 0 });

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <AiRecommendationModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                data={aiRecommendations}
                isLoading={isAiLoading}
            />
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-screen-xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-blue-900">Scenario Details: {title}</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsCumulativeView(!isCumulativeView)}
                            className={`flex items-center gap-2 border border-gray-300 font-semibold py-1.5 px-3 rounded-md text-sm shadow-sm transition-all ${isCumulativeView ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            <ChartBarSquareIcon className="w-4 h-4" />
                            {isCumulativeView ? 'Standard View' : 'Cumulative Scenario View'}
                        </button>
                        <button
                            onClick={handleGetAiRecommendations}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-1.5 px-3 rounded-md text-sm shadow-sm transition-all"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            AI Recommendations
                        </button>
                        <button onClick={onClose} className="p-1 text-gray-500 rounded-full hover:bg-gray-200" title="Close"><CloseIcon className="w-6 h-6" /></button>
                    </div>
                </div>
                <div className="flex-grow p-4 overflow-auto space-y-4">
                    {!isCumulativeView && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2 bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-end gap-4">
                                <div className="flex-grow">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Dispatch Date & Time</label>
                                    <input type="datetime-local" value={dispatchDateTime} onChange={e => setDispatchDateTime(e.target.value)} className="w-full bg-white border-gray-300 rounded p-2 text-sm" />
                                </div>
                                <div className="flex-grow">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Manufacturing Duration (hrs)</label>
                                    <input type="number" value={manufacturingDuration} onChange={e => setManufacturingDuration(Number(e.target.value))} className="w-full bg-white border-gray-300 rounded p-2 text-sm" />
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <h4 className="text-xs text-gray-500 uppercase">Summary</h4>
                                <div className="flex justify-between items-baseline"><span className="font-semibold text-gray-700">Final ETA:</span><span className="text-lg font-bold text-green-600">{formatDateTime(timelineCalculations.finalETA)}</span></div>
                                <div className="flex justify-between items-baseline text-sm"><span className="text-gray-600">Total Transit Time:</span><span className="font-semibold">{timelineCalculations.totalTransitHours.toFixed(1)} hrs</span></div>
                            </div>
                        </div>
                    )}

                    <table className="w-full text-sm text-left">
                        {isCumulativeView ? (
                            <>
                                <thead className="bg-gray-100 text-gray-500 uppercase sticky top-0">
                                    <tr>
                                        <th className="p-2"></th>
                                        <th className="p-2">Route Details</th>
                                        <th className="p-2">Mode Option</th>
                                        <th className="p-2">Est. Time (hrs)</th>
                                        <th className="p-2">Est. Cost (₹)</th>
                                        <th className="p-2">Est. CO₂ (tons)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {editableLegs.map((leg, index) => {
                                        const from = sitesById.get(leg.fromId!)?.name || 'N/A';
                                        const to = sitesById.get(leg.toId!)?.name || 'N/A';

                                        return (
                                            <React.Fragment key={leg.id}>
                                                <tr className="bg-gray-50 border-t-2 border-gray-200">
                                                    <td className="p-2 font-bold text-blue-900 w-16">Leg {index + 1}</td>
                                                    <td className="p-2 font-semibold text-gray-700" colSpan={5}>
                                                        {from} ➜ {to} <span className="text-gray-500 font-normal ml-2">({leg.distance.toFixed(0)} km, {leg.qty} t)</span>
                                                    </td>
                                                </tr>
                                                {COMPARISON_MODES.map((compMode) => {
                                                    const metrics = calculateComparisonMetrics(leg, compMode.mode, compMode.submode);
                                                    const isSelected = leg.mode === compMode.mode && leg.submode === compMode.submode;
                                                    return (
                                                        <tr key={`${leg.id}-${compMode.label}`} className={isSelected ? "bg-green-50/50 border-l-4 border-green-500" : "hover:bg-gray-50 border-l-4 border-transparent"}>
                                                            <td className="p-2"></td>
                                                            <td className="p-2 text-gray-400 text-xs pl-6"></td>
                                                            <td className="p-2 font-medium">
                                                                {compMode.label}
                                                                {isSelected && <span className="ml-2 text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded uppercase font-bold">Selected</span>}
                                                            </td>
                                                            <td className="p-2">{metrics.time.toFixed(1)}</td>
                                                            <td className="p-2">₹{metrics.cost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                            <td className="p-2">{metrics.co2.toFixed(2)}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </>
                        ) : (
                            <>
                                <thead className="bg-gray-100 text-gray-500 uppercase sticky top-0"><tr>
                                    <th className="p-2">Phase</th><th className="p-2">From</th><th className="p-2">To</th><th className="p-2">Distance (km)</th>
                                    <th className="p-2 min-w-[140px]">Transport Mode</th><th className="p-2">Time (hrs)</th>
                                    <th className="p-2 whitespace-nowrap">Start Time</th><th className="p-2 whitespace-nowrap">Arrival Time</th>
                                    <th className="p-2">Cost (₹)</th><th className="p-2">CO₂ (tons)</th>
                                </tr></thead>
                                <tbody className="divide-y divide-gray-200">
                                    {editableLegs.map((leg, index) => {
                                        const from = sitesById.get(leg.fromId!)?.name || 'N/A';
                                        const to = sitesById.get(leg.toId!)?.name || 'N/A';
                                        const cost = ((leg.distance * leg.qty * leg.rate) + leg.fixedCosts) * (leg.incentive ? (1 - INCENTIVE_PERCENT) : 1);
                                        const co2 = (leg.distance * leg.qty * leg.co2Factor) / 1000;
                                        const time = getLegETA(leg);
                                        const legTimeData = timelineCalculations.legTimes.get(leg.id);
                                        const displayMode = leg.mode === 'Rail' ? `Rail (${leg.submode})` : leg.mode === 'Sea' ? 'Sea' : 'Road';
                                        const calculatedStartTime = legTimeData?.startTime ? new Date(legTimeData.startTime.getTime() - (legTimeData.startTime.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '';

                                        return (
                                            <tr key={leg.id} className="hover:bg-gray-50">
                                                <td className="p-2 font-semibold">Leg {index + 1}</td><td className="p-2">{from}</td><td className="p-2">{to}</td><td className="p-2">{leg.distance.toFixed(0)}</td>
                                                <td className="p-2">
                                                    <select
                                                        value={displayMode}
                                                        onChange={e => handleModalTransportModeChange(leg.id, e.target.value)}
                                                        className="w-full bg-white border-gray-300 rounded p-1"
                                                    >
                                                        <option value="Road">Road</option>
                                                        <option value="Rail (BTAP)">Rail (BTAP)</option>
                                                        <option value="Rail (BCFC)">Rail (BCFC)</option>
                                                        <option value="Rail (Others)">Rail (Others)</option>
                                                        <option value="Sea">Sea</option>
                                                    </select>
                                                </td>
                                                <td className="p-2">{time.toFixed(1)}</td>
                                                <td className="p-2 whitespace-nowrap">
                                                    <input
                                                        type="datetime-local"
                                                        value={leg.customStartTime || calculatedStartTime}
                                                        onChange={(e) => handleLegStartTimeChange(leg.id, e.target.value)}
                                                        className="w-40 border border-gray-300 rounded px-1 text-xs"
                                                    />
                                                </td>
                                                <td className="p-2 whitespace-nowrap">{formatDateTime(legTimeData?.arrivalTime || null)}</td>
                                                <td className="p-2">{cost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                <td className="p-2">{co2.toFixed(2)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                <tfoot className="bg-gray-100 font-bold sticky bottom-0"><tr>
                                    <td className="p-2" colSpan={5}>Total</td>
                                    <td className="p-2">{totals.time.toFixed(1)}</td>
                                    <td className="p-2"></td><td className="p-2"></td>
                                    <td className="p-2">{totals.cost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                    <td className="p-2">{totals.co2.toFixed(2)}</td>
                                </tr></tfoot>
                            </>
                        )}
                    </table>

                    <div className="pt-4">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Summary</h3>
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-gray-100 text-gray-500 uppercase text-xs">
                                    <tr>
                                        <th className="p-3 border-b">Mode</th>
                                        <th className="p-3 border-b">Total Cost (₹)</th>
                                        <th className="p-3 border-b">Total Qty (T)</th>
                                        <th className="p-3 border-b">Total CO₂ (T)</th>
                                        <th className="p-3 border-b">Total Time (HRS)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(modalSummary.summary).map(mode => (
                                        <tr key={mode} className="border-b">
                                            <td className="p-3 font-medium">{mode}</td>
                                            <td className="p-3">{modalSummary.summary[mode].cost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                            <td className="p-3">{modalSummary.summary[mode].qty.toLocaleString('en-IN')}</td>
                                            <td className="p-3">{modalSummary.summary[mode].co2.toFixed(2)}</td>
                                            <td className="p-3">{modalSummary.summary[mode].time.toFixed(1)}</td>
                                        </tr>
                                    ))}
                                    <tr className="font-bold bg-gray-50">
                                        <td className="p-3">Total</td>
                                        <td className="p-3">{modalSummary.total.cost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                        <td className="p-3">{modalSummary.total.qty.toLocaleString('en-IN')}</td>
                                        <td className="p-3">{modalSummary.total.co2.toFixed(2)}</td>
                                        <td className="p-3">{modalSummary.total.time.toFixed(1)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {!isCumulativeView && (
                            <>
                                <h4 className="text-md font-semibold text-gray-700 mb-4">Estimated Timeline</h4>
                                <div className="flex items-start w-full">
                                    {timelineCalculations.milestones.map((milestone, index) => (
                                        <React.Fragment key={index}>
                                            <div className="flex flex-col items-center text-center -mt-1">
                                                <div className={`w-4 h-4 rounded-full border-2 ${milestone.type === 'dispatch' ? 'bg-green-500 border-green-700' : milestone.type === 'manufacturing' ? 'bg-yellow-400 border-yellow-600' : 'bg-blue-500 border-blue-700'}`}></div>
                                                <div className="text-xs mt-2 w-24"><p className="font-semibold">{milestone.label}</p><p className="text-gray-500">{formatDateTime(milestone.time)}</p></div>
                                            </div>
                                            {index < timelineCalculations.milestones.length - 1 && (<div className="flex-grow h-0.5 bg-gray-300 mt-1.5"></div>)}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0 flex justify-end items-center p-4 border-t space-x-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
                    <button onClick={() => onSave(editableLegs)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md text-sm">Apply Changes</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const ScenarioAnalysisPage: React.FC<ScenarioAnalysisPageProps> = ({ scenario, onSaveScenario }) => {
    // State
    const [activeTab, setActiveTab] = useState<'predefined' | 'custom'>('predefined');
    const [predefinedList, setPredefinedList] = useState<any[]>(PREDEFINED_SCENARIOS);
    const [selectedPredefinedId, setSelectedPredefinedId] = useState<string | null>(PREDEFINED_SCENARIOS[0].id);
    const [scenarioTitle, setScenarioTitle] = useState('Mumbai RMC – Worli (1000t)');
    const [targetRmcId, setTargetRmcId] = useState<string>('mumbai_rmc_1');
    const [targetPlantId, setTargetPlantId] = useState<string>('');
    const [targetHubId, setTargetHubId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1000);
    const [isLoading, setIsLoading] = useState(false);
    const [legs, setLegs] = useState<Leg[]>([]);
    const [highlightedLegId, setHighlightedLegId] = useState<number | null>(null);
    const [comparisonTab, setComparisonTab] = useState<'Cost' | 'CO₂' | 'Time'>('Cost');
    const [isLegsExpanded, setIsLegsExpanded] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [modalLegs, setModalLegs] = useState<Leg[]>([]);
    const [modalTitle, setModalTitle] = useState('');

    // Memos
    const sitesById = useMemo(() => new Map(scenario.sites.map(s => [s.id, s])), [scenario.sites]);
    const rmcPlants = useMemo(() => scenario.sites.filter(site => site.type === SiteType.RMC_PLANT), [scenario.sites]);
    const cementPlants = useMemo(() => scenario.sites.filter(site => site.type === SiteType.CEMENT_PLANT), [scenario.sites]);
    const hubs = useMemo(() => scenario.sites.filter(site => site.type === SiteType.DISTRIBUTION_HUB), [scenario.sites]);

    const allSitesOptions = useMemo(() => scenario.sites.map(s => (
        <option key={s.id} value={s.id}>{siteTypeEmojis[s.type]} {s.name}</option>
    )), [scenario.sites]);

    const haversineDistance = useCallback((coords1: [number, number], coords2: [number, number]) => {
        if (!coords1 || !coords2) return 0;
        const toRad = (x: number) => (x * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(coords2[0] - coords1[0]);
        const dLon = toRad(coords2[1] - coords1[1]);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(coords1[0])) * Math.cos(toRad(coords2[0])) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }, []);

    const getLegETA = useCallback((leg: Leg): number => {
        let speed = 50, unloading = 2; // Road defaults
        if (leg.mode === 'Rail') { speed = 70; unloading = leg.submode === 'BTAP' ? 2.5 : 5; }
        else if (leg.mode === 'Sea') { speed = 25; unloading = 10; }
        return (leg.distance / speed) + unloading;
    }, []);

    // Set defaults if not set
    useEffect(() => {
        if (!targetPlantId && cementPlants.length > 0) setTargetPlantId(cementPlants[0].id);
        if (!targetHubId && hubs.length > 0) setTargetHubId(hubs[0].id);
        if (!targetRmcId && rmcPlants.length > 0) setTargetRmcId(rmcPlants[0].id);
    }, [cementPlants, hubs, rmcPlants, targetPlantId, targetHubId, targetRmcId]);

    const generateLegsForPredefined = useCallback((predefinedId: string, targetQty: number) => {
        const selected = predefinedList.find(s => s.id === predefinedId);
        if (!selected) return [];

        // Use cached legs if available (for scenarios created via "Apply Changes")
        if (selected.cachedLegs) {
            return selected.cachedLegs.map((l: Leg) => ({ ...l, qty: targetQty }));
        }

        const allRawMaterialSiteIds = [
            'odisha_mine',      // Limestone
            'jharkhand_mine',   // Fly Ash
            'rajasthan_gypsum', // Gypsum
            'durgapur_slag',    // Slag
            'gujarat_alumina',  // Alumina
            'tamil_nadu_lignite', // Lignite
        ];

        const createLeg = (fromId: string, toId: string, legType: 'raw' | 'main' | 'last'): Leg => {
            const fromSite = sitesById.get(fromId);
            const toSite = sitesById.get(toId);
            const dist = (fromSite && toSite) ? haversineDistance(fromSite.position, toSite.position) : 0;

            // Optimization logic: select best mode based on cost
            const optimized = getBestMode(dist, targetQty);
            let { mode, submode, rate, fixedCosts, incentive } = optimized;

            // Override last mile to always be road if short distance
            if (legType === 'last' && dist < 100) {
                mode = 'Road'; submode = 'Truck'; rate = 3.0; fixedCosts = 2000; incentive = false;
            }

            return {
                id: Date.now() + Math.random(), fromId, toId, mode, submode, distance: dist, qty: targetQty, rate, fixedCosts, incentive,
                co2Factor: co2Factors[submode],
            };
        };

        const newLegs: Leg[] = [];

        // Add all raw material legs
        allRawMaterialSiteIds.forEach(rawSiteId => {
            newLegs.push(createLeg(rawSiteId, selected.path.plant, 'raw'));
        });

        // Add plant to hub leg
        newLegs.push(createLeg(selected.path.plant, selected.path.hub, 'main'));

        // Add hub to rmc leg
        newLegs.push(createLeg(selected.path.hub, selected.path.rmc, 'last'));

        return newLegs;
    }, [sitesById, haversineDistance, predefinedList]);

    // Generate legs for predefined scenarios
    useEffect(() => {
        if (activeTab !== 'predefined' || !selectedPredefinedId) {
            if (activeTab === 'predefined') setLegs([]);
            return;
        }
        const selected = predefinedList.find(s => s.id === selectedPredefinedId);
        if (!selected) return;

        const newLegs = generateLegsForPredefined(selected.id, quantity);
        setLegs(newLegs);
        setScenarioTitle(`${selected.name} (${quantity}t)`);

    }, [activeTab, selectedPredefinedId, quantity, generateLegsForPredefined, predefinedList]);

    const analysisResults = useMemo(() => {
        let totalCost = 0, totalCO2 = 0, totalETA = 0, incentiveSavings = 0;
        legs.forEach(leg => {
            const legCost = (leg.distance * leg.qty * leg.rate) + leg.fixedCosts;
            const legIncentive = leg.incentive ? legCost * INCENTIVE_PERCENT : 0;
            totalCost += legCost - legIncentive;
            totalCO2 += (leg.distance * leg.qty * leg.co2Factor) / 1000;
            totalETA += getLegETA(leg);
            incentiveSavings += legIncentive;
        });
        return { totalCost, totalCO2, totalETA, incentiveSavings };
    }, [legs, getLegETA]);

    const costSummary = useMemo(() => {
        const summary: Record<string, { cost: number; co2: number; qty: number; time: number }> = {};
        let total = { cost: 0, co2: 0, qty: 0, time: 0 };

        legs.forEach(leg => {
            const modeKey = leg.mode === 'Rail' ? `Rail (${leg.submode})` : leg.mode;

            if (!summary[modeKey]) {
                summary[modeKey] = { cost: 0, co2: 0, qty: 0, time: 0 };
            }

            const legCost = ((leg.distance * leg.qty * leg.rate) + leg.fixedCosts);
            const legIncentive = leg.incentive ? legCost * INCENTIVE_PERCENT : 0;
            const finalLegCost = legCost - legIncentive;
            const legCO2 = (leg.distance * leg.qty * leg.co2Factor); // in kg
            const legETA = getLegETA(leg);

            summary[modeKey].cost += finalLegCost;
            summary[modeKey].co2 += legCO2;
            summary[modeKey].qty += leg.qty;
            summary[modeKey].time += legETA;

            total.cost += finalLegCost;
            total.co2 += legCO2;
            total.qty += leg.qty;
            total.time += legETA;
        });
        return { ...summary, Total: total };
    }, [legs, getLegETA]);

    const chartData = useMemo(() => {
        const data: any = { name: comparisonTab, total: 0 };
        legs.forEach((leg, index) => {
            const legId = `Leg ${index + 1}`;
            let value = 0;
            if (comparisonTab === 'Cost') value = ((leg.distance * leg.qty * leg.rate) + leg.fixedCosts) * (leg.incentive ? (1 - INCENTIVE_PERCENT) : 1);
            else if (comparisonTab === 'CO₂') value = (leg.distance * leg.qty * leg.co2Factor) / 1000;
            else value = getLegETA(leg);
            data[legId] = value;
            data.total += value;
        });
        return [data];
    }, [legs, comparisonTab, getLegETA]);

    // Handlers
    const handleReset = () => {
        setScenarioTitle('Mumbai RMC – Worli (1000t)');
        setTargetRmcId(rmcPlants.length > 0 ? rmcPlants[0].id : '');
        setTargetPlantId(cementPlants.length > 0 ? cementPlants[0].id : '');
        setTargetHubId(hubs.length > 0 ? hubs[0].id : '');
        setQuantity(1000);
        setLegs([]);
        setSelectedPredefinedId(null);
        setActiveTab('custom');
    };

    const handleSubmitScenario = (isSuggestion: boolean = false) => {
        if (!targetPlantId || !targetHubId || !targetRmcId) {
            if (!isSuggestion) alert("Please select a Cement Plant, Distribution Hub, and RMC Unit.");
            return;
        }

        const plant = sitesById.get(targetPlantId);
        const hub = sitesById.get(targetHubId);
        const rmc = sitesById.get(targetRmcId);

        if (!plant || !hub || !rmc) return;

        const newLegs: Leg[] = [];
        const rawMaterials = scenario.sites.filter(s => s.type === SiteType.RAW_MATERIAL);

        // Raw Materials -> Plant
        rawMaterials.forEach(rm => {
            const dist = haversineDistance(rm.position, plant.position);
            const optimized = getBestMode(dist, quantity);

            newLegs.push({
                id: Date.now() + Math.random(),
                fromId: rm.id,
                toId: plant.id,
                distance: dist,
                qty: quantity,
                ...optimized,
                co2Factor: co2Factors[optimized.submode]
            });
        });

        // Plant -> Hub
        const distPlantHub = haversineDistance(plant.position, hub.position);
        const optimizedPlantHub = getBestMode(distPlantHub, quantity);
        newLegs.push({
            id: Date.now() + Math.random(),
            fromId: plant.id,
            toId: hub.id,
            distance: distPlantHub,
            qty: quantity,
            ...optimizedPlantHub,
            co2Factor: co2Factors[optimizedPlantHub.submode]
        });

        // Hub -> RMC
        const distHubRmc = haversineDistance(hub.position, rmc.position);
        newLegs.push({
            id: Date.now() + Math.random(),
            fromId: hub.id,
            toId: rmc.id,
            mode: 'Road',
            submode: 'Truck',
            distance: distHubRmc,
            qty: quantity,
            ...getSubmodeDefaults('Truck')
        });

        setLegs(newLegs);
        const autoLabel = isSuggestion ? ' (Optimized)' : '';
        setScenarioTitle(`Custom: ${plant.name.split(' ')[0]} ➜ ${hub.name.split(' ')[0]} ➜ ${rmc.name.split(' - ')[1] || rmc.name} (${quantity}t)${autoLabel}`);
    };

    const handleAddScenario = () => {
        if (legs.length === 0) {
            alert("Please build a route before saving.");
            return;
        }
        if (!scenarioTitle.trim()) {
            alert("Please enter a scenario title.");
            return;
        }

        const newRoutes: Route[] = legs.map(leg => {
            const fromSite = sitesById.get(leg.fromId || '');
            const toSite = sitesById.get(leg.toId || '');
            let transportMode: TransportMode;
            switch (leg.submode) {
                case 'BTAP': transportMode = TransportMode.RAIL_BTAP; break;
                case 'BCFC': transportMode = TransportMode.RAIL_BCFC; break;
                case 'Truck': transportMode = TransportMode.ROAD; break;
                case 'Barge': transportMode = TransportMode.SEA; break;
                default: transportMode = TransportMode.ROAD;
            }

            return {
                id: `route_${leg.id}`,
                from: leg.fromId || '',
                to: leg.toId || '',
                mode: transportMode,
                path: (fromSite && toSite) ? [fromSite.position, toSite.position] : [],
                capacity: `${leg.qty} tons`
            };
        });

        // Mock comparison based on current legs to populate Scenario structure
        const currentCost = analysisResults.totalCost;
        const currentCO2 = analysisResults.totalCO2;

        // Mock "Others" (Road) baseline for comparison display
        const baselineCost = currentCost * 1.4;
        const baselineCO2 = currentCO2 * 2.5;

        const newScenario: Scenario = {
            id: `custom_scenario_${Date.now()}`,
            title: scenarioTitle,
            description: `Custom scenario created via Planner. Qty: ${quantity}t`,
            sites: scenario.sites,
            routes: newRoutes,
            regions: ['Custom'],
            comparisonData: {
                btap: { ...btapData, totalCost: currentCost, totalCO2: currentCO2 * 1000 }, // Storing actual plan as "BTAP" for simplicity in charts
                bcfc: { ...bcfcData, totalCost: currentCost * 1.15, totalCO2: currentCO2 * 1000 * 1.2 }, // Mock comparison
                others: { ...othersData, totalCost: baselineCost, totalCO2: baselineCO2 * 1000 }
            },
            costSavings: baselineCost - currentCost,
            co2Savings: baselineCO2 - currentCO2,
            costBreakdown: scenario.costBreakdown, // Inherit base costs
            costSplit: scenario.costSplit
        };

        // Update local predefined list for display
        const newTemplate = {
            id: newScenario.id,
            name: newScenario.title,
            description: newScenario.description,
            path: {
                plant: targetPlantId,
                hub: targetHubId,
                rmc: targetRmcId
            },
            cachedLegs: legs // Store the custom legs so they aren't lost on regeneration
        };
        setPredefinedList(prev => [...prev, newTemplate]);

        onSaveScenario(newScenario);
        setActiveTab('predefined');
        setSelectedPredefinedId(newScenario.id);
    };

    const handleLegChange = (id: number, field: keyof Leg, value: any) => {
        setLegs(legs => legs.map(leg => {
            if (leg.id !== id) return leg;

            let updatedLeg = { ...leg };

            if (field === 'mode') {
                const newMode = value as Leg['mode'];
                if (updatedLeg.mode !== newMode) {
                    let newSubmode: Leg['submode'];
                    if (newMode === 'Road') newSubmode = 'Truck';
                    else if (newMode === 'Rail') newSubmode = 'BTAP';
                    else newSubmode = 'Barge';
                    const defaults = getSubmodeDefaults(newSubmode);
                    updatedLeg = { ...updatedLeg, mode: newMode, submode: newSubmode, ...defaults };
                }
            } else if (field === 'submode') {
                const newSubmode = value as Leg['submode'];
                const defaults = getSubmodeDefaults(newSubmode);
                updatedLeg = { ...updatedLeg, submode: newSubmode, ...defaults };
            } else {
                updatedLeg = { ...updatedLeg, [field]: value };
            }

            if (field === 'fromId' || field === 'toId') {
                const fromSite = sitesById.get(updatedLeg.fromId || '');
                const toSite = sitesById.get(updatedLeg.toId || '');
                if (fromSite && toSite) {
                    updatedLeg.distance = haversineDistance(fromSite.position, toSite.position);
                }
            }

            return updatedLeg;
        }));
    };

    const handleTransportModeChange = (id: number, value: string) => {
        setLegs(legs => legs.map(leg => {
            if (leg.id !== id) return leg;

            let mode: Leg['mode'] = 'Road';
            let submode: Leg['submode'] = 'Truck';

            if (value.startsWith('Rail')) {
                mode = 'Rail';
                const match = value.match(/\((.*?)\)/);
                if (match) submode = match[1] as Leg['submode'];
            } else if (value === 'Sea') {
                mode = 'Sea';
                submode = 'Barge';
            }

            const defaults = getSubmodeDefaults(submode);
            return { ...leg, mode, submode, ...defaults };
        }));
    };

    const handleOpenDetailsModal = (predefinedId: string) => {
        const selected = predefinedList.find(s => s.id === predefinedId);
        if (!selected) return;
        const newLegs = generateLegsForPredefined(predefinedId, quantity);
        setModalLegs(newLegs);
        setModalTitle(selected.name);
        setIsDetailModalOpen(true);
    };

    const handleSaveChangesFromModal = (newLegs: Leg[]) => {
        // 1. Calculate stats for the new scenario
        let totalCost = 0, totalCO2 = 0;
        newLegs.forEach(leg => {
            const legCost = (leg.distance * leg.qty * leg.rate) + leg.fixedCosts;
            const legIncentive = leg.incentive ? legCost * INCENTIVE_PERCENT : 0;
            totalCost += legCost - legIncentive;
            totalCO2 += (leg.distance * leg.qty * leg.co2Factor) / 1000;
        });

        // Mock baselines for comparison display (approx 40% higher for road)
        const baselineCost = totalCost * 1.4;
        const baselineCO2 = totalCO2 * 2.5;

        // 2. Construct Routes for the Map
        const newRoutes: Route[] = newLegs.map(leg => {
            const fromSite = sitesById.get(leg.fromId || '');
            const toSite = sitesById.get(leg.toId || '');
            let transportMode: TransportMode;
            switch (leg.submode) {
                case 'BTAP': transportMode = TransportMode.RAIL_BTAP; break;
                case 'BCFC': transportMode = TransportMode.RAIL_BCFC; break;
                case 'Truck': transportMode = TransportMode.ROAD; break;
                case 'Barge': transportMode = TransportMode.SEA; break;
                default: transportMode = TransportMode.ROAD;
            }

            return {
                id: `route_${leg.id}`,
                from: leg.fromId || '',
                to: leg.toId || '',
                mode: transportMode,
                path: (fromSite && toSite) ? [fromSite.position, toSite.position] : [],
                capacity: `${leg.qty} tons`
            };
        });

        // 3. Construct the full Scenario object
        const modifiedTitle = `${modalTitle} (Modified)`;
        const newScenarioId = `modified_${Date.now()}`;

        const newScenario: Scenario = {
            id: newScenarioId,
            title: modifiedTitle,
            description: `Modified scenario based on ${modalTitle}.`,
            sites: scenario.sites,
            routes: newRoutes,
            regions: ['Custom'],
            comparisonData: {
                btap: { ...btapData, totalCost: totalCost, totalCO2: totalCO2 * 1000 },
                bcfc: { ...bcfcData, totalCost: totalCost * 1.15, totalCO2: totalCO2 * 1000 * 1.2 },
                others: { ...othersData, totalCost: baselineCost, totalCO2: baselineCO2 * 1000 }
            },
            costSavings: baselineCost - totalCost,
            co2Savings: baselineCO2 - totalCO2,
            costBreakdown: scenario.costBreakdown,
            costSplit: scenario.costSplit
        };

        // 4. Update local predefined list with cached legs to persist edits
        const newTemplate = {
            id: newScenario.id,
            name: newScenario.title,
            description: newScenario.description,
            path: { plant: '', hub: '', rmc: '' }, // Placeholder, logic handled by cachedLegs
            cachedLegs: newLegs
        };
        setPredefinedList(prev => [...prev, newTemplate]);

        // 5. Save Global (App.tsx)
        onSaveScenario(newScenario);

        // 6. Update UI State
        setLegs(newLegs);
        setScenarioTitle(modifiedTitle);
        setIsDetailModalOpen(false);
        setActiveTab('predefined');
        setSelectedPredefinedId(newScenario.id); // Triggers selection
    };

    const addLeg = () => setLegs(legs => {
        const defaults = getSubmodeDefaults('Truck');
        return [...legs, { id: Date.now(), fromId: legs[legs.length - 1]?.toId || null, toId: null, mode: 'Road', submode: 'Truck', distance: 0, qty: quantity, ...defaults }];
    });
    const deleteLeg = (id: number) => setLegs(legs => legs.filter(leg => leg.id !== id));
    const duplicateLeg = (id: number) => setLegs(legs => {
        const legIndex = legs.findIndex(l => l.id === id);
        if (legIndex === -1) return legs;
        const newLeg = { ...legs[legIndex], id: Date.now() };
        const result = [...legs];
        result.splice(legIndex + 1, 0, newLeg);
        return result;
    });

    const mapRoutes = useMemo(() => legs.map((leg): Route | null => {
        const fromSite = sitesById.get(leg.fromId || '');
        const toSite = sitesById.get(leg.toId || '');
        if (!fromSite || !toSite) return null;
        let transportMode: TransportMode;
        switch (leg.submode) {
            case 'BTAP': transportMode = TransportMode.RAIL_BTAP; break;
            case 'BCFC': transportMode = TransportMode.RAIL_BCFC; break;
            case 'Truck': transportMode = TransportMode.ROAD; break;
            case 'Barge': transportMode = TransportMode.SEA; break;
            default: transportMode = TransportMode.ROAD;
        }
        return { id: `leg_route_${leg.id}`, from: fromSite.id, to: toSite.id, mode: transportMode, path: [fromSite.position, toSite.position], capacity: `${leg.qty} tons` }
    }).filter((r): r is Route => r !== null), [legs, sitesById]);

    const legsTableProps = {
        legs: legs,
        onLegChange: handleLegChange,
        onDuplicate: duplicateLeg,
        onDelete: deleteLeg,
        setHighlightedLegId: setHighlightedLegId,
        allSitesOptions: allSitesOptions,
        onTransportModeChange: handleTransportModeChange,
    };

    const TabButton: React.FC<{ name: 'predefined' | 'custom' }> = ({ name }) => (
        <button
            onClick={() => setActiveTab(name)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 capitalize transition-colors ${activeTab === name
                    ? 'border-green-600 text-green-700 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
        >
            {name.replace('_', ' ')} Scenarios
        </button>
    );

    return (
        <>
            <ScenarioDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onSave={handleSaveChangesFromModal}
                initialLegs={modalLegs}
                title={modalTitle}
                sitesById={sitesById}
                getLegETA={getLegETA}
            />
            {isLegsExpanded && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsLegsExpanded(false)}>
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-screen-2xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-xl font-bold text-blue-900">Route Legs (Expanded View)</h2>
                            <button onClick={() => setIsLegsExpanded(false)} className="p-1 text-gray-500 rounded-full hover:bg-gray-200" title="Close">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto">
                            <LegsTable {...legsTableProps} isExpanded={true} />
                        </div>
                    </div>
                </div>
            )}
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-full lg:w-2/5 xl:w-1/3 bg-white/90 backdrop-blur-sm border-r border-gray-200 p-4 flex flex-col">
                    <h2 className="text-2xl font-bold text-blue-900 mb-4 flex-shrink-0">Scenario Planner</h2>

                    <div className="flex border-b border-gray-200 flex-shrink-0">
                        <TabButton name="predefined" />
                        <TabButton name="custom" />
                    </div>

                    <div className="flex-grow overflow-y-auto pr-2 -mr-2 pt-4">
                        {activeTab === 'predefined' && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-800">Select a Supply Chain</h3>
                                {predefinedList.map(ps => (
                                    <div key={ps.id} onClick={() => setSelectedPredefinedId(ps.id)} className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedPredefinedId === ps.id ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200 hover:border-gray-400'}`}>
                                        <h4 className="font-semibold text-gray-800">{ps.name}</h4>
                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-xs text-gray-500">{ps.description}</p>
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenDetailsModal(ps.id); }} className="text-xs font-semibold text-green-600 hover:text-green-800 hover:underline whitespace-nowrap px-2 py-1 rounded hover:bg-green-100">
                                                View / Modify
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-4 pt-4 border-t">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Target Quantity (Tons)</label>
                                    <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full bg-white border-gray-300 rounded p-2" />
                                </div>
                            </div>
                        )}
                        {activeTab === 'custom' && (
                            <div className="space-y-4">
                                <input type="text" value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} className="w-full font-semibold bg-gray-50 border-gray-300 rounded p-2 text-lg" placeholder="Scenario Title" />
                                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Target Cement Plant</label>
                                            <select value={targetPlantId} onChange={e => setTargetPlantId(e.target.value)} className="w-full bg-white border-gray-300 rounded p-2">
                                                {cementPlants.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Target Distribution Hub</label>
                                            <select value={targetHubId} onChange={e => setTargetHubId(e.target.value)} className="w-full bg-white border-gray-300 rounded p-2">
                                                {hubs.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Target RMC Unit</label>
                                            <select value={targetRmcId} onChange={e => setTargetRmcId(e.target.value)} className="w-full bg-white border-gray-300 rounded p-2">
                                                {rmcPlants.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Target Quantity (Tons)</label>
                                            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full bg-white border-gray-300 rounded p-2" />
                                        </div>
                                        <div className="col-span-2 mt-2">
                                            <button onClick={() => handleSubmitScenario(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors shadow-sm">
                                                Submit Scenario
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2 flex-shrink-0">
                                        <h3 className="text-lg font-semibold text-gray-800">Route Legs</h3>
                                        <button onClick={() => setIsLegsExpanded(true)} className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors" title="Expand View">
                                            <ExpandIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <LegsTable {...legsTableProps} />
                                    <button onClick={addLeg} className="w-full mt-2 border-2 border-dashed border-gray-300 hover:border-green-500 hover:text-green-600 text-gray-500 font-semibold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2">
                                        <PlusIcon className="w-5 h-5" /> Add Leg
                                    </button>
                                </div>

                                {legs.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4 flex-shrink-0">Summary</h3>
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100 text-gray-500 uppercase text-xs">
                                                <tr>
                                                    {['Mode', 'Total Cost (₹)', 'Total Qty (t)', 'Total CO₂ (t)', 'Total Time (hrs)'].map(h => <th key={h} className={`px-2 py-2 text-left font-medium`}>{h}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {(Object.keys(costSummary) as string[]).filter(k => k !== 'Total').map(mode => {
                                                    const data = costSummary[mode];
                                                    if (data.qty === 0) return null;
                                                    return (
                                                        <tr key={mode}>
                                                            <td className="p-2">{mode}</td>
                                                            <td className="p-2">{data.cost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                            <td className="p-2">{data.qty.toLocaleString('en-IN')}</td>
                                                            <td className="p-2">{(data.co2 / 1000).toFixed(2)}</td>
                                                            <td className="p-2">{data.time.toFixed(1)}</td>
                                                        </tr>
                                                    )
                                                })}
                                                <tr className='font-bold bg-gray-50'>
                                                    <td className="p-2">Total</td>
                                                    <td className="p-2">{costSummary.Total.cost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                    <td className="p-2">{costSummary.Total.qty.toLocaleString('en-IN')}</td>
                                                    <td className="p-2">{(costSummary.Total.co2 / 1000).toFixed(2)}</td>
                                                    <td className="p-2">{costSummary.Total.time.toFixed(1)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div className="space-y-2 flex-shrink-0 pt-4 border-t border-gray-200 mt-4">
                                    <button onClick={handleAddScenario} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                                        Add Scenario
                                    </button>
                                    <button onClick={handleReset} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-md transition-colors">Reset</button>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
                <main className="flex-1 flex flex-col relative overflow-hidden">
                    <div className="flex-grow relative min-h-[250px]">
                        <MapView sites={scenario.sites} routes={mapRoutes} scenario={scenario} highlightedRouteId={highlightedLegId ? `leg_route_${highlightedLegId}` : null} visibleLayers={Object.fromEntries(LAYERS_CONFIG.flatMap(l => [[l.id, true], ...(l.children?.filter(c => 'id' in c).map(c => [(c as { id: string }).id, true]) || [])]).filter(Boolean) as [string, boolean][])} />
                    </div>
                    <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm p-2 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-2 z-10">
                        <StatCard title="Total Cost" value={`₹${analysisResults.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
                        <StatCard title="Total CO₂" value={`${analysisResults.totalCO2.toFixed(2)} tons`} />
                        <StatCard title="Total ETA" value={`${analysisResults.totalETA.toFixed(1)} hrs`} />
                        <StatCard title="Incentive Savings" value={`₹${analysisResults.incentiveSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
                    </div>
                    <div className="flex-shrink-0 bg-gray-50 p-2 border-t border-gray-200 flex flex-col max-h-[240px] z-10">
                        <div className="flex items-center justify-between px-2 mb-1">
                            <div className="flex border-b border-gray-200">
                                {(['Cost', 'CO₂', 'Time'] as const).map(tab => (
                                    <button key={tab} onClick={() => setComparisonTab(tab)} className={`px-3 py-1 text-sm font-semibold rounded-t-md ${comparisonTab === tab ? 'bg-white border border-b-0 border-gray-200 text-green-600' : 'text-gray-500 hover:bg-gray-200'}`}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm font-semibold">Total: <span className="text-green-600">{
                                comparisonTab === 'Cost' ? `₹${chartData[0]?.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` :
                                    comparisonTab === 'CO₂' ? `${chartData[0]?.total.toFixed(2)} tons` :
                                        `${chartData[0]?.total.toFixed(1)} hrs`
                            }</span></p>
                        </div>
                        <div className="flex-grow bg-white p-1 rounded-b-md rounded-r-md">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" hide />
                                    <Tooltip cursor={{ fill: 'rgba(230, 230, 230, 0.5)' }} content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const legIndex = parseInt(payload[0].dataKey?.toString().replace('Leg ', '') || '1') - 1;
                                            const leg = legs[legIndex];
                                            if (!leg) return null;
                                            return <div className="bg-white/90 p-2 border rounded text-xs shadow-lg">
                                                <p className="font-bold">{`${payload[0].dataKey}: ${Number(payload[0].value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}</p>
                                                <p>{`${leg.submode} from ${sitesById.get(leg.fromId!)?.name} to ${sitesById.get(leg.toId!)?.name}`}</p>
                                            </div>;
                                        } return null;
                                    }} />
                                    {legs.map((leg, index) => (
                                        <Bar key={leg.id} dataKey={`Leg ${index + 1}`} stackId="a" fill={LEG_COLORS[index % LEG_COLORS.length]} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {legs.length === 0 && !isLoading && (
                        <div className="absolute inset-0 bg-gray-100/70 flex items-center justify-center z-10 pointer-events-none">
                            <div className="text-center p-8 bg-white/90 rounded-lg shadow-xl"><h3 className="text-xl font-semibold text-gray-700">Configure and build your route.</h3><p className="text-gray-500 mt-2">Select a predefined scenario or use the custom planner.</p></div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default ScenarioAnalysisPage;
