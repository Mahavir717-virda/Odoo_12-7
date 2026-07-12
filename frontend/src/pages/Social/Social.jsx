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

  // Modal State
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [newActivityData, setNewActivityData] = useState({ title: '', iconType: 'tree', evidenceRequired: false });

  // Map icon helper
  const renderActivityIcon = (type) => {
    switch (type) {
      case 'tree': return <TreePine className="w-6 h-6 text-emerald-400" />;
      case 'droplet': return <Droplet className="w-6 h-6 text-red-400" />;
      case 'waves': return <Waves className="w-6 h-6 text-cyan-400" />;
      case 'grad': return <GraduationCap className="w-6 h-6 text-blue-400" />;
      default: return <Heart className="w-6 h-6 text-amber-400" />;
    }
  };

  // --- HANDLERS ---
  const handleCreateActivity = (e) => {
    e.preventDefault();
    if (!newActivityData.title) {
      showToast("Activity name is required.", "error");
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
    showToast("CSR activity created successfully!", "success");
    setIsActivityModalOpen(false);
    // Reset
    setNewActivityData({ title: '', iconType: 'tree', evidenceRequired: false });
  };

  const handleJoinActivity = (id, title) => {
    setActivities(activities.map(act => {
      if (act.id === id) {
        return { ...act, joined: act.joined + 1, hasJoined: true };
      }
      return act;
    }));
    showToast(`You joined ${title}!`, "success");
  };

  // Approve action (acts on selected checkboxes OR falls back to all Pending items if nothing is checked)
  const handleApprove = () => {
    const targets = selectedQueueIds.length > 0 
      ? selectedQueueIds 
      : participationList.filter(p => p.status === 'Pending').map(p => p.id);

    if (targets.length === 0) {
      showToast("No pending items selected/found to approve.", "error");
      return;
    }

    setParticipationList(participationList.map(item => {
      if (targets.includes(item.id) && item.status === 'Pending') {
        return { ...item, status: 'Approved' };
      }
      return item;
    }));

    showToast("Participation approved!", "success");
    setSelectedQueueIds([]);
  };

  // Reject action
  const handleReject = () => {
    const targets = selectedQueueIds.length > 0 
      ? selectedQueueIds 
      : participationList.filter(p => p.status === 'Pending').map(p => p.id);

    if (targets.length === 0) {
      showToast("No pending items selected/found to reject.", "error");
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
    <div className="flex flex-col min-w-0 overflow-y-auto bg-[#0B0F14] flex-1">
      {/* SUB-NAV ROW */}
      <div className="bg-[#11161D]/10 border-b border-[#1F2937]/60 px-6 py-4">
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
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#3B82F6] text-black shadow-md shadow-blue-500/10 font-bold' 
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
        {activeSubTab === 'CSR Activities' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">CSR Activities</h2>
                <p className="text-xs text-gray-400 mt-1">Review corporate social responsibility activities and track team involvement.</p>
              </div>
              <div>
                <button 
                  onClick={() => setIsActivityModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-black font-bold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>New Activity</span>
                </button>
              </div>
            </div>

            {/* CSR Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-5 hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-950/5 transition-all duration-300 flex flex-col justify-between min-h-[190px]"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-800/40">
                        {renderActivityIcon(activity.iconType)}
                      </div>
                      <h3 className="font-bold text-white text-sm tracking-wide">{activity.title}</h3>
                    </div>
                    <p className="text-[12px] text-gray-400 font-medium">
                      {activity.joined} joined
                    </p>
                  </div>

                  <div className="space-y-3.5 mt-4">
                    <div className="flex items-center space-x-1.5">
                      {activity.evidenceRequired ? (
                        <span className="flex items-center text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <Lock className="w-3.5 h-3.5 mr-1" />
                          Evidence Required
                        </span>
                      ) : (
                        <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <BookOpen className="w-3.5 h-3.5 mr-1" />
                          Open
                        </span>
                      )}
                    </div>
                    <button 
                      disabled={activity.hasJoined}
                      onClick={() => handleJoinActivity(activity.id, activity.title)}
                      className={`w-full py-2 text-xs font-bold rounded-lg transition-colors duration-150 ${activity.hasJoined ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#3B82F6] hover:bg-[#2563EB] text-black'}`}
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
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">
              <span>Employee Participation: approval queue</span>
            </div>

            <div className="bg-[#11161D] border border-gray-800/85 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#171D26] border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6 w-8"></th>
                      <th className="py-4 px-6">Employee</th>
                      <th className="py-4 px-6">Activity/Challenge</th>
                      <th className="py-4 px-6">Proof</th>
                      <th className="py-4 px-6 text-right">Points</th>
                      <th className="py-4 px-6">Approval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                    {participationList.map((item) => {
                      let badgeStyle = "";
                      if (item.status === "Pending") {
                        badgeStyle = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
                      } else if (item.status === "Approved") {
                        badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                      } else if (item.status === "Rejected") {
                        badgeStyle = "bg-red-500/10 text-red-400 border border-red-500/20";
                      }

                      const isSelected = selectedQueueIds.includes(item.id);
                      const isPending = item.status === 'Pending';

                      return (
                        <tr 
                          key={item.id} 
                          className={`hover:bg-gray-800/15 transition-colors duration-150 group cursor-pointer ${isSelected ? 'bg-blue-500/5 hover:bg-blue-500/10' : ''}`}
                          onClick={() => isPending && handleToggleSelectRow(item.id)}
                        >
                          <td className="py-4 px-6 text-center">
                            {isPending ? (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // toggled on row click
                                className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
                              />
                            ) : (
                              <span className="text-gray-600 font-mono text-[9px]">-</span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {item.employee}
                          </td>
                          <td className="py-4 px-6 text-gray-400 font-medium">
                            {item.activity}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center space-x-1.5 bg-gray-800/40 border border-gray-800 hover:border-gray-700 px-2.5 py-1 rounded-md text-[11px] font-mono text-gray-300 transition-colors cursor-pointer">
                              {item.isImage ? (
                                <Paperclip className="w-3 h-3 text-gray-500" />
                              ) : (
                                <FileText className="w-3 h-3 text-gray-500" />
                              )}
                              <span>{item.proof}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-bold text-white">
                            {item.points}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
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
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs rounded-lg shadow-lg shadow-red-950/20 transition-all duration-150 active:scale-[0.98]"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
              
              <button 
                onClick={handleApprove}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-black font-bold text-xs rounded-lg shadow-lg shadow-blue-950/20 transition-all duration-150 active:scale-[0.98]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Approve</span>
              </button>
            </div>
          </section>
        )}

        {activeSubTab === 'Diversity Dashboard' && (
          <div className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <span className="text-3xl mb-4">📊</span>
            <h3 className="text-base font-semibold text-white tracking-wide">Diversity Dashboard</h3>
            <p className="text-sm text-gray-500 mt-2 font-medium">Demographics, gender distribution, and cultural initiatives are tracked here.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-semibold text-gray-400">
              <div className="bg-[#11161D] border border-gray-850 p-4 rounded-xl">Gender Diversity: <span className="text-blue-400 font-bold">48% F / 52% M</span></div>
              <div className="bg-[#11161D] border border-gray-850 p-4 rounded-xl">Veteran Hires: <span className="text-emerald-400 font-bold">5.4%</span></div>
              <div className="bg-[#11161D] border border-gray-850 p-4 rounded-xl">Inclusion Programs: <span className="text-purple-400 font-bold">8 Active</span></div>
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
        confirmColorClass="bg-[#3B82F6] hover:bg-[#2563EB] text-black font-bold"
        onConfirm={handleCreateActivity}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Activity Name</label>
            <input
              type="text"
              value={newActivityData.title}
              onChange={(e) => setNewActivityData({ ...newActivityData, title: e.target.value })}
              placeholder="e.g. Community Garden Prep"
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Category Icon</label>
            <select
              value={newActivityData.iconType}
              onChange={(e) => setNewActivityData({ ...newActivityData, iconType: e.target.value })}
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
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
              className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-0"
            />
            <label htmlFor="evidenceRequired" className="text-xs font-semibold text-gray-300 cursor-pointer">
              Require photo/receipt evidence for approval
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
