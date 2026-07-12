import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Download, 
  ChevronDown, 
  ShieldAlert, 
  AlertTriangle, 
  Menu, 
  X, 
  Compass, 
  Activity, 
  Globe, 
  Users, 
  Shield, 
  Award, 
  FileSpreadsheet, 
  Settings 
} from 'lucide-react';

export default function Governance() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Audits');
  const navigate = useNavigate();

  // Sidebar Group Config
  const sidebarGroups = [
    {
      title: 'Environmental',
      color: '#22C55E', // green
      icon: <Globe className="w-4 h-4 text-emerald-400" />,
      items: ['Emission Factors', 'Product ESG Profiles', 'Carbon Transactions', 'Environmental Goals']
    },
    {
      title: 'Social',
      color: '#3B82F6', // blue
      icon: <Users className="w-4 h-4 text-blue-400" />,
      items: ['CSR Activities', 'Employee Participation', 'Diversity Dashboard']
    },
    {
      title: 'Governance',
      color: '#A855F7', // purple
      icon: <Shield className="w-4 h-4 text-purple-400" />,
      items: ['Policies', 'Policy Acknowledgements', 'Audits', 'Compliance Issues']
    },
    {
      title: 'Gamification',
      color: '#F97316', // orange
      icon: <Award className="w-4 h-4 text-orange-400" />,
      items: ['Challenges', 'Challenge Participation', 'Badges', 'Rewards', 'Leaderboard']
    },
    {
      title: 'Reports',
      color: '#06B6D4', // cyan
      icon: <FileSpreadsheet className="w-4 h-4 text-cyan-400" />,
      items: ['Environmental Report', 'Social Report', 'Governance Report', 'ESG Summary', 'Custom Report Builder']
    },
    {
      title: 'Settings',
      color: '#9CA3AF', // gray
      icon: <Settings className="w-4 h-4 text-gray-400" />,
      items: ['Departments', 'Categories', 'ESG Configuration', 'Notification Settings']
    }
  ];

  // Audits Data
  const auditsData = [
    {
      id: 1,
      title: "Q2 Waste Audit",
      department: "Manufacturing",
      auditor: "S. Nair",
      date: "2026-06-12",
      findings: "3 minor issues",
      status: "Completed" // blue/cyan badge
    },
    {
      id: 2,
      title: "Vendor Compliance Check",
      department: "Procurement",
      auditor: "R. Iyer",
      date: "2026-07-01",
      findings: "1 open issue",
      status: "Under Review" // purple badge
    }
  ];

  // Compliance Issues Data
  const complianceIssuesData = [
    {
      id: 1,
      issue: "Missing MSDS sheets",
      severity: "High", // solid red
      department: "Manufacturing",
      status: "Open" // outline red
    },
    {
      id: 2,
      issue: "Late vendor disclosure",
      severity: "Medium", // solid amber
      department: "Procurement",
      status: "Resolved" // outline green
    }
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    console.log(`Navigation tab clicked: ${tab}`);
    if (tab === 'Dashboard') {
      navigate('/');
    } else if (tab === 'Environmental' || tab === 'Environmental Goals') {
      navigate('/environmental/environmental-goals');
    } else if (tab === 'Social' || tab === 'CSR Activities') {
      navigate('/social/csr-activities');
    } else if (tab === 'Governance' || tab === 'Audits' || tab === 'Compliance Issues') {
      navigate('/governance/audits');
    } else if (tab === 'Gamification' || tab === 'Challenges' || tab === 'Badges' || tab === 'Leaderboard') {
      navigate('/gamification/challenges');
    } else if (tab === 'Reports' || tab === 'Environmental Report' || tab === 'Social Report' || tab === 'Governance Report' || tab === 'ESG Summary' || tab === 'Custom Report Builder') {
      navigate('/reports/esg-summary');
    } else if (tab === 'Settings' || tab === 'Departments' || tab === 'Categories' || tab === 'ESG Configuration' || tab === 'Notification Settings') {
      navigate('/settings/departments');
    }
  };

  return (
    <div className="flex h-screen bg-[#0B0F14] text-[#E2E8F0] font-sans overflow-hidden">
      {/* LEFT SIDEBAR - Desktop (fixed) & Mobile sliding drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-[#11161D] border-r border-[#1F2937] flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#1F2937] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-wide leading-tight">EcoSphere</h1>
              <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">ESG Management</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Scrollable Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
          {/* Active Dashboard Link */}
          <div>
            <button 
              onClick={() => handleTabClick('Dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'Dashboard' 
                  ? 'bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 text-cyan-400 border border-cyan-500/20 shadow-md shadow-cyan-950/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* Grouped Modules */}
          {sidebarGroups.map((group) => {
            const isGovernance = group.title === 'Governance';
            return (
              <div key={group.title} className="space-y-1.5">
                {/* Group Title Header */}
                <div className="flex items-center space-x-2 px-3 py-1 text-xs font-semibold text-gray-400 tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: group.color }}></span>
                  {group.icon}
                  <span>{group.title}</span>
                </div>
                
                {/* Indented Sub-Items */}
                <ul className="pl-7 space-y-1 border-l border-gray-800/60 ml-5">
                  {group.items.map((item) => {
                    const isSubItemActive = item === activeTab || (isGovernance && item === 'Audits' && activeTab === 'Audits');
                    return (
                      <li key={item}>
                        <button
                          onClick={() => handleTabClick(item)}
                          className={`w-full text-left py-1.5 px-2 rounded text-[12px] font-medium transition-all hover:bg-gray-800/30 ${
                            isSubItemActive 
                              ? 'text-purple-400 font-semibold' 
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          {item}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#1F2937] bg-gray-900/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-900 flex items-center justify-center text-xs font-bold text-purple-400">
              DP
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Deep Pathak</p>
              <p className="text-[10px] text-gray-500 font-semibold">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile menu */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#0B0F14]">
        
        {/* TOP BAR */}
        <header className="h-14 border-b border-[#1F2937] bg-[#11161D]/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {/* Hamburger Button for mobile */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* macOS-style traffic lights + title */}
            <div className="hidden sm:flex items-center space-x-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></span>
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></span>
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></span>
            </div>
            <span className="text-sm font-semibold text-gray-300 tracking-wide">
              EcoSphere: Governance
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A855F7]/10 text-purple-400 border border-[#A855F7]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse mr-1.5"></span>
              Live Feed
            </span>
          </div>
        </header>

        {/* TABS BAR (Governance is active) */}
        <div className="bg-[#11161D]/30 border-b border-[#1F2937] px-6">
          <div className="flex space-x-8 overflow-x-auto scrollbar-none py-3">
            {['Dashboard', 'Environmental', 'Social', 'Governance', 'Gamification', 'Reports', 'Settings'].map((tab) => {
              const isActive = tab === 'Governance';
              return (
                <button
                  key={tab}
                  onClick={() => console.log(`Main Tab clicked: ${tab}`)}
                  className={`text-xs font-semibold uppercase tracking-wider whitespace-nowrap pb-1.5 border-b-2 transition-all duration-200 ${
                    isActive 
                      ? 'border-[#A855F7] text-[#A855F7]' 
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-800'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* SUB-NAV ROW (Audits is active) */}
        <div className="bg-[#11161D]/10 border-b border-[#1F2937]/60 px-6 py-4">
          <div className="flex flex-wrap gap-3">
            {['Policies', 'Policy Acknowledgements', 'Audits', 'Compliance Issues'].map((subSection) => {
              const isActive = subSection === 'Audits';
              return (
                <button
                  key={subSection}
                  onClick={() => console.log(`Sub-nav clicked: ${subSection}`)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#A855F7] text-white shadow-md shadow-purple-500/10 font-bold' 
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
          
          {/* SECTION 1: AUDITS */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Audits Log</h2>
                <p className="text-xs text-gray-400 mt-1">Review internal and vendor compliance audits conducted by certified auditors.</p>
              </div>
              
              {/* Action row */}
              <div className="flex items-center space-x-2.5">
                <button 
                  onClick={() => console.log('New Audit clicked')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>New Audit</span>
                </button>
                
                <button 
                  onClick={() => console.log('Export Audits clicked')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800/40 text-gray-300 font-semibold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Audits Table */}
            <div className="bg-[#11161D] border border-gray-800/85 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#171D26] border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Title</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Auditor</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Findings</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                    {auditsData.map((audit) => {
                      let badgeStyle = "";
                      if (audit.status === "Completed") {
                        badgeStyle = "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20";
                      } else if (audit.status === "Under Review") {
                        badgeStyle = "bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/20";
                      }

                      return (
                        <tr 
                          key={audit.id} 
                          className="hover:bg-gray-800/15 transition-colors duration-150 group"
                        >
                          {/* Title */}
                          <td className="py-4 px-6 font-semibold text-white group-hover:text-purple-400 transition-colors">
                            {audit.title}
                          </td>
                          {/* Department */}
                          <td className="py-4 px-6 text-gray-400 font-medium">
                            {audit.department}
                          </td>
                          {/* Auditor */}
                          <td className="py-4 px-6 text-gray-300">
                            {audit.auditor}
                          </td>
                          {/* Date */}
                          <td className="py-4 px-6 text-gray-400 font-mono">
                            {audit.date}
                          </td>
                          {/* Findings */}
                          <td className="py-4 px-6 text-gray-300 font-medium">
                            {audit.findings}
                          </td>
                          {/* Status */}
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                              {audit.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION 2: COMPLIANCE ISSUES */}
          <section className="space-y-4">
            
            {/* Header / Label */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>Compliance Issues raised from Audits — severity-tagged, resolution tracked</span>
            </div>

            {/* Compliance Issues Table */}
            <div className="bg-[#11161D] border border-gray-800/85 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-[#171D26] border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Issue</th>
                      <th className="py-4 px-6">Severity</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                    {complianceIssuesData.map((item) => {
                      // Severity badge logic: Solid Fills
                      let severityBadge = "";
                      if (item.severity === "High") {
                        severityBadge = "bg-[#EF4444] text-white font-extrabold shadow-sm shadow-red-950/20";
                      } else if (item.severity === "Medium") {
                        severityBadge = "bg-[#F59E0B] text-black font-extrabold shadow-sm shadow-amber-950/20";
                      }

                      // Status badge logic: Outlines Only
                      let statusBadge = "";
                      if (item.status === "Open") {
                        statusBadge = "border border-[#EF4444] text-[#EF4444] bg-transparent font-bold";
                      } else if (item.status === "Resolved") {
                        statusBadge = "border border-[#22C55E] text-[#22C55E] bg-transparent font-bold";
                      }

                      return (
                        <tr 
                          key={item.id} 
                          className="hover:bg-gray-800/15 transition-colors duration-150 group"
                        >
                          {/* Issue */}
                          <td className="py-4 px-6 font-semibold text-white group-hover:text-purple-400 transition-colors">
                            {item.issue}
                          </td>
                          {/* Severity */}
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${severityBadge}`}>
                              {item.severity}
                            </span>
                          </td>
                          {/* Department */}
                          <td className="py-4 px-6 text-gray-400 font-medium">
                            {item.department}
                          </td>
                          {/* Status */}
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${statusBadge}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Muted Caption below Table */}
            <div className="flex items-center space-x-1.5 pl-1 text-[11px] text-gray-500 font-medium italic">
              <AlertTriangle className="w-3.5 h-3.5 text-gray-500 mr-1 not-italic" />
              <span>Compliance issues track Owner + Due Date internally; issues open past due date are auto-flagged and trigger notifications.</span>
            </div>

          </section>

        </main>
      </div>
    </div>
  );
}
