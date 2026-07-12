import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  ClipboardCheck, 
  Plus, 
  Zap, 
  TrendingUp, 
  Globe, 
  Users, 
  Shield, 
  Award, 
  ChevronRight, 
  ArrowUpRight, 
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

// Mock Chart Data
const initialEmissionsData = [
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
  { name: 'Sale', score: 78, color: 'var(--color-accent-soc)' },
  { name: 'Mfg', score: 65, color: 'var(--color-accent-env)' },
  { name: 'Logi', score: 72, color: 'var(--color-accent-gam)' },
  { name: 'Corp', score: 92, color: 'var(--color-accent-gov)' },
  { name: 'R&D', score: 85, color: 'var(--color-accent-rep)' },
];

const mockChallengesList = [
  { id: 1, title: "Sustainability Sprint", xp: 200, difficulty: "Hard" },
  { id: 2, title: "Recycle Challenge", xp: 80, difficulty: "Easy" },
  { id: 3, title: "Commute Green Week", xp: 120, difficulty: "Medium" }
];

export default function Dashboard() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // State for scores
  const [environmentalScore, setEnvironmentalScore] = useState(82);
  const [socialScore, setSocialScore] = useState(74);
  const [governanceScore, setGovernanceScore] = useState(88);
  const [overallScore, setOverallScore] = useState(81);
  const [emissionsData, setEmissionsData] = useState(initialEmissionsData);

  // Modals state
  const [isCarbonModalOpen, setIsCarbonModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

  // Carbon form state
  const [carbonDept, setCarbonDept] = useState('Manufacturing');
  const [carbonAmount, setCarbonAmount] = useState('');
  const [carbonDate, setCarbonDate] = useState('');

  const handleCarbonSubmit = (e) => {
    e.preventDefault();
    if (!carbonAmount || !carbonDate) {
      showToast("Please fill in all carbon data fields.", "error");
      return;
    }

    showToast("Processing carbon entry...", "info");
    
    setTimeout(() => {
      setEnvironmentalScore(prev => Math.min(prev + 1, 100));
      setOverallScore(prev => Math.min(prev + 1, 100));

      setEmissionsData(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        copy[copy.length - 1] = { ...last, Emissions: last.Emissions + parseFloat(carbonAmount) };
        return copy;
      });

      showToast("Carbon data logged successfully!", "success");
      setIsCarbonModalOpen(false);
      setCarbonAmount('');
      setCarbonDate('');
    }, 800);
  };

  const handleJoinChallenge = (title) => {
    showToast(`Joined challenge: ${title}!`, "success");
    setIsChallengeModalOpen(false);
  };

  return (
    <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
      {/* PAGE HEADER INTRO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-sage">
        <div>
          <h2 className="text-2xl font-bold font-display text-text-primary tracking-tight">Executive Overview</h2>
          <p className="text-text-secondary text-xs mt-1 font-medium">Real-time performance metrics, compliance logs, and cross-department ESG indicators.</p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-text-secondary bg-bg-card border border-border-sage rounded-lg p-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-brand"></span>
          <span>Updated: Just Now</span>
        </div>
      </div>

      {/* KPI ROW */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Environmental Score */}
          <div 
            onClick={() => navigate('/environmental')}
            className="bg-bg-card bg-gradient-to-br from-bg-card to-accent-env/5 border-l-4 border-l-accent-env border border-border-sage rounded-r-2xl rounded-l-md p-6 hover:scale-[1.01] transition-all duration-300 hover:shadow-premium-green cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider font-display">Environmental Score</span>
              <div className="p-1.5 rounded-lg bg-accent-env/10 text-accent-env group-hover:bg-accent-env/20 transition-colors">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-text-primary tracking-tight font-display font-mono">{environmentalScore} <span className="text-sm font-normal text-text-secondary">/ 100</span></span>
              <span className="flex items-center text-[10px] font-bold text-accent-env bg-accent-env/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" />
                +4.2%
              </span>
            </div>
            <div className="mt-3 h-1 bg-bg-base rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-env to-emerald-400 rounded-full" style={{ width: `${environmentalScore}%` }}></div>
            </div>
          </div>

          {/* Card 2: Social Score */}
          <div 
            onClick={() => navigate('/social')}
            className="bg-bg-card bg-gradient-to-br from-bg-card to-accent-soc/5 border-l-4 border-l-accent-soc border border-border-sage rounded-r-2xl rounded-l-md p-6 hover:scale-[1.01] transition-all duration-300 hover:shadow-premium-blue cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider font-display">Social Score</span>
              <div className="p-1.5 rounded-lg bg-accent-soc/10 text-accent-soc group-hover:bg-accent-soc/20 transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-text-primary tracking-tight font-display font-mono">{socialScore} <span className="text-sm font-normal text-text-secondary">/ 100</span></span>
              <span className="flex items-center text-[10px] font-bold text-accent-soc bg-accent-soc/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2.1%
              </span>
            </div>
            <div className="mt-3 h-1 bg-bg-base rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-soc to-blue-400 rounded-full" style={{ width: `${socialScore}%` }}></div>
            </div>
          </div>

          {/* Card 3: Governance Score */}
          <div 
            onClick={() => navigate('/governance')}
            className="bg-bg-card bg-gradient-to-br from-bg-card to-accent-gov/5 border-l-4 border-l-accent-gov border border-border-sage rounded-r-2xl rounded-l-md p-6 hover:scale-[1.01] transition-all duration-300 hover:shadow-premium-purple cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider font-display">Governance Score</span>
              <div className="p-1.5 rounded-lg bg-accent-gov/10 text-accent-gov group-hover:bg-accent-gov/20 transition-colors">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-text-primary tracking-tight font-display font-mono">{governanceScore} <span className="text-sm font-normal text-text-secondary">/ 100</span></span>
              <span className="flex items-center text-[10px] font-bold text-accent-gov bg-accent-gov/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" />
                +1.5%
              </span>
            </div>
            <div className="mt-3 h-1 bg-bg-base rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-gov to-purple-400 rounded-full" style={{ width: `${governanceScore}%` }}></div>
            </div>
          </div>

          {/* Card 4: Overall ESG Score */}
          <div 
            onClick={() => navigate('/reports')}
            className="relative bg-bg-card border-2 border-brand/40 rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300 shadow-premium-green hover:border-brand cursor-pointer group"
          >
            <div className="absolute top-0 right-0 -mt-2.5 -mr-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-brand text-bg-base shadow-md">
              Primary
            </div>
            <div className="flex items-center justify-between">
              <span className="text-brand text-[10px] font-extrabold uppercase tracking-wider font-display">Overall ESG Score</span>
              <div className="p-1.5 rounded-lg bg-brand/10 text-brand group-hover:bg-brand/20 transition-colors">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-text-primary tracking-tight font-display font-mono">{overallScore} <span className="text-sm font-normal text-text-secondary">/ 100</span></span>
              <span className="flex items-center text-[10px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3.2%
              </span>
            </div>
            <div className="mt-3 h-1 bg-bg-base rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand to-accent-rep rounded-full" style={{ width: `${overallScore}%` }}></div>
            </div>
          </div>

        </div>
        
        {/* KPI Feature Caption */}
        <p className="text-[10px] text-text-secondary/70 mt-3 pl-1 font-bold tracking-wide uppercase font-display">
          Features: Live KPI metrics • dynamic tracking • direct module navigation
        </p>
      </div>

      {/* TWO-COLUMN CHART ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Emissions Trend LineChart */}
        <div className="bg-bg-card border border-border-sage rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between pb-4 border-b border-border-sage">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-env"></div>
              <h3 className="text-xs font-bold text-text-primary tracking-wide uppercase font-display">Emissions Trend (12 mo)</h3>
            </div>
            <span className="text-[10px] text-accent-env bg-accent-env/10 px-2 py-0.5 rounded font-mono font-bold">
              tCO2e Monthly
            </span>
          </div>
          
          <div className="flex-1 mt-4">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={emissionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="var(--color-text-secondary)" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="var(--color-text-secondary)" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-bg-card border border-border-sage p-3 rounded-lg shadow-xl">
                          <p className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">{label}</p>
                          <p className="text-text-primary text-xs font-bold mt-1">
                            Emissions: <span className="text-accent-env">{payload[0].value} tCO2e</span>
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
                  stroke="var(--color-brand)" 
                  strokeWidth={3} 
                  dot={{ r: 4, stroke: 'var(--color-bg-base)', strokeWidth: 2, fill: 'var(--color-brand)' }}
                  activeDot={{ r: 6, stroke: 'var(--color-bg-card)', strokeWidth: 2, fill: 'var(--color-brand)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Card: Department ESG Ranking BarChart */}
        <div className="bg-bg-card border border-border-sage rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between pb-4 border-b border-border-sage">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-soc"></div>
              <h3 className="text-xs font-bold text-text-primary tracking-wide uppercase font-display">Department ESG Ranking</h3>
            </div>
            <span className="text-[10px] text-accent-soc bg-accent-soc/10 px-2 py-0.5 rounded font-mono font-bold">
              Score Out of 100
            </span>
          </div>
          
          <div className="flex-1 mt-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="var(--color-text-secondary)" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="var(--color-text-secondary)" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 100]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-bg-card border border-border-sage p-3 rounded-lg shadow-xl">
                          <p className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">{label}</p>
                          <p className="text-text-primary text-xs font-bold mt-1">
                            Score: <span className="text-accent-soc">{payload[0].value} / 100</span>
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
        <div className="bg-bg-card border border-border-sage rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-text-primary tracking-wide uppercase font-display pb-4 border-b border-border-sage flex items-center space-x-2">
              <span>Recent Activity</span>
            </h3>
            
            <div className="mt-4 divide-y divide-border-sage/40">
              
              {/* Item 1 */}
              <div className="py-3.5 flex items-start space-x-3.5 hover:bg-bg-base/30 px-2 rounded-lg transition-colors duration-150">
                <div className="mt-0.5 p-1.5 rounded-lg bg-accent-env/15 text-accent-env">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary">Priya completed 'Zero Waste Week'</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">Environmental Gamification • 2 hours ago</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary mt-1" />
              </div>

              {/* Item 2 */}
              <div className="py-3.5 flex items-start space-x-3.5 hover:bg-bg-base/30 px-2 rounded-lg transition-colors duration-150">
                <div className="mt-0.5 p-1.5 rounded-lg bg-red-500/15 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary">New compliance issue in Logistics</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">Governance Compliance • 5 hours ago</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary mt-1" />
              </div>

              {/* Item 3 */}
              <div className="py-3.5 flex items-start space-x-3.5 hover:bg-bg-base/30 px-2 rounded-lg transition-colors duration-150">
                <div className="mt-0.5 p-1.5 rounded-lg bg-brand/15 text-brand">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary">42 new Carbon Transactions logged</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">Environmental Accounting • 1 day ago</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary mt-1" />
              </div>

              {/* Item 4 */}
              <div className="py-3.5 flex items-start space-x-3.5 hover:bg-bg-base/30 px-2 rounded-lg transition-colors duration-150">
                <div className="mt-0.5 p-1.5 rounded-lg bg-accent-gov/15 text-accent-gov">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary">R&D acknowledged Anti-Corruption Policy</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">Governance Policy • 2 days ago</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary mt-1" />
              </div>

            </div>
          </div>
        </div>

        {/* Right Card: Quick Actions */}
        <div className="bg-bg-card border border-border-sage rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-text-primary tracking-wide uppercase font-display pb-4 border-b border-border-sage">
              Quick Actions
            </h3>
            
            <div className="mt-6 space-y-4">
              {/* Button 1: Solid Green */}
              <button 
                onClick={() => setIsCarbonModalOpen(true)}
                className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-brand to-accent-env hover:brightness-110 text-bg-base font-bold rounded-xl transition-all duration-200 shadow-md group active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="w-5 h-5 text-bg-base stroke-[3]" />
                  <span className="text-xs uppercase tracking-wider font-display font-extrabold">Log Carbon Data</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-bg-base/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              {/* Button 2: Solid Orange */}
              <button 
                onClick={() => setIsChallengeModalOpen(true)}
                className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-accent-gam to-amber-600 hover:brightness-110 text-bg-base font-bold rounded-xl transition-all duration-200 shadow-md group active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-bg-base fill-current" />
                  <span className="text-xs uppercase tracking-wider font-display font-extrabold">Start Challenge</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-bg-base/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              {/* Button 3: Outlined/Gray */}
              <button 
                onClick={() => navigate('/reports')}
                className="w-full flex items-center justify-between px-5 py-4 bg-transparent border border-border-sage hover:border-text-secondary hover:bg-bg-base/40 text-text-primary font-bold rounded-xl transition-all duration-200 group active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-text-secondary" />
                  <span className="text-xs uppercase tracking-wider font-display font-extrabold">View Reports</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-text-secondary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
          
          {/* Decorative extra widget inside Quick Actions for polished look */}
          <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-brand/10 to-accent-env/5 border border-brand/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-brand animate-ping"></div>
              <div>
                <p className="text-xs font-bold text-brand font-display">Sustainability Challenge Active</p>
                <p className="text-[10px] text-text-secondary font-medium">Join 124 other participants this week</p>
              </div>
            </div>
            <span className="text-[10px] bg-brand/10 text-brand font-extrabold px-2 py-0.5 rounded uppercase font-display">
              Active
            </span>
          </div>
        </div>

      </div>

      {/* Modal: Log Carbon Data */}
      <Modal
        isOpen={isCarbonModalOpen}
        onClose={() => setIsCarbonModalOpen(false)}
        title="Log Carbon Data"
        confirmText="Log Data"
        confirmColorClass="bg-brand hover:bg-brand-hover text-bg-base font-bold"
        onConfirm={handleCarbonSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Department</label>
            <select
              value={carbonDept}
              onChange={(e) => setCarbonDept(e.target.value)}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-brand"
            >
              <option>Sales</option>
              <option>Manufacturing</option>
              <option>Logistics</option>
              <option>Corporate</option>
              <option>R&D</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">CO₂ Amount (tCO2e)</label>
            <input
              type="number"
              value={carbonAmount}
              onChange={(e) => setCarbonAmount(e.target.value)}
              placeholder="e.g. 150"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Logging Date</label>
            <input
              type="date"
              value={carbonDate}
              onChange={(e) => setCarbonDate(e.target.value)}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-brand"
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Start Challenge */}
      <Modal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        title="Start Active Challenge"
        confirmText=""
        onConfirm={null}
      >
        <div className="space-y-4 divide-y divide-border-sage/40">
          <p className="text-[11px] text-text-secondary">Select an active challenge from the platform to join.</p>
          {mockChallengesList.map((ch) => (
            <div key={ch.id} className="pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-text-primary font-display">{ch.title}</h4>
                <p className="text-[10px] text-text-secondary mt-0.5">XP Reward: {ch.xp} • Difficulty: {ch.difficulty}</p>
              </div>
              <button
                onClick={() => handleJoinChallenge(ch.title)}
                className="px-3 py-1.5 bg-accent-gam hover:bg-amber-600 text-bg-base text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                Join
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </main>
  );
}
