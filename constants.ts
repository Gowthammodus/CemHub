
import type { Site, Route, Scenario, Wagon, Shipment, HomeAlert, SupplyChainNode, CorridorItem, BackhaulOpp, DailyForecast, SiloLevel, StockTransfer } from './types';
import { SiteType, TransportMode, WagonStatus, WagonType, OwnershipType } from './types';

export const INITIAL_SITES: Site[] = [
  // Raw Materials
  { id: 'odisha_mine', name: 'Limestone Mine, Odisha', type: SiteType.RAW_MATERIAL, subType: 'Limestone', position: [20.95, 85.09], info: 'Major source of limestone.' },
  { id: 'jharkhand_mine', name: 'Fly Ash Source, Jharkhand', type: SiteType.RAW_MATERIAL, subType: 'Fly Ash', position: [23.80, 86.44], info: 'Fly ash from thermal power plants.' },
  { id: 'rajasthan_gypsum', name: 'Gypsum Quarry, Rajasthan', type: SiteType.RAW_MATERIAL, subType: 'Gypsum', position: [27.20, 73.78], info: 'Source of gypsum.' },
  { id: 'durgapur_slag', name: 'Slag Processing, Durgapur', type: SiteType.RAW_MATERIAL, subType: 'Slag', position: [23.55, 87.32], info: 'Source of granulated slag.' },
  { id: 'gujarat_alumina', name: 'Alumina Source, Gujarat', type: SiteType.RAW_MATERIAL, subType: 'Alumina', position: [22.47, 70.05], info: 'Source of bauxite for alumina production.' },
  { id: 'tamil_nadu_lignite', name: 'Lignite Mine, Tamil Nadu', type: SiteType.RAW_MATERIAL, subType: 'Coal or Lignite', position: [11.61, 79.48], info: 'Major lignite deposit.' },
  
  // Cement Plants
  { id: 'raipur_plant', name: 'Raipur Cement Plant', type: SiteType.CEMENT_PLANT, position: [21.25, 81.62], info: 'Produces ~5000 MT/day. Main supplier for West India.' },
  { id: 'bokaro_plant', name: 'Bokaro Cement Plant', type: SiteType.CEMENT_PLANT, position: [23.67, 86.15], info: 'Strategic plant in East India.' },
  { id: 'satna_plant', name: 'Satna Cement Plant', type: SiteType.CEMENT_PLANT, position: [24.58, 80.83], info: 'Key plant in Central India.' },
  { id: 'chanderia_plant', name: 'Chanderia Cement Plant', type: SiteType.CEMENT_PLANT, position: [24.96, 74.65], info: 'Large scale production facility.' },

  // Distribution Hub
  { id: 'kalamboli_hub', name: 'Kalamboli Distribution Hub', type: SiteType.DISTRIBUTION_HUB, position: [19.03, 73.12], info: 'Central silo depot for Mumbai. Equipped with pneumatic wagon unloading.' },
  
  // RMC Plants
  { id: 'mumbai_rmc_1', name: 'Mumbai RMC - Worli', type: SiteType.RMC_PLANT, position: [19.01, 72.82], info: 'Produces ~300 MT/day for South Mumbai.' },
  { id: 'mumbai_rmc_2', name: 'Mumbai RMC - Thane', type: SiteType.RMC_PLANT, position: [19.21, 72.97], info: 'Serves the Thane metropolitan region.' },
  { id: 'mumbai_rmc_3', name: 'Mumbai RMC - Navi Mumbai', type: SiteType.RMC_PLANT, position: [19.03, 73.06], info: 'Serves Navi Mumbai infrastructure projects.' }
];

