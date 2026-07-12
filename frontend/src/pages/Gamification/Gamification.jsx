import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { 
  Plus, 
  Trophy, 
  Calendar, 
  Award, 
  Medal, 
  Star, 
  Crown, 
  Users,
  Gift
} from 'lucide-react';

export default function Gamification() {
  const location = useLocation();
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('Challenges');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'draft' | 'active' | 'review' | 'completed'

  useEffect(() => {
    if (location.state?.activeSubTab) {
      setActiveSubTab(location.state.activeSubTab);
    }
  }, [location.state]);

  const lifecycleFilters = [
    { name: 'All', type: 'all', style: 'bg-gray-800/60 text-gray-200 hover:text-white' },
    { name: 'Draft', type: 'draft', style: 'bg-gray-850 text-gray-400 hover:bg-gray-800' },
    { name: 'Active', type: 'active', style: 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20' },
    { name: 'Under Review', type: 'review', style: 'border border-purple-500/40 text-purple-400' },
    { name: 'Completed', type: 'completed', style: 'border border-blue-500/40 text-blue-400' }
  ];

  // --- STATE SEED DATA ---
  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: "Sustainability Sprint",
      xp: 200,
      difficulty: "Hard",
      deadline: "2026-07-20",
      status: "Active",
      enabled: true,
      hasJoined: false
    },
    {
      id: 2,
      title: "Recycle Challenge",
      xp: 80,
      difficulty: "Easy",
      deadline: "2026-07-15",
      status: "Active",
      enabled: true,
      hasJoined: false
    },
    {
      id: 3,
      title: "Commute Green Week",
      xp: 120,
      difficulty: "Medium",
      deadline: "2026-07-25",
      status: "Draft",
      enabled: false,
      hasJoined: false
    }
  ]);

  const [participationList, setParticipationList] = useState([
    { id: 1, name: "Aditi Rao", challenge: "Recycle Challenge", xpEarned: 80, dateJoined: "2026-07-08", status: "Joined" },
    { id: 2, name: "Karan Shah", challenge: "Sustainability Sprint", xpEarned: 200, dateJoined: "2026-07-05", status: "Completed" }
  ]);

  const [badges, setBadges] = useState([
    { id: 1, name: "Green Beginner", desc: "First ESG activity complete", iconType: "star" },
    { id: 2, name: "Carbon Saver", desc: "Reduced 100kg CO₂", iconType: "medal" },
    { id: 3, name: "Sustainability Champion", desc: "Completed 5 challenges", iconType: "trophy" },
    { id: 4, name: "Team Player", desc: "Joined team cleanup", iconType: "users" }
  ]);

  const [rewards, setRewards] = useState([
    { id: 1, name: "Eco Thermal Flask", costXp: 300, stock: 12, category: "Merchandise" },
    { id: 2, name: "Solar Phone Charger", costXp: 750, stock: 4, category: "Hardware" },
    { id: 3, name: "Tree Planted in Your Name", costXp: 150, stock: 999, category: "Social Good" }
  ]);

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: "Manufacturing Dept", xp: 4820, isFirst: true },
    { rank: 2, name: "Aditi Rao", xp: 3910, isFirst: false },
    { rank: 3, name: "Corporate Dept", xp: 3505, isFirst: false }
  ]);

  // --- MODALS STATE ---
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [challengeFormData, setChallengeFormData] = useState({ title: '', xp: '', difficulty: 'Medium', deadline: '', status: 'Active' });

  const [isParticipationModalOpen, setIsParticipationModalOpen] = useState(false);
  const [participationFormData, setParticipationFormData] = useState({ name: '', challenge: 'Recycle Challenge' });

  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [badgeFormData, setBadgeFormData] = useState({ name: '', desc: '', iconType: 'star' });

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [rewardFormData, setRewardFormData] = useState({ name: '', costXp: '', stock: '', category: 'Merchandise' });

  const [isCompetitorModalOpen, setIsCompetitorModalOpen] = useState(false);
  const [competitorFormData, setCompetitorFormData] = useState({ name: '', xp: '' });

  // --- RENDERING HELPERS ---
  const renderBadgeIcon = (type) => {
    switch (type) {
      case 'star': return <Star className="w-6 h-6 text-orange-400" />;
      case 'medal': return <Medal className="w-6 h-6 text-orange-400" />;
      case 'trophy': return <Trophy className="w-6 h-6 text-orange-400" />;
      default: return <Users className="w-6 h-6 text-orange-400" />;
    }
  };

  // --- HANDLERS ---
  const handleCreateChallenge = (e) => {
    e.preventDefault();
    if (!challengeFormData.title || !challengeFormData.xp || !challengeFormData.deadline) {
      showToast("Please fill in title, XP reward, and deadline.", "error");
      return;
    }

    const newCh = {
      id: Date.now(),
      title: challengeFormData.title,
      xp: parseInt(challengeFormData.xp, 10),
      difficulty: challengeFormData.difficulty,
      deadline: challengeFormData.deadline,
      status: challengeFormData.status,
      enabled: challengeFormData.status === 'Active',
      hasJoined: false
    };

    setChallenges([...challenges, newCh]);
    showToast("Challenge created successfully!", "success");
    setIsChallengeModalOpen(false);
    setChallengeFormData({ title: '', xp: '', difficulty: 'Medium', deadline: '', status: 'Active' });
  };

  const handleJoinChallenge = (id, title) => {
    setChallenges(challenges.map(ch => {
      if (ch.id === id) {
        return { ...ch, hasJoined: true };
      }
      return ch;
    }));
    // Also push to participation logs
    const newPart = {
      id: Date.now(),
      name: "Current User",
      challenge: title,
      xpEarned: challenges.find(c => c.id === id)?.xp || 100,
      dateJoined: new Date().toISOString().split('T')[0],
      status: "Joined"
    };
    setParticipationList([newPart, ...participationList]);
    showToast(`Successfully joined challenge: ${title}!`, "success");
  };

  const handleRedeemReward = (id, name, cost) => {
    setRewards(rewards.map(rw => {
      if (rw.id === id) {
        return { ...rw, stock: Math.max(rw.stock - 1, 0) };
      }
      return rw;
    }));
    showToast(`Redeemed ${name} for ${cost} XP! Order has been placed.`, "success");
  };

  const handleCreateParticipation = (e) => {
    e.preventDefault();
    if (!participationFormData.name) {
      showToast("Please fill in employee name.", "error");
      return;
    }
    const newPart = {
      id: Date.now(),
      name: participationFormData.name,
      challenge: participationFormData.challenge,
      xpEarned: 100,
      dateJoined: new Date().toISOString().split('T')[0],
      status: "Joined"
    };
    setParticipationList([newPart, ...participationList]);
    showToast("Challenge participation logged!", "success");
    setIsParticipationModalOpen(false);
  };

  const handleCreateBadge = (e) => {
    e.preventDefault();
    if (!badgeFormData.name || !badgeFormData.desc) {
      showToast("Please fill in badge name and description.", "error");
      return;
    }
    const newB = {
      id: Date.now(),
      ...badgeFormData
    };
    setBadges([...badges, newB]);
    showToast("Badge template created!", "success");
    setIsBadgeModalOpen(false);
  };

  const handleCreateReward = (e) => {
    e.preventDefault();
    if (!rewardFormData.name || !rewardFormData.costXp || !rewardFormData.stock) {
      showToast("Please fill in reward name, cost, and stock.", "error");
      return;
    }
    const newR = {
      id: Date.now(),
      name: rewardFormData.name,
      costXp: parseInt(rewardFormData.costXp, 10),
      stock: parseInt(rewardFormData.stock, 10),
      category: rewardFormData.category
    };
    setRewards([...rewards, newR]);
    showToast("Reward product created!", "success");
    setIsRewardModalOpen(false);
  };

  const handleCreateCompetitor = (e) => {
    e.preventDefault();
    if (!competitorFormData.name || !competitorFormData.xp) {
      showToast("Please fill in competitor name and XP.", "error");
      return;
    }
    const newComp = {
      rank: leaderboard.length + 1,
      name: competitorFormData.name,
      xp: parseInt(competitorFormData.xp, 10),
      isFirst: false
    };
    const sorted = [...leaderboard, newComp].sort((a, b) => b.xp - a.xp).map((item, idx) => ({
      ...item,
      rank: idx + 1,
      isFirst: idx === 0
    }));
    setLeaderboard(sorted);
    showToast("Leaderboard updated!", "success");
    setIsCompetitorModalOpen(false);
  };

  // Filter logic
  const filteredChallenges = challenges.filter(ch => {
    if (filterType === 'all') return true;
    return ch.status.toLowerCase() === filterType;
  });

  const subTabs = ['Challenges', 'Challenge Participation', 'Badges', 'Rewards', 'Leaderboard'];

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
                    ? 'bg-[#F97316] text-black shadow-md shadow-orange-500/10 font-bold' 
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
        
        {/* --- CHALLENGES TAB --- */}
        {activeSubTab === 'Challenges' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Gamified ESG Challenges</h2>
                <p className="text-xs text-gray-400 mt-1 font-medium">Motivate teams and employees to reach environmental and social milestones.</p>
              </div>
              <div>
                <button 
                  onClick={() => setIsChallengeModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#F97316] hover:bg-[#EA580C] text-black font-bold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>New Challenge</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pb-2">
              {lifecycleFilters.map((filter) => (
                <button
                  key={filter.name}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                    filterType === filter.type 
                      ? 'bg-[#F97316] text-black font-bold border border-transparent' 
                      : 'bg-gray-800/40 text-gray-400 border border-transparent hover:text-white'
                  }`}
                  onClick={() => setFilterType(filter.type)}
                >
                  {filter.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => {
                let badgeStyle = "";
                if (challenge.status === "Active") {
                  badgeStyle = "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20";
                } else if (challenge.status === "Draft") {
                  badgeStyle = "bg-gray-800 text-gray-400";
                } else if (challenge.status === "Under Review") {
                  badgeStyle = "border border-purple-500/40 text-purple-400 bg-transparent";
                } else if (challenge.status === "Completed") {
                  badgeStyle = "border border-blue-500/40 text-blue-400 bg-transparent";
                }

                return (
                  <div 
                    key={challenge.id}
                    className="bg-[#11161D] border-2 border-orange-500/40 rounded-2xl p-5 hover:scale-[1.01] hover:shadow-lg hover:shadow-orange-950/5 transition-all duration-300 flex flex-col justify-between min-h-[220px]"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center space-x-3.5">
                        <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                          <Trophy className="w-5 h-5 text-orange-400" />
                        </div>
                        <h3 className="font-bold text-white text-sm tracking-wide leading-snug">{challenge.title}</h3>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[12px] text-gray-400 font-semibold">
                          XP: <span className="text-orange-400 font-bold">{challenge.xp}</span> • {challenge.difficulty}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-600 mr-1" />
                          <span>Deadline: {challenge.deadline}</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${badgeStyle}`}>
                          {challenge.status}
                        </span>
                      </div>

                      {challenge.enabled ? (
                        <button 
                          disabled={challenge.hasJoined}
                          onClick={() => handleJoinChallenge(challenge.id, challenge.title)}
                          className={`w-full py-2 text-xs font-bold rounded-lg transition-colors duration-150 ${challenge.hasJoined ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/50' : 'bg-[#F97316] hover:bg-[#EA580C] text-black active:scale-[0.98]'}`}
                        >
                          {challenge.hasJoined ? 'Joined ✓' : 'Join Challenge'}
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="w-full py-2 bg-gray-800 text-gray-500 text-xs font-bold rounded-lg cursor-not-allowed border border-gray-700/50"
                        >
                          Join Challenge
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* --- CHALLENGE PARTICIPATION LOGS --- */}
        {activeSubTab === 'Challenge Participation' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Participation Audit</h2>
                <p className="text-xs text-gray-400 mt-1">Review live employee engagements and XP reward logs.</p>
              </div>
              <button 
                onClick={() => setIsParticipationModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#F97316] hover:bg-[#EA580C] text-black font-bold text-xs rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Log Participation</span>
              </button>
            </div>

            <div className="bg-[#11161D] border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#171D26] border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Participant</th>
                    <th className="py-4 px-6">Challenge</th>
                    <th className="py-4 px-6 font-mono">Date Enrolled</th>
                    <th className="py-4 px-6 text-right">XP Earned</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                  {participationList.map(part => (
                    <tr key={part.id} className="hover:bg-gray-800/10">
                      <td className="py-4 px-6 font-semibold text-white">{part.name}</td>
                      <td className="py-4 px-6 text-gray-400 font-medium">{part.challenge}</td>
                      <td className="py-4 px-6 text-gray-500 font-mono">{part.dateJoined}</td>
                      <td className="py-4 px-6 text-right font-mono text-orange-400 font-bold">{part.xpEarned} XP</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${part.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                          {part.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* --- BADGES TAB --- */}
        {activeSubTab === 'Badges' && (
          <section className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Award className="w-4.5 h-4.5 text-orange-400" />
                <span>Badge Gallery</span>
              </div>
              <button
                onClick={() => setIsBadgeModalOpen(true)}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#F97316] text-black text-xs font-bold rounded-lg hover:bg-[#EA580C]"
              >
                <Plus className="w-3 h-3 stroke-[2]" />
                <span>Create Badge</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div 
                  key={badge.id}
                  className="border border-orange-500/20 hover:border-orange-500/40 bg-orange-500/[0.02] hover:bg-orange-500/[0.04] p-4 rounded-xl flex items-center space-x-3.5 transition-all duration-300 group cursor-pointer"
                >
                  <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg group-hover:scale-105 transition-transform duration-300">
                    {renderBadgeIcon(badge.iconType)}
                  </div>
                  <div>
                    <h4 className="text-[12px] font-extrabold text-orange-400 tracking-wide">{badge.name}</h4>
                    <p className="text-[10px] text-gray-500 font-semibold mt-0.5 leading-snug">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- REWARDS TAB --- */}
        {activeSubTab === 'Rewards' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Eco Rewards Store</h2>
                <p className="text-xs text-gray-400 mt-1">Redeem your accumulated XP rewards for carbon credits, swag, or environmental donations.</p>
              </div>
              <button 
                onClick={() => setIsRewardModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#F97316] hover:bg-[#EA580C] text-black font-bold text-xs rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>New Reward Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {rewards.map(item => (
                <div key={item.id} className="bg-[#11161D] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between min-h-[180px] hover:border-orange-500/30 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <Gift className="w-3.5 h-3.5 text-orange-500" />
                      <span>{item.category}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide">{item.name}</h3>
                    <p className="text-xs text-orange-400 font-semibold font-mono">{item.costXp} XP Required</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-bold">Stock: {item.stock} left</span>
                    <button
                      disabled={item.stock === 0}
                      onClick={() => handleRedeemReward(item.id, item.name, item.costXp)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${item.stock === 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#F97316] text-black hover:bg-[#EA580C]'}`}
                    >
                      {item.stock === 0 ? 'Out of Stock' : 'Redeem'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- LEADERBOARD TAB --- */}
        {activeSubTab === 'Leaderboard' && (
          <section className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Trophy className="w-4.5 h-4.5 text-orange-400" />
                <span>Leaderboard Standing</span>
              </div>
              <button
                onClick={() => setIsCompetitorModalOpen(true)}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#F97316] text-black text-xs font-bold rounded-lg hover:bg-[#EA580C]"
              >
                <Plus className="w-3 h-3 stroke-[2]" />
                <span>Add Competitor</span>
              </button>
            </div>

            <div className="overflow-hidden border border-gray-800/80 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#171D26] border-b border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Employee/Dept</th>
                    <th className="py-3 px-4 text-right">XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-gray-300">
                  {leaderboard.map((row) => (
                    <tr 
                      key={row.name}
                      className={`transition-colors duration-150 ${
                        row.isFirst 
                          ? 'bg-amber-500/[0.04] hover:bg-amber-500/[0.08] font-bold text-amber-400' 
                          : 'hover:bg-gray-800/20'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center space-x-1.5">
                          {row.isFirst && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                          <span>{row.rank}</span>
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${row.isFirst ? 'text-amber-400' : 'text-gray-200'}`}>
                        {row.name}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {row.xp.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* --- CHALLENGE CREATION MODAL --- */}
      <Modal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        title="Create ESG Challenge"
        confirmText="Publish Challenge"
        confirmColorClass="bg-[#F97316] hover:bg-[#EA580C] text-black font-bold"
        onConfirm={handleCreateChallenge}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Challenge Title</label>
            <input
              type="text"
              value={challengeFormData.title}
              onChange={(e) => setChallengeFormData({ ...challengeFormData, title: e.target.value })}
              placeholder="e.g. Zero-Waste Printer Sprint"
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">XP Reward</label>
              <input
                type="number"
                value={challengeFormData.xp}
                onChange={(e) => setChallengeFormData({ ...challengeFormData, xp: e.target.value })}
                placeholder="e.g. 150"
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Difficulty</label>
              <select
                value={challengeFormData.difficulty}
                onChange={(e) => setChallengeFormData({ ...challengeFormData, difficulty: e.target.value })}
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Deadline</label>
              <input
                type="date"
                value={challengeFormData.deadline}
                onChange={(e) => setChallengeFormData({ ...challengeFormData, deadline: e.target.value })}
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-[#9CA3AF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Initial Status</label>
              <select
                value={challengeFormData.status}
                onChange={(e) => setChallengeFormData({ ...challengeFormData, status: e.target.value })}
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300"
              >
                <option>Active</option>
                <option>Draft</option>
                <option>Under Review</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* --- PARTICIPATION LOGGING MODAL --- */}
      <Modal
        isOpen={isParticipationModalOpen}
        onClose={() => setIsParticipationModalOpen(false)}
        title="Log Challenge Participation"
        confirmText="Register"
        confirmColorClass="bg-[#F97316] hover:bg-[#EA580C] text-black font-bold"
        onConfirm={handleCreateParticipation}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Employee Name</label>
            <input
              type="text"
              value={participationFormData.name}
              onChange={(e) => setParticipationFormData({ ...participationFormData, name: e.target.value })}
              placeholder="e.g. Aditi Rao"
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Target Challenge</label>
            <select
              value={participationFormData.challenge}
              onChange={(e) => setParticipationFormData({ ...participationFormData, challenge: e.target.value })}
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300"
            >
              {challenges.map(c => (
                <option key={c.id} value={c.title}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* --- BADGE FORM MODAL --- */}
      <Modal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        title="New Badge Template"
        confirmText="Create Template"
        confirmColorClass="bg-[#F97316] hover:bg-[#EA580C] text-black font-bold"
        onConfirm={handleCreateBadge}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Badge Name</label>
            <input
              type="text"
              value={badgeFormData.name}
              onChange={(e) => setBadgeFormData({ ...badgeFormData, name: e.target.value })}
              placeholder="e.g. Eco Ambassador"
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Description Criteria</label>
            <input
              type="text"
              value={badgeFormData.desc}
              onChange={(e) => setBadgeFormData({ ...badgeFormData, desc: e.target.value })}
              placeholder="e.g. Acknowledge 3 Governance Policies"
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Badge Symbol</label>
            <select
              value={badgeFormData.iconType}
              onChange={(e) => setBadgeFormData({ ...badgeFormData, iconType: e.target.value })}
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300"
            >
              <option value="star">Star Icon</option>
              <option value="medal">Medal Icon</option>
              <option value="trophy">Trophy Icon</option>
              <option value="users">Group Icon</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* --- REWARD FORM MODAL --- */}
      <Modal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        title="Add Reward Product"
        confirmText="Publish Reward"
        confirmColorClass="bg-[#F97316] hover:bg-[#EA580C] text-black font-bold"
        onConfirm={handleCreateReward}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Product Name</label>
            <input
              type="text"
              value={rewardFormData.name}
              onChange={(e) => setRewardFormData({ ...rewardFormData, name: e.target.value })}
              placeholder="e.g. Recycled Cotton Tote Bag"
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">XP Price</label>
              <input
                type="number"
                value={rewardFormData.costXp}
                onChange={(e) => setRewardFormData({ ...rewardFormData, costXp: e.target.value })}
                placeholder="e.g. 200"
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Initial Inventory</label>
              <input
                type="number"
                value={rewardFormData.stock}
                onChange={(e) => setRewardFormData({ ...rewardFormData, stock: e.target.value })}
                placeholder="e.g. 50"
                className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Category</label>
            <select
              value={rewardFormData.category}
              onChange={(e) => setRewardFormData({ ...rewardFormData, category: e.target.value })}
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300"
            >
              <option>Merchandise</option>
              <option>Hardware</option>
              <option>Social Good</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* --- ADD COMPETITOR MODAL --- */}
      <Modal
        isOpen={isCompetitorModalOpen}
        onClose={() => setIsCompetitorModalOpen(false)}
        title="Register Leaderboard Competitor"
        confirmText="Register"
        confirmColorClass="bg-[#F97316] hover:bg-[#EA580C] text-black font-bold"
        onConfirm={handleCreateCompetitor}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Competitor Name</label>
            <input
              type="text"
              value={competitorFormData.name}
              onChange={(e) => setCompetitorFormData({ ...competitorFormData, name: e.target.value })}
              placeholder="e.g. Priya Sharma"
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Accumulated XP</label>
            <input
              type="number"
              value={competitorFormData.xp}
              onChange={(e) => setCompetitorFormData({ ...competitorFormData, xp: e.target.value })}
              placeholder="e.g. 2500"
              className="w-full bg-[#0B0F14] border border-gray-800 rounded-lg p-2 text-xs text-gray-300 focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
