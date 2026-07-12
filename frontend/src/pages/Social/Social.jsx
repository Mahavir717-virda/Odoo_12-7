import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { 
  Plus, 
  TreePine, 
  Droplet, 
  Waves, 
  GraduationCap, 
  Paperclip, 
  FileText, 
  Check, 
  X, 
  Lock,
  BookOpen,
  Heart
} from 'lucide-react';

export default function Social() {
  const location = useLocation();
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('CSR Activities');

  useEffect(() => {
    if (location.state?.activeSubTab) {
      setActiveSubTab(location.state.activeSubTab);
    }
  }, [location.state]);

  // --- STATEFUL CSR ACTIVITIES ---
  const [activities, setActivities] = useState([
    {
      id: 1,
      title: "Tree Plantation",
      joined: 24,
      evidenceRequired: true,
      iconType: "tree",
      hasJoined: false
    },
    {
      id: 2,
      title: "Blood Donation",
      joined: 18,
      evidenceRequired: true,
      iconType: "droplet",
      hasJoined: false
    },
    {
      id: 3,
      title: "Beach Cleanup",
      joined: 31,
      evidenceRequired: false,
      iconType: "waves",
      hasJoined: false
    },
    {
      id: 4,
      title: "ESG Workshop",
      joined: 52,
      evidenceRequired: false,
      iconType: "grad",
      hasJoined: false
    }
  ]);

  // --- STATEFUL PARTICIPATION ---
  const [participationList, setParticipationList] = useState([
    {
      id: 1,
      employee: "Aditi Rao",
      activity: "Tree Plantation",
      proof: "photo.jpg",
      isImage: true,
      points: 50,
      status: "Pending"
    },
    {
      id: 2,
      employee: "Karan Shah",
      activity: "ESG Workshop",
      proof: "cert.pdf",
      isImage: false,
      points: 30,
      status: "Approved"
    },
    {
      id: 3,
      employee: "Raj Patel",
      activity: "Beach Cleanup",
      proof: "cleanup_selfie.png",
      isImage: true,
      points: 40,
      status: "Pending"
    }
  ]);

  // Checkbox selection state for queue
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);

  // CSR activity creation form state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [newActivityData, setNewActivityData] = useState({ title: '', iconType: 'tree', evidenceRequired: false });

  const renderActivityIcon = (type) => {
    switch (type) {
      case 'tree': return <TreePine className="w-5 h-5" />;
      case 'droplet': return <Droplet className="w-5 h-5 text-red-400" />;
      case 'waves': return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'grad': return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      default: return <Heart className="w-5 h-5 text-pink-400" />;
    }
  };

  // CSR Activities Handlers
  const handleJoinActivity = (id, title) => {
    setActivities(activities.map(act => {
      if (act.id === id) {
        return { ...act, joined: act.joined + 1, hasJoined: true };
      }
      return act;
    }));
    showToast(`You have joined: ${title}!`, "success");
  };

  const handleCreateActivity = (e) => {
    e.preventDefault();
    if (!newActivityData.title) {
      showToast("Please enter activity name.", "error");
      return;
    }
    const newAct = {
      id: Date.now(),
      title: newActivityData.title,
      joined: 0,
      evidenceRequired: newActivityData.evidenceRequired,
      iconType: newActivityData.iconType,
      hasJoined: false
    };
    setActivities([...activities, newAct]);
    showToast("CSR Activity created successfully!", "success");
    setIsActivityModalOpen(false);
    setNewActivityData({ title: '', iconType: 'tree', evidenceRequired: false });
  };

  // Participation Approvals Handlers
  const handleApprove = () => {
    const targets = selectedQueueIds.length > 0 ? selectedQueueIds : [];
    if (targets.length === 0) {
      showToast("Please select at least one pending record to approve.", "error");
      return;
    }

    setParticipationList(participationList.map(item => {
      if (targets.includes(item.id) && item.status === 'Pending') {
        return { ...item, status: 'Approved' };
      }
      return item;
    }));

    showToast("Participation approved successfully!", "success");
    setSelectedQueueIds([]);
  };

  const handleReject = () => {
    const targets = selectedQueueIds.length > 0 ? selectedQueueIds : [];
    if (targets.length === 0) {
      showToast("Please select at least one pending record to reject.", "error");
      return;
    }

    setParticipationList(participationList.map(item => {
      if (targets.includes(item.id) && item.status === 'Pending') {
        return { ...item, status: 'Rejected' };
      }
      return item;
    }));

    showToast("Participation rejected.", "error");
    setSelectedQueueIds([]);
  };

  // Toggle selection
  const handleToggleSelectRow = (id) => {
    if (selectedQueueIds.includes(id)) {
      setSelectedQueueIds(selectedQueueIds.filter(x => x !== id));
    } else {
      setSelectedQueueIds([...selectedQueueIds, id]);
    }
  };

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
                  onClick={() => setIsActivityModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-soc to-blue-600 hover:brightness-110 text-bg-base font-extrabold text-xs rounded-lg transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-accent-soc/5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="uppercase tracking-wider">New Activity</span>
                </button>
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
                      {activity.joined} joined
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
                      disabled={activity.hasJoined}
                      onClick={() => handleJoinActivity(activity.id, activity.title)}
                      className={`w-full py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        activity.hasJoined 
                          ? 'bg-bg-base text-text-secondary cursor-not-allowed border border-border-sage/40' 
                          : 'bg-accent-soc hover:brightness-110 text-bg-base'
                      }`}
                    >
                      {activity.hasJoined ? 'Joined ✓' : 'Join'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSubTab === 'Employee Participation' && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-[10px] font-extrabold text-text-secondary uppercase tracking-wider pl-1 font-display">
              <span>Employee Participation: Approval Queue</span>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                  <thead>
                    <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                      <th className="py-4 px-6 w-8"></th>
                      <th className="py-4 px-6">Employee</th>
                      <th className="py-4 px-6">Activity/Challenge</th>
                      <th className="py-4 px-6">Proof</th>
                      <th className="py-4 px-6 text-right">Points</th>
                      <th className="py-4 px-6">Approval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-sage/40 text-text-primary">
                    {participationList.map((item) => {
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
                                onChange={() => {}} // toggled on row click
                                className="rounded border-border-sage bg-bg-base text-accent-soc focus:ring-0 focus:ring-offset-0"
                              />
                            ) : (
                              <span className="text-text-secondary font-mono text-[9px]">-</span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-bold text-text-primary group-hover:text-accent-soc transition-colors font-display">
                            {item.employee}
                          </td>
                          <td className="py-4 px-6 text-text-secondary font-semibold">
                            {item.activity}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center space-x-1.5 bg-bg-base border border-border-sage hover:border-text-secondary px-2.5 py-1 rounded-md text-[10px] font-mono text-text-primary transition-colors cursor-pointer">
                              {item.isImage ? (
                                <Paperclip className="w-3 h-3 text-text-secondary" />
                              ) : (
                                <FileText className="w-3 h-3 text-text-secondary" />
                              )}
                              <span>{item.proof}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-bold text-text-primary">
                            {item.points}
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

            <div className="flex justify-end space-x-3 pt-2">
              <button 
                onClick={handleReject}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span className="uppercase tracking-wider">Reject</span>
              </button>
              
              <button 
                onClick={handleApprove}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-accent-env hover:bg-emerald-600 text-bg-base font-bold text-xs rounded-lg shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span className="uppercase tracking-wider">Approve</span>
              </button>
            </div>
          </section>
        )}

        {activeSubTab === 'Diversity Dashboard' && (
          <div className="bg-bg-card border border-border-sage rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <span className="text-3xl mb-4">📊</span>
            <h3 className="text-base font-bold text-text-primary tracking-wide font-display uppercase">Diversity Dashboard</h3>
            <p className="text-xs text-text-secondary mt-2 font-medium">Demographics, gender distribution, and cultural initiatives are tracked here.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-bold text-text-secondary">
              <div className="bg-bg-base border border-border-sage/80 p-4 rounded-xl">Gender Diversity: <span className="text-accent-soc font-bold">48% F / 52% M</span></div>
              <div className="bg-bg-base border border-border-sage/80 p-4 rounded-xl">Veteran Hires: <span className="text-accent-env font-bold">5.4%</span></div>
              <div className="bg-bg-base border border-border-sage/80 p-4 rounded-xl">Inclusion Programs: <span className="text-accent-gov font-bold">8 Active</span></div>
            </div>
          </div>
        )}
      </main>

      {/* modal for CSR activity creation */}
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
          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="evidenceRequired"
              checked={newActivityData.evidenceRequired}
              onChange={(e) => setNewActivityData({ ...newActivityData, evidenceRequired: e.target.checked })}
              className="rounded border-border-sage bg-bg-base text-accent-soc focus:ring-0"
            />
            <label htmlFor="evidenceRequired" className="text-xs font-bold text-text-secondary cursor-pointer">
              Require photo/receipt evidence for approval
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
