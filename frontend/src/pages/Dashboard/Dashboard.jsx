import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { TERMS } from '../../constants/terminology';
import { 
  dashboardService,
  reportService,
  challengeService,
  dropdownService,
  productProfileService,
  carbonTransactionService
} from '../../services/api';
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
  Activity,
  Lock,
  Loader
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

export default function Dashboard() {
  const { showToast } = useToast();
  const { user, canEdit, canAccess, createNotification } = useAuth();
  const navigate = useNavigate();

  // Loading and Dynamic data states
  const [isLoading, setIsLoading] = useState(true);
  const [scoresData, setScoresData] = useState({
    overallScore: 0,
    environmentalScore: 0,
    socialScore: 0,
    governanceScore: 0,
  });
  const [chartEmissions, setChartEmissions] = useState([]);
  const [departmentScores, setDepartmentScores] = useState([]);
  const [challengesList, setChallengesList] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);

  // Modals state
  const [isCarbonModalOpen, setIsCarbonModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

  // Carbon form state
  const [carbonDeptId, setCarbonDeptId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [carbonQty, setCarbonQty] = useState('');
  const [carbonDate, setCarbonDate] = useState(new Date().toISOString().split('T')[0]);

  // Selected factor details
  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];
  const calculatedEmissions = currentProduct ? (parseFloat(carbonQty) || 0) * (currentProduct.emissionFactorValue || 0) : 0;

  // Fetch dynamic data
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [esgRes, envRes, chRes, deptsRes, prodsRes, partRes] = await Promise.allSettled([
        reportService.getEsgSummary(),
        reportService.getEnvironmental(),
        challengeService.getAll(),
        dropdownService.getDepartments(),
        productProfileService.getAll(),
        challengeService.getParticipants ? challengeService.getParticipants() : Promise.resolve([])
      ]);

      if (esgRes.status === 'fulfilled') {
        const data = esgRes.value;
        setScoresData({
          overallScore: data.overallScore || 0,
          environmentalScore: data.environmentalScore || 0,
          socialScore: data.socialScore || 0,
          governanceScore: data.governanceScore || 0,
        });

        // Set department ranking chart data
        const rankings = data.charts?.departmentRankings || [];
        const mappedRankings = rankings.map(item => {
          let color = 'var(--color-accent-env)';
          if (item.department === 'Logistics') color = 'var(--color-accent-gam)';
          if (item.department === 'Corporate') color = 'var(--color-accent-gov)';
          if (item.department === 'R&D') color = 'var(--color-accent-soc)';
          return {
            name: item.department.slice(0, 4),
            score: item.Score,
            color: color
          };
        });
        setDepartmentScores(mappedRankings);

        setRecentActivities(data.recentActivities || []);
      }

      if (envRes.status === 'fulfilled') {
        const envData = envRes.value;
        const trend = envData.charts?.monthlyTrend || [];
        setChartEmissions(trend.map(item => ({
          name: item.month,
          Emissions: item.Carbon
        })));
      }

      if (chRes.status === 'fulfilled') {
        setChallengesList(chRes.value);
      }

      if (partRes.status === 'fulfilled' && user?._id) {
        const parts = partRes.value;
        const mine = parts.filter(p => p.employeeId?._id === user._id || p.employeeId === user._id);
        setMyParticipations(mine.map(p => p.challengeId?._id || p.challengeId));
      }

      if (deptsRes.status === 'fulfilled') {
        const depts = deptsRes.value;
        setDepartments(depts);
        if (depts.length > 0 && !carbonDeptId) {
          setCarbonDeptId(depts[0].id);
        }
      }

      if (prodsRes.status === 'fulfilled') {
        const mappedProds = prodsRes.value.map(p => ({
          id: p._id,
          name: p.productName,
          emissionFactorValue: p.emissionFactor?.emissionValue || 0,
          unit: p.emissionFactor?.co2Unit || 'kg CO2e'
        }));
        setProducts(mappedProds);
        if (mappedProds.length > 0 && !selectedProductId) {
          setSelectedProductId(mappedProds[0].id);
        }
      }

    } catch (err) {
      console.error(err);
      showToast("Error fetching dashboard data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast, user?._id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCarbonSubmit = async (e) => {
    e.preventDefault();
    if (!carbonQty || !carbonDate) {
      showToast("Please fill in all carbon data fields.", "error");
      return;
    }

    if (!canEdit('environmental')) {
      showToast("You do not have permission to log environmental data.", "error");
      return;
    }

    showToast("Processing carbon entry...", "info");
    
    try {
      const payload = {
        department: carbonDeptId,
        productESGProfile: selectedProductId,
        quantity: parseFloat(carbonQty),
        transactionDate: new Date(carbonDate).toISOString(),
        activityType: 'Emission',
        remarks: `Logged emissions via ${currentProduct?.name || 'Product'}`
      };
      
      await carbonTransactionService.create(payload);

      // Create Notification
      if (createNotification) {
        createNotification(
          user?.id || 'all', 
          'info', 
          `New Carbon transaction logged. Goal progress updated.`
        );
      }

      showToast("Carbon data logged successfully!", "success");
      setIsCarbonModalOpen(false);
      setCarbonQty('');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || "Failed to log carbon data", "error");
    }
  };

  const handleJoinChallenge = async (ch) => {
    if (user?.role === 'Manager') {
      showToast("Managers cannot join challenges.", "error");
      return;
    }

    try {
      await challengeService.join(ch._id || ch.id);
      showToast(`Joined challenge: ${ch.title}!`, "success");
      setIsChallengeModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || "Failed to join challenge", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader className="w-8 h-8 text-brand animate-spin" />
        <span className="text-xs text-text-secondary font-bold font-mono tracking-wider uppercase">Loading dynamic metrics...</span>
      </div>
    );
  }

  return (
    <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
      {/* PAGE HEADER INTRO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-sage">
        <div>
          <h2 className="text-2xl font-bold font-display text-text-primary tracking-tight">
            Welcome back, {user?.name || 'Guest'} — <span className="text-brand font-semibold">{user?.role || 'Guest'} view</span>
          </h2>
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
            onClick={() => { if (canAccess('environmental')) navigate('/environmental'); }}
            className={`bg-bg-card bg-gradient-to-br from-bg-card to-accent-env/5 border-l-4 border-l-accent-env border border-border-sage rounded-r-2xl rounded-l-md p-6 hover:scale-[1.01] transition-all duration-300 hover:shadow-premium-green cursor-pointer group ${
              !canAccess('environmental') ? 'opacity-50 grayscale pointer-events-none' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider font-display">{TERMS.score} - Environmental</span>
              <div className="p-1.5 rounded-lg bg-accent-env/10 text-accent-env group-hover:bg-accent-env/20 transition-colors">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-text-primary tracking-tight font-display font-mono">{scoresData.environmentalScore} <span className="text-sm font-normal text-text-secondary">/ 100</span></span>
              <span className="flex items-center text-[10px] font-bold text-accent-env bg-accent-env/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" />
                +4.2%
              </span>
            </div>
            <div className="mt-3 h-1 bg-bg-base rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-env to-emerald-400 rounded-full" style={{ width: `${scoresData.environmentalScore}%` }}></div>
            </div>
          </div>

          {/* Card 2: Social Score */}
          <div 
            onClick={() => { if (canAccess('social')) navigate('/social'); }}
            className={`bg-bg-card bg-gradient-to-br from-bg-card to-accent-soc/5 border-l-4 border-l-accent-soc border border-border-sage rounded-r-2xl rounded-l-md p-6 hover:scale-[1.01] transition-all duration-300 hover:shadow-premium-blue cursor-pointer group ${
              !canAccess('social') ? 'opacity-50 grayscale pointer-events-none' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider font-display">{TERMS.score} - Social</span>
              <div className="p-1.5 rounded-lg bg-accent-soc/10 text-accent-soc group-hover:bg-accent-soc/20 transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-text-primary tracking-tight font-display font-mono">{scoresData.socialScore} <span className="text-sm font-normal text-text-secondary">/ 100</span></span>
              <span className="flex items-center text-[10px] font-bold text-accent-soc bg-accent-soc/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2.1%
              </span>
            </div>
            <div className="mt-3 h-1 bg-bg-base rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-soc to-blue-400 rounded-full" style={{ width: `${scoresData.socialScore}%` }}></div>
            </div>
          </div>

          {/* Card 3: Governance Score */}
          <div 
            onClick={() => { if (canAccess('governance')) navigate('/governance'); }}
            className={`bg-bg-card bg-gradient-to-br from-bg-card to-accent-gov/5 border-l-4 border-l-accent-gov border border-border-sage rounded-r-2xl rounded-l-md p-6 hover:scale-[1.01] transition-all duration-300 hover:shadow-premium-purple cursor-pointer group ${
              !canAccess('governance') ? 'opacity-50 grayscale pointer-events-none' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider font-display">{TERMS.score} - Governance</span>
              <div className="p-1.5 rounded-lg bg-accent-gov/10 text-accent-gov group-hover:bg-accent-gov/20 transition-colors">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-text-primary tracking-tight font-display font-mono">{scoresData.governanceScore} <span className="text-sm font-normal text-text-secondary">/ 100</span></span>
              <span className="flex items-center text-[10px] font-bold text-accent-gov bg-accent-gov/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" />
                +1.5%
              </span>
            </div>
            <div className="mt-3 h-1 bg-bg-base rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-gov to-purple-400 rounded-full" style={{ width: `${scoresData.governanceScore}%` }}></div>
            </div>
          </div>

          {/* Card 4: Overall ESG Score */}
          <div 
            onClick={() => { if (canAccess('reports')) navigate('/reports'); }}
            className={`relative bg-bg-card border-2 border-brand/40 rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300 shadow-premium-green hover:border-brand cursor-pointer group ${
              !canAccess('reports') ? 'opacity-50 grayscale pointer-events-none' : ''
            }`}
          >
            <div className="absolute top-0 right-0 -mt-2.5 -mr-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-brand text-bg-base shadow-md">
              Primary
            </div>
            <div className="flex items-center justify-between">
              <span className="text-brand text-[10px] font-extrabold uppercase tracking-wider font-display">Overall {TERMS.score}</span>
              <div className="p-1.5 rounded-lg bg-brand/10 text-brand group-hover:bg-brand/20 transition-colors">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-text-primary tracking-tight font-display font-mono">{scoresData.overallScore} <span className="text-sm font-normal text-text-secondary">/ 100</span></span>
              <span className="flex items-center text-[10px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3.2%
              </span>
            </div>
            <div className="mt-3 h-1 bg-bg-base rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand to-accent-rep rounded-full" style={{ width: `${scoresData.overallScore}%` }}></div>
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
              <LineChart data={chartEmissions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <h3 className="text-xs font-bold text-text-primary tracking-wide uppercase font-display">Department {TERMS.score} Ranking</h3>
            </div>
            <span className="text-[10px] text-accent-soc bg-accent-soc/10 px-2 py-0.5 rounded font-mono font-bold">
              Score Out of 100
            </span>
          </div>
          
          <div className="flex-1 mt-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={departmentScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  {departmentScores.map((entry, index) => (
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
              {recentActivities.length === 0 && (
                <p className="text-xs text-text-secondary py-8 text-center">No recent ESG activities logged.</p>
              )}
              {recentActivities.map((act) => (
                <div key={act.id || act._id} className="py-3.5 flex items-start space-x-3.5 hover:bg-bg-base/30 px-2 rounded-lg transition-colors duration-150">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-brand/15 text-brand">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-primary">{act.message}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">{act.date}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary mt-1" />
                </div>
              ))}
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
              {/* Button 1: Log Carbon Data */}
              <div className="w-full">
                <button 
                  onClick={() => { if (canEdit('environmental')) setIsCarbonModalOpen(true); }}
                  disabled={!canEdit('environmental')}
                  className={`w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-brand to-accent-env text-bg-base font-bold rounded-xl transition-all duration-200 shadow-md group active:scale-[0.99] cursor-pointer ${
                    !canEdit('environmental') ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:brightness-110'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="w-5 h-5 text-bg-base stroke-[3]" />
                    <span className="text-xs uppercase tracking-wider font-display font-extrabold">Log Carbon Data</span>
                  </div>
                  {canEdit('environmental') ? (
                    <ArrowUpRight className="w-5 h-5 text-bg-base/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  ) : (
                    <Lock className="w-4 h-4 text-bg-base" />
                  )}
                </button>
                {!canEdit('environmental') && (
                  <p className="text-[10px] text-text-secondary/70 mt-1 pl-1 font-bold tracking-wide">Requires Sustainability Team access</p>
                )}
              </div>

              {/* Button 2: Start Challenge */}
              <div className="w-full">
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
              </div>

              {/* Button 3: Outlined/Gray View Reports */}
              <button 
                onClick={() => navigate('/reports')}
                className="w-full flex items-center justify-between px-5 py-4 bg-transparent border border-border-sage hover:border-text-secondary hover:bg-bg-base/40 text-text-primary font-bold rounded-xl transition-all duration-200 group active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-text-secondary" />
                  <span className="text-xs uppercase tracking-wider font-display font-extrabold font-semibold">View Reports</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-text-secondary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
          
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
              value={carbonDeptId}
              onChange={(e) => setCarbonDeptId(e.target.value)}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-brand"
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Product Profile</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-brand"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.emissionFactorValue} {p.unit})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Quantity (Units/kWh/L)</label>
            <input
              type="number"
              value={carbonQty}
              onChange={(e) => setCarbonQty(e.target.value)}
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
          
          {/* Live Preview Calculation */}
          {carbonQty && currentProduct && (
            <div className="p-3 bg-brand/5 border border-brand/20 rounded-lg text-[11px] font-semibold text-brand">
              🧮 Live Calculation Preview: <br/>
              <span className="font-bold font-mono">
                {carbonQty} units × {currentProduct.emissionFactorValue} {currentProduct.unit} = {(calculatedEmissions).toLocaleString()} kg CO₂ ({parseFloat((calculatedEmissions / 1000).toFixed(2))} tCO2e)
              </span>
            </div>
          )}
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
          {challengesList.filter(ch => !myParticipations.includes(ch._id || ch.id)).map((ch) => (
            <div key={ch._id || ch.id} className="pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-text-primary font-display">{ch.title || ch.name}</h4>
                <p className="text-[10px] text-text-secondary mt-0.5">XP Reward: {ch.xpReward} • Difficulty: {ch.difficulty}</p>
              </div>
              <button
                onClick={() => handleJoinChallenge(ch)}
                className="px-3 py-1.5 bg-accent-gam hover:bg-amber-600 text-bg-base text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                Join
              </button>
            </div>
          ))}
          {challengesList.filter(ch => !myParticipations.includes(ch._id || ch.id)).length === 0 && (
            <p className="text-xs text-text-secondary pt-4 text-center">No new challenges available to join.</p>
          )}
        </div>
      </Modal>
    </main>
  );
}
