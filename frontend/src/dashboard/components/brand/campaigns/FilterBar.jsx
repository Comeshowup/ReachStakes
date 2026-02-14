import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';

/**
 * FilterBar — search, status filter, sort, and view mode toggle.
 * Uses CSS classes for all styling. No inline styles.
 */
const FilterBar = ({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    sortBy,
    onSortChange,
    viewMode,
    onViewChange,
}) => {
    return (
        <div className="bd-cm-filter-bar flex flex-col md:flex-row items-center gap-3 sticky top-4 z-10">
            {/* Search */}
            <div className="relative w-full md:w-[280px]">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--bd-text-muted)' }}
                />
                <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="bd-cm-input-field bd-cm-focus-ring w-full pl-10 pr-4"
                    aria-label="Search campaigns"
                />
            </div>

            {/* Filters & Toggles */}
            <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="bd-cm-input-field bd-cm-focus-ring cursor-pointer"
                    aria-label="Filter by status"
                >
                    <option value="All">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                </select>

                <div
                    className="h-5 w-px hidden md:block flex-shrink-0"
                    style={{ background: 'var(--bd-cm-border)' }}
                />

                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="bd-cm-input-field bd-cm-focus-ring cursor-pointer"
                    aria-label="Sort campaigns"
                >
                    <option value="newest">Newest</option>
                    <option value="budget">Budget</option>
                    <option value="roi">ROI</option>
                    <option value="progress">Progress</option>
                </select>

                {/* View Toggle */}
                <div className="bd-cm-toggle-pill ml-auto md:ml-0">
                    <button
                        onClick={() => onViewChange('grid')}
                        className="bd-cm-toggle-btn bd-cm-focus-ring"
                        aria-label="Grid view"
                        aria-pressed={viewMode === 'grid'}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onViewChange('table')}
                        className="bd-cm-toggle-btn bd-cm-focus-ring"
                        aria-label="Table view"
                        aria-pressed={viewMode === 'table'}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
