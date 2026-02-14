
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, ComposedChart, BarChart, Bar 
} from 'recharts';

// --- Icons ---
const DashboardIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>;
const MapIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0Z" /></svg>;
const WrenchIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.878-5.878m0 0L21 5.64m-8.58 8.58v-6.828a2.25 2.25 0 0 1 2.25-2.25h5.172A2.25 2.25 0 0 1 21 5.64v5.172a2.25 2.25 0 0 1-2.25 2.25h-6.828Zm0 0-3.396-3.396a2.25 2.25 0 0 0-3.182 0L3 18.75a2.25 2.25 0 0 0 0 3.182l3.396-3.396Z" /></svg>;
const AlertIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;
const ClipboardIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>;
const ArchiveBoxIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>;
const PlusIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const XMarkIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;
const BoltIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>;
const UploadIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>;
const ChartBarSquareIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>;
const ClockIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const DocumentCheckIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const ExclamationTriangleIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;

// --- Types ---
type Module = 'dashboard' | 'equipment' | 'maintenance' | 'incidents' | 'spares' | 'reports' | 'process_map';
interface Equipment { id: string; name: string; status: 'Running' | 'Down' | 'Maintenance' | 'Idle'; health: number; temp: number; vibration: number; power: number; }
interface Incident { id: string; title: string; equipmentId: string; type: string; severity: 'High' | 'Medium' | 'Low'; status: 'Open' | 'Investigating' | 'Resolved'; timestamp: string; }
interface Alert { id: string; message: string; severity: 'Critical' | 'Warning' | 'Info'; timestamp: string; equipmentId?: string; acknowledged: boolean; }
interface Spare { id: string; name: string; sku: string; currentStock: number; minLevel: number; unit: string; onOrder: number; }

// --- Process Map Specific Types & Data ---
interface ProcessStep {
  id: string;
  name: string;
  status: 'Operational' | 'Minor Issues' | 'Major Downtime' | 'Planned Shutdown' | 'Maintenance Running';
  efficiency: number;
  activeIssues: number;
  nextMaintenance: string;
  kpis: { label: string; value: string }[];
  riskLevel: 'Normal' | 'Warning' | 'Critical';
  aiPrediction: { label: string; risk: 'Low' | 'Medium' | 'High'; recommendation?: string; probability?: string };
  bottleneck: boolean;
  nextMaintenanceItems: string[];
}

const PROCESS_DATA: ProcessStep[] = [
  {
    id: 'raw_material',
    name: '1. Raw Material',
    status: 'Operational',
    efficiency: 98,
    activeIssues: 0,
    nextMaintenance: '12 Dec 2025',
    kpis: [
      { label: 'LS Stock', value: '45,000 t' },
      { label: 'Moisture', value: '4.2%' },
      { label: 'Crusher Feed', value: '450 tph' }
    ],
    riskLevel: 'Normal',
    aiPrediction: { label: 'Healthy', risk: 'Low', probability: '2%' },
    bottleneck: false,
    nextMaintenanceItems: ['Belt Inspection - Dec 18', 'Roller Lube - Dec 25']
  },
  {
    id: 'crushing',
    name: '2. Crushing',
    status: 'Operational',
    efficiency: 95,
    activeIssues: 0,
    nextMaintenance: '18 Dec 2025',
    kpis: [
      { label: 'Throughput', value: '420 tph' },
      { label: 'Power Draw', value: '240 kW' },
      { label: 'Vibration', value: '1.2 mm/s' }
    ],
    riskLevel: 'Normal',
    aiPrediction: { label: 'Optimal', risk: 'Low', probability: '5%' },
    bottleneck: false,
    nextMaintenanceItems: ['Hammer Check - Dec 18']
  },
  {
    id: 'raw_mill',
    name: '3. Raw Mill',
    status: 'Minor Issues',
    efficiency: 64,
    activeIssues: 1,
    nextMaintenance: '10 Dec 2025',
    kpis: [
      { label: 'Output', value: '210 tph' },
      { label: 'Residue', value: '14%' },
      { label: 'Motor Temp', value: '88°C' }
    ],
    riskLevel: 'Warning',
    aiPrediction: { label: 'Degrading', risk: 'Medium', recommendation: 'Check separator vanes', probability: '45%' },
    bottleneck: true,
    nextMaintenanceItems: ['Separator Check - Dec 10']
  },
  {
    id: 'kiln',
    name: '4. Kiln',
    status: 'Operational', // Actually lets make it interesting based on prompt example
    efficiency: 92,
    activeIssues: 2,
    nextMaintenance: '22 Dec 2025',
    kpis: [
      { label: 'Kiln Feed', value: '280 tph' },
      { label: 'Burner Load', value: '92%' },
      { label: 'Inlet Temp', value: '980°C' },
      { label: 'Outlet Temp', value: '1450°C' }
    ],
    riskLevel: 'Warning',
    aiPrediction: { label: 'Medium Risk', risk: 'Medium', recommendation: 'Inspect shell temperature today', probability: '37%' },
    bottleneck: false,
    nextMaintenanceItems: ['Shell Scan - Dec 15', 'Burner Nozzle - Dec 22']
  },
  {
    id: 'cement_mill',
    name: '5. Cement Mill',
    status: 'Operational',
    efficiency: 96,
    activeIssues: 0,
    nextMaintenance: '05 Jan 2026',
    kpis: [
      { label: 'Blaine', value: '3200' },
      { label: 'Efficiency', value: '96%' },
      { label: 'Vibration', value: '2.1 mm/s' }
    ],
    riskLevel: 'Normal',
    aiPrediction: { label: 'Stable', risk: 'Low', probability: '1%' },
    bottleneck: false,
    nextMaintenanceItems: ['Ball Sorting - Jan 05']
  },
  {
    id: 'packing',
    name: '6. Packing',
    status: 'Maintenance Running',
    efficiency: 0,
    activeIssues: 0,
    nextMaintenance: 'Today',
    kpis: [
      { label: 'Bags/min', value: '0' },
      { label: 'Rejection', value: '0%' }
    ],
    riskLevel: 'Normal', // Maintenance is planned, so risk is low
    aiPrediction: { label: 'Offline', risk: 'Low' },
    bottleneck: false,
    nextMaintenanceItems: ['Packer 2 Overhaul - In Progress']
  },
  {
    id: 'dispatch',
    name: '7. Dispatch',
    status: 'Operational',
    efficiency: 99,
    activeIssues: 0,
    nextMaintenance: '15 Jan 2026',
    kpis: [
      { label: 'Queue', value: '12 Trucks' },
      { label: 'Turnaround', value: '45 mins' }
    ],
    riskLevel: 'Normal',
    aiPrediction: { label: 'Optimal', risk: 'Low' },
    bottleneck: false,
    nextMaintenanceItems: ['Weighbridge Calib - Jan 15']
  }
];

