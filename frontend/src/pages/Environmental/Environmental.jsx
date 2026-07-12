import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Download, 
  ChevronDown, 
  Search, 
  Eye, 
  Globe, 
  Users, 
  Shield, 
  Award, 
  FileSpreadsheet, 
  Settings, 
  Activity, 
  Menu, 
  X, 
  Compass,
  Check
} from 'lucide-react';

export default function Environmental() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Environmental Goals');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredAction, setHoveredAction] = useState(null); // format: {rowIndex, actionType}
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

  // Mock data for Environmental Goals
  const initialGoals = [
    {
      id: 1,
      name: "Reduce Fleet Emissions",
      department: "Logistics",
      targetCo2: "500 t",
      currentCo2: "390 t",
      progress: 78,
      deadline: "2026-12-31",
      status: "Active", // blue/cyan badge
    },
    {
      id: 2,
      name: "Cut Packaging Waste",
      department: "Manufacturing",
      targetCo2: "120 t",
      currentCo2: "98 t",
      progress: 82,
      deadline: "2026-09-30",
      status: "On Track", // amber/yellow badge
    },
    {
      id: 3,
      name: "Office Energy Cut",
      department: "Corporate",
      targetCo2: "80 t",
      currentCo2: "80 t",
      progress: 100,
      deadline: "2026-06-30",
      status: "Completed", // green badge
    }
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

  const filteredGoals = initialGoals.filter(goal => 
    goal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            const isEnvironmental = group.title === 'Environmental';
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
                    const isSubItemActive = item === activeTab || (isEnvironmental && item === 'Environmental Goals' && activeTab === 'Environmental Goals');
                    return (
                      <li key={item}>
                        <button
                          onClick={() => handleTabClick(item)}
                          className={`w-full text-left py-1.5 px-2 rounded text-[12px] font-medium transition-all hover:bg-gray-800/30 ${
                            isSubItemActive 
                              ? 'text-emerald-400 font-semibold' 
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
            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-xs font-bold text-emerald-400">
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
              EcoSphere: Environmental
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
              Live Feed
            </span>
          </div>
        </header>

        {/* TABS BAR (Environmental is active) */}
        <div className="bg-[#11161D]/30 border-b border-[#1F2937] px-6">
          <div className="flex space-x-8 overflow-x-auto scrollbar-none py-3">
            {['Dashboard', 'Environmental', 'Social', 'Governance', 'Gamification', 'Reports', 'Settings'].map((tab) => {
              const isActive = tab === 'Environmental';
              return (
                <button
                  key={tab}
                  onClick={() => console.log(`Main Tab clicked: ${tab}`)}
                  className={`text-xs font-semibold uppercase tracking-wider whitespace-nowrap pb-1.5 border-b-2 transition-all duration-200 ${
                    isActive 
                      ? 'border-emerald-500 text-emerald-400' 
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-800'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* SUB-NAV ROW */}
        <div className="bg-[#11161D]/10 border-b border-[#1F2937]/60 px-6 py-4">
          <div className="flex flex-wrap gap-3">
            {['Emission Factors', 'Product ESG Profiles', 'Carbon Transactions', 'Environmental Goals'].map((subSection) => {
              const isActive = subSection === 'Environmental Goals';
              return (
                <button
                  key={subSection}
                  onClick={() => console.log(`Sub-nav clicked: ${subSection}`)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#22C55E] text-black shadow-md shadow-emerald-500/10 font-bold' 
                      : 'bg-[#11161D] border border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                  }`}
                >
                  {subSection}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN MODULE CONTENT */}
        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto flex-1">
          
          {/* HEADER SECTION */}
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Environmental Goals</h2>
            <p className="text-xs text-gray-400 mt-1">Set, track, and manage departmental carbon reduction goals and progress benchmarks.</p>
          </div>

          {/* ACTION BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-[#11161D] border border-gray-800/80 rounded-2xl">
            {/* Left buttons */}
            <div className="flex flex-wrap gap-2.5">
              <button 
                onClick={() => console.log('New Goal clicked')}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#22C55E] hover:bg-[#1EAF53] text-black font-semibold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>New Goal</span>
              </button>

              <button 
                onClick={() => console.log('Edit clicked')}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800/40 text-gray-300 font-semibold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button 
                onClick={() => console.log('Delete clicked')}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-red-900/50 hover:border-red-700 hover:bg-red-950/20 text-red-400 font-semibold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button 
                onClick={() => console.log('Export clicked')}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800/40 text-gray-300 font-semibold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>

            {/* Right search input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#0B0F14] border border-gray-800 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* DATA TABLE CONTAINER */}
          <div className="bg-[#11161D] border border-gray-800/85 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#171D26] border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6 text-right">Target CO₂</th>
                    <th className="py-4 px-6 text-right">Current CO₂</th>
                    <th className="py-4 px-6 min-w-[180px]">Progress</th>
                    <th className="py-4 px-6">Deadline</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Row Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                  {filteredGoals.map((goal, index) => {
                    // Status badge logic
                    let statusStyle = "";
                    if (goal.status === "Active") {
                      statusStyle = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                    } else if (goal.status === "On Track") {
                      statusStyle = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                    } else if (goal.status === "Completed") {
                      statusStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                    }

                    // Progress bar fill logic
                    let progressFillColor = "bg-emerald-500";
                    if (goal.progress < 80) {
                      progressFillColor = "bg-blue-500";
                    } else if (goal.progress < 90) {
                      progressFillColor = "bg-amber-500";
                    }

                    return (
                      <tr 
                        key={goal.id} 
                        className="hover:bg-gray-800/15 transition-colors duration-150 group"
                      >
                        {/* Goal Name */}
                        <td className="py-4 px-6 font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {goal.name}
                        </td>
                        
                        {/* Department */}
                        <td className="py-4 px-6 text-gray-400 font-medium">
                          {goal.department}
                        </td>
                        
                        {/* Target */}
                        <td className="py-4 px-6 text-right font-mono font-medium">
                          {goal.targetCo2}
                        </td>
                        
                        {/* Current */}
                        <td className="py-4 px-6 text-right font-mono font-medium">
                          {goal.currentCo2}
                        </td>
                        
                        {/* Progress Bar Component */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${progressFillColor} rounded-full transition-all duration-500`}
                                style={{ width: `${goal.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-[11px] font-bold text-white min-w-[28px] text-right">
                              {goal.progress}%
                            </span>
                          </div>
                        </td>
                        
                        {/* Deadline */}
                        <td className="py-4 px-6 text-gray-400 font-mono">
                          {goal.deadline}
                        </td>
                        
                        {/* Status badge */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}>
                            {goal.status}
                          </span>
                        </td>
                        
                        {/* Row Actions with Custom Hover Tooltips */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {/* View Action */}
                            <div className="relative">
                              <button 
                                onMouseEnter={() => setHoveredAction({ rowIndex: index, type: 'view' })}
                                onMouseLeave={() => setHoveredAction(null)}
                                onClick={() => console.log(`View clicked for goal: ${goal.name}`)}
                                className="p-1.5 rounded bg-gray-800/40 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {hoveredAction?.rowIndex === index && hoveredAction?.type === 'view' && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-black text-[10px] font-bold text-white rounded shadow-lg pointer-events-none whitespace-nowrap z-10 border border-gray-800">
                                  View Goal
                                </div>
                              )}
                            </div>

                            {/* Edit Action */}
                            <div className="relative">
                              <button 
                                onMouseEnter={() => setHoveredAction({ rowIndex: index, type: 'edit' })}
                                onMouseLeave={() => setHoveredAction(null)}
                                onClick={() => console.log(`Edit clicked for goal: ${goal.name}`)}
                                className="p-1.5 rounded bg-gray-800/40 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              {hoveredAction?.rowIndex === index && hoveredAction?.type === 'edit' && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-black text-[10px] font-bold text-white rounded shadow-lg pointer-events-none whitespace-nowrap z-10 border border-gray-800">
                                  Edit Goal
                                </div>
                              )}
                            </div>

                            {/* Delete Action */}
                            <div className="relative">
                              <button 
                                onMouseEnter={() => setHoveredAction({ rowIndex: index, type: 'delete' })}
                                onMouseLeave={() => setHoveredAction(null)}
                                onClick={() => console.log(`Delete clicked for goal: ${goal.name}`)}
                                className="p-1.5 rounded bg-gray-800/40 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              {hoveredAction?.rowIndex === index && hoveredAction?.type === 'delete' && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-black text-[10px] font-bold text-white rounded shadow-lg pointer-events-none whitespace-nowrap z-10 border border-gray-800">
                                  Delete Goal
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER NOTE */}
          <div className="flex items-center space-x-1 pl-1 text-[11px] text-gray-500 font-medium">
            <span className="flex items-center space-x-1 bg-gray-800/40 px-2 py-0.5 rounded border border-gray-800/60">
              <Eye className="w-3 h-3 text-gray-500" />
              <span>View</span>
            </span>
            <span className="flex items-center space-x-1 bg-gray-800/40 px-2 py-0.5 rounded border border-gray-800/60">
              <Pencil className="w-3 h-3 text-gray-500" />
              <span>Edit</span>
            </span>
            <span className="flex items-center space-x-1 bg-gray-800/40 px-2 py-0.5 rounded border border-gray-800/60 mr-1.5">
              <Trash2 className="w-3 h-3 text-gray-500" />
              <span>Delete</span>
            </span>
            <span className="italic">
              • Carbon Transactions auto-generated from Purchase/Manufacturing/Fleet/Expenses
            </span>
          </div>

        </main>
      </div>
    </div>
  );
}
