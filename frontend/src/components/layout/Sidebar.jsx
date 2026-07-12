import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navigationConfig = [
  {
    name: 'Dashboard',
    icon: '📊',
    path: '/',
    exact: true
  },
  {
    name: 'Environmental',
    icon: '🌱',
    color: '#4CAF50',
    subItems: [
      { name: 'Emission Factors', path: '/environmental/emission-factors' },
      { name: 'Product ESG Profiles', path: '/environmental/product-esg-profiles' },
      { name: 'Carbon Transactions', path: '/environmental/carbon-transactions' },
      { name: 'Environmental Goals', path: '/environmental/environmental-goals' }
    ]
  },
  {
    name: 'Social',
    icon: '👥',
    color: '#2196F3',
    subItems: [
      { name: 'CSR Activities', path: '/social/csr-activities' },
      { name: 'Employee Participation', path: '/social/employee-participation' },
      { name: 'Diversity Dashboard', path: '/social/diversity-dashboard' }
    ]
  },
  {
    name: 'Governance',
    icon: '🏛️',
    color: '#9C27B0',
    subItems: [
      { name: 'Policies', path: '/governance/policies' },
      { name: 'Policy Acknowledgements', path: '/governance/policy-acknowledgements' },
      { name: 'Audits', path: '/governance/audits' },
      { name: 'Compliance Issues', path: '/governance/compliance-issues' }
    ]
  },
  {
    name: 'Gamification',
    icon: '🏆',
    color: '#FF9800',
    subItems: [
      { name: 'Challenges', path: '/gamification/challenges' },
      { name: 'Challenge Participation', path: '/gamification/challenge-participation' },
      { name: 'Badges', path: '/gamification/badges' },
      { name: 'Rewards', path: '/gamification/rewards' },
      { name: 'Leaderboard', path: '/gamification/leaderboard' }
    ]
  },
  {
    name: 'Reports',
    icon: '📋',
    color: '#00BCD4',
    subItems: [
      { name: 'Environmental Report', path: '/reports/environmental-report' },
      { name: 'Social Report', path: '/reports/social-report' },
      { name: 'Governance Report', path: '/reports/governance-report' },
      { name: 'ESG Summary', path: '/reports/esg-summary' },
      { name: 'Custom Report Builder', path: '/reports/custom-report-builder' }
    ]
  },
  {
    name: 'Settings',
    icon: '⚙️',
    color: '#E91E63',
    subItems: [
      { name: 'Departments', path: '/settings/departments' },
      { name: 'Categories', path: '/settings/categories' },
      { name: 'ESG Configuration', path: '/settings/esg-configuration' },
      { name: 'Notification Settings', path: '/settings/notification-settings' }
    ]
  }
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>SIDEBAR NAVIGATION</h2>
      </div>
      <nav className="sidebar-nav">
        {navigationConfig.map((item) => {
          if (!item.subItems) {
            return (
              <div key={item.name} className="nav-group">
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) => `nav-link parent-link ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.name}</span>
                </NavLink>
              </div>
            );
          }

          return (
            <div key={item.name} className="nav-group">
              <div className="nav-category-header" style={{ color: item.color }}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.name}</span>
              </div>
              <ul className="nav-sub-list">
                {item.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <NavLink
                      to={subItem.path}
                      className={({ isActive }) => `nav-sub-link ${isActive ? 'active' : ''}`}
                    >
                      {subItem.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
