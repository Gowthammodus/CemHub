
export enum SiteType {
  RAW_MATERIAL = 'Raw Material Site',
  CEMENT_PLANT = 'Cement Plant',
  DISTRIBUTION_HUB = 'Distribution Point',
  RMC_PLANT = 'RMC'
}

export interface Site {
  id: string;
  name: string;
  type: SiteType;
  subType?: 'Limestone' | 'Fly Ash' | 'Gypsum' | 'Slag' | 'Alumina' | 'Coal or Lignite';
  position: [number, number];
  info: string;
}

export enum TransportMode {
  RAIL_BTAP = 'Rail (BTAP)',
  RAIL_BCFC = 'Rail (BCFC)',
  ROAD = 'Road',
  SEA = 'Sea'
}

export interface Route {
  id: string;
  from: string;
  to: string;
  mode: TransportMode;
  path: [number, number][];
  capacity?: string;
}

export interface WagonData {
    name: string;
    costPerTonKm: number;
    turnaroundTime: string;
    unloadingCost: string;
    esgScore: number;
    fuelEfficiency: string;
    co2PerTon: number;
    totalCost: number;
    totalCO2: number;
    payload?: number;
    unloadingHoursPerWagon?: number;
    co2PerTonKm?: number;
}

export interface CostBreakdown {
    rawMaterialLanded: { costL: number; costPerKg: number; };
    cementLandedAtHub: { costL: number; costPerKg: number; };
    hubToRmcDispatch: { costL: number; costPerKg: number; };
    esgOverhead: { costL: number; costPerKg: number; };
    totalLandedCost: { costL: number; costPerKg: number; };
    co2PerTon: { btap: number; bcfc: number; others: number; };
    potentialSavings: { costL: number; };
}

export interface Shipment {
    id: string;
    origin: string;
    dest: string;
    mode: string;
    status: string;
    eta: string;
    riskScore: 'High' | 'Medium' | 'Low';
}

export interface HomeAlert {
    title: string;
    desc: string;
    severity: 'Critical' | 'Warning' | 'Info';
}

export interface DailyForecast {
    day: string;
    demand: number;
    supply: number;
}

export interface SiloLevel {
    material: 'Cement' | 'FlyAsh' | 'Gypsum' | 'Limestone' | 'Slag' | 'Alumina' | 'Coal or Lignite';
    level: number;
    risk: string;
}

export interface StockTransfer {
    id: string;
    sourcePlant: string;
    material: string;
    suggestQty: number;
    eta: string;
    action: string;
}

export interface ModeMetric {
    cost: string;
    co2: string;
    isBest: boolean;
}

export interface LeastCostRouteEntry {
    id: string;
    fromId: string;
    toId: string;
    mode: string;
    comments: string;
}

export interface EsgImpactMetric {
    id: string;
    name: string;
    btap: number;
    bcfc: number;
    road: number;
}

export interface EsgScheme {
    id: string;
    header: string;
    description: string;
    status: 'Active' | 'Inactive' | 'Pending';
}

export interface FinancialCostChartRow {
    id: string;
    category: string;
    planned: string;
    actual: string;
}

export interface OperationalDelayRow {
    id: string;
    reason: string;
    value: string;
}

export interface PlantMetricRow {
    id: string;
    plantName: string;
    costPerTon: string;
    savingsPercent: string;
}

export interface TransportModeDistributionRow {
    id: string;
    transportMode: string;
    valuePercent: string;
}

export interface HistoricalTrendRow {
    id: string;
    month: string;
    cost: string;
    savings: string;
}

export interface OptimizationAuditRow {
    id: string;
    date: string;
    type: string;
    baseline: string;
    optimized: string;
    status: string;
}

export interface ShipmentLevelSavingsRow {
    id: string;
    shipmentId: string;
    route: string;
    baseline: string;
    actual: string;
}

export interface ApprovalHistoryRow {
    id: string;
    logId: string;
    user: string;
    impact: string;
}

export interface ReportsData {
    financial: {
        totalSpend: string;
        avgCostPerTon: string;
        realizedSavings: string;
        costVariance: string;
        costChartData: FinancialCostChartRow[];
    };
    operational: {
        onTimeDeliveryPct: string;
        turnaroundTime: string;
        utilizationPct: string;
        delayDistributionData: OperationalDelayRow[];
    };
    plantAnalysis: {
        mostEfficientPlant: string;
        highestLogisticsCost: string;
        plantMetricsData: PlantMetricRow[];
    };
    transportMode: {
        modeMixDistribution: TransportModeDistributionRow[];
    };
    historicalTrends: {
        monthlyCostSavingsTrend: HistoricalTrendRow[];
    };
}

