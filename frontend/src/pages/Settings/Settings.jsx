import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Settings2
} from 'lucide-react';

export default function Settings() {
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('Departments');

  const isAdmin = user?.role === 'Admin';

  // Selection states
  const [selectedDeptName, setSelectedDeptName] = useState(null);

  useEffect(() => {
    if (location.state?.activeSubTab) {
      setActiveSubTab(location.state.activeSubTab);
    }
  }, [location.state]);

  // --- STATE SEED DATA ---
  const [toggles, setToggles] = useState({
    autoEmission: false,
    requireEvidence: false,
    autoAwardBadges: false,
    emailAlerts: false
  });

  const toggleHandler = (key) => {
    if (!isAdmin) {
      showToast("Admin access required to modify global ESG settings.", "error");
      return;
    }
    const newVal = !toggles[key];
    setToggles(prev => ({
      ...prev,
      [key]: newVal
    }));
    showToast(`Configuration changed: ${key} is now ${newVal ? 'ENABLED' : 'DISABLED'}`, "success");
  };

  const [departments, setDepartments] = useState([
    { name: "Manufacturing", code: "MFG", head: "S. Nair", parent: "—", employees: "134", status: "Active" },
    { name: "Logistics", code: "LOG", head: "R. Iyer", parent: "Manufacturing", employees: "58", status: "Active" },
    { name: "Corporate", code: "COR", head: "A. Mehta", parent: "—", employees: "41", status: "Active" }
  ]);

  const [categories, setCategories] = useState([
    { id: 1, name: "Carbon footprint metrics", classification: "Environmental", weight: "40%" },
    { id: 2, name: "Social impact programs", classification: "Social", weight: "30%" },
    { id: 3, name: "Internal corporate policies", classification: "Governance", weight: "30%" }
  ]);

  // --- MODALS STATE ---
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptModalMode, setDeptModalMode] = useState('create'); // 'create' | 'edit'
  const [deptFormData, setDeptFormData] = useState({ name: '', code: '', head: '', parent: '—', employees: '' });

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', classification: 'Environmental', weight: '30%' });

  // --- HANDLERS ---
  const openDeptModal = (mode, deptObj = null) => {
    if (!isAdmin) {
      showToast("Admin permissions required to register departments.", "error");
      return;
    }
    setDeptModalMode(mode);
    if (deptObj) {
      setDeptFormData({ ...deptObj });
    } else {
      setDeptFormData({ name: '', code: '', head: '', parent: '—', employees: '' });
    }
    setIsDeptModalOpen(true);
  };

  const handleDeptSubmit = (e) => {
    e.preventDefault();
    if (!deptFormData.name || !deptFormData.code || !deptFormData.head || !deptFormData.employees) {
      showToast("Please fill in name, code, head, and employee count.", "error");
      return;
    }

    if (deptModalMode === 'create') {
      const newDept = {
        ...deptFormData,
        status: "Active"
      };
      setDepartments([...departments, newDept]);
      showToast("Department created successfully!", "success");
    } else {
      setDepartments(departments.map(d => d.name === selectedDeptName ? { ...d, ...deptFormData } : d));
      showToast("Department details updated!", "success");
    }
    setIsDeptModalOpen(false);
  };

  const triggerDeleteConfirm = () => {
    if (!isAdmin) {
      showToast("Admin privileges required to remove departments.", "error");
      return;
    }
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setDepartments(departments.filter(d => d.name !== selectedDeptName));
    showToast("Department successfully unregistered.", "success");
    setSelectedDeptName(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!categoryFormData.name) {
      showToast("Category name is required.", "error");
      return;
    }
    const newCat = {
      id: Date.now(),
      ...categoryFormData
    };
    setCategories([...categories, newCat]);
    showToast("ESG category registered successfully!", "success");
    setIsCategoryModalOpen(false);
  };

  const subTabs = ['Departments', 'Categories', 'ESG Configuration', 'Notification Settings'];

  return (
    <div className="flex flex-col min-w-0 overflow-y-auto bg-[#0B0F14] flex-1">
      {/* SUB-NAV ROW */}
      <div className="bg-[#11161D]/10 border-b border-[#1F2937]/60 px-6 py-4">
        <div className="flex flex-wrap gap-3">
          {subTabs.map((subSection) => {
            const isActive = subSection === activeSubTab;
            return (
              <button
                key={subSection}
                onClick={() => {
                  setActiveSubTab(subSection);
                  setSelectedDeptName(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive 
                    ? 'bg-white text-black font-bold shadow-md shadow-white/5' 
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
        
        {/* --- DEPARTMENTS SUB-TAB --- */}
        {activeSubTab === 'Departments' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Organization Departments</h2>
                <p className="text-xs text-gray-400 mt-1 font-medium">Manage corporate hierarchy and internal departments for ESG tracking.</p>
              </div>

              <div className="flex items-center space-x-2.5">
                <button 
                  disabled={!isAdmin}
                  onClick={() => openDeptModal('create')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-white text-black font-bold text-xs rounded-lg transition-all duration-150 ${
                    isAdmin 
                      ? 'hover:bg-gray-100 active:scale-[0.98]' 
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>New Department</span>
                </button>
                
                <button 
                  disabled={!selectedDeptName}
                  onClick={() => {
                    const d = departments.find(x => x.name === selectedDeptName);
                    if (d) openDeptModal('edit', d);
                  }}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-[#F59E0B]/40 text-[#F59E0B] font-semibold text-xs rounded-lg transition-all duration-150 ${
                    !selectedDeptName ? 'opacity-30 cursor-not-allowed' : 'hover:border-[#F59E0B] hover:bg-gray-800/40 active:scale-[0.98]'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button 
                  disabled={!selectedDeptName}
                  onClick={triggerDeleteConfirm}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-[#EF4444]/40 text-[#EF4444] font-semibold text-xs rounded-lg transition-all duration-150 ${
                    !selectedDeptName ? 'opacity-30 cursor-not-allowed' : 'hover:border-[#EF4444] hover:bg-red-950/20 active:scale-[0.98]'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                {!isAdmin && (
                  <span className="text-[10px] text-gray-500 font-semibold bg-gray-800/40 px-2 py-1 rounded border border-gray-800/60">
                    Admin access required
                  </span>
                )}
              </div>
            </div>

            <div className="bg-[#11161D] border border-gray-800/85 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#171D26] border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6 w-8"></th>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Code</th>
                      <th className="py-4 px-6">Head</th>
                      <th className="py-4 px-6">Parent Department</th>
                      <th className="py-4 px-6">Employees</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                    {departments.map((dept) => {
                      const isSelected = selectedDeptName === dept.name;
                      return (
                        <tr 
                          key={dept.name} 
                          onClick={() => {
                            if (isAdmin) {
                              setSelectedDeptName(isSelected ? null : dept.name);
                            }
                          }}
                          className={`hover:bg-gray-800/15 transition-colors duration-150 group ${isAdmin ? 'cursor-pointer' : ''} ${isSelected ? 'bg-white/5 hover:bg-white/10' : ''}`}
                        >
                          <td className="py-4 px-6 text-center">
                            {isAdmin ? (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // toggled on row click
                                className="rounded border-gray-750 bg-gray-800 text-white focus:ring-0"
                              />
                            ) : (
                              <span className="text-gray-650 font-mono">-</span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-semibold text-white group-hover:text-gray-200 transition-colors">
                            {dept.name}
                          </td>
                          <td className="py-4 px-6 text-gray-400 font-mono">
                            {dept.code}
                          </td>
                          <td className="py-4 px-6 text-gray-300">
                            {dept.head}
                          </td>
                          <td className={`py-4 px-6 ${dept.parent === '—' ? 'text-gray-650' : 'text-gray-400'}`}>
                            {dept.parent}
                          </td>
                          <td className="py-4 px-6 font-mono font-semibold text-white">
                            {dept.employees}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                              {dept.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* --- CATEGORIES SUB-TAB --- */}
        {activeSubTab === 'Categories' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">ESG Categories</h2>
                <p className="text-xs text-gray-400 mt-1 font-medium font-sans">Manage global metrics classifications and weights configured across the platform.</p>
              </div>
              <button
                disabled={!isAdmin}
                onClick={() => setIsCategoryModalOpen(true)}
                className={`flex items-center space-x-1 px-3 py-1.5 bg-white text-black font-bold text-xs rounded-lg ${!isAdmin ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>New Category</span>
              </button>
            </div>

            <div className="bg-[#11161D] border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#171D26] border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Category Name</th>
                    <th className="py-4 px-6">Classification</th>
                    <th className="py-4 px-6 text-right">Score Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-gray-300">
                  {categories.map(c => (
                    <tr key={c.id} className="hover:bg-gray-800/10">
                      <td className="py-4 px-6 font-semibold text-white">{c.name}</td>
                      <td className="py-4 px-6 font-medium text-gray-400">{c.classification}</td>
                      <td className="py-4 px-6 text-right font-mono text-emerald-400 font-bold">{c.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* --- ESG CONFIG & NOTIFICATIONS --- */}
        {(activeSubTab === 'ESG Configuration' || activeSubTab === 'Notification Settings') && (
          <section className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Settings2 className="w-5 h-5 text-gray-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {activeSubTab === 'ESG Configuration' ? 'ESG Configuration' : 'Notification Settings'}
                </h3>
              </div>
              {!isAdmin && (
                <span className="text-[10px] text-gray-550 font-semibold bg-gray-800/40 px-2.5 py-1 rounded border border-gray-800/60">
                  Admin access required to modify settings
                </span>
              )}
            </div>

            <div className="divide-y divide-gray-800/60">
              {activeSubTab === 'ESG Configuration' && (
                <>
                  <div className="flex items-center justify-between py-4">
                    <span className="text-xs font-semibold text-gray-300">Enable auto emission calculation</span>
                    <button 
                      disabled={!isAdmin}
                      onClick={() => toggleHandler('autoEmission')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                        toggles.autoEmission ? 'bg-[#22C55E]' : 'bg-gray-800'
                      } ${!isAdmin ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        toggles.autoEmission ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <span className="text-xs font-semibold text-gray-300">Require evidence for all CSR activities</span>
                    <button 
                      disabled={!isAdmin}
                      onClick={() => toggleHandler('requireEvidence')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                        toggles.requireEvidence ? 'bg-[#22C55E]' : 'bg-gray-800'
                      } ${!isAdmin ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        toggles.requireEvidence ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <span className="text-xs font-semibold text-gray-300">Auto-award badges on challenge completion</span>
                    <button 
                      disabled={!isAdmin}
                      onClick={() => toggleHandler('autoAwardBadges')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                        toggles.autoAwardBadges ? 'bg-[#22C55E]' : 'bg-gray-800'
                      } ${!isAdmin ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        toggles.autoAwardBadges ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </>
              )}

              {activeSubTab === 'Notification Settings' && (
                <div className="flex items-center justify-between py-4">
                  <span className="text-xs font-semibold text-gray-300">Email alerts for new compliance issues</span>
                  <button 
                    disabled={!isAdmin}
                    onClick={() => toggleHandler('emailAlerts')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                      toggles.emailAlerts ? 'bg-[#22C55E]' : 'bg-gray-800'
                    } ${!isAdmin ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      toggles.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* --- DEPARTMENT FORM MODAL --- */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={deptModalMode === 'create' ? "Register Corporate Department" : "Edit Department Details"}
        confirmText={deptModalMode === 'create' ? "Register" : "Save Changes"}
        confirmColorClass="bg-white hover:bg-gray-105 text-black font-bold"
        onConfirm={handleDeptSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Department Name</label>
            <input
              type="text"
              value={deptFormData.name}
              onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
              placeholder="e.g. Research & Development"
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none focus:border-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Department Code</label>
              <input
                type="text"
                value={deptFormData.code}
                onChange={(e) => setDeptFormData({ ...deptFormData, code: e.target.value })}
                placeholder="e.g. RND"
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Lead / Head</label>
              <input
                type="text"
                value={deptFormData.head}
                onChange={(e) => setDeptFormData({ ...deptFormData, head: e.target.value })}
                placeholder="e.g. A. Mehta"
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Parent Department</label>
              <select
                value={deptFormData.parent}
                onChange={(e) => setDeptFormData({ ...deptFormData, parent: e.target.value })}
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
              >
                <option value="—">None (Top-Level)</option>
                {departments.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Employee Count</label>
              <input
                type="number"
                value={deptFormData.employees}
                onChange={(e) => setDeptFormData({ ...deptFormData, employees: e.target.value })}
                placeholder="e.g. 45"
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* --- CONFIRM DELETE DEPARTMENT MODAL --- */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Confirm Deregistration"
        confirmText="Deregister Department"
        confirmColorClass="bg-red-500 hover:bg-red-655 text-white font-bold"
        onConfirm={handleConfirmDelete}
      >
        <p className="text-xs text-gray-300">Are you sure you want to unregister the selected department? All associated ESG logs will remain but direct reporting will be severed.</p>
      </Modal>

      {/* --- CATEGORY FORM MODAL --- */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="New ESG Classification Category"
        confirmText="Register Category"
        confirmColorClass="bg-white hover:bg-gray-100 text-black font-bold"
        onConfirm={handleCreateCategory}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Category Name</label>
            <input
              type="text"
              value={categoryFormData.name}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
              placeholder="e.g. Circularity and recycling rate"
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Classification</label>
              <select
                value={categoryFormData.classification}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, classification: e.target.value })}
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
              >
                <option>Environmental</option>
                <option>Social</option>
                <option>Governance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Weight (%)</label>
              <input
                type="text"
                value={categoryFormData.weight}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, weight: e.target.value })}
                placeholder="e.g. 25%"
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