export const INITIAL_ROUTES: Route[] = [
    // === Stage 1: Raw Materials -> Cement Plants ===
    { id: 'odisha_to_raipur_road', from: 'odisha_mine', to: 'raipur_plant', mode: TransportMode.ROAD, path: [[20.95, 85.09], [21.25, 81.62]] },
    { id: 'jharkhand_to_bokaro_rail', from: 'jharkhand_mine', to: 'bokaro_plant', mode: TransportMode.RAIL_BCFC, path: [[23.80, 86.44], [23.67, 86.15]] },
    { id: 'rajasthan_to_chanderia_rail', from: 'rajasthan_gypsum', to: 'chanderia_plant', mode: TransportMode.RAIL_BCFC, path: [[27.20, 73.78], [24.96, 74.65]] },
    { id: 'durgapur_to_bokaro_road', from: 'durgapur_slag', to: 'bokaro_plant', mode: TransportMode.ROAD, path: [[23.55, 87.32], [23.67, 86.15]] },
    { id: 'gujarat_to_chanderia_sea', from: 'gujarat_alumina', to: 'chanderia_plant', mode: TransportMode.SEA, path: [[22.47, 70.05], [24.5, 72.0], [24.96, 74.65]] },
    { id: 'tamil_nadu_to_satna_rail', from: 'tamil_nadu_lignite', to: 'satna_plant', mode: TransportMode.RAIL_BCFC, path: [[11.61, 79.48], [18.0, 79.0], [24.58, 80.83]] },

    // === Stage 2: Cement Plants -> Distribution Hub / RMC Units ===
    { id: 'raipur_to_kalamboli_btap', from: 'raipur_plant', to: 'kalamboli_hub', mode: TransportMode.RAIL_BTAP, path: [[21.25, 81.62], [21.14, 79.08], [19.03, 73.12]], capacity: '10,000 MT/month' },
    { id: 'raipur_to_kalamboli_bcfc', from: 'raipur_plant', to: 'kalamboli_hub', mode: TransportMode.RAIL_BCFC, path: [[21.25, 81.62], [21.14, 79.08], [19.03, 73.12]], capacity: '10,000 MT/month' },
    { id: 'bokaro_to_kalamboli_rail', from: 'bokaro_plant', to: 'kalamboli_hub', mode: TransportMode.RAIL_BCFC, path: [[23.67, 86.15], [21.14, 79.08], [19.03, 73.12]] },
    { id: 'satna_to_kalamboli_road', from: 'satna_plant', to: 'kalamboli_hub', mode: TransportMode.ROAD, path: [[24.58, 80.83], [21.14, 79.08], [19.03, 73.12]] },
    { id: 'chanderia_to_kalamboli_rail', from: 'chanderia_plant', to: 'kalamboli_hub', mode: TransportMode.RAIL_BTAP, path: [[24.96, 74.65], [22.0, 74.0], [19.03, 73.12]] },
    { id: 'raipur_to_mumbai_rmc2_direct_road', from: 'raipur_plant', to: 'mumbai_rmc_2', mode: TransportMode.ROAD, path: [[21.25, 81.62], [19.21, 72.97]] },

    // === Stage 3: Distribution Hub -> RMC Plants ===
    { id: 'kalamboli_to_rmc1_road', from: 'kalamboli_hub', to: 'mumbai_rmc_1', mode: TransportMode.ROAD, path: [[19.03, 73.12], [19.01, 72.82]] },
    { id: 'kalamboli_to_rmc2_road', from: 'kalamboli_hub', to: 'mumbai_rmc_2', mode: TransportMode.ROAD, path: [[19.03, 73.12], [19.21, 72.97]] },
    { id: 'kalamboli_to_rmc3_road', from: 'kalamboli_hub', to: 'mumbai_rmc_3', mode: TransportMode.ROAD, path: [[19.03, 73.12], [19.03, 73.06]] },
];

const DISTANCE = 1100;
const SHIPMENT_SIZE = 10000;

export const btapData = {
  name: 'BTAP Wagon',
  costPerTonKm: 1.75,
  turnaroundTime: '2-3 hours',
  unloadingCost: 'Low (Pneumatic)',
  esgScore: 8,
  fuelEfficiency: 'Higher',
  co2PerTon: 6.7,
  totalCost: 1.75 * DISTANCE * SHIPMENT_SIZE,
  totalCO2: 6.7 * SHIPMENT_SIZE / 1000,
  payload: 60,
  unloadingHoursPerWagon: 0.5,
  co2PerTonKm: 0.0061,
};

