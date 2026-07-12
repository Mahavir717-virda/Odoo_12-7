import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Leaf, 
  Users, 
  ShieldCheck, 
  BarChart2, 
  SlidersHorizontal, 
  ChevronDown, 
  Play, 
  FileDown 
} from 'lucide-react';

export default function Reports() {
  const location = useLocation();
  const [activeSubTab, setActiveSubTab] = useState('ESG Summary');

  useEffect(() => {
    if (location.state?.activeSubTab) {
      // In the layout, we may pass longer sub-item names like 'Environmental Report' or 'ESG Summary'
      // Map them to what's used inside the page's sub-nav state
      const tabMap = {
        'Environmental Report': 'Environmental',
        'Social Report': 'Social',
        'Governance Report': 'Governance',
        'ESG Summary': 'ESG Summary',
        'Custom Report Builder': 'Custom Builder'
      };
      const mapped = tabMap[location.state.activeSubTab];
      if (mapped) {
        setActiveSubTab(mapped);
      }
    }
  }, [location.state]);

  const reportCards = [
    {
      id: 1,
      title: "Environmental Report",
      desc: "Emissions, goals, vendor & product breakdown",
      icon: <Leaf className="w-5 h-5 text-emerald-400" />,
      hero: false
    },
    {
      id: 2,
      title: "Social Report",
      desc: "Diversity, CSR participation, training completion",
      icon: <Users className="w-5 h-5 text-blue-400" />,
      hero: false
    },
    {
      id: 3,
      title: "Governance Report",
      desc: "Policies, audits, compliance & risk summary",
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
      hero: false
    },
    {
      id: 4,
      title: "ESG Summary",
      desc: "Executive overview: all 4 scores + dept comparison",
      icon: <BarChart2 className="w-5 h-5 text-cyan-400" />,
      hero: true
    }
  ];

  const customFilters = [
    "Date Range",
    "Department",
    "Module",
    "Employee",
    "Challenge",
    "ESG Category"
  ];

  return (
    <div className="flex flex-col min-w-0 overflow-y-auto bg-[#0B0F14] flex-1">
      {/* SUB-NAV ROW (Two rows) */}
      <div className="bg-[#11161D]/15 border-b border-[#1F2937]/60 px-6 py-4 space-y-4">
        {/* Row 1: report-type tabs */}
        <div className="flex flex-wrap gap-2.5">
          {['Environmental', 'Social', 'Governance'].map((reportType) => {
            const isActive = reportType === activeSubTab;
            return (
              <button
                key={reportType}
                onClick={() => setActiveSubTab(reportType)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors duration-150 ${
                  isActive 
                    ? 'bg-[#06B6D4] text-black font-bold' 
                    : 'bg-gray-900/30 border border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {reportType}
              </button>
            );
          })}
        </div>

        {/* Row 2: report-view tabs (ESG Summary / Custom Builder) */}
        <div className="flex flex-wrap gap-3 border-t border-gray-800/40 pt-3">
          {['ESG Summary', 'Custom Builder'].map((subSection) => {
            const isActive = subSection === activeSubTab;
            return (
              <button
                key={subSection}
                onClick={() => setActiveSubTab(subSection)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#06B6D4] text-black shadow-md shadow-cyan-500/10 font-bold' 
                    : 'bg-[#11161D] border border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                }`}
              >
                {subSection}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="p-6 space-y-10 max-w-7xl w-full mx-auto flex-1">
        {activeSubTab === 'ESG Summary' && (
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">ESG Reports Center</h2>
              <p className="text-xs text-gray-400 mt-1 font-medium">Export standard modular summaries or custom-build compliance records.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {reportCards.map((card) => {
                const borderStyle = card.hero 
                  ? "border-2 border-cyan-500/50 shadow-lg shadow-cyan-950/20" 
                  : "border border-white/10";
                
                const btnStyle = card.hero 
                  ? "bg-[#06B6D4] text-black hover:bg-[#0891B2]" 
                  : "border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 bg-transparent";

                return (
                  <div 
                    key={card.id}
                    className={`bg-[#11161D] ${borderStyle} rounded-2xl p-5 hover:scale-[1.01] hover:shadow-lg hover:shadow-cyan-950/5 transition-all duration-300 flex flex-col justify-between min-h-[210px] group cursor-pointer`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="p-2.5 bg-gray-800/40 rounded-xl group-hover:scale-105 transition-transform duration-300">
                          {card.icon}
                        </div>
                        <h3 className="font-bold text-white text-sm tracking-wide">{card.title}</h3>
                      </div>
                      <p className="text-[11.5px] text-gray-400 font-semibold leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    <div className="mt-5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`Generate report clicked: ${card.title}`);
                        }}
                        className={`w-full py-2 ${btnStyle} text-xs font-bold rounded-lg transition-all duration-150 active:scale-[0.98]`}
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeSubTab === 'Custom Builder' && (
          <section className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-2.5">
              <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Custom Report Builder: Filters</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {customFilters.map((filter) => (
                <div 
                  key={filter}
                  onClick={() => console.log(`Dropdown active: ${filter}`)}
                  className="bg-[#0B0F14] border border-gray-800 hover:border-gray-700/80 rounded-lg py-2 px-3.5 flex items-center justify-between text-xs font-semibold text-gray-400 hover:text-gray-200 cursor-pointer transition-colors duration-150"
                >
                  <span>{filter}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-800/40">
              <button 
                onClick={() => console.log('Run Report clicked')}
                className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-black font-extrabold text-xs rounded-lg shadow-lg shadow-cyan-950/20 transition-all duration-150 active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-black stroke-[3]" />
                <span>Run Report</span>
              </button>

              {['PDF', 'Excel', 'CSV'].map((format) => (
                <button
                  key={format}
                  onClick={() => console.log(`Export to ${format} clicked`)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800/40 text-gray-300 font-semibold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <FileDown className="w-3.5 h-3.5 text-gray-500" />
                  <span>Export: {format}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {(activeSubTab === 'Environmental' || activeSubTab === 'Social' || activeSubTab === 'Governance') && (
          <div className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <span className="text-3xl mb-4">🚧</span>
            <h3 className="text-base font-semibold text-white tracking-wide">{activeSubTab} Report</h3>
            <p className="text-sm text-gray-500 mt-2 font-medium">Content coming soon</p>
          </div>
        )}
      </main>
    </div>
  );
}
