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

  // --- ACTIONS HANDLERS ---
  const handleExport = (fmt) => {
    showToast(`Generating ${fmt} export of audit logs...`, "info");
    setTimeout(() => {
      showToast(`Exported audits successfully as ${fmt}!`, "success");
      setIsExportOpen(false);
    }, 900);
  };

  const handleAuditSubmit = (e) => {
    e.preventDefault();
    if (!auditFormData.title || !auditFormData.auditor || !auditFormData.date) {
      showToast("Please fill in title, lead auditor, and date.", "error");
      return;
    }
    const newAudit = {
      id: Date.now(),
      ...auditFormData,
      status: "Under Review"
    };
    setAudits([newAudit, ...audits]);
    showToast("Audit conducted and logged under review.", "success");
    setIsAuditModalOpen(false);
    setAuditFormData({ title: '', department: 'Manufacturing', auditor: '', date: '', findings: '' });
  };

  const handleOpenIssue = (issue) => {
    setSelectedIssue(issue);
    setIsIssueModalOpen(true);
  };

  const handleResolveIssue = () => {
    if (!selectedIssue) return;
    setComplianceIssues(complianceIssues.map(item => {
      if (item.id === selectedIssue.id) {
        return { ...item, status: 'Resolved' };
      }
      return item;
    }));
    showToast("Compliance issue marked as Resolved.", "success");
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
    setPolicyFormData({ name: '', version: 'v1.0', category: 'Ethics' });
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
    setAckFormData({ employee: '', policy: 'Anti-Bribery Policy' });
  };

  const subTabs = ['Policies', 'Policy Acknowledgements', 'Audits', 'Compliance Issues'];

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
                onClick={() => setActiveSubTab(subSection)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-accent-gov text-bg-base shadow-md shadow-accent-gov/10 font-bold' 
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
        
        {/* --- AUDITS SUB-TAB --- */}
        {activeSubTab === 'Audits' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Audits Log</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">Review internal and vendor compliance audits conducted by certified auditors.</p>
              </div>
              
              <div className="flex items-center space-x-2.5">
                <button 
                  disabled={!isAdmin}
                  onClick={() => setIsAuditModalOpen(true)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gov to-purple-600 text-bg-base font-extrabold text-xs rounded-lg transition-all shadow-md shadow-accent-gov/5 ${
                    isAdmin 
                      ? 'hover:brightness-110 active:scale-[0.98] cursor-pointer' 
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="uppercase tracking-wider">New Audit</span>
                </button>
                {!isAdmin && (
                  <span className="text-[9px] text-text-secondary font-bold bg-bg-card border border-border-sage px-2 py-1 rounded-full uppercase tracking-wider">
                    Admin Access Required
                  </span>
                )}
                
                {/* Export Dropdown */}
                <div className="relative" ref={exportRef}>
                  <button 
                    onClick={() => setIsExportOpen(!isExportOpen)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-border-sage hover:border-text-secondary hover:bg-bg-base/40 text-text-primary font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-text-secondary" />
                    <span className="uppercase tracking-wider">Export</span>
                    <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
                  </button>
                  {isExportOpen && (
                    <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-bg-card border border-border-sage shadow-2xl py-1.5 z-20">
                      {['PDF', 'Excel', 'CSV'].map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => handleExport(fmt)}
                          className="w-full text-left px-4 py-2 hover:bg-bg-base/60 text-xs font-semibold text-text-primary hover:text-brand"
                        >
                          Export as {fmt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                  <thead>
                    <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                      <th className="py-4 px-6">Title</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Auditor</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Findings</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-sage/40 text-text-primary">
                    {audits.map((audit) => {
                      let badgeStyle = "";
                      if (audit.status === "Completed") {
                        badgeStyle = "bg-accent-env/10 text-accent-env border border-accent-env/20";
                      } else if (audit.status === "Under Review") {
                        badgeStyle = "bg-accent-gov/10 text-accent-gov border border-accent-gov/20";
                      }

                      return (
                        <tr key={audit.id} className="hover:bg-bg-base/30 transition-colors duration-150 group">
                          <td className="py-4 px-6 font-bold text-text-primary group-hover:text-accent-gov transition-colors font-display">
                            {audit.title}
                          </td>
                          <td className="py-4 px-6 text-text-secondary font-semibold">
                            {audit.department}
                          </td>
                          <td className="py-4 px-6 text-text-primary font-medium">
                            {audit.auditor}
                          </td>
                          <td className="py-4 px-6 text-text-secondary font-mono">
                            {audit.date}
                          </td>
                          <td className="py-4 px-6 text-text-primary font-medium">
                            {audit.findings}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${badgeStyle}`}>
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
            <div className="flex items-center space-x-2 text-[10px] font-extrabold text-text-secondary uppercase tracking-wider pl-1 font-display">
              <ShieldAlert className="w-4 h-4 text-accent-gov" />
              <span>Compliance Issues Raised from Audits (Click row to inspect)</span>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px] text-xs">
                  <thead>
                    <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                      <th className="py-4 px-6">Issue</th>
                      <th className="py-4 px-6">Severity</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-center">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-sage/40 text-text-primary">
                    {complianceIssues.map((item) => {
                      let severityBadge = "";
                      if (item.severity === "High") {
                        severityBadge = "bg-red-500 text-white font-extrabold shadow-sm shadow-red-950/20";
                      } else if (item.severity === "Medium") {
                        severityBadge = "bg-accent-gam text-bg-base font-extrabold shadow-sm shadow-amber-950/20";
                      }

                      let statusBadge = "";
                      if (item.status === "Open") {
                        statusBadge = "border border-red-500 text-red-400 bg-transparent font-bold";
                      } else if (item.status === "Resolved") {
                        statusBadge = "border border-accent-env text-accent-env bg-transparent font-bold";
                      }

                      return (
                        <tr 
                          key={item.id} 
                          onClick={() => handleOpenIssue(item)}
                          className="hover:bg-bg-base/30 transition-colors duration-150 group cursor-pointer"
                        >
                          <td className="py-4 px-6 font-bold text-text-primary group-hover:text-accent-gov transition-colors font-display">
                            {item.issue}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${severityBadge}`}>
                              {item.severity}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-text-secondary font-semibold">
                            {item.department}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${statusBadge}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <Eye className="w-4 h-4 text-text-secondary hover:text-text-primary mx-auto transition-colors" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 pl-1 text-[10px] text-text-secondary/70 font-bold uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5 text-text-secondary mr-1 not-italic" />
              <span>Compliance issues track Responsible Owner + Due Date internally.</span>
            </div>
          </section>
        )}

        {/* --- POLICIES SUB-TAB --- */}
        {activeSubTab === 'Policies' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Corporate Policies</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">Review active corporate compliance policies and governance guidelines.</p>
              </div>
              <button 
                onClick={() => setIsPolicyModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gov to-purple-600 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-gov/5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="uppercase tracking-wider">New Policy</span>
              </button>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Classification</th>
                    <th className="py-4 px-6">Revision Date</th>
                    <th className="py-4 px-6">Document Version</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  {policies.map(pol => (
                    <tr key={pol.id} className="hover:bg-bg-base/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-text-primary font-display">{pol.name}</td>
                      <td className="py-4 px-6">
                        <span className="bg-accent-gov/10 text-accent-gov px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-accent-gov/20">
                          {pol.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-text-secondary font-mono">{pol.date}</td>
                      <td className="py-4 px-6 text-text-primary font-mono">{pol.version}</td>
                      <td className="py-4 px-6 text-accent-env font-bold">{pol.activeCount} acknowledged</td>
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
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Acknowledgements Log</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">Audit log of employee policy signatures and training module completions.</p>
              </div>
              <button 
                onClick={() => setIsAckModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gov to-purple-600 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-gov/5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="uppercase tracking-wider">Log Acknowledgement</span>
              </button>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                    <th className="py-4 px-6">Employee</th>
                    <th className="py-4 px-6">Signed Policy</th>
                    <th className="py-4 px-6 font-mono">Timestamp</th>
                    <th className="py-4 px-6">Signature Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  {acknowledgements.map(ack => (
                    <tr key={ack.id} className="hover:bg-bg-base/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-text-primary font-display">{ack.employee}</td>
                      <td className="py-4 px-6 text-text-secondary font-semibold">{ack.policy}</td>
                      <td className="py-4 px-6 text-text-secondary font-mono">{ack.date}</td>
                      <td className="py-4 px-6">
                        <span className="text-accent-env bg-accent-env/10 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-accent-env/20 uppercase tracking-wider">
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
        confirmColorClass="bg-accent-gov hover:bg-purple-600 text-bg-base font-bold"
        onConfirm={handleAuditSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Audit Title</label>
            <input
              type="text"
              value={auditFormData.title}
              onChange={(e) => setAuditFormData({ ...auditFormData, title: e.target.value })}
              placeholder="e.g. Q3 Vendor Safety Audit"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Department</label>
              <select
                value={auditFormData.department}
                onChange={(e) => setAuditFormData({ ...auditFormData, department: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov"
              >
                <option>Manufacturing</option>
                <option>Procurement</option>
                <option>Logistics</option>
                <option>Corporate</option>
                <option>R&D</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Lead Auditor</label>
              <input
                type="text"
                value={auditFormData.auditor}
                onChange={(e) => setAuditFormData({ ...auditFormData, auditor: e.target.value })}
                placeholder="e.g. S. Nair"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Audit Date</label>
            <input
              type="date"
              value={auditFormData.date}
              onChange={(e) => setAuditFormData({ ...auditFormData, date: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Key Findings Summary</label>
            <textarea
              rows="3"
              value={auditFormData.findings}
              onChange={(e) => setAuditFormData({ ...auditFormData, findings: e.target.value })}
              placeholder="Detail minor / major compliance issues detected..."
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov"
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
        confirmColorClass="bg-accent-env hover:bg-emerald-600 text-bg-base font-bold"
        onConfirm={handleResolveIssue}
      >
        {selectedIssue && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider font-display">Classification</span>
              <p className="text-xs font-bold text-text-primary mt-1 font-display">{selectedIssue.issue}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider font-display">Department</span>
                <p className="text-xs font-semibold text-text-primary mt-1">{selectedIssue.department}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider font-display">Severity</span>
                <p className="text-xs font-bold mt-1 text-red-400 uppercase tracking-wider">{selectedIssue.severity}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider font-display">Responsible Owner</span>
                <p className="text-xs font-semibold text-text-primary mt-1">{selectedIssue.owner}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider font-display">Resolution Due Date</span>
                <p className="text-xs font-semibold text-text-primary mt-1 font-mono">{selectedIssue.dueDate}</p>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider font-display">Status</span>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  selectedIssue.status === 'Open' 
                    ? 'border border-red-500 text-red-400 bg-transparent' 
                    : 'border border-accent-env text-accent-env bg-transparent'
                }`}>
                  {selectedIssue.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* --- CORPORATE POLICY CREATION MODAL --- */}
      <Modal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        title="Formulate Corporate Policy"
        confirmText="Publish Policy"
        confirmColorClass="bg-accent-gov hover:bg-purple-600 text-bg-base font-bold"
        onConfirm={handlePolicySubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Policy Name</label>
            <input
              type="text"
              value={policyFormData.name}
              onChange={(e) => setPolicyFormData({ ...policyFormData, name: e.target.value })}
              placeholder="e.g. Anti-Bribery Policy Statement"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Revision Version</label>
              <input
                type="text"
                value={policyFormData.version}
                onChange={(e) => setPolicyFormData({ ...policyFormData, version: e.target.value })}
                placeholder="e.g. v2.1"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Classification Category</label>
              <select
                value={policyFormData.category}
                onChange={(e) => setPolicyFormData({ ...policyFormData, category: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov"
              >
                <option>Ethics</option>
                <option>Safety</option>
                <option>Disclosure</option>
                <option>Environmental</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* --- POLICY ACKNOWLEDGEMENT MODAL --- */}
      <Modal
        isOpen={isAckModalOpen}
        onClose={() => setIsAckModalOpen(false)}
        title="Log Policy Acknowledgement"
        confirmText="Log Signature"
        confirmColorClass="bg-accent-gov hover:bg-purple-600 text-bg-base font-bold"
        onConfirm={handleAckSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Employee Name</label>
            <input
              type="text"
              value={ackFormData.employee}
              onChange={(e) => setAckFormData({ ...ackFormData, employee: e.target.value })}
              placeholder="e.g. Aditi Rao"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Select Policy</label>
            <select
              value={ackFormData.policy}
              onChange={(e) => setAckFormData({ ...ackFormData, policy: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov"
            >
              {policies.map(pol => (
                <option key={pol.id} value={pol.name}>{pol.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
