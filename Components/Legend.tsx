
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const legendData = {
    sites: [
        { name: 'Raw Material Site', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f97316" class="w-5 h-5 inline-block mr-2 align-middle"><path fill-rule="evenodd" d="M11.54 2.146a.75.75 0 0 1 .92 0l8.25 6.75a.75.75 0 1 1-.92 1.208L20.25 9.75v8.5a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75v-8.5L3.23 10.104a.75.75 0 0 1-.92-1.208l8.25-6.75Z" clip-rule="evenodd" /></svg>` },
        { name: 'Cement Plant', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" class="w-5 h-5 inline-block mr-2 align-middle"><path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 7.225V19.5a.75.75 0 0 0 .75.75h16.5a.75.75 0 0 0 .75-.75V7.225l-8.622-5.623ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75ZM10.5 15a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0-.75.75Z" /></svg>` },
        { name: 'Distribution Hub', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" class="w-5 h-5 inline-block mr-2 align-middle"><path fill-rule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm4.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm7.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-7.5-6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm7.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clip-rule="evenodd" /></svg>` },
        { name: 'RMC Unit', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#14b8a6" class="w-5 h-5 inline-block mr-2 align-middle"><path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 7.225V19.5a.75.75 0 0 0 .75.75h16.5a.75.75 0 0 0 .75-.75V7.225l-8.622-5.623ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75ZM10.5 15a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0-.75.75Z" /></svg>` }
    ],
    routes: [
        { name: 'Railways (BTAP)', style: 'height: 4px; border-top: 4px dashed #3498db;' },
        { name: 'Railways (BCFC)', style: 'background-color: #e74c3c; height: 4px;' },
        { name: 'Roadways', style: 'background-color: #f1c40f; height: 3px;' },
        { name: 'Seaways', style: 'background-color: #00ffff; height: 3px;' }
    ]
};

const Legend: React.FC = () => {
    const map = useMap();

    useEffect(() => {
        const legendControl = new L.Control({ position: 'bottomright' });

        legendControl.onAdd = function () {
            const container = L.DomUtil.create('div', 'leaflet-control-legend bg-white/80 rounded-lg text-gray-800 border border-gray-300 w-52 text-xs shadow-lg');

            const header = L.DomUtil.create('div', 'flex justify-between items-center cursor-pointer p-2', container);
            const title = L.DomUtil.create('h4', 'font-bold text-sm', header);
            title.innerText = 'Legend';
            
            const toggleButton = L.DomUtil.create('button', 'p-1 rounded-full hover:bg-gray-200', header);
            const chevronDown = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>`;
            const chevronUp = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>`;
            toggleButton.innerHTML = chevronDown;

            const contentContainer = L.DomUtil.create('div', 'p-2 pt-0 transition-all duration-300', container);
            
            let contentHTML = '<div class="space-y-2">';
            legendData.sites.forEach(site => {
                contentHTML += `<div>${site.icon}<span class="align-middle">${site.name}</span></div>`;
            });
            contentHTML += '<div class="mt-2 pt-2 border-t border-gray-200"></div>';
            legendData.routes.forEach(route => {
                contentHTML += `<div class="flex items-center"><div class="w-6 h-4 flex items-center mr-2"><div style="width: 100%; ${route.style}"></div></div><span class="align-middle">${route.name}</span></div>`;
            });
            contentHTML += '</div>';
            contentContainer.innerHTML = contentHTML;

            header.onclick = function() {
                const isCollapsed = L.DomUtil.hasClass(contentContainer, 'hidden');
                if (isCollapsed) {
                    L.DomUtil.removeClass(contentContainer, 'hidden');
                    toggleButton.innerHTML = chevronDown;
                } else {
                    L.DomUtil.addClass(contentContainer, 'hidden');
                    toggleButton.innerHTML = chevronUp;
                }
            };
            
            // Prevent map interactions when clicking on the legend
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);

            return container;
        };

        legendControl.addTo(map);

        return () => {
            legendControl.remove();
        };
    }, [map]);

    return null;
};

export default Legend;