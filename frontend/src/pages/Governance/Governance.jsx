import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { 
  Plus, 
  Download, 
  ChevronDown, 
  ShieldAlert, 
  AlertTriangle,
  Eye
} from 'lucide-react';

export default function Governance() {
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('Audits');

  const isAdmin = user?.role === 'Admin';
  const exportRef = useRef(null);

  // States
  const [isExportOpen, setIsExportOpen] = useState(false);

  // --- STATE DATA SEEDS ---
  const [audits, setAudits] = useState([
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
  ]);

  const [complianceIssues, setComplianceIssues] = useState([
    {
      id: 1,
      issue: "Missing MSDS sheets",
      severity: "High",
      department: "Manufacturing",
      status: "Open",
      owner: "Deep Pathak",
      dueDate: "2026-08-15"
    },
    {
      id: 2,
      issue: "Late vendor disclosure",
      severity: "Medium",
      department: "Procurement",
      status: "Resolved",
      owner: "Karan Shah",
      dueDate: "2026-07-30"
    }
  ]);

  const [policies, setPolicies] = useState([
    { id: 1, name: "Anti-Bribery Policy", version: "v2.1", date: "2026-01-10", category: "Ethics", activeCount: "142 employees" },
    { id: 2, name: "Whistleblower Protection", version: "v1.4", date: "2025-11-05", category: "Safety", activeCount: "135 employees" },
    { id: 3, name: "Conflict of Interest Policy", version: "v3.0", date: "2026-03-22", category: "Disclosure", activeCount: "140 employees" }
  ]);

  const [acknowledgements, setAcknowledgements] = useState([
    { id: 1, employee: "Aditi Rao", policy: "Anti-Bribery Policy", date: "2026-07-05", method: "E-Sign" },
    { id: 2, employee: "Karan Shah", policy: "Conflict of Interest Policy", date: "2026-07-02", method: "ID Verification" }
  ]);

  // --- MODALS STATE ---
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditFormData, setAuditFormData] = useState({ title: '', department: 'Manufacturing', auditor: '', date: '', findings: '' });

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyFormData, setPolicyFormData] = useState({ name: '', version: 'v1.0', category: 'Ethics' });

  const [isAckModalOpen, setIsAckModalOpen] = useState(false);
  const [ackFormData, setAckFormData] = useState({ employee: '', policy: 'Anti-Bribery Policy' });

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

  // --- HANDLERS ---
  const handleExport = (format) => {
    showToast(`Exporting as ${format}...`, "info");
    setIsExportOpen(false);
  };

  const handleAuditSubmit = (e) => {
    e.preventDefault();
    if (!auditFormData.title || !auditFormData.auditor || !auditFormData.date) {
      showToast("Please fill in title, auditor, and date.", "error");
      return;
    }

    const newAudit = {
      id: Date.now(),
      ...auditFormData,
      status: "Under Review"
    };

    setAudits([newAudit, ...audits]);
    showToast("Audit logged successfully!", "success");
    setIsAuditModalOpen(false);
    setAuditFormData({ title: '', department: 'Manufacturing', auditor: '', date: '', findings: '' });
  };

  const handleOpenIssue = (issue) => {
    setSelectedIssue(issue);
    setIsIssueModalOpen(true);
  };

  const handleResolveIssue = () => {
    if (!selectedIssue) return;
    setComplianceIssues(complianceIssues.map(c => {
      if (c.id === selectedIssue.id) {
        return { ...c, status: 'Resolved' };
      }
      return c;
    }));
    showToast("Issue marked resolved!", "success");
    setIsIssueModalOpen(false);
    setSelectedIssue(null);
  };

  const handlePolicySubmit = (e) => {
    e.preventDefault();
    if (!policyFormData.name) {
      showToast("Policy name is required.", "error");
      return;
    }
    const newPol = {
      id: Date.now(),
      ...policyFormData,
      date: new Date().toISOString().split('T')[0],
      activeCount: "0 employees"
    };
    setPolicies([...policies, newPol]);
    showToast("Corporate Policy created!", "success");
    setIsPolicyModalOpen(false);
  };

  const handleAckSubmit = (e) => {
    e.preventDefault();
    if (!ackFormData.employee) {
      showToast("Employee name is required.", "error");
      return;
    }
    const newAck = {
      id: Date.now(),
      ...ackFormData,
      date: new Date().toISOString().split('T')[0],
      method: "E-Sign"
    };
    setAcknowledgements([newAck, ...acknowledgements]);
    showToast("Acknowledgement logged!", "success");
    setIsAckModalOpen(false);
  };

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
        
        {/* --- AUDITS SUB-TAB --- */}
        {activeSubTab === 'Audits' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Audits Log</h2>
                <p className="text-xs text-gray-400 mt-1">Review internal and vendor compliance audits conducted by certified auditors.</p>
              </div>
              
              <div className="flex items-center space-x-2.5">
                <button 
                  disabled={!isAdmin}
                  onClick={() => setIsAuditModalOpen(true)}
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
                
                {/* Export Dropdown */}
                <div className="relative" ref={exportRef}>
                  <button 
                    onClick={() => setIsExportOpen(!isExportOpen)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800/40 text-gray-300 font-semibold text-xs rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  {isExportOpen && (
                    <div className="absolute right-0 mt-1.5 w-32 rounded-xl bg-[#11161D] border border-gray-800 shadow-2xl py-1.5 z-20">
                      {['PDF', 'Excel', 'CSV'].map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => handleExport(fmt)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-800/60 text-xs font-semibold text-gray-300 hover:text-white"
                        >
                          Export as {fmt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                    {audits.map((audit) => {
                      let badgeStyle = "";
                      if (audit.status === "Completed") {
                        badgeStyle = "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20";
                      } else if (audit.status === "Under Review") {
                        badgeStyle = "bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/20";
                      }

                      return (
                        <tr key={audit.id} className="hover:bg-gray-800/15 transition-colors duration-150 group">
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

        {/* --- COMPLIANCE ISSUES SUB-TAB --- */}
        {activeSubTab === 'Compliance Issues' && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>Compliance Issues raised from Audits (Click row to inspect)</span>
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
                      <th className="py-4 px-6 text-center">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                    {complianceIssues.map((item) => {
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
                          onClick={() => handleOpenIssue(item)}
                          className="hover:bg-gray-800/15 transition-colors duration-150 group cursor-pointer"
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
                          <td className="py-4 px-6 text-center">
                            <Eye className="w-4 h-4 text-gray-500 hover:text-white mx-auto transition-colors" />
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

        {/* --- POLICIES SUB-TAB --- */}
        {activeSubTab === 'Policies' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Corporate Policies</h2>
                <p className="text-xs text-gray-400 mt-1">Review active corporate compliance policies and governance guidelines.</p>
              </div>
              <button 
                onClick={() => setIsPolicyModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#A855F7] text-white font-bold text-xs rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>New Policy</span>
              </button>
            </div>

            <div className="bg-[#11161D] border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#171D26] border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Classification</th>
                    <th className="py-4 px-6">Revision Date</th>
                    <th className="py-4 px-6">Document Version</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                  {policies.map(pol => (
                    <tr key={pol.id} className="hover:bg-gray-800/10">
                      <td className="py-4 px-6 font-semibold text-white">{pol.name}</td>
                      <td className="py-4 px-6">
                        <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-500/20">
                          {pol.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-400 font-mono">{pol.date}</td>
                      <td className="py-4 px-6 text-gray-300 font-mono">{pol.version}</td>
                      <td className="py-4 px-6 text-emerald-400 font-bold">{pol.activeCount} acknowledged</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* --- POLICY ACKNOWLEDGEMENTS SUB-TAB --- */}
        {activeSubTab === 'Policy Acknowledgements' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Acknowledgements Log</h2>
                <p className="text-xs text-gray-400 mt-1">Audit log of employee policy signatures and training module completions.</p>
              </div>
              <button 
                onClick={() => setIsAckModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#A855F7] text-white font-bold text-xs rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Log Acknowledgement</span>
              </button>
            </div>

            <div className="bg-[#11161D] border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#171D26] border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Employee</th>
                    <th className="py-4 px-6">Signed Policy</th>
                    <th className="py-4 px-6 font-mono">Timestamp</th>
                    <th className="py-4 px-6">Signature Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                  {acknowledgements.map(ack => (
                    <tr key={ack.id} className="hover:bg-gray-800/10">
                      <td className="py-4 px-6 font-semibold text-white">{ack.employee}</td>
                      <td className="py-4 px-6 text-gray-400 font-medium">{ack.policy}</td>
                      <td className="py-4 px-6 text-gray-500 font-mono">{ack.date}</td>
                      <td className="py-4 px-6">
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">
                          {ack.method} Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* --- AUDIT LOG CREATION MODAL --- */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Conduct Compliance Audit"
        confirmText="Submit Audit Log"
        confirmColorClass="bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold"
        onConfirm={handleAuditSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Audit Title</label>
            <input
              type="text"
              value={auditFormData.title}
              onChange={(e) => setAuditFormData({ ...auditFormData, title: e.target.value })}
              placeholder="e.g. Q3 Vendor Safety Audit"
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Department</label>
              <select
                value={auditFormData.department}
                onChange={(e) => setAuditFormData({ ...auditFormData, department: e.target.value })}
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
              >
                <option>Manufacturing</option>
                <option>Procurement</option>
                <option>Logistics</option>
                <option>Corporate</option>
                <option>R&D</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Lead Auditor</label>
              <input
                type="text"
                value={auditFormData.auditor}
                onChange={(e) => setAuditFormData({ ...auditFormData, auditor: e.target.value })}
                placeholder="e.g. S. Nair"
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Audit Date</label>
            <input
              type="date"
              value={auditFormData.date}
              onChange={(e) => setAuditFormData({ ...auditFormData, date: e.target.value })}
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-[#9CA3AF] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Key Findings Summary</label>
            <textarea
              rows="3"
              value={auditFormData.findings}
              onChange={(e) => setAuditFormData({ ...auditFormData, findings: e.target.value })}
              placeholder="Detail minor / major compliance issues detected..."
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none focus:border-purple-500"
            ></textarea>
          </div>
        </div>
      </Modal>

      {/* --- COMPLIANCE ISSUE INSPECTOR MODAL --- */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => { setIsIssueModalOpen(false); setSelectedIssue(null); }}
        title="Compliance Issue Detail"
        confirmText={selectedIssue?.status === 'Open' ? "Mark Resolved" : null}
        confirmColorClass="bg-[#22C55E] hover:bg-[#1EAF53] text-black font-bold"
        onConfirm={handleResolveIssue}
      >
        {selectedIssue && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Classification</span>
              <p className="text-xs font-bold text-white mt-0.5">{selectedIssue.issue}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Department</span>
                <p className="text-xs font-semibold text-gray-300 mt-0.5">{selectedIssue.department}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Severity</span>
                <p className="text-xs font-semibold mt-0.5 text-red-400">{selectedIssue.severity}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Responsible Owner</span>
                <p className="text-xs font-semibold text-gray-300 mt-0.5">{selectedIssue.owner}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Resolution Due Date</span>
                <p className="text-xs font-semibold text-gray-300 mt-0.5 font-mono">{selectedIssue.dueDate}</p>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Status</span>
              <p className={`text-xs font-bold mt-0.5 uppercase ${selectedIssue.status === 'Open' ? 'text-red-400' : 'text-emerald-400'}`}>
                {selectedIssue.status}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* --- POLICY ADDITION MODAL --- */}
      <Modal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        title="Draft Corporate Policy"
        confirmText="Create Policy"
        confirmColorClass="bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold"
        onConfirm={handlePolicySubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Policy Name</label>
            <input
              type="text"
              value={policyFormData.name}
              onChange={(e) => setPolicyFormData({ ...policyFormData, name: e.target.value })}
              placeholder="e.g. Fair Trade Sourcing Policy"
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Category</label>
              <select
                value={policyFormData.category}
                onChange={(e) => setPolicyFormData({ ...policyFormData, category: e.target.value })}
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
              >
                <option>Ethics</option>
                <option>Safety</option>
                <option>Disclosure</option>
                <option>Security</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Version</label>
              <input
                type="text"
                value={policyFormData.version}
                onChange={(e) => setPolicyFormData({ ...policyFormData, version: e.target.value })}
                placeholder="e.g. v1.0"
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* --- ACKNOWLEDGEMENT MANUAL LOG MODAL --- */}
      <Modal
        isOpen={isAckModalOpen}
        onClose={() => setIsAckModalOpen(false)}
        title="Log Policy Signature"
        confirmText="Save Log"
        confirmColorClass="bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold"
        onConfirm={handleAckSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Employee Name</label>
            <input
              type="text"
              value={ackFormData.employee}
              onChange={(e) => setAckFormData({ ...ackFormData, employee: e.target.value })}
              placeholder="e.g. Priya Sharma"
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Policy Target</label>
            <select
              value={ackFormData.policy}
              onChange={(e) => setAckFormData({ ...ackFormData, policy: e.target.value })}
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300"
            >
              {policies.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
