import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Activity,
    CheckCircle2,
    Clock,
    XCircle,
    Search,
    Download,
    BookOpen,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';

/**
 * EscrowLedger — Full-width transaction ledger with tab filters,
 * search, CSV export, and proper empty state.
 * Replaces the old sidebar RecentActivityFeed.
 */

const TYPE_CONFIG = {
    Funding: {
        icon: ArrowDownToLine,
        label: 'Funding',
        className: 'ev-ledger__type--funding',
        amountClass: 'ev-ledger__amt--positive',
        sign: '+',
    },
    Release: {
        icon: ArrowUpFromLine,
        label: 'Release',
        className: 'ev-ledger__type--release',
        amountClass: 'ev-ledger__amt--negative',
        sign: '−',
    },
    Adjustment: {
        icon: Activity,
        label: 'Adjustment',
        className: 'ev-ledger__type--adjustment',
        amountClass: '',
        sign: '',
    },
};

const STATUS_ICONS = {
    Completed: { icon: CheckCircle2, className: 'ev-ledger__status--ok' },
    Pending: { icon: Clock, className: 'ev-ledger__status--pending' },
    Failed: { icon: XCircle, className: 'ev-ledger__status--fail' },
};

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'Funding', label: 'Funding' },
    { key: 'Release', label: 'Releases' },
    { key: 'Adjustment', label: 'Adjustments' },
];

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// ─── CSV Export ──────────────────────────────────
const exportToCSV = (entries) => {
    const headers = ['Date', 'Campaign', 'Type', 'Status', 'Amount'];
    const rows = entries.map(e => [
        e.date ? new Date(e.date).toISOString() : '',
        e.campaignName || '',
        e.type || '',
        e.status || '',
        e.amount || 0,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `escrow-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

// ─── Component ───────────────────────────────────
const EscrowLedger = ({ transactions, loading }) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const entries = transactions?.transactions || [];

    // Filter and search
    const filteredEntries = useMemo(() => {
        let result = entries;
        if (activeFilter !== 'all') {
            result = result.filter(e => e.type === activeFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(e =>
                (e.campaignName || '').toLowerCase().includes(q)
            );
        }
        return result;
    }, [entries, activeFilter, searchQuery]);

    const handleExport = useCallback(() => {
        exportToCSV(filteredEntries);
    }, [filteredEntries]);

    if (loading) {
        return (
            <div className="ev-section" aria-busy="true">
                <div className="ev-section__header">
                    <h2 className="ev-section__title">Escrow Ledger</h2>
                </div>
                <div className="ev-ledger__skeleton">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="ev-ledger__skel-row">
                            <div className="bd-skeleton ev-skel--circle-sm" />
                            <div className="ev-ledger__skel-body">
                                <div className="bd-skeleton ev-skel--line-md" />
                                <div className="bd-skeleton ev-skel--line-sm" />
                            </div>
                            <div className="bd-skeleton ev-skel--amt-sm" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="ev-section">
            <div className="ev-section__header">
                <h2 className="ev-section__title">Escrow Ledger</h2>
                {entries.length > 0 && (
                    <span className="ev-section__count">
                        {filteredEntries.length} transaction{filteredEntries.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Toolbar: Filters + Search + Export */}
            {entries.length > 0 && (
                <div className="ev-ledger__toolbar">
                    <div className="ev-ledger__filters" role="tablist" aria-label="Filter transactions">
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                className={`ev-ledger__filter-btn ${activeFilter === f.key ? 'ev-ledger__filter-btn--active' : ''}`}
                                onClick={() => setActiveFilter(f.key)}
                                role="tab"
                                aria-selected={activeFilter === f.key}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="ev-section__actions">
                        <div className="ev-ledger__search-wrap">
                            <Search size={13} className="ev-ledger__search-icon" />
                            <input
                                type="text"
                                placeholder="Search campaigns…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="ev-ledger__search"
                                aria-label="Search transactions"
                            />
                        </div>
                        <button className="ev-ledger__export-btn" onClick={handleExport} aria-label="Export CSV">
                            <Download size={12} />
                            Export CSV
                        </button>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {entries.length === 0 ? (
                <div className="ev-empty-state">
                    <BookOpen size={28} className="ev-empty-state__icon" />
                    <p className="ev-empty-state__text">No transactions yet</p>
                    <span className="ev-empty-state__sub">
                        Escrow activity will appear here once capital is deployed.
                    </span>
                </div>
            ) : filteredEntries.length === 0 ? (
                <div className="ev-empty-state ev-empty-state--compact">
                    <Search size={24} className="ev-empty-state__icon" />
                    <p className="ev-empty-state__text">No matching transactions</p>
                    <span className="ev-empty-state__sub">
                        Try adjusting your search or filter.
                    </span>
                </div>
            ) : (
                /* Transaction table */
                <div className="ev-table-wrap">
                    <table className="ev-ledger__table" role="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Campaign</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEntries.map((entry, index) => {
                                const typeConf = TYPE_CONFIG[entry.type] || TYPE_CONFIG.Adjustment;
                                const statusConf = STATUS_ICONS[entry.status] || STATUS_ICONS.Completed;
                                const StatusIcon = statusConf.icon;

                                return (
                                    <motion.tr
                                        key={entry.id || index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02, duration: 0.2 }}
                                    >
                                        <td>
                                            <div className="ev-ledger__date">
                                                {formatDate(entry.date)}
                                                <br />
                                                <span style={{ opacity: 0.6 }}>{formatTime(entry.date)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="ev-ledger__campaign">{entry.campaignName}</span>
                                        </td>
                                        <td>
                                            <span className={`ev-ledger__type-badge ${typeConf.className}`}>
                                                {typeConf.label}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`ev-ledger__status ${statusConf.className}`}>
                                                <StatusIcon size={12} />
                                                {entry.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`ev-ledger__amount ${typeConf.amountClass}`}>
                                                {typeConf.sign}{formatCurrency(entry.amount)}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EscrowLedger;
