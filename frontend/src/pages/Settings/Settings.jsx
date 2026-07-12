import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Settings2, 
  Menu, 
  X, 
  Compass, 
  Activity, 
  Globe, 
  Users, 
  Shield, 
  Award, 
  FileSpreadsheet, 
  Settings as SettingsIcon 
} from 'lucide-react';

export default function Settings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Departments');
  const navigate = useNavigate();

  // Stateful toggles
  const [toggles, setToggles] = useState({
    autoEmission: false,
    requireEvidence: false,
    autoAwardBadges: false,
    emailAlerts: false
  });

  const toggleHandler = (key) => {
    setToggles(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
      icon: <SettingsIcon className="w-4 h-4 text-gray-400" />,
      items: ['Departments', 'Categories', 'ESG Configuration', 'Notification Settings']
    }
  ];

  // Departments Mock Data
  const departments = [
    { name: "Manufacturing", code: "MFG", head: "S. Nair", parent: "—", employees: "134", status: "Active" },
    { name: "Logistics", code: "LOG", head: "R. Iyer", parent: "Manufacturing", employees: "58", status: "Active" },
    { name: "Corporate", code: "COR", head: "A. Mehta", parent: "—", employees: "41", status: "Active" }
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
    } else if (tab === 'Governance' || tab === 'Audits') {
      navigate('/governance/audits');
    } else if (tab === 'Gamification' || tab === 'Challenges') {
      navigate('/gamification/challenges');
    } else if (tab === 'Reports' || tab === 'ESG Summary') {
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
            const isSettings = group.title === 'Settings';
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
                    const isSubItemActive = item === activeTab || (isSettings && item === 'Departments' && activeTab === 'Departments');
                    return (
                      <li key={item}>
                        <button
                          onClick={() => handleTabClick(item)}
                          className={`w-full text-left py-1.5 px-2 rounded text-[12px] font-medium transition-all hover:bg-gray-800/30 ${
                            isSubItemActive 
                              ? 'text-white font-semibold' 
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
            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
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
              EcoSphere: Settings
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
              Connected
            </span>
          </div>
        </header>

        {/* TABS BAR (Settings is active) */}
        <div className="bg-[#11161D]/30 border-b border-[#1F2937] px-6">
          <div className="flex space-x-8 overflow-x-auto scrollbar-none py-3">
            {['Dashboard', 'Environmental', 'Social', 'Governance', 'Gamification', 'Reports', 'Settings'].map((tab) => {
              const isActive = tab === 'Settings';
              return (
                <button
                  key={tab}
                  onClick={() => console.log(`Main Tab clicked: ${tab}`)}
                  className={`text-xs font-semibold uppercase tracking-wider whitespace-nowrap pb-1.5 border-b-2 transition-all duration-200 ${
                    isActive 
                      ? 'border-white text-white' 
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-800'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* SUB-NAV ROW (Departments is active) */}
        <div className="bg-[#11161D]/10 border-b border-[#1F2937]/60 px-6 py-4">
          <div className="flex flex-wrap gap-3">
            {['Departments', 'Categories', 'ESG Configuration', 'Notification Settings'].map((subSection) => {
              const isActive = subSection === 'Departments';
              return (
                <button
                  key={subSection}
                  onClick={() => console.log(`Sub-nav clicked: ${subSection}`)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive 
                      ? 'bg-white text-black font-bold shadow-md shadow-white/5' 
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
          
          {/* SECTION 1: DEPARTMENTS */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Organization Departments</h2>
                <p className="text-xs text-gray-400 mt-1 font-medium">Manage corporate hierarchy and internal departments for ESG tracking.</p>
              </div>

              {/* Action row */}
              <div className="flex items-center space-x-2.5">
                <button 
                  onClick={() => console.log('New Department clicked')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-gray-100 text-black font-bold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>New Department</span>
                </button>
                
                <button 
                  onClick={() => console.log('Edit clicked')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-[#F59E0B]/40 hover:border-[#F59E0B] text-[#F59E0B] font-semibold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button 
                  onClick={() => console.log('Delete clicked')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-[#EF4444]/40 hover:border-[#EF4444] text-[#EF4444] font-semibold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Departments Table */}
            <div className="bg-[#11161D] border border-gray-800/85 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#171D26] border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Code</th>
                      <th className="py-4 px-6">Head</th>
                      <th className="py-4 px-6">Parent Department</th>
                      <th className="py-4 px-6">Employees</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                    {departments.map((dept) => (
                      <tr 
                        key={dept.name} 
                        className="hover:bg-gray-800/15 transition-colors duration-150 group"
                      >
                        {/* Name */}
                        <td className="py-4 px-6 font-semibold text-white group-hover:text-gray-200 transition-colors">
                          {dept.name}
                        </td>
                        {/* Code */}
                        <td className="py-4 px-6 text-gray-400 font-mono">
                          {dept.code}
                        </td>
                        {/* Head */}
                        <td className="py-4 px-6 text-gray-300">
                          {dept.head}
                        </td>
                        {/* Parent Department */}
                        <td className={`py-4 px-6 ${dept.parent === '—' ? 'text-gray-600' : 'text-gray-400'}`}>
                          {dept.parent}
                        </td>
                        {/* Employees */}
                        <td className="py-4 px-6 font-mono font-semibold text-white">
                          {dept.employees}
                        </td>
                        {/* Status */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                            {dept.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION 2: ESG CONFIGURATION & NOTIFICATIONS */}
          <section className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-6 space-y-6">
            
            {/* Header */}
            <div className="flex items-center space-x-2.5">
              <Settings2 className="w-5 h-5 text-gray-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">ESG Configuration & Notifications</h3>
            </div>

            {/* Toggle Switch List */}
            <div className="divide-y divide-gray-800/60">
              
              {/* Row 1 */}
              <div className="flex items-center justify-between py-4">
                <span className="text-xs font-semibold text-gray-300">Enable auto emission calculation</span>
                <button 
                  onClick={() => toggleHandler('autoEmission')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
                    toggles.autoEmission ? 'bg-[#22C55E]' : 'bg-gray-800'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    toggles.autoEmission ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-between py-4">
                <span className="text-xs font-semibold text-gray-300">Require evidence for all CSR activities</span>
                <button 
                  onClick={() => toggleHandler('requireEvidence')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
                    toggles.requireEvidence ? 'bg-[#22C55E]' : 'bg-gray-800'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    toggles.requireEvidence ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Row 3 */}
              <div className="flex items-center justify-between py-4">
                <span className="text-xs font-semibold text-gray-300">Auto-award badges on challenge completion</span>
                <button 
                  onClick={() => toggleHandler('autoAwardBadges')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
                    toggles.autoAwardBadges ? 'bg-[#22C55E]' : 'bg-gray-800'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    toggles.autoAwardBadges ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Row 4 */}
              <div className="flex items-center justify-between py-4">
                <span className="text-xs font-semibold text-gray-300">Email alerts for new compliance issues</span>
                <button 
                  onClick={() => toggleHandler('emailAlerts')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
                    toggles.emailAlerts ? 'bg-[#22C55E]' : 'bg-gray-800'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    toggles.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

            </div>

          </section>

        </main>
      </div>
    </div>
  );
}
