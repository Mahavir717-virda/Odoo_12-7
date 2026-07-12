import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { TERMS } from '../../constants/terminology';
import { 
  getStorageItem, 
  setStorageItem, 
  recalculateAllScores, 
  triggerPointsAndBadgeUnlocks 
} from '../../utils/storage';
import Modal from '../../components/Modal';
import { 
  Plus, 
  Check, 
  X, 
  Paperclip, 
  FileText, 
  TreePine, 
  Droplet, 
  Waves, 
  GraduationCap, 
  Heart,
  Lock,
  BookOpen
} from 'lucide-react';

export default function Social() {
  const location = useLocation();
  const { showToast } = useToast();
  const { user, canEdit, canApprove, createNotification } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('CSR Activities');

  // Load from localStorage
  const [activities, setActivities] = useState(() => getStorageItem('db_activities', []));
  const [participationList, setParticipationList] = useState(() => getStorageItem('db_participations', []));

  useEffect(() => {
    if (location.state?.activeSubTab) {
      setActiveSubTab(location.state.activeSubTab);
    }
  }, [location.state]);

  const refreshData = () => {
    setActivities(getStorageItem('db_activities', []));
    setParticipationList(getStorageItem('db_participations', []));
    recalculateAllScores();
  };

  // Checkbox selection state for queue
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);

  // CSR activity creation form state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [newActivityData, setNewActivityData] = useState({ title: '', iconType: 'tree', pointsValue: 100, evidenceRequired: false });

  const renderActivityIcon = (type) => {
    switch (type) {
      case 'tree': return <TreePine className="w-5 h-5 text-accent-env" />;
      case 'droplet': return <Droplet className="w-5 h-5 text-red-400" />;
      case 'waves': return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'grad': return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      default: return <Heart className="w-5 h-5 text-pink-400" />;
    }
  };

  // CSR Activities Handlers
  const handleJoinActivity = (id, title, pointsValue) => {
    if (user?.role === 'Manager') {
      showToast("Managers cannot join CSR activities.", "error");
      return;
    }

    const list = getStorageItem('db_activities', []);
    const updated = list.map(act => {
      if (act.id === id) {
        return { ...act, participantsCount: (act.participantsCount || 0) + 1 };
      }
      return act;
    });
    setStorageItem('db_activities', updated);

    // Add to participation list
    const parts = getStorageItem('db_participations', []);
    const newPart = {
      id: Date.now(),
      name: user?.name || "Demo Employee",
      department: user?.department || "Manufacturing",
      activity: title,
      pointsEarned: pointsValue,
      dateJoined: new Date().toISOString().split('T')[0],
      status: "Pending" // pending approval
    };
    setStorageItem('db_participations', [newPart, ...parts]);

    createNotification(user?.id, 'info', `Joined CSR Activity: ${title}. Pending approval.`);
    showToast(`You have joined: ${title}!`, "success");
    refreshData();
  };

  const handleCreateActivity = (e) => {
    e.preventDefault();
    if (!newActivityData.title) {
      showToast("Please enter activity name.", "error");
      return;
    }

    if (!canEdit('social')) {
      showToast("You do not have permission to create CSR activities.", "error");
      return;
    }

    const list = getStorageItem('db_activities', []);
    const newAct = {
      id: Date.now(),
      title: newActivityData.title,
      pointsValue: parseInt(newActivityData.pointsValue) || 100,
      department: user?.department || "Corporate",
      status: "Active",
      date: new Date().toISOString().split('T')[0],
      participantsCount: 0,
      iconType: newActivityData.iconType,
      evidenceRequired: newActivityData.evidenceRequired
    };
    setStorageItem('db_activities', [...list, newAct]);
    createNotification('all', 'info', `New CSR Activity posted: ${newAct.title}`);
    showToast("CSR Activity created successfully!", "success");
    setIsActivityModalOpen(false);
    setNewActivityData({ title: '', iconType: 'tree', pointsValue: 100, evidenceRequired: false });
    refreshData();
  };

  // Participation Approvals Handlers
  const handleApprove = () => {
    if (!canApprove('social')) {
      showToast("You do not have approval permissions for social module.", "error");
      return;
    }

    const targets = selectedQueueIds;
    if (targets.length === 0) {
      showToast("Please select at least one pending record to approve.", "error");
      return;
    }

    const list = getStorageItem('db_participations', []);
    const updated = list.map(item => {
      if (targets.includes(item.id) && item.status === 'Pending') {
        // Trigger point increase & badge check
        triggerPointsAndBadgeUnlocks(item.name, item.pointsEarned, item.pointsEarned, showToast, createNotification);
        return { ...item, status: 'Approved' };
      }
      return item;
    });

    setStorageItem('db_participations', updated);
    createNotification('all', 'success', `Approved ${targets.length} CSR participation request(s).`);
    showToast("Participation approved successfully!", "success");
    setSelectedQueueIds([]);
    refreshData();
  };

  const handleReject = () => {
    if (!canApprove('social')) {
      showToast("You do not have approval permissions.", "error");
      return;
    }

    const targets = selectedQueueIds;
    if (targets.length === 0) {
      showToast("Please select at least one pending record to reject.", "error");
      return;
    }

    const list = getStorageItem('db_participations', []);
    const updated = list.map(item => {
      if (targets.includes(item.id) && item.status === 'Pending') {
        return { ...item, status: 'Rejected' };
      }
      return item;
    });

    setStorageItem('db_participations', updated);
    showToast("Participation rejected.", "error");
    setSelectedQueueIds([]);
    refreshData();
  };

  // Toggle selection
  const handleToggleSelectRow = (id) => {
    if (selectedQueueIds.includes(id)) {
      setSelectedQueueIds(selectedQueueIds.filter(x => x !== id));
    } else {
      setSelectedQueueIds([...selectedQueueIds, id]);
    }
  };

  // Manager Department Scoping Filter
  const managerDept = user?.role === 'Manager' ? user.department : null;
  const filteredParticipations = participationList.filter(item => {
    if (managerDept) {
      return item.department === managerDept;
    }
    return true;
  });

  const subTabs = ['CSR Activities', 'Employee Participation', 'Diversity Dashboard'];

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
                  setSelectedQueueIds([]);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-accent-soc text-bg-base shadow-md shadow-accent-soc/10 font-bold' 
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
        {activeSubTab === 'CSR Activities' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">CSR Activities</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">Review corporate social responsibility activities and track team involvement.</p>
              </div>
              
              <div>
                <button 
                  onClick={() => { if (canEdit('social')) setIsActivityModalOpen(true); }}
                  disabled={!canEdit('social')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-soc to-blue-600 text-bg-base font-extrabold text-xs rounded-lg transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-accent-soc/5 ${
                    !canEdit('social') ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:brightness-110'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="uppercase tracking-wider">New Activity</span>
                </button>
                {!canEdit('social') && (
                  <p className="text-[10px] text-text-secondary/70 mt-1 font-bold">Requires HR / Admin access</p>
                )}
              </div>
            </div>

            {/* CSR Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="bg-bg-card border border-border-sage rounded-2xl p-5 hover:scale-[1.01] hover:shadow-premium-blue transition-all duration-300 flex flex-col justify-between min-h-[190px]"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-accent-soc/10 text-accent-soc">
                        {renderActivityIcon(activity.iconType)}
                      </div>
                      <h3 className="font-bold text-text-primary text-sm tracking-wide font-display">{activity.title}</h3>
                    </div>
                    <p className="text-xs text-text-secondary font-semibold">
                      {activity.participantsCount || 0} joined • <span className="text-brand">{activity.pointsValue} {TERMS.point}s</span>
                    </p>
                  </div>

                  <div className="space-y-3.5 mt-4">
                    <div className="flex items-center space-x-1.5">
                      {activity.evidenceRequired ? (
                        <span className="flex items-center text-[9px] font-bold text-accent-gam bg-accent-gam/10 px-2 py-0.5 rounded-full border border-accent-gam/20 uppercase tracking-wider">
                          <Lock className="w-3 h-3 mr-1" />
                          Evidence Required
                        </span>
                      ) : (
                        <span className="flex items-center text-[9px] font-bold text-accent-env bg-accent-env/10 px-2 py-0.5 rounded-full border border-accent-env/20 uppercase tracking-wider">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Open
                        </span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleJoinActivity(activity.id, activity.title, activity.pointsValue)}
                      className="w-full py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer bg-accent-soc hover:brightness-110 text-bg-base"
                    >
                      Join Activity
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSubTab === 'Employee Participation' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-extrabold text-text-secondary uppercase tracking-wider pl-1 font-display">
              <span>Employee Participation: Approval Queue</span>
              {managerDept && <span className="text-brand">Scoped to your department: {managerDept}</span>}
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                  <thead>
                    <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                      <th className="py-4 px-6 w-8"></th>
                      <th className="py-4 px-6">Employee</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Activity</th>
                      <th className="py-4 px-6">Joined Date</th>
                      <th className="py-4 px-6 text-right">Points</th>
                      <th className="py-4 px-6">Approval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-sage/40 text-text-primary">
                    {filteredParticipations.map((item) => {
                      let badgeStyle = "";
                      if (item.status === "Pending") {
                        badgeStyle = "bg-accent-gam/10 text-accent-gam border border-accent-gam/20";
                      } else if (item.status === "Approved") {
                        badgeStyle = "bg-accent-env/10 text-accent-env border border-accent-env/20";
                      } else if (item.status === "Rejected") {
                        badgeStyle = "bg-red-500/10 text-red-400 border border-red-500/20";
                      }

                      const isSelected = selectedQueueIds.includes(item.id);
                      const isPending = item.status === 'Pending';

                      return (
                        <tr 
                          key={item.id} 
                          className={`hover:bg-bg-base/30 transition-colors duration-150 group cursor-pointer ${isSelected ? 'bg-accent-soc/5 hover:bg-accent-soc/10' : ''}`}
                          onClick={() => isPending && handleToggleSelectRow(item.id)}
                        >
                          <td className="py-4 px-6 text-center">
                            {isPending ? (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="rounded border-border-sage bg-bg-base text-accent-soc focus:ring-0 focus:ring-offset-0"
                              />
                            ) : (
                              <span className="text-text-secondary font-mono text-[9px]">-</span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-bold text-text-primary group-hover:text-accent-soc transition-colors font-display">
                            {item.name}
                          </td>
                          <td className="py-4 px-6 text-text-secondary font-semibold">
                            {item.department}
                          </td>
                          <td className="py-4 px-6 text-text-secondary font-semibold">
                            {item.activity}
                          </td>
                          <td className="py-4 px-6 font-mono text-text-secondary">
                            {item.dateJoined}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-bold text-brand">
                            {item.pointsEarned}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${badgeStyle}`}>
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

            <div className="flex flex-col items-end space-y-2 pt-2">
              <div className="flex space-x-3">
                <button 
                  onClick={handleReject}
                  disabled={!canApprove('social')}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 bg-red-500 text-white font-bold text-xs rounded-lg shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                    !canApprove('social') ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:bg-red-600'
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span className="uppercase tracking-wider">Reject</span>
                </button>
                
                <button 
                  onClick={handleApprove}
                  disabled={!canApprove('social')}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 bg-accent-env text-bg-base font-bold text-xs rounded-lg shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                    !canApprove('social') ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:bg-emerald-600'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span className="uppercase tracking-wider">Approve</span>
                </button>
              </div>
              {!canApprove('social') && (
                <p className="text-[10px] text-text-secondary/70 font-bold">Approvals require Manager or HR access</p>
              )}
            </div>
          </section>
        )}

        {activeSubTab === 'Diversity Dashboard' && (
          <div className="bg-bg-card border border-border-sage rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <span className="text-3xl mb-4">📊</span>
            <h3 className="text-base font-bold text-text-primary tracking-wide font-display uppercase font-bold">Diversity Dashboard</h3>
            <p className="text-xs text-text-secondary mt-2 font-medium">Demographics, gender distribution, and cultural initiatives are tracked here.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-bold text-text-secondary font-mono">
              <div className="bg-bg-base border border-border-sage/80 p-4 rounded-xl">Gender Diversity: <span className="text-accent-soc font-bold">48% F / 52% M</span></div>
              <div className="bg-bg-base border border-border-sage/80 p-4 rounded-xl">Veteran Hires: <span className="text-accent-env font-bold">5.4%</span></div>
              <div className="bg-bg-base border border-border-sage/80 p-4 rounded-xl">Inclusion Programs: <span className="text-accent-gov font-bold">8 Active</span></div>
            </div>
          </div>
        )}
      </main>

      {/* Create CSR Activity Modal */}
      <Modal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        title="Create CSR Activity"
        confirmText="Create Activity"
        confirmColorClass="bg-accent-soc hover:bg-blue-600 text-bg-base font-bold"
        onConfirm={handleCreateActivity}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Activity Name</label>
            <input
              type="text"
              value={newActivityData.title}
              onChange={(e) => setNewActivityData({ ...newActivityData, title: e.target.value })}
              placeholder="e.g. Community Garden Prep"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-soc"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Points Value</label>
              <input
                type="number"
                value={newActivityData.pointsValue}
                onChange={(e) => setNewActivityData({ ...newActivityData, pointsValue: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-soc"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Category Icon</label>
              <select
                value={newActivityData.iconType}
                onChange={(e) => setNewActivityData({ ...newActivityData, iconType: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-soc"
              >
                <option value="tree">Environmental / Plant</option>
                <option value="droplet">Medical / Blood Donation</option>
                <option value="waves">Beach / Cleanup</option>
                <option value="grad">Education / Workshop</option>
                <option value="heart">General / Charity</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="evidenceRequired"
              checked={newActivityData.evidenceRequired}
              onChange={(e) => setNewActivityData({ ...newActivityData, evidenceRequired: e.target.checked })}
              className="rounded border-border-sage bg-bg-base text-accent-soc focus:ring-0"
            />
            <label htmlFor="evidenceRequired" className="text-xs font-bold text-text-secondary cursor-pointer select-none">
              Require evidence for approval
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
