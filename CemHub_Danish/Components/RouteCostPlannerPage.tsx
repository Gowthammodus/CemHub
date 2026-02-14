
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Scenario, Site, WagonData, Wagon, LeasedWagon, OwnedWagon } from '../types';
import { SiteType, WagonStatus, WagonType, OwnershipType } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { INITIAL_WAGON_INVENTORY, btapData, bcfcData, othersData } from '../constants';


// --- Helper Components & Icons ---
const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-green-700 flex-shrink-0">{title}</h3>
        <div className="flex-grow space-y-4 overflow-y-auto pr-2 min-h-0">{children}</div>
    </div>
);

const Input: React.FC<{label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, step?: string, unit?: string}> = ({label, unit, ...props}) => (
     <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        <div className="relative">
            <input
                {...props}
                className="w-full bg-gray-50 border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-1 focus:ring-green-500 focus:outline-none text-sm"
            />
            {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">{unit}</span>}
        </div>
    </div>
);

const WagonParameterInput: React.FC<{label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, step?: string, unit?: string}> = ({label, unit, ...props}) => (
    <div>
       <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
       <div className="relative">
           <input
               {...props}
               className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-1 focus:ring-green-500 focus:outline-none text-sm"
           />
           {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">{unit}</span>}
       </div>
   </div>
);


// --- Icon Components ---
const WarningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}> <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /> </svg> );
const ListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /> </svg> );
const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v18h18" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 18v-6a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v6" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 18v-4a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v4" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-3a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v3" /> </svg> );
const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /> </svg> );
const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>);
const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>);
const DuplicateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.75 11.375c.621 0 1.125-.504 1.125-1.125v-9.25a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H9.75c-.621 0-1.125.504-1.125 1.125v1.5a1.125 1.125 0 0 1-1.125-1.125h-1.5a3.375 3.375 0 0 0-3.375 3.375v9.25c0 .621.504 1.125 1.125 1.125h3.375" /></svg>);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>);
const WagonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 0 1 3.375-3.375h9.75a3.375 3.375 0 0 1 3.375 3.375v1.875" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 14.25c0-1.02.56-1.92 1.359-2.404M20.625 14.25c0-1.02-.56-1.92-1.359-2.404" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 11.844v2.404" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 14.25V9.375c0-.621.504-1.125 1.125-1.125h15c.621 0 1.125.504 1.125 1.125v4.875" /></svg>);
const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }> = ({ title, ...props }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" />
</svg>);

// --- Analytics Tab Specific Components & Icons ---
const KPICard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center space-x-3">
        <div className="bg-gray-100 p-2 rounded-full text-green-600">{icon}</div>
        <div><p className="text-xs text-gray-500">{title}</p><p className="text-lg font-bold text-blue-900">{value}</p></div>
    </div>
);
const Sparkline: React.FC = () => (
    <svg width="80" height="20" className="text-green-500" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 15 L15 12 L28 14 L41 9 L54 11 L67 6 L80 8" />
    </svg>
);
const BuildingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6M9 15.75h6" /></svg>);
const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" /></svg>);
const WrenchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.878-5.878m0 0L21 5.64m-8.58 8.58v-6.828a2.25 2.25 0 0 1 2.25-2.25h5.172A2.25 2.25 0 0 1 21 5.64v5.172a2.25 2.25 0 0 1-2.25 2.25h-6.828Zm0 0-3.396-3.396a2.25 2.25 0 0 0-3.182 0L3 18.75a2.25 2.25 0 0 0 0 3.182l3.396-3.396Z" /></svg>);
const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);

// --- Wagon Editor Modal ---
const ModalInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input {...props} className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-200 disabled:text-gray-500" />
    </div>
);
const ModalSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
     <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <select {...props} className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-200 disabled:text-gray-500">
            {children}
        </select>
    </div>
);

const WagonEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (wagon: Wagon) => void;
    wagon: Wagon | null;
    mode: 'view' | 'edit' | 'add';
    sites: Site[];
}> = ({ isOpen, onClose, onSave, wagon, mode, sites }) => {
    const [formData, setFormData] = useState<Wagon | null>(null);

    useEffect(() => {
        if (wagon) {
            setFormData(JSON.parse(JSON.stringify(wagon))); // Deep copy
        }
    }, [wagon]);

    if (!isOpen || !formData) return null;

    const isReadOnly = mode === 'view';
    const title = mode === 'add' ? 'Add New Wagon' : mode === 'edit' ? `Edit Wagon: ${formData.id}` : `View Wagon: ${formData.id}`;

    const handleChange = (field: keyof Omit<LeasedWagon, 'costBasis'>, value: any) => {
        setFormData((prev: Wagon | null) => {
            if (!prev) return null;

            if (field === 'ownership') {
                if (value === prev.ownership) return prev;
                
                if (value === OwnershipType.OWNED) { 
                    // Switching from Leased to Owned
                    if (prev.ownership !== OwnershipType.LEASED) return prev;
                    
                    const newWagon: OwnedWagon = {
                        id: prev.id,
                        type: prev.type,
                        capacity: prev.capacity,
                        status: prev.status,
                        currentLocationId: prev.currentLocationId,
                        maintenanceDueDate: prev.maintenanceDueDate,
                        periodFrom: prev.periodFrom,
                        periodTo: prev.periodTo,
                        co2PerTonKm: prev.co2PerTonKm,
                        ownership: OwnershipType.OWNED,
                        costBasis: { 
                            depreciation: 1500, 
                            oAndM: prev.costBasis.oAndM 
                        },
                    };
                    return newWagon;
                } else { 
                    // Switching from Owned to Leased
                    if (prev.ownership !== OwnershipType.OWNED) return prev;
                    
                    const newWagon: LeasedWagon = {
                        id: prev.id,
                        type: prev.type,
                        capacity: prev.capacity,
                        status: prev.status,
                        currentLocationId: prev.currentLocationId,
                        maintenanceDueDate: prev.maintenanceDueDate,
                        periodFrom: prev.periodFrom,
                        periodTo: prev.periodTo,
                        co2PerTonKm: prev.co2PerTonKm,
                        ownership: OwnershipType.LEASED,
                        leaseVendor: 'New Vendor',
                        leaseExpiry: new Date().toISOString().split('T')[0],
                        costBasis: { 
                            leaseRate: 2000, 
                            leaseType: 'day', 
                            oAndM: prev.costBasis.oAndM 
                        },
                    };
                    return newWagon;
                }
            }
            
            // For other fields, we handle updates based on current ownership type to satisfy TS
            if (prev.ownership === OwnershipType.OWNED) {
                 if (field === 'leaseVendor' || field === 'leaseExpiry') return prev;
                 return { ...prev, [field]: value } as OwnedWagon;
            } else {
                 return { ...prev, [field]: value } as LeasedWagon;
            }
        });
    };

    const handleCostBasisChange = (field: string, value: any) => {
        setFormData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                costBasis: {
                    ...prev.costBasis,
                    [field]: Number.isNaN(parseFloat(value)) ? value : parseFloat(value)
                }
            } as Wagon;
        });
    };

    const handleSaveClick = () => {
        if (formData) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-blue-900 mb-6">{title}</h2>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ModalInput label="Wagon ID" value={formData.id} onChange={e => handleChange('id', e.target.value)} disabled={mode !== 'add'} />
                        <ModalSelect label="Type" value={formData.type} onChange={e => handleChange('type', e.target.value)} disabled={isReadOnly}>
                            {Object.values(WagonType).map(t => <option key={t} value={t}>{t}</option>)}
                        </ModalSelect>
                        <ModalInput label="Capacity (tons)" type="number" value={formData.capacity} onChange={e => handleChange('capacity', parseFloat(e.target.value))} disabled={isReadOnly} />
                        <ModalSelect label="Status" value={formData.status} onChange={e => handleChange('status', e.target.value)} disabled={isReadOnly}>
                            {Object.values(WagonStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </ModalSelect>
                        <ModalSelect label="Current Location" value={formData.currentLocationId} onChange={e => handleChange('currentLocationId', e.target.value)} disabled={isReadOnly}>
                            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </ModalSelect>
                        <ModalInput label="Maintenance Due" type="date" value={formData.maintenanceDueDate} onChange={e => handleChange('maintenanceDueDate', e.target.value)} disabled={isReadOnly} />
                    </div>
                     {formData.status !== WagonStatus.AVAILABLE && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                             <ModalInput label="Period From" type="date" value={formData.periodFrom || ''} onChange={e => handleChange('periodFrom', e.target.value)} disabled={isReadOnly} />
                             <ModalInput label="Period To" type="date" value={formData.periodTo || ''} onChange={e => handleChange('periodTo', e.target.value)} disabled={isReadOnly} />
                        </div>
                     )}
                     <div className="border-t pt-4">
                        <ModalSelect label="Ownership" value={formData.ownership} onChange={e => handleChange('ownership', e.target.value)} disabled={isReadOnly}>
                            <option value={OwnershipType.OWNED}>Owned</option>
                            <option value={OwnershipType.LEASED}>Leased</option>
                        </ModalSelect>
                     </div>
                     {formData.ownership === OwnershipType.OWNED ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-md">
                            <ModalInput label="Depreciation (₹/day)" type="number" value={(formData.costBasis as OwnedWagon['costBasis']).depreciation} onChange={e => handleCostBasisChange('depreciation', e.target.value)} disabled={isReadOnly} />
                            <ModalInput label="O&M (₹/trip)" type="number" value={formData.costBasis.oAndM} onChange={e => handleCostBasisChange('oAndM', e.target.value)} disabled={isReadOnly} />
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-md">
                            <ModalInput label="Lease Vendor" value={(formData as LeasedWagon).leaseVendor} onChange={e => handleChange('leaseVendor', e.target.value)} disabled={isReadOnly} />
                            <ModalInput label="Lease Expiry" type="date" value={(formData as LeasedWagon).leaseExpiry} onChange={e => handleChange('leaseExpiry', e.target.value)} disabled={isReadOnly} />
                            <ModalInput label="Lease Rate (₹)" type="number" value={(formData.costBasis as LeasedWagon['costBasis']).leaseRate} onChange={e => handleCostBasisChange('leaseRate', e.target.value)} disabled={isReadOnly} />
                            <ModalSelect label="Lease Type" value={(formData.costBasis as LeasedWagon['costBasis']).leaseType} onChange={e => handleCostBasisChange('leaseType', e.target.value)} disabled={isReadOnly}>
                                <option value="day">per day</option>
                                <option value="trip">per trip</option>
                                <option value="km">per km</option>
                            </ModalSelect>
                             <div className="md:col-span-2">
                                <ModalInput label="O&M (₹/trip)" type="number" value={formData.costBasis.oAndM} onChange={e => handleCostBasisChange('oAndM', e.target.value)} disabled={isReadOnly} />
                            </div>
                        </div>
                     )}
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                        {isReadOnly ? 'Close' : 'Cancel'}
                    </button>
                    {!isReadOnly && (
                        <button onClick={handleSaveClick} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                            Save Changes
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main Route & Cost Planner Page Component ---
interface Leg { id: number; title: string; fromId: string | null; toId: string | null; distance: number; fromType: SiteType; toType: SiteType; wagonId: string | null; qty: number; }
interface RouteCostPlannerPageProps { scenario: Scenario; }
type WagonKey = keyof Scenario['comparisonData'];

const WagonParameterCard: React.FC<{
    title: string;
    data: WagonData;
    onParamChange: (field: keyof WagonData, value: number) => void;
    bgColor: string;
}> = ({ title, data, onParamChange, bgColor }) => (
    <div className={`border border-gray-200 rounded-lg p-3 space-y-3 ${bgColor}`}>
        <h4 className="font-semibold text-gray-800 text-center">{title}</h4>
        <WagonParameterInput label="₹/ton-km" type="number" step="0.01" value={data.costPerTonKm || 0} onChange={e => onParamChange('costPerTonKm', Number(e.target.value))} />
        <WagonParameterInput label="Payload" type="number" unit="tons" value={data.payload || 0} onChange={e => onParamChange('payload', Number(e.target.value))} />
        <WagonParameterInput label="Unloading" type="number" step="0.1" unit="hrs/wagon" value={data.unloadingHoursPerWagon || 0} onChange={e => onParamChange('unloadingHoursPerWagon', Number(e.target.value))} />
        <WagonParameterInput label="CO₂" type="number" step="0.0001" unit="kg/ton-km" value={data.co2PerTonKm || 0} onChange={e => onParamChange('co2PerTonKm', Number(e.target.value))} />
        <WagonParameterInput label="ESG Score" type="number" unit="/10" value={data.esgScore || 0} onChange={e => onParamChange('esgScore', Number(e.target.value))} />
    </div>
);

const getFutureDate = (startDate: Date, hours: number): string => {
    const futureDate = new Date(startDate.getTime() + hours * 60 * 60 * 1000);
    return futureDate.toISOString().split('T')[0];
};

const RouteCostPlannerPage: React.FC<RouteCostPlannerPageProps> = ({ scenario }) => {
    const sitesById = useMemo(() => new Map(scenario.sites.map(s => [s.id, s])), [scenario.sites]);
    
    const [legs, setLegs] = useState<Leg[]>([
        { id: 1, title: 'Raw Material ➜ Cement Plant', fromId: 'odisha_mine', toId: 'raipur_plant', distance: 0, fromType: SiteType.RAW_MATERIAL, toType: SiteType.CEMENT_PLANT, wagonId: null, qty: 10000 },
        { id: 2, title: 'Cement Plant ➜ Distribution Hub', fromId: 'raipur_plant', toId: 'kalamboli_hub', distance: 0, fromType: SiteType.CEMENT_PLANT, toType: SiteType.DISTRIBUTION_HUB, wagonId: null, qty: 10000 },
        { id: 3, title: 'Distribution Hub ➜ RMC Unit', fromId: 'kalamboli_hub', toId: 'mumbai_rmc_1', distance: 0, fromType: SiteType.DISTRIBUTION_HUB, toType: SiteType.RMC_PLANT, wagonId: null, qty: 10000 },
    ]);

    const [wagonInventory, setWagonInventory] = useState<Wagon[]>(INITIAL_WAGON_INVENTORY);
    const [inventoryTab, setInventoryTab] = useState<'list' | 'analytics' | 'import'>('list');

    // State for editable wagon parameters
    const [btapParams, setBtapParams] = useState<WagonData>(btapData);
    const [bcfcParams, setBcfcParams] = useState<WagonData>(bcfcData);
    const [othersParams, setOthersParams] = useState<WagonData>(othersData);
    
    // State for Wagon Inventory filters & selections
    const [filters, setFilters] = useState({ query: '', ownership: 'All', types: [] as WagonType[], statuses: [] as WagonStatus[] });
    const [selectedWagonIds, setSelectedWagonIds] = useState<string[]>([]);
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

    // State for wagon editor modal
    const [isWagonModalOpen, setIsWagonModalOpen] = useState(false);
    const [selectedWagonForModal, setSelectedWagonForModal] = useState<Wagon | null>(null);
    const [wagonModalMode, setWagonModalMode] = useState<'view' | 'edit' | 'add'>('view');


    const sitesByType = useMemo(() => {
        return scenario.sites.reduce((acc, site) => {
            if (!acc[site.type]) { acc[site.type] = []; }
            acc[site.type].push(site);
            return acc;
        }, {} as Record<SiteType, Site[]>);
    }, [scenario.sites]);

    const haversineDistance = useCallback((coords1: [number, number], coords2: [number, number]) => {
        if (!coords1 || !coords2) return 0;
        const toRad = (x: number) => (x * Math.PI) / 180;
        const R = 6371; // Earth radius in km
        const dLat = toRad(coords2[0] - coords1[0]);
        const dLon = toRad(coords2[1] - coords1[1]);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(coords1[0])) * Math.cos(toRad(coords2[0])) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }, []);

    useEffect(() => {
        setLegs(currentLegs => currentLegs.map(leg => {
            const fromSite = sitesById.get(leg.fromId || '');
            const toSite = sitesById.get(leg.toId || '');
            return { ...leg, distance: (fromSite && toSite) ? haversineDistance(fromSite.position, toSite.position) : 0 };
        }));
    }, [legs.map(l => l.fromId).join(), legs.map(l => l.toId).join(), sitesById, haversineDistance]);
    
    const getLegETA = (leg: Leg, inventory: Wagon[]): number => {
        let speed = 50, unloading = 2; // Road defaults
        const wagon = inventory.find(w => w.id === leg.wagonId);
        const wagonType = wagon?.type;

        if (wagonType === WagonType.BTAP || wagonType === WagonType.BCFC) {
            speed = 70;
            unloading = wagonType === 'BTAP' ? 2.5 : 5;
        }
        return (leg.distance / speed) + unloading;
    };


    const results = useMemo(() => {
        const totalDistance = legs.reduce((acc, leg) => acc + (leg.qty > 0 ? leg.distance : 0), 0);
        const totalTonKm = legs.reduce((acc, leg) => acc + (leg.distance * leg.qty), 0);
    
        const calculateGenericMetrics = (wagonData: WagonData) => {
            const costPerTonKm = wagonData.costPerTonKm || 0;
            const co2PerTonKm = wagonData.co2PerTonKm || 0;
            const payload = wagonData.payload || 1; 
            const unloadingHours = wagonData.unloadingHoursPerWagon || 0;
            const esgScore = wagonData.esgScore || 0;
    
            let cost = 0, co2 = 0, unloading = 0, weightedEsgSum = 0, travelTime = 0;
    
            for (const leg of legs) {
                if (leg.distance <= 0 || leg.qty <= 0) continue;
                const legTonKm = leg.distance * leg.qty;
                cost += legTonKm * costPerTonKm;
                co2 += (legTonKm * co2PerTonKm) / 1000;
                const numWagons = Math.ceil(leg.qty / payload);
                unloading += numWagons * unloadingHours;
                weightedEsgSum += legTonKm * esgScore;
                const speed = leg.title.toLowerCase().includes('road') ? 50 : 70;
                travelTime += leg.distance / speed;
            }
    
            const esg = totalTonKm > 0 ? weightedEsgSum / totalTonKm : 0;
            return { cost, co2, unloading, esg, travelTime };
        };

        let selectedPlan = { ownershipCost: 0, freightCost: 0, co2: 0, unloading: 0, esg: 0, travelTime: 0 };
        let weightedEsgSum = 0;
        let totalTonKmPlan = 0;

        legs.forEach(leg => {
            if (leg.distance <= 0 || leg.qty <= 0 || !leg.wagonId) return;
            const wagon = wagonInventory.find(w => w.id === leg.wagonId);
            if (!wagon) return;

            const speed = leg.title.toLowerCase().includes('road') ? 50 : 70;
            const travelHours = leg.distance / speed;
            const travelDays = travelHours / 24;
            let legOwnershipCost = 0;

            if (wagon.ownership === OwnershipType.OWNED) {
                legOwnershipCost = wagon.costBasis.oAndM + (wagon.costBasis.depreciation * travelDays);
            } else { 
                let leaseCost = 0;
                switch (wagon.costBasis.leaseType) {
                    case 'day': leaseCost = wagon.costBasis.leaseRate * travelDays; break;
                    case 'trip': leaseCost = wagon.costBasis.leaseRate; break;
                    case 'km': leaseCost = wagon.costBasis.leaseRate * leg.distance; break;
                }
                legOwnershipCost = wagon.costBasis.oAndM + leaseCost;
            }
            selectedPlan.ownershipCost += legOwnershipCost;

            const genericWagonData = wagon.type === WagonType.BTAP ? btapParams : wagon.type === WagonType.BCFC ? bcfcParams : othersParams;
            const costPerTonKm = genericWagonData.costPerTonKm || 0;
            const legTonKm = leg.distance * leg.qty;
            selectedPlan.freightCost += legTonKm * costPerTonKm;
            
            const co2Factor = wagon.co2PerTonKm || genericWagonData.co2PerTonKm || 0;
            selectedPlan.co2 += (legTonKm * co2Factor) / 1000;
            
            const payload = genericWagonData.payload || 60;
            const unloadingHoursPerWagon = genericWagonData.unloadingHoursPerWagon || 1;
            const numWagons = Math.ceil(leg.qty / payload);
            const legUnloading = numWagons * unloadingHoursPerWagon;
            selectedPlan.unloading += legUnloading;
            selectedPlan.travelTime += travelHours;
            
            totalTonKmPlan += legTonKm;
            weightedEsgSum += legTonKm * (genericWagonData.esgScore || 0);
        });
        selectedPlan.esg = totalTonKmPlan > 0 ? weightedEsgSum / totalTonKmPlan : 0;
    
        const btapResults = calculateGenericMetrics(btapParams);
        const bcfcResults = calculateGenericMetrics(bcfcParams);
        const othersResults = calculateGenericMetrics(othersParams);
    
        return {
            totalDistance, totalTonKm, btap: btapResults, bcfc: bcfcResults, others: othersResults, selectedPlan,
            savings: { cost: bcfcResults.cost - btapResults.cost, co2: bcfcResults.co2 - btapResults.co2 }
        };
    }, [legs, btapParams, bcfcParams, othersParams, wagonInventory]);
    
    // --- Wagon Inventory Logic ---
    const filteredWagons = useMemo(() => {
        const query = filters.query.toLowerCase();
        return wagonInventory.filter(w => {
            const locationName = sitesById.get(w.currentLocationId)?.name.toLowerCase() || '';
            const vendorName = w.ownership === OwnershipType.LEASED ? w.leaseVendor.toLowerCase() : '';
            if (query && !w.id.toLowerCase().includes(query) && !locationName.includes(query) && !vendorName.includes(query)) return false;
            if (filters.ownership !== 'All' && w.ownership !== filters.ownership) return false;
            if (filters.types.length > 0 && !filters.types.includes(w.type)) return false;
            if (filters.statuses.length > 0 && !filters.statuses.includes(w.status)) return false;
            return true;
        });
    }, [filters, wagonInventory, sitesById]);
    
    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            selectAllCheckboxRef.current.indeterminate = selectedWagonIds.length > 0 && selectedWagonIds.length < filteredWagons.length;
        }
    }, [selectedWagonIds, filteredWagons]);

    const toggleMultiSelectFilter = (filterType: 'types' | 'statuses', value: WagonType | WagonStatus) => setFilters(f => ({ ...f, [filterType]: f[filterType].includes(value as never) ? f[filterType].filter(v => v !== value) : [...f[filterType], value] }));
    const handleSelectAllWagons = (e: React.ChangeEvent<HTMLInputElement>) => setSelectedWagonIds(e.target.checked ? filteredWagons.map(w => w.id) : []);
    const handleSelectWagon = (id: string) => setSelectedWagonIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);

    // --- Analytics Data Calculation ---
    const analyticsData = useMemo(() => {
        const isLeaseExpiring = (expiry: string) => {
            const diffDays = (new Date(expiry).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
            return diffDays > 0 && diffDays <= 30;
        };

        const totalCount = wagonInventory.length;
        const ownedCount = wagonInventory.filter(w => w.ownership === OwnershipType.OWNED).length;
        const leasedCount = totalCount - ownedCount;
        const maintenanceCount = wagonInventory.filter(w => w.status === WagonStatus.MAINTENANCE).length;
        const expiringCount = wagonInventory.filter(w => w.ownership === OwnershipType.LEASED && isLeaseExpiring(w.leaseExpiry)).length;

        const pieData = [{ name: 'Owned', value: ownedCount }, { name: 'Leased', value: leasedCount }];

        const utilizationData = (Object.values(WagonType)).map(type => {
            const wagonsOfType = wagonInventory.filter(w => w.type === type);
            const inTransit = wagonsOfType.filter(w => w.status === WagonStatus.IN_TRANSIT).length;
            const available = wagonsOfType.filter(w => w.status === WagonStatus.AVAILABLE).length;
            const totalOperational = inTransit + available;
            const utilization = totalOperational > 0 ? (inTransit / totalOperational) * 100 : 0;
            return { type, utilization, total: wagonsOfType.length };
        }).filter(d => d.total > 0);

        let ownedCost = 0;
        let leasedCost = 0;
        wagonInventory.forEach(wagon => {
            if (wagon.ownership === OwnershipType.OWNED) {
                ownedCost += (wagon.costBasis.depreciation * 30) + wagon.costBasis.oAndM;
            } else {
                let monthlyLease = 0;
                switch (wagon.costBasis.leaseType) {
                    case 'day': monthlyLease = wagon.costBasis.leaseRate * 30; break;
                    case 'trip': monthlyLease = wagon.costBasis.leaseRate * 2; break; // Assume 2 trips/month
                    case 'km': monthlyLease = wagon.costBasis.leaseRate * 2200; break; // Assume 2 trips of 1100km
                }
                leasedCost += monthlyLease + wagon.costBasis.oAndM;
            }
        });

        const costSplitData = [{ name: 'Last 30 Days', 'Owned O&M': ownedCost / 100000, 'Lease Costs': leasedCost / 100000 }];

        return { kpis: { totalCount, ownedCount, leasedCount, maintenanceCount, expiringCount }, pieData, utilizationData, costSplitData };
    }, [wagonInventory]);

    // --- Wagon Action Handlers ---
    const handleViewWagon = (wagon: Wagon) => { setSelectedWagonForModal(wagon); setWagonModalMode('view'); setIsWagonModalOpen(true); };
    const handleEditWagon = (wagon: Wagon) => { setSelectedWagonForModal(wagon); setWagonModalMode('edit'); setIsWagonModalOpen(true); };
    const handleDuplicateWagon = (wagonToDuplicate: Wagon) => {
        const newWagon = JSON.parse(JSON.stringify(wagonToDuplicate));
        newWagon.id = `${wagonToDuplicate.id.split('-copy-')[0]}-copy-${Date.now()}`;
        setSelectedWagonForModal(newWagon);
        setWagonModalMode('add');
        setIsWagonModalOpen(true);
    };
    const handleDeleteWagon = (wagonId: string) => {
        if (window.confirm(`Are you sure you want to delete wagon ${wagonId}? This action cannot be undone.`)) {
            setWagonInventory(prev => prev.filter(w => w.id !== wagonId));
        }
    };
    const handleAddWagon = () => {
        const newWagon: Wagon = { id: `WGN-${Date.now()}`, type: WagonType.BTAP, capacity: 60, status: WagonStatus.AVAILABLE, currentLocationId: scenario.sites[0]?.id || '', maintenanceDueDate: new Date().toISOString().split('T')[0], ownership: OwnershipType.OWNED, costBasis: { depreciation: 1500, oAndM: 5000 } };
        setSelectedWagonForModal(newWagon);
        setWagonModalMode('add');
        setIsWagonModalOpen(true);
    };
    const handleSaveWagon = (wagonToSave: Wagon) => {
        setWagonInventory(prev => {
            const exists = prev.some(w => w.id === wagonToSave.id);
            if (exists) {
                return prev.map(w => w.id === wagonToSave.id ? wagonToSave : w);
            } else {
                return [...prev, wagonToSave];
            }
        });
        setIsWagonModalOpen(false);
        setSelectedWagonForModal(null);
    };

    // --- Helper Render Functions ---
    const renderCostBasis = (wagon: Wagon) => {
        if (wagon.ownership === OwnershipType.OWNED) {
            return <div className="text-xs"> <p><strong>Dep:</strong> ₹{wagon.costBasis.depreciation.toLocaleString()}/day</p> <p><strong>O&M:</strong> ₹{wagon.costBasis.oAndM.toLocaleString()}/trip</p> </div>;
        }
        return <div className="text-xs"> <p><strong>Lease:</strong> ₹{wagon.costBasis.leaseRate.toLocaleString()}/{wagon.costBasis.leaseType}</p> <p><strong>O&M:</strong> ₹{wagon.costBasis.oAndM.toLocaleString()}/trip</p> </div>;
    };
    const getLeaseExpiryBadge = (expiry: string) => {
        const diffDays = (new Date(expiry).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
        if (diffDays <= 7) return 'bg-red-100 text-red-700';
        if (diffDays <= 30) return 'bg-yellow-100 text-yellow-700';
        if (diffDays <= 60) return 'bg-blue-100 text-blue-700';
        return 'hidden';
    };
    const getStatusChipClass = (status: WagonStatus) => {
        if (status === WagonStatus.AVAILABLE) return 'bg-green-100 text-green-700';
        if (status === WagonStatus.IN_TRANSIT) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };
    const FilterChip: React.FC<{label: string, isSelected: boolean, onClick:()=>void}> = ({label,isSelected,onClick})=>(<button onClick={onClick} className={`px-2 py-1 text-xs rounded-full border ${isSelected ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>{label}</button>);
    
    // --- Event Handlers ---
    const handleLegChange = (id: number, field: keyof Leg, value: string) => {
        setLegs(currentLegs => {
            const oldLegs = currentLegs;
            const newLegs = oldLegs.map(leg =>
                leg.id === id ? { ...leg, [field]: field === 'qty' ? Number(value) : value } : leg
            );
    
            if (field === 'wagonId') {
                const oldWagonId = oldLegs.find(l => l.id === id)?.wagonId;
                const newWagonId = value;
    
                if (oldWagonId !== newWagonId) {
                    setWagonInventory(currentInventory => {
                        let inventory = [...currentInventory];
                        if (oldWagonId) {
                            inventory = inventory.map(w => w.id === oldWagonId ? { ...w, status: WagonStatus.AVAILABLE, periodFrom: undefined, periodTo: undefined } : w);
                        }
                        if (newWagonId) {
                            const updatedLeg = newLegs.find(l => l.id === id);
                            if (updatedLeg) {
                                const etaHours = getLegETA(updatedLeg, inventory);
                                const today = new Date();
                                inventory = inventory.map(w => w.id === newWagonId ? {
                                    ...w,
                                    status: WagonStatus.IN_TRANSIT,
                                    periodFrom: today.toISOString().split('T')[0],
                                    periodTo: getFutureDate(today, etaHours)
                                } : w);
                            }
                        }
                        return inventory;
                    });
                }
            }
            return newLegs;
        });
    };

    const handleWagonParamChange = (
        setter: React.Dispatch<React.SetStateAction<WagonData>>,
        field: keyof WagonData,
        value: number
    ) => {
        setter(prev => ({ ...prev, [field]: value }));
    };
    
    return (
        <div className="flex-1 p-6 bg-gray-100 overflow-y-auto text-gray-700">
             <WagonEditorModal
                isOpen={isWagonModalOpen}
                onClose={() => setIsWagonModalOpen(false)}
                onSave={handleSaveWagon}
                wagon={selectedWagonForModal}
                mode={wagonModalMode}
                sites={scenario.sites}
            />
            <h1 className="text-3xl font-bold text-blue-900 mb-6">Route Planner & Cost Calculator</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Section title="Scenario Setup">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Route Planner</h4>
                    {legs.map(leg => {
                        const availableWagonsForLeg = wagonInventory.filter(w =>
                            (w.currentLocationId === leg.fromId && w.status === WagonStatus.AVAILABLE) || w.id === leg.wagonId
                        );
                        return (
                            <div key={leg.id} className="p-3 bg-gray-50 rounded-lg mb-3 last:mb-0">
                                <p className="font-semibold text-gray-700 mb-2 text-sm">{leg.title}</p>
                                <div className="grid grid-cols-2 gap-3 items-center">
                                    <select value={leg.fromId || ''} onChange={e => handleLegChange(leg.id, 'fromId', e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-1 focus:ring-green-500 text-sm"><option value="">Select From...</option>{(sitesByType[leg.fromType] || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                                    <select value={leg.toId || ''} onChange={e => handleLegChange(leg.id, 'toId', e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-1 focus:ring-green-500 text-sm"><option value="">Select To...</option>{(sitesByType[leg.toType] || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                                </div>
                                <div className="grid grid-cols-2 gap-3 items-center mt-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Wagon</label>
                                        <select value={leg.wagonId || ''} onChange={e => handleLegChange(leg.id, 'wagonId', e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-1 focus:ring-green-500 text-sm" disabled={!leg.fromId}>
                                            <option value="">{leg.fromId ? (availableWagonsForLeg.length > 0 || leg.wagonId ? 'Select Wagon...' : 'No wagons available') : 'Select "From" first'}</option>
                                            {availableWagonsForLeg.map(w => (
                                                <option key={w.id} value={w.id}>{w.id} ({w.type} - {w.capacity}t)</option>
                                            ))}
                                        </select>
                                    </div>
                                    <Input label="Quantity" type="number" unit="tons" value={leg.qty} onChange={e => handleLegChange(leg.id, 'qty', e.target.value)} />
                                </div>
                                <p className="text-right text-xs mt-2 text-gray-500">Distance: {leg.distance.toFixed(0)} km</p>
                            </div>
                        );
                    })}
                </Section>
                <Section title="Calculated Results">
                    <div className="p-4 bg-gray-50 rounded-lg text-center mb-4">
                        <p className="text-sm text-gray-500">Total Planned Cost</p>
                        <p className="text-4xl font-bold text-blue-900">₹{(results.selectedPlan.ownershipCost + results.selectedPlan.freightCost).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                         <p className="text-sm text-gray-500 mt-2">
                            Distance: <span className="font-semibold text-gray-700">{results.totalDistance.toFixed(0).toLocaleString()} km</span> | 
                            Ton-km: <span className="font-semibold text-gray-700">{results.totalTonKm.toFixed(0).toLocaleString()}</span>
                        </p>
                    </div>

                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 text-left font-semibold text-gray-600 uppercase">Metric</th>
                                    <th className="p-3 text-right font-semibold text-blue-600 uppercase bg-blue-50 border-x">Selected Wagons</th>
                                    <th className="p-3 text-right font-semibold text-green-600 uppercase">BTAP</th>
                                    <th className="p-3 text-right font-semibold text-orange-500 uppercase">BCFC</th>
                                    <th className="p-3 text-right font-semibold text-gray-500 uppercase">Others</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="p-3 font-medium text-gray-800">Freight Cost <span className="text-gray-400 text-xs">(per ton-km)</span></td>
                                    <td className="p-3 text-right font-semibold text-blue-600 bg-blue-50 border-x">₹{results.selectedPlan.freightCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                    <td className="p-3 text-right font-semibold">₹{results.btap.cost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                    <td className="p-3 text-right font-semibold">₹{results.bcfc.cost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                    <td className="p-3 text-right font-semibold">₹{results.others.cost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                </tr>
                                 <tr>
                                    <td className="p-3 font-medium text-gray-800">Ownership Cost <span className="text-gray-400 text-xs">(Lease/Dep.)</span></td>
                                    <td className="p-3 text-right font-bold text-blue-600 bg-blue-50 border-x">₹{results.selectedPlan.ownershipCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                    <td className="p-3 text-center text-gray-400 font-semibold">—</td>
                                    <td className="p-3 text-center text-gray-400 font-semibold">—</td>
                                    <td className="p-3 text-center text-gray-400 font-semibold">—</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium text-gray-800">Total CO₂</td>
                                    <td className="p-3 text-right font-semibold text-blue-600 bg-blue-50 border-x">{results.selectedPlan.co2.toFixed(1)} tons</td>
                                    <td className="p-3 text-right font-semibold">{results.btap.co2.toFixed(1)} tons</td>
                                    <td className="p-3 text-right font-semibold">{results.bcfc.co2.toFixed(1)} tons</td>
                                    <td className="p-3 text-right font-semibold">{results.others.co2.toFixed(1)} tons</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium text-gray-800">Total Unloading</td>
                                    <td className="p-3 text-right font-semibold text-blue-600 bg-blue-50 border-x">{results.selectedPlan.unloading.toFixed(1)} hrs</td>
                                    <td className="p-3 text-right font-semibold">{results.btap.unloading.toFixed(1)} hrs</td>
                                    <td className="p-3 text-right font-semibold">{results.bcfc.unloading.toFixed(1)} hrs</td>
                                    <td className="p-3 text-right font-semibold">{results.others.unloading.toFixed(1)} hrs</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium text-gray-800">Total Travel Time</td>
                                     <td className="p-3 text-right font-semibold text-blue-600 bg-blue-50 border-x">{results.selectedPlan.travelTime.toFixed(1)} hrs</td>
                                    <td className="p-3 text-right font-semibold">{results.btap.travelTime.toFixed(1)} hrs</td>
                                    <td className="p-3 text-right font-semibold">{results.bcfc.travelTime.toFixed(1)} hrs</td>
                                    <td className="p-3 text-right font-semibold">{results.others.travelTime.toFixed(1)} hrs</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium text-gray-800">ESG Score</td>
                                    <td className="p-3 text-right font-semibold text-blue-600 bg-blue-50 border-x">{results.selectedPlan.esg.toFixed(1)}/10</td>
                                    <td className="p-3 text-right font-semibold">{results.btap.esg.toFixed(1)}/10</td>
                                    <td className="p-3 text-right font-semibold">{results.bcfc.esg.toFixed(1)}/10</td>
                                    <td className="p-3 text-right font-semibold">{results.others.esg.toFixed(1)}/10</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                        <p className="font-semibold text-green-700">BTAP Savings vs BCFC</p>
                        <p className="text-lg font-bold text-gray-800 mt-1">
                            Cost: <span className="text-green-600">₹{results.savings.cost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span> | CO₂: <span className="text-green-600">{results.savings.co2.toFixed(1)} tons</span>
                        </p>
                    </div>
                </Section>
                <div className="lg:col-span-2">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col">
                        <h3 className="text-lg font-semibold mb-2 text-green-700 flex-shrink-0">Wagon Inventory</h3>
                        <div className="flex border-b border-gray-200 mb-0">
                            <button onClick={()=>setInventoryTab('list')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${inventoryTab==='list'?'border-green-600 text-green-700':'border-transparent text-gray-500 hover:text-gray-700'}`}><ListIcon className="w-4 h-4"/> Master List</button>
                            <button onClick={()=>setInventoryTab('analytics')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${inventoryTab==='analytics'?'border-green-600 text-green-700':'border-transparent text-gray-500 hover:text-gray-700'}`}><ChartBarIcon className="w-4 h-4"/> Analytics</button>
                            <button onClick={()=>setInventoryTab('import')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${inventoryTab==='import'?'border-green-600 text-green-700':'border-transparent text-gray-500 hover:text-gray-700'}`}><UploadIcon className="w-4 h-4"/> Bulk Import</button>
                        </div>
                        <div className="flex-grow min-h-0">
                            {inventoryTab === 'list' && (
                                <div className="flex flex-col h-full">
                                    <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-2 p-2 bg-gray-50/70 border-b border-gray-200">
                                        <div className="flex items-center gap-2"><button onClick={handleAddWagon} className="text-sm bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700">Add Wagon</button><button className="text-sm bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-100">Import</button><button className="text-sm bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-100">Export</button></div>
                                        <input type="text" placeholder="Quick search..." value={filters.query} onChange={e => setFilters(f => ({...f, query: e.target.value}))} className="w-full sm:w-52 text-sm border-gray-300 rounded-md p-1.5" />
                                    </div>
                                    <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-2 border-b border-gray-200 text-sm">
                                        <div className="flex items-center gap-3"><span className="font-semibold text-gray-600">Ownership:</span> {['All', ...Object.values(OwnershipType)].map(o => (<label key={o} className="flex items-center gap-1.5"><input type="radio" name="ownership" value={o} checked={filters.ownership === o} onChange={e => setFilters(f => ({...f, ownership: e.target.value}))} />{o}</label>))}</div>
                                        <div className="flex items-center gap-2 flex-wrap"><span className="font-semibold text-gray-600">Type:</span>{Object.values(WagonType).map(t=>(<FilterChip key={t} label={t} isSelected={filters.types.includes(t)} onClick={()=>toggleMultiSelectFilter('types', t)}/>))}</div>
                                        <div className="flex items-center gap-2 flex-wrap"><span className="font-semibold text-gray-600">Status:</span>{Object.values(WagonStatus).map(s=>(<FilterChip key={s} label={s} isSelected={filters.statuses.includes(s)} onClick={()=>toggleMultiSelectFilter('statuses', s)}/>))}</div>
                                    </div>
                                    {selectedWagonIds.length > 0 && <div className="flex-shrink-0 p-2 bg-blue-50 border-b border-blue-200 flex items-center gap-4"><p className="text-sm text-blue-800">{selectedWagonIds.length} selected</p><select className="text-sm p-1 rounded-md border-gray-300"><option>Bulk Actions...</option><option>Update Status</option><option>Assign Depot</option><option>Export CSV</option></select></div>}
                                    <div className="flex-grow overflow-auto">
                                        {filteredWagons.length > 0 ? (
                                        <table className="w-full text-xs text-left whitespace-nowrap">
                                            <thead className="text-gray-500 uppercase bg-gray-100 sticky top-0 z-10"><tr><th className="p-2 w-4"><input ref={selectAllCheckboxRef} type="checkbox" onChange={handleSelectAllWagons} checked={filteredWagons.length > 0 && selectedWagonIds.length === filteredWagons.length} /></th><th className="p-2">Wagon ID</th><th className="p-2">Type</th><th className="p-2">Capacity</th><th className="p-2">Ownership</th><th className="p-2">Lease Vendor</th><th className="p-2">Lease Expiry</th><th className="p-2">Cost Basis</th><th className="p-2">Status</th><th className="p-2">Period From</th><th className="p-2">Period To</th><th className="p-2">Location</th><th className="p-2">Actions</th></tr></thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredWagons.map(w=>(<tr key={w.id} className="hover:bg-gray-50">
                                                    <td className="p-2"><input type="checkbox" checked={selectedWagonIds.includes(w.id)} onChange={()=>handleSelectWagon(w.id)}/></td>
                                                    <td className="p-2 font-mono text-blue-600 hover:underline cursor-pointer">{w.id}</td><td className="p-2 font-semibold">{w.type}</td><td className="p-2">{w.capacity}t</td><td className="p-2">{w.ownership}</td>
                                                    <td className="p-2">{w.ownership === OwnershipType.LEASED ? w.leaseVendor : '—'}</td>
                                                    <td className="p-2">{w.ownership === OwnershipType.LEASED ? <span className={`px-2 py-0.5 rounded-full font-medium ${getLeaseExpiryBadge(w.leaseExpiry)}`}>{w.leaseExpiry}</span> : '—'}</td>
                                                    <td className="p-2">{renderCostBasis(w)}</td>
                                                    <td className="p-2"><span className={`px-2 py-0.5 rounded-full font-medium ${getStatusChipClass(w.status)}`}>{w.status}</span></td>
                                                    {w.status === WagonStatus.AVAILABLE ? (
                                                        <>
                                                            <td className="p-2 text-center text-gray-400"><CalendarIcon className="w-4 h-4 mx-auto" title="Not applicable" /></td>
                                                            <td className="p-2 text-center text-gray-400"><CalendarIcon className="w-4 h-4 mx-auto" title="Not applicable" /></td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="p-2">{w.periodFrom || 'N/A'}</td>
                                                            <td className="p-2">{w.periodTo || 'N/A'}</td>
                                                        </>
                                                    )}
                                                     <td className="p-2">{sitesById.get(w.currentLocationId)?.name || 'Unknown'}</td>
                                                     <td className="p-2"><div className="flex items-center gap-1">
                                                        <button onClick={() => handleViewWagon(w)} className="p-1 text-gray-500 hover:bg-gray-200 rounded-md" title="View"><EyeIcon className="w-4 h-4"/></button>
                                                        <button onClick={() => handleEditWagon(w)} className="p-1 text-gray-500 hover:bg-gray-200 rounded-md" title="Edit"><PencilIcon className="w-4 h-4"/></button>
                                                        <button onClick={() => handleDuplicateWagon(w)} className="p-1 text-gray-500 hover:bg-gray-200 rounded-md" title="Duplicate"><DuplicateIcon className="w-4 h-4"/></button>
                                                        <button onClick={() => handleDeleteWagon(w.id)} className="p-1 text-gray-500 hover:bg-gray-200 rounded-md" title="Delete"><TrashIcon className="w-4 h-4"/></button>
                                                     </div></td>
                                                </tr>))}
                                            </tbody>
                                        </table>) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center p-4 text-gray-500"><WagonIcon className="w-16 h-16 text-gray-300 mb-2"/><h4 className="font-semibold text-gray-600">No wagons match your filters.</h4><p>Try adjusting your search or import new data.</p></div>)}
                                    </div>
                                </div>
                            )}
                            {inventoryTab === 'analytics' && (
                                <div className="p-4 space-y-6 h-full overflow-y-auto bg-gray-50/50 rounded-b-lg">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                        <KPICard title="Total Wagons" value={analyticsData.kpis.totalCount} icon={<WagonIcon className="w-5 h-5"/>} />
                                        <KPICard title="Owned" value={analyticsData.kpis.ownedCount} icon={<BuildingIcon className="w-5 h-5"/>} />
                                        <KPICard title="Leased" value={analyticsData.kpis.leasedCount} icon={<KeyIcon className="w-5 h-5"/>} />
                                        <KPICard title="Maintenance" value={analyticsData.kpis.maintenanceCount} icon={<WrenchIcon className="w-5 h-5"/>} />
                                        <KPICard title="Expiring in 30d" value={analyticsData.kpis.expiringCount} icon={<ClockIcon className="w-5 h-5"/>} />
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                            <h4 className="font-semibold text-gray-700 mb-2">Owned vs. Leased</h4>
                                            <ResponsiveContainer width="100%" height={200}>
                                                <PieChart>
                                                    <Pie data={analyticsData.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                        <Cell fill="#2ecc71" /><Cell fill="#3498db" />
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                            <h4 className="font-semibold text-gray-700 mb-2">Utilization % (Current)</h4>
                                            <div className="space-y-2">
                                                {analyticsData.utilizationData.map(item => (
                                                    <div key={item.type}>
                                                        <div className="flex justify-between items-center text-sm mb-1">
                                                            <span className="font-medium text-gray-600">{item.type}</span>
                                                            <span className="font-bold text-green-600">{item.utilization.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{width: `${item.utilization}%`}}></div></div>
                                                            <Sparkline />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-semibold text-gray-700 mb-2">Est. 30-Day Cost Split (₹ Lakhs)</h4>
                                        <ResponsiveContainer width="100%" height={80}>
                                            <BarChart data={analyticsData.costSplitData} layout="vertical" margin={{top: 5, right: 20, left: 10, bottom: 5}}>
                                                <XAxis type="number" hide />
                                                <YAxis type="category" dataKey="name" hide />
                                                <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}L`} />
                                                <Legend />
                                                <Bar dataKey="Owned O&M" stackId="a" fill="#27ae60" />
                                                <Bar dataKey="Lease Costs" stackId="a" fill="#2980b9" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                            {inventoryTab === 'import' && <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-gray-50 rounded-b-lg"><h4 className="text-md font-semibold text-gray-700">Bulk Import Wagon Data</h4><p className="text-sm text-gray-500 mt-1 mb-4">Upload a CSV file with your wagon inventory.</p><input type="file" className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/></div>}
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4 text-green-700">Wagon Parameters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <WagonParameterCard title="BTAP Wagon" data={btapParams} onParamChange={(field, value) => handleWagonParamChange(setBtapParams, field, value)} bgColor="bg-green-50/50" />
                            <WagonParameterCard title="BCFC Wagon" data={bcfcParams} onParamChange={(field, value) => handleWagonParamChange(setBcfcParams, field, value)} bgColor="bg-orange-50/50" />
                            <WagonParameterCard title="Others" data={othersParams} onParamChange={(field, value) => handleWagonParamChange(setOthersParams, field, value)} bgColor="bg-gray-100" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteCostPlannerPage;
