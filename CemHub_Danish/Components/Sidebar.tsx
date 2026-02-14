
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { LAYERS_CONFIG } from '../constants';
// Fix: Changed to a value import since SiteType enum is used for object keys.
import { SiteType, type Scenario } from '../types';
import type { View } from '../App';

interface SidebarProps {
  isOpen: boolean;
  // FIX: Added `setIsOpen` prop to match the props passed in `App.tsx`.
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  visibleLayers: { [key: string]: boolean };
  setVisibleLayers: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  scenario: Scenario;
  scenarios: Scenario[];
  setActiveScenarioId: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveView: (view: View) => void;
}

const layerIcons: { [key: string]: React.ReactElement } = {
    [SiteType.RAW_MATERIAL]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#F9A825]" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    [SiteType.CEMENT_PLANT]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#003A8F]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
    [SiteType.DISTRIBUTION_HUB]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00AEEF]" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    [SiteType.RMC_PLANT]: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2E7D32]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1.362l-2.228.445a.5.5 0 00-.43 0L3.293 6.707A1 1 0 003 7.414V16a1 1 0 001 1h12a1 1 0 001-1V7.414a1 1 0 00-.293-.707l-3.05-3.05a.5.5 0 00-.43 0L11 4.362V3a1 1 0 00-1-1zm0 4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>,
    'Limestone': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#F9A825]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    'Fly Ash': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
    'Gypsum': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00AEEF]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l.645 1.546a.75.75 0 00.705.498h1.642c.812 0 1.158.995.565 1.549l-1.321.96a.75.75 0 00-.272.824l.645 1.546c.321.772-.535 1.549-1.281 1.05l-1.321-.96a.75.75 0 00-.858 0l-1.321.96c-.746.5-1.602-.278-1.281-1.05l.645-1.546a.75.75 0 00-.272-.824l-1.321-.96c-.593-.554-.247-1.549.565-1.549h1.642a.75.75 0 00.705.498l.645-1.546z" clipRule="evenodd" /></svg>,
    'Slag': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C62828]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>,
    'Alumina': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#003A8F]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
    'Coal or Lignite': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1A1A1A]" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a1 1 0 100 2h12a1 1 0 100-2H4zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM4 17a1 1 0 100 2h12a1 1 0 100-2H4z" /></svg>,
    'Railways': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6B7280]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v1H8a1 1 0 100 2h1v2H8a1 1 0 100 2h1v2H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-2h1a1 1 0 100-2h-1V9h1a1 1 0 100-2h-1V4a1 1 0 00-1-1zM5 5a1 1 0 000 2h.083l.873.873a1 1 0 001.414-1.414L6.5 5.586V5H5zm10 0v.586l-.873.873a1 1 0 001.414 1.414L16.417 7H15a1 1 0 100-2h-.083zM5 13a1 1 0 100 2h.586l.873-.873a1 1 0 00-1.414-1.414L5.083 13H5zm10 0h-.083l-.873.707a1 1 0 001.414 1.414L16.417 13H15a1 1 0 100 2h.583z" clipRule="evenodd" /></svg>,
    'Roadways': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#F9A825]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm5 0a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm5 0a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
    'Seaways': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00AEEF]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.65.375l3.25 4.5a.75.75 0 01-.22 1.05l-3.25 2.5a.75.75 0 01-1.06 0l-3.25-2.5a.75.75 0 01-.22-1.05l3.25-4.5A.75.75 0 0110 2zM3.25 8.75a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM3 12.25a.75.75 0 000 1.5h14a.75.75 0 000-1.5H3z" clipRule="evenodd" /></svg>,
};

const ChevronDownIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${!isOpen ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const LayerItem: React.FC<{
    label: string, 
    id: string, 
    checked: boolean, 
    indeterminate?: boolean,
    onChange: (id: string, checked: boolean) => void, 
    icon?: React.ReactElement, 
    isChild?: boolean
}> = ({label, id, checked, indeterminate = false, onChange, icon, isChild = false}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);
    
    return (
    <label className={`flex items-center space-x-3 w-full py-2 px-2 cursor-pointer ${isChild ? 'pl-8' : ''}`}>
        <input 
            ref={inputRef}
            type="checkbox" 
            checked={checked} 
            onChange={(e) => onChange(id, e.target.checked)} 
            className="h-4 w-4 rounded bg-[#F4F6F8] border-[#E5E7EB] text-[#003A8F] focus:ring-[#003A8F]" 
        />
        {icon}
        <span className="text-[#6B7280] hover:text-[#0B1F3B] transition-colors">{label}</span>
    </label>
)};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, visibleLayers, setVisibleLayers, scenario, scenarios, setActiveScenarioId, setActiveView }) => {
    const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({
        raw_material_sites: true,
    });

    const handleLayerChange = (id: string, checked: boolean) => {
        setVisibleLayers(prev => {
            const newLayers = { ...prev };

            const layerConfig = LAYERS_CONFIG.find(l => l.id === id);
            const parentConfig = LAYERS_CONFIG.find(l => l.children?.some(c => 'id' in c && c.id === id));

            if (layerConfig && layerConfig.children) { // A parent layer was clicked
                newLayers[id] = checked;
                layerConfig.children.forEach(child => {
                    if ('id' in child) {
                        newLayers[child.id] = checked;
                    }
                });
            } else if (parentConfig) { // A child layer was clicked
                newLayers[id] = checked;
                const childrenWithIds = parentConfig.children!.filter(c => 'id' in c);
                const someChildrenChecked = childrenWithIds.some(
                    child => child.id === id ? checked : newLayers[child.id]
                );
                
                newLayers[parentConfig.id] = someChildrenChecked;
            } else { // A non-parent layer was clicked
                newLayers[id] = checked;
            }
            
            return newLayers;
        });
    };

    const toggleExpand = (id: string) => {
        setExpandedLayers(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const layerStates = useMemo(() => {
        const states: Record<string, { checked: boolean, indeterminate: boolean }> = {};
        LAYERS_CONFIG.forEach(layer => {
            if (layer.children) {
                const childrenWithIds = layer.children.filter(c => 'id' in c);
                const childLayers = childrenWithIds.map(c => !!visibleLayers[c.id]);
                const checkedCount = childLayers.filter(Boolean).length;
                const allChecked = checkedCount === childrenWithIds.length;
                const someChecked = checkedCount > 0 && !allChecked;
                
                states[layer.id] = {
                    checked: !!visibleLayers[layer.id] && allChecked,
                    indeterminate: someChecked || (!!visibleLayers[layer.id] && !allChecked),
                };
            } else {
                 states[layer.id] = {
                    checked: !!visibleLayers[layer.id],
                    indeterminate: false,
                };
            }
        });
        return states;
    }, [visibleLayers]);
    
    return (
        <aside className={`transition-all duration-300 ease-in-out bg-white flex flex-col border-r border-[#E5E7EB] ${isOpen ? 'w-80 p-4' : 'w-0 p-0'} overflow-y-auto`}>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#0B1F3B] mb-2">Current Scenario</h3>
                <select 
                    value={scenario.id} 
                    onChange={(e) => setActiveScenarioId(e.target.value)}
                    className="w-full p-2 rounded-md bg-[#F4F6F8] text-[#1A1A1A] border border-[#E5E7EB] focus:ring-2 focus:ring-[#003A8F] focus:outline-none"
                    aria-label="Select Scenario"
                >
                    {scenarios.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                </select>
                
            </div>
            <div>
                <h2 className="text-2xl font-bold text-[#0B1F3B] mb-4">Layers & Filters</h2>
                <div className="space-y-1">
                    {LAYERS_CONFIG.map(layer => {
                        const state = layerStates[layer.id];
                        return (
                            <div key={layer.id}>
                                <div className="flex items-center justify-between rounded-md hover:bg-[#F4F6F8]">
                                    <LayerItem 
                                        id={layer.id}
                                        label={layer.label} 
                                        checked={state.checked}
                                        indeterminate={state.indeterminate}
                                        onChange={handleLayerChange}
                                        icon={layerIcons[layer.type]}
                                    />
                                    {layer.children && (
                                        <button onClick={() => toggleExpand(layer.id)} className="p-2 mr-2 text-[#6B7280] rounded-full hover:bg-[#E5E7EB]" aria-expanded={!!expandedLayers[layer.id]}>
                                            <ChevronDownIcon isOpen={!!expandedLayers[layer.id]} />
                                        </button>
                                    )}
                                </div>
                                {layer.children && expandedLayers[layer.id] && (
                                    <div className="space-y-1 mt-1">
                                        {layer.children.map(child => {
                                            if ('type' in child && child.type === 'header') {
                                                return (
                                                    <h4 key={child.label} className="px-8 pt-2 pb-1 text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">
                                                        {child.label}
                                                    </h4>
                                                );
                                            }
                                            if ('id' in child) {
                                                return (
                                                    <div key={child.id} className="rounded-md hover:bg-[#F4F6F8]">
                                                        <LayerItem 
                                                            id={child.id}
                                                            label={child.label} 
                                                            checked={!!visibleLayers[child.id]} 
                                                            onChange={handleLayerChange}
                                                            icon={layerIcons[child.label]}
                                                            isChild
                                                        />
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
