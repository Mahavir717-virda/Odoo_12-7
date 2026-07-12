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
import { isIssueOverdue } from '../../utils/calculations';
import Modal from '../../components/Modal';
import { 
  Plus, 
  Download, 
  ChevronDown, 
  Search, 
  Eye,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Calendar
} from 'lucide-react';

export default function Governance() {
  const location = useLocation();
  const { showToast } = useToast();
  const { user, canEdit, canApprove, createNotification } = useAuth();
  
  const [activeSubTab, setActiveSubTab] = useState('Policies');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);

  // Sync state with localStorage
  const [policies, setPolicies] = useState(() => getStorageItem('db_policies', []));
  const [acknowledgements, setAcknowledgements] = useState(() => getStorageItem('db_policy_acks', []));
  const [audits, setAudits] = useState(() => getStorageItem('db_audits', []));
  const [complianceIssues, setComplianceIssues] = useState(() => getStorageItem('db_compliance_issues', []));

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
    setPolicies(getStorageItem('db_policies', []));
    setAcknowledgements(getStorageItem('db_policy_acks', []));
    setAudits(getStorageItem('db_audits', []));
    setComplianceIssues(getStorageItem('db_compliance_issues', []));
    recalculateAllScores();
  };

  // Modals state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditFormData, setAuditFormData] = useState({ title: '', department: 'Manufacturing', auditor: '', date: '', findings: '' });

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // New compliance issue modal
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [newIssueFormData, setNewIssueFormData] = useState({ title: '', severity: 'Medium', department: 'Manufacturing', dueDate: '', assignee: '' });

  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyFormData, setPolicyFormData] = useState({ name: '', desc: '', version: 'v1.0', category: 'Ethics', targetAcks: 200 });

  const [isAckModalOpen, setIsAckModalOpen] = useState(false);
  const [ackFormData, setAckFormData] = useState({ employee: '', policy: 'Code of Supplier Conduct' });

  const handleExport = (fmt) => {
    showToast(`Generating ${fmt} export of governance logs...`, "info");
    setTimeout(() => {
      showToast(`Exported successfully as ${fmt}!`, "success");
      setIsExportOpen(false);
    }, 900);
  };

  const handleAuditSubmit = (e) => {
    e.preventDefault();
    if (!auditFormData.title || !auditFormData.auditor || !auditFormData.date) {
      showToast("Please fill in title, auditor, and date.", "error");
      return;
    }

    if (!canEdit('governance')) {
      showToast("You do not have permission to log audits.", "error");
      return;
    }

    const list = getStorageItem('db_audits', []);
    const newAudit = {
      id: Date.now(),
      name: auditFormData.title,
      auditor: auditFormData.auditor,
      date: auditFormData.date,
      findings: parseInt(auditFormData.findings) || 0,
      status: "Under Review"
    };

    setStorageItem('db_audits', [newAudit, ...list]);
    createNotification('all', 'info', `New audit logged: ${newAudit.name}`);
    showToast("Audit conducted and logged successfully.", "success");
    setIsAuditModalOpen(false);
    setAuditFormData({ title: '', department: 'Manufacturing', auditor: '', date: '', findings: '' });
    refreshData();
  };

  const handleOpenIssue = (issue) => {
    setSelectedIssue(issue);
    setIsIssueModalOpen(true);
  };

  const handleResolveIssue = () => {
    if (!selectedIssue) return;
    if (!canApprove('governance')) {
      showToast("You do not have permission to resolve compliance issues.", "error");
      return;
    }

    const list = getStorageItem('db_compliance_issues', []);
    const updated = list.map(item => {
      if (item.id === selectedIssue.id) {
        return { ...item, status: 'Resolved' };
      }
      return item;
    });

    setStorageItem('db_compliance_issues', updated);
    createNotification('all', 'success', `Compliance issue Resolved: ${selectedIssue.title}`);
    showToast("Compliance issue marked as Resolved.", "success");
    setIsIssueModalOpen(false);
    setSelectedIssue(null);
    refreshData();
  };

  const handleNewIssueSubmit = (e) => {
    e.preventDefault();
    if (!newIssueFormData.title || !newIssueFormData.dueDate) {
      showToast("Please fill in title and due date.", "error");
      return;
    }

    if (!canEdit('governance')) {
      showToast("You do not have permission to file compliance issues.", "error");
      return;
    }

    const list = getStorageItem('db_compliance_issues', []);
    const newIssue = {
      id: Date.now(),
      title: newIssueFormData.title,
      severity: newIssueFormData.severity,
      department: newIssueFormData.department,
      dueDate: newIssueFormData.dueDate,
      status: "Open",
      assignee: newIssueFormData.assignee || "Unassigned"
    };

    setStorageItem('db_compliance_issues', [...list, newIssue]);
    createNotification('all', 'warning', `New Compliance Issue filed: ${newIssue.title}`);
    showToast("Compliance issue filed successfully!", "success");
    setIsNewIssueModalOpen(false);
    setNewIssueFormData({ title: '', severity: 'Medium', department: 'Manufacturing', dueDate: '', assignee: '' });
    refreshData();
  };

  const handlePolicySubmit = (e) => {
    e.preventDefault();
    if (!policyFormData.name) {
      showToast("Policy name is required.", "error");
      return;
    }

    if (!canEdit('governance')) {
      showToast("You do not have permission to publish policies.", "error");
      return;
    }

    const list = getStorageItem('db_policies', []);
    const newPol = {
      id: Date.now(),
      name: policyFormData.name,
      desc: policyFormData.desc || "Corporate Governance Policy standard guidelines.",
      effectiveDate: new Date().toISOString().split('T')[0],
      targetAcks: parseInt(policyFormData.targetAcks) || 200,
      currentAcks: 0,
      status: "Active"
    };

    setStorageItem('db_policies', [...list, newPol]);
    createNotification('all', 'info', `New ESG Policy Formulated: ${newPol.name}`);
    showToast("Corporate Policy formulated successfully!", "success");
    setIsPolicyModalOpen(false);
    setPolicyFormData({ name: '', desc: '', version: 'v1.0', category: 'Ethics', targetAcks: 200 });
    refreshData();
  };

  const handleAckSubmit = (e) => {
    e.preventDefault();
    if (!ackFormData.employee) {
      showToast("Employee name is required.", "error");
      return;
    }

    const list = getStorageItem('db_policy_acks', []);
    const newAck = {
      id: Date.now(),
      employee: ackFormData.employee,
      department: user?.department || "Corporate",
      policy: ackFormData.policy,
      ackDate: new Date().toISOString().split('T')[0]
    };

    setStorageItem('db_policy_acks', [newAck, ...list]);

    // Increment acknowledgment count on policy
    const policyList = getStorageItem('db_policies', []);
    const updatedPolicies = policyList.map(pol => {
      if (pol.name === ackFormData.policy) {
        return { ...pol, currentAcks: (pol.currentAcks || 0) + 1 };
      }
      return pol;
    });
    setStorageItem('db_policies', updatedPolicies);

    createNotification(user?.id, 'success', `Acknowledged policy: ${ackFormData.policy}`);
    showToast("Acknowledgement logged successfully!", "success");
    setIsAckModalOpen(false);
    refreshData();
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
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Governance Audits</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">Review internal and vendor compliance audits conducted by certified auditors.</p>
              </div>
              
              <div className="flex items-center space-x-2.5">
                <div>
                  <button 
                    onClick={() => { if (canEdit('governance')) setIsAuditModalOpen(true); }}
                    disabled={!canEdit('governance')}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gov to-purple-600 text-bg-base font-extrabold text-xs rounded-lg transition-all shadow-md shadow-accent-gov/5 cursor-pointer ${
                      !canEdit('governance') ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:brightness-110 active:scale-[0.98]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span className="uppercase tracking-wider">New Audit</span>
                  </button>
                  {!canEdit('governance') && (
                    <p className="text-[10px] text-text-secondary/70 mt-1 font-bold">Requires Compliance Team access</p>
                  )}
                </div>
                
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
                      <th className="py-4 px-6">Auditor / Firm</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6 text-right">Findings Count</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-sage/40 text-text-primary">
                    {audits.map((audit) => {
                      let badgeStyle = "";
                      if (audit.status === "Completed") {
                        badgeStyle = "bg-accent-env/10 text-accent-env border border-accent-env/20";
                      } else {
                        badgeStyle = "bg-accent-gov/10 text-accent-gov border border-accent-gov/20";
                      }

                      return (
                        <tr key={audit.id} className="hover:bg-bg-base/30 transition-colors duration-150 group">
                          <td className="py-4 px-6 font-bold text-text-primary group-hover:text-accent-gov transition-colors font-display">
                            {audit.name}
                          </td>
                          <td className="py-4 px-6 text-text-primary font-medium">
                            {audit.auditor}
                          </td>
                          <td className="py-4 px-6 text-text-secondary font-mono">
                            {audit.date}
                          </td>
                          <td className="py-4 px-6 text-right text-text-primary font-bold font-mono">
                            {audit.findings} findings
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[10px] font-extrabold text-text-secondary uppercase tracking-wider pl-1 font-display">
                <ShieldAlert className="w-4 h-4 text-accent-gov" />
                <span>Compliance Issues (Click row to inspect)</span>
              </div>
              
              <div>
                <button 
                  onClick={() => { if (canEdit('governance')) setIsNewIssueModalOpen(true); }}
                  disabled={!canEdit('governance')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gov to-purple-600 text-bg-base font-extrabold text-xs rounded-lg transition-all shadow-md shadow-accent-gov/5 cursor-pointer ${
                    !canEdit('governance') ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:brightness-110 active:scale-[0.98]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="uppercase tracking-wider">File Issue</span>
                </button>
                {!canEdit('governance') && (
                  <p className="text-[10px] text-text-secondary/70 mt-1 font-bold">Requires Compliance Team access</p>
                )}
              </div>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px] text-xs">
                  <thead>
                    <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                      <th className="py-4 px-6">Issue</th>
                      <th className="py-4 px-6">Severity</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Due Date</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-center">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-sage/40 text-text-primary">
                    {complianceIssues.map((item) => {
                      let severityBadge = "";
                      if (item.severity === "High") {
                        severityBadge = "bg-red-500 text-white font-extrabold shadow-sm shadow-red-950/20";
                      } else {
                        severityBadge = "bg-accent-gam text-bg-base font-extrabold shadow-sm shadow-amber-950/20";
                      }

                      let statusBadge = "";
                      if (item.status === "Open") {
                        statusBadge = "border border-red-500 text-red-400 bg-transparent font-bold";
                      } else {
                        statusBadge = "border border-accent-env text-accent-env bg-transparent font-bold";
                      }

                      const overdue = isIssueOverdue(item.dueDate) && item.status !== 'Resolved';

                      return (
                        <tr 
                          key={item.id} 
                          onClick={() => handleOpenIssue(item)}
                          className="hover:bg-bg-base/30 transition-colors duration-150 group cursor-pointer"
                        >
                          <td className="py-4 px-6 font-bold text-text-primary group-hover:text-accent-gov transition-colors font-display">
                            <span className="flex items-center space-x-2">
                              <span>{item.title}</span>
                              {overdue && (
                                <span className="flex items-center text-[9px] bg-red-500/20 text-red-400 border border-red-500/35 px-1.5 py-0.5 rounded font-extrabold font-sans">
                                  ⚠️ OVERDUE
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${severityBadge}`}>
                              {item.severity}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-text-secondary font-semibold">
                            {item.department}
                          </td>
                          <td className={`py-4 px-6 font-mono font-medium ${overdue ? 'text-red-400 font-bold' : 'text-text-secondary'}`}>
                            {item.dueDate}
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
              
              <div>
                <button 
                  onClick={() => { if (canEdit('governance')) setIsPolicyModalOpen(true); }}
                  disabled={!canEdit('governance')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gov to-purple-600 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-gov/5 ${
                    !canEdit('governance') ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:brightness-110 active:scale-[0.98]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="uppercase tracking-wider">New Policy</span>
                </button>
                {!canEdit('governance') && (
                  <p className="text-[10px] text-text-secondary/70 mt-1 font-bold">Requires Compliance Team access</p>
                )}
              </div>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Effective Date</th>
                    <th className="py-4 px-6">Acks Target / Completed</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  {policies.map(pol => (
                    <tr key={pol.id} className="hover:bg-bg-base/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-text-primary font-display">{pol.name}</td>
                      <td className="py-4 px-6 text-text-secondary font-medium">{pol.desc}</td>
                      <td className="py-4 px-6 text-text-secondary font-mono">{pol.effectiveDate}</td>
                      <td className="py-4 px-6 text-text-primary font-semibold">
                        {pol.currentAcks || 0} / {pol.targetAcks} ( {Math.round(((pol.currentAcks || 0) / pol.targetAcks) * 100)}% )
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-accent-env bg-accent-env/10 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-accent-env/20 uppercase tracking-wider">
                          {pol.status}
                        </span>
                      </td>
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
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gov to-purple-600 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-gov/5 hover:brightness-110"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="uppercase tracking-wider">Sign Policy</span>
              </button>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                    <th className="py-4 px-6">Employee</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6">Signed Policy</th>
                    <th className="py-4 px-6 font-mono">Timestamp</th>
                    <th className="py-4 px-6">Signature Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  {acknowledgements.map(ack => (
                    <tr key={ack.id} className="hover:bg-bg-base/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-text-primary font-display">{ack.employee}</td>
                      <td className="py-4 px-6 text-text-secondary font-semibold">{ack.department}</td>
                      <td className="py-4 px-6 text-text-secondary font-semibold">{ack.policy}</td>
                      <td className="py-4 px-6 text-text-secondary font-mono">{ack.ackDate}</td>
                      <td className="py-4 px-6">
                        <span className="text-accent-env bg-accent-env/10 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-accent-env/20 uppercase tracking-wider">
                          E-Sign Verified
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
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Lead Auditor</label>
              <input
                type="text"
                value={auditFormData.auditor}
                onChange={(e) => setAuditFormData({ ...auditFormData, auditor: e.target.value })}
                placeholder="e.g. S. Nair"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov"
              />
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
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Findings Count</label>
            <input
              type="number"
              value={auditFormData.findings}
              onChange={(e) => setAuditFormData({ ...auditFormData, findings: e.target.value })}
              placeholder="e.g. 3"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov"
            />
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
              <p className="text-xs font-bold text-text-primary mt-1 font-display">{selectedIssue.title}</p>
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
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider font-display">Responsible Assignee</span>
                <p className="text-xs font-semibold text-text-primary mt-1">{selectedIssue.assignee}</p>
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
            
            {/* Show error note inside inspector modal if user has no resolve access */}
            {selectedIssue.status === 'Open' && !canApprove('governance') && (
              <p className="text-[10px] text-red-400 font-bold pt-2 border-t border-border-sage/30">
                🔒 Resolving compliance issues requires Compliance Team / Admin access.
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* --- FILE NEW COMPLIANCE ISSUE MODAL --- */}
      <Modal
        isOpen={isNewIssueModalOpen}
        onClose={() => setIsNewIssueModalOpen(false)}
        title="File Governance Compliance Issue"
        confirmText="File Issue"
        confirmColorClass="bg-accent-gov hover:bg-purple-600 text-bg-base font-bold"
        onConfirm={handleNewIssueSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Issue Classification Title</label>
            <input
              type="text"
              value={newIssueFormData.title}
              onChange={(e) => setNewIssueFormData({ ...newIssueFormData, title: e.target.value })}
              placeholder="e.g. Fuel Log Reporting Gap"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Department</label>
              <select
                value={newIssueFormData.department}
                onChange={(e) => setNewIssueFormData({ ...newIssueFormData, department: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov"
              >
                <option>Sales</option>
                <option>Manufacturing</option>
                <option>Logistics</option>
                <option>Corporate</option>
                <option>R&D</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Severity</label>
              <select
                value={newIssueFormData.severity}
                onChange={(e) => setNewIssueFormData({ ...newIssueFormData, severity: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Assignee</label>
              <input
                type="text"
                value={newIssueFormData.assignee}
                onChange={(e) => setNewIssueFormData({ ...newIssueFormData, assignee: e.target.value })}
                placeholder="e.g. R. Iyer"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Due Date</label>
              <input
                type="date"
                value={newIssueFormData.dueDate}
                onChange={(e) => setNewIssueFormData({ ...newIssueFormData, dueDate: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov"
              />
            </div>
          </div>
        </div>
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
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Description</label>
            <input
              type="text"
              value={policyFormData.desc}
              onChange={(e) => setPolicyFormData({ ...policyFormData, desc: e.target.value })}
              placeholder="Provide a brief summary of the policy guidelines..."
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Target Acknowledgements</label>
              <input
                type="number"
                value={policyFormData.targetAcks}
                onChange={(e) => setPolicyFormData({ ...policyFormData, targetAcks: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov"
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
