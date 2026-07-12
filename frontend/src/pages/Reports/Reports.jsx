import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
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
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('ESG Summary');

  // Reports state
  const [reportState, setReportState] = useState({
    'Environmental Report': 'Not Generated',
    'Social Report': 'Not Generated',
    'Governance Report': 'Not Generated',
    'ESG Summary': 'Not Generated'
  });

  // Custom report run state
  const [customReportRun, setCustomReportRun] = useState(false);

  // Custom filter selections
  const [filters, setFilters] = useState({
    'Date Range': 'All Time',
    'Department': 'All Departments',
    'Module': 'All Modules',
    'Employee': 'All Employees',
    'Challenge': 'All Challenges',
    'ESG Category': 'All Categories'
  });

  // Modal for selecting filter options
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [activeFilterName, setActiveFilterName] = useState('');
  const [filterOptions, setFilterOptions] = useState([]);

  useEffect(() => {
    if (location.state?.activeSubTab) {
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

  // Map filters to their selectable options
  const filterOptionsMap = {
    'Date Range': ['All Time', 'Last 30 Days', 'Last 90 Days', 'This Year'],
    'Department': ['All Departments', 'Manufacturing', 'Procurement', 'Logistics', 'Corporate', 'R&D'],
    'Module': ['All Modules', 'Environmental', 'Social', 'Governance'],
    'Employee': ['All Employees', 'Aditi Rao', 'Karan Shah', 'Deep Pathak'],
    'Challenge': ['All Challenges', 'Sustainability Sprint', 'Recycle Challenge', 'Commute Green Week'],
    'ESG Category': ['All Categories', 'Emissions', 'Diversity', 'Audits', 'Policies']
  };

  const handleOpenFilterDropdown = (filterName) => {
    setActiveFilterName(filterName);
    setFilterOptions(filterOptionsMap[filterName]);
    setFilterModalOpen(true);
  };

  const handleSelectFilterOption = (option) => {
    setFilters({ ...filters, [activeFilterName]: option });
    setFilterModalOpen(false);
    showToast(`Filter "${activeFilterName}" set to "${option}"`, "info");
  };

  // Generate standard report card
  const handleGenerateReportCard = (title) => {
    showToast(`Generating ${title}...`, "info");
    setTimeout(() => {
      setReportState(prev => ({ ...prev, [title]: 'Ready' }));
      showToast(`${title} generated and ready for export!`, "success");
    }, 1000);
  };

  // Run custom builder report
  const handleRunCustomReport = () => {
    showToast("Running custom ESG query...", "info");
    setTimeout(() => {
      setCustomReportRun(true);
      showToast("Custom report compiled! 14 matching entries found.", "success");
    }, 1200);
  };

  const handleExportCustom = (format) => {
    if (!customReportRun) {
      showToast("Please run the report first before exporting.", "error");
      return;
    }
    showToast(`Exporting custom report as ${format}...`, "success");
  };

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
                onClick={() => {
                  setActiveSubTab(reportType);
                  setCustomReportRun(false);
                }}
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
                onClick={() => {
                  setActiveSubTab(subSection);
                  setCustomReportRun(false);
                }}
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

                const stateLabel = reportState[card.title];

                return (
                  <div 
                    key={card.id}
                    className={`bg-[#11161D] ${borderStyle} rounded-2xl p-5 hover:scale-[1.01] hover:shadow-lg hover:shadow-cyan-950/5 transition-all duration-300 flex flex-col justify-between min-h-[210px] group cursor-pointer`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3.5">
                          <div className="p-2.5 bg-gray-800/40 rounded-xl group-hover:scale-105 transition-transform duration-300">
                            {card.icon}
                          </div>
                          <h3 className="font-bold text-white text-sm tracking-wide">{card.title}</h3>
                        </div>
                        {stateLabel === 'Ready' && (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                            Ready
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-gray-400 font-semibold leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    <div className="mt-5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (stateLabel === 'Ready') {
                            showToast(`Downloading ${card.title} PDF...`, "success");
                          } else {
                            handleGenerateReportCard(card.title);
                          }
                        }}
                        className={`w-full py-2 ${btnStyle} text-xs font-bold rounded-lg transition-all duration-150 active:scale-[0.98]`}
                      >
                        {stateLabel === 'Ready' ? 'Download PDF' : 'Generate'}
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

            {/* Configured Filters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.keys(filters).map((filterName) => (
                <div 
                  key={filterName}
                  onClick={() => handleOpenFilterDropdown(filterName)}
                  className="bg-[#0B0F14] border border-gray-800 hover:border-cyan-500/30 rounded-lg py-2.5 px-3.5 flex items-center justify-between text-xs font-semibold text-gray-400 hover:text-gray-200 cursor-pointer transition-colors duration-150"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">{filterName}</span>
                    <span className="text-white text-xs mt-0.5 truncate font-bold">{filters[filterName]}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-650 ml-1.5 flex-shrink-0" />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-800/40">
              <button 
                onClick={handleRunCustomReport}
                className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-black font-extrabold text-xs rounded-lg shadow-lg shadow-cyan-950/20 transition-all duration-150 active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-black stroke-[3]" />
                <span>Run Report</span>
              </button>

              {['PDF', 'Excel', 'CSV'].map((format) => (
                <button
                  key={format}
                  onClick={() => handleExportCustom(format)}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800/40 text-gray-300 font-semibold text-xs rounded-lg transition-all duration-150 active:scale-[0.98] ${!customReportRun ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <FileDown className="w-3.5 h-3.5 text-gray-500" />
                  <span>Export: {format}</span>
                </button>
              ))}
            </div>

            {customReportRun && (
              <div className="pt-4 border-t border-gray-800/30">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-3">Report Preview</span>
                <div className="bg-[#0B0F14] border border-gray-850 rounded-xl p-4 text-xs font-mono text-cyan-400 space-y-2">
                  <p className="text-gray-400 font-bold">// Custom ESG Query Results</p>
                  <p className="text-gray-300">Target Range: {filters['Date Range']} • Dept: {filters['Department']}</p>
                  <p className="text-gray-350">Matching Records: 14 rows loaded successfully.</p>
                  <p className="text-emerald-400">Total Carbon Target Achieved: 140 tCO2e equivalents</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* --- ENVIRONMENTAL DETAILED VIEW --- */}
        {activeSubTab === 'Environmental' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Environmental Metrics Breakdown</h2>
              <p className="text-xs text-gray-400 mt-1">Logged Carbon, Scope 1/2 emissions indicators, and packaging target analytics.</p>
            </div>
            <div className="bg-[#11161D] border border-gray-800 rounded-2xl overflow-hidden p-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-850 text-gray-500 uppercase font-bold tracking-wider py-2">
                    <th className="pb-3">Reporting Period</th>
                    <th className="pb-3 text-right">Scope 1 (Direct)</th>
                    <th className="pb-3 text-right">Scope 2 (Indirect)</th>
                    <th className="pb-3 text-right">Scope 3 (Supply Chain)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300">
                  <tr>
                    <td className="py-3 font-semibold">Q1 2026</td>
                    <td className="py-3 text-right font-mono text-amber-500">2,450 tCO2e</td>
                    <td className="py-3 text-right font-mono text-emerald-400">1,200 tCO2e</td>
                    <td className="py-3 text-right font-mono text-purple-400">4,800 tCO2e</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold">Q2 2026</td>
                    <td className="py-3 text-right font-mono text-amber-500">2,100 tCO2e</td>
                    <td className="py-3 text-right font-mono text-emerald-400">1,050 tCO2e</td>
                    <td className="py-3 text-right font-mono text-purple-400">4,150 tCO2e</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- SOCIAL DETAILED VIEW --- */}
        {activeSubTab === 'Social' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Social Metrics Summary</h2>
              <p className="text-xs text-gray-400 mt-1">CSR Participation benchmarks, training acknowledgement rates, and employee satisfaction trends.</p>
            </div>
            <div className="bg-[#11161D] border border-gray-800 rounded-2xl overflow-hidden p-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-850 text-gray-500 uppercase font-bold tracking-wider py-2">
                    <th className="pb-3">Initiative Name</th>
                    <th className="pb-3">Target Engagement</th>
                    <th className="pb-3 text-right">Registered Participants</th>
                    <th className="pb-3 text-right">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300">
                  <tr>
                    <td className="py-3 font-semibold">Annual ESG Safety Workshop</td>
                    <td className="py-3">90% of All Depts</td>
                    <td className="py-3 text-right font-mono">142 employees</td>
                    <td className="py-3 text-right font-mono text-emerald-400">94.2%</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold">Zero Waste Week Challenge</td>
                    <td className="py-3">50% of Logistics</td>
                    <td className="py-3 text-right font-mono">82 employees</td>
                    <td className="py-3 text-right font-mono text-amber-500">78.5%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- GOVERNANCE DETAILED VIEW --- */}
        {activeSubTab === 'Governance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Governance Scorecard</h2>
              <p className="text-xs text-gray-400 mt-1">Board oversight ratings, policy compliance logs, and corrective action histories.</p>
            </div>
            <div className="bg-[#11161D] border border-gray-800 rounded-2xl overflow-hidden p-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-850 text-gray-500 uppercase font-bold tracking-wider py-2">
                    <th className="pb-3">Policy Audit Category</th>
                    <th className="pb-3">Total Conducted Audits</th>
                    <th className="pb-3 text-right">Compliance Violations</th>
                    <th className="pb-3 text-right">Critical Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40 text-gray-300">
                  <tr>
                    <td className="py-3 font-semibold">Anti-Bribery and Corruption</td>
                    <td className="py-3">4 Internal, 1 External</td>
                    <td className="py-3 text-right font-mono text-emerald-400">0</td>
                    <td className="py-3 text-right font-mono text-emerald-400">Low Risk</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold">Procurement Vendor Integrity</td>
                    <td className="py-3">2 Supplier Checks</td>
                    <td className="py-3 text-right font-mono text-amber-500">1 open finding</td>
                    <td className="py-3 text-right font-mono text-amber-500">Medium Risk</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* --- FILTER SELECTOR MODAL --- */}
      <Modal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title={`Filter Option: ${activeFilterName}`}
        confirmText=""
        onConfirm={null}
      >
        <div className="space-y-3.5 divide-y divide-gray-850">
          <p className="text-[11px] text-gray-400 pb-2">Select a filter option to configure the custom report query:</p>
          {filterOptions.map((opt) => (
            <div 
              key={opt}
              onClick={() => handleSelectFilterOption(opt)}
              className="pt-3 pb-2 text-xs font-semibold text-white hover:text-cyan-400 cursor-pointer flex justify-between items-center group transition-colors"
            >
              <span>{opt}</span>
              <span className="text-[10px] text-gray-600 group-hover:text-cyan-500 font-bold uppercase">Select</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
