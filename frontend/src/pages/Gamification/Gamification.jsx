import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Plus, 
  Trophy, 
  Calendar, 
  Award, 
  Medal, 
  Star, 
  Crown, 
  Users
} from 'lucide-react';

export default function Gamification() {
  const location = useLocation();
  const [activeSubTab, setActiveSubTab] = useState('Challenges');

  useEffect(() => {
    if (location.state?.activeSubTab) {
      setActiveSubTab(location.state.activeSubTab);
    }
  }, [location.state]);

  const lifecycleFilters = [
    { name: 'Draft', type: 'draft', style: 'bg-gray-800/40 text-gray-400 border border-transparent' },
    { name: 'Active', type: 'active', style: 'bg-[#22C55E] text-black font-bold border border-transparent' },
    { name: 'Under Review', type: 'review', style: 'border border-purple-500/40 text-purple-400 bg-transparent' },
    { name: 'Completed', type: 'completed', style: 'border border-blue-500/40 text-blue-400 bg-transparent' },
    { name: 'Archived', type: 'archived', style: 'border border-gray-800 text-gray-600 bg-transparent cursor-not-allowed opacity-50' }
  ];

  const challenges = [
    {
      id: 1,
      title: "Sustainability Sprint",
      xp: 200,
      difficulty: "Hard",
      deadline: "07/20",
      status: "Active",
      icon: <Trophy className="w-5 h-5 text-orange-400" />,
      enabled: true
    },
    {
      id: 2,
      title: "Recycle Challenge",
      xp: 80,
      difficulty: "Easy",
      deadline: "07/15",
      status: "Active",
      icon: <Trophy className="w-5 h-5 text-emerald-400" />,
      enabled: true
    },
    {
      id: 3,
      title: "Commute Green Week",
      xp: 120,
      difficulty: "Medium",
      deadline: "07/25",
      status: "Draft",
      icon: <Trophy className="w-5 h-5 text-cyan-400" />,
      enabled: false
    }
  ];

  const badges = [
    { id: 1, name: "Green Beginner", desc: "First ESG activity complete", icon: <Star className="w-6 h-6 text-orange-400" /> },
    { id: 2, name: "Carbon Saver", desc: "Reduced 100kg CO₂", icon: <Star className="w-6 h-6 text-orange-400" /> },
    { id: 3, name: "Sustainability Champion", desc: "Completed 5 challenges", icon: <Medal className="w-6 h-6 text-orange-400" /> },
    { id: 4, name: "Team Player", desc: "Joined team cleanup", icon: <Users className="w-6 h-6 text-orange-400" /> }
  ];

  const leaderboard = [
    { rank: 1, name: "Manufacturing Dept", xp: "4,820", isFirst: true },
    { rank: 2, name: "Aditi Rao", xp: "3,910", isFirst: false },
    { rank: 3, name: "Corporate Dept", xp: "3,505", isFirst: false }
  ];

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
        {activeSubTab === 'Challenges' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Gamified ESG Challenges</h2>
                <p className="text-xs text-gray-400 mt-1 font-medium">Motivate teams and employees to reach environmental and social milestones.</p>
              </div>
              <div>
                <button 
                  onClick={() => console.log('New Challenge clicked')}
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${filter.style}`}
                  onClick={() => console.log(`Filter selected: ${filter.type}`)}
                >
                  {filter.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => {
                let badgeStyle = "";
                if (challenge.status === "Active") {
                  badgeStyle = "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20";
                } else if (challenge.status === "Draft") {
                  badgeStyle = "bg-gray-800 text-gray-400";
                }

                return (
                  <div 
                    key={challenge.id}
                    className="bg-[#11161D] border-2 border-orange-500/40 rounded-2xl p-5 hover:scale-[1.01] hover:shadow-lg hover:shadow-orange-950/5 transition-all duration-300 flex flex-col justify-between min-h-[220px]"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center space-x-3.5">
                        <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                          {challenge.icon}
                        </div>
                        <h3 className="font-bold text-white text-sm tracking-wide leading-snug">{challenge.title}</h3>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[12px] text-gray-400 font-semibold">
                          XP: <span className="text-orange-400 font-bold">{challenge.xp}</span> • {challenge.difficulty}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-gray-600 mr-1" />
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
                          onClick={() => console.log(`Join challenge clicked: ${challenge.title}`)}
                          className="w-full py-2 bg-[#F97316] hover:bg-[#EA580C] text-black text-xs font-bold rounded-lg transition-colors duration-150 active:scale-[0.98]"
                        >
                          Join Challenge
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

        {activeSubTab === 'Badges' && (
          <section className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-6">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
              <Award className="w-4.5 h-4.5 text-orange-400" />
              <span>Badge Gallery</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div 
                  key={badge.id}
                  className="border border-orange-500/20 hover:border-orange-500/40 bg-orange-500/[0.02] hover:bg-orange-500/[0.04] p-4 rounded-xl flex items-center space-x-3.5 transition-all duration-300 group cursor-pointer"
                >
                  <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg group-hover:scale-105 transition-transform duration-300">
                    {badge.icon}
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

        {activeSubTab === 'Leaderboard' && (
          <section className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-6">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
              <Trophy className="w-4.5 h-4.5 text-orange-400" />
              <span>Leaderboard</span>
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
                      key={row.rank}
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
                        {row.xp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {(activeSubTab === 'Challenge Participation' || activeSubTab === 'Rewards') && (
          <div className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <span className="text-3xl mb-4">🚧</span>
            <h3 className="text-base font-semibold text-white tracking-wide">{activeSubTab}</h3>
            <p className="text-sm text-gray-500 mt-2 font-medium">Content coming soon</p>
          </div>
        )}
      </main>
    </div>
  );
}
