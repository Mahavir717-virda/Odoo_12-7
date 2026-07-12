import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { TERMS } from '../../constants/terminology';
import { 
  getStorageItem, 
  setStorageItem, 
  recalculateAllScores 
} from '../../utils/storage';
import { calculateGoalProgress, getGoalStatus } from '../../utils/calculations';
import Modal from '../../components/Modal';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Download, 
  ChevronDown, 
  Search, 
  Eye,
  Lock
} from 'lucide-react';

export default function Environmental() {
  const location = useLocation();
  const { showToast } = useToast();
  const { canEdit, createNotification } = useAuth();
  
  const [activeSubTab, setActiveSubTab] = useState('Environmental Goals');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredAction, setHoveredAction] = useState(null); 

  // Selection states
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);

  // Dynamic state hooks connected to localStorage
  const [goals, setGoals] = useState(() => getStorageItem('db_goals', []));
  const [factors, setFactors] = useState(() => getStorageItem('db_factors', []));
  const [profiles, setProfiles] = useState(() => getStorageItem('db_profiles', []));
  const [transactions, setTransactions] = useState(() => getStorageItem('db_transactions', []));

  useEffect(() => {
    if (location.state?.activeSubTab) {
      setActiveSubTab(location.state.activeSubTab);
    }
  }, [location.state]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const refreshData = () => {
    setGoals(getStorageItem('db_goals', []));
    setFactors(getStorageItem('db_factors', []));
    setProfiles(getStorageItem('db_profiles', []));
    setTransactions(getStorageItem('db_transactions', []));
    recalculateAllScores();
  };

  // Goal modal states
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalModalMode, setGoalModalMode] = useState('create');
  const [currentGoalData, setCurrentGoalData] = useState({
    id: null, name: '', department: 'Manufacturing', targetCO2: '', currentCO2: '', deadline: ''
  });

  // Factor modal states
  const [isFactorModalOpen, setIsFactorModalOpen] = useState(false);
  const [factorFormData, setFactorFormData] = useState({ name: '', category: 'Scope 1', factorValue: '', unit: 'kg/kWh', source: '' });

  // Profile modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ name: '', carbonFootprint: '', recyclability: '', certification: '' });

  // Carbon Transaction modal states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txFormData, setTxFormData] = useState({ desc: '', type: 'Emission', quantity: '', factorId: 1, cost: '', department: 'Manufacturing' });

  // Delete confirm modal states
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  // Handlers for goals
  const openGoalModal = (mode, goal = null) => {
    setGoalModalMode(mode);
    if (goal) {
      setCurrentGoalData({
        id: goal.id,
        name: goal.name,
        department: goal.department,
        targetCO2: goal.targetCO2,
        currentCO2: goal.currentCO2,
        deadline: goal.deadline
      });
    } else {
      setCurrentGoalData({
        id: null, name: '', department: 'Manufacturing', targetCO2: '', currentCO2: '0', deadline: ''
      });
    }
    setIsGoalModalOpen(true);
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    if (!currentGoalData.name || !currentGoalData.targetCO2 || !currentGoalData.deadline) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    const currentVal = parseFloat(currentGoalData.currentCO2) || 0;
    const targetVal = parseFloat(currentGoalData.targetCO2) || 1;
    const progress = calculateGoalProgress(currentVal, targetVal);
    const status = getGoalStatus(progress);

    const goalList = getStorageItem('db_goals', []);
    if (goalModalMode === 'create') {
      const newGoal = {
        id: Date.now(),
        name: currentGoalData.name,
        department: currentGoalData.department,
        targetCO2: targetVal,
        currentCO2: currentVal,
        progress,
        deadline: currentGoalData.deadline,
        status
      };
      setStorageItem('db_goals', [...goalList, newGoal]);
      createNotification('all', 'success', `New goal created: ${newGoal.name}`);
      showToast("Goal created successfully!", "success");
    } else {
      const updated = goalList.map(g => {
        if (g.id === currentGoalData.id) {
          return {
            ...g,
            name: currentGoalData.name,
            department: currentGoalData.department,
            targetCO2: targetVal,
            currentCO2: currentVal,
            progress,
            deadline: currentGoalData.deadline,
            status
          };
        }
        return g;
      });
      setStorageItem('db_goals', updated);
      showToast("Goal updated successfully!", "success");
    }

    setIsGoalModalOpen(false);
    refreshData();
  };

  const triggerDeleteConfirm = (id) => {
    setGoalToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    const goalList = getStorageItem('db_goals', []);
    const filtered = goalList.filter(g => g.id !== goalToDelete);
    setStorageItem('db_goals', filtered);
    showToast("Goal deleted successfully!", "success");
    setIsDeleteConfirmOpen(false);
    refreshData();
  };

  // Handlers for other list creations
  const handleFactorSubmit = (e) => {
    e.preventDefault();
    if (!factorFormData.name || !factorFormData.factorValue) {
      showToast("Please fill in factor name and value.", "error");
      return;
    }
    const list = getStorageItem('db_factors', []);
    const newFactor = {
      id: Date.now(),
      name: factorFormData.name,
      category: factorFormData.category,
      factorValue: parseFloat(factorFormData.factorValue),
      unit: factorFormData.unit,
      source: factorFormData.source || "User Entered"
    };
    setStorageItem('db_factors', [...list, newFactor]);
    showToast("Emission factor created successfully!", "success");
    setIsFactorModalOpen(false);
    refreshData();
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileFormData.name || !profileFormData.carbonFootprint) {
      showToast("Please fill in profile name and footprint.", "error");
      return;
    }
    const list = getStorageItem('db_profiles', []);
    const newProfile = {
      id: Date.now(),
      name: profileFormData.name,
      carbonFootprint: `${profileFormData.carbonFootprint} kg CO2e`,
      recyclability: profileFormData.recyclability || "0%",
      certification: profileFormData.certification || "None"
    };
    setStorageItem('db_profiles', [...list, newProfile]);
    showToast("Product Profile created successfully!", "success");
    setIsProfileModalOpen(false);
    refreshData();
  };

  const handleTxSubmit = (e) => {
    e.preventDefault();
    if (!txFormData.desc || !txFormData.quantity) {
      showToast("Please fill in all transaction fields.", "error");
      return;
    }

    const selectedFactor = factors.find(f => f.id === parseInt(txFormData.factorId)) || factors[0];
    const qty = parseFloat(txFormData.quantity) || 0;
    const computedCO2 = (qty * (selectedFactor?.factorValue || 0)) / 1000; // convert to tCO2e

    const list = getStorageItem('db_transactions', []);
    const newTx = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      desc: txFormData.desc,
      type: txFormData.type,
      quantity: qty,
      factorValue: selectedFactor?.factorValue || 0,
      amountCO2: txFormData.type === 'Emission' ? parseFloat(computedCO2.toFixed(2)) : -parseFloat(computedCO2.toFixed(2)),
      cost: txFormData.cost || "$0",
      department: txFormData.department
    };

    setStorageItem('db_transactions', [newTx, ...list]);

    // Recalculate goals for this department
    const goalList = getStorageItem('db_goals', []);
    const updatedGoals = goalList.map(g => {
      if (g.department === txFormData.department && g.status !== 'Completed') {
        const freshCurrent = parseFloat((g.currentCO2 + newTx.amountCO2).toFixed(2));
        const progress = calculateGoalProgress(freshCurrent, g.targetCO2);
        return {
          ...g,
          currentCO2: freshCurrent,
          progress: progress,
          status: getGoalStatus(progress)
        };
      }
      return g;
    });
    setStorageItem('db_goals', updatedGoals);

    showToast("Carbon Transaction logged successfully!", "success");
    setIsTxModalOpen(false);
    refreshData();
  };

  // Filter lists based on query
  const query = searchQuery.toLowerCase();
  const filteredGoals = goals.filter(g => g.name.toLowerCase().includes(query) || g.department.toLowerCase().includes(query));
  const filteredFactors = factors.filter(f => f.name.toLowerCase().includes(query) || f.category.toLowerCase().includes(query));
  const filteredProfiles = profiles.filter(p => p.name.toLowerCase().includes(query));
  const filteredTransactions = transactions.filter(t => t.desc.toLowerCase().includes(query) || t.department.toLowerCase().includes(query));

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6 max-w-7xl w-full mx-auto select-none">
      
      {/* SECOND LEVEL SUB-NAV PILLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-sage">
        <div className="flex flex-wrap gap-2">
          {['Environmental Goals', 'Emission Factors', 'Product ESG Profiles', 'Carbon Transactions'].map((tab) => {
            const isActive = activeSubTab === tab;
            let activeStyle = "bg-accent-env text-bg-base shadow-lg shadow-accent-env/15";
            let inactiveStyle = "bg-bg-card border border-border-sage text-text-secondary hover:text-text-primary hover:border-text-secondary";
            
            return (
              <button
                key={tab}
                onClick={() => { setActiveSubTab(tab); setSearchQuery(''); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive ? activeStyle : inactiveStyle
                }`}
              >
                {tab === 'Environmental Goals' ? `${TERMS.goal}s` : tab}
              </button>
            );
          })}
        </div>

        {/* Global Export dropdown */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-bg-card border border-border-sage hover:border-text-secondary rounded-xl text-xs font-bold text-text-primary transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
            <ChevronDown className="w-3 h-3 text-text-secondary" />
          </button>
          
          {isExportOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-bg-card border border-border-sage rounded-xl shadow-xl z-20 p-1">
              {['CSV Format', 'Excel Sheet', 'PDF Document'].map((format) => (
                <button
                  key={format}
                  onClick={() => { showToast(`Exporting ${activeSubTab} as ${format}...`, 'success'); setIsExportOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-base/60 transition-colors"
                >
                  {format}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RENDER VIEWS BASED ON SUB-NAV */}
      <div className="flex-1">
        
        {/* 1. Goals View */}
        {activeSubTab === 'Environmental Goals' && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">{TERMS.goal}s</h2>
                <p className="text-xs text-text-secondary mt-1">Configure and monitor greenhouse gas reduction targets across organizational branches.</p>
              </div>

              <div className="flex items-center space-x-2">
                {/* Create Goal Button wrapped in permissions */}
                <div>
                  <button
                    onClick={() => { if (canEdit('environmental')) openGoalModal('create'); }}
                    disabled={!canEdit('environmental')}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-env to-emerald-600 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-env/5 ${
                      !canEdit('environmental') ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:brightness-110'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span className="uppercase tracking-wider">New Goal</span>
                  </button>
                  {!canEdit('environmental') && (
                    <p className="text-[9px] text-text-secondary/70 mt-1 pl-1 font-bold">Requires Sustainability Team access</p>
                  )}
                </div>
              </div>
            </div>

            {/* Search filter row */}
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search goals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-bg-base border border-border-sage rounded-lg text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env transition-colors"
                />
              </div>
            </div>

            {/* DATA TABLE CONTAINER */}
            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                      <th className="py-4 px-6 w-8"></th>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6 text-right">Target CO₂</th>
                      <th className="py-4 px-6 text-right">Current CO₂</th>
                      <th className="py-4 px-6 min-w-[180px]">Progress</th>
                      <th className="py-4 px-6">Deadline</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-center">Row Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-sage/40 text-xs text-text-primary">
                    {filteredGoals.map((goal) => {
                      let statusStyle = "";
                      if (goal.status === "Active") {
                        statusStyle = "bg-accent-soc/10 text-accent-soc border border-accent-soc/20";
                      } else if (goal.status === "On Track") {
                        statusStyle = "bg-accent-gam/10 text-accent-gam border border-accent-gam/20";
                      } else if (goal.status === "Completed") {
                        statusStyle = "bg-accent-env/10 text-accent-env border border-accent-env/20";
                      }

                      let progressFillColor = "bg-gradient-to-r from-accent-env to-emerald-400";
                      if (goal.progress < 80) {
                        progressFillColor = "bg-gradient-to-r from-accent-soc to-blue-400";
                      } else if (goal.progress < 90) {
                        progressFillColor = "bg-gradient-to-r from-accent-gam to-amber-500";
                      }

                      const isSelected = selectedGoalId === goal.id;

                      return (
                        <tr 
                          key={goal.id} 
                          className={`hover:bg-bg-base/30 transition-colors duration-150 group cursor-pointer ${isSelected ? 'bg-accent-env/5 hover:bg-accent-env/10' : ''}`}
                          onClick={() => setSelectedGoalId(isSelected ? null : goal.id)}
                        >
                          <td className="py-4 px-6 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-border-sage bg-bg-base text-accent-env focus:ring-0 focus:ring-offset-0"
                            />
                          </td>
                          <td className="py-4 px-6 font-bold text-text-primary group-hover:text-accent-env transition-colors font-display">
                            {goal.name}
                          </td>
                          <td className="py-4 px-6 text-text-secondary font-semibold">
                            {goal.department}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-medium">
                            {goal.targetCO2} t
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-medium">
                            {goal.currentCO2} t
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 h-1.5 bg-bg-base rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${progressFillColor} rounded-full transition-all duration-500`}
                                  style={{ width: `${goal.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] font-extrabold text-text-primary min-w-[28px] text-right font-mono">
                                {goal.progress}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-text-secondary font-mono">
                            {goal.deadline}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusStyle}`}>
                              {goal.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                onClick={() => openGoalModal('view', goal)}
                                className="p-1.5 rounded bg-bg-base/60 hover:bg-bg-base text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              
                              <button 
                                onClick={() => { if (canEdit('environmental')) openGoalModal('edit', goal); }}
                                disabled={!canEdit('environmental')}
                                className={`p-1.5 rounded bg-bg-base/60 transition-colors cursor-pointer ${
                                  !canEdit('environmental') ? 'opacity-30 cursor-not-allowed' : 'hover:bg-accent-env/10 text-text-secondary hover:text-accent-env'
                                }`}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              <button 
                                onClick={() => { if (canEdit('environmental')) triggerDeleteConfirm(goal.id); }}
                                disabled={!canEdit('environmental')}
                                className={`p-1.5 rounded bg-bg-base/60 transition-colors cursor-pointer ${
                                  !canEdit('environmental') ? 'opacity-30 cursor-not-allowed' : 'hover:bg-red-500/10 text-text-secondary hover:text-red-400'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* 2. Emission Factors View */}
        {activeSubTab === 'Emission Factors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Emission Factors</h2>
                <p className="text-xs text-text-secondary mt-1">Review standard greenhouse gas emission factors utilized in footprint accounting.</p>
              </div>
              
              <div>
                <button
                  onClick={() => {
                    if (canEdit('environmental')) {
                      setFactorFormData({ name: '', category: 'Scope 1', factorValue: '', unit: 'kg/kWh', source: '' });
                      setIsFactorModalOpen(true);
                    }
                  }}
                  disabled={!canEdit('environmental')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-env to-emerald-600 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-env/5 ${
                    !canEdit('environmental') ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:brightness-110'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="uppercase tracking-wider">New Factor</span>
                </button>
                {!canEdit('environmental') && (
                  <p className="text-[9px] text-text-secondary/70 mt-1 pl-1 font-bold">Requires Sustainability Team access</p>
                )}
              </div>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Factor Value</th>
                    <th className="py-4 px-6">DataSource</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  {filteredFactors.map(f => (
                    <tr key={f.id} className="hover:bg-bg-base/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-text-primary font-display">{f.name}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${f.category === 'Scope 1' ? 'bg-accent-gam/10 text-accent-gam border border-accent-gam/20' : 'bg-accent-gov/10 text-accent-gov border border-accent-gov/20'}`}>
                          {f.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-accent-env">{f.factorValue} {f.unit}</td>
                      <td className="py-4 px-6 text-text-secondary font-semibold">{f.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Product ESG Profiles View */}
        {activeSubTab === 'Product ESG Profiles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Product ESG Profiles</h2>
                <p className="text-xs text-text-secondary mt-1">Lifecycle greenhouse emissions and circularity analytics mapped per core product.</p>
              </div>
              
              <div>
                <button
                  onClick={() => {
                    if (canEdit('environmental')) {
                      setProfileFormData({ name: '', carbonFootprint: '', recyclability: '', certification: '' });
                      setIsProfileModalOpen(true);
                    }
                  }}
                  disabled={!canEdit('environmental')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-env to-emerald-600 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-env/5 ${
                    !canEdit('environmental') ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:brightness-110'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="uppercase tracking-wider">New Profile</span>
                </button>
                {!canEdit('environmental') && (
                  <p className="text-[9px] text-text-secondary/70 mt-1 pl-1 font-bold">Requires Sustainability Team access</p>
                )}
              </div>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                    <th className="py-4 px-6">Product Name</th>
                    <th className="py-4 px-6">Carbon Footprint</th>
                    <th className="py-4 px-6">Recyclability Rate</th>
                    <th className="py-4 px-6">Certifications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  {filteredProfiles.map(p => (
                    <tr key={p.id} className="hover:bg-bg-base/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-text-primary font-display">{p.name}</td>
                      <td className="py-4 px-6 font-mono font-bold text-red-400">{p.carbonFootprint}</td>
                      <td className="py-4 px-6 font-mono font-semibold text-accent-env">{p.recyclability}</td>
                      <td className="py-4 px-6 text-text-secondary font-semibold">{p.certification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Carbon Transactions View */}
        {activeSubTab === 'Carbon Transactions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Carbon Transactions</h2>
                <p className="text-xs text-text-secondary mt-1">Audit logs of all emissions entries, carbon offsets, and renewable credit purchases.</p>
              </div>
              
              <div>
                <button
                  onClick={() => {
                    if (canEdit('environmental')) {
                      setTxFormData({ desc: '', type: 'Emission', quantity: '', factorId: factors[0]?.id || 1, cost: '', department: 'Manufacturing' });
                      setIsTxModalOpen(true);
                    }
                  }}
                  disabled={!canEdit('environmental')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-env to-emerald-600 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-env/5 ${
                    !canEdit('environmental') ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:brightness-110'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="uppercase tracking-wider">Log Transaction</span>
                </button>
                {!canEdit('environmental') && (
                  <p className="text-[9px] text-text-secondary/70 mt-1 pl-1 font-bold">Requires Sustainability Team access</p>
                )}
              </div>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6 text-right">CO₂ Equivalent</th>
                    <th className="py-4 px-6 text-right">Cost / Equivalent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-bg-base/20 transition-colors">
                      <td className="py-4 px-6 text-text-secondary font-mono">{t.date}</td>
                      <td className="py-4 px-6 font-bold text-text-primary font-display">{t.desc}</td>
                      <td className="py-4 px-6 font-semibold text-text-secondary">{t.department}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${t.type === 'Emission' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-accent-env/10 text-accent-env border border-accent-env/20'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className={`py-4 px-6 text-right font-mono font-bold ${t.amountCO2 > 0 ? 'text-red-400' : 'text-accent-env'}`}>
                        {t.amountCO2 > 0 ? `+${t.amountCO2}` : t.amountCO2} tCO2e
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-medium text-text-secondary">{t.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD/EDIT GOAL MODAL --- */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title={goalModalMode === 'create' ? `Create ${TERMS.goal}` : goalModalMode === 'edit' ? `Edit ${TERMS.goal}` : `View ${TERMS.goal}`}
        confirmText={goalModalMode === 'view' ? "" : goalModalMode === 'create' ? "Create" : "Save Changes"}
        confirmColorClass="bg-accent-env hover:bg-emerald-600 text-bg-base font-bold"
        onConfirm={handleGoalSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Goal Name</label>
            <input
              type="text"
              disabled={goalModalMode === 'view'}
              value={currentGoalData.name}
              onChange={(e) => setCurrentGoalData({ ...currentGoalData, name: e.target.value })}
              placeholder="e.g. Zero Landfill Waste"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Target Department</label>
            <select
              disabled={goalModalMode === 'view'}
              value={currentGoalData.department}
              onChange={(e) => setCurrentGoalData({ ...currentGoalData, department: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env disabled:opacity-60 font-semibold"
            >
              <option>Sales</option>
              <option>Manufacturing</option>
              <option>Logistics</option>
              <option>Corporate</option>
              <option>R&D</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Target CO₂ (t)</label>
              <input
                type="number"
                disabled={goalModalMode === 'view'}
                value={currentGoalData.targetCO2}
                onChange={(e) => setCurrentGoalData({ ...currentGoalData, targetCO2: e.target.value })}
                placeholder="e.g. 100"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Current CO₂ (t)</label>
              <input
                type="number"
                disabled={goalModalMode === 'view'}
                value={currentGoalData.currentCO2}
                onChange={(e) => setCurrentGoalData({ ...currentGoalData, currentCO2: e.target.value })}
                placeholder="e.g. 20"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env disabled:opacity-60"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Deadline Date</label>
            <input
              type="date"
              disabled={goalModalMode === 'view'}
              value={currentGoalData.deadline}
              onChange={(e) => setCurrentGoalData({ ...currentGoalData, deadline: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env disabled:opacity-60"
            />
          </div>
        </div>
      </Modal>

      {/* --- CONFIRM DELETE GOAL MODAL --- */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Confirm Deletion"
        confirmText="Delete Goal"
        confirmColorClass="bg-red-500 hover:bg-red-600 text-white font-bold"
        onConfirm={handleConfirmDelete}
      >
        <p className="text-xs text-text-primary">Are you sure you want to delete this goal? This operation cannot be undone.</p>
      </Modal>

      {/* --- SUB-TAB ADD MODALS --- */}
      {/* 1. Emission Factor Modal */}
      <Modal
        isOpen={isFactorModalOpen}
        onClose={() => setIsFactorModalOpen(false)}
        title="New Emission Factor"
        confirmText="Add Factor"
        confirmColorClass="bg-accent-env hover:bg-emerald-600 text-bg-base font-bold"
        onConfirm={handleFactorSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Factor Name</label>
            <input
              type="text"
              value={factorFormData.name}
              onChange={(e) => setFactorFormData({ ...factorFormData, name: e.target.value })}
              placeholder="e.g. Coal power plant coefficient"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Category</label>
            <select
              value={factorFormData.category}
              onChange={(e) => setFactorFormData({ ...factorFormData, category: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
            >
              <option>Scope 1</option>
              <option>Scope 2</option>
              <option>Scope 3</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Value (Multiplier)</label>
              <input
                type="number"
                step="0.01"
                value={factorFormData.factorValue}
                onChange={(e) => setFactorFormData({ ...factorFormData, factorValue: e.target.value })}
                placeholder="e.g. 0.38"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Unit</label>
              <input
                type="text"
                value={factorFormData.unit}
                onChange={(e) => setFactorFormData({ ...factorFormData, unit: e.target.value })}
                placeholder="e.g. kg/kWh"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Data Source</label>
            <input
              type="text"
              value={factorFormData.source}
              onChange={(e) => setFactorFormData({ ...factorFormData, source: e.target.value })}
              placeholder="e.g. EPA 2025"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
            />
          </div>
        </div>
      </Modal>

      {/* 2. Product Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="New Product ESG Profile"
        confirmText="Create Profile"
        confirmColorClass="bg-accent-env hover:bg-emerald-600 text-bg-base font-bold"
        onConfirm={handleProfileSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Product Name</label>
            <input
              type="text"
              value={profileFormData.name}
              onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
              placeholder="e.g. EcoMonitor Lite"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Footprint (kg CO2e)</label>
            <input
              type="text"
              value={profileFormData.carbonFootprint}
              onChange={(e) => setProfileFormData({ ...profileFormData, carbonFootprint: e.target.value })}
              placeholder="e.g. 5.6"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Recyclability Rate</label>
            <input
              type="text"
              value={profileFormData.recyclability}
              onChange={(e) => setProfileFormData({ ...profileFormData, recyclability: e.target.value })}
              placeholder="e.g. 85%"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Certifications</label>
            <input
              type="text"
              value={profileFormData.certification}
              onChange={(e) => setProfileFormData({ ...profileFormData, certification: e.target.value })}
              placeholder="e.g. EPEAT Gold"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
            />
          </div>
        </div>
      </Modal>

      {/* 3. Transaction Modal */}
      <Modal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title="Log Carbon Transaction"
        confirmText="Log Transaction"
        confirmColorClass="bg-accent-env hover:bg-emerald-600 text-bg-base font-bold"
        onConfirm={handleTxSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Description</label>
            <input
              type="text"
              value={txFormData.desc}
              onChange={(e) => setTxFormData({ ...txFormData, desc: e.target.value })}
              placeholder="e.g. Q3 Fleet Offsets"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Department</label>
            <select
              value={txFormData.department}
              onChange={(e) => setTxFormData({ ...txFormData, department: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
            >
              <option>Sales</option>
              <option>Manufacturing</option>
              <option>Logistics</option>
              <option>Corporate</option>
              <option>R&D</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Transaction Type</label>
            <select
              value={txFormData.type}
              onChange={(e) => setTxFormData({ ...txFormData, type: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
            >
              <option>Emission</option>
              <option>Credit</option>
              <option>Offset</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Emission Factor Reference</label>
            <select
              value={txFormData.factorId}
              onChange={(e) => setTxFormData({ ...txFormData, factorId: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
            >
              {factors.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.factorValue} {f.unit})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Quantity consumed</label>
            <input
              type="number"
              value={txFormData.quantity}
              onChange={(e) => setTxFormData({ ...txFormData, quantity: e.target.value })}
              placeholder="e.g. 1500"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Cost / Value Equivalent</label>
            <input
              type="text"
              value={txFormData.cost}
              onChange={(e) => setTxFormData({ ...txFormData, cost: e.target.value })}
              placeholder="e.g. $2,800"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
