import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Download, 
  ChevronDown, 
  Search, 
  Eye
} from 'lucide-react';

export default function Environmental() {
  const location = useLocation();
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('Environmental Goals');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredAction, setHoveredAction] = useState(null); 

  // Selection states (for top-level Edit/Delete)
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  // Export dropdown state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    if (location.state?.activeSubTab) {
      setActiveSubTab(location.state.activeSubTab);
    }
  }, [location.state]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- STATEFUL DATA SEEDS ---

  // 1. Environmental Goals
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: "Reduce Fleet Emissions",
      department: "Logistics",
      targetCo2: "500 t",
      currentCo2: "390 t",
      progress: 78,
      deadline: "2026-12-31",
      status: "Active",
    },
    {
      id: 2,
      name: "Cut Packaging Waste",
      department: "Manufacturing",
      targetCo2: "120 t",
      currentCo2: "98 t",
      progress: 82,
      deadline: "2026-09-30",
      status: "On Track",
    },
    {
      id: 3,
      name: "Office Energy Cut",
      department: "Corporate",
      targetCo2: "80 t",
      currentCo2: "80 t",
      progress: 100,
      deadline: "2026-06-30",
      status: "Completed",
    }
  ]);

  // 2. Emission Factors
  const [factors, setFactors] = useState([
    { id: 1, name: "Electricity Grid (US)", category: "Scope 2", value: "0.38 kg/kWh", source: "EPA 2024" },
    { id: 2, name: "Natural Gas Combustion", category: "Scope 1", value: "2.03 kg/m³", source: "GHG Protocol" },
    { id: 3, name: "Diesel Truck Logistics", category: "Scope 1", value: "2.68 kg/L", source: "DEFRA 2023" }
  ]);

  // 3. Product ESG Profiles
  const [profiles, setProfiles] = useState([
    { id: 1, name: "EcoSmart Hub 2.0", carbonFootprint: "12.4 kg CO2e", recyclability: "92%", certification: "Energy Star" },
    { id: 2, name: "EcoPack Box XL", carbonFootprint: "0.85 kg CO2e", recyclability: "100%", certification: "FSC Certified" },
    { id: 3, name: "Classic Charger Pro", carbonFootprint: "8.9 kg CO2e", recyclability: "45%", certification: "CE / RoHS" }
  ]);

  // 4. Carbon Transactions
  const [transactions, setTransactions] = useState([
    { id: 1, date: "2026-07-10", desc: "Offset Purchase - Gold Standard", type: "Credit", amount: "-100 tCO2e", cost: "$1,200" },
    { id: 2, date: "2026-07-08", desc: "Q2 Logistics Fleet Fuel Usage", type: "Emission", amount: "+450 tCO2e", cost: "$5,400 equivalents" },
    { id: 3, date: "2026-07-01", desc: "Solar Array Power Generation", type: "Offset", amount: "-45 tCO2e", cost: "$0" }
  ]);

  // --- MODALS FORM STATE ---
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalModalMode, setGoalModalMode] = useState('create'); 
  const [currentGoalData, setCurrentGoalData] = useState({ name: '', department: 'Logistics', targetCo2Input: '', currentCo2Input: '', deadline: '' });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [isFactorModalOpen, setIsFactorModalOpen] = useState(false);
  const [factorFormData, setFactorFormData] = useState({ name: '', category: 'Scope 1', value: '', source: '' });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ name: '', carbonFootprint: '', recyclability: '', certification: '' });

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txFormData, setTxFormData] = useState({ desc: '', type: 'Emission', amount: '', cost: '' });

  // --- ACTIONS HANDLERS ---

  // Export
  const triggerExport = (format) => {
    showToast(`Generating ${format} report export...`, "info");
    setTimeout(() => {
      showToast(`Exported successfully as ${format}!`, "success");
      setIsExportOpen(false);
    }, 1000);
  };

  // Open Goal Modal
  const openGoalModal = (mode, goalObj = null) => {
    setGoalModalMode(mode);
    if (goalObj) {
      setCurrentGoalData({
        id: goalObj.id,
        name: goalObj.name,
        department: goalObj.department,
        targetCo2Input: goalObj.targetCo2.replace(' t', ''),
        currentCo2Input: goalObj.currentCo2.replace(' t', ''),
        deadline: goalObj.deadline
      });
    } else {
      setCurrentGoalData({ name: '', department: 'Logistics', targetCo2Input: '', currentCo2Input: '0', deadline: '' });
    }
    setIsGoalModalOpen(true);
  };

  // Goal Submit
  const handleGoalSubmit = (e) => {
    e.preventDefault();
    if (!currentGoalData.name || !currentGoalData.targetCo2Input || !currentGoalData.deadline) {
      showToast("Please fill in name, target CO2, and deadline.", "error");
      return;
    }

    if (goalModalMode === 'create') {
      const newGoal = {
        id: Date.now(),
        name: currentGoalData.name,
        department: currentGoalData.department,
        targetCo2: `${currentGoalData.targetCo2Input} t`,
        currentCo2: `0 t`,
        progress: 0,
        deadline: currentGoalData.deadline,
        status: "Active"
      };
      setGoals([...goals, newGoal]);
      showToast("Environmental Goal created!", "success");
    } else if (goalModalMode === 'edit') {
      const t = parseFloat(currentGoalData.targetCo2Input) || 1;
      const c = parseFloat(currentGoalData.currentCo2Input) || 0;
      const prog = Math.min(Math.round((c / t) * 100), 100);

      setGoals(goals.map(g => g.id === currentGoalData.id ? {
        ...g,
        name: currentGoalData.name,
        department: currentGoalData.department,
        targetCo2: `${currentGoalData.targetCo2Input} t`,
        currentCo2: `${currentGoalData.currentCo2Input} t`,
        progress: prog,
        deadline: currentGoalData.deadline,
        status: prog >= 100 ? "Completed" : prog > 80 ? "On Track" : "Active"
      } : g));
      showToast("Goal updated successfully!", "success");
    }
    setIsGoalModalOpen(false);
  };

  // Delete Trigger
  const triggerDeleteConfirm = (id) => {
    setDeleteTargetId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setGoals(goals.filter(g => g.id !== deleteTargetId));
    showToast("Goal deleted successfully.", "success");
    setSelectedGoalId(null);
    setIsDeleteConfirmOpen(false);
  };

  // Factor Submit
  const handleFactorSubmit = (e) => {
    e.preventDefault();
    if (!factorFormData.name || !factorFormData.value) {
      showToast("Please fill in factor name and value.", "error");
      return;
    }
    const newFactor = {
      id: Date.now(),
      ...factorFormData
    };
    setFactors([...factors, newFactor]);
    showToast("Emission Factor registered!", "success");
    setIsFactorModalOpen(false);
  };

  // Profile Submit
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileFormData.name || !profileFormData.carbonFootprint) {
      showToast("Please fill in product name and carbon footprint.", "error");
      return;
    }
    const newProfile = {
      id: Date.now(),
      ...profileFormData
    };
    setProfiles([...profiles, newProfile]);
    showToast("Product ESG Profile created!", "success");
    setIsProfileModalOpen(false);
  };

  // Tx Submit
  const handleTxSubmit = (e) => {
    e.preventDefault();
    if (!txFormData.desc || !txFormData.amount) {
      showToast("Please fill in transaction description and amount.", "error");
      return;
    }
    const newTx = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...txFormData
    };
    setTransactions([newTx, ...transactions]);
    showToast("Carbon Transaction logged!", "success");
    setIsTxModalOpen(false);
  };

  const subTabs = ['Emission Factors', 'Product ESG Profiles', 'Carbon Transactions', 'Environmental Goals'];

  // Filter based on search query
  const filteredGoals = goals.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.department.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFactors = factors.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.category.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredProfiles = profiles.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredTransactions = transactions.filter(t => t.desc.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col min-w-0 overflow-y-auto bg-bg-base flex-1">
      {/* SUB-NAV ROW */}
      <div className="bg-bg-card/10 border-b border-border-sage px-6 py-4">
        <div className="flex flex-wrap gap-3">
          {subTabs.map((subSection) => {
            const isActive = subSection === activeSubTab;
            return (
              <button
                key={subSection}
                onClick={() => {
                  setActiveSubTab(subSection);
                  setSelectedGoalId(null);
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-accent-env text-bg-base shadow-md shadow-accent-env/10 font-bold' 
                    : 'bg-bg-card border border-border-sage text-text-secondary hover:text-text-primary hover:border-text-secondary'
                }`}
              >
                {subSection}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN MODULE CONTENT */}
      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto flex-1">
        {activeSubTab === 'Environmental Goals' && (
          <>
            {/* HEADER SECTION */}
            <div>
              <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Environmental Goals</h2>
              <p className="text-xs text-text-secondary mt-1 font-medium">Set, track, and manage departmental carbon reduction goals and progress benchmarks.</p>
            </div>

            {/* ACTION BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-bg-card border border-border-sage rounded-2xl">
              <div className="flex flex-wrap gap-2.5">
                <button 
                  onClick={() => openGoalModal('create')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-env to-emerald-600 hover:brightness-110 text-bg-base font-extrabold text-xs rounded-lg transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-accent-env/5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="uppercase tracking-wider">New Goal</span>
                </button>

                <button 
                  disabled={!selectedGoalId}
                  onClick={() => {
                    const g = goals.find(x => x.id === selectedGoalId);
                    if (g) openGoalModal('edit', g);
                  }}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-border-sage hover:border-text-secondary hover:bg-bg-base/40 text-text-primary font-bold text-xs rounded-lg transition-all active:scale-[0.98] ${!selectedGoalId ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">Edit</span>
                </button>

                <button 
                  disabled={!selectedGoalId}
                  onClick={() => {
                    if (selectedGoalId) triggerDeleteConfirm(selectedGoalId);
                  }}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-red-900/50 hover:border-red-700 hover:bg-red-950/20 text-red-400 font-bold text-xs rounded-lg transition-all active:scale-[0.98] ${!selectedGoalId ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">Delete</span>
                </button>

                {/* Export Dropdown */}
                <div className="relative" ref={exportRef}>
                  <button 
                    onClick={() => setIsExportOpen(!isExportOpen)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-border-sage hover:border-text-secondary hover:bg-bg-base/40 text-text-primary font-bold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-text-secondary" />
                    <span className="uppercase tracking-wider">Export</span>
                    <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
                  </button>
                  {isExportOpen && (
                    <div className="absolute left-0 mt-1.5 w-36 rounded-xl bg-bg-card border border-border-sage shadow-2xl py-1.5 z-20">
                      {['PDF', 'Excel', 'CSV'].map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => triggerExport(fmt)}
                          className="w-full text-left px-4 py-2 hover:bg-bg-base/60 text-xs font-semibold text-text-primary hover:text-brand"
                        >
                          Export as {fmt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right search input */}
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
                              onChange={() => {}} // toggled on row click
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
                            {goal.targetCo2}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-medium">
                            {goal.currentCo2}
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
                                onClick={() => openGoalModal('edit', goal)}
                                className="p-1.5 rounded bg-bg-base/60 hover:bg-accent-env/10 text-text-secondary hover:text-accent-env transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => triggerDeleteConfirm(goal.id)}
                                className="p-1.5 rounded bg-bg-base/60 hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-colors cursor-pointer"
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

        {/* 1. Emission Factors View */}
        {activeSubTab === 'Emission Factors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Emission Factors</h2>
                <p className="text-xs text-text-secondary mt-1">Review standard greenhouse gas emission factors utilized in footprint accounting.</p>
              </div>
              <button
                onClick={() => {
                  setFactorFormData({ name: '', category: 'Scope 1', value: '', source: '' });
                  setIsFactorModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-env to-emerald-600 hover:brightness-110 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-env/5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="uppercase tracking-wider">New Factor</span>
              </button>
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
                      <td className="py-4 px-6 font-mono font-bold text-accent-env">{f.value}</td>
                      <td className="py-4 px-6 text-text-secondary font-semibold">{f.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Product ESG Profiles View */}
        {activeSubTab === 'Product ESG Profiles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Product ESG Profiles</h2>
                <p className="text-xs text-text-secondary mt-1">Lifecycle greenhouse emissions and circularity analytics mapped per core product.</p>
              </div>
              <button
                onClick={() => {
                  setProfileFormData({ name: '', carbonFootprint: '', recyclability: '', certification: '' });
                  setIsProfileModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-env to-emerald-600 hover:brightness-110 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-env/5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="uppercase tracking-wider">New Profile</span>
              </button>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                    <th className="py-4 px-6">Product Model</th>
                    <th className="py-4 px-6">Emissions Footprint</th>
                    <th className="py-4 px-6">Recyclability Rate</th>
                    <th className="py-4 px-6">Eco-Certifications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  {filteredProfiles.map(p => (
                    <tr key={p.id} className="hover:bg-bg-base/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-text-primary font-display">{p.name}</td>
                      <td className="py-4 px-6 font-mono text-accent-gam font-semibold">{p.carbonFootprint}</td>
                      <td className="py-4 px-6 font-mono text-accent-env font-bold">{p.recyclability}</td>
                      <td className="py-4 px-6 font-bold text-accent-rep">{p.certification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Carbon Transactions View */}
        {activeSubTab === 'Carbon Transactions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Carbon Transactions</h2>
                <p className="text-xs text-text-secondary mt-1">Audit log of carbon credit purchases, emissions events, and compliance balance sheets.</p>
              </div>
              <button
                onClick={() => {
                  setTxFormData({ desc: '', type: 'Emission', amount: '', cost: '' });
                  setIsTxModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-env to-emerald-600 hover:brightness-110 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-env/5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="uppercase tracking-wider">Log Transaction</span>
              </button>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Classification</th>
                    <th className="py-4 px-6 text-right">Volume</th>
                    <th className="py-4 px-6 text-right">Value Equivalent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-bg-base/20 transition-colors">
                      <td className="py-4 px-6 font-mono text-text-secondary">{t.date}</td>
                      <td className="py-4 px-6 font-bold text-text-primary font-display">{t.desc}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${t.type === 'Credit' || t.type === 'Offset' ? 'bg-accent-env/10 text-accent-env border border-accent-env/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className={`py-4 px-6 text-right font-mono font-bold ${t.type === 'Credit' || t.type === 'Offset' ? 'text-accent-env' : 'text-red-400'}`}>
                        {t.amount}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-text-secondary font-semibold">{t.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* --- GOAL EDIT/CREATE/VIEW MODAL --- */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title={goalModalMode === 'create' ? 'Create Environmental Goal' : goalModalMode === 'edit' ? 'Edit Environmental Goal' : 'Goal Details'}
        confirmText={goalModalMode === 'view' ? null : goalModalMode === 'create' ? 'Create Goal' : 'Save Changes'}
        confirmColorClass="bg-accent-env hover:bg-emerald-600 text-bg-base font-bold"
        onConfirm={goalModalMode === 'view' ? null : handleGoalSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Goal Name</label>
            <input
              type="text"
              disabled={goalModalMode === 'view'}
              value={currentGoalData.name}
              onChange={(e) => setCurrentGoalData({ ...currentGoalData, name: e.target.value })}
              placeholder="e.g. Reduce Logistics fuel emissions"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env disabled:opacity-60"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Department</label>
              <select
                disabled={goalModalMode === 'view'}
                value={currentGoalData.department}
                onChange={(e) => setCurrentGoalData({ ...currentGoalData, department: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-env disabled:opacity-60"
              >
                <option>Logistics</option>
                <option>Manufacturing</option>
                <option>Corporate</option>
                <option>Sales</option>
                <option>R&D</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Target CO₂ (t)</label>
              <input
                type="number"
                disabled={goalModalMode === 'view'}
                value={currentGoalData.targetCo2Input || ''}
                onChange={(e) => setCurrentGoalData({ ...currentGoalData, targetCo2Input: e.target.value })}
                placeholder="e.g. 500"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env disabled:opacity-60"
              />
            </div>
          </div>
          
          {goalModalMode !== 'create' && (
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Current CO₂ (t)</label>
              <input
                type="number"
                disabled={goalModalMode === 'view'}
                value={currentGoalData.currentCo2Input || ''}
                onChange={(e) => setCurrentGoalData({ ...currentGoalData, currentCo2Input: e.target.value })}
                placeholder="e.g. 390"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env disabled:opacity-60"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Deadline</label>
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
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Value</label>
            <input
              type="text"
              value={factorFormData.value}
              onChange={(e) => setFactorFormData({ ...factorFormData, value: e.target.value })}
              placeholder="e.g. 0.95 kg/kWh"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-env"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Data Source</label>
            <input
              type="text"
              value={factorFormData.source}
              onChange={(e) => setFactorFormData({ ...factorFormData, source: e.target.value })}
              placeholder="e.g. IEA 2025"
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
              placeholder="e.g. 5.6 kg CO2e"
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
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Volume (tCO2e)</label>
            <input
              type="text"
              value={txFormData.amount}
              onChange={(e) => setTxFormData({ ...txFormData, amount: e.target.value })}
              placeholder="e.g. +240 tCO2e"
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
