import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  Users, 
  ShieldCheck, 
  BarChart2, 
  SlidersHorizontal, 
  ChevronDown, 
  Play, 
  FileDown, 
  Download, 
  Menu, 
  X, 
  Compass, 
  Activity, 
  Globe, 
  Shield, 
  Award, 
  FileSpreadsheet, 
  Settings 
} from 'lucide-react';

export default function Reports() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ESG Summary');
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

  // Report Generator Cards Mock Data
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
      hero: true // Flagship
    }
  ];

  // Custom filters list
  const customFilters = [
    "Date Range",
    "Department",
    "Module",
    "Employee",
    "Challenge",
    "ESG Category"
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    console.log(`Navigation tab clicked: ${tab}`);
    if (tab === 'Dashboard') {
      navigate('/');
    } else if (tab === 'Environmental' || tab === 'Environmental Goals') {
      navigate('/environmental/environmental-goals');
    } else if (tab === 'Social' || tab === 'CSR Activities' || tab === 'Employee Participation') {
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
            const isReports = group.title === 'Reports';
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
                    const isSubItemActive = item === activeTab || (isReports && item === 'ESG Summary' && activeTab === 'ESG Summary');
                    return (
                      <li key={item}>
                        <button
                          onClick={() => handleTabClick(item)}
                          className={`w-full text-left py-1.5 px-2 rounded text-[12px] font-medium transition-all hover:bg-gray-800/30 ${
                            isSubItemActive 
                              ? 'text-cyan-400 font-semibold' 
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
            <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-900 flex items-center justify-center text-xs font-bold text-cyan-400">
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
              EcoSphere: Reports
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#06B6D4]/10 text-cyan-400 border border-[#06B6D4]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse mr-1.5"></span>
              Live Feed
            </span>
          </div>
        </header>

        {/* TABS BAR (Reports is active) */}
        <div className="bg-[#11161D]/30 border-b border-[#1F2937] px-6">
          <div className="flex space-x-8 overflow-x-auto scrollbar-none py-3">
            {['Dashboard', 'Environmental', 'Social', 'Governance', 'Gamification', 'Reports', 'Settings'].map((tab) => {
              const isActive = tab === 'Reports';
              return (
                <button
                  key={tab}
                  onClick={() => console.log(`Main Tab clicked: ${tab}`)}
                  className={`text-xs font-semibold uppercase tracking-wider whitespace-nowrap pb-1.5 border-b-2 transition-all duration-200 ${
                    isActive 
                      ? 'border-[#06B6D4] text-[#06B6D4]' 
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-800'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* SUB-NAV ROW (Two rows) */}
        <div className="bg-[#11161D]/15 border-b border-[#1F2937]/60 px-6 py-4 space-y-4">
          {/* Row 1: report-type tabs (inactive placeholders) */}
          <div className="flex flex-wrap gap-2.5">
            {['Environmental', 'Social', 'Governance'].map((reportType) => (
              <button
                key={reportType}
                onClick={() => console.log(`Report type placeholder: ${reportType}`)}
                className="px-3.5 py-1.5 bg-gray-900/30 border border-gray-800 text-gray-500 rounded-lg text-xs font-semibold tracking-wide cursor-not-allowed hover:text-gray-400 transition-colors"
              >
                {reportType}
              </button>
            ))}
          </div>

          {/* Row 2: report-view tabs (ESG Summary active) */}
          <div className="flex flex-wrap gap-3 border-t border-gray-800/40 pt-3">
            {['ESG Summary', 'Custom Builder'].map((subSection) => {
              const isActive = subSection === 'ESG Summary';
              return (
                <button
                  key={subSection}
                  onClick={() => console.log(`Sub-nav clicked: ${subSection}`)}
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
          
          {/* SECTION 1: REPORT GENERATOR CARDS */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">ESG Reports Center</h2>
              <p className="text-xs text-gray-400 mt-1 font-medium">Export standard modular summaries or custom-build compliance records.</p>
            </div>

            {/* Grid of Report Cards */}
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
                      {/* Icon & Title */}
                      <div className="flex items-center space-x-3.5">
                        <div className="p-2.5 bg-gray-800/40 rounded-xl group-hover:scale-105 transition-transform duration-300">
                          {card.icon}
                        </div>
                        <h3 className="font-bold text-white text-sm tracking-wide">{card.title}</h3>
                      </div>

                      {/* Description */}
                      <p className="text-[11.5px] text-gray-400 font-semibold leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    {/* Bottom Action Button */}
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

          {/* SECTION 2: CUSTOM REPORT BUILDER FILTER PANEL */}
          <section className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-6 space-y-6">
            
            {/* Header */}
            <div className="flex items-center space-x-2.5">
              <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Custom Report Builder: Filters</h3>
            </div>

            {/* Dropdown Inputs Grid */}
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

            {/* Bottom Actions Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-800/40">
              
              {/* Play / Run Button */}
              <button 
                onClick={() => console.log('Run Report clicked')}
                className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-black font-extrabold text-xs rounded-lg shadow-lg shadow-cyan-950/20 transition-all duration-150 active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-black stroke-[3]" />
                <span>Run Report</span>
              </button>

              {/* Exports */}
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

        </main>
      </div>
    </div>
  );
}
