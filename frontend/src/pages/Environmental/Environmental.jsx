import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Download, 
  ChevronDown, 
  Search, 
  Eye
} from 'lucide-react';

export default function Environmental() {
  const location = useLocation();
  const [activeSubTab, setActiveSubTab] = useState('Environmental Goals');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredAction, setHoveredAction] = useState(null); // format: {rowIndex, type}

  useEffect(() => {
    if (location.state?.activeSubTab) {
      setActiveSubTab(location.state.activeSubTab);
    }
  }, [location.state]);

  // Mock data for Environmental Goals
  const initialGoals = [
    {
      id: 1,
      name: "Reduce Fleet Emissions",
      department: "Logistics",
      targetCo2: "500 t",
      currentCo2: "390 t",
      progress: 78,
      deadline: "2026-12-31",
      status: "Active",
    },
    {
      id: 2,
      name: "Cut Packaging Waste",
      department: "Manufacturing",
      targetCo2: "120 t",
      currentCo2: "98 t",
      progress: 82,
      deadline: "2026-09-30",
      status: "On Track",
    },
    {
      id: 3,
      name: "Office Energy Cut",
      department: "Corporate",
      targetCo2: "80 t",
      currentCo2: "80 t",
      progress: 100,
      deadline: "2026-06-30",
      status: "Completed",
    }
  ];

  const filteredGoals = initialGoals.filter(goal => 
    goal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    goal.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subTabs = ['Emission Factors', 'Product ESG Profiles', 'Carbon Transactions', 'Environmental Goals'];

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
                    ? 'bg-[#22C55E] text-black shadow-md shadow-emerald-500/10 font-bold' 
                    : 'bg-[#11161D] border border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                }`}
              >
                {subSection}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN MODULE CONTENT */}
      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto flex-1">
        {activeSubTab === 'Environmental Goals' ? (
          <>
            {/* HEADER SECTION */}
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Environmental Goals</h2>
              <p className="text-xs text-gray-400 mt-1">Set, track, and manage departmental carbon reduction goals and progress benchmarks.</p>
            </div>

            {/* ACTION BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-[#11161D] border border-gray-800/80 rounded-2xl">
              {/* Left buttons */}
              <div className="flex flex-wrap gap-2.5">
                <button 
                  onClick={() => console.log('New Goal clicked')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#22C55E] hover:bg-[#1EAF53] text-black font-semibold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>New Goal</span>
                </button>

                <button 
                  onClick={() => console.log('Edit clicked')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800/40 text-gray-300 font-semibold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button 
                  onClick={() => console.log('Delete clicked')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-red-900/50 hover:border-red-700 hover:bg-red-950/20 text-red-400 font-semibold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button 
                  onClick={() => console.log('Export clicked')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800/40 text-gray-300 font-semibold text-xs rounded-lg transition-all duration-150 active:scale-[0.98]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>

              {/* Right search input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search goals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#0B0F14] border border-gray-800 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* DATA TABLE CONTAINER */}
            <div className="bg-[#11161D] border border-gray-800/85 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#171D26] border-b border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6 text-right">Target CO₂</th>
                      <th className="py-4 px-6 text-right">Current CO₂</th>
                      <th className="py-4 px-6 min-w-[180px]">Progress</th>
                      <th className="py-4 px-6">Deadline</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-center">Row Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs text-gray-300">
                    {filteredGoals.map((goal, index) => {
                      let statusStyle = "";
                      if (goal.status === "Active") {
                        statusStyle = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                      } else if (goal.status === "On Track") {
                        statusStyle = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                      } else if (goal.status === "Completed") {
                        statusStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                      }

                      let progressFillColor = "bg-emerald-500";
                      if (goal.progress < 80) {
                        progressFillColor = "bg-blue-500";
                      } else if (goal.progress < 90) {
                        progressFillColor = "bg-amber-500";
                      }

                      return (
                        <tr 
                          key={goal.id} 
                          className="hover:bg-gray-800/15 transition-colors duration-150 group"
                        >
                          <td className="py-4 px-6 font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {goal.name}
                          </td>
                          <td className="py-4 px-6 text-gray-400 font-medium">
                            {goal.department}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-medium">
                            {goal.targetCo2}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-medium">
                            {goal.currentCo2}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${progressFillColor} rounded-full transition-all duration-500`}
                                  style={{ width: `${goal.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-[11px] font-bold text-white min-w-[28px] text-right">
                                {goal.progress}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-400 font-mono">
                            {goal.deadline}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}>
                              {goal.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="relative">
                                <button 
                                  onMouseEnter={() => setHoveredAction({ rowIndex: index, type: 'view' })}
                                  onMouseLeave={() => setHoveredAction(null)}
                                  onClick={() => console.log(`View clicked for goal: ${goal.name}`)}
                                  className="p-1.5 rounded bg-gray-800/40 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {hoveredAction?.rowIndex === index && hoveredAction?.type === 'view' && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-black text-[10px] font-bold text-white rounded shadow-lg pointer-events-none whitespace-nowrap z-10 border border-gray-800">
                                    View Goal
                                  </div>
                                )}
                              </div>

                              <div className="relative">
                                <button 
                                  onMouseEnter={() => setHoveredAction({ rowIndex: index, type: 'edit' })}
                                  onMouseLeave={() => setHoveredAction(null)}
                                  onClick={() => console.log(`Edit clicked for goal: ${goal.name}`)}
                                  className="p-1.5 rounded bg-gray-800/40 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                {hoveredAction?.rowIndex === index && hoveredAction?.type === 'edit' && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-black text-[10px] font-bold text-white rounded shadow-lg pointer-events-none whitespace-nowrap z-10 border border-gray-800">
                                    Edit Goal
                                  </div>
                                )}
                              </div>

                              <div className="relative">
                                <button 
                                  onMouseEnter={() => setHoveredAction({ rowIndex: index, type: 'delete' })}
                                  onMouseLeave={() => setHoveredAction(null)}
                                  onClick={() => console.log(`Delete clicked for goal: ${goal.name}`)}
                                  className="p-1.5 rounded bg-gray-800/40 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                {hoveredAction?.rowIndex === index && hoveredAction?.type === 'delete' && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-black text-[10px] font-bold text-white rounded shadow-lg pointer-events-none whitespace-nowrap z-10 border border-gray-800">
                                    Delete Goal
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FOOTER NOTE */}
            <div className="flex items-center space-x-1 pl-1 text-[11px] text-gray-500 font-medium">
              <span className="flex items-center space-x-1 bg-gray-800/40 px-2 py-0.5 rounded border border-gray-800/60">
                <Eye className="w-3.5 h-3.5 text-gray-500" />
                <span>View</span>
              </span>
              <span className="flex items-center space-x-1 bg-gray-800/40 px-2 py-0.5 rounded border border-gray-800/60">
                <Pencil className="w-3.5 h-3.5 text-gray-500" />
                <span>Edit</span>
              </span>
              <span className="flex items-center space-x-1 bg-gray-800/40 px-2 py-0.5 rounded border border-gray-800/60 mr-1.5">
                <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                <span>Delete</span>
              </span>
              <span className="italic">
                • Carbon Transactions auto-generated from Purchase/Manufacturing/Fleet/Expenses
              </span>
            </div>
          </>
        ) : (
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
