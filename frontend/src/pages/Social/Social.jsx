import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  BookOpen
} from 'lucide-react';

export default function Social() {
  const location = useLocation();
  const [activeSubTab, setActiveSubTab] = useState('CSR Activities');

  useEffect(() => {
    if (location.state?.activeSubTab) {
      setActiveSubTab(location.state.activeSubTab);
    }
  }, [location.state]);

  // Activities Data
  const csrActivities = [
    {
      id: 1,
      title: "Tree Plantation",
      joined: 24,
      evidenceRequired: true,
      icon: <TreePine className="w-6 h-6 text-emerald-400" />
    },
    {
      id: 2,
      title: "Blood Donation",
      joined: 18,
      evidenceRequired: true,
      icon: <Droplet className="w-6 h-6 text-red-400" />
    },
    {
      id: 3,
      title: "Beach Cleanup",
      joined: 31,
      evidenceRequired: false,
      icon: <Waves className="w-6 h-6 text-cyan-400" />
    },
    {
      id: 4,
      title: "ESG Workshop",
      joined: 52,
      evidenceRequired: false,
      icon: <GraduationCap className="w-6 h-6 text-blue-400" />
    }
  ];

  // Approval Queue Data
  const approvalQueue = [
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
    }
  ];

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
                onClick={() => setActiveSubTab(subSection)}
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
                  onClick={() => console.log('New Activity clicked')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-black font-bold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>New Activity</span>
                </button>
              </div>
            </div>

            {/* CSR Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {csrActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="bg-[#11161D] border border-gray-800/80 rounded-2xl p-5 hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-950/5 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[190px]"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-800/40">
                        {activity.icon}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Join activity clicked: ${activity.title}`);
                      }}
                      className="w-full py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-black text-xs font-bold rounded-lg transition-colors duration-150"
                    >
                      Join
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
                      <th className="py-4 px-6">Employee</th>
                      <th className="py-4 px-6">Activity/Challenge</th>
                      <th className="py-4 px-6">Proof</th>
                      <th className="py-4 px-6 text-right">Points</th>
                      <th className="py-4 px-6">Approval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                    {approvalQueue.map((item) => {
                      let badgeStyle = "";
                      if (item.status === "Pending") {
                        badgeStyle = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
                      } else if (item.status === "Approved") {
                        badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                      }

                      return (
                        <tr 
                          key={item.id} 
                          className="hover:bg-gray-800/15 transition-colors duration-150 group"
                        >
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
                onClick={() => console.log('Bulk Reject clicked')}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs rounded-lg shadow-lg shadow-red-950/20 transition-all duration-150 active:scale-[0.98]"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
              
              <button 
                onClick={() => console.log('Bulk Approve clicked')}
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
            <span className="text-3xl mb-4">🚧</span>
            <h3 className="text-base font-semibold text-white tracking-wide">Diversity Dashboard</h3>
            <p className="text-sm text-gray-500 mt-2 font-medium">Content coming soon</p>
          </div>
        )}
      </main>
    </div>
  );
}
