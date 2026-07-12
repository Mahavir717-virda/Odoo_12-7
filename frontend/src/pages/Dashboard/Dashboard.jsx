import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  ClipboardCheck, 
  Plus, 
  Zap, 
  BarChart2, 
  TrendingUp, 
  Menu, 
  X, 
  Globe, 
  Users, 
  Shield, 
  Award, 
  Settings, 
  FileSpreadsheet, 
  Activity, 
  ChevronRight, 
  ArrowUpRight, 
  Compass
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell 
} from 'recharts';

// Mock Data
const emissionsData = [
  { name: 'Jan', Emissions: 2100 },
  { name: 'Feb', Emissions: 1950 },
  { name: 'Mar', Emissions: 2300 },
  { name: 'Apr', Emissions: 2200 },
  { name: 'May', Emissions: 2550 },
  { name: 'Jun', Emissions: 2800 },
  { name: 'Jul', Emissions: 2650 },
  { name: 'Aug', Emissions: 2900 },
  { name: 'Sep', Emissions: 2850 },
  { name: 'Oct', Emissions: 3100 },
  { name: 'Nov', Emissions: 3050 },
  { name: 'Dec', Emissions: 3400 },
];

const departmentData = [
  { name: 'Sale', score: 78, color: '#3B82F6' },
  { name: 'Mfg', score: 65, color: '#10B981' },
  { name: 'Logi', score: 72, color: '#F59E0B' },
  { name: 'Corp', score: 92, color: '#A855F7' },
  { name: 'R&D', score: 85, color: '#06B6D4' },
];

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
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

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    console.log(`Tab clicked: ${tab}`);
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
          {sidebarGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              {/* Group Title Header */}
              <div className="flex items-center space-x-2 px-3 py-1 text-xs font-semibold text-gray-400 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: group.color }}></span>
                {group.icon}
                <span>{group.title}</span>
              </div>
              
              {/* Indented Sub-Items */}
              <ul className="pl-7 space-y-1 border-l border-gray-800/60 ml-5">
                {group.items.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => handleTabClick(item)}
                      className={`w-full text-left py-1.5 px-2 rounded text-[12px] font-medium transition-all hover:bg-gray-800/30 ${
                        activeTab === item 
                          ? 'text-cyan-400 font-semibold' 
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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

            {/* macOS macOS-style traffic lights + title */}
            <div className="hidden sm:flex items-center space-x-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></span>
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></span>
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></span>
            </div>
            <span className="text-sm font-semibold text-gray-300 tracking-wide">
              EcoSphere: Dashboard
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
              Live Feed
            </span>
          </div>
        </header>

        {/* TABS BAR */}
        <div className="bg-[#11161D]/30 border-b border-[#1F2937] px-6">
          <div className="flex space-x-8 overflow-x-auto scrollbar-none py-3">
            {['Dashboard', 'Environmental', 'Social', 'Governance', 'Gamification', 'Reports', 'Settings'].map((tab) => {
              const isActive = tab === 'Dashboard';
              return (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`text-xs font-semibold uppercase tracking-wider whitespace-nowrap pb-1.5 border-b-2 transition-all duration-200 ${
                    isActive 
                      ? 'border-cyan-400 text-cyan-400' 
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-800'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT */}
        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">

          {/* PAGE HEADER INTRO */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-900">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Executive Overview</h2>
              <p className="text-gray-400 text-sm mt-1">Real-time performance metrics, compliance logs, and cross-department ESG indicators.</p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-400 bg-[#11161D] border border-gray-800 rounded-lg p-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Updated: Just Now</span>
            </div>
          </div>

          {/* KPI ROW */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Environmental Score */}
              <div className="bg-[#11161D] border-l-4 border-l-emerald-500 border border-gray-800/80 rounded-r-2xl rounded-l-md p-6 hover:scale-[1.01] transition-transform duration-300 hover:shadow-lg hover:shadow-emerald-950/10 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Environmental Score</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-white tracking-tight">82 <span className="text-base font-normal text-gray-500">/ 100</span></span>
                  <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +4.2%
                  </span>
                </div>
                <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>

              {/* Card 2: Social Score */}
              <div className="bg-[#11161D] border-l-4 border-l-blue-500 border border-gray-800/80 rounded-r-2xl rounded-l-md p-6 hover:scale-[1.01] transition-transform duration-300 hover:shadow-lg hover:shadow-blue-950/10 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Social Score</span>
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-white tracking-tight">74 <span className="text-base font-normal text-gray-500">/ 100</span></span>
                  <span className="flex items-center text-xs font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.1%
                  </span>
                </div>
                <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '74%' }}></div>
                </div>
              </div>

              {/* Card 3: Governance Score */}
              <div className="bg-[#11161D] border-l-4 border-l-purple-500 border border-gray-800/80 rounded-r-2xl rounded-l-md p-6 hover:scale-[1.01] transition-transform duration-300 hover:shadow-lg hover:shadow-purple-950/10 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Governance Score</span>
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-white tracking-tight">88 <span className="text-base font-normal text-gray-500">/ 100</span></span>
                  <span className="flex items-center text-xs font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +1.5%
                  </span>
                </div>
                <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>

              {/* Card 4: Overall ESG Score (Teal accent, subtle glow / thicker border) */}
              <div className="relative bg-[#11161D] border-2 border-cyan-500 rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] cursor-pointer group">
                <div className="absolute top-0 right-0 -mt-2.5 -mr-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-cyan-500 text-black shadow-md">
                  Primary
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 text-xs font-extrabold uppercase tracking-wider">Overall ESG Score</span>
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/30 transition-colors">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white tracking-tight">81 <span className="text-base font-normal text-gray-500">/ 100</span></span>
                  <span className="flex items-center text-xs font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +3.2%
                  </span>
                </div>
                <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full" style={{ width: '81%' }}></div>
                </div>
              </div>

            </div>
            
            {/* KPI Feature Caption (Shown once below the row) */}
            <p className="text-[11px] text-gray-500 mt-3 pl-1 font-medium tracking-wide">
              Features: live KPI tiles • trend arrows • click-through to module
            </p>
          </div>

          {/* TWO-COLUMN CHART ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Card: Emissions Trend LineChart */}
            <div className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
              <div className="flex items-center justify-between pb-4 border-b border-gray-800/60">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <h3 className="text-sm font-semibold text-white tracking-wide">Emissions Trend (12 mo)</h3>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono font-bold">
                  tCO2e Monthly
                </span>
              </div>
              
              <div className="flex-1 mt-4">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={emissionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#6B7280" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#11161D] border border-gray-800 p-3 rounded-lg shadow-xl">
                              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
                              <p className="text-white text-sm font-bold mt-1">
                                Emissions: <span className="text-emerald-400">{payload[0].value} tCO2e</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Emissions" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      dot={{ r: 4, stroke: '#0B0F14', strokeWidth: 2, fill: '#10B981' }}
                      activeDot={{ r: 6, stroke: '#11161D', strokeWidth: 2, fill: '#10B981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Card: Department ESG Ranking BarChart */}
            <div className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
              <div className="flex items-center justify-between pb-4 border-b border-gray-800/60">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <h3 className="text-sm font-semibold text-white tracking-wide">Department ESG Ranking</h3>
                </div>
                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-mono font-bold">
                  Score Out of 100
                </span>
              </div>
              
              <div className="flex-1 mt-4">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#6B7280" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      domain={[0, 100]}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#11161D] border border-gray-800 p-3 rounded-lg shadow-xl">
                              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
                              <p className="text-white text-sm font-bold mt-1">
                                Score: <span className="text-blue-400">{payload[0].value} / 100</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="score" 
                      radius={[6, 6, 0, 0]}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* TWO-COLUMN BOTTOM ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Card: Recent Activity */}
            <div className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-white tracking-wide pb-4 border-b border-gray-800/60 flex items-center space-x-2">
                  <span>Recent Activity</span>
                </h3>
                
                <div className="mt-4 divide-y divide-gray-800/60">
                  
                  {/* Item 1 */}
                  <div className="py-3.5 flex items-start space-x-3.5 hover:bg-gray-800/20 px-2 rounded-lg transition-colors duration-150">
                    <div className="mt-0.5 p-1 rounded-full bg-emerald-500/10 text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200">Priya completed 'Zero Waste Week'</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Environmental Gamification • 2 hours ago</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 mt-1" />
                  </div>

                  {/* Item 2 */}
                  <div className="py-3.5 flex items-start space-x-3.5 hover:bg-gray-800/20 px-2 rounded-lg transition-colors duration-150">
                    <div className="mt-0.5 p-1 rounded-full bg-amber-500/10 text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200">New compliance issue in Logistics</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Governance Compliance • 5 hours ago</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 mt-1" />
                  </div>

                  {/* Item 3 */}
                  <div className="py-3.5 flex items-start space-x-3.5 hover:bg-gray-800/20 px-2 rounded-lg transition-colors duration-150">
                    <div className="mt-0.5 p-1 rounded-full bg-blue-500/10 text-blue-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200">42 new Carbon Transactions logged</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Environmental Accounting • 1 day ago</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 mt-1" />
                  </div>

                  {/* Item 4 */}
                  <div className="py-3.5 flex items-start space-x-3.5 hover:bg-gray-800/20 px-2 rounded-lg transition-colors duration-150">
                    <div className="mt-0.5 p-1 rounded-full bg-purple-500/10 text-purple-400">
                      <ClipboardCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200">R&D acknowledged Anti-Corruption Policy</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Governance Policy • 2 days ago</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 mt-1" />
                  </div>

                </div>
              </div>
            </div>

            {/* Right Card: Quick Actions */}
            <div className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-white tracking-wide pb-4 border-b border-gray-800/60">
                  Quick Actions
                </h3>
                
                <div className="mt-6 space-y-4">
                  {/* Button 1: Solid Green */}
                  <button 
                    onClick={() => console.log('Log Carbon Data clicked')}
                    className="w-full flex items-center justify-between px-5 py-4 bg-[#22C55E] hover:bg-[#1EAF53] text-black font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-950/20 group active:scale-[0.99]"
                  >
                    <div className="flex items-center space-x-3">
                      <Plus className="w-5 h-5 text-black stroke-[3]" />
                      <span>Log Carbon Data</span>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-black/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>

                  {/* Button 2: Solid Orange */}
                  <button 
                    onClick={() => console.log('Start Challenge clicked')}
                    className="w-full flex items-center justify-between px-5 py-4 bg-[#F97316] hover:bg-[#E26610] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange-950/20 group active:scale-[0.99]"
                  >
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 fill-current" />
                      <span>Start Challenge</span>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>

                  {/* Button 3: Outlined/Gray */}
                  <button 
                    onClick={() => console.log('View Reports clicked')}
                    className="w-full flex items-center justify-between px-5 py-4 bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800/40 text-gray-200 font-semibold rounded-xl transition-all duration-200 group active:scale-[0.99]"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span>View Reports</span>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
              
              {/* Decorative extra widget inside Quick Actions for polished look */}
              <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-emerald-950/20 border border-cyan-800/20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
                  <div>
                    <p className="text-xs font-semibold text-cyan-300">Sustainability Challenge Active</p>
                    <p className="text-[10px] text-gray-400 font-medium">Join 124 other participants this week</p>
                  </div>
                </div>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 font-bold px-2 py-0.5 rounded uppercase">
                  Active
                </span>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
