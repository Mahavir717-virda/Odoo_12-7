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
    { name: 'All', type: 'all' },
    { name: 'Draft', type: 'draft' },
    { name: 'Active', type: 'active' },
    { name: 'Under Review', type: 'review' },
    { name: 'Completed', type: 'completed' }
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
  const renderBadgeIcon = (iconType) => {
    switch (iconType) {
      case 'medal': return <Medal className="w-6 h-6 text-accent-gam" />;
      case 'trophy': return <Trophy className="w-6 h-6 text-amber-500" />;
      case 'users': return <Users className="w-6 h-6 text-accent-soc" />;
      default: return <Star className="w-6 h-6 text-accent-env" />;
    }
  };

  // --- ACTIONS HANDLERS ---
  const handleJoinChallenge = (id, title) => {
    setChallenges(challenges.map(ch => {
      if (ch.id === id) {
        return { ...ch, hasJoined: true };
      }
      return ch;
    }));
    // Also append record in participation
    const newPart = {
      id: Date.now(),
      name: "Logged Employee",
      challenge: title,
      xpEarned: 0,
      dateJoined: new Date().toISOString().split('T')[0],
      status: "Joined"
    };
    setParticipationList([newPart, ...participationList]);
    showToast(`Successfully registered for challenge: ${title}!`, "success");
  };

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
    showToast("ESG Challenge created!", "success");
    setIsChallengeModalOpen(false);
    setChallengeFormData({ title: '', xp: '', difficulty: 'Medium', deadline: '', status: 'Active' });
  };

  const handleRedeemReward = (id, name, cost) => {
    setRewards(rewards.map(item => {
      if (item.id === id && item.stock > 0) {
        return { ...item, stock: item.stock - 1 };
      }
      return item;
    }));
    showToast(`Successfully redeemed: ${name} (Spent ${cost} XP)!`, "success");
  };

  const handleCreateParticipation = (e) => {
    e.preventDefault();
    if (!participationFormData.name) {
      showToast("Please enter employee name.", "error");
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
    setParticipationFormData({ name: '', challenge: 'Recycle Challenge' });
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
    setBadgeFormData({ name: '', desc: '', iconType: 'star' });
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
    setRewardFormData({ name: '', costXp: '', stock: '', category: 'Merchandise' });
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
    setCompetitorFormData({ name: '', xp: '' });
  };

  // Filter logic
  const filteredChallenges = challenges.filter(ch => {
    if (filterType === 'all') return true;
    return ch.status.toLowerCase() === filterType;
  });

  const subTabs = ['Challenges', 'Challenge Participation', 'Badges', 'Rewards', 'Leaderboard'];

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
                  setFilterType('all');
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-accent-gam text-bg-base shadow-md shadow-accent-gam/10 font-bold' 
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
        
        {/* --- CHALLENGES TAB --- */}
        {activeSubTab === 'Challenges' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Gamified ESG Challenges</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">Motivate teams and employees to reach environmental and social milestones.</p>
              </div>
              <div>
                <button 
                  onClick={() => setIsChallengeModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gam to-amber-600 hover:brightness-110 text-bg-base font-extrabold text-xs rounded-lg transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-accent-gam/5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="uppercase tracking-wider">New Challenge</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pb-2">
              {lifecycleFilters.map((filter) => (
                <button
                  key={filter.name}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                    filterType === filter.type 
                      ? 'bg-accent-gam text-bg-base border border-transparent' 
                      : 'bg-bg-card border border-border-sage text-text-secondary hover:text-text-primary hover:border-text-secondary'
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
                  badgeStyle = "bg-accent-env/10 text-accent-env border border-accent-env/20";
                } else if (challenge.status === "Draft") {
                  badgeStyle = "bg-bg-base text-text-secondary border border-border-sage/40";
                } else if (challenge.status === "Under Review") {
                  badgeStyle = "border border-accent-gov/20 text-accent-gov bg-accent-gov/10";
                } else if (challenge.status === "Completed") {
                  badgeStyle = "border border-accent-soc/20 text-accent-soc bg-accent-soc/10";
                }

                return (
                  <div 
                    key={challenge.id}
                    className="bg-bg-card border-2 border-accent-gam/30 rounded-2xl p-5 hover:scale-[1.01] hover:shadow-premium-orange transition-all duration-300 flex flex-col justify-between min-h-[220px]"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center space-x-3.5">
                        <div className="p-2 rounded-xl bg-accent-gam/10 border border-accent-gam/20">
                          <Trophy className="w-5 h-5 text-accent-gam" />
                        </div>
                        <h3 className="font-bold text-text-primary text-sm tracking-wide leading-snug font-display">{challenge.title}</h3>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-text-secondary font-semibold">
                          XP: <span className="text-accent-gam font-bold">{challenge.xp}</span> • {challenge.difficulty}
                        </p>
                        <p className="text-[11px] text-text-secondary/70 font-semibold flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          <span>Expires: {challenge.deadline}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border-sage/40 flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                        {challenge.status}
                      </span>

                      {challenge.status === 'Active' && (
                        <button
                          disabled={challenge.hasJoined}
                          onClick={() => handleJoinChallenge(challenge.id, challenge.title)}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                            challenge.hasJoined 
                              ? 'bg-bg-base text-text-secondary cursor-not-allowed border border-border-sage/40' 
                              : 'bg-accent-gam hover:brightness-110 text-bg-base'
                          }`}
                        >
                          {challenge.hasJoined ? 'Joined ✓' : 'Join'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* --- PARTICIPATION TAB --- */}
        {activeSubTab === 'Challenge Participation' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Active Participation</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">Verify employee registrations and challenge submissions across departments.</p>
              </div>
              <button 
                onClick={() => setIsParticipationModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gam to-amber-600 hover:brightness-110 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-gam/5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="uppercase tracking-wider">Log Participation</span>
              </button>
            </div>

            <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                    <th className="py-4 px-6">Participant</th>
                    <th className="py-4 px-6">Target Challenge</th>
                    <th className="py-4 px-6">Registration Date</th>
                    <th className="py-4 px-6 text-right">Potential XP</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  {participationList.map(row => (
                    <tr key={row.id} className="hover:bg-bg-base/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-text-primary font-display">{row.name}</td>
                      <td className="py-4 px-6 text-text-secondary font-semibold">{row.challenge}</td>
                      <td className="py-4 px-6 font-mono text-text-secondary">{row.dateJoined}</td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-accent-gam">{row.xpEarned}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          row.status === 'Completed' 
                            ? 'bg-accent-env/10 text-accent-env border border-accent-env/20' 
                            : 'bg-accent-soc/10 text-accent-soc border border-accent-soc/20'
                        }`}>
                          {row.status}
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
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Available Badges</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">Configure corporate milestone badges issued upon completing challenges.</p>
              </div>
              <button 
                onClick={() => setIsBadgeModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gam to-amber-600 hover:brightness-110 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-gam/5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="uppercase tracking-wider">New Badge</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {badges.map(b => (
                <div key={b.id} className="bg-bg-card border border-border-sage rounded-2xl p-5 hover:scale-[1.01] transition-all duration-300 flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-bg-base border border-border-sage">
                    {renderBadgeIcon(b.iconType)}
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary text-xs font-display">{b.name}</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5 font-medium">{b.desc}</p>
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
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Redeemable Rewards</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">Verify sustainability merchandise and hardware redeemable with accumulated XP points.</p>
              </div>
              <button 
                onClick={() => setIsRewardModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gam to-amber-600 hover:brightness-110 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-gam/5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="uppercase tracking-wider">New Reward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map(item => (
                <div key={item.id} className="bg-bg-card border border-border-sage rounded-2xl p-5 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between min-h-[160px]">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-accent-soc bg-accent-soc/10 border border-accent-soc/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-display">{item.category}</span>
                      <div className="flex items-center text-xs font-bold text-accent-gam bg-accent-gam/10 px-2 py-0.5 rounded-full border border-accent-gam/20">
                        <Gift className="w-3.5 h-3.5 mr-1" />
                        <span>{item.costXp} XP</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-text-primary mt-3 text-sm font-display tracking-wide">{item.name}</h4>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-text-secondary font-bold">Stock: {item.stock} left</span>
                    <button
                      disabled={item.stock === 0}
                      onClick={() => handleRedeemReward(item.id, item.name, item.costXp)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                        item.stock === 0 
                          ? 'bg-bg-base text-text-secondary cursor-not-allowed border border-border-sage/40' 
                          : 'bg-accent-gam hover:brightness-110 text-bg-base'
                      }`}
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
          <section className="bg-bg-card border border-border-sage rounded-2xl p-6 shadow-lg shadow-brand/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2 text-[10px] font-extrabold text-text-secondary uppercase tracking-wider font-display">
                <Trophy className="w-4.5 h-4.5 text-accent-gam" />
                <span>Leaderboard Standing</span>
              </div>
              <button
                onClick={() => setIsCompetitorModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gam to-amber-600 hover:brightness-110 text-bg-base font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-accent-gam/5"
              >
                <Plus className="w-3 h-3 stroke-[2]" />
                <span className="uppercase tracking-wider">Add Competitor</span>
              </button>
            </div>

            <div className="overflow-hidden border border-border-sage rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Employee/Dept</th>
                    <th className="py-3 px-4 text-right">XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-sage/40 text-text-primary">
                  {leaderboard.map((row) => (
                    <tr 
                      key={row.name}
                      className={`transition-colors duration-150 ${
                        row.isFirst 
                          ? 'bg-accent-gam/[0.04] hover:bg-accent-gam/[0.08] font-bold text-accent-gam' 
                          : 'hover:bg-bg-base/30'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center space-x-1.5">
                          {row.isFirst && <Crown className="w-3.5 h-3.5 text-accent-gam animate-bounce" />}
                          <span>{row.rank}</span>
                        </div>
                      </td>
                      <td className={`py-3 px-4 font-display ${row.isFirst ? 'text-accent-gam font-bold' : 'text-text-primary font-semibold'}`}>
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
        confirmColorClass="bg-accent-gam hover:bg-amber-600 text-bg-base font-bold"
        onConfirm={handleCreateChallenge}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Challenge Title</label>
            <input
              type="text"
              value={challengeFormData.title}
              onChange={(e) => setChallengeFormData({ ...challengeFormData, title: e.target.value })}
              placeholder="e.g. Zero-Waste Printer Sprint"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gam"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">XP Reward</label>
              <input
                type="number"
                value={challengeFormData.xp}
                onChange={(e) => setChallengeFormData({ ...challengeFormData, xp: e.target.value })}
                placeholder="e.g. 150"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Difficulty</label>
              <select
                value={challengeFormData.difficulty}
                onChange={(e) => setChallengeFormData({ ...challengeFormData, difficulty: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Deadline</label>
              <input
                type="date"
                value={challengeFormData.deadline}
                onChange={(e) => setChallengeFormData({ ...challengeFormData, deadline: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Initial Status</label>
              <select
                value={challengeFormData.status}
                onChange={(e) => setChallengeFormData({ ...challengeFormData, status: e.target.value })}
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary"
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
        confirmColorClass="bg-accent-gam hover:bg-amber-600 text-bg-base font-bold"
        onConfirm={handleCreateParticipation}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Employee Name</label>
            <input
              type="text"
              value={participationFormData.name}
              onChange={(e) => setParticipationFormData({ ...participationFormData, name: e.target.value })}
              placeholder="e.g. Aditi Rao"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gam"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Target Challenge</label>
            <select
              value={participationFormData.challenge}
              onChange={(e) => setParticipationFormData({ ...participationFormData, challenge: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gam"
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
        confirmColorClass="bg-accent-gam hover:bg-amber-600 text-bg-base font-bold"
        onConfirm={handleCreateBadge}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Badge Name</label>
            <input
              type="text"
              value={badgeFormData.name}
              onChange={(e) => setBadgeFormData({ ...badgeFormData, name: e.target.value })}
              placeholder="e.g. Eco Ambassador"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gam"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Description Criteria</label>
            <input
              type="text"
              value={badgeFormData.desc}
              onChange={(e) => setBadgeFormData({ ...badgeFormData, desc: e.target.value })}
              placeholder="e.g. Acknowledge 3 Governance Policies"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gam"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Badge Symbol</label>
            <select
              value={badgeFormData.iconType}
              onChange={(e) => setBadgeFormData({ ...badgeFormData, iconType: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gam"
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
        confirmColorClass="bg-accent-gam hover:bg-amber-600 text-bg-base font-bold"
        onConfirm={handleCreateReward}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Product Name</label>
            <input
              type="text"
              value={rewardFormData.name}
              onChange={(e) => setRewardFormData({ ...rewardFormData, name: e.target.value })}
              placeholder="e.g. Recycled Cotton Tote Bag"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gam"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">XP Price</label>
              <input
                type="number"
                value={rewardFormData.costXp}
                onChange={(e) => setRewardFormData({ ...rewardFormData, costXp: e.target.value })}
                placeholder="e.g. 200"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Initial Inventory</label>
              <input
                type="number"
                value={rewardFormData.stock}
                onChange={(e) => setRewardFormData({ ...rewardFormData, stock: e.target.value })}
                placeholder="e.g. 50"
                className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Category</label>
            <select
              value={rewardFormData.category}
              onChange={(e) => setRewardFormData({ ...rewardFormData, category: e.target.value })}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gam"
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
        confirmColorClass="bg-accent-gam hover:bg-amber-600 text-bg-base font-bold"
        onConfirm={handleCreateCompetitor}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Competitor Name</label>
            <input
              type="text"
              value={competitorFormData.name}
              onChange={(e) => setCompetitorFormData({ ...competitorFormData, name: e.target.value })}
              placeholder="e.g. Priya Sharma"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gam"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Accumulated XP</label>
            <input
              type="number"
              value={competitorFormData.xp}
              onChange={(e) => setCompetitorFormData({ ...competitorFormData, xp: e.target.value })}
              placeholder="e.g. 2500"
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gam"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
