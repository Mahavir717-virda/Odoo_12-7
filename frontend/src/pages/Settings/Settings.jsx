import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Settings2
} from 'lucide-react';

export default function Settings() {
  const location = useLocation();
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('Departments');

  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    if (location.state?.activeSubTab) {
      setActiveSubTab(location.state.activeSubTab);
    }
  }, [location.state]);

  const [toggles, setToggles] = useState({
    autoEmission: false,
    requireEvidence: false,
    autoAwardBadges: false,
    emailAlerts: false
  });

  const toggleHandler = (key) => {
    if (!isAdmin) return;
    setToggles(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const departments = [
    { name: "Manufacturing", code: "MFG", head: "S. Nair", parent: "—", employees: "134", status: "Active" },
    { name: "Logistics", code: "LOG", head: "R. Iyer", parent: "Manufacturing", employees: "58", status: "Active" },
    { name: "Corporate", code: "COR", head: "A. Mehta", parent: "—", employees: "41", status: "Active" }
  ];

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
                onClick={() => setActiveSubTab(subSection)}
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
        {activeSubTab === 'Departments' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Organization Departments</h2>
                <p className="text-xs text-gray-400 mt-1 font-medium">Manage corporate hierarchy and internal departments for ESG tracking.</p>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="flex items-center space-x-2">
                  <button 
                    disabled={!isAdmin}
                    onClick={() => console.log('New Department clicked')}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 bg-white text-black font-bold text-xs rounded-lg transition-all duration-150 ${
                      isAdmin 
                        ? 'hover:bg-gray-100 active:scale-[0.98]' 
                        : 'opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>New Department</span>
                  </button>
                  {!isAdmin && (
                    <span className="text-[10px] text-gray-500 font-semibold bg-gray-800/40 px-2 py-1 rounded border border-gray-800/60">
                      Admin access required
                    </span>
                  )}
                </div>
                
                <button 
                  disabled={!isAdmin}
                  onClick={() => console.log('Edit clicked')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-[#F59E0B]/40 text-[#F59E0B] font-semibold text-xs rounded-lg transition-all duration-150 ${
                    isAdmin 
                      ? 'hover:border-[#F59E0B] hover:bg-gray-800/40 active:scale-[0.98]' 
                      : 'opacity-30 cursor-not-allowed'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button 
                  disabled={!isAdmin}
                  onClick={() => console.log('Delete clicked')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-[#EF4444]/40 text-[#EF4444] font-semibold text-xs rounded-lg transition-all duration-150 ${
                    isAdmin 
                      ? 'hover:border-[#EF4444] hover:bg-red-950/20 active:scale-[0.98]' 
                      : 'opacity-30 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <div className="bg-[#11161D] border border-gray-800/85 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#171D26] border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Code</th>
                      <th className="py-4 px-6">Head</th>
                      <th className="py-4 px-6">Parent Department</th>
                      <th className="py-4 px-6">Employees</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                    {departments.map((dept) => (
                      <tr 
                        key={dept.name} 
                        className="hover:bg-gray-800/15 transition-colors duration-150 group"
                      >
                        <td className="py-4 px-6 font-semibold text-white group-hover:text-gray-200 transition-colors">
                          {dept.name}
                        </td>
                        <td className="py-4 px-6 text-gray-400 font-mono">
                          {dept.code}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {dept.head}
                        </td>
                        <td className={`py-4 px-6 ${dept.parent === '—' ? 'text-gray-600' : 'text-gray-400'}`}>
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

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
                <span className="text-[10px] text-gray-500 font-semibold bg-gray-800/40 px-2.5 py-1 rounded border border-gray-800/60">
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

        {activeSubTab === 'Categories' && (
          <div className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <span className="text-3xl mb-4">🚧</span>
            <h3 className="text-base font-semibold text-white tracking-wide">Categories</h3>
            <p className="text-sm text-gray-500 mt-2 font-medium">Content coming soon</p>
          </div>
        )}
      </main>
    </div>
  );
}
