


import React, { useState, useMemo, useEffect } from 'react';
import type { Site, Scenario, WagonData } from '../types';
import { SiteType } from '../types';

interface DataUpdatePageProps {
  scenarios: Scenario[];
  setScenarios: React.Dispatch<React.SetStateAction<Scenario[]>>;
  activeScenario: Scenario | null;
  setActiveScenarioId: React.Dispatch<React.SetStateAction<string | null>>;
}

// Helper Icons
const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
            active 
            ? 'border-green-600 text-green-700 bg-white' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        {children}
    </button>
);

const InputField: React.FC<{label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, step?: string}> = ({label, value, onChange, type='text', step}) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input
            type={type}
            step={step}
            value={value}
            onChange={onChange}
            className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
    </div>
);

const SiteEditorModal: React.FC<{
    site: Omit<Site, 'id'> | Site | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (siteData: Omit<Site, 'id'> | Site) => void;
}> = ({ site, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Site, 'id'> | Site | null>(null);

    useEffect(() => {
        if (site) {
            setFormData(JSON.parse(JSON.stringify(site))); // Deep copy to avoid mutating prop
        }
    }, [site]);

    if (!isOpen || !formData) return null;

    const isNewSite = !('id' in formData);
    const title = isNewSite ? "Add New Site" : "Edit Site";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof Site) => {
        let value: any = e.target.value;
        if (field === 'position') {
            const [lat, lng] = e.target.value.split(',').map(s => parseFloat(s.trim()));
            value = [lat || 0, lng || 0];
        }

        const updatedFormData = { ...formData, [field]: value };

        if (field === 'type' && value !== SiteType.RAW_MATERIAL) {
            delete updatedFormData.subType;
        } else if (field === 'type' && value === SiteType.RAW_MATERIAL && !updatedFormData.subType) {
            updatedFormData.subType = 'Limestone';
        }

        setFormData(updatedFormData);
    };

    const handleSaveClick = () => {
        if (!formData.name) {
            alert("Site name is required.");
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-blue-900 mb-6">{title}</h2>
                <div className="space-y-4">
                    <InputField label="Site Name" value={formData.name} onChange={e => handleChange(e, 'name')} />
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                        <select
                            value={formData.type}
                            onChange={e => handleChange(e, 'type')}
                            className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        >
                            {Object.values(SiteType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    {formData.type === SiteType.RAW_MATERIAL && (
                        <div>
                             <label className="block text-sm font-medium text-gray-600 mb-1">Sub-Type</label>
                             <select
                                value={formData.subType || 'Limestone'}
                                onChange={e => handleChange(e, 'subType')}
                                className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            >
                                <option value="Limestone">Limestone</option>
                                <option value="Fly Ash">Fly Ash</option>
                                <option value="Gypsum">Gypsum</option>
                                <option value="Slag">Slag</option>
                                <option value="Alumina">Alumina</option>
                                <option value="Coal or Lignite">Coal or Lignite</option>
                            </select>
                        </div>
                    )}
                     <InputField label="Position (Lat, Lng)" value={Array.isArray(formData.position) ? formData.position.join(', ') : '0, 0'} onChange={e => handleChange(e, 'position')} />
                     <InputField label="Information" value={formData.info} onChange={e => handleChange(e, 'info')} />
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSaveClick} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};


const SiteManagement: React.FC<{ sites: Site[], onUpdate: (sites: Site[]) => void }> = ({ sites, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSite, setEditingSite] = useState<Omit<Site, 'id'> | Site | null>(null);

    const handleAddNewStart = () => {
        setEditingSite({
            name: '',
            type: SiteType.RAW_MATERIAL,
            subType: 'Limestone',
            position: [0, 0],
            info: ''
        });
        setIsModalOpen(true);
    };

    const handleEditStart = (site: Site) => {
        setEditingSite(site);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingSite(null);
    };

    const handleModalSave = (siteData: Omit<Site, 'id'> | Site) => {
        if ('id' in siteData) { // Editing existing site
            onUpdate(sites.map(s => s.id === siteData.id ? siteData : s));
        } else { // Adding new site
            const newSiteWithId: Site = { ...siteData, id: `site_${Date.now()}`};
            onUpdate([...sites, newSiteWithId]);
        }
        handleModalClose();
    };

    const handleDelete = (siteId: string) => {
        if (window.confirm('Are you sure you want to delete this site?')) {
            onUpdate(sites.filter(s => s.id !== siteId));
        }
    }

    return (
        <>
            <SiteEditorModal 
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSave={handleModalSave}
                site={editingSite}
            />
            <div className="bg-white p-4 rounded-b-lg rounded-r-lg">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-semibold text-blue-900">Manage Layers & Sites</h3>
                     <button onClick={handleAddNewStart} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2">
                        <PlusIcon className="h-5 w-5"/> Add New Site
                    </button>
                </div>
                 <div className="max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-100 sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-3">Name</th>
                                <th scope="col" className="px-4 py-3">Type</th>
                                <th scope="col" className="px-4 py-3">Position (Lat, Lng)</th>
                                 <th scope="col" className="px-4 py-3">Info</th>
                                <th scope="col" className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sites.map(site => (
                                <tr key={site.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-4 py-2">{site.name}</td>
                                    <td className="px-4 py-2">{`${site.type}${site.subType ? ` (${site.subType})` : ''}`}</td>
                                    <td className="px-4 py-2">{site.position.join(', ')}</td>
                                    <td className="px-4 py-2">{site.info}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center space-x-4">
                                            <button onClick={() => handleEditStart(site)} className="font-medium text-green-600 hover:underline text-sm">Edit</button>
                                            <button onClick={() => handleDelete(site.id)} className="font-medium text-red-600 hover:underline text-sm">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </>
    );
};

const RegionManagement: React.FC<{ regions: string[], onUpdate: (regions: string[]) => void }> = ({ regions, onUpdate }) => {
    const [editingRegion, setEditingRegion] = useState<string | null>(null);
    const [tempName, setTempName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');

    const handleRenameStart = (region: string) => {
        setEditingRegion(region);
        setTempName(region);
    };

    const handleRenameCancel = () => {
        setEditingRegion(null);
        setTempName('');
    };

    const handleRenameSave = () => {
        if (!tempName.trim()) {
            alert("Region name cannot be empty.");
            return;
        }
        onUpdate(regions.map(r => r === editingRegion ? tempName.trim() : r));
        handleRenameCancel();
    };

    const handleDelete = (regionName: string) => {
        if(window.confirm('Are you sure you want to delete this region?')) {
            onUpdate(regions.filter(r => r !== regionName));
        }
    }
    
    const handleAddStart = () => setIsAdding(true);
    const handleAddCancel = () => {
        setIsAdding(false);
        setNewName('');
    };
    const handleAddSave = () => {
        if (!newName.trim()) {
            alert("Region name cannot be empty.");
            return;
        }
        if (regions.includes(newName.trim())) {
            alert("This region already exists.");
            return;
        }
        onUpdate([...regions, newName.trim()]);
        handleAddCancel();
    }


    return (
        <div className="bg-white p-4 rounded-b-lg rounded-r-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-blue-900">Manage Regions/Zones</h3>
                 <button onClick={handleAddStart} disabled={isAdding} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2 disabled:bg-gray-400">
                    <PlusIcon className="h-5 w-5"/> Add New Region
                </button>
            </div>
            <ul className="space-y-2">
                {regions.map(region => (
                    <li key={region} className="bg-gray-100 p-2 rounded-md flex justify-between items-center">
                        {editingRegion === region ? (
                             <>
                                <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} className="bg-white rounded p-1 w-full border border-gray-300" autoFocus />
                                <div className="flex items-center space-x-2 ml-2">
                                    <button onClick={handleRenameSave} className="p-1 text-green-600 hover:bg-gray-200 rounded-md" title="Save"><CheckIcon className="h-5 w-5"/></button>
                                    <button onClick={handleRenameCancel} className="p-1 text-red-600 hover:bg-gray-200 rounded-md" title="Cancel"><XIcon className="h-5 w-5"/></button>
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="text-gray-800">{region}</span>
                                <div className="space-x-2">
                                    <button onClick={() => handleRenameStart(region)} className="font-medium text-green-600 hover:underline text-sm">Rename</button>
                                    <button onClick={() => handleDelete(region)} className="font-medium text-red-600 hover:underline text-sm">Delete</button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
                {isAdding && (
                     <li className="bg-gray-100 p-2 rounded-md flex justify-between items-center">
                        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="bg-white rounded p-1 w-full border border-gray-300" placeholder="New Region Name" autoFocus />
                        <div className="flex items-center space-x-2 ml-2">
                            <button onClick={handleAddSave} className="p-1 text-green-600 hover:bg-gray-200 rounded-md" title="Save"><CheckIcon className="h-5 w-5"/></button>
                            <button onClick={handleAddCancel} className="p-1 text-red-600 hover:bg-gray-200 rounded-md" title="Cancel"><XIcon className="h-5 w-5"/></button>
                        </div>
                     </li>
                )}
            </ul>
        </div>
    );
};

const ScenarioManagement: React.FC<{ scenario: Scenario, onUpdate: (scenario: Scenario) => void }> = ({ scenario, onUpdate }) => {
    const [editableScenario, setEditableScenario] = useState(scenario);

    useEffect(() => {
        setEditableScenario(scenario);
    }, [scenario]);

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>, milestone: keyof Scenario['costBreakdown'], field: 'costL' | 'costPerKg') => {
        const { value } = e.target;
        setEditableScenario(prev => ({
            ...prev,
            costBreakdown: {
                ...prev.costBreakdown,
                [milestone]: {
                    ...prev.costBreakdown[milestone],
                    [field]: parseFloat(value)
                }
            }
        }));
    };
    
    const handleWagonChange = (e: React.ChangeEvent<HTMLInputElement>, wagonType: 'btap' | 'bcfc', field: keyof WagonData) => {
        const { value } = e.target;
        const isNumericField = ['costPerTonKm', 'esgScore', 'co2PerTon'].includes(field);

        setEditableScenario(prev => ({
            ...prev,
            comparisonData: {
                ...prev.comparisonData,
                [wagonType]: {
                    ...prev.comparisonData[wagonType],
                    [field]: isNumericField ? parseFloat(value) : value
                }
            }
        }));
    }

    const handleSave = () => {
        onUpdate(editableScenario);
        alert('Scenario data saved!');
    }

    return (
        <div className="bg-white p-4 rounded-b-lg rounded-r-lg max-h-[75vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-blue-900">Manage Scenario Data: {scenario.title}</h3>
                <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                    Save Changes
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cost Milestones */}
                <div>
                    <h4 className="text-lg font-semibold text-green-700 mb-3 border-b border-gray-200 pb-2">Cost & Milestones Data</h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50/70 rounded-md">
                            <InputField label="Raw Material Landed Cost (L)" value={editableScenario.costBreakdown.rawMaterialLanded.costL} onChange={e => handleCostChange(e, 'rawMaterialLanded', 'costL')} type="number" step="0.01"/>
                            <InputField label="Raw Material Cost/kg" value={editableScenario.costBreakdown.rawMaterialLanded.costPerKg} onChange={e => handleCostChange(e, 'rawMaterialLanded', 'costPerKg')} type="number" step="0.01"/>
                        </div>
                         <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50/70 rounded-md">
                            <InputField label="Hub to RMC Dispatch Cost (L)" value={editableScenario.costBreakdown.hubToRmcDispatch.costL} onChange={e => handleCostChange(e, 'hubToRmcDispatch', 'costL')} type="number" step="0.01"/>
                            <InputField label="Hub to RMC Dispatch Cost/kg" value={editableScenario.costBreakdown.hubToRmcDispatch.costPerKg} onChange={e => handleCostChange(e, 'hubToRmcDispatch', 'costPerKg')} type="number" step="0.01"/>
                        </div>
                         <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50/70 rounded-md">
                            <InputField label="ESG Overhead Cost (L)" value={editableScenario.costBreakdown.esgOverhead.costL} onChange={e => handleCostChange(e, 'esgOverhead', 'costL')} type="number" step="0.01"/>
                            <InputField label="ESG Overhead Cost/kg" value={editableScenario.costBreakdown.esgOverhead.costPerKg} onChange={e => handleCostChange(e, 'esgOverhead', 'costPerKg')} type="number" step="0.01"/>
                        </div>
                    </div>
                </div>

                {/* BTAP vs BCFC Comparator */}
                <div>
                    <h4 className="text-lg font-semibold text-green-700 mb-3 border-b border-gray-200 pb-2">BTAP vs BCFC Comparator Data</h4>
                    <div className="grid grid-cols-2 gap-6">
                        {/* BTAP Form */}
                        <div className="space-y-3 p-3 bg-gray-50/70 rounded-md">
                            <h5 className="text-md font-bold text-green-600">BTAP Wagon</h5>
                            <InputField label="Cost / ton-km" value={editableScenario.comparisonData.btap.costPerTonKm} onChange={e => handleWagonChange(e, 'btap', 'costPerTonKm')} type="number" step="0.01"/>
                            <InputField label="Turnaround Time" value={editableScenario.comparisonData.btap.turnaroundTime} onChange={e => handleWagonChange(e, 'btap', 'turnaroundTime')} />
                            <InputField label="Unloading Cost" value={editableScenario.comparisonData.btap.unloadingCost} onChange={e => handleWagonChange(e, 'btap', 'unloadingCost')} />
                            <InputField label="ESG Score" value={editableScenario.comparisonData.btap.esgScore} onChange={e => handleWagonChange(e, 'btap', 'esgScore')} type="number"/>
                            <InputField label="CO₂ Emissions / ton (kg)" value={editableScenario.comparisonData.btap.co2PerTon} onChange={e => handleWagonChange(e, 'btap', 'co2PerTon')} type="number" step="0.01"/>
                        </div>
                         {/* BCFC Form */}
                         <div className="space-y-3 p-3 bg-gray-50/70 rounded-md">
                            <h5 className="text-md font-bold text-orange-500">BCFC Wagon</h5>
                            <InputField label="Cost / ton-km" value={editableScenario.comparisonData.bcfc.costPerTonKm} onChange={e => handleWagonChange(e, 'bcfc', 'costPerTonKm')} type="number" step="0.01"/>
                            <InputField label="Turnaround Time" value={editableScenario.comparisonData.bcfc.turnaroundTime} onChange={e => handleWagonChange(e, 'bcfc', 'turnaroundTime')} />
                            <InputField label="Unloading Cost" value={editableScenario.comparisonData.bcfc.unloadingCost} onChange={e => handleWagonChange(e, 'bcfc', 'unloadingCost')} />
                            <InputField label="ESG Score" value={editableScenario.comparisonData.bcfc.esgScore} onChange={e => handleWagonChange(e, 'bcfc', 'esgScore')} type="number"/>
                            <InputField label="CO₂ Emissions / ton (kg)" value={editableScenario.comparisonData.bcfc.co2PerTon} onChange={e => handleWagonChange(e, 'bcfc', 'co2PerTon')} type="number" step="0.01"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// FIX: Define the Tab type for use in component state.
type Tab = 'sites' | 'regions' | 'scenario';

const DataUpdatePage: React.FC<DataUpdatePageProps> = ({ scenarios, setScenarios, activeScenario, setActiveScenarioId }) => {
    const [activeTab, setActiveTab] = useState<Tab>('sites');
    const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);
    const [tempScenarioTitle, setTempScenarioTitle] = useState('');

    
    const handleCreateScenario = () => {
        const newId = `scenario_${Date.now()}`;
        // Use the first scenario as a template, or a hardcoded default if none exist.
        const template = scenarios.length > 0 ? scenarios[0] : null;
        
        if (!template) {
            alert("Cannot create a new scenario without a template. Please ensure at least one scenario exists.");
            return;
        }

        const newScenario: Scenario = {
            ...JSON.parse(JSON.stringify(template)), // Deep copy
            id: newId,
            title: `New Scenario ${scenarios.length + 1}`,
            description: "A new scenario created from a template."
        };

        setScenarios(prev => [...prev, newScenario]);
        setActiveScenarioId(newId);
    };
    
    const handleDeleteScenario = (id: string) => {
        if (window.confirm("Are you sure you want to delete this scenario? This action cannot be undone.")) {
            const remainingScenarios = scenarios.filter(s => s.id !== id);
            setScenarios(remainingScenarios);

            if (activeScenario?.id === id) {
                setActiveScenarioId(remainingScenarios.length > 0 ? remainingScenarios[0].id : null);
            }
        }
    };
    
    const handleStartRename = (id: string, currentTitle: string) => {
        setEditingScenarioId(id);
        setTempScenarioTitle(currentTitle);
    };

    const handleCancelRename = () => {
        setEditingScenarioId(null);
        setTempScenarioTitle('');
    };

    const handleConfirmRename = () => {
        if (!editingScenarioId || !tempScenarioTitle.trim()) return;
        setScenarios(prev =>
        prev.map(s =>
            s.id === editingScenarioId ? { ...s, title: tempScenarioTitle.trim() } : s
        )
        );
        handleCancelRename();
    };

    const updateActiveScenario = (updatedData: Partial<Scenario>) => {
        if (!activeScenario) return;
        
        const updatedScenario = { ...activeScenario, ...updatedData };

        setScenarios(prevScenarios => 
            prevScenarios.map(s => s.id === activeScenario.id ? updatedScenario : s)
        );
    }
    
    const updateScenarioDetails = (updatedScenario: Scenario) => {
        if (!activeScenario) return;
        setScenarios(prevScenarios => 
            prevScenarios.map(s => s.id === activeScenario.id ? updatedScenario : s)
        );
    };

    // When active scenario changes, if it's being renamed, cancel the rename.
    useEffect(() => {
        if (activeScenario && editingScenarioId && activeScenario.id !== editingScenarioId) {
            handleCancelRename();
        }
    }, [activeScenario, editingScenarioId]);

    return (
        <div className="flex-1 flex flex-col p-6 bg-gray-100 overflow-y-auto">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Data Management</h1>
            <p className="text-gray-600 mb-6">Create, edit, and delete application data in one place.</p>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-semibold text-blue-900">Scenarios</h2>
                    <button onClick={handleCreateScenario} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                        Create New Scenario
                    </button>
                </div>
                <div className="max-h-40 overflow-y-auto pr-2">
                    <ul className="space-y-2">
                        {scenarios.map(scenario => (
                            <li key={scenario.id} className={`p-2 rounded-md flex justify-between items-center transition-colors ${activeScenario?.id === scenario.id ? 'bg-green-100' : 'bg-gray-50'}`}>
                                {editingScenarioId === scenario.id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={tempScenarioTitle}
                                            onChange={(e) => setTempScenarioTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleConfirmRename();
                                                if (e.key === 'Escape') handleCancelRename();
                                            }}
                                            className="flex-grow bg-white border border-green-500 rounded-md p-1 text-gray-800 focus:ring-1 focus:ring-green-500 focus:outline-none"
                                            autoFocus
                                        />
                                        <div className="flex items-center space-x-2 ml-2">
                                            <button onClick={handleConfirmRename} className="p-1 text-green-600 hover:bg-gray-200 rounded-md" title="Save"><CheckIcon className="h-5 w-5"/></button>
                                            <button onClick={handleCancelRename} className="p-1 text-red-600 hover:bg-gray-200 rounded-md" title="Cancel"><XIcon className="h-5 w-5"/></button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="font-medium text-gray-800">{scenario.title}</span>
                                        <div className="space-x-2">
                                            <button onClick={() => setActiveScenarioId(scenario.id)} disabled={activeScenario?.id === scenario.id} className="text-sm font-medium text-green-600 hover:underline disabled:text-gray-400 disabled:no-underline">Select</button>
                                            <button onClick={() => handleStartRename(scenario.id, scenario.title)} className="text-sm font-medium text-yellow-600 hover:underline">Rename</button>
                                            <button onClick={() => handleDeleteScenario(scenario.id)} className="text-sm font-medium text-red-600 hover:underline">Delete</button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                        {scenarios.length === 0 && <p className="text-gray-500 text-center py-2">No scenarios found. Create one to get started.</p>}
                    </ul>
                </div>
            </div>
            
            {activeScenario ? (
                <>
                    <div className="flex border-b border-gray-200">
                        <TabButton active={activeTab === 'sites'} onClick={() => setActiveTab('sites')}>Layers & Sites</TabButton>
                        <TabButton active={activeTab === 'regions'} onClick={() => setActiveTab('regions')}>Regions/Zones</TabButton>
                        <TabButton active={activeTab === 'scenario'} onClick={() => setActiveTab('scenario')}>Scenario Data</TabButton>
                    </div>

                    <div className="mt-0 flex-grow">
                        {activeTab === 'sites' && <SiteManagement sites={activeScenario.sites} onUpdate={(newSites) => updateActiveScenario({ sites: newSites })} />}
                        {activeTab === 'regions' && <RegionManagement regions={activeScenario.regions} onUpdate={(newRegions) => updateActiveScenario({ regions: newRegions })} />}
                        {activeTab === 'scenario' && <ScenarioManagement scenario={activeScenario} onUpdate={updateScenarioDetails} />}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-white rounded-lg mt-4">
                    <p className="text-gray-500 text-lg">Please select or create a scenario to manage its data.</p>
                </div>
            )}
        </div>
    );
};

export default DataUpdatePage;