import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trophy, 
  Recycle, 
  Leaf, 
  Bike, 
  Calendar, 
  Award, 
  Medal, 
  Star, 
  Crown, 
  Menu, 
  X, 
  Compass, 
  Activity, 
  Globe, 
  Users, 
  Shield, 
  FileSpreadsheet, 
  Settings 
} from 'lucide-react';

export default function Gamification() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Challenges');
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

  // Lifecycle filter list
  const lifecycleFilters = [
    { name: 'Draft', type: 'draft', style: 'bg-gray-800/40 text-gray-400 border border-transparent' },
    { name: 'Active', type: 'active', style: 'bg-[#22C55E] text-black font-bold border border-transparent' },
    { name: 'Under Review', type: 'review', style: 'border border-purple-500/40 text-purple-400 bg-transparent' },
    { name: 'Completed', type: 'completed', style: 'border border-blue-500/40 text-blue-400 bg-transparent' },
    { name: 'Archived', type: 'archived', style: 'border border-gray-800 text-gray-600 bg-transparent cursor-not-allowed opacity-50' }
  ];

  // Challenges Mock Data
  const challenges = [
    {
      id: 1,
      title: "Sustainability Sprint",
      xp: 200,
      difficulty: "Hard",
      deadline: "07/20",
      status: "Active",
      icon: <Trophy className="w-5 h-5 text-orange-400" />,
      enabled: true
    },
    {
      id: 2,
      title: "Recycle Challenge",
      xp: 80,
      difficulty: "Easy",
      deadline: "07/15",
      status: "Active",
      icon: <Recycle className="w-5 h-5 text-emerald-400" />,
      enabled: true
    },
    {
      id: 3,
      title: "Commute Green Week",
      xp: 120,
      difficulty: "Medium",
      deadline: "07/25",
      status: "Draft",
      icon: <Bike className="w-5 h-5 text-cyan-400" />,
      enabled: false
    }
  ];

  // Badges Mock Data
  const badges = [
    { id: 1, name: "Green Beginner", desc: "First ESG activity complete", icon: <Star className="w-6 h-6 text-orange-400" /> },
    { id: 2, name: "Carbon Saver", desc: "Reduced 100kg CO₂", icon: <Leaf className="w-6 h-6 text-orange-400" /> },
    { id: 3, name: "Sustainability Champion", desc: "Completed 5 challenges", icon: <Medal className="w-6 h-6 text-orange-400" /> },
    { id: 4, name: "Team Player", desc: "Joined team cleanup", icon: <Users className="w-6 h-6 text-orange-400" /> }
  ];

  // Leaderboard Mock Data
  const leaderboard = [
    { rank: 1, name: "Manufacturing Dept", xp: "4,820", isFirst: true },
    { rank: 2, name: "Aditi Rao", xp: "3,910", isFirst: false },
    { rank: 3, name: "Corporate Dept", xp: "3,505", isFirst: false }
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
            const isGamification = group.title === 'Gamification';
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
                    const isSubItemActive = item === activeTab || (isGamification && item === 'Challenges' && activeTab === 'Challenges');
                    return (
                      <li key={item}>
                        <button
                          onClick={() => handleTabClick(item)}
                          className={`w-full text-left py-1.5 px-2 rounded text-[12px] font-medium transition-all hover:bg-gray-800/30 ${
                            isSubItemActive 
                              ? 'text-orange-400 font-semibold' 
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
            <div className="w-8 h-8 rounded-full bg-orange-950 border border-orange-900 flex items-center justify-center text-xs font-bold text-orange-400">
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
              EcoSphere: Gamification
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F97316]/10 text-orange-400 border border-[#F97316]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse mr-1.5"></span>
              Live Feed
            </span>
          </div>
        </header>

        {/* TABS BAR (Gamification is active) */}
        <div className="bg-[#11161D]/30 border-b border-[#1F2937] px-6">
          <div className="flex space-x-8 overflow-x-auto scrollbar-none py-3">
            {['Dashboard', 'Environmental', 'Social', 'Governance', 'Gamification', 'Reports', 'Settings'].map((tab) => {
              const isActive = tab === 'Gamification';
              return (
                <button
                  key={tab}
                  onClick={() => console.log(`Main Tab clicked: ${tab}`)}
                  className={`text-xs font-semibold uppercase tracking-wider whitespace-nowrap pb-1.5 border-b-2 transition-all duration-200 ${
                    isActive 
                      ? 'border-[#F97316] text-[#F97316]' 
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-800'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* SUB-NAV ROW (Challenges is active) */}
        <div className="bg-[#11161D]/10 border-b border-[#1F2937]/60 px-6 py-4">
          <div className="flex flex-wrap gap-3">
            {['Challenges', 'Challenge Participation', 'Badges', 'Rewards', 'Leaderboard'].map((subSection) => {
              const isActive = subSection === 'Challenges';
              return (
                <button
                  key={subSection}
                  onClick={() => console.log(`Sub-nav clicked: ${subSection}`)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#F97316] text-black shadow-md shadow-orange-500/10 font-bold' 
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
          
          {/* SECTION 1: CHALLENGES */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Gamified ESG Challenges</h2>
                <p className="text-xs text-gray-400 mt-1 font-medium">Motivate teams and employees to reach environmental and social milestones.</p>
              </div>
              <div>
                <button 
                  onClick={() => console.log('New Challenge clicked')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#F97316] hover:bg-[#EA580C] text-black font-bold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>New Challenge</span>
                </button>
              </div>
            </div>

            {/* Lifecycle Filter Row */}
            <div className="flex flex-wrap gap-2 pb-2">
              {lifecycleFilters.map((filter) => (
                <button
                  key={filter.name}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${filter.style}`}
                  onClick={() => console.log(`Filter selected: ${filter.type}`)}
                >
                  {filter.name}
                </button>
              ))}
            </div>

            {/* Challenges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => {
                let badgeStyle = "";
                if (challenge.status === "Active") {
                  badgeStyle = "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20";
                } else if (challenge.status === "Draft") {
                  badgeStyle = "bg-gray-800 text-gray-400";
                }

                return (
                  <div 
                    key={challenge.id}
                    className="bg-[#11161D] border-2 border-orange-500/40 rounded-2xl p-5 hover:scale-[1.01] hover:shadow-lg hover:shadow-orange-950/5 transition-all duration-300 flex flex-col justify-between min-h-[220px]"
                  >
                    <div className="space-y-3.5">
                      {/* Icon and Title */}
                      <div className="flex items-center space-x-3.5">
                        <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                          {challenge.icon}
                        </div>
                        <h3 className="font-bold text-white text-sm tracking-wide leading-snug">{challenge.title}</h3>
                      </div>

                      {/* XP and Difficulty */}
                      <div className="space-y-1">
                        <p className="text-[12px] text-gray-400 font-semibold">
                          XP: <span className="text-orange-400 font-bold">{challenge.xp}</span> • {challenge.difficulty}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-gray-600 mr-1" />
                          <span>Deadline: {challenge.deadline}</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      {/* Status badge */}
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${badgeStyle}`}>
                          {challenge.status}
                        </span>
                      </div>

                      {/* Join Button */}
                      {challenge.enabled ? (
                        <button 
                          onClick={() => console.log(`Join challenge clicked: ${challenge.title}`)}
                          className="w-full py-2 bg-[#F97316] hover:bg-[#EA580C] text-black text-xs font-bold rounded-lg transition-colors duration-150 active:scale-[0.98]"
                        >
                          Join Challenge
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="w-full py-2 bg-gray-800 text-gray-500 text-xs font-bold rounded-lg cursor-not-allowed border border-gray-700/50"
                        >
                          Join Challenge
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* TWO COLUMN GRID: BADGE GALLERY & LEADERBOARD */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* SECTION 2: BADGE GALLERY */}
            <section className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
                  <Award className="w-4.5 h-4.5 text-orange-400" />
                  <span>Badge Gallery</span>
                </div>

                {/* Badge Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {badges.map((badge) => (
                    <div 
                      key={badge.id}
                      className="border border-orange-500/20 hover:border-orange-500/40 bg-orange-500/[0.02] hover:bg-orange-500/[0.04] p-4 rounded-xl flex items-center space-x-3.5 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg group-hover:scale-105 transition-transform duration-300">
                        {badge.icon}
                      </div>
                      <div>
                        <h4 className="text-[12px] font-extrabold text-orange-400 tracking-wide">{badge.name}</h4>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5 leading-snug">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 3: LEADERBOARD */}
            <section className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
                  <Trophy className="w-4.5 h-4.5 text-orange-400" />
                  <span>Leaderboard</span>
                </div>

                {/* Leaderboard Table */}
                <div className="overflow-hidden border border-gray-800/80 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#171D26] border-b border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Employee/Dept</th>
                        <th className="py-3 px-4 text-right">XP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50 text-gray-300">
                      {leaderboard.map((row) => (
                        <tr 
                          key={row.rank}
                          className={`transition-colors duration-150 ${
                            row.isFirst 
                              ? 'bg-amber-500/[0.04] hover:bg-amber-500/[0.08] font-bold text-amber-400' 
                              : 'hover:bg-gray-800/20'
                          }`}
                        >
                          <td className="py-3 px-4 font-mono">
                            <div className="flex items-center space-x-1.5">
                              {row.isFirst && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                              <span>{row.rank}</span>
                            </div>
                          </td>
                          <td className={`py-3 px-4 ${row.isFirst ? 'text-amber-400' : 'text-gray-200'}`}>
                            {row.name}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold">
                            {row.xp}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

          </div>

        </main>
      </div>
    </div>
  );
}
