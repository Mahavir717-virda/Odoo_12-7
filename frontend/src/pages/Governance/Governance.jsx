import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, 
  Download, 
  ChevronDown, 
  ShieldAlert, 
  AlertTriangle
} from 'lucide-react';

export default function Governance() {
  const location = useLocation();
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('Audits');

  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    if (location.state?.activeSubTab) {
      setActiveSubTab(location.state.activeSubTab);
    }
  }, [location.state]);

  // Audits Data
  const auditsData = [
    {
      id: 1,
      title: "Q2 Waste Audit",
      department: "Manufacturing",
      auditor: "S. Nair",
      date: "2026-06-12",
      findings: "3 minor issues",
      status: "Completed"
    },
    {
      id: 2,
      title: "Vendor Compliance Check",
      department: "Procurement",
      auditor: "R. Iyer",
      date: "2026-07-01",
      findings: "1 open issue",
      status: "Under Review"
    }
  ];

  // Compliance Issues Data
  const complianceIssuesData = [
    {
      id: 1,
      issue: "Missing MSDS sheets",
      severity: "High",
      department: "Manufacturing",
      status: "Open"
    },
    {
      id: 2,
      issue: "Late vendor disclosure",
      severity: "Medium",
      department: "Procurement",
      status: "Resolved"
    }
  ];

  const subTabs = ['Policies', 'Policy Acknowledgements', 'Audits', 'Compliance Issues'];

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
                    ? 'bg-[#A855F7] text-white shadow-md shadow-purple-500/10 font-bold' 
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
        {activeSubTab === 'Audits' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Audits Log</h2>
                <p className="text-xs text-gray-400 mt-1">Review internal and vendor compliance audits conducted by certified auditors.</p>
              </div>
              
              <div className="flex items-center space-x-2.5">
                <div className="flex items-center space-x-2">
                  <button 
                    disabled={!isAdmin}
                    onClick={() => console.log('New Audit clicked')}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 bg-[#A855F7] text-white font-bold text-xs rounded-lg transition-all duration-150 ${
                      isAdmin 
                        ? 'hover:bg-[#9333EA] active:scale-[0.98]' 
                        : 'opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>New Audit</span>
                  </button>
                  {!isAdmin && (
                    <span className="text-[10px] text-gray-500 font-semibold bg-gray-800/40 px-2 py-1 rounded border border-gray-800/60">
                      Admin access required
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={() => console.log('Export Audits clicked')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800/40 text-gray-300 font-semibold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="bg-[#11161D] border border-gray-800/85 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#171D26] border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Title</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Auditor</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Findings</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                    {auditsData.map((audit) => {
                      let badgeStyle = "";
                      if (audit.status === "Completed") {
                        badgeStyle = "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20";
                      } else if (audit.status === "Under Review") {
                        badgeStyle = "bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/20";
                      }

                      return (
                        <tr 
                          key={audit.id} 
                          className="hover:bg-gray-800/15 transition-colors duration-150 group"
                        >
                          <td className="py-4 px-6 font-semibold text-white group-hover:text-purple-400 transition-colors">
                            {audit.title}
                          </td>
                          <td className="py-4 px-6 text-gray-400 font-medium">
                            {audit.department}
                          </td>
                          <td className="py-4 px-6 text-gray-300">
                            {audit.auditor}
                          </td>
                          <td className="py-4 px-6 text-gray-400 font-mono">
                            {audit.date}
                          </td>
                          <td className="py-4 px-6 text-gray-300 font-medium">
                            {audit.findings}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                              {audit.status}
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

        {activeSubTab === 'Compliance Issues' && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>Compliance Issues raised from Audits</span>
            </div>

            <div className="bg-[#11161D] border border-gray-800/85 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-[#171D26] border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Issue</th>
                      <th className="py-4 px-6">Severity</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                    {complianceIssuesData.map((item) => {
                      let severityBadge = "";
                      if (item.severity === "High") {
                        severityBadge = "bg-[#EF4444] text-white font-extrabold shadow-sm shadow-red-950/20";
                      } else if (item.severity === "Medium") {
                        severityBadge = "bg-[#F59E0B] text-black font-extrabold shadow-sm shadow-amber-950/20";
                      }

                      let statusBadge = "";
                      if (item.status === "Open") {
                        statusBadge = "border border-[#EF4444] text-[#EF4444] bg-transparent font-bold";
                      } else if (item.status === "Resolved") {
                        statusBadge = "border border-[#22C55E] text-[#22C55E] bg-transparent font-bold";
                      }

                      return (
                        <tr 
                          key={item.id} 
                          className="hover:bg-gray-800/15 transition-colors duration-150 group"
                        >
                          <td className="py-4 px-6 font-semibold text-white group-hover:text-purple-400 transition-colors">
                            {item.issue}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${severityBadge}`}>
                              {item.severity}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-400 font-medium">
                            {item.department}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${statusBadge}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 pl-1 text-[11px] text-gray-500 font-medium italic">
              <AlertTriangle className="w-3.5 h-3.5 text-gray-500 mr-1 not-italic" />
              <span>Compliance issues track Owner + Due Date internally; issues open past due date are auto-flagged and trigger notifications.</span>
            </div>
          </section>
        )}

        {(activeSubTab === 'Policies' || activeSubTab === 'Policy Acknowledgements') && (
          <div className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <span className="text-3xl mb-4">🚧</span>
            <h3 className="text-base font-semibold text-white tracking-wide">{activeSubTab}</h3>
            <p className="text-sm text-gray-500 mt-2 font-medium">Content coming soon</p>
          </div>
        )}
      </main>
    </div>
  );
}