export const bcfcData = {
  name: 'BCFC Wagon',
  costPerTonKm: 2.10,
  turnaroundTime: '4-6 hours',
  unloadingCost: 'High (Manual)',
  esgScore: 6,
  fuelEfficiency: 'Lower',
  co2PerTon: 8.58,
  totalCost: 2.10 * DISTANCE * SHIPMENT_SIZE,
  totalCO2: 8.58 * SHIPMENT_SIZE / 1000,
  payload: 60,
  unloadingHoursPerWagon: 1.0,
  co2PerTonKm: 0.0078,
};

export const othersData = {
  name: 'Others',
  costPerTonKm: 2.50,
  turnaroundTime: '6-8 hours',
  unloadingCost: 'Very High (Manual, Slow)',
  esgScore: 4,
  fuelEfficiency: 'Lowest',
  co2PerTon: 10.2,
  totalCost: 2.50 * DISTANCE * SHIPMENT_SIZE,
  totalCO2: 10.2 * SHIPMENT_SIZE / 1000,
  payload: 58,
  unloadingHoursPerWagon: 1.5,
  co2PerTonKm: 0.00927,
};

const rawMaterialCost = { costL: 51.25, costPerKg: 0.51 };
const cementHubCost = { costL: 83.00, costPerKg: 0.83 };
const rmcDispatchCost = { costL: 135.00, costPerKg: 1.35 };
const esgOverheadCost = { costL: 15.00, costPerKg: 0.15 };

