import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { reportService, departmentService } from '../../services/api';
import Modal from '../../components/Modal';
import { 
  Leaf, 
  Users, 
  ShieldCheck, 
  BarChart2, 
  SlidersHorizontal, 
  ChevronDown, 
  Play, 
  FileDown,
  Loader2,
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function Reports() {
  const location = useLocation();
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('ESG Summary');

  // Reports loading & data states
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  // Custom filter selections
  const [filters, setFilters] = useState({
    'Date Range': 'All Time',
    'Department': 'All Departments',
    'Module': 'All Modules',
    'Employee': 'All Employees',
    'Challenge': 'All Challenges',
    'ESG Category': 'All Categories'
  });

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Modal for selecting filter options
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [activeFilterName, setActiveFilterName] = useState('');
  const [filterOptions, setFilterOptions] = useState([]);

  // Load initial dropdowns
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const depts = await departmentService.getAll();
        setDepartments(depts);
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    };
    loadDropdowns();
  }, []);

  // Fetch current report based on tab & filters
  const fetchReport = async () => {
    setIsLoading(true);
    try {
      // Map filters
      const params = {};
      if (filters['Department'] !== 'All Departments') {
        params.department = filters['Department'];
      }
      
      const dateRange = filters['Date Range'];
      const now = new Date();
      if (dateRange === 'Last 30 Days') {
        params.startDate = new Date(now.setDate(now.getDate() - 30)).toISOString();
      } else if (dateRange === 'Last 90 Days') {
        params.startDate = new Date(now.setDate(now.getDate() - 90)).toISOString();
      } else if (dateRange === 'This Year') {
        params.startDate = new Date(now.getFullYear(), 0, 1).toISOString();
      }

      let data = null;
      if (activeSubTab === 'ESG Summary') {
        data = await reportService.getEsgSummary(params);
      } else if (activeSubTab === 'Environmental') {
        data = await reportService.getEnvironmental(params);
      } else if (activeSubTab === 'Social') {
        data = await reportService.getSocial(params);
      } else if (activeSubTab === 'Governance') {
        data = await reportService.getGovernance(params);
      } else if (activeSubTab === 'Custom Builder') {
        const payload = {
          module: filters['Module'] === 'All Modules' ? 'Environmental' : filters['Module'],
          department: filters['Department'],
          startDate: params.startDate,
        };
        data = await reportService.getCustomReport(payload);
      }

      setReportData(data);
    } catch (err) {
      showToast("Failed to load report data: " + err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeSubTab, filters['Department'], filters['Date Range'], filters['Module']]);

  const handleExport = async (format, reportType) => {
    try {
      showToast(`Exporting ${reportType} as ${format}...`, "info");
      
      const params = {};
      if (filters['Department'] !== 'All Departments') params.department = filters['Department'];
      
      const dateRange = filters['Date Range'];
      const now = new Date();
      if (dateRange === 'Last 30 Days') {
        params.startDate = new Date(now.setDate(now.getDate() - 30)).toISOString();
      } else if (dateRange === 'Last 90 Days') {
        params.startDate = new Date(now.setDate(now.getDate() - 90)).toISOString();
      } else if (dateRange === 'This Year') {
        params.startDate = new Date(now.getFullYear(), 0, 1).toISOString();
      }

      const blob = await reportService.exportReport(format, reportType, params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      let ext = format.toLowerCase();
      if (format === 'Excel') ext = 'xls';
      link.setAttribute('download', `${reportType.toLowerCase().replace(/\s+/g, '_')}_report.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast(`${reportType} exported successfully!`, "success");
    } catch (err) {
      showToast("Export failed: " + err.message, "error");
    }
  };

  const filterOptionsMap = {
    'Date Range': ['All Time', 'Last 30 Days', 'Last 90 Days', 'This Year'],
    'Department': ['All Departments', ...departments.map(d => d.name)],
    'Module': ['All Modules', 'Environmental', 'Social', 'Governance'],
    'Employee': ['All Employees'],
    'Challenge': ['All Challenges'],
    'ESG Category': ['All Categories']
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

  return (
    <div className="flex flex-col min-w-0 overflow-y-auto bg-bg-base flex-1">
      {/* SUB-NAV ROW */}
      <div className="bg-bg-card/10 border-b border-border-sage px-6 py-4 space-y-3">
        <div className="flex flex-wrap gap-2.5">
          {['Environmental', 'Social', 'Governance'].map((reportType) => {
            const isActive = reportType === activeSubTab;
            return (
              <button
                key={reportType}
                onClick={() => setActiveSubTab(reportType)}
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

        <div className="flex flex-wrap gap-3 border-t border-border-sage/40 pt-3">
          {['ESG Summary', 'Custom Builder'].map((subSection) => {
            const isActive = subSection === activeSubTab;
            return (
              <button
                key={subSection}
                onClick={() => setActiveSubTab(subSection)}
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
            <p className="text-xs text-text-secondary">Generating report from MongoDB...</p>
          </div>
        ) : (
          <>
            {activeSubTab === 'ESG Summary' && reportData && (
              <section className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border-sage">
                  <div>
                    <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">ESG Summary Overview</h2>
                    <p className="text-xs text-text-secondary mt-1 font-medium">Organization ESG Score: <span className="font-extrabold text-brand">{reportData.overallScore} / 100</span></p>
                  </div>
                  <button 
                    onClick={() => handleExport('PDF', 'ESG Summary')}
                    className="flex items-center space-x-2 px-4 py-2 bg-brand text-bg-base text-xs font-bold rounded-lg hover:brightness-110 active:scale-[0.98] cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-bg-card border border-border-sage rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-text-secondary uppercase">Carbon Transactions</h3>
                    <p className="text-2xl font-bold font-mono mt-2 text-text-primary">{reportData.metrics.carbonTransactionsCount}</p>
                  </div>
                  <div className="bg-bg-card border border-border-sage rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-text-secondary uppercase">CSR Projects</h3>
                    <p className="text-2xl font-bold font-mono mt-2 text-text-primary">{reportData.metrics.csrProjectsCount}</p>
                  </div>
                  <div className="bg-bg-card border border-border-sage rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-text-secondary uppercase">Active Policies</h3>
                    <p className="text-2xl font-bold font-mono mt-2 text-text-primary">{reportData.metrics.policiesCount}</p>
                  </div>
                  <div className="bg-bg-card border border-border-sage rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-text-secondary uppercase">Goal Achievement</h3>
                    <p className="text-2xl font-bold font-mono mt-2 text-brand">{reportData.metrics.goalCompletion}%</p>
                  </div>
                </div>

                {/* Department Rankings table */}
                <div className="bg-bg-card border border-border-sage rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-text-primary uppercase mb-4">Department ESG Rankings</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border-sage text-text-secondary uppercase font-bold text-[10px]">
                          <th className="pb-3">Department</th>
                          <th className="pb-3 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-sage/40 text-text-primary">
                        {reportData.charts?.departmentRankings?.map((item, idx) => (
                          <tr key={idx} className="hover:bg-bg-base/20 transition-colors">
                            <td className="py-3 font-bold font-display">{item.department}</td>
                            <td className="py-3 text-right font-mono font-bold text-brand">{item.Score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {activeSubTab === 'Environmental' && reportData && (
              <section className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border-sage">
                  <div>
                    <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Environmental Metrics Breakdown</h2>
                    <p className="text-xs text-text-secondary mt-1 font-medium">Logged Carbon Footprint, Goal Progress, and Department-wise Emissions.</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleExport('PDF', 'Environmental')}
                      className="flex items-center space-x-2 px-3 py-2 bg-brand text-bg-base text-xs font-bold rounded-lg hover:brightness-110 active:scale-[0.98] cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>PDF</span>
                    </button>
                    <button 
                      onClick={() => handleExport('CSV', 'Environmental')}
                      className="flex items-center space-x-2 px-3 py-2 bg-bg-card border border-border-sage text-text-primary text-xs font-bold rounded-lg hover:bg-bg-base/50 active:scale-[0.98] cursor-pointer"
                    >
                      <span>CSV</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-bg-card border border-border-sage rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-text-secondary uppercase">Total Carbon Emission</h3>
                    <p className="text-2xl font-bold font-mono mt-2 text-accent-env">{reportData.metrics.totalCarbon} kg CO₂</p>
                  </div>
                  <div className="bg-bg-card border border-border-sage rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-text-secondary uppercase">Top Carbon Source</h3>
                    <p className="text-lg font-bold mt-2 text-text-primary">{reportData.metrics.topCarbonSource}</p>
                  </div>
                  <div className="bg-bg-card border border-border-sage rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-text-secondary uppercase">Goal Progress Rate</h3>
                    <p className="text-2xl font-bold font-mono mt-2 text-brand">{reportData.metrics.goalProgress}%</p>
                  </div>
                </div>

                <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden p-6">
                  <h3 className="text-sm font-bold text-text-primary uppercase mb-4">Carbon Transactions Log</h3>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border-sage text-text-secondary uppercase font-bold text-[10px]">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Department</th>
                        <th className="pb-3">Activity</th>
                        <th className="pb-3 text-right">Calculated Emission</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-sage/40 text-text-primary">
                      {reportData.data?.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-bg-base/20 transition-colors">
                          <td className="py-3 font-mono">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                          <td className="py-3 font-semibold">{tx.department?.name || 'Unassigned'}</td>
                          <td className="py-3">{tx.activityType}</td>
                          <td className="py-3 text-right font-mono font-bold text-accent-env">{tx.calculatedEmission} kg CO₂</td>
                        </tr>
                      ))}
                      {reportData.data?.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-text-secondary">No records found matching filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeSubTab === 'Social' && reportData && (
              <section className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border-sage">
                  <div>
                    <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Social & CSR Initiatives</h2>
                    <p className="text-xs text-text-secondary mt-1 font-medium">Dynamic volunteer tracking, CSR engagement benchmarks, and participation indices.</p>
                  </div>
                  <button 
                    onClick={() => handleExport('PDF', 'Social')}
                    className="flex items-center space-x-2 px-4 py-2 bg-brand text-bg-base text-xs font-bold rounded-lg hover:brightness-110 active:scale-[0.98] cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-bg-card border border-border-sage rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-text-secondary uppercase">Participation Rate</h3>
                    <p className="text-2xl font-bold font-mono mt-2 text-brand">{reportData.metrics.participationPercentage}%</p>
                  </div>
                  <div className="bg-bg-card border border-border-sage rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-text-secondary uppercase">Volunteer Hours</h3>
                    <p className="text-2xl font-bold font-mono mt-2 text-text-primary">{reportData.metrics.volunteerHours} hours</p>
                  </div>
                  <div className="bg-bg-card border border-border-sage rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-text-secondary uppercase">CSR Projects Count</h3>
                    <p className="text-2xl font-bold font-mono mt-2 text-text-primary">{reportData.metrics.totalActivities}</p>
                  </div>
                </div>

                <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden p-6">
                  <h3 className="text-sm font-bold text-text-primary uppercase mb-4">CSR Participation Log</h3>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border-sage text-text-secondary uppercase font-bold text-[10px]">
                        <th className="pb-3">Employee</th>
                        <th className="pb-3">Initiative</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3 text-right">Points Earned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-sage/40 text-text-primary">
                      {reportData.data?.map((p, idx) => (
                        <tr key={idx} className="hover:bg-bg-base/20 transition-colors">
                          <td className="py-3 font-semibold">{p.employee?.name || 'Anonymous'}</td>
                          <td className="py-3">{p.activity?.title}</td>
                          <td className="py-3 uppercase text-[10px] text-text-secondary font-bold">{p.activity?.category}</td>
                          <td className="py-3 text-right font-mono font-bold text-brand">+{p.points} XP</td>
                        </tr>
                      ))}
                      {reportData.data?.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-text-secondary">No records found matching filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeSubTab === 'Governance' && reportData && (
              <section className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border-sage">
                  <div>
                    <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Governance & Compliance Scorecard</h2>
                    <p className="text-xs text-text-secondary mt-1 font-medium">Compliance issues resolution rates, audits completed, and policy acknowledgment statuses.</p>
                  </div>
                  <button 
                    onClick={() => handleExport('PDF', 'Governance')}
                    className="flex items-center space-x-2 px-4 py-2 bg-brand text-bg-base text-xs font-bold rounded-lg hover:brightness-110 active:scale-[0.98] cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-bg-card border border-border-sage rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-text-secondary uppercase">Compliance Score</h3>
                    <p className="text-2xl font-bold font-mono mt-2 text-brand">{reportData.metrics.complianceScore}%</p>
                  </div>
                  <div className="bg-bg-card border border-border-sage rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-text-secondary uppercase">Open Issues</h3>
                    <p className="text-2xl font-bold font-mono mt-2 text-accent-gam">{reportData.metrics.openIssues}</p>
                  </div>
                  <div className="bg-bg-card border border-border-sage rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-text-secondary uppercase">Audits Passed</h3>
                    <p className="text-2xl font-bold font-mono mt-2 text-brand">{reportData.metrics.auditsPassed}</p>
                  </div>
                </div>

                <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden p-6">
                  <h3 className="text-sm font-bold text-text-primary uppercase mb-4">Compliance Issues Checklist</h3>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border-sage text-text-secondary uppercase font-bold text-[10px]">
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Department</th>
                        <th className="pb-3">Severity</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-sage/40 text-text-primary">
                      {reportData.data?.compliances?.map((c, idx) => (
                        <tr key={idx} className="hover:bg-bg-base/20 transition-colors">
                          <td className="py-3 font-semibold">{c.title}</td>
                          <td className="py-3">{c.department?.name || 'Corporate'}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              c.severity === 'CRITICAL' || c.severity === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {c.severity}
                            </span>
                          </td>
                          <td className="py-3 text-right font-bold uppercase">{c.status}</td>
                        </tr>
                      ))}
                      {reportData.data?.compliances?.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-text-secondary">No compliance issues logged.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeSubTab === 'Custom Builder' && (
              <section className="bg-bg-card border border-border-sage rounded-2xl p-6 space-y-6 shadow-lg shadow-brand/5">
                <div className="flex items-center space-x-2.5">
                  <SlidersHorizontal className="w-5 h-5 text-accent-rep" />
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">Custom Report Builder</h3>
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
                    onClick={fetchReport}
                    className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-gradient-to-r from-accent-rep to-cyan-600 hover:brightness-110 text-bg-base font-extrabold text-xs rounded-lg shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-bg-base stroke-[3]" />
                    <span className="uppercase tracking-wider">Run Report</span>
                  </button>

                  {['PDF', 'Excel', 'CSV'].map((format) => (
                    <button 
                      key={format}
                      onClick={() => handleExport(format, `Custom ${filters['Module'] === 'All Modules' ? 'Environmental' : filters['Module']}`)}
                      className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-bg-card border border-border-sage hover:bg-bg-base/40 text-text-primary font-bold text-xs rounded-lg transition-colors active:scale-[0.98] cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5 text-text-secondary" />
                      <span>EXPORT: {format}</span>
                    </button>
                  ))}
                </div>

                {reportData && (
                  <div className="space-y-4 pt-6 border-t border-border-sage/40">
                    <div className="bg-bg-base border border-border-sage rounded-xl p-4 text-xs font-mono text-accent-rep space-y-2">
                      <p className="text-text-secondary font-bold">// Custom ESG Query Results</p>
                      <p className="text-text-primary">Target: {reportData.reportType} • Dept: {filters['Department']}</p>
                      <p className="text-text-secondary">Matching Records: {Array.isArray(reportData.data) ? reportData.data.length : 'Object data'}</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border-sage text-text-secondary uppercase font-bold text-[10px]">
                            <th className="pb-3">Record Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-sage/40 text-text-primary">
                          {(Array.isArray(reportData.data) ? reportData.data : [reportData.data]).map((row, idx) => (
                            <tr key={idx} className="hover:bg-bg-base/20 transition-colors">
                              <td className="py-3 font-mono text-[10px]">
                                {JSON.stringify(row)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
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
