import React, { useState } from 'react';
import { X, Calendar, MapPin, Award, Users, DollarSign, Image as ImageIcon, Award as AwardIcon, CheckCircle, FileText, Download } from 'lucide-react';
import CommentThread from '../../components/CommentThread';

export default function ActivityDetailPage({ activity, onClose, user, onRegister, onWithdraw }) {
  const [activeSubTab, setActiveSubTab] = useState('Overview');

  if (!activity) return null;

  const isEmployee = user?.role === 'Employee';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-card border border-border-sage w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-accent-soc to-blue-600 px-6 py-4 flex justify-between items-center text-bg-base">
          <div>
            <h3 className="text-base font-bold font-display tracking-wide">{activity.title}</h3>
            <p className="text-[10px] opacity-90 font-mono uppercase tracking-wider mt-0.5">{activity.category || 'CSR ACTIVITY'}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/15 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="bg-bg-base/40 border-b border-border-sage/60 px-6 flex space-x-4">
          {['Overview', 'Participants & Proof', 'Budget & Objectives', 'Gallery & Feedback', 'Discussion'].map(t => {
            const isActive = t === activeSubTab;
            return (
              <button
                key={t}
                onClick={() => setActiveSubTab(t)}
                className={`py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  isActive 
                    ? 'border-accent-soc text-accent-soc font-extrabold' 
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeSubTab === 'Overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Column */}
              <div className="md:col-span-2 space-y-5">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Description</h4>
                  <p className="text-xs text-text-secondary leading-relaxed font-medium">{activity.description || "No description provided."}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2.5 p-3.5 bg-bg-base/30 border border-border-sage/40 rounded-xl">
                    <Calendar className="w-4 h-4 text-accent-soc" />
                    <div>
                      <p className="text-[9px] font-bold text-text-secondary uppercase font-mono">Date</p>
                      <p className="text-xs font-bold text-text-primary">{activity.date || 'Flexible'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 p-3.5 bg-bg-base/30 border border-border-sage/40 rounded-xl">
                    <MapPin className="w-4 h-4 text-accent-env" />
                    <div>
                      <p className="text-[9px] font-bold text-text-secondary uppercase font-mono">Mode & Location</p>
                      <p className="text-xs font-bold text-text-primary">{activity.mode || 'In-Person'} • {activity.location || 'HQ'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-bg-base/10 border border-border-sage/30 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Key Objectives</h4>
                  <ul className="list-disc pl-4 text-xs text-text-secondary space-y-1 font-medium">
                    <li>Promote community-wide engagement in corporate ESG activities.</li>
                    <li>Support local environmental and sustainability programs.</li>
                    <li>Provide educational awareness on circular economy best practices.</li>
                  </ul>
                </div>
              </div>

              {/* Sidebar Info Card */}
              <div className="space-y-4">
                <div className="bg-bg-base border border-border-sage rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-border-sage/40">
                    <span className="text-xs text-text-secondary font-bold">Reward Score</span>
                    <span className="text-xs font-bold text-brand uppercase font-mono">{activity.pointsValue} Points</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-border-sage/40">
                    <span className="text-xs text-text-secondary font-bold">Registered Users</span>
                    <span className="text-xs font-bold text-text-primary font-mono">{activity.participantsCount || 0} Registered</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-border-sage/40">
                    <span className="text-xs text-text-secondary font-bold">Status</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                      activity.status === 'Draft' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {activity.status}
                    </span>
                  </div>

                  {isEmployee && (
                    <div className="pt-2">
                      <button
                        onClick={onRegister}
                        className="w-full py-2.5 bg-accent-soc text-bg-base text-xs font-bold rounded-lg shadow hover:brightness-110 cursor-pointer"
                      >
                        Register to Join
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'Participants & Proof' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Registered Participants</h4>
              <div className="border border-border-sage rounded-xl overflow-hidden bg-bg-base/20">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-bg-card border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase font-display">
                      <th className="p-3">Name</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Proof File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-sage/40">
                    <tr>
                      <td className="p-3 font-bold text-text-primary">Aditi Rao</td>
                      <td className="p-3 font-semibold text-text-secondary">Manufacturing</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded font-bold uppercase">Approved</span>
                      </td>
                      <td className="p-3 flex items-center space-x-1.5 text-accent-soc font-bold cursor-pointer">
                        <FileText className="w-3.5 h-3.5" />
                        <span>proof_mangrove.pdf</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-text-primary">Karan Shah</td>
                      <td className="p-3 font-semibold text-text-secondary">Logistics</td>
                      <td className="p-3">
                        <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded font-bold uppercase">Pending</span>
                      </td>
                      <td className="p-3 flex items-center space-x-1.5 text-accent-soc font-bold cursor-pointer">
                        <FileText className="w-3.5 h-3.5" />
                        <span>ewaste_dropoff.png</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'Budget & Objectives' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Budget Allocation</h4>
                <div className="p-5 bg-bg-base/30 border border-border-sage/40 rounded-xl space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-secondary uppercase font-mono">Assigned Budget</p>
                      <p className="text-lg font-bold text-text-primary">$5,400.00</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-text-secondary font-bold">
                      <span>Spent so far</span>
                      <span>$4,120.00 (76%)</span>
                    </div>
                    <div className="w-full bg-border-sage/35 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: '76%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Targets & Milestones</h4>
                <div className="p-5 bg-bg-base/30 border border-border-sage/40 rounded-xl space-y-3.5 text-xs text-text-secondary font-medium">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Complete seedling procurement and local partner alignment.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Achieve a minimum of 15 volunteer signups from R&D.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Submit final event compliance documentation.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'Gallery & Feedback' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Activity Gallery</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="aspect-video bg-bg-base border border-border-sage rounded-xl flex items-center justify-center text-text-secondary/50">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div className="aspect-video bg-bg-base border border-border-sage rounded-xl flex items-center justify-center text-text-secondary/50">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div className="aspect-video bg-bg-base border border-border-sage rounded-xl flex items-center justify-center text-text-secondary/50">
                  <ImageIcon className="w-8 h-8" />
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'Discussion' && (
            <CommentThread entityType="csr-activity" entityId={activity.id} />
          )}
        </div>

        {/* Footer */}
        <div className="bg-bg-base/60 px-6 py-3.5 border-t border-border-sage/60 flex justify-end space-x-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border-sage text-text-secondary hover:text-text-primary text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
