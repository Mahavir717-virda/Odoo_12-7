import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
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
  Gift,
  RefreshCw,
  Loader,
  CheckCircle,
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

export default function Gamification() {
  const location = useLocation();
  const { showToast } = useToast();
  const { user, canEdit, canApprove } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState('Challenges');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);

  // Data
  const [challenges, setChallenges] = useState([]);
  const [participationList, setParticipationList] = useState([]);
  const [badges, setBadges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [challengeCategories, setChallengeCategories] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);

  // Modals
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [challengeFormData, setChallengeFormData] = useState({
    title: '', description: '', xpReward: '100', pointsReward: '50',
    difficulty: 'MEDIUM', startDate: '', endDate: '',
    category: '', evidenceRequired: true, maxParticipants: '500',
  });

  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [badgeFormData, setBadgeFormData] = useState({
    title: '', icon: 'star', xpRequired: '0', challengeCount: '0',
  });

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [rewardFormData, setRewardFormData] = useState({
    title: '', description: '', requiredPoints: '150', stock: '20',
  });

  useEffect(() => {
    if (location.state?.activeSubTab) setActiveSubTab(location.state.activeSubTab);
  }, [location.state]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [chRes, partRes, badgeRes, rewardRes, lbRes, catRes] = await Promise.allSettled([
        apiCall('/challenges?limit=100'),
        apiCall('/challenges/participants'),
        apiCall('/challenges/my-badges'),
        apiCall('/challenges/rewards'),
        apiCall('/challenges/leaderboard?limit=20'),
        apiCall('/challenges/categories'),
      ]);

      if (chRes.status === 'fulfilled') {
        const d = chRes.value?.data;
        setChallenges(Array.isArray(d?.results) ? d.results : Array.isArray(d) ? d : []);
      }
      if (partRes.status === 'fulfilled') {
        const d = partRes.value?.data;
        const list = Array.isArray(d) ? d : [];
        setParticipationList(list);
        if (user?._id) {
          const mine = list.filter(
            (p) => p.employeeId?._id === user._id || p.employeeId === user._id
          );
          setMyParticipations(mine.map((p) => p.challengeId?._id || p.challengeId));
        }
      }
      if (badgeRes.status === 'fulfilled') {
        const d = badgeRes.value?.data;
        setBadges(Array.isArray(d) ? d : []);
      }
      if (rewardRes.status === 'fulfilled') {
        const d = rewardRes.value?.data;
        setRewards(Array.isArray(d) ? d : []);
      }
      if (lbRes.status === 'fulfilled') {
        const d = lbRes.value?.data;
        setLeaderboard(Array.isArray(d) ? d : []);
      }
      if (catRes.status === 'fulfilled') {
        const d = catRes.value?.data;
        setChallengeCategories(Array.isArray(d) ? d : []);
      }
    } catch (err) {
      showToast('Failed to load gamification data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const renderBadgeIcon = (iconType) => {
    switch (iconType) {
      case 'medal': return <Medal className="w-6 h-6 text-accent-gam" />;
      case 'trophy': return <Trophy className="w-6 h-6 text-amber-500" />;
      case 'users': return <Users className="w-6 h-6 text-accent-soc" />;
      case 'award': return <Award className="w-6 h-6 text-accent-gov" />;
      default: return <Star className="w-6 h-6 text-accent-env" />;
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleJoinChallenge = async (challengeId, title) => {
    if (user?.role === 'Manager') {
      showToast('Managers cannot join employee challenges.', 'error');
      return;
    }
    try {
      await apiCall('/challenges/join', 'POST', { challengeId });
      showToast(`Successfully registered for: ${title}!`, 'success');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to join challenge.', 'error');
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    const { title, description, xpReward, startDate, endDate, category } = challengeFormData;
    if (!title || !description || !xpReward || !startDate || !endDate || !category) {
      showToast('Please fill in all required fields (title, description, dates, XP, category).', 'error');
      return;
    }
    if (!canEdit('gamification')) {
      showToast('You do not have permission to create challenges.', 'error');
      return;
    }
    try {
      await apiCall('/challenges', 'POST', {
        title,
        description,
        xpReward: parseInt(challengeFormData.xpReward, 10),
        pointsReward: parseInt(challengeFormData.pointsReward, 10),
        difficulty: challengeFormData.difficulty,
        startDate,
        endDate,
        category,
        evidenceRequired: challengeFormData.evidenceRequired,
        maxParticipants: parseInt(challengeFormData.maxParticipants, 10),
      });
      showToast('Challenge created!', 'success');
      setIsChallengeModalOpen(false);
      setChallengeFormData({
        title: '', description: '', xpReward: '100', pointsReward: '50',
        difficulty: 'MEDIUM', startDate: '', endDate: '',
        category: challengeCategories[0]?._id || '', evidenceRequired: true, maxParticipants: '500',
      });
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to create challenge.', 'error');
    }
  };

  const handleCreateBadge = async (e) => {
    e.preventDefault();
    if (!badgeFormData.title) { showToast('Badge title is required.', 'error'); return; }
    if (!canEdit('gamification')) { showToast('Permission denied.', 'error'); return; }
    try {
      await apiCall('/challenges/badges', 'POST', {
        title: badgeFormData.title,
        icon: badgeFormData.icon,
        xpRequired: parseInt(badgeFormData.xpRequired, 10) || 0,
        challengeCount: parseInt(badgeFormData.challengeCount, 10) || 0,
      });
      showToast('Badge created!', 'success');
      setIsBadgeModalOpen(false);
      setBadgeFormData({ title: '', icon: 'star', xpRequired: '0', challengeCount: '0' });
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to create badge.', 'error');
    }
  };

  const handleCreateReward = async (e) => {
    e.preventDefault();
    const { title, requiredPoints, stock } = rewardFormData;
    if (!title || !requiredPoints || !stock) { showToast('Fill in all reward fields.', 'error'); return; }
    if (!canEdit('gamification')) { showToast('Permission denied.', 'error'); return; }
    try {
      await apiCall('/challenges/rewards', 'POST', {
        title,
        description: rewardFormData.description,
        requiredPoints: parseInt(requiredPoints, 10),
        stock: parseInt(stock, 10),
      });
      showToast('Reward created!', 'success');
      setIsRewardModalOpen(false);
      setRewardFormData({ title: '', description: '', requiredPoints: '150', stock: '20' });
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to create reward.', 'error');
    }
  };

  const handleRedeemReward = async (rewardId, title) => {
    try {
      await apiCall('/challenges/rewards/redeem', 'POST', { rewardId });
      showToast(`Redeemed: ${title}!`, 'success');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to redeem reward.', 'error');
    }
  };

  const handleApproveParticipant = async (participantId) => {
    if (!canApprove('gamification')) { showToast('Permission denied.', 'error'); return; }
    try {
      await apiCall(`/challenges/participants/${participantId}/complete`, 'PATCH');
      showToast('Participation approved and XP awarded!', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to approve.', 'error');
    }
  };

  // ── Filters ───────────────────────────────────────────────────────────────────
  const filteredChallenges = challenges.filter((ch) =>
    filterType === 'all' ? true : (ch.status || '').toLowerCase() === filterType.toLowerCase()
  );

  const lifecycleFilters = [
    { name: 'All', type: 'all' },
    { name: 'Active', type: 'ACTIVE' },
    { name: 'Inactive', type: 'INACTIVE' },
  ];

  const managerDept = user?.role === 'Manager' ? user?.department : null;
  const filteredParticipationList = participationList.filter((item) =>
    managerDept ? item.employeeId?.department === managerDept : true
  );

  const subTabs = ['Challenges', 'Challenge Participation', 'Badges', 'Rewards', 'Leaderboard'];

  if (loading && challenges.length === 0 && badges.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1 bg-bg-base">
        <div className="flex flex-col items-center gap-3 text-text-secondary">
          <Loader className="w-8 h-8 animate-spin text-accent-gam" />
          <p className="text-sm font-semibold">Loading Gamification Data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-w-0 overflow-y-auto bg-bg-base flex-1">
      {/* SUB-NAV */}
      <div className="bg-bg-card/10 border-b border-border-sage px-6 py-4">
        <div className="flex flex-wrap gap-3 items-center">
          {subTabs.map((subSection) => {
            const isActive = subSection === activeSubTab;
            return (
              <button
                key={subSection}
                onClick={() => { setActiveSubTab(subSection); setFilterType('all'); }}
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

      <main className="p-6 space-y-10 max-w-7xl w-full mx-auto flex-1">

        {/* ─── CHALLENGES ─── */}
        {activeSubTab === 'Challenges' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Gamified ESG Challenges</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">Motivate teams to reach environmental and social milestones.</p>
              </div>
              <div>
                <button
                  onClick={() => { if (canEdit('gamification')) setIsChallengeModalOpen(true); }}
                  disabled={!canEdit('gamification')}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gam to-amber-600 text-bg-base font-extrabold text-xs rounded-lg transition-all cursor-pointer shadow-md ${!canEdit('gamification') ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:brightness-110'}`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="uppercase tracking-wider">New Challenge</span>
                </button>
                {!canEdit('gamification') && <p className="text-[10px] text-text-secondary/70 mt-1 font-bold">Requires HR / Admin access</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {lifecycleFilters.map((filter) => (
                <button
                  key={filter.name}
                  onClick={() => setFilterType(filter.type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide cursor-pointer transition-all ${filterType === filter.type ? 'bg-accent-gam text-bg-base' : 'bg-bg-card border border-border-sage text-text-secondary hover:text-text-primary'}`}
                >
                  {filter.name}
                </button>
              ))}
            </div>

            {filteredChallenges.length === 0 ? (
              <div className="text-center py-16 text-text-secondary/60 font-semibold text-sm">
                <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No challenges found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChallenges.map((challenge) => {
                  const isActive = challenge.status === 'ACTIVE';
                  const hasJoined = myParticipations.includes(challenge._id);
                  return (
                    <div key={challenge._id} className="bg-bg-card border-2 border-accent-gam/35 rounded-2xl p-5 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between min-h-[220px]">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-xl bg-accent-gam/10 border border-accent-gam/20">
                            <Trophy className="w-5 h-5 text-accent-gam" />
                          </div>
                          <h3 className="font-bold text-text-primary text-sm leading-snug font-display">{challenge.title}</h3>
                        </div>
                        <p className="text-[11px] text-text-secondary/80 font-medium line-clamp-2">{challenge.description}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-text-secondary font-semibold">
                            XP: <span className="text-accent-gam font-bold font-mono">{challenge.xpReward}</span> · {challenge.difficulty}
                          </p>
                          <p className="text-[11px] text-text-secondary/70 font-semibold flex items-center font-mono">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            {new Date(challenge.startDate).toLocaleDateString()} — {new Date(challenge.endDate).toLocaleDateString()}
                          </p>
                          {challenge.category?.name && (
                            <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-gov/10 text-accent-gov border border-accent-gov/20">
                              {challenge.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-5 pt-4 border-t border-border-sage/40 flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${isActive ? 'bg-accent-env/10 text-accent-env border border-accent-env/20' : 'bg-bg-base text-text-secondary border border-border-sage/40'}`}>
                          {challenge.status}
                        </span>
                        {isActive && (
                          <button
                            disabled={hasJoined}
                            onClick={() => handleJoinChallenge(challenge._id, challenge.title)}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${hasJoined ? 'bg-bg-base text-text-secondary border border-border-sage/40 cursor-not-allowed' : 'bg-accent-gam hover:brightness-110 text-bg-base'}`}
                          >
                            {hasJoined ? 'Joined ✓' : 'Join'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ─── PARTICIPATION ─── */}
        {activeSubTab === 'Challenge Participation' && (
          <section className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Active Participation</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">Verify employee registrations and challenge submissions.</p>
                {managerDept && <p className="text-xs text-brand font-bold mt-1">Scoped to: {managerDept}</p>}
              </div>
            </div>

            {filteredParticipationList.length === 0 ? (
              <div className="text-center py-16 text-text-secondary/60 font-semibold text-sm">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No participations yet.
              </div>
            ) : (
              <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                      <th className="py-4 px-6">Participant</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Challenge</th>
                      <th className="py-4 px-6 font-mono">Joined</th>
                      <th className="py-4 px-6 text-right">XP</th>
                      <th className="py-4 px-6">Status</th>
                      {canApprove('gamification') && <th className="py-4 px-6 text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-sage/40 text-text-primary">
                    {filteredParticipationList.map((row) => (
                      <tr key={row._id} className="hover:bg-bg-base/20 transition-colors">
                        <td className="py-4 px-6 font-bold font-display">{row.employeeId?.name || '—'}</td>
                        <td className="py-4 px-6 text-text-secondary font-semibold">{row.employeeId?.department || '—'}</td>
                        <td className="py-4 px-6 text-text-secondary font-semibold">{row.challengeId?.title || '—'}</td>
                        <td className="py-4 px-6 font-mono text-text-secondary">{row.joinedAt ? new Date(row.joinedAt).toLocaleDateString() : '—'}</td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-accent-gam">{row.challengeId?.xpReward ?? '—'}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${row.status === 'COMPLETED' ? 'bg-accent-env/10 text-accent-env border border-accent-env/20' : 'bg-accent-soc/10 text-accent-soc border border-accent-soc/20'}`}>
                            {row.status}
                          </span>
                        </td>
                        {canApprove('gamification') && (
                          <td className="py-4 px-6 text-center">
                            {row.status === 'JOINED' ? (
                              <button onClick={() => handleApproveParticipant(row._id)} className="flex items-center gap-1 px-2 py-1 text-[10px] bg-accent-env text-bg-base rounded font-bold hover:brightness-110 mx-auto">
                                <CheckCircle className="w-3 h-3" /> Approve
                              </button>
                            ) : (
                              <span className="text-[10px] text-text-secondary/60">Done ✓</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!canApprove('gamification') && <p className="text-[10px] text-text-secondary/70 font-semibold text-right">Approvals require Manager or HR access</p>}
          </section>
        )}

        {/* ─── BADGES ─── */}
        {activeSubTab === 'Badges' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">{canEdit('gamification') ? 'Badge Templates' : 'My Earned Badges'}</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">{canEdit('gamification') ? 'Configure milestone badges issued upon completing challenges.' : 'Badges you have unlocked.'}</p>
              </div>
              {canEdit('gamification') && (
                <button onClick={() => setIsBadgeModalOpen(true)} className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gam to-amber-600 text-bg-base font-extrabold text-xs rounded-lg hover:brightness-110 cursor-pointer shadow-md">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /><span className="uppercase tracking-wider">New Badge</span>
                </button>
              )}
            </div>

            {badges.length === 0 ? (
              <div className="text-center py-16 text-text-secondary/60 font-semibold text-sm">
                <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
                {canEdit('gamification') ? 'No badges defined yet.' : 'No badges earned. Complete challenges!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {badges.map((b) => {
                  const badge = b.badgeId || b;
                  return (
                    <div key={b._id} className="bg-bg-card border border-border-sage rounded-2xl p-5 hover:scale-[1.01] transition-all flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-bg-base border border-border-sage flex-shrink-0">{renderBadgeIcon(badge.icon)}</div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-text-primary text-xs font-display truncate">{badge.title}</h4>
                        <p className="text-[10px] text-text-secondary mt-0.5 font-medium">
                          {badge.xpRequired > 0 ? `${badge.xpRequired} XP` : ''}
                          {badge.xpRequired > 0 && badge.challengeCount > 0 ? ' · ' : ''}
                          {badge.challengeCount > 0 ? `${badge.challengeCount} challenges` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ─── REWARDS ─── */}
        {activeSubTab === 'Rewards' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">Redeemable Rewards</h2>
                <p className="text-xs text-text-secondary mt-1 font-medium">Sustainability merchandise redeemable with your accumulated points.</p>
              </div>
              {canEdit('gamification') && (
                <button onClick={() => setIsRewardModalOpen(true)} className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-accent-gam to-amber-600 text-bg-base font-extrabold text-xs rounded-lg hover:brightness-110 cursor-pointer shadow-md">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /><span className="uppercase tracking-wider">New Reward</span>
                </button>
              )}
            </div>

            {rewards.length === 0 ? (
              <div className="text-center py-16 text-text-secondary/60 font-semibold text-sm">
                <Gift className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No rewards available yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((item) => (
                  <div key={item._id} className="bg-bg-card border border-border-sage rounded-2xl p-5 hover:scale-[1.01] transition-all flex flex-col justify-between min-h-[160px]">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-extrabold text-accent-soc bg-accent-soc/10 border border-accent-soc/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Reward</span>
                        <div className="flex items-center text-xs font-bold text-accent-gam bg-accent-gam/10 px-2 py-0.5 rounded-full border border-accent-gam/20">
                          <Gift className="w-3.5 h-3.5 mr-1" /><span>{item.requiredPoints} pts</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-text-primary mt-3 text-sm font-display">{item.title}</h4>
                      {item.description && <p className="text-[11px] text-text-secondary/80 mt-1 font-medium line-clamp-2">{item.description}</p>}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] text-text-secondary font-bold font-mono">Stock: {item.stock} left</span>
                      <button
                        disabled={item.stock === 0}
                        onClick={() => handleRedeemReward(item._id, item.title)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${item.stock === 0 ? 'bg-bg-base text-text-secondary border border-border-sage/40 cursor-not-allowed' : 'bg-accent-gam hover:brightness-110 text-bg-base'}`}
                      >
                        {item.stock === 0 ? 'Out of Stock' : 'Redeem'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── LEADERBOARD ─── */}
        {activeSubTab === 'Leaderboard' && (
          <section className="bg-bg-card border border-border-sage rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-2 mb-6 text-[10px] font-extrabold text-text-secondary uppercase tracking-wider font-display">
              <Trophy className="w-4 h-4 text-accent-gam" />
              <span>Leaderboard Standing — XP Rankings</span>
            </div>
            {leaderboard.length === 0 ? (
              <div className="text-center py-16 text-text-secondary/60 font-semibold text-sm">
                <Crown className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No data yet. Complete challenges to rank up!
              </div>
            ) : (
              <div className="overflow-hidden border border-border-sage rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-bg-card/85 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4 text-right">XP</th>
                      <th className="py-3 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-sage/40">
                    {leaderboard.map((row, idx) => {
                      const isFirst = idx === 0;
                      const isMe = row._id === user?._id;
                      return (
                        <tr key={row._id || row.email} className={`transition-colors ${isFirst ? 'bg-accent-gam/[0.04] hover:bg-accent-gam/[0.08] font-bold' : 'hover:bg-bg-base/30'}`}>
                          <td className="py-3 px-4 font-mono">
                            <div className="flex items-center space-x-1.5">
                              {isFirst && <Crown className="w-3.5 h-3.5 text-accent-gam animate-bounce" />}
                              <span>{idx + 1}</span>
                            </div>
                          </td>
                          <td className={`py-3 px-4 font-display ${isFirst ? 'text-accent-gam font-bold' : 'text-text-primary font-semibold'}`}>
                            {row.name}
                            {isMe && <span className="ml-2 text-[9px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded-full">You</span>}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold">{(row.xp || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-mono text-text-secondary">{(row.points || 0).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {/* ─── CHALLENGE MODAL ─── */}
      <Modal isOpen={isChallengeModalOpen} onClose={() => setIsChallengeModalOpen(false)} title="Create ESG Challenge" confirmText="Publish Challenge" confirmColorClass="bg-accent-gam hover:bg-amber-600 text-bg-base font-bold" onConfirm={handleCreateChallenge}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Title *</label>
            <input type="text" value={challengeFormData.title} onChange={(e) => setChallengeFormData({ ...challengeFormData, title: e.target.value })} placeholder="e.g. Zero-Waste Printer Sprint" className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gam" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Description *</label>
            <textarea rows={2} value={challengeFormData.description} onChange={(e) => setChallengeFormData({ ...challengeFormData, description: e.target.value })} placeholder="What employees need to do…" className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gam resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Category *</label>
            <select value={challengeFormData.category} onChange={(e) => setChallengeFormData({ ...challengeFormData, category: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gam">
              <option value="">— Select Category —</option>
              {challengeCategories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">XP Reward *</label>
              <input type="number" min="0" value={challengeFormData.xpReward} onChange={(e) => setChallengeFormData({ ...challengeFormData, xpReward: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gam" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Points Reward</label>
              <input type="number" min="0" value={challengeFormData.pointsReward} onChange={(e) => setChallengeFormData({ ...challengeFormData, pointsReward: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gam" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Start Date *</label>
              <input type="date" value={challengeFormData.startDate} onChange={(e) => setChallengeFormData({ ...challengeFormData, startDate: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gam" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">End Date *</label>
              <input type="date" value={challengeFormData.endDate} onChange={(e) => setChallengeFormData({ ...challengeFormData, endDate: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gam" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Difficulty</label>
              <select value={challengeFormData.difficulty} onChange={(e) => setChallengeFormData({ ...challengeFormData, difficulty: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gam">
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Max Participants</label>
              <input type="number" min="1" value={challengeFormData.maxParticipants} onChange={(e) => setChallengeFormData({ ...challengeFormData, maxParticipants: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gam" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="evidenceReq" checked={challengeFormData.evidenceRequired} onChange={(e) => setChallengeFormData({ ...challengeFormData, evidenceRequired: e.target.checked })} className="accent-accent-gam" />
            <label htmlFor="evidenceReq" className="text-xs font-semibold text-text-secondary cursor-pointer">Evidence required (employees must upload proof)</label>
          </div>
        </div>
      </Modal>

      {/* ─── BADGE MODAL ─── */}
      <Modal isOpen={isBadgeModalOpen} onClose={() => setIsBadgeModalOpen(false)} title="New Badge Template" confirmText="Create Badge" confirmColorClass="bg-accent-gam hover:bg-amber-600 text-bg-base font-bold" onConfirm={handleCreateBadge}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Badge Title *</label>
            <input type="text" value={badgeFormData.title} onChange={(e) => setBadgeFormData({ ...badgeFormData, title: e.target.value })} placeholder="e.g. Eco Ambassador" className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gam" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Icon</label>
            <select value={badgeFormData.icon} onChange={(e) => setBadgeFormData({ ...badgeFormData, icon: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gam">
              <option value="star">⭐ Star</option>
              <option value="medal">🏅 Medal</option>
              <option value="trophy">🏆 Trophy</option>
              <option value="users">👥 Group</option>
              <option value="award">🎖️ Award</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">XP Required</label>
              <input type="number" min="0" value={badgeFormData.xpRequired} onChange={(e) => setBadgeFormData({ ...badgeFormData, xpRequired: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gam" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Challenges to Complete</label>
              <input type="number" min="0" value={badgeFormData.challengeCount} onChange={(e) => setBadgeFormData({ ...badgeFormData, challengeCount: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gam" />
            </div>
          </div>
        </div>
      </Modal>

      {/* ─── REWARD MODAL ─── */}
      <Modal isOpen={isRewardModalOpen} onClose={() => setIsRewardModalOpen(false)} title="Add Reward Product" confirmText="Publish Reward" confirmColorClass="bg-accent-gam hover:bg-amber-600 text-bg-base font-bold" onConfirm={handleCreateReward}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Product Name *</label>
            <input type="text" value={rewardFormData.title} onChange={(e) => setRewardFormData({ ...rewardFormData, title: e.target.value })} placeholder="e.g. Recycled Cotton Tote Bag" className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gam" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Description</label>
            <input type="text" value={rewardFormData.description} onChange={(e) => setRewardFormData({ ...rewardFormData, description: e.target.value })} placeholder="Brief description…" className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-gam" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Points Price *</label>
              <input type="number" min="0" value={rewardFormData.requiredPoints} onChange={(e) => setRewardFormData({ ...rewardFormData, requiredPoints: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gam" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Inventory *</label>
              <input type="number" min="0" value={rewardFormData.stock} onChange={(e) => setRewardFormData({ ...rewardFormData, stock: e.target.value })} className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-gam" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
