import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, EyeOff, Search } from 'lucide-react';

export default function DataTable({ 
  columns = [], 
  data = [], 
  groupBy = null, 
  freezeColumns = [], // list of accessor keys to freeze (sticky left)
  searchPlaceholder = "Search table...",
  showSearch = true,
  itemsPerPage = 10
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showColPicker, setShowColPicker] = useState(false);

  // Toggle column visibility
  const toggleColumn = (key) => {
    if (hiddenColumns.includes(key)) {
      setHiddenColumns(hiddenColumns.filter(c => c !== key));
    } else {
      setHiddenColumns([...hiddenColumns, key]);
    }
  };

  // Handle Sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtered & Sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Searching
    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      result = result.filter(row => {
        return Object.keys(row).some(key => {
          const val = row[key];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(lower);
        });
      });
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Parse numbers if applicable
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          valA = numA;
          valB = numB;
        } else {
          valA = valA ? String(valA).toLowerCase() : "";
          valB = valB ? String(valB).toLowerCase() : "";
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  // Grouped data if groupBy is specified
  const groupedData = useMemo(() => {
    if (!groupBy) return null;
    const groups = {};
    processedData.forEach(row => {
      const groupVal = row[groupBy] || "Other";
      if (!groups[groupVal]) {
        groups[groupVal] = [];
      }
      groups[groupVal].push(row);
    });
    return groups;
  }, [processedData, groupBy]);

  // Visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter(c => !hiddenColumns.includes(c.accessor));
  }, [columns, hiddenColumns]);

  // Pagination
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    if (groupBy) return []; // grouping usually bypasses simple flat pagination or handles it differently; we show all grouped rows.
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage, groupBy]);

  const toggleGroup = (groupVal) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupVal]: !prev[groupVal]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Top Bar for search and column toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {showSearch && (
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-secondary" />
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-bg-card border border-border-sage rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-brand"
            />
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setShowColPicker(!showColPicker)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-bg-card border border-border-sage rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Columns</span>
          </button>
          {showColPicker && (
            <div className="absolute right-0 mt-2 w-48 bg-bg-card border border-border-sage rounded-xl shadow-xl z-20 p-2 space-y-1">
              <p className="text-[10px] uppercase font-bold text-text-secondary p-1 border-b border-border-sage/40">Toggle Columns</p>
              <div className="max-h-48 overflow-y-auto pt-1">
                {columns.map(c => (
                  <label key={c.accessor} className="flex items-center space-x-2 px-2 py-1 hover:bg-bg-base/40 rounded cursor-pointer text-xs text-text-primary">
                    <input
                      type="checkbox"
                      checked={!hiddenColumns.includes(c.accessor)}
                      onChange={() => toggleColumn(c.accessor)}
                      className="rounded border-border-sage bg-bg-base text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span>{c.header}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Element */}
      <div className="bg-bg-card border border-border-sage rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-max">
            <thead>
              <tr className="bg-bg-card/80 border-b border-border-sage text-[10px] font-bold text-text-secondary uppercase tracking-wider font-display">
                {groupBy && <th className="py-4 px-6 w-8"></th>}
                {visibleColumns.map((c) => {
                  const isFrozen = freezeColumns.includes(c.accessor);
                  const isSorted = sortConfig.key === c.accessor;
                  return (
                    <th
                      key={c.accessor}
                      onClick={() => requestSort(c.accessor)}
                      className={`py-4 px-6 select-none cursor-pointer transition-colors hover:text-text-primary ${
                        isFrozen ? 'sticky left-0 bg-bg-card/95 z-10 border-r border-border-sage/60 font-bold' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{c.header}</span>
                        {isSorted && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-sage/40 text-text-primary">
              {/* Grouped Rendering */}
              {groupBy && groupedData && (
                Object.keys(groupedData).map(groupVal => {
                  const isExpanded = expandedGroups[groupVal] !== false; // expanded by default
                  const rows = groupedData[groupVal];
                  return (
                    <React.Fragment key={groupVal}>
                      <tr 
                        onClick={() => toggleGroup(groupVal)}
                        className="bg-bg-base/30 hover:bg-bg-base/50 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-6 text-center font-bold">
                          <ChevronRight className={`w-4 h-4 text-text-secondary transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </td>
                        <td colSpan={visibleColumns.length} className="py-3 px-4 font-bold font-display text-text-primary text-xs uppercase tracking-wide">
                          {groupVal} <span className="text-[10px] text-text-secondary lowercase font-normal font-sans">({rows.length} rows)</span>
                        </td>
                      </tr>
                      {isExpanded && rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-bg-base/20 transition-colors">
                          <td className="py-3 px-6 border-r border-border-sage/30"></td>
                          {visibleColumns.map(c => {
                            const isFrozen = freezeColumns.includes(c.accessor);
                            const val = row[c.accessor];
                            return (
                              <td 
                                key={c.accessor} 
                                className={`py-3 px-6 ${
                                  isFrozen ? 'sticky left-0 bg-bg-card/95 z-10 border-r border-border-sage/60 font-semibold' : ''
                                }`}
                              >
                                {c.render ? c.render(val, row) : (val ?? '—')}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}

              {/* Flat Rendering */}
              {!groupBy && paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-bg-base/20 transition-colors">
                    {visibleColumns.map(c => {
                      const isFrozen = freezeColumns.includes(c.accessor);
                      const val = row[c.accessor];
                      return (
                        <td 
                          key={c.accessor} 
                          className={`py-3 px-6 ${
                            isFrozen ? 'sticky left-0 bg-bg-card/95 z-10 border-r border-border-sage/60 font-semibold' : ''
                          }`}
                        >
                          {c.render ? c.render(val, row) : (val ?? '—')}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : !groupBy && (
                <tr>
                  <td colSpan={visibleColumns.length} className="py-8 px-6 text-center text-text-secondary font-medium">
                    No records found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        {!groupBy && totalPages > 1 && (
          <div className="bg-bg-card/40 border-t border-border-sage px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-text-secondary font-medium">
              Showing <span className="font-bold text-text-primary">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-text-primary">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-text-primary">{totalItems}</span> rows
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-border-sage bg-bg-card text-xs text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-border-sage bg-bg-card text-xs text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