// --- Mock Data Generators ---
const generateTelemetry = () => ({
  time: new Date().toLocaleTimeString(),
  kilnTemp: 1450 + Math.random() * 20 - 10,
  powerConsumption: 25 + Math.random() * 5,
  vibration: 2 + Math.random() * 0.5,
  clinkerOutput: 180 + Math.random() * 10
});

const INITIAL_EQUIPMENT: Equipment[] = [
  { id: 'KILN-01', name: 'Rotary Kiln 1', status: 'Running', health: 92, temp: 1452, vibration: 2.1, power: 28.5 },
  { id: 'MILL-01', name: 'Raw Mill 1', status: 'Running', health: 88, temp: 85, vibration: 3.4, power: 12.2 },
  { id: 'CRUSHER-01', name: 'Primary Crusher', status: 'Maintenance', health: 45, temp: 40, vibration: 0, power: 0 },
  { id: 'COOLER-01', name: 'Clinker Cooler', status: 'Running', health: 95, temp: 110, vibration: 1.2, power: 15.0 },
  { id: 'PACKER-02', name: 'Rotary Packer 2', status: 'Idle', health: 98, temp: 25, vibration: 0, power: 0.5 },
];

const INITIAL_INCIDENTS: Incident[] = [
  { id: 'INC-2024-001', title: 'High Vibration on Raw Mill', equipmentId: 'MILL-01', type: 'Mechanical', severity: 'High', status: 'Investigating', timestamp: '2024-10-24 08:30' },
  { id: 'INC-2024-002', title: 'Conveyor Belt Misalignment', equipmentId: 'CRUSHER-01', type: 'Mechanical', severity: 'Medium', status: 'Resolved', timestamp: '2024-10-23 14:15' },
];

const INITIAL_SPARES: Spare[] = [
  { id: 'SP-001', name: 'Bearing 6205-2RS', sku: 'BRG-6205', currentStock: 4, minLevel: 10, unit: 'pcs', onOrder: 20 },
  { id: 'SP-002', name: 'Kiln Brick (Magnesia)', sku: 'RF-MAG-01', currentStock: 500, minLevel: 200, unit: 'pcs', onOrder: 0 },
  { id: 'SP-003', name: 'Hydraulic Oil ISO 68', sku: 'LUB-HYD-68', currentStock: 1200, minLevel: 500, unit: 'L', onOrder: 0 },
  { id: 'SP-004', name: 'Filter Bag (Polyester)', sku: 'FIL-BAG-05', currentStock: 20, minLevel: 50, unit: 'pcs', onOrder: 0 },
];

