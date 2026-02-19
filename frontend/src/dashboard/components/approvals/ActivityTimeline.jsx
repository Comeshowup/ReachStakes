import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

/**
 * ActivityTimeline — Vertical timeline with connected line,
 * role-based alignment (brand left, creator right), and status transitions.
 */
const ActivityTimeline = ({ events = [] }) => {
    if (events.length === 0) {
        return (
            <div style={{
                textAlign: 'center', padding: 'var(--bd-space-8) var(--bd-space-4)',
                color: 'var(--bd-text-muted)', fontSize: 13
            }}>
                <Clock size={20} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div>No activity yet. This is version 1.</div>
            </div>
        );
    }

    const getRoleClass = (role) => {
        if (role === 'brand') return 'brand';
        if (role === 'creator') return 'creator';
        return 'system';
    };

    return (
        <div className="aq-timeline">
            <div className="aq-timeline__line" />

            {events.map((event, i) => (
                <motion.div
                    key={event.id || i}
                    className="aq-timeline__item"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                >
                    <div className={`aq-timeline__dot aq-timeline__dot--${getRoleClass(event.role)}`} />

                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: 4
                    }}>
                        <span style={{
                            fontSize: 12, fontWeight: 600,
                            color: 'var(--bd-text-primary)'
                        }}>
                            {event.author}
                        </span>
                        <span style={{
                            fontSize: 11, color: 'var(--bd-text-muted)'
                        }}>
                            {event.date}
                        </span>
                    </div>

                    {event.type === 'status' ? (
                        <div style={{
                            fontSize: 12, fontWeight: 500,
                            color: 'var(--bd-text-muted)',
                            fontStyle: 'italic',
                            padding: 'var(--bd-space-2) 0'
                        }}>
                            {event.text}
                        </div>
                    ) : (
                        <div className={`aq-timeline__bubble aq-timeline__bubble--${getRoleClass(event.role)}`}>
                            {event.text}
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
};

export default ActivityTimeline;
