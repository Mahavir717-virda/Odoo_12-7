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
  { name: 'Sale', score: 78, color: '#3B82F6' },
  { name: 'Mfg', score: 65, color: '#10B981' },
  { name: 'Logi', score: 72, color: '#F59E0B' },
  { name: 'Corp', score: 92, color: '#A855F7' },
  { name: 'R&D', score: 85, color: '#06B6D4' },
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

    // Simulate delay
    showToast("Processing carbon entry...", "info");
    
    setTimeout(() => {
      // Bumps Environmental score and Overall score slightly
      setEnvironmentalScore(prev => Math.min(prev + 1, 100));
      setOverallScore(prev => Math.min(prev + 1, 100));

      // Append data to last month for visual chart update
      setEmissionsData(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        copy[copy.length - 1] = { ...last, Emissions: last.Emissions + parseFloat(carbonAmount) };
        return copy;
      });

      showToast("Carbon data logged successfully!", "success");
      setIsCarbonModalOpen(false);
      // Reset form
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-905 border-gray-800">
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
          <div 
            onClick={() => navigate('/environmental')}
            className="bg-[#11161D] border-l-4 border-l-emerald-500 border border-gray-800/80 rounded-r-2xl rounded-l-md p-6 hover:scale-[1.01] transition-transform duration-300 hover:shadow-lg hover:shadow-emerald-950/10 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Environmental Score</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white tracking-tight">{environmentalScore} <span className="text-base font-normal text-gray-500">/ 100</span></span>
              <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" />
                +4.2%
              </span>
            </div>
            <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${environmentalScore}%` }}></div>
            </div>
          </div>

          {/* Card 2: Social Score */}
          <div 
            onClick={() => navigate('/social')}
            className="bg-[#11161D] border-l-4 border-l-blue-500 border border-gray-800/80 rounded-r-2xl rounded-l-md p-6 hover:scale-[1.01] transition-transform duration-300 hover:shadow-lg hover:shadow-blue-950/10 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Social Score</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white tracking-tight">{socialScore} <span className="text-base font-normal text-gray-500">/ 100</span></span>
              <span className="flex items-center text-xs font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2.1%
              </span>
            </div>
            <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${socialScore}%` }}></div>
            </div>
          </div>

          {/* Card 3: Governance Score */}
          <div 
            onClick={() => navigate('/governance')}
            className="bg-[#11161D] border-l-4 border-l-purple-500 border border-gray-800/80 rounded-r-2xl rounded-l-md p-6 hover:scale-[1.01] transition-transform duration-300 hover:shadow-lg hover:shadow-purple-950/10 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Governance Score</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white tracking-tight">{governanceScore} <span className="text-base font-normal text-gray-500">/ 100</span></span>
              <span className="flex items-center text-xs font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" />
                +1.5%
              </span>
            </div>
            <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${governanceScore}%` }}></div>
            </div>
          </div>

          {/* Card 4: Overall ESG Score */}
          <div 
            onClick={() => navigate('/reports')}
            className="relative bg-[#11161D] border-2 border-cyan-500 rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] cursor-pointer group"
          >
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
              <span className="text-3xl font-black text-white tracking-tight">{overallScore} <span className="text-base font-normal text-gray-500">/ 100</span></span>
              <span className="flex items-center text-xs font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3.2%
              </span>
            </div>
            <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full" style={{ width: `${overallScore}%` }}></div>
            </div>
          </div>

        </div>
        
        {/* KPI Feature Caption */}
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
                onClick={() => setIsCarbonModalOpen(true)}
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
                onClick={() => setIsChallengeModalOpen(true)}
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
                onClick={() => navigate('/reports')}
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

      {/* Modal: Log Carbon Data */}
      <Modal
        isOpen={isCarbonModalOpen}
        onClose={() => setIsCarbonModalOpen(false)}
        title="Log Carbon Data"
        confirmText="Log Data"
        confirmColorClass="bg-[#22C55E] hover:bg-[#1EAF53] text-black font-bold"
        onConfirm={handleCarbonSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Department</label>
            <select
              value={carbonDept}
              onChange={(e) => setCarbonDept(e.target.value)}
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none focus:border-emerald-500"
            >
              <option>Sales</option>
              <option>Manufacturing</option>
              <option>Logistics</option>
              <option>Corporate</option>
              <option>R&D</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">CO₂ Amount (tCO2e)</label>
            <input
              type="number"
              value={carbonAmount}
              onChange={(e) => setCarbonAmount(e.target.value)}
              placeholder="e.g. 150"
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Logging Date</label>
            <input
              type="date"
              value={carbonDate}
              onChange={(e) => setCarbonDate(e.target.value)}
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-[#9CA3AF] focus:outline-none focus:border-emerald-500"
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
        onConfirm={null} // confirm handles manually per challenge item
      >
        <div className="space-y-4 divide-y divide-gray-800/80">
          <p className="text-[11px] text-gray-400">Select an active challenge from the platform to join.</p>
          {mockChallengesList.map((ch) => (
            <div key={ch.id} className="pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">{ch.title}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">XP Reward: {ch.xp} • Difficulty: {ch.difficulty}</p>
              </div>
              <button
                onClick={() => handleJoinChallenge(ch.title)}
                className="px-3 py-1.5 bg-[#F97316] hover:bg-[#E26610] text-white text-[10px] font-bold rounded-lg transition-colors"
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
