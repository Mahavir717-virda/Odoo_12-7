import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import EmissionFactors from './pages/Environmental/EmissionFactors';
import ProductESGProfiles from './pages/Environmental/ProductESGProfiles';
import CarbonTransactions from './pages/Environmental/CarbonTransactions';
import EnvironmentalGoals from './pages/Environmental/EnvironmentalGoals';
import CSRActivities from './pages/Social/CSRActivities';
import EmployeeParticipation from './pages/Social/EmployeeParticipation';
import DiversityDashboard from './pages/Social/DiversityDashboard';
import Policies from './pages/Governance/Policies';
import PolicyAcknowledgements from './pages/Governance/PolicyAcknowledgements';
import Audits from './pages/Governance/Audits';
import ComplianceIssues from './pages/Governance/ComplianceIssues';
import Challenges from './pages/Gamification/Challenges';
import ChallengeParticipation from './pages/Gamification/ChallengeParticipation';
import Badges from './pages/Gamification/Badges';
import Rewards from './pages/Gamification/Rewards';
import Leaderboard from './pages/Gamification/Leaderboard';
import EnvironmentalReport from './pages/Reports/EnvironmentalReport';
import SocialReport from './pages/Reports/SocialReport';
import GovernanceReport from './pages/Reports/GovernanceReport';
import ESGSummary from './pages/Reports/ESGSummary';
import CustomReportBuilder from './pages/Reports/CustomReportBuilder';
import Departments from './pages/Settings/Departments';
import Categories from './pages/Settings/Categories';
import ESGConfiguration from './pages/Settings/ESGConfiguration';
import NotificationSettings from './pages/Settings/NotificationSettings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          {/* Environmental */}
          <Route path="environmental/emission-factors" element={<EmissionFactors />} />
          <Route path="environmental/product-esg-profiles" element={<ProductESGProfiles />} />
          <Route path="environmental/carbon-transactions" element={<CarbonTransactions />} />
          <Route path="environmental/environmental-goals" element={<EnvironmentalGoals />} />
          
          {/* Social */}
          <Route path="social/csr-activities" element={<CSRActivities />} />
          <Route path="social/employee-participation" element={<EmployeeParticipation />} />
          <Route path="social/diversity-dashboard" element={<DiversityDashboard />} />
          
          {/* Governance */}
          <Route path="governance/policies" element={<Policies />} />
          <Route path="governance/policy-acknowledgements" element={<PolicyAcknowledgements />} />
          <Route path="governance/audits" element={<Audits />} />
          <Route path="governance/compliance-issues" element={<ComplianceIssues />} />
          
          {/* Gamification */}
          <Route path="gamification/challenges" element={<Challenges />} />
          <Route path="gamification/challenge-participation" element={<ChallengeParticipation />} />
          <Route path="gamification/badges" element={<Badges />} />
          <Route path="gamification/rewards" element={<Rewards />} />
          <Route path="gamification/leaderboard" element={<Leaderboard />} />
          
          {/* Reports */}
          <Route path="reports/environmental-report" element={<EnvironmentalReport />} />
          <Route path="reports/social-report" element={<SocialReport />} />
          <Route path="reports/governance-report" element={<GovernanceReport />} />
          <Route path="reports/esg-summary" element={<ESGSummary />} />
          <Route path="reports/custom-report-builder" element={<CustomReportBuilder />} />
          
          {/* Settings */}
          <Route path="settings/departments" element={<Departments />} />
          <Route path="settings/categories" element={<Categories />} />
          <Route path="settings/esg-configuration" element={<ESGConfiguration />} />
          <Route path="settings/notification-settings" element={<NotificationSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
