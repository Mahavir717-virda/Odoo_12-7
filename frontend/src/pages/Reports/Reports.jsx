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
      icon: <Leaf className="w-5 h-5 text-accent-env" />,
      hero: false
    },
    {
      id: 2,
      title: "Social Report",
      desc: "Diversity, CSR participation, training completion",
      icon: <Users className="w-5 h-5 text-accent-soc" />,
      hero: false
    },
    {
      id: 3,
      title: "Governance Report",
      desc: "Policies, audits, compliance & risk summary",
      icon: <ShieldCheck className="w-5 h-5 text-accent-gov" />,
      hero: false
    },
    {
      id: 4,
      title: "ESG Summary",
      desc: "Executive overview: all 4 scores + dept comparison",
      icon: <BarChart2 className="w-5 h-5 text-accent-rep" />,
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
    'ESG Category': ['All Categories', 'Emission Factors', 'Carbon Transactions', 'Diversity', 'Policies', 'Audits']
  };

  const handleOpenFilterDropdown = (filterName) => {
    setActiveFilterName(filterName);
    setFilterOptions(filterOptionsMap[filterName] || []);
    setFilterModalOpen(true);
  };

  const handleSelectFilterOption = (val) => {
    setFilters({
      ...filters,
      [activeFilterName]: val
    });
    setFilterModalOpen(false);
    showToast(`Filter updated: ${activeFilterName} = ${val}`, "info");
  };

  const handleGenerateReportCard = (title) => {
    showToast(`Assembling dataset for ${title}...`, "info");
    setTimeout(() => {
      setReportState(prev => ({
        ...prev,
        [title]: 'Ready'
      }));
      showToast(`${title} generated and ready for export!`, "success");
    }, 1200);
  };

  const handleRunCustomReport = () => {
    showToast("Analyzing compliance audit logs & emission metrics...", "info");
    setTimeout(() => {
      setCustomReportRun(true);
      showToast("Custom report compiled successfully!", "success");
    }, 900);
  };

  const handleExportCustom = (format) => {
    if (!customReportRun) return;
    showToast(`Downloading custom report as ${format}...`, "success");
  };

  return (
    <div className="flex flex-col min-w-0 overflow-y-auto bg-bg-base flex-1">
      {/* SUB-NAV ROW */}
      <div className="bg-bg-card/10 border-b border-border-sage px-6 py-4 space-y-3">
        {/* Row 1: modular reports */}
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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors duration-150 cursor-pointer ${
                  isActive 
                    ? 'bg-accent-rep text-bg-base font-bold shadow-md shadow-accent-rep/10' 
                    : 'bg-bg-card border border-border-sage text-text-secondary hover:text-text-primary hover:border-text-secondary'
                }`}
              >
                {reportType}
              </button>
            );
          })}
        </div>

        {/* Row 2: report-view tabs (ESG Summary / Custom Builder) */}
        <div className="flex flex-wrap gap-3 border-t border-border-sage/40 pt-3">
          {['ESG Summary', 'Custom Builder'].map((subSection) => {
            const isActive = subSection === activeSubTab;
            return (
              <button
                key={subSection}
                onClick={() => {
                  setActiveSubTab(subSection);
                  setCustomReportRun(false);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-accent-rep text-bg-base shadow-md shadow-accent-rep/10 font-bold' 
                    : 'bg-bg-card border border-border-sage text-text-secondary hover:text-text-primary hover:border-text-secondary'
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
              <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">ESG Reports Center</h2>
              <p className="text-xs text-text-secondary mt-1 font-medium">Export standard modular summaries or custom-build compliance records.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {reportCards.map((card) => {
                const borderStyle = card.hero 
                  ? "border-2 border-accent-rep/50 shadow-lg shadow-accent-rep/5" 
                  : "border border-border-sage";
                
                const btnStyle = card.hero 
                  ? "bg-accent-rep hover:brightness-110 text-bg-base" 
                  : "border border-accent-rep/40 text-accent-rep hover:bg-accent-rep/10 bg-transparent";

                const stateLabel = reportState[card.title];

                return (
                  <div 
                    key={card.id}
                    className={`bg-bg-card ${borderStyle} rounded-2xl p-5 hover:scale-[1.01] hover:shadow-premium-cyan transition-all duration-300 flex flex-col justify-between min-h-[210px] group cursor-pointer`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3.5">
                          <div className="p-2.5 bg-bg-base border border-border-sage rounded-xl group-hover:scale-105 transition-transform duration-300">
                            {card.icon}
                          </div>
                          <h3 className="font-bold text-text-primary text-sm tracking-wide font-display">{card.title}</h3>
                        </div>
                        {stateLabel === 'Ready' && (
                          <span className="text-[9px] bg-accent-env/10 text-accent-env border border-accent-env/20 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                            Ready
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-text-secondary font-semibold leading-relaxed">
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
                        className={`w-full py-2 ${btnStyle} text-xs font-bold rounded-lg transition-all duration-150 active:scale-[0.98] cursor-pointer`}
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
          <section className="bg-bg-card border border-border-sage rounded-2xl p-6 space-y-6 shadow-lg shadow-brand/5">
            <div className="flex items-center space-x-2.5">
              <SlidersHorizontal className="w-5 h-5 text-accent-rep" />
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">Custom Report Builder: Filters</h3>
            </div>

            {/* Configured Filters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.keys(filters).map((filterName) => (
                <div 
                  key={filterName}
                  onClick={() => handleOpenFilterDropdown(filterName)}
                  className="bg-bg-base border border-border-sage hover:border-accent-rep/40 rounded-lg py-2.5 px-3.5 flex items-center justify-between text-xs font-semibold text-text-secondary hover:text-text-primary cursor-pointer transition-colors duration-150"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase font-bold text-text-secondary tracking-wider font-display">{filterName}</span>
                    <span className="text-text-primary text-xs mt-0.5 truncate font-bold">{filters[filterName]}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-text-secondary ml-1.5 flex-shrink-0" />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border-sage/40">
              <button 
                onClick={handleRunCustomReport}
                className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-gradient-to-r from-accent-rep to-cyan-600 hover:brightness-110 text-bg-base font-extrabold text-xs rounded-lg shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-bg-base stroke-[3]" />
                <span className="uppercase tracking-wider">Run Report</span>
              </button>

              {['PDF', 'Excel', 'CSV'].map((format) => (
                <button
                  key={format}
                  disabled={!customReportRun}
                  onClick={() => handleExportCustom(format)}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 bg-transparent border border-border-sage hover:border-text-secondary hover:bg-bg-base/40 text-text-primary font-bold text-xs rounded-lg transition-all active:scale-[0.98] ${
                    !customReportRun 
                      ? 'opacity-40 cursor-not-allowed' 
                      : 'cursor-pointer'
                  }`}
                >
                  <FileDown className="w-3.5 h-3.5 text-text-secondary" />
                  <span>EXPORT: {format}</span>
                </button>
              ))}
            </div>

            {customReportRun && (
              <div className="pt-4 border-t border-border-sage/40">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-3 font-display">Report Preview</span>
                <div className="bg-bg-base border border-border-sage rounded-xl p-4 text-xs font-mono text-accent-rep space-y-2">
                  <p className="text-text-secondary font-bold">// Custom ESG Query Results</p>
                  <p className="text-text-primary">Target Range: {filters['Date Range']} • Dept: {filters['Department']}</p>
                  <p className="text-text-secondary">Matching Records: 14 rows loaded successfully.</p>
                  <p className="text-accent-env">Total Carbon Target Achieved: 140 tCO2e equivalents</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* --- ENVIRONMENTAL DETAILED VIEW --- */}
        {activeSubTab === 'Environmental' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Environmental Metrics Breakdown</h2>
              <p className="text-xs text-text-secondary mt-1 font-medium">Logged Carbon, Scope 1/2 emissions indicators, and packaging target analytics.</p>
            </div>
            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden p-6 shadow-lg shadow-brand/5">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-sage text-text-secondary uppercase font-bold tracking-wider font-display text-[10px]">
                    <th className="pb-3">Reporting Period</th>
                    <th className="pb-3 text-right">Scope 1 (Direct)</th>
                    <th className="pb-3 text-right">Scope 2 (Indirect)</th>
                    <th className="pb-3 text-right">Scope 3 (Supply Chain)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  <tr className="hover:bg-bg-base/20 transition-colors">
                    <td className="py-4 font-bold font-display">Q1 2026</td>
                    <td className="py-4 text-right font-mono text-accent-gam font-bold">2,450 tCO2e</td>
                    <td className="py-4 text-right font-mono text-accent-env font-bold">1,200 tCO2e</td>
                    <td className="py-4 text-right font-mono text-accent-gov font-bold">4,800 tCO2e</td>
                  </tr>
                  <tr className="hover:bg-bg-base/20 transition-colors">
                    <td className="py-4 font-bold font-display">Q2 2026</td>
                    <td className="py-4 text-right font-mono text-accent-gam font-bold">2,100 tCO2e</td>
                    <td className="py-4 text-right font-mono text-accent-env font-bold">1,050 tCO2e</td>
                    <td className="py-4 text-right font-mono text-accent-gov font-bold">4,150 tCO2e</td>
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
              <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Social Metrics Summary</h2>
              <p className="text-xs text-text-secondary mt-1 font-medium">CSR Participation benchmarks, training acknowledgement rates, and employee satisfaction trends.</p>
            </div>
            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden p-6 shadow-lg shadow-brand/5">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-sage text-text-secondary uppercase font-bold tracking-wider font-display text-[10px]">
                    <th className="pb-3">Initiative Name</th>
                    <th className="pb-3">Target Engagement</th>
                    <th className="pb-3 text-right">Registered Participants</th>
                    <th className="pb-3 text-right">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  <tr className="hover:bg-bg-base/20 transition-colors">
                    <td className="py-4 font-bold font-display">Annual ESG Safety Workshop</td>
                    <td className="py-4 text-text-secondary font-semibold">90% of All Depts</td>
                    <td className="py-4 text-right font-mono font-bold text-text-primary">142 employees</td>
                    <td className="py-4 text-right font-mono text-accent-env font-bold">94.2%</td>
                  </tr>
                  <tr className="hover:bg-bg-base/20 transition-colors">
                    <td className="py-4 font-bold font-display">Zero Waste Week Challenge</td>
                    <td className="py-4 text-text-secondary font-semibold">50% of Logistics</td>
                    <td className="py-4 text-right font-mono font-bold text-text-primary">82 employees</td>
                    <td className="py-4 text-right font-mono text-accent-gam font-bold">78.5%</td>
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
              <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Governance Scorecard</h2>
              <p className="text-xs text-text-secondary mt-1 font-medium">Board oversight ratings, policy compliance logs, and corrective action histories.</p>
            </div>
            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden p-6 shadow-lg shadow-brand/5">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-sage text-text-secondary uppercase font-bold tracking-wider font-display text-[10px]">
                    <th className="pb-3">Policy Audit Category</th>
                    <th className="pb-3">Total Conducted Audits</th>
                    <th className="pb-3 text-right">Compliance Violations</th>
                    <th className="pb-3 text-right">Critical Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  <tr className="hover:bg-bg-base/20 transition-colors">
                    <td className="py-4 font-bold font-display">Anti-Bribery and Corruption</td>
                    <td className="py-4 text-text-secondary font-semibold">4 Internal, 1 External</td>
                    <td className="py-4 text-right font-mono text-accent-env font-bold">0</td>
                    <td className="py-4 text-right font-mono text-accent-env font-bold">Low Risk</td>
                  </tr>
                  <tr className="hover:bg-bg-base/20 transition-colors">
                    <td className="py-4 font-bold font-display">Procurement Vendor Integrity</td>
                    <td className="py-4 text-text-secondary font-semibold">2 Supplier Checks</td>
                    <td className="py-4 text-right font-mono text-accent-gam font-bold">1 open finding</td>
                    <td className="py-4 text-right font-mono text-accent-gam font-bold">Medium Risk</td>
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
        <div className="space-y-1 divide-y divide-border-sage/30">
          <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wide pb-3 font-display">Select a filter option to configure the custom report query:</p>
          {filterOptions.map((opt) => (
            <div 
              key={opt}
              onClick={() => handleSelectFilterOption(opt)}
              className="py-3 text-xs font-semibold text-text-primary hover:text-accent-rep cursor-pointer flex justify-between items-center group transition-colors"
            >
              <span className="group-hover:translate-x-0.5 transition-transform">{opt}</span>
              <span className="text-[9px] text-text-secondary group-hover:text-accent-rep font-bold uppercase tracking-wider">Select</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
