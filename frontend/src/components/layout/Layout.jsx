import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Globe, 
  Users, 
  Shield, 
  Award, 
  FileSpreadsheet, 
  Settings as SettingsIcon, 
  Activity, 
  Compass
} from 'lucide-react';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Get active module from pathname
  const currentPath = location.pathname;
  let activeModule = 'Dashboard';
  let title = 'EcoSphere: Dashboard';
  let liveFeedBg = 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
  let liveFeedDot = 'bg-cyan-400';

  if (currentPath.startsWith('/environmental')) {
    activeModule = 'Environmental';
    title = 'EcoSphere: Environmental';
    liveFeedBg = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    liveFeedDot = 'bg-emerald-400';
  } else if (currentPath.startsWith('/social')) {
    activeModule = 'Social';
    title = 'EcoSphere: Social';
    liveFeedBg = 'bg-[#3B82F6]/10 text-blue-400 border border-[#3B82F6]/20';
    liveFeedDot = 'bg-blue-400';
  } else if (currentPath.startsWith('/governance')) {
    activeModule = 'Governance';
    title = 'EcoSphere: Governance';
    liveFeedBg = 'bg-[#A855F7]/10 text-purple-400 border border-[#A855F7]/20';
    liveFeedDot = 'bg-purple-400';
  } else if (currentPath.startsWith('/gamification')) {
    activeModule = 'Gamification';
    title = 'EcoSphere: Gamification';
    liveFeedBg = 'bg-[#F97316]/10 text-orange-400 border border-[#F97316]/20';
    liveFeedDot = 'bg-orange-400';
  } else if (currentPath.startsWith('/reports')) {
    activeModule = 'Reports';
    title = 'EcoSphere: Reports';
    liveFeedBg = 'bg-[#06B6D4]/10 text-cyan-400 border border-[#06B6D4]/20';
    liveFeedDot = 'bg-cyan-400';
  } else if (currentPath.startsWith('/settings')) {
    activeModule = 'Settings';
    title = 'EcoSphere: Settings';
    liveFeedBg = 'bg-white/10 text-white border border-white/20';
    liveFeedDot = 'bg-white';
  }

  // Sidebar Group Config
  const sidebarGroups = [
    {
      title: 'Environmental',
      color: '#22C55E',
      icon: <Globe className="w-4 h-4 text-emerald-400" />,
      items: ['Emission Factors', 'Product ESG Profiles', 'Carbon Transactions', 'Environmental Goals'],
      path: '/environmental'
    },
    {
      title: 'Social',
      color: '#3B82F6',
      icon: <Users className="w-4 h-4 text-blue-400" />,
      items: ['CSR Activities', 'Employee Participation', 'Diversity Dashboard'],
      path: '/social'
    },
    {
      title: 'Governance',
      color: '#A855F7',
      icon: <Shield className="w-4 h-4 text-purple-400" />,
      items: ['Policies', 'Policy Acknowledgements', 'Audits', 'Compliance Issues'],
      path: '/governance'
    },
    {
      title: 'Gamification',
      color: '#F97316',
      icon: <Award className="w-4 h-4 text-orange-400" />,
      items: ['Challenges', 'Challenge Participation', 'Badges', 'Rewards', 'Leaderboard'],
      path: '/gamification'
    },
    {
      title: 'Reports',
      color: '#06B6D4',
      icon: <FileSpreadsheet className="w-4 h-4 text-cyan-400" />,
      items: ['Environmental Report', 'Social Report', 'Governance Report', 'ESG Summary', 'Custom Report Builder'],
      path: '/reports'
    },
    {
      title: 'Settings',
      color: '#9CA3AF',
      icon: <SettingsIcon className="w-4 h-4 text-gray-400" />,
      items: ['Departments', 'Categories', 'ESG Configuration', 'Notification Settings'],
      path: '/settings'
    }
  ];

  // Active styles for top tab bar
  const getTabColorClass = (tab) => {
    switch (tab) {
      case 'Dashboard':
        return 'border-cyan-400 text-cyan-400';
      case 'Environmental':
        return 'border-emerald-500 text-emerald-400';
      case 'Social':
        return 'border-[#3B82F6] text-[#3B82F6]';
      case 'Governance':
        return 'border-[#A855F7] text-[#A855F7]';
      case 'Gamification':
        return 'border-[#F97316] text-[#F97316]';
      case 'Reports':
        return 'border-[#06B6D4] text-[#06B6D4]';
      case 'Settings':
        return 'border-white text-white';
      default:
        return 'border-transparent text-gray-400';
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
              <Compass className="w-5 h-5 text-white animate-spin-slow" />
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
            <NavLink 
              to="/"
              className={({ isActive }) => `w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 text-cyan-400 border border-cyan-500/20 shadow-md shadow-cyan-950/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* Grouped Modules */}
          {sidebarGroups.map((group) => {
            const isGroupActive = currentPath.startsWith(group.path);
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
                    const activeSubTab = location.state?.activeSubTab;
                    const isSubItemActive = isGroupActive && activeSubTab === item;
                    
                    return (
                      <li key={item}>
                        <Link
                          to={group.path}
                          state={{ activeSubTab: item }}
                          className={`w-full block text-left py-1.5 px-2 rounded text-[12px] font-medium transition-all hover:bg-gray-800/30 ${
                            isSubItemActive 
                              ? 'text-cyan-400 font-semibold' 
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          {item}
                        </Link>
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
            <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-xs font-bold text-cyan-400">
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
              {title}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${liveFeedBg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${liveFeedDot} animate-pulse mr-1.5`}></span>
              Live Feed
            </span>
          </div>
        </header>

        {/* TABS BAR */}
        <div className="bg-[#11161D]/30 border-b border-[#1F2937] px-6">
          <div className="flex space-x-8 overflow-x-auto scrollbar-none py-3">
            {['Dashboard', 'Environmental', 'Social', 'Governance', 'Gamification', 'Reports', 'Settings'].map((tab) => {
              const toPath = tab === 'Dashboard' ? '/' : `/${tab.toLowerCase()}`;
              return (
                <NavLink
                  key={tab}
                  to={toPath}
                  className={({ isActive }) => `text-xs font-semibold uppercase tracking-wider whitespace-nowrap pb-1.5 border-b-2 transition-all duration-200 ${
                    isActive 
                      ? getTabColorClass(tab) 
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-800'
                  }`}
                >
                  {tab}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* OUTLET */}
        <Outlet />
      </div>
    </div>
  );
}