// --- Sub-Components ---

// 1. Dashboard Module
const DashboardModule: React.FC<{ 
  telemetry: any[], 
  alerts: Alert[], 
  onAckAlert: (id: string) => void,
  onCreateIncident: (alert: Alert) => void 
}> = ({ telemetry, alerts, onAckAlert, onCreateIncident }) => {
  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Kiln Temp', value: `${telemetry[telemetry.length-1]?.kilnTemp.toFixed(0)}°C`, color: 'text-orange-600', icon: <BoltIcon className="w-6 h-6"/> },
          { label: 'Power Draw', value: `${telemetry[telemetry.length-1]?.powerConsumption.toFixed(1)} MW`, color: 'text-[#003A8F]', icon: <BoltIcon className="w-6 h-6"/> },
          { label: 'Vibration', value: `${telemetry[telemetry.length-1]?.vibration.toFixed(2)} mm/s`, color: 'text-purple-600', icon: <BoltIcon className="w-6 h-6"/> },
          { label: 'Production', value: `${telemetry[telemetry.length-1]?.clinkerOutput.toFixed(0)} tph`, color: 'text-[#2E7D32]', icon: <DashboardIcon className="w-6 h-6"/> },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-[#6B7280] text-xs font-semibold uppercase">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
            <div className={`p-3 rounded-full bg-[#F4F6F8] ${kpi.color}`}>{kpi.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[24rem]">
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col h-96 lg:h-auto">
          <h3 className="font-semibold text-[#0B1F3B] mb-4">Real-time Kiln Telemetry (Last 60s)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={telemetry}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{fontSize: 10}} interval={10} />
                <YAxis yAxisId="left" domain={[1400, 1500]} label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 5]} label={{ value: 'Vib (mm/s)', angle: 90, position: 'insideRight' }} />
                <Tooltip contentStyle={{fontSize: '12px'}} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="kilnTemp" stroke="#ea580c" fill="#ffedd5" name="Kiln Temp" />
                <Line yAxisId="right" type="monotone" dataKey="vibration" stroke="#9333ea" dot={false} name="Vibration" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col h-96 lg:h-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#0B1F3B]">Alert Center</h3>
            <span className="bg-red-100 text-[#C62828] text-xs px-2 py-1 rounded-full">{alerts.filter(a => !a.acknowledged).length} Active</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {alerts.length === 0 ? <p className="text-sm text-gray-400 text-center mt-10">No active alerts</p> : 
             alerts.map(alert => (
              <div key={alert.id} className={`p-3 rounded-md border-l-4 text-sm ${alert.severity === 'Critical' ? 'bg-red-50 border-[#C62828]' : 'bg-amber-50 border-[#F9A825]'}`}>
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-[#1A1A1A]">{alert.message}</p>
                  <span className="text-xs text-[#6B7280]">{alert.timestamp.split(' ')[1]}</span>
                </div>
                <div className="mt-2 flex justify-end space-x-2">
                  {!alert.acknowledged && <button onClick={() => onAckAlert(alert.id)} className="text-xs text-[#003A8F] hover:underline">Ack</button>}
                  <button onClick={() => onCreateIncident(alert)} className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50">Create Incident</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Equipment Module
const EquipmentModule: React.FC<{ equipment: Equipment[] }> = ({ equipment }) => (
  <div className="bg-white rounded-lg shadow overflow-x-auto">
    <table className="w-full text-sm text-left min-w-[800px]">
      <thead className="bg-[#F4F6F8] text-[#6B7280] uppercase text-xs">
        <tr>
          <th className="p-4">Equipment Name</th>
          <th className="p-4">Status</th>
          <th className="p-4">Health Index</th>
          <th className="p-4">Temperature</th>
          <th className="p-4">Vibration</th>
          <th className="p-4">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {equipment.map(eq => (
          <tr key={eq.id} className="hover:bg-gray-50">
            <td className="p-4 font-medium text-[#1A1A1A]">{eq.name} <span className="text-xs text-[#6B7280] block">{eq.id}</span></td>
            <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              eq.status === 'Running' ? 'bg-green-100 text-[#2E7D32]' : 
              eq.status === 'Down' ? 'bg-red-100 text-[#C62828]' : 
              'bg-amber-100 text-amber-800'
            }`}>{eq.status}</span></td>
            <td className="p-4">
              <div className="w-24 bg-gray-200 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${eq.health > 80 ? 'bg-[#2E7D32]' : eq.health > 50 ? 'bg-[#F9A825]' : 'bg-[#C62828]'}`} style={{width: `${eq.health}%`}}></div>
              </div>
              <span className="text-xs text-[#6B7280] mt-1 block">{eq.health}%</span>
            </td>
            <td className="p-4">{eq.temp}°C</td>
            <td className="p-4">{eq.vibration} mm/s</td>
            <td className="p-4"><button className="text-[#003A8F] hover:underline">Details</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// 3. Maintenance Planner (Gantt)
const MaintenanceModule: React.FC = () => {
  // Simplified Gantt visualization
  const days = Array.from({length: 14}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.getDate();
  });

  const tasks = [
    { eq: 'KILN-01', start: 2, duration: 3, type: 'Preventive' },
    { eq: 'CRUSHER-01', start: 0, duration: 2, type: 'Corrective' },
    { eq: 'MILL-01', start: 8, duration: 1, type: 'Inspection' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[#0B1F3B]">Maintenance Schedule (Next 14 Days)</h3>
        <button className="bg-[#003A8F] text-white px-3 py-1.5 rounded text-sm hover:bg-[#0B1F3B]">New Work Order</button>
      </div>
      <div className="flex-1 overflow-auto border border-gray-200 rounded">
        <div className="grid grid-cols-[150px_repeat(14,1fr)] min-w-[800px]">
          {/* Header */}
          <div className="p-2 bg-[#F4F6F8] font-bold text-xs border-b border-r sticky left-0 z-10">Equipment</div>
          {days.map((d, i) => (
            <div key={i} className="p-2 bg-[#F4F6F8] text-center text-xs font-semibold border-b border-r border-gray-200">{d}</div>
          ))}
          
          {/* Rows */}
          {['KILN-01', 'MILL-01', 'CRUSHER-01', 'COOLER-01', 'PACKER-02'].map(eq => (
            <React.Fragment key={eq}>
              <div className="p-2 text-sm font-medium border-b border-r bg-white sticky left-0 z-10">{eq}</div>
              {days.map((_, i) => {
                const task = tasks.find(t => t.eq === eq && i >= t.start && i < t.start + t.duration);
                return (
                  <div key={i} className="border-b border-r border-gray-100 relative h-10">
                    {task && i === task.start && (
                      <div 
                        className={`absolute top-1 left-1 h-8 rounded shadow text-xs flex items-center justify-center text-white z-0
                          ${task.type === 'Preventive' ? 'bg-[#003A8F]' : task.type === 'Corrective' ? 'bg-[#C62828]' : 'bg-[#F9A825]'}
                        `}
                        style={{width: `calc(${task.duration * 100}% + ${task.duration * 1}px - 4px)`}}
                      >
                        {task.type}
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center"><span className="w-3 h-3 bg-[#003A8F] rounded mr-2"></span>Preventive</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-[#C62828] rounded mr-2"></span>Corrective</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-[#F9A825] rounded mr-2"></span>Inspection</div>
      </div>
    </div>
  );
};

// 4. Incident Management
const IncidentModule: React.FC<{ incidents: Incident[], onOpenRCA: (incident: Incident) => void }> = ({ incidents, onOpenRCA }) => (
  <div className="space-y-4">
    {incidents.map(inc => (
      <div key={inc.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-bold rounded ${inc.severity === 'High' ? 'bg-red-100 text-[#C62828]' : 'bg-amber-100 text-amber-800'}`}>{inc.severity}</span>
            <h4 className="font-bold text-[#1A1A1A]">{inc.title}</h4>
          </div>
          <p className="text-sm text-[#6B7280] mt-1">ID: {inc.id} • Equipment: {inc.equipmentId} • {inc.timestamp}</p>
        </div>
        <div className="mt-3 md:mt-0 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${inc.status === 'Resolved' ? 'bg-green-100 text-[#2E7D32]' : 'bg-blue-100 text-[#003A8F]'}`}>{inc.status}</span>
          <button onClick={() => onOpenRCA(inc)} className="bg-[#003A8F] text-white px-3 py-1 rounded text-sm hover:bg-[#0B1F3B]">RCA Wizard</button>
        </div>
      </div>
    ))}
  </div>
);

// 5. Spares & Procurement
const SparesModule: React.FC<{ spares: Spare[] }> = ({ spares }) => (
  <div className="bg-white rounded-lg shadow overflow-x-auto">
    <table className="w-full text-sm text-left min-w-[800px]">
      <thead className="bg-[#F4F6F8] text-[#6B7280] uppercase text-xs">
        <tr>
          <th className="p-3">SKU</th>
          <th className="p-3">Item Name</th>
          <th className="p-3 text-right">Current Stock</th>
          <th className="p-3 text-right">Min Level</th>
          <th className="p-3">Status</th>
          <th className="p-3">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {spares.map(item => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="p-3 font-mono text-xs">{item.sku}</td>
            <td className="p-3 font-medium">{item.name}</td>
            <td className="p-3 text-right font-bold">{item.currentStock} {item.unit}</td>
            <td className="p-3 text-right text-gray-500">{item.minLevel} {item.unit}</td>
            <td className="p-3">
              {item.currentStock < item.minLevel ? (
                <span className="bg-red-100 text-[#C62828] text-xs px-2 py-1 rounded-full font-semibold">Low Stock</span>
              ) : (
                <span className="bg-green-100 text-[#2E7D32] text-xs px-2 py-1 rounded-full font-semibold">OK</span>
              )}
            </td>
            <td className="p-3">
              {item.currentStock < item.minLevel && (
                <button className="text-xs bg-[#003A8F] text-white px-2 py-1 rounded hover:bg-[#0B1F3B]">Create PR</button>
              )}
              {item.onOrder > 0 && <span className="text-xs text-[#003A8F] ml-2">{item.onOrder} on order</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// 6. Report Generator
const ReportModule: React.FC = () => {
  const [isGenerated, setIsGenerated] = useState(false);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto w-full">
      <h3 className="text-xl font-bold text-[#0B1F3B] mb-6">Shift Handover Report</h3>
      {!isGenerated ? (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsGenerated(true); }}>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Shift Date</label><input type="date" className="w-full border rounded p-2 mt-1" required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Shift</label><select className="w-full border rounded p-2 mt-1"><option>Morning (A)</option><option>Evening (B)</option><option>Night (C)</option></select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700">Production Output (Tons)</label><input type="number" className="w-full border rounded p-2 mt-1" placeholder="e.g. 4500" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Key Incidents</label><textarea className="w-full border rounded p-2 mt-1" rows={3} placeholder="Summarize downtimes..."></textarea></div>
          <button type="submit" className="w-full bg-[#2E7D32] text-white font-bold py-2 rounded hover:bg-green-700">Generate & Sign Report</button>
        </form>
      ) : (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><ClipboardIcon className="w-8 h-8 text-[#2E7D32]" /></div>
          <h4 className="text-lg font-bold text-[#2E7D32]">Report Generated Successfully</h4>
          <p className="text-gray-500 mt-2">PDF has been sent to the plant manager.</p>
          <button onClick={() => setIsGenerated(false)} className="mt-6 text-[#003A8F] hover:underline">Create Another</button>
        </div>
      )}
    </div>
  );
};

// 7. CSV Import Modal
const CSVImportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Import Data via CSV</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer">
          <UploadIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Drag & drop files here or click to upload</p>
          <p className="text-xs text-gray-400 mt-1">Supports: Incidents, Work Orders, Spares</p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 bg-[#003A8F] text-white rounded hover:bg-[#0B1F3B]">Upload & Map</button>
        </div>
      </div>
    </div>
  );
};

// 8. RCA Wizard Modal
const RCAWizard: React.FC<{ incident: Incident | null; onClose: () => void }> = ({ incident, onClose }) => {
  const [step, setStep] = useState(1);
  if (!incident) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[500px] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#0B1F3B]">Root Cause Analysis: {incident.id}</h3>
          <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-500" /></button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-[#0B1F3B] border-b pb-2">Step 1: Problem Definition</h4>
              <p className="text-sm text-gray-600">Incident: {incident.title}</p>
              <div><label className="block text-sm font-medium">Detailed Description</label><textarea className="w-full border rounded p-2 h-24"></textarea></div>
              <div><label className="block text-sm font-medium">Evidence (Photos/Logs)</label><input type="file" className="block w-full text-sm text-gray-500 mt-1"/></div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-[#0B1F3B] border-b pb-2">Step 2: 5 Whys Analysis</h4>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex gap-2 items-center"><span className="font-bold text-gray-500 text-sm">Why?</span><input type="text" className="flex-1 border rounded p-1.5 text-sm" /></div>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-[#0B1F3B] border-b pb-2">Step 3: Corrective Actions</h4>
              <div><label className="block text-sm font-medium">Root Cause Category</label><select className="w-full border rounded p-2"><option>Machine Failure</option><option>Human Error</option><option>Method</option><option>Material</option></select></div>
              <div><label className="block text-sm font-medium">Action Plan</label><textarea className="w-full border rounded p-2 h-24"></textarea></div>
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-between">
          <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step===1} className="px-4 py-2 rounded text-gray-600 disabled:opacity-50">Back</button>
          {step < 3 ? (
            <button onClick={() => setStep(s => s+1)} className="px-4 py-2 bg-[#003A8F] text-white rounded">Next</button>
          ) : (
            <button onClick={onClose} className="px-4 py-2 bg-[#2E7D32] text-white rounded">Submit Analysis</button>
          )}
        </div>
      </div>
    </div>
  );
};

// 9. Floating Incident Button
const QuickIncidentFab: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="fixed bottom-8 right-8 bg-[#C62828] hover:bg-red-700 text-white p-4 rounded-full shadow-lg z-40 flex items-center gap-2 transition-transform hover:scale-105"
    title="Report Incident"
  >
    <AlertIcon className="w-6 h-6" />
    <span className="font-bold hidden md:inline">Report Incident</span>
  </button>
);

// 10. Process Card Component (NEW)
const ProcessCard: React.FC<{ step: ProcessStep; onClick: () => void }> = ({ step, onClick }) => {
  const getStatusColor = (s: ProcessStep['status']) => {
    switch(s) {
      case 'Operational': return 'bg-green-100 text-[#2E7D32] border-green-200';
      case 'Minor Issues': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Major Downtime': return 'bg-red-100 text-[#C62828] border-red-200';
      case 'Planned Shutdown': return 'bg-blue-100 text-[#003A8F] border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const riskColor = step.riskLevel === 'Critical' ? 'bg-[#C62828]' : step.riskLevel === 'Warning' ? 'bg-[#F9A825]' : 'bg-[#2E7D32]';

  return (
    <div 
      onClick={onClick}
      className={`relative bg-white rounded-xl shadow hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden cursor-pointer flex flex-col h-full group ${step.bottleneck ? 'ring-2 ring-red-400' : ''}`}
    >
      {/* Risk Indicator Bar */}
      <div className={`h-1.5 w-full ${riskColor}`}></div>

      <div className="p-4 flex flex-col flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-[#1A1A1A]">{step.name}</h3>
          {step.activeIssues > 0 && (
            <span className="flex items-center bg-red-100 text-[#C62828] text-xs px-2 py-1 rounded-full font-bold animate-pulse">
              <AlertIcon className="w-3 h-3 mr-1" /> {step.activeIssues}
            </span>
          )}
        </div>

        {/* Live Status */}
        <div className="flex items-center justify-between mb-4">
          <div className={`px-2 py-1 rounded text-xs font-semibold flex items-center ${getStatusColor(step.status)}`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${step.status === 'Operational' ? 'bg-[#2E7D32]' : step.status === 'Minor Issues' ? 'bg-[#F9A825]' : 'bg-[#C62828]'}`}></span>
            {step.status}
          </div>
          <div className="text-xs text-[#6B7280] font-medium">Eff: {step.efficiency}%</div>
        </div>

        {/* Bottleneck Warning */}
        {step.bottleneck && (
          <div className="mb-3 bg-red-50 border border-red-100 rounded p-2 text-xs text-[#C62828] flex items-center">
            <ExclamationTriangleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="font-bold mr-1">Bottleneck:</span> High Residue
          </div>
        )}

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-50 p-2 rounded">
          {step.kpis.map((kpi, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[10px] text-[#6B7280] uppercase">{kpi.label}</span>
              <span className="text-sm font-bold text-[#1A1A1A]">{kpi.value}</span>
            </div>
          ))}
        </div>

        {/* AI Prediction */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500 font-semibold">AI Prediction</span>
            <span className={`${step.aiPrediction.risk === 'Low' ? 'text-[#2E7D32]' : 'text-[#F9A825]'} font-bold`}>{step.aiPrediction.label} ({step.aiPrediction.probability || 'N/A'})</span>
          </div>
          {step.aiPrediction.recommendation && (
            <p className="text-xs text-gray-600 italic">"{step.aiPrediction.recommendation}"</p>
          )}
        </div>
      </div>

      {/* Hover Actions (Desktop) / Quick Actions */}
      <div className="bg-gray-50 p-2 flex justify-around border-t border-gray-100">
        <button className="p-1.5 text-gray-500 hover:text-[#003A8F] hover:bg-blue-50 rounded" title="Add Reading"><PlusIcon className="w-5 h-5"/></button>
        <button className="p-1.5 text-gray-500 hover:text-[#C62828] hover:bg-red-50 rounded" title="Log Downtime"><ExclamationTriangleIcon className="w-5 h-5"/></button>
        <button className="p-1.5 text-gray-500 hover:text-[#2E7D32] hover:bg-green-50 rounded" title="Checklist"><DocumentCheckIcon className="w-5 h-5"/></button>
        <button className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded" title="Work Order"><WrenchIcon className="w-5 h-5"/></button>
      </div>

      {/* Hover Maintenance Preview (CSS based) */}
      <div className="absolute top-0 left-0 w-full h-full bg-white/95 p-4 hidden group-hover:flex flex-col justify-center items-center text-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
         <p className="font-bold text-[#0B1F3B] mb-2">Next Maintenance</p>
         <ul className="text-sm text-[#1A1A1A] space-y-1">
            {step.nextMaintenanceItems.map((item, i) => <li key={i}>• {item}</li>)}
         </ul>
         <p className="text-xs text-gray-400 mt-4">(Click for Details)</p>
      </div>
    </div>
  );
};

// 11. Process Drilldown Modal (NEW)
const ProcessDetailModal: React.FC<{ step: ProcessStep | null; onClose: () => void }> = ({ step, onClose }) => {
  if (!step) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">{step.name} Details</h2>
            <p className="text-sm text-gray-500">Live Operational Status & Analytics</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><XMarkIcon className="w-6 h-6 text-gray-500"/></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Live Status & Predictions */}
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3">Live Status</h4>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2"><span>Status:</span> <span className="font-bold text-[#2E7D32]">{step.status}</span></div>
                  <div className="flex justify-between border-b pb-2"><span>Efficiency:</span> <span className="font-bold">{step.efficiency}%</span></div>
                  <div className="flex justify-between border-b pb-2"><span>Active Issues:</span> <span className="font-bold text-[#C62828]">{step.activeIssues}</span></div>
                  <div className="flex justify-between items-center pt-1">
                    <span>Risk Level:</span> 
                    <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${step.riskLevel === 'Critical' ? 'bg-[#C62828]' : step.riskLevel === 'Warning' ? 'bg-[#F9A825]' : 'bg-[#2E7D32]'}`}>{step.riskLevel}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><BoltIcon className="w-4 h-4 text-[#003A8F]"/> AI Insights</h4>
                <div className="bg-blue-50 p-3 rounded text-sm text-blue-900 mb-3">
                  <p className="font-bold mb-1">{step.aiPrediction.label}</p>
                  <p className="text-xs opacity-80">Probability: {step.aiPrediction.probability}</p>
                </div>
                {step.aiPrediction.recommendation && (
                  <p className="text-xs text-gray-600 italic">Recommendation: "{step.aiPrediction.recommendation}"</p>
                )}
              </div>
            </div>

            {/* Column 2 & 3: Charts & Maintenance */}
            <div className="md:col-span-2 space-y-6">
               <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-64">
                  <h4 className="font-semibold text-gray-700 mb-2">Efficiency Trend (24h)</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                        {time: '00:00', eff: 90}, {time: '04:00', eff: 92}, {time: '08:00', eff: 88}, 
                        {time: '12:00', eff: 95}, {time: '16:00', eff: 94}, {time: '20:00', eff: step.efficiency}
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="time" tick={{fontSize: 10}} />
                      <YAxis domain={[60, 100]} tick={{fontSize: 10}} />
                      <Tooltip />
                      <Line type="monotone" dataKey="eff" stroke="#2E7D32" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>

               <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-3">Upcoming Maintenance Tasks</h4>
                  <ul className="space-y-2">
                    {step.nextMaintenanceItems.map((item, i) => (
                      <li key={i} className="flex items-center text-sm p-2 bg-gray-50 rounded">
                        <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
               </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border-t flex justify-end">
            <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

const ProcessFlowPage: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module>('process_map');
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [selectedProcessStep, setSelectedProcessStep] = useState<ProcessStep | null>(null);
  
  // Mock Data States
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 'ALT-001', message: 'Kiln Temp High (1480°C)', severity: 'Warning', timestamp: '10:30 AM', acknowledged: false },
    { id: 'ALT-002', message: 'Raw Mill Vibration Critical', severity: 'Critical', timestamp: '10:45 AM', acknowledged: false },
  ]);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Telemetry Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const newData = [...prev, generateTelemetry()];
        if (newData.length > 20) newData.shift();
        return newData;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAckAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const handleCreateIncident = (alert: Alert) => {
    const newInc: Incident = {
      id: `INC-${Date.now()}`,
      title: alert.message,
      equipmentId: 'Unknown',
      type: 'Automated',
      severity: alert.severity === 'Critical' ? 'High' : 'Medium',
      status: 'Open',
      timestamp: new Date().toLocaleString()
    };
    setIncidents(prev => [newInc, ...prev]);
    handleAckAlert(alert.id);
    setActiveModule('incidents');
  };

  return (
    <div className="flex h-full bg-[#F4F6F8] font-sans text-[#1A1A1A]">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-20 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-[#0B1F3B] flex items-center gap-2">
            <span className="bg-[#003A8F] text-white p-1 rounded">OP</span>
            OpCenter
          </h1>
          <p className="text-xs text-[#6B7280] mt-1 ml-9">Plant Operations</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button onClick={() => setActiveModule('process_map')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeModule === 'process_map' ? 'bg-[#003A8F] text-white shadow-md' : 'text-[#6B7280] hover:bg-gray-100'}`}>
            <MapIcon className="w-5 h-5" /><span>Process Map</span>
          </button>
          <button onClick={() => setActiveModule('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeModule === 'dashboard' ? 'bg-[#003A8F] text-white shadow-md' : 'text-[#6B7280] hover:bg-gray-100'}`}>
            <DashboardIcon className="w-5 h-5" /><span>Plant Dashboard</span>
          </button>
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-[#9CA3AF] uppercase">Management</div>
          <button onClick={() => setActiveModule('equipment')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeModule === 'equipment' ? 'bg-[#003A8F] text-white shadow-md' : 'text-[#6B7280] hover:bg-gray-100'}`}>
            <ChartBarSquareIcon className="w-5 h-5" /><span>Equipment Health</span>
          </button>
          <button onClick={() => setActiveModule('maintenance')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeModule === 'maintenance' ? 'bg-[#003A8F] text-white shadow-md' : 'text-[#6B7280] hover:bg-gray-100'}`}>
            <WrenchIcon className="w-5 h-5" /><span>Maintenance</span>
          </button>
          <button onClick={() => setActiveModule('incidents')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeModule === 'incidents' ? 'bg-[#003A8F] text-white shadow-md' : 'text-[#6B7280] hover:bg-gray-100'}`}>
            <AlertIcon className="w-5 h-5" /><span>Incidents & RCA</span>
          </button>
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-[#9CA3AF] uppercase">Logistics</div>
          <button onClick={() => setActiveModule('spares')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeModule === 'spares' ? 'bg-[#003A8F] text-white shadow-md' : 'text-[#6B7280] hover:bg-gray-100'}`}>
            <ArchiveBoxIcon className="w-5 h-5" /><span>Spares & Inventory</span>
          </button>
          <button onClick={() => setActiveModule('reports')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeModule === 'reports' ? 'bg-[#003A8F] text-white shadow-md' : 'text-[#6B7280] hover:bg-gray-100'}`}>
            <ClipboardIcon className="w-5 h-5" /><span>Shift Reports</span>
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={() => setIsImportOpen(true)} className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-50">
            <UploadIcon className="w-4 h-4" /><span>Import Data</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F4F6F8] overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm z-10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F3B]">{
              activeModule === 'process_map' ? 'Process Map' :
              activeModule === 'dashboard' ? 'Plant Dashboard' : 
              activeModule === 'equipment' ? 'Equipment Health' :
              activeModule === 'maintenance' ? 'Maintenance Planner' :
              activeModule === 'incidents' ? 'Incident Management' :
              activeModule === 'spares' ? 'Spares & Inventory' : 'Shift Reports'
            }</h2>
            <p className="text-sm text-[#6B7280]">Raipur Plant • Line 1 • {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-[#2E7D32] rounded-full text-xs font-bold">
              <span className="w-2 h-2 bg-[#2E7D32] rounded-full animate-pulse"></span> System Online
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {activeModule === 'process_map' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PROCESS_DATA.map((step) => (
                <div key={step.id} className="h-64">
                  <ProcessCard step={step} onClick={() => setSelectedProcessStep(step)} />
                </div>
              ))}
            </div>
          )}
          {activeModule === 'dashboard' && <DashboardModule telemetry={telemetry} alerts={alerts} onAckAlert={handleAckAlert} onCreateIncident={handleCreateIncident} />}
          {activeModule === 'equipment' && <EquipmentModule equipment={INITIAL_EQUIPMENT} />}
          {activeModule === 'maintenance' && <MaintenanceModule />}
          {activeModule === 'incidents' && <IncidentModule incidents={incidents} onOpenRCA={setActiveIncident} />}
          {activeModule === 'spares' && <SparesModule spares={INITIAL_SPARES} />}
          {activeModule === 'reports' && <ReportModule />}
        </div>
      </main>

      <QuickIncidentFab onClick={() => setActiveModule('incidents')} />
      
      <RCAWizard incident={activeIncident} onClose={() => setActiveIncident(null)} />
      <CSVImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <ProcessDetailModal step={selectedProcessStep} onClose={() => setSelectedProcessStep(null)} />
    </div>
  );
};

export default ProcessFlowPage;
