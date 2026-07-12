import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getStorageItem, setStorageItem, recalculateAllScores } from '../../utils/storage';
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

  // Sync state with localStorage
  const [toggles, setToggles] = useState(() => getStorageItem('db_esg_config', {
    autoEmission: false,
    requireEvidence: false,
    autoAwardBadges: false,
    emailAlerts: false
  }));

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  const [notifPreferences, setNotifPreferences] = useState({
    challenge_notifications: true,
    policy_notifications: true,
    badge_notifications: true,
    compliance_notifications: true,
    csr_notifications: true,
    audit_notifications: true,
    email_notifications: true,
    in_app_notifications: true,
    push_notifications: false
  });

  useEffect(() => {
    if (activeSubTab === 'Notification Settings') {
      const fetchNotifPreferences = async () => {
        try {
          const token = localStorage.getItem('token');
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const res = await fetch('http://localhost:5000/api/v1/notification-settings', { headers });
          if (res.ok) {
            const resJson = await res.json();
            if (resJson.success && resJson.data) {
              setNotifPreferences(resJson.data);
            }
          }
        } catch (err) {
          console.error('Error fetching notification settings:', err);
        }
      };
      fetchNotifPreferences();
    }
  }, [activeSubTab]);

  const handleNotifToggle = async (key) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const updated = { ...notifPreferences, [key]: !notifPreferences[key] };
      setNotifPreferences(updated);

      const res = await fetch('http://localhost:5000/api/v1/notification-settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        showToast("Notification preferences updated successfully.", "success");
      } else {
        showToast("Failed to update notification preferences.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating preferences.", "error");
    }
  };

  const fetchSettingsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const deptRes = await fetch('http://localhost:5000/api/v1/departments', { headers });
      const deptData = await deptRes.json();
      if (deptRes.ok) {
        setDepartments(deptData.data?.results || deptData.data || []);
      }

      const catRes = await fetch('http://localhost:5000/api/v1/categories', { headers });
      const catData = await catRes.json();
      if (catRes.ok) {
        setCategories(catData.data?.results || catData.data || []);
      }
    } catch (err) {
      console.error('Error fetching settings data:', err);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  useEffect(() => {
    if (location.state?.activeSubTab) {
      setActiveSubTab(location.state.activeSubTab);
    }
  }, [location.state]);

  const refreshData = () => {
    setToggles(getStorageItem('db_esg_config', {
      autoEmission: false,
      requireEvidence: false,
      autoAwardBadges: false,
      emailAlerts: false
    }));
    fetchSettingsData();
    recalculateAllScores();
  };

  const toggleHandler = (key) => {
    if (!isAdmin) {
      showToast("Admin access required to modify global ESG settings.", "error");
      return;
    }
    const config = getStorageItem('db_esg_config', {
      autoEmission: false,
      requireEvidence: false,
      autoAwardBadges: false,
      emailAlerts: false
    });
    config[key] = !config[key];
    setStorageItem('db_esg_config', config);
    showToast(`Configuration changed: ${key} is now ${config[key] ? 'ENABLED' : 'DISABLED'}`, "success");
    refreshData();
  };

  // Modals state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptModalMode, setDeptModalMode] = useState('create'); // 'create' | 'edit'
  const [deptFormData, setDeptFormData] = useState({ name: '', code: '', head: '', parent: '—', employees: '50' });

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', classification: 'Environmental', weight: '30%' });

  // Handlers
  const openDeptModal = (mode, deptObj = null) => {
    if (!isAdmin) {
      showToast("Admin permissions required to register departments.", "error");
      return;
    }
    setDeptModalMode(mode);
    if (deptObj) {
      setDeptFormData({
        _id: deptObj._id,
        name: deptObj.name,
        code: deptObj.code,
        head: deptObj.head,
        parent: deptObj.parentDepartment?._id || deptObj.parentDepartment || '—',
        employees: deptObj.employeeCount || deptObj.employees || '50',
        status: deptObj.status || 'Active'
      });
    } else {
      setDeptFormData({ name: '', code: '', head: '', parent: '—', employees: '50' });
    }
    setIsDeptModalOpen(true);
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    if (!deptFormData.name || !deptFormData.code || !deptFormData.head || !deptFormData.employees) {
      showToast("Please fill in name, code, head, and employee count.", "error");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const url = deptModalMode === 'create'
        ? 'http://localhost:5000/api/v1/departments'
        : `http://localhost:5000/api/v1/departments/${deptFormData._id}`;
      
      const method = deptModalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          name: deptFormData.name,
          code: deptFormData.code,
          head: deptFormData.head,
          parentDepartment: deptFormData.parent === '—' ? null : deptFormData.parent,
          employeeCount: parseInt(deptFormData.employees, 10),
          status: deptFormData.status || 'Active'
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Department update failed');

      showToast(`Department ${deptFormData.name} ${deptModalMode === 'create' ? 'registered' : 'updated'}!`, "success");
      setIsDeptModalOpen(false);
      setSelectedDeptName(null);
      refreshData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const triggerDeleteConfirm = () => {
    if (!isAdmin) {
      showToast("Admin permissions required to remove departments.", "error");
      return;
    }
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    const deptToDelete = departments.find(x => x.name === selectedDeptName);
    if (!deptToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await fetch(`http://localhost:5000/api/v1/departments/${deptToDelete._id}`, {
        method: 'DELETE',
        headers
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Department deletion failed');

      showToast(`Department ${selectedDeptName} deleted.`, "success");
      setIsDeleteConfirmOpen(false);
      setSelectedDeptName(null);
      refreshData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name || !categoryFormData.weight) {
      showToast("Please fill in category name and score weight.", "error");
      return;
    }

    if (!isAdmin) {
      showToast("Admin permissions required to create categories.", "error");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const type = categoryFormData.classification.toUpperCase();
      const color = type === 'ENVIRONMENTAL' ? '#10B981' : type === 'SOCIAL' ? '#3B82F6' : '#F59E0B';

      const response = await fetch('http://localhost:5000/api/v1/categories', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: categoryFormData.name,
          type,
          color,
          scoreWeight: parseInt(categoryFormData.weight, 10),
          status: 'ACTIVE'
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Category creation failed');

      showToast("ESG Category created successfully!", "success");
      setIsCategoryModalOpen(false);
      setCategoryFormData({ name: '', classification: 'Environmental', weight: '30%' });
      refreshData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const subTabs = ['Departments', 'Categories', 'ESG Configuration', 'Notification Settings'];

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
                  setSelectedDeptName(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-text-primary text-bg-base font-bold shadow-md shadow-text-primary/10' 
                    : 'bg-bg-card border border-border-sage text-text-secondary hover:text-text-primary hover:border-text-secondary'
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
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Organization Departments</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">Manage corporate hierarchy and internal departments for ESG tracking.</p>
              </div>

              <div className="flex items-center space-x-2.5">
                <button 
                  disabled={!isAdmin}
                  onClick={() => openDeptModal('create')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-text-primary text-bg-base font-extrabold text-xs rounded-lg transition-all shadow-md shadow-text-primary/5 ${
                    isAdmin 
                      ? 'hover:brightness-95 active:scale-[0.98] cursor-pointer' 
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="uppercase tracking-wider">New Department</span>
                </button>
                
                <button 
                  disabled={!selectedDeptName}
                  onClick={() => {
                    const d = departments.find(x => x.name === selectedDeptName);
                    if (d) openDeptModal('edit', d);
                  }}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-accent-gam/45 text-accent-gam font-bold text-xs rounded-lg transition-all ${
                    !selectedDeptName 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:border-accent-gam hover:bg-accent-gam/5 active:scale-[0.98] cursor-pointer'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">Edit</span>
                </button>

                <button 
                  disabled={!selectedDeptName}
                  onClick={triggerDeleteConfirm}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-red-500/45 text-red-500 font-bold text-xs rounded-lg transition-all ${
                    !selectedDeptName 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:border-red-500 hover:bg-red-500/5 active:scale-[0.98] cursor-pointer'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">Delete</span>
                </button>

                {!isAdmin && (
                  <span className="text-[9px] text-text-secondary font-bold bg-bg-card border border-border-sage px-2 py-1 rounded-full uppercase tracking-wider">
                    Admin Access Required
                  </span>
                )}
              </div>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                  <thead>
                    <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                      <th className="py-4 px-6 w-8"></th>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Code</th>
                      <th className="py-4 px-6">Head</th>
                      <th className="py-4 px-6">Parent Department</th>
                      <th className="py-4 px-6">Employees</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-sage/40 text-text-primary">
                    {departments.map((dept) => {
                      const isSelected = selectedDeptName === dept.name;
                      const parentName = dept.parentDepartment?.name || dept.parent || '—';
                      const employees = dept.employeeCount !== undefined ? dept.employeeCount : (dept.employees || 0);

                      return (
                        <tr 
                          key={dept._id || dept.name} 
                          onClick={() => {
                            if (isAdmin) {
                              setSelectedDeptName(isSelected ? null : dept.name);
                            }
                          }}
                          className={`hover:bg-bg-base/30 transition-colors duration-150 group ${isAdmin ? 'cursor-pointer' : ''} ${isSelected ? 'bg-text-primary/5 hover:bg-text-primary/10' : ''}`}
                        >
                          <td className="py-4 px-6 text-center">
                            {isAdmin ? (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="rounded border-border-sage bg-bg-base text-text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                              />
                            ) : (
                              <span className="text-text-secondary font-mono text-[9px]">-</span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-bold text-text-primary group-hover:text-text-primary transition-colors font-display">
                            {dept.name}
                          </td>
                          <td className="py-4 px-6 text-text-secondary font-mono">
                            {dept.code}
                          </td>
                          <td className="py-4 px-6 text-text-primary font-medium">
                            {dept.head?.name || dept.head || '—'}
                          </td>
                          <td className={`py-4 px-6 ${parentName === '—' ? 'text-text-secondary/40' : 'text-text-secondary'}`}>
                            {parentName}
                          </td>
                          <td className="py-4 px-6 font-mono font-bold text-text-primary">
                            {employees}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent-env/10 text-accent-env border border-accent-env/20">
                              {dept.status || 'Active'}
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
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">ESG Categories</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">Manage global metrics classifications and weights configured across the platform.</p>
              </div>
              <button
                disabled={!isAdmin}
                onClick={() => setIsCategoryModalOpen(true)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 bg-text-primary text-bg-base font-extrabold text-xs rounded-lg transition-all shadow-md shadow-text-primary/5 ${
                  isAdmin 
                    ? 'hover:brightness-90 active:scale-[0.98] cursor-pointer' 
                    : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="uppercase tracking-wider">New Category</span>
              </button>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                    <th className="py-4 px-6">Category Name</th>
                    <th className="py-4 px-6">Classification</th>
                    <th className="py-4 px-6 text-right">Score Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  {categories.map(c => (
                    <tr key={c._id || c.id} className="hover:bg-bg-base/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-text-primary font-display">{c.name}</td>
                      <td className="py-4 px-6 font-semibold text-text-secondary">{c.classification}</td>
                      <td className="py-4 px-6 text-right font-mono text-accent-env font-bold">
                        {c.scoreWeight !== undefined ? `${c.scoreWeight}%` : (c.weight || '30%')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* --- ESG CONFIG & NOTIFICATIONS --- */}
        {(activeSubTab === 'ESG Configuration' || activeSubTab === 'Notification Settings') && (
          <section className="bg-bg-card border border-border-sage rounded-2xl p-6 space-y-6 shadow-lg shadow-brand/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Settings2 className="w-5 h-5 text-text-secondary" />
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">
                  {activeSubTab === 'ESG Configuration' ? 'ESG Configuration' : 'Notification Settings'}
                </h3>
              </div>
              {!isAdmin && activeSubTab === 'ESG Configuration' && (
                <span className="text-[9px] text-text-secondary font-bold bg-bg-base border border-border-sage px-2 py-1 rounded-full uppercase tracking-wider">
                  Admin Access Required to Modify Settings
                </span>
              )}
            </div>

            <div className="divide-y divide-border-sage/40">
              {activeSubTab === 'ESG Configuration' && (
                <>
                  <div className="flex items-center justify-between py-4">
                    <span className="text-xs font-semibold text-text-primary">Enable auto emission calculation</span>
                    <button 
                      disabled={!isAdmin}
                      onClick={() => toggleHandler('autoEmission')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                        toggles.autoEmission ? 'bg-accent-env' : 'bg-bg-base border border-border-sage'
                      } ${!isAdmin ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        toggles.autoEmission ? 'translate-x-5 bg-bg-base' : 'translate-x-0 bg-text-secondary'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <span className="text-xs font-semibold text-text-primary">Require evidence for all CSR activities</span>
                    <button 
                      disabled={!isAdmin}
                      onClick={() => toggleHandler('requireEvidence')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                        toggles.requireEvidence ? 'bg-accent-env' : 'bg-bg-base border border-border-sage'
                      } ${!isAdmin ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        toggles.requireEvidence ? 'translate-x-5 bg-bg-base' : 'translate-x-0 bg-text-secondary'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <span className="text-xs font-semibold text-text-primary">Auto-award badges on challenge completion</span>
                    <button 
                      disabled={!isAdmin}
                      onClick={() => toggleHandler('autoAwardBadges')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                        toggles.autoAwardBadges ? 'bg-accent-env' : 'bg-bg-base border border-border-sage'
                      } ${!isAdmin ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        toggles.autoAwardBadges ? 'translate-x-5 bg-bg-base' : 'translate-x-0 bg-text-secondary'
                      }`} />
                    </button>
                  </div>
                </>
              )}

              {activeSubTab === 'Notification Settings' && (
                <div className="space-y-6">
                  {/* Delivery Channels */}
                  <div>
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Delivery Channels</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between bg-bg-base/40 border border-border-sage/40 rounded-xl p-4">
                        <span className="text-xs font-semibold text-text-primary">In-App Notifications</span>
                        <button 
                          onClick={() => handleNotifToggle('in_app_notifications')}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                            notifPreferences.in_app_notifications ? 'bg-accent-env' : 'bg-bg-base border border-border-sage'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 bg-white ${
                            notifPreferences.in_app_notifications ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-bg-base/40 border border-border-sage/40 rounded-xl p-4">
                        <span className="text-xs font-semibold text-text-primary">Email Notifications</span>
                        <button 
                          onClick={() => handleNotifToggle('email_notifications')}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                            notifPreferences.email_notifications ? 'bg-accent-env' : 'bg-bg-base border border-border-sage'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 bg-white ${
                            notifPreferences.email_notifications ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-bg-base/40 border border-border-sage/40 rounded-xl p-4">
                        <span className="text-xs font-semibold text-text-primary">Push Notifications</span>
                        <button 
                          onClick={() => handleNotifToggle('push_notifications')}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                            notifPreferences.push_notifications ? 'bg-accent-env' : 'bg-bg-base border border-border-sage'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 bg-white ${
                            notifPreferences.push_notifications ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Governance Events */}
                  <div>
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Governance Events</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between bg-bg-base/40 border border-border-sage/40 rounded-xl p-4">
                        <span className="text-xs font-semibold text-text-primary">Policy Updates</span>
                        <button 
                          onClick={() => handleNotifToggle('policy_notifications')}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                            notifPreferences.policy_notifications ? 'bg-accent-env' : 'bg-bg-base border border-border-sage'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 bg-white ${
                            notifPreferences.policy_notifications ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-bg-base/40 border border-border-sage/40 rounded-xl p-4">
                        <span className="text-xs font-semibold text-text-primary">Compliance Issues</span>
                        <button 
                          onClick={() => handleNotifToggle('compliance_notifications')}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                            notifPreferences.compliance_notifications ? 'bg-accent-env' : 'bg-bg-base border border-border-sage'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 bg-white ${
                            notifPreferences.compliance_notifications ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-bg-base/40 border border-border-sage/40 rounded-xl p-4">
                        <span className="text-xs font-semibold text-text-primary">Audit Status Updates</span>
                        <button 
                          onClick={() => handleNotifToggle('audit_notifications')}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                            notifPreferences.audit_notifications ? 'bg-accent-env' : 'bg-bg-base border border-border-sage'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 bg-white ${
                            notifPreferences.audit_notifications ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Social & Gamification Events */}
                  <div>
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Social & Gamification Events</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between bg-bg-base/40 border border-border-sage/40 rounded-xl p-4">
                        <span className="text-xs font-semibold text-text-primary">CSR Activities</span>
                        <button 
                          onClick={() => handleNotifToggle('csr_notifications')}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                            notifPreferences.csr_notifications ? 'bg-accent-env' : 'bg-bg-base border border-border-sage'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 bg-white ${
                            notifPreferences.csr_notifications ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-bg-base/40 border border-border-sage/40 rounded-xl p-4">
                        <span className="text-xs font-semibold text-text-primary">Challenges</span>
                        <button 
                          onClick={() => handleNotifToggle('challenge_notifications')}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                            notifPreferences.challenge_notifications ? 'bg-accent-env' : 'bg-bg-base border border-border-sage'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 bg-white ${
                            notifPreferences.challenge_notifications ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-bg-base/40 border border-border-sage/40 rounded-xl p-4">
                        <span className="text-xs font-semibold text-text-primary">Badge Achievements</span>
                        <button 
                          onClick={() => handleNotifToggle('badge_notifications')}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                            notifPreferences.badge_notifications ? 'bg-accent-env' : 'bg-bg-base border border-border-sage'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 bg-white ${
                            notifPreferences.badge_notifications ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
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
        confirmColorClass="bg-text-primary hover:brightness-90 text-bg-base font-bold"
        onConfirm={handleDeptSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Department Name</label>
            <input
              type="text"
              value={deptFormData.name}
              disabled={deptModalMode === 'edit'}
              onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
              placeholder="e.g. Research & Development"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-text-primary disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Department Code</label>
              <input
                type="text"
                value={deptFormData.code}
                onChange={(e) => setDeptFormData({ ...deptFormData, code: e.target.value })}
                placeholder="e.g. RND"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Lead / Head</label>
              <input
                type="text"
                value={deptFormData.head}
                onChange={(e) => setDeptFormData({ ...deptFormData, head: e.target.value })}
                placeholder="e.g. A. Mehta"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Parent Department</label>
              <select
                value={deptFormData.parent}
                onChange={(e) => setDeptFormData({ ...deptFormData, parent: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-text-primary"
              >
                <option value="—">None (Top-Level)</option>
                {departments.filter(d => d._id !== deptFormData._id).map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Employee Count</label>
              <input
                type="number"
                value={deptFormData.employees}
                onChange={(e) => setDeptFormData({ ...deptFormData, employees: e.target.value })}
                placeholder="e.g. 45"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none"
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
        confirmColorClass="bg-red-500 hover:bg-red-600 text-white font-bold"
        onConfirm={handleConfirmDelete}
      >
        <p className="text-xs text-text-secondary font-semibold">Are you sure you want to unregister the selected department? All associated ESG logs will remain but direct reporting will be severed.</p>
      </Modal>

      {/* --- CATEGORY FORM MODAL --- */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="New ESG Classification Category"
        confirmText="Register Category"
        confirmColorClass="bg-text-primary hover:brightness-90 text-bg-base font-bold"
        onConfirm={handleCreateCategory}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Category Name</label>
            <input
              type="text"
              value={categoryFormData.name}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
              placeholder="e.g. Circularity and recycling rate"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-text-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Classification</label>
              <select
                value={categoryFormData.classification}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, classification: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-text-primary"
              >
                <option>Environmental</option>
                <option>Social</option>
                <option>Governance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Weight (%)</label>
              <input
                type="text"
                value={categoryFormData.weight}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, weight: e.target.value })}
                placeholder="e.g. 25%"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-text-primary"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
