import React, { useState } from 'react';
import type { View } from '../App';

const NavLink: React.FC<{ onClick: () => void, isActive?: boolean, children: React.ReactNode, mobile?: boolean }> = ({ onClick, isActive = false, children, mobile = false }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-lg font-bold transition-all duration-200 whitespace-nowrap ${isActive
            ? 'text-white bg-[#0B1F3B] shadow-md transform scale-105'
            : 'text-white/90 hover:bg-white/10 hover:text-white'
            } ${mobile ? 'w-full text-left rounded-md' : ''}`}
    >
        {children}
    </button>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface HeaderProps {
    activeView: View;
    setActiveView: (view: View) => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavClick = (view: View) => {
        setActiveView(view);
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="bg-transparent px-4 py-3 shadow-none z-30 border-b border-white/20 relative h-auto min-h-[5rem] flex flex-col xl:flex-row items-center justify-between gap-4">

            {/* Left: Logo */}
            <div className="flex items-center flex-shrink-0 z-20 cursor-pointer self-start xl:self-center" onClick={() => handleNavClick('home')}>
                <div className="text-2xl md:text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                    CemHub
                </div>
            </div>

            {/* Center: Navigation & Logout (Visible on ALL screens) */}
            <div className="flex flex-1 flex-wrap items-center justify-center gap-4 w-full xl:w-auto">
                <nav className="flex flex-wrap items-center justify-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/20 shadow-sm mx-auto">
                    <NavLink onClick={() => handleNavClick('home')} isActive={activeView === 'home'}>Home</NavLink>
                    <NavLink onClick={() => handleNavClick('scenario')} isActive={activeView === 'scenario'}>Logistics & Operations</NavLink>
                    <NavLink onClick={() => handleNavClick('scenario_analysis')} isActive={activeView === 'scenario_analysis'}>Scenario Analysis</NavLink>
                    <NavLink onClick={() => handleNavClick('reports')} isActive={activeView === 'reports'}>Reports</NavLink>
                    <NavLink onClick={() => handleNavClick('audit_compliance')} isActive={activeView === 'audit_compliance'}>Audit & Compliance</NavLink>
                    <NavLink onClick={() => handleNavClick('system_data')} isActive={activeView === 'system_data'}>System Data</NavLink>
                </nav>

                <div className="hidden xl:block h-8 w-px bg-white/30 mx-2"></div>

                <button
                    onClick={onLogout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full text-base font-bold transition-all text-white bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap ml-auto xl:ml-0"
                    title="Log Out"
                >
                    <LogoutIcon />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
