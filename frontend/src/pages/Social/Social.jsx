import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  TreePine, 
  Droplet, 
  Waves, 
  GraduationCap, 
  Paperclip, 
  FileText, 
  Clipboard, 
  Check, 
  X, 
  Menu, 
  Compass, 
  Activity, 
  Globe, 
  Users, 
  Shield, 
  Award, 
  FileSpreadsheet, 
  Settings,
  Lock,
  BookOpen
} from 'lucide-react';

export default function Social() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('CSR Activities');
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

  // Activities Data
  const csrActivities = [
    {
      id: 1,
      title: "Tree Plantation",
      joined: 24,
      evidenceRequired: true,
      icon: <TreePine className="w-6 h-6 text-emerald-400" />
    },
    {
      id: 2,
      title: "Blood Donation",
      joined: 18,
      evidenceRequired: true,
      icon: <Droplet className="w-6 h-6 text-red-400" />
    },
    {
      id: 3,
      title: "Beach Cleanup",
      joined: 31,
      evidenceRequired: false,
      icon: <Waves className="w-6 h-6 text-cyan-400" />
    },
    {
      id: 4,
      title: "ESG Workshop",
      joined: 52,
      evidenceRequired: false,
      icon: <GraduationCap className="w-6 h-6 text-blue-400" />
    }
  ];

  // Approval Queue Data
  const approvalQueue = [
    {
      id: 1,
      employee: "Aditi Rao",
      activity: "Tree Plantation",
      proof: "photo.jpg",
      isImage: true,
      points: 50,
      status: "Pending" // amber/yellow badge
    },
    {
      id: 2,
      employee: "Karan Shah",
      activity: "ESG Workshop",
      proof: "cert.pdf",
      isImage: false,
      points: 30,
      status: "Approved" // green badge
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
            const isSocial = group.title === 'Social';
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
                    const isSubItemActive = item === activeTab || (isSocial && item === 'CSR Activities' && activeTab === 'CSR Activities');
                    return (
                      <li key={item}>
                        <button
                          onClick={() => handleTabClick(item)}
                          className={`w-full text-left py-1.5 px-2 rounded text-[12px] font-medium transition-all hover:bg-gray-800/30 ${
                            isSubItemActive 
                              ? 'text-blue-400 font-semibold' 
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
            <div className="w-8 h-8 rounded-full bg-blue-950 border border-blue-900 flex items-center justify-center text-xs font-bold text-blue-400">
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
              EcoSphere: Social
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#3B82F6]/10 text-blue-400 border border-[#3B82F6]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse mr-1.5"></span>
              Live Feed
            </span>
          </div>
        </header>

        {/* TABS BAR (Social is active) */}
        <div className="bg-[#11161D]/30 border-b border-[#1F2937] px-6">
          <div className="flex space-x-8 overflow-x-auto scrollbar-none py-3">
            {['Dashboard', 'Environmental', 'Social', 'Governance', 'Gamification', 'Reports', 'Settings'].map((tab) => {
              const isActive = tab === 'Social';
              return (
                <button
                  key={tab}
                  onClick={() => console.log(`Main Tab clicked: ${tab}`)}
                  className={`text-xs font-semibold uppercase tracking-wider whitespace-nowrap pb-1.5 border-b-2 transition-all duration-200 ${
                    isActive 
                      ? 'border-[#3B82F6] text-[#3B82F6]' 
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-800'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* SUB-NAV ROW (CSR Activities is active) */}
        <div className="bg-[#11161D]/10 border-b border-[#1F2937]/60 px-6 py-4">
          <div className="flex flex-wrap gap-3">
            {['CSR Activities', 'Employee Participation', 'Diversity Dashboard'].map((subSection) => {
              const isActive = subSection === 'CSR Activities';
              return (
                <button
                  key={subSection}
                  onClick={() => console.log(`Sub-nav clicked: ${subSection}`)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#3B82F6] text-black shadow-md shadow-blue-500/10 font-bold' 
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
          
          {/* SECTION 1: CSR ACTIVITIES */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">CSR Activities</h2>
                <p className="text-xs text-gray-400 mt-1">Review corporate social responsibility activities and track team involvement.</p>
              </div>
              <div>
                <button 
                  onClick={() => console.log('New Activity clicked')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-black font-bold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>New Activity</span>
                </button>
              </div>
            </div>

            {/* CSR Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {csrActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-5 hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-950/5 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[190px]"
                >
                  <div className="space-y-3.5">
                    {/* Icon and Title */}
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-800/40">
                        {activity.icon}
                      </div>
                      <h3 className="font-bold text-white text-sm tracking-wide">{activity.title}</h3>
                    </div>

                    {/* Joined text */}
                    <p className="text-[12px] text-gray-400 font-medium">
                      {activity.joined} joined
                    </p>
                  </div>

                  {/* Bottom section: Evidence Tag and Button */}
                  <div className="space-y-3.5 mt-4">
                    {/* Tag */}
                    <div className="flex items-center space-x-1.5">
                      {activity.evidenceRequired ? (
                        <span className="flex items-center text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <Lock className="w-3 h-3 mr-1" />
                          Evidence Required
                        </span>
                      ) : (
                        <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Open
                        </span>
                      )}
                    </div>

                    {/* Join Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Join activity clicked: ${activity.title}`);
                      }}
                      className="w-full py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-black text-xs font-bold rounded-lg transition-colors duration-150"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 2: EMPLOYEE PARTICIPATION (Approval Queue) */}
          <section className="space-y-4">
            
            {/* Header / Label */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">
              <Clipboard className="w-4 h-4 text-blue-400" />
              <span>Employee Participation: approval queue</span>
            </div>

            {/* Table Container */}
            <div className="bg-[#11161D] border border-gray-800/85 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#171D26] border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Employee</th>
                      <th className="py-4 px-6">Activity/Challenge</th>
                      <th className="py-4 px-6">Proof</th>
                      <th className="py-4 px-6 text-right">Points</th>
                      <th className="py-4 px-6">Approval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                    {approvalQueue.map((item) => {
                      let badgeStyle = "";
                      if (item.status === "Pending") {
                        badgeStyle = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
                      } else if (item.status === "Approved") {
                        badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                      }

                      return (
                        <tr 
                          key={item.id} 
                          className="hover:bg-gray-800/15 transition-colors duration-150 group"
                        >
                          {/* Employee Name */}
                          <td className="py-4 px-6 font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {item.employee}
                          </td>

                          {/* Activity */}
                          <td className="py-4 px-6 text-gray-400 font-medium">
                            {item.activity}
                          </td>

                          {/* Proof File Chip */}
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center space-x-1.5 bg-gray-800/40 border border-gray-800 hover:border-gray-700 px-2.5 py-1 rounded-md text-[11px] font-mono text-gray-300 transition-colors cursor-pointer">
                              {item.isImage ? (
                                <Paperclip className="w-3 h-3 text-gray-500" />
                              ) : (
                                <FileText className="w-3 h-3 text-gray-500" />
                              )}
                              <span>{item.proof}</span>
                            </span>
                          </td>

                          {/* Points */}
                          <td className="py-4 px-6 text-right font-mono font-bold text-white">
                            {item.points}
                          </td>

                          {/* Approval Status Badge */}
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
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

            {/* Bulk Queue Action Buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              <button 
                onClick={() => console.log('Bulk Reject clicked')}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs rounded-lg shadow-lg shadow-red-950/20 transition-all duration-150 active:scale-[0.98]"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
              
              <button 
                onClick={() => console.log('Bulk Approve clicked')}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-black font-bold text-xs rounded-lg shadow-lg shadow-blue-950/20 transition-all duration-150 active:scale-[0.98]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Approve</span>
              </button>
            </div>

          </section>

        </main>
      </div>
    </div>
  );
}
