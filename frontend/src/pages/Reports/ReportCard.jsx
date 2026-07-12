import React from 'react';
import * as Icons from 'lucide-react';

const iconMap = {
  'leaf': Icons.Leaf,
  'users': Icons.Users,
  'shield-check': Icons.ShieldCheck,
  'shield': Icons.Shield,
  'file-text': Icons.FileText,
  'activity': Icons.Activity,
  'award': Icons.Award,
  'trending-up': Icons.TrendingUp,
  'bar-chart': Icons.BarChart2,
  'check-circle': Icons.CheckCircle
};

export default function ReportCard({ report, onClick }) {
  const IconComponent = iconMap[report.icon?.toLowerCase()] || Icons.FileSpreadsheet;
  const isInactive = report.status === 'inactive';

  if (isInactive) return null;

  return (
    <div 
      onClick={onClick}
      className="group relative bg-bg-card border border-border-sage hover:border-brand/40 rounded-2xl p-6 transition-all duration-300 shadow-lg shadow-brand/5 hover:shadow-brand/10 cursor-pointer flex flex-col justify-between min-h-[160px]"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-brand/5 border border-brand/10 text-brand group-hover:bg-brand group-hover:text-bg-base transition-all duration-300">
            <IconComponent className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary border border-border-sage/40 px-2 py-0.5 rounded-full">
            {report.category || 'Standard'}
          </span>
        </div>
        <div className="space-y-1">
          <h3 className="font-display font-bold text-sm text-text-primary group-hover:text-brand transition-colors">
            {report.name}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed font-medium">
            {report.description}
          </p>
        </div>
      </div>
    </div>
  );
}
