/**
 * SOCIAL & ENGAGEMENT DASHBOARD
 * 
 * Expected Backend API Endpoint Checklist:
 * 1. GET   /api/v1/social/dashboard - Returns aggregate stats
 * 2. GET   /api/v1/social/analytics?type=diversity - Returns diversity demographics data
 * 3. GET   /api/v1/social/analytics?type=training - Returns training aggregate stats
 * 4. GET   /api/v1/csr-activities - Returns list of CSR activities
 * 5. POST  /api/v1/csr-activities - Creates a new CSR activity
 * 6. PUT   /api/v1/csr-activities/:id - Updates an activity
 * 7. DELETE /api/v1/csr-activities/:id - Soft-deletes an activity
 * 8. PATCH /api/v1/csr-activities/publish/:id - Publishes draft activity
 * 9. PATCH /api/v1/csr-activities/archive/:id - Archives an activity
 * 10. GET  /api/v1/participation - Returns registrations (optionally scoped to user)
 * 11. POST /api/v1/participation - Register user for an activity
 * 12. PUT  /api/v1/participation/:id - Upload/edit completion proof
 * 13. DELETE /api/v1/participation/:id - Withdraw registration
 * 14. PATCH /api/v1/participation/approve/:id - Approves participation request
 * 15. PATCH /api/v1/participation/reject/:id - Rejects participation request
 * 16. GET  /api/v1/training - Returns training course list
 * 17. POST /api/v1/training - Creates training course
 * 18. POST /api/v1/training/:id/assign - Assigns employee to course
 * 19. PATCH /api/v1/training/complete/:id - Marks training course complete
 * 20. GET  /api/v1/categories?type=CSR - Fetch active CSR categories
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { TERMS } from '../../constants/terminology';

// Reusable components
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import FileUpload from '../../components/FileUpload';
import Modal from '../../components/Modal';
import EntityForm from '../../components/EntityForm';

// RBAC Permissions config
import { 
  socialPermissions,
  canCreateActivity,
  canApproveParticipation,
  canViewDiversity,
  canManageTraining,
  canConfigSocialSettings
} from './socialPermissions';

// Custom Details Modals
import ActivityDetailPage from './ActivityDetailPage';
import TrainingDetailPage from './TrainingDetailPage';

// Recharts for Premium Visuals
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';

// Icons
import { 
  Plus, Check, X, Paperclip, FileText, TreePine, Droplet, Waves, 
  GraduationCap, Heart, Lock, BookOpen, LayoutGrid, List, FileCheck, 
  TrendingUp, Award, Award as AwardIcon, Users, User, ArrowRight, Eye, Copy, Archive, CheckCircle
} from 'lucide-react';

// API services
import {
  fetchSocialDashboard,
  fetchSocialAnalytics,
  fetchActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  publishActivity,
  archiveActivity,
  fetchParticipations,
  registerParticipation,
  uploadProof,
  withdrawParticipation,
  approveParticipation,
  rejectParticipation,
  fetchCategories,
  fetchTrainings,
  createTraining,
  assignTraining,
  completeTraining
} from '../../api/social';

export default function Social() {
  const location = useLocation();
  const { showToast } = useToast();
  const { user } = useAuth();

  // Active Tab
  const [activeSubTab, setActiveSubTab] = useState('CSR Activities');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table' for CSR

  // Data States
  const [dashboardStats, setDashboardStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [participationList, setParticipationList] = useState([]);
  const [trainingList, setTrainingList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [diversityAnalytics, setDiversityAnalytics] = useState({});
  const [loading, setLoading] = useState(false);

  // Selection & Details Modal State
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [selectedBulkIds, setSelectedBulkIds] = useState([]);
  const [selectedBulkPartIds, setSelectedBulkPartIds] = useState([]);
  
  // Modals Toggles
  const [isNewActivityOpen, setIsNewActivityOpen] = useState(false);
  const [isEditActivityOpen, setIsEditActivityOpen] = useState(false);
  const [isNewTrainingOpen, setIsNewTrainingOpen] = useState(false);
  const [isProofUploadOpen, setIsProofUploadOpen] = useState(false);
  const [selectedPartForProof, setSelectedPartForProof] = useState(null);

  // Forms State
  const [activityForm, setActivityForm] = useState({
    title: '', description: '', points: 100, category: 'ENVIRONMENT', evidenceRequired: false, location: 'HQ', mode: 'In-Person', date: ''
  });
  const [editActivityForm, setEditActivityForm] = useState({});
  const [trainingForm, setTrainingForm] = useState({
    name: '', category: 'Environmental', department: 'Corporate', instructor: 'Internal HR', duration: '2 Hours', mode: 'Online', startDate: '', endDate: ''
  });
  const [proofFile, setProofFile] = useState(null);

  // Filter & Search states
  const [csrSearch, setCsrSearch] = useState("");
  const [csrCategoryFilter, setCsrCategoryFilter] = useState("All");
  
  const [partSearch, setPartSearch] = useState("");
  const [partStatusFilter, setPartStatusFilter] = useState("All");

  const [trainSearch, setTrainSearch] = useState("");
  const [trainStatusFilter, setTrainStatusFilter] = useState("All");

  const userRole = user?.role || 'Employee';
  const isAdmin = userRole === 'Admin';
  const isHR = userRole === 'HR';
  const isManager = userRole === 'Manager';
  const isEmployee = userRole === 'Employee';

  // Load All Data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dashRes, actRes, partRes, divRes, trainRes, catRes] = await Promise.allSettled([
        fetchSocialDashboard(),
        fetchActivities(),
        fetchParticipations(),
        fetchSocialAnalytics('type=diversity'),
        fetchTrainings(),
        fetchCategories('CSR')
      ]);

      if (dashRes.status === 'fulfilled') setDashboardStats(dashRes.value);
      if (actRes.status === 'fulfilled') setActivities(actRes.value?.results || actRes.value || []);
      if (partRes.status === 'fulfilled') setParticipationList(partRes.value?.results || partRes.value || []);
      if (divRes.status === 'fulfilled') setDiversityAnalytics(divRes.value);
      if (trainRes.status === 'fulfilled') setTrainingList(trainRes.value);
      if (catRes.status === 'fulfilled') setCategories(catRes.value);
    } catch (e) {
      console.error("Error loading social MERN data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  // CSR Categories selection mapping
  const categoryOptions = [
    { value: 'ENVIRONMENT', label: 'Environmental' },
    { value: 'HEALTH', label: 'Health & Safety' },
    { value: 'COMMUNITY', label: 'Community Support' },
    { value: 'EDUCATION', label: 'Education & Outreach' },
  ];

  // Helper activity icons
  const renderActivityIcon = (cat) => {
    switch (cat) {
      case 'ENVIRONMENT': return <TreePine className="w-5 h-5 text-accent-env" />;
      case 'HEALTH': return <Droplet className="w-5 h-5 text-red-400" />;
      case 'COMMUNITY': return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'EDUCATION': return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      default: return <Heart className="w-5 h-5 text-pink-400" />;
    }
  };

  // ── CSR Activity Actions ──────────────────────────────────────────
  const handleRegisterCSR = async (act) => {
    if (isManager) {
      showToast("Managers are excluded from volunteering registries.", "error");
      return;
    }
    try {
      await registerParticipation(act.id || act._id);
      showToast(`Registered successfully for ${act.title || act.name}!`, "success");
      loadAllData();
    } catch (err) {
      showToast(err.message || "Failed to register.", "error");
    }
  };

  const handleCreateCSR = async (e) => {
    e.preventDefault();
    if (!activityForm.title) {
      showToast("Activity Title is required.", "error");
      return;
    }
    try {
      await createActivity(activityForm);
      showToast("CSR Activity created successfully!", "success");
      setIsNewActivityOpen(false);
      setActivityForm({
        title: '', description: '', points: 100, category: 'ENVIRONMENT', evidenceRequired: false, location: 'HQ', mode: 'In-Person', date: ''
      });
      loadAllData();
    } catch (err) {
      showToast(err.message || "Failed to create CSR Activity.", "error");
    }
  };

  const handleUpdateCSR = async (e) => {
    e.preventDefault();
    try {
      await updateActivity(editActivityForm.id || editActivityForm._id, editActivityForm);
      showToast("Activity updated successfully.", "success");
      setIsEditActivityOpen(false);
      loadAllData();
    } catch (err) {
      showToast(err.message || "Update failed.", "error");
    }
  };

  const handleDeleteCSR = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      await deleteActivity(id);
      showToast("CSR Activity deleted.", "success");
      loadAllData();
    } catch (err) {
      showToast(err.message || "Failed to delete.", "error");
    }
  };

  const handleDuplicateCSR = async (act) => {
    try {
      await createActivity({
        ...act,
        title: `${act.title} (Copy)`,
        status: 'Draft'
      });
      showToast("Activity duplicated as draft.", "success");
      loadAllData();
    } catch (err) {
      showToast("Failed to duplicate.", "error");
    }
  };

  const handleTogglePublish = async (act) => {
    try {
      if (act.status === 'Draft') {
        await publishActivity(act.id || act._id);
        showToast("Activity published to directory.", "success");
      } else {
        await archiveActivity(act.id || act._id);
        showToast("Activity archived successfully.", "success");
      }
      loadAllData();
    } catch (err) {
      showToast("Failed to change activity status.", "error");
    }
  };

  // Bulk Activity Actions
  const handleBulkPublish = async () => {
    if (selectedBulkIds.length === 0) return;
    try {
      await Promise.all(selectedBulkIds.map(id => publishActivity(id)));
      showToast("Selected activities published.", "success");
      setSelectedBulkIds([]);
      loadAllData();
    } catch (e) {
      showToast("Some activities failed to publish.", "error");
    }
  };

  const handleBulkArchive = async () => {
    if (selectedBulkIds.length === 0) return;
    try {
      await Promise.all(selectedBulkIds.map(id => archiveActivity(id)));
      showToast("Selected activities archived.", "success");
      setSelectedBulkIds([]);
      loadAllData();
    } catch (e) {
      showToast("Some activities failed to archive.", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBulkIds.length === 0) return;
    if (!window.confirm("Delete all selected activities?")) return;
    try {
      await Promise.all(selectedBulkIds.map(id => deleteActivity(id)));
      showToast("Selected activities deleted.", "success");
      setSelectedBulkIds([]);
      loadAllData();
    } catch (e) {
      showToast("Failed to delete all selected items.", "error");
    }
  };

  // ── Participation Actions ─────────────────────────────────────────
  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (!proofFile) {
      showToast("Please choose a file proof.", "error");
      return;
    }
    try {
      await uploadProof(selectedPartForProof.id || selectedPartForProof._id, proofFile);
      showToast("Completion proof uploaded successfully.", "success");
      setIsProofUploadOpen(false);
      setProofFile(null);
      loadAllData();
    } catch (err) {
      showToast("Failed to upload proof.", "error");
    }
  };

  const handleWithdrawPart = async (id) => {
    if (!window.confirm("Withdraw from this activity?")) return;
    try {
      await withdrawParticipation(id);
      showToast("Registration withdrawn.", "success");
      loadAllData();
    } catch (err) {
      showToast("Failed to withdraw.", "error");
    }
  };

  const handleSingleApprove = async (id) => {
    try {
      await approveParticipation(id);
      showToast("Participation approved. Points and XP credited.", "success");
      loadAllData();
    } catch (err) {
      showToast("Approve request failed.", "error");
    }
  };

  const handleSingleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return;
    try {
      await rejectParticipation(id, reason);
      showToast("Participation rejected.", "error");
      loadAllData();
    } catch (err) {
      showToast("Reject request failed.", "error");
    }
  };

  // Bulk Approval/Rejection
  const handleBulkApprove = async () => {
    if (selectedBulkPartIds.length === 0) return;
    try {
      await Promise.all(selectedBulkPartIds.map(id => approveParticipation(id)));
      showToast("Selected requests approved.", "success");
      setSelectedBulkPartIds([]);
      loadAllData();
    } catch (e) {
      showToast("Failed to approve some requests.", "error");
    }
  };

  const handleBulkReject = async () => {
    if (selectedBulkPartIds.length === 0) return;
    const reason = prompt("Enter rejection reason for all selected requests:");
    if (reason === null) return;
    try {
      await Promise.all(selectedBulkPartIds.map(id => rejectParticipation(id, reason)));
      showToast("Selected requests rejected.", "error");
      setSelectedBulkPartIds([]);
      loadAllData();
    } catch (e) {
      showToast("Failed to reject some requests.", "error");
    }
  };

  // ── Training Course Actions ───────────────────────────────────────
  const handleCreateTraining = async (e) => {
    e.preventDefault();
    try {
      await createTraining(trainingForm);
      showToast("Training course created successfully.", "success");
      setIsNewTrainingOpen(false);
      setTrainingForm({
        name: '', category: 'Environmental', department: 'Corporate', instructor: 'Internal HR', duration: '2 Hours', mode: 'Online', startDate: '', endDate: ''
      });
      loadAllData();
    } catch (err) {
      showToast("Failed to create training course.", "error");
    }
  };

  const handleAssignTraining = async (courseId, empName) => {
    try {
      await assignTraining(courseId, empName);
      showToast(`Course assigned to ${empName}.`, "success");
      loadAllData();
    } catch (e) {
      showToast("Failed to assign course.", "error");
    }
  };

  const handleCompleteTraining = async (courseId) => {
    try {
      await completeTraining(courseId);
      showToast("Training marked completed.", "success");
      loadAllData();
    } catch (e) {
      showToast("Failed to complete training.", "error");
    }
  };

  // Filtering Logic
  const filteredActivities = activities.filter(act => {
    const matchesSearch = act.title?.toLowerCase().includes(csrSearch.toLowerCase()) || 
                          act.description?.toLowerCase().includes(csrSearch.toLowerCase());
    const matchesCat = csrCategoryFilter === 'All' || act.category === csrCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredParticipations = participationList.filter(part => {
    const matchesSearch = part.employee?.name?.toLowerCase().includes(partSearch.toLowerCase()) ||
                          part.activity?.title?.toLowerCase().includes(partSearch.toLowerCase());
    const matchesStatus = partStatusFilter === 'All' || part.status === partStatusFilter;
    const isOwner = part.employee?._id === user?.id || part.employee?.id === user?.id;
    
    // Employee only sees their own
    if (isEmployee && !isOwner) return false;
    
    // Manager department scoping
    if (isManager && part.employee?.department?.toLowerCase() !== user?.department?.toLowerCase()) return false;

    return matchesSearch && matchesStatus;
  });

  const filteredTrainings = trainingList.filter(train => {
    const matchesSearch = train.name?.toLowerCase().includes(trainSearch.toLowerCase()) ||
                          train.instructor?.toLowerCase().includes(trainSearch.toLowerCase());
    const matchesStatus = trainStatusFilter === 'All' || train.status === trainStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col min-w-0 overflow-y-auto bg-bg-base flex-1">
      
      {/* Tab Selector Nav */}
      <div className="bg-bg-card/10 border-b border-border-sage px-6 py-4">
        <div className="flex flex-wrap gap-3">
          {['CSR Activities', 'Employee Participation', 'Diversity Dashboard', 'Training Management'].map((tab) => {
            const isActive = tab === activeSubTab;
            // Hide diversity dashboard for non-HR/Admin roles
            if (tab === 'Diversity Dashboard' && !isAdmin && !isHR) return null;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveSubTab(tab);
                  setSelectedBulkIds([]);
                  setSelectedBulkPartIds([]);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-accent-soc text-bg-base shadow-md shadow-accent-soc/10 font-bold' 
                    : 'bg-bg-card border border-border-sage text-text-secondary hover:text-text-primary hover:border-text-secondary'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Core View Area */}
      <main className="p-6 space-y-8 max-w-7xl w-full mx-auto flex-1">
        
        {/* KPI Top Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-bg-card border border-border-sage rounded-2xl p-5 shadow-sm space-y-1.5 hover:shadow-premium-blue transition-all">
            <div className="flex justify-between items-center text-text-secondary">
              <span className="text-[10px] font-bold uppercase tracking-wider">CSR Events</span>
              <TreePine className="w-4 h-4 text-accent-env" />
            </div>
            <p className="text-xl font-bold font-display text-text-primary">{dashboardStats.totalActivities || 0}</p>
            <p className="text-[10px] font-medium text-text-secondary">{dashboardStats.activeActivities || 0} active currently</p>
          </div>

          <div className="bg-bg-card border border-border-sage rounded-2xl p-5 shadow-sm space-y-1.5 hover:shadow-premium-blue transition-all">
            <div className="flex justify-between items-center text-text-secondary">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Volunteers</span>
              <Users className="w-4 h-4 text-accent-soc" />
            </div>
            <p className="text-xl font-bold font-display text-text-primary">{dashboardStats.totalParticipants || 0}</p>
            <p className="text-[10px] font-medium text-text-secondary">{dashboardStats.pendingApprovals || 0} approvals pending</p>
          </div>

          <div className="bg-bg-card border border-border-sage rounded-2xl p-5 shadow-sm space-y-1.5 hover:shadow-premium-blue transition-all">
            <div className="flex justify-between items-center text-text-secondary">
              <span className="text-[10px] font-bold uppercase tracking-wider">Training Rate</span>
              <BookOpen className="w-4 h-4 text-accent-gam" />
            </div>
            <p className="text-xl font-bold font-display text-text-primary">{dashboardStats.trainingCompletionRate || 0}%</p>
            <p className="text-[10px] font-medium text-text-secondary">Average completion score</p>
          </div>

          <div className="bg-bg-card border border-border-sage rounded-2xl p-5 shadow-sm space-y-1.5 hover:shadow-premium-blue transition-all">
            <div className="flex justify-between items-center text-text-secondary">
              <span className="text-[10px] font-bold uppercase tracking-wider">Volunteer Hours</span>
              <TrendingUp className="w-4 h-4 text-accent-env" />
            </div>
            <p className="text-xl font-bold font-display text-text-primary">{dashboardStats.volunteerHours || 0} hrs</p>
            <p className="text-[10px] font-medium text-text-secondary">Diversity score: {dashboardStats.diversityScore || 0}%</p>
          </div>
        </div>

        {/* ── SUB-TAB 1: CSR ACTIVITIES ──────────────────────────────── */}
        {activeSubTab === 'CSR Activities' && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-display text-text-primary tracking-wide">CSR Activities</h2>
                <p className="text-xs text-text-secondary mt-0.5">Explore sustainability campaigns, community events, and register to earn points.</p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Grid vs Table View toggles */}
                <div className="flex border border-border-sage rounded-lg overflow-hidden bg-bg-card">
                  <button 
                    onClick={() => setViewMode('card')}
                    className={`p-2 cursor-pointer ${viewMode === 'card' ? 'bg-accent-soc text-bg-base' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('table')}
                    className={`p-2 cursor-pointer ${viewMode === 'table' ? 'bg-accent-soc text-bg-base' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* New Activity button */}
                {canCreateActivity(userRole) && (
                  <button 
                    onClick={() => setIsNewActivityOpen(true)}
                    className="flex items-center space-x-1 px-4.5 py-2.5 bg-accent-soc text-bg-base font-extrabold text-xs rounded-xl shadow cursor-pointer hover:brightness-105 active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span className="uppercase tracking-wider">New Activity</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
              searchPlaceholder="Search CSR activities..."
              searchVal={csrSearch}
              onSearchChange={setCsrSearch}
              filters={[
                {
                  name: 'category',
                  label: 'Category',
                  value: csrCategoryFilter,
                  options: [
                    { value: 'All', label: 'All Categories' },
                    ...categoryOptions
                  ]
                }
              ]}
              onChange={(name, val) => setCsrCategoryFilter(val)}
              onReset={() => {
                setCsrSearch("");
                setCsrCategoryFilter("All");
              }}
            />

            {/* Bulk Action Controls */}
            {viewMode === 'table' && selectedBulkIds.length > 0 && (
              <div className="bg-bg-card border border-accent-soc/30 rounded-xl p-3 flex items-center justify-between animate-fadeIn">
                <span className="text-xs font-bold text-text-primary">{selectedBulkIds.length} activities selected</span>
                <div className="flex space-x-2">
                  <button onClick={handleBulkPublish} className="px-3 py-1.5 bg-emerald-600 text-bg-base text-[10px] font-bold uppercase rounded-lg hover:brightness-105 cursor-pointer">Publish</button>
                  <button onClick={handleBulkArchive} className="px-3 py-1.5 bg-amber-600 text-bg-base text-[10px] font-bold uppercase rounded-lg hover:brightness-105 cursor-pointer">Archive</button>
                  <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-600 text-bg-base text-[10px] font-bold uppercase rounded-lg hover:brightness-105 cursor-pointer">Delete</button>
                </div>
              </div>
            )}

            {/* View Render */}
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActivities.map((act) => {
                  const isRegistered = participationList.some(p => (p.activity?._id === act._id || p.activity?.id === act._id) && (p.employee?.id === user?.id || p.employee?._id === user?.id));
                  return (
                    <div 
                      key={act._id || act.id}
                      className="bg-bg-card border border-border-sage rounded-2xl p-5 hover:scale-[1.01] hover:shadow-premium-blue transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-accent-soc/10 text-accent-soc">
                              {renderActivityIcon(act.category)}
                            </div>
                            <div>
                              <h3 className="font-bold text-text-primary text-sm font-display tracking-wide">{act.title}</h3>
                              <span className="text-[9px] font-mono text-text-secondary uppercase">{act.category}</span>
                            </div>
                          </div>
                          
                          {/* Quick Admin action icons */}
                          {canCreateActivity(userRole) && (
                            <div className="flex space-x-1">
                              <button 
                                onClick={() => {
                                  setEditActivityForm({
                                    id: act._id || act.id,
                                    title: act.title,
                                    description: act.description,
                                    points: act.points || act.pointsValue,
                                    category: act.category,
                                    evidenceRequired: act.evidenceRequired,
                                    location: act.location || 'HQ',
                                    mode: act.mode || 'In-Person',
                                    date: act.date || ''
                                  });
                                  setIsEditActivityOpen(true);
                                }}
                                className="p-1 text-text-secondary hover:text-accent-soc rounded-lg hover:bg-bg-base"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteCSR(act._id || act.id)}
                                className="p-1 text-text-secondary hover:text-red-500 rounded-lg hover:bg-bg-base"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{act.description}</p>
                        
                        <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary font-mono border-t border-border-sage/40 pt-3">
                          <span>POINTS: <span className="text-brand text-xs font-sans">{act.points || act.pointsValue || 100}</span></span>
                          <span className="bg-bg-base px-2 py-0.5 rounded border border-border-sage/60 uppercase">{act.status || 'Active'}</span>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2">
                        <button
                          onClick={() => setSelectedActivity({
                            id: act._id || act.id,
                            title: act.title,
                            description: act.description,
                            pointsValue: act.points || act.pointsValue,
                            category: act.category,
                            evidenceRequired: act.evidenceRequired,
                            location: act.location,
                            mode: act.mode,
                            date: act.date,
                            status: act.status
                          })}
                          className="w-full py-2 bg-bg-base hover:bg-bg-card border border-border-sage text-text-secondary hover:text-text-primary text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                        >
                          <span>View Detail Sheet</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        {!isManager && (
                          <button
                            disabled={isRegistered}
                            onClick={() => handleRegisterCSR(act)}
                            className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                              isRegistered 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50 cursor-not-allowed flex items-center justify-center space-x-1' 
                                : 'bg-accent-soc text-bg-base hover:brightness-105 shadow shadow-accent-soc/10'
                            }`}
                          >
                            {isRegistered && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            <span>{isRegistered ? 'Joined & Registered' : 'Register to Volunteer'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // List View using standard Table Layout with checkboxes
              <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-bg-card/80 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase font-display">
                      {canCreateActivity(userRole) && <th className="p-4 w-8"></th>}
                      <th className="p-4">Activity Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Points</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Evidence Required</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-sage/40">
                    {filteredActivities.map(act => {
                      const id = act._id || act.id;
                      const isChecked = selectedBulkIds.includes(id);
                      return (
                        <tr key={id} className="hover:bg-bg-base/20 transition-colors">
                          {canCreateActivity(userRole) && (
                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) setSelectedBulkIds(selectedBulkIds.filter(x => x !== id));
                                  else setSelectedBulkIds([...selectedBulkIds, id]);
                                }}
                                className="rounded border-border-sage bg-bg-base text-accent-soc focus:ring-0 cursor-pointer"
                              />
                            </td>
                          )}
                          <td className="p-4 font-bold text-text-primary font-display">{act.title}</td>
                          <td className="p-4 font-semibold text-text-secondary uppercase tracking-wider text-[10px]">{act.category}</td>
                          <td className="p-4 font-mono font-bold text-brand">{act.points || act.pointsValue}</td>
                          <td className="p-4">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono ${
                              act.status === 'Draft' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}>
                              {act.status}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-text-secondary">{act.evidenceRequired ? 'Yes' : 'No'}</td>
                          <td className="p-4 text-right flex items-center justify-end space-x-1.5">
                            <button onClick={() => handleDuplicateCSR(act)} className="p-1 hover:bg-bg-base rounded text-text-secondary hover:text-accent-soc cursor-pointer" title="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleTogglePublish(act)} className="p-1 hover:bg-bg-base rounded text-text-secondary hover:text-accent-soc cursor-pointer" title="Toggle Publish/Archive"><Archive className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteCSR(id)} className="p-1 hover:bg-bg-base rounded text-text-secondary hover:text-red-500 cursor-pointer" title="Delete"><X className="w-3.5 h-3.5" /></button>
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

        {/* ── SUB-TAB 2: EMPLOYEE PARTICIPATION ───────────────────────── */}
        {activeSubTab === 'Employee Participation' && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-display text-text-primary tracking-wide">Volunteer Registry</h2>
                <p className="text-xs text-text-secondary mt-0.5">Track registrations, upload execution proof documents, and manage approval requests.</p>
              </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
              searchPlaceholder="Search volunteer requests..."
              searchVal={partSearch}
              onSearchChange={setPartSearch}
              filters={[
                {
                  name: 'status',
                  label: 'Status',
                  value: partStatusFilter,
                  options: [
                    { value: 'All', label: 'All Statuses' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'APPROVED', label: 'Approved' },
                    { value: 'REJECTED', label: 'Rejected' }
                  ]
                }
              ]}
              onChange={(name, val) => setPartStatusFilter(val)}
              onReset={() => {
                setPartSearch("");
                setPartStatusFilter("All");
              }}
            />

            {/* Bulk Approvals Panel */}
            {!isEmployee && selectedBulkPartIds.length > 0 && (
              <div className="bg-bg-card border border-accent-soc/30 rounded-xl p-3 flex items-center justify-between animate-fadeIn">
                <span className="text-xs font-bold text-text-primary">{selectedBulkPartIds.length} requests selected</span>
                <div className="flex space-x-2">
                  <button onClick={handleBulkApprove} className="px-3.5 py-1.5 bg-accent-env text-bg-base text-[10px] font-bold uppercase rounded-lg hover:brightness-105 cursor-pointer">Approve</button>
                  <button onClick={handleBulkReject} className="px-3.5 py-1.5 bg-red-600 text-bg-base text-[10px] font-bold uppercase rounded-lg hover:brightness-105 cursor-pointer">Reject</button>
                </div>
              </div>
            )}

            {/* Volunteer Registry Table */}
            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase font-display">
                    {!isEmployee && <th className="p-4 w-8"></th>}
                    <th className="p-4">Employee</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">CSR Activity</th>
                    <th className="p-4">Registration Date</th>
                    <th className="p-4">Proof Document</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40">
                  {filteredParticipations.map(part => {
                    const id = part._id || part.id;
                    const isChecked = selectedBulkPartIds.includes(id);
                    const isPending = part.status === 'PENDING';
                    const hasPermission = canApproveParticipation(userRole, part.activity?.department || part.activity?.category, part.employee?.department || user?.department);

                    return (
                      <tr key={id} className="hover:bg-bg-base/20 transition-colors">
                        {!isEmployee && (
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) setSelectedBulkPartIds(selectedBulkPartIds.filter(x => x !== id));
                                else setSelectedBulkPartIds([...selectedBulkPartIds, id]);
                              }}
                              className="rounded border-border-sage bg-bg-base text-accent-soc focus:ring-0 cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="p-4 font-bold text-text-primary font-display">{part.employee?.name || 'User'}</td>
                        <td className="p-4 font-semibold text-text-secondary">{part.employee?.department || 'Corporate'}</td>
                        <td className="p-4 font-bold text-text-primary">{part.activity?.title || 'CSR Campaign'}</td>
                        <td className="p-4 font-mono text-text-secondary">{part.createdAt ? part.createdAt.split('T')[0] : 'Today'}</td>
                        <td className="p-4">
                          {part.proofUrl ? (
                            <a href={`http://localhost:5000/uploads/${part.proofUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 px-2 py-0.5 bg-bg-base border border-border-sage rounded-lg text-accent-soc font-bold cursor-pointer hover:bg-bg-card">
                              <FileText className="w-3 h-3" />
                              <span>{part.proofUrl}</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-text-secondary italic">No proof uploaded</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            part.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : part.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {part.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex items-center justify-end space-x-1.5">
                          {isEmployee && (
                            <>
                              <button 
                                onClick={() => {
                                  setSelectedPartForProof(part);
                                  setIsProofUploadOpen(true);
                                }}
                                className="px-2 py-1 bg-accent-soc text-bg-base rounded-lg font-bold text-[10px] hover:brightness-105 cursor-pointer"
                              >
                                Upload Proof
                              </button>
                              <button onClick={() => handleWithdrawPart(id)} className="p-1 hover:bg-bg-base rounded text-text-secondary hover:text-red-500 cursor-pointer" title="Withdraw"><X className="w-4 h-4" /></button>
                            </>
                          )}

                          {!isEmployee && isPending && hasPermission && (
                            <>
                              <button onClick={() => handleSingleApprove(id)} className="p-1 hover:bg-bg-base rounded text-emerald-600 cursor-pointer" title="Approve"><Check className="w-4 h-4" /></button>
                              <button onClick={() => handleSingleReject(id)} className="p-1 hover:bg-bg-base rounded text-red-500 cursor-pointer" title="Reject"><X className="w-4 h-4" /></button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── SUB-TAB 3: DIVERSITY DASHBOARD ─────────────────────────── */}
        {activeSubTab === 'Diversity Dashboard' && (isAdmin || isHR) && (
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-bold font-display text-text-primary tracking-wide">Diversity & Inclusion Analytics</h2>
              <p className="text-xs text-text-secondary mt-0.5">Real-time metrics tracking workplace demographics, inclusive recruitment, and compliance rates.</p>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Gender Split Pie */}
              <div className="bg-bg-card border border-border-sage rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Gender Demographic Split</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={diversityAnalytics.genderSplit || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(diversityAnalytics.genderSplit || []).map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={idx === 0 ? '#4F46E5' : idx === 1 ? '#10B981' : '#F59E0B'} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Department Diversity Bar */}
              <div className="bg-bg-card border border-border-sage rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Department Inclusion Scores</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={diversityAnalytics.deptDiversity || []}>
                      <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} />
                      <YAxis stroke="#6B7280" fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Employment Type Donut */}
              <div className="bg-bg-card border border-border-sage rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Employment Contracts</h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={diversityAnalytics.employmentType || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(diversityAnalytics.employmentType || []).map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={idx === 0 ? '#3B82F6' : idx === 1 ? '#EC4899' : '#8B5CF6'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Age Groups Donut */}
              <div className="bg-bg-card border border-border-sage rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Age Group Spread</h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={diversityAnalytics.ageDistribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(diversityAnalytics.ageDistribution || []).map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={idx === 0 ? '#10B981' : idx === 1 ? '#F59E0B' : '#6366F1'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Diversity Trend Line */}
              <div className="bg-bg-card border border-border-sage rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Compliance Trend</h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={diversityAnalytics.trend || []}>
                      <XAxis dataKey="month" stroke="#6B7280" fontSize={10} />
                      <YAxis stroke="#6B7280" fontSize={10} />
                      <Tooltip />
                      <Line type="monotone" dataKey="Score" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ── SUB-TAB 4: TRAINING MANAGEMENT ─────────────────────────── */}
        {activeSubTab === 'Training Management' && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-display text-text-primary tracking-wide">ESG Training Center</h2>
                <p className="text-xs text-text-secondary mt-0.5">Manage carbon calculators, diversity courses, safety workshops, and completion metrics.</p>
              </div>

              {canManageTraining(userRole) && (
                <button 
                  onClick={() => setIsNewTrainingOpen(true)}
                  className="flex items-center space-x-1 px-4.5 py-2.5 bg-accent-soc text-bg-base font-extrabold text-xs rounded-xl shadow cursor-pointer hover:brightness-105 active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="uppercase tracking-wider">New Course</span>
                </button>
              )}
            </div>

            {/* Filter Bar */}
            <FilterBar
              searchPlaceholder="Search training courses..."
              searchVal={trainSearch}
              onSearchChange={setTrainSearch}
              filters={[
                {
                  name: 'status',
                  label: 'Status',
                  value: trainStatusFilter,
                  options: [
                    { value: 'All', label: 'All Courses' },
                    { value: 'Ongoing', label: 'Ongoing' },
                    { value: 'Completed', label: 'Completed' }
                  ]
                }
              ]}
              onChange={(name, val) => setTrainStatusFilter(val)}
              onReset={() => {
                setTrainSearch("");
                setTrainStatusFilter("All");
              }}
            />

            {/* Trainings Table */}
            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-bg-card/80 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase font-display">
                    <th className="p-4">Training Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Instructor</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Mode</th>
                    <th className="p-4">Completion %</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40">
                  {filteredTrainings.map((train) => {
                    const id = train._id || train.id;
                    return (
                      <tr key={id} className="hover:bg-bg-base/20 transition-colors">
                        <td className="p-4 font-bold text-text-primary font-display">{train.name}</td>
                        <td className="p-4 font-semibold text-text-secondary">{train.category}</td>
                        <td className="p-4 text-text-secondary">{train.instructor}</td>
                        <td className="p-4 font-mono text-text-secondary">{train.duration}</td>
                        <td className="p-4 font-semibold text-text-secondary">{train.mode}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-text-primary">{train.completionRate || '0%'}</span>
                            <div className="w-16 bg-border-sage/35 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-accent-soc h-full rounded-full" style={{ width: train.completionRate || '0%' }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono ${
                            train.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-accent-soc/10 text-accent-soc border-accent-soc/20'
                          }`}>
                            {train.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => setSelectedTraining(train)}
                            className="px-3 py-1 bg-bg-base hover:bg-bg-card border border-border-sage text-text-secondary hover:text-text-primary text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                          >
                            Open sheet
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* ── MODALS ─────────────────────────────────────────────────── */}

      {/* New Activity Modal */}
      <Modal
        isOpen={isNewActivityOpen}
        onClose={() => setIsNewActivityOpen(false)}
        title="Add New CSR Activity"
        confirmText="Add Activity"
        confirmColorClass="bg-accent-soc hover:bg-blue-600 text-bg-base font-bold"
        onConfirm={handleCreateCSR}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Title</label>
            <input
              type="text"
              value={activityForm.title}
              onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Description</label>
            <textarea
              value={activityForm.description}
              onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none h-16"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Points Value</label>
              <input
                type="number"
                value={activityForm.points}
                onChange={(e) => setActivityForm({ ...activityForm, points: parseInt(e.target.value) || 0 })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Category</label>
              <select
                value={activityForm.category}
                onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
              >
                {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Activity Modal */}
      <Modal
        isOpen={isEditActivityOpen}
        onClose={() => setIsEditActivityOpen(false)}
        title="Edit CSR Activity"
        confirmText="Save Changes"
        confirmColorClass="bg-accent-soc hover:bg-blue-600 text-bg-base font-bold"
        onConfirm={handleUpdateCSR}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Title</label>
            <input
              type="text"
              value={editActivityForm.title || ''}
              onChange={(e) => setEditActivityForm({ ...editActivityForm, title: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Description</label>
            <textarea
              value={editActivityForm.description || ''}
              onChange={(e) => setEditActivityForm({ ...editActivityForm, description: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none h-16"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Points Value</label>
              <input
                type="number"
                value={editActivityForm.points || ''}
                onChange={(e) => setEditActivityForm({ ...editActivityForm, points: parseInt(e.target.value) || 0 })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Category</label>
              <select
                value={editActivityForm.category || 'ENVIRONMENT'}
                onChange={(e) => setEditActivityForm({ ...editActivityForm, category: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
              >
                {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* New Training Modal */}
      <Modal
        isOpen={isNewTrainingOpen}
        onClose={() => setIsNewTrainingOpen(false)}
        title="Add Training Course"
        confirmText="Create Course"
        confirmColorClass="bg-accent-soc hover:bg-blue-600 text-bg-base font-bold"
        onConfirm={handleCreateTraining}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Course Name</label>
            <input
              type="text"
              value={trainingForm.name}
              onChange={(e) => setTrainingForm({ ...trainingForm, name: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Instructor</label>
              <input
                type="text"
                value={trainingForm.instructor}
                onChange={(e) => setTrainingForm({ ...trainingForm, instructor: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Duration</label>
              <input
                type="text"
                value={trainingForm.duration}
                onChange={(e) => setTrainingForm({ ...trainingForm, duration: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Proof Upload Modal */}
      <Modal
        isOpen={isProofUploadOpen}
        onClose={() => setIsProofUploadOpen(false)}
        title="Upload Voluntering Proof"
        confirmText="Submit Proof"
        confirmColorClass="bg-accent-soc hover:bg-blue-600 text-bg-base font-bold"
        onConfirm={handleProofSubmit}
      >
        <FileUpload
          label="Verification Evidence Document"
          onFileSelect={(file) => setProofFile(file)}
          onFileRemove={() => setProofFile(null)}
        />
      </Modal>

      {/* Details Modals */}
      <ActivityDetailPage
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
        user={user}
        onRegister={() => {
          handleRegisterCSR(selectedActivity);
          setSelectedActivity(null);
        }}
      />

      <TrainingDetailPage
        training={selectedTraining}
        onClose={() => setSelectedTraining(null)}
        user={user}
        onAssign={(name) => handleAssignTraining(selectedTraining._id || selectedTraining.id, name)}
        onComplete={() => handleCompleteTraining(selectedTraining._id || selectedTraining.id)}
        onUploadMaterial={(file) => showToast(`Material ${file.name} uploaded successfully.`, "success")}
      />

    </div>
  );
}
