import React, { useState, useMemo, useEffect } from 'react';
import type { Scenario, Site, Shipment, HomeAlert, DailyForecast, SiloLevel, SupplyChainNode, BackhaulOpp, ModeMetric, CorridorItem, LeastCostRouteEntry, EsgImpactMetric, EsgScheme, StockTransfer, ReportsData, FinancialCostChartRow, OperationalDelayRow, PlantMetricRow, TransportModeDistributionRow, HistoricalTrendRow, AuditComplianceData, OptimizationAuditRow, ShipmentLevelSavingsRow, ApprovalHistoryRow } from '../types';
import { SiteType } from '../types';
import { INITIAL_SITES } from '../constants';

// --- Types ---
type SectionId =
    | 'raw_materials'
    | 'cement_plants'
    | 'distribution_hubs'
    | 'rmc_units'
    | 'transport_modes'
    | 'logistics_intel'
    | 'cost_intel'
    | 'esg_compliance'
    | 'planning_forecasting'
    | 'homepage_data'
    | 'report'
    | 'audit_compliance';

// --- Icons ---
const FactoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 0 1 3.375-3.375h9.75a3.375 3.375 0 0 1 3.375 3.375v1.875" /></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
const CalculatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /></svg>;
const CubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const PresentationChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>;
const DocumentTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
const LeafIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>;

// --- Shared Components ---
const SidebarItem: React.FC<{
    id: SectionId;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: (id: SectionId) => void;
}> = ({ id, label, icon, isActive, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors border-l-4 ${isActive
                ? 'bg-blue-50 border-[#003A8F] text-[#003A8F]'
                : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
    >
        <span className="flex-shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
    </button>
);

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="mb-4">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
        {children}
    </div>
);

const Card: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {icon && <span className="text-[#003A8F]">{icon}</span>}
                    <h3 className="text-sm font-bold text-[#0B1F3B] uppercase tracking-wider">{title}</h3>
                </div>
                <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon />
                </div>
            </button>
            {isOpen && <div className="p-5">{children}</div>}
        </div>
    );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 mt-6 border-b border-gray-100 pb-1">{title}</h3>
);

const buildPerformanceReportDefaults = (): ReportsData => ({
    financial: {
        totalSpend: '₹3.65 Cr',
        avgCostPerTon: '₹2,150',
        realizedSavings: '₹18.5 L',
        costVariance: '+4.2%',
        costChartData: [
            { id: 'financial-road', category: 'Road', planned: '150', actual: '165' },
            { id: 'financial-rail-btap', category: 'Rail (BTAP)', planned: '90', actual: '92' },
            { id: 'financial-rail-bcfc', category: 'Rail (BCFC)', planned: '110', actual: '108' },
            { id: 'financial-multimodal', category: 'Multimodal', planned: '40', actual: '45' }
        ]
    },
    operational: {
        onTimeDeliveryPct: '92%',
        turnaroundTime: '18 hrs',
        utilizationPct: '84%',
        delayDistributionData: [
            { id: 'delay-loading', reason: 'Loading Delay', value: '35' },
            { id: 'delay-transit', reason: 'Transit Congestion', value: '25' },
            { id: 'delay-unloading', reason: 'Unloading Delay', value: '20' },
            { id: 'delay-no-operator', reason: 'No Operator', value: '20' }
        ]
    },
    plantAnalysis: {
        mostEfficientPlant: 'Chanderia',
        highestLogisticsCost: 'Bokaro',
        plantMetricsData: [
            { id: 'plant-raipur', plantName: 'Raipur', costPerTon: '1850', savingsPercent: '12' },
            { id: 'plant-bokaro', plantName: 'Bokaro', costPerTon: '2100', savingsPercent: '8' },
            { id: 'plant-satna', plantName: 'Satna', costPerTon: '1950', savingsPercent: '10' },
            { id: 'plant-chanderia', plantName: 'Chanderia', costPerTon: '1780', savingsPercent: '15' }
        ]
    },
    transportMode: {
        modeMixDistribution: [
            { id: 'mode-rail-btap', transportMode: 'Rail (BTAP)', valuePercent: '45' },
            { id: 'mode-rail-bcfc', transportMode: 'Rail (BCFC)', valuePercent: '25' },
            { id: 'mode-road', transportMode: 'Road', valuePercent: '20' },
            { id: 'mode-multimodal', transportMode: 'Multimodal', valuePercent: '10' }
        ]
    },
    historicalTrends: {
        monthlyCostSavingsTrend: [
            { id: 'trend-jan', month: 'Jan', cost: '120', savings: '10' },
            { id: 'trend-feb', month: 'Feb', cost: '115', savings: '15' },
            { id: 'trend-mar', month: 'Mar', cost: '118', savings: '12' },
            { id: 'trend-apr', month: 'Apr', cost: '110', savings: '20' },
            { id: 'trend-may', month: 'May', cost: '105', savings: '25' },
            { id: 'trend-jun', month: 'Jun', cost: '100', savings: '30' }
        ]
    }
});

const buildAuditComplianceDefaults = (): AuditComplianceData => ({
    savingsDashboard: {
        ytdSavings: '₹8.45 Cr',
        avgReductionPct: '12.5%',
        co2Avoided: '4,250 T',
        savingsAtRisk: '₹45 L'
    },
    optimizationAuditTrail: {
        records: [
            { id: 'opt-1', date: '2024-06-15', type: 'Mode Shift', baseline: '125000', optimized: '98000', status: 'Approved' },
            { id: 'opt-2', date: '2024-06-16', type: 'Route Opt', baseline: '45000', optimized: '41500', status: 'Approved' },
            { id: 'opt-3', date: '2024-06-16', type: 'Backhaul', baseline: '80000', optimized: '30000', status: 'Pending' }
        ]
    },
    shipmentLevelSavings: {
        rows: [
            { id: 'ship-1', shipmentId: 'SHP-8821', route: 'Raipur -> Kalamboli', baseline: '125000', actual: '98000' },
            { id: 'ship-2', shipmentId: 'SHP-8822', route: 'Odisha -> Raipur', baseline: '45000', actual: '45000' },
            { id: 'ship-3', shipmentId: 'SHP-8823', route: 'Raipur -> Nagpur', baseline: '60000', actual: '52000' }
        ]
    },
    esgPerformance: {
        co2Avoided: '1,480 T',
        dieselSaved: '450 kL',
        railShiftPct: '18%',
        carbonCredits: '₹22 L'
    },
    approvalHistory: {
        rows: [
            { id: 'log-1', logId: 'LOG-001', user: 'Plant Mgr (Amit S.)', impact: '-₹20,000' },
            { id: 'log-2', logId: 'LOG-002', user: 'John Doe', impact: '+₹3,500' },
            { id: 'log-3', logId: 'LOG-003', user: 'System (Auto)', impact: '+₹27,000' }
        ]
    }
});

// --- Master Data Interface ---
interface MasterEntity {
    id: string;
    name: string;
    type?: string;
    location: string;
    status: string;
    code?: string;
    capacity?: string;
    demand?: string;
    cost?: string;
    subType?: string;
}

