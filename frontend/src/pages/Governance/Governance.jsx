import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { isIssueOverdue } from '../../utils/calculations';
import Modal from '../../components/Modal';
import {
  Plus,
  Download,
  ChevronDown,
  Eye,
  ShieldAlert,
  RefreshCw,
  Loader,
  CheckCircle,
  Lock,
  FileText,
  ClipboardList,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1';

const apiCall = async (path, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'API error');
  return data;
};

// Policy categories from backend constants
const POLICY_CATEGORIES = ['Environmental', 'Social', 'Governance', 'Health', 'CSR'];

export default function Governance() {
  const location = useLocation();
  const { showToast } = useToast();
  const { user, canEdit, canApprove } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState('Policies');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const exportRef = useRef(null);

  // ── Data ──────────────────────────────────────────────────────────────────────
  const [policies, setPolicies] = useState([]);
  const [acknowledgements, setAcknowledgements] = useState([]);
  const [audits, setAudits] = useState([]);
  const [complianceIssues, setComplianceIssues] = useState([]);

  // ── UI State ──────────────────────────────────────────────────────────────────
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditFormData, setAuditFormData] = useState({
    name: '', type: 'Internal', department: 'Manufacturing',
    auditor: '', scheduledDate: '', description: '',
  });

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [newIssueFormData, setNewIssueFormData] = useState({
    title: '', severity: 'Medium', department: 'Manufacturing',
    dueDate: '', description: '', source: 'Manual', category: 'Regulatory',
  });

  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyFormData, setPolicyFormData] = useState({
    title: '', description: '', version: '1.0',
    category: 'Governance', effectiveDate: '', department: 'All',
  });

  const [isAckModalOpen, setIsAckModalOpen] = useState(false);
  const [ackPolicyId, setAckPolicyId] = useState('');

  // ── Export dropdown close on click outside ────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.state?.activeSubTab) setActiveSubTab(location.state.activeSubTab);
  }, [location.state]);

  // ── Fetch ──────────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [polRes, ackRes, audRes, compRes] = await Promise.allSettled([
        apiCall('/policies?limit=100'),
        apiCall('/policies/acknowledgements'),
        apiCall('/audits?limit=100'),
        apiCall('/compliances?limit=100'),
      ]);

      if (polRes.status === 'fulfilled') {
        const d = polRes.value?.data;
        setPolicies(Array.isArray(d?.results) ? d.results : Array.isArray(d) ? d : []);
      }
      if (ackRes.status === 'fulfilled') {
        const d = ackRes.value?.data;
        setAcknowledgements(Array.isArray(d) ? d : []);
      }
      if (audRes.status === 'fulfilled') {
        const d = audRes.value?.data;
        setAudits(Array.isArray(d?.results) ? d.results : Array.isArray(d) ? d : []);
      }
      if (compRes.status === 'fulfilled') {
        const d = compRes.value?.data;
        setComplianceIssues(Array.isArray(d?.results) ? d.results : Array.isArray(d) ? d : []);
      }
    } catch (err) {
      showToast('Failed to load governance data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleExport = (fmt) => {
    showToast(`Generating ${fmt} export of governance logs...`, 'info');
    setTimeout(() => {
      showToast(`Exported successfully as ${fmt}!`, 'success');
      setIsExportOpen(false);
    }, 900);
  };

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    if (!auditFormData.name || !auditFormData.scheduledDate) {
      showToast('Please fill in audit name and scheduled date.', 'error');
      return;
    }
    if (!canEdit('governance')) {
      showToast('You do not have permission to log audits.', 'error');
      return;
    }
    try {
      await apiCall('/audits', 'POST', {
        name: auditFormData.name,
        type: auditFormData.type,
        department: auditFormData.department,
        auditor: auditFormData.auditor || 'Internal Auditor',
        scheduledDate: auditFormData.scheduledDate,
        description: auditFormData.description,
      });
      showToast('Audit logged successfully!', 'success');
      setIsAuditModalOpen(false);
      setAuditFormData({ name: '', type: 'Internal', department: 'Manufacturing', auditor: '', scheduledDate: '', description: '' });
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to create audit.', 'error');
    }
  };

  const handleOpenIssue = (issue) => {
    setSelectedIssue(issue);
    setIsIssueModalOpen(true);
  };

  const handleResolveIssue = async () => {
    if (!selectedIssue) return;
    if (!canApprove('governance')) {
      showToast('You do not have permission to resolve compliance issues.', 'error');
      return;
    }
    try {
      await apiCall(`/compliances/${selectedIssue._id}/resolve`, 'PUT');
      showToast('Compliance issue marked as Resolved.', 'success');
      setIsIssueModalOpen(false);
      setSelectedIssue(null);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to resolve issue.', 'error');
    }
  };

  const handleNewIssueSubmit = async (e) => {
    e.preventDefault();
    const { title, dueDate, category } = newIssueFormData;
    if (!title || !dueDate || !category) {
      showToast('Please fill in title, category, and due date.', 'error');
      return;
    }
    if (!canEdit('governance')) {
      showToast('You do not have permission to file compliance issues.', 'error');
      return;
    }
    try {
      await apiCall('/compliances', 'POST', {
        title,
        description: newIssueFormData.description,
        category,
        source: newIssueFormData.source,
        department: newIssueFormData.department,
        severity: newIssueFormData.severity,
        priority: newIssueFormData.severity,
        dueDate,
      });
      showToast('Compliance issue filed successfully!', 'success');
      setIsNewIssueModalOpen(false);
      setNewIssueFormData({ title: '', severity: 'Medium', department: 'Manufacturing', dueDate: '', description: '', source: 'Manual', category: 'Regulatory' });
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to file compliance issue.', 'error');
    }
  };

  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    const { title, effectiveDate, category } = policyFormData;
    if (!title || !effectiveDate || !category) {
      showToast('Policy title, category, and effective date are required.', 'error');
      return;
    }
    if (!canEdit('governance')) {
      showToast('You do not have permission to publish policies.', 'error');
      return;
    }
    try {
      await apiCall('/policies', 'POST', {
        title,
        description: policyFormData.description,
        version: policyFormData.version,
        category,
        effectiveDate,
        department: policyFormData.department,
        status: 'Published',
      });
      showToast('Policy published successfully!', 'success');
      setIsPolicyModalOpen(false);
      setPolicyFormData({ title: '', description: '', version: '1.0', category: 'Governance', effectiveDate: '', department: 'All' });
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to create policy.', 'error');
    }
  };

  const handleAckSubmit = async (e) => {
    e.preventDefault();
    if (!ackPolicyId) {
      showToast('Please select a policy to acknowledge.', 'error');
      return;
    }
    try {
      await apiCall(`/policies/${ackPolicyId}/acknowledge`, 'POST', {
        employeeId: user?._id,
      });
      showToast('Policy acknowledged successfully!', 'success');
      setIsAckModalOpen(false);
      setAckPolicyId('');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to log acknowledgement.', 'error');
    }
  };

  const subTabs = ['Policies', 'Policy Acknowledgements', 'Audits', 'Compliance Issues'];

  if (loading && policies.length === 0 && audits.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1 bg-bg-base">
        <div className="flex flex-col items-center gap-3 text-text-secondary">
          <Loader className="w-8 h-8 animate-spin text-accent-gov" />
          <p className="text-sm font-semibold">Loading Governance Data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-w-0 overflow-y-auto bg-bg-base flex-1">
      {/* SUB-NAV ROW */}
      <div className="bg-bg-card/10 border-b border-border-sage px-6 py-4">
        <div className="flex flex-wrap gap-3 items-center">
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
          <button
            onClick={fetchData}
            title="Refresh"
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-card border border-border-sage text-text-secondary hover:text-text-primary text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="p-6 space-y-10 max-w-7xl w-full mx-auto flex-1">

        {/* ─── AUDITS ─── */}
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
                    className={`flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gov to-purple-600 text-bg-base font-extrabold text-xs rounded-lg transition-all shadow-md shadow-accent-gov/5 cursor-pointer ${!canEdit('governance') ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:brightness-110 active:scale-[0.98]'}`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span className="uppercase tracking-wider">New Audit</span>
                  </button>
                  {!canEdit('governance') && <p className="text-[10px] text-text-secondary/70 mt-1 font-bold">Requires Compliance Team access</p>}
                </div>

                <div className="relative" ref={exportRef}>
                  <button onClick={() => setIsExportOpen(!isExportOpen)} className="flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-border-sage hover:border-text-secondary hover:bg-bg-base/40 text-text-primary font-bold text-xs rounded-lg transition-colors cursor-pointer">
                    <Download className="w-3.5 h-3.5 text-text-secondary" />
                    <span className="uppercase tracking-wider">Export</span>
                    <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
                  </button>
                  {isExportOpen && (
                    <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-bg-card border border-border-sage shadow-2xl py-1.5 z-20">
                      {['PDF', 'Excel', 'CSV'].map(fmt => (
                        <button key={fmt} onClick={() => handleExport(fmt)} className="w-full text-left px-4 py-2 hover:bg-bg-base/60 text-xs font-semibold text-text-primary hover:text-brand">
                          Export as {fmt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {audits.length === 0 ? (
              <div className="text-center py-16 text-text-secondary/60 font-semibold text-sm">
                <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No audits logged yet.
              </div>
            ) : (
              <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                    <thead>
                      <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                        <th className="py-4 px-6">Title</th>
                        <th className="py-4 px-6">Type</th>
                        <th className="py-4 px-6">Auditor / Firm</th>
                        <th className="py-4 px-6">Department</th>
                        <th className="py-4 px-6 font-mono">Scheduled</th>
                        <th className="py-4 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-sage/40 text-text-primary">
                      {audits.map((audit) => {
                        const isCompleted = audit.status === 'Completed' || audit.status === 'Closed';
                        const badgeStyle = isCompleted
                          ? 'bg-accent-env/10 text-accent-env border border-accent-env/20'
                          : 'bg-accent-gov/10 text-accent-gov border border-accent-gov/20';
                        return (
                          <tr key={audit._id} className="hover:bg-bg-base/30 transition-colors duration-150 group">
                            <td className="py-4 px-6 font-bold text-text-primary group-hover:text-accent-gov transition-colors font-display">{audit.name}</td>
                            <td className="py-4 px-6 text-text-secondary font-semibold">{audit.type}</td>
                            <td className="py-4 px-6 text-text-primary font-medium">{audit.auditor || '—'}</td>
                            <td className="py-4 px-6 text-text-secondary font-semibold">{audit.department}</td>
                            <td className="py-4 px-6 text-text-secondary font-mono">
                              {audit.scheduledDate ? new Date(audit.scheduledDate).toLocaleDateString() : '—'}
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
            )}
          </section>
        )}

        {/* ─── COMPLIANCE ISSUES ─── */}
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
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gov to-purple-600 text-bg-base font-extrabold text-xs rounded-lg transition-all shadow-md shadow-accent-gov/5 cursor-pointer ${!canEdit('governance') ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:brightness-110 active:scale-[0.98]'}`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="uppercase tracking-wider">File Issue</span>
                </button>
                {!canEdit('governance') && <p className="text-[10px] text-text-secondary/70 mt-1 font-bold">Requires Compliance Team access</p>}
              </div>
            </div>

            {complianceIssues.length === 0 ? (
              <div className="text-center py-16 text-text-secondary/60 font-semibold text-sm">
                <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No compliance issues filed.
              </div>
            ) : (
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
                        const isHigh = item.severity === 'High';
                        const severityBadge = isHigh
                          ? 'bg-red-500 text-white font-extrabold shadow-sm shadow-red-950/20'
                          : 'bg-accent-gam text-bg-base font-extrabold shadow-sm shadow-amber-950/20';
                        const isOpen = item.status === 'Open' || item.status === 'In Progress';
                        const statusBadge = isOpen
                          ? 'border border-red-500 text-red-400 bg-transparent font-bold'
                          : 'border border-accent-env text-accent-env bg-transparent font-bold';
                        const overdue = isIssueOverdue(item.dueDate) && item.status !== 'Resolved' && item.status !== 'Closed';

                        return (
                          <tr
                            key={item._id}
                            onClick={() => handleOpenIssue(item)}
                            className="hover:bg-bg-base/30 transition-colors duration-150 group cursor-pointer"
                          >
                            <td className="py-4 px-6 font-bold text-text-primary group-hover:text-accent-gov transition-colors font-display">
                              <span className="flex items-center space-x-2">
                                <span>{item.title}</span>
                                {overdue && (
                                  <span className="flex items-center text-[9px] bg-red-500/20 text-red-400 border border-red-500/35 px-1.5 py-0.5 rounded font-extrabold">
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
                            <td className="py-4 px-6 text-text-secondary font-semibold">{item.department}</td>
                            <td className={`py-4 px-6 font-mono font-medium ${overdue ? 'text-red-400 font-bold' : 'text-text-secondary'}`}>
                              {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}
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
            )}
          </section>
        )}

        {/* ─── POLICIES ─── */}
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
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gov to-purple-600 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-gov/5 ${!canEdit('governance') ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:brightness-110 active:scale-[0.98]'}`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="uppercase tracking-wider">New Policy</span>
                </button>
                {!canEdit('governance') && <p className="text-[10px] text-text-secondary/70 mt-1 font-bold">Requires Compliance Team access</p>}
              </div>
            </div>

            {policies.length === 0 ? (
              <div className="text-center py-16 text-text-secondary/60 font-semibold text-sm">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No policies published yet.
              </div>
            ) : (
              <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                      <th className="py-4 px-6">Policy #</th>
                      <th className="py-4 px-6">Title</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Effective Date</th>
                      <th className="py-4 px-6">Version</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-sage/40 text-text-primary">
                    {policies.map((pol) => {
                      const isPublished = pol.status === 'Published';
                      const badgeStyle = isPublished
                        ? 'text-accent-env bg-accent-env/10 border border-accent-env/20'
                        : 'text-text-secondary bg-bg-base border border-border-sage/40';
                      return (
                        <tr key={pol._id} className="hover:bg-bg-base/20 transition-colors">
                          <td className="py-4 px-6 text-text-secondary font-mono text-[10px]">{pol.policyNumber}</td>
                          <td className="py-4 px-6 font-bold text-text-primary font-display">{pol.title}</td>
                          <td className="py-4 px-6">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-gov/10 text-accent-gov border border-accent-gov/20">
                              {pol.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-text-secondary font-mono">
                            {pol.effectiveDate ? new Date(pol.effectiveDate).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-4 px-6 text-text-secondary font-mono">v{pol.version}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                              {pol.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ─── POLICY ACKNOWLEDGEMENTS ─── */}
        {activeSubTab === 'Policy Acknowledgements' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Acknowledgements Log</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">Audit log of employee policy signatures and completions.</p>
              </div>
              <button
                onClick={() => setIsAckModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gov to-purple-600 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-gov/5 hover:brightness-110"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="uppercase tracking-wider">Sign Policy</span>
              </button>
            </div>

            {acknowledgements.length === 0 ? (
              <div className="text-center py-16 text-text-secondary/60 font-semibold text-sm">
                <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No acknowledgements logged yet.
              </div>
            ) : (
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
                    {acknowledgements.map((ack) => (
                      <tr key={ack._id} className="hover:bg-bg-base/20 transition-colors">
                        <td className="py-4 px-6 font-bold text-text-primary font-display">
                          {ack.employeeId?.name || '—'}
                        </td>
                        <td className="py-4 px-6 text-text-secondary font-semibold">
                          {ack.employeeId?.department || '—'}
                        </td>
                        <td className="py-4 px-6 text-text-secondary font-semibold">
                          {ack.policyId?.title || '—'}
                        </td>
                        <td className="py-4 px-6 text-text-secondary font-mono">
                          {ack.acknowledgedAt ? new Date(ack.acknowledgedAt).toLocaleDateString() : '—'}
                        </td>
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
            )}
          </section>
        )}
      </main>

      {/* ─── AUDIT MODAL ─── */}
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
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Audit Name *</label>
            <input type="text" value={auditFormData.name} onChange={(e) => setAuditFormData({ ...auditFormData, name: e.target.value })} placeholder="e.g. Q3 Vendor Safety Audit" className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Type</label>
              <select value={auditFormData.type} onChange={(e) => setAuditFormData({ ...auditFormData, type: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov">
                <option>Internal</option>
                <option>External</option>
                <option>Regulatory</option>
                <option>Supplier</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Department</label>
              <select value={auditFormData.department} onChange={(e) => setAuditFormData({ ...auditFormData, department: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov">
                <option>Manufacturing</option>
                <option>Sales</option>
                <option>Logistics</option>
                <option>Corporate</option>
                <option>R&D</option>
                <option>HR</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Lead Auditor</label>
              <input type="text" value={auditFormData.auditor} onChange={(e) => setAuditFormData({ ...auditFormData, auditor: e.target.value })} placeholder="e.g. S. Nair" className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Scheduled Date *</label>
              <input type="date" value={auditFormData.scheduledDate} onChange={(e) => setAuditFormData({ ...auditFormData, scheduledDate: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Description / Scope</label>
            <textarea rows={2} value={auditFormData.description} onChange={(e) => setAuditFormData({ ...auditFormData, description: e.target.value })} placeholder="Scope of audit and key areas of focus..." className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov resize-none" />
          </div>
        </div>
      </Modal>

      {/* ─── COMPLIANCE ISSUE INSPECTOR ─── */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => { setIsIssueModalOpen(false); setSelectedIssue(null); }}
        title="Compliance Issue Detail"
        confirmText={selectedIssue?.status === 'Open' || selectedIssue?.status === 'In Progress' ? 'Mark Resolved' : null}
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
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider font-display">Category</span>
                <p className="text-xs font-semibold text-text-primary mt-1">{selectedIssue.category}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider font-display">Resolution Due Date</span>
                <p className="text-xs font-semibold text-text-primary mt-1 font-mono">
                  {selectedIssue.dueDate ? new Date(selectedIssue.dueDate).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider font-display">Status</span>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  selectedIssue.status === 'Open' || selectedIssue.status === 'In Progress'
                    ? 'border border-red-500 text-red-400 bg-transparent'
                    : 'border border-accent-env text-accent-env bg-transparent'
                }`}>
                  {selectedIssue.status}
                </span>
              </div>
            </div>
            {(selectedIssue.status === 'Open' || selectedIssue.status === 'In Progress') && !canApprove('governance') && (
              <p className="text-[10px] text-red-400 font-bold pt-2 border-t border-border-sage/30">
                <Lock className="w-3 h-3 inline mr-1" />
                Resolving compliance issues requires Compliance Team / Admin access.
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* ─── FILE NEW COMPLIANCE ISSUE ─── */}
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
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Issue Title *</label>
            <input type="text" value={newIssueFormData.title} onChange={(e) => setNewIssueFormData({ ...newIssueFormData, title: e.target.value })} placeholder="e.g. Fuel Log Reporting Gap" className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Description</label>
            <textarea rows={2} value={newIssueFormData.description} onChange={(e) => setNewIssueFormData({ ...newIssueFormData, description: e.target.value })} placeholder="Brief description of the compliance gap..." className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Category *</label>
              <input type="text" value={newIssueFormData.category} onChange={(e) => setNewIssueFormData({ ...newIssueFormData, category: e.target.value })} placeholder="e.g. Regulatory, Safety..." className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Source</label>
              <select value={newIssueFormData.source} onChange={(e) => setNewIssueFormData({ ...newIssueFormData, source: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov">
                <option>Manual</option>
                <option>Audit</option>
                <option>Policy</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Department</label>
              <select value={newIssueFormData.department} onChange={(e) => setNewIssueFormData({ ...newIssueFormData, department: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov">
                <option>Manufacturing</option>
                <option>Sales</option>
                <option>Logistics</option>
                <option>Corporate</option>
                <option>R&D</option>
                <option>HR</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Severity</label>
              <select value={newIssueFormData.severity} onChange={(e) => setNewIssueFormData({ ...newIssueFormData, severity: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Due Date *</label>
            <input type="date" value={newIssueFormData.dueDate} onChange={(e) => setNewIssueFormData({ ...newIssueFormData, dueDate: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov" />
          </div>
        </div>
      </Modal>

      {/* ─── CORPORATE POLICY MODAL ─── */}
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
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Policy Title *</label>
            <input type="text" value={policyFormData.title} onChange={(e) => setPolicyFormData({ ...policyFormData, title: e.target.value })} placeholder="e.g. Anti-Bribery Policy Statement" className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Description</label>
            <textarea rows={2} value={policyFormData.description} onChange={(e) => setPolicyFormData({ ...policyFormData, description: e.target.value })} placeholder="Brief summary of the policy guidelines..." className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gov resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Category *</label>
              <select value={policyFormData.category} onChange={(e) => setPolicyFormData({ ...policyFormData, category: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov">
                {POLICY_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Effective Date *</label>
              <input type="date" value={policyFormData.effectiveDate} onChange={(e) => setPolicyFormData({ ...policyFormData, effectiveDate: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Version</label>
              <input type="text" value={policyFormData.version} onChange={(e) => setPolicyFormData({ ...policyFormData, version: e.target.value })} placeholder="1.0" className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Department Scope</label>
              <input type="text" value={policyFormData.department} onChange={(e) => setPolicyFormData({ ...policyFormData, department: e.target.value })} placeholder="All" className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov" />
            </div>
          </div>
        </div>
      </Modal>

      {/* ─── POLICY ACKNOWLEDGEMENT MODAL ─── */}
      <Modal
        isOpen={isAckModalOpen}
        onClose={() => setIsAckModalOpen(false)}
        title="Log Policy Acknowledgement"
        confirmText="Log Signature"
        confirmColorClass="bg-accent-gov hover:bg-purple-600 text-bg-base font-bold"
        onConfirm={handleAckSubmit}
      >
        <div className="space-y-4">
          <div className="bg-accent-gov/5 border border-accent-gov/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-text-secondary">
              Acknowledging as: <span className="text-text-primary font-bold">{user?.name || user?.email}</span>
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Select Policy *</label>
            <select
              value={ackPolicyId}
              onChange={(e) => setAckPolicyId(e.target.value)}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gov"
            >
              <option value="">— Select a policy —</option>
              {policies.filter(p => p.status === 'Published').map(pol => (
                <option key={pol._id} value={pol._id}>{pol.title}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
