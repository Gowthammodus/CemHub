
import React from 'react';
import type { View } from '../App';

interface LandingPageProps {
    setActiveView: (view: View) => void;
    onLogout: () => void;
}

const ModusLogo = () => (
    <div className="flex items-center text-6xl font-thin tracking-[0.2em] text-[#0B1F3B] select-none mb-4">
        <span>M</span>
        <svg className="w-16 h-16 mx-2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2 L14.09 8.26 L20.5 8.26 L15.91 12.74 L17.91 19.02 L12 15.27 L6.09 19.02 L8.09 12.74 L3.5 8.26 L9.91 8.26 Z" fill="none" stroke="#0B1F3B" strokeWidth="1" />
            <circle cx="12" cy="11.5" r="2.5" fill="#003A8F" stroke="none" />
        </svg>
        <span>DUS</span>
    </div>
);

const FactoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-24 h-24 text-[#2E7D32] mb-4 group-hover:scale-110 transition-transform">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5M12 6.75h1.5m-3 4.5h1.5m1.5 0h1.5m-3 4.5h1.5m1.5 0h1.5M9 6.75v1.5m3-1.5v1.5m3-1.5v1.5M9 11.25v1.5m3-1.5v1.5m3-1.5v1.5m-6 4.5v1.5m3-1.5v1.5m3-1.5v1.5" />
    </svg>
);

const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-24 h-24 text-[#003A8F] mb-4 group-hover:scale-110 transition-transform">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
);

const LandingPage: React.FC<LandingPageProps> = ({ setActiveView, onLogout }) => {
    return (
        <div className="min-h-screen bg-transparent flex flex-col">
            <div className="flex justify-end p-4">
                <button onClick={onLogout} className="text-[#6B7280] hover:text-[#C62828] font-medium px-4 py-2 transition-colors">Logout</button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 -mt-20">
                <div className="animate-fade-in text-center">
                    <ModusLogo />
                    <h1 className="text-3xl font-light text-[#1A1A1A] mb-12 tracking-wide">Select Module</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <div
                        onClick={() => setActiveView('process_flow')}
                        className="group bg-white/80 backdrop-blur-md p-10 rounded-2xl shadow-lg border border-white hover:shadow-2xl hover:border-[#2E7D32]/30 cursor-pointer transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-2"
                    >
                        <div className="p-6 rounded-full bg-green-50 mb-6 group-hover:bg-green-100 transition-colors shadow-inner">
                            <FactoryIcon />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">Process Flow</h2>
                        <p className="text-[#6B7280] leading-relaxed">
                            Complete end-to-end view of cement manufacturing operations, from raw material arrival to final dispatch.
                        </p>
                    </div>

                    <div
                        onClick={() => setActiveView('home')}
                        className="group bg-white/80 backdrop-blur-md p-10 rounded-2xl shadow-lg border border-white hover:shadow-2xl hover:border-[#003A8F]/30 cursor-pointer transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-2"
                    >
                        <div className="p-6 rounded-full bg-blue-50 mb-6 group-hover:bg-blue-100 transition-colors shadow-inner">
                            <DashboardIcon />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">Dashboard</h2>
                        <p className="text-[#6B7280] leading-relaxed">
                            Access the main application dashboard, including Geo-Intelligence Map, Scenario Analysis, and Cost Planner.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 text-center text-[#6B7280] text-sm">
                &copy; {new Date().getFullYear()} SaveEco Energy India Pvt Ltd. All rights reserved.
            </div>
        </div>
    );
};

export default LandingPage;
