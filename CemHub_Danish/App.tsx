
import React, { useState, useEffect } from 'react';
import MapView from './Components/MapView';
import Sidebar from './Components/Sidebar';
import Header from './Components/Header';
import BottomPanel from './Components/BottomPanel';
import HomePage from './Components/HomePage';
import ScenarioAnalysisPage from './Components/ScenarioAnalysisPage';
import LoginPage from './Components/LoginPage';
import LandingPage from './Components/LandingPage';
import ProcessFlowPage from './Components/ProcessFlowPage';
import SystemDataPage from './Components/SystemDataPage';
import AuditCompliancePage from './Components/AuditCompliancePage';
import ReportsPage from './Components/ReportsPage';
import type { Scenario } from './types';
import { INITIAL_SCENARIOS, LAYERS_CONFIG } from './constants';
import bgImage from './Images/background_image.png';

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);


export type View = 'landing_page' | 'process_flow' | 'home' | 'scenario' | 'scenario_analysis' | 'system_data' | 'audit_compliance' | 'reports';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [scenarios, setScenarios] = useState<Scenario[]>(INITIAL_SCENARIOS);
    const [activeScenarioId, setActiveScenarioId] = useState<string | null>(
        scenarios.length > 0 ? scenarios[0].id : null
    );

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeView, setActiveView] = useState<View>('landing_page');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const [visibleLayers, setVisibleLayers] = useState(() => {
        const initialState: { [key: string]: boolean } = {};
        LAYERS_CONFIG.forEach(layer => {
            initialState[layer.id] = true;
            if (layer.children) {
                layer.children.forEach(child => {
                    initialState[child.id] = true;
                });
            }
        });
        return initialState;
    });

    const activeScenario = scenarios.find(s => s.id === activeScenarioId);

    const handleLogin = () => {
        setIsAuthenticated(true);
        setActiveView('home');
    };
    const handleLogout = () => {
        setIsAuthenticated(false);
        setActiveView('landing_page');
    };

    const handleSaveScenario = (newScenario: Scenario) => {
        setScenarios(prev => [...prev, newScenario]);
        setActiveScenarioId(newScenario.id);
        alert(`Scenario "${newScenario.title}" saved successfully!`);
    };

    if (!isAuthenticated) {
        return <LoginPage onLogin={handleLogin} />;
    }

    const renderContent = () => {
        if (!activeScenario && activeView !== 'landing_page' && activeView !== 'process_flow' && activeView !== 'system_data' && activeView !== 'audit_compliance' && activeView !== 'reports') {
            return (
                <div className="flex-1 flex flex-col bg-transparent">
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center">
                            <h1 className="text-2xl md:text-3xl text-[#0B1F3B] mb-4">No Scenario Selected</h1>
                            <p className="text-[#6B7280] mb-6">Please select a scenario.</p>
                        </div>
                    </div>
                </div>
            )
        }

        switch (activeView) {
            case 'landing_page':
                return <LandingPage setActiveView={setActiveView} onLogout={handleLogout} />;
            case 'process_flow':
                return <ProcessFlowPage />;
            case 'home':
                return <HomePage
                    scenario={activeScenario!}
                    scenarios={scenarios}
                    setActiveScenarioId={setActiveScenarioId}
                    setActiveView={setActiveView}
                    sites={activeScenario!.sites}
                    routes={activeScenario!.routes}
                />;
            case 'scenario':
                return (
                    <>
                        {isSidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-20" onClick={() => setIsSidebarOpen(false)}></div>}
                        <Sidebar
                            isOpen={isSidebarOpen}
                            setIsOpen={setIsSidebarOpen}
                            visibleLayers={visibleLayers}
                            setVisibleLayers={setVisibleLayers}
                            scenario={activeScenario!}
                            scenarios={scenarios}
                            setActiveScenarioId={setActiveScenarioId}
                            setActiveView={setActiveView}
                        />
                        <div className="flex-1 flex flex-col relative overflow-hidden">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="absolute top-4 left-4 z-40 p-2 bg-white/90 hover:bg-[#F4F6F8] text-[#0B1F3B] rounded-full shadow-lg transition-transform duration-300 border border-[#E5E7EB]"
                                aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                                title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                            >
                                {isMobile ?
                                    (isSidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />) :
                                    (isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />)
                                }
                            </button>

                            <div className="flex-1 relative min-h-0">
                                <MapView sites={activeScenario!.sites} routes={activeScenario!.routes} scenario={activeScenario!} visibleLayers={visibleLayers} />
                            </div>

                            <div className={`w-full border-t border-[#E5E7EB] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 relative transition-all duration-300 ease-in-out ${isBottomPanelOpen ? 'h-[45%]' : 'h-14'}`}>
                                <BottomPanel
                                    scenario={activeScenario!}
                                    isOpen={isBottomPanelOpen}
                                    onToggle={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
                                />
                            </div>
                        </div>
                    </>
                );
            case 'scenario_analysis':
                return <ScenarioAnalysisPage scenario={activeScenario!} onSaveScenario={handleSaveScenario} />;
            case 'audit_compliance':
                return (
                    <div className="flex flex-1 min-w-0">
                        <AuditCompliancePage />
                    </div>
                );
            case 'reports':
                return (
                    <div className="flex flex-1 min-w-0">
                        <ReportsPage />
                    </div>
                );
            case 'system_data':
                return (
                    <div className="flex flex-1 min-w-0">
                        <SystemDataPage scenarios={scenarios} setScenarios={setScenarios} />
                    </div>
                );
            default:
                return (
                    <div className="flex-1 flex items-center justify-center bg-transparent">
                        <h1 className="text-3xl text-[#9CA3AF]">Page Not Found</h1>
                    </div>
                )

        }
    }

    const showHeader = activeView !== 'landing_page' && activeView !== 'process_flow';

    return (
        <div
            className="flex flex-col h-screen overflow-hidden text-white font-sans relative"
        >
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            />
            <div className="relative z-10 flex flex-col h-full">
                {showHeader && <Header activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout} />}
                <main className="flex flex-1 overflow-hidden">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;
