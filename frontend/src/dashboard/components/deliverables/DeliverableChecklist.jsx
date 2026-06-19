import React from 'react';
import { Check, Circle } from 'lucide-react';

/**
 * DeliverableChecklist — interactive checklist for pre-submission requirements.
 * Items can be toggled completed by the creator. Required items are flagged.
 */
const DeliverableChecklist = ({ checklist = [], checklistState = [], onToggle, readOnly = false }) => {
    if (!checklist || checklist.length === 0) {
        return null;
    }

    const stateMap = {};
    (checklistState || []).forEach(s => { stateMap[s.id] = s; });

    const completedCount = checklist.filter(item => stateMap[item.id]?.completed).length;
    const totalCount = checklist.length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--bd-border-subtle)' }}>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--bd-text-secondary)' }}>
                    Checklist
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold" style={{ color: pct === 100 ? '#34d399' : 'var(--bd-text-secondary)' }}>
                        {completedCount}/{totalCount}
                    </span>
                    <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bd-surface-input)' }}>
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                                width: `${pct}%`,
                                background: pct === 100 ? '#34d399' : 'var(--bd-accent-primary)',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className="divide-y" style={{ borderColor: 'var(--bd-border-subtle)' }}>
                {checklist.map((item) => {
                    const isCompleted = stateMap[item.id]?.completed || false;
                    const isRequired = item.required !== false;

                    return (
                        <button
                            key={item.id}
                            onClick={() => !readOnly && onToggle?.(item.id, !isCompleted)}
                            disabled={readOnly}
                            className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors"
                            style={{
                                cursor: readOnly ? 'default' : 'pointer',
                                borderColor: 'var(--bd-border-subtle)',
                            }}
                            onMouseEnter={(e) => !readOnly && (e.currentTarget.style.background = 'var(--bd-surface-hover, rgba(255,255,255,0.03))')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            {/* Checkbox */}
                            <div
                                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                                style={{
                                    background: isCompleted ? '#34d399' : 'transparent',
                                    border: isCompleted ? '1px solid #34d399' : '1.5px solid var(--bd-border-default, rgba(255,255,255,0.2))',
                                }}
                            >
                                {isCompleted ? (
                                    <Check className="w-3 h-3 text-white" />
                                ) : (
                                    <Circle className="w-3 h-3 opacity-0" />
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className="text-sm flex-1"
                                style={{
                                    color: isCompleted ? 'var(--bd-text-secondary)' : 'var(--bd-text-primary)',
                                    textDecoration: isCompleted ? 'line-through' : 'none',
                                    opacity: isCompleted ? 0.7 : 1,
                                }}
                            >
                                {item.label}
                            </span>

                            {/* Required badge */}
                            {isRequired && !isCompleted && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>
                                    Required
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DeliverableChecklist;