const generateScenarioFromPredefined = (predefined: typeof PREDEFINED_SCENARIOS_LIST[0]): Scenario => {
    const generatedRoutes: Route[] = [];
    const { plant: plantId, hub: hubId, rmc: rmcId } = predefined.path;
    const plantSite = INITIAL_SITES.find(s => s.id === plantId)!;
    const hubSite = INITIAL_SITES.find(s => s.id === hubId)!;
    const rmcSite = INITIAL_SITES.find(s => s.id === rmcId)!;

    INITIAL_SITES.filter(s => s.type === SiteType.RAW_MATERIAL).forEach(rm => {
        generatedRoutes.push({
            id: `${rm.id}_to_${plantId}_${predefined.id}`,
            from: rm.id,
            to: plantId,
            mode: TransportMode.RAIL_BCFC,
            path: [rm.position, plantSite.position]
        });
    });

    generatedRoutes.push({
        id: `${plantId}_to_${hubId}_${predefined.id}`,
        from: plantId,
        to: hubId,
        mode: TransportMode.RAIL_BTAP,
        path: [plantSite.position, hubSite.position],
        capacity: '10,000 MT/month'
    });

    generatedRoutes.push({
        id: `${hubId}_to_${rmcId}_${predefined.id}`,
        from: hubId,
        to: rmcId,
        mode: TransportMode.ROAD,
        path: [hubSite.position, rmcSite.position]
    });

    const seed = predefined.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const vary = (val: number, offset: number = 0) => {
        const localSeed = seed + offset;
        const variance = (localSeed % 25) / 100;
        const sign = localSeed % 2 === 0 ? 1 : -1;
        const factor = 1 + (sign * variance);
        return Number((val * factor).toFixed(2));
    };

    const variedBtap = { ...btapData, costPerTonKm: vary(btapData.costPerTonKm, 0) };
    variedBtap.totalCost = variedBtap.costPerTonKm * DISTANCE * SHIPMENT_SIZE;
    const variedBcfc = { ...bcfcData, costPerTonKm: vary(bcfcData.costPerTonKm, 10) };
    variedBcfc.totalCost = variedBcfc.costPerTonKm * DISTANCE * SHIPMENT_SIZE;
    const variedOthers = { ...othersData, costPerTonKm: vary(othersData.costPerTonKm, 20) };
    variedOthers.totalCost = variedOthers.costPerTonKm * DISTANCE * SHIPMENT_SIZE;
    const variedRawMaterialCost = { ...rawMaterialCost, costPerKg: vary(rawMaterialCost.costPerKg, 5), costL: vary(rawMaterialCost.costL, 5) };
    const variedHubDispatchCost = { ...rmcDispatchCost, costPerKg: vary(rmcDispatchCost.costPerKg, 15), costL: vary(rmcDispatchCost.costL, 15) };
    const variedTotalLandedCostL = variedRawMaterialCost.costL + cementHubCost.costL + variedHubDispatchCost.costL + esgOverheadCost.costL;
    const variedTotalLandedCostPerKg = variedTotalLandedCostL * 100000 / (SHIPMENT_SIZE * 1000);

    // Varied Homepage KPI Data
    const homepageKpis = {
        totalVolume: `${(10000 + (seed % 15) * 500)} Tons`,
        projectedSpend: `${(variedBtap.totalCost / 10000000).toFixed(2)} Cr`,
        potentialSavings: `${((variedBcfc.totalCost - variedBtap.totalCost) / 100000).toFixed(2)} L`,
        riskLevel: seed % 3 === 0 ? 'High' : seed % 3 === 1 ? 'Medium' : 'Low',
        riskDesc: seed % 3 === 0 ? 'Congestion at destination' : 'All systems normal',
        co2Emissions: `${(variedBtap.totalCO2).toFixed(0)} Tons`
    };

    const activeShipments: Shipment[] = [
        { id: `SHP-${1000 + (seed % 100)}`, origin: plantSite.name, dest: hubSite.name, mode: 'Rail (BTAP)', status: 'In Transit', eta: '18:00', riskScore: seed % 3 === 0 ? 'Medium' : 'Low' },
        { id: `SHP-${1001 + (seed % 100)}`, origin: 'Mining Site', dest: plantSite.name, mode: 'Rail (BCFC)', status: 'Scheduled', eta: '08:00', riskScore: 'Low' }
    ];

    const demurrageRisks: HomeAlert[] = [
        { title: `Congestion at ${hubSite.name.split(' ')[0]}`, desc: `High wagon turnaround time detected. Estimated delay: ${(seed % 5) + 1} hours.`, severity: seed % 2 === 0 ? 'Warning' : 'Info' }
    ];

    const exceptionsAndAnomalies: HomeAlert[] = [
        { title: 'Freight Variation', desc: `Secondary freight from ${hubSite.name.split(' ')[0]} trending ${(seed % 8) + 2}% higher.`, severity: 'Info' }
    ];

    const logisticsIntelligence = {
        supplyChainNodes: [
            { id: '1', node: 'Raw Material', status: 'Planned', eta: '08:00' },
            { id: '2', node: 'Production', status: 'In Progress', eta: '12:00' },
            { id: '3', node: 'Dispatch', status: 'On Track', eta: '16:00' },
        ],
        liveShipments: activeShipments,
        corridorAnalysis: [
            { id: '1', route: `${plantSite.name.split(' ')[0]} to ${hubSite.name.split(' ')[0]}`, congestion: seed % 3 === 0 ? 'High' : 'Low' as any, speed: 50 + (seed % 20), alert: 'Optimal transit conditions.' }
        ],
        modeComparison: {
            btap: { cost: `₹${variedBtap.costPerTonKm}`, co2: `${variedBtap.co2PerTon}kg`, isBest: true },
            bcfc: { cost: `₹${variedBcfc.costPerTonKm}`, co2: `${variedBcfc.co2PerTon}kg`, isBest: false },
            road: { cost: `₹${variedOthers.costPerTonKm}`, co2: `${variedOthers.co2PerTon}kg`, isBest: false }
        },
        optimizationSimulator: { railShare: 60, costIndex: 92.5, co2Reduction: 40 },
        backhaulOpportunities: [
            { id: '1', material: 'Fly Ash', volume: '2000 MT', savings: '₹2.5 Lakhs', probability: '85%' }
        ]
    };

    // Default Cost Intelligence
    const costIntelligence = {
        logisticsCost: vary(1.75, 50),
        landedCost: vary(0.83, 60),
        leastCostRoutes: [
            { id: 'LCR-1', fromId: plantId, toId: hubId, mode: 'Rail (BTAP)', comments: 'Primary optimized corridor for bulk supply.' }
        ],
        benchmarking: {
            btap: variedBtap.costPerTonKm,
            bcfc: variedBcfc.costPerTonKm,
            road: variedOthers.costPerTonKm
        }
    };

    // Initial ESG data
    const esgComplianceData = {
        scenarioEmissions: vary(320, 70),
        dieselOffset: vary(45000, 80),
        carbonCredits: vary(1250, 90),
        comparisonMatrix: [
            { id: 'em-1', name: 'CO₂ Intensity (g/t-km)', btap: vary(6.1, 100), bcfc: vary(7.8, 110), road: vary(55.0, 120) },
            { id: 'em-2', name: 'Particulate Matter (mg/km)', btap: 1.2, bcfc: 2.5, road: 15.8 },
        ],
        schemes: [
            { id: 'sc-1', header: 'SFTO / LWIS Scheme', description: 'Rebate on freight for using high-capacity wagons like BTAP/BCFC.', status: 'Active' as const },
            { id: 'sc-2', header: 'Green Logistics Incentive', description: 'Government grant for reducing carbon footprint by >30%.', status: 'Pending' as const },
        ]
    };

    // New Planning Data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const planningForecastingData = {
        weeklyDemand: vary(70000, 150),
        incomingSupply: vary(72000, 160),
        netBalance: 2000,
        dailyForecasts: days.map((day, i) => ({
            day,
            demand: vary(10000, i * 10),
            supply: vary(10500, i * 11)
        })),
        siloLevels: [
            { material: 'Cement', level: 85, risk: 'Normal' },
            { material: 'FlyAsh', level: 40, risk: 'Normal' },
            { material: 'Gypsum', level: 15, risk: 'Warning' },
            { material: 'Limestone', level: 92, risk: 'Overflow Risk' },
        ] as SiloLevel[],
        stockTransferSuggestions: [
            { id: 'ST-1', sourcePlant: 'Raipur Plant', material: 'Clinker', suggestQty: 5000, eta: '12 hrs', action: 'Approve' },
            { id: 'ST-2', sourcePlant: 'Bokaro Plant', material: 'Fly Ash', suggestQty: 2500, eta: '24 hrs', action: 'Approve' },
        ] as StockTransfer[]
    };

    return {
        id: predefined.id,
        title: predefined.name,
        description: predefined.description,
        sites: INITIAL_SITES,
        routes: generatedRoutes,
        regions: ['Mumbai Metro', 'Pan India'],
        comparisonData: { btap: variedBtap, bcfc: variedBcfc, others: variedOthers },
        costSavings: variedBcfc.totalCost - variedBtap.totalCost,
        co2Savings: bcfcData.totalCO2 - btapData.totalCO2,
        costBreakdown: {
            rawMaterialLanded: variedRawMaterialCost,
            cementLandedAtHub: cementHubCost,
            hubToRmcDispatch: variedHubDispatchCost,
            esgOverhead: esgOverheadCost,
            totalLandedCost: { costL: variedTotalLandedCostL, costPerKg: parseFloat(variedTotalLandedCostPerKg.toFixed(2)) },
            co2PerTon: { btap: btapData.co2PerTon, bcfc: bcfcData.co2PerTon, others: othersData.co2PerTon },
            potentialSavings: { costL: 8.50 },
        },
        costSplit: [
            { name: 'Raw Material', value: 18, color: 'bg-orange-500' },
            { name: 'Cement Hub', value: 29, color: 'bg-blue-500' },
            { name: 'RMC Dispatch', value: 48, color: 'bg-teal-500' },
            { name: 'ESG Overhead', value: 5, color: 'bg-emerald-500' },
        ],
        homepageKpis,
        activeShipments,
        demurrageRisks,
        exceptionsAndAnomalies,
        logisticsIntelligence,
        costIntelligence,
        esgComplianceData,
        planningForecastingData
    };
};

