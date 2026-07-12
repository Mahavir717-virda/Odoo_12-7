import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  Compass,
  LogOut,
  Leaf
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'US';

  // Get active module from pathname
  const currentPath = location.pathname;
  let activeModule = 'Dashboard';
  let title = 'EcoSphere: Dashboard';
  let liveFeedBg = 'bg-brand/10 text-brand border border-brand/20';
  let liveFeedDot = 'bg-brand';

  if (currentPath.startsWith('/environmental')) {
    activeModule = 'Environmental';
    title = 'EcoSphere: Environmental';
    liveFeedBg = 'bg-accent-env/10 text-accent-env border border-accent-env/20';
    liveFeedDot = 'bg-accent-env';
  } else if (currentPath.startsWith('/social')) {
    activeModule = 'Social';
    title = 'EcoSphere: Social';
    liveFeedBg = 'bg-accent-soc/10 text-accent-soc border border-accent-soc/20';
    liveFeedDot = 'bg-accent-soc';
  } else if (currentPath.startsWith('/governance')) {
    activeModule = 'Governance';
    title = 'EcoSphere: Governance';
    liveFeedBg = 'bg-accent-gov/10 text-accent-gov border border-accent-gov/20';
    liveFeedDot = 'bg-accent-gov';
  } else if (currentPath.startsWith('/gamification')) {
    activeModule = 'Gamification';
    title = 'EcoSphere: Gamification';
    liveFeedBg = 'bg-accent-gam/10 text-accent-gam border border-accent-gam/20';
    liveFeedDot = 'bg-accent-gam';
  } else if (currentPath.startsWith('/reports')) {
    activeModule = 'Reports';
    title = 'EcoSphere: Reports';
    liveFeedBg = 'bg-accent-rep/10 text-accent-rep border border-accent-rep/20';
    liveFeedDot = 'bg-accent-rep';
  } else if (currentPath.startsWith('/settings')) {
    activeModule = 'Settings';
    title = 'EcoSphere: Settings';
    liveFeedBg = 'bg-accent-set/10 text-accent-set border border-accent-set/20';
    liveFeedDot = 'bg-accent-set';
  }

  // Sidebar Group Config
  const sidebarGroups = [
    {
      title: 'Environmental',
      color: 'var(--color-accent-env)',
      icon: <Globe className="w-4 h-4 text-accent-env" />,
      items: ['Emission Factors', 'Product ESG Profiles', 'Carbon Transactions', 'Environmental Goals'],
      path: '/environmental'
    },
    {
      title: 'Social',
      color: 'var(--color-accent-soc)',
      icon: <Users className="w-4 h-4 text-accent-soc" />,
      items: ['CSR Activities', 'Employee Participation', 'Diversity Dashboard'],
      path: '/social'
    },
    {
      title: 'Governance',
      color: 'var(--color-accent-gov)',
      icon: <Shield className="w-4 h-4 text-accent-gov" />,
      items: ['Policies', 'Policy Acknowledgements', 'Audits', 'Compliance Issues'],
      path: '/governance'
    },
    {
      title: 'Gamification',
      color: 'var(--color-accent-gam)',
      icon: <Award className="w-4 h-4 text-accent-gam" />,
      items: ['Challenges', 'Challenge Participation', 'Badges', 'Rewards', 'Leaderboard'],
      path: '/gamification'
    },
    {
      title: 'Reports',
      color: 'var(--color-accent-rep)',
      icon: <FileSpreadsheet className="w-4 h-4 text-accent-rep" />,
      items: ['Environmental Report', 'Social Report', 'Governance Report', 'ESG Summary', 'Custom Report Builder'],
      path: '/reports'
    },
    {
      title: 'Settings',
      color: 'var(--color-accent-set)',
      icon: <SettingsIcon className="w-4 h-4 text-accent-set" />,
      items: ['Departments', 'Categories', 'ESG Configuration', 'Notification Settings'],
      path: '/settings'
    }
  ];

  // Active styles for top tab bar
  const getTabColorClass = (tab) => {
    switch (tab) {
      case 'Dashboard':
        return 'border-brand text-brand';
      case 'Environmental':
        return 'border-accent-env text-accent-env';
      case 'Social':
        return 'border-accent-soc text-accent-soc';
      case 'Governance':
        return 'border-accent-gov text-accent-gov';
      case 'Gamification':
        return 'border-accent-gam text-accent-gam';
      case 'Reports':
        return 'border-accent-rep text-accent-rep';
      case 'Settings':
        return 'border-accent-set text-accent-set';
      default:
        return 'border-transparent text-text-secondary';
    }
  };

  return (
    <div className="flex h-screen bg-bg-base text-text-primary font-sans overflow-hidden">
      {/* LEFT SIDEBAR - Desktop (fixed) & Mobile sliding drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-bg-card border-r border-border-sage flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border-sage flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand to-accent-env flex items-center justify-center shadow-lg shadow-brand/10">
              <Leaf className="w-5 h-5 text-bg-base" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-text-primary text-base tracking-wide leading-tight">EcoSphere</h1>
              <p className="text-[10px] text-text-secondary font-bold tracking-wider uppercase">ESG Management</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-text-secondary hover:text-text-primary transition-colors"
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
                  ? 'bg-gradient-to-r from-brand/10 to-accent-env/10 text-brand border border-brand/20 shadow-md shadow-brand/5' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-base/60'
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
              <div key={group.title} className="space-y-1.5 bg-bg-base/20 p-2.5 rounded-xl border border-border-sage/40">
                {/* Group Title Header */}
                <div className="flex items-center space-x-2 px-1 py-1 text-xs font-bold text-text-secondary tracking-wider uppercase font-display">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: group.color }}></span>
                  {group.icon}
                  <span>{group.title}</span>
                </div>
                
                {/* Indented Sub-Items */}
                <ul className="pl-4 space-y-1 border-l border-border-sage/50 ml-3.5">
                  {group.items.map((item) => {
                    const activeSubTab = location.state?.activeSubTab;
                    const isSubItemActive = isGroupActive && activeSubTab === item;
                    
                    return (
                      <li key={item}>
                        <Link
                          to={group.path}
                          state={{ activeSubTab: item }}
                          className={`w-full block text-left py-1 px-2 rounded text-[12px] font-semibold transition-all hover:bg-bg-base/40 ${
                            isSubItemActive 
                              ? 'text-brand font-bold bg-brand/5 border-l-2 border-brand pl-1.5' 
                              : 'text-text-secondary hover:text-text-primary'
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
        <div className="p-4 border-t border-border-sage bg-bg-base/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-xs font-bold text-brand">
              {initials}
            </div>
            <div>
              <p className="text-xs font-semibold text-text-primary">{user?.name}</p>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{user?.role}</p>
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
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-bg-base bg-topographic">
        
        {/* TOP BAR */}
        <header className="h-14 border-b border-border-sage bg-bg-card/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {/* Hamburger Button for mobile */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-text-secondary hover:text-text-primary focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* macOS-style traffic lights + title */}
            <div className="hidden sm:flex items-center space-x-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></span>
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></span>
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></span>
            </div>
            <span className="text-sm font-bold text-text-secondary tracking-wide font-display">
              {title}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${liveFeedBg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${liveFeedDot} animate-pulse mr-1.5`}></span>
              Live Feed
            </span>

            {/* Profile Chip */}
            <div className="flex items-center space-x-3 border-l border-border-sage pl-4">
              <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-xs font-bold text-brand">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-text-primary leading-none">{user?.name}</p>
                <span className="inline-block text-[9px] font-extrabold uppercase bg-bg-base border border-border-sage/40 text-text-secondary px-1.5 py-0.5 rounded mt-1">
                  {user?.role}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 ml-1"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* TABS BAR */}
        <div className="bg-bg-card/25 border-b border-border-sage px-6">
          <div className="flex space-x-8 overflow-x-auto scrollbar-none py-3">
            {['Dashboard', 'Environmental', 'Social', 'Governance', 'Gamification', 'Reports', 'Settings'].map((tab) => {
              const toPath = tab === 'Dashboard' ? '/' : `/${tab.toLowerCase()}`;
              return (
                <NavLink
                  key={tab}
                  to={toPath}
                  className={({ isActive }) => `text-xs font-bold uppercase tracking-wider whitespace-nowrap pb-1.5 border-b-2 transition-all duration-200 ${
                    isActive 
                      ? getTabColorClass(tab) 
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-sage'
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
