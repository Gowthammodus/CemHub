
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Scenario } from '../types';
import ComparisonChart from './ComparisonChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

interface BottomPanelProps {
  scenario: Scenario;
  isOpen: boolean;
  onToggle: () => void;
}

type Tab = 'logistics' | 'cost' | 'esg' | 'planning';

const TabButton: React.FC<{active: boolean, onClick: () => void, children: React.ReactNode}> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold border-b-4 transition-colors whitespace-nowrap ${
            active 
            ? 'border-[#003A8F] text-[#0B1F3B]' 
            : 'border-transparent text-[#6B7280] hover:text-[#0B1F3B]'
        }`}
    >
        {children}
    </button>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const ChevronUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
);

const ArrowsPointingOutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
);

const ArrowsPointingInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
    </svg>
);

const InfoCard: React.FC<{
    title: string, 
    value: string, 
    subtitle?: string, 
    colorClass?: string
}> = ({title, value, subtitle, colorClass = "text-[#1A1A1A]"}) => (
    <div className="bg-[#F4F6F8] border border-[#E5E7EB] p-3 rounded-lg flex-1 text-center flex flex-col justify-between">
        <div>
            <p className="text-xs text-[#6B7280] uppercase tracking-wider">{title}</p>
            <p className={`text-xl sm:text-2xl font-bold my-1 ${colorClass}`}>{value}</p>
            {subtitle && <p className="text-xs sm:text-sm text-[#6B7280]">{subtitle}</p>}
        </div>
    </div>
);

// --- Sub-Views ---

const LogisticsOperationsView: React.FC<{ 
    scenario: Scenario;
    simulatedRailShare: number;
    setSimulatedRailShare: (val: number) => void;
}> = ({ scenario, simulatedRailShare, setSimulatedRailShare }) => {
    const { btap, bcfc, others } = scenario.comparisonData;

    // Generate a consistent seed from scenario ID to create deterministic but varied "live" data
    const seed = useMemo(() => scenario.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0), [scenario.id]);

    // Feature 1: End-to-End Visibility Data (Dynamic)
    const e2eSteps = useMemo(() => {
        // Dynamically find plant and hub from the scenario routes/sites
        const plantRoute = scenario.routes.find(r => scenario.sites.find(s => s.id === r.from)?.type === 'Cement Plant');
        const plantName = plantRoute ? scenario.sites.find(s => s.id === plantRoute.from)?.name.split(' ')[0] : 'Plant';
        
        const hubRoute = scenario.routes.find(r => scenario.sites.find(s => s.id === r.to)?.type === 'Distribution Point');
        const hubName = hubRoute ? scenario.sites.find(s => s.id === hubRoute.to)?.name.split(' ')[0] : 'Hub';
        
        // Vary status based on seed
        const statuses = ['On Track', 'Active', 'Scheduled', 'Pending', 'Planned', 'Delayed'];
        const getStatus = (offset: number) => statuses[(seed + offset) % statuses.length];

        return [
            { label: 'Raw Material', status: getStatus(0), time: 'T-Minus 48h' },
            { label: `Production (${plantName})`, status: getStatus(1), time: 'In Progress' },
            { label: 'Outbound Dispatch', status: getStatus(2), time: 'ETA 14:00' },
            { label: `Hub Arrival (${hubName})`, status: getStatus(3), time: 'Tomorrow' },
            { label: 'Last Mile', status: getStatus(4), time: 'Next Day' }
        ];
    }, [scenario, seed]);

    // Feature 2: Source-to-Plant Tracking (Dynamic based on routes)
    const activeShipments = useMemo(() => {
        // Only use routes that actually exist in this scenario
        const relevantRoutes = scenario.routes.slice(0, 5); 
        return relevantRoutes.map((route, index) => {
            const origin = scenario.sites.find(s => s.id === route.from)?.name || route.from;
            const dest = scenario.sites.find(s => s.id === route.to)?.name || route.to;
            const mode = route.mode;
            
            const statusOptions = ['In Transit', 'Delayed', 'On Time', 'Scheduled'];
            const status = statusOptions[(seed + index) % statusOptions.length];
            const etaHours = (seed + index * 5) % 24;
            
            return {
                id: `SHP-${1000 + index + (seed % 100)}`,
                origin: origin.split(',')[0], // Shorten name for UI
                dest: dest.split(',')[0],
                mode: mode,
                status: status,
                eta: `${etaHours}h ${((seed * index) % 60)}m`
            };
        });
    }, [scenario, seed]);

    // Feature 6: Corridor Analysis (Dynamic)
    const corridorInfo = useMemo(() => {
        // Find the main rail leg or the first leg to analyze
        const mainRoute = scenario.routes.find(r => r.mode.includes('Rail')) || scenario.routes[0];
        if (!mainRoute) return { name: 'N/A', congestion: 'N/A', speed: '0 km/h', alert: 'No Data' };

        const from = scenario.sites.find(s => s.id === mainRoute.from)?.name.split(' ')[0];
        const to = scenario.sites.find(s => s.id === mainRoute.to)?.name.split(' ')[0];
        
        const congestionLevels = ['Low', 'Moderate', 'High', 'Severe'];
        const congestion = congestionLevels[seed % congestionLevels.length];
        const speed = 40 + (seed % 30); // 40-70 km/h range

        return {
            name: `${from} ➜ ${to}`,
            congestion,
            speed: `${speed} km/h`,
            alert: congestion === 'High' || congestion === 'Severe' 
                ? `Congestion detected near ${to}. Expect delays.` 
                : `Corridor ${from}-${to} operating normally.`
        };
    }, [scenario, seed]);

    // Feature 5: Backhaul (Dynamic)
    const backhaulInfo = useMemo(() => {
        // Dynamically identify the hub or destination
        const hubRoute = scenario.routes.find(r => scenario.sites.find(s => s.id === r.to)?.type === 'Distribution Point');
        const locationSite = hubRoute ? scenario.sites.find(s => s.id === hubRoute.to) : scenario.sites[0];
        const location = locationSite?.name || 'Destination';
        
        const materials = ['Fly Ash', 'Gypsum', 'Slag'];
        const material = materials[seed % materials.length];
        const savings = 1.5 + (seed % 20) / 10; // 1.5 - 3.5 L

        return {
            location,
            material,
            savings: `₹${savings.toFixed(2)} Lakhs`,
            matchProb: `${70 + (seed % 25)}%`
        };
    }, [scenario, seed]);

    // Feature 4: Simulation
    const simulationImpact = useMemo(() => {
        // Simulate impact relative to the current scenario's data
        // Assume baseline is roughly 40% rail for mixed scenarios
        const improvementFactor = (simulatedRailShare - 40) / 60; 
        
        const costIndex = 100 - (improvementFactor * 15); // Base 100
        const co2Saved = Math.max(0, (simulatedRailShare - 30) * 0.8).toFixed(1);

        return { costIndex: costIndex.toFixed(1), co2Saved };
    }, [simulatedRailShare, btap, bcfc]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Feature 1: End-to-End Logistics Visibility */}
                <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm lg:col-span-2">
                    <h4 className="font-bold text-[#0B1F3B] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>
                        End-to-End Supply Chain: {scenario.title}
                    </h4>
                    <div className="flex items-start justify-between relative overflow-x-auto pb-2">
                        {/* Dotted Line */}
                        <div className="absolute top-2 left-0 w-full border-t-2 border-dotted border-gray-400 -z-10 hidden md:block"></div>
                        
                        {e2eSteps.map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center bg-white px-2 min-w-[80px] text-center z-0">
                                <div className={`w-4 h-4 rounded-full border-2 mb-2 ${step.status === 'Active' ? 'bg-[#003A8F] border-[#003A8F] animate-pulse' : step.status === 'Delayed' ? 'bg-[#C62828] border-[#C62828]' : 'bg-[#2E7D32] border-[#2E7D32]'}`}></div>
                                <span className="text-xs font-bold text-[#1A1A1A] leading-tight">{step.label}</span>
                                <span className="text-[10px] text-[#6B7280]">{step.status} • {step.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feature 6: Corridor-based Planning & Analysis */}
                <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm">
                    <h4 className="font-bold text-[#0B1F3B] mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                        Corridor Analysis
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[#6B7280]">Route:</span>
                            <span className="font-semibold text-[#1A1A1A] truncate max-w-[150px]" title={corridorInfo.name}>{corridorInfo.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[#6B7280]">Congestion:</span>
                            <span className={`font-bold ${corridorInfo.congestion === 'High' || corridorInfo.congestion === 'Severe' ? 'text-[#C62828]' : 'text-[#F9A825]'}`}>{corridorInfo.congestion}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[#6B7280]">Avg Speed:</span>
                            <span className="font-bold text-[#003A8F]">{corridorInfo.speed}</span>
                        </div>
                        <div className={`text-xs p-2 rounded border mt-2 ${corridorInfo.congestion === 'High' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-yellow-50 text-yellow-800 border-yellow-200'}`}>
                            <strong>Alert:</strong> {corridorInfo.alert}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature 2: Source-to-Plant Tracking (Dynamic based on routes) */}
                <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm">
                    <h4 className="font-bold text-[#0B1F3B] mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 0 1 3.375-3.375h9.75a3.375 3.375 0 0 1 3.375 3.375v1.875" /></svg>
                        Live Shipment Tracking
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-[#6B7280] uppercase bg-[#F4F6F8]">
                                <tr>
                                    <th className="px-3 py-2">ID</th>
                                    <th className="px-3 py-2">Route</th>
                                    <th className="px-3 py-2">Mode</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">ETA</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB]">
                                {activeShipments.map(shp => (
                                    <tr key={shp.id}>
                                        <td className="px-3 py-2 font-medium text-[#003A8F]">{shp.id}</td>
                                        <td className="px-3 py-2 text-[#6B7280] truncate max-w-[120px]" title={`${shp.origin} -> ${shp.dest}`}>{shp.origin} ➜ {shp.dest}</td>
                                        <td className="px-3 py-2 text-[#6B7280]">{shp.mode.replace('Rail (', '').replace(')', '')}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${shp.status === 'Delayed' ? 'bg-red-100 text-[#C62828]' : shp.status === 'On Time' ? 'bg-green-100 text-[#2E7D32]' : 'bg-blue-100 text-[#003A8F]'}`}>
                                                {shp.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-[#1A1A1A] font-mono text-xs">{shp.eta}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Feature 3: Mode Comparison (BTAP vs BCFC vs Road) */}
                <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm">
                    <h4 className="font-bold text-[#0B1F3B] mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                        Mode Comparison
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="p-2 bg-blue-50 rounded border border-blue-100">
                            <div className="font-bold text-[#003A8F]">BTAP</div>
                            <div className="text-xs text-[#6B7280]">Cost: ₹{btap.costPerTonKm}</div>
                            <div className="text-xs text-[#6B7280]">CO₂: {btap.co2PerTon}</div>
                            <div className="mt-1 text-[#2E7D32] font-bold text-xs">Best Value</div>
                        </div>
                        <div className="p-2 bg-orange-50 rounded border border-orange-100">
                            <div className="font-bold text-[#F9A825]">BCFC</div>
                            <div className="text-xs text-[#6B7280]">Cost: ₹{bcfc.costPerTonKm}</div>
                            <div className="text-xs text-[#6B7280]">CO₂: {bcfc.co2PerTon}</div>
                        </div>
                        <div className="p-2 bg-[#F4F6F8] rounded border border-[#E5E7EB]">
                            <div className="font-bold text-[#1A1A1A]">Road</div>
                            <div className="text-xs text-[#6B7280]">Cost: ₹{others.costPerTonKm}</div>
                            <div className="text-xs text-[#6B7280]">CO₂: {others.co2PerTon}</div>
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-[#6B7280] text-center bg-[#F4F6F8] p-2 rounded">
                        Switching to BTAP in this scenario yields <strong>{((others.costPerTonKm - btap.costPerTonKm)/others.costPerTonKm * 100).toFixed(0)}%</strong> efficiency gain.
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature 4: Route-level Optimization & Simulation */}
                <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm">
                    <h4 className="font-bold text-[#0B1F3B] mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                        Optimization Simulator
                    </h4>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Rail Share Allocation (%)</label>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={simulatedRailShare} 
                            onChange={(e) => setSimulatedRailShare(Number(e.target.value))} 
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#003A8F]"
                        />
                        <div className="flex justify-between text-xs text-[#6B7280] mt-1">
                            <span>0% (All Road)</span>
                            <span className="font-bold text-[#003A8F]">{simulatedRailShare}% Rail</span>
                            <span>100% (All Rail)</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-[#F4F6F8] p-3 rounded text-center">
                        <div>
                            <p className="text-xs text-[#6B7280]">Projected Cost Index</p>
                            <p className="text-lg font-bold text-[#2E7D32]">{simulationImpact.costIndex}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#6B7280]">Est. CO₂ Reduction</p>
                            <p className="text-lg font-bold text-[#00AEEF]">{simulationImpact.co2Saved}%</p>
                        </div>
                    </div>
                </div>

                {/* Feature 5: Backhaul Opportunity Identification */}
                <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm">
                    <h4 className="font-bold text-[#0B1F3B] mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Backhaul Opportunities
                    </h4>
                    <div className="bg-green-50 border-l-4 border-[#2E7D32] p-3 mb-2">
                        <h5 className="font-bold text-green-800 text-sm">Return Load Available</h5>
                        <p className="text-xs text-[#6B7280] mt-1">Return opportunity detected from <strong>{backhaulInfo.location}</strong>.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                        <div className="flex justify-between border-b pb-1">
                            <span className="text-[#6B7280]">Material:</span>
                            <span className="font-medium">{backhaulInfo.material}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                            <span className="text-[#6B7280]">Volume:</span>
                            <span className="font-medium">2,500 MT/week</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                            <span className="text-[#6B7280]">Empty Run Savings:</span>
                            <span className="font-bold text-[#2E7D32]">{backhaulInfo.savings}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                            <span className="text-[#6B7280]">Match Probability:</span>
                            <span className="font-bold text-[#003A8F]">{backhaulInfo.matchProb}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CostIntelligenceView: React.FC<{ 
    scenario: Scenario; 
    tonnage: number; 
    setTonnage: (t: number) => void;
    fuelPrice: number;
    setFuelPrice: (p: number) => void;
    delayHours: number;
    setDelayHours: (h: number) => void;
    baseFuelPrice: number;
}> = ({ scenario, tonnage, setTonnage, fuelPrice, setFuelPrice, delayHours, setDelayHours, baseFuelPrice }) => {
    const { comparisonData } = scenario;
    const { btap, bcfc, others } = comparisonData;
    
    // Calculate Dynamic Costs
    const derivedCosts = useMemo(() => {
        // Base Rates
        const baseRatePerTonKm = btap.costPerTonKm;
        const distance = 1100; // Approx distance for scenario
        
        // Simulation Factors
        const fuelDeltaPercent = (fuelPrice - baseFuelPrice) / baseFuelPrice;
        const fuelImpactFactor = 1 + (fuelDeltaPercent * 0.35);
        
        // Delay Cost: Assume demurrage/detention is approx ₹500 per ton per 24h delay (simplified)
        const delayCostPerTon = (delayHours / 24) * 50; 

        // Total Logistics Cost
        const logisticsCostPerTon = (baseRatePerTonKm * distance * fuelImpactFactor) + delayCostPerTon;
        const logisticsCostPerTonKm = logisticsCostPerTon / distance;
        
        // Landed Cost (Material + Logistics + Overhead)
        const materialCostPerTon = 5000;
        const overheadPerTon = 500;
        const totalLandedCostPerTon = materialCostPerTon + logisticsCostPerTon + overheadPerTon;
        
        return {
            logisticsPerTonKm: logisticsCostPerTonKm.toFixed(2),
            landedPerKg: (totalLandedCostPerTon / 1000).toFixed(2),
            totalLogisticsCost: logisticsCostPerTon * tonnage,
            fuelImpactVal: (baseRatePerTonKm * distance * (fuelImpactFactor - 1) * tonnage),
            delayImpactVal: (delayCostPerTon * tonnage)
        };
    }, [btap.costPerTonKm, fuelPrice, delayHours, tonnage, baseFuelPrice]);

    // Feature 4: Least-cost route and mode recommendations
    const recommendation = useMemo(() => {
        const fuelDeltaPercent = (fuelPrice - baseFuelPrice) / baseFuelPrice;
        
        // Apply different sensitivities for each mode
        const railImpact = 1 + (fuelDeltaPercent * 0.20); // Rail is efficient
        const roadImpact = 1 + (fuelDeltaPercent * 0.50); // Road is diesel-heavy

        const costs = [
            { mode: 'BTAP Rail', cost: btap.costPerTonKm * railImpact, type: 'Rail' },
            { mode: 'BCFC Rail', cost: bcfc.costPerTonKm * railImpact, type: 'Rail' },
            { mode: 'Road', cost: others.costPerTonKm * roadImpact, type: 'Road' }
        ];
        
        const winner = costs.reduce((prev, curr) => prev.cost < curr.cost ? prev : curr);
        const loser = costs.reduce((prev, curr) => prev.cost > curr.cost ? prev : curr);
        
        const savingsVsMax = ((loser.cost - winner.cost) / loser.cost) * 100;
        
        // Derive a simple route description based on the active routes in the scenario
        const plantToHubRoute = scenario.routes.find(r => {
             const fromSite = scenario.sites.find(s => s.id === r.from);
             const toSite = scenario.sites.find(s => s.id === r.to);
             return fromSite?.type === 'Cement Plant' && toSite?.type === 'Distribution Point';
        });

        // Fallback to the second route if structured strictly, or just the first route available
        const activeRoute = plantToHubRoute || scenario.routes[scenario.routes.length - 2] || scenario.routes[0];
        
        const originName = scenario.sites.find(s => s.id === activeRoute?.from)?.name.replace(' Cement Plant', '').replace(' Plant', '') || 'Origin';
        const destName = scenario.sites.find(s => s.id === activeRoute?.to)?.name.replace(' Distribution Hub', '').replace(' Distribution Point', '') || 'Dest';
        
        const routeDesc = `${originName} ➜ ${destName}`;

        return {
            winner: winner.mode,
            type: winner.type,
            savings: savingsVsMax.toFixed(0),
            route: routeDesc
        };
    }, [btap, bcfc, others, fuelPrice, baseFuelPrice, scenario]);

    // Feature 6: AI Insights (Dynamic based on Simulation)
    const aiInsight = useMemo(() => {
        if (fuelPrice > 110) return `Fuel prices have spiked to ₹${fuelPrice}/L. Road transport costs are escalating rapidly. Shift urgent volume to BTAP Rail immediately to maintain margins.`;
        if (delayHours > 12) return `Significant delays of ${delayHours} hours projected. Demurrage costs are eating into savings. Consider diverting critical volume to Road to bypass rail congestion despite higher freight.`;
        return `Current route optimization suggests maximizing ${recommendation.winner} usage on the ${recommendation.route} corridor to capture ${recommendation.savings}% savings compared to alternative modes.`;
    }, [fuelPrice, delayHours, recommendation]);

    // Feature 2: Real-time logistics cost benchmarking Chart Data
    const benchmarkData = [
        { name: 'BTAP', value: btap.costPerTonKm },
        { name: 'BCFC', value: bcfc.costPerTonKm },
        { name: 'Road', value: others.costPerTonKm },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0B1F3B] text-white p-4 rounded-lg shadow-sm flex flex-col justify-between">
                    <span className="text-xs uppercase opacity-75">Logistics Cost</span>
                    <div>
                        <span className="text-2xl font-bold">₹{derivedCosts.logisticsPerTonKm}</span>
                        <span className="text-sm ml-1 opacity-75">/ ton-km</span>
                    </div>
                </div>
                <div className="bg-[#2E7D32] text-white p-4 rounded-lg shadow-sm flex flex-col justify-between">
                    <span className="text-xs uppercase opacity-75">Total Landed Cost</span>
                    <div>
                        <span className="text-2xl font-bold">₹{derivedCosts.landedPerKg}</span>
                        <span className="text-sm ml-1 opacity-75">/ kg</span>
                    </div>
                </div>
                <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 flex flex-col justify-between">
                    <div className="flex items-start">
                        <div className="bg-[#003A8F]/10 p-2 rounded-full mr-3 text-[#003A8F] mt-1">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[#0B1F3B] uppercase tracking-wide mb-1">Least-Cost Route & Mode</h4>
                            <div className="text-[#003A8F] font-semibold text-lg leading-tight">
                                {recommendation.route} <span className="text-gray-400 mx-1">•</span> {recommendation.winner}
                            </div>
                            <p className="text-xs text-[#6B7280] mt-1">
                                {recommendation.winner} is currently <strong className="bg-white border border-gray-200 px-1 rounded">{recommendation.savings}% cheaper</strong> than the most expensive option based on current fuel prices (₹{fuelPrice}).
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm">
                    <h4 className="font-bold text-[#0B1F3B] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 6a7.5 7.5 0 1 07.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
                        What-If Simulation
                    </h4>
                    <div className="space-y-5">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label className="text-[#6B7280]">Volume (Tonnage)</label>
                                <span className="font-bold text-[#003A8F]">{tonnage.toLocaleString()} T</span>
                            </div>
                            <input type="range" min="1000" max="20000" step="100" value={tonnage} onChange={(e) => setTonnage(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#003A8F]" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label className="text-[#6B7280]">Fuel Price (Diesel)</label>
                                <span className="font-bold text-[#F9A825]">₹{fuelPrice} / L</span>
                            </div>
                            <input type="range" min="80" max="150" step="1" value={fuelPrice} onChange={(e) => setFuelPrice(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F9A825]" />
                            <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
                                <span>₹80</span>
                                <span>Current: ₹{baseFuelPrice}</span>
                                <span>₹150</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label className="text-[#6B7280]">Unexpected Delay</label>
                                <span className="font-bold text-[#C62828]">{delayHours} Hours</span>
                            </div>
                            <input type="range" min="0" max="48" step="4" value={delayHours} onChange={(e) => setDelayHours(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C62828]" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col">
                    <h4 className="font-bold text-[#0B1F3B] mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#003A8F]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Cost Benchmarking (₹/ton-km)
                    </h4>
                    <div className="flex-grow min-h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={benchmarkData} margin={{top: 10, right: 30, left: 0, bottom: 0}} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 12}} />
                                <YAxis hide />
                                <Tooltip cursor={{fill: 'transparent'}} formatter={(val:number) => `₹${val.toFixed(2)}`} />
                                <Bar dataKey="value">
                                    {benchmarkData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#2E7D32' : index === 1 ? '#F9A825' : '#9ca3af'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm">
                    <h4 className="font-bold text-[#0B1F3B] mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#C62828]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        Impact Analysis
                    </h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-[#F4F6F8] rounded">
                            <span className="text-sm text-[#6B7280]">Base Freight Cost</span>
                            <span className="font-semibold text-[#1A1A1A]">₹{((btap.costPerTonKm * 1100 * tonnage)/100000).toFixed(2)} Lakhs</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-amber-50 rounded border border-amber-100">
                            <span className="text-sm text-amber-800">Fuel Surcharge Impact</span>
                            <span className="font-bold text-[#F9A825]">{derivedCosts.fuelImpactVal > 0 ? '+' : ''} ₹{(derivedCosts.fuelImpactVal/100000).toFixed(2)} Lakhs</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-100">
                            <span className="text-sm text-red-800">Delay / Demurrage Cost</span>
                            <span className="font-bold text-[#C62828]">+ ₹{(derivedCosts.delayImpactVal/100000).toFixed(2)} Lakhs</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-t-2 border-[#003A8F]">
                            <span className="text-sm font-bold text-[#003A8F]">Total Projected Cost</span>
                            <span className="font-bold text-[#003A8F] text-lg">₹{(derivedCosts.totalLogisticsCost/100000).toFixed(2)} Lakhs</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col">
                    <h4 className="font-bold text-[#0B1F3B] mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#2E7D32]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        AI Cost Insights
                    </h4>
                    <div className="flex-grow bg-blue-50/50 p-4 rounded border border-blue-100 text-sm leading-relaxed text-[#6B7280] relative">
                        <span className="absolute top-2 left-2 text-4xl text-blue-200 opacity-50 select-none">“</span>
                        <p className="relative z-10 italic">
                            {aiInsight}
                        </p>
                        <div className="mt-4 flex gap-2">
                            <span className="bg-white border border-[#E5E7EB] px-2 py-1 rounded text-xs font-semibold text-[#6B7280]">#Optimization</span>
                            <span className="bg-white border border-[#E5E7EB] px-2 py-1 rounded text-xs font-semibold text-[#6B7280]">#LogisticsAI</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EsgComplianceView: React.FC<{ scenario: Scenario, tonnage: number }> = ({ scenario, tonnage }) => {
    const { btap, bcfc, others } = scenario.comparisonData;
    const distance = 1100; // Est. avg distance for these scenarios
    
    const seed = useMemo(() => scenario.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0), [scenario.id]);

    // Feature 1: Shipment-level CO2 calculation with scenario variance
    const esgCalculations = useMemo(() => {
        const variance = (seed % 20) / 100; // 0.00 - 0.19
        const factor = 1 + (variance * (seed % 2 === 0 ? 1 : -1));

        const roadCo2PerTon = others.co2PerTon * factor;
        const btapCo2PerTon = btap.co2PerTon * factor;
        const bcfcCo2PerTon = bcfc.co2PerTon * factor;
        
        const totalRoadEmissions = (tonnage * roadCo2PerTon); // kg
        const totalRailEmissions = (tonnage * btapCo2PerTon); // kg
        const savingsKg = totalRoadEmissions - totalRailEmissions;
        
        const dieselSaved = savingsKg / 2.68;

        const potentialCredits = savingsKg / 1000;
        const creditValue = potentialCredits * 1500; // Assuming ₹1500 per credit

        const isEligibleForSubsidy = distance > 500 && tonnage > 2000;

        return {
            totalEmissionsTons: (totalRailEmissions / 1000).toFixed(1),
            savingsTons: (savingsKg / 1000).toFixed(1),
            dieselSavedLitres: Math.round(dieselSaved).toLocaleString(),
            potentialCredits: potentialCredits.toFixed(1),
            creditValue: Math.round(creditValue).toLocaleString('en-IN'),
            subsidy: isEligibleForSubsidy ? 'Eligible (SFTO/LWIS)' : 'Not Eligible',
            btapCo2Val: btapCo2PerTon,
            bcfcCo2Val: bcfcCo2PerTon,
            roadCo2Val: roadCo2PerTon
        };
    }, [btap, bcfc, others, tonnage, distance, seed]);

    const handleExport = () => {
        alert("Downloading ESG Compliance Report for " + scenario.title + "...");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#0B1F3B]">Environmental Impact Dashboard</h3>
                <button onClick={handleExport} className="flex items-center gap-2 bg-white border border-[#2E7D32] text-[#2E7D32] px-3 py-1.5 rounded hover:bg-green-50 transition-colors text-sm font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                    Export Compliance Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex flex-col justify-between">
                    <div>
                        <p className="text-xs text-green-800 uppercase font-semibold mb-1">Scenario Emissions</p>
                        <h4 className="text-3xl font-bold text-green-900">{esgCalculations.totalEmissionsTons} <span className="text-sm font-normal text-green-700">T CO₂</span></h4>
                    </div>
                    <div className="mt-4 pt-3 border-t border-green-200">
                        <p className="text-xs text-green-800">Avoided vs Road: <span className="font-bold">-{esgCalculations.savingsTons} Tons</span></p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex flex-col justify-between">
                    <div>
                        <p className="text-xs text-blue-800 uppercase font-semibold mb-1">Diesel Offset</p>
                        <h4 className="text-3xl font-bold text-blue-900">{esgCalculations.dieselSavedLitres} <span className="text-sm font-normal text-blue-700">Liters</span></h4>
                    </div>
                    <div className="mt-4 pt-3 border-t border-blue-200">
                        <div className="flex items-center gap-1 text-xs text-blue-800">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 001.075.676L10 15.082l5.925 2.844A.75.75 0 0017 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0010 2z" clipRule="evenodd" /></svg>
                            <span>Equivalent to {Math.round(parseInt(esgCalculations.dieselSavedLitres.replace(/,/g, '')) / 50).toLocaleString()} truck fills</span>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex flex-col justify-between">
                    <div>
                        <p className="text-xs text-yellow-800 uppercase font-semibold mb-1">Carbon Credits</p>
                        <h4 className="text-3xl font-bold text-yellow-900">₹{esgCalculations.creditValue}</h4>
                    </div>
                    <div className="mt-4 pt-3 border-t border-yellow-200">
                        <div className="flex justify-between items-center text-xs text-yellow-800">
                            <span>Eligible Credits:</span>
                            <span className="font-bold">{esgCalculations.potentialCredits} Units</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                    <h4 className="text-sm font-bold text-[#0B1F3B] mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#6B7280]"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
                        Impact Comparison Matrix
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-[#F4F6F8] text-[#6B7280] uppercase">
                                <tr>
                                    <th className="p-2">Metric</th>
                                    <th className="p-2 text-[#2E7D32] font-bold">BTAP</th>
                                    <th className="p-2 text-[#F9A825] font-bold">BCFC</th>
                                    <th className="p-2 text-[#6B7280]">Road</th>
                                    <th className="p-2 text-[#6B7280]">Savings %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB]">
                                <tr>
                                    <td className="p-2 font-medium">CO₂ Intensity (g/t-km)</td>
                                    <td className="p-2">{esgCalculations.btapCo2Val * 1000 / distance < 1 ? (esgCalculations.btapCo2Val * 1000 / distance).toFixed(1) : (esgCalculations.btapCo2Val).toFixed(1)}</td>
                                    <td className="p-2">{esgCalculations.bcfcCo2Val * 1000 / distance < 1 ? (esgCalculations.bcfcCo2Val * 1000 / distance).toFixed(1) : (esgCalculations.bcfcCo2Val).toFixed(1)}</td>
                                    <td className="p-2">{(esgCalculations.roadCo2Val).toFixed(1)}</td>
                                    <td className="p-2 text-[#2E7D32] font-bold">~{(100 - (esgCalculations.btapCo2Val/esgCalculations.roadCo2Val * 100)).toFixed(0)}%</td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-medium">NOx Emissions</td>
                                    <td className="p-2">Low</td>
                                    <td className="p-2">Medium</td>
                                    <td className="p-2">High</td>
                                    <td className="p-2 text-[#2E7D32]">-85%</td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-medium">Accident Risk</td>
                                    <td className="p-2">Very Low</td>
                                    <td className="p-2">Low</td>
                                    <td className="p-2">Moderate</td>
                                    <td className="p-2 text-[#2E7D32]">-95%</td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-medium">Noise Pollution</td>
                                    <td className="p-2">Low</td>
                                    <td className="p-2">Medium</td>
                                    <td className="p-2">High</td>
                                    <td className="p-2 text-[#2E7D32]">-40%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col">
                    <h4 className="text-sm font-bold text-[#0B1F3B] mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#6B7280]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        Subsidy & Schemes
                    </h4>
                    <div className="flex-grow space-y-3">
                        <div className={`p-3 rounded border ${esgCalculations.subsidy.includes('Eligible') ? 'bg-green-50 border-green-200' : 'bg-[#F4F6F8] border-[#E5E7EB]'}`}>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-sm text-[#1A1A1A]">SFTO / LWIS Scheme</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${esgCalculations.subsidy.includes('Eligible') ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-[#6B7280]'}`}>{esgCalculations.subsidy.includes('Eligible') ? 'Active' : 'Inactive'}</span>
                            </div>
                            <p className="text-xs text-[#6B7280] mt-1">Rebate on freight for using high-capacity wagons like BTAP/BCFC.</p>
                        </div>
                        <div className="p-3 rounded border bg-[#F4F6F8] border-[#E5E7EB]">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-sm text-[#1A1A1A]">Green Logistics Incentive</span>
                                <span className="text-xs px-2 py-1 rounded-full font-bold bg-gray-200 text-[#6B7280]">Pending</span>
                            </div>
                            <p className="text-xs text-[#6B7280] mt-1">Government grant for reducing carbon footprint by {'>'}30%.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlanningForecastingView: React.FC<{ scenario: Scenario, tonnage: number, setTonnage: (t: number) => void }> = ({ scenario, tonnage, setTonnage }) => {
    
    const seed = useMemo(() => scenario.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0), [scenario.id]);

    const demandForecastData = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const baseDailyDemand = tonnage / 7; 
        
        return days.map((day, index) => {
            const variation = (Math.sin(seed + index) * 0.3) + 1; // 0.7 to 1.3
            const demand = Math.round(baseDailyDemand * variation);
            const supply = Math.round(baseDailyDemand * 1.05); // Supply slightly higher than avg
            return { name: day, Demand: demand, Supply: supply };
        });
    }, [tonnage, seed]);

    const balanceMetrics = useMemo(() => {
        const totalDemand = demandForecastData.reduce((acc, d) => acc + d.Demand, 0);
        const totalSupply = demandForecastData.reduce((acc, d) => acc + d.Supply, 0);
        const gap = totalSupply - totalDemand;
        const status = gap < 0 ? 'Deficit' : 'Surplus';
        return { totalDemand, totalSupply, gap, status };
    }, [demandForecastData]);

    const siloLevels = useMemo(() => {
        const materials = ['Cement', 'Fly Ash', 'Clinker'];
        return materials.map((mat, index) => {
            const fill = 20 + ((seed * (index + 1)) % 75);
            let status = 'Good';
            if (fill < 25) status = 'Critical Low';
            if (fill > 85) status = 'Overflow Risk';
            return { material: mat, fill, status };
        });
    }, [seed]);

    const allocationSuggestions = useMemo(() => {
        const neighboringPlants = ['Nagpur Unit 2', 'Bhilai Grinding', 'Raipur East'];
        return neighboringPlants.map((plant, index) => ({
            from: plant,
            material: index === 0 ? 'Clinker' : 'Fly Ash',
            qty: 500 + ((seed + index) % 10) * 100,
            eta: `${(index * 4) + 12} hrs`
        }));
    }, [seed]);

    const aiReroutingMsg = useMemo(() => {
        const routes = ['NH-53', 'Rail Corridor Line 4', 'Coastal Road'];
        const congested = routes[seed % routes.length];
        const alternative = routes[(seed + 1) % routes.length];
        return `Congestion detected on ${congested}. AI recommends re-routing 30% of truck volume via ${alternative} to avoid a projected 4h delay.`;
    }, [seed]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InfoCard title="Total Weekly Demand" value={`${balanceMetrics.totalDemand.toLocaleString()} T`} />
                <InfoCard title="Incoming Supply" value={`${balanceMetrics.totalSupply.toLocaleString()} T`} colorClass="text-[#2E7D32]" />
                <div className={`bg-white border p-3 rounded-lg flex-1 text-center flex flex-col justify-between ${balanceMetrics.gap < 0 ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-blue-50'}`}>
                    <div>
                        <p className="text-xs text-[#6B7280] uppercase tracking-wider">Net Balance</p>
                        <p className={`text-2xl font-bold my-1 ${balanceMetrics.gap < 0 ? 'text-[#C62828]' : 'text-[#003A8F]'}`}>
                            {balanceMetrics.gap > 0 ? '+' : ''}{balanceMetrics.gap.toLocaleString()} T
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${balanceMetrics.gap < 0 ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}`}>{balanceMetrics.status}</span>
                    </div>
                </div>
                <div className="bg-white border border-[#E5E7EB] p-3 rounded-lg flex flex-col justify-center">
                    <label className="text-xs font-semibold text-[#6B7280] mb-1">Adjust Plan Volume</label>
                    <input type="range" min="1000" max="50000" step="500" value={tonnage} onChange={(e) => setTonnage(Number(e.target.value))} className="w-full accent-[#003A8F] cursor-pointer" />
                    <div className="text-right text-xs font-bold text-[#003A8F]">{tonnage.toLocaleString()} T</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm">
                    <h4 className="font-bold text-[#0B1F3B] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                        Plant-wise Demand Forecast
                    </h4>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={demandForecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="Demand" stroke="#8884d8" fillOpacity={1} fill="url(#colorDemand)" />
                                <Area type="monotone" dataKey="Supply" stroke="#82ca9d" fillOpacity={1} fill="url(#colorSupply)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col">
                    <h4 className="font-bold text-[#0B1F3B] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#F9A825]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        Hub Silo Levels & Risk
                    </h4>
                    <div className="flex-grow flex items-end justify-around pb-2 gap-4">
                        {siloLevels.map((silo) => (
                            <div key={silo.material} className="flex flex-col items-center w-full">
                                <div className="text-xs font-semibold text-[#6B7280] mb-1">{silo.fill}%</div>
                                <div className="w-full max-w-[60px] bg-gray-100 rounded-t-lg relative h-40 overflow-hidden border border-[#E5E7EB]">
                                    <div 
                                        className={`absolute bottom-0 w-full transition-all duration-1000 ${
                                            silo.status === 'Critical Low' ? 'bg-[#C62828]' : 
                                            silo.status === 'Overflow Risk' ? 'bg-[#F9A825]' : 'bg-[#003A8F]'
                                        }`} 
                                        style={{ height: `${silo.fill}%` }}
                                    ></div>
                                    <div className="absolute top-[25%] w-full border-t border-gray-400/30"></div>
                                    <div className="absolute top-[50%] w-full border-t border-gray-400/30"></div>
                                    <div className="absolute top-[75%] w-full border-t border-gray-400/30"></div>
                                </div>
                                <div className="text-sm font-bold text-[#1A1A1A] mt-2">{silo.material}</div>
                                <div className={`text-[10px] mt-1 px-2 py-0.5 rounded-full font-semibold ${
                                    silo.status === 'Good' ? 'bg-green-100 text-[#2E7D32]' : 
                                    silo.status === 'Critical Low' ? 'bg-red-100 text-[#C62828]' : 'bg-orange-100 text-[#F9A825]'
                                }`}>
                                    {silo.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm">
                    <h4 className="font-bold text-[#0B1F3B] mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        Stock Transfer Suggestions
                    </h4>
                    <p className="text-xs text-[#6B7280] mb-3">Recommended internal moves to balance Hub deficits.</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#F4F6F8] text-[#6B7280] uppercase text-xs">
                                <tr>
                                    <th className="p-2">Source Plant</th>
                                    <th className="p-2">Material</th>
                                    <th className="p-2">Suggest Qty</th>
                                    <th className="p-2">ETA</th>
                                    <th className="p-2">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB]">
                                {allocationSuggestions.map((row, i) => (
                                    <tr key={i}>
                                        <td className="p-2 font-medium">{row.from}</td>
                                        <td className="p-2">{row.material}</td>
                                        <td className="p-2 font-bold text-[#003A8F]">{row.qty} T</td>
                                        <td className="p-2">{row.eta}</td>
                                        <td className="p-2"><button className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded border border-teal-200 hover:bg-teal-100">Approve</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] shadow-sm flex flex-col">
                    <h4 className="font-bold text-[#0B1F3B] mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        AI Logistics Commander
                    </h4>
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex-grow flex items-center">
                        <div className="flex gap-3">
                            <div className="bg-white p-2 rounded-full h-10 w-10 flex items-center justify-center shadow-sm text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <h5 className="font-bold text-indigo-900 text-sm">Smart Re-routing Alert</h5>
                                <p className="text-sm text-indigo-800 mt-1 leading-relaxed">
                                    {aiReroutingMsg}
                                </p>
                                <div className="mt-3 flex gap-2">
                                    <button className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded shadow hover:bg-indigo-700">Apply New Route</button>
                                    <button className="bg-white text-indigo-700 border border-indigo-200 text-xs px-3 py-1.5 rounded hover:bg-indigo-50">Ignore</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const BottomPanelContent: React.FC<{
    activeTab: Tab;
    setActiveTab: (t: Tab) => void;
    scenario: Scenario;
    tonnage: number;
    setTonnage: (t: number) => void;
    simulatedRailShare: number;
    setSimulatedRailShare: (val: number) => void;
    fuelPrice: number;
    setFuelPrice: (p: number) => void;
    delayHours: number;
    setDelayHours: (h: number) => void;
    BASE_FUEL_PRICE: number;
    isFullScreen: boolean;
    toggleFullScreen: () => void;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ 
    activeTab, setActiveTab, scenario, 
    tonnage, setTonnage, 
    simulatedRailShare, setSimulatedRailShare,
    fuelPrice, setFuelPrice,
    delayHours, setDelayHours, BASE_FUEL_PRICE,
    isFullScreen, toggleFullScreen, isOpen, onToggle 
}) => {
    return (
        <div className={`bg-white text-[#1A1A1A] flex flex-col h-full ${isFullScreen ? 'shadow-2xl' : ''}`}>
            <div className="flex justify-between items-center p-2 sm:p-3 border-b border-[#E5E7EB] flex-shrink-0 bg-white overflow-x-auto">
                <div className="flex space-x-2 sm:space-x-4">
                    <TabButton active={activeTab === 'logistics'} onClick={() => setActiveTab('logistics')}>Logistics Intelligence</TabButton>
                    <TabButton active={activeTab === 'cost'} onClick={() => setActiveTab('cost')}>Cost Intelligence</TabButton>
                    <TabButton active={activeTab === 'esg'} onClick={() => setActiveTab('esg')}>ESG & Compliance</TabButton>
                    <TabButton active={activeTab === 'planning'} onClick={() => setActiveTab('planning')}>Planning & Forecasting</TabButton>
                </div>
                <div className="flex items-center ml-2 space-x-2">
                    <button 
                        onClick={toggleFullScreen} 
                        className="p-1.5 rounded-full hover:bg-[#F4F6F8] text-[#6B7280] transition-colors"
                        title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                    >
                        {isFullScreen ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}
                    </button>
                    {!isFullScreen && (
                        <button 
                            onClick={onToggle} 
                            className="p-1.5 rounded-full hover:bg-[#F4F6F8] text-[#6B7280] transition-colors"
                            aria-label={isOpen ? "Collapse Panel" : "Expand Panel"}
                        >
                            {isOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
                        </button>
                    )}
                </div>
            </div>
            
            {(isOpen || isFullScreen) && (
                <div className="flex-grow p-3 sm:p-4 overflow-y-auto bg-transparent">
                    {activeTab === 'logistics' && <LogisticsOperationsView scenario={scenario} simulatedRailShare={simulatedRailShare} setSimulatedRailShare={setSimulatedRailShare} />}
                    {activeTab === 'cost' && <CostIntelligenceView scenario={scenario} tonnage={tonnage} setTonnage={setTonnage} fuelPrice={fuelPrice} setFuelPrice={setFuelPrice} delayHours={delayHours} setDelayHours={setDelayHours} baseFuelPrice={BASE_FUEL_PRICE} />}
                    {activeTab === 'esg' && <EsgComplianceView scenario={scenario} tonnage={tonnage} />}
                    {activeTab === 'planning' && <PlanningForecastingView scenario={scenario} tonnage={tonnage} setTonnage={setTonnage} />}
                </div>
            )}
        </div>
    );
}

const BottomPanel: React.FC<BottomPanelProps> = ({ scenario, isOpen, onToggle }) => {
    const [activeTab, setActiveTab] = useState<Tab>('logistics');
    const [tonnage, setTonnage] = useState(10000);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Lifted State to persist across view changes
    const [simulatedRailShare, setSimulatedRailShare] = useState(60);
    const BASE_FUEL_PRICE = 95;
    const [fuelPrice, setFuelPrice] = useState(BASE_FUEL_PRICE);
    const [delayHours, setDelayHours] = useState(0);

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
        if (!isFullScreen && !isOpen) {
            onToggle();
        }
    };

    const contentProps = {
        activeTab, setActiveTab, scenario,
        tonnage, setTonnage,
        simulatedRailShare, setSimulatedRailShare,
        fuelPrice, setFuelPrice,
        delayHours, setDelayHours, BASE_FUEL_PRICE,
        isFullScreen, toggleFullScreen, isOpen, onToggle
    };

    if (isFullScreen) {
        return createPortal(
            <div className="fixed inset-0 z-[9999] bg-white">
                <BottomPanelContent {...contentProps} />
            </div>,
            document.body
        );
    }

    return (
        <div className="h-full">
             <BottomPanelContent {...contentProps} />
        </div>
    );
};

export default BottomPanel;