export const PREDEFINED_SCENARIOS_LIST = [
    { id: 'raipur_worli', name: 'Full Chain: All Raw Materials ➜ Raipur ➜ Worli', description: 'Complete chain analysis for Raipur plant serving Worli RMC unit.', path: { plant: 'raipur_plant', hub: 'kalamboli_hub', rmc: 'mumbai_rmc_1' } },
    { id: 'raipur_thane', name: 'Full Chain: All Raw Materials ➜ Raipur ➜ Thane', description: 'Complete chain analysis for Raipur plant serving Thane RMC unit.', path: { plant: 'raipur_plant', hub: 'kalamboli_hub', rmc: 'mumbai_rmc_2' } },
    { id: 'raipur_navimumbai', name: 'Full Chain: All Raw Materials ➜ Raipur ➜ Navi Mumbai', description: 'Complete chain analysis for Raipur plant serving Navi Mumbai RMC unit.', path: { plant: 'raipur_plant', hub: 'kalamboli_hub', rmc: 'mumbai_rmc_3' } },
    { id: 'bokaro_worli', name: 'Full Chain: All Raw Materials ➜ Bokaro ➜ Worli', description: 'Complete chain analysis for Bokaro plant serving Worli RMC unit.', path: { plant: 'bokaro_plant', hub: 'kalamboli_hub', rmc: 'mumbai_rmc_1' } },
    { id: 'bokaro_thane', name: 'Full Chain: All Raw Materials ➜ Bokaro ➜ Thane', description: 'Complete chain analysis for Bokaro plant serving Thane RMC unit.', path: { plant: 'bokaro_plant', hub: 'kalamboli_hub', rmc: 'mumbai_rmc_2' } },
    { id: 'bokaro_navimumbai', name: 'Full Chain: All Raw Materials ➜ Bokaro ➜ Navi Mumbai', description: 'Complete chain analysis for Bokaro plant serving Navi Mumbai RMC unit.', path: { plant: 'bokaro_plant', hub: 'kalamboli_hub', rmc: 'mumbai_rmc_3' } },
    { id: 'satna_worli', name: 'Full Chain: All Raw Materials ➜ Satna ➜ Worli', description: 'Complete chain analysis for Satna plant serving Worli RMC unit.', path: { plant: 'satna_plant', hub: 'kalamboli_hub', rmc: 'mumbai_rmc_1' } },
    { id: 'satna_thane', name: 'Full Chain: All Raw Materials ➜ Satna ➜ Thane', description: 'Complete chain analysis for Satna plant serving Thane RMC unit.', path: { plant: 'satna_plant', hub: 'kalamboli_hub', rmc: 'mumbai_rmc_2' } },
    { id: 'satna_navimumbai', name: 'Full Chain: All Raw Materials ➜ Satna ➜ Navi Mumbai', description: 'Complete chain analysis for Satna plant serving Navi Mumbai RMC unit.', path: { plant: 'satna_plant', hub: 'kalamboli_hub', rmc: 'mumbai_rmc_3' } },
    { id: 'chanderia_worli', name: 'Full Chain: All Raw Materials ➜ Chanderia ➜ Worli', description: 'Complete chain analysis for Chanderia plant serving Worli RMC unit.', path: { plant: 'chanderia_plant', hub: 'kalamboli_hub', rmc: 'mumbai_rmc_1' } },
    { id: 'chanderia_thane', name: 'Full Chain: All Raw Materials ➜ Chanderia ➜ Thane', description: 'Complete chain analysis for Chanderia plant serving Thane RMC unit.', path: { plant: 'chanderia_plant', hub: 'kalamboli_hub', rmc: 'mumbai_rmc_2' } },
    { id: 'chanderia_navimumbai', name: 'Full Chain: All Raw Materials ➜ Chanderia ➜ Navi Mumbai', description: 'Complete chain analysis for Chanderia plant serving Navi Mumbai RMC unit.', path: { plant: 'chanderia_plant', hub: 'kalamboli_hub', rmc: 'mumbai_rmc_3' } },
];

