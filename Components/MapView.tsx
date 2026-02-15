import React, { useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip } from 'react-leaflet';
import type { Site, Route, Scenario } from '../types';
import { SiteType, TransportMode } from '../types';
import { LAYERS_CONFIG } from '../constants';
import Legend from './Legend';

interface MapViewProps {
  sites: Site[];
  routes: Route[];
  scenario: Scenario;
  visibleLayers: { [key: string]: boolean };
  highlightedRouteId?: string | null;
}

const createIcon = (svg: string) => {
  return L.divIcon({
    html: svg,
    className: 'bg-transparent border-none',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const icons = {
  [SiteType.CEMENT_PLANT]: createIcon(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" class="w-9 h-9"><path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 7.225V19.5a.75.75 0 0 0 .75.75h16.5a.75.75 0 0 0 .75-.75V7.225l-8.622-5.623ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75ZM10.5 15a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0-.75.75Z" /></svg>`),
  [SiteType.DISTRIBUTION_HUB]: createIcon(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" class="w-9 h-9"><path fill-rule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm4.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm7.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-7.5-6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm7.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clip-rule="evenodd" /></svg>`),
  [SiteType.RMC_PLANT]: createIcon(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#14b8a6" class="w-9 h-9"><path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 7.225V19.5a.75.75 0 0 0 .75.75h16.5a.75.75 0 0 0 .75-.75V7.225l-8.622-5.623ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75ZM10.5 15a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0-.75.75Z" /></svg>`),
};

const rawMaterialIcons = {
    'Limestone': createIcon(`<svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" fill="#d97706" viewBox="0 0 24 24" stroke="white" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>`),
    'Fly Ash': createIcon(`<svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" fill="#64748b" viewBox="0 0 24 24" stroke="white" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>`),
    'Gypsum': createIcon(`<svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" viewBox="0 0 20 20" fill="#22d3ee" stroke="white" stroke-width="0.5"><path fill-rule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l.645 1.546a.75.75 0 00.705.498h1.642c.812 0 1.158.995.565 1.549l-1.321.96a.75.75 0 00-.272.824l.645 1.546c.321.772-.535 1.549-1.281 1.05l-1.321-.96a.75.75 0 00-.858 0l-1.321.96c-.746.5-1.602-.278-1.281-1.05l.645-1.546a.75.75 0 00-.272-.824l-1.321-.96c-.593-.554-.247-1.549.565-1.549h1.642a.75.75 0 00.705-.498l.645-1.546z" clip-rule="evenodd" /></svg>`),
    'Slag': createIcon(`<svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" viewBox="0 0 20 20" fill="#dc2626" stroke="white" stroke-width="0.5"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" /></svg>`),
    'Alumina': createIcon(`<svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" viewBox="0 0 20 20" fill="#6366f1" stroke="white" stroke-width="0.5"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>`),
    'Coal or Lignite': createIcon(`<svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" fill="#262626" viewBox="0 0 20 20" stroke="white" stroke-width="0.5"><path d="M4 3a1 1 0 100 2h12a1 1 0 100-2H4zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM4 17a1 1 0 100 2h12a1 1 0 100-2H4z" /></svg>`),
};


// A helper map to convert SiteType to the base ID used in LAYERS_CONFIG
const siteTypeToLayerId: Record<string, string> = {
    [SiteType.RAW_MATERIAL]: 'raw_material_sites',
    [SiteType.CEMENT_PLANT]: 'cement_plants',
    [SiteType.DISTRIBUTION_HUB]: 'distribution_hubs',
    [SiteType.RMC_PLANT]: 'rmc_units',
};

// A helper function to get the transport mode suffix
const getModeSuffix = (mode: TransportMode): string => {
    if (mode.includes('Rail')) return '_railways';
    if (mode.includes('Road')) return '_roadways';
    if (mode.includes('Sea')) return '_seaways';
    return '';
};


const MapView: React.FC<MapViewProps> = ({ sites, routes, visibleLayers, highlightedRouteId }) => {
  const center: [number, number] = [22.5, 82.0];
  
  const getRouteStyle = (mode: TransportMode, isHighlighted: boolean) => {
    const baseStyle = (() => {
        switch(mode) {
          // Both rail types are dashed
          case TransportMode.RAIL_BTAP: return { color: '#3498db', weight: 4, dashArray: '10, 10' };
          case TransportMode.RAIL_BCFC: return { color: '#e74c3c', weight: 4, dashArray: '10, 10' };
          // Road is solid
          case TransportMode.ROAD: return { color: '#f1c40f', weight: 3, opacity: 0.8 };
          // Sea is dotted
          case TransportMode.SEA: return { color: '#00ffff', weight: 3, opacity: 0.7, dashArray: '2, 8' };
          default: return { color: '#95a5a6', weight: 2 };
        }
    })();

    if (isHighlighted) {
        return { ...baseStyle, weight: (baseStyle.weight || 3) + 4, opacity: 1 };
    }
    return baseStyle;
  }
  
  const filteredSites = sites.filter(site => {
    const layerConfig = LAYERS_CONFIG.find(l => l.type === site.type);
    if (!layerConfig || !visibleLayers[layerConfig.id]) {
        return false;
    }
    if (site.type === SiteType.RAW_MATERIAL && site.subType) {
        // Find the specific child config for the subtype
        const subTypeLayerConfig = layerConfig.children?.find(c => 'subType' in c && c.subType === site.subType);
        return subTypeLayerConfig ? visibleLayers[subTypeLayerConfig.id] : false;
    }
    return true;
  });

  const sitesById = useMemo(() => new Map(sites.map(site => [site.id, site])), [sites]);

  const getSiteIcon = (site: Site) => {
    if (site.type === SiteType.RAW_MATERIAL) {
      if (site.subType && rawMaterialIcons[site.subType as keyof typeof rawMaterialIcons]) {
        return rawMaterialIcons[site.subType as keyof typeof rawMaterialIcons];
      }
    }
    // @ts-ignore
    return icons[site.type];
  };

  return (
    <MapContainer center={center} zoom={5} scrollWheelZoom={true} className="w-full h-full z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <Legend />
      {filteredSites.map(site => (
        <Marker key={site.id} position={site.position} icon={getSiteIcon(site)}>
          <Popup>
            <div className="font-sans">
              <h3 className="font-bold text-lg text-blue-900">{site.name}</h3>
              <p className="text-sm text-gray-600">{site.type}</p>
              <p className="mt-2 text-gray-500">{site.info}</p>
            </div>
          </Popup>
        </Marker>
      ))}
      {routes.map(route => {
        const fromSite = sitesById.get(route.from);
        const toSite = sitesById.get(route.to);

        if (!fromSite || !toSite) return null;

        const modeSuffix = getModeSuffix(route.mode);
        if (!modeSuffix) return null;

        const fromLayerId = `${siteTypeToLayerId[fromSite.type]}${modeSuffix}`;
        const toLayerId = `${siteTypeToLayerId[toSite.type]}${modeSuffix}`;
        
        const isVisible = visibleLayers[fromLayerId] || visibleLayers[toLayerId];

        if (!isVisible) return null;
        
        const isHighlighted = highlightedRouteId === route.id;

        return (
          <Polyline key={route.id} positions={route.path} pathOptions={getRouteStyle(route.mode, isHighlighted)}>
             <Tooltip sticky>
                {route.mode}
                {route.capacity && ` | ${route.capacity}`}
             </Tooltip>
          </Polyline>
        )
      })}
    </MapContainer>
  );
};

export default MapView;