export interface AuditComplianceData {
    savingsDashboard: {
        ytdSavings: string;
        avgReductionPct: string;
        co2Avoided: string;
        savingsAtRisk: string;
    };
    optimizationAuditTrail: {
        records: OptimizationAuditRow[];
    };
    shipmentLevelSavings: {
        rows: ShipmentLevelSavingsRow[];
    };
    esgPerformance: {
        co2Avoided: string;
        dieselSaved: string;
        railShiftPct: string;
        carbonCredits: string;
    };
    approvalHistory: {
        rows: ApprovalHistoryRow[];
    };
}

// FIX: Added missing interfaces SupplyChainNode, CorridorItem, and BackhaulOpp
export interface SupplyChainNode {
    id: string;
    node: string;
    status: string;
    eta: string;
}

export interface CorridorItem {
    id: string;
    route: string;
    congestion: 'Low' | 'Moderate' | 'High' | 'Severe';
    speed: number;
    alert: string;
}

export interface BackhaulOpp {
    id: string;
    material: string;
    volume: string;
    savings: string;
    probability: string;
}

export interface Scenario {
    id: string;
    title: string;
    description: string;
    sites: Site[];
    routes: Route[];
    regions: string[];
    comparisonData: {
        btap: WagonData;
        bcfc: WagonData;
        others: WagonData;
    };
    costSavings: number;
    co2Savings: number;
    costBreakdown: CostBreakdown;
    costSplit: { name: string; value: number; color: string; }[];
    homepageKpis?: {
        totalVolume: string;
        projectedSpend: string;
        potentialSavings: string;
        riskLevel: string;
        riskDesc: string;
        co2Emissions: string;
    };
    activeShipments?: Shipment[];
    demurrageRisks?: HomeAlert[];
    exceptionsAndAnomalies?: HomeAlert[];
    // Modular Intelligence Data
    logisticsIntelligence?: {
        supplyChainNodes: SupplyChainNode[];
        corridorAnalysis: CorridorItem[];
        liveShipments: Shipment[];
        modeComparison: {
            btap: ModeMetric;
            bcfc: ModeMetric;
            road: ModeMetric;
        };
        optimizationSimulator: {
            railShare: number;
            costIndex: number;
            co2Reduction: number;
        };
        backhaulOpportunities: BackhaulOpp[];
    };
    costIntelligence?: {
        logisticsCost: number;
        landedCost: number;
        leastCostRoutes: LeastCostRouteEntry[];
        benchmarking: {
            btap: number;
            bcfc: number;
            road: number;
        };
    };
    esgComplianceData?: {
        scenarioEmissions: number;
        dieselOffset: number;
        carbonCredits: number;
        comparisonMatrix: EsgImpactMetric[];
        schemes: EsgScheme[];
    };
    planningForecastingData?: {
        weeklyDemand: number;
        incomingSupply: number;
        netBalance: number;
        dailyForecasts: DailyForecast[];
        siloLevels: SiloLevel[];
        stockTransferSuggestions: StockTransfer[];
    };
    reportsData?: ReportsData;
    auditComplianceData?: AuditComplianceData;
}

export enum WagonStatus {
  AVAILABLE = 'Available',
  IN_TRANSIT = 'In Transit',
  MAINTENANCE = 'Maintenance',
}

export enum WagonType {
  BTAP = 'BTAP',
  BCFC = 'BCFC',
  OPEN = 'Open',
  FLAT = 'Flat',
  OTHER = 'Other',
}

export enum OwnershipType {
  OWNED = 'Owned',
  LEASED = 'Leased',
}

interface BaseWagon {
  id: string;
  type: WagonType;
  capacity: number;
  status: WagonStatus;
  currentLocationId: string;
  maintenanceDueDate: string;
  co2PerTonKm?: number;
  periodFrom?: string;
  periodTo?: string;
}

export interface OwnedWagon extends BaseWagon {
  ownership: OwnershipType.OWNED;
  costBasis: {
    depreciation: number;
    oAndM: number;
  };
}

export interface LeasedWagon extends BaseWagon {
  ownership: OwnershipType.LEASED;
  leaseVendor: string;
  leaseExpiry: string;
  costBasis: {
    leaseRate: number;
    leaseType: 'day' | 'trip' | 'km';
    oAndM: number;
  };
}

export type Wagon = OwnedWagon | LeasedWagon;