export const INITIAL_SCENARIOS: Scenario[] = [
  ...PREDEFINED_SCENARIOS_LIST.map(generateScenarioFromPredefined)
];

const createTransportChildren = (prefix: string) => [
    { id: `${prefix}_railways`, label: 'Railways' },
    { id: `${prefix}_roadways`, label: 'Roadways' },
    { id: `${prefix}_seaways`, label: 'Seaways' },
];

export const LAYERS_CONFIG = [
    { 
        id: 'raw_material_sites', 
        label: 'Raw Materials', 
        type: SiteType.RAW_MATERIAL, 
        children: [
            { id: 'limestone', label: 'Limestone', subType: 'Limestone' },
            { id: 'fly_ash', label: 'Fly Ash', subType: 'Fly Ash' },
            { id: 'gypsum', label: 'Gypsum', subType: 'Gypsum' },
            { id: 'slag', label: 'Slag', subType: 'Slag' },
            { id: 'alumina', label: 'Alumina', subType: 'Alumina' },
            { id: 'coal_lignite', label: 'Coal or Lignite', subType: 'Coal or Lignite' },
            { type: 'header', label: 'Transport Routes' },
            ...createTransportChildren('raw_material_sites')
        ]
    },
    { 
        id: 'cement_plants', 
        label: 'Cement Plants', 
        type: SiteType.CEMENT_PLANT,
        children: [
            { type: 'header', label: 'Transport Routes' },
            ...createTransportChildren('cement_plants')
        ]
    },
    { 
        id: 'distribution_hubs', 
        label: 'Distribution Hubs', 
        type: SiteType.DISTRIBUTION_HUB,
        children: [
            { type: 'header', label: 'Transport Routes' },
            ...createTransportChildren('distribution_hubs')
        ]
    },
    { 
        id: 'rmc_units', 
        label: 'RMC Units', 
        type: SiteType.RMC_PLANT,
        children: [
            { type: 'header', label: 'Transport Routes' },
            ...createTransportChildren('rmc_units')
        ]
    },
];

const getFutureDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

const getPastDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
};

export const INITIAL_WAGON_INVENTORY: Wagon[] = [
  { id: 'W-OPEN-502', type: WagonType.OPEN, status: WagonStatus.AVAILABLE, currentLocationId: 'odisha_mine', capacity: 68, maintenanceDueDate: '2025-04-01', ownership: OwnershipType.OWNED, costBasis: { depreciation: 1250, oAndM: 8000 }, co2PerTonKm: 0.00927 },
  { id: 'L-BCFC-201', type: WagonType.BCFC, status: WagonStatus.AVAILABLE, currentLocationId: 'odisha_mine', capacity: 60, maintenanceDueDate: '2025-05-15', ownership: OwnershipType.LEASED, leaseVendor: 'SpeedyLogistics', leaseExpiry: getFutureDate(120), costBasis: { leaseRate: 2200, leaseType: 'day', oAndM: 5000 }, co2PerTonKm: 0.0078 },
  { id: 'W-OPEN-503', type: WagonType.OPEN, status: WagonStatus.AVAILABLE, currentLocationId: 'jharkhand_mine', capacity: 68, maintenanceDueDate: '2025-06-20', ownership: OwnershipType.OWNED, costBasis: { depreciation: 1250, oAndM: 8000 }, co2PerTonKm: 0.00927 },
  { id: 'W-BTAP-001', type: WagonType.BTAP, status: WagonStatus.AVAILABLE, currentLocationId: 'raipur_plant', capacity: 60, maintenanceDueDate: '2024-12-01', ownership: OwnershipType.OWNED, costBasis: { depreciation: 1500, oAndM: 5000 }, co2PerTonKm: 0.0061 },
  { id: 'W-BTAP-002', type: WagonType.BTAP, status: WagonStatus.AVAILABLE, currentLocationId: 'raipur_plant', capacity: 60, maintenanceDueDate: '2025-01-15', ownership: OwnershipType.OWNED, costBasis: { depreciation: 1500, oAndM: 5000 }, co2PerTonKm: 0.0061 },
  { id: 'W-OPEN-501', type: WagonType.OPEN, status: WagonStatus.MAINTENANCE, currentLocationId: 'raipur_plant', capacity: 68, maintenanceDueDate: '2024-10-05', ownership: OwnershipType.OWNED, costBasis: { depreciation: 1200, oAndM: 7500 }, co2PerTonKm: 0.00927, periodFrom: getPastDate(1), periodTo: getFutureDate(2) },
  { id: 'W-BCFC-101', type: WagonType.BCFC, status: WagonStatus.AVAILABLE, currentLocationId: 'raipur_plant', capacity: 60, maintenanceDueDate: '2024-11-20', ownership: OwnershipType.OWNED, costBasis: { depreciation: 1350, oAndM: 6000 }, co2PerTonKm: 0.0078 },
  { id: 'L-BCFC-102', type: WagonType.BCFC, status: WagonStatus.AVAILABLE, currentLocationId: 'bokaro_plant', capacity: 60, maintenanceDueDate: '2025-02-10', ownership: OwnershipType.LEASED, leaseVendor: 'RailLease Corp', leaseExpiry: '2025-08-31', costBasis: { leaseRate: 2000, leaseType: 'day', oAndM: 4500 }, co2PerTonKm: 0.0078 },
  { id: 'L-FLAT-801', type: WagonType.FLAT, status: WagonStatus.IN_TRANSIT, currentLocationId: 'bokaro_plant', capacity: 70, maintenanceDueDate: '2024-12-30', ownership: OwnershipType.LEASED, leaseVendor: 'SpeedyLogistics', leaseExpiry: getFutureDate(55), costBasis: { leaseRate: 1.2, leaseType: 'km', oAndM: 3000 }, co2PerTonKm: 0.00927, periodFrom: getPastDate(2), periodTo: getFutureDate(3) },
  { id: 'L-BTAP-004', type: WagonType.BTAP, status: WagonStatus.AVAILABLE, currentLocationId: 'chanderia_plant', capacity: 60, maintenanceDueDate: '2025-03-01', ownership: OwnershipType.LEASED, leaseVendor: 'IndiaWagons LLC', leaseExpiry: getFutureDate(25), costBasis: { leaseRate: 25000, leaseType: 'trip', oAndM: 4000 }, co2PerTonKm: 0.0061 },
  { id: 'L-BTAP-005', type: WagonType.BTAP, status: WagonStatus.AVAILABLE, currentLocationId: 'chanderia_plant', capacity: 60, maintenanceDueDate: '2025-03-15', ownership: OwnershipType.LEASED, leaseVendor: 'RailLease Corp', leaseExpiry: '2026-01-01', costBasis: { leaseRate: 2100, leaseType: 'day', oAndM: 4500 }, co2PerTonKm: 0.0061 },
  { id: 'W-BTAP-006', type: WagonType.BTAP, status: WagonStatus.AVAILABLE, currentLocationId: 'kalamboli_hub', capacity: 60, maintenanceDueDate: '2024-11-01', ownership: OwnershipType.OWNED, costBasis: { depreciation: 1550, oAndM: 5200 }, co2PerTonKm: 0.0061 },
  { id: 'L-BCFC-104', type: WagonType.BCFC, status: WagonStatus.MAINTENANCE, currentLocationId: 'kalamboli_hub', capacity: 60, maintenanceDueDate: '2024-09-30', ownership: OwnershipType.LEASED, leaseVendor: 'SpeedyLogistics', leaseExpiry: getFutureDate(5), costBasis: { leaseRate: 1800, leaseType: 'day', oAndM: 6500 }, co2PerTonKm: 0.0078, periodFrom: getPastDate(0), periodTo: getFutureDate(3) },
];
