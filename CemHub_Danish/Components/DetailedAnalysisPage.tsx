
import React, { useState } from 'react';
import type { View } from '../App';
import { generateStrategyAnalysis, type AnalysisResultData } from '../services/geminiService';

// --- Icons for Efficiency Index ---
const ProcessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>;
const CostIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ProfitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const EnvironmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.5h8.586a2 2 0 011.766 1.032l3.125 6.25A2 2 0 0118.885 14H5.115a2 2 0 01-1.766-2.218l3.125-6.25A2 2 0 017.707 4.5z" /></svg>;
const ProductIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const SupplierIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8zM18 16V6a1 1 0 00-1-1h-4l-2 2h6a1 1 0 011 1v10l-2-2h-1z" /></svg>;
const CustomerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const SystemIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>;


// --- Reusable components ---
const CheckboxItem: React.FC<{ label: string; checked: boolean; onChange: () => void; }> = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-3 cursor-pointer text-sm text-gray-200 hover:text-white">
      <div className="relative flex items-center justify-center h-4 w-4">
        <input type="checkbox" checked={checked} onChange={onChange} className="absolute opacity-0 w-full h-full cursor-pointer" />
        <div className={`h-4 w-4 border-2 rounded ${checked ? 'bg-[#003A8F] border-[#003A8F]' : 'bg-gray-700 border-gray-500'}`}>
          {checked && (
            <svg className="h-full w-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span>{label}</span>
    </label>
);
  
const Dropdown: React.FC<{ label: string; options: string[] }> = ({ label, options }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
    <select className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-sm focus:ring-1 focus:ring-[#003A8F] focus:border-[#003A8F]">
      <option>Select {label}</option>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

const CountryCitySelector: React.FC<{ countryLabel: string; cityLabel: string; }> = ({ countryLabel, cityLabel }) => {
    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">{countryLabel}</label>
                <select className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-sm focus:ring-1 focus:ring-[#003A8F] focus:border-[#003A8F]">
                    <option>Select Country</option>
                    <option>India</option>
                    <option>United States</option>
                    <option>Germany</option>
                </select>
            </div>
            <div className="w-full sm:w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">{cityLabel}</label>
                <select className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-sm focus:ring-1 focus:ring-[#003A8F] focus:border-[#003A8F]">
                    <option>Select City</option>
                    <option>Mumbai</option>
                    <option>Bangalore</option>
                    <option>New York</option>
                    <option>Berlin</option>
                </select>
            </div>
        </div>
    );
};

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">{title}</h2>
        {children}
    </div>
);

const EfficiencyCard: React.FC<{title: string, subtitle: string, value: number, description: string, color: 'blue' | 'green', icon: React.ReactNode}> = ({ title, subtitle, value, description, color, icon }) => {
    const colorClasses = color === 'blue' ? 'bg-[#003A8F]' : 'bg-[#2E7D32]';
    const sliderColorClasses = color === 'blue' ? 'bg-[#00AEEF]' : 'bg-green-300';
    const maxVal = 5;

    return (
        <div className={`${colorClasses} text-white p-4 rounded-lg shadow-md flex flex-col justify-between`}>
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold">{title}</h3>
                    {icon}
                </div>
                <p className="text-xs opacity-80">{subtitle}</p>
            </div>
            <div className="mt-4">
                <p className="font-bold text-lg text-center">{value}</p>
                <div className="relative h-2 bg-black/20 rounded-full my-1">
                    <div className={`${sliderColorClasses} absolute top-0 left-0 h-2 rounded-full`} style={{ width: `${(value/maxVal)*100}%` }}></div>
                </div>
                <p className="text-xs text-center opacity-90">{description}</p>
            </div>
        </div>
    )
};

const ImpactCard: React.FC<{title: string, subtitle: string, items: string[]}> = ({title, subtitle, items}) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-bold text-[#1A1A1A]">{title}</h3>
        <p className="text-xs text-[#6B7280] mb-3">{subtitle}</p>
        {items.length > 0 && (items[0] || '').includes('No') ? (
            <p className="text-sm text-gray-600">{items[0]}</p>
        ) : (
            <ul className="space-y-2 list-disc list-inside text-sm text-[#1A1A1A]">
                {items.map((item, index) => {
                    const parts = item.split(': ');
                    return (
                        <li key={index}>
                            {parts.length > 1 ? (
                                <>
                                    <span className="font-semibold">{parts[0]}:</span> {parts.slice(1).join(': ')}
                                </>
                            ) : item}
                        </li>
                    )
                })}
            </ul>
        )}
    </div>
);

interface DetailedAnalysisPageProps {
    setActiveView: (view: View) => void;
}

const DetailedAnalysisPage: React.FC<DetailedAnalysisPageProps> = ({ setActiveView }) => {
    const [bots, setBots] = useState({
        'enterprise-transformation': true, 'strategy-modeller': true, 'operating-model': true,
        'change-management': true, 'portfolio-management': true, 'organisational-development': true,
        'it-system-integration': true, 'optimization-governance': true, 'weather': true, 'world-trade': true,
        'festival-event': false, 'mileage-cost': false, 'public-sentiment': false, 'currency-exchange': false,
        'inflation-tracker': false, 'stock-watch': false,
    });
    const [isAnalysisVisible, setIsAnalysisVisible] = useState(false);
    const [query, setQuery] = useState("We want to freight about 50,000 tons of fly ash from Mumbai to Bangalore between June 1st - June 5th, 2025; find out if this is a good time and evaluate the efficiency index parameters");
    const [analysisResult, setAnalysisResult] = useState<AnalysisResultData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBotChange = (botId: keyof typeof bots) => {
        setBots(prev => ({...prev, [botId]: !prev[botId]}));
    };

    const handleGetStrategyAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setIsAnalysisVisible(true); // Show the section immediately with a loading state

        try {
            const result = await generateStrategyAnalysis(query);
            setAnalysisResult(result);
            // Check if the result is the error structure from the service
            if(result.analysisResult.title === "Error") {
                setError(result.analysisResult.summary);
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred while generating the analysis. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const modusAgenticBots = [
        { id: 'enterprise-transformation', label: 'Enterprise Transformation Intelligence' }, { id: 'strategy-modeller', label: 'Strategy Modeller Intelligence' },
        { id: 'operating-model', label: 'Operating Model Intelligence' }, { id: 'change-management', label: 'Change Management Intelligence' },
        { id: 'portfolio-management', label: 'Portfolio Management Intelligence' }, { id: 'organisational-development', label: 'Organisational Development Intelligence' },
        { id: 'it-system-integration', label: 'IT/System Integration Intelligence' }, { id: 'optimization-governance', label: 'Optimization & Governance Intelligence' },
    ] as const;

    const finetunedBots = [
        { id: 'weather', label: 'Weather Intelligence Bot' }, { id: 'world-trade', label: 'World Trade Intelligence Bot' },
        { id: 'festival-event', label: 'Festival/Event Calendar Bot' }, { id: 'mileage-cost', label: 'Mileage Cost Calculator Bot' },
        { id: 'public-sentiment', label: 'Public Sentiment Bot' }, { id: 'currency-exchange', label: 'Currency Exchange Bot' },
        { id: 'inflation-tracker', label: 'Inflation Tracker Bot' }, { id: 'stock-watch', label: 'Stock Watch Bot' },
    ] as const;

    const efficiencyData: Array<{title: string, subtitle: string, value: number, description: string, color: 'blue' | 'green', icon: React.ReactNode}> = [
        { title: "Process", subtitle: "Current process status", value: 3, description: "Optimized – High performance, well-managed", color: "blue", icon: <ProcessIcon/> },
        { title: "Cost", subtitle: "Current cost analysis", value: 2, description: "Improving – Above average performance, opportunity to scale", color: "green", icon: <CostIcon/> },
        { title: "Profit", subtitle: "Current profit margin", value: 3, description: "Optimized – High performance, well-managed", color: "blue", icon: <ProfitIcon/> },
        { title: "Environment", subtitle: "Environmental impact", value: 2, description: "Improving – Above average performance, opportunity to scale", color: "green", icon: <EnvironmentIcon/> },
        { title: "Product", subtitle: "Product compliance", value: 4, description: "Exemplar / Best Practice – Industry-leading, benchmark standard", color: "blue", icon: <ProductIcon/> },
        { title: "Supplier", subtitle: "Supplier reliability", value: 2, description: "Improving – Above average performance, opportunity to scale", color: "green", icon: <SupplierIcon/> },
        { title: "Customer", subtitle: "Customer satisfaction", value: 3, description: "Optimized – High performance, well-managed", color: "blue", icon: <CustomerIcon/> },
        { title: "System", subtitle: "System status", value: 3, description: "Optimized – High performance, well-managed", color: "blue", icon: <SystemIcon/> },
    ];
    
  return (
    <div className="flex flex-col h-full w-full">
        <header className="bg-[#0B1F3B] text-white p-3 flex justify-between items-center shadow-md z-10">
            <h1 className="text-lg font-semibold tracking-wider">Modus Operating Model Digital Twin Intelligence</h1>
            <button
                onClick={() => setActiveView('home')}
                className="bg-[#003A8F] hover:bg-[#00AEEF] text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm"
            >
                Back Home
            </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-80 bg-[#0B1F3B] text-white p-4 flex flex-col h-full overflow-y-auto border-r border-gray-700">
            <h2 className="text-lg font-bold mb-1">MODUS AI</h2>
            <p className="text-xs text-gray-400 mb-4">ENTERPRISE TRANSFORMATION</p>
            <div className="border-t border-gray-600 my-2"></div>
            <h3 className="text-md font-semibold mb-4">Modus - TOMI - Target Operating Model Intelligence Bots</h3>

            <div className="space-y-4 mb-6 flex-grow">
                <h4 className="text-sm font-semibold text-gray-300">Modus Agentic Bots:</h4>
                <div className="space-y-2 pl-2">
                    {modusAgenticBots.map(bot => <CheckboxItem key={bot.id} label={bot.label} checked={bots[bot.id]} onChange={() => handleBotChange(bot.id)} />)}
                </div>
                 <div className="border-t border-gray-600 my-4"></div>
                <h4 className="text-sm font-semibold text-gray-300">Finetuned Intelligence Agentic Bots:</h4>
                <div className="space-y-2 pl-2">
                    {finetunedBots.map(bot => <CheckboxItem key={bot.id} label={bot.label} checked={bots[bot.id]} onChange={() => handleBotChange(bot.id)} />)}
                </div>
            </div>
          </aside>
          
          <main className="flex-1 p-6 overflow-y-auto bg-[#F4F6F8]">
            <div className="max-w-7xl mx-auto space-y-4">
              <Card title="Modus Module Selection">
                <p className="text-sm text-[#6B7280] mb-2">Select parameters for operating model</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <Dropdown label="Industry Type" options={['Manufacturing', 'Logistics', 'Retail']} />
                  <Dropdown label="Scenario Type" options={['Growth', 'Cost Reduction', 'ESG Compliance']} />
                  <Dropdown label="Value Chain / Operating Model Module" options={['Supply Chain', 'Production', 'Sales']} />
                  <Dropdown label="Process" options={['Procurement', 'Warehousing', 'Last-mile delivery']} />
                  <Dropdown label="Business Model" options={['B2B', 'B2C', 'D2C']} />
                  <Dropdown label="Portfolio" options={['Cement', 'RMC', 'Aggregates']} />
                  <Dropdown label="Change Management" options={['Process Change', 'Technology Adoption']} />
                  <Dropdown label="Organisational Development" options={['Skill training', 'Restructuring']} />
                  <Dropdown label="Role" options={['Logistics Manager', 'Plant Head', 'Sales Executive']} />
                  <Dropdown label="System" options={['ERP', 'WMS', 'TMS']} />
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                 <div className="lg:col-span-2">
                    <Card title="Location">
                        <p className="text-sm text-[#6B7280] mb-2">Choose countries and cities for trade analysis</p>
                        <div className="space-y-3">
                            <CountryCitySelector countryLabel="Source Country" cityLabel="Source City" />
                            <CountryCitySelector countryLabel="Destination Country" cityLabel="Destination City" />
                        </div>
                    </Card>
                 </div>
                 <div>
                    <Card title="Agentic Bot Training">
                         <button className="bg-[#003A8F] hover:bg-[#0B1F3B] text-white font-bold py-3 px-4 rounded-lg w-full">
                             Train Agentic Bot
                         </button>
                    </Card>
                 </div>
              </div>
              
              <Card title="Operational Data Connect">
                <p className="text-sm text-[#6B7280] mb-2">Enter trade details</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Product Type</label>
                        <input type="text" className="mt-1 w-full p-1.5 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Volume</label>
                        <input type="text" className="mt-1 w-full p-1.5 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">What is in Forecast</label>
                        <input type="text" className="mt-1 w-full p-1.5 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">What is in Production</label>
                        <input type="text" className="mt-1 w-full p-1.5 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">What is in Warehouse</label>
                        <input type="text" className="mt-1 w-full p-1.5 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">What is in Store</label>
                        <input type="text" className="mt-1 w-full p-1.5 border border-gray-300 rounded-md" />
                    </div>
                </div>
              </Card>

              <Card title="Operating Model Intelligence Analysis">
                <p className="text-sm text-[#6B7280] mb-2">Enter your specific needs for AI-driven analysis</p>
                <textarea 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={2} 
                    className="w-full p-1.5 border border-gray-300 rounded-md"
                ></textarea>
                <div className="mt-2">
                    <button 
                        onClick={handleGetStrategyAnalysis} 
                        disabled={isLoading}
                        className="bg-[#003A8F] hover:bg-[#0B1F3B] text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400"
                    >
                        {isLoading ? 'Analyzing...' : 'Get Strategy Analysis'}
                    </button>
                </div>
              </Card>

              {isAnalysisVisible && (
                  <>
                    <Card title="Operating Model Efficiency Index" className="!bg-transparent !border-none !shadow-none !p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                           {efficiencyData.map(data => <EfficiencyCard key={data.title} {...data} />)}
                        </div>
                    </Card>

                    {isLoading && (
                        <div className="flex items-center justify-center p-8 bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center space-x-2 text-gray-600">
                                <svg className="animate-spin h-5 w-5 text-[#003A8F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Generating AI Analysis... Please wait.</span>
                            </div>
                        </div>
                    )}
                    {error && (
                            <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {analysisResult && !error && (
                        <Card title={analysisResult.analysisResult.title} className="!bg-transparent !border-none !shadow-none !p-0">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="font-bold text-[#1A1A1A]">{analysisResult.analysisResult.title}</h3>
                                <p className="text-xs text-[#6B7280] mb-3">{analysisResult.analysisResult.subtitle}</p>
                                <p className="text-sm text-[#1A1A1A]">{analysisResult.analysisResult.summary}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <ImpactCard {...analysisResult.costImpact} />
                                <ImpactCard {...analysisResult.roleImpact} />
                                <ImpactCard {...analysisResult.strategyAndBusinessModelImpact} />
                                <ImpactCard {...analysisResult.valueChainImpact} />
                                <ImpactCard {...analysisResult.peopleChangeImpact} />
                                <ImpactCard {...analysisResult.systemAndDataImpact} />
                                <ImpactCard {...analysisResult.teamImpact} />
                                <ImpactCard {...analysisResult.skillImpact} />
                            </div>
                        </Card>
                    )}
                  </>
              )}

            </div>
          </main>
        </div>
    </div>
  );
};

export default DetailedAnalysisPage;
