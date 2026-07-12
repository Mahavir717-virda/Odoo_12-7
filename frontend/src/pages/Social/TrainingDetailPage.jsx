import React, { useState } from 'react';
import { X, BookOpen, Clock, FileText, CheckSquare, Plus, Download, Upload } from 'lucide-react';
import FileUpload from '../../components/FileUpload';

export default function TrainingDetailPage({ training, onClose, user, onAssign, onComplete, onUploadMaterial }) {
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [assignInput, setAssignInput] = useState("");

  if (!training) return null;

  const isEmployee = user?.role === 'Employee';

  const mockTrainees = [
    { name: "Aditi Rao", department: "Manufacturing", progress: 100, completed: true, score: 92 },
    { name: "Karan Shah", department: "Logistics", progress: 65, completed: false, score: "—" },
    { name: "S. Nair", department: "Manufacturing", progress: 80, completed: false, score: "—" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-card border border-border-sage w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-soc to-blue-600 px-6 py-4 flex justify-between items-center text-bg-base">
          <div>
            <h3 className="text-base font-bold font-display tracking-wide">{training.name}</h3>
            <p className="text-[10px] opacity-90 font-mono uppercase tracking-wider mt-0.5">{training.category || 'ESG TRAINING'}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/15 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-bg-base/40 border-b border-border-sage/60 px-6 flex space-x-4">
          {['Overview', 'Assigned Employees & Progress', 'Materials & Documents'].map(t => {
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeSubTab === 'Overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-5">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Trainee Objectives</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    This training course aims to align employees with our corporate carbon accounting protocols, safety standards, and diversity codes of conduct. Learn how to capture Scope 1-3 inputs and audit vendor reports.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2.5 p-3.5 bg-bg-base/30 border border-border-sage/40 rounded-xl">
                    <Clock className="w-4 h-4 text-accent-soc" />
                    <div>
                      <p className="text-[9px] font-bold text-text-secondary uppercase font-mono">Duration</p>
                      <p className="text-xs font-bold text-text-primary">{training.duration || '2 hours'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 p-3.5 bg-bg-base/30 border border-border-sage/40 rounded-xl">
                    <BookOpen className="w-4 h-4 text-accent-env" />
                    <div>
                      <p className="text-[9px] font-bold text-text-secondary uppercase font-mono">Mode</p>
                      <p className="text-xs font-bold text-text-primary">{training.mode || 'Online'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 p-3.5 bg-bg-base/30 border border-border-sage/40 rounded-xl">
                    <CheckSquare className="w-4 h-4 text-accent-gam" />
                    <div>
                      <p className="text-[9px] font-bold text-text-secondary uppercase font-mono">Status</p>
                      <p className="text-xs font-bold text-text-primary">{training.status || 'Active'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-bg-base border border-border-sage rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center pb-2.5 border-b border-border-sage/40">
                  <span className="text-xs text-text-secondary font-bold">Instructor</span>
                  <span className="text-xs font-bold text-text-primary">{training.instructor || 'Internal HR'}</span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-border-sage/40">
                  <span className="text-xs text-text-secondary font-bold">Department</span>
                  <span className="text-xs font-bold text-text-primary">{training.department || 'Corporate'}</span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-border-sage/40">
                  <span className="text-xs text-text-secondary font-bold">Completion Rate</span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">{training.completionRate || '65%'}</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'Assigned Employees & Progress' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Trainee Progress Tracker</h4>
                {user?.role !== 'Employee' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Enter employee name..."
                      value={assignInput}
                      onChange={(e) => setAssignInput(e.target.value)}
                      className="bg-bg-card border border-border-sage rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (assignInput.trim()) {
                          onAssign(assignInput);
                          setAssignInput("");
                        }
                      }}
                      className="p-1.5 bg-accent-soc text-bg-base rounded-lg hover:brightness-110 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="border border-border-sage rounded-xl overflow-hidden bg-bg-base/20">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-bg-card border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase font-display">
                      <th className="p-3">Employee Name</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Progress %</th>
                      <th className="p-3">Test Score</th>
                      {user?.role !== 'Employee' && <th className="p-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-sage/40">
                    {mockTrainees.map((t, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-bold text-text-primary">{t.name}</td>
                        <td className="p-3 font-semibold text-text-secondary">{t.department}</td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-text-primary">{t.progress}%</span>
                            <div className="w-24 bg-border-sage/35 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${t.progress}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-bold font-mono text-accent-env">{t.score}</td>
                        {user?.role !== 'Employee' && (
                          <td className="p-3 text-right">
                            <button
                              disabled={t.completed}
                              onClick={() => onComplete(t.name)}
                              className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider cursor-pointer ${
                                t.completed 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-accent-soc text-bg-base hover:brightness-110'
                              }`}
                            >
                              {t.completed ? 'Completed' : 'Mark Complete'}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'Materials & Documents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Uploaded Study Materials</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-bg-base/30 border border-border-sage/40 rounded-xl">
                    <div className="flex items-center space-x-2.5">
                      <FileText className="w-5 h-5 text-accent-soc" />
                      <div>
                        <p className="text-xs font-bold text-text-primary">carbon_accounting_slide.pdf</p>
                        <p className="text-[10px] text-text-secondary font-mono">4.5 MB</p>
                      </div>
                    </div>
                    <button className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-base rounded-lg transition-colors cursor-pointer">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {user?.role !== 'Employee' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Upload New Materials</h4>
                  <FileUpload
                    label=""
                    onFileSelect={(file) => onUploadMaterial(file)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-bg-base/60 px-6 py-3.5 border-t border-border-sage/60 flex justify-end">
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
