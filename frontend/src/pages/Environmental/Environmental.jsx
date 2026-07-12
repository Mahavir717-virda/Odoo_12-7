import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { TERMS } from '../../constants/terminology';
import {
  goalService,
  emissionFactorService,
  productProfileService,
  carbonTransactionService,
  dropdownService,
} from '../../services/api';
import Modal from '../../components/Modal';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Download, 
  ChevronDown, 
  Search, 
  Eye,
  Lock,
  Loader2
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

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Data states — initialized empty, filled from API
  const [goals, setGoals] = useState([]);
  const [factors, setFactors] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Dropdown data from backend
  const [departments, setDepartments] = useState([]);
  const [ddCategories, setDdCategories] = useState([]);
  const [ddEmissionFactors, setDdEmissionFactors] = useState([]);
  const [ddProducts, setDdProducts] = useState([]);

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

  // ─── Fetch backend data ───────────────────────────────────
  const fetchGoals = useCallback(async () => {
    try {
      const data = await goalService.getAll();
      // Map backend fields → frontend display fields
      const mapped = data.map(g => ({
        id: g._id,
        name: g.title,
        department: g.department?.name || '—',
        departmentId: g.department?._id || g.department,
        targetCO2: g.targetValue,
        currentCO2: g.currentValue || 0,
        progress: g.progressPercentage || 0,
        deadline: g.targetDate ? g.targetDate.split('T')[0] : '',
        status: g.status,
        goalCode: g.goalCode,
        goalType: g.goalType,
        baselineValue: g.baselineValue,
        startDate: g.startDate ? g.startDate.split('T')[0] : '',
        unit: g.unit,
        priority: g.priority,
        autoTrack: g.autoTrack,
        achievementStatus: g.achievementStatus,
      }));
      setGoals(mapped);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    }
  }, []);

  const fetchFactors = useCallback(async () => {
    try {
      const data = await emissionFactorService.getAll();
      const mapped = data.map(f => ({
        id: f._id,
        name: f.name,
        code: f.code,
        category: f.category?.name || f.sourceType || '—',
        factorValue: f.emissionValue,
        unit: f.unit,
        co2Unit: f.co2Unit,
        source: f.description || '—',
        sourceType: f.sourceType,
      }));
      setFactors(mapped);
    } catch (err) {
      console.error('Failed to fetch emission factors:', err);
    }
  }, []);

  const fetchProfiles = useCallback(async () => {
    try {
      const data = await productProfileService.getAll();
      const mapped = data.map(p => ({
        id: p._id,
        name: p.productName,
        productCode: p.productCode,
        carbonFootprint: p.emissionFactor?.emissionValue
          ? `${(p.emissionFactor.emissionValue * (p.productWeight || 1)).toFixed(2)} ${p.emissionFactor.co2Unit || 'kgCO2e'}`
          : '—',
        recyclability: `${p.recyclabilityPercentage || 0}%`,
        certification: p.carbonNeutralCertificate || (p.isCarbonNeutral ? 'Carbon Neutral' : 'None'),
        materialType: p.materialType,
        productType: p.productType,
      }));
      setProfiles(mapped);
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await carbonTransactionService.getAll();
      const mapped = data.map(t => ({
        id: t._id,
        date: t.transactionDate ? t.transactionDate.split('T')[0] : '',
        desc: t.remarks || t.activityReference || '—',
        department: t.department?.name || '—',
        departmentId: t.department?._id || t.department,
        type: t.activityType,
        amountCO2: t.calculatedEmission || 0,
        cost: '—',
        quantity: t.quantity,
        unit: t.unit,
        factorValue: t.emissionFactorValue,
        transactionNumber: t.transactionNumber,
      }));
      setTransactions(mapped);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  }, []);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [depts, cats, efs, prods] = await Promise.all([
        dropdownService.getDepartments(),
        dropdownService.getCategories(),
        dropdownService.getEmissionFactors(),
        dropdownService.getProducts(),
      ]);
      setDepartments(depts);
      setDdCategories(cats);
      setDdEmissionFactors(efs);
      setDdProducts(prods);
    } catch (err) {
      console.error('Failed to fetch dropdowns:', err);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchGoals(),
        fetchFactors(),
        fetchProfiles(),
        fetchTransactions(),
        fetchDropdowns(),
      ]);
      setIsLoading(false);
    };
    loadAll();
  }, [fetchGoals, fetchFactors, fetchProfiles, fetchTransactions, fetchDropdowns]);

  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchGoals(),
      fetchFactors(),
      fetchProfiles(),
      fetchTransactions(),
      fetchDropdowns(),
    ]);
    setIsLoading(false);
  };

  // Goal modal states
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalModalMode, setGoalModalMode] = useState('create');
  const [currentGoalData, setCurrentGoalData] = useState({
    id: null, name: '', department: '', targetCO2: '', currentCO2: '', deadline: '',
    goalCode: '', goalType: 'CARBON_REDUCTION', baselineValue: '0', startDate: '',
    unit: 'tCO2e', priority: 'MEDIUM', autoTrack: false,
  });

  // Factor modal states
  const [isFactorModalOpen, setIsFactorModalOpen] = useState(false);
  const [factorFormData, setFactorFormData] = useState({ name: '', code: '', category: '', sourceType: 'ENERGY', emissionValue: '', unit: 'KWH', co2Unit: 'kgCO2e', dataSource: '', effectiveFrom: '', country: 'US', region: 'GLOBAL' });

  // Profile modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    productName: '', productCode: '', department: '', category: '', emissionFactor: '',
    materialType: 'MIXED', productType: 'FINISHED_PRODUCT', lifecycleStage: 'MANUFACTURING',
    recyclabilityPercentage: '', recycledContentPercentage: '0', packagingWeight: '0',
    productWeight: '', weightUnit: 'KG', countryOfOrigin: '', manufacturer: '', supplier: '',
    estimatedLifeYears: '1',
  });

  // Carbon Transaction modal states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txFormData, setTxFormData] = useState({
    department: '', productESGProfile: '', activityType: 'ENERGY',
    quantity: '', unit: 'KWH', transactionDate: '', remarks: '',
  });

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
        department: goal.departmentId || '',
        targetCO2: goal.targetCO2,
        currentCO2: goal.currentCO2,
        deadline: goal.deadline,
        goalCode: goal.goalCode || '',
        goalType: goal.goalType || 'CARBON_REDUCTION',
        baselineValue: goal.baselineValue || '0',
        startDate: goal.startDate || '',
        unit: goal.unit || 'tCO2e',
        priority: goal.priority || 'MEDIUM',
        autoTrack: goal.autoTrack || false,
      });
    } else {
      setCurrentGoalData({
        id: null, name: '', department: departments[0]?.id || '',
        targetCO2: '', currentCO2: '0', deadline: '',
        goalCode: '', goalType: 'CARBON_REDUCTION', baselineValue: '0',
        startDate: new Date().toISOString().split('T')[0],
        unit: 'tCO2e', priority: 'MEDIUM', autoTrack: false,
      });
    }
    setIsGoalModalOpen(true);
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    if (!currentGoalData.name || !currentGoalData.targetCO2 || !currentGoalData.deadline) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    try {
      if (goalModalMode === 'create') {
        const payload = {
          goalCode: currentGoalData.goalCode || `GOAL-${Date.now()}`,
          title: currentGoalData.name,
          department: currentGoalData.department || undefined,
          goalType: currentGoalData.goalType,
          baselineValue: parseFloat(currentGoalData.baselineValue) || 0,
          targetValue: parseFloat(currentGoalData.targetCO2),
          currentValue: parseFloat(currentGoalData.currentCO2) || 0,
          unit: currentGoalData.unit || 'tCO2e',
          startDate: currentGoalData.startDate || new Date().toISOString(),
          targetDate: currentGoalData.deadline,
          priority: currentGoalData.priority || 'MEDIUM',
          status: 'ACTIVE',
          autoTrack: currentGoalData.autoTrack || false,
        };
        await goalService.create(payload);
        createNotification('all', 'success', `New goal created: ${currentGoalData.name}`);
        showToast("Goal created successfully!", "success");
      } else {
        const payload = {
          title: currentGoalData.name,
          department: currentGoalData.department || undefined,
          targetValue: parseFloat(currentGoalData.targetCO2),
          currentValue: parseFloat(currentGoalData.currentCO2) || 0,
          targetDate: currentGoalData.deadline,
          priority: currentGoalData.priority,
        };
        await goalService.update(currentGoalData.id, payload);
        showToast("Goal updated successfully!", "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to save goal.", "error");
      return;
    }

    setIsGoalModalOpen(false);
    await refreshData();
  };

  const triggerDeleteConfirm = (id) => {
    setGoalToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await goalService.delete(goalToDelete);
      showToast("Goal deleted successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to delete goal.", "error");
    }
    setIsDeleteConfirmOpen(false);
    await refreshData();
  };

  // Handlers for Emission Factors
  const handleFactorSubmit = async (e) => {
    e.preventDefault();
    if (!factorFormData.name || !factorFormData.emissionValue) {
      showToast("Please fill in factor name and value.", "error");
      return;
    }

    try {
      const payload = {
        name: factorFormData.name,
        code: factorFormData.code || `EF-${Date.now()}`,
        category: factorFormData.category || ddCategories[0]?.id,
        sourceType: factorFormData.sourceType,
        emissionValue: parseFloat(factorFormData.emissionValue),
        unit: factorFormData.unit,
        co2Unit: factorFormData.co2Unit || 'kgCO2e',
        description: factorFormData.dataSource || 'User Entered',
        effectiveFrom: factorFormData.effectiveFrom || new Date().toISOString(),
        country: factorFormData.country || 'US',
        region: factorFormData.region || 'GLOBAL',
      };
      await emissionFactorService.create(payload);
      showToast("Emission factor created successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to create emission factor.", "error");
      return;
    }

    setIsFactorModalOpen(false);
    await refreshData();
  };

  // Handlers for Product ESG Profiles
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileFormData.productName || !profileFormData.productWeight) {
      showToast("Please fill in product name and weight.", "error");
      return;
    }

    try {
      const payload = {
        productName: profileFormData.productName,
        productCode: profileFormData.productCode || `PROD-${Date.now()}`,
        department: profileFormData.department || departments[0]?.id,
        category: profileFormData.category || ddCategories[0]?.id,
        emissionFactor: profileFormData.emissionFactor || ddEmissionFactors[0]?.id,
        materialType: profileFormData.materialType,
        productType: profileFormData.productType,
        lifecycleStage: profileFormData.lifecycleStage,
        recyclabilityPercentage: parseFloat(profileFormData.recyclabilityPercentage) || 0,
        recycledContentPercentage: parseFloat(profileFormData.recycledContentPercentage) || 0,
        packagingWeight: parseFloat(profileFormData.packagingWeight) || 0,
        productWeight: parseFloat(profileFormData.productWeight),
        weightUnit: profileFormData.weightUnit,
        countryOfOrigin: profileFormData.countryOfOrigin || 'IN',
        manufacturer: profileFormData.manufacturer || 'Internal',
        supplier: profileFormData.supplier || 'Internal',
        estimatedLifeYears: parseInt(profileFormData.estimatedLifeYears) || 1,
      };
      await productProfileService.create(payload);
      showToast("Product Profile created successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to create product profile.", "error");
      return;
    }

    setIsProfileModalOpen(false);
    await refreshData();
  };

  // Handlers for Carbon Transactions
  const handleTxSubmit = async (e) => {
    e.preventDefault();
    if (!txFormData.remarks || !txFormData.quantity) {
      showToast("Please fill in all transaction fields.", "error");
      return;
    }

    try {
      const payload = {
        department: txFormData.department || departments[0]?.id,
        productESGProfile: txFormData.productESGProfile || ddProducts[0]?.id,
        activityType: txFormData.activityType,
        quantity: parseFloat(txFormData.quantity),
        unit: txFormData.unit,
        transactionDate: txFormData.transactionDate || new Date().toISOString(),
        remarks: txFormData.remarks,
      };
      await carbonTransactionService.create(payload);
      showToast("Carbon Transaction logged successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to log transaction.", "error");
      return;
    }

    setIsTxModalOpen(false);
    await refreshData();
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

      {/* LOADING INDICATOR */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-accent-env animate-spin" />
          <span className="ml-2 text-xs text-text-secondary font-bold">Loading data from server...</span>
        </div>
      )}

      {/* RENDER VIEWS BASED ON SUB-NAV */}
      {!isLoading && (
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
                    {filteredGoals.length === 0 && (
                      <tr><td colSpan="9" className="py-8 text-center text-text-secondary font-semibold">No sustainability goals found. Create one to get started.</td></tr>
                    )}
                    {filteredGoals.map((goal) => {
                      let statusStyle = "";
                      if (goal.status === "ACTIVE") {
                        statusStyle = "bg-accent-soc/10 text-accent-soc border border-accent-soc/20";
                      } else if (goal.status === "COMPLETED") {
                        statusStyle = "bg-accent-env/10 text-accent-env border border-accent-env/20";
                      } else if (goal.status === "DRAFT") {
                        statusStyle = "bg-accent-gam/10 text-accent-gam border border-accent-gam/20";
                      } else {
                        statusStyle = "bg-accent-gov/10 text-accent-gov border border-accent-gov/20";
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
                      setFactorFormData({ name: '', code: '', category: ddCategories[0]?.id || '', sourceType: 'ENERGY', emissionValue: '', unit: 'KWH', co2Unit: 'kgCO2e', dataSource: '', effectiveFrom: new Date().toISOString().split('T')[0], country: 'US', region: 'GLOBAL' });
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
                  {filteredFactors.length === 0 && (
                    <tr><td colSpan="4" className="py-8 text-center text-text-secondary font-semibold">No emission factors found.</td></tr>
                  )}
                  {filteredFactors.map(f => (
                    <tr key={f.id} className="hover:bg-bg-base/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-text-primary font-display">{f.name}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${f.sourceType === 'ENERGY' || f.category?.includes?.('Scope 2') ? 'bg-accent-gov/10 text-accent-gov border border-accent-gov/20' : 'bg-accent-gam/10 text-accent-gam border border-accent-gam/20'}`}>
                          {f.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-accent-env">{f.factorValue} {f.co2Unit || f.unit}</td>
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
                      setProfileFormData({
                        productName: '', productCode: '', department: departments[0]?.id || '',
                        category: ddCategories[0]?.id || '', emissionFactor: ddEmissionFactors[0]?.id || '',
                        materialType: 'MIXED', productType: 'FINISHED_PRODUCT', lifecycleStage: 'MANUFACTURING',
                        recyclabilityPercentage: '', recycledContentPercentage: '0', packagingWeight: '0',
                        productWeight: '', weightUnit: 'KG', countryOfOrigin: '', manufacturer: '', supplier: '',
                        estimatedLifeYears: '1',
                      });
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
                  {filteredProfiles.length === 0 && (
                    <tr><td colSpan="4" className="py-8 text-center text-text-secondary font-semibold">No product profiles found.</td></tr>
                  )}
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
                      setTxFormData({
                        department: departments[0]?.id || '', productESGProfile: ddProducts[0]?.id || '',
                        activityType: 'ENERGY', quantity: '', unit: 'KWH',
                        transactionDate: new Date().toISOString().split('T')[0], remarks: '',
                      });
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
                    <th className="py-4 px-6 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  {filteredTransactions.length === 0 && (
                    <tr><td colSpan="6" className="py-8 text-center text-text-secondary font-semibold">No carbon transactions found.</td></tr>
                  )}
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-bg-base/20 transition-colors">
                      <td className="py-4 px-6 text-text-secondary font-mono">{t.date}</td>
                      <td className="py-4 px-6 font-bold text-text-primary font-display">{t.desc}</td>
                      <td className="py-4 px-6 font-semibold text-text-secondary">{t.department}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${t.type === 'MANUAL' || t.type === 'FLEET' || t.type === 'MANUFACTURING' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-accent-env/10 text-accent-env border border-accent-env/20'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className={`py-4 px-6 text-right font-mono font-bold ${t.amountCO2 > 0 ? 'text-red-400' : 'text-accent-env'}`}>
                        {t.amountCO2 > 0 ? `+${t.amountCO2.toFixed(4)}` : t.amountCO2.toFixed(4)} tCO2e
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-medium text-text-secondary">{t.quantity} {t.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      )}

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
          {goalModalMode === 'create' && (
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Goal Code</label>
              <input
                type="text"
                value={currentGoalData.goalCode}
                onChange={(e) => setCurrentGoalData({ ...currentGoalData, goalCode: e.target.value })}
                placeholder="e.g. GOAL-ENV-01"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Target Department</label>
            <select
              disabled={goalModalMode === 'view'}
              value={currentGoalData.department}
              onChange={(e) => setCurrentGoalData({ ...currentGoalData, department: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env disabled:opacity-60 font-semibold"
            >
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Goal Type</label>
              <select
                disabled={goalModalMode === 'view'}
                value={currentGoalData.goalType}
                onChange={(e) => setCurrentGoalData({ ...currentGoalData, goalType: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env disabled:opacity-60"
              >
                {['CARBON_REDUCTION','ENERGY_REDUCTION','WASTE_REDUCTION','WATER_SAVING','RECYCLING','GENERAL'].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Priority</label>
              <select
                disabled={goalModalMode === 'view'}
                value={currentGoalData.priority}
                onChange={(e) => setCurrentGoalData({ ...currentGoalData, priority: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env disabled:opacity-60"
              >
                {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
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
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Baseline Value</label>
              <input
                type="number"
                disabled={goalModalMode === 'view'}
                value={currentGoalData.baselineValue}
                onChange={(e) => setCurrentGoalData({ ...currentGoalData, baselineValue: e.target.value })}
                placeholder="e.g. 500"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env disabled:opacity-60"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Start Date</label>
              <input
                type="date"
                disabled={goalModalMode === 'view'}
                value={currentGoalData.startDate}
                onChange={(e) => setCurrentGoalData({ ...currentGoalData, startDate: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Target Date (Deadline)</label>
              <input
                type="date"
                disabled={goalModalMode === 'view'}
                value={currentGoalData.deadline}
                onChange={(e) => setCurrentGoalData({ ...currentGoalData, deadline: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env disabled:opacity-60"
              />
            </div>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Code</label>
              <input
                type="text"
                value={factorFormData.code}
                onChange={(e) => setFactorFormData({ ...factorFormData, code: e.target.value })}
                placeholder="e.g. EF-COAL-01"
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
                <option value="">Select Category</option>
                {ddCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Source Type</label>
            <select
              value={factorFormData.sourceType}
              onChange={(e) => setFactorFormData({ ...factorFormData, sourceType: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
            >
              {['PURCHASE','MANUFACTURING','FLEET','EXPENSE','ENERGY','TRANSPORT','GENERAL'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Emission Value</label>
              <input
                type="number"
                step="0.0001"
                value={factorFormData.emissionValue}
                onChange={(e) => setFactorFormData({ ...factorFormData, emissionValue: e.target.value })}
                placeholder="e.g. 0.38"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Unit</label>
              <select
                value={factorFormData.unit}
                onChange={(e) => setFactorFormData({ ...factorFormData, unit: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
              >
                {['LITER','KG','TON','KM','KWH','M3','UNIT'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Data Source</label>
            <input
              type="text"
              value={factorFormData.dataSource}
              onChange={(e) => setFactorFormData({ ...factorFormData, dataSource: e.target.value })}
              placeholder="e.g. EPA 2025"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Country</label>
              <input
                type="text"
                value={factorFormData.country}
                onChange={(e) => setFactorFormData({ ...factorFormData, country: e.target.value })}
                placeholder="e.g. US"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Region</label>
              <input
                type="text"
                value={factorFormData.region}
                onChange={(e) => setFactorFormData({ ...factorFormData, region: e.target.value })}
                placeholder="e.g. GLOBAL"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
              />
            </div>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Product Name</label>
              <input
                type="text"
                value={profileFormData.productName}
                onChange={(e) => setProfileFormData({ ...profileFormData, productName: e.target.value })}
                placeholder="e.g. EcoMonitor Lite"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Product Code</label>
              <input
                type="text"
                value={profileFormData.productCode}
                onChange={(e) => setProfileFormData({ ...profileFormData, productCode: e.target.value })}
                placeholder="e.g. PROD-ECO-01"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Department</label>
              <select
                value={profileFormData.department}
                onChange={(e) => setProfileFormData({ ...profileFormData, department: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Category</label>
              <select
                value={profileFormData.category}
                onChange={(e) => setProfileFormData({ ...profileFormData, category: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
              >
                <option value="">Select Category</option>
                {ddCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Emission Factor</label>
            <select
              value={profileFormData.emissionFactor}
              onChange={(e) => setProfileFormData({ ...profileFormData, emissionFactor: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
            >
              <option value="">Select Emission Factor</option>
              {ddEmissionFactors.map(ef => (
                <option key={ef.id} value={ef.id}>{ef.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Material</label>
              <select
                value={profileFormData.materialType}
                onChange={(e) => setProfileFormData({ ...profileFormData, materialType: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
              >
                {['PLASTIC','METAL','WOOD','GLASS','PAPER','TEXTILE','CHEMICAL','MIXED','OTHER'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Product Type</label>
              <select
                value={profileFormData.productType}
                onChange={(e) => setProfileFormData({ ...profileFormData, productType: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
              >
                {['RAW_MATERIAL','FINISHED_PRODUCT','SEMI_FINISHED','SERVICE','PACKAGING'].map(pt => (
                  <option key={pt} value={pt}>{pt.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Lifecycle</label>
              <select
                value={profileFormData.lifecycleStage}
                onChange={(e) => setProfileFormData({ ...profileFormData, lifecycleStage: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
              >
                {['RAW','MANUFACTURING','TRANSPORT','WAREHOUSE','USE','RECYCLE','DISPOSAL'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Product Weight</label>
              <input
                type="number"
                step="0.01"
                value={profileFormData.productWeight}
                onChange={(e) => setProfileFormData({ ...profileFormData, productWeight: e.target.value })}
                placeholder="e.g. 5.6"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Recyclability %</label>
              <input
                type="number"
                min="0" max="100"
                value={profileFormData.recyclabilityPercentage}
                onChange={(e) => setProfileFormData({ ...profileFormData, recyclabilityPercentage: e.target.value })}
                placeholder="e.g. 85"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Country of Origin</label>
              <input
                type="text"
                value={profileFormData.countryOfOrigin}
                onChange={(e) => setProfileFormData({ ...profileFormData, countryOfOrigin: e.target.value })}
                placeholder="e.g. IN, US"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Manufacturer</label>
              <input
                type="text"
                value={profileFormData.manufacturer}
                onChange={(e) => setProfileFormData({ ...profileFormData, manufacturer: e.target.value })}
                placeholder="e.g. EcoTech Corp"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Supplier</label>
            <input
              type="text"
              value={profileFormData.supplier}
              onChange={(e) => setProfileFormData({ ...profileFormData, supplier: e.target.value })}
              placeholder="e.g. Green Supply Co."
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
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Description / Remarks</label>
            <input
              type="text"
              value={txFormData.remarks}
              onChange={(e) => setTxFormData({ ...txFormData, remarks: e.target.value })}
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
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Product ESG Profile</label>
            <select
              value={txFormData.productESGProfile}
              onChange={(e) => setTxFormData({ ...txFormData, productESGProfile: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
            >
              <option value="">Select Product</option>
              {ddProducts.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Activity Type</label>
            <select
              value={txFormData.activityType}
              onChange={(e) => setTxFormData({ ...txFormData, activityType: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
            >
              {['PURCHASE','MANUFACTURING','FLEET','EXPENSE','ENERGY','TRANSPORT','MANUAL'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Quantity</label>
              <input
                type="number"
                value={txFormData.quantity}
                onChange={(e) => setTxFormData({ ...txFormData, quantity: e.target.value })}
                placeholder="e.g. 1500"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Unit</label>
              <select
                value={txFormData.unit}
                onChange={(e) => setTxFormData({ ...txFormData, unit: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
              >
                {['LITER','KG','TON','KM','KWH','M3','UNIT'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Transaction Date</label>
            <input
              type="date"
              value={txFormData.transactionDate}
              onChange={(e) => setTxFormData({ ...txFormData, transactionDate: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