// --- CRUD Table Component ---
const EntityCrudTable: React.FC<{
    title: string;
    columns: { key: keyof MasterEntity; label: string }[];
    data: MasterEntity[];
    onSave: (item: MasterEntity) => void;
    onDelete: (id: string) => void;
}> = ({ title, columns, data, onSave, onDelete }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState<MasterEntity | null>(null);

    const handleAdd = () => {
        const newItem: MasterEntity = { id: `NEW-${Date.now()}`, name: '', location: '', status: 'Active' };
        setDraft(newItem);
        setEditingId(newItem.id);
    };

    const handleEdit = (item: MasterEntity) => {
        setDraft({ ...item });
        setEditingId(item.id);
    };

    const handleSave = () => {
        if (draft) {
            onSave(draft);
            setEditingId(null);
            setDraft(null);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#0B1F3B]">{title}</h2>
                <button onClick={handleAdd} className="bg-[#003A8F] text-white px-4 py-2 rounded text-sm font-bold hover:bg-[#0B1F3B] transition-colors">+ Add New</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                        <tr>
                            {columns.map(col => <th key={col.key} className="px-4 py-3">{col.label}</th>)}
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                {columns.map(col => (
                                    <td key={col.key} className="px-4 py-3">
                                        {editingId === item.id ? (
                                            <input
                                                value={draft?.[col.key] || ''}
                                                onChange={e => setDraft(prev => prev ? { ...prev, [col.key]: e.target.value } : null)}
                                                className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                        ) : (
                                            item[col.key]
                                        )}
                                    </td>
                                ))}
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                    {editingId === item.id ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={handleSave} className="text-green-600 hover:underline font-bold">Save</button>
                                            <button onClick={() => setEditingId(null)} className="text-gray-400 hover:underline">Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline">Edit</button>
                                            <button onClick={() => onDelete(item.id)} className="text-red-600 hover:underline">Delete</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Logistics Intelligence components ---

const SupplyChainTrackingModule: React.FC<{
    nodes: SupplyChainNode[];
    onUpdate: (nodes: SupplyChainNode[]) => void;
}> = ({ nodes, onUpdate }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState<SupplyChainNode | null>(null);

    const handleAdd = () => {
        const newNode: SupplyChainNode = { id: `NODE-${Date.now()}`, node: '', status: 'Planned', eta: '08:00' };
        onUpdate([...nodes, newNode]);
        setDraft(newNode);
        setEditingId(newNode.id);
    };

    const handleEdit = (node: SupplyChainNode) => {
        setDraft({ ...node });
        setEditingId(node.id);
    };

    const handleSave = () => {
        if (draft) {
            onUpdate(nodes.map(n => n.id === draft.id ? draft : n));
            setEditingId(null);
            setDraft(null);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this supply chain node?')) {
            onUpdate(nodes.filter(n => n.id !== id));
        }
    };

    return (
        <Card title="1: End-to-End Supply Chain Tracking" icon={<GlobeIcon />}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-500 uppercase text-[10px] font-bold border-b">
                        <tr>
                            <th className="pb-2">Node</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2">ETA (24h)</th>
                            <th className="pb-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {nodes.map(node => (
                            <tr key={node.id}>
                                <td className="py-2">
                                    {editingId === node.id ?
                                        <input className="w-full border rounded px-1" value={draft?.node} onChange={e => setDraft(p => p ? { ...p, node: e.target.value } : null)} /> :
                                        node.node || <span className="text-gray-300 italic">Empty</span>
                                    }
                                </td>
                                <td className="py-2">
                                    {editingId === node.id ?
                                        <select className="w-full border rounded px-1" value={draft?.status} onChange={e => setDraft(p => p ? { ...p, status: e.target.value } : null)}>
                                            <option>Planned</option>
                                            <option>On Track</option>
                                            <option>Delayed</option>
                                            <option>In Progress</option>
                                        </select> :
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${node.status === 'Delayed' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{node.status}</span>
                                    }
                                </td>
                                <td className="py-2">
                                    {editingId === node.id ?
                                        <input type="time" className="w-full border rounded px-1" value={draft?.eta} onChange={e => setDraft(p => p ? { ...p, eta: e.target.value } : null)} /> :
                                        node.eta
                                    }
                                </td>
                                <td className="py-2 text-right">
                                    <div className="flex justify-end gap-3">
                                        {editingId === node.id ?
                                            <button onClick={handleSave} className="text-green-600 font-bold hover:underline">Save</button> :
                                            <>
                                                <button onClick={() => handleEdit(node)} className="text-[#003A8F] hover:underline">✏ Edit</button>
                                                <button onClick={() => handleDelete(node.id)} className="text-red-500 hover:underline">🗑 Delete</button>
                                            </>
                                        }
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={handleAdd} className="mt-4 w-full border-2 border-dashed border-gray-200 py-2 rounded text-gray-500 font-bold hover:bg-gray-50 transition-colors">+ Add Node</button>
        </Card>
    );
};

const ShipmentModule: React.FC<{
    shipments: Shipment[];
    onUpdate: (shipments: Shipment[]) => void;
}> = ({ shipments, onUpdate }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState<Shipment | null>(null);

    const handleAdd = () => {
        const newShipment: Shipment = { id: `SHP-${Math.floor(1000 + Math.random() * 9000)}`, origin: '', dest: '', mode: 'Road', status: 'Scheduled', eta: '12:00', riskScore: 'Low' };
        onUpdate([...shipments, newShipment]);
        setDraft(newShipment);
        setEditingId(newShipment.id);
    };

    const handleEdit = (shipment: Shipment) => {
        setDraft({ ...shipment });
        setEditingId(shipment.id);
    };

    const handleSave = () => {
        if (draft) {
            onUpdate(shipments.map(s => s.id === draft.id ? draft : s));
            setEditingId(null);
            setDraft(null);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Remove this shipment from intelligence tracking?')) {
            onUpdate(shipments.filter(s => s.id !== id));
        }
    };

    return (
        <Card title="2: Live Shipment Tracking Data" icon={<TruckIcon />}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-500 uppercase text-[10px] font-bold border-b">
                        <tr>
                            <th className="pb-2">ID</th>
                            <th className="pb-2">Route</th>
                            <th className="pb-2">Mode</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2">ETA (24h)</th>
                            <th className="pb-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {shipments.map(s => (
                            <tr key={s.id}>
                                <td className="py-2 font-mono text-[10px]">{s.id}</td>
                                <td className="py-2">
                                    {editingId === s.id ?
                                        <div className="flex gap-1">
                                            <input placeholder="From" className="w-1/2 border rounded px-1" value={draft?.origin} onChange={e => setDraft(p => p ? { ...p, origin: e.target.value } : null)} />
                                            <input placeholder="To" className="w-1/2 border rounded px-1" value={draft?.dest} onChange={e => setDraft(p => p ? { ...p, dest: e.target.value } : null)} />
                                        </div> :
                                        `${s.origin} → ${s.dest}`
                                    }
                                </td>
                                <td className="py-2">
                                    {editingId === s.id ?
                                        <select className="w-full border rounded px-1" value={draft?.mode} onChange={e => setDraft(p => p ? { ...p, mode: e.target.value } : null)}>
                                            <option>Road</option>
                                            <option>Rail (BTAP)</option>
                                            <option>Rail (BCFC)</option>
                                        </select> :
                                        s.mode
                                    }
                                </td>
                                <td className="py-2">
                                    {editingId === s.id ?
                                        <select className="w-full border rounded px-1" value={draft?.status} onChange={e => setDraft(p => p ? { ...p, status: e.target.value } : null)}>
                                            <option>On Time</option>
                                            <option>Delayed</option>
                                            <option>Scheduled</option>
                                            <option>In Transit</option>
                                        </select> :
                                        s.status
                                    }
                                </td>
                                <td className="py-2">
                                    {editingId === s.id ?
                                        <input type="time" className="w-full border rounded px-1" value={draft?.eta} onChange={e => setDraft(p => p ? { ...p, eta: e.target.value } : null)} /> :
                                        s.eta
                                    }
                                </td>
                                <td className="py-2 text-right">
                                    <div className="flex justify-end gap-3">
                                        {editingId === s.id ?
                                            <button onClick={handleSave} className="text-green-600 font-bold hover:underline">Save</button> :
                                            <>
                                                <button onClick={() => handleEdit(s)} className="text-[#003A8F] hover:underline">✏ Edit</button>
                                                <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline">🗑 Delete</button>
                                            </>
                                        }
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={handleAdd} className="mt-4 w-full border-2 border-dashed border-gray-200 py-2 rounded text-gray-500 font-bold hover:bg-gray-50 transition-colors">+ Add Shipment</button>
        </Card>
    );
};

const CorridorAnalysisModule: React.FC<{
    analysis: CorridorItem[];
    onUpdate: (items: CorridorItem[]) => void;
}> = ({ analysis, onUpdate }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState<CorridorItem | null>(null);

    const handleAdd = () => {
        const newItem: CorridorItem = { id: `COR-${Date.now()}`, route: '', congestion: 'Low', speed: 55, alert: '' };
        onUpdate([...analysis, newItem]);
        setDraft(newItem);
        setEditingId(newItem.id);
    };

    const handleEdit = (item: CorridorItem) => {
        setDraft({ ...item });
        setEditingId(item.id);
    };

    const handleSave = () => {
        if (draft) {
            onUpdate(analysis.map(a => a.id === draft.id ? draft : a));
            setEditingId(null);
            setDraft(null);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this corridor analysis record?')) {
            onUpdate(analysis.filter(a => a.id !== id));
        }
    };

    return (
        <Card title="3: Corridor Analysis" icon={<GlobeIcon />}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-500 uppercase text-[10px] font-bold border-b">
                        <tr>
                            <th className="pb-2">Route</th>
                            <th className="pb-2">Congestion</th>
                            <th className="pb-2">Avg Speed</th>
                            <th className="pb-2">Alert Message</th>
                            <th className="pb-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {analysis.map(item => (
                            <tr key={item.id}>
                                <td className="py-2">
                                    {editingId === item.id ?
                                        <input className="w-full border rounded px-1" value={draft?.route} onChange={e => setDraft(p => p ? { ...p, route: e.target.value } : null)} /> :
                                        item.route || <span className="text-gray-300 italic">No Route</span>
                                    }
                                </td>
                                <td className="py-2">
                                    {editingId === item.id ?
                                        <select className="w-full border rounded px-1" value={draft?.congestion} onChange={e => setDraft(p => p ? { ...p, congestion: e.target.value as any } : null)}>
                                            <option>Low</option>
                                            <option>Moderate</option>
                                            <option>High</option>
                                            <option>Severe</option>
                                        </select> :
                                        item.congestion
                                    }
                                </td>
                                <td className="py-2">
                                    {editingId === item.id ?
                                        <div className="flex items-center gap-1">
                                            <input type="number" className="w-16 border rounded px-1" value={draft?.speed} onChange={e => setDraft(p => p ? { ...p, speed: Number(e.target.value) } : null)} />
                                            <span className="text-xs text-gray-400">Km/h</span>
                                        </div> :
                                        <span className="font-bold text-[#003A8F]">{item.speed} <small className="font-normal text-gray-400">Km/h</small></span>
                                    }
                                </td>
                                <td className="py-2">
                                    {editingId === item.id ?
                                        <input className="w-full border rounded px-1" value={draft?.alert} onChange={e => setDraft(p => p ? { ...p, alert: e.target.value } : null)} /> :
                                        item.alert
                                    }
                                </td>
                                <td className="py-2 text-right">
                                    <div className="flex justify-end gap-3">
                                        {editingId === item.id ?
                                            <button onClick={handleSave} className="text-green-600 font-bold hover:underline">Save</button> :
                                            <>
                                                <button onClick={() => handleEdit(item)} className="text-[#003A8F] hover:underline">✏ Edit</button>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">🗑 Delete</button>
                                            </>
                                        }
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={handleAdd} className="mt-4 w-full border-2 border-dashed border-gray-200 py-2 rounded text-gray-500 font-bold hover:bg-gray-50 transition-colors">+ Add Corridor</button>
        </Card>
    );
};

const ModeComparisonModule: React.FC<{
    comparison: NonNullable<NonNullable<Scenario['logisticsIntelligence']>['modeComparison']>;
    onUpdate: (updates: NonNullable<NonNullable<Scenario['logisticsIntelligence']>['modeComparison']>) => void;
}> = ({ comparison, onUpdate }) => {
    const handleModeUpdate = (mode: keyof typeof comparison, field: keyof ModeMetric, value: any) => {
        const next = { ...comparison };
        if (field === 'isBest' && value === true) {
            next.btap.isBest = false;
            next.bcfc.isBest = false;
            next.road.isBest = false;
        }
        // @ts-ignore
        next[mode][field] = value;
        onUpdate(next);
    };

    const ModeCard = ({ label, id, data }: { label: string, id: keyof typeof comparison, data: ModeMetric }) => (
        <div className={`p-4 border rounded-lg ${data.isBest ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-[#003A8F]">{label}</h4>
                <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={data.isBest} onChange={e => handleModeUpdate(id, 'isBest', e.target.checked)} className="rounded text-green-600" />
                    <span className="text-[10px] font-bold uppercase">Best Option</span>
                </label>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-12">Cost:</span>
                    <input className="flex-1 border rounded px-1 text-sm" value={data.cost} onChange={e => handleModeUpdate(id, 'cost', e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-12">CO₂:</span>
                    <input className="flex-1 border rounded px-1 text-sm" value={data.co2} onChange={e => handleModeUpdate(id, 'co2', e.target.value)} />
                </div>
            </div>
        </div>
    );

    return (
        <Card title="4: Mode Comparison Logic" icon={<CalculatorIcon />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ModeCard label="BTAP" id="btap" data={comparison.btap} />
                <ModeCard label="BCFC" id="bcfc" data={comparison.bcfc} />
                <ModeCard label="ROAD" id="road" data={comparison.road} />
            </div>
            <button onClick={() => alert("Logic recalculated based on latest parameters.")} className="mt-4 bg-[#003A8F] text-white px-4 py-2 rounded text-sm font-bold hover:bg-[#0B1F3B] transition-colors w-full">Recalculate Best Mode</button>
        </Card>
    );
};

const OptimizationModule: React.FC<{
    simulator: NonNullable<NonNullable<Scenario['logisticsIntelligence']>['optimizationSimulator']>;
    onUpdate: (updates: NonNullable<NonNullable<Scenario['logisticsIntelligence']>['optimizationSimulator']>) => void;
}> = ({ simulator, onUpdate }) => {
    return (
        <Card title="5: Optimization Simulator" icon={<ShieldIcon />}>
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Rail Share %</label>
                        <span className="text-sm font-bold text-[#003A8F]">{simulator.railShare}%</span>
                    </div>
                    <input
                        type="range" min="0" max="100" step="1"
                        value={simulator.railShare}
                        onChange={e => onUpdate({ ...simulator, railShare: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#003A8F]"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded text-center border">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Projected Cost Index</p>
                        <p className="text-xl font-bold text-[#2E7D32]">{simulator.costIndex.toFixed(1)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-center border">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">CO₂ Reduction %</p>
                        <p className="text-xl font-bold text-[#00AEEF]">{simulator.co2Reduction}%</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const BackhaulModule: React.FC<{
    opportunities: BackhaulOpp[];
    onUpdate: (ops: BackhaulOpp[]) => void;
}> = ({ opportunities, onUpdate }) => {
    const handleAdd = () => {
        const newOpp: BackhaulOpp = { id: `OPP-${Date.now()}`, material: '', volume: '', savings: '', probability: '' };
        onUpdate([...opportunities, newOpp]);
    };

    const handleRowUpdate = (id: string, field: keyof BackhaulOpp, value: string) => {
        onUpdate(opportunities.map(o => o.id === id ? { ...o, [field]: value } : o));
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this backhaul opportunity?')) {
            onUpdate(opportunities.filter(o => o.id !== id));
        }
    };

    return (
        <Card title="6: Backhaul Opportunities" icon={<GlobeIcon />}>
            <div className="space-y-4">
                {opportunities.map((opp) => (
                    <div key={opp.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative group">
                        <button onClick={() => handleDelete(opp.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">🗑 Delete</button>
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Material">
                                <input className="w-full border rounded p-1 text-sm" value={opp.material} onChange={e => handleRowUpdate(opp.id, 'material', e.target.value)} />
                            </FormField>
                            <FormField label="Volume">
                                <input className="w-full border rounded p-1 text-sm" value={opp.volume} onChange={e => handleRowUpdate(opp.id, 'volume', e.target.value)} />
                            </FormField>
                            <FormField label="Savings">
                                <input className="w-full border rounded p-1 text-sm" value={opp.savings} onChange={e => handleRowUpdate(opp.id, 'savings', e.target.value)} />
                            </FormField>
                            <FormField label="Probability">
                                <input className="w-full border rounded p-1 text-sm" value={opp.probability} onChange={e => handleRowUpdate(opp.id, 'probability', e.target.value)} />
                            </FormField>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={handleAdd} className="mt-4 w-full border-2 border-dashed border-gray-200 py-2 rounded text-gray-500 font-bold hover:bg-gray-50 transition-colors">+ Add Opportunity</button>
        </Card>
    );
};

const HomeAlertList: React.FC<{ alerts: HomeAlert[], onUpdate: (items: HomeAlert[]) => void }> = ({ alerts, onUpdate }) => {
    const handleAdd = () => onUpdate([...alerts, { title: '', desc: '', severity: 'Info' }]);
    const handleUpdate = (idx: number, field: keyof HomeAlert, value: string) => {
        const next = [...alerts];
        next[idx] = { ...next[idx], [field]: value as any };
        onUpdate(next);
    };
    const handleDelete = (idx: number) => onUpdate(alerts.filter((_, i) => i !== idx));

    return (
        <div className="space-y-4">
            {alerts.map((alert, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative group">
                    <button onClick={() => handleDelete(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">🗑 Delete</button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                            <FormField label="Title">
                                <input className="w-full border rounded p-1 text-sm" value={alert.title} onChange={e => handleUpdate(idx, 'title', e.target.value)} />
                            </FormField>
                        </div>
                        <FormField label="Severity">
                            <select className="w-full border rounded p-1 text-sm bg-white" value={alert.severity} onChange={e => handleUpdate(idx, 'severity', e.target.value)}>
                                <option>Info</option>
                                <option>Warning</option>
                                <option>Critical</option>
                            </select>
                        </FormField>
                        <div className="md:col-span-3">
                            <FormField label="Description">
                                <textarea className="w-full border rounded p-1 text-sm h-16" value={alert.desc} onChange={e => handleUpdate(idx, 'desc', e.target.value)} />
                            </FormField>
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={handleAdd} className="w-full border-2 border-dashed border-gray-200 py-2 rounded text-gray-500 font-bold hover:bg-gray-50 transition-colors">+ Add Alert</button>
        </div>
    );
};

const HomepageDataManagement: React.FC<{
    scenarios: Scenario[];
    onUpdateScenario: (id: string, updates: Partial<Scenario>) => void;
}> = ({ scenarios, onUpdateScenario }) => {
    const [selectedId, setSelectedId] = useState(scenarios[0]?.id || '');
    const scenario = scenarios.find(s => s.id === selectedId);

    if (!scenario) return <div className="p-4 text-gray-500">No scenarios available.</div>;

    const updateKPI = (field: string, value: string) => {
        const nextKPIs = { ...(scenario.homepageKpis || {}), [field]: value } as any;
        onUpdateScenario(selectedId, { homepageKpis: nextKPIs });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <label className="text-sm font-bold text-gray-600">Edit Homepage Data for:</label>
                <select
                    value={selectedId}
                    onChange={e => setSelectedId(e.target.value)}
                    className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm font-bold text-[#003A8F] focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    {scenarios.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
            </div>

            <Card title="Homepage KPI Overrides" icon={<PresentationChartBarIcon />}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField label="Total Volume (e.g. '12000 Tons')">
                        <input value={scenario.homepageKpis?.totalVolume || ''} onChange={e => updateKPI('totalVolume', e.target.value)} className="w-full border rounded p-2 text-sm" />
                    </FormField>
                    <FormField label="Projected Spend (e.g. '1.92 Cr')">
                        <input value={scenario.homepageKpis?.projectedSpend || ''} onChange={e => updateKPI('projectedSpend', e.target.value)} className="w-full border rounded p-2 text-sm" />
                    </FormField>
                    <FormField label="Potential Savings (e.g. '38.50 L')">
                        <input value={scenario.homepageKpis?.potentialSavings || ''} onChange={e => updateKPI('potentialSavings', e.target.value)} className="w-full border rounded p-2 text-sm" />
                    </FormField>
                    <FormField label="Risk Level ('Low', 'Medium', 'High')">
                        <select value={scenario.homepageKpis?.riskLevel || 'Low'} onChange={e => updateKPI('riskLevel', e.target.value)} className="w-full border rounded p-2 text-sm">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </FormField>
                    <FormField label="Risk Description">
                        <input value={scenario.homepageKpis?.riskDesc || ''} onChange={e => updateKPI('riskDesc', e.target.value)} className="w-full border rounded p-2 text-sm" />
                    </FormField>
                    <FormField label="CO2 Emissions (e.g. '67 Tons')">
                        <input value={scenario.homepageKpis?.co2Emissions || ''} onChange={e => updateKPI('co2Emissions', e.target.value)} className="w-full border rounded p-2 text-sm" />
                    </FormField>
                </div>
            </Card>

            <Card title="Alerts & Risks Overrides" icon={<ShieldIcon />}>
                <div className="space-y-6">
                    <div>
                        <SectionHeader title="Demurrage Risks" />
                        <HomeAlertList
                            alerts={scenario.demurrageRisks || []}
                            onUpdate={items => onUpdateScenario(selectedId, { demurrageRisks: items })}
                        />
                    </div>
                    <div>
                        <SectionHeader title="Exceptions & Anomalies" />
                        <HomeAlertList
                            alerts={scenario.exceptionsAndAnomalies || []}
                            onUpdate={items => onUpdateScenario(selectedId, { exceptionsAndAnomalies: items })}
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
};

// --- Intelligence Data Editor Main Container ---
const IntelligenceEditor: React.FC<{
    scenario: Scenario;
    scenarios: Scenario[];
    activeScenarioId: string;
    setActiveScenarioId: (id: string) => void;
    section: SectionId;
    onUpdate: (id: string, updates: Partial<Scenario>) => void;
}> = ({ scenario, scenarios, activeScenarioId, setActiveScenarioId, section, onUpdate }) => {
    const [localDraft, setLocalDraft] = useState<Scenario>(JSON.parse(JSON.stringify(scenario)));
    const [isDirty, setIsDirty] = useState(false);

    const getOverallReportsData = (): ReportsData => {
        const fallback = buildPerformanceReportDefaults();
        const persisted = scenarios.find(s => s.reportsData)?.reportsData;
        if (!persisted) return fallback;

        return {
            financial: {
                ...fallback.financial,
                ...persisted.financial,
                costChartData: persisted.financial?.costChartData?.length ? persisted.financial.costChartData : fallback.financial.costChartData
            },
            operational: {
                ...fallback.operational,
                ...persisted.operational,
                delayDistributionData: persisted.operational?.delayDistributionData?.length ? persisted.operational.delayDistributionData : fallback.operational.delayDistributionData
            },
            plantAnalysis: {
                ...fallback.plantAnalysis,
                ...persisted.plantAnalysis,
                plantMetricsData: persisted.plantAnalysis?.plantMetricsData?.length ? persisted.plantAnalysis.plantMetricsData : fallback.plantAnalysis.plantMetricsData
            },
            transportMode: {
                ...fallback.transportMode,
                ...persisted.transportMode,
                modeMixDistribution: persisted.transportMode?.modeMixDistribution?.length ? persisted.transportMode.modeMixDistribution : fallback.transportMode.modeMixDistribution
            },
            historicalTrends: {
                ...fallback.historicalTrends,
                ...persisted.historicalTrends,
                monthlyCostSavingsTrend: persisted.historicalTrends?.monthlyCostSavingsTrend?.length ? persisted.historicalTrends.monthlyCostSavingsTrend : fallback.historicalTrends.monthlyCostSavingsTrend
            }
        };
    };

    const getOverallAuditComplianceData = (): AuditComplianceData => {
        const fallback = buildAuditComplianceDefaults();
        const persisted = scenarios.find(s => s.auditComplianceData)?.auditComplianceData;
        if (!persisted) return fallback;

        return {
            savingsDashboard: {
                ...fallback.savingsDashboard,
                ...persisted.savingsDashboard
            },
            optimizationAuditTrail: {
                records: persisted.optimizationAuditTrail?.records?.length
                    ? persisted.optimizationAuditTrail.records
                    : fallback.optimizationAuditTrail.records
            },
            shipmentLevelSavings: {
                rows: persisted.shipmentLevelSavings?.rows?.length
                    ? persisted.shipmentLevelSavings.rows
                    : fallback.shipmentLevelSavings.rows
            },
            esgPerformance: {
                ...fallback.esgPerformance,
                ...persisted.esgPerformance
            },
            approvalHistory: {
                rows: persisted.approvalHistory?.rows?.length
                    ? persisted.approvalHistory.rows
                    : fallback.approvalHistory.rows
            }
        };
    };

    useEffect(() => {
        const nextDraft = JSON.parse(JSON.stringify(scenario));
        if (section === 'report') {
            nextDraft.reportsData = getOverallReportsData();
        }
        if (section === 'audit_compliance') {
            nextDraft.auditComplianceData = getOverallAuditComplianceData();
        }
        setLocalDraft(nextDraft);
        setIsDirty(false);
    }, [scenario, section]);

    const handleSave = () => {
        if (section === 'report') {
            const overallReportsData = JSON.parse(JSON.stringify(localDraft.reportsData || buildPerformanceReportDefaults()));
            scenarios.forEach(s => onUpdate(s.id, { reportsData: overallReportsData }));
            setIsDirty(false);
            alert('Data updated successfully!');
            return;
        }
        if (section === 'audit_compliance') {
            const overallAuditComplianceData = JSON.parse(JSON.stringify(localDraft.auditComplianceData || buildAuditComplianceDefaults()));
            scenarios.forEach(s => onUpdate(s.id, { auditComplianceData: overallAuditComplianceData }));
            setIsDirty(false);
            alert('Data updated successfully!');
            return;
        }
        onUpdate(scenario.id, localDraft);
        setIsDirty(false);
        alert('Data updated successfully!');
    };

    const updateField = (category: string, field: string, value: any) => {
        setLocalDraft(prev => {
            const next = { ...prev };
            // @ts-ignore
            if (!next[category]) next[category] = {};
            // @ts-ignore
            next[category][field] = value;
            return next;
        });
        setIsDirty(true);
    };

    const updateLogisticsModule = (field: string, value: any) => {
        updateField('logisticsIntelligence', field, value);
    };

    const renderLogistics = () => {
        const intel = localDraft.logisticsIntelligence || {
            supplyChainNodes: [],
            corridorAnalysis: [],
            liveShipments: [],
            modeComparison: {
                btap: { cost: '', co2: '', isBest: true },
                bcfc: { cost: '', co2: '', isBest: false },
                road: { cost: '', co2: '', isBest: false }
            },
            optimizationSimulator: { railShare: 60, costIndex: 92.5, co2Reduction: 40 },
            backhaulOpportunities: []
        };

        return (
            <div className="space-y-2">
                <SupplyChainTrackingModule nodes={intel.supplyChainNodes} onUpdate={nodes => updateLogisticsModule('supplyChainNodes', nodes)} />
                <ShipmentModule shipments={intel.liveShipments} onUpdate={ships => updateLogisticsModule('liveShipments', ships)} />
                <CorridorAnalysisModule analysis={intel.corridorAnalysis} onUpdate={items => updateLogisticsModule('corridorAnalysis', items)} />
                <ModeComparisonModule comparison={intel.modeComparison} onUpdate={comparison => updateLogisticsModule('modeComparison', comparison)} />
                <OptimizationModule simulator={intel.optimizationSimulator} onUpdate={simulator => updateLogisticsModule('optimizationSimulator', simulator)} />
                <BackhaulModule opportunities={intel.backhaulOpportunities} onUpdate={opps => updateLogisticsModule('backhaulOpportunities', opps)} />
            </div>
        );
    };

    const renderCost = () => {
        const costIntel = {
            logisticsCost: localDraft.costIntelligence?.logisticsCost || 0,
            landedCost: localDraft.costIntelligence?.landedCost || 0,
            leastCostRoutes: localDraft.costIntelligence?.leastCostRoutes || [],
            benchmarking: localDraft.costIntelligence?.benchmarking || { btap: 0, bcfc: 0, road: 0 }
        };

        const updateCostIntelField = (field: string, value: any) => {
            updateField('costIntelligence', field, value);
        };

        const handleAddRoute = () => {
            const newRoute: LeastCostRouteEntry = {
                id: `route-${Date.now()}`,
                fromId: '',
                toId: '',
                mode: 'Road',
                comments: ''
            };
            updateCostIntelField('leastCostRoutes', [...costIntel.leastCostRoutes, newRoute]);
        };

        const handleRemoveRoute = (id: string) => {
            updateCostIntelField('leastCostRoutes', costIntel.leastCostRoutes.filter(r => r.id !== id));
        };

        const handleUpdateRoute = (id: string, field: keyof LeastCostRouteEntry, value: string) => {
            const updated = costIntel.leastCostRoutes.map(r => r.id === id ? { ...r, [field]: value } : r);
            updateCostIntelField('leastCostRoutes', updated);
        };

        return (
            <div className="space-y-6">
                <Card title="1: Logistics Cost and Total Landed Cost" icon={<CalculatorIcon />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Logistics Cost</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    className="flex-1 border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none"
                                    placeholder="Enter cost..."
                                    value={costIntel.logisticsCost || ''}
                                    onChange={e => updateCostIntelField('logisticsCost', parseFloat(e.target.value) || 0)}
                                />
                                <span className="bg-gray-100 px-3 py-2 rounded text-xs font-bold text-gray-500 whitespace-nowrap">ton/Km</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Landed Cost</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    className="flex-1 border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none"
                                    placeholder="Enter cost..."
                                    value={costIntel.landedCost || ''}
                                    onChange={e => updateCostIntelField('landedCost', parseFloat(e.target.value) || 0)}
                                />
                                <span className="bg-gray-100 px-3 py-2 rounded text-xs font-bold text-gray-500 whitespace-nowrap">/kg</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="2: Least - Cost Route & Mode" icon={<GlobeIcon />}>
                    <div className="space-y-4">
                        {costIntel.leastCostRoutes.map((routeEntry) => (
                            <div key={routeEntry.id} className="p-4 border rounded-lg bg-gray-50 relative group">
                                <button
                                    onClick={() => handleRemoveRoute(routeEntry.id)}
                                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Route"
                                >
                                    <TrashIcon />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <FormField label="From Source">
                                        <select
                                            className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-[#003A8F]"
                                            value={routeEntry.fromId}
                                            onChange={e => handleUpdateRoute(routeEntry.id, 'fromId', e.target.value)}
                                        >
                                            <option value="">Select Source...</option>
                                            {scenario.sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label="To Source">
                                        <select
                                            className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-[#003A8F]"
                                            value={routeEntry.toId}
                                            onChange={e => handleUpdateRoute(routeEntry.id, 'toId', e.target.value)}
                                        >
                                            <option value="">Select Destination...</option>
                                            {scenario.sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label="Transport Mode">
                                        <select
                                            className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-[#003A8F]"
                                            value={routeEntry.mode}
                                            onChange={e => handleUpdateRoute(routeEntry.id, 'mode', e.target.value)}
                                        >
                                            <option>Road</option>
                                            <option>Rail (BTAP)</option>
                                            <option>Rail (BCFC)</option>
                                            <option>Sea</option>
                                        </select>
                                    </FormField>
                                </div>
                                <FormField label="Comments / Strategic Reasoning">
                                    <textarea
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none h-16"
                                        placeholder="Add reasoning for this selection..."
                                        value={routeEntry.comments}
                                        onChange={e => handleUpdateRoute(routeEntry.id, 'comments', e.target.value)}
                                    />
                                </FormField>
                            </div>
                        ))}
                        <button
                            onClick={handleAddRoute}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">+</span> Add New Least-Cost Recommendation
                        </button>
                    </div>
                </Card>

                <Card title="3: Cost Benchmarking (/ton-km)" icon={<PresentationChartBarIcon />}>
                    <p className="text-xs text-gray-500 mb-4 font-medium italic">Update the benchmark values below to reflect in the analytics visualization.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <label className="block text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Rail (BTAP)</label>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="flex-1 border-green-200 border rounded p-2 text-sm focus:ring-2 focus:ring-[#2E7D32] outline-none"
                                    value={costIntel.benchmarking.btap || ''}
                                    onChange={e => updateField('costIntelligence', 'benchmarking', { ...costIntel.benchmarking, btap: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                            <label className="block text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">Rail (BCFC)</label>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="flex-1 border-orange-200 border rounded p-2 text-sm focus:ring-2 focus:ring-[#F9A825] outline-none"
                                    value={costIntel.benchmarking.bcfc || ''}
                                    onChange={e => updateField('costIntelligence', 'benchmarking', { ...costIntel.benchmarking, bcfc: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Road (Standard)</label>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="flex-1 border-gray-300 border rounded p-2 text-sm focus:ring-2 focus:ring-gray-500 outline-none"
                                    value={costIntel.benchmarking.road || ''}
                                    onChange={e => updateField('costIntelligence', 'benchmarking', { ...costIntel.benchmarking, road: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    const renderReport = () => {
        const defaultReportsData = buildPerformanceReportDefaults();
        const reportsData: ReportsData = {
            financial: {
                ...defaultReportsData.financial,
                ...localDraft.reportsData?.financial,
                costChartData: localDraft.reportsData?.financial?.costChartData || defaultReportsData.financial.costChartData
            },
            operational: {
                ...defaultReportsData.operational,
                ...localDraft.reportsData?.operational,
                delayDistributionData: localDraft.reportsData?.operational?.delayDistributionData || defaultReportsData.operational.delayDistributionData
            },
            plantAnalysis: {
                ...defaultReportsData.plantAnalysis,
                ...localDraft.reportsData?.plantAnalysis,
                plantMetricsData: localDraft.reportsData?.plantAnalysis?.plantMetricsData || defaultReportsData.plantAnalysis.plantMetricsData
            },
            transportMode: {
                ...defaultReportsData.transportMode,
                ...localDraft.reportsData?.transportMode,
                modeMixDistribution: localDraft.reportsData?.transportMode?.modeMixDistribution || defaultReportsData.transportMode.modeMixDistribution
            },
            historicalTrends: {
                ...defaultReportsData.historicalTrends,
                ...localDraft.reportsData?.historicalTrends,
                monthlyCostSavingsTrend: localDraft.reportsData?.historicalTrends?.monthlyCostSavingsTrend || defaultReportsData.historicalTrends.monthlyCostSavingsTrend
            }
        };

        const updateFinancialData = (updates: Partial<ReportsData['financial']>) => {
            updateField('reportsData', 'financial', { ...reportsData.financial, ...updates });
        };

        const updateOperationalData = (updates: Partial<ReportsData['operational']>) => {
            updateField('reportsData', 'operational', { ...reportsData.operational, ...updates });
        };

        const updatePlantAnalysisData = (updates: Partial<ReportsData['plantAnalysis']>) => {
            updateField('reportsData', 'plantAnalysis', { ...reportsData.plantAnalysis, ...updates });
        };

        const updateTransportModeData = (updates: Partial<ReportsData['transportMode']>) => {
            updateField('reportsData', 'transportMode', { ...reportsData.transportMode, ...updates });
        };

        const updateHistoricalTrendData = (updates: Partial<ReportsData['historicalTrends']>) => {
            updateField('reportsData', 'historicalTrends', { ...reportsData.historicalTrends, ...updates });
        };

        const handleFinancialRowChange = (id: string, field: keyof Omit<FinancialCostChartRow, 'id'>, value: string) => {
            updateFinancialData({
                costChartData: reportsData.financial.costChartData.map(row => row.id === id ? { ...row, [field]: value } : row)
            });
        };

        const handleAddFinancialRow = () => {
            const newRow: FinancialCostChartRow = { id: `financial-${Date.now()}`, category: '', planned: '', actual: '' };
            updateFinancialData({ costChartData: [...reportsData.financial.costChartData, newRow] });
        };

        const handleDeleteFinancialRow = (id: string) => {
            updateFinancialData({ costChartData: reportsData.financial.costChartData.filter(row => row.id !== id) });
        };

        const handleOperationalRowChange = (id: string, field: keyof Omit<OperationalDelayRow, 'id'>, value: string) => {
            updateOperationalData({
                delayDistributionData: reportsData.operational.delayDistributionData.map(row => row.id === id ? { ...row, [field]: value } : row)
            });
        };

        const handleAddOperationalRow = () => {
            const newRow: OperationalDelayRow = { id: `operational-${Date.now()}`, reason: '', value: '' };
            updateOperationalData({ delayDistributionData: [...reportsData.operational.delayDistributionData, newRow] });
        };

        const handleDeleteOperationalRow = (id: string) => {
            updateOperationalData({ delayDistributionData: reportsData.operational.delayDistributionData.filter(row => row.id !== id) });
        };

        const handlePlantMetricRowChange = (id: string, field: keyof Omit<PlantMetricRow, 'id'>, value: string) => {
            updatePlantAnalysisData({
                plantMetricsData: reportsData.plantAnalysis.plantMetricsData.map(row => row.id === id ? { ...row, [field]: value } : row)
            });
        };

        const handleAddPlantMetricRow = () => {
            const newRow: PlantMetricRow = { id: `plant-${Date.now()}`, plantName: '', costPerTon: '', savingsPercent: '' };
            updatePlantAnalysisData({ plantMetricsData: [...reportsData.plantAnalysis.plantMetricsData, newRow] });
        };

        const handleDeletePlantMetricRow = (id: string) => {
            updatePlantAnalysisData({ plantMetricsData: reportsData.plantAnalysis.plantMetricsData.filter(row => row.id !== id) });
        };

        const handleTransportModeRowChange = (id: string, field: keyof Omit<TransportModeDistributionRow, 'id'>, value: string) => {
            updateTransportModeData({
                modeMixDistribution: reportsData.transportMode.modeMixDistribution.map(row => row.id === id ? { ...row, [field]: value } : row)
            });
        };

        const handleAddTransportModeRow = () => {
            const newRow: TransportModeDistributionRow = { id: `transport-${Date.now()}`, transportMode: '', valuePercent: '' };
            updateTransportModeData({ modeMixDistribution: [...reportsData.transportMode.modeMixDistribution, newRow] });
        };

        const handleDeleteTransportModeRow = (id: string) => {
            updateTransportModeData({ modeMixDistribution: reportsData.transportMode.modeMixDistribution.filter(row => row.id !== id) });
        };

        const handleHistoricalTrendRowChange = (id: string, field: keyof Omit<HistoricalTrendRow, 'id'>, value: string) => {
            updateHistoricalTrendData({
                monthlyCostSavingsTrend: reportsData.historicalTrends.monthlyCostSavingsTrend.map(row => row.id === id ? { ...row, [field]: value } : row)
            });
        };

        const handleAddHistoricalTrendRow = () => {
            const newRow: HistoricalTrendRow = { id: `trend-${Date.now()}`, month: '', cost: '', savings: '' };
            updateHistoricalTrendData({ monthlyCostSavingsTrend: [...reportsData.historicalTrends.monthlyCostSavingsTrend, newRow] });
        };

        const handleDeleteHistoricalTrendRow = (id: string) => {
            updateHistoricalTrendData({ monthlyCostSavingsTrend: reportsData.historicalTrends.monthlyCostSavingsTrend.filter(row => row.id !== id) });
        };

        return (
            <div className="space-y-6">
                <Card title="Financial Reports" icon={<CalculatorIcon />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <FormField label="Total Spend">
                            <input
                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none"
                                value={reportsData.financial.totalSpend}
                                onChange={e => updateFinancialData({ totalSpend: e.target.value })}
                            />
                        </FormField>
                        <FormField label="Avg Cost/Ton">
                            <input
                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none"
                                value={reportsData.financial.avgCostPerTon}
                                onChange={e => updateFinancialData({ avgCostPerTon: e.target.value })}
                            />
                        </FormField>
                        <FormField label="Realized Savings">
                            <input
                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none"
                                value={reportsData.financial.realizedSavings}
                                onChange={e => updateFinancialData({ realizedSavings: e.target.value })}
                            />
                        </FormField>
                        <FormField label="Cost Variance">
                            <input
                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none"
                                value={reportsData.financial.costVariance}
                                onChange={e => updateFinancialData({ costVariance: e.target.value })}
                            />
                        </FormField>
                    </div>

                    <SectionHeader title="Cost Chart Data" />
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3">Planned</th>
                                    <th className="px-4 py-3">Actual</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reportsData.financial.costChartData.map(row => (
                                    <tr key={row.id} className="group">
                                        <td className="px-4 py-3">
                                            <input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.category} onChange={e => handleFinancialRowChange(row.id, 'category', e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.planned} onChange={e => handleFinancialRowChange(row.id, 'planned', e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.actual} onChange={e => handleFinancialRowChange(row.id, 'actual', e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => handleDeleteFinancialRow(row.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete Row">
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={handleAddFinancialRow} className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all">
                        + Add Row
                    </button>
                </Card>

                <Card title="Operational Perf." icon={<TruckIcon />}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="On Time Delivery %">
                            <input
                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none"
                                value={reportsData.operational.onTimeDeliveryPct}
                                onChange={e => updateOperationalData({ onTimeDeliveryPct: e.target.value })}
                            />
                        </FormField>
                        <FormField label="Turnaround Time">
                            <input
                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none"
                                value={reportsData.operational.turnaroundTime}
                                onChange={e => updateOperationalData({ turnaroundTime: e.target.value })}
                            />
                        </FormField>
                        <FormField label="Utilization %">
                            <input
                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none"
                                value={reportsData.operational.utilizationPct}
                                onChange={e => updateOperationalData({ utilizationPct: e.target.value })}
                            />
                        </FormField>
                    </div>

                    <SectionHeader title="Delay Distribution Data" />
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="px-4 py-3">Reason</th>
                                    <th className="px-4 py-3">Value</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reportsData.operational.delayDistributionData.map(row => (
                                    <tr key={row.id} className="group">
                                        <td className="px-4 py-3">
                                            <input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.reason} onChange={e => handleOperationalRowChange(row.id, 'reason', e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.value} onChange={e => handleOperationalRowChange(row.id, 'value', e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => handleDeleteOperationalRow(row.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete Row">
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={handleAddOperationalRow} className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all">
                        + Add Row
                    </button>
                </Card>

                <Card title="Plant Analysis" icon={<FactoryIcon />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Most Efficient Plant">
                            <input
                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none"
                                value={reportsData.plantAnalysis.mostEfficientPlant}
                                onChange={e => updatePlantAnalysisData({ mostEfficientPlant: e.target.value })}
                            />
                        </FormField>
                        <FormField label="Highest Logistics Cost">
                            <input
                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none"
                                value={reportsData.plantAnalysis.highestLogisticsCost}
                                onChange={e => updatePlantAnalysisData({ highestLogisticsCost: e.target.value })}
                            />
                        </FormField>
                    </div>

                    <SectionHeader title="Plant Metrics Data" />
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="px-4 py-3">Plant Name</th>
                                    <th className="px-4 py-3">Cost/Ton</th>
                                    <th className="px-4 py-3">Savings %</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reportsData.plantAnalysis.plantMetricsData.map(row => (
                                    <tr key={row.id} className="group">
                                        <td className="px-4 py-3">
                                            <input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.plantName} onChange={e => handlePlantMetricRowChange(row.id, 'plantName', e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.costPerTon} onChange={e => handlePlantMetricRowChange(row.id, 'costPerTon', e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.savingsPercent} onChange={e => handlePlantMetricRowChange(row.id, 'savingsPercent', e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => handleDeletePlantMetricRow(row.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete Row">
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={handleAddPlantMetricRow} className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all">
                        + Add Row
                    </button>
                </Card>

                <Card title="Transport Mode" icon={<GlobeIcon />}>
                    <SectionHeader title="Mode Mix Distribution" />
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="px-4 py-3">Transport Mode</th>
                                    <th className="px-4 py-3">Value %</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reportsData.transportMode.modeMixDistribution.map(row => (
                                    <tr key={row.id} className="group">
                                        <td className="px-4 py-3">
                                            <input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.transportMode} onChange={e => handleTransportModeRowChange(row.id, 'transportMode', e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.valuePercent} onChange={e => handleTransportModeRowChange(row.id, 'valuePercent', e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => handleDeleteTransportModeRow(row.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete Row">
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={handleAddTransportModeRow} className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all">
                        + Add Row
                    </button>
                </Card>

                <Card title="Historical Trends" icon={<PresentationChartBarIcon />}>
                    <SectionHeader title="Monthly Cost/Savings Trend" />
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="px-4 py-3">Month</th>
                                    <th className="px-4 py-3">Cost</th>
                                    <th className="px-4 py-3">Savings</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reportsData.historicalTrends.monthlyCostSavingsTrend.map(row => (
                                    <tr key={row.id} className="group">
                                        <td className="px-4 py-3">
                                            <input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.month} onChange={e => handleHistoricalTrendRowChange(row.id, 'month', e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.cost} onChange={e => handleHistoricalTrendRowChange(row.id, 'cost', e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.savings} onChange={e => handleHistoricalTrendRowChange(row.id, 'savings', e.target.value)} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => handleDeleteHistoricalTrendRow(row.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete Row">
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={handleAddHistoricalTrendRow} className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all">
                        + Add Row
                    </button>
                </Card>
            </div>
        );
    };

    const renderAuditCompliance = () => {
        const defaultAuditData = buildAuditComplianceDefaults();
        const auditData: AuditComplianceData = {
            savingsDashboard: {
                ...defaultAuditData.savingsDashboard,
                ...localDraft.auditComplianceData?.savingsDashboard
            },
            optimizationAuditTrail: {
                records: localDraft.auditComplianceData?.optimizationAuditTrail?.records || defaultAuditData.optimizationAuditTrail.records
            },
            shipmentLevelSavings: {
                rows: localDraft.auditComplianceData?.shipmentLevelSavings?.rows || defaultAuditData.shipmentLevelSavings.rows
            },
            esgPerformance: {
                ...defaultAuditData.esgPerformance,
                ...localDraft.auditComplianceData?.esgPerformance
            },
            approvalHistory: {
                rows: localDraft.auditComplianceData?.approvalHistory?.rows || defaultAuditData.approvalHistory.rows
            }
        };

        const updateAuditData = (field: keyof AuditComplianceData, value: any) => {
            updateField('auditComplianceData', field, value);
        };

        const updateSavingsDashboard = (updates: Partial<AuditComplianceData['savingsDashboard']>) => {
            updateAuditData('savingsDashboard', { ...auditData.savingsDashboard, ...updates });
        };

        const updateAuditTrailRows = (rows: OptimizationAuditRow[]) => {
            updateAuditData('optimizationAuditTrail', { records: rows });
        };

        const updateShipmentRows = (rows: ShipmentLevelSavingsRow[]) => {
            updateAuditData('shipmentLevelSavings', { rows });
        };

        const updateEsgPerformance = (updates: Partial<AuditComplianceData['esgPerformance']>) => {
            updateAuditData('esgPerformance', { ...auditData.esgPerformance, ...updates });
        };

        const updateApprovalRows = (rows: ApprovalHistoryRow[]) => {
            updateAuditData('approvalHistory', { rows });
        };

        const handleAuditRecordChange = (id: string, field: keyof Omit<OptimizationAuditRow, 'id'>, value: string) => {
            updateAuditTrailRows(auditData.optimizationAuditTrail.records.map(row => row.id === id ? { ...row, [field]: value } : row));
        };

        const handleAuditRecordIdChange = (id: string, value: string) => {
            updateAuditTrailRows(auditData.optimizationAuditTrail.records.map(row => row.id === id ? { ...row, id: value } : row));
        };

        const handleAddAuditRecord = () => {
            const newRecord: OptimizationAuditRow = {
                id: `audit-${Date.now()}`,
                date: '',
                type: '',
                baseline: '',
                optimized: '',
                status: 'Pending'
            };
            updateAuditTrailRows([...auditData.optimizationAuditTrail.records, newRecord]);
        };

        const handleDeleteAuditRecord = (id: string) => {
            updateAuditTrailRows(auditData.optimizationAuditTrail.records.filter(row => row.id !== id));
        };

        const handleShipmentRowChange = (id: string, field: keyof Omit<ShipmentLevelSavingsRow, 'id'>, value: string) => {
            updateShipmentRows(auditData.shipmentLevelSavings.rows.map(row => row.id === id ? { ...row, [field]: value } : row));
        };

        const handleAddShipmentRow = () => {
            const newRow: ShipmentLevelSavingsRow = {
                id: `shipment-${Date.now()}`,
                shipmentId: '',
                route: '',
                baseline: '',
                actual: ''
            };
            updateShipmentRows([...auditData.shipmentLevelSavings.rows, newRow]);
        };

        const handleDeleteShipmentRow = (id: string) => {
            updateShipmentRows(auditData.shipmentLevelSavings.rows.filter(row => row.id !== id));
        };

        const handleApprovalRowChange = (id: string, field: keyof Omit<ApprovalHistoryRow, 'id'>, value: string) => {
            updateApprovalRows(auditData.approvalHistory.rows.map(row => row.id === id ? { ...row, [field]: value } : row));
        };

        const handleAddApprovalRow = () => {
            const newRow: ApprovalHistoryRow = {
                id: `approval-${Date.now()}`,
                logId: '',
                user: '',
                impact: ''
            };
            updateApprovalRows([...auditData.approvalHistory.rows, newRow]);
        };

        const handleDeleteApprovalRow = (id: string) => {
            updateApprovalRows(auditData.approvalHistory.rows.filter(row => row.id !== id));
        };

        return (
            <div className="space-y-6">
                <Card title="Savings Dashboard" icon={<CalculatorIcon />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <FormField label="YTD Savings">
                            <input className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none" value={auditData.savingsDashboard.ytdSavings} onChange={e => updateSavingsDashboard({ ytdSavings: e.target.value })} />
                        </FormField>
                        <FormField label="Avg Reduction %">
                            <input className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none" value={auditData.savingsDashboard.avgReductionPct} onChange={e => updateSavingsDashboard({ avgReductionPct: e.target.value })} />
                        </FormField>
                        <FormField label="CO2 Avoided">
                            <input className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none" value={auditData.savingsDashboard.co2Avoided} onChange={e => updateSavingsDashboard({ co2Avoided: e.target.value })} />
                        </FormField>
                        <FormField label="Savings At Risk">
                            <input className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none" value={auditData.savingsDashboard.savingsAtRisk} onChange={e => updateSavingsDashboard({ savingsAtRisk: e.target.value })} />
                        </FormField>
                    </div>
                </Card>

                <Card title="Optimization Audit Trail" icon={<ShieldIcon />}>
                    <SectionHeader title="Audit Records" />
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Baseline</th>
                                    <th className="px-4 py-3">Optimized</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {auditData.optimizationAuditTrail.records.map(row => (
                                    <tr key={row.id} className="group">
                                        <td className="px-4 py-3"><input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.id} onChange={e => handleAuditRecordIdChange(row.id, e.target.value)} /></td>
                                        <td className="px-4 py-3"><input type="date" className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.date} onChange={e => handleAuditRecordChange(row.id, 'date', e.target.value)} /></td>
                                        <td className="px-4 py-3"><input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.type} onChange={e => handleAuditRecordChange(row.id, 'type', e.target.value)} /></td>
                                        <td className="px-4 py-3"><input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.baseline} onChange={e => handleAuditRecordChange(row.id, 'baseline', e.target.value)} /></td>
                                        <td className="px-4 py-3"><input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.optimized} onChange={e => handleAuditRecordChange(row.id, 'optimized', e.target.value)} /></td>
                                        <td className="px-4 py-3">
                                            <select className="w-full border rounded px-2 py-1 text-sm bg-white focus:ring-1 focus:ring-blue-500 outline-none" value={row.status} onChange={e => handleAuditRecordChange(row.id, 'status', e.target.value)}>
                                                <option>Approved</option>
                                                <option>Pending</option>
                                                <option>Rejected</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => handleDeleteAuditRecord(row.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete Record">
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={handleAddAuditRecord} className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all">
                        + Add Record
                    </button>
                </Card>

                <Card title="Shipment-Level Savings" icon={<TruckIcon />}>
                    <SectionHeader title="Individual Shipment Logs" />
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="px-4 py-3">Shipment Id</th>
                                    <th className="px-4 py-3">Route</th>
                                    <th className="px-4 py-3">Baseline</th>
                                    <th className="px-4 py-3">Actual</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {auditData.shipmentLevelSavings.rows.map(row => (
                                    <tr key={row.id} className="group">
                                        <td className="px-4 py-3"><input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.shipmentId} onChange={e => handleShipmentRowChange(row.id, 'shipmentId', e.target.value)} /></td>
                                        <td className="px-4 py-3"><input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.route} onChange={e => handleShipmentRowChange(row.id, 'route', e.target.value)} /></td>
                                        <td className="px-4 py-3"><input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.baseline} onChange={e => handleShipmentRowChange(row.id, 'baseline', e.target.value)} /></td>
                                        <td className="px-4 py-3"><input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.actual} onChange={e => handleShipmentRowChange(row.id, 'actual', e.target.value)} /></td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => handleDeleteShipmentRow(row.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete Row">
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={handleAddShipmentRow} className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all">
                        + Add Row
                    </button>
                </Card>

                <Card title="ESG Performance" icon={<LeafIcon />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <FormField label="CO2 Avoided">
                            <input className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none" value={auditData.esgPerformance.co2Avoided} onChange={e => updateEsgPerformance({ co2Avoided: e.target.value })} />
                        </FormField>
                        <FormField label="Diesel Saved">
                            <input className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none" value={auditData.esgPerformance.dieselSaved} onChange={e => updateEsgPerformance({ dieselSaved: e.target.value })} />
                        </FormField>
                        <FormField label="Rail Shift%">
                            <input className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none" value={auditData.esgPerformance.railShiftPct} onChange={e => updateEsgPerformance({ railShiftPct: e.target.value })} />
                        </FormField>
                        <FormField label="Carbon Credits">
                            <input className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none" value={auditData.esgPerformance.carbonCredits} onChange={e => updateEsgPerformance({ carbonCredits: e.target.value })} />
                        </FormField>
                    </div>
                </Card>

                <Card title="Approval History" icon={<ShieldIcon />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="px-4 py-3">Log Id</th>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Impact</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {auditData.approvalHistory.rows.map(row => (
                                    <tr key={row.id} className="group">
                                        <td className="px-4 py-3"><input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.logId} onChange={e => handleApprovalRowChange(row.id, 'logId', e.target.value)} /></td>
                                        <td className="px-4 py-3"><input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.user} onChange={e => handleApprovalRowChange(row.id, 'user', e.target.value)} /></td>
                                        <td className="px-4 py-3"><input className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={row.impact} onChange={e => handleApprovalRowChange(row.id, 'impact', e.target.value)} /></td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => handleDeleteApprovalRow(row.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete Row">
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={handleAddApprovalRow} className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all">
                        + Add Row
                    </button>
                </Card>
            </div>
        );
    };

    const renderESG = () => {
        const esgIntel = {
            scenarioEmissions: localDraft.esgComplianceData?.scenarioEmissions || 0,
            dieselOffset: localDraft.esgComplianceData?.dieselOffset || 0,
            carbonCredits: localDraft.esgComplianceData?.carbonCredits || 0,
            comparisonMatrix: localDraft.esgComplianceData?.comparisonMatrix || [],
            schemes: localDraft.esgComplianceData?.schemes || []
        };

        const updateEsgField = (field: string, value: any) => {
            updateField('esgComplianceData', field, value);
        };

        const handleMatrixChange = (id: string, field: keyof EsgImpactMetric, value: any) => {
            const nextMatrix = esgIntel.comparisonMatrix.map(item => item.id === id ? { ...item, [field]: value } : item);
            updateEsgField('comparisonMatrix', nextMatrix);
        };

        const handleAddMatrixItem = () => {
            const newItem: EsgImpactMetric = { id: `metric-${Date.now()}`, name: '', btap: 0, bcfc: 0, road: 0 };
            updateEsgField('comparisonMatrix', [...esgIntel.comparisonMatrix, newItem]);
        };

        const handleRemoveMatrixItem = (id: string) => {
            updateEsgField('comparisonMatrix', esgIntel.comparisonMatrix.filter(m => m.id !== id));
        };

        const handleAddScheme = () => {
            const newScheme: EsgScheme = { id: `scheme-${Date.now()}`, header: '', description: '', status: 'Pending' };
            updateEsgField('schemes', [...esgIntel.schemes, newScheme]);
        };

        const handleUpdateScheme = (id: string, field: keyof EsgScheme, value: string) => {
            const nextSchemes = esgIntel.schemes.map(s => s.id === id ? { ...s, [field]: value } : s);
            updateEsgField('schemes', nextSchemes);
        };

        const handleRemoveScheme = (id: string) => {
            updateEsgField('schemes', esgIntel.schemes.filter(s => s.id !== id));
        };

        return (
            <div className="space-y-6">
                <Card title="1: Environmental Impact Dashboard" icon={<LeafIcon />}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Scenario Emissions</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    className="flex-1 border rounded p-2 text-sm focus:ring-2 focus:ring-[#2E7D32] outline-none"
                                    value={esgIntel.scenarioEmissions || ''}
                                    onChange={e => updateEsgField('scenarioEmissions', parseFloat(e.target.value) || 0)}
                                />
                                <span className="bg-green-50 px-3 py-2 rounded text-xs font-bold text-green-700 whitespace-nowrap">tons CO₂</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Diesel Offset</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    className="flex-1 border rounded p-2 text-sm focus:ring-2 focus:ring-[#2E7D32] outline-none"
                                    value={esgIntel.dieselOffset || ''}
                                    onChange={e => updateEsgField('dieselOffset', parseFloat(e.target.value) || 0)}
                                />
                                <span className="bg-green-50 px-3 py-2 rounded text-xs font-bold text-green-700 whitespace-nowrap">litres</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Carbon Credits</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    className="flex-1 border rounded p-2 text-sm focus:ring-2 focus:ring-[#2E7D32] outline-none"
                                    value={esgIntel.carbonCredits || ''}
                                    onChange={e => updateEsgField('carbonCredits', parseFloat(e.target.value) || 0)}
                                />
                                <span className="bg-green-50 px-3 py-2 rounded text-xs font-bold text-green-700 whitespace-nowrap">units</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="2: Impact Comparison Matrix" icon={<PresentationChartBarIcon />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="px-4 py-3">Metric Name</th>
                                    <th className="px-4 py-3 text-[#003A8F]">BTAP</th>
                                    <th className="px-4 py-3 text-[#F9A825]">BCFC</th>
                                    <th className="px-4 py-3 text-gray-700">Road</th>
                                    <th className="px-4 py-3 text-[#2E7D32]">Savings %</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {esgIntel.comparisonMatrix.map(metric => {
                                    const savings = metric.road > 0 ? ((metric.road - metric.btap) / metric.road * 100).toFixed(1) : '0.0';
                                    return (
                                        <tr key={metric.id} className="group">
                                            <td className="px-4 py-3">
                                                <input
                                                    className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                    value={metric.name}
                                                    placeholder="Enter metric name (e.g. CO2)"
                                                    onChange={e => handleMatrixChange(metric.id, 'name', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number" step="0.1"
                                                    className="w-20 border rounded px-1 text-sm bg-blue-50/30 focus:ring-1 focus:ring-blue-500 outline-none"
                                                    value={metric.btap}
                                                    onChange={e => handleMatrixChange(metric.id, 'btap', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number" step="0.1"
                                                    className="w-20 border rounded px-1 text-sm bg-orange-50/30 focus:ring-1 focus:ring-orange-500 outline-none"
                                                    value={metric.bcfc}
                                                    onChange={e => handleMatrixChange(metric.id, 'bcfc', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number" step="0.1"
                                                    className="w-20 border rounded px-1 text-sm bg-gray-50 focus:ring-1 focus:ring-gray-500 outline-none"
                                                    value={metric.road}
                                                    onChange={e => handleMatrixChange(metric.id, 'road', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-bold text-[#2E7D32]">{savings}%</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleRemoveMatrixItem(metric.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Delete Metric"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <button
                        onClick={handleAddMatrixItem}
                        className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="text-xl">+</span> Add Impact Metric
                    </button>
                </Card>

                <Card title="3: Subsidy & Schemes Section" icon={<ShieldIcon />}>
                    <div className="space-y-4">
                        {esgIntel.schemes.map(scheme => (
                            <div key={scheme.id} className="p-4 border rounded-lg bg-gray-50 relative group">
                                <button
                                    onClick={() => handleRemoveScheme(scheme.id)}
                                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <TrashIcon />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                    <div className="md:col-span-2">
                                        <FormField label="Scheme Header">
                                            <input
                                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none"
                                                value={scheme.header}
                                                onChange={e => handleUpdateScheme(scheme.id, 'header', e.target.value)}
                                            />
                                        </FormField>
                                    </div>
                                    <FormField label="Status">
                                        <select
                                            className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-[#003A8F]"
                                            value={scheme.status}
                                            onChange={e => handleUpdateScheme(scheme.id, 'status', e.target.value as any)}
                                        >
                                            <option>Active</option>
                                            <option>Inactive</option>
                                            <option>Pending</option>
                                        </select>
                                    </FormField>
                                </div>
                                <FormField label="Description">
                                    <textarea
                                        className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none h-16"
                                        value={scheme.description}
                                        onChange={e => handleUpdateScheme(scheme.id, 'description', e.target.value)}
                                    />
                                </FormField>
                            </div>
                        ))}
                        <button
                            onClick={handleAddScheme}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-50 hover:border-green-400 hover:text-green-600 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">+</span> Add New Scheme
                        </button>
                    </div>
                </Card>
            </div>
        );
    };

    const renderPlanning = () => {
        const planningIntel = {
            weeklyDemand: localDraft.planningForecastingData?.weeklyDemand || 0,
            incomingSupply: localDraft.planningForecastingData?.incomingSupply || 0,
            netBalance: localDraft.planningForecastingData?.netBalance || 0,
            dailyForecasts: localDraft.planningForecastingData?.dailyForecasts || [
                { day: 'Mon', demand: 0, supply: 0 },
                { day: 'Tue', demand: 0, supply: 0 },
                { day: 'Wed', demand: 0, supply: 0 },
                { day: 'Thu', demand: 0, supply: 0 },
                { day: 'Fri', demand: 0, supply: 0 },
                { day: 'Sat', demand: 0, supply: 0 },
                { day: 'Sun', demand: 0, supply: 0 },
            ],
            siloLevels: localDraft.planningForecastingData?.siloLevels || [],
            stockTransferSuggestions: localDraft.planningForecastingData?.stockTransferSuggestions || []
        };

        const updatePlanningField = (field: string, value: any) => {
            updateField('planningForecastingData', field, value);
        };

        const handleForecastChange = (day: string, field: 'demand' | 'supply', value: number) => {
            const nextForecasts = planningIntel.dailyForecasts.map(f => f.day === day ? { ...f, [field]: value } : f);
            updatePlanningField('dailyForecasts', nextForecasts);
        };

        const handleAddStockTransfer = () => {
            const newItem: StockTransfer = { id: `st-${Date.now()}`, sourcePlant: '', material: '', suggestQty: 0, eta: '', action: 'Approve' };
            updatePlanningField('stockTransferSuggestions', [...planningIntel.stockTransferSuggestions, newItem]);
        };

        const handleUpdateStockTransfer = (id: string, field: keyof StockTransfer, value: any) => {
            const nextTransfers = planningIntel.stockTransferSuggestions.map(t => t.id === id ? { ...t, [field]: value } : t);
            updatePlanningField('stockTransferSuggestions', nextTransfers);
        };

        const handleRemoveStockTransfer = (id: string) => {
            updatePlanningField('stockTransferSuggestions', planningIntel.stockTransferSuggestions.filter(t => t.id !== id));
        };

        const handleSiloChange = (material: string, field: keyof SiloLevel, value: any) => {
            const nextSilos = planningIntel.siloLevels.map(s => s.material === material ? { ...s, [field]: value } : s);
            updatePlanningField('siloLevels', nextSilos);
        };

        return (
            <div className="space-y-6">
                <Card title="1: Network Flow Summary" icon={<ChartIcon />}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField label="Total Weekly Demand (Tons)">
                            <input
                                type="number"
                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none"
                                value={planningIntel.weeklyDemand || ''}
                                onChange={e => updatePlanningField('weeklyDemand', parseFloat(e.target.value) || 0)}
                            />
                        </FormField>
                        <FormField label="Incoming Supply (Tons)">
                            <input
                                type="number"
                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none"
                                value={planningIntel.incomingSupply || ''}
                                onChange={e => updatePlanningField('incomingSupply', parseFloat(e.target.value) || 0)}
                            />
                        </FormField>
                        <FormField label="Net Balance Calculation">
                            <input
                                type="number"
                                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-[#003A8F] outline-none bg-gray-50"
                                value={planningIntel.netBalance || ''}
                                onChange={e => updatePlanningField('netBalance', parseFloat(e.target.value) || 0)}
                            />
                        </FormField>
                    </div>
                </Card>

                <Card title="2: Hub Silo Levels & Risks" icon={<CubeIcon />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {['Cement', 'FlyAsh', 'Gypsum', 'Limestone', 'Slag', 'Alumina', 'Coal or Lignite'].map(mat => {
                            const silo = planningIntel.siloLevels.find(s => s.material === mat) || { material: mat as any, level: 0, risk: 'Normal' };
                            return (
                                <div key={mat} className="p-3 border rounded bg-gray-50">
                                    <p className="text-xs font-bold text-[#003A8F] mb-2 uppercase">{mat}</p>
                                    <FormField label="Fill %">
                                        <input
                                            type="number"
                                            className="w-full border rounded p-1 text-sm"
                                            value={silo.level}
                                            onChange={e => handleSiloChange(mat, 'level', parseFloat(e.target.value) || 0)}
                                        />
                                    </FormField>
                                    <FormField label="Risk Status">
                                        <select
                                            className="w-full border rounded p-1 text-sm bg-white"
                                            value={silo.risk}
                                            onChange={e => handleSiloChange(mat, 'risk', e.target.value)}
                                        >
                                            <option>Normal</option>
                                            <option>Warning</option>
                                            <option>Critical Low</option>
                                            <option>Overflow Risk</option>
                                        </select>
                                    </FormField>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <Card title="3: Plant-Wise Demand Forecast" icon={<PresentationChartBarIcon />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="px-4 py-3">Day</th>
                                    <th className="px-4 py-3">Demand (Tons)</th>
                                    <th className="px-4 py-3">Supply (Tons)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {planningIntel.dailyForecasts.map(f => (
                                    <tr key={f.day}>
                                        <td className="px-4 py-3 font-bold text-gray-700">{f.day}</td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                className="w-32 border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                value={f.demand}
                                                onChange={e => handleForecastChange(f.day, 'demand', parseFloat(e.target.value) || 0)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                className="w-32 border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                                                value={f.supply}
                                                onChange={e => handleForecastChange(f.day, 'supply', parseFloat(e.target.value) || 0)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card title="4: Stock Transfer Suggestions" icon={<TruckIcon />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="px-4 py-3">Source Plant</th>
                                    <th className="px-4 py-3">Material</th>
                                    <th className="px-4 py-3">Suggest Qty</th>
                                    <th className="px-4 py-3">ETA</th>
                                    <th className="px-4 py-3">Action</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {planningIntel.stockTransferSuggestions.map(st => (
                                    <tr key={st.id} className="group">
                                        <td className="px-4 py-3">
                                            <input
                                                className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                value={st.sourcePlant}
                                                onChange={e => handleUpdateStockTransfer(st.id, 'sourcePlant', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                value={st.material}
                                                onChange={e => handleUpdateStockTransfer(st.id, 'material', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                className="w-24 border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                value={st.suggestQty}
                                                onChange={e => handleUpdateStockTransfer(st.id, 'suggestQty', parseFloat(e.target.value) || 0)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                className="w-24 border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                value={st.eta}
                                                onChange={e => handleUpdateStockTransfer(st.id, 'eta', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                className="border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                value={st.action}
                                                onChange={e => handleUpdateStockTransfer(st.id, 'action', e.target.value)}
                                            >
                                                <option>Approve</option>
                                                <option>Review</option>
                                                <option>Hold</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleRemoveStockTransfer(st.id)}
                                                className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button
                        onClick={handleAddStockTransfer}
                        className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="text-xl">+</span> Add Suggestion
                    </button>
                </Card>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-4">
                    {section === 'report' ? (
                        <label className="text-sm font-bold text-gray-600 whitespace-nowrap">Overall Performance Report Configuration</label>
                    ) : section === 'audit_compliance' ? (
                        <label className="text-sm font-bold text-gray-600 whitespace-nowrap">Overall Audit &amp; Compliance Configuration</label>
                    ) : (
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-bold text-gray-600 whitespace-nowrap">Configuring Scenario:</label>
                            <select
                                value={activeScenarioId}
                                onChange={e => setActiveScenarioId(e.target.value)}
                                className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm font-bold text-[#003A8F] focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {scenarios.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>
                        </div>
                    )}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            const nextDraft = JSON.parse(JSON.stringify(scenario));
                            if (section === 'report') {
                                nextDraft.reportsData = getOverallReportsData();
                            }
                            if (section === 'audit_compliance') {
                                nextDraft.auditComplianceData = getOverallAuditComplianceData();
                            }
                            setLocalDraft(nextDraft);
                            setIsDirty(false);
                        }}
                        className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isDirty}
                        className={`px-6 py-2 text-sm font-bold rounded shadow-sm transition-all ${isDirty ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                        Save Data
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">
                <p className="text-[10px] text-gray-400 mb-4 uppercase font-bold tracking-widest">
                    {section === 'report' || section === 'audit_compliance'
                        ? `${section.replace('_', ' ')} settings`
                        : `${section.replace('_', ' ')} Settings for ${scenario.title}`
                    }
                </p>
                {section === 'logistics_intel' && renderLogistics()}
                {section === 'cost_intel' && renderCost()}
                {section === 'report' && renderReport()}
                {section === 'esg_compliance' && renderESG()}
                {section === 'audit_compliance' && renderAuditCompliance()}
                {section === 'planning_forecasting' && renderPlanning()}
            </div>
        </div>
    );
};

interface SystemDataPageProps {
    scenarios: Scenario[];
    setScenarios: React.Dispatch<React.SetStateAction<Scenario[]>>;
}

const SystemDataPage: React.FC<SystemDataPageProps> = ({ scenarios, setScenarios }) => {
    const [activeSection, setActiveSection] = useState<SectionId>('homepage_data');
    const [activeScenarioId, setActiveScenarioId] = useState<string>(scenarios[0]?.id || '');

    // --- Master Data States ---
    const [rawMaterials, setRawMaterials] = useState<MasterEntity[]>([
        { id: '1', name: 'Rajasthan Gypsum', location: 'Rajasthan', status: 'Active', type: 'Gypsum' },
        { id: '2', name: 'Odisha Mine', location: 'Odisha', status: 'Active', type: 'Limestone' },
    ]);
    const [cementPlants, setCementPlants] = useState<MasterEntity[]>([
        { id: '1', name: 'Raipur Plant', code: 'RCP-01', location: 'Chhattisgarh', capacity: '5000 TPD', status: 'Active' },
    ]);
    const [hubs, setHubs] = useState<MasterEntity[]>([
        { id: '1', name: 'Kalamboli Hub', type: 'Silo Depot', location: 'Mumbai', status: 'Active' },
    ]);
    const [rmcUnits, setRmcUnits] = useState<MasterEntity[]>([
        { id: '1', name: 'Worli RMC', type: 'Internal', demand: '300 TPD', location: 'Mumbai', status: 'Active' },
    ]);
    const [transportModes, setTransportModes] = useState<MasterEntity[]>([
        { id: '1', name: 'Rail Freight', subType: 'BTAP', cost: '₹1.75/t-km', status: 'Active', location: 'Network' },
    ]);

    const activeScenario = scenarios.find(s => s.id === activeScenarioId);

    const handleUpdateScenario = (id: string, updates: Partial<Scenario>) => {
        setScenarios(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'raw_materials':
                return <EntityCrudTable title="Raw Material Sources" columns={[{ key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'location', label: 'Location' }, { key: 'status', label: 'Status' }]} data={rawMaterials} onSave={i => setRawMaterials(p => p.some(x => x.id === i.id) ? p.map(x => x.id === i.id ? i : x) : [...p, i])} onDelete={id => setRawMaterials(p => p.filter(x => x.id !== id))} />;
            case 'cement_plants':
                return <EntityCrudTable title="Cement Manufacturing Plants" columns={[{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }, { key: 'location', label: 'Location' }, { key: 'capacity', label: 'Capacity' }, { key: 'status', label: 'Status' }]} data={cementPlants} onSave={i => setCementPlants(p => p.some(x => x.id === i.id) ? p.map(x => x.id === i.id ? i : x) : [...p, i])} onDelete={id => setCementPlants(p => p.filter(x => x.id !== id))} />;
            case 'distribution_hubs':
                return <EntityCrudTable title="Distribution Hubs" columns={[{ key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'location', label: 'Location' }, { key: 'status', label: 'Status' }]} data={hubs} onSave={i => setHubs(p => p.some(x => x.id === i.id) ? p.map(x => x.id === i.id ? i : x) : [...p, i])} onDelete={id => setHubs(p => p.filter(x => x.id !== id))} />;
            case 'rmc_units':
                return <EntityCrudTable title="Ready-Mix Concrete Units" columns={[{ key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'demand', label: 'Demand' }, { key: 'location', label: 'Location' }, { key: 'status', label: 'Status' }]} data={rmcUnits} onSave={i => setRmcUnits(p => p.some(x => x.id === i.id) ? p.map(x => x.id === i.id ? i : x) : [...p, i])} onDelete={id => setRmcUnits(p => p.filter(x => x.id !== id))} />;
            case 'transport_modes':
                return <EntityCrudTable title="Transport Logistics Master" columns={[{ key: 'name', label: 'Mode' }, { key: 'subType', label: 'Sub Type' }, { key: 'cost', label: 'Cost Basis' }, { key: 'status', label: 'Status' }]} data={transportModes} onSave={i => setTransportModes(p => p.some(x => x.id === i.id) ? p.map(x => x.id === i.id ? i : x) : [...p, i])} onDelete={id => setTransportModes(p => p.filter(x => x.id !== id))} />;

            case 'logistics_intel':
            case 'cost_intel':
            case 'esg_compliance':
            case 'planning_forecasting':
            case 'report':
            case 'audit_compliance':
                if (!activeScenario) return <div className="p-8 text-center text-gray-500">Please select a scenario to continue.</div>;
                return (
                    <div className="space-y-6">
                        <IntelligenceEditor
                            scenario={activeScenario}
                            scenarios={scenarios}
                            activeScenarioId={activeScenarioId}
                            setActiveScenarioId={setActiveScenarioId}
                            section={activeSection}
                            onUpdate={handleUpdateScenario}
                        />
                    </div>
                );
            case 'homepage_data':
                return <HomepageDataManagement scenarios={scenarios} onUpdateScenario={handleUpdateScenario} />;
            default:
                return <div className="p-8 text-center text-gray-500">Select a customization section from the sidebar.</div>;
        }
    };

    return (
        <div className="flex h-full w-full min-w-0 bg-transparent">
            <aside className="w-72 bg-white/90 backdrop-blur-sm border-r border-gray-200 flex flex-col flex-shrink-0 h-full overflow-y-auto">
                <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-[#0B1F3B]">System Data</h2>
                    <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-tighter">Configuration Portal</p>
                </div>

                <nav className="flex-1 py-4 space-y-1">
                    <div className="px-4 pb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customization</div>
                    <SidebarItem id="homepage_data" label="Homepage Data" icon={<PresentationChartBarIcon />} isActive={activeSection === 'homepage_data'} onClick={setActiveSection} />

                    <div className="px-4 pt-6 pb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Network Entities (CRUD)</div>
                    <SidebarItem id="raw_materials" label="Raw Materials" icon={<CubeIcon />} isActive={activeSection === 'raw_materials'} onClick={setActiveSection} />
                    <SidebarItem id="cement_plants" label="Cement Plants" icon={<FactoryIcon />} isActive={activeSection === 'cement_plants'} onClick={setActiveSection} />
                    <SidebarItem id="distribution_hubs" label="Distribution Hubs" icon={<MapPinIcon />} isActive={activeSection === 'distribution_hubs'} onClick={setActiveSection} />
                    <SidebarItem id="rmc_units" label="RMC Units" icon={<HomeIcon />} isActive={activeSection === 'rmc_units'} onClick={setActiveSection} />
                    <SidebarItem id="transport_modes" label="Transport Modes" icon={<TruckIcon />} isActive={activeSection === 'transport_modes'} onClick={setActiveSection} />

                    <div className="px-4 pt-6 pb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Scenario Customization</div>
                    <SidebarItem id="logistics_intel" label="Logistics Intelligence" icon={<GlobeIcon />} isActive={activeSection === 'logistics_intel'} onClick={setActiveSection} />
                    <SidebarItem id="cost_intel" label="Cost Intelligence" icon={<CalculatorIcon />} isActive={activeSection === 'cost_intel'} onClick={setActiveSection} />
                    <SidebarItem id="esg_compliance" label="ESG & Compliance" icon={<ShieldIcon />} isActive={activeSection === 'esg_compliance'} onClick={setActiveSection} />
                    <SidebarItem id="planning_forecasting" label="Planning & Forecasting" icon={<ChartIcon />} isActive={activeSection === 'planning_forecasting'} onClick={setActiveSection} />

                    <div className="px-4 pt-6 pb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reports &amp; Audit Compliance</div>
                    <SidebarItem id="report" label="Report" icon={<DocumentTextIcon />} isActive={activeSection === 'report'} onClick={setActiveSection} />
                    <SidebarItem id="audit_compliance" label="Audit & Compliance" icon={<ShieldIcon />} isActive={activeSection === 'audit_compliance'} onClick={setActiveSection} />
                </nav>
            </aside>

            <main className="flex-1 h-full overflow-hidden bg-transparent">
                <div className="h-full w-full p-8 overflow-y-auto">{renderContent()}</div>
            </main>
        </div>
    );
};

export default SystemDataPage;
