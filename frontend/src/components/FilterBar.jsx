import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export default function FilterBar({
  filters = [], // array of { name: string, label: string, options: [{ value, label }], value: string }
  onChange,
  onReset,
  searchVal = "",
  onSearchChange,
  searchPlaceholder = "Search...",
}) {
  return (
    <div className="bg-bg-card border border-border-sage rounded-2xl p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3.5">
        {/* Search */}
        {onSearchChange && (
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-bg-base border border-border-sage rounded-lg px-3.5 py-2 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-soc"
            />
          </div>
        )}

        {/* Dynamic Filters */}
        {filters.map((filter) => (
          <div key={filter.name} className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider font-mono">
              {filter.label}:
            </span>
            <select
              value={filter.value || ''}
              onChange={(e) => onChange(filter.name, e.target.value)}
              className="bg-bg-base border border-border-sage rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-soc cursor-pointer"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Reset */}
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center space-x-1 px-3 py-2 bg-bg-base border border-border-sage/80 hover:bg-bg-card text-text-secondary hover:text-text-primary rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
